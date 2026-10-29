<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminPaymentController extends Controller
{
    public function index(Request $request)
    {
        $payments = Payment::with(['reservation.user'])
            ->latest('payment_date')
            ->paginate(15);

        return Inertia::render('admin/payments/index', [
            'payments' => $payments,
        ]);
    }

    public function verify(Payment $payment)
    {
        $payment->reservation->update(['payment_status' => 'paid', 'reservation_status' => 'paid']);

        \App\Models\Notification::create([
            'user_id' => $payment->reservation->user_id,
            'title'   => 'Payment Verified',
            'message' => "Your payment for reservation {$payment->reservation->reference_code} has been verified.",
            'type'    => 'payment',
            'link'    => "/reservations/{$payment->reservation_id}",
        ]);

        return back()->with('success', 'Payment verified.');
    }

    public function reject(Payment $payment)
    {
        \App\Models\Notification::create([
            'user_id' => $payment->reservation->user_id,
            'title'   => 'Payment Rejected',
            'message' => "Your payment for reservation {$payment->reservation->reference_code} was rejected. Please resubmit.",
            'type'    => 'payment',
            'link'    => "/reservations/{$payment->reservation_id}",
        ]);

        return back()->with('success', 'Payment rejected.');
    }
}
