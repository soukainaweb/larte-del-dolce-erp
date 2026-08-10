<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Notification;
use App\Models\Product;
use App\Models\Role;
use App\Models\Sample;
use App\Models\User;
use Database\Seeders\SalesDemoSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrderCreationNotificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_order_form_options_available_for_sales_without_products_view(): void
    {
        $sales = User::where('email', SalesDemoSeeder::DEMO_EMAIL)->firstOrFail();
        Sanctum::actingAs($sales);

        $this->getJson('/api/products')->assertForbidden();

        $response = $this->getJson('/api/orders/form-options');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => ['customers', 'products', 'sales_reps'],
            ]);

        $this->assertNotEmpty($response->json('data.products'));
    }

    public function test_create_order_persists_items_and_notifies_stakeholders(): void
    {
        $sales = User::where('email', SalesDemoSeeder::DEMO_EMAIL)->firstOrFail();
        $manager = User::where('email', 'manager@larte.com')->firstOrFail();
        $customer = Customer::firstOrFail();
        $product = Product::firstOrFail();

        $accountantRole = Role::where('name', 'accountant')->firstOrFail();
        $accountant = User::updateOrCreate(
            ['email' => 'accountant.test@larte.com'],
            [
                'first_name' => 'Test',
                'last_name' => 'Accountant',
                'password' => '123456',
                'role_id' => $accountantRole->id,
                'status' => 'active',
            ]
        );

        Sanctum::actingAs($sales);

        $response = $this->postJson('/api/orders', [
            'customer_id' => $customer->id,
            'sales_rep_id' => $sales->id,
            'priority' => 'high',
            'delivery_date' => now()->addDays(2)->toDateString(),
            'delivery_time' => '14:00',
            'payment_method' => 'cash',
            'notes' => 'Test order from feature test',
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 2,
                    'price' => 100,
                    'discount' => 5,
                ],
            ],
        ]);

        $response->assertCreated()
            ->assertJsonPath('success', true);

        $orderId = $response->json('data.id');
        $this->assertDatabaseHas('orders', [
            'id' => $orderId,
            'customer_id' => $customer->id,
            'user_id' => $sales->id,
        ]);
        $this->assertDatabaseHas('order_items', [
            'order_id' => $orderId,
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        $this->assertSame('pending_manager', $response->json('data.status'));

        $this->assertDatabaseHas('notifications', [
            'user_id' => $manager->id,
            'type' => 'order',
        ]);
        $this->assertDatabaseHas('notifications', [
            'user_id' => $sales->id,
            'type' => 'order',
            'title' => 'تم إرسال الطلب',
        ]);

        $managerNotification = Notification::where('user_id', $manager->id)
            ->where('type', 'order')
            ->where('title', 'طلب جديد يحتاج موافقتك')
            ->first();
        $this->assertNotNull($managerNotification);
        $this->assertStringContainsString($response->json('data.order_number'), $managerNotification->message);

        $this->assertDatabaseMissing('notifications', [
            'user_id' => $accountant->id,
            'type' => 'order',
            'title' => 'طلب جديد',
        ]);
    }

    public function test_create_sample_notifies_manager(): void
    {
        $sales = User::where('email', SalesDemoSeeder::DEMO_EMAIL)->firstOrFail();
        $manager = User::where('email', 'manager@larte.com')->firstOrFail();

        Sanctum::actingAs($sales);

        $response = $this->postJson('/api/samples', [
            'name' => 'E2E Sample Notification',
            'quantity' => 1,
            'status' => 'pending',
            'notes' => 'Notification test',
        ]);

        $response->assertCreated();

        $this->assertDatabaseHas('notifications', [
            'user_id' => $manager->id,
            'type' => 'sample',
            'title' => 'عينة جديدة',
        ]);

        $this->assertDatabaseMissing('notifications', [
            'user_id' => $sales->id,
            'type' => 'sample',
        ]);
    }

    public function test_create_order_validation_returns_422(): void
    {
        Sanctum::actingAs(User::where('email', 'madina7ali7@gmail.com')->firstOrFail());

        $this->postJson('/api/orders', [
            'title' => 'invalid',
        ])->assertStatus(422)->assertJsonPath('success', false);
    }
}
