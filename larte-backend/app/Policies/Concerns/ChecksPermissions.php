<?php

namespace App\Policies\Concerns;

trait ChecksPermissions
{
    protected function can(string $permission): bool
    {
        return auth()->check() && auth()->user()->hasPermission($permission);
    }
}
