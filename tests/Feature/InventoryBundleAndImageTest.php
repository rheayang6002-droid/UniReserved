<?php

use App\Models\Category;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\ProductSize;
use App\Models\Reservation;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    Storage::fake('public');
});

function createAdminUser(): User
{
    $admin = User::factory()->create([
        'role'   => 'admin',
        'status' => 'active',
    ]);
    $admin->assignRole('Staff/Admin');
    return $admin;
}

function createStudentUser(): User
{
    $student = User::factory()->create([
        'role'   => 'student',
        'status' => 'active',
    ]);
    $student->assignRole('Student');
    return $student;
}

test('administrator can upload product with image and file is persisted to public storage', function () {
    $admin = createAdminUser();
    $category = Category::firstOrCreate(['slug' => 'uniforms'], ['name' => 'Uniforms', 'sort_order' => 1]);

    $file = UploadedFile::fake()->image('polo.jpg', 600, 600);

    $response = $this->actingAs($admin)->post(route('admin.inventory.store'), [
        'category_id'  => $category->id,
        'name'         => 'College Polo Shirt',
        'description'  => 'Official College Polo Uniform',
        'base_price'   => 450.00,
        'gender'       => 'unisex',
        'product_type' => 'Individual Item',
        'image'        => $file,
        'sizes'        => [
            ['size' => 'Small', 'price_adjustment' => 0, 'stock' => 20],
            ['size' => 'Medium', 'price_adjustment' => 0, 'stock' => 15],
            ['size' => 'Large', 'price_adjustment' => 10, 'stock' => 10],
        ],
    ]);

    $response->assertRedirect(route('admin.inventory.index'));

    $product = Product::where('name', 'College Polo Shirt')->first();
    expect($product)->not->toBeNull();
    expect($product->image_path)->not->toBeNull();
    Storage::disk('public')->assertExists($product->image_path);
    expect($product->sizes)->toHaveCount(3);
});

test('invalid image formats and files over 2MB are rejected', function () {
    $admin = createAdminUser();
    $category = Category::firstOrCreate(['slug' => 'uniforms'], ['name' => 'Uniforms', 'sort_order' => 1]);

    // Test text file instead of image
    $badFile = UploadedFile::fake()->create('document.pdf', 500);

    $response = $this->actingAs($admin)->post(route('admin.inventory.store'), [
        'category_id'  => $category->id,
        'name'         => 'Test Invalid File',
        'base_price'   => 100.00,
        'gender'       => 'unisex',
        'product_type' => 'Individual Item',
        'image'        => $badFile,
        'sizes'        => [
            ['size' => 'Standard', 'price_adjustment' => 0, 'stock' => 10],
        ],
    ]);

    $response->assertSessionHasErrors(['image']);

    // Test file exceeding 2MB (e.g. 3000KB)
    $largeFile = UploadedFile::fake()->image('huge.jpg')->size(3000);

    $response2 = $this->actingAs($admin)->post(route('admin.inventory.store'), [
        'category_id'  => $category->id,
        'name'         => 'Test Large File',
        'base_price'   => 100.00,
        'gender'       => 'unisex',
        'product_type' => 'Individual Item',
        'image'        => $largeFile,
        'sizes'        => [
            ['size' => 'Standard', 'price_adjustment' => 0, 'stock' => 10],
        ],
    ]);

    $response2->assertSessionHasErrors(['image']);
});

