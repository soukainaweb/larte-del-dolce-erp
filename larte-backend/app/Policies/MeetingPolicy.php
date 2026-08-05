<?php

namespace App\Policies;

use App\Models\Meeting;
use App\Models\User;
use App\Policies\Concerns\ChecksPermissions;

class MeetingPolicy
{
    use ChecksPermissions;

    public function viewAny(User $user): bool { return $this->can('meetings.view'); }
    public function view(User $user, Meeting $model): bool { return $this->can('meetings.view'); }
    public function create(User $user): bool { return $this->can('meetings.create'); }
    public function update(User $user, Meeting $model): bool { return $this->can('meetings.update'); }
    public function delete(User $user, Meeting $model): bool { return $this->can('meetings.delete'); }
}
