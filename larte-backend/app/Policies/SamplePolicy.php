<?php

namespace App\Policies;

use App\Models\Sample;
use App\Models\User;
use App\Policies\Concerns\ChecksPermissions;

class SamplePolicy
{
    use ChecksPermissions;

    public function viewAny(User $user): bool { return $this->can('samples.view'); }
    public function view(User $user, Sample $model): bool { return $this->can('samples.view'); }
    public function create(User $user): bool { return $this->can('samples.create'); }
    public function update(User $user, Sample $model): bool { return $this->can('samples.update'); }
    public function delete(User $user, Sample $model): bool { return $this->can('samples.delete'); }
}
