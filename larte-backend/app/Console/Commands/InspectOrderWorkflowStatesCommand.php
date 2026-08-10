<?php

namespace App\Console\Commands;

use App\Models\Order;
use App\Models\OrderApproval;
use App\Support\OrderApprovalStage;
use App\Support\OrderWorkflow;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Schema;

class InspectOrderWorkflowStatesCommand extends Command
{
    protected $signature = 'erp:inspect-order-workflow-states
                            {--status= : Filter by a single order status slug}
                            {--limit=500 : Maximum orders to inspect per status group}';

    protected $description = 'Read-only report of in-flight orders grouped by workflow status (production inspection)';

    public function handle(): int
    {
        if (! Schema::hasTable('orders')) {
            $this->error('orders table not found.');

            return self::FAILURE;
        }

        $filter = $this->option('status');
        $limit = max(1, (int) $this->option('limit'));

        $this->info('Read-only order workflow inspection — no data is modified.');
        $this->newLine();

        $statuses = $filter
            ? [OrderWorkflow::canonical((string) $filter)]
            : Order::query()->distinct()->orderBy('status')->pluck('status')->filter()->values()->all();

        if ($statuses === []) {
            $this->warn('No orders found.');

            return self::SUCCESS;
        }

        foreach ($statuses as $status) {
            $orders = Order::query()
                ->with(['user:id,first_name,last_name,email', 'assignedRep:id,first_name,last_name,email'])
                ->where('status', $status)
                ->orderBy('created_at')
                ->limit($limit)
                ->get();

            $this->line(sprintf('=== Status: %s (%s) — %d order(s) ===', $status, OrderWorkflow::toFrontend($status) ?? 'n/a', $orders->count()));

            if ($orders->isEmpty()) {
                $this->newLine();
                continue;
            }

            $rows = $orders->map(function (Order $order) {
                $latestApproval = OrderApproval::query()
                    ->where('order_id', $order->id)
                    ->latest('created_at')
                    ->first();

                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'status' => $order->status,
                    'frontend_status' => OrderWorkflow::toFrontend($order->status),
                    'created_at' => $order->created_at?->toDateTimeString(),
                    'sales_rep' => $order->user?->email,
                    'assigned_rep' => $order->assignedRep?->email,
                    'latest_approval' => $latestApproval?->action,
                    'latest_approval_at' => $latestApproval?->created_at?->toDateTimeString(),
                ];
            })->all();

            $this->table(
                ['ID', 'Order #', 'DB Status', 'Frontend', 'Created', 'Sales Rep', 'Assigned Rep', 'Last Approval', 'Approval At'],
                array_map(fn ($row) => [
                    $row['id'],
                    $row['order_number'],
                    $row['status'],
                    $row['frontend_status'],
                    $row['created_at'],
                    $row['sales_rep'] ?? '—',
                    $row['assigned_rep'] ?? '—',
                    $row['latest_approval'] ?? '—',
                    $row['latest_approval_at'] ?? '—',
                ], $rows)
            );

            $this->newLine();
        }

        $this->comment('Legacy note: only status "approved" is auto-remapped to pending_factory during migration.');
        $this->comment('Inspect pending_accountant / pending_manager orders here before any manual remediation.');

        return self::SUCCESS;
    }
}
