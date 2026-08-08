<?php

use App\Support\DefaultRolePermissions;
use Illuminate\Database\Migrations\Migration;

/**
 * Remove orders.update from the sales role (create-only order access).
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
