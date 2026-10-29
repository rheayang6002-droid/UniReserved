<?php

use App\Models\Category;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\ProductSize;
use App\Models\QueueEntry;
use App\Models\Reservation;
use App\Models\ReservationItem;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Str;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

// Helper to seed a sample category and product
function createSampleProduct() {
    $category = Category::firstOrCreate(
        ['slug' => 'regular-uniform'],
        ['name' => 'Regular Uniform', 'sort_order' => 1]
    );

    $product = Product::firstOrCreate(
        ['slug' => 'dssc-polo-shirt'],
        [
            'category_id' => $category->id,
            'name' => 'DSSC Polo Shirt',
            'base_price' => 350.00,
            'gender' => 'unisex',
            'is_active' => true,
        ]
    );

    $size = ProductSize::firstOrCreate(
        ['product_id' => $product->id, 'size' => 'Medium'],
        ['price_adjustment' => 0.00, 'sort_order' => 1]
    );

    Inventory::firstOrCreate(
        ['product_size_id' => $size->id],
        ['total_stock' => 50, 'reserved_stock' => 0, 'reorder_level' => 5]
    );

    return [$product, $size];
}

// TEST 1: Normal registration creates Student
test('TEST 1: Normal registration creates Student', function () {
    $response = $this->post(route('register.store'), [
        'name'                  => 'Maria Santos',
        'email'                 => 'maria@student.dssc.edu.ph',
        'password'              => 'Password@123',
        'password_confirmation' => 'Password@123',
    ]);

    $response->assertRedirect(route('dashboard', absolute: false));

    $user = User::where('email', 'maria@student.dssc.edu.ph')->first();
    expect($user)->not->toBeNull();
    expect($user->hasRole('Student'))->toBeTrue();
    expect($user->role)->toBe('student');
});

// TEST 2: Student cannot register as Super Admin
test('TEST 2: Student cannot register as Super Admin (role tampering rejected)', function () {
    $response = $this->post(route('register.store'), [
        'name'                  => 'Hacker User',
        'email'                 => 'hacker@dssc.edu.ph',
        'password'              => 'Password@123',
        'password_confirmation' => 'Password@123',
        'role'                  => 'Super Admin',
        'roles'                 => ['Super Admin'],
        'is_super_admin'        => true,
    ]);

    $user = User::where('email', 'hacker@dssc.edu.ph')->first();
    expect($user)->not->toBeNull();
    expect($user->hasRole('Super Admin'))->toBeFalse();
    expect($user->hasRole('Student'))->toBeTrue();
    expect($user->role)->toBe('student');
});

// TEST 3: Student cannot access User Management
test('TEST 3: Student cannot access User Management', function () {
    $student = User::factory()->create(['role' => 'student']);
    $student->assignRole('Student');

    $this->actingAs($student)
        ->get('/admin/users')
        ->assertForbidden();
});

// TEST 4: Student cannot access Role Management
test('TEST 4: Student cannot access Role Management', function () {
    $student = User::factory()->create(['role' => 'student']);
    $student->assignRole('Student');

    $this->actingAs($student)
        ->get('/admin/roles')
        ->assertForbidden();
});

// TEST 5: Student cannot access Permission Management
test('TEST 5: Student cannot access Permission Management', function () {
    $student = User::factory()->create(['role' => 'student']);
    $student->assignRole('Student');

    $this->actingAs($student)
        ->get('/admin/permissions')
        ->assertForbidden();
});

// TEST 6: Student cannot create Super Admin
test('TEST 6: Student cannot create Super Admin', function () {
    $student = User::factory()->create(['role' => 'student']);
    $student->assignRole('Student');

    $this->actingAs($student)
        ->get('/admin/super-admin/create')
        ->assertForbidden();
});

// TEST 7: Student cannot promote another Student
test('TEST 7: Student cannot promote another Student', function () {
    $studentA = User::factory()->create(['role' => 'student']);
    $studentA->assignRole('Student');

    $studentB = User::factory()->create(['role' => 'student']);
    $studentB->assignRole('Student');

    $this->actingAs($studentA)
        ->post("/admin/super-admin/promote/{$studentB->id}")
        ->assertForbidden();

    expect($studentB->fresh()->hasRole('Super Admin'))->toBeFalse();
});

// TEST 8: Staff/Admin cannot promote themselves to Super Admin
test('TEST 8: Staff/Admin cannot promote themselves to Super Admin', function () {
    $staff = User::factory()->create(['role' => 'staff']);
    $staff->assignRole('Staff/Admin');

    $this->actingAs($staff)
        ->post("/admin/super-admin/promote/{$staff->id}")
        ->assertForbidden();

    expect($staff->fresh()->hasRole('Super Admin'))->toBeFalse();
});