test('administrator can create a Uniform Set bundle and PE Set bundle with components', function () {
    $admin = createAdminUser();
    $category = Category::firstOrCreate(['slug' => 'uniforms'], ['name' => 'Uniforms', 'sort_order' => 1]);

    // Create 2 individual products: Polo and Pants
    $polo = Product::create([
        'category_id'  => $category->id,
        'name'         => 'DSSC Polo Shirt',
        'slug'         => 'dssc-polo-shirt',
        'base_price'   => 350.00,
        'gender'       => 'unisex',
        'product_type' => 'Individual Item',
        'is_active'    => true,
    ]);
    $poloSize = $polo->sizes()->create(['size' => 'Medium', 'price_adjustment' => 0, 'sort_order' => 0]);
    Inventory::create(['product_size_id' => $poloSize->id, 'total_stock' => 10, 'reserved_stock' => 0]);

    $pants = Product::create([
        'category_id'  => $category->id,
        'name'         => 'DSSC Trousers',
        'slug'         => 'dssc-trousers',
        'base_price'   => 400.00,
        'gender'       => 'unisex',
        'product_type' => 'Individual Item',
        'is_active'    => true,
    ]);
    $pantsSize = $pants->sizes()->create(['size' => 'Medium', 'price_adjustment' => 0, 'sort_order' => 0]);
    Inventory::create(['product_size_id' => $pantsSize->id, 'total_stock' => 8, 'reserved_stock' => 0]);

    // Create Uniform Set bundle
    $response = $this->actingAs($admin)->post(route('admin.inventory.store'), [
        'category_id'       => $category->id,
        'name'              => 'Complete Uniform Set',
        'description'       => 'Includes Polo and Trousers',
        'base_price'        => 700.00,
        'gender'            => 'unisex',
        'product_type'      => 'Uniform Set',
        'bundle_components' => [
            ['component_product_id' => $polo->id, 'quantity' => 1],
            ['component_product_id' => $pants->id, 'quantity' => 1],
        ],
        'sizes'             => [
            ['size' => 'Medium', 'price_adjustment' => 0, 'stock' => 0],
        ],
    ]);

    $response->assertRedirect(route('admin.inventory.index'));

    $bundle = Product::where('name', 'Complete Uniform Set')->first();
    expect($bundle)->not->toBeNull();
    expect($bundle->isBundle())->toBeTrue();
    expect($bundle->bundleItems)->toHaveCount(2);

    // Bundle availability should be min(10, 8) = 8
    expect($bundle->getBundleSizeAvailableStock('Medium'))->toBe(8);
    expect($bundle->getBundleSizeTotalStock('Medium'))->toBe(8);
});

test('bundle with ID Lace availability is capped by lowest component stock', function () {
    $admin = createAdminUser();
    $category = Category::firstOrCreate(['slug' => 'uniforms'], ['name' => 'Uniforms', 'sort_order' => 1]);

    $peShirt = Product::create([
        'category_id'  => $category->id,
        'name'         => 'PATH-Fit Shirt',
        'slug'         => 'path-fit-shirt',
        'base_price'   => 300.00,
        'gender'       => 'unisex',
        'product_type' => 'Individual Item',
        'is_active'    => true,
    ]);
    $peShirtSize = $peShirt->sizes()->create(['size' => 'Large', 'price_adjustment' => 0, 'sort_order' => 0]);
    Inventory::create(['product_size_id' => $peShirtSize->id, 'total_stock' => 20, 'reserved_stock' => 0]);

    $idLace = Product::create([
        'category_id'  => $category->id,
        'name'         => 'DSSC ID Lace',
        'slug'         => 'dssc-id-lace',
        'base_price'   => 75.00,
        'gender'       => 'unisex',
        'product_type' => 'Individual Item',
        'is_active'    => true,
    ]);
    $idLaceSize = $idLace->sizes()->create(['size' => 'Standard', 'price_adjustment' => 0, 'sort_order' => 0]);
    Inventory::create(['product_size_id' => $idLaceSize->id, 'total_stock' => 3, 'reserved_stock' => 0]); // Only 3 laces!

    // Create PE Set + ID Lace bundle
    $response = $this->actingAs($admin)->post(route('admin.inventory.store'), [
        'category_id'       => $category->id,
        'name'              => 'PE Set + ID Lace',
        'base_price'        => 350.00,
        'gender'            => 'unisex',
        'product_type'      => 'PE Set + ID Lace',
        'bundle_components' => [
            ['component_product_id' => $peShirt->id, 'quantity' => 1],
            ['component_product_id' => $idLace->id, 'quantity' => 1],
        ],
        'sizes'             => [
            ['size' => 'Large', 'price_adjustment' => 0, 'stock' => 0],
        ],
    ]);

    $response->assertRedirect(route('admin.inventory.index'));

    $bundle = Product::where('name', 'PE Set + ID Lace')->first();
    // Since ID Lace only has 3 units, bundle availability cannot exceed 3!
    expect($bundle->getBundleSizeAvailableStock('Large'))->toBe(3);
});

