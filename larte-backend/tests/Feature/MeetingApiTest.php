<?php

namespace Tests\Feature;

use App\Models\Meeting;
use App\Models\MeetingActivity;
use App\Models\MeetingInvitee;
use App\Models\Notification;
use App\Models\User;
use Database\Seeders\SalesDemoSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MeetingApiTest extends TestCase
{
    use RefreshDatabase;

    protected function actingAsAdmin(): self
    {
        Sanctum::actingAs(User::where('email', 'madina7ali7@gmail.com')->firstOrFail());

        return $this;
    }

    protected function actingAsSalesDemo(): self
    {
        Sanctum::actingAs(User::where('email', SalesDemoSeeder::DEMO_EMAIL)->firstOrFail());

        return $this;
    }

    protected function actingAsOtherSales(): self
    {
        Sanctum::actingAs(User::where('email', 'other.sales@larte.com')->firstOrFail());

        return $this;
    }

    protected function actingAsUser(User $user): self
    {
        Sanctum::actingAs($user);

        return $this;
    }

    protected function meetingPayload(array $overrides = []): array
    {
        return array_merge([
            'title' => 'API test meeting',
            'meeting_date' => now()->addDay()->toDateString(),
            'meeting_time' => '10:00',
            'notes' => 'Created from MeetingApiTest',
            'invitee_user_ids' => [],
        ], $overrides);
    }

    public function test_unauthenticated_requests_are_rejected(): void
    {
        $this->seed();

        $this->getJson('/api/meetings')->assertUnauthorized();
        $this->postJson('/api/meetings', $this->meetingPayload())->assertUnauthorized();
    }

    public function test_create_meeting_as_draft_with_room_name(): void
    {
        $this->seed();
        Mail::fake();

        $response = $this->actingAsAdmin()->postJson('/api/meetings', $this->meetingPayload());

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', Meeting::STATUS_DRAFT)
            ->assertJsonPath('data.title', 'API test meeting');

        $meetingId = $response->json('data.id');
        $meeting = Meeting::findOrFail($meetingId);
        $this->assertNotEmpty($meeting->room_name);
        $this->assertStringStartsWith('larte-', $meeting->room_name);
        $this->assertDatabaseHas('meeting_activities', [
            'meeting_id' => $meetingId,
            'action' => MeetingActivity::ACTION_CREATED,
        ]);

        Mail::assertNothingSent();
    }

    public function test_create_with_publish_schedules_and_notifies(): void
    {
        $this->seed();
        Mail::fake();

        $manager = User::where('email', 'manager@larte.com')->firstOrFail();

        $response = $this->actingAsAdmin()->postJson('/api/meetings', $this->meetingPayload([
            'publish' => true,
            'invitee_user_ids' => [$manager->id],
        ]));

        $response->assertCreated()->assertJsonPath('data.status', Meeting::STATUS_SCHEDULED);

        $meetingId = $response->json('data.id');
        $this->assertDatabaseHas('meeting_invitees', [
            'meeting_id' => $meetingId,
            'user_id' => $manager->id,
            'invitation_status' => MeetingInvitee::STATUS_PENDING,
        ]);
        $this->assertDatabaseHas('notifications', [
            'user_id' => $manager->id,
            'type' => 'meetings',
        ]);
        $this->assertDatabaseHas('meeting_activities', [
            'meeting_id' => $meetingId,
            'action' => MeetingActivity::ACTION_SCHEDULED,
        ]);

        Mail::assertSent(\App\Mail\MeetingInvitationMail::class);
    }

    public function test_list_and_show_meeting(): void
    {
        $this->seed();

        $create = $this->actingAsAdmin()->postJson('/api/meetings', $this->meetingPayload());
        $meetingId = $create->json('data.id');

        $this->actingAsAdmin()->getJson('/api/meetings')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => ['data']]);

        $this->actingAsAdmin()->getJson("/api/meetings/{$meetingId}")
            ->assertOk()
            ->assertJsonPath('data.id', $meetingId)
            ->assertJsonPath('data.title', 'API test meeting');
    }

    public function test_update_meeting_and_invitees(): void
    {
        $this->seed();
        Mail::fake();

        $manager = User::where('email', 'manager@larte.com')->firstOrFail();
        $create = $this->actingAsAdmin()->postJson('/api/meetings', $this->meetingPayload());
        $meetingId = $create->json('data.id');

        $this->actingAsAdmin()->putJson("/api/meetings/{$meetingId}", [
            'title' => 'Updated meeting title',
            'invitee_user_ids' => [$manager->id],
        ])->assertOk()->assertJsonPath('data.title', 'Updated meeting title');

        $this->assertDatabaseHas('meetings', [
            'id' => $meetingId,
            'title' => 'Updated meeting title',
        ]);
        $this->assertDatabaseHas('meeting_invitees', [
            'meeting_id' => $meetingId,
            'user_id' => $manager->id,
        ]);
    }

    public function test_schedule_cancel_start_end_lifecycle(): void
    {
        $this->seed();
        Mail::fake();

        $create = $this->actingAsAdmin()->postJson('/api/meetings', $this->meetingPayload());
        $meetingId = $create->json('data.id');

        $this->actingAsAdmin()->postJson("/api/meetings/{$meetingId}/schedule")
            ->assertOk()
            ->assertJsonPath('data.status', Meeting::STATUS_SCHEDULED);

        $this->actingAsAdmin()->postJson("/api/meetings/{$meetingId}/start")
            ->assertOk()
            ->assertJsonPath('data.status', Meeting::STATUS_LIVE);

        $meeting = Meeting::find($meetingId);
        $this->assertNotNull($meeting->started_at);

        $this->actingAsAdmin()->postJson("/api/meetings/{$meetingId}/end")
            ->assertOk()
            ->assertJsonPath('data.status', Meeting::STATUS_FINISHED);

        $meeting->refresh();
        $this->assertNotNull($meeting->ended_at);

        $create2 = $this->actingAsAdmin()->postJson('/api/meetings', $this->meetingPayload([
            'title' => 'Cancel me',
        ]));
        $cancelId = $create2->json('data.id');

        $this->actingAsAdmin()->postJson("/api/meetings/{$cancelId}/schedule")->assertOk();

        $this->actingAsAdmin()->postJson("/api/meetings/{$cancelId}/cancel")
            ->assertOk()
            ->assertJsonPath('data.status', Meeting::STATUS_CANCELLED);

        $this->assertDatabaseHas('meeting_activities', [
            'meeting_id' => $meetingId,
            'action' => MeetingActivity::ACTION_ENDED,
        ]);
    }

    public function test_session_returns_jitsi_config_for_invited_host(): void
    {
        $this->seed();

        $create = $this->actingAsAdmin()->postJson('/api/meetings', $this->meetingPayload([
            'publish' => true,
        ]));
        $meetingId = $create->json('data.id');

        $this->actingAsAdmin()->postJson("/api/meetings/{$meetingId}/start")->assertOk();

        $response = $this->actingAsAdmin()->getJson("/api/meetings/{$meetingId}/session");

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.jitsi.domain', config('jitsi.domain'))
            ->assertJsonStructure(['data' => ['jitsi' => ['roomName'], 'permissions', 'meeting', 'user']]);

        $roomName = $response->json('data.jitsi.roomName');
        $this->assertSame(Meeting::find($meetingId)->room_name, $roomName);

        $this->assertDatabaseHas('meeting_activities', [
            'meeting_id' => $meetingId,
            'action' => MeetingActivity::ACTION_JOINED,
        ]);
    }

    public function test_invited_user_can_join_live_meeting_session(): void
    {
        $this->seed();

        $manager = User::where('email', 'manager@larte.com')->firstOrFail();
        $otherSales = User::where('email', 'other.sales@larte.com')->firstOrFail();

        $create = $this->actingAsAdmin()->postJson('/api/meetings', $this->meetingPayload([
            'publish' => true,
            'invitee_user_ids' => [$manager->id],
        ]));
        $meetingId = $create->json('data.id');

        $this->actingAsAdmin()->postJson("/api/meetings/{$meetingId}/start")->assertOk();

        $this->actingAsOtherSales()
            ->getJson("/api/meetings/{$meetingId}/session")
            ->assertForbidden();

        $this->actingAsUser($manager)
            ->getJson("/api/meetings/{$meetingId}/session")
            ->assertOk()
            ->assertJsonPath('data.permissions.canJoin', true);
    }

    public function test_non_invitee_cannot_access_session(): void
    {
        $this->seed();

        $otherSales = User::where('email', 'other.sales@larte.com')->firstOrFail();

        $create = $this->actingAsAdmin()->postJson('/api/meetings', $this->meetingPayload([
            'title' => 'Admin private live meeting',
            'publish' => true,
        ]));
        $meetingId = $create->json('data.id');

        $this->assertFalse(
            Meeting::find($meetingId)->invitees()->where('user_id', $otherSales->id)->exists()
        );

        $this->actingAsAdmin()->postJson("/api/meetings/{$meetingId}/start")->assertOk();

        $this->actingAsOtherSales()->getJson("/api/meetings/{$meetingId}/session")
            ->assertForbidden();
    }

    public function test_sales_user_sees_only_own_meetings_in_list(): void
    {
        $this->seed();

        $admin = User::where('email', 'madina7ali7@gmail.com')->firstOrFail();
        $sales = User::where('email', SalesDemoSeeder::DEMO_EMAIL)->firstOrFail();

        $adminMeeting = $this->actingAsAdmin()->postJson('/api/meetings', $this->meetingPayload([
            'title' => 'Admin-only meeting',
        ]));
        $adminMeetingId = $adminMeeting->json('data.id');
        $this->assertSame($admin->id, Meeting::find($adminMeetingId)->created_by);

        $salesMeeting = $this->actingAsSalesDemo()->postJson('/api/meetings', $this->meetingPayload([
            'title' => 'Sales-owned meeting',
        ]));
        $salesMeetingId = $salesMeeting->json('data.id');
        $this->assertSame($sales->id, Meeting::find($salesMeetingId)->created_by);

        $response = $this->actingAsSalesDemo()->getJson('/api/meetings');
        $ids = collect($response->json('data.data'))->pluck('id')->all();

        $this->assertContains($salesMeetingId, $ids);
        $this->assertNotContains($adminMeetingId, $ids);
    }

    public function test_history_and_ics_endpoints(): void
    {
        $this->seed();

        $create = $this->actingAsAdmin()->postJson('/api/meetings', $this->meetingPayload([
            'publish' => true,
        ]));
        $meetingId = $create->json('data.id');

        $history = $this->actingAsAdmin()->getJson("/api/meetings/{$meetingId}/history");
        $history->assertOk()->assertJsonPath('success', true);
        $this->assertNotEmpty($history->json('data'));

        $ics = $this->actingAsAdmin()->get("/api/meetings/{$meetingId}/ics");
        $ics->assertOk();
        $this->assertStringContainsString('BEGIN:VCALENDAR', $ics->getContent());
    }

    public function test_validation_errors_return_422(): void
    {
        $this->seed();

        $this->actingAsAdmin()->postJson('/api/meetings', [
            'title' => '',
        ])->assertStatus(422)->assertJsonPath('success', false);
    }

    public function test_statistics_and_statuses_endpoints(): void
    {
        $this->seed();

        $this->actingAsAdmin()->getJson('/api/meetings/statistics')
            ->assertOk()
            ->assertJsonStructure(['data' => ['total', 'draft', 'scheduled', 'live', 'finished', 'cancelled']]);

        $this->actingAsAdmin()->getJson('/api/meetings/statuses')
            ->assertOk()
            ->assertJsonPath('success', true);
    }
}
