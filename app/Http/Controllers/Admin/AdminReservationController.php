<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Notification;
use App\Models\QueueEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminReservationController extends Controller
{
    public function index(Request $request)
    {
        $query = Reservation::with(['user', 'items.product', 'queueEntry'])
            ->latest();

        if ($request->filled('status')) {
            $query->where('reservation_status', $request->status);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('reference_code', 'like', '%' . $request->search . '%')
                  ->orWhereHas('user', fn($uq) => $uq->where('name', 'like', '%' . $request->search . '%'));
            });
        }

        $reservations = $query->paginate(15)->withQueryString();

        return Inertia::render('admin/reservations/index', [
            'reservations' => $reservations->through(fn($r) => [
                'id'                 => $r->id,
                'reference_code'     => $r->reference_code,
                'reservation_status' => $r->reservation_status,
                'payment_status'     => $r->payment_status,
                'total_amount'       => $r->total_amount,
                'queue_number'       => $r->queue_number,
                'created_at'         => $r->created_at->toISOString(),
                'items_count'        => $r->items->count(),
                'student_name'       => optional($r->user)->name,
                'student_email'      => optional($r->user)->email,
                'queue_position'     => optional($r->queueEntry)->queue_position,
            ]),
            'filters' => $request->only(['status', 'search']),
            'stats' => [
                'pending'  => Reservation::where('reservation_status', 'reserved')->count(),
                'approved' => Reservation::whereIn('reservation_status', ['paid', 'preparing'])->count(),
                'ready'    => Reservation::where('reservation_status', 'ready_for_claiming')->count(),
                'claimed'  => Reservation::where('reservation_status', 'claimed')->count(),
            ],
        ]);
    }

    public function show(Reservation $reservation)
    {
        $reservation->load(['user', 'items.product', 'items.productSize', 'queueEntry', 'payments']);

        return Inertia::render('admin/reservations/show', [
            'reservation' => $reservation,
        ]);
    }

    public function approve(Request $request, Reservation $reservation)
    {
        if ($reservation->reservation_status !== 'reserved') {
            return back()->withErrors(['error' => 'Reservation cannot be approved in its current state.']);
        }

        $reservation->update(['reservation_status' => 'pending_payment']);

        Notification::create([
            'user_id' => $reservation->user_id,
            'title'   => 'Reservation Approved',
            'message' => "Your reservation {$reservation->reference_code} has been approved. Please proceed to payment.",
            'type'    => 'system',
            'link'    => "/reservations/{$reservation->id}",
        ]);

        return back()->with('success', 'Reservation approved.');
    }

    public function reject(Request $request, Reservation $reservation)
    {
        $request->validate(['reason' => 'nullable|string|max:500']);

        DB::transaction(function () use ($request, $reservation) {
            // Release inventory
            foreach ($reservation->items as $item) {
                $item->productSize?->inventory?->decrement('reserved_stock', $item->quantity);
            }

            $reservation->update([
                'reservation_status' => 'cancelled',
                'cancelled_at'       => now(),
                'notes'              => $request->reason,
            ]);

            $reservation->queueEntry?->update(['status' => 'cancelled']);

            Notification::create([
                'user_id' => $reservation->user_id,
                'title'   => 'Reservation Rejected',
                'message' => "Your reservation {$reservation->reference_code} was rejected. " . ($request->reason ?? ''),
                'type'    => 'system',
                'link'    => "/reservations/{$reservation->id}",
            ]);
        });

        return back()->with('success', 'Reservation rejected.');
    }

    public function markReady(Reservation $reservation)
    {
        $reservation->update([
            'reservation_status' => 'ready_for_claiming',
            'ready_at'           => now(),
        ]);

        Notification::create([
            'user_id' => $reservation->user_id,
            'title'   => 'Items Ready for Claiming',
            'message' => "Your reservation {$reservation->reference_code} is ready! Please come to the office to claim your items.",
            'type'    => 'claiming',
            'link'    => "/reservations/{$reservation->id}",
        ]);

        return back()->with('success', 'Marked as ready for claiming.');
    }

    public function markClaimed(Reservation $reservation)
    {
        DB::transaction(function () use ($reservation) {
            // Deduct from actual stock
            foreach ($reservation->items as $item) {
                $inv = $item->productSize?->inventory;
                if ($inv) {
                    $inv->decrement('total_stock', $item->quantity);
                    $inv->decrement('reserved_stock', $item->quantity);
                }
            }

            $reservation->update([
                'reservation_status' => 'claimed',
                'claimed_at'         => now(),
            ]);

            $reservation->queueEntry?->update(['status' => 'completed']);

            \App\Models\ClaimingRecord::create([
                'reservation_id' => $reservation->id,
                'staff_id'       => auth()->id(),
                'claimed_at'     => now(),
            ]);

            Notification::create([
                'user_id' => $reservation->user_id,
                'title'   => 'Items Claimed Successfully',
                'message' => "You have successfully claimed your items for reservation {$reservation->reference_code}.",
                'type'    => 'claiming',
                'link'    => "/reservations/{$reservation->id}",
            ]);
        });

        return back()->with('success', 'Reservation marked as claimed.');
    }
}
