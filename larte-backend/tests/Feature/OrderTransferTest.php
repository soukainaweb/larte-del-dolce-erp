<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\SalesDemoSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrderTransferTest extends TestCase
{
    use RefreshDatabase;

    private User $manager;
    private User $sales;
    private User $salesB;
    private User $accountant;
    private Order $order;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();

        $this->manager = User::where('email', 'manager@larte.com')->firstOrFail();
        $this->sales = User::where('email', SalesDemoSeeder::DEMO_EMAIL)->firstOrFail();
        $this->accountant = User::where('email', 'accountant@larte.com')->firstOrFail();

        $salesRole = Role::where('name', 'sales')->firstOrFail();
        $this->salesB = User::create([
            'email' => 'transfer.sales.b@larte.com',
            'first_name' => 'Transfer',
            'last_name' => 'Sales B',
            'password' => bcrypt('123456'),
            'role_id' => $salesRole->id,
            'status' => 'online',
        ]);

        $customer = Customer::where('user_id', $this->sales->id)->firstOrFail();
        $product = Product::firstOrFail();

        $this->order = Order::create([
            'order_number' => 'ORD-TRANSFER-TEST',
            'customer_id' => $customer->id,
            'user_id' => $this->sales->id,
            'status' => 'pending_manager',
            'payment_status' => 'unpaid',
            'total_amount' => 100,
        ]);

        $this->order->items()->create([
            'product_id' => $product->id,
            'quantity' => 1,
            'price' => 100,
            'subtotal' => 100,
        ]);
    }

    public function test_transfer_sales_reps_endpoint_returns_only_sales_role_users(): void
    {
        Sanctum::actingAs($this->manager);
        $response = $this->getJson('/api/order-transfers/sales-reps')->assertOk();
        $reps = collect($response->json('data'));

        $this->assertContains($this->sales->id, $reps->pluck('id')->all());
        $this->assertContains($this->salesB->id, $reps->pluck('id')->all());
        $this->assertNotContains($this->manager->id, $reps->pluck('id')->all());
        $this->assertNotContains($this->accountant->id, $reps->pluck('id')->all());
        $reps->each(fn ($rep) => $this->assertSame('sales', $rep['role']));
    }

    public function test_sales_rep_cannot_access_transfer_sales_reps_endpoint(): void
    {
        Sanctum::actingAs($this->sales);
        $this->getJson('/api/order-transfers/sales-reps')->assertForbidden();
    }

    public function test_manager_can_transfer_order_to_sales_representative(): void
    {
        Sanctum::actingAs($this->manager);
        $this->postJson("/api/orders/{$this->order->id}/transfer", [
            'to_salesperson_id' => $this->salesB->id,
            'notes' => 'Handoff to colleague',
        ])->assertOk()
            ->assertJsonPath('data.to_salesperson_id', $this->salesB->id);

        $this->assertSame($this->salesB->id, $this->order->fresh()->user_id);
    }

    public function test_transfer_rejects_non_sales_user(): void
    {
        Sanctum::actingAs($this->manager);
        $this->postJson("/api/orders/{$this->order->id}/transfer", [
            'to_salesperson_id' => $this->accountant->id,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['to_salesperson_id']);

        $this->assertSame($this->sales->id, $this->order->fresh()->user_id);
    }
}
