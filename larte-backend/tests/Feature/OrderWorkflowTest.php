<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\User;
use App\Support\OrderWorkflow;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderWorkflowTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
        $this->admin = User::where('email', 'madina7ali7@gmail.com')->firstOrFail();
    }

    private function token(): string
    {
        return $this->admin->createToken('test')->plainTextToken;
    }

    private function createOrder(string $status = OrderWorkflow::PENDING_MANAGER): Order
    {
        $customer = Customer::create([
            'name' => 'Test Client',
            'email' => 'test-' . uniqid() . '@example.com',
            'phone' => '0600000000',
            'status' => 'active',
        ]);

        return Order::create([
            'order_number' => 'ORD-TEST-' . uniqid(),
            'customer_id' => $customer->id,
            'user_id' => $this->admin->id,
            'status' => $status,
            'payment_status' => 'unpaid',
            'total_amount' => 100,
            'notes' => null,
        ]);
    }

    public function test_order_status_is_mapped_for_frontend(): void
    {
        $order = $this->createOrder(OrderWorkflow::PENDING_MANAGER);

        $response = $this->withToken($this->token())
            ->getJson("/api/orders/{$order->id}");

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'pending_manager');
    }

    public function test_admin_approve_at_manager_stage_moves_to_pending_accountant(): void
    {
        $order = $this->createOrder(OrderWorkflow::PENDING_MANAGER);

        $response = $this->withToken($this->token())
            ->postJson("/api/orders/{$order->id}/approve");

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'pending_accountant');

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => OrderWorkflow::PENDING_ACCOUNTANT,
        ]);
    }

    public function test_invalid_status_transition_is_rejected(): void
    {
        $order = $this->createOrder(OrderWorkflow::PENDING_MANAGER);

        $response = $this->withToken($this->token())
            ->patchJson("/api/orders/{$order->id}/status", ['status' => 'delivered']);

        $response->assertStatus(403)
            ->assertJsonPath('success', false);
    }

    public function test_status_history_endpoint_returns_entries(): void
    {
        $order = $this->createOrder(OrderWorkflow::PENDING_MANAGER);

        $this->withToken($this->token())
            ->postJson("/api/orders/{$order->id}/approve")
            ->assertOk();

        $response = $this->withToken($this->token())
            ->getJson("/api/orders/{$order->id}/status-history");

        $response->assertOk()
            ->assertJsonPath('success', true);

        $history = $response->json('data');
        $this->assertNotEmpty($history);
        $this->assertSame('pending_manager', $history[0]['from_status']);
        $this->assertSame('pending_accountant', $history[0]['to_status']);
    }

    public function test_full_execution_workflow_transitions(): void
    {
        $order = $this->createOrder(OrderWorkflow::PENDING_FACTORY);
        $token = $this->token();

        $steps = [
            ['status' => 'in_production', 'expected' => 'in_production', 'db' => OrderWorkflow::PREPARING],
            ['status' => 'ready_for_pickup', 'expected' => 'ready_for_pickup', 'db' => OrderWorkflow::READY],
        ];

        foreach ($steps as $step) {
            $response = $this->withToken($token)->patchJson("/api/orders/{$order->id}/status", [
                'status' => $step['status'],
            ]);

            $response->assertOk()->assertJsonPath('data.status', $step['expected']);
            $order->refresh();
            $this->assertSame($step['db'], $order->status);
        }

        $this->assertGreaterThanOrEqual(
            count($steps),
            OrderStatusHistory::where('order_id', $order->id)->count()
        );
    }

    public function test_cancel_order_from_pending_manager(): void
    {
        $order = $this->createOrder(OrderWorkflow::PENDING_MANAGER);

        $response = $this->withToken($this->token())
            ->postJson("/api/orders/{$order->id}/cancel", ['reason' => 'Client request']);

        $response->assertOk()
            ->assertJsonPath('data.status', 'cancelled');
    }

    public function test_allowed_transitions_endpoint(): void
    {
        $order = $this->createOrder(OrderWorkflow::PENDING_MANAGER);

        $response = $this->withToken($this->token())
            ->getJson("/api/orders/{$order->id}/allowed-transitions");

        $response->assertOk()
            ->assertJsonPath('success', true);

        $allowed = $response->json('data');
        $this->assertContains('pending_accountant', $allowed);
        $this->assertContains('rejected', $allowed);
        $this->assertContains('cancelled', $allowed);
    }
}
