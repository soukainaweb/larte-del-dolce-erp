<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Notification;
use App\Models\Order;
use App\Models\User;
use App\Support\OrderWorkflow;
use Database\Seeders\SalesDemoSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrderApprovalRejectionTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
        $this->admin = User::where('email', 'madina7ali7@gmail.com')->firstOrFail();
    }

    private function createSubmittedOrder(string $phone = '0501234567'): Order
    {
        $sales = User::where('email', SalesDemoSeeder::DEMO_EMAIL)->firstOrFail();

        $customer = Customer::create([
            'name' => 'Approval Test Client',
            'email' => 'approval-' . uniqid() . '@example.com',
            'phone' => $phone,
            'status' => 'active',
            'user_id' => $sales->id,
        ]);

        return Order::create([
            'order_number' => 'ORD-APPROVAL-' . uniqid(),
            'customer_id' => $customer->id,
            'user_id' => $sales->id,
            'status' => OrderWorkflow::SUBMITTED,
            'payment_status' => 'unpaid',
            'total_amount' => 150,
            'notes' => null,
        ]);
    }

    public function test_order_details_include_customer_phone(): void
    {
        $order = $this->createSubmittedOrder('0559876543');

        Sanctum::actingAs($this->admin);

        $response = $this->getJson("/api/orders/{$order->id}");

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.customer_phone', '0559876543');
    }

    public function test_manager_can_approve_pending_order(): void
    {
        $order = $this->createSubmittedOrder();
        $sales = User::where('email', SalesDemoSeeder::DEMO_EMAIL)->firstOrFail();

        Sanctum::actingAs($this->admin);

        $response = $this->postJson("/api/orders/{$order->id}/validate");

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'validated');

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => OrderWorkflow::APPROVED,
        ]);

        $this->assertDatabaseHas('order_status_histories', [
            'order_id' => $order->id,
            'from_status' => OrderWorkflow::SUBMITTED,
            'to_status' => OrderWorkflow::APPROVED,
            'user_id' => $this->admin->id,
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $sales->id,
            'type' => 'order',
            'title' => 'تمت الموافقة على الطلب',
        ]);
    }

    public function test_manager_can_reject_pending_order_with_reason(): void
    {
        $order = $this->createSubmittedOrder();
        $sales = User::where('email', SalesDemoSeeder::DEMO_EMAIL)->firstOrFail();
        $reason = 'المنتج غير متوفر حالياً';

        Sanctum::actingAs($this->admin);

        $response = $this->postJson("/api/orders/{$order->id}/reject", [
            'reason' => $reason,
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'rejected');

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => OrderWorkflow::REJECTED,
        ]);

        $this->assertDatabaseHas('order_status_histories', [
            'order_id' => $order->id,
            'from_status' => OrderWorkflow::SUBMITTED,
            'to_status' => OrderWorkflow::REJECTED,
            'user_id' => $this->admin->id,
            'comment' => $reason,
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $sales->id,
            'type' => 'order',
            'title' => 'تم رفض الطلب',
        ]);
    }

    public function test_reject_requires_reason(): void
    {
        $order = $this->createSubmittedOrder();

        Sanctum::actingAs($this->admin);

        $this->postJson("/api/orders/{$order->id}/reject", [
            'reason' => 'ab',
        ])->assertStatus(422);
    }

    public function test_sales_user_cannot_approve_or_reject_orders(): void
    {
        $order = $this->createSubmittedOrder();
        $sales = User::where('email', SalesDemoSeeder::DEMO_EMAIL)->firstOrFail();

        Sanctum::actingAs($sales);

        $this->postJson("/api/orders/{$order->id}/validate")
            ->assertForbidden();

        $this->postJson("/api/orders/{$order->id}/reject", [
            'reason' => 'Should not work',
        ])->assertForbidden();

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => OrderWorkflow::SUBMITTED,
        ]);
    }
}
