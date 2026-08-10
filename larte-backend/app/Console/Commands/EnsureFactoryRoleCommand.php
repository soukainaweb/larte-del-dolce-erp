<?php

namespace App\Console\Commands;

use App\Support\EnsureFactorySetup;
use Illuminate\Console\Command;

class EnsureFactoryRoleCommand extends Command
{
    protected $signature = 'erp:ensure-factory
                            {--password= : Initial password when creating the user (ignored if user exists)}';

    protected $description = 'Create the factory role and factory@larte.com user if missing (production-safe, idempotent)';

    public function handle(): int
    {
        $password = $this->option('password');

        $result = EnsureFactorySetup::run($password !== null && $password !== '' ? (string) $password : null);

        $role = $result['role'];
        $user = $result['user'];

        $this->info($result['role_created'] ? 'Created factory role.' : 'Factory role already exists.');
        $this->info($result['user_created'] ? 'Created factory@larte.com user.' : 'factory@larte.com user already exists.');
        $this->line("Role ID: {$role->id} (name: {$role->name})");
        $this->line("User ID: {$user->id} (email: {$user->email}, role_id: {$user->role_id})");

        return self::SUCCESS;
    }
}
