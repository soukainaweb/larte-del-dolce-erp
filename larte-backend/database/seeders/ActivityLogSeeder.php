<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class ActivityLogSeeder extends Seeder
{
    public function run(): void
    {
        if (ActivityLog::query()->exists()) {
            return;
        }

        $users = User::all();

        if ($users->isEmpty()) {
            return;
        }

        $admin = $users->first();

        $entries = [
            ['module' => 'auth', 'action' => 'login', 'description' => 'User logged in successfully', 'level' => 'info', 'status' => 'success'],
            ['module' => 'auth', 'action' => 'logout', 'description' => 'User logged out', 'level' => 'info', 'status' => 'success'],
            ['module' => 'orders', 'action' => 'created', 'description' => 'New order created', 'level' => 'info', 'status' => 'success'],
            ['module' => 'orders', 'action' => 'updated', 'description' => 'Order status updated', 'level' => 'info', 'status' => 'success'],
            ['module' => 'products', 'action' => 'created', 'description' => 'Product added to catalog', 'level' => 'info', 'status' => 'success'],
            ['module' => 'products', 'action' => 'updated', 'description' => 'Product details updated', 'level' => 'info', 'status' => 'success'],
            ['module' => 'customers', 'action' => 'created', 'description' => 'New customer registered', 'level' => 'info', 'status' => 'success'],
            ['module' => 'invoices', 'action' => 'created', 'description' => 'Invoice generated', 'level' => 'info', 'status' => 'success'],
            ['module' => 'users', 'action' => 'updated', 'description' => 'User profile updated', 'level' => 'info', 'status' => 'success'],
            ['module' => 'settings', 'action' => 'updated', 'description' => 'System settings updated', 'level' => 'warning', 'status' => 'success'],
            ['module' => 'auth', 'action' => 'login_failed', 'description' => 'Failed login attempt', 'level' => 'error', 'status' => 'failed'],
            ['module' => 'inventory', 'action' => 'updated', 'description' => 'Stock level adjusted', 'level' => 'warning', 'status' => 'success'],
            ['module' => 'production', 'action' => 'created', 'description' => 'Production batch started', 'level' => 'info', 'status' => 'success'],
            ['module' => 'reports', 'action' => 'export', 'description' => 'Report exported to PDF', 'level' => 'info', 'status' => 'success'],
            ['module' => 'roles', 'action' => 'updated', 'description' => 'Role permissions modified', 'level' => 'critical', 'status' => 'success'],
        ];

        foreach ($entries as $index => $entry) {
            $user = $users[$index % $users->count()];

            ActivityLog::create([
                'user_id' => $user->id,
                'module' => $entry['module'],
                'action' => $entry['action'],
                'description' => $entry['description'],
                'level' => $entry['level'],
                'status' => $entry['status'],
                'ip_address' => '127.0.0.1',
                'created_at' => Carbon::now()->subHours($index * 3),
                'updated_at' => Carbon::now()->subHours($index * 3),
            ]);
        }

        ActivityLogger::log(
            module: 'auth',
            action: 'login',
            description: 'Seeded admin login event',
            level: 'info',
            status: 'success',
            userId: $admin->id,
            ip: '127.0.0.1',
        );
    }
}
