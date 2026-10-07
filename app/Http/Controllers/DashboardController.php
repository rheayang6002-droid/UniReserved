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

        if ($role === 'admin' || $role === 'staff') {
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
                ->where('reservation_status', 'reserved')
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
        ]);
    }

    private function adminDashboard($user): Response
    {
        $adminStats = [
            'total_students' => \App\Models\User::where('role', 'student')->count(),
            'pending_count'  => Reservation::where('reservation_status', 'reserved')->count(),
            'today_claims'   => Reservation::where('reservation_status', 'claimed')
                ->whereDate('updated_at', today())
                ->count(),
            'low_stock_count' => \App\Models\Inventory::where('total_stock', '<=', 5)->count(),
            'total_revenue'   => \App\Models\Payment::sum('amount'),
            'queue_length'    => \App\Models\QueueEntry::where('status', 'waiting')->count(),
        ];

        $reservations = Reservation::with(['user', 'items'])
            ->latest()
            ->take(5)
            ->get();

        $notifications = Notification::where('user_id', $user->id)
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('dashboard', [
            'admin_stats' => $adminStats,
            'recent_reservations' => $reservations->map(fn($r) => [
                'id'             => $r->id,
                'reference_code' => $r->reference_code,
                'status'         => $r->reservation_status,
                'created_at'     => $r->created_at->toISOString(),
                'items_count'    => $r->items->count(),
                'total_amount'   => $r->total_amount,
                'student_name'   => optional($r->user)->name ?? '—',
            ]),
            'recent_notifications' => $notifications->map(fn($n) => [
                'id'         => $n->id,
                'title'      => $n->title,
                'message'    => $n->message,
                'created_at' => $n->created_at->toISOString(),
                'is_read'    => $n->is_read,
            ]),
            'role' => $user->role,
        ]);
    }
}
