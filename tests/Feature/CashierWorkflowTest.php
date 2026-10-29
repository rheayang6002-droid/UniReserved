<?php

use App\Models\Category;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\ProductSize;
use App\Models\Reservation;
use App\Models\ReservationItem;
use App\Models\User;
use App\Models\Payment;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

function getCashierTestProduct() {
    $category = Category::firstOrCreate(
        ['slug' => 'regular-uniform-cashier-test'],
        ['name' => 'Regular Uniform Cashier Test', 'sort_order' => 1]
    );

    $product = Product::firstOrCreate(
        ['slug' => 'dssc-polo-shirt-cashier-test'],
        [
            'category_id' => $category->id,
            'name' => 'DSSC Polo Shirt Cashier Test',
            'base_price' => 400.00,
            'gender' => 'unisex',
            'is_active' => true,
        ]
    );

    $size = ProductSize::firstOrCreate(
        ['product_id' => $product->id, 'size' => 'Large'],
        ['price_adjustment' => 0.00, 'sort_order' => 1]
    );

    Inventory::firstOrCreate(
        ['product_size_id' => $size->id],
        ['total_stock' => 50, 'reserved_stock' => 0, 'reorder_level' => 5]
    );

    return [$product, $size];
}

test('Cashier can access Payments, Transactions, Receipts, and History pages', function () {
    $cashier = User::where('email', 'cashier@dssc.edu.ph')->first();
    if (!$cashier) {
        $cashier = User::factory()->create([
            'email' => 'test_cashier@dssc.edu.ph',
            'role' => 'cashier',
        ]);
        $cashier->assignRole('School Cashier');
    }

    $this->actingAs($cashier)->get('/cashier/payments')->assertStatus(200);
    $this->actingAs($cashier)->get('/cashier/transactions')->assertStatus(200);
    $this->actingAs($cashier)->get('/cashier/receipts')->assertStatus(200);
    $this->actingAs($cashier)->get('/cashier/history')->assertStatus(200);
});

test('Student cannot access Cashier desk pages', function () {
    $student = User::factory()->create([
        'email' => 'student_intruder_' . Str::random(5) . '@student.dssc.edu.ph',
        'role' => 'student',
    ]);
    $student->assignRole('Student');

    $this->actingAs($student)->get('/cashier/payments')->assertStatus(403);
    $this->actingAs($student)->get('/cashier/transactions')->assertStatus(403);
});

test('Cashier cannot access BEO Inventory or Super Admin user management', function () {
    $cashier = User::where('email', 'cashier@dssc.edu.ph')->first();
    if (!$cashier) {
        $cashier = User::factory()->create([
            'email' => 'cashier_desk@dssc.edu.ph',
            'role' => 'cashier',
        ]);
        $cashier->assignRole('School Cashier');
    }

    $this->actingAs($cashier)->get('/admin/inventory')->assertStatus(403);
    $this->actingAs($cashier)->get('/admin/users')->assertStatus(403);
});

test('Cashier can record payment with official receipt number for pending reservation', function () {
    $student = User::factory()->create([
        'email' => 'student_payer_' . Str::random(5) . '@student.dssc.edu.ph',
        'role' => 'student',
    ]);
    $student->assignRole('Student');

    [$product, $size] = getCashierTestProduct();

    $reservation = Reservation::create([
        'user_id' => $student->id,
        'reference_code' => 'UR-TEST-' . strtoupper(Str::random(6)),
        'total_amount' => 400.00,
        'reservation_status' => 'reserved',
        'payment_status' => 'pending',
    ]);

    ReservationItem::create([
        'reservation_id' => $reservation->id,
        'product_id' => $product->id,
        'product_size_id' => $size->id,
        'quantity' => 1,
        'unit_price' => 400.00,
        'subtotal' => 400.00,
    ]);

    $cashier = User::where('email', 'cashier@dssc.edu.ph')->first();
    if (!$cashier) {
        $cashier = User::factory()->create([
            'email' => 'cashier_official@dssc.edu.ph',
            'role' => 'cashier',
        ]);
        $cashier->assignRole('School Cashier');
    }

    $receiptNumber = 'OR-TEST-' . strtoupper(Str::random(6));

    $response = $this->actingAs($cashier)->post("/cashier/payments/{$reservation->id}/record", [
        'reservation_id' => $reservation->id,
        'receipt_number' => $receiptNumber,
        'amount' => 400.00,
        'payment_method' => 'cash',
        'payment_date' => now()->format('Y-m-d'),
        'notes' => 'Full cash payment received at Cashier window',
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    // Check payment record created
    $payment = Payment::where('receipt_number', $receiptNumber)->first();
    expect($payment)->not->toBeNull();
    expect($payment->reservation_id)->toBe($reservation->id);
    expect($payment->cashier_id)->toBe($cashier->id);
    expect((float)$payment->amount)->toBe(400.00);

    // Check reservation payment_status updated
    $reservation->refresh();
    expect($reservation->payment_status)->toBe('paid');
});
