<?php

namespace App\Policies;

use App\Models\ActivityLog;
use App\Models\User;
use App\Policies\Concerns\ChecksPermissions;

class ActivityLogPolicy
{
    use ChecksPermissions;

    public function viewAny(User $user): bool { return $this->can('users.view'); }
    public function view(User $user, ActivityLog $model): bool { return $this->can('users.view'); }
}
