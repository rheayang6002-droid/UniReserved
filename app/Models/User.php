<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements PasskeyUser
{
    use HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable, HasRoles;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'student_id',
        'phone',
        'course_program',
        'year_level',
        'status',
        'avatar',
    ];

    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function isSuperAdmin(): bool
    {
        return $this->hasRole('Super Admin') || $this->role === 'super_admin';
    }

    public function isAdmin(): bool
    {
        return $this->hasRole('Super Admin') || $this->hasRole('Staff/Admin') || $this->role === 'admin' || $this->role === 'staff';
    }

    public function isStaffAdmin(): bool
    {
        return $this->hasRole('Staff/Admin') || $this->role === 'staff';
    }

    public function isCashier(): bool
    {
        return $this->hasRole('School Cashier') || $this->hasRole('Cashier') || $this->role === 'cashier';
    }

    public function isStudent(): bool
    {
        return $this->hasRole('Student') || $this->role === 'student';
    }

    /**
     * Retrieve all administrative and staff users to send operational notifications.
     */
    public static function staffAndAdmins()
    {
        return static::whereIn('role', ['admin', 'staff', 'super_admin'])
            ->orWhereHas('roles', function ($q) {
                $q->whereIn('name', ['Super Admin', 'Staff/Admin', 'admin', 'staff']);
            })
            ->get()
            ->unique('id');
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'cashier_id');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class)->latest();
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }
}
