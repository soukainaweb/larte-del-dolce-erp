<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserCreateTest extends TestCase
{
    use RefreshDatabase;

    protected function adminUser(): User
    {
        return User::where('email', 'madina7ali7@gmail.com')->firstOrFail();
    }

    public function test_admin_can_create_user_with_snake_case_payload(): void
    {
        $this->seed();

        $admin = $this->adminUser();
        $salesRole = Role::where('name', 'sales')->firstOrFail();

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/users', [
            'first_name' => 'Mohamed',
            'last_name' => 'said',
            'email' => 'muhamedelseed203@gmail.com',
            'phone' => '0609720264',
            'role_id' => $salesRole->id,
            'status' => 'active',
        ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.email', 'muhamedelseed203@gmail.com')
            ->assertJsonPath('data.role_id', $salesRole->id);

        $this->assertDatabaseHas('users', [
            'email' => 'muhamedelseed203@gmail.com',
            'first_name' => 'Mohamed',
            'last_name' => 'said',
            'role_id' => $salesRole->id,
        ]);
    }

    public function test_create_user_requires_unique_email(): void
    {
        $this->seed();

        $admin = $this->adminUser();
        $salesRole = Role::where('name', 'sales')->firstOrFail();

        User::create([
            'first_name' => 'Existing',
            'last_name' => 'User',
            'email' => 'duplicate@example.com',
            'password' => bcrypt('password123'),
            'role_id' => $salesRole->id,
            'status' => 'active',
        ]);

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/users', [
            'first_name' => 'Another',
            'last_name' => 'User',
            'email' => 'duplicate@example.com',
            'role_id' => $salesRole->id,
            'status' => 'active',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }
}
