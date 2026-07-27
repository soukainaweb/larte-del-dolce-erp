<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {

            $table->id();

            $table->string('driver_name', 100);

            $table->string('plate_number', 20)
                  ->unique();

            $table->string('type', 50);

            $table->enum('status', [
                'active',
                'inactive',
                'maintenance'
            ])->default('active');

            $table->timestamps();

            $table->softDeletes();


            // Indexes
            $table->index('plate_number');
            $table->index('driver_name');
            $table->index('status');
            $table->index('deleted_at');

        });
    }


    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};