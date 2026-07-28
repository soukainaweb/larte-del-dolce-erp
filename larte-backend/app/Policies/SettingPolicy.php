<?php

namespace App\Policies;

use App\Models\Setting;
use App\Models\User;
use App\Policies\Concerns\ChecksPermissions;

class SettingPolicy
{
    use ChecksPermissions;

    public function viewAny(User $user): bool { return $this->can('settings.view'); }
    public function view(User $user, Setting $model): bool { return $this->can('settings.view'); }
    public function create(User $user): bool { return $this->can('settings.update'); }
    public function update(User $user, Setting $model): bool { return $this->can('settings.update'); }
    public function delete(User $user, Setting $model): bool { return $this->can('settings.update'); }
}
