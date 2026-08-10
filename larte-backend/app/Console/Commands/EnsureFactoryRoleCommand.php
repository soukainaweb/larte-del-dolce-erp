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
        $envPassword = (string) env('FACTORY_USER_PASSWORD', '');

        if ($password === null && $envPassword === '') {
            $this->warn('FACTORY_USER_PASSWORD is not set. A secure random password will be generated for a new user.');
            $this->warn('The password is NOT printed. Set FACTORY_USER_PASSWORD or use --password for controlled provisioning.');
        }

        $result = EnsureFactorySetup::run($password !== null && $password !== '' ? (string) $password : null);

        $role = $result['role'];
        $user = $result['user'];

        $this->info($result['role_created'] ? 'Created factory role.' : 'Factory role already exists.');
        $this->info($result['user_created'] ? 'Created factory@larte.com user (must change password on first login).' : 'factory@larte.com user already exists.');
        $this->line("Role ID: {$role->id} (name: {$role->name})");
        $this->line("User ID: {$user->id} (email: {$user->email}, role_id: {$user->role_id})");

        if ($result['user_created'] && $password !== null && $password !== '') {
            $this->comment('Initial password was supplied via --password or FACTORY_USER_PASSWORD.');
        }

        return self::SUCCESS;
    }
}
