<?php

namespace App\Support;

use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

/**
 * Idempotent setup for the Factory role and default factory user.
 * Safe to run on production — creates only missing records and never wipes data.
 */
final class EnsureFactorySetup
{
    public const ROLE_NAME = 'factory';

    public const USER_EMAIL = 'factory@larte.com';

    public const DEFAULT_PASSWORD = '123456';

    /**
     * @return array{role: Role, user: User, role_created: bool, user_created: bool}
     */
    public static function run(?string $password = null): array
    {
        $password ??= (string) env('FACTORY_USER_PASSWORD', self::DEFAULT_PASSWORD);

        $role = Role::updateOrCreate(
            ['name' => self::ROLE_NAME],
            [
                'display_name' => 'Factory',
                'description' => 'Factory order processing',
                'status' => 'active',
                'is_system' => false,
            ]
        );

        $permissionIdsByName = DefaultRolePermissions::ensurePermissionsExist();
        DefaultRolePermissions::syncRole($role->fresh(), $permissionIdsByName);

        $userCreated = false;
        $user = User::withTrashed()->where('email', self::USER_EMAIL)->first();

        if (! $user) {
            $user = User::create([
                'email' => self::USER_EMAIL,
                'first_name' => 'Factory',
                'last_name' => 'User',
                'password' => Hash::make($password),
                'role_id' => $role->id,
                'status' => 'online',
                'availability_status' => 'unavailable',
            ]);
            $userCreated = true;
        } else {
            if ($user->trashed()) {
                $user->restore();
            }

            $updates = [];
            if ((int) $user->role_id !== (int) $role->id) {
                $updates['role_id'] = $role->id;
            }
            if ($user->status !== 'online') {
                $updates['status'] = 'online';
            }
            if ($updates !== []) {
                $user->update($updates);
            }
        }

        return [
            'role' => $role->fresh(),
            'user' => $user->fresh(['role']),
            'role_created' => $role->wasRecentlyCreated,
            'user_created' => $userCreated,
        ];
    }
}
