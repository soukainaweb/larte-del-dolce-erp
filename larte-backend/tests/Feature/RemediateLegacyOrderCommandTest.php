<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderApproval;
use App\Models\OrderStatusHistory;
use App\Models\Product;
use App\Models\Role;
use App\Models\User;
use App\Support\DefaultRolePermissions;
use App\Support\EnsureFactorySetup;
use App\Support\LegacyOrderRemediation;
use App\Support\OrderApprovalStage;
use App\Support\OrderWorkflow;
use Database\Seeders\SalesDemoSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class RemediateLegacyOrderCommandTest extends TestCase
{
    use RefreshDatabase;

    private Customer $customer;
    private User $sales;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();

        $this->sales = User::where('email', SalesDemoSeeder::DEMO_EMAIL)->firstOrFail();
        $this->customer = Customer::where('user_id', $this->sales->id)->firstOrFail();
    }

    private function createLegacyPendingAccountantOrder(string $orderNumber = 'ORD014'): Order
    {
        $order = Order::create([
            'order_number' => $orderNumber,
            'customer_id' => $this->customer->id,
            'user_id' => $this->sales->id,
            'status' => OrderWorkflow::PENDING_ACCOUNTANT,
            'payment_status' => 'unpaid',
            'total_amount' => 120,
        ]);

        OrderApproval::create([
            'order_id' => $order->id,
            'user_id' => $this->sales->id,
            'role' => 'sales',
            'action' => OrderApprovalStage::ACTION_SUBMITTED,
        ]);

        return $order->fresh(['approvals']);
    }

    public function test_successful_remediation_moves_order_to_pending_manager(): void
    {
        $order = $this->createLegacyPendingAccountantOrder();
        $approvalCount = $order->approvals()->count();

        $this->artisan('erp:remediate-legacy-order', [
            'order' => $order->order_number,
            '--confirm' => true,
        ])->assertSuccessful()
            ->expectsOutputToContain('Legacy remediation applied successfully');

        $order->refresh();
        $this->assertSame(OrderWorkflow::PENDING_MANAGER, $order->status);
        $this->assertSame($approvalCount, $order->approvals()->count());
        $this->assertDatabaseHas('order_approvals', [
            'order_id' => $order->id,
            'action' => OrderApprovalStage::ACTION_SUBMITTED,
        ]);
        $this->assertDatabaseMissing('order_approvals', [
            'order_id' => $order->id,
            'action' => OrderApprovalStage::ACTION_MANAGER_APPROVED,
        ]);

        $this->assertDatabaseHas('order_status_histories', [
            'order_id' => $order->id,
            'from_status' => OrderWorkflow::PENDING_ACCOUNTANT,
            'to_status' => OrderWorkflow::PENDING_MANAGER,
        ]);

        $this->assertDatabaseHas('activity_logs', [
            'module' => 'orders',
            'action' => 'legacy_remediation',
        ]);
    }

    public function test_dry_run_shows_planned_change_without_modifying_order(): void
    {
        $order = $this->createLegacyPendingAccountantOrder();

        $this->artisan('erp:remediate-legacy-order', [
            'order' => $order->order_number,
        ])->assertSuccessful()
            ->expectsOutputToContain('Dry run only')
            ->expectsOutputToContain('pending_accountant → pending_manager');

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => OrderWorkflow::PENDING_ACCOUNTANT,
        ]);
    }

    public function test_refuses_when_status_is_not_pending_accountant(): void
    {
        $order = Order::create([
            'order_number' => 'ORD-BAD-STATUS',
            'customer_id' => $this->customer->id,
            'user_id' => $this->sales->id,
            'status' => OrderWorkflow::PREPARING,
            'payment_status' => 'unpaid',
            'total_amount' => 50,
        ]);

        OrderApproval::create([
            'order_id' => $order->id,
            'user_id' => $this->sales->id,
            'role' => 'sales',
            'action' => OrderApprovalStage::ACTION_SUBMITTED,
        ]);

        $this->artisan('erp:remediate-legacy-order', [
            'order' => $order->order_number,
        ])->assertFailed()
            ->expectsOutputToContain('Remediation refused.');
    }

    public function test_refuses_when_manager_approval_exists(): void
    {
        $order = $this->createLegacyPendingAccountantOrder('ORD-MGR');

        OrderApproval::create([
            'order_id' => $order->id,
            'user_id' => $this->sales->id,
            'role' => 'manager',
            'action' => OrderApprovalStage::ACTION_MANAGER_APPROVED,
        ]);

        $this->artisan('erp:remediate-legacy-order', [
            'order' => 'ORD-MGR',
            '--confirm' => true,
        ])->assertFailed()
            ->expectsOutputToContain('MANAGER_APPROVED');
    }

    public function test_refuses_when_accountant_approval_exists(): void
    {
        $order = $this->createLegacyPendingAccountantOrder('ORD-ACC');

        OrderApproval::create([
            'order_id' => $order->id,
            'user_id' => $this->sales->id,
            'role' => 'accountant',
            'action' => OrderApprovalStage::ACTION_ACCOUNTANT_APPROVED,
        ]);

        $this->artisan('erp:remediate-legacy-order', [
            'order' => 'ORD-ACC',
            '--confirm' => true,
        ])->assertFailed()
            ->expectsOutputToContain('ACCOUNTANT_APPROVED');
    }

    public function test_refuses_when_responsible_approval_exists(): void
    {
        $order = $this->createLegacyPendingAccountantOrder('ORD-RESP');

        OrderApproval::create([
            'order_id' => $order->id,
            'user_id' => $this->sales->id,
            'role' => 'responsible',
            'action' => OrderApprovalStage::ACTION_RESPONSIBLE_APPROVED,
        ]);

        $this->artisan('erp:remediate-legacy-order', [
            'order' => 'ORD-RESP',
            '--confirm' => true,
        ])->assertFailed()
            ->expectsOutputToContain('RESPONSIBLE_APPROVED');
    }

    public function test_refuses_when_factory_action_exists(): void
    {
        $order = $this->createLegacyPendingAccountantOrder('ORD-FACTORY');
        $order->update([
            'factory_postponed_reason' => 'Waiting for ingredients',
        ]);

        $this->artisan('erp:remediate-legacy-order', [
            'order' => 'ORD-FACTORY',
            '--confirm' => true,
        ])->assertFailed()
            ->expectsOutputToContain('Factory processing evidence exists');
    }

    public function test_refuses_when_order_has_progressed_to_factory_status(): void
    {
        $order = $this->createLegacyPendingAccountantOrder('ORD-FACTORY-STATUS');
        $order->update(['status' => OrderWorkflow::PENDING_FACTORY]);

        $this->artisan('erp:remediate-legacy-order', [
            'order' => 'ORD-FACTORY-STATUS',
            '--confirm' => true,
        ])->assertFailed();
    }

    public function test_idempotent_when_already_pending_manager(): void
    {
        $order = $this->createLegacyPendingAccountantOrder('ORD-IDEM');

        LegacyOrderRemediation::apply('ORD-IDEM');

        $this->artisan('erp:remediate-legacy-order', [
            'order' => 'ORD-IDEM',
            '--confirm' => true,
        ])->assertSuccessful()
            ->expectsOutputToContain('no change needed');

        $this->assertSame(1, OrderStatusHistory::where('order_id', $order->id)->count());
        $this->assertSame(1, ActivityLog::where('module', 'orders')->where('action', 'legacy_remediation')->count());
    }

    public function test_accepts_numeric_order_id(): void
    {
        $order = $this->createLegacyPendingAccountantOrder('ORD-ID');

        $this->artisan('erp:remediate-legacy-order', [
            'order' => (string) $order->id,
            '--confirm' => true,
        ])->assertSuccessful();

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => OrderWorkflow::PENDING_MANAGER,
        ]);
    }

    public function test_service_apply_creates_audit_and_status_history(): void
    {
        $order = $this->createLegacyPendingAccountantOrder('ORD-AUDIT');

        $result = LegacyOrderRemediation::apply('ORD-AUDIT');

        $this->assertTrue($result['applied']);
        $history = OrderStatusHistory::where('order_id', $order->id)->firstOrFail();
        $this->assertStringContainsString('Legacy workflow remediation', (string) $history->comment);
        $this->assertDatabaseHas('activity_logs', [
            'module' => 'orders',
            'action' => 'legacy_remediation',
        ]);
    }
}
