<?php

namespace App\Http\Controllers;

use App\Models\QueueEntry;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class QueueController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $myReservationIds = Reservation::where('user_id', $user->id)->pluck('id');

        $myEntry = QueueEntry::whereIn('reservation_id', $myReservationIds)
            ->whereIn('status', ['waiting', 'serving'])
            ->with('reservation')
            ->orderBy('queue_position')
            ->first();

        $queuePosition = null;
        if ($myEntry) {
            $queuePosition = QueueEntry::where('queue_position', '<', $myEntry->queue_position)
                ->where('status', 'waiting')
                ->count() + 1;
        }

        $currentlyServing = QueueEntry::where('status', 'serving')
            ->with('reservation')
            ->first();

        $totalWaiting = QueueEntry::where('status', 'waiting')->count();

        return Inertia::render('queue/index', [
            'my_entry'          => $myEntry,
            'queue_position'    => $queuePosition,
            'currently_serving' => $currentlyServing,
            'total_waiting'     => $totalWaiting,
        ]);
    }
}
