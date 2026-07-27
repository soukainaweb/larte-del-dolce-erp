<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Production;
use App\Models\ProductionItem;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductionController extends Controller
{
    public function index(Request $request)
    {
        $query = Production::with(['order', 'assignedTo']);

        if ($request->search) {
            $query->where('name', 'LIKE', "%{$request->search}%")
                ->orWhere('production_number', 'LIKE', "%{$request->search}%");
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->priority) {
            $query->where('priority', $request->priority);
        }

        if ($request->assigned_to) {
            $query->where('assigned_to', $request->assigned_to);
        }

        if ($request->order_id) {
            $query->where('order_id', $request->order_id);
        }

        if ($request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $productions = $query->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 10);

        return response()->json([
            'success' => true,
            'data' => $productions
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'order_id' => 'nullable|exists:orders,id',
            'name' => 'required|string|max:200',
            'status' => 'nullable|in:pending,in_progress,paused,completed,cancelled',
            'priority' => 'nullable|in:low,medium,high,critical',
            'progress' => 'nullable|integer|min:0|max:100',
            'estimated_start_date' => 'nullable|date',
            'estimated_end_date' => 'nullable|date|after_or_equal:estimated_start_date',
            'assigned_to' => 'nullable|exists:users,id',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $productionNumber = 'PRD-' . date('Ymd') . '-' . str_pad(Production::count() + 1, 4, '0', STR_PAD_LEFT);

        DB::beginTransaction();

        try {
            $production = Production::create([
                'production_number' => $productionNumber,
                'order_id' => $request->order_id,
                'name' => $request->name,
                'status' => $request->status ?? 'pending',
                'priority' => $request->priority ?? 'medium',
                'progress' => $request->progress ?? 0,
                'estimated_start_date' => $request->estimated_start_date,
                'estimated_end_date' => $request->estimated_end_date,
                'assigned_to' => $request->assigned_to,
                'notes' => $request->notes,
            ]);

            foreach ($request->items as $item) {
                ProductionItem::create([
                    'production_id' => $production->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'completed_quantity' => 0,
                    'progress_percentage' => 0,
                ]);
            }

            if ($request->order_id) {
                Order::where('id', $request->order_id)->update(['status' => 'production']);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Production créée avec succès',
                'data' => $production->load(['order', 'assignedTo', 'items.product'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(Production $production)
    {
        return response()->json([
            'success' => true,
            'data' => $production->load(['order', 'assignedTo', 'items.product'])
        ]);
    }

    public function update(Request $request, Production $production)
    {
        $request->validate([
            'name' => 'sometimes|string|max:200',
            'status' => 'sometimes|in:pending,in_progress,paused,completed,cancelled',
            'priority' => 'sometimes|in:low,medium,high,critical',
            'progress' => 'sometimes|integer|min:0|max:100',
            'estimated_start_date' => 'nullable|date',
            'estimated_end_date' => 'nullable|date|after_or_equal:estimated_start_date',
            'assigned_to' => 'nullable|exists:users,id',
            'notes' => 'nullable|string',
        ]);

        if ($request->status === 'completed') {
            $request->merge(['progress' => 100]);
        }

        if ($request->progress === 100 && $request->status !== 'completed') {
            $request->merge(['status' => 'completed']);
        }

        $production->update($request->all());

        if ($production->order_id) {
            $statusMap = [
                'pending' => 'pending',
                'in_progress' => 'production',
                'paused' => 'production',
                'completed' => 'ready',
                'cancelled' => 'cancelled',
            ];

            Order::where('id', $production->order_id)->update([
                'status' => $statusMap[$production->status] ?? 'production'
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Production mise à jour avec succès',
            'data' => $production->fresh()->load(['order', 'assignedTo', 'items.product'])
        ]);
    }

    public function destroy(Production $production)
    {
        if ($production->status === 'completed') {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de supprimer une production terminée'
            ], 403);
        }

        $production->delete();

        return response()->json([
            'success' => true,
            'message' => 'Production supprimée avec succès'
        ]);
    }

    public function updateStatus(Request $request, Production $production)
    {
        $request->validate([
            'status' => 'required|in:pending,in_progress,paused,completed,cancelled'
        ]);

        $oldStatus = $production->status;

        if ($request->status === 'completed') {
            $production->update(['progress' => 100]);
        }

        $production->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'message' => 'Statut mis à jour avec succès',
            'data' => $production->fresh()->load(['order', 'assignedTo'])
        ]);
    }

    public function updateProgress(Request $request, Production $production)
    {
        $request->validate([
            'progress' => 'required|integer|min:0|max:100'
        ]);

        $production->update(['progress' => $request->progress]);

        if ($request->progress === 100 && $production->status !== 'completed') {
            $production->update(['status' => 'completed']);
        }

        if ($request->progress > 0 && $production->status === 'pending') {
            $production->update(['status' => 'in_progress']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Progression mise à jour avec succès',
            'data' => $production->fresh()
        ]);
    }

    public function assign(Request $request, Production $production)
    {
        $request->validate([
            'assigned_to' => 'required|exists:users,id'
        ]);

        $production->update(['assigned_to' => $request->assigned_to]);

        return response()->json([
            'success' => true,
            'message' => 'Production assignée avec succès',
            'data' => $production->fresh()->load(['order', 'assignedTo'])
        ]);
    }

    public function statistics(Request $request)
    {
        $dateFrom = $request->date_from;
        $dateTo = $request->date_to;

        $query = Production::query();

        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $query->clone()->count(),
                'pending' => $query->clone()->where('status', 'pending')->count(),
                'in_progress' => $query->clone()->where('status', 'in_progress')->count(),
                'paused' => $query->clone()->where('status', 'paused')->count(),
                'completed' => $query->clone()->where('status', 'completed')->count(),
                'cancelled' => $query->clone()->where('status', 'cancelled')->count(),
                'avg_progress' => $query->clone()->avg('progress'),
                'by_priority' => $query->clone()
                    ->selectRaw('priority, count(*) as count')
                    ->groupBy('priority')
                    ->get(),
            ]
        ]);
    }

    public function getStatuses()
    {
        $statuses = [
            ['value' => 'pending', 'label' => 'En attente'],
            ['value' => 'in_progress', 'label' => 'En production'],
            ['value' => 'paused', 'label' => 'Suspendue'],
            ['value' => 'completed', 'label' => 'Terminée'],
            ['value' => 'cancelled', 'label' => 'Annulée'],
        ];

        return response()->json([
            'success' => true,
            'data' => $statuses
        ]);
    }

    public function getPriorities()
    {
        $priorities = [
            ['value' => 'low', 'label' => 'Basse'],
            ['value' => 'medium', 'label' => 'Moyenne'],
            ['value' => 'high', 'label' => 'Haute'],
            ['value' => 'critical', 'label' => 'Critique'],
        ];

        return response()->json([
            'success' => true,
            'data' => $priorities
        ]);
    }

    public function export(Request $request)
    {
        $query = Production::with(['order', 'assignedTo']);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $productions = $query->get();

        $exportData = $productions->map(function ($production) {
            return [
                'N° Production' => $production->production_number,
                'Nom' => $production->name,
                'Commande' => $production->order ? $production->order->order_number : '—',
                'Statut' => $production->status,
                'Priorité' => $production->priority,
                'Progression' => $production->progress . '%',
                'Assigné à' => $production->assignedTo ? $production->assignedTo->name : '—',
                'Date début' => $production->estimated_start_date,
                'Date fin' => $production->estimated_end_date,
                'Créé le' => $production->created_at->format('Y-m-d H:i'),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $exportData
        ]);
    }
}