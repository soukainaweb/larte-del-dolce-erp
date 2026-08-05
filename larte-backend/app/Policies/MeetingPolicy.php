<?php

namespace App\Policies;

use App\Models\Meeting;
use App\Models\User;
use App\Policies\Concerns\ChecksPermissions;
use App\Support\SalesScope;

class MeetingPolicy
{
    use ChecksPermissions;

    public function viewAny(User $user): bool { return $this->can('meetings.view'); }
    public function view(User $user, Meeting $model): bool { return $this->can('meetings.view') && SalesScope::ownsMeeting($model, $user); }
    public function create(User $user): bool { return $this->can('meetings.create'); }
    public function update(User $user, Meeting $model): bool { return $this->can('meetings.update') && SalesScope::ownsMeeting($model, $user); }
    public function delete(User $user, Meeting $model): bool { return $this->can('meetings.delete') && SalesScope::ownsMeeting($model, $user); }
}
