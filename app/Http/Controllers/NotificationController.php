<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = Notification::where('user_id', $request->user()->id)
            ->latest()
            ->paginate(20);

        Notification::where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return Inertia::render('notifications/index', [
            'notifications' => $notifications,
        ]);
    }

    public function markRead(Request $request, int $id)
    {
        Notification::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->update(['is_read' => true]);

        return back();
    }

    public function markAllRead(Request $request)
    {
        Notification::where('user_id', $request->user()->id)
            ->update(['is_read' => true]);

        return back();
    }
}
