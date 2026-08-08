<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Support\DefaultRolePermissions;
use Database\Seeders\SalesDemoSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrderSalesAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    private function salesUser(): User
    {
        return User::where('email', SalesDemoSeeder::DEMO_EMAIL)->firstOrFail();
    }

    public function test_sales_role_has_create_only_order_permissions(): void
    {
        $expected = DefaultRolePermissions::map()['sales'];

        $this->assertContains('orders.view', $expected);
        $this->assertContains('orders.create', $expected);
        $this->assertNotContains('orders.update', $expected);
        $this->assertNotContains('orders.delete', $expected);
    }

    public function test_sales_user_can_list_and_create_orders(): void
    {
        $sales = $this->salesUser();
        $customer = Customer::where('user_id', $sales->id)->firstOrFail();
        $product = Product::firstOrFail();

        Sanctum::actingAs($sales);

        $this->getJson('/api/orders')->assertOk()->assertJsonPath('success', true);
        $this->getJson('/api/orders/form-options')->assertOk()->assertJsonPath('success', true);
        $this->getJson('/api/products')->assertForbidden();

        $this->postJson('/api/orders', [
            'customer_id' => $customer->id,
            'sales_rep_id' => $sales->id,
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1, 'price' => 50, 'discount' => 0],
            ],
        ])->assertCreated();
    }

    public function test_sales_user_cannot_update_or_delete_orders(): void
    {
        $sales = $this->salesUser();
        $order = Order::where('user_id', $sales->id)->firstOrFail();

        Sanctum::actingAs($sales);

        $this->putJson("/api/orders/{$order->id}", ['notes' => 'Unauthorized update'])
            ->assertForbidden();

        $this->patchJson("/api/orders/{$order->id}/status", ['status' => 'validated'])
            ->assertForbidden();

        $this->deleteJson("/api/orders/{$order->id}")
            ->assertForbidden();
    }

    public function test_manager_can_update_and_delete_orders(): void
    {
        $manager = User::where('email', 'manager@larte.com')->firstOrFail();
        $order = Order::firstOrFail();

        Sanctum::actingAs($manager);

        $this->putJson("/api/orders/{$order->id}", ['notes' => 'Manager update'])
            ->assertOk()
            ->assertJsonPath('success', true);

        $disposable = Order::create([
            'order_number' => 'ORD-DELETE-TEST-' . uniqid(),
            'customer_id' => $order->customer_id,
            'user_id' => $manager->id,
            'status' => 'submitted',
            'payment_status' => 'unpaid',
            'total_amount' => 10,
        ]);

        $this->deleteJson("/api/orders/{$disposable->id}")
            ->assertOk()
            ->assertJsonPath('success', true);
    }
}
