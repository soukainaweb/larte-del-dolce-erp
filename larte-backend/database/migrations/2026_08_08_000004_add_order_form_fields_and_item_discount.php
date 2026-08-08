<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->enum('priority', ['low', 'medium', 'high'])->default('medium')->after('payment_status');
            $table->date('delivery_date')->nullable()->after('priority');
            $table->time('delivery_time')->nullable()->after('delivery_date');
            $table->string('payment_method', 32)->nullable()->after('delivery_time');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->decimal('discount', 5, 2)->default(0)->after('price');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['priority', 'delivery_date', 'delivery_time', 'payment_method']);
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn('discount');
        });
    }
};
