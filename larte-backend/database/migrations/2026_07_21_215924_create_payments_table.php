<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {

            $table->id();

            $table->foreignId('invoice_id')
                ->constrained('invoices')
                ->cascadeOnDelete();

            $table->decimal('amount', 10, 2);

            $table->enum('method', [
                'cash',
                'card',
                'bank_transfer',
                'mada',
                'stc_pay',
                'apple_pay',
                'transfer',
                'online'
            ]);

            $table->enum('status', [
                'pending',
                'partial',
                'completed',
                'failed',
                'refunded'
            ])->default('pending');

            $table->date('payment_date');

            $table->string('reference')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};