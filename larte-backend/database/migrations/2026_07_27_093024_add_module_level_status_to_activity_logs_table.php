<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('activity_logs', function (Blueprint $table) {
            $table->string('module', 100)->nullable()->after('user_id');
            $table->string('level', 50)->nullable()->after('module');
            $table->string('status', 50)->nullable()->after('level');
        });
    }

    public function down(): void
    {
        Schema::table('activity_logs', function (Blueprint $table) {
            $table->dropColumn(['module', 'level', 'status']);
        });
    }
};