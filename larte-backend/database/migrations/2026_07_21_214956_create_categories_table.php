<?php
// database/migrations/2026_07_21_000003_create_categories_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();

            // ===========================
            // BASIC INFORMATION
            // ===========================
            $table->string('name', 100);
            $table->string('name_ar', 100)->nullable();
            $table->string('slug')->unique();
            $table->string('code', 50)->unique();
            $table->text('description')->nullable();

            // ===========================
            // DESIGN
            // ===========================
            $table->string('image')->nullable();
            $table->string('icon')->nullable();
            $table->string('color')->default('#B8863B');

            // ===========================
            // STATUS
            // ===========================
            $table->enum('status', ['active', 'inactive', 'archived'])->default('active');
            $table->boolean('visible')->default(true);
            $table->boolean('featured')->default(false);

            // ===========================
            // DISPLAY
            // ===========================
            $table->integer('display_order')->default(0);

            // ===========================
            // PARENT CATEGORY
            // ===========================
            $table->foreignId('parent_id')
                ->nullable()
                ->constrained('categories')
                ->nullOnDelete();

            // ===========================
            // BUSINESS
            // ===========================
            $table->boolean('show_on_pos')->default(true);
            $table->boolean('available_online')->default(true);

            // ===========================
            // STATISTICS (Denormalized)
            // ===========================
            $table->integer('product_count')->default(0);

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
            $table->index('name');
            $table->index('name_ar');
            $table->index('slug');
            $table->index('code');
            $table->index('status');
            $table->index('visible');
            $table->index('featured');
            $table->index('parent_id');
            $table->index('display_order');
            $table->index('deleted_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};