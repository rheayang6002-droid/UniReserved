<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class SuperAdminController extends Controller
{
    /**
     * Display the Create / Promote Super Admin module.
     */
    public function create(Request $request): Response
    {
        $search = $request->input('search');
        $filterRole = $request->input('role');

        // Current Super Admins
        $superAdmins = User::role('Super Admin')
            ->select(['id', 'name', 'email', 'role', 'status', 'created_at', 'updated_at'])
            ->latest()
            ->get();

        // Eligible users for promotion (not currently Super Admin)
        $eligibleUsers = User::query()
            ->whereDoesntHave('roles', function ($q) {
                $q->where('name', 'Super Admin');
            })
            ->when($search, function ($q) use ($search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('student_id', 'like', "%{$search}%");
                });
            })
            ->when($filterRole, function ($q) use ($filterRole) {
                $q->whereHas('roles', function ($sub) use ($filterRole) {
                    $sub->where('name', $filterRole);
                });
            })
            ->with('roles')
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/super-admin/create', [
            'super_admins'   => $superAdmins,
            'eligible_users' => $eligibleUsers,
            'filters'        => [
                'search' => $search,
                'role'   => $filterRole,
            ],
            'available_roles' => Role::pluck('name'),
        ]);
    }

    /**
     * Promote an eligible user to Super Admin.
     */
    public function promote(Request $request, User $user)
    {
        // 1. Current user must be Super Admin
        abort_unless($request->user()->hasRole('Super Admin'), 403, 'Unauthorized. Only Super Admins can promote users.');

        // 2. Prevent promoting oneself
        if ($user->id === $request->user()->id) {
            return back()->withErrors(['error' => 'You are already a Super Admin.']);
        }

        // 3. User must be active
        if ($user->status !== 'active') {
            return back()->withErrors(['error' => 'Cannot promote an inactive user account.']);
        }

        // 4. Target user must not already be Super Admin
        if ($user->hasRole('Super Admin')) {
            return back()->withErrors(['error' => 'User is already a Super Admin.']);
        }

        // 5. Promote using Spatie role sync
        $user->syncRoles(['Super Admin']);
        $user->update(['role' => 'admin']);

        // 6. Log audit action
        AuditLog::create([
            'user_id'     => $request->user()->id,
            'action'      => 'promote_super_admin',
            'module'      => 'Super Admin Management',
            'description' => "Promoted {$user->name} ({$user->email}) to Super Admin.",
            'ip_address'  => $request->ip(),
        ]);

        // 7. Send notification to user
        Notification::create([
            'user_id' => $user->id,
            'title'   => 'Promoted to Super Admin',
            'message' => "Congratulations {$user->name}, your account has been promoted to Super Admin by {$request->user()->name}.",
            'type'    => 'system',
        ]);

        return back()->with('success', "{$user->name} ({$user->email}) has been successfully promoted to Super Admin.");
    }

    /**
     * Demote a Super Admin back to Staff/Admin or Student (requires at least 1 remaining Super Admin).
     */
    public function demote(Request $request, User $user)
    {
        abort_unless($request->user()->hasRole('Super Admin'), 403, 'Unauthorized.');

        if ($user->id === $request->user()->id) {
            return back()->withErrors(['error' => 'You cannot demote your own account.']);
        }

        $superAdminCount = User::role('Super Admin')->count();
        if ($superAdminCount <= 1) {
            return back()->withErrors(['error' => 'Cannot demote the sole remaining Super Admin account.']);
        }

        $request->validate([
            'new_role' => 'required|in:Staff/Admin,School Cashier,Cashier,Student',
        ]);

        $newRole = $request->input('new_role');
        $user->syncRoles([$newRole]);
        $columnRole = match ($newRole) {
            'Student' => 'student',
            'School Cashier', 'Cashier' => 'cashier',
            default => 'staff',
        };
        $user->update(['role' => $columnRole]);

        AuditLog::create([
            'user_id'     => $request->user()->id,
            'action'      => 'demote_super_admin',
            'module'      => 'Super Admin Management',
            'description' => "Demoted {$user->name} ({$user->email}) to {$newRole}.",
            'ip_address'  => $request->ip(),
        ]);

        return back()->with('success', "{$user->name} has been reassigned to {$newRole}.");
    }
}
