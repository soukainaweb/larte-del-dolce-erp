<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserCreateTest extends TestCase
{
    use RefreshDatabase;

    protected function adminUser(): User
    {
        return User::where('email', 'madina7ali7@gmail.com')->firstOrFail();
    }

    public function test_admin_can_create_user_and_receives_temporary_password(): void
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

        $temporaryPassword = $response->json('data.temporary_password');
        $this->assertNotEmpty($temporaryPassword);
        $this->assertGreaterThanOrEqual(8, strlen($temporaryPassword));

        $this->assertDatabaseHas('users', [
            'email' => 'muhamedelseed203@gmail.com',
            'first_name' => 'Mohamed',
            'last_name' => 'said',
            'role_id' => $salesRole->id,
            'status' => 'active',
        ]);

        $user = User::where('email', 'muhamedelseed203@gmail.com')->firstOrFail();
        $this->assertTrue(Hash::check($temporaryPassword, $user->password));
    }

    public function test_created_user_can_login_with_temporary_password(): void
    {
        $this->seed();

        $admin = $this->adminUser();
        $salesRole = Role::where('name', 'sales')->firstOrFail();

        $createResponse = $this->actingAs($admin, 'sanctum')->postJson('/api/users', [
            'first_name' => 'Login',
            'last_name' => 'Flow',
            'email' => 'login.flow.test@example.com',
            'role_id' => $salesRole->id,
            'status' => 'active',
        ]);

        $createResponse->assertCreated();
        $temporaryPassword = $createResponse->json('data.temporary_password');

        $loginResponse = $this->postJson('/api/login', [
            'email' => 'login.flow.test@example.com',
            'password' => $temporaryPassword,
        ]);

        $loginResponse->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => ['token', 'user']]);
    }

    public function test_create_user_rejects_client_supplied_password(): void
    {
        $this->seed();

        $admin = $this->adminUser();
        $salesRole = Role::where('name', 'sales')->firstOrFail();

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/users', [
            'first_name' => 'Bad',
            'last_name' => 'Payload',
            'email' => 'bad.payload@example.com',
            'role_id' => $salesRole->id,
            'status' => 'active',
            'password' => '123456',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
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
            'password' => 'password123',
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
