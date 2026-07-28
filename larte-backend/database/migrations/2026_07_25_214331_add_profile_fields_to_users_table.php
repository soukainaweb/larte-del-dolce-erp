<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('country')->nullable()->after('postal_code');
            $table->string('timezone')->default('Asia/Riyadh')->after('country');
            $table->string('date_format')->default('d/m/Y')->after('timezone');
            $table->string('currency')->default('SAR')->after('date_format');
            $table->text('last_device')->nullable()->after('currency');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'country',
                'timezone',
                'date_format',
                'currency',
                'last_device',
            ]);
        });
    }
};
