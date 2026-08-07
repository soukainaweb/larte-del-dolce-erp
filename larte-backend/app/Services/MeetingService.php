<?php

namespace App\Services;

use App\Mail\MeetingInvitationMail;
use App\Models\Meeting;
use App\Models\MeetingInvitee;
use App\Models\User;
use App\Support\SalesScope;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Mail;

class MeetingService
{
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
        unset($data['invitee_user_ids']);

        $data['created_by'] = auth()->id();
        $data['status'] = Meeting::STATUS_SCHEDULED;

        $meeting = Meeting::create($data);
        $this->syncInvitees($meeting, $inviteeUserIds);
        $this->sendInvitationEmails($meeting);

        return $meeting->fresh()->load(['customer', 'order', 'creator', 'invitees.user']);
    }

    public function update(Meeting $meeting, array $data): Meeting
    {
        $inviteeUserIds = $data['invitee_user_ids'] ?? null;
        unset($data['invitee_user_ids']);

        $meeting->update($data);

        if (is_array($inviteeUserIds)) {
            $this->syncInvitees($meeting, $inviteeUserIds);
        }

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

        return $meeting->fresh()->load(['customer', 'order', 'creator', 'invitees.user']);
    }

    public function end(Meeting $meeting): Meeting
    {
        $meeting->update([
            'status' => Meeting::STATUS_FINISHED,
            'ended_at' => now(),
        ]);

        return $meeting->fresh()->load(['customer', 'order', 'creator', 'invitees.user']);
    }

    public function session(Meeting $meeting, User $user): array
    {
        return [
            'meeting' => $meeting->load(['customer', 'order', 'creator', 'invitees.user']),
            'jitsi' => [
                'domain' => config('jitsi.domain', 'meet.jit.si'),
                'roomName' => $meeting->room_name,
            ],
            'permissions' => [
                'isHost' => $meeting->isHost($user),
                'canModerate' => $meeting->isHost($user),
                'canJoin' => $meeting->canJoin($user),
            ],
            'user' => [
                'displayName' => trim($user->first_name . ' ' . $user->last_name) ?: $user->email,
                'email' => $user->email,
            ],
        ];
    }

    public function statistics(): array
    {
        $query = SalesScope::applyMeetingScope(Meeting::query());

        return [
            'total' => (clone $query)->count(),
            'scheduled' => (clone $query)->where('status', Meeting::STATUS_SCHEDULED)->count(),
            'live' => (clone $query)->where('status', Meeting::STATUS_LIVE)->count(),
            'finished' => (clone $query)->where('status', Meeting::STATUS_FINISHED)->count(),
            'cancelled' => (clone $query)->where('status', Meeting::STATUS_CANCELLED)->count(),
        ];
    }

    public function statuses(): array
    {
        return [
            ['value' => Meeting::STATUS_SCHEDULED, 'label' => 'Scheduled'],
            ['value' => Meeting::STATUS_LIVE, 'label' => 'Live'],
            ['value' => Meeting::STATUS_FINISHED, 'label' => 'Finished'],
            ['value' => Meeting::STATUS_CANCELLED, 'label' => 'Cancelled'],
        ];
    }

    protected function syncInvitees(Meeting $meeting, array $inviteeUserIds): void
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
                'invited_at' => now(),
            ]);
        }
    }

    protected function sendInvitationEmails(Meeting $meeting): void
    {
        $meeting->loadMissing(['invitees.user', 'creator']);
        $joinUrl = rtrim((string) config('app.frontend_url'), '/') . '/dashboard/meetings/' . $meeting->id;

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
                    joinUrl: $joinUrl,
                    recipientName: $recipientName,
                ));
            } catch (\Throwable $e) {
                report($e);
            }
        }
    }
}
