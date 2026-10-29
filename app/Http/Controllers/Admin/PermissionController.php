<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class PermissionController extends Controller
{
    protected array $protectedPermissions = [
        'view dashboard',
        'view uniforms',
        'create reservation',
        'view own reservation',
        'cancel own reservation',
        'view own queue status',
        'use AI reservation assistant',
        'view reservations',
        'manage reservations',
        'view queue',
        'manage queue',
        'manage uniforms',
        'view inventory',
        'manage inventory',
        'view reports',
        'view users',
        'create users',
        'edit users',
        'delete users',
        'view roles',
        'create roles',
        'edit roles',
        'delete roles',
        'assign roles',
        'view permissions',
        'create permissions',
        'edit permissions',
        'delete permissions',
        'promote super admin',
    ];

    /**
     * Display permissions list.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');

        $permissions = Permission::query()
            ->when($search, fn($q) => $q->where('name', 'like', "%{$search}%"))
            ->with('roles')
            ->orderBy('name')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('admin/permissions/index', [
            'permissions'           => $permissions,
            'protected_permissions' => $this->protectedPermissions,
            'filters'               => ['search' => $search],
            'roles'                 => Role::all(['id', 'name']),
        ]);
    }

    /**
     * Store a newly created permission.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name'  => 'required|string|max:100|unique:permissions,name',
            'roles' => 'nullable|array',
            'roles.*' => 'string|exists:roles,name',
        ]);

        $permission = Permission::create([
            'name'       => strtolower(trim($request->name)),
            'guard_name' => 'web',
        ]);

        if ($request->filled('roles')) {
            $permission->syncRoles($request->roles);
        }

        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        AuditLog::create([
            'user_id'     => $request->user()->id,
            'action'      => 'create_permission',
            'module'      => 'Permission Management',
            'description' => "Created permission: {$permission->name}",
            'ip_address'  => $request->ip(),
        ]);

        return back()->with('success', "Permission '{$permission->name}' created successfully.");
    }

    /**
     * Remove the specified permission from storage.
     */
    public function destroy(Permission $permission)
    {
        if (in_array($permission->name, $this->protectedPermissions)) {
            return back()->withErrors(['error' => "System core permission '{$permission->name}' cannot be deleted."]);
        }

        $name = $permission->name;
        $permission->delete();

        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        AuditLog::create([
            'user_id'     => auth()->id(),
            'action'      => 'delete_permission',
            'module'      => 'Permission Management',
            'description' => "Deleted permission: {$name}",
            'ip_address'  => request()->ip(),
        ]);

        return back()->with('success', "Permission '{$name}' deleted successfully.");
    }
}
