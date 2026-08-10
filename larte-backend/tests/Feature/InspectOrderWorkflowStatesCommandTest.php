<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Order;
use App\Support\OrderWorkflow;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InspectOrderWorkflowStatesCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_inspect_command_is_read_only_and_groups_by_status(): void
    {
        $this->seed();

        $customer = Customer::firstOrFail();
        Order::create([
            'order_number' => 'ORD-INSPECT-1',
            'customer_id' => $customer->id,
            'status' => OrderWorkflow::PENDING_MANAGER,
            'payment_status' => 'unpaid',
            'total_amount' => 10,
        ]);

        $this->artisan('erp:inspect-order-workflow-states')
            ->assertExitCode(0)
            ->expectsOutputToContain('Read-only order workflow inspection')
            ->expectsOutputToContain('pending_manager');
    }
}
