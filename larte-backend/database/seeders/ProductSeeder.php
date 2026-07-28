<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $cakes = Category::where('name', 'Cakes')->first();

        if (!$cakes) {
            return;
        }

        $products = [
            [
                'name' => 'Signature Cake',
                'sku' => 'CAKE001',
                'description' => 'Special Larte cake',
                'price' => 120,
                'cost_price' => 60,
                'stock_quantity' => 20,
            ],
            [
                'name' => 'Chocolate Cake',
                'sku' => 'CAKE002',
                'description' => 'Chocolate dessert',
                'price' => 80,
                'cost_price' => 40,
                'stock_quantity' => 15,
            ],
        ];

        foreach ($products as $product) {
            Product::create([
                'category_id' => $cakes->id,
                'name' => $product['name'],
                'slug' => Str::slug($product['name']),
                'sku' => $product['sku'],
                'description' => $product['description'],
                'price' => $product['price'],
                'cost_price' => $product['cost_price'],
                'stock_quantity' => $product['stock_quantity'],
                'status' => 'active',
            ]);
        }
    }
}
