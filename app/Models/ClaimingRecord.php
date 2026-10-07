<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClaimingRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'reservation_id',
        'staff_id',
        'claimed_at',
        'student_signature_notes',
        'remarks',
    ];

    protected $casts = [
        'claimed_at' => 'datetime',
    ];

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }

    public function staff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'staff_id');
    }
}
