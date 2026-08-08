<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Customer;
use App\Models\Notification;
use App\Models\Product;
use App\Models\Role;
use App\Models\Supplier;
use App\Models\User;
use Database\Seeders\SalesDemoSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EntityCreatedNotificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_create_customer_notifies_manager_and_excludes_creator(): void
    {
        $sales = User::where('email', SalesDemoSeeder::DEMO_EMAIL)->firstOrFail();
        $manager = User::where('email', 'manager@larte.com')->firstOrFail();

        Sanctum::actingAs($sales);

        $response = $this->postJson('/api/customers', [
            'name' => 'عميل إشعار',
            'phone' => '0500000001',
            'email' => 'notify-customer@example.com',
            'address' => 'Test address',
            'city' => 'Riyadh',
        ]);

        $response->assertCreated();

        $this->assertDatabaseHas('notifications', [
            'user_id' => $manager->id,
            'type' => 'customer',
            'title' => 'عميل جديد',
        ]);

        $this->assertDatabaseMissing('notifications', [
            'user_id' => $sales->id,
            'type' => 'customer',
        ]);
    }

    public function test_create_expense_notifies_finance_stakeholders(): void
    {
        $admin = User::where('email', 'madina7ali7@gmail.com')->firstOrFail();
        $manager = User::where('email', 'manager@larte.com')->firstOrFail();

        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/expenses', [
            'category' => 'office_supplies',
            'description' => 'مصروف إشعار',
            'amount' => 150,
            'expense_date' => now()->toDateString(),
        ]);

        $response->assertCreated();

        $this->assertDatabaseHas('notifications', [
            'user_id' => $manager->id,
            'type' => 'expense',
            'title' => 'مصروف جديد',
        ]);
    }

    public function test_create_supplier_notifies_procurement_stakeholders(): void
    {
        $admin = User::where('email', 'madina7ali7@gmail.com')->firstOrFail();
        $manager = User::where('email', 'manager@larte.com')->firstOrFail();

        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/suppliers', [
            'name' => 'مورد إشعار',
            'phone' => '0500000002',
            'email' => 'supplier-notify@example.com',
            'address' => 'Supplier street',
            'status' => 'active',
        ]);

        $response->assertCreated();

        $this->assertDatabaseHas('notifications', [
            'user_id' => $manager->id,
            'type' => 'supplier',
            'title' => 'مورد جديد',
        ]);
    }

    public function test_create_user_notifies_admin_and_manager(): void
    {
        $admin = User::where('email', 'madina7ali7@gmail.com')->firstOrFail();
        $manager = User::where('email', 'manager@larte.com')->firstOrFail();
        $viewerRole = Role::where('name', 'viewer')->firstOrFail();

        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/users', [
            'first_name' => 'New',
            'last_name' => 'User',
            'email' => 'new-user-notify@example.com',
            'role_id' => $viewerRole->id,
            'status' => 'active',
        ]);

        $response->assertCreated();

        $this->assertDatabaseHas('notifications', [
            'user_id' => $manager->id,
            'type' => 'user',
            'title' => 'مستخدم جديد',
        ]);

        $this->assertDatabaseMissing('notifications', [
            'user_id' => $admin->id,
            'type' => 'user',
        ]);
    }

    public function test_failed_customer_create_does_not_generate_notification(): void
    {
        $sales = User::where('email', SalesDemoSeeder::DEMO_EMAIL)->firstOrFail();
        $before = Notification::where('type', 'customer')->count();

        Sanctum::actingAs($sales);

        $this->postJson('/api/customers', [
            'phone' => '0500000003',
        ])->assertStatus(422);

        $this->assertSame($before, Notification::where('type', 'customer')->count());
    }

    public function test_unread_count_is_scoped_to_authenticated_user(): void
    {
        $sales = User::where('email', SalesDemoSeeder::DEMO_EMAIL)->firstOrFail();
        $manager = User::where('email', 'manager@larte.com')->firstOrFail();

        Notification::create([
            'user_id' => $manager->id,
            'title' => 'Manager only 1',
            'message' => 'Test',
            'type' => 'system',
            'is_read' => false,
        ]);

        Notification::create([
            'user_id' => $manager->id,
            'title' => 'Manager only 2',
            'message' => 'Test',
            'type' => 'system',
            'is_read' => false,
        ]);

        Notification::create([
            'user_id' => $sales->id,
            'title' => 'Sales only',
            'message' => 'Test',
            'type' => 'system',
            'is_read' => false,
        ]);

        Sanctum::actingAs($manager);
        $this->getJson('/api/notifications/unread-count')
            ->assertOk()
            ->assertJsonPath('data.count', 2);

        Sanctum::actingAs($sales);
        $this->getJson('/api/notifications/unread-count')
            ->assertOk()
            ->assertJsonPath('data.count', 1);
    }

    public function test_notification_message_contains_entity_context(): void
    {
        $sales = User::where('email', SalesDemoSeeder::DEMO_EMAIL)->firstOrFail();
        $manager = User::where('email', 'manager@larte.com')->firstOrFail();

        Sanctum::actingAs($sales);

        $response = $this->postJson('/api/customers', [
            'name' => 'عميل سياقي',
            'phone' => '0500000004',
            'email' => 'context-customer@example.com',
            'address' => 'Context address',
            'city' => 'Jeddah',
        ]);

        $customerId = $response->json('data.id');

        $notification = Notification::where('user_id', $manager->id)
            ->where('type', 'customer')
            ->latest('id')
            ->first();

        $this->assertNotNull($notification);
        $this->assertStringContainsString('عميل سياقي', $notification->message);
        $this->assertStringContainsString((string) $customerId, $notification->message);
        $this->assertStringContainsString('تمت إضافة عميل جديد', $notification->message);
    }
}
