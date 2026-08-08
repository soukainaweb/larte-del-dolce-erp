<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('activity_logs') || ! Schema::hasColumn('activity_logs', 'user_id')) {
            return;
        }

        if ($this->isUserIdNullable()) {
            return;
        }

        Schema::table('activity_logs', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });

        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE activity_logs MODIFY user_id BIGINT UNSIGNED NULL');
        }

        Schema::table('activity_logs', function (Blueprint $table) {
            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        if (! Schema::hasTable('activity_logs') || ! Schema::hasColumn('activity_logs', 'user_id')) {
            return;
        }

        if (! $this->isUserIdNullable()) {
            return;
        }

        Schema::table('activity_logs', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });

        DB::statement('ALTER TABLE activity_logs MODIFY user_id BIGINT UNSIGNED NOT NULL');

        Schema::table('activity_logs', function (Blueprint $table) {
            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();
        });
    }

    private function isUserIdNullable(): bool
    {
        return match (DB::getDriverName()) {
            'mysql' => $this->mysqlColumnIsNullable('activity_logs', 'user_id'),
            'sqlite' => $this->sqliteColumnIsNullable('activity_logs', 'user_id'),
            default => false,
        };
    }

    private function mysqlColumnIsNullable(string $table, string $column): bool
    {
        $result = DB::selectOne('
            SELECT IS_NULLABLE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = ?
              AND COLUMN_NAME = ?
            LIMIT 1
        ', [$table, $column]);

        return strtoupper((string) ($result->IS_NULLABLE ?? 'NO')) === 'YES';
    }

    private function sqliteColumnIsNullable(string $table, string $column): bool
    {
        $columns = DB::select('PRAGMA table_info("' . str_replace('"', '""', $table) . '")');

        foreach ($columns as $info) {
            if (($info->name ?? null) === $column) {
                return (int) ($info->notnull ?? 1) === 0;
            }
        }

        return false;
    }
};