test('reserving a bundle reserves component physical stock and prevents double counting', function () {
    $student = createStudentUser();
    $category = Category::firstOrCreate(['slug' => 'uniforms'], ['name' => 'Uniforms', 'sort_order' => 1]);

    $shirt = Product::create([
        'category_id'  => $category->id,
        'name'         => 'Polo A',
        'slug'         => 'polo-a',
        'base_price'   => 200.00,
        'gender'       => 'unisex',
        'product_type' => 'Individual Item',
        'is_active'    => true,
    ]);
    $shirtSize = $shirt->sizes()->create(['size' => 'Medium', 'price_adjustment' => 0, 'sort_order' => 0]);
    $shirtInv = Inventory::create(['product_size_id' => $shirtSize->id, 'total_stock' => 5, 'reserved_stock' => 0]);

    $pants = Product::create([
        'category_id'  => $category->id,
        'name'         => 'Pants A',
        'slug'         => 'pants-a',
        'base_price'   => 200.00,
        'gender'       => 'unisex',
        'product_type' => 'Individual Item',
        'is_active'    => true,
    ]);
    $pantsSize = $pants->sizes()->create(['size' => 'Medium', 'price_adjustment' => 0, 'sort_order' => 0]);
    $pantsInv = Inventory::create(['product_size_id' => $pantsSize->id, 'total_stock' => 5, 'reserved_stock' => 0]);

    $bundle = Product::create([
        'category_id'  => $category->id,
        'name'         => 'Set A',
        'slug'         => 'set-a',
        'base_price'   => 380.00,
        'gender'       => 'unisex',
        'product_type' => 'Uniform Set',
        'is_active'    => true,
    ]);
    $bundle->bundleItems()->create(['component_product_id' => $shirt->id, 'quantity' => 1]);
    $bundle->bundleItems()->create(['component_product_id' => $pants->id, 'quantity' => 1]);
    $bundleSize = $bundle->sizes()->create(['size' => 'Medium', 'price_adjustment' => 0, 'sort_order' => 0]);
    $bundleInv = Inventory::create(['product_size_id' => $bundleSize->id, 'total_stock' => 5, 'reserved_stock' => 0]);

    // Student reserves 2 sets
    $response = $this->actingAs($student)->post(route('reservations.store'), [
        'items' => [
            ['product_size_id' => $bundleSize->id, 'quantity' => 2],
        ],
    ]);

    $response->assertRedirect(route('reservations.index'));

    // Check physical components: reserved_stock must increase by 2
    $shirtInv->refresh();
    $pantsInv->refresh();
    expect($shirtInv->reserved_stock)->toBe(2);
    expect($pantsInv->reserved_stock)->toBe(2);

    // Remaining available stock of shirt and pants is now 3
    // And bundle available stock is now 3
    $bundle->refresh();
    expect($bundle->getBundleSizeAvailableStock('Medium'))->toBe(3);

    // Now student cancels the reservation
    $reservation = Reservation::where('user_id', $student->id)->latest()->first();
    $cancelResponse = $this->actingAs($student)->delete(route('reservations.cancel', $reservation->id));
    $cancelResponse->assertRedirect(route('reservations.index'));

    // Component stock should be released back to 0 reserved
    $shirtInv->refresh();
    $pantsInv->refresh();
    expect($shirtInv->reserved_stock)->toBe(0);
    expect($pantsInv->reserved_stock)->toBe(0);

    $freshBundle = Product::find($bundle->id);
    expect($freshBundle->getBundleSizeAvailableStock('Medium'))->toBe(5);
});

