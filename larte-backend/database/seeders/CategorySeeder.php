<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Cakes', 'code' => 'CAKES', 'description' => 'Fresh cakes and desserts'],
            ['name' => 'Drinks', 'code' => 'DRINKS', 'description' => 'Hot and cold drinks'],
            ['name' => 'Sweets', 'code' => 'SWEETS', 'description' => 'Traditional sweets'],
        ];

        foreach ($categories as $category) {
            Category::create([
                'name' => $category['name'],
                'slug' => Str::slug($category['name']),
                'code' => $category['code'],
                'description' => $category['description'],
                'status' => 'active',
            ]);
        }
    }
}
