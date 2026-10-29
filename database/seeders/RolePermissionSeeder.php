<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Define all permissions
        $permissions = [
            // General
            'view dashboard',

            // Student
            'view uniforms',
            'create reservation',
            'view own reservation',
            'cancel own reservation',
            'view own queue status',
            'use AI reservation assistant',

            // Staff/Admin
            'view reservations',
            'manage reservations',
            'view queue',
            'manage queue',
            'manage uniforms',
            'view inventory',
            'manage inventory',
            'view reports',

            // Users
            'view users',
            'create users',
            'edit users',
            'delete users',

            // Roles
            'view roles',
            'create roles',
            'edit roles',
            'delete roles',
            'assign roles',

            // Permissions
            'view permissions',
            'create permissions',
            'edit permissions',
            'delete permissions',

            // Super Admin Promotion
            'promote super admin',

            // School Cashier
            'view payments',
            'record payments',
            'view receipts',
        ];

        foreach ($permissions as $permissionName) {
            Permission::firstOrCreate(['name' => $permissionName, 'guard_name' => 'web']);
        }

        // 2. Create Roles
        $studentRole = Role::firstOrCreate(['name' => 'Student', 'guard_name' => 'web']);
        $staffAdminRole = Role::firstOrCreate(['name' => 'Staff/Admin', 'guard_name' => 'web']);
        $schoolCashierRole = Role::firstOrCreate(['name' => 'School Cashier', 'guard_name' => 'web']);
        $cashierRole = Role::firstOrCreate(['name' => 'Cashier', 'guard_name' => 'web']);
        $superAdminRole = Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'web']);

        // 3. Assign Permissions to Roles
        $studentPermissions = [
            'view dashboard',
            'view uniforms',
            'create reservation',
            'view own reservation',
            'cancel own reservation',
            'view own queue status',
            'use AI reservation assistant',
        ];
        $studentRole->syncPermissions($studentPermissions);

        $staffAdminPermissions = [
            'view dashboard',
            'view reservations',
            'manage reservations',
            'view queue',
            'manage queue',
            'view uniforms',
            'manage uniforms',
            'view inventory',
            'manage inventory',
            'view reports',
        ];
        $staffAdminRole->syncPermissions($staffAdminPermissions);

        $cashierPermissions = [
            'view dashboard',
            'view payments',
            'record payments',
            'view receipts',
        ];
        $schoolCashierRole->syncPermissions($cashierPermissions);
        $cashierRole->syncPermissions($cashierPermissions);

        // Super Admin gets all permissions
        $superAdminRole->syncPermissions(Permission::all());

        // 4. Synchronize existing users with Spatie roles
        $adminUser = User::where('email', 'admin@dssc.edu.ph')->first();
        if ($adminUser) {
            $adminUser->syncRoles([$superAdminRole]);
            $adminUser->update(['role' => 'admin']);
        }

        $cashierUser = User::where('email', 'cashier@dssc.edu.ph')->first();
        if ($cashierUser) {
            $cashierUser->syncRoles([$schoolCashierRole]);
            $cashierUser->update(['role' => 'cashier']);
        }

        $staffUser = User::firstOrCreate(
            ['email' => 'staff@dssc.edu.ph'],
            [
                'name' => 'BEO Officer Roland',
                'password' => Hash::make('Staff@12345'),
                'role' => 'staff',
                'student_id' => null,
                'phone' => '0919-876-5432',
                'course_program' => 'Business Enterprise Office (BEO)',
                'year_level' => 'Staff',
                'status' => 'active',
            ]
        );
        $staffUser->syncRoles([$staffAdminRole]);
        $staffUser->update(['role' => 'staff']);

        $students = User::whereNotIn('email', ['admin@dssc.edu.ph', 'cashier@dssc.edu.ph', 'staff@dssc.edu.ph'])->get();
        foreach ($students as $student) {
            if (!$student->hasAnyRole(['Super Admin', 'Staff/Admin', 'School Cashier', 'Cashier'])) {
                $student->syncRoles([$studentRole]);
                $student->update(['role' => 'student']);
            }
        }
    }
}
