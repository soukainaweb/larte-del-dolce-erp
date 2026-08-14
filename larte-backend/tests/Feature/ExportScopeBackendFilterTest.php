<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Customer;
use App\Models\Delivery;
use App\Models\Inventory;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ExportScopeBackendFilterTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
        $this->admin = User::where('email', 'madina7ali7@gmail.com')->firstOrFail();
        Sanctum::actingAs($this->admin);
    }

    private function createCustomer(string $name): Customer
    {
        return Customer::create([
            'name' => $name,
            'email' => strtolower(str_replace(' ', '.', $name)) . '@test.com',
            'phone' => '0500000000',
            'address' => 'Test Address',
            'city' => 'Riyadh',
            'status' => 'active',
        ]);
    }

    private function createOrder(Customer $customer, string $suffix = '001'): Order
    {
        return Order::create([
            'customer_id' => $customer->id,
            'user_id' => $this->admin->id,
            'order_number' => 'ORD-SCOPE-' . $suffix,
            'status' => 'submitted',
            'total_amount' => 100,
            'payment_status' => 'unpaid',
        ]);
    }

    private function createInvoice(Order $order, string $suffix = '001'): Invoice
    {
        return Invoice::create([
            'order_id' => $order->id,
            'invoice_number' => 'FAC-SCOPE-' . $suffix,
            'total_amount' => 100,
            'status' => 'draft',
            'invoice_date' => now()->toDateString(),
        ]);
    }

    private function createDelivery(Order $order): Delivery
    {
        return Delivery::create([
            'order_id' => $order->id,
            'status' => 'pending',
            'delivery_date' => now()->toDateString(),
        ]);
    }

    private function createPayment(Invoice $invoice, string $suffix = '001'): Payment
    {
        return Payment::create([
            'invoice_id' => $invoice->id,
            'amount' => 50,
            'method' => 'cash',
            'status' => 'completed',
            'payment_date' => now()->toDateString(),
            'reference' => 'PAY-' . $suffix,
        ]);
    }

    // -------------------------------------------------------------------------
    // Deliveries — customer_id
    // -------------------------------------------------------------------------

    public function test_deliveries_customer_id_filters_to_matching_customer_only(): void
    {
        $customerA = $this->createCustomer('Customer Alpha');
        $customerB = $this->createCustomer('Customer Beta');

        $deliveryA = $this->createDelivery($this->createOrder($customerA, 'A1'));
        $this->createDelivery($this->createOrder($customerB, 'B1'));

        $response = $this->getJson('/api/deliveries?customer_id=' . $customerA->id);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data.data');

        $ids = collect($response->json('data.data'))->pluck('id')->all();
        $this->assertSame([$deliveryA->id], $ids);
    }

    public function test_deliveries_customer_id_excludes_other_customers(): void
    {
        $customerA = $this->createCustomer('Customer Alpha');
        $customerB = $this->createCustomer('Customer Beta');

        $this->createDelivery($this->createOrder($customerA, 'A1'));
        $deliveryB = $this->createDelivery($this->createOrder($customerB, 'B1'));

        $response = $this->getJson('/api/deliveries?customer_id=' . $customerA->id);

        $response->assertOk()->assertJsonCount(1, 'data.data');
        $this->assertNotContains($deliveryB->id, collect($response->json('data.data'))->pluck('id'));
    }

    public function test_deliveries_pagination_preserves_customer_id_filter(): void
    {
        $customerA = $this->createCustomer('Customer Alpha');
        $customerB = $this->createCustomer('Customer Beta');

        for ($i = 1; $i <= 3; $i++) {
            $this->createDelivery($this->createOrder($customerA, 'A' . $i));
        }
        $this->createDelivery($this->createOrder($customerB, 'B1'));

        $page1 = $this->getJson('/api/deliveries?customer_id=' . $customerA->id . '&per_page=2&page=1');
        $page1->assertOk()
            ->assertJsonPath('data.total', 3)
            ->assertJsonPath('data.per_page', 2)
            ->assertJsonPath('data.current_page', 1)
            ->assertJsonCount(2, 'data.data');

        $page2 = $this->getJson('/api/deliveries?customer_id=' . $customerA->id . '&per_page=2&page=2');
        $page2->assertOk()
            ->assertJsonPath('data.total', 3)
            ->assertJsonPath('data.current_page', 2)
            ->assertJsonCount(1, 'data.data');
    }

    public function test_deliveries_meta_total_reflects_filtered_customer_dataset(): void
    {
        $customerA = $this->createCustomer('Customer Alpha');
        $customerB = $this->createCustomer('Customer Beta');

        $this->createDelivery($this->createOrder($customerA, 'A1'));
        $this->createDelivery($this->createOrder($customerA, 'A2'));
        $this->createDelivery($this->createOrder($customerB, 'B1'));

        $filtered = $this->getJson('/api/deliveries?customer_id=' . $customerA->id . '&per_page=1');
        $filtered->assertOk()->assertJsonPath('data.total', 2);

        $unfiltered = $this->getJson('/api/deliveries?per_page=1');
        $unfiltered->assertOk();
        $this->assertGreaterThanOrEqual(3, $unfiltered->json('data.total'));
    }

    public function test_deliveries_without_customer_id_keeps_existing_behavior(): void
    {
        $customerA = $this->createCustomer('Customer Alpha');
        $customerB = $this->createCustomer('Customer Beta');

        $this->createDelivery($this->createOrder($customerA, 'A1'));
        $this->createDelivery($this->createOrder($customerB, 'B1'));

        $response = $this->getJson('/api/deliveries?status=pending');

        $response->assertOk();
        $this->assertGreaterThanOrEqual(2, count($response->json('data.data')));
    }

    public function test_deliveries_customer_id_combines_with_status_filter(): void
    {
        $customer = $this->createCustomer('Customer Alpha');

        $pending = $this->createDelivery($this->createOrder($customer, 'A1'));
        $pending->update(['status' => 'pending']);

        $deliveredOrder = $this->createOrder($customer, 'A2');
        $delivered = $this->createDelivery($deliveredOrder);
        $delivered->update(['status' => 'delivered']);

        $response = $this->getJson('/api/deliveries?customer_id=' . $customer->id . '&status=pending');

        $response->assertOk()->assertJsonCount(1, 'data.data');
        $this->assertSame($pending->id, $response->json('data.data.0.id'));
    }

    // -------------------------------------------------------------------------
    // Payments — customer_id
    // -------------------------------------------------------------------------

    public function test_payments_customer_id_filters_to_matching_customer_only(): void
    {
        $customerA = $this->createCustomer('Customer Alpha');
        $customerB = $this->createCustomer('Customer Beta');

        $paymentA = $this->createPayment($this->createInvoice($this->createOrder($customerA, 'A1'), 'A1'));
        $this->createPayment($this->createInvoice($this->createOrder($customerB, 'B1'), 'B1'));

        $response = $this->getJson('/api/payments?customer_id=' . $customerA->id);

        $response->assertOk()->assertJsonCount(1, 'data.data');
        $this->assertSame($paymentA->id, $response->json('data.data.0.id'));
    }

    public function test_payments_customer_id_excludes_other_customers(): void
    {
        $customerA = $this->createCustomer('Customer Alpha');
        $customerB = $this->createCustomer('Customer Beta');

        $this->createPayment($this->createInvoice($this->createOrder($customerA, 'A1'), 'A1'));
        $paymentB = $this->createPayment($this->createInvoice($this->createOrder($customerB, 'B1'), 'B1'));

        $response = $this->getJson('/api/payments?customer_id=' . $customerA->id);

        $response->assertOk()->assertJsonCount(1, 'data.data');
        $this->assertNotSame($paymentB->id, $response->json('data.data.0.id'));
    }

    public function test_payments_pagination_preserves_customer_id_filter(): void
    {
        $customerA = $this->createCustomer('Customer Alpha');
        $customerB = $this->createCustomer('Customer Beta');

        for ($i = 1; $i <= 3; $i++) {
            $this->createPayment(
                $this->createInvoice($this->createOrder($customerA, 'A' . $i), 'A' . $i),
                'A' . $i
            );
        }
        $this->createPayment($this->createInvoice($this->createOrder($customerB, 'B1'), 'B1'));

        $page1 = $this->getJson('/api/payments?customer_id=' . $customerA->id . '&per_page=2&page=1');
        $page1->assertOk()
            ->assertJsonPath('data.total', 3)
            ->assertJsonCount(2, 'data.data');

        $page2 = $this->getJson('/api/payments?customer_id=' . $customerA->id . '&per_page=2&page=2');
        $page2->assertOk()
            ->assertJsonPath('data.total', 3)
            ->assertJsonCount(1, 'data.data');
    }

    public function test_payments_meta_total_reflects_filtered_customer_dataset(): void
    {
        $customerA = $this->createCustomer('Customer Alpha');
        $customerB = $this->createCustomer('Customer Beta');

        $this->createPayment($this->createInvoice($this->createOrder($customerA, 'A1'), 'A1'));
        $this->createPayment($this->createInvoice($this->createOrder($customerA, 'A2'), 'A2'));
        $this->createPayment($this->createInvoice($this->createOrder($customerB, 'B1'), 'B1'));

        $response = $this->getJson('/api/payments?customer_id=' . $customerA->id . '&per_page=1');
        $response->assertOk()->assertJsonPath('data.total', 2);
    }

    public function test_payments_without_customer_id_keeps_existing_behavior(): void
    {
        $customerA = $this->createCustomer('Customer Alpha');
        $customerB = $this->createCustomer('Customer Beta');

        $this->createPayment($this->createInvoice($this->createOrder($customerA, 'A1'), 'A1'));
        $this->createPayment($this->createInvoice($this->createOrder($customerB, 'B1'), 'B1'));

        $response = $this->getJson('/api/payments?method=cash');
        $response->assertOk();
        $this->assertGreaterThanOrEqual(2, count($response->json('data.data')));
    }

    public function test_payments_customer_id_combines_with_method_filter(): void
    {
        $customer = $this->createCustomer('Customer Alpha');

        $cashPayment = $this->createPayment(
            $this->createInvoice($this->createOrder($customer, 'A1'), 'A1'),
            'A1'
        );
        $cashPayment->update(['method' => 'cash']);

        $cardPayment = $this->createPayment(
            $this->createInvoice($this->createOrder($customer, 'A2'), 'A2'),
            'A2'
        );
        $cardPayment->update(['method' => 'card']);

        $response = $this->getJson('/api/payments?customer_id=' . $customer->id . '&method=card');

        $response->assertOk()->assertJsonCount(1, 'data.data');
        $this->assertSame($cardPayment->id, $response->json('data.data.0.id'));
    }

    // -------------------------------------------------------------------------
    // Reports — orders customer_id
    // -------------------------------------------------------------------------

    public function test_reports_orders_customer_id_filters_correctly(): void
    {
        $customerA = $this->createCustomer('Customer Alpha');
        $customerB = $this->createCustomer('Customer Beta');

        $orderA = $this->createOrder($customerA, 'RA1');
        $this->createOrder($customerB, 'RB1');

        $dateFrom = now()->subDay()->format('Y-m-d');
        $dateTo = now()->addDay()->format('Y-m-d');

        $response = $this->getJson('/api/reports/orders?customer_id=' . $customerA->id . '&date_from=' . $dateFrom . '&date_to=' . $dateTo);

        $response->assertOk()->assertJsonPath('success', true);

        $orders = collect($response->json('data.orders'));
        $this->assertCount(1, $orders);
        $this->assertSame($orderA->id, $orders->first()['id']);
    }

    public function test_reports_orders_customer_id_excludes_other_customers(): void
    {
        $customerA = $this->createCustomer('Customer Alpha');
        $customerB = $this->createCustomer('Customer Beta');

        $this->createOrder($customerA, 'RA1');
        $orderB = $this->createOrder($customerB, 'RB1');

        $dateFrom = now()->subDay()->format('Y-m-d');
        $dateTo = now()->addDay()->format('Y-m-d');

        $response = $this->getJson('/api/reports/orders?customer_id=' . $customerA->id . '&date_from=' . $dateFrom . '&date_to=' . $dateTo);

        $orderIds = collect($response->json('data.orders'))->pluck('id');
        $this->assertNotContains($orderB->id, $orderIds);
    }

    public function test_reports_orders_without_customer_id_returns_all_orders_in_range(): void
    {
        $customerA = $this->createCustomer('Customer Alpha');
        $customerB = $this->createCustomer('Customer Beta');

        $this->createOrder($customerA, 'RA1');
        $this->createOrder($customerB, 'RB1');

        $dateFrom = now()->subDay()->format('Y-m-d');
        $dateTo = now()->addDay()->format('Y-m-d');

        $response = $this->getJson('/api/reports/orders?date_from=' . $dateFrom . '&date_to=' . $dateTo);

        $this->assertGreaterThanOrEqual(2, count($response->json('data.orders')));
    }

    // -------------------------------------------------------------------------
    // Invoices list API — customer_id (Reports Invoices export)
    // -------------------------------------------------------------------------

    public function test_invoices_customer_id_returns_invoice_rows_for_customer(): void
    {
        $customerA = $this->createCustomer('Customer Alpha');
        $customerB = $this->createCustomer('Customer Beta');

        $invoiceA = $this->createInvoice($this->createOrder($customerA, 'IA1'), 'IA1');
        $this->createInvoice($this->createOrder($customerB, 'IB1'), 'IB1');

        $response = $this->getJson('/api/invoices?customer_id=' . $customerA->id);

        $response->assertOk()->assertJsonCount(1, 'data.data');
        $this->assertSame($invoiceA->id, $response->json('data.data.0.id'));
        $this->assertArrayHasKey('invoice_number', $response->json('data.data.0'));
    }

    public function test_invoices_customer_id_excludes_other_customers(): void
    {
        $customerA = $this->createCustomer('Customer Alpha');
        $customerB = $this->createCustomer('Customer Beta');

        $this->createInvoice($this->createOrder($customerA, 'IA1'), 'IA1');
        $invoiceB = $this->createInvoice($this->createOrder($customerB, 'IB1'), 'IB1');

        $response = $this->getJson('/api/invoices?customer_id=' . $customerA->id);

        $ids = collect($response->json('data.data'))->pluck('id');
        $this->assertNotContains($invoiceB->id, $ids);
    }

    public function test_invoices_pagination_preserves_customer_id_filter(): void
    {
        $customerA = $this->createCustomer('Customer Alpha');
        $customerB = $this->createCustomer('Customer Beta');

        for ($i = 1; $i <= 3; $i++) {
            $this->createInvoice($this->createOrder($customerA, 'IA' . $i), 'IA' . $i);
        }
        $this->createInvoice($this->createOrder($customerB, 'IB1'), 'IB1');

        $page1 = $this->getJson('/api/invoices?customer_id=' . $customerA->id . '&per_page=2&page=1');
        $page1->assertOk()
            ->assertJsonPath('data.total', 3)
            ->assertJsonCount(2, 'data.data');

        $page2 = $this->getJson('/api/invoices?customer_id=' . $customerA->id . '&per_page=2&page=2');
        $page2->assertOk()
            ->assertJsonPath('data.total', 3)
            ->assertJsonCount(1, 'data.data');
    }

    // -------------------------------------------------------------------------
    // Inventory — category
    // -------------------------------------------------------------------------

    public function test_inventory_category_filter_returns_only_matching_category_items(): void
    {
        $warehouse = Warehouse::firstOrFail();
        $cakesCategory = Category::where('name', 'Cakes')->firstOrFail();
        $drinksCategory = Category::where('name', 'Drinks')->firstOrFail();

        $cakeProduct = Product::where('category_id', $cakesCategory->id)->firstOrFail();
        $drinkProduct = Product::create([
            'category_id' => $drinksCategory->id,
            'name' => 'Scope Test Drink',
            'slug' => 'scope-test-drink',
            'sku' => 'DRINK-SCOPE-001',
            'description' => 'Test drink',
            'price' => 10,
            'cost_price' => 5,
            'stock_quantity' => 5,
            'status' => 'active',
        ]);

        $cakeInventory = Inventory::create([
            'warehouse_id' => $warehouse->id,
            'product_id' => $cakeProduct->id,
            'quantity' => 10,
            'min_stock' => 2,
        ]);

        Inventory::create([
            'warehouse_id' => $warehouse->id,
            'product_id' => $drinkProduct->id,
            'quantity' => 8,
            'min_stock' => 2,
        ]);

        $response = $this->getJson('/api/inventory?category=Cakes');

        $response->assertOk();
        $ids = collect($response->json('data.data'))->pluck('id');
        $this->assertContains($cakeInventory->id, $ids->all());
        $this->assertTrue(
            collect($response->json('data.data'))->every(
                fn ($row) => ($row['product']['category_id'] ?? null) === $cakesCategory->id
                    || ($row['product']['category']['name'] ?? null) === 'Cakes'
            )
        );
    }

    public function test_inventory_category_filter_isolates_categories(): void
    {
        $warehouse = Warehouse::firstOrFail();
        $drinksCategory = Category::where('name', 'Drinks')->firstOrFail();

        $drinkProduct = Product::create([
            'category_id' => $drinksCategory->id,
            'name' => 'Scope Isolation Drink',
            'slug' => 'scope-isolation-drink',
            'sku' => 'DRINK-SCOPE-002',
            'description' => 'Test drink',
            'price' => 12,
            'cost_price' => 6,
            'stock_quantity' => 4,
            'status' => 'active',
        ]);

        $drinkInventory = Inventory::create([
            'warehouse_id' => $warehouse->id,
            'product_id' => $drinkProduct->id,
            'quantity' => 6,
            'min_stock' => 1,
        ]);

        $response = $this->getJson('/api/inventory?category=Cakes');

        $ids = collect($response->json('data.data'))->pluck('id');
        $this->assertNotContains($drinkInventory->id, $ids->all());
    }

    public function test_inventory_pagination_preserves_category_filter(): void
    {
        $warehouse = Warehouse::firstOrFail();
        $cakesCategory = Category::where('name', 'Cakes')->firstOrFail();

        for ($i = 1; $i <= 3; $i++) {
            $product = Product::create([
                'category_id' => $cakesCategory->id,
                'name' => 'Scope Cake ' . $i,
                'slug' => 'scope-cake-' . $i,
                'sku' => 'CAKE-SCOPE-' . $i,
                'description' => 'Pagination test cake',
                'price' => 50 + $i,
                'cost_price' => 25,
                'stock_quantity' => 5,
                'status' => 'active',
            ]);

            Inventory::create([
                'warehouse_id' => $warehouse->id,
                'product_id' => $product->id,
                'quantity' => 5 + $i,
                'min_stock' => 1,
            ]);
        }

        $page1 = $this->getJson('/api/inventory?category=Cakes&per_page=2&page=1');
        $page1->assertOk()
            ->assertJsonPath('data.total', 3)
            ->assertJsonCount(2, 'data.data');

        $page2 = $this->getJson('/api/inventory?category=Cakes&per_page=2&page=2');
        $page2->assertOk()
            ->assertJsonPath('data.total', 3)
            ->assertJsonCount(1, 'data.data');
    }

    public function test_inventory_meta_total_reflects_filtered_category_dataset(): void
    {
        $warehouse = Warehouse::firstOrFail();
        $cakesCategory = Category::where('name', 'Cakes')->firstOrFail();
        $drinksCategory = Category::where('name', 'Drinks')->firstOrFail();

        for ($i = 1; $i <= 2; $i++) {
            $cakeProduct = Product::create([
                'category_id' => $cakesCategory->id,
                'name' => 'Scope Total Cake ' . $i,
                'slug' => 'scope-total-cake-' . $i,
                'sku' => 'CAKE-TOTAL-' . $i,
                'description' => 'Total test cake',
                'price' => 40,
                'cost_price' => 20,
                'stock_quantity' => 5,
                'status' => 'active',
            ]);

            Inventory::create([
                'warehouse_id' => $warehouse->id,
                'product_id' => $cakeProduct->id,
                'quantity' => 10,
                'min_stock' => 1,
            ]);
        }

        $drinkProduct = Product::create([
            'category_id' => $drinksCategory->id,
            'name' => 'Scope Total Drink',
            'slug' => 'scope-total-drink',
            'sku' => 'DRINK-SCOPE-003',
            'description' => 'Test drink',
            'price' => 15,
            'cost_price' => 7,
            'stock_quantity' => 3,
            'status' => 'active',
        ]);

        Inventory::create([
            'warehouse_id' => $warehouse->id,
            'product_id' => $drinkProduct->id,
            'quantity' => 4,
            'min_stock' => 1,
        ]);

        $response = $this->getJson('/api/inventory?category=Cakes&per_page=1');
        $response->assertOk()->assertJsonPath('data.total', 2);
    }

    public function test_inventory_without_category_keeps_existing_filters(): void
    {
        $warehouse = Warehouse::firstOrFail();
        $product = Product::firstOrFail();

        Inventory::updateOrCreate(
            ['warehouse_id' => $warehouse->id, 'product_id' => $product->id],
            ['quantity' => 1, 'min_stock' => 10]
        );

        $response = $this->getJson('/api/inventory?low_stock=1');
        $response->assertOk();
        $this->assertNotEmpty($response->json('data.data'));
    }
}
