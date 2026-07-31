<?php

use Illuminate\Support\Facades\Route;


// Controllers
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\DeliveryController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\FinanceController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProductionController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\WarehouseController;


// ==================================================
// CORS OPTIONS
// ==================================================

Route::options('/{any}', function () {

    return response('', 200)
        ->header('Access-Control-Allow-Origin', '*')
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');

})->where('any', '.*');



// ==================================================
// PUBLIC ROUTES
// ==================================================

Route::post('/login', [
    AuthController::class,
    'login'
])->middleware('throttle:login');

Route::post('/password/email', [AuthController::class, 'forgotPassword'])
    ->middleware('throttle:password-reset');
Route::post('/password/reset', [AuthController::class, 'resetPassword'])
    ->middleware('throttle:password-reset');


Route::get('/test', function () {

    return response()->json([
        'message' => 'API is working!',
        'cors' => true
    ]);

});




// ==================================================
// AUTHENTICATED ROUTES
// ==================================================

Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {



    // ==================================================
    // AUTH
    // ==================================================

    Route::post('/logout', [
        AuthController::class,
        'logout'
    ]);


    Route::get('/user', [
        AuthController::class,
        'user'
    ]);





    // ==================================================
    // PROFILE
    // ==================================================

    Route::prefix('profile')->group(function () {



        // Profile info
        Route::get('/', [
            ProfileController::class,
            'show'
        ]);


        Route::put('/', [
            ProfileController::class,
            'update'
        ]);



        // Device
        Route::post('/device', [
            ProfileController::class,
            'updateDevice'
        ]);



        // Avatar
        Route::post('/avatar', [
            ProfileController::class,
            'uploadAvatar'
        ]);


        Route::delete('/avatar', [
            ProfileController::class,
            'removeAvatar'
        ]);



        // Password
        Route::put('/password', [
            ProfileController::class,
            'changePassword'
        ]);



        // Preferences
        Route::put('/preferences', [
            ProfileController::class,
            'updatePreferences'
        ]);



        // Activity
        Route::get('/activity', [
            ProfileController::class,
            'activity'
        ]);


        Route::get('/activity/export', [
            ProfileController::class,
            'exportActivity'
        ]);



        // Sessions

        Route::get('/sessions', [
            ProfileController::class,
            'sessions'
        ]);


        Route::delete('/sessions/{id}', [
            ProfileController::class,
            'revokeSession'
        ]);


        Route::delete('/sessions', [
            ProfileController::class,
            'revokeAllSessions'
        ]);




        // Documents

        Route::get('/documents', [
            ProfileController::class,
            'documents'
        ]);


        Route::post('/documents', [
            ProfileController::class,
            'uploadDocument'
        ]);


        Route::delete('/documents/{id}', [
            ProfileController::class,
            'deleteDocument'
        ]);


        Route::get('/documents/{id}/download', [
            ProfileController::class,
            'downloadDocument'
        ]);





        // Permissions

        Route::get('/permissions', [
            ProfileController::class,
            'permissions'
        ]);





        // Statistics

        Route::get('/statistics', [
            ProfileController::class,
            'statistics'
        ]);





        // Two Factor

        Route::put('/2fa', [
            ProfileController::class,
            'updateTwoFactor'
        ]);




        // Notifications

        Route::get('/notifications/settings', [
            ProfileController::class,
            'notificationSettings'
        ]);


        Route::put('/notifications/settings', [
            ProfileController::class,
            'updateNotificationSettings'
        ]);

    });








    // ==================================================
    // DASHBOARD
    // ==================================================

    Route::prefix('dashboard')->middleware('permission:dashboard.view')->group(function () {



        Route::get('/stats', [
            DashboardController::class,
            'stats'
        ]);



        Route::get('/analytics', [
            DashboardController::class,
            'analytics'
        ]);



        Route::get('/orders', [
            DashboardController::class,
            'orders'
        ]);



        Route::get('/notifications', [
            DashboardController::class,
            'notifications'
        ]);



        // Production
        Route::get('/production', [
            DashboardController::class,
            'production'
        ]);


        // Frontend compatibility
        Route::get('/production-status', [
            DashboardController::class,
            'production'
        ]);



        // Top products

        Route::get('/top-products', [
            DashboardController::class,
            'topProducts'
        ]);

    });








    // ==================================================
    // USERS
    // ==================================================

    Route::prefix('users')->middleware('permission:users.view')->group(function () {
        Route::get('/roles', [UserController::class, 'roles']);
        Route::get('/statuses', [UserController::class, 'statuses']);
        Route::post('/password-reset', [UserController::class, 'passwordReset'])->middleware('permission:users.update');
        Route::get('/statistics', [UserController::class, 'statistics']);
        Route::get('/export', [UserController::class, 'export']);
        Route::get('/', [UserController::class, 'index']);
        Route::post('/', [UserController::class, 'store'])->middleware('permission:users.create');
        Route::get('/{user}', [UserController::class, 'show']);
        Route::put('/{user}', [UserController::class, 'update'])->middleware('permission:users.update');
        Route::patch('/{user}/status', [UserController::class, 'updateStatus'])->middleware('permission:users.update');
        Route::patch('/{user}/role', [UserController::class, 'updateRole'])->middleware('permission:users.update');
        Route::delete('/{user}', [UserController::class, 'destroy'])->middleware('permission:users.delete');
    });








    // ==================================================
    // ACTIVITY LOGS
    // ==================================================

    Route::prefix('activity-logs')->middleware('permission:users.view')->group(function () {


        Route::get('/', [
            ActivityLogController::class,
            'index'
        ]);


        Route::get('/statistics', [
            ActivityLogController::class,
            'statistics'
        ]);


        Route::get('/recent', [
            ActivityLogController::class,
            'recent'
        ]);


        Route::get('/users', [
            ActivityLogController::class,
            'users'
        ]);


        Route::get('/modules', [
            ActivityLogController::class,
            'modules'
        ]);


        Route::get('/actions', [
            ActivityLogController::class,
            'actions'
        ]);


        Route::get('/levels', [
            ActivityLogController::class,
            'levels'
        ]);


        Route::get('/chart-data', [
            ActivityLogController::class,
            'chartData'
        ]);


        Route::get('/charts', [
            ActivityLogController::class,
            'chartData'
        ]);


        Route::get('/logins', [
            ActivityLogController::class,
            'logins'
        ]);


        Route::get('/critical', [
            ActivityLogController::class,
            'critical'
        ]);


        Route::get('/errors', [
            ActivityLogController::class,
            'errors'
        ]);


        Route::get('/export', [
            ActivityLogController::class,
            'export'
        ]);


        Route::get('/user/{userId}', [
            ActivityLogController::class,
            'userLogs'
        ]);


        Route::get('/{activityLog}', [
            ActivityLogController::class,
            'show'
        ]);

    });








    // ==================================================
    // ANALYTICS
    // ==================================================

    Route::prefix('analytics')->middleware('permission:reports.view')->group(function () {
        Route::get('/metrics', [AnalyticsController::class, 'metrics']);
        Route::get('/sales/overview', [AnalyticsController::class, 'salesOverview']);
        Route::get('/production', [AnalyticsController::class, 'production']);
        Route::get('/financial', [AnalyticsController::class, 'financial']);
        Route::get('/deliveries', [AnalyticsController::class, 'deliveries']);
        Route::get('/sales-reps', [AnalyticsController::class, 'salesReps']);
        Route::get('/regions', [AnalyticsController::class, 'regions']);
        Route::get('/yearly-comparison', [AnalyticsController::class, 'yearlyComparison']);
        Route::get('/forecast', [AnalyticsController::class, 'forecast']);
        Route::get('/kpi-comparison', [AnalyticsController::class, 'kpiComparison']);
        Route::get('/radar', [AnalyticsController::class, 'radar']);
        Route::get('/activities', [AnalyticsController::class, 'activities']);
        Route::get('/alerts', [AnalyticsController::class, 'alerts']);
        Route::get('/export', [AnalyticsController::class, 'export']);
        Route::get('/orders', [AnalyticsController::class, 'orders']);
        Route::get('/revenue', [AnalyticsController::class, 'revenue']);
        Route::get('/products', [AnalyticsController::class, 'products']);
        Route::get('/customers', [AnalyticsController::class, 'customers']);
        Route::get('/expenses', [AnalyticsController::class, 'expenses']);
        Route::get('/summary', [AnalyticsController::class, 'summary']);
        Route::get('/realtime', [AnalyticsController::class, 'realtime']);
    });




    // ==================================================
    // CATEGORIES
    // ==================================================

    Route::prefix('categories')->middleware('permission:categories.view')->group(function () {
        Route::get('/statistics', [CategoryController::class, 'statistics']);
        Route::get('/export', [CategoryController::class, 'export']);
        Route::get('/tree', [CategoryController::class, 'tree']);
        Route::get('/parents', [CategoryController::class, 'parents']);
        Route::get('/statuses', [CategoryController::class, 'statuses']);
        Route::get('/slug/{slug}', [CategoryController::class, 'showBySlug']);
        Route::get('/', [CategoryController::class, 'index']);
        Route::post('/', [CategoryController::class, 'store'])->middleware('permission:categories.create');
        Route::get('/{category}', [CategoryController::class, 'show']);
        Route::put('/{category}', [CategoryController::class, 'update'])->middleware('permission:categories.update');
        Route::delete('/{category}/force', [CategoryController::class, 'forceDestroy'])->middleware('permission:categories.delete');
        Route::post('/{category}/restore', [CategoryController::class, 'restore'])->middleware('permission:categories.update');
        Route::patch('/{category}/status', [CategoryController::class, 'updateStatus'])->middleware('permission:categories.update');
        Route::patch('/{category}/visibility', [CategoryController::class, 'updateVisibility'])->middleware('permission:categories.update');
        Route::patch('/{category}/order', [CategoryController::class, 'updateOrder'])->middleware('permission:categories.update');
        Route::delete('/{category}', [CategoryController::class, 'destroy'])->middleware('permission:categories.delete');
    });




    // ==================================================
    // PRODUCTS
    // ==================================================

    Route::prefix('products')->middleware('permission:products.view')->group(function () {
        Route::get('/statistics', [ProductController::class, 'statistics']);
        Route::get('/export', [ProductController::class, 'export']);
        Route::get('/categories', [ProductController::class, 'categories']);
        Route::get('/statuses', [ProductController::class, 'statuses']);
        Route::get('/', [ProductController::class, 'index']);
        Route::post('/', [ProductController::class, 'store'])->middleware('permission:products.create');
        Route::get('/{product}', [ProductController::class, 'show']);
        Route::put('/{product}', [ProductController::class, 'update'])->middleware('permission:products.update');
        Route::patch('/{product}/stock', [ProductController::class, 'updateStock'])->middleware('permission:products.update');
        Route::patch('/{product}/status', [ProductController::class, 'updateStatus'])->middleware('permission:products.update');
        Route::post('/{product}/restore', [ProductController::class, 'restore'])->middleware('permission:products.update');
        Route::delete('/{product}/force', [ProductController::class, 'forceDestroy'])->middleware('permission:products.delete');
        Route::delete('/{product}', [ProductController::class, 'destroy'])->middleware('permission:products.delete');
    });




    // ==================================================
    // CUSTOMERS
    // ==================================================

    Route::prefix('customers')->middleware('permission:customers.view')->group(function () {
        Route::get('/statistics', [CustomerController::class, 'statistics']);
        Route::get('/export', [CustomerController::class, 'export']);
        Route::get('/types', [CustomerController::class, 'types']);
        Route::get('/statuses', [CustomerController::class, 'statuses']);
        Route::get('/', [CustomerController::class, 'index']);
        Route::post('/', [CustomerController::class, 'store'])->middleware('permission:customers.create');
        Route::get('/{customer}', [CustomerController::class, 'show']);
        Route::put('/{customer}', [CustomerController::class, 'update'])->middleware('permission:customers.update');
        Route::delete('/{customer}', [CustomerController::class, 'destroy'])->middleware('permission:customers.delete');
    });




    // ==================================================
    // ORDERS
    // ==================================================

    Route::prefix('orders')->middleware('permission:orders.view')->group(function () {
        Route::get('/statistics', [OrderController::class, 'statistics']);
        Route::get('/export', [OrderController::class, 'export']);
        Route::get('/history', [OrderController::class, 'history']);
        Route::get('/', [OrderController::class, 'index']);
        Route::post('/', [OrderController::class, 'store'])->middleware('permission:orders.create');
        Route::get('/{order}', [OrderController::class, 'show']);
        Route::get('/{order}/status-history', [OrderController::class, 'statusHistory']);
        Route::get('/{order}/allowed-transitions', [OrderController::class, 'allowedTransitions']);
        Route::put('/{order}', [OrderController::class, 'update'])->middleware('permission:orders.update');
        Route::patch('/{order}/status', [OrderController::class, 'updateStatus'])->middleware('permission:orders.update');
        Route::patch('/{order}/payment', [OrderController::class, 'updatePayment'])->middleware('permission:orders.update');
        Route::post('/{order}/validate', [OrderController::class, 'validateOrder'])->middleware('permission:orders.update');
        Route::post('/{order}/cancel', [OrderController::class, 'cancel'])->middleware('permission:orders.update');
        Route::post('/{order}/start-production', [OrderController::class, 'startProduction'])->middleware('permission:orders.update');
        Route::get('/{order}/products', [OrderController::class, 'products']);
        Route::post('/{order}/products', [OrderController::class, 'addProduct'])->middleware('permission:orders.update');
        Route::patch('/{order}/products/{orderItem}', [OrderController::class, 'updateProduct'])->middleware('permission:orders.update');
        Route::delete('/{order}/products/{orderItem}', [OrderController::class, 'removeProduct'])->middleware('permission:orders.update');
        Route::delete('/{order}', [OrderController::class, 'destroy'])->middleware('permission:orders.delete');
    });




    // ==================================================
    // INVENTORY
    // ==================================================

    Route::prefix('inventory')->middleware('permission:inventory.view')->group(function () {
        Route::get('/statistics', [InventoryController::class, 'statistics']);
        Route::get('/export', [InventoryController::class, 'export']);
        Route::get('/categories', [InventoryController::class, 'categories']);
        Route::get('/types', [InventoryController::class, 'types']);
        Route::get('/statuses', [InventoryController::class, 'statuses']);
        Route::post('/movements', [InventoryController::class, 'createMovement'])->middleware('permission:inventory.create');
        Route::get('/', [InventoryController::class, 'index']);
        Route::post('/', [InventoryController::class, 'store'])->middleware('permission:inventory.create');
        Route::get('/{inventory}', [InventoryController::class, 'show']);
        Route::put('/{inventory}', [InventoryController::class, 'update'])->middleware('permission:inventory.update');
        Route::post('/{inventory}/restore', [InventoryController::class, 'restore'])->middleware('permission:inventory.update');
        Route::delete('/{inventory}/force', [InventoryController::class, 'forceDestroy'])->middleware('permission:inventory.delete');
        Route::get('/{inventory}/movements', [InventoryController::class, 'movements']);
        Route::delete('/{inventory}', [InventoryController::class, 'destroy'])->middleware('permission:inventory.delete');
    });




    // ==================================================
    // WAREHOUSES
    // ==================================================

    Route::prefix('warehouses')->middleware('permission:warehouses.view')->group(function () {
        Route::get('/statistics', [WarehouseController::class, 'statistics']);
        Route::get('/export', [WarehouseController::class, 'export']);
        Route::get('/types', [WarehouseController::class, 'types']);
        Route::get('/statuses', [WarehouseController::class, 'statuses']);
        Route::post('/transfer', [WarehouseController::class, 'transfer'])->middleware('permission:warehouses.update');
        Route::get('/', [WarehouseController::class, 'index']);
        Route::post('/', [WarehouseController::class, 'store'])->middleware('permission:warehouses.create');
        Route::get('/{warehouse}', [WarehouseController::class, 'show']);
        Route::put('/{warehouse}', [WarehouseController::class, 'update'])->middleware('permission:warehouses.update');
        Route::post('/{warehouse}/restore', [WarehouseController::class, 'restore'])->middleware('permission:warehouses.update');
        Route::delete('/{warehouse}/force', [WarehouseController::class, 'forceDestroy'])->middleware('permission:warehouses.delete');
        Route::delete('/{warehouse}', [WarehouseController::class, 'destroy'])->middleware('permission:warehouses.delete');
    });




    // ==================================================
    // SUPPLIERS
    // ==================================================

    Route::prefix('suppliers')->middleware('permission:suppliers.view')->group(function () {
        Route::get('/statistics', [SupplierController::class, 'statistics']);
        Route::get('/export', [SupplierController::class, 'export']);
        Route::get('/types', [SupplierController::class, 'types']);
        Route::get('/statuses', [SupplierController::class, 'statuses']);
        Route::get('/', [SupplierController::class, 'index']);
        Route::post('/', [SupplierController::class, 'store'])->middleware('permission:suppliers.create');
        Route::get('/{supplier}', [SupplierController::class, 'show']);
        Route::put('/{supplier}', [SupplierController::class, 'update'])->middleware('permission:suppliers.update');
        Route::patch('/{supplier}/status', [SupplierController::class, 'toggleStatus'])->middleware('permission:suppliers.update');
        Route::delete('/{supplier}', [SupplierController::class, 'destroy'])->middleware('permission:suppliers.delete');
    });




    // ==================================================
    // INVOICES
    // ==================================================

    Route::prefix('invoices')->middleware('permission:finance.view')->group(function () {
        Route::get('/statistics', [InvoiceController::class, 'statistics']);
        Route::get('/export', [InvoiceController::class, 'export']);
        Route::get('/statuses', [InvoiceController::class, 'statuses']);
        Route::get('/payment-statuses', [InvoiceController::class, 'paymentStatuses']);
        Route::get('/payment-methods', [InvoiceController::class, 'paymentMethods']);
        Route::get('/', [InvoiceController::class, 'index']);
        Route::post('/', [InvoiceController::class, 'store'])->middleware('permission:finance.create');
        Route::get('/{invoice}', [InvoiceController::class, 'show']);
        Route::put('/{invoice}', [InvoiceController::class, 'update'])->middleware('permission:finance.update');
        Route::post('/{invoice}/restore', [InvoiceController::class, 'restore'])->middleware('permission:finance.update');
        Route::post('/{invoice}/send', [InvoiceController::class, 'send'])->middleware('permission:finance.update');
        Route::get('/{invoice}/print', [InvoiceController::class, 'print']);
        Route::delete('/{invoice}', [InvoiceController::class, 'destroy'])->middleware('permission:finance.delete');
    });




    // ==================================================
    // PAYMENTS
    // ==================================================

    Route::prefix('payments')->middleware('permission:payments.view')->group(function () {
        Route::get('/statistics', [PaymentController::class, 'statistics']);
        Route::get('/export', [PaymentController::class, 'export']);
        Route::get('/methods', [PaymentController::class, 'methods']);
        Route::get('/statuses', [PaymentController::class, 'statuses']);
        Route::get('/reference/{reference}', [PaymentController::class, 'showByReference']);
        Route::get('/', [PaymentController::class, 'index']);
        Route::post('/', [PaymentController::class, 'store'])->middleware('permission:payments.create');
        Route::get('/{payment}', [PaymentController::class, 'show']);
        Route::put('/{payment}', [PaymentController::class, 'update'])->middleware('permission:payments.update');
        Route::post('/{payment}/receipt', [PaymentController::class, 'receipt'])->middleware('permission:payments.update');
        Route::get('/{payment}/print', [PaymentController::class, 'print']);
        Route::delete('/{payment}', [PaymentController::class, 'destroy'])->middleware('permission:payments.delete');
    });




    // ==================================================
    // EXPENSES
    // ==================================================

    Route::prefix('expenses')->middleware('permission:expenses.view')->group(function () {
        Route::get('/statistics', [ExpenseController::class, 'statistics']);
        Route::get('/categories', [ExpenseController::class, 'getCategories']);
        Route::get('/payment-methods', [ExpenseController::class, 'paymentMethods']);
        Route::get('/payment-statuses', [ExpenseController::class, 'paymentStatuses']);
        Route::get('/export', [ExpenseController::class, 'export']);
        Route::get('/', [ExpenseController::class, 'index']);
        Route::post('/', [ExpenseController::class, 'store'])->middleware('permission:expenses.create');
        Route::get('/{expense}', [ExpenseController::class, 'show']);
        Route::put('/{expense}', [ExpenseController::class, 'update'])->middleware('permission:expenses.update');
        Route::delete('/{expense}', [ExpenseController::class, 'destroy'])->middleware('permission:expenses.delete');
    });




    // ==================================================
    // DELIVERIES
    // ==================================================

    Route::prefix('deliveries')->middleware('permission:deliveries.view')->group(function () {
        Route::get('/export', [DeliveryController::class, 'export']);
        Route::get('/vehicles', [DeliveryController::class, 'vehiclesIndex']);
        Route::post('/vehicles', [DeliveryController::class, 'vehiclesStore'])->middleware('permission:deliveries.create');
        Route::get('/vehicles/{vehicle}', [DeliveryController::class, 'vehiclesShow']);
        Route::put('/vehicles/{vehicle}', [DeliveryController::class, 'vehiclesUpdate'])->middleware('permission:deliveries.update');
        Route::delete('/vehicles/{vehicle}', [DeliveryController::class, 'vehiclesDestroy'])->middleware('permission:deliveries.delete');
        Route::get('/', [DeliveryController::class, 'index']);
        Route::post('/', [DeliveryController::class, 'store'])->middleware('permission:deliveries.create');
        Route::get('/{delivery}', [DeliveryController::class, 'show']);
        Route::put('/{delivery}', [DeliveryController::class, 'update'])->middleware('permission:deliveries.update');
        Route::patch('/{delivery}/status', [DeliveryController::class, 'updateStatus'])->middleware('permission:deliveries.update');
        Route::delete('/{delivery}', [DeliveryController::class, 'destroy'])->middleware('permission:deliveries.delete');
    });




    // ==================================================
    // PRODUCTIONS
    // ==================================================

    Route::prefix('productions')->middleware('permission:productions.view')->group(function () {
        Route::get('/statistics', [ProductionController::class, 'statistics']);
        Route::get('/statuses', [ProductionController::class, 'getStatuses']);
        Route::get('/priorities', [ProductionController::class, 'getPriorities']);
        Route::get('/export', [ProductionController::class, 'export']);
        Route::get('/', [ProductionController::class, 'index']);
        Route::post('/', [ProductionController::class, 'store'])->middleware('permission:productions.create');
        Route::get('/{production}', [ProductionController::class, 'show']);
        Route::put('/{production}', [ProductionController::class, 'update'])->middleware('permission:productions.update');
        Route::patch('/{production}/status', [ProductionController::class, 'updateStatus'])->middleware('permission:productions.update');
        Route::patch('/{production}/progress', [ProductionController::class, 'updateProgress'])->middleware('permission:productions.update');
        Route::patch('/{production}/assign', [ProductionController::class, 'assign'])->middleware('permission:productions.update');
        Route::delete('/{production}', [ProductionController::class, 'destroy'])->middleware('permission:productions.delete');
    });




    // ==================================================
    // NOTIFICATIONS
    // ==================================================

    Route::prefix('notifications')->middleware('permission:notifications.view')->group(function () {
        Route::get('/modules', [NotificationController::class, 'modules']);
        Route::get('/priorities', [NotificationController::class, 'priorities']);
        Route::get('/statistics', [NotificationController::class, 'statistics']);
        Route::get('/export', [NotificationController::class, 'export']);
        Route::get('/unread-count', [NotificationController::class, 'getUnreadCount']);
        Route::patch('/mark-all-read', [NotificationController::class, 'markAllRead']);
        Route::patch('/mark-read', [NotificationController::class, 'markBatchRead']);
        Route::delete('/read', [NotificationController::class, 'deleteRead']);
        Route::delete('/batch', [NotificationController::class, 'deleteBatch']);
        Route::get('/', [NotificationController::class, 'index']);
        Route::post('/', [NotificationController::class, 'store'])->middleware('permission:notifications.create');
        Route::get('/{notification}', [NotificationController::class, 'show']);
        Route::patch('/{notification}/read', [NotificationController::class, 'markAsRead']);
        Route::delete('/{notification}', [NotificationController::class, 'destroy']);
    });




    // ==================================================
    // ROLES & PERMISSIONS
    // ==================================================

    Route::prefix('roles')->middleware('permission:roles.view')->group(function () {
        Route::get('/statistics', [RoleController::class, 'statistics']);
        Route::get('/export', [RoleController::class, 'export']);
        Route::get('/statuses', [RoleController::class, 'statuses']);
        Route::get('/', [RoleController::class, 'index']);
        Route::post('/', [RoleController::class, 'store'])->middleware('permission:roles.create');
        Route::get('/{role}', [RoleController::class, 'show']);
        Route::put('/{role}', [RoleController::class, 'update'])->middleware('permission:roles.update');
        Route::patch('/{role}/status', [RoleController::class, 'toggleStatus'])->middleware('permission:roles.update');
        Route::post('/{role}/duplicate', [RoleController::class, 'duplicate'])->middleware('permission:roles.create');
        Route::get('/{role}/permissions', [RoleController::class, 'getPermissions']);
        Route::patch('/{role}/permissions', [RoleController::class, 'updatePermissions'])->middleware('permission:roles.update');
        Route::get('/{role}/users', [RoleController::class, 'getUsers']);
        Route::post('/{role}/users', [RoleController::class, 'addUser'])->middleware('permission:roles.update');
        Route::delete('/{role}/users/{userId}', [RoleController::class, 'removeUser'])->middleware('permission:roles.update');
        Route::delete('/{role}', [RoleController::class, 'destroy'])->middleware('permission:roles.delete');
    });

    Route::prefix('permissions')->middleware('permission:permissions.view')->group(function () {
        Route::get('/modules', [PermissionController::class, 'modules']);
        Route::get('/grouped', [PermissionController::class, 'grouped']);
        Route::get('/statuses', [PermissionController::class, 'statuses']);
        Route::get('/export', [PermissionController::class, 'export']);
        Route::get('/', [PermissionController::class, 'index']);
        Route::post('/', [PermissionController::class, 'store'])->middleware('permission:permissions.create');
        Route::get('/{permission}', [PermissionController::class, 'show']);
        Route::put('/{permission}', [PermissionController::class, 'update'])->middleware('permission:permissions.update');
        Route::patch('/{permission}/status', [PermissionController::class, 'toggleStatus'])->middleware('permission:permissions.update');
        Route::delete('/{permission}', [PermissionController::class, 'destroy'])->middleware('permission:permissions.delete');
    });




    // ==================================================
    // SETTINGS
    // ==================================================

    Route::prefix('settings')->middleware('permission:settings.view')->group(function () {
        Route::get('/key/{key}', [SettingController::class, 'getByKey']);
        Route::put('/key/{key}', [SettingController::class, 'updateByKey'])->middleware('permission:settings.update');
        Route::get('/group/{group}', [SettingController::class, 'getByGroup']);
        Route::get('/', [SettingController::class, 'index']);
        Route::post('/', [SettingController::class, 'store'])->middleware('permission:settings.update');
        Route::get('/{setting}', [SettingController::class, 'show']);
        Route::put('/{setting}', [SettingController::class, 'update'])->middleware('permission:settings.update');
        Route::delete('/{setting}', [SettingController::class, 'destroy'])->middleware('permission:settings.update');
    });




    // ==================================================
    // FINANCE
    // ==================================================

    Route::prefix('finance')->middleware('permission:finance.view')->group(function () {
        Route::get('/metrics', [FinanceController::class, 'metrics']);
        Route::get('/revenue-expenses', [FinanceController::class, 'revenueExpenses']);
        Route::get('/expense-categories', [FinanceController::class, 'expenseCategories']);
        Route::get('/transactions', [FinanceController::class, 'transactions']);
        Route::get('/payments/customers', [FinanceController::class, 'pendingCustomerPayments']);
        Route::get('/payments/suppliers', [FinanceController::class, 'pendingSupplierPayments']);
        Route::get('/notifications', [FinanceController::class, 'notifications']);
        Route::get('/customers/top', [FinanceController::class, 'topCustomers']);
        Route::get('/suppliers/top', [FinanceController::class, 'topSuppliers']);
        Route::get('/summary', [FinanceController::class, 'summary']);
        Route::get('/export', [FinanceController::class, 'export']);
    });




    // ==================================================
    // REPORTS
    // ==================================================

    Route::prefix('reports')->middleware('permission:reports.view')->group(function () {
        Route::get('/sales-overview', [ReportController::class, 'sales']);
        Route::get('/orders', [ReportController::class, 'orders']);
        Route::get('/production', [ReportController::class, 'production']);
        Route::get('/products', [ReportController::class, 'inventory']);
        Route::get('/customers', [ReportController::class, 'customers']);
        Route::get('/invoices', [ReportController::class, 'financial']);
        Route::get('/deliveries', [ReportController::class, 'deliveries']);
        Route::get('/sales-reps', [ReportController::class, 'salesReps']);
        Route::get('/yearly-comparison', [ReportController::class, 'yearlyComparison']);
        Route::get('/order-status', [ReportController::class, 'orderStatus']);
        Route::get('/activities', [ReportController::class, 'activities']);
        Route::get('/alerts', [ReportController::class, 'alerts']);
        Route::post('/generate', [ReportController::class, 'generate']);
        Route::get('/list', [ReportController::class, 'listGenerated']);
        Route::get('/list/{id}', [ReportController::class, 'showGenerated']);
        Route::delete('/list/{id}', [ReportController::class, 'deleteGenerated']);
        Route::get('/export', [ReportController::class, 'export']);
    });


});