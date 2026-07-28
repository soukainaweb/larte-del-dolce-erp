<?php

namespace App\Providers;

use App\Models\ActivityLog;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Delivery;
use App\Models\Expense;
use App\Models\Inventory;
use App\Models\Invoice;
use App\Models\Notification;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Permission;
use App\Models\Product;
use App\Models\Production;
use App\Models\Role;
use App\Models\Setting;
use App\Models\Supplier;
use App\Models\User;
use App\Models\Warehouse;
use App\Policies\ActivityLogPolicy;
use App\Policies\CategoryPolicy;
use App\Policies\CustomerPolicy;
use App\Policies\DashboardPolicy;
use App\Policies\DeliveryPolicy;
use App\Policies\ExpensePolicy;
use App\Policies\FinancePolicy;
use App\Policies\InventoryPolicy;
use App\Policies\InvoicePolicy;
use App\Policies\NotificationPolicy;
use App\Policies\OrderPolicy;
use App\Policies\PaymentPolicy;
use App\Policies\PermissionPolicy;
use App\Policies\ProductPolicy;
use App\Policies\ProductionPolicy;
use App\Policies\ReportPolicy;
use App\Policies\RolePolicy;
use App\Policies\SettingPolicy;
use App\Policies\SupplierPolicy;
use App\Policies\UserPolicy;
use App\Policies\WarehousePolicy;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    protected $policies = [
        Order::class => OrderPolicy::class,
        Product::class => ProductPolicy::class,
        Inventory::class => InventoryPolicy::class,
        Invoice::class => InvoicePolicy::class,
        User::class => UserPolicy::class,
        Customer::class => CustomerPolicy::class,
        Category::class => CategoryPolicy::class,
        Supplier::class => SupplierPolicy::class,
        Warehouse::class => WarehousePolicy::class,
        Payment::class => PaymentPolicy::class,
        Expense::class => ExpensePolicy::class,
        Delivery::class => DeliveryPolicy::class,
        Production::class => ProductionPolicy::class,
        Notification::class => NotificationPolicy::class,
        Setting::class => SettingPolicy::class,
        Role::class => RolePolicy::class,
        Permission::class => PermissionPolicy::class,
        ActivityLog::class => ActivityLogPolicy::class,
    ];

    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        foreach ($this->policies as $model => $policy) {
            Gate::policy($model, $policy);
        }

        Gate::define('reports.view', [ReportPolicy::class, 'viewAny']);
        Gate::define('dashboard.view', [DashboardPolicy::class, 'viewAny']);
        Gate::define('finance.view', [FinancePolicy::class, 'viewAny']);

        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            $frontend = config('app.frontend_url', config('app.url'));

            return rtrim($frontend, '/') . '/reset-password?token=' . $token
                . '&email=' . urlencode($notifiable->getEmailForPasswordReset());
        });
    }
}
