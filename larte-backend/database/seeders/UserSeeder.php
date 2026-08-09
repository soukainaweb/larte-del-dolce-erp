<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::where('name', 'admin')->first();

        User::updateOrCreate(
            [
                'email' => 'madina7ali7@gmail.com'
            ],
            [
                'first_name' => 'مدينه',
                'last_name' => 'محمد علي',

                'password' => '123456',

                'role_id' => $adminRole->id,

                'status' => 'online',
            ]
        );


        $managerRole = Role::where('name', 'manager')->first();

        User::updateOrCreate(
            [
                'email' => 'manager@larte.com'
            ],
            [
                'first_name' => 'Manager',
                'last_name' => 'User',

                'password' => '123456',

                'role_id' => $managerRole->id,

                'status' => 'online',
            ]
        );

        $accountantRole = Role::where('name', 'accountant')->first();
        if ($accountantRole) {
            User::updateOrCreate(
                ['email' => 'accountant@larte.com'],
                [
                    'first_name' => 'Accountant',
                    'last_name' => 'User',
                    'password' => '123456',
                    'role_id' => $accountantRole->id,
                    'status' => 'online',
                ]
            );
        }

        $responsibleRole = Role::where('name', 'responsible')->first();
        if ($responsibleRole) {
            User::updateOrCreate(
                ['email' => 'responsible@larte.com'],
                [
                    'first_name' => 'Responsible',
                    'last_name' => 'User',
                    'password' => '123456',
                    'role_id' => $responsibleRole->id,
                    'status' => 'online',
                ]
            );
        }
    }
}