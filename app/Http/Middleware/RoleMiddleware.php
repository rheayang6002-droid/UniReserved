<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (!$request->user()) {
            return redirect()->route('login');
        }

        $user = $request->user();

        // Super Admin has universal access
        if (method_exists($user, 'hasRole') && $user->hasRole('Super Admin')) {
            return $next($request);
        }

        // Support pipe (|) or comma (,) separated role strings
        $rolesList = [];
        foreach ($roles as $roleGroup) {
            foreach (preg_split('/[,|]/', $roleGroup) as $r) {
                $trimmed = trim($r);
                if ($trimmed !== '') {
                    $rolesList[] = $trimmed;
                }
            }
        }

        foreach ($rolesList as $role) {
            if (method_exists($user, 'hasRole') && $user->hasRole($role)) {
                return $next($request);
            }

            $lower = strtolower($role);
            if ($lower === 'student' && method_exists($user, 'hasRole') && $user->hasRole('Student')) {
                return $next($request);
            }
            if (($lower === 'admin' || $lower === 'staff' || $lower === 'staff/admin') && method_exists($user, 'hasRole') && ($user->hasRole('Staff/Admin') || $user->hasRole('Super Admin'))) {
                return $next($request);
            }
            if (($lower === 'cashier' || $lower === 'school cashier') && method_exists($user, 'hasRole') && ($user->hasRole('School Cashier') || $user->hasRole('Cashier'))) {
                return $next($request);
            }

            // Fallback to model's role attribute
            if (isset($user->role) && strtolower($user->role) === $lower) {
                return $next($request);
            }
        }

        abort(403, 'You do not have permission to access this area.');
    }
}