// TEST 9: Existing Super Admin can access Create Super Admin
test('TEST 9: Existing Super Admin can access Create Super Admin', function () {
    $superAdmin = User::factory()->create(['role' => 'admin']);
    $superAdmin->assignRole('Super Admin');

    $this->actingAs($superAdmin)
        ->get('/admin/super-admin/create')
        ->assertOk();
});

// TEST 10: Super Admin can promote an eligible Student
test('TEST 10: Super Admin can promote an eligible Student', function () {
    $superAdmin = User::factory()->create(['role' => 'admin']);
    $superAdmin->assignRole('Super Admin');

    $student = User::factory()->create(['role' => 'student', 'status' => 'active']);
    $student->assignRole('Student');

    $response = $this->actingAs($superAdmin)
        ->post("/admin/super-admin/promote/{$student->id}");

    $response->assertSessionHas('success');
    expect($student->fresh()->hasRole('Super Admin'))->toBeTrue();
});

// TEST 11: Promoted Student becomes Super Admin
test('TEST 11: Promoted Student becomes Super Admin', function () {
    $superAdmin = User::factory()->create(['role' => 'admin']);
    $superAdmin->assignRole('Super Admin');

    $student = User::factory()->create(['role' => 'student', 'status' => 'active']);
    $student->assignRole('Student');

    $this->actingAs($superAdmin)->post("/admin/super-admin/promote/{$student->id}");

    $promoted = $student->fresh();
    expect($promoted->hasRole('Super Admin'))->toBeTrue();
    expect($promoted->isSuperAdmin())->toBeTrue();
});

// TEST 12: Promoted user can access Super Admin features after login
test('TEST 12: Promoted user can access Super Admin features after login', function () {
    $promoted = User::factory()->create(['role' => 'admin', 'status' => 'active']);
    $promoted->assignRole('Super Admin');

    $this->actingAs($promoted)
        ->get('/admin/users')
        ->assertOk();

    $this->actingAs($promoted)
        ->get('/admin/roles')
        ->assertOk();

    $this->actingAs($promoted)
        ->get('/admin/permissions')
        ->assertOk();

    $this->actingAs($promoted)
        ->get('/admin/super-admin/create')
        ->assertOk();
});

// TEST 13: Student A cannot view Student B\'s reservation by changing ID
test('TEST 13: Student A cannot view Student B reservation by changing ID', function () {
    [$product, $size] = createSampleProduct();

    $studentA = User::factory()->create(['role' => 'student']);
    $studentA->assignRole('Student');

    $studentB = User::factory()->create(['role' => 'student']);
    $studentB->assignRole('Student');

    $reservationB = Reservation::create([
        'reference_code'     => 'UR-2026-TESTB',
        'user_id'            => $studentB->id,
        'total_amount'       => 350.00,
        'payment_status'     => 'pending',
        'reservation_status' => 'reserved',
        'queue_number'       => 101,
    ]);

    $this->actingAs($studentA)
        ->get("/reservations/{$reservationB->id}")
        ->assertForbidden();
});

// TEST 14: Student cannot manipulate queue position
test('TEST 14: Student cannot manipulate queue position', function () {
    $student = User::factory()->create(['role' => 'student']);
    $student->assignRole('Student');

    // Create a valid queue entry so model binding resolves
    // (SubstituteBindings runs before route-specific middleware)
    $anotherUser = User::factory()->create(['role' => 'student']);
    $reservation = Reservation::create([
        'reference_code'     => 'UR-TEST-Q14',
        'user_id'            => $anotherUser->id,
        'total_amount'       => 350.00,
        'payment_status'     => 'pending',
        'reservation_status' => 'reserved',
        'queue_number'       => 200,
    ]);
    $entry = QueueEntry::create([
        'reservation_id' => $reservation->id,
        'queue_position' => 1,
        'status'         => 'waiting',
    ]);

    // Attempting to post to admin queue process endpoint is forbidden
    $this->actingAs($student)
        ->post("/admin/queue/{$entry->id}/process")
        ->assertForbidden();

    $this->actingAs($student)
        ->post("/admin/queue/{$entry->id}/skip")
        ->assertForbidden();
});

// TEST 15: Student cannot modify inventory
test('TEST 15: Student cannot modify inventory', function () {
    $student = User::factory()->create(['role' => 'student']);
    $student->assignRole('Student');

    // POST to /admin/inventory (store) - no model binding, middleware fires first
    $this->actingAs($student)
        ->post('/admin/inventory', [
            'name' => 'Unauthorized Item',
            'base_price' => 100,
        ])
        ->assertForbidden();

    // Create a valid ProductSize so model binding resolves for adjustStock
    $category = Category::firstOrCreate(
        ['slug' => 'test-uniform'],
        ['name' => 'Test Uniform', 'sort_order' => 99]
    );
    $product = Product::create([
        'category_id' => $category->id,
        'name'        => 'Test Product T15',
        'slug'        => 'test-product-t15-' . Str::random(6),
        'base_price'  => 100,
        'gender'      => 'unisex',
        'is_active'   => true,
    ]);
    $size = ProductSize::create([
        'product_id'       => $product->id,
        'size'             => 'M',
        'price_adjustment' => 0,
        'sort_order'       => 1,
    ]);

    $this->actingAs($student)
        ->post("/admin/inventory/{$size->id}/adjust", [
            'adjustment' => 50,
        ])
        ->assertForbidden();
});

