<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_movements', function (Blueprint $table) {

            $table->id();

            // Product relation
            $table->foreignId('product_id')
                  ->constrained('products')
                  ->cascadeOnDelete();

            // Warehouse relation
            $table->foreignId('warehouse_id')
                  ->constrained('warehouses')
                  ->cascadeOnDelete();

            // User who made the movement
            $table->foreignId('user_id')
                  ->constrained('users')
                  ->cascadeOnDelete();

            $table->enum('type', [
                'IN',
                'OUT',
                'ADJUSTMENT'
            ]);

            $table->integer('quantity');

            $table->string('reason', 200)
                  ->nullable();

            $table->timestamps();


            // Indexes
            $table->index('product_id');
            $table->index('warehouse_id');
            $table->index('user_id');
            $table->index('type');
            $table->index('created_at');

        });
    }


    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};