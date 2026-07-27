<?php
// database/migrations/2026_07_27_000000_add_missing_columns_to_categories_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            // ===========================
            // BASIC INFORMATION
            // ===========================
            
            // Arabic name
            $table->string('name_ar', 100)->nullable()->after('name');
            
            // Slug for SEO
            $table->string('slug')->unique()->nullable()->after('name_ar');
            
            // Code
            $table->string('code', 50)->unique()->nullable()->after('slug');
            
            // ===========================
            // DESIGN
            // ===========================
            
            // Icon
            $table->string('icon')->nullable()->after('image');
            
            // Color
            $table->string('color')->default('#B8863B')->after('icon');
            
            // ===========================
            // STATUS
            // ===========================
            
            // Add 'archived' to status
            $table->enum('status', ['active', 'inactive', 'archived'])->default('active')->change();
            
            // Visibility
            $table->boolean('visible')->default(true)->after('status');
            
            // Featured
            $table->boolean('featured')->default(false)->after('visible');
            
            // ===========================
            // DISPLAY
            // ===========================
            
            // Display order
            $table->integer('display_order')->default(0)->after('featured');
            
            // ===========================
            // PARENT CATEGORY
            // ===========================
            
            // Parent category
            $table->foreignId('parent_id')
                ->nullable()
                ->after('display_order')
                ->constrained('categories')
                ->nullOnDelete();
            
            // ===========================
            // BUSINESS
            // ===========================
            
            // Show on POS
            $table->boolean('show_on_pos')->default(true)->after('parent_id');
            
            // Available online
            $table->boolean('available_online')->default(true)->after('show_on_pos');
            
            // ===========================
            // STATISTICS
            // ===========================
            
            // Product count (denormalized)
            $table->integer('product_count')->default(0)->after('available_online');
            
            // ===========================
            // AUDIT
            // ===========================
            
            // Created by
            $table->foreignId('created_by')
                ->nullable()
                ->after('product_count')
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
            
            $table->index('name_ar');
            $table->index('slug');
            $table->index('code');
            $table->index('visible');
            $table->index('featured');
            $table->index('parent_id');
            $table->index('display_order');
        });
    }

    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            // Drop columns
            $table->dropColumn([
                'name_ar',
                'slug',
                'code',
                'icon',
                'color',
                'visible',
                'featured',
                'display_order',
                'parent_id',
                'show_on_pos',
                'available_online',
                'product_count',
                'created_by',
                'updated_by'
            ]);
            
            // Revert status
            $table->enum('status', ['active', 'inactive'])->default('active')->change();
            
            // Drop indexes
            $table->dropIndex(['name_ar']);
            $table->dropIndex(['slug']);
            $table->dropIndex(['code']);
            $table->dropIndex(['visible']);
            $table->dropIndex(['featured']);
            $table->dropIndex(['parent_id']);
            $table->dropIndex(['display_order']);
        });
    }
};