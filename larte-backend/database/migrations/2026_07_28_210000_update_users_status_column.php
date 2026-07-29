<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const TARGET_TYPE = 'varchar(50)';

    /**
     * Widen users.status so login can store presence values (online/offline/away)
     * and admin flows can store account values (active/inactive/suspended/locked).
     *
     * Idempotent: skips when column is already VARCHAR(50).
     */
    public function up(): void
    {
        if (! Schema::hasTable('users') || ! Schema::hasColumn('users', 'status')) {
            return;
        }

        match (DB::getDriverName()) {
            'mysql' => $this->upgradeMysqlStatusColumn(),
            'sqlite' => $this->upgradeSqliteStatusColumn(),
            default => null,
        };
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        if (! Schema::hasTable('users') || ! Schema::hasColumn('users', 'status')) {
            return;
        }

        DB::statement("ALTER TABLE users MODIFY status ENUM('online','offline','away') NOT NULL DEFAULT 'offline'");
    }

    private function upgradeMysqlStatusColumn(): void
    {
        $column = DB::selectOne("
            SELECT COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'users'
              AND COLUMN_NAME = 'status'
            LIMIT 1
        ");

        if ($column === null) {
            return;
        }

        $currentType = strtolower((string) $column->COLUMN_TYPE);

        if ($currentType === self::TARGET_TYPE) {
            return;
        }

        DB::statement("ALTER TABLE users MODIFY status VARCHAR(50) NOT NULL DEFAULT 'offline'");
    }

    private function upgradeSqliteStatusColumn(): void
    {
        if (! $this->sqliteStatusNeedsWidening('users')) {
            return;
        }

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('users_status_index');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('status_new', 50)->default('offline');
        });

        DB::table('users')->update(['status_new' => DB::raw('status')]);

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('status');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->renameColumn('status_new', 'status');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->index('status');
        });
    }

    private function sqliteStatusNeedsWidening(string $table): bool
    {
        if (in_array('status_new', Schema::getColumnListing($table), true)) {
            return true;
        }

        if (! Schema::hasColumn($table, 'status')) {
            return false;
        }

        $row = DB::selectOne(
            "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = ?",
            [$table]
        );

        $sql = (string) ($row->sql ?? '');

        return ! preg_match('/"status"\s+varchar\s*\(\s*50\s*\)/i', $sql);
    }
};
