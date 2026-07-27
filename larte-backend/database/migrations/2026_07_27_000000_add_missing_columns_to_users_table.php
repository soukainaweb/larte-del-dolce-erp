<?php
// database/migrations/2026_07_27_000000_add_missing_columns_to_users_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Personal Information
            $table->string('first_name', 100)->after('id');
            $table->string('last_name', 100)->after('first_name');
            $table->string('phone', 20)->nullable()->change();

            // Profile
            $table->date('birth_date')->nullable()->after('avatar');
            $table->enum('gender', ['male', 'female', 'other'])->nullable()->after('birth_date');
            $table->string('nationality', 100)->nullable()->after('gender');

            // Address
            $table->text('address')->nullable()->after('nationality');
            $table->string('city', 100)->nullable()->after('address');
            $table->string('postal_code', 20)->nullable()->after('city');

            // Professional Information
            $table->string('employee_id', 50)->unique()->nullable()->after('postal_code');
            $table->string('department', 100)->nullable()->after('employee_id');
            $table->string('position', 100)->nullable()->after('department');
            $table->date('hiring_date')->nullable()->after('position');
            $table->string('company', 100)->nullable()->after('hiring_date');
            $table->string('office', 100)->nullable()->after('company');

            // Manager
            $table->foreignId('manager_id')
                ->nullable()
                ->after('office')
                ->constrained('users')
                ->nullOnDelete();

            // Security
            $table->boolean('two_factor_enabled')->default(false)->after('status');
            $table->string('two_factor_method', 20)->nullable()->after('two_factor_enabled');
            $table->string('last_login_ip', 45)->nullable()->after('last_login_at');

            // Audit
            $table->foreignId('created_by')
                ->nullable()
                ->after('last_login_ip')
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('updated_by')
                ->nullable()
                ->after('created_by')
                ->constrained('users')
                ->nullOnDelete();

            // Indexes
            $table->index('phone');
            $table->index('employee_id');
            $table->index('department');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'first_name',
                'last_name',
                'birth_date',
                'gender',
                'nationality',
                'address',
                'city',
                'postal_code',
                'employee_id',
                'department',
                'position',
                'hiring_date',
                'company',
                'office',
                'manager_id',
                'two_factor_enabled',
                'two_factor_method',
                'last_login_ip',
                'created_by',
                'updated_by'
            ]);

            $table->dropIndex(['phone']);
            $table->dropIndex(['employee_id']);
            $table->dropIndex(['department']);
        });
    }
};