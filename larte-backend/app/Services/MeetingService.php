<?php

namespace App\Services;

use App\Mail\MeetingInvitationMail;
use App\Models\Meeting;
use App\Models\MeetingActivity;
use App\Models\MeetingInvitee;
use App\Models\User;
use App\Support\MeetingIcsGenerator;
use App\Support\SalesScope;
use App\Support\UserStatus;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Mail;

class MeetingService
{
    public function __construct(
        private NotificationDeliveryService $notificationDelivery,
    ) {
    }

    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = Meeting::with(['customer', 'order', 'creator', 'invitees.user']);

        if (! empty($filters['search'])) {
            $term = $filters['search'];
            $query->where(function ($q) use ($term) {
                $q->where('title', 'LIKE', "%{$term}%")
                    ->orWhere('notes', 'LIKE', "%{$term}%")
                    ->orWhere('room_name', 'LIKE', "%{$term}%");
            });
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['customer_id'])) {
            $query->where('customer_id', $filters['customer_id']);
        }

        if (! empty($filters['date_from'])) {
            $query->whereDate('meeting_date', '>=', $filters['date_from']);
        }

        if (! empty($filters['date_to'])) {
            $query->whereDate('meeting_date', '<=', $filters['date_to']);
        }

        SalesScope::applyMeetingScope($query);

        return $query->orderByDesc('meeting_date')->paginate($filters['per_page'] ?? 10);
    }

    public function create(array $data): Meeting
    {
        $inviteeUserIds = $data['invitee_user_ids'] ?? [];
        $publish = (bool) ($data['publish'] ?? false);
        unset($data['invitee_user_ids'], $data['publish']);

        $this->assertEligibleInvitees($inviteeUserIds);

        $data['created_by'] = auth()->id();
        $data['status'] = Meeting::STATUS_DRAFT;

        $meeting = Meeting::create($data);
        $this->syncInvitees($meeting, $inviteeUserIds, false);
        $this->logActivity($meeting, MeetingActivity::ACTION_CREATED, 'Meeting created as draft');

        $creator = User::find(auth()->id());
        if ($creator) {
            app(EntityCreatedNotificationService::class)->notify(
                'meeting',
                $meeting->fresh()->load(['customer', 'order', 'creator', 'invitees.user']),
                $creator,
            );
        }

        if ($publish) {
            return $this->schedule($meeting);
        }

        return $meeting->fresh()->load(['customer', 'order', 'creator', 'invitees.user']);
    }

    public function update(Meeting $meeting, array $data): Meeting
    {
        $inviteeUserIds = $data['invitee_user_ids'] ?? null;
        $publish = (bool) ($data['publish'] ?? false);
        unset($data['invitee_user_ids'], $data['publish'], $data['status']);

        $meeting->update($data);

        if (is_array($inviteeUserIds)) {
            $this->assertEligibleInvitees($inviteeUserIds);
            $resendInvites = $meeting->status !== Meeting::STATUS_DRAFT;
            $this->syncInvitees($meeting, $inviteeUserIds, $resendInvites);
        }

        $this->logActivity($meeting, MeetingActivity::ACTION_UPDATED, 'Meeting details updated');

        if ($publish && $meeting->status === Meeting::STATUS_DRAFT) {
            return $this->schedule($meeting);
        }

        return $meeting->fresh()->load(['customer', 'order', 'creator', 'invitees.user']);
    }

    public function schedule(Meeting $meeting): Meeting
    {
        $meeting->update(['status' => Meeting::STATUS_SCHEDULED]);
        $meeting = $meeting->fresh()->load(['customer', 'order', 'creator', 'invitees.user']);

        $this->logActivity($meeting, MeetingActivity::ACTION_SCHEDULED, 'Meeting scheduled and invitations sent');
        $this->sendInvitationEmails($meeting);
        $this->sendInAppNotifications($meeting);

        return $meeting;
    }

    public function cancel(Meeting $meeting): Meeting
    {
        $meeting->update([
            'status' => Meeting::STATUS_CANCELLED,
            'ended_at' => $meeting->ended_at ?? now(),
        ]);

        $this->logActivity($meeting, MeetingActivity::ACTION_CANCELLED, 'Meeting cancelled');

        return $meeting->fresh()->load(['customer', 'order', 'creator', 'invitees.user']);
    }

    public function delete(Meeting $meeting): void
    {
        $meeting->delete();
    }

    public function start(Meeting $meeting): Meeting
    {
        $meeting->update([
            'status' => Meeting::STATUS_LIVE,
            'started_at' => now(),
            'ended_at' => null,
        ]);

        $this->logActivity($meeting, MeetingActivity::ACTION_STARTED, 'Meeting started');

        return $meeting->fresh()->load(['customer', 'order', 'creator', 'invitees.user']);
    }

    public function end(Meeting $meeting): Meeting
    {
        $meeting->update([
            'status' => Meeting::STATUS_FINISHED,
            'ended_at' => now(),
        ]);

        $this->logActivity($meeting, MeetingActivity::ACTION_ENDED, 'Meeting ended');

        return $meeting->fresh()->load(['customer', 'order', 'creator', 'invitees.user']);
    }

    public function session(Meeting $meeting, User $user): array
    {
        $this->logActivity(
            $meeting,
            MeetingActivity::ACTION_JOINED,
            trim($user->first_name . ' ' . $user->last_name) . ' joined the meeting room',
            $user->id,
        );

        return [
            'meeting' => $meeting->load(['customer', 'order', 'creator', 'invitees.user']),
            'jitsi' => [
                'domain' => config('jitsi.domain', 'meet.jit.si'),
                'roomName' => $meeting->room_name,
            ],
            'permissions' => [
                'isHost' => $meeting->isHost($user) || $meeting->isAdminUser($user),
                'canModerate' => $meeting->isHost($user) || $meeting->isAdminUser($user),
                'canJoin' => $meeting->canJoin($user),
            ],
            'user' => [
                'displayName' => trim($user->first_name . ' ' . $user->last_name) ?: $user->email,
                'email' => $user->email,
            ],
        ];
    }

    public function history(Meeting $meeting): array
    {
        return $meeting->activities()
            ->with('user:id,first_name,last_name,email')
            ->get()
            ->map(fn (MeetingActivity $activity) => [
                'id' => $activity->id,
                'action' => $activity->action,
                'description' => $activity->description,
                'metadata' => $activity->metadata,
                'created_at' => $activity->created_at,
                'user' => $activity->user ? [
                    'id' => $activity->user->id,
                    'name' => trim(($activity->user->first_name ?? '') . ' ' . ($activity->user->last_name ?? '')),
                    'email' => $activity->user->email,
                ] : null,
            ])
            ->all();
    }

    public function icsContent(Meeting $meeting): string
    {
        return MeetingIcsGenerator::generate($meeting, $this->detailsUrl($meeting));
    }

    public function statistics(): array
    {
        $query = SalesScope::applyMeetingScope(Meeting::query());

        return [
            'total' => (clone $query)->count(),
            'draft' => (clone $query)->where('status', Meeting::STATUS_DRAFT)->count(),
            'scheduled' => (clone $query)->where('status', Meeting::STATUS_SCHEDULED)->count(),
            'live' => (clone $query)->where('status', Meeting::STATUS_LIVE)->count(),
            'finished' => (clone $query)->where('status', Meeting::STATUS_FINISHED)->count(),
            'cancelled' => (clone $query)->where('status', Meeting::STATUS_CANCELLED)->count(),
        ];
    }

    public function statuses(): array
    {
        return [
            ['value' => Meeting::STATUS_DRAFT, 'label' => 'Draft'],
            ['value' => Meeting::STATUS_SCHEDULED, 'label' => 'Scheduled'],
            ['value' => Meeting::STATUS_LIVE, 'label' => 'Live'],
            ['value' => Meeting::STATUS_FINISHED, 'label' => 'Finished'],
            ['value' => Meeting::STATUS_CANCELLED, 'label' => 'Cancelled'],
        ];
    }

    /**
     * Active users eligible to be invited to a meeting (for the Add Meeting form).
     * Users with users.view see all active accounts; others see users with meetings.view.
     *
     * @return list<array<string, mixed>>
     */
    public function eligibleInvitees(User $actor, array $filters = []): array
    {
        $query = User::query()
            ->with('role:id,name,display_name')
            ->whereNotIn('status', UserStatus::blockedForLogin());

        if (! $actor->hasPermission('users.view')) {
            $query->whereHas('role.permissions', function ($q) {
                $q->where('name', 'meetings.view');
            });
        }

        if (! empty($filters['search'])) {
            $term = $filters['search'];
            $query->where(function ($q) use ($term) {
                $q->where('email', 'LIKE', "%{$term}%")
                    ->orWhere('first_name', 'LIKE', "%{$term}%")
                    ->orWhere('last_name', 'LIKE', "%{$term}%");
            });
        }

        $limit = min((int) ($filters['per_page'] ?? 200), 500);

        return $query
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->limit($limit)
            ->get(['id', 'first_name', 'last_name', 'email', 'role_id', 'status'])
            ->map(fn (User $user) => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'full_name' => trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? '')),
                'status' => $user->status,
                'role' => $user->role ? [
                    'id' => $user->role->id,
                    'name' => $user->role->name,
                    'display_name' => $user->role->display_name,
                ] : null,
            ])
            ->values()
            ->all();
    }

    protected function assertEligibleInvitees(array $inviteeUserIds): void
    {
        if ($inviteeUserIds === []) {
            return;
        }

        $actor = auth()->user();
        if (! $actor) {
            return;
        }

        $eligibleIds = collect($this->eligibleInvitees($actor, ['per_page' => 500]))
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->all();

        $invalid = collect($inviteeUserIds)
            ->map(fn ($id) => (int) $id)
            ->filter(fn ($id) => $id > 0 && ! in_array($id, $eligibleIds, true));

        if ($invalid->isNotEmpty()) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'invitee_user_ids' => ['One or more selected participants are not eligible for this meeting.'],
            ]);
        }
    }

    protected function syncInvitees(Meeting $meeting, array $inviteeUserIds, bool $notify = false): void
    {
        $creator = $meeting->creator ?? User::find($meeting->created_by);
        $normalizedIds = collect($inviteeUserIds)
            ->filter()
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values();

        if ($creator && ! $normalizedIds->contains((int) $creator->id)) {
            $normalizedIds->prepend((int) $creator->id);
        }

        $users = User::query()->whereIn('id', $normalizedIds)->get(['id', 'email', 'first_name', 'last_name']);

        $meeting->invitees()->delete();

        foreach ($users as $user) {
            MeetingInvitee::create([
                'meeting_id' => $meeting->id,
                'user_id' => $user->id,
                'email' => mb_strtolower(trim((string) $user->email)),
                'role' => ((int) $user->id === (int) $meeting->created_by) ? 'host' : 'participant',
                'invitation_status' => MeetingInvitee::STATUS_PENDING,
                'invited_at' => now(),
            ]);
        }

        if ($notify && $meeting->status === Meeting::STATUS_SCHEDULED) {
            $this->sendInvitationEmails($meeting->fresh()->load(['invitees.user', 'creator']));
            $this->sendInAppNotifications($meeting);
        }
    }

    protected function sendInvitationEmails(Meeting $meeting): void
    {
        $meeting->loadMissing(['invitees.user', 'creator']);
        $detailsUrl = $this->detailsUrl($meeting);
        $roomUrl = $this->roomUrl($meeting);
        $googleCalendarUrl = MeetingIcsGenerator::googleCalendarUrl($meeting, $roomUrl);
        $icsContent = MeetingIcsGenerator::generate($meeting, $roomUrl);
        $organizerName = trim(($meeting->creator->first_name ?? '') . ' ' . ($meeting->creator->last_name ?? ''))
            ?: ($meeting->creator->email ?? config('app.name'));

        foreach ($meeting->invitees as $invitee) {
            if (empty($invitee->email)) {
                continue;
            }

            $recipientName = $invitee->user
                ? trim(($invitee->user->first_name ?? '') . ' ' . ($invitee->user->last_name ?? ''))
                : '';

            try {
                Mail::to($invitee->email)->send(new MeetingInvitationMail(
                    meeting: $meeting,
                    joinUrl: $roomUrl,
                    detailsUrl: $detailsUrl,
                    recipientName: $recipientName,
                    organizerName: $organizerName,
                    googleCalendarUrl: $googleCalendarUrl,
                    icsContent: $icsContent,
                ));

                $this->logActivity(
                    $meeting,
                    MeetingActivity::ACTION_INVITATION_SENT,
                    'Invitation email sent to ' . $invitee->email,
                );
            } catch (\Throwable $e) {
                report($e);
            }
        }
    }

    protected function sendInAppNotifications(Meeting $meeting): void
    {
        $meeting->loadMissing(['invitees.user', 'creator']);
        $detailsUrl = $this->detailsUrl($meeting);
        $organizerName = trim(($meeting->creator->first_name ?? '') . ' ' . ($meeting->creator->last_name ?? ''))
            ?: ($meeting->creator->email ?? 'Organizer');

        foreach ($meeting->invitees as $invitee) {
            if (! $invitee->user_id || (int) $invitee->user_id === (int) $meeting->created_by) {
                continue;
            }

            $user = $invitee->user ?? User::find($invitee->user_id);
            if (! $user) {
                continue;
            }

            $this->notificationDelivery->deliver($user, [
                'title' => 'Meeting invitation: ' . $meeting->title,
                'message' => sprintf(
                    '%s invited you to a meeting on %s at %s. View details: %s',
                    $organizerName,
                    $meeting->meeting_date?->format('M j, Y') ?? $meeting->meeting_date,
                    is_string($meeting->meeting_time) ? substr($meeting->meeting_time, 0, 5) : $meeting->meeting_time,
                    $detailsUrl,
                ),
                'type' => 'meetings',
            ]);
        }
    }

    protected function logActivity(
        Meeting $meeting,
        string $action,
        ?string $description = null,
        ?int $userId = null,
        array $metadata = [],
    ): void {
        try {
            MeetingActivity::create([
                'meeting_id' => $meeting->id,
                'user_id' => $userId ?? auth()->id(),
                'action' => $action,
                'description' => $description,
                'metadata' => $metadata ?: null,
            ]);
        } catch (\Throwable $e) {
            report($e);
        }
    }

    protected function frontendBaseUrl(): string
    {
        return rtrim((string) config('app.frontend_url'), '/');
    }

    protected function detailsUrl(Meeting $meeting): string
    {
        return $this->frontendBaseUrl() . '/dashboard/meetings/' . $meeting->id;
    }

    protected function roomUrl(Meeting $meeting): string
    {
        return $this->detailsUrl($meeting) . '/room';
    }
}
