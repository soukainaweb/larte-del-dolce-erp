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
            ['name' => 'employee', 'display_name' => 'Employee', 'description' => 'Basic employee access', 'status' => 'active', 'is_system' => false],
            ['name' => 'delivery', 'display_name' => 'Delivery Driver', 'description' => 'Delivery management', 'status' => 'active', 'is_system' => false],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(
                ['name' => $role['name']],
                $role
            );
        }
    }
}