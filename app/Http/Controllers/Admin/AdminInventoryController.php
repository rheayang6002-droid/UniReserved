<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductSize;
use App\Models\Category;
use App\Models\Inventory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminInventoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'sizes.inventory'])->latest();

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->filter === 'low') {
            $query->whereHas('sizes.inventory', fn($q) => $q->where('total_stock', '<=', 5));
        }

        $products = $query->paginate(15)->withQueryString();
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
        return Inertia::render('admin/inventory/create', ['categories' => $categories]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'category_id'  => 'required|exists:categories,id',
            'name'         => 'required|string|max:255',
            'description'  => 'nullable|string',
            'base_price'   => 'required|numeric|min:0',
            'gender'       => 'required|in:unisex,male,female',
            'sizes'        => 'required|array|min:1',
            'sizes.*.size' => 'required|string|max:50',
            'sizes.*.price_adjustment' => 'required|numeric',
            'sizes.*.stock' => 'required|integer|min:0',
        ]);

        $product = Product::create([
            'category_id'  => $request->category_id,
            'name'         => $request->name,
            'slug'         => \Str::slug($request->name) . '-' . uniqid(),
            'description'  => $request->description,
            'base_price'   => $request->base_price,
            'gender'       => $request->gender,
            'is_active'    => true,
        ]);

        foreach ($request->sizes as $i => $sizeData) {
            $size = $product->sizes()->create([
                'size'             => $sizeData['size'],
                'price_adjustment' => $sizeData['price_adjustment'],
                'sort_order'       => $i,
            ]);

            Inventory::create([
                'product_size_id' => $size->id,
                'total_stock'     => $sizeData['stock'],
                'reserved_stock'  => 0,
                'reorder_level'   => 5,
            ]);
        }

        return redirect()->route('admin.inventory.index')
            ->with('success', 'Product created successfully.');
    }

    public function edit(Product $product)
    {
        $product->load(['category', 'sizes.inventory']);
        $categories = Category::orderBy('sort_order')->get();

        return Inertia::render('admin/inventory/edit', [
            'product'    => $product,
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'base_price'  => 'required|numeric|min:0',
            'gender'      => 'required|in:unisex,male,female',
            'is_active'   => 'boolean',
        ]);

        $product->update($request->only(['name', 'description', 'base_price', 'gender', 'is_active']));

        return redirect()->route('admin.inventory.index')
            ->with('success', 'Product updated.');
    }

    public function destroy(Product $product)
    {
        $product->update(['is_active' => false]);
        return back()->with('success', 'Product deactivated.');
    }

    public function adjustStock(Request $request, ProductSize $productSize)
    {
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

        return back()->with('success', 'Stock adjusted successfully.');
    }
}
