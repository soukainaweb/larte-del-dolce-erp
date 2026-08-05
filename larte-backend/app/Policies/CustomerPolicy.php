<?php

namespace App\Policies;

use App\Models\Customer;
use App\Models\User;
use App\Policies\Concerns\ChecksPermissions;
use App\Support\SalesScope;

class CustomerPolicy
{
    use ChecksPermissions;

    public function viewAny(User $user): bool { return $this->can('customers.view'); }
    public function view(User $user, Customer $model): bool { return $this->can('customers.view') && SalesScope::ownsCustomer($model, $user); }
    public function create(User $user): bool { return $this->can('customers.create'); }
    public function update(User $user, Customer $model): bool { return $this->can('customers.update') && SalesScope::ownsCustomer($model, $user); }
    public function delete(User $user, Customer $model): bool { return $this->can('customers.delete') && SalesScope::ownsCustomer($model, $user); }
}
