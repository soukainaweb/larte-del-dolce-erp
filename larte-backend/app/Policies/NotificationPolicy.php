<?php

namespace App\Policies;

use App\Models\Notification;
use App\Models\User;
use App\Policies\Concerns\ChecksPermissions;

class NotificationPolicy
{
    use ChecksPermissions;

    public function viewAny(User $user): bool { return true; }
    public function view(User $user, Notification $model): bool { return $model->user_id === $user->id; }
    public function create(User $user): bool { return $this->can('notifications.create'); }
    public function update(User $user, Notification $model): bool { return $model->user_id === $user->id; }
    public function delete(User $user, Notification $model): bool { return $model->user_id === $user->id; }
}
