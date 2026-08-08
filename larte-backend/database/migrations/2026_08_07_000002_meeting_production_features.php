<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $driver = Schema::getConnection()->getDriverName();
        if ($driver === 'mysql') {
            DB::statement(
                "ALTER TABLE meetings MODIFY COLUMN status ENUM('draft', 'scheduled', 'live', 'finished', 'cancelled') NOT NULL DEFAULT 'draft'"
            );
        }

        Schema::table('meeting_invitees', function (Blueprint $table) {
            $table->enum('invitation_status', ['pending', 'accepted', 'declined'])
                ->default('pending')
                ->after('role');
            $table->timestamp('responded_at')->nullable()->after('invited_at');
        });

        Schema::create('meeting_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('meeting_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action', 64);
            $table->text('description')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['meeting_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meeting_activities');

        Schema::table('meeting_invitees', function (Blueprint $table) {
            $table->dropColumn(['invitation_status', 'responded_at']);
        });

        $driver = Schema::getConnection()->getDriverName();
        if ($driver === 'mysql') {
            DB::statement(
                "ALTER TABLE meetings MODIFY COLUMN status ENUM('scheduled', 'live', 'finished', 'cancelled') NOT NULL DEFAULT 'scheduled'"
            );
        }
    }
};
