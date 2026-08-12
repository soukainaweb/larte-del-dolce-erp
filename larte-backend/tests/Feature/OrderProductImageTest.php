<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Customer;
use App\Models\Product;
use App\Models\User;
use App\Support\EnsureFactorySetup;
use App\Support\OrderWorkflow;
use Database\Seeders\SalesDemoSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrderProductImageTest extends TestCase
{
    use RefreshDatabase;

    private User $sales;
    private User $manager;
    private User $accountant;
    private User $responsible;
    private User $factory;
    private Customer $customer;
    private Category $category;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        $this->seed();

        $this->sales = User::where('email', SalesDemoSeeder::DEMO_EMAIL)->firstOrFail();
        $this->manager = User::where('email', 'manager@larte.com')->firstOrFail();
        $this->accountant = User::where('email', 'accountant@larte.com')->firstOrFail();
        $this->responsible = User::where('email', 'responsible@larte.com')->firstOrFail();
        EnsureFactorySetup::run('FactoryPass123!');
        $this->factory = User::where('email', EnsureFactorySetup::USER_EMAIL)->firstOrFail();
        $this->factory->update(['must_change_password' => false]);
        $this->customer = Customer::where('user_id', $this->sales->id)->firstOrFail();
        $this->category = Category::firstOrFail();
    }

    private function createProductWithImage(string $name, string $imagePath): Product
    {
        Storage::disk('public')->put($imagePath, 'fake-image-content');

        return Product::create([
            'category_id' => $this->category->id,
            'name' => $name,
            'slug' => str($name)->slug()->toString(),
            'sku' => 'IMG-' . uniqid(),
            'price' => 120,
            'stock_quantity' => 10,
            'status' => 'active',
            'image' => $imagePath,
        ]);
    }

    private function createOrderForProduct(Product $product): int
    {
        Sanctum::actingAs($this->sales);

        $response = $this->postJson('/api/orders', [
            'customer_id' => $this->customer->id,
            'sales_rep_id' => $this->sales->id,
            'items' => [
                ['product_id' => $product->id, 'quantity' => 2, 'price' => 120, 'discount' => 0],
            ],
        ]);

        $response->assertCreated();

        return (int) $response->json('data.id');
    }

    public function test_order_show_returns_public_product_image_urls(): void
    {
        $product = $this->createProductWithImage('كيك الشوكولاتة', 'products/test-order-image.jpg');
        $orderId = $this->createOrderForProduct($product);

        Sanctum::actingAs($this->manager);
        $this->postJson("/api/orders/{$orderId}/approve")->assertOk();

        Sanctum::actingAs($this->accountant);
        $this->postJson("/api/orders/{$orderId}/approve")->assertOk();

        Sanctum::actingAs($this->responsible);
        $this->postJson("/api/orders/{$orderId}/approve")->assertOk();

        Sanctum::actingAs($this->manager);
        $managerResponse = $this->getJson("/api/orders/{$orderId}");
        $managerResponse->assertOk();
        $managerImage = $managerResponse->json('data.items.0.product.image');
        $this->assertNotNull($managerImage);
        $this->assertStringContainsString('/storage/products/test-order-image.jpg', $managerImage);

        Sanctum::actingAs($this->factory);
        $factoryResponse = $this->getJson("/api/orders/{$orderId}");
        $factoryResponse->assertOk();
        $factoryImage = $factoryResponse->json('data.items.0.product.image');
        $this->assertSame($managerImage, $factoryImage);
    }

    public function test_factory_accept_response_includes_product_images(): void
    {
        $product = $this->createProductWithImage('تارت الفواكه', 'products/factory-visible-image.jpg');
        $orderId = $this->createOrderForProduct($product);

        Sanctum::actingAs($this->manager);
        $this->postJson("/api/orders/{$orderId}/approve")->assertOk();

        Sanctum::actingAs($this->accountant);
        $this->postJson("/api/orders/{$orderId}/approve")->assertOk();

        Sanctum::actingAs($this->responsible);
        $this->postJson("/api/orders/{$orderId}/approve")->assertOk();

        Sanctum::actingAs($this->factory);
        $acceptResponse = $this->postJson("/api/orders/{$orderId}/factory/accept");
        $acceptResponse->assertOk()
            ->assertJsonPath('data.status', OrderWorkflow::toFrontend(OrderWorkflow::PREPARING));

        $image = $acceptResponse->json('data.items.0.product.image');
        $this->assertNotNull($image);
        $this->assertStringContainsString('/storage/products/factory-visible-image.jpg', $image);
    }
}
