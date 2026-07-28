<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiProtectionTest extends TestCase
{
    use RefreshDatabase;

    protected function adminToken(): string
    {
        $user = User::where('email', 'madina7ali7@gmail.com')->firstOrFail();

        return $user->createToken('test')->plainTextToken;
    }

    public function test_login_returns_token(): void
    {
        $this->seed();

        $response = $this->postJson('/api/login', [
            'email' => 'madina7ali7@gmail.com',
            'password' => '123456',
        ]);

        $response->assertOk()->assertJsonStructure([
            'success',
            'message',
            'data' => ['user', 'token'],
        ]);
    }

    public function test_protected_route_requires_auth(): void
    {
        $this->seed();

        $this->getJson('/api/orders')->assertUnauthorized();
    }

    public function test_admin_can_access_orders(): void
    {
        $this->seed();

        $response = $this->withToken($this->adminToken())->getJson('/api/orders');

        $response->assertOk()->assertJsonPath('success', true);
    }

    public function test_admin_can_access_products(): void
    {
        $this->seed();

        $response = $this->withToken($this->adminToken())->getJson('/api/products');

        $response->assertOk()->assertJsonPath('success', true);
    }

    public function test_admin_can_access_finance_metrics(): void
    {
        $this->seed();

        $response = $this->withToken($this->adminToken())->getJson('/api/finance/metrics');

        $response->assertOk()->assertJsonPath('success', true);
    }

    public function test_viewer_cannot_create_product(): void
    {
        $this->seed();

        $viewer = User::where('email', 'manager@larte.com')->firstOrFail();
        $viewer->role->permissions()->sync([]);
        $token = $viewer->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/products', [
            'name' => 'Test Product',
            'sku' => 'TEST999',
            'category_id' => 1,
            'price' => 10,
            'cost_price' => 5,
            'stock_quantity' => 1,
        ]);

        $response->assertForbidden();
    }

    public function test_password_email_endpoint_exists(): void
    {
        $this->seed();

        $response = $this->postJson('/api/password/email', [
            'email' => 'madina7ali7@gmail.com',
        ]);

        $this->assertContains($response->status(), [200, 422]);
    }
}
