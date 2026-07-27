<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('suppliers', function (Blueprint $table) {

            $table->id();

            $table->string('name', 100);

            $table->string('phone', 20);

            $table->string('email', 100)
                  ->unique();

            $table->text('address')
                  ->nullable();

            $table->enum('status', [
                'active',
                'inactive'
            ])->default('active');

            $table->timestamps();

            $table->softDeletes();


            // Indexes
            $table->index('name');
            $table->index('email');
            $table->index('status');
            $table->index('deleted_at');

        });
    }


    public function down(): void
    {
        Schema::dropIfExists('suppliers');
    }
};