<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Notification;
use App\Models\OrderApproval;
use App\Models\Product;
use App\Models\User;
use App\Support\OrderApprovalStage;
use App\Support\OrderWorkflow;
use Database\Seeders\SalesDemoSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrderMultiLevelApprovalTest extends TestCase
{
    use RefreshDatabase;

    private User $sales;
    private User $accountant;
    private User $manager;
    private User $responsible;
    private Customer $customer;
    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();

        $this->sales = User::where('email', SalesDemoSeeder::DEMO_EMAIL)->firstOrFail();
        $this->accountant = User::where('email', 'accountant@larte.com')->firstOrFail();
        $this->manager = User::where('email', 'manager@larte.com')->firstOrFail();
        $this->responsible = User::where('email', 'responsible@larte.com')->firstOrFail();
        $this->customer = Customer::where('user_id', $this->sales->id)->firstOrFail();
        $this->product = Product::firstOrFail();
    }

    private function createOrderViaApi(): int
    {
        Sanctum::actingAs($this->sales);

        $response = $this->postJson('/api/orders', [
            'customer_id' => $this->customer->id,
            'sales_rep_id' => $this->sales->id,
            'items' => [
                ['product_id' => $this->product->id, 'quantity' => 1, 'price' => 100, 'discount' => 0],
            ],
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.status', 'pending_manager');

        return (int) $response->json('data.id');
    }

    public function test_representative_create_order_starts_pending_manager_and_notifies_manager(): void
    {
        $before = Notification::where('user_id', $this->manager->id)->where('type', 'order')->count();

        $orderId = $this->createOrderViaApi();

        $this->assertDatabaseHas('orders', [
            'id' => $orderId,
            'status' => OrderWorkflow::PENDING_MANAGER,
        ]);

        $this->assertDatabaseHas('order_approvals', [
            'order_id' => $orderId,
            'action' => OrderApprovalStage::ACTION_SUBMITTED,
        ]);

        $this->assertGreaterThan(
            $before,
            Notification::where('user_id', $this->manager->id)->where('type', 'order')->count()
        );
    }

    public function test_manager_approve_moves_to_pending_accountant(): void
    {
        $orderId = $this->createOrderViaApi();

        Sanctum::actingAs($this->manager);
        $this->postJson("/api/orders/{$orderId}/approve")
            ->assertOk()
            ->assertJsonPath('data.status', 'pending_accountant');

        $this->assertDatabaseHas('order_approvals', [
            'order_id' => $orderId,
            'action' => OrderApprovalStage::ACTION_MANAGER_APPROVED,
        ]);
    }

    public function test_accountant_approve_moves_to_pending_responsible(): void
    {
        $orderId = $this->createOrderViaApi();
        Sanctum::actingAs($this->manager);
        $this->postJson("/api/orders/{$orderId}/approve")->assertOk();

        Sanctum::actingAs($this->accountant);
        $this->postJson("/api/orders/{$orderId}/approve")
            ->assertOk()
            ->assertJsonPath('data.status', 'pending_responsible')
            ->assertJsonPath('data.can_approve', false)
            ->assertJsonStructure([
                'data' => [
                    'approval_history',
                    'approval_progress',
                    'can_approve',
                    'can_reject',
                ],
            ]);

        $this->assertDatabaseHas('order_approvals', [
            'order_id' => $orderId,
            'action' => OrderApprovalStage::ACTION_ACCOUNTANT_APPROVED,
        ]);
    }

    public function test_accountant_approve_response_includes_updated_workflow_metadata(): void
    {
        $orderId = $this->createOrderViaApi();
        Sanctum::actingAs($this->manager);
        $this->postJson("/api/orders/{$orderId}/approve")->assertOk();

        Sanctum::actingAs($this->accountant);
        $response = $this->postJson("/api/orders/{$orderId}/approve")->assertOk();

        $response->assertJsonPath('data.status', 'pending_responsible');
        $this->assertFalse($response->json('data.can_approve'));

        $history = collect($response->json('data.approval_history'));
        $this->assertTrue(
            $history->contains(fn (array $entry) => ($entry['action'] ?? null) === OrderApprovalStage::ACTION_ACCOUNTANT_APPROVED)
        );

        $progress = collect($response->json('data.approval_progress'));
        $accountantStep = $progress->firstWhere('key', 'accountant');
        $this->assertSame('completed', $accountantStep['state'] ?? null);
    }

    public function test_manager_approve_response_includes_can_approve_for_next_actor(): void
    {
        $orderId = $this->createOrderViaApi();

        Sanctum::actingAs($this->manager);
        $response = $this->postJson("/api/orders/{$orderId}/approve")->assertOk();

        $response->assertJsonPath('data.status', 'pending_accountant')
            ->assertJsonPath('data.can_approve', false)
            ->assertJsonStructure(['data' => ['approval_progress', 'approval_history']]);
    }

    public function test_responsible_approve_moves_to_pending_factory(): void
    {
        $orderId = $this->createOrderViaApi();
        Sanctum::actingAs($this->manager);
        $this->postJson("/api/orders/{$orderId}/approve")->assertOk();
        Sanctum::actingAs($this->accountant);
        $this->postJson("/api/orders/{$orderId}/approve")->assertOk();

        Sanctum::actingAs($this->responsible);
        $this->postJson("/api/orders/{$orderId}/approve")
            ->assertOk()
            ->assertJsonPath('data.status', 'pending_factory');

        $this->assertDatabaseHas('orders', [
            'id' => $orderId,
            'status' => OrderWorkflow::PENDING_FACTORY,
        ]);
    }

    public function test_accountant_reject_requires_reason_and_notifies_sales_rep(): void
    {
        $orderId = $this->createOrderViaApi();
        Sanctum::actingAs($this->manager);
        $this->postJson("/api/orders/{$orderId}/approve")->assertOk();

        Sanctum::actingAs($this->accountant);
        $this->postJson("/api/orders/{$orderId}/reject", ['reason' => 'ab'])
            ->assertStatus(422);

        $this->postJson("/api/orders/{$orderId}/reject", ['reason' => 'Invalid pricing'])
            ->assertOk()
            ->assertJsonPath('data.status', 'rejected');

        $this->assertDatabaseHas('order_approvals', [
            'order_id' => $orderId,
            'action' => OrderApprovalStage::ACTION_ACCOUNTANT_REJECTED,
            'reason' => 'Invalid pricing',
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->sales->id,
            'type' => 'order',
        ]);
    }

    public function test_manager_reject_at_manager_stage(): void
    {
        $orderId = $this->createOrderViaApi();

        Sanctum::actingAs($this->manager);
        $this->postJson("/api/orders/{$orderId}/reject", ['reason' => 'Budget exceeded'])
            ->assertOk()
            ->assertJsonPath('data.status', 'rejected');
    }

    public function test_responsible_reject_after_accountant_approval(): void
    {
        $orderId = $this->createOrderViaApi();
        Sanctum::actingAs($this->manager);
        $this->postJson("/api/orders/{$orderId}/approve")->assertOk();
        Sanctum::actingAs($this->accountant);
        $this->postJson("/api/orders/{$orderId}/approve")->assertOk();

        Sanctum::actingAs($this->responsible);
        $this->postJson("/api/orders/{$orderId}/reject", ['reason' => 'Not authorized quantity'])
            ->assertOk()
            ->assertJsonPath('data.status', 'rejected');
    }

    public function test_accountant_cannot_approve_pending_manager(): void
    {
        $orderId = $this->createOrderViaApi();

        Sanctum::actingAs($this->accountant);
        $this->postJson("/api/orders/{$orderId}/approve")
            ->assertForbidden();
    }

    public function test_responsible_cannot_approve_pending_manager(): void
    {
        $orderId = $this->createOrderViaApi();

        Sanctum::actingAs($this->responsible);
        $this->postJson("/api/orders/{$orderId}/approve")
            ->assertForbidden();
    }

    public function test_sales_rep_cannot_approve(): void
    {
        $orderId = $this->createOrderViaApi();

        Sanctum::actingAs($this->sales);
        $this->postJson("/api/orders/{$orderId}/approve")
            ->assertForbidden();
    }

    public function test_cannot_bypass_workflow_via_status_patch(): void
    {
        $orderId = $this->createOrderViaApi();

        Sanctum::actingAs($this->manager);
        $this->patchJson("/api/orders/{$orderId}/status", ['status' => 'validated'])
            ->assertForbidden();
    }

    public function test_double_approval_is_rejected(): void
    {
        $orderId = $this->createOrderViaApi();

        Sanctum::actingAs($this->manager);
        $this->postJson("/api/orders/{$orderId}/approve")->assertOk();
        $second = $this->postJson("/api/orders/{$orderId}/approve");
        $this->assertContains($second->status(), [403, 422]);

        $this->assertSame(
            1,
            OrderApproval::where('order_id', $orderId)
                ->where('action', OrderApprovalStage::ACTION_MANAGER_APPROVED)
                ->count()
        );
    }

    public function test_approval_history_is_ordered(): void
    {
        $orderId = $this->createOrderViaApi();
        Sanctum::actingAs($this->manager);
        $this->postJson("/api/orders/{$orderId}/approve")->assertOk();
        Sanctum::actingAs($this->accountant);
        $this->postJson("/api/orders/{$orderId}/approve")->assertOk();

        Sanctum::actingAs($this->responsible);
        $response = $this->getJson("/api/orders/{$orderId}/approval-history")->assertOk();

        $actions = collect($response->json('data'))->pluck('action')->all();
        $this->assertSame(
            [
                OrderApprovalStage::ACTION_SUBMITTED,
                OrderApprovalStage::ACTION_MANAGER_APPROVED,
                OrderApprovalStage::ACTION_ACCOUNTANT_APPROVED,
            ],
            $actions
        );
    }

    public function test_full_workflow_end_to_end(): void
    {
        $orderId = $this->createOrderViaApi();

        Sanctum::actingAs($this->manager);
        $this->postJson("/api/orders/{$orderId}/approve")->assertOk();
        Sanctum::actingAs($this->accountant);
        $this->postJson("/api/orders/{$orderId}/approve")->assertOk();
        Sanctum::actingAs($this->responsible);
        $this->postJson("/api/orders/{$orderId}/approve")
            ->assertOk()
            ->assertJsonPath('data.status', 'pending_factory');

        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->sales->id,
            'type' => 'order',
        ]);
    }
}
