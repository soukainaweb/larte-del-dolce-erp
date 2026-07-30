<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;

class ActivityLogService
{
    public function list(array $filters = [])
    {
        $query = ActivityLog::with('user');

        $this->applyFilters($query, $filters);

        return $query->orderByDesc('created_at')
            ->paginate($filters['per_page'] ?? 20);
    }

    public function statistics(array $filters = []): array
    {
        $query = ActivityLog::query();
        $this->applyFilters($query, $filters, excludeSearch: true);

        $base = clone $query;

        return [
            'total' => (clone $base)->count(),
            'today' => (clone $base)->whereDate('created_at', Carbon::today())->count(),
            'active_users' => (clone $base)->whereNotNull('user_id')->distinct('user_id')->count('user_id'),
            'critical' => (clone $base)->whereIn('level', ['critical', 'error'])->count(),
            'success' => (clone $base)->where('status', 'success')->count(),
            'avg_duration' => '—',
            'security' => '100%',
            'by_level' => (clone $base)->selectRaw('level, count(*) as count')->groupBy('level')->get(),
            'by_module' => (clone $base)->selectRaw('module, count(*) as count')->groupBy('module')->orderByDesc('count')->limit(10)->get(),
            'by_action' => (clone $base)->selectRaw('action, count(*) as count')->groupBy('action')->orderByDesc('count')->limit(10)->get(),
            'by_status' => (clone $base)->selectRaw('status, count(*) as count')->groupBy('status')->get(),
            'by_user' => (clone $base)->selectRaw('user_id, count(*) as count')->groupBy('user_id')->with('user')->orderByDesc('count')->limit(10)->get(),
            'daily_trend' => (clone $base)->selectRaw('DATE(created_at) as date, count(*) as count')
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
        $query = ActivityLog::where('user_id', $userId)->with('user');
        $this->applyFilters($query, $filters);

        return $query->orderByDesc('created_at')->paginate($filters['per_page'] ?? 20);
    }

    public function errors(array $filters = [])
    {
        $query = ActivityLog::with('user')->whereIn('level', ['error', 'critical']);
        $this->applyFilters($query, $filters);

        return $query->orderByDesc('created_at')->paginate($filters['per_page'] ?? 20);
    }

    public function critical(array $filters = [])
    {
        $limit = (int) ($filters['limit'] ?? 5);
        $query = ActivityLog::with('user')->whereIn('level', ['error', 'critical']);
        $this->applyFilters($query, $filters);

        return $query->orderByDesc('created_at')->limit($limit)->get();
    }

    public function recentLogins(int $limit = 5)
    {
        return ActivityLog::with('user')
            ->where('module', 'auth')
            ->whereIn('action', ['login', 'login_failed'])
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(fn (ActivityLog $log) => [
                'id' => $log->id,
                'user' => $log->user?->name ?? $log->user?->email,
                'time' => $log->created_at?->format('Y-m-d H:i'),
                'ip' => $log->ip_address,
                'browser' => null,
                'city' => null,
                'country' => null,
            ]);
    }

    public function uniqueUsers(): array
    {
        return ActivityLog::query()
            ->whereNotNull('user_id')
            ->with('user:id,first_name,last_name,email')
            ->get()
            ->pluck('user')
            ->filter()
            ->unique('id')
            ->map(fn (User $user) => $user->name ?: $user->email)
            ->filter()
            ->values()
            ->all();
    }

    public function uniqueModules(): array
    {
        return ActivityLog::query()
            ->whereNotNull('module')
            ->distinct()
            ->orderBy('module')
            ->pluck('module')
            ->filter()
            ->values()
            ->all();
    }

    public function uniqueActions(): array
    {
        return ActivityLog::query()
            ->whereNotNull('action')
            ->distinct()
            ->orderBy('action')
            ->pluck('action')
            ->filter()
            ->values()
            ->all();
    }

    public function uniqueLevels(): array
    {
        return ActivityLog::query()
            ->whereNotNull('level')
            ->distinct()
            ->orderBy('level')
            ->pluck('level')
            ->filter()
            ->values()
            ->all();
    }

    public function chartData(array $filters = []): array
    {
        $type = $filters['type'] ?? 'daily';
        $limit = (int) ($filters['limit'] ?? 10);

        $query = ActivityLog::query();
        $this->applyFilters($query, $filters, excludeSearch: true);

        return match ($type) {
            'daily' => $this->dailyChart($query),
            'by_action' => $this->actionChart($query),
            'by_user' => $this->userChart($query, $limit),
            'by_module' => $this->moduleChart($query, $limit),
            default => [],
        };
    }

    public function export(array $filters = [])
    {
        $query = ActivityLog::with('user');
        $this->applyFilters($query, $filters);

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

    private function dailyChart(Builder $query): array
    {
        return (clone $query)
            ->selectRaw('DATE(created_at) as date, count(*) as count')
            ->whereDate('created_at', '>=', Carbon::now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn ($row) => [
                'date' => $row->date,
                'count' => (int) $row->count,
            ])
            ->all();
    }

    private function actionChart(Builder $query): array
    {
        $colors = ['#B8863B', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

        return (clone $query)
            ->selectRaw('action, count(*) as count')
            ->groupBy('action')
            ->orderByDesc('count')
            ->limit(8)
            ->get()
            ->values()
            ->map(fn ($row, $index) => [
                'name' => $row->action,
                'value' => (int) $row->count,
                'color' => $colors[$index % count($colors)],
            ])
            ->all();
    }

    private function userChart(Builder $query, int $limit): array
    {
        return (clone $query)
            ->selectRaw('user_id, count(*) as count')
            ->whereNotNull('user_id')
            ->groupBy('user_id')
            ->orderByDesc('count')
            ->limit($limit)
            ->with('user')
            ->get()
            ->map(fn ($row) => [
                'name' => $row->user?->name ?? $row->user?->email ?? '—',
                'count' => (int) $row->count,
            ])
            ->all();
    }

    private function moduleChart(Builder $query, int $limit): array
    {
        return (clone $query)
            ->selectRaw('module, count(*) as count')
            ->whereNotNull('module')
            ->groupBy('module')
            ->orderByDesc('count')
            ->limit($limit)
            ->get()
            ->map(fn ($row) => [
                'name' => $row->module,
                'count' => (int) $row->count,
            ])
            ->all();
    }

    private function applyFilters(Builder $query, array $filters, bool $excludeSearch = false): void
    {
        if (!empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (!empty($filters['user']) && $filters['user'] !== 'all') {
            $userName = $filters['user'];
            $query->whereHas('user', function (Builder $q) use ($userName) {
                $q->where('first_name', 'LIKE', "%{$userName}%")
                    ->orWhere('last_name', 'LIKE', "%{$userName}%")
                    ->orWhere('email', 'LIKE', "%{$userName}%")
                    ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$userName}%"]);
            });
        }

        if (!empty($filters['module']) && $filters['module'] !== 'all') {
            $query->where('module', $filters['module']);
        }

        if (!empty($filters['action']) && $filters['action'] !== 'all') {
            $query->where('action', $filters['action']);
        }

        if (!empty($filters['level']) && $filters['level'] !== 'all') {
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

        $this->applyDateFilter($query, $filters['date_filter'] ?? null);

        if (!$excludeSearch && !empty($filters['search'])) {
            $term = $filters['search'];
            $query->where(function (Builder $q) use ($term) {
                $q->where('description', 'LIKE', "%{$term}%")
                    ->orWhere('action', 'LIKE', "%{$term}%")
                    ->orWhere('module', 'LIKE', "%{$term}%");
            });
        }
    }

    private function applyDateFilter(Builder $query, ?string $dateFilter): void
    {
        if (empty($dateFilter) || $dateFilter === 'all') {
            return;
        }

        match ($dateFilter) {
            'today' => $query->whereDate('created_at', Carbon::today()),
            'yesterday' => $query->whereDate('created_at', Carbon::yesterday()),
            'week' => $query->where('created_at', '>=', Carbon::now()->startOfWeek()),
            'month' => $query->where('created_at', '>=', Carbon::now()->startOfMonth()),
            default => null,
        };
    }
}
