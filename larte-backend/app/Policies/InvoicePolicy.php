<?php

namespace App\Policies;

use App\Models\Invoice;
use App\Models\User;
use App\Policies\Concerns\ChecksPermissions;
use App\Support\SalesScope;

class InvoicePolicy
{
    use ChecksPermissions;

    public function viewAny(User $user): bool
    {
        return $this->can('finance.view');
    }

    public function view(User $user, Invoice $invoice): bool
    {
        if (! $this->can('finance.view')) {
            return false;
        }

        return SalesScope::ownsInvoice($invoice, $user);
    }

    public function create(User $user): bool
    {
        return $this->can('finance.create');
    }

    public function update(User $user, Invoice $invoice): bool
    {
        return $this->can('finance.update');
    }

    public function delete(User $user, Invoice $invoice): bool
    {
        return $this->can('finance.delete');
    }
}
