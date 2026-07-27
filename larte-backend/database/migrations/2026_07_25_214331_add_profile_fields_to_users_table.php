<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {

            // Profile Information
            $table->text('address')
                ->nullable()
                ->after('avatar');

            $table->string('city')
                ->nullable()
                ->after('address');

            $table->string('country')
                ->nullable()
                ->after('city');


            // User Preferences
            $table->string('timezone')
                ->default('Asia/Riyadh')
                ->after('country');

            $table->string('date_format')
                ->default('d/m/Y')
                ->after('timezone');

            $table->string('currency')
                ->default('SAR')
                ->after('date_format');


            // Device Information
            $table->text('last_device')
                ->nullable()
                ->after('currency');

            $table->string('last_login_ip')
                ->nullable()
                ->after('last_device');
            $table->timestamp('last_login_at')
                ->nullable()
                ->after('last_login_ip');

        });
    }


    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {

            $table->dropColumn([
                'address',
                'city',
                'country',
                'timezone',
                'date_format',
                'currency',
                'last_device',
                'last_login_ip',
                'last_login_at',
            ]);

        });
    }
};