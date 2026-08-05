<?php

namespace App\Policies;

use App\Models\Sample;
use App\Models\User;
use App\Policies\Concerns\ChecksPermissions;
use App\Support\SalesScope;

class SamplePolicy
{
    use ChecksPermissions;

    public function viewAny(User $user): bool { return $this->can('samples.view'); }
    public function view(User $user, Sample $model): bool { return $this->can('samples.view') && SalesScope::ownsSample($model, $user); }
    public function create(User $user): bool { return $this->can('samples.create'); }
    public function update(User $user, Sample $model): bool { return $this->can('samples.update') && SalesScope::ownsSample($model, $user); }
    public function delete(User $user, Sample $model): bool { return $this->can('samples.delete') && SalesScope::ownsSample($model, $user); }
}
