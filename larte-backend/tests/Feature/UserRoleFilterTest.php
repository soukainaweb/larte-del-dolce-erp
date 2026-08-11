<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\SalesDemoSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserRoleFilterTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_users_index_can_filter_by_role_name(): void
    {
        $admin = User::where('email', 'madina7ali7@gmail.com')->firstOrFail();
        $sales = User::where('email', SalesDemoSeeder::DEMO_EMAIL)->firstOrFail();
        $manager = User::where('email', 'manager@larte.com')->firstOrFail();

        Sanctum::actingAs($admin);
        $response = $this->getJson('/api/users?role=sales&per_page=200')->assertOk();
        $ids = collect($response->json('data.data'))->pluck('id')->all();

        $this->assertContains($sales->id, $ids);
        $this->assertNotContains($manager->id, $ids);
        foreach ($response->json('data.data') as $user) {
            $this->assertSame('sales', $user['role']['name'] ?? null);
        }
    }
}
