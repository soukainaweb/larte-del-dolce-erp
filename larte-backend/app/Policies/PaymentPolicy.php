<?php

namespace App\Policies;

use App\Models\Payment;
use App\Models\User;
use App\Policies\Concerns\ChecksPermissions;

class PaymentPolicy
{
    use ChecksPermissions;

    public function viewAny(User $user): bool { return $this->can('payments.view'); }
    public function view(User $user, Payment $model): bool { return $this->can('payments.view'); }
    public function create(User $user): bool { return $this->can('payments.create'); }
    public function update(User $user, Payment $model): bool { return $this->can('payments.update'); }
    public function delete(User $user, Payment $model): bool { return $this->can('payments.delete'); }
}
