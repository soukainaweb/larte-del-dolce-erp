<?php

use App\Support\SqliteColumnMigrator;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Extend payment-related ENUM columns on MySQL production.
     *
     * SQLite tests keep the original create-table definitions, which store
     * enum values as text and do not require ALTER/MODIFY statements.
     */
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            $this->upgradeMysqlEnums();

            return;
        }

        if (DB::getDriverName() === 'sqlite') {
            $this->upgradeSqliteEnums();
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            $this->downgradeMysqlEnums();

            return;
        }

        if (DB::getDriverName() === 'sqlite') {
            $this->downgradeSqliteEnums();
        }
    }

    private function upgradeMysqlEnums(): void
    {
        if (Schema::hasTable('orders') && Schema::hasColumn('orders', 'payment_status')) {
            DB::statement("ALTER TABLE orders MODIFY payment_status ENUM('unpaid','paid','partial','refunded') NOT NULL DEFAULT 'unpaid'");
        }

        if (Schema::hasTable('payments')) {
            if (Schema::hasColumn('payments', 'status')) {
                DB::statement("ALTER TABLE payments MODIFY status ENUM('pending','partial','completed','failed','refunded') NOT NULL DEFAULT 'pending'");
            }

            if (Schema::hasColumn('payments', 'method')) {
                DB::statement("ALTER TABLE payments MODIFY method ENUM('cash','card','bank_transfer','mada','stc_pay','apple_pay','transfer','online') NOT NULL DEFAULT 'cash'");
            }
        }
    }

    private function downgradeMysqlEnums(): void
    {
        if (Schema::hasTable('orders') && Schema::hasColumn('orders', 'payment_status')) {
            DB::statement("ALTER TABLE orders MODIFY payment_status ENUM('unpaid','paid','partial') NOT NULL DEFAULT 'unpaid'");
        }

        if (Schema::hasTable('payments')) {
            if (Schema::hasColumn('payments', 'status')) {
                DB::statement("ALTER TABLE payments MODIFY status ENUM('pending','completed','failed') NOT NULL DEFAULT 'pending'");
            }

            if (Schema::hasColumn('payments', 'method')) {
                DB::statement("ALTER TABLE payments MODIFY method ENUM('cash','card','bank_transfer') NOT NULL DEFAULT 'cash'");
            }
        }
    }

    private function upgradeSqliteEnums(): void
    {
        if (Schema::hasTable('orders') && Schema::hasColumn('orders', 'payment_status')) {
            SqliteColumnMigrator::replaceStringColumn('orders', 'payment_status', 20, 'unpaid');
        }

        if (Schema::hasTable('payments')) {
            if (Schema::hasColumn('payments', 'status')) {
                SqliteColumnMigrator::replaceStringColumn('payments', 'status', 20, 'pending');
            }

            if (Schema::hasColumn('payments', 'method')) {
                SqliteColumnMigrator::replaceStringColumn('payments', 'method', 30, 'cash');
            }
        }
    }

    private function downgradeSqliteEnums(): void
    {
        // SQLite test databases are rebuilt from scratch; keep rollback as no-op.
    }
};
