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
    public function login(LoginRequest $request)
    {
        $credentials = $request->validated();
        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            ActivityLogger::log(
                module: 'auth',
                action: 'login_failed',
                description: 'Failed login attempt for ' . ($credentials['email'] ?? 'unknown'),
                level: 'warning',
                status: 'failed',
                userId: $user?->id,
                ip: $request->ip(),
            );

            throw ValidationException::withMessages([
                'email' => ['Les identifiants sont incorrects.'],
            ]);
        }

        if (!UserStatus::canAuthenticate($user->status)) {
            ActivityLogger::log(
                module: 'auth',
                action: 'login_blocked',
                description: 'Blocked login for user #' . $user->id . ' (status: ' . $user->status . ')',
                level: 'warning',
                status: 'failed',
                userId: $user->id,
                ip: $request->ip(),
            );

            throw ValidationException::withMessages([
                'email' => ['Ce compte est désactivé ou suspendu. Contactez un administrateur.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        $user->markOnline($request->ip());

        ActivityLogger::log(
            module: 'auth',
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

        ActivityLogger::log(
            module: 'auth',
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

        ActivityLogger::log(
            module: 'auth',
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
                $user->forceFill(['password' => Hash::make($password)])->save();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            return $this->error(__($status), [], 422);
        }

        ActivityLogger::log(
            module: 'auth',
            action: 'password_reset',
            description: 'Password reset completed for ' . $request->input('email'),
            level: 'info',
            status: 'success',
            ip: $request->ip(),
        );

        return $this->success(null, 'Password reset successfully');
    }
}
