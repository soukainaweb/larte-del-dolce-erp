<?php

namespace App\Console\Commands;

use App\Support\LegacyOrderRemediation;
use Illuminate\Console\Command;
use InvalidArgumentException;
use RuntimeException;

class RemediateLegacyOrderCommand extends Command
{
    protected $signature = 'erp:remediate-legacy-order
                            {order : Order number (e.g. ORD014) or numeric ID}
                            {--confirm : Apply the remediation (required for production execution)}';

    protected $description = 'Safely reposition a legacy in-flight order from pending_accountant to pending_manager (dry-run by default)';

    public function handle(): int
    {
        $identifier = (string) $this->argument('order');
        $confirm = (bool) $this->option('confirm');

        try {
            if ($confirm) {
                $result = LegacyOrderRemediation::apply($identifier);
                $order = $result['order'];

                if ($result['already_remediated']) {
                    $this->info($result['message']);
                } elseif ($result['applied']) {
                    $this->info($result['message']);
                    $this->line(sprintf(
                        'Order %s (#%d): %s → %s',
                        $order->order_number,
                        $order->id,
                        $result['from_status'],
                        $result['to_status'],
                    ));
                }

                $this->comment('Approval history was preserved. No synthetic manager approval was created.');

                return self::SUCCESS;
            }

            $assessment = LegacyOrderRemediation::assess($identifier);
            $order = $assessment['order'];

            $this->line(sprintf('Order: %s (ID %d)', $order->order_number, $order->id));
            $this->line(sprintf('Current status: %s', $order->status));
            $this->line(sprintf('Assessment: %s', $assessment['message']));

            if (! $assessment['eligible']) {
                $this->error('Remediation refused.');

                return self::FAILURE;
            }

            if ($assessment['already_remediated']) {
                $this->info('No change would be applied.');

                return self::SUCCESS;
            }

            $this->newLine();
            $this->warn('Dry run only. The following change WOULD be applied with --confirm:');
            $this->line(sprintf(
                '  %s → %s',
                $assessment['from_status'],
                $assessment['to_status'],
            ));
            $this->line('  - Approval history preserved');
            $this->line('  - No fake manager approval created');
            $this->line('  - Order/customer financial data unchanged');
            $this->line('  - Audit entry recorded on apply');
            $this->newLine();
            $this->comment('Re-run with --confirm to apply this remediation.');

            return self::SUCCESS;
        } catch (InvalidArgumentException $e) {
            $this->error($e->getMessage());

            return self::FAILURE;
        } catch (RuntimeException $e) {
            $this->error($e->getMessage());

            return self::FAILURE;
        }
    }
}
