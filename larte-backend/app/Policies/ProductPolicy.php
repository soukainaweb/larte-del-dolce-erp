<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;
use App\Policies\Concerns\ChecksPermissions;

class ProductPolicy
{
    use ChecksPermissions;

    public function viewAny(User $user): bool
    {
        return $this->can('products.view');
    }

    public function view(User $user, Product $product): bool
    {
        return $this->can('products.view');
    }

    public function create(User $user): bool
    {
        return $this->can('products.create');
    }

    public function update(User $user, Product $product): bool
    {
        return $this->can('products.update');
    }

    public function delete(User $user, Product $product): bool
    {
        return $this->can('products.delete');
    }
}
