<?php

namespace App\Policies;

use App\Models\Delivery;
use App\Models\User;
use App\Policies\Concerns\ChecksPermissions;

class DeliveryPolicy
{
    use ChecksPermissions;

    public function viewAny(User $user): bool { return $this->can('deliveries.view'); }
    public function view(User $user, Delivery $model): bool { return $this->can('deliveries.view'); }
    public function create(User $user): bool { return $this->can('deliveries.create'); }
    public function update(User $user, Delivery $model): bool { return $this->can('deliveries.update'); }
    public function delete(User $user, Delivery $model): bool { return $this->can('deliveries.delete'); }
}
