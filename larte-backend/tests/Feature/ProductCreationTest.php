<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProductCreationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
        Storage::fake('public');
    }

    public function test_admin_can_create_product_without_sku(): void
    {
        $admin = User::where('email', 'madina7ali7@gmail.com')->firstOrFail();
        $category = Category::firstOrFail();
        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/products', [
            'name' => 'New ERP Product',
            'category_id' => $category->id,
            'price' => 150,
            'stock_quantity' => 12,
            'status' => 'active',
        ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'New ERP Product');

        $product = Product::where('name', 'New ERP Product')->first();
        $this->assertNotNull($product);
        $this->assertNotEmpty($product->slug);
        $this->assertNotEmpty($product->sku);
        $this->assertSame((int) $category->id, (int) $product->category_id);
    }

    public function test_admin_can_create_product_with_base64_image(): void
    {
        $admin = User::where('email', 'madina7ali7@gmail.com')->firstOrFail();
        $category = Category::firstOrFail();
        Sanctum::actingAs($admin);

        $base64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDAREAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQBAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AKpAP//Z';

        $response = $this->postJson('/api/products', [
            'name' => 'Product With Image',
            'sku' => 'IMG-001',
            'category_id' => $category->id,
            'price' => 99,
            'cost_price' => 40,
            'stock_quantity' => 5,
            'image' => $base64,
        ]);

        $response->assertCreated()
            ->assertJsonPath('success', true);

        $product = Product::where('sku', 'IMG-001')->firstOrFail();
        $this->assertNotNull($product->image);
        $this->assertStringStartsWith('products/', $product->image);
        Storage::disk('public')->assertExists($product->image);
        $this->assertStringContainsString('/storage/products/', $response->json('data.image'));
    }

    public function test_create_product_validation_error_returns_422_not_500(): void
    {
        $admin = User::where('email', 'madina7ali7@gmail.com')->firstOrFail();
        Sanctum::actingAs($admin);

        $this->postJson('/api/products', [
            'name' => '',
            'category_id' => 999999,
            'price' => -1,
            'stock_quantity' => -5,
        ])->assertStatus(422)->assertJsonPath('success', false);
    }

    public function test_admin_can_create_multiple_products_consecutively(): void
    {
        $admin = User::where('email', 'madina7ali7@gmail.com')->firstOrFail();
        $category = Category::firstOrFail();
        Sanctum::actingAs($admin);

        for ($i = 1; $i <= 3; $i++) {
            $response = $this->postJson('/api/products', [
                'name' => "Consecutive Product {$i}",
                'category_id' => $category->id,
                'price' => 100 + $i,
                'stock_quantity' => 10 + $i,
                'status' => 'active',
            ]);

            $response->assertCreated()
                ->assertJsonPath('success', true)
                ->assertJsonPath('data.name', "Consecutive Product {$i}");
        }

        $this->assertSame(3, Product::where('name', 'like', 'Consecutive Product %')->count());
    }

    public function test_duplicate_sku_returns_validation_error(): void
    {
        $admin = User::where('email', 'madina7ali7@gmail.com')->firstOrFail();
        $category = Category::firstOrFail();
        Sanctum::actingAs($admin);

        $this->postJson('/api/products', [
            'name' => 'Product One',
            'sku' => 'DUPE-SKU-001',
            'category_id' => $category->id,
            'price' => 50,
            'stock_quantity' => 5,
        ])->assertCreated();

        $this->postJson('/api/products', [
            'name' => 'Product Two',
            'sku' => 'DUPE-SKU-001',
            'category_id' => $category->id,
            'price' => 60,
            'stock_quantity' => 6,
        ])->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonValidationErrors(['sku']);
    }

    public function test_invalid_image_data_returns_422_not_server_error(): void
    {
        $admin = User::where('email', 'madina7ali7@gmail.com')->firstOrFail();
        $category = Category::firstOrFail();
        Sanctum::actingAs($admin);

        $this->postJson('/api/products', [
            'name' => 'Bad Image Product',
            'category_id' => $category->id,
            'price' => 50,
            'stock_quantity' => 5,
            'image' => 'not-a-valid-image',
        ])->assertStatus(422)->assertJsonPath('success', false);

        $this->postJson('/api/products', [
            'name' => 'Blob Image Product',
            'category_id' => $category->id,
            'price' => 50,
            'stock_quantity' => 5,
            'image' => 'blob:http://localhost/fake',
        ])->assertStatus(422)->assertJsonPath('success', false);
    }

    public function test_two_products_with_images_can_be_created_consecutively(): void
    {
        $admin = User::where('email', 'madina7ali7@gmail.com')->firstOrFail();
        $category = Category::firstOrFail();
        Sanctum::actingAs($admin);

        $base64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDAREAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQBAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AKpAP//Z';

        foreach (['Image Product A', 'Image Product B'] as $name) {
            $this->postJson('/api/products', [
                'name' => $name,
                'category_id' => $category->id,
                'price' => 99,
                'stock_quantity' => 5,
                'image' => $base64,
            ])->assertCreated()->assertJsonPath('success', true);
        }

        $this->assertSame(2, Product::whereIn('name', ['Image Product A', 'Image Product B'])->count());
    }
}
