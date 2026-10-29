<?php

namespace App\Services;

use App\Models\Product;
use App\Models\QueueEntry;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIReservationService
{
    /**
     * Answer student inquiry with privacy and factual guardrails.
     *
     * @param User $student
     * @param string $message
     * @param array $conversationHistory
     * @return string
     */
    public function ask(User $student, string $message, array $conversationHistory = []): string
    {
        // 1. Check for obvious privacy violation attempt
        $cleanQuestion = strtolower(trim($message));
        if ($this->isAskingAboutAnotherStudent($cleanQuestion, $student)) {
            return "For student privacy and security reasons, I can only provide information regarding your own reservations and queue status. I cannot view or disclose information about any other student.";
        }

        // 2. Fetch authenticated student context
        $context = $this->buildStudentContext($student);

        // 3. If AI API key is configured, invoke AI provider with strict system prompt
        $apiKey = config('services.ai.key');
        if (!empty($apiKey)) {
            try {
                $aiResponse = $this->callGeminiApi($apiKey, $student, $message, $context, $conversationHistory);
                if (!empty($aiResponse)) {
                    return $aiResponse;
                }
            } catch (\Throwable $e) {
                // Log technical error securely without revealing keys
                Log::error('AI Reservation Assistant provider error: ' . $e->getMessage(), [
                    'student_id' => $student->id,
                ]);
                // Graceful fallback without crashing
                return "Sorry, the AI assistant is temporarily unavailable. Please use the reservation page or try again later.";
            }
        }

        // 4. Deterministic factual assistant engine (used when API key is pending or as zero-hallucination fallback)
        return $this->generateFactualResponse($cleanQuestion, $student, $context);
    }

    /**
     * Detect attempts to query another student's details.
     */
    protected function isAskingAboutAnotherStudent(string $question, User $currentStudent): bool
    {
        $suspiciousTerms = [
            "another student",
            "other student",
            "juan",
            "maria",
            "alex",
            "someone else",
            "other person",
            "anyone else's",
            "other user",
            "his reservation",
            "her reservation",
            "their reservation",
            "classmate",
            "friend's reservation",
        ];

        foreach ($suspiciousTerms as $term) {
            if (str_contains($question, $term)) {
                return true;
            }
        }

        // Check if question mentions any other student name in the DB
        $otherNames = User::where('id', '!=', $currentStudent->id)
            ->where('role', 'student')
            ->pluck('name');

        foreach ($otherNames as $name) {
            $firstName = strtolower(explode(' ', trim($name))[0]);
            if (strlen($firstName) > 2 && str_contains($question, $firstName)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Gather authorized facts from the database for the authenticated student.
     */
    protected function buildStudentContext(User $student): array
    {
        $myReservations = Reservation::where('user_id', $student->id)
            ->with(['items.product', 'items.productSize', 'queueEntry'])
            ->latest()
            ->take(5)
            ->get();

        $activeReservation = $myReservations->first(function ($r) {
            return !in_array($r->reservation_status, ['cancelled', 'claimed']);
        }) ?? $myReservations->first();

        $myReservationIds = Reservation::where('user_id', $student->id)->pluck('id');
        $activeQueueEntry = QueueEntry::whereIn('reservation_id', $myReservationIds)
            ->whereIn('status', ['waiting', 'serving'])
            ->orderBy('queue_position')
            ->first();

        $currentQueueNumber = null;
        $peopleAhead = 0;
        if ($activeQueueEntry) {
            $peopleAhead = QueueEntry::where('queue_position', '<', $activeQueueEntry->queue_position)
                ->where('status', 'waiting')
                ->count();
            $currentQueueNumber = $activeQueueEntry->queue_position;
        }

        $currentlyServing = QueueEntry::where('status', 'serving')->first();

        $products = Product::where('is_active', true)
            ->with(['sizes.inventory'])
            ->get()
            ->map(fn($p) => [
                'name' => $p->name,
                'price' => $p->base_price,
                'sizes' => $p->sizes->map(fn($s) => [
                    'size' => $s->size,
                    'stock' => $s->inventory ? ($s->inventory->total_stock - $s->inventory->reserved_stock) : 0,
                ]),
            ]);

        return [
            'student_name'          => $student->name,
            'student_id'            => $student->student_id,
            'has_reservations'      => $myReservations->isNotEmpty(),
            'total_reservations'    => $myReservations->count(),
            'latest_reservation'    => $activeReservation ? [
                'reference_code'     => $activeReservation->reference_code,
                'reservation_status' => $activeReservation->reservation_status,
                'payment_status'     => $activeReservation->payment_status,
                'total_amount'       => $activeReservation->total_amount,
                'created_at'         => $activeReservation->created_at->format('M d, Y h:i A'),
                'items'              => $activeReservation->items->map(fn($i) => [
                    'product'  => $i->product?->name,
                    'size'     => $i->productSize?->size,
                    'quantity' => $i->quantity,
                ]),
            ] : null,
            'active_queue'          => $activeQueueEntry ? [
                'position'       => $currentQueueNumber,
                'people_ahead'   => $peopleAhead,
                'status'         => $activeQueueEntry->status,
                'now_serving'    => $currentlyServing ? $currentlyServing->queue_position : 'None',
            ] : null,
            'catalog'               => $products,
        ];
    }

    /**
     * Call Gemini API endpoint with strict privacy and factuality system prompt.
     */
    protected function callGeminiApi(string $apiKey, User $student, string $message, array $context, array $history): string
    {
        $systemInstruction = <<<INSTRUCTION
You are the UNiReserve AI Reservation Assistant, an intelligent support assistant for the UNiReserve school uniform reservation and queueing system.
You are assisting the student: {$student->name} (Student ID: {$student->student_id}).

CRITICAL PRIVACY & SECURITY RULES:
1. You may ONLY answer regarding the authenticated student's own data.
2. If asked about another student, classmate, or anyone else, refuse politely and state that you can only provide information for the authenticated student.
3. NEVER invent or hallucinate reservation IDs, queue numbers, dates, statuses, or uniform availability. All factual answers must come from the provided DATABASE CONTEXT.
4. If the database context does not contain the requested data, state clearly: "I could not find that information in your record. Please verify in your My Reservations page."
5. You are INFORMATIONAL ONLY. You cannot directly cancel, approve, modify reservations or alter queue positions. Guide the student to use the web application interface.

DATABASE CONTEXT FOR {$student->name}:
INSTRUCTION;

        $contextJson = json_encode($context, JSON_PRETTY_PRINT);
        $fullSystemPrompt = $systemInstruction . "\n" . $contextJson;

        $contents = [];
        $contents[] = [
            'role' => 'user',
            'parts' => [['text' => "SYSTEM INSTRUCTIONS & AUTHENTICATED CONTEXT:\n" . $fullSystemPrompt]],
        ];
        $contents[] = [
            'role' => 'model',
            'parts' => [['text' => "Understood. I will strictly serve {$student->name} using only the provided facts, maintaining privacy, no hallucination, and providing helpful uniform reservation guidance."]],
        ];

        // Append recent conversation turns (up to 4 turns)
        foreach (array_slice($history, -4) as $turn) {
            $contents[] = [
                'role'  => ($turn['sender'] ?? 'student') === 'ai' ? 'model' : 'user',
                'parts' => [['text' => $turn['text'] ?? '']],
            ];
        }

        $contents[] = [
            'role'  => 'user',
            'parts' => [['text' => $message]],
        ];

        $model = config('services.ai.model', 'gemini-1.5-flash');
        $endpoint = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";

        $response = Http::timeout(10)->post($endpoint, [
            'contents' => $contents,
            'generationConfig' => [
                'temperature' => 0.2,
                'maxOutputTokens' => 600,
            ],
        ]);

        if ($response->successful()) {
            $data = $response->json();
            $reply = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;
            if (!empty($reply)) {
                return trim($reply);
            }
        }

        throw new \Exception("AI provider response failed: " . $response->body());
    }

    /**
     * Deterministic, zero-hallucination factual engine answering student queries from verified DB data.
     */
    protected function generateFactualResponse(string $q, User $student, array $context): string
    {
        $hasReservations = $context['has_reservations'];
        $res = $context['latest_reservation'];
        $queue = $context['active_queue'];

        // 1. Reservation status inquiries
        if (str_contains($q, 'status') || str_contains($q, 'approved') || str_contains($q, 'pending') || str_contains($q, 'my reservation')) {
            if (!$hasReservations || !$res) {
                return "You do not currently have any active uniform reservations on record. You can browse the catalog and place an order under 'Browse Items'.";
            }

            $readableStatus = match ($res['reservation_status']) {
                'reserved'           => 'Reserved (Awaiting payment or queue processing)',
                'pending_payment'    => 'Pending Payment at the Cashier',
                'paid'               => 'Paid & Approved (Being prepared)',
                'preparing'          => 'Preparing items in the Supply Office',
                'ready_for_claiming' => 'Ready for Claiming at the Supply & Asset Management Office',
                'claimed'            => 'Claimed and Completed',
                'cancelled'          => 'Cancelled',
                default              => ucfirst($res['reservation_status']),
            };

            $itemsSummary = collect($res['items'])->map(fn($i) => "{$i['product']} ({$i['size']}) x{$i['quantity']}")->join(', ');

            return "Your latest reservation ({$res['reference_code']}) made on {$res['created_at']} is currently: **{$readableStatus}**.\n\nItems: {$itemsSummary}.\nTotal: ₱" . number_format($res['total_amount'], 2) . ". Payment status: " . ucfirst($res['payment_status']) . ".";
        }

        // 2. Queue position inquiries
        if (str_contains($q, 'queue') || str_contains($q, 'position') || str_contains($q, 'number') || str_contains($q, 'serving')) {
            if (!$queue) {
                if ($res && $res['reservation_status'] === 'claimed') {
                    return "You do not have an active queue ticket because your reservation has already been claimed.";
                }
                return "You currently do not have an active queue ticket. A queue ticket is automatically generated when you submit a uniform reservation.";
            }

            $aheadMsg = $queue['people_ahead'] > 0
                ? "There are {$queue['people_ahead']} student(s) ahead of you in line."
                : "You are next in line or currently being called!";

            return "Your current queue position is **#{$queue['position']}**.\n\nStatus: " . ucfirst($queue['status']) . ".\nCurrently Serving: Ticket #" . $queue['now_serving'] . ".\n{$aheadMsg}";
        }

        // 3. How to reserve
        if (str_contains($q, 'how do i reserve') || str_contains($q, 'how to reserve') || str_contains($q, 'process') || str_contains($q, 'make a reservation')) {
            return "To reserve a school uniform in UNiReserve:\n1. Click **Browse Items** in the sidebar to view available uniforms and sizes.\n2. Choose your uniform items and size, then click **Add to Reservation**.\n3. Review your reservation and submit it.\n4. You will automatically receive a **Reference Code** (e.g. UR-2026-XXXX) and a **Queue Number**.\n5. Proceed to the Cashier for payment or await notification when your uniform is ready for pickup.";
        }

        // 4. Cancellation rules
        if (str_contains($q, 'cancel') || str_contains($q, 'cancellation')) {
            if ($res && in_array($res['reservation_status'], ['reserved', 'pending_payment'])) {
                return "Yes, you can cancel your pending reservation ({$res['reference_code']}). Go to **My Reservations**, open reservation **{$res['reference_code']}**, and click the red **Cancel Reservation** button. Reserved stock will immediately be released.";
            }
            return "Reservations can only be cancelled while they are in 'Reserved' or 'Pending Payment' status. Once paid, prepared, or claimed, reservations cannot be cancelled online. Please visit the Supply Office for assistance.";
        }

        // 5. Pickup / Claiming uniform
        if (str_contains($q, 'claim') || str_contains($q, 'pick up') || str_contains($q, 'pickup') || str_contains($q, 'where to get')) {
            if ($res && $res['reservation_status'] === 'ready_for_claiming') {
                return "Good news! Your reservation ({$res['reference_code']}) is **Ready for Claiming**. Please present your student ID and Reference Code at the **Supply & Asset Management Office** to pick up your uniform.";
            }
            return "Once your uniform reservation status changes to **Ready for Claiming**, you may claim your uniform at the **Supply & Asset Management Office** during school operating hours. Please bring your valid Student ID and Reference Code.";
        }

        // 6. Uniform availability inquiries
        if (str_contains($q, 'available') || str_contains($q, 'stock') || str_contains($q, 'size')) {
            $catalogItems = collect($context['catalog'])->take(4)->map(function ($item) {
                $sizesStock = collect($item['sizes'])->map(fn($s) => "{$s['size']}: {$s['stock']} left")->join(', ');
                return "• **{$item['name']}** (₱{$item['price']}) — Sizes: {$sizesStock}";
            })->join("\n");

            return "Here is the current uniform availability in stock:\n\n{$catalogItems}\n\nYou can view all items and size variations by visiting the **Browse Items** catalog page.";
        }

        // 7. Where to check reservation
        if (str_contains($q, 'where can i check') || str_contains($q, 'where to check') || str_contains($q, 'find my reservation')) {
            return "You can check all your active and past uniform reservations anytime by clicking on **My Reservations** in the sidebar or going directly to the `/reservations` page.";
        }

        // 8. Rejection / what to do if rejected
        if (str_contains($q, 'reject') || str_contains($q, 'rejected') || str_contains($q, 'declined')) {
            return "If your reservation is marked as rejected, it may be due to insufficient stock or invalid payment verification. Please check the notification message on your dashboard or visit the Supply & Asset Management Office to re-select another size or item.";
        }

        // Default helpful response
        return "Hello {$student->name}! I am your UNiReserve AI Reservation Assistant. I can help answer questions about:\n\n• Your uniform reservation status & details\n• Your current queue number and position\n• How the reservation and pickup process works\n• Uniform sizing and inventory availability\n• Cancellation and payment guidelines\n\nHow may I help you today?";
    }
}
