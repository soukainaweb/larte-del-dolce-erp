<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\User;
use App\Models\UserSession;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

class ProfileService
{
    public function getProfile(User $user): User
    {
        return $user->load('role');
    }

    public function updateProfile(User $user, array $data, $avatarFile = null): User
    {
        if ($avatarFile) {
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }

            $data['avatar'] = $avatarFile->store('avatars', 'public');
        }

        $user->update($data);

        return $user->fresh()->load('role');
    }

    public function updateDevice(User $user, string $ip, ?string $userAgent): void
    {
        $data = [
            'last_login_ip' => $ip,
            'last_login_at' => now(),
        ];

        if (Schema::hasColumn('users', 'last_device')) {
            $data['last_device'] = $userAgent;
        }

        $user->update($data);
    }

    public function activity(User $user)
    {
        if (!Schema::hasTable('activity_logs') || !Schema::hasColumn('activity_logs', 'user_id')) {
            return collect();
        }

        return ActivityLog::where('user_id', $user->id)->latest()->get();
    }

    public function sessions(User $user)
    {
        if (!Schema::hasTable('user_sessions') || !Schema::hasColumn('user_sessions', 'user_id')) {
            return collect();
        }

        return UserSession::where('user_id', $user->id)->latest()->get();
    }

    public function uploadAvatar(User $user, $avatarFile): string
    {
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        $path = $avatarFile->store('avatars', 'public');
        $user->update(['avatar' => $path]);

        return $path;
    }

    public function removeAvatar(User $user): void
    {
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
            $user->update(['avatar' => null]);
        }
    }

    public function documents(User $user)
    {
        if (!Schema::hasTable('documents') || !Schema::hasColumn('documents', 'user_id')) {
            return collect();
        }

        return DB::table('documents')->where('user_id', $user->id)->latest()->get();
    }

    public function permissions(User $user): array
    {
        $user->load('role.permissions');

        $permissions = $user->role?->permissions?->pluck('name')->toArray() ?? [];

        return [
            'permissions' => array_fill_keys($permissions, true),
            'role' => $user->role,
        ];
    }

    public function statistics(User $user): array
    {
        $activityCount = 0;
        $sessionCount = 0;

        if (Schema::hasTable('activity_logs') && Schema::hasColumn('activity_logs', 'user_id')) {
            $activityCount = ActivityLog::where('user_id', $user->id)->count();
        }

        if (Schema::hasTable('user_sessions') && Schema::hasColumn('user_sessions', 'user_id')) {
            $sessionCount = UserSession::where('user_id', $user->id)->count();
        }

        return [
            'activity_count' => $activityCount,
            'session_count' => $sessionCount,
            'profile_completion' => 100,
            'last_login_at' => $user->last_login_at,
            'last_login_ip' => $user->last_login_ip,
        ];
    }
}
