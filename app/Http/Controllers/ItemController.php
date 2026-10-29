<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ItemController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'sizes.inventory', 'bundleItems.componentProduct.sizes.inventory'])
            ->where('is_active', true);

        if ($request->filled('category')) {
            $query->whereHas('category', fn($q) => $q->where('slug', $request->category));
        }

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $products = $query->paginate(12)->withQueryString();

        foreach ($products as $product) {
            if ($product->isBundle()) {
                $product->syncBundleStock();
            }
        }

        $categories = Category::orderBy('sort_order')->get();

        return Inertia::render('items/index', [
            'products'   => $products,
            'categories' => $categories,
            'filters'    => $request->only(['category', 'search']),
        ]);
    }

    public function show(Product $product)
    {
        $product->load([
            'category',
            'sizes.inventory',
            'bundleItems.componentProduct.sizes.inventory',
            'bundleItems.componentProduct.category',
        ]);

        if ($product->isBundle()) {
            $product->syncBundleStock();
        }

        return Inertia::render('items/show', [
            'product' => $product,
        ]);
    }
}

