<?php

namespace App\Console\Commands;

use App\Support\DefaultRolePermissions;
use Illuminate\Console\Command;

class SyncRolePermissionsCommand extends Command
{
    protected $signature = 'erp:sync-role-permissions';

    protected $description = 'Sync built-in role permissions from DefaultRolePermissions (production-safe, idempotent)';

    public function handle(): int
    {
        DefaultRolePermissions::assignAllRoles();
        $this->info('Role permissions synchronized successfully.');

        return self::SUCCESS;
    }
}
