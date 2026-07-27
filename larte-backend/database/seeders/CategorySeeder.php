<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;


class CategorySeeder extends Seeder
{
    public function run(): void
    {

        Category::create([
            'name'=>'Cakes',
            'description'=>'Fresh cakes and desserts',
            'status'=>'active'
        ]);


        Category::create([
            'name'=>'Drinks',
            'description'=>'Hot and cold drinks',
            'status'=>'active'
        ]);


        Category::create([
            'name'=>'Sweets',
            'description'=>'Traditional sweets',
            'status'=>'active'
        ]);

    }
}