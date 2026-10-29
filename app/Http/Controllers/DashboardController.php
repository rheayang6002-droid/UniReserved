<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $role = $user->role;

        if ($user->hasRole('School Cashier') || $user->hasRole('Cashier') || $role === 'cashier' || $user->email === 'cashier@dssc.edu.ph') {
            return $this->cashierDashboard($user);
        }

        if ($user->hasRole('Super Admin') || $user->hasRole('Staff/Admin') || in_array($role, ['admin', 'staff'])) {
            return $this->adminDashboard($user);
        }

        return $this->studentDashboard($user);
    }

    private function studentDashboard($user): Response
    {
        // reservations table uses `reservation_status` not `status`
        $reservations = Reservation::where('user_id', $user->id)
            ->with('items')
            ->latest()
            ->take(5)
            ->get();

        $stats = [
            'total_reservations'    => Reservation::where('user_id', $user->id)->count(),
            'pending_reservations'  => Reservation::where('user_id', $user->id)
                ->whereIn('reservation_status', ['reserved', 'pending_payment', 'pending'])
                ->count(),
            'approved_reservations' => Reservation::where('user_id', $user->id)
                ->whereIn('reservation_status', ['paid', 'preparing', 'ready_for_claiming'])
                ->count(),
            'queue_position'        => null,
            'unread_notifications'  => Notification::where('user_id', $user->id)
                ->where('is_read', false)
                ->count(),
            'total_spent'           => 0,
        ];

        // Get queue position via reservation → queue_entries
        $myReservationIds = Reservation::where('user_id', $user->id)->pluck('id');
        $queueEntry = \App\Models\QueueEntry::whereIn('reservation_id', $myReservationIds)
            ->whereIn('status', ['waiting', 'serving'])
            ->orderBy('queue_position')
            ->first();

        if ($queueEntry) {
            $stats['queue_position'] = \App\Models\QueueEntry::where('queue_position', '<', $queueEntry->queue_position)
                ->where('status', 'waiting')
                ->count() + 1;
        }

        $notifications = Notification::where('user_id', $user->id)
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recent_reservations' => $reservations->map(fn($r) => [
                'id'             => $r->id,
                'reference_code' => $r->reference_code,
                'status'         => $r->reservation_status,
                'created_at'     => $r->created_at->toISOString(),
                'items_count'    => $r->items->count(),
                'total_amount'   => $r->total_amount,
            ]),
            'recent_notifications' => $notifications->map(fn($n) => [
                'id'         => $n->id,
                'title'      => $n->title,
                'message'    => $n->message,
                'created_at' => $n->created_at->toISOString(),
                'is_read'    => $n->is_read,
            ]),
            'role' => 'student',
            'is_student' => true,
        ]);
    }

    private function adminDashboard($user): Response
    {
        $isSuperAdmin = $user->hasRole('Super Admin') || $user->role === 'super_admin';
        $isCashier = $user->hasRole('Cashier') || $user->role === 'cashier' || $user->email === 'cashier@dssc.edu.ph';

        $adminStats = [
            'total_users'        => \App\Models\User::count(),
            'total_students'     => \App\Models\User::where('role', 'student')->count(),
            'total_staff'        => \App\Models\User::whereIn('role', ['staff', 'cashier'])->count(),
            'total_super_admins' => \App\Models\User::role('Super Admin')->count(),
            'pending_count'      => Reservation::where('reservation_status', 'reserved')->count(),
            'approved_count'     => Reservation::whereIn('reservation_status', ['paid', 'preparing', 'ready_for_claiming'])->count(),
            'today_claims'       => Reservation::where('reservation_status', 'claimed')
                ->whereDate('updated_at', today())
                ->count(),
            'low_stock_count'    => \App\Models\Inventory::where('total_stock', '<=', 5)->count(),
            'total_revenue'      => (float) \App\Models\Payment::sum('amount'),
            'queue_length'       => \App\Models\QueueEntry::where('status', 'waiting')->count(),
            // Cashier specific metrics
            'today_transactions' => \App\Models\Payment::whereDate('created_at', today())->count(),
            'today_revenue'      => (float) \App\Models\Payment::whereDate('created_at', today())->sum('amount'),
            'pending_payments'   => Reservation::where('reservation_status', 'reserved')->count(),
            'verified_today'     => \App\Models\Payment::whereDate('created_at', today())->count(),
        ];

        $reservations = Reservation::with(['user', 'items'])
            ->latest()
            ->take(6)
            ->get();

        $recentPayments = \App\Models\Payment::with(['reservation.user'])
            ->latest('payment_date')
            ->take(6)
            ->get()
            ->map(fn($p) => [
                'id'             => $p->id,
                'receipt_number' => $p->receipt_number,
                'reference_code' => $p->reservation?->reference_code ?? '—',
                'student_name'   => $p->reservation?->user?->name ?? 'Student',
                'amount'         => (float) $p->amount,
                'payment_method' => $p->payment_method,
                'created_at'     => $p->created_at?->toISOString() ?? now()->toISOString(),
            ]);

        $notifications = Notification::where('user_id', $user->id)
            ->latest()
            ->take(5)
            ->get();

        $recentActivity = \App\Models\AuditLog::with('user')
            ->latest()
            ->take(6)
            ->get()
            ->map(fn($log) => [
                'id'          => $log->id,
                'action'      => $log->action,
                'module'      => $log->module,
                'description' => $log->description,
                'user_name'   => $log->user?->name ?? 'System',
                'created_at'  => $log->created_at?->toISOString() ?? now()->toISOString(),
            ]);

        $resolvedRole = $isSuperAdmin ? 'super_admin' : ($isCashier ? 'cashier' : ($user->role ?: 'staff'));

        return Inertia::render('dashboard', [
            'admin_stats'         => $adminStats,
            'is_super_admin'      => $isSuperAdmin,
            'is_cashier'          => $isCashier,
            'recent_activity'     => $recentActivity,
            'recent_reservations' => $reservations->map(fn($r) => [
                'id'             => $r->id,
                'reference_code' => $r->reference_code,
                'status'         => $r->reservation_status,
                'created_at'     => $r->created_at->toISOString(),
                'items_count'    => $r->items->count(),
                'total_amount'   => $r->total_amount,
                'student_name'   => optional($r->user)->name ?? '—',
            ]),
            'recent_payments'      => $recentPayments,
            'recent_notifications' => $notifications->map(fn($n) => [
                'id'         => $n->id,
                'title'      => $n->title,
                'message'    => $n->message,
                'created_at' => $n->created_at->toISOString(),
                'is_read'    => $n->is_read,
            ]),
            'role' => $resolvedRole,
        ]);
    }

    private function cashierDashboard($user): Response
    {
        $today = today();

        $cashierStats = [
            'pending_payments'        => Reservation::whereIn('reservation_status', ['reserved', 'pending_payment'])->where('payment_status', '!=', 'paid')->count(),
            'payments_today'          => \App\Models\Payment::whereDate('created_at', $today)->count(),
            'total_collections_today' => (float) \App\Models\Payment::whereDate('created_at', $today)->sum('amount'),
            'receipts_issued'         => \App\Models\Payment::count(),
            'total_revenue'           => (float) \App\Models\Payment::sum('amount'),
        ];

        $pendingPayments = Reservation::with(['user', 'items.product', 'items.productSize'])
            ->whereIn('reservation_status', ['reserved', 'pending_payment'])
            ->where('payment_status', '!=', 'paid')
            ->latest()
            ->take(10)
            ->get()
            ->map(fn($r) => [
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
            ]);

        $recentPayments = \App\Models\Payment::with(['reservation.user'])
            ->latest('payment_date')
            ->take(8)
            ->get()
            ->map(fn($p) => [
                'id'             => $p->id,
                'receipt_number' => $p->receipt_number,
                'reference_code' => $p->reservation?->reference_code ?? '—',
                'student_name'   => $p->reservation?->user?->name ?? 'Student',
                'student_id'     => $p->reservation?->user?->student_id ?? '—',
                'amount'         => (float) $p->amount,
                'payment_method' => $p->payment_method,
                'created_at'     => $p->created_at?->toISOString() ?? now()->toISOString(),
            ]);

        $notifications = Notification::where('user_id', $user->id)
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('dashboard', [
            'cashier_stats'        => $cashierStats,
            'pending_payments'     => $pendingPayments,
            'recent_payments'      => $recentPayments,
            'next_receipt_number'  => \App\Models\Payment::generateReceiptNumber(),
            'recent_notifications' => $notifications->map(fn($n) => [
                'id'         => $n->id,
                'title'      => $n->title,
                'message'    => $n->message,
                'created_at' => $n->created_at->toISOString(),
                'is_read'    => $n->is_read,
            ]),
            'role'       => 'cashier',
            'is_cashier' => true,
        ]);
    }
}
