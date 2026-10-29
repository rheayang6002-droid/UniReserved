<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Notification;
use App\Models\Payment;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CashierController extends Controller
{
    /**
     * Display pending payments / payments & collections for School Cashier.
     */
    public function payments(Request $request): Response
    {
        $search = $request->input('search');

        $query = Reservation::with(['user', 'items.product', 'items.productSize'])
            ->whereIn('reservation_status', ['reserved', 'pending_payment'])
            ->where('payment_status', '!=', 'paid')
            ->latest();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('reference_code', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")
                         ->orWhere('student_id', 'like', "%{$search}%");
                  });
            });
        }

        $pendingReservations = $query->paginate(15)->withQueryString();

        return Inertia::render('cashier/payments/index', [
            'reservations' => $pendingReservations->through(fn($r) => [
                'id'                 => $r->id,
                'reference_code'     => $r->reference_code,
                'student_name'       => $r->user?->name ?? 'Student',
                'student_id'         => $r->user?->student_id ?? '—',
                'student_email'      => $r->user?->email ?? '—',
                'course_program'     => $r->user?->course_program ?? '—',
                'year_level'         => $r->user?->year_level ?? '—',
                'reservation_date'   => $r->created_at->toISOString(),
                'total_amount'       => (float) $r->total_amount,
                'reservation_status' => $r->reservation_status,
                'payment_status'     => $r->payment_status,
                'items'              => $r->items->map(fn($item) => [
                    'id'           => $item->id,
                    'product_name' => $item->product?->name ?? 'Uniform',
                    'size'         => $item->productSize?->size ?? 'Standard',
                    'quantity'     => $item->quantity,
                    'unit_price'   => (float) $item->unit_price,
                    'subtotal'     => (float) $item->subtotal,
                ]),
            ]),
            'filters' => [
                'search' => $search,
            ],
            'next_receipt_number' => Payment::generateReceiptNumber(),
            'stats' => [
                'pending_count'     => Reservation::whereIn('reservation_status', ['reserved', 'pending_payment'])->where('payment_status', '!=', 'paid')->count(),
                'today_recorded'    => Payment::whereDate('created_at', today())->count(),
                'today_collections' => (float) Payment::whereDate('created_at', today())->sum('amount'),
                'total_receipts'    => Payment::count(),
            ],
        ]);
    }

    /**
     * Record payment and issue official receipt for a reservation.
     */
    public function recordPayment(Request $request, Reservation $reservation)
    {
        $request->validate([
            'receipt_number' => 'required|string|max:50|unique:payments,receipt_number',
            'amount'         => 'required|numeric|min:0.01',
            'payment_method' => 'required|string|in:cash,gcash,bank_transfer',
            'payment_date'   => 'nullable|date',
            'notes'          => 'nullable|string|max:500',
        ]);

        if ($reservation->payment_status === 'paid') {
            return back()->withErrors(['error' => 'This reservation already has a recorded payment.']);
        }

        $payment = Payment::create([
            'reservation_id' => $reservation->id,
            'cashier_id'     => $request->user()->id,
            'receipt_number' => $request->receipt_number,
            'amount'         => $request->amount,
            'payment_method' => $request->payment_method,
            'payment_date'   => $request->payment_date ? \Carbon\Carbon::parse($request->payment_date) : now(),
            'notes'          => $request->notes,
        ]);

        // Update reservation payment_status to 'paid' (receipt recorded)
        $reservation->update([
            'payment_status' => 'paid',
        ]);

        // Notify student: return to BEO with official receipt
        Notification::create([
            'user_id' => $reservation->user_id,
            'title'   => 'Payment Recorded — Official Receipt Issued',
            'message' => "Payment of ₱" . number_format($request->amount, 2) . " has been recorded for {$reservation->reference_code}. Official Receipt: {$request->receipt_number}. Please return to the Business Enterprise Office (BEO) to present your receipt for verification and uniform release.",
            'type'    => 'payment',
            'link'    => "/reservations/{$reservation->id}",
        ]);

        // Notify staff and admins
        foreach (\App\Models\User::staffAndAdmins() as $staff) {
            Notification::create([
                'user_id' => $staff->id,
                'title'   => 'Payment Recorded by Cashier',
                'message' => "Payment of ₱" . number_format($request->amount, 2) . " (OR #{$request->receipt_number}) recorded for {$reservation->reference_code}.",
                'type'    => 'payment',
                'link'    => "/admin/reservations/{$reservation->id}",
            ]);
        }

        // Audit log
        AuditLog::create([
            'user_id'     => $request->user()->id,
            'action'      => 'record_payment',
            'module'      => 'School Cashier Desk',
            'description' => "Cashier {$request->user()->name} issued Official Receipt {$request->receipt_number} for reservation {$reservation->reference_code} (₱" . number_format($request->amount, 2) . ")",
            'ip_address'  => $request->ip(),
        ]);

        return back()->with('success', "Payment recorded successfully! Official Receipt: {$request->receipt_number}");
    }

    /**
     * Display Payment Transactions ledger with filters, search, and pagination.
     */
    public function transactions(Request $request): Response
    {
        $search = $request->input('search');
        $date = $request->input('date');
        $method = $request->input('method');

        $query = Payment::with(['reservation.user', 'cashier'])
            ->latest('payment_date');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('receipt_number', 'like', "%{$search}%")
                  ->orWhereHas('reservation', function ($rq) use ($search) {
                      $rq->where('reference_code', 'like', "%{$search}%")
                         ->orWhereHas('user', function ($uq) use ($search) {
                             $uq->where('name', 'like', "%{$search}%")
                                ->orWhere('student_id', 'like', "%{$search}%");
                         });
                  });
            });
        }

        if ($date) {
            $query->whereDate('payment_date', $date);
        }

        if ($method && in_array($method, ['cash', 'gcash', 'bank_transfer'])) {
            $query->where('payment_method', $method);
        }

        $payments = $query->paginate(15)->withQueryString();

        return Inertia::render('cashier/transactions/index', [
            'transactions' => $payments->through(fn($p) => [
                'id'             => $p->id,
                'receipt_number' => $p->receipt_number,
                'reservation_id' => $p->reservation_id,
                'reference_code' => $p->reservation?->reference_code ?? '—',
                'student_name'   => $p->reservation?->user?->name ?? 'Student',
                'student_id'     => $p->reservation?->user?->student_id ?? '—',
                'amount'         => (float) $p->amount,
                'payment_method' => $p->payment_method,
                'payment_date'   => $p->payment_date ? $p->payment_date->toISOString() : $p->created_at->toISOString(),
                'cashier_name'   => $p->cashier?->name ?? 'Cashier Desk',
                'status'         => $p->reservation?->payment_status ?? 'paid',
                'reservation_status' => $p->reservation?->reservation_status ?? '—',
                'notes'          => $p->notes,
            ]),
            'filters' => [
                'search' => $search,
                'date'   => $date,
                'method' => $method,
            ],
            'total_amount' => (float) Payment::sum('amount'),
            'today_amount' => (float) Payment::whereDate('created_at', today())->sum('amount'),
        ]);
    }

    /**
     * Display Receipt Records.
     */
    public function receipts(Request $request): Response
    {
        $search = $request->input('search');

        $query = Payment::with(['reservation.user', 'reservation.items.product', 'cashier'])
            ->latest('payment_date');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('receipt_number', 'like', "%{$search}%")
                  ->orWhereHas('reservation', function ($rq) use ($search) {
                      $rq->where('reference_code', 'like', "%{$search}%")
                         ->orWhereHas('user', function ($uq) use ($search) {
                             $uq->where('name', 'like', "%{$search}%")
                                ->orWhere('student_id', 'like', "%{$search}%");
                         });
                  });
            });
        }

        $receipts = $query->paginate(15)->withQueryString();

        return Inertia::render('cashier/receipts/index', [
            'receipts' => $receipts->through(fn($p) => [
                'id'             => $p->id,
                'receipt_number' => $p->receipt_number,
                'reservation_id' => $p->reservation_id,
                'reference_code' => $p->reservation?->reference_code ?? '—',
                'student_name'   => $p->reservation?->user?->name ?? 'Student',
                'student_id'     => $p->reservation?->user?->student_id ?? '—',
                'amount'         => (float) $p->amount,
                'payment_method' => $p->payment_method,
                'payment_date'   => $p->payment_date ? $p->payment_date->toISOString() : $p->created_at->toISOString(),
                'cashier_name'   => $p->cashier?->name ?? 'School Cashier',
                'status'         => 'PAID / RECEIPT RECORDED',
                'items_count'    => $p->reservation?->items?->count() ?? 0,
            ]),
            'filters' => [
                'search' => $search,
            ],
            'total_receipts' => Payment::count(),
        ]);
    }

    /**
     * Display Payment History timeline and audit.
     */
    public function history(Request $request): Response
    {
        $history = Payment::with(['reservation.user', 'cashier'])
            ->latest('payment_date')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('cashier/history/index', [
            'history' => $history->through(fn($p) => [
                'id'             => $p->id,
                'receipt_number' => $p->receipt_number,
                'reservation_id' => $p->reservation_id,
                'reference_code' => $p->reservation?->reference_code ?? '—',
                'student_name'   => $p->reservation?->user?->name ?? 'Student',
                'student_id'     => $p->reservation?->user?->student_id ?? '—',
                'amount'         => (float) $p->amount,
                'payment_method' => $p->payment_method,
                'payment_date'   => $p->payment_date ? $p->payment_date->toISOString() : $p->created_at->toISOString(),
                'status'         => 'PAID / RECEIPT RECORDED',
                'cashier_name'   => $p->cashier?->name ?? 'School Cashier',
            ]),
        ]);
    }
}
