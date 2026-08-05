<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Meeting;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Role;
use App\Models\Sample;
use App\Models\User;
use App\Support\DefaultRolePermissions;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class SalesDemoSeeder extends Seeder
{
    /** Demo credentials — safe for staging/demo only */
    public const DEMO_EMAIL = 'sales.demo@larte.com';

    public const DEMO_PASSWORD = 'SalesDemo123';

    public function run(): void
    {
        if (! Schema::hasTable('users') || ! Schema::hasTable('roles')) {
            $this->command?->warn('Users/roles tables missing. Run migrations first.');

            return;
        }

        DefaultRolePermissions::ensurePermissionsExist();
        DefaultRolePermissions::assignAllRoles();

        $salesRole = Role::where('name', 'sales')->first();
        if (! $salesRole) {
            $this->command?->error('Sales role not found. Run RoleSeeder first.');

            return;
        }

        $salesRep = User::updateOrCreate(
            ['email' => self::DEMO_EMAIL],
            [
                'first_name' => 'Sara',
                'last_name' => 'El Amrani',
                'password' => self::DEMO_PASSWORD,
                'role_id' => $salesRole->id,
                'phone' => '+212600000101',
                'status' => 'online',
                'department' => 'Sales',
                'position' => 'Sales Representative',
            ]
        );

        // Second sales rep — demo user must NOT see this data
        $otherRep = User::updateOrCreate(
            ['email' => 'other.sales@larte.com'],
            [
                'first_name' => 'Karim',
                'last_name' => 'Benali',
                'password' => 'OtherSales123',
                'role_id' => $salesRole->id,
                'phone' => '+212600000102',
                'status' => 'offline',
                'department' => 'Sales',
                'position' => 'Sales Representative',
            ]
        );

        $product = Product::query()->first();
        if (! $product) {
            $this->command?->warn('No products found. Run ProductSeeder first for order line items.');
        }

        $this->seedCustomersAndOrdersFor($salesRep, $product, 'demo');
        $this->seedCustomersAndOrdersFor($otherRep, $product, 'other');

        if (Schema::hasTable('meetings')) {
            $this->seedMeetings($salesRep);
        }

        if (Schema::hasTable('samples')) {
            $this->seedSamples($salesRep, $product);
        }

        $this->command?->info('Sales demo account ready.');
        $this->command?->line('  Email:    ' . self::DEMO_EMAIL);
        $this->command?->line('  Password: ' . self::DEMO_PASSWORD);
    }

    private function seedCustomersAndOrdersFor(User $rep, ?Product $product, string $prefix): void
    {
        $customers = [
            [
                'name' => $prefix === 'demo' ? 'Patisserie Al Andalus' : 'Cafe Royal (Other Rep)',
                'email' => "{$prefix}.customer1@example.com",
                'phone' => '+212600111001',
                'address' => 'Casablanca, Morocco',
                'status' => 'active',
            ],
            [
                'name' => $prefix === 'demo' ? 'Hotel Marrakech Palace' : 'Boulangerie Atlas',
                'email' => "{$prefix}.customer2@example.com",
                'phone' => '+212600111002',
                'address' => 'Marrakech, Morocco',
                'status' => 'active',
            ],
            [
                'name' => $prefix === 'demo' ? 'Events by Nadia' : 'Snack Bar Central',
                'email' => "{$prefix}.customer3@example.com",
                'phone' => '+212600111003',
                'address' => 'Rabat, Morocco',
                'status' => 'active',
            ],
        ];

        $orderSpecs = [
            ['number' => strtoupper("ORD-{$prefix}-001"), 'status' => 'submitted', 'payment' => 'unpaid', 'total' => 240.00],
            ['number' => strtoupper("ORD-{$prefix}-002"), 'status' => 'preparing', 'payment' => 'partial', 'total' => 480.00],
            ['number' => strtoupper("ORD-{$prefix}-003"), 'status' => 'delivered', 'payment' => 'paid', 'total' => 960.00],
        ];

        foreach ($customers as $index => $data) {
            $customerPayload = array_merge($data, ['user_id' => $rep->id]);

            $customer = Customer::updateOrCreate(
                ['email' => $data['email']],
                $customerPayload
            );

            if (! isset($orderSpecs[$index])) {
                continue;
            }

            $spec = $orderSpecs[$index];

            $order = Order::updateOrCreate(
                ['order_number' => $spec['number']],
                [
                    'customer_id' => $customer->id,
                    'user_id' => $rep->id,
                    'status' => $spec['status'],
                    'payment_status' => $spec['payment'],
                    'total_amount' => $spec['total'],
                    'notes' => 'Demo order for sales testing',
                ]
            );

            if ($product && $order->items()->count() === 0) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => $index + 1,
                    'price' => $product->price,
                    'subtotal' => ($index + 1) * (float) $product->price,
                ]);
            }
        }
    }

    private function seedMeetings(User $salesRep): void
    {
        $orders = Order::where('user_id', $salesRep->id)
            ->with('customer')
            ->orderBy('id')
            ->take(3)
            ->get();

        if ($orders->isEmpty()) {
            return;
        }

        $meetings = [
            [
                'title' => 'Product tasting — Al Andalus',
                'meeting_date' => now()->addDays(2)->toDateString(),
                'meeting_time' => '10:30:00',
                'status' => 'scheduled',
                'notes' => 'Bring macaron and cake samples.',
            ],
            [
                'title' => 'Contract follow-up — Hotel Marrakech',
                'meeting_date' => now()->addDays(5)->toDateString(),
                'meeting_time' => '14:00:00',
                'status' => 'scheduled',
                'notes' => 'Review quarterly pastry order.',
            ],
            [
                'title' => 'Event planning — Nadia',
                'meeting_date' => now()->subDays(3)->toDateString(),
                'meeting_time' => '11:00:00',
                'status' => 'completed',
                'notes' => 'Wedding dessert table confirmed.',
            ],
        ];

        foreach ($meetings as $index => $data) {
            $order = $orders[$index] ?? $orders->first();

            Meeting::updateOrCreate(
                [
                    'title' => $data['title'],
                    'created_by' => $salesRep->id,
                ],
                array_merge($data, [
                    'customer_id' => $order?->customer_id,
                    'order_id' => $order?->id,
                    'created_by' => $salesRep->id,
                ])
            );
        }
    }

    private function seedSamples(User $salesRep, ?Product $product): void
    {
        $samples = [
            [
                'sample_code' => 'SMP-DEMO-001',
                'name' => 'Macaron assortment trial',
                'quantity' => 12,
                'status' => 'pending',
                'notes' => 'Assorted flavors for hotel tasting.',
            ],
            [
                'sample_code' => 'SMP-DEMO-002',
                'name' => 'Signature cake slice',
                'quantity' => 4,
                'status' => 'delivered',
                'notes' => 'Delivered to Events by Nadia.',
            ],
            [
                'sample_code' => 'SMP-DEMO-003',
                'name' => 'Chocolate cake sample',
                'quantity' => 6,
                'status' => 'returned',
                'notes' => 'Client requested different recipe.',
            ],
        ];

        foreach ($samples as $data) {
            Sample::updateOrCreate(
                ['sample_code' => $data['sample_code']],
                array_merge($data, [
                    'product_id' => $product?->id,
                    'salesperson_id' => $salesRep->id,
                    'created_by' => $salesRep->id,
                ])
            );
        }
    }
}
