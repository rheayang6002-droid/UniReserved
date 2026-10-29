<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\QueueEntry;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminQueueController extends Controller
{
    public function index(Request $request)
    {
        $entries = QueueEntry::with(['reservation.user', 'reservation.items.product'])
            ->whereIn('status', ['waiting', 'serving'])
            ->orderBy('queue_position')
            ->paginate(20);

        return Inertia::render('admin/queue/index', [
            'entries'       => $entries,
            'total_waiting' => QueueEntry::where('status', 'waiting')->count(),
            'serving'       => QueueEntry::where('status', 'serving')->count(),
        ]);
    }

    public function process(Request $request, QueueEntry $entry)
    {
        abort_unless($request->user()->can('manage queue'), 403, 'Unauthorized.');

        // Mark all currently serving as completed
        QueueEntry::where('status', 'serving')->update(['status' => 'completed']);

        $entry->update(['status' => 'serving']);
        $entry->reservation->update(['reservation_status' => 'preparing']);

        // Notify student that their queue ticket is now being served
        if ($entry->reservation && $entry->reservation->user_id) {
            \App\Models\Notification::create([
                'user_id' => $entry->reservation->user_id,
                'title'   => "Now Serving: Queue #{$entry->queue_position}",
                'message' => "Your turn has arrived! Reservation {$entry->reservation->reference_code} is now being served at the counter.",
                'type'    => 'queue',
                'link'    => '/queue',
            ]);
        }

        return back()->with('success', 'Now serving queue entry.');
    }

    public function skip(Request $request, QueueEntry $entry)
    {
        abort_unless($request->user()->can('manage queue'), 403, 'Unauthorized.');

        $entry->update(['status' => 'cancelled']);
        $entry->reservation->update(['reservation_status' => 'cancelled']);

        // Notify student that queue ticket was skipped
        if ($entry->reservation && $entry->reservation->user_id) {
            \App\Models\Notification::create([
                'user_id' => $entry->reservation->user_id,
                'title'   => "Queue #{$entry->queue_position} Passed",
                'message' => "Your ticket for reservation {$entry->reservation->reference_code} was passed. Please approach the desk if you are present.",
                'type'    => 'queue',
                'link'    => '/queue',
            ]);
        }

        return back()->with('success', 'Queue entry skipped.');
    }
}
