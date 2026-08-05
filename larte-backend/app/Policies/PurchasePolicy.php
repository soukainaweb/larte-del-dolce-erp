<?php

namespace App\Policies;

use App\Models\Purchase;
use App\Models\User;
use App\Policies\Concerns\ChecksPermissions;

class PurchasePolicy
{
    use ChecksPermissions;

    public function viewAny(User $user): bool { return $this->can('purchases.view'); }
    public function view(User $user, Purchase $model): bool { return $this->can('purchases.view'); }
    public function create(User $user): bool { return $this->can('purchases.create'); }
    public function update(User $user, Purchase $model): bool { return $this->can('purchases.update'); }
    public function delete(User $user, Purchase $model): bool { return $this->can('purchases.delete'); }
}
