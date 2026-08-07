<?php

namespace App\Policies;

use App\Models\Meeting;
use App\Models\User;
use App\Policies\Concerns\ChecksPermissions;
use App\Support\SalesScope;

class MeetingPolicy
{
    use ChecksPermissions;

    public function viewAny(User $user): bool
    {
        return $this->can('meetings.view');
    }

    public function view(User $user, Meeting $model): bool
    {
        if (! $this->can('meetings.view')) {
            return false;
        }

        if ($model->isInvited($user)) {
            return true;
        }

        return SalesScope::ownsMeeting($model, $user);
    }

    public function create(User $user): bool
    {
        return $this->can('meetings.create');
    }

    public function update(User $user, Meeting $model): bool
    {
        if (! $this->can('meetings.update')) {
            return false;
        }

        return $model->isHost($user) || SalesScope::ownsMeeting($model, $user);
    }

    public function delete(User $user, Meeting $model): bool
    {
        if (! $this->can('meetings.delete')) {
            return false;
        }

        return $model->isHost($user) || SalesScope::ownsMeeting($model, $user);
    }

    public function start(User $user, Meeting $model): bool
    {
        if (! $this->can('meetings.update')) {
            return false;
        }

        return $model->isHost($user)
            && in_array($model->status, [Meeting::STATUS_SCHEDULED, Meeting::STATUS_LIVE], true);
    }

    public function join(User $user, Meeting $model): bool
    {
        if (! $this->can('meetings.view')) {
            return false;
        }

        return $model->canJoin($user);
    }

    public function end(User $user, Meeting $model): bool
    {
        if (! $this->can('meetings.update')) {
            return false;
        }

        return $model->isHost($user)
            && $model->status === Meeting::STATUS_LIVE;
    }
}
