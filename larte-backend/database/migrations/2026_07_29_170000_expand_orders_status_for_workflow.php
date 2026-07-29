<?php

use App\Support\SqliteColumnMigrator;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('orders') || ! Schema::hasColumn('orders', 'status')) {
            return;
        }

        match (DB::getDriverName()) {
            'mysql' => $this->upgradeMysqlOrdersStatusColumn(),
            'sqlite' => SqliteColumnMigrator::replaceStringColumn('orders', 'status', 50, 'draft'),
            default => null,
        };

        $this->migrateLegacyOrderStatuses();
    }

    public function down(): void
    {
        if (! Schema::hasTable('orders')) {
            return;
        }

        $this->restoreLegacyOrderStatuses();

        if (DB::getDriverName() === 'mysql') {
            DB::statement("
                ALTER TABLE orders
                MODIFY status ENUM('pending','confirmed','processing','completed','cancelled')
                NOT NULL DEFAULT 'pending'
            ");
        } elseif (DB::getDriverName() === 'sqlite') {
            $this->downgradeSqliteOrdersStatusColumn();
        }
    }

    private function upgradeMysqlOrdersStatusColumn(): void
    {
        if ($this->mysqlColumnType('orders', 'status') === 'varchar(50)') {
            return;
        }

        DB::statement("ALTER TABLE orders MODIFY status VARCHAR(50) NOT NULL DEFAULT 'draft'");
    }

    private function downgradeSqliteOrdersStatusColumn(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->enum('status_new', ['pending', 'confirmed', 'processing', 'completed', 'cancelled'])
                ->default('pending');
        });

        DB::table('orders')->update(['status_new' => DB::raw('status')]);

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('status');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->renameColumn('status_new', 'status');
        });
    }

    private function migrateLegacyOrderStatuses(): void
    {
        DB::table('orders')->where('status', 'pending')->update(['status' => 'submitted']);
        DB::table('orders')->where('status', 'confirmed')->update(['status' => 'approved']);
        DB::table('orders')->where('status', 'processing')->update(['status' => 'preparing']);
        DB::table('orders')->where('status', 'completed')->update(['status' => 'delivered']);
    }

    private function restoreLegacyOrderStatuses(): void
    {
        DB::table('orders')->where('status', 'submitted')->update(['status' => 'pending']);
        DB::table('orders')->where('status', 'approved')->update(['status' => 'confirmed']);
        DB::table('orders')->where('status', 'preparing')->update(['status' => 'processing']);
        DB::table('orders')->where('status', 'ready')->update(['status' => 'processing']);
        DB::table('orders')->where('status', 'assigned')->update(['status' => 'processing']);
        DB::table('orders')->where('status', 'delivered')->update(['status' => 'completed']);
        DB::table('orders')->where('status', 'draft')->update(['status' => 'pending']);
    }

    private function mysqlColumnType(string $table, string $column): ?string
    {
        $result = DB::selectOne("
            SELECT COLUMN_TYPE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = ?
              AND COLUMN_NAME = ?
            LIMIT 1
        ", [$table, $column]);

        if ($result === null) {
            return null;
        }

        return strtolower((string) $result->COLUMN_TYPE);
    }
};
