<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::where('name', 'admin')->first();

        User::updateOrCreate(
            ['email' => 'madina7ali7@gmail.com'],
            [
                'name' => 'مدينه محمد علي',
                'password' => Hash::make('123456'),
                'role_id' => $adminRole->id,
                'status' => 'active',
            ]
        );

        User::updateOrCreate(
            ['email' => 'manager@larte.com'],
            [
                'name' => 'Manager User',
                'password' => Hash::make('123456'),
                'role_id' => Role::where('name', 'manager')->first()->id,
                'status' => 'active',
            ]
        );
    }
}