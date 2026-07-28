<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Support\Carbon;

class ActivityLogService
{
    public function list(array $filters = [])
    {
        $query = ActivityLog::with('user');

        if (!empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (!empty($filters['module'])) {
            $query->where('module', $filters['module']);
        }

        if (!empty($filters['action'])) {
            $query->where('action', $filters['action']);
        }

        if (!empty($filters['level'])) {
            $query->where('level', $filters['level']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        if (!empty($filters['search'])) {
            $term = $filters['search'];
            $query->where(function ($q) use ($term) {
                $q->where('description', 'LIKE', "%{$term}%")
                    ->orWhere('action', 'LIKE', "%{$term}%")
                    ->orWhere('module', 'LIKE', "%{$term}%");
            });
        }

        return $query->orderByDesc('created_at')->paginate($filters['per_page'] ?? 20);
    }

    public function statistics(array $filters = []): array
    {
        $query = ActivityLog::query();

        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        return [
            'total' => (clone $query)->count(),
            'today' => (clone $query)->whereDate('created_at', Carbon::today())->count(),
            'by_level' => (clone $query)->selectRaw('level, count(*) as count')->groupBy('level')->get(),
            'by_module' => (clone $query)->selectRaw('module, count(*) as count')->groupBy('module')->orderByDesc('count')->limit(10)->get(),
            'by_action' => (clone $query)->selectRaw('action, count(*) as count')->groupBy('action')->orderByDesc('count')->limit(10)->get(),
            'by_status' => (clone $query)->selectRaw('status, count(*) as count')->groupBy('status')->get(),
            'by_user' => (clone $query)->selectRaw('user_id, count(*) as count')->groupBy('user_id')->with('user')->orderByDesc('count')->limit(10)->get(),
            'daily_trend' => (clone $query)->selectRaw('DATE(created_at) as date, count(*) as count')
                ->whereDate('created_at', '>=', Carbon::now()->subDays(30))
                ->groupBy('date')->orderBy('date')->get(),
        ];
    }

    public function recent(int $limit = 10)
    {
        return ActivityLog::with('user')->orderByDesc('created_at')->limit($limit)->get();
    }

    public function userLogs(int $userId, array $filters = [])
    {
        $query = ActivityLog::where('user_id', $userId);

        if (!empty($filters['module'])) {
            $query->where('module', $filters['module']);
        }

        if (!empty($filters['action'])) {
            $query->where('action', $filters['action']);
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        return $query->orderByDesc('created_at')->paginate($filters['per_page'] ?? 20);
    }

    public function errors(array $filters = [])
    {
        $query = ActivityLog::whereIn('level', ['error', 'critical']);

        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        return $query->orderByDesc('created_at')->paginate($filters['per_page'] ?? 20);
    }

    public function export(array $filters = [])
    {
        $query = ActivityLog::with('user');

        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        return $query->orderByDesc('created_at')->get()->map(fn ($log) => [
            'Date' => $log->created_at->format('Y-m-d H:i:s'),
            'Utilisateur' => $log->user?->name ?? 'N/A',
            'Module' => $log->module,
            'Action' => $log->action,
            'Description' => $log->description,
            'Niveau' => $log->level,
            'Statut' => $log->status,
            'IP' => $log->ip_address,
        ]);
    }
}
