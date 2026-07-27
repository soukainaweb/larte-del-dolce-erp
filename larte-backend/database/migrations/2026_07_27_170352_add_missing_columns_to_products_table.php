<?php
// database/migrations/2026_07_27_000000_add_missing_columns_to_products_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // ===========================
            // BASIC INFORMATION
            // ===========================
            
            // Arabic name
            $table->string('name_ar', 200)->nullable()->after('name');
            
            // Slug for SEO
            $table->string('slug')->unique()->nullable()->after('name_ar');
            
            // Barcode
            $table->string('barcode', 50)->nullable()->after('sku');
            
            // ===========================
            // DESCRIPTION
            // ===========================
            
            // Short description
            $table->string('short_description', 500)->nullable()->after('description');
            
            // ===========================
            // IMAGES
            // ===========================
            
            // Gallery images (JSON)
            $table->json('gallery')->nullable()->after('image');
            
            // ===========================
            // PRICING
            // ===========================
            
            // Wholesale price
            $table->decimal('wholesale_price', 15, 2)->nullable()->after('cost_price');
            
            // ===========================
            // STOCK
            // ===========================
            
            // Minimum stock alert
            $table->integer('min_stock_quantity')->nullable()->after('stock_quantity');
            
            // Maximum stock alert
            $table->integer('max_stock_quantity')->nullable()->after('min_stock_quantity');
            
            // ===========================
            // STATUS
            // ===========================
            
            // Featured product
            $table->boolean('featured')->default(false)->after('status');
            
            // ===========================
            // ADDITIONAL
            // ===========================
            
            // Tax rate
            $table->decimal('tax_rate', 5, 2)->default(0)->after('featured');
            
            // Weight
            $table->decimal('weight', 10, 2)->nullable()->after('tax_rate');
            
            // Unit (kg, g, L, mL, etc.)
            $table->string('unit', 20)->nullable()->after('weight');
            
            // Manufacturer
            $table->string('manufacturer')->nullable()->after('unit');
            
            // Brand
            $table->string('brand')->nullable()->after('manufacturer');
            
            // ===========================
            // AUDIT
            // ===========================
            
            // Created by
            $table->foreignId('created_by')
                ->nullable()
                ->after('brand')
                ->constrained('users')
                ->nullOnDelete();
            
            // Updated by
            $table->foreignId('updated_by')
                ->nullable()
                ->after('created_by')
                ->constrained('users')
                ->nullOnDelete();
            
            // ===========================
            // INDEXES
            // ===========================
            
            $table->index('barcode');
            $table->index('slug');
            $table->index('featured');
            $table->index('price');
            $table->index('stock_quantity');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Drop columns
            $table->dropColumn([
                'name_ar',
                'slug',
                'barcode',
                'short_description',
                'gallery',
                'wholesale_price',
                'min_stock_quantity',
                'max_stock_quantity',
                'featured',
                'tax_rate',
                'weight',
                'unit',
                'manufacturer',
                'brand',
                'created_by',
                'updated_by'
            ]);
            
            // Drop indexes
            $table->dropIndex(['barcode']);
            $table->dropIndex(['slug']);
            $table->dropIndex(['featured']);
            $table->dropIndex(['price']);
            $table->dropIndex(['stock_quantity']);
        });
    }
};