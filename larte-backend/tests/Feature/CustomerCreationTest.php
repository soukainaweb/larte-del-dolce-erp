<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Product;
use App\Models\User;
use Database\Seeders\SalesDemoSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CustomerCreationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_admin_can_create_customer_with_required_fields(): void
    {
        $admin = User::where('email', 'madina7ali7@gmail.com')->firstOrFail();
        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/customers', [
            'name' => 'شركة ABC',
            'address' => 'شارع الملك فهد',
            'city' => 'الرياض',
        ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'شركة ABC')
            ->assertJsonPath('data.city', 'الرياض');

        $this->assertDatabaseHas('customers', [
            'name' => 'شركة ABC',
            'address' => 'شارع الملك فهد',
            'city' => 'الرياض',
            'status' => 'active',
        ]);
    }

    public function test_manager_can_create_customer(): void
    {
        $manager = User::where('email', 'manager@larte.com')->firstOrFail();
        Sanctum::actingAs($manager);

        $this->postJson('/api/customers', [
            'name' => 'عميل المدير',
            'address' => 'حي النخيل',
            'city' => 'جدة',
        ])->assertCreated();
    }

    public function test_sales_representative_can_create_customer(): void
    {
        $sales = User::where('email', SalesDemoSeeder::DEMO_EMAIL)->firstOrFail();
        Sanctum::actingAs($sales);

        $response = $this->postJson('/api/customers', [
            'name' => 'عميل المندوب',
            'address' => 'طريق الأمير',
            'city' => 'الدمام',
        ]);

        $response->assertCreated();

        $this->assertDatabaseHas('customers', [
            'name' => 'عميل المندوب',
            'city' => 'الدمام',
            'user_id' => $sales->id,
        ]);
    }

    public function test_customer_requires_name_address_and_city(): void
    {
        $admin = User::where('email', 'madina7ali7@gmail.com')->firstOrFail();
        Sanctum::actingAs($admin);

        $this->postJson('/api/customers', [
            'address' => 'شارع',
            'city' => 'الرياض',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);

        $this->postJson('/api/customers', [
            'name' => 'شركة',
            'city' => 'الرياض',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['address']);

        $this->postJson('/api/customers', [
            'name' => 'شركة',
            'address' => 'شارع',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['city']);
    }

    public function test_customer_validation_messages_are_arabic(): void
    {
        $admin = User::where('email', 'madina7ali7@gmail.com')->firstOrFail();
        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/customers', []);

        $response->assertUnprocessable();
        $this->assertSame('اسم العميل مطلوب', $response->json('errors.name.0'));
        $this->assertSame('العنوان مطلوب', $response->json('errors.address.0'));
        $this->assertSame('المدينة مطلوبة', $response->json('errors.city.0'));
    }

    public function test_new_customer_appears_in_order_form_options_and_can_be_used_in_order(): void
    {
        $sales = User::where('email', SalesDemoSeeder::DEMO_EMAIL)->firstOrFail();
        $product = Product::firstOrFail();
        Sanctum::actingAs($sales);

        $create = $this->postJson('/api/customers', [
            'name' => 'عميل الطلب',
            'address' => 'شارع التحلية',
            'city' => 'مكة',
        ])->assertCreated();

        $customerId = $create->json('data.id');

        $options = $this->getJson('/api/orders/form-options')
            ->assertOk()
            ->json('data.customers');

        $this->assertTrue(collect($options)->contains(fn ($c) => (int) $c['id'] === (int) $customerId));

        $this->postJson('/api/orders', [
            'customer_id' => $customerId,
            'sales_rep_id' => $sales->id,
            'payment_method' => 'credit',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1, 'price' => 100, 'discount' => 0],
            ],
        ])->assertCreated()
            ->assertJsonPath('data.payment_method', 'credit');
    }

    public function test_order_store_accepts_credit_payment_method(): void
    {
        $sales = User::where('email', SalesDemoSeeder::DEMO_EMAIL)->firstOrFail();
        $customer = Customer::where('user_id', $sales->id)->firstOrFail();
        $product = Product::firstOrFail();
        Sanctum::actingAs($sales);

        $this->postJson('/api/orders', [
            'customer_id' => $customer->id,
            'sales_rep_id' => $sales->id,
            'payment_method' => 'credit',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1, 'price' => 50, 'discount' => 0],
            ],
        ])->assertCreated()
            ->assertJsonPath('data.payment_method', 'credit');
    }
}
