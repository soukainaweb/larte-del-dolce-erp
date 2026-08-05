<?php

namespace App\Policies;

use App\Models\OrderTransfer;
use App\Models\User;
use App\Policies\Concerns\ChecksPermissions;
use App\Support\SalesScope;

class OrderTransferPolicy
{
    use ChecksPermissions;

    public function viewAny(User $user): bool
    {
        return $this->can('orders.view') && ! SalesScope::isSalesRep($user);
    }

    public function view(User $user, OrderTransfer $model): bool
    {
        return $this->can('orders.view') && ! SalesScope::isSalesRep($user);
    }
}
