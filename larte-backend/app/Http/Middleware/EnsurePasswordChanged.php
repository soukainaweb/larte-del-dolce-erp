<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePasswordChanged
{
    /** @var list<array{method: string, path: string}> */
    private const ALLOWED_ROUTES = [
        ['method' => 'POST', 'path' => 'api/logout'],
        ['method' => 'GET', 'path' => 'api/user'],
        ['method' => 'PUT', 'path' => 'api/profile/password'],
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user?->must_change_password) {
            return $next($request);
        }

        $path = $request->path();
        $method = strtoupper($request->method());

        foreach (self::ALLOWED_ROUTES as $route) {
            if ($route['method'] === $method && $route['path'] === $path) {
                return $next($request);
            }
        }

        return response()->json([
            'success' => false,
            'message' => 'يجب تغيير كلمة المرور قبل المتابعة.',
            'errors' => [
                'must_change_password' => ['يجب تغيير كلمة المرور قبل المتابعة.'],
            ],
        ], 403);
    }
}
