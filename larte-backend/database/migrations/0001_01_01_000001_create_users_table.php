<?php
// database/migrations/2014_10_12_000000_create_users_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();

            // ===========================
            // ROLE RELATIONSHIP
            // ===========================
            $table->foreignId('role_id')
                ->nullable()
                ->constrained('roles')
                ->nullOnDelete();

            // ===========================
            // PERSONAL INFORMATION
            // ===========================
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->string('email', 150)->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('phone', 20)->nullable();

            // ===========================
            // PROFILE
            // ===========================
            $table->string('avatar')->nullable();
            $table->date('birth_date')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->string('nationality', 100)->nullable();

            // ===========================
            // ADDRESS
            // ===========================
            $table->text('address')->nullable();
            $table->string('city', 100)->nullable();
            $table->string('postal_code', 20)->nullable();

            // ===========================
            // PROFESSIONAL INFORMATION
            // ===========================
            $table->string('employee_id', 50)->unique()->nullable();
            $table->string('department', 100)->nullable();
            $table->string('position', 100)->nullable();
            $table->date('hiring_date')->nullable();
            $table->string('company', 100)->nullable();
            $table->string('office', 100)->nullable();

            // ===========================
            // MANAGER
            // ===========================
            $table->foreignId('manager_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            // ===========================
            // STATUS
            // ===========================
            $table->enum('status', [
                'online',
                'offline',
                'away'
            ])->default('offline');

            // ===========================
            // SECURITY
            // ===========================
            $table->boolean('two_factor_enabled')->default(false);
            $table->string('two_factor_method', 20)->nullable();
            $table->rememberToken();
            $table->timestamp('last_login_at')->nullable();
            $table->string('last_login_ip', 45)->nullable();

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
            $table->index('email');
            $table->index('phone');
            $table->index('employee_id');
            $table->index('role_id');
            $table->index('status');
            $table->index('department');
            $table->index('deleted_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};