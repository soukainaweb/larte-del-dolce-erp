<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

class ActivityLogger
{
    public static function log(
        string $module,
        string $action,
        ?string $description = null,
        string $level = 'info',
        string $status = 'success',
        ?int $userId = null,
        ?string $ip = null,
    ): ?ActivityLog {
        if (!Schema::hasTable('activity_logs')) {
            return null;
        }

        return ActivityLog::create([
            'user_id' => $userId ?? auth()->id(),
            'module' => $module,
            'action' => $action,
            'description' => $description,
            'level' => $level,
            'status' => $status,
            'ip_address' => $ip ?? request()?->ip(),
        ]);
    }

    public static function logModelEvent(
        Model $model,
        string $action,
        ?string $description = null,
        string $level = 'info',
    ): ?ActivityLog {
        $module = strtolower(class_basename($model));

        return self::log(
            module: $module,
            action: $action,
            description: $description ?? sprintf('%s #%s %s', $module, $model->getKey(), $action),
            level: $level,
        );
    }
}
