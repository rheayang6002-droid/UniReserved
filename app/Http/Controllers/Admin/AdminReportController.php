<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminReportController extends Controller
{
    public function index(Request $request)
    {
        $period = $request->period ?? 'month';

        $startDate = match ($period) {
            'week'  => now()->startOfWeek(),
            'month' => now()->startOfMonth(),
            'year'  => now()->startOfYear(),
            default => now()->startOfMonth(),
        };

        $stats = [
            'total_reservations'  => Reservation::where('created_at', '>=', $startDate)->count(),
            'total_claimed'       => Reservation::where('reservation_status', 'claimed')
                ->where('updated_at', '>=', $startDate)->count(),
            'total_revenue'       => Payment::where('payment_date', '>=', $startDate)->sum('amount'),
            'new_students'        => User::where('role', 'student')
                ->where('created_at', '>=', $startDate)->count(),
            'cancelled'           => Reservation::where('reservation_status', 'cancelled')
                ->where('updated_at', '>=', $startDate)->count(),
        ];

        return Inertia::render('admin/reports/index', [
            'stats'  => $stats,
            'period' => $period,
        ]);
    }

    public function export(Request $request)
    {
        // Simple CSV export
        $reservations = Reservation::with(['user', 'items.product'])
            ->whereDate('created_at', '>=', $request->from ?? now()->startOfMonth())
            ->whereDate('created_at', '<=', $request->to ?? now())
            ->get();

        $csv = "Reference Code,Student Name,Email,Total Amount,Status,Date\n";
        foreach ($reservations as $r) {
            $csv .= implode(',', [
                $r->reference_code,
                '"' . ($r->user->name ?? '') . '"',
                $r->user->email ?? '',
                $r->total_amount,
                $r->reservation_status,
                $r->created_at->format('Y-m-d'),
            ]) . "\n";
        }

        return response($csv, 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="reservations-' . now()->format('Y-m-d') . '.csv"',
        ]);
    }
}
