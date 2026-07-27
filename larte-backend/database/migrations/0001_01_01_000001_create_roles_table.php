<?php
// database/migrations/2026_07_21_000001_create_roles_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {

            $table->id();

            // ===========================
            // BASIC INFORMATION
            // ===========================

            $table->string('name', 100)->unique();
            $table->string('display_name', 100);
            $table->text('description')->nullable();


            // ===========================
            // DESIGN
            // ===========================

            $table->string('color', 20)
                ->default('#C8A45D');

            $table->string('icon', 50)
                ->default('Shield');


            // ===========================
            // STATUS
            // ===========================

            $table->enum('status', [
                'active',
                'inactive'
            ])->default('active');

            $table->boolean('is_system')
                ->default(false);


            // ===========================
            // STATISTICS
            // ===========================

            $table->integer('users_count')
                ->default(0);

            $table->integer('permissions_count')
                ->default(0);


            // ===========================
            // SECURITY
            // ===========================

            $table->string('guard_name')
                ->default('web');


            // ===========================
            // AUDIT
            // ===========================

            // نخليوهم columns فقط
            // Foreign keys غادي نزيدوهم من بعد

            $table->foreignId('created_by')
                ->nullable();

            $table->foreignId('updated_by')
                ->nullable();


            // ===========================
            // TIMESTAMPS
            // ===========================

            $table->timestamps();

            $table->softDeletes();


            // ===========================
            // INDEXES
            // ===========================

            $table->index('name');
            $table->index('status');
            $table->index('is_system');
            $table->index('deleted_at');

        });
    }


    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};