<?php

use App\Support\DefaultRolePermissions;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('permissions') || !Schema::hasTable('permission_role') || !Schema::hasTable('roles')) {
            return;
        }

        DefaultRolePermissions::assignAllRoles();
    }

    public function down(): void
    {
        // Non-destructive data migration; leave role permissions as-is on rollback.
    }
};
