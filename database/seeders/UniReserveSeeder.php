<?php

namespace Database\Seeders;

use App\Models\AuditLog;
use App\Models\Category;
use App\Models\ClaimingRecord;
use App\Models\Inventory;
use App\Models\Notification;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductSize;
use App\Models\QueueEntry;
use App\Models\Reservation;
use App\Models\ReservationItem;
use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UniReserveSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Seed Users (Admin, Cashier, Students)
        $admin = User::firstOrCreate(
            ['email' => 'admin@dssc.edu.ph'],
            [
                'name' => 'Prof. Arthur Pendelton',
                'password' => Hash::make('Admin@12345'),
                'role' => 'admin',
                'student_id' => null,
                'phone' => '0917-123-4567',
                'course_program' => 'Supply & Asset Management Office',
                'year_level' => 'Staff',
                'status' => 'active',
            ]
        );

        $cashier = User::firstOrCreate(
            ['email' => 'cashier@dssc.edu.ph'],
            [
                'name' => 'Elena Vance',
                'password' => Hash::make('Cashier@12345'),
                'role' => 'cashier',
                'student_id' => null,
                'phone' => '0918-234-5678',
                'course_program' => 'Cashier & Finance Services',
                'year_level' => 'Staff',
                'status' => 'active',
            ]
        );

        $student1 = User::firstOrCreate(
            ['email' => 'student@dssc.edu.ph'],
            [
                'name' => 'Juan Dela Cruz',
                'password' => Hash::make('Student@12345'),
                'role' => 'student',
                'student_id' => '2024-00101',
                'phone' => '0920-345-6789',
                'course_program' => 'BS Information Technology',
                'year_level' => '3rd Year',
                'status' => 'active',
            ]
        );

        $student2 = User::firstOrCreate(
            ['email' => 'maria@dssc.edu.ph'],
            [
                'name' => 'Maria Clara Santos',
                'password' => Hash::make('Student@12345'),
                'role' => 'student',
                'student_id' => '2024-00102',
                'phone' => '0921-456-7890',
                'course_program' => 'Bachelor of Secondary Education',
                'year_level' => '2nd Year',
                'status' => 'active',
            ]
        );

        $student3 = User::firstOrCreate(
            ['email' => 'alex@dssc.edu.ph'],
            [
                'name' => 'Alex Reyes',
                'password' => Hash::make('Student@12345'),
                'role' => 'student',
                'student_id' => '2024-00103',
                'phone' => '0922-567-8901',
                'course_program' => 'BS Business Administration',
                'year_level' => '1st Year',
                'status' => 'active',
            ]
        );

        // 2. Categories
        $catUniform = Category::create([
            'name' => 'School Uniform',
            'slug' => 'school-uniform',
            'description' => 'Official DSSC Academic Uniforms for College Students',
            'icon' => 'Shirt',
            'sort_order' => 1,
        ]);

        $catPE = Category::create([
            'name' => 'PE Uniform',
            'slug' => 'pe-uniform',
            'description' => 'Official DSSC Physical Education Uniforms and Athletic Apparel',
            'icon' => 'Activity',
            'sort_order' => 2,
        ]);

        $catIDLace = Category::create([
            'name' => 'ID Lace',
            'slug' => 'id-lace',
            'description' => 'Official DSSC College Identification Lanyards and Accessories',
            'icon' => 'Tag',
            'sort_order' => 3,
        ]);

        // 3. Products & Sizes & Inventory
        $productsData = [
            [
                'category_id' => $catUniform->id,
                'name' => 'School Uniform Shirt',
                'slug' => 'school-uniform-shirt',
                'description' => 'Official DSSC white collared uniform polo/blouse tailored with premium cotton blend fabric, featuring embroidered college seal on chest pocket.',
                'base_price' => 350.00,
                'gender' => 'unisex',
                'sizes' => [
                    ['size' => 'Small', 'adjustment' => 0, 'total' => 45, 'reserved' => 5],
                    ['size' => 'Medium', 'adjustment' => 0, 'total' => 60, 'reserved' => 12],
                    ['size' => 'Large', 'adjustment' => 20, 'total' => 35, 'reserved' => 8],
                    ['size' => 'XL', 'adjustment' => 40, 'total' => 20, 'reserved' => 4],
                ],
            ],
            [
                'category_id' => $catUniform->id,
                'name' => 'Uniform Pants / Skirt',
                'slug' => 'uniform-pants-skirt',
                'description' => 'Official DSSC dark navy blue formal trousers / pleated skirt tailored with wrinkle-resistant gabardine fabric.',
                'base_price' => 420.00,
                'gender' => 'unisex',
                'sizes' => [
                    ['size' => 'Small', 'adjustment' => 0, 'total' => 30, 'reserved' => 3],
                    ['size' => 'Medium', 'adjustment' => 0, 'total' => 50, 'reserved' => 10],
                    ['size' => 'Large', 'adjustment' => 20, 'total' => 25, 'reserved' => 6],
                    ['size' => 'XL', 'adjustment' => 40, 'total' => 15, 'reserved' => 2],
                ],
            ],
            [
                'category_id' => $catPE->id,
                'name' => 'PE Shirt',
                'slug' => 'pe-shirt',
                'description' => 'Official DSSC breathable dry-fit moisture-wicking athletic t-shirt with royal blue panels and DSSC sports insignia.',
                'base_price' => 320.00,
                'gender' => 'unisex',
                'sizes' => [
                    ['size' => 'Small', 'adjustment' => 0, 'total' => 40, 'reserved' => 6],
                    ['size' => 'Medium', 'adjustment' => 0, 'total' => 55, 'reserved' => 15],
                    ['size' => 'Large', 'adjustment' => 20, 'total' => 30, 'reserved' => 7],
                    ['size' => 'XL', 'adjustment' => 30, 'total' => 18, 'reserved' => 3],
                ],
            ],
            [
                'category_id' => $catPE->id,
                'name' => 'PE Pants / Shorts',
                'slug' => 'pe-pants-shorts',
                'description' => 'Official DSSC athletic track pants with elastic drawstring waistband and embroidered college seal on left thigh.',
                'base_price' => 380.00,
                'gender' => 'unisex',
                'sizes' => [
                    ['size' => 'Small', 'adjustment' => 0, 'total' => 35, 'reserved' => 4],
                    ['size' => 'Medium', 'adjustment' => 0, 'total' => 45, 'reserved' => 8],
                    ['size' => 'Large', 'adjustment' => 20, 'total' => 25, 'reserved' => 5],
                    ['size' => 'XL', 'adjustment' => 30, 'total' => 12, 'reserved' => 1],
                ],
            ],
            [
                'category_id' => $catIDLace->id,
                'name' => 'ID Lace',
                'slug' => 'id-lace',
                'description' => 'Official DSSC royal blue high-density woven lanyard with rubberized seal badge, side-release buckle, and heavy-duty swivel clip.',
                'base_price' => 85.00,
                'gender' => 'unisex',
                'sizes' => [
                    ['size' => 'Standard', 'adjustment' => 0, 'total' => 150, 'reserved' => 25],
                ],
            ],
        ];

        $createdSizes = [];

        foreach ($productsData as $pData) {
            $product = Product::create([
                'category_id' => $pData['category_id'],
                'name' => $pData['name'],
                'slug' => $pData['slug'],
                'description' => $pData['description'],
                'base_price' => $pData['base_price'],
                'gender' => $pData['gender'],
                'is_active' => true,
            ]);

            foreach ($pData['sizes'] as $idx => $sData) {
                $pSize = ProductSize::create([
                    'product_id' => $product->id,
                    'size' => $sData['size'],
                    'price_adjustment' => $sData['adjustment'],
                    'sort_order' => $idx + 1,
                ]);

                Inventory::create([
                    'product_size_id' => $pSize->id,
                    'total_stock' => $sData['total'],
                    'reserved_stock' => $sData['reserved'],
                    'reorder_level' => 10,
                ]);

                $createdSizes[$product->slug . '_' . $sData['size']] = [
                    'product' => $product,
                    'size' => $pSize,
                    'price' => $product->base_price + $sData['adjustment'],
                ];
            }
        }

        // 4. Seed Reservations with FCFS Queues
        // Reservation 1: Juan Dela Cruz - Ready for Claiming (Queue #1)
        $res1 = Reservation::create([
            'reference_code' => 'UR-2026-0001',
            'user_id' => $student1->id,
            'total_amount' => 855.00,
            'payment_status' => 'paid',
            'reservation_status' => 'ready_for_claiming',
            'queue_number' => 1,
            'qr_code_token' => 'UR20260001_DSSC_SECURE_TOKEN',
            'ready_at' => now()->subHours(6),
            'notes' => 'Complete set with ID lace for enrollment requirements.',
        ]);

        ReservationItem::create([
            'reservation_id' => $res1->id,
            'product_id' => $createdSizes['school-uniform-shirt_Medium']['product']->id,
            'product_size_id' => $createdSizes['school-uniform-shirt_Medium']['size']->id,
            'quantity' => 1,
            'unit_price' => 350.00,
            'subtotal' => 350.00,
        ]);

        ReservationItem::create([
            'reservation_id' => $res1->id,
            'product_id' => $createdSizes['uniform-pants-skirt_Medium']['product']->id,
            'product_size_id' => $createdSizes['uniform-pants-skirt_Medium']['size']->id,
            'quantity' => 1,
            'unit_price' => 420.00,
            'subtotal' => 420.00,
        ]);

        ReservationItem::create([
            'reservation_id' => $res1->id,
            'product_id' => $createdSizes['id-lace_Standard']['product']->id,
            'product_size_id' => $createdSizes['id-lace_Standard']['size']->id,
            'quantity' => 1,
            'unit_price' => 85.00,
            'subtotal' => 85.00,
        ]);

        QueueEntry::create([
            'reservation_id' => $res1->id,
            'queue_position' => 1,
            'status' => 'serving',
        ]);

        Payment::create([
            'reservation_id' => $res1->id,
            'cashier_id' => $cashier->id,
            'amount' => 855.00,
            'payment_method' => 'cash',
            'reference_number' => 'CASH-WINDOW-01',
            'receipt_number' => 'OR-2026-0001',
            'payment_date' => now()->subDay(),
            'notes' => 'Paid in full at Admin Cashier Window 1',
        ]);

        Notification::create([
            'user_id' => $student1->id,
            'title' => 'Reservation Ready for Claiming',
            'message' => 'Your reservation UR-2026-0001 is now ready for pick-up at the DSSC Uniform Distribution Center (Queue #1).',
            'type' => 'claiming',
            'is_read' => false,
            'link' => '/student/reservations',
        ]);

        // Reservation 2: Maria Santos - Ready for Claiming (Queue #2)
        $res2 = Reservation::create([
            'reference_code' => 'UR-2026-0002',
            'user_id' => $student2->id,
            'total_amount' => 405.00,
            'payment_status' => 'paid',
            'reservation_status' => 'ready_for_claiming',
            'queue_number' => 2,
            'qr_code_token' => 'UR20260002_DSSC_SECURE_TOKEN',
            'ready_at' => now()->subHours(4),
            'notes' => 'Paid via GCash.',
        ]);

        ReservationItem::create([
            'reservation_id' => $res2->id,
            'product_id' => $createdSizes['pe-shirt_Medium']['product']->id,
            'product_size_id' => $createdSizes['pe-shirt_Medium']['size']->id,
            'quantity' => 1,
            'unit_price' => 320.00,
            'subtotal' => 320.00,
        ]);

        ReservationItem::create([
            'reservation_id' => $res2->id,
            'product_id' => $createdSizes['id-lace_Standard']['product']->id,
            'product_size_id' => $createdSizes['id-lace_Standard']['size']->id,
            'quantity' => 1,
            'unit_price' => 85.00,
            'subtotal' => 85.00,
        ]);

        QueueEntry::create([
            'reservation_id' => $res2->id,
            'queue_position' => 2,
            'status' => 'waiting',
        ]);

        Payment::create([
            'reservation_id' => $res2->id,
            'cashier_id' => $cashier->id,
            'amount' => 405.00,
            'payment_method' => 'gcash',
            'reference_number' => 'GCASH-987654321',
            'receipt_number' => 'OR-2026-0002',
            'payment_date' => now()->subHours(5),
            'notes' => 'Verified online GCash payment reference',
        ]);

        // Reservation 3: Juan Dela Cruz - Waiting Queue (Queue #3)
        $res3 = Reservation::create([
            'reference_code' => 'UR-2026-0003',
            'user_id' => $student1->id,
            'total_amount' => 740.00,
            'payment_status' => 'pending',
            'reservation_status' => 'reserved',
            'queue_number' => 3,
            'qr_code_token' => 'UR20260003_DSSC_SECURE_TOKEN',
            'notes' => 'Reserved PE uniform for upcoming intramurals.',
        ]);

        ReservationItem::create([
            'reservation_id' => $res3->id,
            'product_id' => $createdSizes['pe-shirt_Large']['product']->id,
            'product_size_id' => $createdSizes['pe-shirt_Large']['size']->id,
            'quantity' => 1,
            'unit_price' => 340.00,
            'subtotal' => 340.00,
        ]);

        ReservationItem::create([
            'reservation_id' => $res3->id,
            'product_id' => $createdSizes['pe-pants-shorts_Large']['product']->id,
            'product_size_id' => $createdSizes['pe-pants-shorts_Large']['size']->id,
            'quantity' => 1,
            'unit_price' => 400.00,
            'subtotal' => 400.00,
        ]);

        QueueEntry::create([
            'reservation_id' => $res3->id,
            'queue_position' => 3,
            'status' => 'waiting',
        ]);

        Notification::create([
            'user_id' => $student1->id,
            'title' => 'Reservation Confirmed (Queue #3)',
            'message' => 'Your reservation UR-2026-0003 has been confirmed. You are Queue #3. Please proceed to payment.',
            'type' => 'queue',
            'is_read' => true,
            'link' => '/student/queue',
        ]);

        // Reservation 4: Alex Reyes - Already Claimed (Queue #4)
        $res4 = Reservation::create([
            'reference_code' => 'UR-2026-0004',
            'user_id' => $student3->id,
            'total_amount' => 700.00,
            'payment_status' => 'paid',
            'reservation_status' => 'claimed',
            'queue_number' => 4,
            'qr_code_token' => 'UR20260004_DSSC_SECURE_TOKEN',
            'ready_at' => now()->subDays(2),
            'claimed_at' => now()->subDay(),
            'notes' => 'Two shirts for regular school days.',
        ]);

        ReservationItem::create([
            'reservation_id' => $res4->id,
            'product_id' => $createdSizes['school-uniform-shirt_Small']['product']->id,
            'product_size_id' => $createdSizes['school-uniform-shirt_Small']['size']->id,
            'quantity' => 2,
            'unit_price' => 350.00,
            'subtotal' => 700.00,
        ]);

        QueueEntry::create([
            'reservation_id' => $res4->id,
            'queue_position' => 4,
            'status' => 'completed',
        ]);

        Payment::create([
            'reservation_id' => $res4->id,
            'cashier_id' => $cashier->id,
            'amount' => 700.00,
            'payment_method' => 'cash',
            'reference_number' => 'CASH-WINDOW-01',
            'receipt_number' => 'OR-2026-0003',
            'payment_date' => now()->subDays(2),
            'notes' => 'Paid in full',
        ]);

        ClaimingRecord::create([
            'reservation_id' => $res4->id,
            'staff_id' => $admin->id,
            'claimed_at' => now()->subDay(),
            'student_signature_notes' => 'Claimed in person with Student ID 2024-00103',
            'remarks' => 'Fit checked and approved by student.',
        ]);

        // 5. System Settings
        SystemSetting::set('school_name', 'Davao del Sur State College (DSSC)', 'general');
        SystemSetting::set('system_title', 'UniReserve: Uniform & Supplies Reservation System', 'general');
        SystemSetting::set('pickup_location', 'DSSC Student Services Building, Ground Floor - Uniform Center', 'operations');
        SystemSetting::set('operating_hours', 'Monday to Friday, 8:00 AM - 5:00 PM', 'operations');
        SystemSetting::set('contact_email', 'supplies@dssc.edu.ph', 'contact');
        SystemSetting::set('contact_phone', '(082) 553-2433', 'contact');

        // 6. Initial Audit Logs
        AuditLog::log('Database Seeded', 'System', 'Initialized UniReserve system with academic uniform catalog and demo accounts.', $admin->id);
        AuditLog::log('Inventory Initialized', 'Inventory', 'Stock loaded for School Uniforms, PE Attire, and ID Laces.', $admin->id);
        AuditLog::log('Reservation Verified', 'Claiming', 'Verified and released reservation UR-2026-0004 to Alex Reyes.', $admin->id);
    }
}
