<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Notification;
use App\Models\Order;
use App\Models\OrderApproval;
use App\Models\Product;
use App\Models\Role;
use App\Models\User;
use App\Support\DefaultRolePermissions;
use App\Support\EnsureFactorySetup;
use App\Support\OrderApprovalStage;
use App\Support\OrderWorkflow;
use Database\Seeders\SalesDemoSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrderFinalWorkflowTest extends TestCase
{
    use RefreshDatabase;

    private User $sales;
    private User $manager;
    private User $accountant;
    private User $responsible;
    private User $responsibleB;
    private User $factory;
    private User $salesB;
    private Customer $customer;
    private Customer $customerB;
    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        $this->seed();

        $this->sales = User::where('email', SalesDemoSeeder::DEMO_EMAIL)->firstOrFail();
        $this->manager = User::where('email', 'manager@larte.com')->firstOrFail();
        $this->accountant = User::where('email', 'accountant@larte.com')->firstOrFail();
        $this->responsible = User::where('email', 'responsible@larte.com')->firstOrFail();
        EnsureFactorySetup::run();
        $this->factory = User::where('email', EnsureFactorySetup::USER_EMAIL)->firstOrFail();
        $this->factory->update(['must_change_password' => false]);

        $salesRole = Role::where('name', 'sales')->firstOrFail();
        $this->salesB = User::create([
            'email' => 'sales.b@larte.com',
            'first_name' => 'Sales',
            'last_name' => 'B',
            'password' => bcrypt('123456'),
            'role_id' => $salesRole->id,
            'status' => 'online',
            'availability_status' => 'available',
        ]);

        $responsibleRole = Role::where('name', 'responsible')->firstOrFail();
        $this->responsibleB = User::create([
            'email' => 'responsible.b@larte.com',
            'first_name' => 'Responsible',
            'last_name' => 'B',
            'password' => bcrypt('123456'),
            'role_id' => $responsibleRole->id,
            'status' => 'online',
        ]);

        $this->customer = Customer::where('user_id', $this->sales->id)->firstOrFail();
        $this->customerB = Customer::create([
            'name' => 'Customer B',
            'email' => 'customerb@test.com',
            'phone' => '1234567890',
            'user_id' => $this->salesB->id,
            'status' => 'active',
        ]);
        $this->product = Product::firstOrFail();
    }

    private function createOrderViaApi(?User $sales = null, ?Customer $customer = null): int
    {
        $sales ??= $this->sales;
        $customer ??= $this->customer;
        Sanctum::actingAs($sales);

        $response = $this->postJson('/api/orders', [
            'customer_id' => $customer->id,
            'sales_rep_id' => $sales->id,
            'items' => [
                ['product_id' => $this->product->id, 'quantity' => 1, 'price' => 100, 'discount' => 0],
            ],
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.status', 'pending_manager');

        return (int) $response->json('data.id');
    }

    private function advanceToPendingFactory(int $orderId): void
    {
        Sanctum::actingAs($this->manager);
        $this->postJson("/api/orders/{$orderId}/approve")->assertOk();
        Sanctum::actingAs($this->accountant);
        $this->postJson("/api/orders/{$orderId}/approve")->assertOk();
        Sanctum::actingAs($this->responsible);
        $this->postJson("/api/orders/{$orderId}/approve")->assertOk();
    }

    private function samplePhoto(): string
    {
        return 'data:image/png;base64,' . base64_encode('fake-image-bytes');
    }

    public function test_factory_assign_keeps_ready_for_pickup_status(): void
    {
        $orderId = $this->createOrderViaApi();
        $this->advanceToPendingFactory($orderId);

        Sanctum::actingAs($this->factory);
        $this->postJson("/api/orders/{$orderId}/factory/accept")->assertOk();
        $this->postJson("/api/orders/{$orderId}/factory/ready")->assertOk()
            ->assertJsonPath('data.status', 'ready_for_pickup');

        $this->sales->update(['availability_status' => 'available']);
        $this->postJson("/api/orders/{$orderId}/factory/assign-representative", [
            'representative_id' => $this->sales->id,
        ])->assertOk()
            ->assertJsonPath('data.status', 'ready_for_pickup');

        $this->assertDatabaseHas('orders', [
            'id' => $orderId,
            'status' => OrderWorkflow::READY,
            'assigned_rep_id' => $this->sales->id,
        ]);
    }

    public function test_pickup_moves_order_to_in_delivery(): void
    {
        $orderId = $this->createOrderViaApi();
        $this->advanceToPendingFactory($orderId);

        Sanctum::actingAs($this->factory);
        $this->postJson("/api/orders/{$orderId}/factory/accept")->assertOk();
        $this->postJson("/api/orders/{$orderId}/factory/ready")->assertOk();
        $this->postJson("/api/orders/{$orderId}/factory/assign-representative", [
            'representative_id' => $this->sales->id,
        ])->assertOk();

        Sanctum::actingAs($this->sales);
        $this->postJson("/api/orders/{$orderId}/pickup", ['photo' => $this->samplePhoto()])
            ->assertOk()
            ->assertJsonPath('data.status', 'in_delivery');
    }

    public function test_representative_cannot_pickup_another_representatives_order(): void
    {
        $orderId = $this->createOrderViaApi();
        $this->advanceToPendingFactory($orderId);

        Sanctum::actingAs($this->factory);
        $this->postJson("/api/orders/{$orderId}/factory/accept")->assertOk();
        $this->postJson("/api/orders/{$orderId}/factory/ready")->assertOk();
        $this->postJson("/api/orders/{$orderId}/factory/assign-representative", [
            'representative_id' => $this->sales->id,
        ])->assertOk();

        Sanctum::actingAs($this->salesB);
        $this->postJson("/api/orders/{$orderId}/pickup", ['photo' => $this->samplePhoto()])
            ->assertForbidden();
    }

    public function test_representative_cannot_deliver_another_representatives_order(): void
    {
        $orderId = $this->createOrderViaApi();
        $this->advanceToPendingFactory($orderId);

        Sanctum::actingAs($this->factory);
        $this->postJson("/api/orders/{$orderId}/factory/accept")->assertOk();
        $this->postJson("/api/orders/{$orderId}/factory/ready")->assertOk();
        $this->postJson("/api/orders/{$orderId}/factory/assign-representative", [
            'representative_id' => $this->sales->id,
        ])->assertOk();

        Sanctum::actingAs($this->sales);
        $this->postJson("/api/orders/{$orderId}/pickup", ['photo' => $this->samplePhoto()])->assertOk();

        Sanctum::actingAs($this->salesB);
        $this->postJson("/api/orders/{$orderId}/delivery", ['photo' => $this->samplePhoto()])
            ->assertForbidden();
    }

    public function test_representative_cannot_access_another_representatives_customer(): void
    {
        Sanctum::actingAs($this->sales);
        $this->getJson("/api/customers/{$this->customerB->id}")->assertForbidden();
    }

    public function test_newly_created_responsible_user_inherits_role_permissions(): void
    {
        $role = Role::where('name', 'responsible')->firstOrFail();
        DefaultRolePermissions::syncRole($role, DefaultRolePermissions::ensurePermissionsExist());

        $newResponsible = User::create([
            'email' => 'new.responsible@larte.com',
            'first_name' => 'New',
            'last_name' => 'Responsible',
            'password' => bcrypt('123456'),
            'role_id' => $role->id,
            'status' => 'online',
        ]);

        $newResponsible->load('role.permissions');
        $names = $newResponsible->role->permissions->pluck('name')->all();

        $this->assertContains('products.view', $names);
        $this->assertContains('orders.approve.responsible', $names);
        $this->assertNotContains('users.view', $names);
    }

    public function test_factory_cannot_access_products_or_reports(): void
    {
        Sanctum::actingAs($this->factory);
        $this->getJson('/api/products')->assertForbidden();
        $this->getJson('/api/reports/orders')->assertForbidden();
    }

    public function test_assign_representative_notifies_only_assigned_rep(): void
    {
        $orderId = $this->createOrderViaApi();
        $this->advanceToPendingFactory($orderId);
        $this->sales->update(['availability_status' => 'available']);
        $this->salesB->update(['availability_status' => 'available']);

        Sanctum::actingAs($this->factory);
        $this->postJson("/api/orders/{$orderId}/factory/accept")->assertOk();
        $this->postJson("/api/orders/{$orderId}/factory/ready")->assertOk();

        $salesBBefore = Notification::where('user_id', $this->salesB->id)->where('type', 'order')->count();
        $salesBefore = Notification::where('user_id', $this->sales->id)->where('type', 'order')->count();

        $this->postJson("/api/orders/{$orderId}/factory/assign-representative", [
            'representative_id' => $this->sales->id,
        ])->assertOk();

        $this->assertGreaterThan($salesBefore, Notification::where('user_id', $this->sales->id)->where('type', 'order')->count());
        $this->assertSame($salesBBefore, Notification::where('user_id', $this->salesB->id)->where('type', 'order')->count());
    }

    public function test_representative_create_order_starts_pending_manager_and_notifies_manager(): void
    {
        $before = Notification::where('user_id', $this->manager->id)->where('type', 'order')->count();
        $orderId = $this->createOrderViaApi();

        $this->assertDatabaseHas('orders', ['id' => $orderId, 'status' => OrderWorkflow::PENDING_MANAGER]);
        $this->assertGreaterThan($before, Notification::where('user_id', $this->manager->id)->where('type', 'order')->count());
    }

    public function test_manager_approve_moves_to_pending_accountant(): void
    {
        $orderId = $this->createOrderViaApi();
        Sanctum::actingAs($this->manager);
        $this->postJson("/api/orders/{$orderId}/approve")
            ->assertOk()
            ->assertJsonPath('data.status', 'pending_accountant');
    }

    public function test_accountant_approve_moves_to_pending_responsible(): void
    {
        $orderId = $this->createOrderViaApi();
        Sanctum::actingAs($this->manager);
        $this->postJson("/api/orders/{$orderId}/approve")->assertOk();
        Sanctum::actingAs($this->accountant);
        $this->postJson("/api/orders/{$orderId}/approve")
            ->assertOk()
            ->assertJsonPath('data.status', 'pending_responsible');
    }

    public function test_responsible_approve_moves_to_pending_factory(): void
    {
        $orderId = $this->createOrderViaApi();
        $this->advanceToPendingFactory($orderId);

        $this->assertDatabaseHas('orders', ['id' => $orderId, 'status' => OrderWorkflow::PENDING_FACTORY]);
    }

    public function test_any_one_responsible_can_approve(): void
    {
        $orderId = $this->createOrderViaApi();
        Sanctum::actingAs($this->manager);
        $this->postJson("/api/orders/{$orderId}/approve")->assertOk();
        Sanctum::actingAs($this->accountant);
        $this->postJson("/api/orders/{$orderId}/approve")->assertOk();

        Sanctum::actingAs($this->responsibleB);
        $this->postJson("/api/orders/{$orderId}/approve")
            ->assertOk()
            ->assertJsonPath('data.status', 'pending_factory');
    }

    public function test_multiple_responsible_users_do_not_all_need_to_approve(): void
    {
        $orderId = $this->createOrderViaApi();
        Sanctum::actingAs($this->manager);
        $this->postJson("/api/orders/{$orderId}/approve")->assertOk();
        Sanctum::actingAs($this->accountant);
        $this->postJson("/api/orders/{$orderId}/approve")->assertOk();
        Sanctum::actingAs($this->responsibleB);
        $this->postJson("/api/orders/{$orderId}/approve")->assertOk();

        Sanctum::actingAs($this->responsible);
        $second = $this->postJson("/api/orders/{$orderId}/approve");
        $this->assertContains($second->status(), [403, 422]);

        $this->assertSame(1, OrderApproval::where('order_id', $orderId)
            ->where('action', OrderApprovalStage::ACTION_RESPONSIBLE_APPROVED)->count());
    }

    public function test_responsible_role_has_business_module_permissions(): void
    {
        $role = Role::where('name', 'responsible')->firstOrFail();
        $permissionIdsByName = DefaultRolePermissions::ensurePermissionsExist();
        DefaultRolePermissions::syncRole($role, $permissionIdsByName);
        $role->load('permissions');

        $names = $role->permissions->pluck('name')->all();
        $this->assertContains('products.view', $names);
        $this->assertContains('orders.approve.responsible', $names);
        $this->assertNotContains('users.view', $names);
        $this->assertNotContains('roles.view', $names);
    }

    public function test_factory_only_sees_eligible_orders(): void
    {
        $pendingOrderId = $this->createOrderViaApi();
        $factoryOrderId = $this->createOrderViaApi();
        $this->advanceToPendingFactory($factoryOrderId);

        Sanctum::actingAs($this->factory);
        $response = $this->getJson('/api/orders')->assertOk();
        $ids = collect($response->json('data.data'))->pluck('id')->all();

        $this->assertNotContains($pendingOrderId, $ids);
        $this->assertContains($factoryOrderId, $ids);
    }

    public function test_factory_can_accept_postpone_and_mark_ready(): void
    {
        $orderId = $this->createOrderViaApi();
        $this->advanceToPendingFactory($orderId);

        Sanctum::actingAs($this->factory);
        $this->postJson("/api/orders/{$orderId}/factory/accept")->assertOk()
            ->assertJsonPath('data.status', 'in_production');

        $this->postJson("/api/orders/{$orderId}/factory/postpone", ['reason' => 'Missing ingredients'])
            ->assertOk()
            ->assertJsonPath('data.status', 'postponed');

        $this->postJson("/api/orders/{$orderId}/factory/accept")->assertOk();
        $this->postJson("/api/orders/{$orderId}/factory/ready")->assertOk()
            ->assertJsonPath('data.status', 'ready_for_pickup');
    }

    public function test_available_representatives_are_shown_to_factory(): void
    {
        $this->sales->update(['availability_status' => 'available']);
        $this->salesB->update(['availability_status' => 'available']);

        Sanctum::actingAs($this->factory);
        $response = $this->getJson('/api/orders/available-representatives')->assertOk();
        $emails = collect($response->json('data'))->pluck('email')->all();

        $this->assertContains($this->sales->email, $emails);
        $this->assertContains($this->salesB->email, $emails);
    }

    public function test_representative_can_change_availability(): void
    {
        Sanctum::actingAs($this->sales);
        $this->putJson('/api/profile/availability', ['availability_status' => 'available'])
            ->assertOk();

        $this->assertDatabaseHas('users', [
            'id' => $this->sales->id,
            'availability_status' => 'available',
        ]);
    }

    public function test_representative_receives_ready_for_pickup_notification(): void
    {
        $orderId = $this->createOrderViaApi();
        $this->advanceToPendingFactory($orderId);
        $this->sales->update(['availability_status' => 'available']);

        Sanctum::actingAs($this->factory);
        $this->postJson("/api/orders/{$orderId}/factory/accept")->assertOk();
        $this->postJson("/api/orders/{$orderId}/factory/ready")->assertOk();

        $before = Notification::where('user_id', $this->sales->id)->where('type', 'order')->count();

        $this->postJson("/api/orders/{$orderId}/factory/assign-representative", [
            'representative_id' => $this->sales->id,
        ])->assertOk();

        $this->assertGreaterThan($before, Notification::where('user_id', $this->sales->id)->where('type', 'order')->count());
    }

    public function test_pickup_and_delivery_photos_stored_separately(): void
    {
        $orderId = $this->createOrderViaApi();
        $this->advanceToPendingFactory($orderId);

        Sanctum::actingAs($this->factory);
        $this->postJson("/api/orders/{$orderId}/factory/accept")->assertOk();
        $this->postJson("/api/orders/{$orderId}/factory/ready")->assertOk();
        $this->postJson("/api/orders/{$orderId}/factory/assign-representative", [
            'representative_id' => $this->sales->id,
        ])->assertOk();

        Sanctum::actingAs($this->sales);
        $this->postJson("/api/orders/{$orderId}/pickup", ['photo' => $this->samplePhoto()])->assertOk();
        $order = Order::findOrFail($orderId);
        $pickupPhoto = $order->pickup_photo;
        $this->assertNotNull($pickupPhoto);
        $this->assertNotNull($order->pickup_at);

        $this->postJson("/api/orders/{$orderId}/delivery", ['photo' => $this->samplePhoto()])->assertOk();
        $order->refresh();
        $this->assertNotNull($order->delivery_photo);
        $this->assertNotNull($order->delivered_at);
        $this->assertNotSame($pickupPhoto, $order->delivery_photo);
        $this->assertSame(OrderWorkflow::DELIVERED, $order->status);
    }

    public function test_representative_sees_only_own_invoices(): void
    {
        $orderA = Order::create([
            'order_number' => 'ORD-TEST-A',
            'customer_id' => $this->customer->id,
            'user_id' => $this->sales->id,
            'status' => OrderWorkflow::DELIVERED,
            'total_amount' => 100,
            'payment_status' => 'unpaid',
        ]);
        $orderB = Order::create([
            'order_number' => 'ORD-TEST-B',
            'customer_id' => $this->customerB->id,
            'user_id' => $this->salesB->id,
            'status' => OrderWorkflow::DELIVERED,
            'total_amount' => 200,
            'payment_status' => 'unpaid',
        ]);

        $invoiceA = Invoice::create([
            'invoice_number' => 'INV-A',
            'order_id' => $orderA->id,
            'total_amount' => 100,
            'status' => 'draft',
            'invoice_date' => now(),
        ]);
        Invoice::create([
            'invoice_number' => 'INV-B',
            'order_id' => $orderB->id,
            'total_amount' => 200,
            'status' => 'draft',
            'invoice_date' => now(),
        ]);

        Sanctum::actingAs($this->sales);
        $response = $this->getJson('/api/invoices')->assertOk();
        $numbers = collect($response->json('data.data'))->pluck('invoice_number')->all();

        $this->assertContains('INV-A', $numbers);
        $this->assertNotContains('INV-B', $numbers);

        Sanctum::actingAs($this->sales);
        $this->getJson("/api/invoices/{$invoiceA->id}")->assertOk();
        $this->getJson('/api/invoices/' . Invoice::where('invoice_number', 'INV-B')->first()->id)
            ->assertForbidden();
    }

    public function test_representative_cannot_access_other_representative_order(): void
    {
        $orderId = $this->createOrderViaApi($this->salesB, $this->customerB);

        Sanctum::actingAs($this->sales);
        $this->getJson("/api/orders/{$orderId}")->assertForbidden();
    }

    public function test_representative_selector_only_returns_sales_role(): void
    {
        Sanctum::actingAs($this->manager);
        $response = $this->getJson('/api/orders/form-options')->assertOk();
        $ids = collect($response->json('data.sales_reps'))->pluck('id')->all();

        $this->assertContains($this->sales->id, $ids);
        $this->assertContains($this->salesB->id, $ids);
        $this->assertNotContains($this->manager->id, $ids);
        $this->assertNotContains($this->factory->id, $ids);
    }

    public function test_sales_rep_form_options_returns_only_sales_role_users(): void
    {
        Sanctum::actingAs($this->sales);
        $response = $this->getJson('/api/orders/form-options')->assertOk();
        $reps = collect($response->json('data.sales_reps'));

        $this->assertGreaterThanOrEqual(2, $reps->count());
        $this->assertContains($this->sales->id, $reps->pluck('id')->all());
        $this->assertContains($this->salesB->id, $reps->pluck('id')->all());
        $this->assertNotContains($this->manager->id, $reps->pluck('id')->all());
        $this->assertNotContains($this->accountant->id, $reps->pluck('id')->all());
        $reps->each(fn ($rep) => $this->assertSame('sales', $rep['role']));
    }

    public function test_sales_rep_can_assign_order_to_another_sales_rep(): void
    {
        Sanctum::actingAs($this->sales);
        $response = $this->postJson('/api/orders', [
            'customer_id' => $this->customer->id,
            'sales_rep_id' => $this->salesB->id,
            'items' => [
                ['product_id' => $this->product->id, 'quantity' => 1, 'price' => 100, 'discount' => 0],
            ],
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.user_id', $this->salesB->id);
    }

    public function test_sales_rep_cannot_assign_order_to_non_sales_user(): void
    {
        Sanctum::actingAs($this->sales);
        $response = $this->postJson('/api/orders', [
            'customer_id' => $this->customer->id,
            'sales_rep_id' => $this->manager->id,
            'items' => [
                ['product_id' => $this->product->id, 'quantity' => 1, 'price' => 100, 'discount' => 0],
            ],
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.user_id', $this->sales->id);
    }

    public function test_factory_cannot_access_unauthorized_modules(): void
    {
        Sanctum::actingAs($this->factory);
        $this->getJson('/api/customers')->assertForbidden();
        $this->getJson('/api/users')->assertForbidden();
        $this->getJson('/api/roles')->assertForbidden();
    }

    public function test_manager_cannot_approve_before_their_stage(): void
    {
        $orderId = $this->createOrderViaApi();
        Sanctum::actingAs($this->accountant);
        $this->postJson("/api/orders/{$orderId}/approve")->assertForbidden();
    }

    public function test_notifications_sent_on_workflow_transitions_without_duplicates_on_reapprove(): void
    {
        $orderId = $this->createOrderViaApi();

        Sanctum::actingAs($this->manager);
        $this->postJson("/api/orders/{$orderId}/approve")->assertOk();

        $responsibleBefore = Notification::where('user_id', $this->responsible->id)->count();
        Sanctum::actingAs($this->accountant);
        $this->postJson("/api/orders/{$orderId}/approve")->assertOk();
        $this->assertGreaterThan($responsibleBefore, Notification::where('user_id', $this->responsible->id)->count());

        Sanctum::actingAs($this->responsible);
        $second = $this->postJson("/api/orders/{$orderId}/approve");
        $second->assertOk();
        $this->assertSame(
            $responsibleBefore + 1,
            Notification::where('user_id', $this->responsible->id)->count()
        );
    }
}
