<?php

namespace App\Policies;

use App\Models\User;
use App\Models\WasteReturn;
use App\Policies\Concerns\ChecksPermissions;

class WasteReturnPolicy
{
    use ChecksPermissions;

    public function viewAny(User $user): bool { return $this->can('waste_returns.view'); }
    public function view(User $user, WasteReturn $model): bool { return $this->can('waste_returns.view'); }
    public function create(User $user): bool { return $this->can('waste_returns.create'); }
    public function update(User $user, WasteReturn $model): bool { return $this->can('waste_returns.update'); }
    public function delete(User $user, WasteReturn $model): bool { return $this->can('waste_returns.delete'); }
}
