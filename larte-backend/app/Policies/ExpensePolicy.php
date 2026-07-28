<?php

namespace App\Policies;

use App\Models\Expense;
use App\Models\User;
use App\Policies\Concerns\ChecksPermissions;

class ExpensePolicy
{
    use ChecksPermissions;

    public function viewAny(User $user): bool { return $this->can('expenses.view'); }
    public function view(User $user, Expense $model): bool { return $this->can('expenses.view'); }
    public function create(User $user): bool { return $this->can('expenses.create'); }
    public function update(User $user, Expense $model): bool { return $this->can('expenses.update'); }
    public function delete(User $user, Expense $model): bool { return $this->can('expenses.delete'); }
}
