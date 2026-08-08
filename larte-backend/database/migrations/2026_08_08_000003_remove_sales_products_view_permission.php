<?php

use App\Support\DefaultRolePermissions;
use Illuminate\Database\Migrations\Migration;

/**
 * Remove products.view from the sales role and resync all built-in roles.
 * Safe to run multiple times — uses DefaultRolePermissions::assignAllRoles().
 */
return new class extends Migration
{
    public function up(): void
    {
        DefaultRolePermissions::assignAllRoles();
    }

    public function down(): void
    {
        DefaultRolePermissions::assignAllRoles();
    }
};