// TEST 16: Unauthorized direct URL access is blocked
test('TEST 16: Unauthorized direct URL access is blocked', function () {
    $student = User::factory()->create(['role' => 'student']);
    $student->assignRole('Student');

    $adminUrls = [
        '/admin/users',
        '/admin/roles',
        '/admin/permissions',
        '/admin/super-admin/create',
        '/admin/inventory',
        '/admin/queue',
        '/admin/reports',
        '/admin/settings',
    ];

    foreach ($adminUrls as $url) {
        $this->actingAs($student)
            ->get($url)
            ->assertForbidden();
    }
});

// TEST 17: Unauthorized direct POST/PUT/PATCH/DELETE requests are blocked
test('TEST 17: Unauthorized direct POST/PUT/PATCH/DELETE requests are blocked', function () {
    $student = User::factory()->create(['role' => 'student']);
    $student->assignRole('Student');

    $this->actingAs($student)
        ->post('/admin/users', ['name' => 'Test', 'email' => 't@t.com', 'role' => 'student'])
        ->assertForbidden();

    $this->actingAs($student)
        ->delete('/admin/users/1')
        ->assertForbidden();

    $this->actingAs($student)
        ->post('/admin/roles', ['name' => 'Custom Role'])
        ->assertForbidden();

    $this->actingAs($student)
        ->delete('/admin/roles/1')
        ->assertForbidden();
});

// TEST 18: AI only returns authenticated student's own reservation data
test('TEST 18: AI only returns authenticated student own reservation data', function () {
    $student = User::factory()->create(['role' => 'student', 'name' => 'Ana Reyes']);
    $student->assignRole('Student');

    $reservation = Reservation::create([
        'reference_code'     => 'UR-2026-ANA01',
        'user_id'            => $student->id,
        'total_amount'       => 700.00,
        'payment_status'     => 'pending',
        'reservation_status' => 'reserved',
        'queue_number'       => 10,
    ]);

    $service = app(\App\Services\AIReservationService::class);
    $reply = $service->ask($student, 'What is my reservation status?');

    expect($reply)->toContain('UR-2026-ANA01');
    expect($reply)->toContain('Reserved');
});

// TEST 19: AI does not reveal another student's information
test('TEST 19: AI does not reveal another student information', function () {
    $studentA = User::factory()->create(['role' => 'student', 'name' => 'Ana Reyes']);
    $studentA->assignRole('Student');

    $studentB = User::factory()->create(['role' => 'student', 'name' => 'Juan Dela Cruz']);
    $studentB->assignRole('Student');

    Reservation::create([
        'reference_code'     => 'UR-2026-JUAN01',
        'user_id'            => $studentB->id,
        'total_amount'       => 500.00,
        'payment_status'     => 'paid',
        'reservation_status' => 'ready_for_claiming',
        'queue_number'       => 15,
    ]);

    $service = app(\App\Services\AIReservationService::class);

    // Ask about Juan
    $reply = $service->ask($studentA, "What is Juan's reservation status?");

    expect($reply)->toContain('privacy and security');
    expect($reply)->not->toContain('UR-2026-JUAN01');
});

// TEST 20: AI does not invent unavailable database information
test('TEST 20: AI does not invent unavailable database information', function () {
    $studentWithoutReservations = User::factory()->create(['role' => 'student', 'name' => 'New Student']);
    $studentWithoutReservations->assignRole('Student');

    $service = app(\App\Services\AIReservationService::class);
    $reply = $service->ask($studentWithoutReservations, 'What is my reservation status?');

    expect($reply)->toContain('do not currently have any active uniform reservations');
    expect($reply)->not->toContain('UR-');
});

// TEST 21: AI endpoint rejects unauthenticated users
test('TEST 21: AI endpoint rejects unauthenticated users', function () {
    $this->get('/ai-assistant')
        ->assertRedirect(route('login'));

    $this->postJson('/ai-assistant/chat', ['message' => 'Hello'])
        ->assertUnauthorized();
});

// TEST 22: AI failure does not crash the system
test('TEST 22: AI failure does not crash the system', function () {
    $student = User::factory()->create(['role' => 'student', 'name' => 'Pedro']);
    $student->assignRole('Student');

    $response = $this->actingAs($student)
        ->postJson('/ai-assistant/chat', [
            'message' => 'How do I make a reservation?',
        ]);

    $response->assertOk();
    $response->assertJsonStructure(['reply', 'timestamp']);
    expect($response->json('reply'))->not->toBeEmpty();
});
