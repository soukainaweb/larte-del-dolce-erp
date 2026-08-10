<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (! Schema::hasColumn('orders', 'assigned_rep_id')) {
                $table->foreignId('assigned_rep_id')
                    ->nullable()
                    ->after('user_id')
                    ->constrained('users')
                    ->nullOnDelete();
            }

            if (! Schema::hasColumn('orders', 'pickup_photo')) {
                $table->string('pickup_photo')->nullable()->after('notes');
            }

            if (! Schema::hasColumn('orders', 'pickup_at')) {
                $table->timestamp('pickup_at')->nullable()->after('pickup_photo');
            }

            if (! Schema::hasColumn('orders', 'delivery_photo')) {
                $table->string('delivery_photo')->nullable()->after('pickup_at');
            }

            if (! Schema::hasColumn('orders', 'delivered_at')) {
                $table->timestamp('delivered_at')->nullable()->after('delivery_photo');
            }

            if (! Schema::hasColumn('orders', 'factory_postponed_reason')) {
                $table->text('factory_postponed_reason')->nullable()->after('delivered_at');
            }

            if (! Schema::hasColumn('orders', 'factory_postponed_until')) {
                $table->timestamp('factory_postponed_until')->nullable()->after('factory_postponed_reason');
            }
        });

        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'availability_status')) {
                $table->string('availability_status', 20)
                    ->default('unavailable')
                    ->after('status');
            }
        });

        // Remap legacy fully-approved orders to the factory queue (additive, non-destructive).
        // Run `php artisan erp:inspect-order-workflow-states` before production migration
        // to review other in-flight statuses (pending_manager, pending_accountant, etc.).
        if (Schema::hasTable('orders')) {
            DB::table('orders')
                ->where('status', 'approved')
                ->update(['status' => 'pending_factory']);
        }
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'assigned_rep_id')) {
                $table->dropConstrainedForeignId('assigned_rep_id');
            }

            foreach ([
                'pickup_photo',
                'pickup_at',
                'delivery_photo',
                'delivered_at',
                'factory_postponed_reason',
                'factory_postponed_until',
            ] as $column) {
                if (Schema::hasColumn('orders', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'availability_status')) {
                $table->dropColumn('availability_status');
            }
        });
    }
};
