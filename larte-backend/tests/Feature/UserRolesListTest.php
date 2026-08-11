<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserRolesListTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_users_roles_endpoint_returns_all_active_roles(): void
    {
        $admin = User::where('email', 'madina7ali7@gmail.com')->firstOrFail();
        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/users/roles')->assertOk()->assertJsonPath('success', true);
        $roles = $response->json('data');

        $this->assertIsArray($roles);
        $this->assertSame(Role::count(), count($roles));

        $expectedSlugs = Role::query()->orderBy('display_name')->pluck('name')->all();
        $returnedSlugs = collect($roles)->pluck('name')->values()->all();

        $this->assertSame($expectedSlugs, $returnedSlugs);
    }

    public function test_manager_with_users_view_can_access_users_roles_endpoint(): void
    {
        $manager = User::where('email', 'manager@larte.com')->firstOrFail();
        Sanctum::actingAs($manager);

        $response = $this->getJson('/api/users/roles')->assertOk()->assertJsonPath('success', true);
        $roles = $response->json('data');

        $this->assertNotEmpty($roles);
        $this->assertContains('sales', collect($roles)->pluck('name')->all());
        $this->assertContains('factory', collect($roles)->pluck('name')->all());
        $this->assertContains('responsible', collect($roles)->pluck('name')->all());
    }

    public function test_users_roles_endpoint_requires_users_view_permission(): void
    {
        $sales = User::where('email', 'other.sales@larte.com')->firstOrFail();
        Sanctum::actingAs($sales);

        $this->getJson('/api/users/roles')->assertForbidden();
    }
}
