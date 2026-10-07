<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference_code',
        'user_id',
        'total_amount',
        'payment_status',
        'reservation_status',
        'queue_number',
        'qr_code_token',
        'ready_at',
        'claimed_at',
        'cancelled_at',
        'notes',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'ready_at' => 'datetime',
        'claimed_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(ReservationItem::class);
    }

    public function queueEntry(): HasOne
    {
        return $this->hasOne(QueueEntry::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function claimingRecord(): HasOne
    {
        return $this->hasOne(ClaimingRecord::class);
    }

    public static function generateReferenceCode(): string
    {
        $year = date('Y');
        $lastReservation = self::whereYear('created_at', $year)->latest('id')->first();
        $nextNumber = $lastReservation ? ((int) substr($lastReservation->reference_code, -4)) + 1 : 1;
        return sprintf('UR-%s-%04d', $year, $nextNumber);
    }

    public static function getNextQueueNumber(): int
    {
        $activeCount = self::whereNotIn('reservation_status', ['claimed', 'cancelled'])->count();
        return $activeCount + 1;
    }
}
