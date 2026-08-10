<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('orders')
            ->where('status', 'submitted')
            ->update(['status' => 'pending_accountant']);

        DB::table('order_status_histories')
            ->where('to_status', 'submitted')
            ->update(['to_status' => 'pending_accountant']);

        DB::table('order_status_histories')
            ->where('from_status', 'submitted')
            ->update(['from_status' => 'pending_accountant']);
    }

    public function down(): void
    {
        DB::table('orders')
            ->where('status', 'pending_accountant')
            ->update(['status' => 'submitted']);

        DB::table('order_status_histories')
            ->where('to_status', 'pending_accountant')
            ->update(['to_status' => 'submitted']);

        DB::table('order_status_histories')
            ->where('from_status', 'pending_accountant')
            ->update(['from_status' => 'submitted']);
    }
};
