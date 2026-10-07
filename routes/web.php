<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\QueueController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminReservationController;
use App\Http\Controllers\Admin\AdminInventoryController;
use App\Http\Controllers\Admin\AdminQueueController;
use App\Http\Controllers\Admin\AdminPaymentController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AdminReportController;
use App\Http\Controllers\Admin\AdminSettingController;

// Landing page
Route::inertia('/', 'welcome')->name('home');

// Authenticated routes
Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard (role-aware)
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead'])->name('notifications.read-all');

    // Student routes
    Route::middleware(['role:student'])->group(function () {
        // Browse catalog
        Route::get('/items', [ItemController::class, 'index'])->name('items.index');
        Route::get('/items/{product}', [ItemController::class, 'show'])->name('items.show');

        // Reservations
        Route::get('/reservations', [ReservationController::class, 'index'])->name('reservations.index');
        Route::get('/reservations/create', [ReservationController::class, 'create'])->name('reservations.create');
        Route::post('/reservations', [ReservationController::class, 'store'])->name('reservations.store');
        Route::get('/reservations/{reservation}', [ReservationController::class, 'show'])->name('reservations.show');
        Route::delete('/reservations/{reservation}', [ReservationController::class, 'cancel'])->name('reservations.cancel');

        // Queue
        Route::get('/queue', [QueueController::class, 'index'])->name('queue.index');

        // Payments
        Route::get('/payments', [PaymentController::class, 'index'])->name('payments.index');
        Route::get('/payments/{payment}', [PaymentController::class, 'show'])->name('payments.show');
    });

    // Admin & Staff routes
    Route::middleware(['role:admin,staff'])->prefix('admin')->name('admin.')->group(function () {
        // Admin Dashboard
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

        // Reservations management
        Route::get('/reservations', [AdminReservationController::class, 'index'])->name('reservations.index');
        Route::get('/reservations/{reservation}', [AdminReservationController::class, 'show'])->name('reservations.show');
        Route::post('/reservations/{reservation}/approve', [AdminReservationController::class, 'approve'])->name('reservations.approve');
        Route::post('/reservations/{reservation}/reject', [AdminReservationController::class, 'reject'])->name('reservations.reject');
        Route::post('/reservations/{reservation}/ready', [AdminReservationController::class, 'markReady'])->name('reservations.ready');
        Route::post('/reservations/{reservation}/claim', [AdminReservationController::class, 'markClaimed'])->name('reservations.claim');

        // Inventory
        Route::get('/inventory', [AdminInventoryController::class, 'index'])->name('inventory.index');
        Route::get('/inventory/create', [AdminInventoryController::class, 'create'])->name('inventory.create');
        Route::post('/inventory', [AdminInventoryController::class, 'store'])->name('inventory.store');
        Route::get('/inventory/{product}/edit', [AdminInventoryController::class, 'edit'])->name('inventory.edit');
        Route::put('/inventory/{product}', [AdminInventoryController::class, 'update'])->name('inventory.update');
        Route::delete('/inventory/{product}', [AdminInventoryController::class, 'destroy'])->name('inventory.destroy');
        Route::post('/inventory/{productSize}/adjust', [AdminInventoryController::class, 'adjustStock'])->name('inventory.adjust');

        // Queue management
        Route::get('/queue', [AdminQueueController::class, 'index'])->name('queue.index');
        Route::post('/queue/{entry}/process', [AdminQueueController::class, 'process'])->name('queue.process');
        Route::post('/queue/{entry}/skip', [AdminQueueController::class, 'skip'])->name('queue.skip');

        // Payments
        Route::get('/payments', [AdminPaymentController::class, 'index'])->name('payments.index');
        Route::post('/payments/{payment}/verify', [AdminPaymentController::class, 'verify'])->name('payments.verify');
        Route::post('/payments/{payment}/reject', [AdminPaymentController::class, 'reject'])->name('payments.reject');

        // Users (admin only)
        Route::middleware(['role:admin'])->group(function () {
            Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
            Route::get('/users/create', [AdminUserController::class, 'create'])->name('users.create');
            Route::post('/users', [AdminUserController::class, 'store'])->name('users.store');
            Route::get('/users/{user}/edit', [AdminUserController::class, 'edit'])->name('users.edit');
            Route::put('/users/{user}', [AdminUserController::class, 'update'])->name('users.update');
            Route::delete('/users/{user}', [AdminUserController::class, 'destroy'])->name('users.destroy');

            // Reports
            Route::get('/reports', [AdminReportController::class, 'index'])->name('reports.index');
            Route::get('/reports/export', [AdminReportController::class, 'export'])->name('reports.export');

            // Settings
            Route::get('/settings', [AdminSettingController::class, 'index'])->name('settings.index');
            Route::put('/settings', [AdminSettingController::class, 'update'])->name('settings.update');
        });
    });
});

require __DIR__.'/settings.php';
