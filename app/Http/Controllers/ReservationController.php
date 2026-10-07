<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\ReservationItem;
use App\Models\Product;
use App\Models\ProductSize;
use App\Models\Inventory;
use App\Models\QueueEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReservationController extends Controller
{
    public function index(Request $request)
    {
        $reservations = Reservation::where('user_id', $request->user()->id)
            ->with('items.product')
            ->when($request->status, fn($q) => $q->where('reservation_status', $request->status))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('reservations/index', [
            'reservations' => $reservations->through(fn($r) => [
                'id'                 => $r->id,
                'reference_code'     => $r->reference_code,
                'reservation_status' => $r->reservation_status,
                'payment_status'     => $r->payment_status,
                'total_amount'       => $r->total_amount,
                'queue_number'       => $r->queue_number,
                'created_at'         => $r->created_at->toISOString(),
                'items_count'        => $r->items->count(),
            ]),
            'filters' => $request->only(['status']),
        ]);
    }

    public function create()
    {
        $products = Product::with(['category', 'sizes.inventory'])
            ->where('is_active', true)
            ->get();

        return Inertia::render('reservations/create', [
            'products' => $products,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'items'                    => 'required|array|min:1',
            'items.*.product_size_id'  => 'required|exists:product_sizes,id',
            'items.*.quantity'         => 'required|integer|min:1|max:5',
        ]);

        DB::transaction(function () use ($request) {
            $user = $request->user();
            $totalAmount = 0;
            $itemsData = [];

            foreach ($request->items as $item) {
                $size = ProductSize::with(['product', 'inventory'])->findOrFail($item['product_size_id']);
                $inventory = $size->inventory;

                $available = $inventory ? ($inventory->total_stock - $inventory->reserved_stock) : 0;
                if ($available < $item['quantity']) {
                    abort(422, "Insufficient stock for {$size->product->name} - {$size->size}");
                }

                $unitPrice = $size->product->base_price + $size->price_adjustment;
                $subtotal = $unitPrice * $item['quantity'];
                $totalAmount += $subtotal;

                $itemsData[] = [
                    'product_id'      => $size->product_id,
                    'product_size_id' => $size->id,
                    'quantity'        => $item['quantity'],
                    'unit_price'      => $unitPrice,
                    'subtotal'        => $subtotal,
                ];

                // Reserve the stock
                $inventory->increment('reserved_stock', $item['quantity']);
            }

            $reservation = Reservation::create([
                'reference_code'     => Reservation::generateReferenceCode(),
                'user_id'            => $user->id,
                'total_amount'       => $totalAmount,
                'reservation_status' => 'reserved',
                'payment_status'     => 'pending',
                'queue_number'       => Reservation::getNextQueueNumber(),
            ]);

            $reservation->items()->createMany($itemsData);

            // Add to queue
            $queuePosition = QueueEntry::where('status', 'waiting')->count() + 1;
            QueueEntry::create([
                'reservation_id' => $reservation->id,
                'queue_position' => $queuePosition,
                'status'         => 'waiting',
            ]);

            // Notify student
            \App\Models\Notification::create([
                'user_id' => $user->id,
                'title'   => 'Reservation Submitted',
                'message' => "Your reservation {$reservation->reference_code} has been submitted. Queue position: #{$queuePosition}",
                'type'    => 'system',
                'link'    => "/reservations/{$reservation->id}",
            ]);
        });

        return redirect()->route('reservations.index')
            ->with('success', 'Reservation submitted successfully!');
    }

    public function show(Request $request, Reservation $reservation)
    {
        if ($reservation->user_id !== $request->user()->id) {
            abort(403);
        }

        $reservation->load(['items.product', 'items.productSize', 'queueEntry', 'payments']);

        return Inertia::render('reservations/show', [
            'reservation' => $reservation,
        ]);
    }

    public function cancel(Request $request, Reservation $reservation)
    {
        if ($reservation->user_id !== $request->user()->id) {
            abort(403);
        }

        if (!in_array($reservation->reservation_status, ['reserved', 'pending_payment'])) {
            return back()->withErrors(['error' => 'This reservation cannot be cancelled.']);
        }

        DB::transaction(function () use ($reservation) {
            // Release inventory
            foreach ($reservation->items as $item) {
                if ($item->productSize && $item->productSize->inventory) {
                    $item->productSize->inventory->decrement('reserved_stock', $item->quantity);
                }
            }

            $reservation->update([
                'reservation_status' => 'cancelled',
                'cancelled_at'       => now(),
            ]);

            $reservation->queueEntry?->update(['status' => 'cancelled']);
        });

        return redirect()->route('reservations.index')
            ->with('success', 'Reservation cancelled.');
    }
}
