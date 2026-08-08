<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ModuleApiTest extends TestCase
{
    use RefreshDatabase;

    protected function adminToken(): string
    {
        $user = User::where('email', 'madina7ali7@gmail.com')->firstOrFail();

        return $user->createToken('test')->plainTextToken;
    }

    protected function authGet(string $uri)
    {
        return $this->withToken($this->adminToken())->getJson($uri);
    }

    public function test_users_module_routes(): void
    {
        $this->seed();

        $this->authGet('/api/users')->assertOk()->assertJsonPath('success', true);
        $this->authGet('/api/users/statistics')->assertOk()->assertJsonPath('success', true);
        $this->authGet('/api/users/roles')->assertOk()->assertJsonPath('success', true);
        $this->authGet('/api/users/statuses')->assertOk()->assertJsonPath('success', true);
    }

    public function test_customers_module_routes(): void
    {
        $this->seed();

        $this->authGet('/api/customers')->assertOk()->assertJsonPath('success', true);
        $this->authGet('/api/customers/statistics')->assertOk()->assertJsonPath('success', true);
        $this->authGet('/api/customers/types')->assertOk()->assertJsonPath('success', true);
        $this->authGet('/api/customers/statuses')->assertOk()->assertJsonPath('success', true);
    }

    public function test_categories_module_routes(): void
    {
        $this->seed();

        $this->authGet('/api/categories')->assertOk()->assertJsonPath('success', true);
        $this->authGet('/api/categories/statistics')->assertOk()->assertJsonPath('success', true);
        $this->authGet('/api/categories/statuses')->assertOk()->assertJsonPath('success', true);
    }

    public function test_suppliers_module_routes(): void
    {
        $this->seed();

        $this->authGet('/api/suppliers')->assertOk()->assertJsonPath('success', true);
        $this->authGet('/api/suppliers/statistics')->assertOk()->assertJsonPath('success', true);
        $this->authGet('/api/suppliers/export')->assertOk()->assertJsonPath('success', true);
        $this->authGet('/api/suppliers/types')->assertOk()->assertJsonPath('success', true);
    }

    public function test_warehouses_module_routes(): void
    {
        $this->seed();

        $this->authGet('/api/warehouses')->assertOk()->assertJsonPath('success', true);
        $this->authGet('/api/warehouses/types')->assertOk()->assertJsonPath('success', true);
        $this->authGet('/api/warehouses/statuses')->assertOk()->assertJsonPath('success', true);
    }

    public function test_inventory_module_routes(): void
    {
        $this->seed();

        $this->authGet('/api/inventory')->assertOk()->assertJsonPath('success', true);
        $this->authGet('/api/inventory/categories')->assertOk()->assertJsonPath('success', true);
        $this->authGet('/api/inventory/types')->assertOk()->assertJsonPath('success', true);
        $this->authGet('/api/inventory/statuses')->assertOk()->assertJsonPath('success', true);
    }

    public function test_invoices_module_routes(): void
    {
        $this->seed();

        $this->authGet('/api/invoices')->assertOk()->assertJsonPath('success', true);
        $this->authGet('/api/invoices/statuses')->assertOk()->assertJsonPath('success', true);
        $this->authGet('/api/invoices/payment-statuses')->assertOk()->assertJsonPath('success', true);
        $this->authGet('/api/invoices/payment-methods')->assertOk()->assertJsonPath('success', true);
    }

    public function test_payments_module_routes(): void
    {
        $this->seed();

        $this->authGet('/api/payments')->assertOk()->assertJsonPath('success', true);
        $this->authGet('/api/payments/methods')->assertOk()->assertJsonPath('success', true);
        $this->authGet('/api/payments/statuses')->assertOk()->assertJsonPath('success', true);
    }

    public function test_expenses_module_routes(): void
    {
        $this->seed();

        $this->authGet('/api/expenses')->assertOk()->assertJsonPath('success', true);
        $this->authGet('/api/expenses/payment-methods')->assertOk()->assertJsonPath('success', true);
        $this->authGet('/api/expenses/payment-statuses')->assertOk()->assertJsonPath('success', true);
    }

    public function test_deliveries_module_routes(): void
    {
        $this->seed();

        $this->authGet('/api/deliveries')->assertOk()->assertJsonPath('success', true);
        $this->authGet('/api/deliveries/export')->assertOk()->assertJsonPath('success', true);
    }

    public function test_productions_module_routes(): void
    {
        $this->seed();

        $this->authGet('/api/productions')->assertOk()->assertJsonPath('success', true);
        $this->authGet('/api/productions/statuses')->assertOk()->assertJsonPath('success', true);
    }

    public function test_notifications_module_routes(): void
    {
        $this->seed();

        $this->authGet('/api/notifications')->assertOk()->assertJsonPath('success', true);
        $this->authGet('/api/notifications/modules')->assertOk()->assertJsonPath('success', true);
        $this->authGet('/api/notifications/priorities')->assertOk()->assertJsonPath('success', true);
    }

    public function test_reports_module_routes(): void
    {
        $this->seed();

        $this->authGet('/api/reports/sales-overview')->assertOk()->assertJsonPath('success', true);
        $this->authGet('/api/reports/sales-reps')->assertOk()->assertJsonPath('success', true);
        $this->authGet('/api/reports/yearly-comparison')->assertOk()->assertJsonPath('success', true);
        $this->authGet('/api/reports/order-status')->assertOk()->assertJsonPath('success', true);
        $this->authGet('/api/reports/list')->assertOk()->assertJsonPath('success', true);
    }

    public function test_analytics_module_routes(): void
    {
        $this->seed();

        $this->authGet('/api/analytics/metrics')->assertOk()->assertJsonPath('success', true);
        $this->authGet('/api/analytics/sales/overview')->assertOk()->assertJsonPath('success', true);
        $this->authGet('/api/analytics/yearly-comparison')->assertOk()->assertJsonPath('success', true);
    }

    public function test_order_status_mapping(): void
    {
        $this->seed();

        $response = $this->authGet('/api/orders');

        $response->assertOk()->assertJsonPath('success', true);
        $this->assertArrayHasKey('data', $response->json());
    }

    public function test_api_error_response_format(): void
    {
        $this->seed();

        $this->getJson('/api/orders')->assertUnauthorized();
    }
}
