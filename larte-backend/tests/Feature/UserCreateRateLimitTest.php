<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class UserCreateRateLimitTest extends TestCase
{
    use RefreshDatabase;

    protected function adminUser(): User
    {
        return User::where('email', 'madina7ali7@gmail.com')->firstOrFail();
    }

    public function test_legitimate_consecutive_user_creation_requests_succeed(): void
    {
        $this->seed();

        $admin = $this->adminUser();
        $salesRole = Role::where('name', 'sales')->firstOrFail();
        $accountantRole = Role::where('name', 'accountant')->firstOrFail();

        $first = $this->actingAs($admin, 'sanctum')->postJson('/api/users', [
            'first_name' => 'First',
            'last_name' => 'User',
            'email' => 'first.user@example.com',
            'role_id' => $salesRole->id,
            'status' => 'active',
        ]);

        $second = $this->actingAs($admin, 'sanctum')->postJson('/api/users', [
            'first_name' => 'Second',
            'last_name' => 'User',
            'email' => 'second.user@example.com',
            'role_id' => $accountantRole->id,
            'status' => 'active',
        ]);

        $first->assertCreated();
        $second->assertCreated();
    }

    public function test_users_create_rate_limiter_blocks_excessive_requests(): void
    {
        $this->seed();

        $admin = $this->adminUser();
        $salesRole = Role::where('name', 'sales')->firstOrFail();
        RateLimiter::clear('users-create');

        for ($i = 0; $i < 30; $i++) {
            $this->actingAs($admin, 'sanctum')->postJson('/api/users', [
                'first_name' => 'Rate',
                'last_name' => "User{$i}",
                'email' => "rate-limit-{$i}@example.com",
                'role_id' => $salesRole->id,
                'status' => 'active',
            ])->assertCreated();
        }

        $blocked = $this->actingAs($admin, 'sanctum')->postJson('/api/users', [
            'first_name' => 'Blocked',
            'last_name' => 'User',
            'email' => 'blocked.user@example.com',
            'role_id' => $salesRole->id,
            'status' => 'active',
        ]);

        $blocked->assertStatus(429);
    }
}
