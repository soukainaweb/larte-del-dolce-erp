<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Models\User;
use App\Services\ActivityLogger;
use App\Support\UserStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    private const INVALID_CREDENTIALS_MESSAGE = 'بيانات الاعتماد غير صحيحة';

    private const BLOCKED_ACCOUNT_MESSAGE = 'حسابك معطل أو موقوف. يرجى التواصل مع المسؤول.';

    public function login(LoginRequest $request)
    {
        $credentials = $request->validated();
        $email = mb_strtolower($credentials['email']);

        $user = User::query()
            ->whereRaw('LOWER(email) = ?', [$email])
            ->first();

        if (! $user || ! Hash::check($credentials['password'], $user->getAuthPassword())) {
            $this->logAuthEvent(
                action: 'login_failed',
                description: 'Failed login attempt for ' . ($credentials['email'] ?? 'unknown'),
                level: 'warning',
                status: 'failed',
                userId: $user?->id,
                ip: $request->ip(),
            );

            throw ValidationException::withMessages([
                'email' => [self::INVALID_CREDENTIALS_MESSAGE],
            ]);
        }

        if (! UserStatus::canAuthenticate($user->status)) {
            $this->logAuthEvent(
                action: 'login_blocked',
                description: 'Blocked login for user #' . $user->id . ' (status: ' . $user->status . ')',
                level: 'warning',
                status: 'failed',
                userId: $user->id,
                ip: $request->ip(),
            );

            throw ValidationException::withMessages([
                'email' => [self::BLOCKED_ACCOUNT_MESSAGE],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        $user->markOnline($request->ip());

        $this->logAuthEvent(
            action: 'login',
            description: 'User logged in successfully',
            level: 'info',
            status: 'success',
            userId: $user->id,
            ip: $request->ip(),
        );

        return $this->success([
            'user' => $user->fresh()->load('role.permissions'),
            'token' => $token,
        ], 'Connexion réussie');
    }

    public function logout(Request $request)
    {
        $user = $request->user();

        $this->logAuthEvent(
            action: 'logout',
            description: 'User logged out',
            level: 'info',
            status: 'success',
            userId: $user?->id,
            ip: $request->ip(),
        );

        $request->user()->currentAccessToken()->delete();
        $user?->markOffline();

        return $this->success(null, 'Déconnexion réussie');
    }

    public function user(Request $request)
    {
        return $this->success([
            'user' => $request->user()->load('role.permissions'),
        ]);
    }

    public function forgotPassword(ForgotPasswordRequest $request)
    {
        $status = Password::sendResetLink($request->only('email'));

        if ($status !== Password::RESET_LINK_SENT) {
            return $this->error(__($status), [], 422);
        }

        $this->logAuthEvent(
            action: 'password_reset_requested',
            description: 'Password reset link requested for ' . $request->input('email'),
            level: 'info',
            status: 'success',
            userId: User::where('email', $request->input('email'))->value('id'),
            ip: $request->ip(),
        );

        return $this->success(null, 'Reset link sent to your email');
    }

    public function resetPassword(ResetPasswordRequest $request)
    {
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill(['password' => $password])->save();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            return $this->error(__($status), [], 422);
        }

        $this->logAuthEvent(
            action: 'password_reset',
            description: 'Password reset completed for ' . $request->input('email'),
            level: 'info',
            status: 'success',
            userId: User::where('email', $request->input('email'))->value('id'),
            ip: $request->ip(),
        );

        return $this->success(null, 'Password reset successfully');
    }

    /**
     * Log auth events without interrupting the auth response flow.
     */
    private function logAuthEvent(
        string $action,
        string $description,
        string $level,
        string $status,
        ?int $userId,
        ?string $ip,
    ): void {
        ActivityLogger::log(
            module: 'auth',
            action: $action,
            description: $description,
            level: $level,
            status: $status,
            userId: $userId,
            ip: $ip,
        );
    }
}
