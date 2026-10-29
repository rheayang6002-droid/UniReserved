<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'role' => \App\Http\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        // Render modern Inertia error page for HTTP exceptions (403, 404, 500, 503)
        // This only triggers for Inertia (SPA) requests; plain browser visits fall back to Blade
        $exceptions->respond(function (\Symfony\Component\HttpFoundation\Response $response, \Throwable $exception, Request $request) {
            $status = $response->getStatusCode();

            if (
                in_array($status, [403, 404, 500, 503])
                && ! $request->is('api/*')
                && ! $request->expectsJson()
                && $request->header('X-Inertia')
            ) {
                $message = $exception->getMessage() ?: match ($status) {
                    403 => "You don't have permission to access this page. Please log in with an authorized account or create an account to continue.",
                    404 => 'The page you are looking for could not be found.',
                    500 => 'An unexpected server error occurred. Please try again later.',
                    503 => 'The service is temporarily unavailable. Please try again in a few minutes.',
                    default => 'An error occurred.',
                };

                return \Inertia\Inertia::render('error', [
                    'status'  => $status,
                    'message' => $message,
                ])->toResponse($request)->setStatusCode($status);
            }

            return $response;
        });
    })->create();
