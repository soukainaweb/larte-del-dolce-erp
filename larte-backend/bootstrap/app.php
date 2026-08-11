<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\CorsMiddleware;
use App\Http\Middleware\CheckPermission;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->api(prepend: [
            CorsMiddleware::class,
        ]);

        $middleware->alias([
            'permission' => CheckPermission::class,
            'password.changed' => \App\Http\Middleware\EnsurePasswordChanged::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (\Illuminate\Validation\ValidationException $e, $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                $errors = $e->errors();
                $firstMessage = collect($errors)->flatten()->first() ?? 'Validation failed';

                return response()->json([
                    'success' => false,
                    'message' => $firstMessage,
                    'errors' => $errors,
                ], 422);
            }
        });

        $exceptions->render(function (\Illuminate\Http\Exceptions\PostTooLargeException $e, $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                report($e);

                return response()->json([
                    'success' => false,
                    'message' => 'حجم الطلب كبير جداً. يرجى تقليل حجم الصورة والمحاولة مرة أخرى.',
                    'errors' => new \stdClass(),
                ], 413);
            }
        });

        $exceptions->render(function (\Illuminate\Database\QueryException $e, $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                report($e);

                return response()->json([
                    'success' => false,
                    'message' => 'حدث خطأ في الخادم. يرجى المحاولة لاحقاً.',
                    'errors' => new \stdClass(),
                ], 500);
            }
        });

        $exceptions->render(function (\Illuminate\Auth\Access\AuthorizationException $e, $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage() ?: 'Forbidden',
                    'errors' => new \stdClass(),
                ], 403);
            }
        });

        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException $e, $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage() ?: 'Forbidden',
                    'errors' => new \stdClass(),
                ], 403);
            }
        });

        $exceptions->render(function (\Illuminate\Database\Eloquent\ModelNotFoundException $e, $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Resource not found',
                    'errors' => new \stdClass(),
                ], 404);
            }
        });

        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\NotFoundHttpException $e, $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Endpoint not found',
                    'errors' => new \stdClass(),
                ], 404);
            }
        });
    })
    ->create();