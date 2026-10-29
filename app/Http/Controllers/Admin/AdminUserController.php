<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class AdminUserController extends Controller
{
    /**
     * Map friendly/legacy role keys to Spatie role names and db role strings.
     */
    protected function resolveRoleMapping(string $roleInput): array
    {
        $normalized = strtolower(trim($roleInput));

        if (in_array($normalized, ['super admin', 'super_admin'])) {
            return ['spatie' => 'Super Admin', 'column' => 'admin'];
        }
        if (in_array($normalized, ['school cashier', 'cashier'])) {
            return ['spatie' => 'School Cashier', 'column' => 'cashier'];
        }
        if (in_array($normalized, ['staff', 'staff/admin', 'beo staff', 'beo staff / admin', 'admin'])) {
            return ['spatie' => 'Staff/Admin', 'column' => 'staff'];
        }
        return ['spatie' => 'Student', 'column' => 'student'];
    }

    public function index(Request $request)
    {
        $users = User::query()
            ->with('roles')
            ->when($request->search, fn($q) => $q->where(function ($sub) use ($request) {
                $sub->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('email', 'like', '%' . $request->search . '%')
                    ->orWhere('student_id', 'like', '%' . $request->search . '%');
            }))
            ->when($request->role, function ($q) use ($request) {
                $targetRole = $request->role;
                $q->whereHas('roles', fn($sub) => $sub->where('name', $targetRole))
                  ->orWhere('role', $targetRole);
            })
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/users/index', [
            'users'           => $users,
            'filters'         => $request->only(['search', 'role']),
            'available_roles' => Role::pluck('name'),
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/users/create', [
            'available_roles' => Role::pluck('name'),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'           => 'required|string|max:255',
            'email'          => 'required|email|unique:users,email',
            'password'       => 'required|string|min:8|confirmed',
            'role'           => 'required|string',
            'student_id'     => 'nullable|string|unique:users,student_id',
            'phone'          => 'nullable|string',
            'course_program' => 'nullable|string',
            'year_level'     => 'nullable|string',
        ]);

        $roleMapping = $this->resolveRoleMapping($request->role);

        // Only a Super Admin can create another Super Admin
        if ($roleMapping['spatie'] === 'Super Admin' && !$request->user()->hasRole('Super Admin')) {
            abort(403, 'Only Super Admins can create Super Admin accounts.');
        }

        $user = User::create([
            'name'           => $request->name,
            'email'          => $request->email,
            'password'       => Hash::make($request->password),
            'role'           => $roleMapping['column'],
            'student_id'     => $request->student_id,
            'phone'          => $request->phone,
            'course_program' => $request->course_program,
            'year_level'     => $request->year_level,
            'status'         => 'active',
        ]);

        $user->syncRoles([$roleMapping['spatie']]);

        AuditLog::create([
            'user_id'     => $request->user()->id,
            'action'      => 'create_user',
            'module'      => 'User Management',
            'description' => "Created user {$user->name} ({$user->email}) with role {$roleMapping['spatie']}",
            'ip_address'  => $request->ip(),
        ]);

        return redirect()->route('admin.users.index')
            ->with('success', "User '{$user->name}' created successfully with role {$roleMapping['spatie']}.");
    }

    public function edit(User $user)
    {
        $user->load('roles');

        return Inertia::render('admin/users/edit', [
            'user'            => $user,
            'available_roles' => Role::pluck('name'),
        ]);
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name'           => 'required|string|max:255',
            'email'          => 'required|email|unique:users,email,' . $user->id,
            'role'           => 'required|string',
            'status'         => 'required|in:active,inactive',
            'phone'          => 'nullable|string',
            'course_program' => 'nullable|string',
            'year_level'     => 'nullable|string',
        ]);

        $roleMapping = $this->resolveRoleMapping($request->role);

        // Prevent unauthorized Super Admin assignment
        if ($roleMapping['spatie'] === 'Super Admin' && !$request->user()->hasRole('Super Admin')) {
            abort(403, 'Only Super Admins can assign the Super Admin role.');
        }

        // Prevent current user from deactivating or demoting themselves
        if ($user->id === $request->user()->id) {
            if ($request->status === 'inactive') {
                return back()->withErrors(['error' => 'You cannot deactivate your own account.']);
            }
            if ($roleMapping['spatie'] !== 'Super Admin' && $request->user()->hasRole('Super Admin')) {
                return back()->withErrors(['error' => 'You cannot demote your own Super Admin account here.']);
            }
        }

        $user->update([
            'name'           => $request->name,
            'email'          => $request->email,
            'role'           => $roleMapping['column'],
            'status'         => $request->status,
            'phone'          => $request->phone,
            'course_program' => $request->course_program,
            'year_level'     => $request->year_level,
        ]);

        $user->syncRoles([$roleMapping['spatie']]);

        if ($request->filled('password')) {
            $request->validate(['password' => 'min:8|confirmed']);
            $user->update(['password' => Hash::make($request->password)]);
        }

        AuditLog::create([
            'user_id'     => $request->user()->id,
            'action'      => 'update_user',
            'module'      => 'User Management',
            'description' => "Updated user {$user->name} ({$user->email})",
            'ip_address'  => $request->ip(),
        ]);

        return redirect()->route('admin.users.index')
            ->with('success', 'User updated successfully.');
    }

    public function destroy(Request $request, User $user)
    {
        if ($user->id === $request->user()->id) {
            return back()->withErrors(['error' => 'You cannot delete your own account.']);
        }

        if ($user->hasRole('Super Admin') && User::role('Super Admin')->count() <= 1) {
            return back()->withErrors(['error' => 'Cannot delete the sole Super Admin account.']);
        }

        $userName = $user->name;
        $userEmail = $user->email;

        // If user has reservations or payments, deactivate instead of hard delete to preserve historical integrity
        if ($user->reservations()->exists() || $user->payments()->exists()) {
            $user->update(['status' => 'inactive']);
            $message = "User '{$userName}' has historical reservation/payment records and was safely deactivated.";
        } else {
            // Delete test user completely
            $user->roles()->detach();
            $user->delete();
            $message = "Test user '{$userName}' ({$userEmail}) was permanently deleted.";
        }

        AuditLog::create([
            'user_id'     => $request->user()->id,
            'action'      => 'delete_user',
            'module'      => 'User Management',
            'description' => "Deleted/deactivated user {$userName} ({$userEmail})",
            'ip_address'  => $request->ip(),
        ]);

        return back()->with('success', $message);
    }
}
