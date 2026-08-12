<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProductListTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_created_product_appears_in_paginated_products_list(): void
    {
        $admin = User::where('email', 'madina7ali7@gmail.com')->firstOrFail();
        $category = Category::firstOrFail();
        Sanctum::actingAs($admin);

        $create = $this->postJson('/api/products', [
            'name' => 'List Visibility Product',
            'category_id' => $category->id,
            'price' => 75,
            'stock_quantity' => 8,
            'status' => 'active',
        ]);

        $create->assertCreated();
        $productId = (int) $create->json('data.id');

        $list = $this->getJson('/api/products?per_page=100');

        $list->assertOk()
            ->assertJsonPath('success', true);

        $items = $list->json('data.data');
        $this->assertIsArray($items);

        $match = collect($items)->firstWhere('id', $productId);
        $this->assertNotNull($match, 'Created product must appear in GET /api/products paginator data');
        $this->assertSame('List Visibility Product', $match['name']);
        $this->assertSame('active', $match['status']);
    }

    public function test_product_list_supports_search_and_status_filters(): void
    {
        $admin = User::where('email', 'madina7ali7@gmail.com')->firstOrFail();
        $category = Category::firstOrFail();
        Sanctum::actingAs($admin);

        $this->postJson('/api/products', [
            'name' => 'Filter Target Product',
            'sku' => 'FLT-001',
            'category_id' => $category->id,
            'price' => 10,
            'stock_quantity' => 1,
            'status' => 'active',
        ])->assertCreated();

        $this->getJson('/api/products?search=Filter+Target')
            ->assertOk()
            ->assertJsonFragment(['name' => 'Filter Target Product']);

        $this->getJson('/api/products?status=active&search=FLT-001')
            ->assertOk()
            ->assertJsonFragment(['sku' => 'FLT-001']);
    }

    public function test_product_list_is_not_empty_after_seeded_products_exist(): void
    {
        $admin = User::where('email', 'madina7ali7@gmail.com')->firstOrFail();
        Sanctum::actingAs($admin);

        $this->assertGreaterThan(0, Product::count());

        $response = $this->getJson('/api/products?per_page=10');

        $response->assertOk();
        $this->assertNotEmpty($response->json('data.data'));
        $this->assertGreaterThan(0, (int) $response->json('data.total'));
    }
}
