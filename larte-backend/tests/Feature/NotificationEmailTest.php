<?php

namespace Tests\Feature;

use App\Mail\InAppNotificationMail;
use App\Models\Customer;
use App\Models\Notification;
use App\Models\Product;
use App\Models\Role;
use App\Models\User;
use App\Services\NotificationDeliveryService;
use Database\Seeders\SalesDemoSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use Mockery;
use Tests\TestCase;

class NotificationEmailTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
        Cache::flush();
    }

    public function test_in_app_notification_is_still_created_when_email_is_sent(): void
    {
        Mail::fake();

        $sales = User::where('email', SalesDemoSeeder::DEMO_EMAIL)->firstOrFail();
        $manager = User::where('email', 'manager@larte.com')->firstOrFail();

        Sanctum::actingAs($sales);

        $this->postJson('/api/customers', [
            'name' => 'عميل بريد',
            'phone' => '0500000099',
            'email' => 'email-test-customer@example.com',
            'address' => 'Test address',
            'city' => 'Riyadh',
        ])->assertCreated();

        $this->assertDatabaseHas('notifications', [
            'user_id' => $manager->id,
            'type' => 'customer',
            'title' => 'عميل جديد',
        ]);

        Mail::assertSent(InAppNotificationMail::class, function (InAppNotificationMail $mail) use ($manager) {
            return $mail->hasTo($manager->email)
                && $mail->title === 'عميل جديد';
        });
    }

    public function test_notification_email_is_sent_to_recipient_registered_address(): void
    {
        Mail::fake();

        $manager = User::where('email', 'manager@larte.com')->firstOrFail();

        app(NotificationDeliveryService::class)->deliver($manager, [
            'type' => 'order',
            'title' => 'طلب جديد',
            'message' => "رقم الطلب: ORD-001\nhttp://localhost:5173/dashboard/orders/1",
        ]);

        Mail::assertSent(InAppNotificationMail::class, function (InAppNotificationMail $mail) use ($manager) {
            return $mail->hasTo($manager->email);
        });

        Mail::assertNotSent(InAppNotificationMail::class, function (InAppNotificationMail $mail) {
            return $mail->hasTo('sales.demo@larte.com');
        });
    }

    public function test_different_users_receive_emails_at_their_own_addresses(): void
    {
        Mail::fake();

        $manager = User::where('email', 'manager@larte.com')->firstOrFail();
        $sales = User::where('email', SalesDemoSeeder::DEMO_EMAIL)->firstOrFail();

        $delivery = app(NotificationDeliveryService::class);

        $delivery->deliver($manager, [
            'type' => 'system',
            'title' => 'Manager alert',
            'message' => 'Manager message',
        ]);

        $delivery->deliver($sales, [
            'type' => 'system',
            'title' => 'Sales alert',
            'message' => 'Sales message',
        ]);

        Mail::assertSent(InAppNotificationMail::class, 2);

        Mail::assertSent(InAppNotificationMail::class, function (InAppNotificationMail $mail) use ($manager) {
            return $mail->hasTo($manager->email) && $mail->title === 'Manager alert';
        });

        Mail::assertSent(InAppNotificationMail::class, function (InAppNotificationMail $mail) use ($sales) {
            return $mail->hasTo($sales->email) && $mail->title === 'Sales alert';
        });
    }

    public function test_notification_email_works_for_any_role(): void
    {
        Mail::fake();

        $factoryRole = Role::where('name', 'factory')->firstOrFail();
        $factoryUser = User::updateOrCreate(
            ['email' => 'factory.email.test@larte.com'],
            [
                'first_name' => 'Factory',
                'last_name' => 'User',
                'password' => '123456',
                'role_id' => $factoryRole->id,
                'status' => 'active',
            ]
        );

        app(NotificationDeliveryService::class)->deliver($factoryUser, [
            'type' => 'order',
            'title' => 'طلب جديد للمصنع',
            'message' => "تمت الموافقة على الطلب #ORD-99\nhttp://localhost:5173/dashboard/orders/99",
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $factoryUser->id,
            'title' => 'طلب جديد للمصنع',
        ]);

        Mail::assertSent(InAppNotificationMail::class, function (InAppNotificationMail $mail) use ($factoryUser) {
            return $mail->hasTo($factoryUser->email);
        });
    }

    public function test_user_without_email_still_receives_in_app_notification(): void
    {
        Mail::fake();

        $role = Role::firstOrFail();
        $user = User::create([
            'first_name' => 'No',
            'last_name' => 'Email',
            'email' => 'noemail.test@larte.com',
            'password' => '123456',
            'role_id' => $role->id,
            'status' => 'active',
        ]);

        \Illuminate\Support\Facades\DB::table('users')
            ->where('id', $user->id)
            ->update(['email' => 'invalid-email']);
        $user->refresh();

        app(NotificationDeliveryService::class)->deliver($user, [
            'type' => 'system',
            'title' => 'تنبيه',
            'message' => 'رسالة بدون بريد',
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $user->id,
            'title' => 'تنبيه',
        ]);

        Mail::assertNothingSent();
    }

    public function test_email_failure_does_not_prevent_in_app_notification_creation(): void
    {
        $manager = User::where('email', 'manager@larte.com')->firstOrFail();

        Mail::shouldReceive('to')
            ->once()
            ->with($manager->email)
            ->andReturnSelf();
        Mail::shouldReceive('send')
            ->once()
            ->andThrow(new \RuntimeException('SMTP unavailable'));

        $notification = app(NotificationDeliveryService::class)->deliver($manager, [
            'type' => 'system',
            'title' => 'فشل البريد',
            'message' => 'يجب أن تُنشأ الإشعار',
        ]);

        $this->assertNotNull($notification);
        $this->assertDatabaseHas('notifications', [
            'id' => $notification->id,
            'user_id' => $manager->id,
        ]);
    }

    public function test_email_failure_does_not_break_main_business_operation(): void
    {
        Mail::shouldReceive('to')
            ->andThrow(new \RuntimeException('SMTP unavailable'));

        $sales = User::where('email', SalesDemoSeeder::DEMO_EMAIL)->firstOrFail();
        $manager = User::where('email', 'manager@larte.com')->firstOrFail();
        $customer = Customer::firstOrFail();
        $product = Product::firstOrFail();

        Sanctum::actingAs($sales);

        $response = $this->postJson('/api/orders', [
            'customer_id' => $customer->id,
            'sales_rep_id' => $sales->id,
            'priority' => 'high',
            'delivery_date' => now()->addDays(2)->toDateString(),
            'delivery_time' => '14:00',
            'payment_method' => 'cash',
            'notes' => 'Email failure should not block order',
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 1,
                    'price' => 100,
                    'discount' => 0,
                ],
            ],
        ]);

        $response->assertCreated();

        $this->assertDatabaseHas('notifications', [
            'user_id' => $manager->id,
            'type' => 'order',
        ]);
    }

    public function test_duplicate_notification_does_not_send_duplicate_emails(): void
    {
        Mail::fake();

        $manager = User::where('email', 'manager@larte.com')->firstOrFail();
        $delivery = app(NotificationDeliveryService::class);

        $payload = [
            'type' => 'order',
            'title' => 'طلب مكرر',
            'message' => 'نفس الرسالة',
        ];

        $delivery->deliver($manager, $payload);
        $delivery->deliver($manager, $payload);

        Mail::assertSent(InAppNotificationMail::class, 1);

        $this->assertSame(2, Notification::where('user_id', $manager->id)
            ->where('title', 'طلب مكرر')
            ->count());
    }

    public function test_existing_notification_recipient_rules_remain_unchanged(): void
    {
        Mail::fake();

        $sales = User::where('email', SalesDemoSeeder::DEMO_EMAIL)->firstOrFail();
        $manager = User::where('email', 'manager@larte.com')->firstOrFail();

        Sanctum::actingAs($sales);

        $this->postJson('/api/customers', [
            'name' => 'عميل قواعد المستلمين',
            'phone' => '0500000100',
            'email' => 'recipient-rules@example.com',
            'address' => 'Test address',
            'city' => 'Riyadh',
        ])->assertCreated();

        $this->assertDatabaseHas('notifications', [
            'user_id' => $manager->id,
            'type' => 'customer',
        ]);

        $this->assertDatabaseMissing('notifications', [
            'user_id' => $sales->id,
            'type' => 'customer',
        ]);

        Mail::assertSent(InAppNotificationMail::class, function (InAppNotificationMail $mail) use ($manager) {
            return $mail->hasTo($manager->email);
        });

        Mail::assertNotSent(InAppNotificationMail::class, function (InAppNotificationMail $mail) use ($sales) {
            return $mail->hasTo($sales->email);
        });
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
