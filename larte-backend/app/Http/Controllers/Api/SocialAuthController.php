<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SocialAuthService;
use Illuminate\Http\Request;
use Throwable;

class SocialAuthController extends Controller
{
    public function __construct(private SocialAuthService $socialAuthService)
    {
    }

    public function redirect(string $provider)
    {
        try {
            return $this->socialAuthService->redirect($provider);
        } catch (Throwable $e) {
            return $this->redirectToFrontendWithError($e->getMessage());
        }
    }

    public function callback(string $provider, Request $request)
    {
        if ($request->filled('error')) {
            return $this->redirectToFrontendWithError(
                (string) $request->input('error_description', $request->input('error'))
            );
        }

        try {
            $result = $this->socialAuthService->authenticate($provider, $request->ip());

            return $this->redirectToFrontendWithToken($result['token']);
        } catch (Throwable $e) {
            return $this->redirectToFrontendWithError($e->getMessage());
        }
    }

    public function providers()
    {
        return $this->success([
            'google' => $this->socialAuthService->isConfigured('google'),
            'apple' => $this->socialAuthService->isConfigured('apple'),
        ]);
    }

    private function redirectToFrontendWithToken(string $token)
    {
        $url = rtrim((string) config('app.frontend_url'), '/') . '/auth/callback';

        return redirect($url . '?' . http_build_query(['token' => $token]));
    }

    private function redirectToFrontendWithError(string $message)
    {
        $url = rtrim((string) config('app.frontend_url'), '/') . '/auth/callback';

        return redirect($url . '?' . http_build_query(['error' => $message]));
    }
}
