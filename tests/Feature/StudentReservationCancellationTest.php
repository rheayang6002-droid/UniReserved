<?php

use App\Models\AuditLog;
use App\Models\Category;
use App\Models\Inventory;
use App\Models\Notification;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductSize;
use App\Models\QueueEntry;
use App\Models\Reservation;
use App\Models\ReservationItem;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

function createTestReservationItem(Reservation $reservation, int $quantity = 2) {
    $category = Category::firstOrCreate(
        ['slug' => 'test-uniform'],
        ['name' => 'Test Uniform', 'sort_order' => 1]
    );

    $product = Product::firstOrCreate(
        ['slug' => 'test-polo'],
        [
            'category_id' => $category->id,
            'name' => 'Test Polo',
            'base_price' => 300.00,
            'gender' => 'unisex',
            'is_active' => true,
        ]
    );

    $size = ProductSize::firstOrCreate(
        ['product_id' => $product->id, 'size' => 'Medium'],
        ['price_adjustment' => 0.00, 'sort_order' => 1]
    );

    $inventory = Inventory::firstOrCreate(
        ['product_size_id' => $size->id],
        ['total_stock' => 50, 'reserved_stock' => $quantity, 'reorder_level' => 5]
    );

    ReservationItem::create([
        'reservation_id'  => $reservation->id,
        'product_id'      => $product->id,
        'product_size_id' => $size->id,
        'quantity'        => $quantity,
        'unit_price'      => 300.00,
        'subtotal'        => 300.00 * $quantity,
    ]);

    return $inventory;
}

test('student can cancel their own eligible reservation and inventory is released', function () {
    $student = User::factory()->create(['role' => 'student']);
    $student->assignRole('Student');

    $reservation = Reservation::create([
        'reference_code'     => 'UR-2026-9001',
        'user_id'            => $student->id,
        'total_amount'       => 600.00,
        'reservation_status' => 'reserved',
        'payment_status'     => 'pending',
        'queue_number'       => 1,
    ]);

    $inventory = createTestReservationItem($reservation, 2);
    $initialReserved = $inventory->fresh()->reserved_stock;

    $queueEntry = QueueEntry::create([
        'reservation_id' => $reservation->id,
        'queue_position' => 1,
        'status'         => 'waiting',
    ]);

    $response = $this->actingAs($student)
        ->delete(route('reservations.cancel', $reservation));

    $response->assertRedirect(route('reservations.index'));
    $response->assertSessionHas('success');

    $reservation->refresh();
    expect($reservation->reservation_status)->toBe('cancelled');
    expect($reservation->cancelled_at)->not->toBeNull();

    // Inventory released
    expect($inventory->fresh()->reserved_stock)->toBe($initialReserved - 2);

    // Queue entry cancelled
    expect($queueEntry->fresh()->status)->toBe('cancelled');

    // Audit log created with student as actor
    $log = AuditLog::where('module', 'reservations')
        ->where('action', 'cancel')
        ->where('user_id', $student->id)
        ->first();
    expect($log)->not->toBeNull();
    expect($log->description)->toContain($reservation->reference_code);

    // Notification created
    $notification = Notification::where('user_id', $student->id)
        ->where('title', 'Reservation Cancelled')
        ->first();
    expect($notification)->not->toBeNull();
});

test('student cannot cancel another students reservation', function () {
    $student1 = User::factory()->create(['role' => 'student']);
    $student1->assignRole('Student');

    $student2 = User::factory()->create(['role' => 'student']);
    $student2->assignRole('Student');

    $reservation = Reservation::create([
        'reference_code'     => 'UR-2026-9002',
        'user_id'            => $student1->id,
        'total_amount'       => 300.00,
        'reservation_status' => 'reserved',
        'payment_status'     => 'pending',
        'queue_number'       => 2,
    ]);

    $response = $this->actingAs($student2)
        ->delete(route('reservations.cancel', $reservation));

    $response->assertForbidden();

    $reservation->refresh();
    expect($reservation->reservation_status)->toBe('reserved');
});

test('student cannot cancel already claimed reservation', function () {
    $student = User::factory()->create(['role' => 'student']);
    $student->assignRole('Student');

    $reservation = Reservation::create([
        'reference_code'     => 'UR-2026-9003',
        'user_id'            => $student->id,
        'total_amount'       => 300.00,
        'reservation_status' => 'claimed',
        'payment_status'     => 'paid',
        'queue_number'       => 3,
    ]);

    $response = $this->actingAs($student)
        ->delete(route('reservations.cancel', $reservation));

    // Blocked by policy with 403 or redirect error
    expect($response->status())->toBeIn([403, 302]);

    $reservation->refresh();
    expect($reservation->reservation_status)->toBe('claimed');
});

test('student cannot cancel already cancelled reservation', function () {
    $student = User::factory()->create(['role' => 'student']);
    $student->assignRole('Student');

    $reservation = Reservation::create([
        'reference_code'     => 'UR-2026-9004',
        'user_id'            => $student->id,
        'total_amount'       => 300.00,
        'reservation_status' => 'cancelled',
        'payment_status'     => 'pending',
        'queue_number'       => 4,
        'cancelled_at'       => now(),
    ]);

    $response = $this->actingAs($student)
        ->delete(route('reservations.cancel', $reservation));

    expect($response->status())->toBeIn([403, 302]);
});

test('cancellation preserves payment records and decrements subsequent queue entries', function () {
    $student = User::factory()->create(['role' => 'student']);
    $student->assignRole('Student');

    $otherStudent = User::factory()->create(['role' => 'student']);
    $otherStudent->assignRole('Student');

    $res1 = Reservation::create([
        'reference_code'     => 'UR-2026-9005',
        'user_id'            => $student->id,
        'total_amount'       => 500.00,
        'reservation_status' => 'pending_payment',
        'payment_status'     => 'paid',
        'queue_number'       => 1,
    ]);

    $payment = Payment::create([
        'reservation_id' => $res1->id,
        'receipt_number' => 'OR-99999',
        'amount'         => 500.00,
        'payment_method' => 'cash',
        'payment_date'   => now(),
    ]);

    $q1 = QueueEntry::create([
        'reservation_id' => $res1->id,
        'queue_position' => 1,
        'status'         => 'waiting',
    ]);

    $res2 = Reservation::create([
        'reference_code'     => 'UR-2026-9006',
        'user_id'            => $otherStudent->id,
        'total_amount'       => 300.00,
        'reservation_status' => 'reserved',
        'payment_status'     => 'pending',
        'queue_number'       => 2,
    ]);

    $q2 = QueueEntry::create([
        'reservation_id' => $res2->id,
        'queue_position' => 2,
        'status'         => 'waiting',
    ]);

    // Student cancels reservation 1
    $this->actingAs($student)
        ->delete(route('reservations.cancel', $res1))
        ->assertRedirect(route('reservations.index'));

    // Payment record preserved
    expect(Payment::find($payment->id))->not->toBeNull();
    expect($res1->fresh()->payments()->count())->toBe(1);

    // Queue entry 1 cancelled
    expect($q1->fresh()->status)->toBe('cancelled');

    // Subsequent waiting queue entry decremented to preserve FCFS without gaps
    expect($q2->fresh()->queue_position)->toBe(1);
});
