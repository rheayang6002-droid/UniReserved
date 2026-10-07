<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $myReservationIds = Reservation::where('user_id', $request->user()->id)->pluck('id');

        $payments = Payment::whereIn('reservation_id', $myReservationIds)
            ->with('reservation')
            ->latest('payment_date')
            ->paginate(10);

        return Inertia::render('payments/index', [
            'payments' => $payments,
        ]);
    }

    public function show(Request $request, Payment $payment)
    {
        $myReservationIds = Reservation::where('user_id', $request->user()->id)->pluck('id');
        if (!$myReservationIds->contains($payment->reservation_id)) {
            abort(403);
        }

        $payment->load('reservation.items.product');

        return Inertia::render('payments/show', [
            'payment' => $payment,
        ]);
    }
}
