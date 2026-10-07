<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class AdminUserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::query()
            ->when($request->search, fn($q) => $q->where('name', 'like', '%' . $request->search . '%')
                ->orWhere('email', 'like', '%' . $request->search . '%'))
            ->when($request->role, fn($q) => $q->where('role', $request->role))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/users/index', [
            'users'   => $users,
            'filters' => $request->only(['search', 'role']),
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/users/create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'           => 'required|string|max:255',
            'email'          => 'required|email|unique:users,email',
            'password'       => 'required|string|min:8|confirmed',
            'role'           => 'required|in:student,staff,admin',
            'student_id'     => 'nullable|string|unique:users,student_id',
            'phone'          => 'nullable|string',
            'course_program' => 'nullable|string',
            'year_level'     => 'nullable|string',
        ]);

        User::create([
            'name'           => $request->name,
            'email'          => $request->email,
            'password'       => Hash::make($request->password),
            'role'           => $request->role,
            'student_id'     => $request->student_id,
            'phone'          => $request->phone,
            'course_program' => $request->course_program,
            'year_level'     => $request->year_level,
            'status'         => 'active',
        ]);

        return redirect()->route('admin.users.index')
            ->with('success', 'User created successfully.');
    }

    public function edit(User $user)
    {
        return Inertia::render('admin/users/edit', ['user' => $user]);
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name'           => 'required|string|max:255',
            'email'          => 'required|email|unique:users,email,' . $user->id,
            'role'           => 'required|in:student,staff,admin',
            'status'         => 'required|in:active,inactive',
            'phone'          => 'nullable|string',
            'course_program' => 'nullable|string',
            'year_level'     => 'nullable|string',
        ]);

        $user->update($request->only(['name', 'email', 'role', 'status', 'phone', 'course_program', 'year_level']));

        if ($request->filled('password')) {
            $request->validate(['password' => 'min:8|confirmed']);
            $user->update(['password' => Hash::make($request->password)]);
        }

        return redirect()->route('admin.users.index')
            ->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->withErrors(['error' => 'You cannot delete your own account.']);
        }

        $user->update(['status' => 'inactive']);
        return back()->with('success', 'User deactivated.');
    }
}
