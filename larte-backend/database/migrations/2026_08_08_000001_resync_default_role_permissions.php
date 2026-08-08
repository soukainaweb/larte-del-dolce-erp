<?php

use App\Support\DefaultRolePermissions;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

/**
 * Re-sync built-in role permissions (meetings, samples, etc.) on existing deployments.
 * Safe to run multiple times — uses DefaultRolePermissions::assignAllRoles().
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('permissions') || ! Schema::hasTable('permission_role') || ! Schema::hasTable('roles')) {
            return;
        }

        DefaultRolePermissions::assignAllRoles();
    }

    public function down(): void
    {
        // Non-destructive data migration.
    }
};
