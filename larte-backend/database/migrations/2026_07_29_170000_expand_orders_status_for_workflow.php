<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('orders') || !Schema::hasColumn('orders', 'status')) {
            return;
        }

        Schema::table('orders', function (Blueprint $table) {
            $table->string('status', 50)->default('draft')->change();
        });

        DB::table('orders')->where('status', 'pending')->update(['status' => 'submitted']);
        DB::table('orders')->where('status', 'confirmed')->update(['status' => 'approved']);
        DB::table('orders')->where('status', 'processing')->update(['status' => 'preparing']);
        DB::table('orders')->where('status', 'completed')->update(['status' => 'delivered']);
    }

    public function down(): void
    {
        if (!Schema::hasTable('orders')) {
            return;
        }

        DB::table('orders')->where('status', 'submitted')->update(['status' => 'pending']);
        DB::table('orders')->where('status', 'approved')->update(['status' => 'confirmed']);
        DB::table('orders')->where('status', 'preparing')->update(['status' => 'processing']);
        DB::table('orders')->where('status', 'ready')->update(['status' => 'processing']);
        DB::table('orders')->where('status', 'assigned')->update(['status' => 'processing']);
        DB::table('orders')->where('status', 'delivered')->update(['status' => 'completed']);
        DB::table('orders')->where('status', 'draft')->update(['status' => 'pending']);

        Schema::table('orders', function (Blueprint $table) {
            $table->enum('status', ['pending', 'confirmed', 'processing', 'completed', 'cancelled'])
                ->default('pending')
                ->change();
        });
    }
};
