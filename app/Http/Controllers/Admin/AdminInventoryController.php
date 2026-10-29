<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductSize;
use App\Models\Category;
use App\Models\Inventory;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\File;
use Inertia\Inertia;

class AdminInventoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'sizes.inventory', 'bundleItems.componentProduct'])->latest();

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->filter === 'low') {
            $query->whereHas('sizes.inventory', fn($q) => $q->where('total_stock', '<=', 5));
        }

        $products = $query->paginate(15)->withQueryString();

        // Ensure bundle stocks are synchronized
        foreach ($products as $prod) {
            if ($prod->isBundle()) {
                $prod->syncBundleStock();
            }
        }

        $categories = Category::orderBy('sort_order')->get();

        return Inertia::render('admin/inventory/index', [
            'products'   => $products,
            'categories' => $categories,
            'filters'    => $request->only(['search', 'filter']),
        ]);
    }

    public function create()
    {
        $categories = Category::orderBy('sort_order')->get();
        $existingProducts = Product::where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('product_type')
                  ->orWhere('product_type', 'Individual Item');
            })
            ->with(['sizes.inventory', 'category'])
            ->orderBy('name')
            ->get(['id', 'name', 'category_id', 'base_price', 'gender', 'product_type', 'image_path']);

        return Inertia::render('admin/inventory/create', [
            'categories'       => $categories,
            'existingProducts' => $existingProducts,
        ]);
    }

    public function store(Request $request)
    {
        abort_unless($request->user()->can('manage inventory') || $request->user()->can('manage uniforms'), 403, 'Unauthorized.');

        $request->validate([
            'category_id'                          => 'required|exists:categories,id',
            'name'                                 => 'required|string|max:255',
            'description'                          => 'nullable|string',
            'base_price'                           => 'required|numeric|min:0',
            'gender'                               => 'required|in:unisex,male,female',
            'product_type'                         => 'required|string|in:Individual Item,Uniform Set,PE Set,Uniform Set + ID Lace,PE Set + ID Lace,Uniform Set + PE Set,Uniform Set + PE Set + ID Lace,Custom Bundle',
            'image'                                => ['nullable', File::image()->types(['jpeg','png','jpg','webp','gif'])->max(5 * 1024)],
            'sizes'                                => 'required|array|min:1',
            'sizes.*.size'                         => 'required|string|max:50',
            'sizes.*.price_adjustment'             => 'required|numeric',
            'sizes.*.stock'                        => 'nullable|integer|min:0',
            'bundle_components'                    => 'nullable|array',
            'bundle_components.*.component_product_id' => 'required_with:bundle_components|exists:products,id',
            'bundle_components.*.quantity'             => 'required_with:bundle_components|integer|min:1|max:10',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('products', 'public');
        }

        $product = Product::create([
            'category_id'  => $request->category_id,
            'name'         => $request->name,
            'slug'         => \Str::slug($request->name) . '-' . uniqid(),
            'description'  => $request->description,
            'base_price'   => $request->base_price,
            'gender'       => $request->gender,
            'product_type' => $request->product_type,
            'image_path'   => $imagePath,
            'is_active'    => true,
        ]);

        // If this is a bundle, save the bundle components
        if ($product->isBundle() && is_array($request->bundle_components)) {
            foreach ($request->bundle_components as $comp) {
                if (!empty($comp['component_product_id'])) {
                    $product->bundleItems()->create([
                        'component_product_id' => $comp['component_product_id'],
                        'quantity'             => $comp['quantity'] ?? 1,
                    ]);
                }
            }
            $product->load(['bundleItems.componentProduct.sizes.inventory']);
        }

        foreach ($request->sizes as $i => $sizeData) {
            $size = $product->sizes()->create([
                'size'             => $sizeData['size'],
                'price_adjustment' => $sizeData['price_adjustment'],
                'sort_order'       => $i,
            ]);

            if ($product->isBundle()) {
                $totalStock = $product->getBundleSizeTotalStock($sizeData['size']);
                $availableStock = $product->getBundleSizeAvailableStock($sizeData['size']);
                $reservedStock = max(0, $totalStock - $availableStock);

                Inventory::create([
                    'product_size_id' => $size->id,
                    'total_stock'     => $totalStock,
                    'reserved_stock'  => $reservedStock,
                    'reorder_level'   => 5,
                ]);
            } else {
                Inventory::create([
                    'product_size_id' => $size->id,
                    'total_stock'     => $sizeData['stock'] ?? 0,
                    'reserved_stock'  => 0,
                    'reorder_level'   => 5,
                ]);
            }
        }

        return redirect()->route('admin.inventory.index')
            ->with('success', 'Product created successfully.');
    }

    public function edit(Product $product)
    {
        $product->load(['category', 'sizes.inventory', 'bundleItems.componentProduct']);
        if ($product->isBundle()) {
            $product->syncBundleStock();
        }

        $categories = Category::orderBy('sort_order')->get();
        $existingProducts = Product::where('id', '!=', $product->id)
            ->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('product_type')
                  ->orWhere('product_type', 'Individual Item');
            })
            ->with(['sizes.inventory', 'category'])
            ->orderBy('name')
            ->get(['id', 'name', 'category_id', 'base_price', 'gender', 'product_type', 'image_path']);

        return Inertia::render('admin/inventory/edit', [
            'product'          => $product,
            'categories'       => $categories,
            'existingProducts' => $existingProducts,
        ]);
    }

    public function update(Request $request, Product $product)
    {
        abort_unless($request->user()->can('manage inventory') || $request->user()->can('manage uniforms'), 403, 'Unauthorized.');

        $request->validate([
            'name'                                 => 'required|string|max:255',
            'description'                          => 'nullable|string',
            'base_price'                           => 'required|numeric|min:0',
            'gender'                               => 'required|in:unisex,male,female',
            'product_type'                         => 'nullable|string|in:Individual Item,Uniform Set,PE Set,Uniform Set + ID Lace,PE Set + ID Lace,Uniform Set + PE Set,Uniform Set + PE Set + ID Lace,Custom Bundle',
            'image'                                => ['nullable', File::image()->types(['jpeg','png','jpg','webp','gif'])->max(5 * 1024)],
            'remove_image'                         => 'nullable|boolean',
            'is_active'                            => 'boolean',
            'bundle_components'                    => 'nullable|array',
            'bundle_components.*.component_product_id' => 'required_with:bundle_components|exists:products,id',
            'bundle_components.*.quantity'             => 'required_with:bundle_components|integer|min:1|max:10',
        ]);

        if ($request->hasFile('image')) {
            if ($product->image_path) {
                Storage::disk('public')->delete($product->image_path);
            }
            $product->image_path = $request->file('image')->store('products', 'public');
        } elseif ($request->boolean('remove_image')) {
            if ($product->image_path) {
                Storage::disk('public')->delete($product->image_path);
            }
            $product->image_path = null;
        }

        $product->name = $request->name;
        $product->description = $request->description;
        $product->base_price = $request->base_price;
        $product->gender = $request->gender;
        if ($request->filled('product_type')) {
            $product->product_type = $request->product_type;
        }
        $product->is_active = $request->boolean('is_active', true);
        $product->save();

        if ($product->isBundle() && $request->has('bundle_components')) {
            $product->bundleItems()->delete();
            if (is_array($request->bundle_components)) {
                foreach ($request->bundle_components as $comp) {
                    if (!empty($comp['component_product_id'])) {
                        $product->bundleItems()->create([
                            'component_product_id' => $comp['component_product_id'],
                            'quantity'             => $comp['quantity'] ?? 1,
                        ]);
                    }
                }
            }
            $product->syncBundleStock();
        }

        return redirect()->route('admin.inventory.index')
            ->with('success', 'Product updated.');
    }

    public function destroy(Request $request, Product $product)
    {
        abort_unless($request->user()->can('manage inventory') || $request->user()->can('manage uniforms'), 403, 'Unauthorized.');

        $product->update(['is_active' => false]);
        return back()->with('success', 'Product deactivated.');
    }

    public function adjustStock(Request $request, ProductSize $productSize)
    {
        abort_unless($request->user()->can('manage inventory'), 403, 'Unauthorized.');

        $request->validate([
            'adjustment' => 'required|integer',
            'reason'     => 'nullable|string|max:255',
        ]);

        $inventory = $productSize->inventory;
        if (!$inventory) {
            $inventory = Inventory::create([
                'product_size_id' => $productSize->id,
                'total_stock'     => 0,
                'reserved_stock'  => 0,
                'reorder_level'   => 5,
            ]);
        }

        $newStock = $inventory->total_stock + $request->adjustment;
        if ($newStock < 0) {
            return back()->withErrors(['error' => 'Stock cannot go below zero.']);
        }

        $inventory->update(['total_stock' => $newStock]);

        // Low stock alert for staff/admins
        if ($newStock <= $inventory->reorder_level) {
            $productSize->loadMissing('product');
            $prodName = $productSize->product?->name ?? 'Product';
            foreach (User::staffAndAdmins() as $staff) {
                Notification::create([
                    'user_id' => $staff->id,
                    'title'   => 'Low Stock Alert',
                    'message' => "Stock for {$prodName} ({$productSize->size}) is down to {$newStock} (Reorder level: {$inventory->reorder_level}).",
                    'type'    => 'system',
                    'link'    => '/admin/inventory',
                ]);
            }
        }

        // Refresh any bundles containing this product
        Product::refreshBundlesStockForComponent($productSize->product_id);

        return back()->with('success', 'Stock adjusted successfully.');
    }
}

