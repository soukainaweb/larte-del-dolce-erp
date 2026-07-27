<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('warehouses', function (Blueprint $table) {

            $table->id();

            $table->string('name',100);

            $table->string('location')->nullable();

            $table->foreignId('manager_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->enum('status',[
                'active',
                'inactive',
                'maintenance'
            ])->default('active');

            $table->timestamps();

            $table->softDeletes();


            $table->index('name');
            $table->index('status');
        });
    }


    public function down(): void
    {
        Schema::dropIfExists('warehouses');
    }
};