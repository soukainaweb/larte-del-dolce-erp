<?php

use App\Support\SqliteColumnMigrator;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const TARGET_TYPE = 'varchar(50)';

    /**
     * Replace users.status ENUM with VARCHAR so the API can store presence
     * (online/offline/away) and account (active/inactive/suspended/locked) values.
     */
    public function up(): void
    {
        if (! Schema::hasTable('users') || ! Schema::hasColumn('users', 'status')) {
            return;
        }

        match (DB::getDriverName()) {
            'mysql' => $this->upgradeMysqlStatusColumn(),
            'sqlite' => SqliteColumnMigrator::replaceStringColumn(
                'users',
                'status',
                50,
                'offline',
                'users_status_index',
            ),
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
            SELECT COLUMN_TYPE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'users'
              AND COLUMN_NAME = 'status'
            LIMIT 1
        ");

        if ($column === null) {
            return;
        }

        if (strtolower((string) $column->COLUMN_TYPE) === self::TARGET_TYPE) {
            return;
        }

        DB::statement("ALTER TABLE users MODIFY status VARCHAR(50) NOT NULL DEFAULT 'offline'");
    }
};
