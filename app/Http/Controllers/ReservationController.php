<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\ReservationItem;
use App\Models\Product;
use App\Models\ProductSize;
use App\Models\Inventory;
use App\Models\QueueEntry;
use App\Models\Notification;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReservationController extends Controller
{
    public function index(Request $request)
    {
        $reservations = Reservation::where('user_id', $request->user()->id)
            ->with(['items.product.category', 'items.productSize', 'queueEntry', 'payments'])
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
                'queue_position'     => optional($r->queueEntry)->queue_position ?? $r->queue_number,
                'queue_status'       => optional($r->queueEntry)->status ?? 'waiting',
                'can_cancel'         => in_array($r->reservation_status, ['reserved', 'pending_payment', 'pending', 'approved']),
                'created_at'         => $r->created_at->toISOString(),
                'ready_at'           => $r->ready_at?->toISOString(),
                'claimed_at'         => $r->claimed_at?->toISOString(),
                'cancelled_at'       => $r->cancelled_at?->toISOString(),
                'notes'              => $r->notes,
                'items_count'        => $r->items->count(),
                'items'              => $r->items->map(fn($item) => [
                    'id'            => $item->id,
                    'product_name'  => $item->product?->name ?? 'Uniform Item',
                    'category'      => $item->product?->category?->name ?? 'Uniform',
                    'category_icon' => $item->product?->category?->icon ?? '👔',
                    'size'          => $item->productSize?->size ?? 'Standard',
                    'quantity'      => $item->quantity,
                    'unit_price'    => $item->unit_price,
                    'subtotal'      => $item->subtotal,
                ]),
                'payments'           => $r->payments->map(fn($p) => [
                    'id'             => $p->id,
                    'amount'         => $p->amount,
                    'payment_method' => $p->payment_method,
                    'receipt_number' => $p->receipt_number,
                    'payment_date'   => $p->payment_date?->toISOString(),
                ]),
            ]),
            'filters' => $request->only(['status']),
        ]);
    }

    public function create()
    {
        $products = Product::with(['category', 'sizes.inventory', 'bundleItems.componentProduct.sizes.inventory'])
            ->where('is_active', true)
            ->get();

        foreach ($products as $p) {
            if ($p->isBundle()) {
                $p->syncBundleStock();
            }
        }

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
                $size = ProductSize::with(['product.bundleItems.componentProduct.sizes.inventory', 'inventory'])->findOrFail($item['product_size_id']);
                $inventory = $size->inventory;
                $product = $size->product;

                if ($product && $product->isBundle()) {
                    $product->syncBundleStock();
                    $available = $product->getBundleSizeAvailableStock($size->size);
                } else {
                    $available = $inventory ? ($inventory->total_stock - $inventory->reserved_stock) : 0;
                }

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
                if ($inventory) {
                    $inventory->increment('reserved_stock', $item['quantity']);
                }

                // If this is a bundle, reserve component stock too so physical stock is not double counted
                if ($product && $product->isBundle()) {
                    foreach ($product->bundleItems as $bundleItem) {
                        $component = $bundleItem->componentProduct;
                        if (!$component) continue;

                        $compSize = $component->sizes->first(function ($s) use ($size) {
                            return strcasecmp($s->size, $size->size) === 0;
                        });
                        if (!$compSize) {
                            $compSize = $component->sizes->count() === 1 ? $component->sizes->first() : $component->sizes->first(fn($s) => in_array(strtolower($s->size), ['standard', 'regular', 'onesize', 'one size', 'all']));
                        }
                        if ($compSize && $compSize->inventory) {
                            $compSize->inventory->increment('reserved_stock', $bundleItem->quantity * $item['quantity']);
                            Product::refreshBundlesStockForComponent($component->id);
                        }
                    }
                } else {
                    Product::refreshBundlesStockForComponent($product->id);
                }
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
            Notification::create([
                'user_id' => $user->id,
                'title'   => 'Reservation Submitted',
                'message' => "Your reservation {$reservation->reference_code} has been submitted. Queue position: #{$queuePosition}",
                'type'    => 'queue',
                'link'    => "/reservations/{$reservation->id}",
            ]);

            // Notify staff and admins about new reservation
            foreach (\App\Models\User::staffAndAdmins() as $staff) {
                Notification::create([
                    'user_id' => $staff->id,
                    'title'   => 'New Reservation Received',
                    'message' => "Student {$user->name} placed reservation {$reservation->reference_code} (Queue #{$queuePosition}).",
                    'type'    => 'queue',
                    'link'    => "/admin/reservations/{$reservation->id}",
                ]);
            }
        });

        return redirect()->route('reservations.index')
            ->with('success', 'Reservation submitted successfully!');
    }

    public function show(Request $request, Reservation $reservation)
    {
        abort_unless($request->user()->can('view', $reservation), 403, 'Unauthorized access to reservation.');

        $reservation->load(['user', 'items.product.category', 'items.productSize', 'queueEntry', 'payments']);

        if ($request->wantsJson()) {
            return response()->json([
                'reservation' => $reservation,
                'can_cancel'  => $request->user()->can('cancel', $reservation),
            ]);
        }

        return Inertia::render('reservations/show', [
            'reservation' => $reservation,
            'can_cancel'  => $request->user()->can('cancel', $reservation),
        ]);
    }

    public function cancel(Request $request, Reservation $reservation)
    {
        // 1. Strict user-ownership authorization check
        abort_unless($request->user()->id === $reservation->user_id || $request->user()->hasRole('Super Admin'), 403, 'Unauthorized to cancel this reservation.');

        // 2. Policy check
        abort_unless($request->user()->can('cancel', $reservation), 403, 'Unauthorized to cancel this reservation.');

        // 3. Status eligibility check: prevent cancellation of claimed/completed/cancelled/rejected
        if (!in_array($reservation->reservation_status, ['reserved', 'pending_payment', 'pending', 'approved'])) {
            return back()->withErrors(['error' => 'This reservation cannot be cancelled in its current state.']);
        }

        DB::transaction(function () use ($reservation, $request) {
            // Release reserved inventory
            foreach ($reservation->items as $item) {
                if ($item->productSize && $item->productSize->inventory) {
                    $item->productSize->inventory->decrement('reserved_stock', $item->quantity);
                }

                if ($item->product && $item->product->isBundle()) {
                    $item->product->loadMissing('bundleItems.componentProduct.sizes.inventory');
                    foreach ($item->product->bundleItems as $bundleItem) {
                        $component = $bundleItem->componentProduct;
                        if (!$component) continue;
                        $compSize = $component->sizes->first(function ($s) use ($item) {
                            return strcasecmp($s->size, $item->productSize?->size ?? '') === 0;
                        });
                        if (!$compSize) {
                            $compSize = $component->sizes->count() === 1 ? $component->sizes->first() : $component->sizes->first(fn($s) => in_array(strtolower($s->size), ['standard', 'regular', 'onesize', 'one size', 'all']));
                        }
                        if ($compSize && $compSize->inventory) {
                            $compSize->inventory->decrement('reserved_stock', $bundleItem->quantity * $item->quantity);
                            Product::refreshBundlesStockForComponent($component->id);
                        }
                    }
                } elseif ($item->product_id) {
                    Product::refreshBundlesStockForComponent($item->product_id);
                }
            }

            $reservation->update([
                'reservation_status' => 'cancelled',
                'cancelled_at'       => now(),
            ]);

            // Release queue position and adjust subsequent waiting entries to maintain FCFS sequence
            if ($reservation->queueEntry && in_array($reservation->queueEntry->status, ['waiting', 'serving'])) {
                $cancelledPosition = $reservation->queueEntry->queue_position;
                $reservation->queueEntry->update(['status' => 'cancelled']);

                if ($cancelledPosition) {
                    QueueEntry::where('status', 'waiting')
                        ->where('queue_position', '>', $cancelledPosition)
                        ->decrement('queue_position');
                }
            }

            // Notification for student
            Notification::create([
                'user_id' => $reservation->user_id,
                'title'   => 'Reservation Cancelled',
                'message' => "Your reservation {$reservation->reference_code} has been cancelled.",
                'type'    => 'system',
                'link'    => "/reservations/{$reservation->id}",
            ]);

            // Notification for staff and admins
            $studentName = $reservation->user?->name ?? 'Student';
            foreach (\App\Models\User::staffAndAdmins() as $staff) {
                Notification::create([
                    'user_id' => $staff->id,
                    'title'   => 'Reservation Cancelled by Student',
                    'message' => "Reservation {$reservation->reference_code} was cancelled by {$studentName}.",
                    'type'    => 'system',
                    'link'    => "/admin/reservations/{$reservation->id}",
                ]);
            }

            // Audit log recording student cancellation
            AuditLog::log('cancel', 'reservations', "Student cancelled reservation {$reservation->reference_code}", $request->user()->id);
        });

        return redirect()->route('reservations.index')
            ->with('success', "Reservation {$reservation->reference_code} has been cancelled successfully.");
    }
}
