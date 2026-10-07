<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Inventory extends Model
{
    use HasFactory;

    protected $table = 'inventory';

    protected $fillable = [
        'product_size_id',
        'total_stock',
        'reserved_stock',
        'reorder_level',
    ];

    protected $appends = [
        'available_stock',
        'status',
    ];

    public function productSize(): BelongsTo
    {
        return $this->belongsTo(ProductSize::class);
    }

    public function getAvailableStockAttribute(): int
    {
        return max(0, $this->total_stock - $this->reserved_stock);
    }

    public function getStatusAttribute(): string
    {
        $available = $this->available_stock;

        if ($available <= 0) {
            return 'Out of Stock';
        }

        if ($available <= $this->reorder_level) {
            return 'Low Stock';
        }

        return 'Available';
    }
}
