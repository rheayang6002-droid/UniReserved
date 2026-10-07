<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Extend Users table
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('student')->after('email'); // admin, cashier, student
            $table->string('student_id')->nullable()->unique()->after('role'); // e.g. 2024-00101
            $table->string('phone')->nullable()->after('student_id');
            $table->string('course_program')->nullable()->after('phone'); // e.g. BS Information Technology
            $table->string('year_level')->nullable()->after('course_program'); // e.g. 1st Year, 2nd Year...
            $table->string('status')->default('active')->after('year_level'); // active, inactive
            $table->string('avatar')->nullable()->after('status');
        });

        // 2. Categories
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // 3. Products
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('categories')->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->decimal('base_price', 10, 2)->default(0.00);
            $table->string('gender')->default('unisex'); // unisex, male, female
            $table->string('image_path')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 4. Product Sizes
        Schema::create('product_sizes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->string('size'); // Small, Medium, Large, XL, Standard
            $table->decimal('price_adjustment', 10, 2)->default(0.00);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['product_id', 'size']);
        });

        // 5. Inventory
        Schema::create('inventory', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_size_id')->unique()->constrained('product_sizes')->cascadeOnDelete();
            $table->integer('total_stock')->default(0);
            $table->integer('reserved_stock')->default(0);
            $table->integer('reorder_level')->default(5);
            $table->timestamps();
        });

        // 6. Reservations
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->string('reference_code')->unique(); // e.g. UR-2026-0001
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('total_amount', 10, 2)->default(0.00);
            $table->string('payment_status')->default('pending'); // pending, paid, partially_paid, cancelled
            $table->string('reservation_status')->default('reserved'); // reserved, pending_payment, paid, preparing, ready_for_claiming, claimed, cancelled
            $table->integer('queue_number')->default(1)->index();
            $table->string('qr_code_token')->nullable();
            $table->timestamp('ready_at')->nullable();
            $table->timestamp('claimed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 7. Reservation Items
        Schema::create('reservation_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reservation_id')->constrained('reservations')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products');
            $table->foreignId('product_size_id')->constrained('product_sizes');
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price', 10, 2)->default(0.00);
            $table->decimal('subtotal', 10, 2)->default(0.00);
            $table->timestamps();
        });

        // 8. Queue Entries
        Schema::create('queue_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reservation_id')->constrained('reservations')->cascadeOnDelete();
            $table->integer('queue_position')->default(1);
            $table->string('status')->default('waiting'); // waiting, serving, completed, cancelled
            $table->timestamps();
        });

        // 9. Payments
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reservation_id')->constrained('reservations')->cascadeOnDelete();
            $table->foreignId('cashier_id')->nullable()->constrained('users')->nullOnDelete();
            $table->decimal('amount', 10, 2)->default(0.00);
            $table->string('payment_method')->default('cash'); // cash, gcash, bank_transfer
            $table->string('reference_number')->nullable();
            $table->string('receipt_number')->unique();
            $table->timestamp('payment_date')->useCurrent();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 10. Claiming Records
        Schema::create('claiming_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reservation_id')->unique()->constrained('reservations')->cascadeOnDelete();
            $table->foreignId('staff_id')->constrained('users');
            $table->timestamp('claimed_at')->useCurrent();
            $table->text('student_signature_notes')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();
        });

        // 11. Notifications
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('message');
            $table->string('type')->default('system'); // queue, payment, claiming, system
            $table->boolean('is_read')->default(false);
            $table->string('link')->nullable();
            $table->timestamps();
        });

        // 12. Audit Logs
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action');
            $table->string('module');
            $table->text('description');
            $table->string('ip_address')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        // 13. System Settings
        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('group')->default('general');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_settings');
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('claiming_records');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('queue_entries');
        Schema::dropIfExists('reservation_items');
        Schema::dropIfExists('reservations');
        Schema::dropIfExists('inventory');
        Schema::dropIfExists('product_sizes');
        Schema::dropIfExists('products');
        Schema::dropIfExists('categories');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'role',
                'student_id',
                'phone',
                'course_program',
                'year_level',
                'status',
                'avatar',
            ]);
        });
    }
};
