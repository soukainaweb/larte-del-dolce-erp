<?php

namespace App\Policies;

use App\Models\User;
use App\Policies\Concerns\ChecksPermissions;

class ReportPolicy
{
    use ChecksPermissions;

    public function viewAny(User $user): bool
    {
        return $this->can('reports.view');
    }
}
