<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'description',
        'base_price',
        'gender',
        'product_type',
        'image_path',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'base_price' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function sizes(): HasMany
    {
        return $this->hasMany(ProductSize::class)->orderBy('sort_order');
    }

    public function reservationItems(): HasMany
    {
        return $this->hasMany(ReservationItem::class);
    }

    public function bundleItems(): HasMany
    {
        return $this->hasMany(BundleItem::class, 'bundle_product_id');
    }

    public function componentProducts(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'bundle_items', 'bundle_product_id', 'component_product_id')
            ->withPivot('quantity')
            ->withTimestamps();
    }

    public function isBundle(): bool
    {
        return !empty($this->product_type) && $this->product_type !== 'Individual Item';
    }

    /**
     * Get the available stock for a specific size of this bundle based on component stock.
     */
    public function getBundleSizeAvailableStock(string $sizeName): int
    {
        if (!$this->isBundle()) {
            return 0;
        }

        if ($this->bundleItems->isEmpty()) {
            return 0;
        }

        $minAvailable = PHP_INT_MAX;

        foreach ($this->bundleItems as $bundleItem) {
            $component = $bundleItem->componentProduct;
            if (!$component) {
                return 0;
            }

            $componentSize = $component->sizes->first(function ($s) use ($sizeName) {
                return strcasecmp($s->size, $sizeName) === 0;
            });

            if (!$componentSize) {
                if ($component->sizes->count() === 1) {
                    $componentSize = $component->sizes->first();
                } else {
                    $componentSize = $component->sizes->first(function ($s) {
                        return in_array(strtolower($s->size), ['standard', 'regular', 'onesize', 'one size', 'all']);
                    });
                }
            }

            if (!$componentSize || !$componentSize->inventory) {
                return 0;
            }

            $inv = $componentSize->inventory;
            $componentAvailable = max(0, (int) $inv->total_stock - (int) $inv->reserved_stock);
            $qtyRequired = max(1, (int) $bundleItem->quantity);

            $possibleBundles = (int) floor($componentAvailable / $qtyRequired);
            if ($possibleBundles < $minAvailable) {
                $minAvailable = $possibleBundles;
            }
        }

        return $minAvailable === PHP_INT_MAX ? 0 : $minAvailable;
    }

    /**
     * Get the total stock for a specific size of this bundle based on component stock.
     */
    public function getBundleSizeTotalStock(string $sizeName): int
    {
        if (!$this->isBundle() || $this->bundleItems->isEmpty()) {
            return 0;
        }

        $minTotal = PHP_INT_MAX;

        foreach ($this->bundleItems as $bundleItem) {
            $component = $bundleItem->componentProduct;
            if (!$component) {
                return 0;
            }

            $componentSize = $component->sizes->first(function ($s) use ($sizeName) {
                return strcasecmp($s->size, $sizeName) === 0;
            });

            if (!$componentSize) {
                if ($component->sizes->count() === 1) {
                    $componentSize = $component->sizes->first();
                } else {
                    $componentSize = $component->sizes->first(function ($s) {
                        return in_array(strtolower($s->size), ['standard', 'regular', 'onesize', 'one size', 'all']);
                    });
                }
            }

            if (!$componentSize || !$componentSize->inventory) {
                return 0;
            }

            $inv = $componentSize->inventory;
            $qtyRequired = max(1, (int) $bundleItem->quantity);

            $possibleBundles = (int) floor((int) $inv->total_stock / $qtyRequired);
            if ($possibleBundles < $minTotal) {
                $minTotal = $possibleBundles;
            }
        }

        return $minTotal === PHP_INT_MAX ? 0 : $minTotal;
    }

    /**
     * Synchronize bundle virtual stock into the size inventory records in the database.
     */
    public function syncBundleStock(): void
    {
        if (!$this->isBundle()) {
            return;
        }

        $this->loadMissing(['bundleItems.componentProduct.sizes.inventory', 'sizes.inventory']);

        foreach ($this->sizes as $size) {
            $total = $this->getBundleSizeTotalStock($size->size);
            $available = $this->getBundleSizeAvailableStock($size->size);
            $reserved = max(0, $total - $available);

            if ($size->inventory) {
                $size->inventory->update([
                    'total_stock' => $total,
                    'reserved_stock' => $reserved,
                ]);
            } else {
                Inventory::create([
                    'product_size_id' => $size->id,
                    'total_stock'     => $total,
                    'reserved_stock'  => $reserved,
                    'reorder_level'   => 5,
                ]);
            }
        }
    }

    /**
     * Refresh all bundles that contain a given component product.
     */
    public static function refreshBundlesStockForComponent(int $componentProductId): void
    {
        $bundleIds = BundleItem::where('component_product_id', $componentProductId)->pluck('bundle_product_id');
        if ($bundleIds->isEmpty()) {
            return;
        }

        $bundles = static::whereIn('id', $bundleIds)
            ->with(['bundleItems.componentProduct.sizes.inventory', 'sizes.inventory'])
            ->get();

        foreach ($bundles as $bundle) {
            $bundle->syncBundleStock();
        }
    }
}

