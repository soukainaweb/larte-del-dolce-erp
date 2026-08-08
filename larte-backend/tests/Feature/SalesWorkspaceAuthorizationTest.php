<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use App\Support\DefaultRolePermissions;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SalesWorkspaceAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    private function salesUser(): User
    {
        $this->seed();

        return User::where('email', 'other.sales@larte.com')->firstOrFail();
    }

    public function test_sales_role_has_expected_default_permissions(): void
    {
        $expected = DefaultRolePermissions::map()['sales'];

        $this->assertContains('dashboard.view', $expected);
        $this->assertContains('orders.view', $expected);
        $this->assertContains('customers.view', $expected);
        $this->assertContains('products.view', $expected);
        $this->assertContains('meetings.view', $expected);
        $this->assertContains('samples.view', $expected);
        $this->assertNotContains('users.view', $expected);
        $this->assertNotContains('settings.view', $expected);
    }

    public function test_sales_user_can_access_authorized_endpoints(): void
    {
        Sanctum::actingAs($this->salesUser());

        $this->getJson('/api/orders')->assertOk()->assertJsonPath('success', true);
        $this->getJson('/api/customers')->assertOk()->assertJsonPath('success', true);
        $this->getJson('/api/products')->assertOk()->assertJsonPath('success', true);
        $this->getJson('/api/meetings')->assertOk()->assertJsonPath('success', true);
        $this->getJson('/api/samples')->assertOk()->assertJsonPath('success', true);
    }

    public function test_sales_user_is_forbidden_from_admin_endpoints(): void
    {
        Sanctum::actingAs($this->salesUser());

        $this->getJson('/api/users')->assertForbidden();
        $this->getJson('/api/roles')->assertForbidden();
        $this->getJson('/api/settings')->assertForbidden();
        $this->getJson('/api/inventory')->assertForbidden();
        $this->getJson('/api/suppliers')->assertForbidden();
        $this->getJson('/api/productions')->assertForbidden();
        $this->getJson('/api/reports/sales-overview')->assertForbidden();
    }

    public function test_sales_user_cannot_create_users(): void
    {
        Sanctum::actingAs($this->salesUser());

        $roleId = Role::where('name', 'sales')->value('id');

        $this->postJson('/api/users', [
            'first_name' => 'Blocked',
            'last_name' => 'User',
            'email' => 'blocked.sales@example.com',
            'role_id' => $roleId,
            'status' => 'active',
        ])->assertForbidden();
    }
}
