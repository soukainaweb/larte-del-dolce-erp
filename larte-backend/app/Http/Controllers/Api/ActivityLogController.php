<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function __construct(private ActivityLogService $activityLogService)
    {
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', ActivityLog::class);

        return $this->paginated(
            $this->activityLogService->list($request->all()),
            'Activity logs retrieved successfully'
        );
    }

    public function show(ActivityLog $activityLog)
    {
        $this->authorize('view', $activityLog);

        return $this->success($activityLog->load('user'));
    }

    public function statistics(Request $request)
    {
        $this->authorize('viewAny', ActivityLog::class);

        return $this->success($this->activityLogService->statistics($request->all()));
    }

    public function recent(Request $request)
    {
        $this->authorize('viewAny', ActivityLog::class);

        return $this->success(
            $this->activityLogService->recent($request->integer('limit', 10))
        );
    }

    public function users(Request $request)
    {
        $this->authorize('viewAny', ActivityLog::class);

        return $this->success($this->activityLogService->uniqueUsers());
    }

    public function modules(Request $request)
    {
        $this->authorize('viewAny', ActivityLog::class);

        return $this->success($this->activityLogService->uniqueModules());
    }

    public function actions(Request $request)
    {
        $this->authorize('viewAny', ActivityLog::class);

        return $this->success($this->activityLogService->uniqueActions());
    }

    public function levels(Request $request)
    {
        $this->authorize('viewAny', ActivityLog::class);

        return $this->success($this->activityLogService->uniqueLevels());
    }

    public function chartData(Request $request)
    {
        $this->authorize('viewAny', ActivityLog::class);

        return $this->success($this->activityLogService->chartData($request->all()));
    }

    public function logins(Request $request)
    {
        $this->authorize('viewAny', ActivityLog::class);

        return $this->success(
            $this->activityLogService->recentLogins($request->integer('limit', 5))
        );
    }

    public function critical(Request $request)
    {
        $this->authorize('viewAny', ActivityLog::class);

        return $this->success($this->activityLogService->critical($request->all()));
    }

    public function userLogs($userId, Request $request)
    {
        $this->authorize('viewAny', ActivityLog::class);

        $user = User::findOrFail($userId);

        return $this->paginated(
            $this->activityLogService->userLogs((int) $userId, $request->all()),
            'User activity logs retrieved successfully'
        );
    }

    public function errors(Request $request)
    {
        $this->authorize('viewAny', ActivityLog::class);

        return $this->paginated(
            $this->activityLogService->errors($request->all()),
            'Error activity logs retrieved successfully'
        );
    }

    public function export(Request $request)
    {
        $this->authorize('viewAny', ActivityLog::class);

        $data = $this->activityLogService->export($request->all());

        return $this->success([
            'items' => $data,
            'meta' => [
                'total' => $data->count(),
                'exported_at' => now()->format('Y-m-d H:i:s'),
            ],
        ]);
    }
}
