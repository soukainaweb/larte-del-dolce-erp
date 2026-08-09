<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['name' => 'admin', 'display_name' => 'Administrator', 'description' => 'Full access to system', 'status' => 'active', 'is_system' => true],
            ['name' => 'manager', 'display_name' => 'Manager', 'description' => 'Manage operations', 'status' => 'active', 'is_system' => false],
            ['name' => 'accountant', 'display_name' => 'Accountant', 'description' => 'Finance and accounting access', 'status' => 'active', 'is_system' => false],
            ['name' => 'sales', 'display_name' => 'Sales Representative', 'description' => 'Sales and customer management', 'status' => 'active', 'is_system' => false],
            ['name' => 'viewer', 'display_name' => 'Viewer', 'description' => 'Read-only access', 'status' => 'active', 'is_system' => false],
            ['name' => 'delivery', 'display_name' => 'Delivery Driver', 'description' => 'Delivery management', 'status' => 'active', 'is_system' => false],
            ['name' => 'responsible', 'display_name' => 'Responsible', 'description' => 'Final order approval authority', 'status' => 'active', 'is_system' => false],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(
                ['name' => $role['name']],
                $role
            );
        }
    }
}
