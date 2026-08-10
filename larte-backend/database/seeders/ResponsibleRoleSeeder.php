<?php

namespace Database\Seeders;

use App\Support\EnsureResponsibleSetup;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class ResponsibleRoleSeeder extends Seeder
{
    public function run(): void
    {
        if (! Schema::hasTable('roles') || ! Schema::hasTable('users')) {
            $this->command?->warn('Roles/users tables missing. Run migrations first.');

            return;
        }

        $result = EnsureResponsibleSetup::run();

        if ($result['role_created']) {
            $this->command?->info('Created responsible role.');
        } else {
            $this->command?->info('Responsible role already exists.');
        }

        if ($result['user_created']) {
            $this->command?->info('Created responsible@larte.com user.');
        } else {
            $this->command?->info('responsible@larte.com user already exists.');
        }
    }
}
