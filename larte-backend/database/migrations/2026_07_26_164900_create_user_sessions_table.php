<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('user_sessions', function (Blueprint $table) {

            $table->id();


            // User relation
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();


            // Device information
            $table->text('device')
                ->nullable();


            $table->string('browser')
                ->nullable();


            $table->string('ip_address')
                ->nullable();


            // Session status
            $table->timestamp('last_active_at')
                ->nullable();


            $table->boolean('is_current')
                ->default(false);


            // Optional security fields
            $table->string('session_token')
                ->nullable()
                ->unique();


            $table->timestamp('expires_at')
                ->nullable();


            $table->timestamps();


        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_sessions');
    }
};