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

class RoleController extends Controller
{
    protected array $systemRoles = ['Super Admin', 'Staff/Admin', 'Student'];

    /**
     * Display role list and permissions assignment.
     */
    public function index(): Response
    {
        $roles = Role::with(['permissions'])
            ->withCount('users')
            ->get()
            ->map(fn($role) => [
                'id'          => $role->id,
                'name'        => $role->name,
                'guard_name'  => $role->guard_name,
                'users_count' => $role->users_count,
                'permissions' => $role->permissions->pluck('name'),
                'is_system'   => in_array($role->name, $this->systemRoles),
                'created_at'  => $role->created_at?->toISOString(),
            ]);

        $permissions = Permission::all(['id', 'name', 'guard_name']);

        return Inertia::render('admin/roles/index', [
            'roles'        => $roles,
            'permissions'  => $permissions,
            'system_roles' => $this->systemRoles,
        ]);
    }

    /**
     * Store a newly created role.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name'          => 'required|string|max:100|unique:roles,name',
            'permissions'   => 'nullable|array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        $role = Role::create([
            'name'       => $request->name,
            'guard_name' => 'web',
        ]);

        if ($request->filled('permissions')) {
            $role->syncPermissions($request->permissions);
        }

        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        AuditLog::create([
            'user_id'     => $request->user()->id,
            'action'      => 'create_role',
            'module'      => 'Role Management',
            'description' => "Created role: {$role->name}",
            'ip_address'  => $request->ip(),
        ]);

        return back()->with('success', "Role '{$role->name}' created successfully.");
    }

    /**
     * Update the specified role and sync permissions.
     */
    public function update(Request $request, Role $role)
    {
        $request->validate([
            'name'          => 'required|string|max:100|unique:roles,name,' . $role->id,
            'permissions'   => 'nullable|array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        // Prevent renaming core system roles
        if (in_array($role->name, $this->systemRoles) && $role->name !== $request->name) {
            return back()->withErrors(['error' => "System role '{$role->name}' cannot be renamed."]);
        }

        $role->update(['name' => $request->name]);

        if ($request->has('permissions')) {
            $role->syncPermissions($request->permissions ?? []);
        }

        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        AuditLog::create([
            'user_id'     => $request->user()->id,
            'action'      => 'update_role',
            'module'      => 'Role Management',
            'description' => "Updated role: {$role->name} permissions",
            'ip_address'  => $request->ip(),
        ]);

        return back()->with('success', "Role '{$role->name}' updated successfully.");
    }

    /**
     * Remove the specified role from storage.
     */
    public function destroy(Role $role)
    {
        if (in_array($role->name, $this->systemRoles)) {
            return back()->withErrors(['error' => "Core system role '{$role->name}' cannot be deleted."]);
        }

        if ($role->users()->count() > 0) {
            return back()->withErrors(['error' => "Cannot delete role '{$role->name}' because it has assigned users."]);
        }

        $roleName = $role->name;
        $role->delete();

        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        AuditLog::create([
            'user_id'     => auth()->id(),
            'action'      => 'delete_role',
            'module'      => 'Role Management',
            'description' => "Deleted role: {$roleName}",
            'ip_address'  => request()->ip(),
        ]);

        return back()->with('success', "Role '{$roleName}' deleted successfully.");
    }

    /**
     * Sync permissions to a specific role.
     */
    public function syncPermissions(Request $request, Role $role)
    {
        $request->validate([
            'permissions'   => 'nullable|array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        $role->syncPermissions($request->permissions ?? []);
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        AuditLog::create([
            'user_id'     => $request->user()->id,
            'action'      => 'sync_permissions',
            'module'      => 'Role Management',
            'description' => "Updated permissions for role: {$role->name}",
            'ip_address'  => $request->ip(),
        ]);

        return back()->with('success', "Permissions updated for role '{$role->name}'.");
    }
}
