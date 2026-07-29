<?php

namespace App\Console\Commands;

use App\Support\DefaultRolePermissions;
use Illuminate\Console\Command;

class SyncDefaultRolePermissions extends Command
{
    protected $signature = 'permissions:sync-defaults';

    protected $description = 'Create missing permissions and assign default permissions to all roles';

    public function handle(): int
    {
        DefaultRolePermissions::assignAllRoles();

        $this->info('Default role permissions synced successfully.');

        return self::SUCCESS;
    }
}