test('claiming a bundle reservation deducts physical stock from components', function () {
    $admin = createAdminUser();
    $student = createStudentUser();
    $category = Category::firstOrCreate(['slug' => 'uniforms'], ['name' => 'Uniforms', 'sort_order' => 1]);

    $shirt = Product::create([
        'category_id'  => $category->id,
        'name'         => 'Polo B',
        'slug'         => 'polo-b',
        'base_price'   => 200.00,
        'gender'       => 'unisex',
        'product_type' => 'Individual Item',
        'is_active'    => true,
    ]);
    $shirtSize = $shirt->sizes()->create(['size' => 'Small', 'price_adjustment' => 0, 'sort_order' => 0]);
    $shirtInv = Inventory::create(['product_size_id' => $shirtSize->id, 'total_stock' => 10, 'reserved_stock' => 0]);

    $bundle = Product::create([
        'category_id'  => $category->id,
        'name'         => 'Set B',
        'slug'         => 'set-b',
        'base_price'   => 200.00,
        'gender'       => 'unisex',
        'product_type' => 'Uniform Set',
        'is_active'    => true,
    ]);
    $bundle->bundleItems()->create(['component_product_id' => $shirt->id, 'quantity' => 1]);
    $bundleSize = $bundle->sizes()->create(['size' => 'Small', 'price_adjustment' => 0, 'sort_order' => 0]);
    Inventory::create(['product_size_id' => $bundleSize->id, 'total_stock' => 10, 'reserved_stock' => 0]);

    // Student reserves 1 set
    $this->actingAs($student)->post(route('reservations.store'), [
        'items' => [
            ['product_size_id' => $bundleSize->id, 'quantity' => 1],
        ],
    ]);

    $reservation = Reservation::where('user_id', $student->id)->latest()->first();

    // Admin claims the reservation
    $response = $this->actingAs($admin)->post(route('admin.reservations.claim', $reservation->id));
    $response->assertRedirect();

    // Check component stock: total_stock should drop from 10 to 9, reserved should drop back to 0
    $shirtInv->refresh();
    expect($shirtInv->total_stock)->toBe(9);
    expect($shirtInv->reserved_stock)->toBe(0);
});

test('all requested product types can be created by administrator', function (string $type) {
    $admin = createAdminUser();
    $category = Category::firstOrCreate(['slug' => 'uniforms'], ['name' => 'Uniforms', 'sort_order' => 1]);

    $item = Product::create([
        'category_id'  => $category->id,
        'name'         => "Item for {$type}",
        'slug'         => \Str::slug("Item for {$type}"),
        'base_price'   => 150.00,
        'gender'       => 'unisex',
        'product_type' => 'Individual Item',
        'is_active'    => true,
    ]);

    $postData = [
        'category_id'  => $category->id,
        'name'         => "Test {$type}",
        'base_price'   => 500.00,
        'gender'       => 'unisex',
        'product_type' => $type,
        'sizes'        => [
            ['size' => 'Medium', 'price_adjustment' => 0, 'stock' => 10],
        ],
    ];

    if ($type !== 'Individual Item') {
        $postData['bundle_components'] = [
            ['component_product_id' => $item->id, 'quantity' => 1],
        ];
    }

    $response = $this->actingAs($admin)->post(route('admin.inventory.store'), $postData);
    $response->assertRedirect(route('admin.inventory.index'));

    $created = Product::where('name', "Test {$type}")->first();
    expect($created)->not->toBeNull();
    expect($created->product_type)->toBe($type);
})->with([
    'Individual Item',
    'Uniform Set',
    'PE Set',
    'Uniform Set + ID Lace',
    'PE Set + ID Lace',
    'Uniform Set + PE Set',
    'Uniform Set + PE Set + ID Lace',
    'Custom Bundle',
]);

test('student cannot access inventory management or create products', function () {
    $student = createStudentUser();
    $category = Category::firstOrCreate(['slug' => 'uniforms'], ['name' => 'Uniforms', 'sort_order' => 1]);

    $this->actingAs($student)
        ->get(route('admin.inventory.create'))
        ->assertForbidden();

    $this->actingAs($student)
        ->post(route('admin.inventory.store'), [
            'category_id'  => $category->id,
            'name'         => 'Hacked Item',
            'base_price'   => 10.00,
            'gender'       => 'unisex',
            'product_type' => 'Individual Item',
            'sizes'        => [['size' => 'Small', 'price_adjustment' => 0, 'stock' => 10]],
        ])
        ->assertForbidden();
});

test('browse items page loads successfully and contains product type and images', function () {
    $student = createStudentUser();
    $category = Category::firstOrCreate(['slug' => 'uniforms'], ['name' => 'Uniforms', 'sort_order' => 1]);

    Product::create([
        'category_id'  => $category->id,
        'name'         => 'Catalog Polo Item',
        'slug'         => 'catalog-polo-item',
        'base_price'   => 250.00,
        'gender'       => 'unisex',
        'product_type' => 'Uniform Set',
        'is_active'    => true,
    ]);

    $response = $this->actingAs($student)->get(route('items.index'));
    $response->assertOk();
});

