<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_sessions', function (Blueprint $table) {

            $table->id();


            // ===========================
            // USER RELATION
            // ===========================

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();


            // ===========================
            // DEVICE INFORMATION
            // ===========================

            $table->text('device')
                ->nullable();

            $table->string('browser')
                ->nullable();

            $table->string('ip_address')
                ->nullable();


            // ===========================
            // SESSION STATUS
            // ===========================

            $table->timestamp('last_active_at')
                ->nullable();

            $table->boolean('is_current')
                ->default(false);


            // ===========================
            // SECURITY
            // ===========================

            $table->string('session_token')
                ->nullable()
                ->unique();

            $table->timestamp('expires_at')
                ->nullable();


            // ===========================
            // TIMESTAMPS
            // ===========================

            $table->timestamps();


            // ===========================
            // INDEXES
            // ===========================

            $table->index('user_id');
            $table->index('is_current');
            $table->index('expires_at');

        });
    }


    public function down(): void
    {
        Schema::dropIfExists('user_sessions');
    }
};