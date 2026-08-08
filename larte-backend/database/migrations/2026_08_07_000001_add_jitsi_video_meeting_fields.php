<?php

use App\Support\SqliteColumnMigrator;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('meetings', function (Blueprint $table) {
            $table->string('room_name', 120)->nullable()->unique()->after('title');
            $table->timestamp('started_at')->nullable()->after('status');
            $table->timestamp('ended_at')->nullable()->after('started_at');
        });

        foreach (DB::table('meetings')->whereNull('room_name')->get(['id']) as $meeting) {
            DB::table('meetings')->where('id', $meeting->id)->update([
                'room_name' => 'larte-' . Str::lower(Str::random(12)) . '-' . $meeting->id,
            ]);
        }

        DB::table('meetings')->where('status', 'completed')->update(['status' => 'finished']);

        $driver = Schema::getConnection()->getDriverName();
        if ($driver === 'sqlite') {
            SqliteColumnMigrator::replaceCheckedEnumColumn(
                'meetings',
                'status',
                20,
                'scheduled',
                ['meetings_meeting_date_status_index' => ['meeting_date', 'status']],
            );
        } elseif ($driver === 'mysql') {
            DB::statement(
                "ALTER TABLE meetings MODIFY COLUMN status ENUM('scheduled', 'live', 'finished', 'cancelled') NOT NULL DEFAULT 'scheduled'"
            );
        }

        Schema::create('meeting_invitees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('meeting_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('email');
            $table->enum('role', ['host', 'participant'])->default('participant');
            $table->timestamp('invited_at')->nullable();
            $table->timestamps();

            $table->unique(['meeting_id', 'email']);
            $table->index(['meeting_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meeting_invitees');

        DB::table('meetings')->where('status', 'finished')->update(['status' => 'completed']);

        $driver = Schema::getConnection()->getDriverName();
        if ($driver === 'mysql') {
            DB::statement(
                "ALTER TABLE meetings MODIFY COLUMN status ENUM('scheduled', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled'"
            );
        }

        Schema::table('meetings', function (Blueprint $table) {
            $table->dropColumn(['room_name', 'started_at', 'ended_at']);
        });
    }
};
