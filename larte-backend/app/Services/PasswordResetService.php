<?php

namespace App\Services;

use App\Models\User;
use App\Support\UserStatus;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class PasswordResetService
{
    public function sendResetLink(string $email): bool
    {
        $normalizedEmail = mb_strtolower(trim($email));
        $user = User::query()
            ->whereRaw('LOWER(email) = ?', [$normalizedEmail])
            ->whereNotIn('status', UserStatus::blockedForLogin())
            ->first();

        if (! $user) {
            return false;
        }

        $token = Str::random(64);
        $table = config('auth.passwords.users.table', 'password_reset_tokens');

        DB::table($table)->updateOrInsert(
            ['email' => $user->email],
            [
                'token' => Hash::make($token),
                'created_at' => now(),
            ]
        );

        $user->notify(new ResetPassword($token));

        return true;
    }

    public function resetPassword(string $email, string $token, string $password): bool
    {
        $normalizedEmail = mb_strtolower(trim($email));
        $user = User::query()
            ->whereRaw('LOWER(email) = ?', [$normalizedEmail])
            ->whereNotIn('status', UserStatus::blockedForLogin())
            ->first();

        if (! $user) {
            return false;
        }

        $table = config('auth.passwords.users.table', 'password_reset_tokens');
        $record = DB::table($table)->where('email', $user->email)->first();

        if (! $record || ! Hash::check($token, $record->token)) {
            return false;
        }

        $expiresMinutes = (int) config('auth.passwords.users.expire', 60);
        if ($record->created_at && now()->subMinutes($expiresMinutes)->greaterThan($record->created_at)) {
            return false;
        }

        $user->forceFill([
            'password' => $password,
            'must_change_password' => false,
        ])->save();

        DB::table($table)->where('email', $user->email)->delete();

        event(new PasswordReset($user));

        return true;
    }
}
