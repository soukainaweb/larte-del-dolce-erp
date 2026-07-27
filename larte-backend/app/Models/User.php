<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Role;
use App\Models\ActivityLog;
use App\Models\UserSession;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;


    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
    'role_id',
    'name',
    'email',
    'password',
    'phone',
    'avatar',
    'address',
    'city',
    'country',
    'timezone',
    'date_format',
    'currency',
    'last_device',
    'last_login_ip',
    'last_login_at',
];


    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];


    /**
     * The attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
        ];
    }


    /**
     * User belongs to one Role
     */
    public function role()
    {
        return $this->belongsTo(Role::class);
    }


    /**
     * User activity logs
     */
    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class);
    }


    /**
     * User notifications
     */
    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }


    /**
     * User expenses
     */
    public function expenses()
    {
        return $this->hasMany(Expense::class);
    }


    /**
     * User managed warehouses
     */
    public function warehouses()
    {
        return $this->hasMany(Warehouse::class, 'manager_id');
    }


    /**
     * User stock movements
     */
    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }


    /**
     * User orders
     */
    public function orders()
    {
        return $this->hasMany(Order::class);
    }


    /**
     * User deliveries (as driver)
     */
    public function deliveries()
    {
        return $this->hasMany(Delivery::class, 'driver_id');
    }
    /**
 * User sessions
 */
public function sessions()
{
    return $this->hasMany(UserSession::class);
}
}