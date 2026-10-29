<?php

namespace App\Policies;

use App\Models\Reservation;
use App\Models\User;

class ReservationPolicy
{
    /**
     * Determine whether the user can view any reservations.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['Super Admin', 'Staff/Admin']);
    }

    /**
     * Determine whether the user can view the reservation.
     */
    public function view(User $user, Reservation $reservation): bool
    {
        if ($user->hasAnyRole(['Super Admin', 'Staff/Admin'])) {
            return true;
        }

        return $user->id === $reservation->user_id;
    }

    /**
     * Determine whether the user can cancel the reservation.
     */
    public function cancel(User $user, Reservation $reservation): bool
    {
        if ($user->hasRole('Super Admin')) {
            return true;
        }

        return $user->id === $reservation->user_id
            && in_array($reservation->reservation_status, ['reserved', 'pending_payment', 'pending', 'approved']);
    }

    /**
     * Determine whether the user can update the reservation status.
     */
    public function update(User $user, Reservation $reservation): bool
    {
        return $user->hasAnyRole(['Super Admin', 'Staff/Admin']);
    }

    /**
     * Determine whether the user can delete the reservation.
     */
    public function delete(User $user, Reservation $reservation): bool
    {
        return $user->hasRole('Super Admin');
    }
}
