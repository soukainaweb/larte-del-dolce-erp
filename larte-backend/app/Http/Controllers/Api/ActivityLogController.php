<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $query = ActivityLog::with('user');

        if ($request->user_id) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->module) {
            $query->where('module', $request->module);
        }

        if ($request->action) {
            $query->where('action', $request->action);
        }

        if ($request->level) {
            $query->where('level', $request->level);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        if ($request->search) {
            $query->where('description', 'LIKE', "%{$request->search}%")
                ->orWhere('action', 'LIKE', "%{$request->search}%")
                ->orWhere('module', 'LIKE', "%{$request->search}%");
        }

        $logs = $query->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        return response()->json([
            'success' => true,
            'data' => $logs
        ]);
    }

    public function show(ActivityLog $activityLog)
    {
        return response()->json([
            'success' => true,
            'data' => $activityLog->load('user')
        ]);
    }

    public function statistics(Request $request)
    {
        $dateFrom = $request->date_from;
        $dateTo = $request->date_to;

        $query = ActivityLog::query();

        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $totalLogs = $query->clone()->count();
        $todayLogs = $query->clone()->whereDate('created_at', Carbon::today())->count();

        $logsByLevel = $query->clone()
            ->selectRaw('level, count(*) as count')
            ->groupBy('level')
            ->get();

        $logsByModule = $query->clone()
            ->selectRaw('module, count(*) as count')
            ->groupBy('module')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get();

        $logsByAction = $query->clone()
            ->selectRaw('action, count(*) as count')
            ->groupBy('action')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get();

        $logsByStatus = $query->clone()
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->get();

        $logsByUser = $query->clone()
            ->selectRaw('user_id, count(*) as count')
            ->groupBy('user_id')
            ->with('user')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get();

        $dailyLogs = $query->clone()
            ->selectRaw('DATE(created_at) as date, count(*) as count')
            ->whereDate('created_at', '>=', Carbon::now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $totalLogs,
                'today' => $todayLogs,
                'by_level' => $logsByLevel,
                'by_module' => $logsByModule,
                'by_action' => $logsByAction,
                'by_status' => $logsByStatus,
                'by_user' => $logsByUser,
                'daily_trend' => $dailyLogs,
            ]
        ]);
    }

    public function recent(Request $request)
    {
        $limit = $request->limit ?? 10;

        $logs = ActivityLog::with('user')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $logs
        ]);
    }

    public function userLogs($userId, Request $request)
    {
        $user = User::find($userId);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }

        $query = ActivityLog::where('user_id', $userId);

        if ($request->module) {
            $query->where('module', $request->module);
        }

        if ($request->action) {
            $query->where('action', $request->action);
        }

        if ($request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $logs = $query->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user,
                'logs' => $logs
            ]
        ]);
    }

    public function errors(Request $request)
    {
        $query = ActivityLog::whereIn('level', ['error', 'critical']);

        if ($request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $logs = $query->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        return response()->json([
            'success' => true,
            'data' => $logs
        ]);
    }

    public function export(Request $request)
    {
        $query = ActivityLog::with('user');

        if ($request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $logs = $query->orderBy('created_at', 'desc')->get();

        $exportData = $logs->map(function ($log) {
            return [
                'Date' => $log->created_at->format('Y-m-d H:i:s'),
                'Utilisateur' => $log->user ? $log->user->name : 'N/A',
                'Module' => $log->module,
                'Action' => $log->action,
                'Description' => $log->description,
                'Niveau' => $log->level,
                'Statut' => $log->status,
                'IP' => $log->ip,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $exportData,
            'meta' => [
                'total' => $exportData->count(),
                'exported_at' => now()->format('Y-m-d H:i:s'),
            ]
        ]);
    }
}