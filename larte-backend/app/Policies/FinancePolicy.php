<?php

namespace App\Policies;

use App\Models\User;
use App\Policies\Concerns\ChecksPermissions;

class FinancePolicy
{
    use ChecksPermissions;

    public function viewAny(User $user): bool
    {
        return $this->can('finance.view');
    }
}
