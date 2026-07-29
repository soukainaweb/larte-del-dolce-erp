<?php

namespace App\Policies\Concerns;

use App\Support\DefaultRolePermissions;

trait ChecksPermissions
{
    protected function can(string $permission): bool
    {
        if (!auth()->check()) {
            return false;
        }

        if (DefaultRolePermissions::isBaselinePermission($permission)) {
            return true;
        }

        return auth()->user()->hasPermission($permission);
    }
}
