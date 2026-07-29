<?php

namespace App\Http\Middleware;

use App\Support\DefaultRolePermissions;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if (DefaultRolePermissions::isBaselinePermission($permission)) {
            return $next($request);
        }

        if (!$user->hasPermission($permission)) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden. Missing permission: ' . $permission,
            ], 403);
        }

        return $next($request);
    }
}
