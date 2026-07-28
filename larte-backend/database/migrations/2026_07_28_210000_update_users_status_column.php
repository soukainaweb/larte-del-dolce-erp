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

        if (DB::getDriverName() === 'mysql') {
            $this->upgradeMysqlStatusColumn();

            return;
        }

        Schema::table('users', function (Blueprint $table) {
            $table->string('status', 50)->default('offline')->change();
        });
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

        // Safe in STRICT mode: VARCHAR accepts all current ENUM/string values.
        DB::statement("ALTER TABLE users MODIFY status VARCHAR(50) NOT NULL DEFAULT 'offline'");
    }
};
