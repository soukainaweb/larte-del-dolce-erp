<?php

namespace Tests\Feature;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class NotificationListTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_notifications_index_returns_paginated_items_for_authenticated_user(): void
    {
        $manager = User::where('email', 'manager@larte.com')->firstOrFail();

        Notification::where('user_id', $manager->id)->delete();

        for ($i = 1; $i <= 13; $i++) {
            Notification::create([
                'user_id' => $manager->id,
                'title' => "Test notification {$i}",
                'message' => "Message {$i} /dashboard/orders/{$i}",
                'type' => 'order',
                'is_read' => $i <= 3,
            ]);
        }

        Sanctum::actingAs($manager);

        $response = $this->getJson('/api/notifications?per_page=10&page=1');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(10, 'data.data')
            ->assertJsonPath('data.total', 13);

        $this->getJson('/api/notifications/statistics')
            ->assertOk()
            ->assertJsonPath('data.total', 13)
            ->assertJsonPath('data.unread', 10);
    }

    public function test_notifications_index_can_filter_unread_only(): void
    {
        $manager = User::where('email', 'manager@larte.com')->firstOrFail();

        Notification::where('user_id', $manager->id)->delete();

        Notification::create([
            'user_id' => $manager->id,
            'title' => 'Unread one',
            'message' => 'Unread message',
            'type' => 'system',
            'is_read' => false,
        ]);

        Notification::create([
            'user_id' => $manager->id,
            'title' => 'Read one',
            'message' => 'Read message',
            'type' => 'system',
            'is_read' => true,
        ]);

        Sanctum::actingAs($manager);

        $this->getJson('/api/notifications?status=unread')
            ->assertOk()
            ->assertJsonCount(1, 'data.data')
            ->assertJsonPath('data.total', 1);

        $this->getJson('/api/notifications')
            ->assertOk()
            ->assertJsonCount(2, 'data.data')
            ->assertJsonPath('data.total', 2);
    }

    public function test_read_notification_is_included_in_default_list(): void
    {
        $manager = User::where('email', 'manager@larte.com')->firstOrFail();

        Notification::where('user_id', $manager->id)->delete();

        Notification::create([
            'user_id' => $manager->id,
            'title' => 'Only read notification',
            'message' => 'Already read',
            'type' => 'order',
            'is_read' => true,
        ]);

        Sanctum::actingAs($manager);

        $this->getJson('/api/notifications/statistics')
            ->assertOk()
            ->assertJsonPath('data.total', 1)
            ->assertJsonPath('data.unread', 0);

        $this->getJson('/api/notifications?per_page=10&page=1')
            ->assertOk()
            ->assertJsonCount(1, 'data.data')
            ->assertJsonPath('data.total', 1)
            ->assertJsonPath('data.data.0.title', 'Only read notification');
    }

    public function test_user_only_sees_own_notifications(): void
    {
        $manager = User::where('email', 'manager@larte.com')->firstOrFail();
        $admin = User::where('email', 'madina7ali7@gmail.com')->firstOrFail();

        Notification::create([
            'user_id' => $manager->id,
            'title' => 'Manager only',
            'message' => 'Private',
            'type' => 'system',
            'is_read' => false,
        ]);

        Sanctum::actingAs($admin);

        $this->getJson('/api/notifications')
            ->assertOk();

        $titles = collect($this->getJson('/api/notifications')->json('data.data'))->pluck('title');
        $this->assertFalse($titles->contains('Manager only'));
    }
}
