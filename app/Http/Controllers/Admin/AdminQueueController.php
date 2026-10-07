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

    public function process(QueueEntry $entry)
    {
        // Mark all currently serving as completed
        QueueEntry::where('status', 'serving')->update(['status' => 'completed']);

        $entry->update(['status' => 'serving']);
        $entry->reservation->update(['reservation_status' => 'preparing']);

        return back()->with('success', 'Now serving queue entry.');
    }

    public function skip(QueueEntry $entry)
    {
        $entry->update(['status' => 'cancelled']);
        $entry->reservation->update(['reservation_status' => 'cancelled']);

        return back()->with('success', 'Queue entry skipped.');
    }
}
