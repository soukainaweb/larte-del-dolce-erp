<?php

namespace App\Console\Commands;

use App\Support\EnsureResponsibleSetup;
use Illuminate\Console\Command;

class EnsureResponsibleRoleCommand extends Command
{
    protected $signature = 'erp:ensure-responsible
                            {--password= : Initial password when creating the user (ignored if user exists)}';

    protected $description = 'Create the responsible role and responsible@larte.com user if missing (production-safe, idempotent)';

    public function handle(): int
    {
        $password = $this->option('password');

        $result = EnsureResponsibleSetup::run($password !== null && $password !== '' ? (string) $password : null);

        $role = $result['role'];
        $user = $result['user'];

        $this->info($result['role_created'] ? 'Created responsible role.' : 'Responsible role already exists.');
        $this->info($result['user_created'] ? 'Created responsible@larte.com user.' : 'responsible@larte.com user already exists.');
        $this->line("Role ID: {$role->id} (name: {$role->name})");
        $this->line("User ID: {$user->id} (email: {$user->email}, role_id: {$user->role_id})");

        if ((int) $user->role_id !== (int) $role->id) {
            $this->error('User role_id does not match responsible role.');

            return self::FAILURE;
        }

        $this->info('Verification passed: user is linked to the responsible role.');

        return self::SUCCESS;
    }
}
