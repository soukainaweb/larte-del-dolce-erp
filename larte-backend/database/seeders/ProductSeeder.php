<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Category;


class ProductSeeder extends Seeder
{

    public function run(): void
    {

        $cakes = Category::where('name','Cakes')->first();


        Product::create([
            'category_id'=>$cakes->id,
            'name'=>'Signature Cake',
            'sku'=>'CAKE001',
            'description'=>'Special Larte cake',
            'price'=>120,
            'cost_price'=>60,
            'stock_quantity'=>20,
            'status'=>'active'
        ]);


        Product::create([
            'category_id'=>$cakes->id,
            'name'=>'Chocolate Cake',
            'sku'=>'CAKE002',
            'description'=>'Chocolate dessert',
            'price'=>80,
            'cost_price'=>40,
            'stock_quantity'=>15,
            'status'=>'active'
        ]);

    }

}