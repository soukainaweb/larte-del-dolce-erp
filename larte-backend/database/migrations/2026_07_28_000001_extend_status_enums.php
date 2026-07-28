<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::statement("ALTER TABLE orders MODIFY payment_status ENUM('unpaid','paid','partial','refunded') NOT NULL DEFAULT 'unpaid'");
        DB::statement("ALTER TABLE payments MODIFY status ENUM('pending','partial','completed','failed','refunded') NOT NULL DEFAULT 'pending'");
        DB::statement("ALTER TABLE payments MODIFY method ENUM('cash','card','bank_transfer','mada','stc_pay','apple_pay','transfer','online') NOT NULL DEFAULT 'cash'");
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::statement("ALTER TABLE orders MODIFY payment_status ENUM('unpaid','paid','partial') NOT NULL DEFAULT 'unpaid'");
        DB::statement("ALTER TABLE payments MODIFY status ENUM('pending','completed','failed') NOT NULL DEFAULT 'pending'");
        DB::statement("ALTER TABLE payments MODIFY method ENUM('cash','card','bank_transfer') NOT NULL DEFAULT 'cash'");
    }
};
