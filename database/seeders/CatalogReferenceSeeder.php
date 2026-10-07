<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductSize;
use App\Models\Inventory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CatalogReferenceSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Categories
        $catUniform = Category::updateOrCreate(
            ['slug' => 'school-uniform'],
            [
                'name' => 'School Uniform',
                'description' => 'Official DSSC School Uniforms for College Students',
                'icon' => 'Shirt',
                'sort_order' => 1,
            ]
        );

        $catPathFit = Category::updateOrCreate(
            ['slug' => 'path-fit'],
            [
                'name' => 'PATH-Fit',
                'description' => 'Official DSSC Physical Activity Towards Health and Fitness Apparel',
                'icon' => 'Activity',
                'sort_order' => 2,
            ]
        );

        $catAccessories = Category::updateOrCreate(
            ['slug' => 'accessories'],
            [
                'name' => 'Accessories',
                'description' => 'Official DSSC College Identification and Accessories',
                'icon' => 'Tag',
                'sort_order' => 3,
            ]
        );

        // 2. Catalog Items matching the user reference
        $catalog = [
            [
                'name' => "Men's Uniform Shirt",
                'slug' => 'mens-uniform-shirt',
                'category_id' => $catUniform->id,
                'description' => 'White short-sleeve collared shirt with DSSC school uniform design.',
                'base_price' => 350.00,
                'gender' => 'male',
                'image_path' => '/images/products/mens-uniform-shirt.jpg',
                'sizes' => [
                    ['size' => 'S', 'price_adjustment' => 0, 'stock' => 35, 'reserved' => 3],
                    ['size' => 'M', 'price_adjustment' => 0, 'stock' => 45, 'reserved' => 4],
                    ['size' => 'L', 'price_adjustment' => 0, 'stock' => 30, 'reserved' => 2],
                    ['size' => 'XL', 'price_adjustment' => 0, 'stock' => 33, 'reserved' => 3],
                ], // Available = 131
            ],
            [
                'name' => "Men's Uniform Pants",
                'slug' => 'mens-uniform-pants',
                'category_id' => $catUniform->id,
                'description' => 'Dark navy formal trousers for men. Durable and comfortable for daily use.',
                'base_price' => 420.00,
                'gender' => 'male',
                'image_path' => '/images/products/mens-uniform-pants.jpg',
                'sizes' => [
                    ['size' => 'S', 'price_adjustment' => 0, 'stock' => 24, 'reserved' => 0],
                    ['size' => 'M', 'price_adjustment' => 0, 'stock' => 30, 'reserved' => 0],
                    ['size' => 'L', 'price_adjustment' => 0, 'stock' => 25, 'reserved' => 0],
                    ['size' => 'XL', 'price_adjustment' => 0, 'stock' => 20, 'reserved' => 0],
                ], // Available = 99
            ],
            [
                'name' => "Women's Uniform Blouse",
                'slug' => 'womens-uniform-blouse',
                'category_id' => $catUniform->id,
                'description' => 'White short-sleeve blouse with DSSC tie design.',
                'base_price' => 350.00,
                'gender' => 'female',
                'image_path' => '/images/products/womens-uniform-blouse.jpg',
                'sizes' => [
                    ['size' => 'S', 'price_adjustment' => 0, 'stock' => 30, 'reserved' => 0],
                    ['size' => 'M', 'price_adjustment' => 0, 'stock' => 40, 'reserved' => 0],
                    ['size' => 'L', 'price_adjustment' => 0, 'stock' => 30, 'reserved' => 0],
                    ['size' => 'XL', 'price_adjustment' => 0, 'stock' => 20, 'reserved' => 0],
                ], // Available = 120
            ],
            [
                'name' => "Women's Uniform Skirt",
                'slug' => 'womens-uniform-skirt',
                'category_id' => $catUniform->id,
                'description' => 'Dark navy pleated skirt for women. Comfortable and durable fabric.',
                'base_price' => 420.00,
                'gender' => 'female',
                'image_path' => '/images/products/womens-uniform-skirt.jpg',
                'sizes' => [
                    ['size' => 'S', 'price_adjustment' => 0, 'stock' => 20, 'reserved' => 0],
                    ['size' => 'M', 'price_adjustment' => 0, 'stock' => 30, 'reserved' => 0],
                    ['size' => 'L', 'price_adjustment' => 0, 'stock' => 22, 'reserved' => 0],
                    ['size' => 'XL', 'price_adjustment' => 0, 'stock' => 15, 'reserved' => 0],
                ], // Available = 87
            ],
            [
                'name' => "Women's Uniform Trousers",
                'slug' => 'womens-uniform-trousers',
                'category_id' => $catUniform->id,
                'description' => 'Dark navy formal trousers for women. Stylish and comfortable for daily use.',
                'base_price' => 420.00,
                'gender' => 'female',
                'image_path' => '/images/products/womens-uniform-trousers.jpg',
                'sizes' => [
                    ['size' => 'S', 'price_adjustment' => 0, 'stock' => 18, 'reserved' => 0],
                    ['size' => 'M', 'price_adjustment' => 0, 'stock' => 25, 'reserved' => 0],
                    ['size' => 'L', 'price_adjustment' => 0, 'stock' => 20, 'reserved' => 0],
                    ['size' => 'XL', 'price_adjustment' => 0, 'stock' => 13, 'reserved' => 0],
                ], // Available = 76
            ],
            [
                'name' => 'PATH-Fit Shirt',
                'slug' => 'path-fit-shirt',
                'category_id' => $catPathFit->id,
                'description' => 'Royal blue and white dry-fit moisture-wicking athletic shirt with DSSC design.',
                'base_price' => 320.00,
                'gender' => 'unisex',
                'image_path' => '/images/products/path-fit-shirt.jpg',
                'sizes' => [
                    ['size' => 'S', 'price_adjustment' => 0, 'stock' => 28, 'reserved' => 0],
                    ['size' => 'M', 'price_adjustment' => 0, 'stock' => 35, 'reserved' => 0],
                    ['size' => 'L', 'price_adjustment' => 0, 'stock' => 28, 'reserved' => 0],
                    ['size' => 'XL', 'price_adjustment' => 0, 'stock' => 21, 'reserved' => 0],
                ], // Available = 112
            ],
            [
                'name' => 'PATH-Fit Pants',
                'slug' => 'path-fit-pants',
                'category_id' => $catPathFit->id,
                'description' => 'Royal blue athletic pants with elastic waistband and white side details.',
                'base_price' => 380.00,
                'gender' => 'unisex',
                'image_path' => '/images/products/path-fit-pants.jpg',
                'sizes' => [
                    ['size' => 'S', 'price_adjustment' => 0, 'stock' => 25, 'reserved' => 0],
                    ['size' => 'M', 'price_adjustment' => 0, 'stock' => 30, 'reserved' => 0],
                    ['size' => 'L', 'price_adjustment' => 0, 'stock' => 25, 'reserved' => 0],
                    ['size' => 'XL', 'price_adjustment' => 0, 'stock' => 19, 'reserved' => 0],
                ], // Available = 99
            ],
            [
                'name' => 'DSSC ID Lace',
                'slug' => 'dssc-id-lace',
                'category_id' => $catAccessories->id,
                'description' => 'Official DSSC royal blue and red ID lace with college logo.',
                'base_price' => 85.00,
                'gender' => 'unisex',
                'image_path' => '/images/products/dssc-id-lace.jpg',
                'sizes' => [
                    ['size' => 'Standard', 'price_adjustment' => 0, 'stock' => 125, 'reserved' => 0],
                ], // Available = 125
            ],
        ];

        foreach ($catalog as $item) {
            $product = Product::updateOrCreate(
                ['slug' => $item['slug']],
                [
                    'name' => $item['name'],
                    'category_id' => $item['category_id'],
                    'description' => $item['description'],
                    'base_price' => $item['base_price'],
                    'gender' => $item['gender'],
                    'image_path' => $item['image_path'],
                    'is_active' => true,
                ]
            );

            foreach ($item['sizes'] as $i => $s) {
                $productSize = ProductSize::updateOrCreate(
                    [
                        'product_id' => $product->id,
                        'size' => $s['size'],
                    ],
                    [
                        'price_adjustment' => $s['price_adjustment'],
                        'sort_order' => $i + 1,
                    ]
                );

                Inventory::updateOrCreate(
                    ['product_size_id' => $productSize->id],
                    [
                        'total_stock' => $s['stock'],
                        'reserved_stock' => $s['reserved'],
                        'reorder_level' => 10,
                    ]
                );
            }
        }
    }
}
