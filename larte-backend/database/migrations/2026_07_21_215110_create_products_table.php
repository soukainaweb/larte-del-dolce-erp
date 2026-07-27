<?php
// database/migrations/2026_07_21_000004_create_products_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {

            $table->id();

            // ===========================
            // BASIC INFORMATION
            // ===========================

            $table->string('name', 200);
            $table->string('name_ar', 200)->nullable();
            $table->string('slug')->unique();
            $table->string('sku', 50)->unique();
            $table->string('barcode', 50)->nullable();

            // ===========================
            // CATEGORY
            // ===========================

            $table->foreignId('category_id')
                ->nullable()
                ->constrained('categories')
                ->nullOnDelete();

            // ===========================
            // DESCRIPTION
            // ===========================

            $table->text('description')->nullable();
            $table->string('short_description', 500)->nullable();

            // ===========================
            // IMAGES
            // ===========================

            $table->string('image')->nullable();
            $table->json('gallery')->nullable();

            // ===========================
            // PRICING
            // ===========================

            $table->decimal('price', 15, 2)->default(0);
            $table->decimal('cost_price', 15, 2)->default(0);
            $table->decimal('wholesale_price', 15, 2)->nullable();

            // ===========================
            // STOCK
            // ===========================

            $table->integer('stock_quantity')->default(0);
            $table->integer('min_stock_quantity')->nullable();
            $table->integer('max_stock_quantity')->nullable();

            // ===========================
            // STATUS
            // ===========================

            $table->enum('status', [
                'active',
                'inactive',
                'out_of_stock',
                'low_stock'
            ])->default('active');

            $table->boolean('featured')->default(false);

            // ===========================
            // ADDITIONAL
            // ===========================

            $table->decimal('tax_rate', 5, 2)->default(0);
            $table->decimal('weight', 10, 2)->nullable();
            $table->string('unit', 20)->nullable();
            $table->string('manufacturer')->nullable();
            $table->string('brand')->nullable();

            // ===========================
            // AUDIT
            // ===========================

            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('updated_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            // ===========================
            // TIMESTAMPS
            // ===========================

            $table->timestamps();
            $table->softDeletes();

            // ===========================
            // INDEXES
            // ===========================

            $table->index('sku');
            $table->index('barcode');
            $table->index('slug');
            $table->index('category_id');
            $table->index('status');
            $table->index('featured');
            $table->index('price');
            $table->index('stock_quantity');
            $table->index('deleted_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};