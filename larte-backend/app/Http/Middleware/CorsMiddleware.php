<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CorsMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $origin = $this->resolveOrigin($request);

        if ($request->isMethod('OPTIONS')) {
            return response('', 200)
                ->header('Access-Control-Allow-Origin', $origin)
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept')
                ->header('Access-Control-Max-Age', '86400');
        }

        $response = $next($request);

        $response->headers->set('Access-Control-Allow-Origin', $origin);
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
        $response->headers->set('Access-Control-Max-Age', '86400');

        return $response;
    }

    private function resolveOrigin(Request $request): string
    {
        $allowedOrigins = $this->allowedOrigins();
        $requestOrigin = $request->headers->get('Origin');

        if ($requestOrigin && in_array($requestOrigin, $allowedOrigins, true)) {
            return $requestOrigin;
        }

        if (in_array('*', $allowedOrigins, true)) {
            return '*';
        }

        return $allowedOrigins[0] ?? '*';
    }

    /**
     * @return list<string>
     */
    private function allowedOrigins(): array
    {
        $configured = env('CORS_ALLOWED_ORIGINS');

        if ($configured) {
            return array_values(array_filter(array_map('trim', explode(',', $configured))));
        }

        $frontendUrl = env('FRONTEND_URL');

        if ($frontendUrl) {
            return [trim($frontendUrl)];
        }

        return ['*'];
    }
}
