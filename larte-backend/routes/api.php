<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\WarehouseController;
use App\Http\Controllers\Api\ProductionController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\AnalyticsController;

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

Route::post('/login', [AuthController::class, 'login']);


Route::get('/test', function () {

    return response()->json([
        'message' => 'API is working!',
        'cors' => true
    ]);

});



// ==================================================
// PROTECTED ROUTES
// ==================================================

Route::middleware('auth:sanctum')->group(function () {
    // ==================================================
// ACTIVITY LOGS
// ==================================================

Route::prefix('activity-logs')->group(function () {

    // All logs
    Route::get('/', [ActivityLogController::class, 'index']);

    // Single log
    Route::get('/{activityLog}', [ActivityLogController::class, 'show']);

    // Statistics
    Route::get('/statistics', [ActivityLogController::class, 'statistics']);

    // Recent logs
    Route::get('/recent', [ActivityLogController::class, 'recent']);

    // Logs by user
    Route::get('/user/{userId}', [ActivityLogController::class, 'userLogs']);

    // Errors logs
    Route::get('/errors', [ActivityLogController::class, 'errors']);

    // Export
    Route::get('/export', [ActivityLogController::class, 'export']);

});


    // ==================================================
    // AUTH
    // ==================================================

    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/user', [AuthController::class, 'user']);



    // ==================================================
    // PROFILE
    // ==================================================

    Route::prefix('profile')->group(function () {


        // GET PROFILE
        Route::get('/', [ProfileController::class, 'show']);


        // UPDATE PROFILE
        Route::put('/', [ProfileController::class, 'update']);


        // DEVICE UPDATE
        Route::post('/device', [ProfileController::class, 'updateDevice']);



        // AVATAR
        Route::post('/avatar', [ProfileController::class, 'uploadAvatar']);

        Route::delete('/avatar', [ProfileController::class, 'removeAvatar']);



        // PASSWORD
        Route::put('/password', [ProfileController::class, 'changePassword']);



        // PREFERENCES
        Route::put('/preferences', [ProfileController::class, 'updatePreferences']);



        // ACTIVITY
        Route::get('/activity', [ProfileController::class, 'activity']);

        Route::get('/activity/export', [ProfileController::class, 'exportActivity']);



        // SESSIONS
        Route::get('/sessions', [ProfileController::class, 'sessions']);

        Route::delete('/sessions/{id}', [ProfileController::class, 'revokeSession']);

        Route::delete('/sessions', [ProfileController::class, 'revokeAllSessions']);



        // DOCUMENTS
        Route::get('/documents', [ProfileController::class, 'documents']);

        Route::post('/documents', [ProfileController::class, 'uploadDocument']);

        Route::delete('/documents/{id}', [ProfileController::class, 'deleteDocument']);

        Route::get('/documents/{id}/download', [ProfileController::class, 'downloadDocument']);



        // PERMISSIONS
        Route::get('/permissions', [ProfileController::class, 'permissions']);



        // STATISTICS
        Route::get('/statistics', [ProfileController::class, 'statistics']);



        // TWO FACTOR AUTH
        Route::put('/2fa', [ProfileController::class, 'updateTwoFactor']);



        // NOTIFICATION SETTINGS
        Route::get('/notifications/settings', [ProfileController::class, 'notificationSettings']);

        Route::put('/notifications/settings', [ProfileController::class, 'updateNotificationSettings']);


    });
    // ==========================
// USERS API
// ==========================

Route::prefix('users')->group(function () {

    // Liste utilisateurs + recherche + pagination
    Route::get('/', [UserController::class, 'index']);

    // Statistiques utilisateurs
    Route::get('/statistics', [UserController::class, 'statistics']);

    // Export utilisateurs
    Route::get('/export', [UserController::class, 'export']);

    // Voir utilisateur par ID
    Route::get('/{user}', [UserController::class, 'show']);

    // Ajouter utilisateur
    Route::post('/', [UserController::class, 'store']);

    // Modifier utilisateur
    Route::put('/{user}', [UserController::class, 'update']);

    // Modifier status utilisateur
    Route::put('/{user}/status', [UserController::class, 'updateStatus']);

    // Supprimer utilisateur
    Route::delete('/{user}', [UserController::class, 'destroy']);

});





    // ==================================================
    // DASHBOARD
    // ==================================================

    Route::prefix('dashboard')->group(function () {


        Route::get('/stats', 
            [DashboardController::class, 'stats']
        );


        Route::get('/analytics', 
            [DashboardController::class, 'analytics']
        );


        Route::get('/orders', 
            [DashboardController::class, 'orders']
        );


        Route::get('/notifications', 
            [DashboardController::class, 'notifications']
        );


        Route::get('/production', 
            [DashboardController::class, 'production']
        );


        Route::get('/top-products', 
            [DashboardController::class, 'topProducts']
        );


    });
    // ==========================
// ACTIVITY LOG API
// ==========================

Route::prefix('activity-logs')->group(function () {

    Route::get('/', [ActivityLogController::class, 'index']);

    Route::get('/statistics', [ActivityLogController::class, 'statistics']);

    Route::get('/recent', [ActivityLogController::class, 'recent']);

    Route::get('/errors', [ActivityLogController::class, 'errors']);

    Route::get('/export', [ActivityLogController::class, 'export']);

    Route::get('/{activityLog}', [ActivityLogController::class, 'show']);

    Route::get('/user/{userId}', [ActivityLogController::class, 'userLogs']);

});


// ==========================
// ANALYTICS API
// ==========================

Route::prefix('analytics')->group(function () {

    Route::get('/orders', [AnalyticsController::class, 'orders']);

    Route::get('/revenue', [AnalyticsController::class, 'revenue']);

    Route::get('/products', [AnalyticsController::class, 'products']);

    Route::get('/customers', [AnalyticsController::class, 'customers']);

    Route::get('/expenses', [AnalyticsController::class, 'expenses']);

    Route::get('/summary', [AnalyticsController::class, 'summary']);

    Route::get('/realtime', [AnalyticsController::class, 'realtime']);

});


});