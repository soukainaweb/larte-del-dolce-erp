<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Warehouse;
use App\Models\User;


class WarehouseSeeder extends Seeder
{

    public function run(): void
    {

        $manager = User::where('email','madina7ali7@gmail.com')->first();


        Warehouse::create([
            'name'=>'Main Warehouse',
            'location'=>'Larte Main Store',
            'manager_id'=>$manager->id,
            'status'=>'active'
        ]);

    }

}