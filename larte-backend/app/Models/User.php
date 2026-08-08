<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Support\UserStatus;

class User extends Authenticatable implements CanResetPasswordContract
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes, CanResetPassword;

    protected $fillable = [
        'role_id',
        'first_name',
        'last_name',
        'email',
        'password',
        'must_change_password',
        'phone',
        'avatar',
        'birth_date',
        'gender',
        'nationality',
        'address',
        'city',
        'postal_code',
        'country',
        'timezone',
        'date_format',
        'currency',
        'employee_id',
        'department',
        'position',
        'hiring_date',
        'company',
        'office',
        'manager_id',
        'status',
        'two_factor_enabled',
        'two_factor_method',
        'last_device',
        'last_login_ip',
        'last_login_at',
        'created_by',
        'updated_by',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = [
        'name',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'birth_date' => 'date',
            'hiring_date' => 'date',
            'last_login_at' => 'datetime',
            'two_factor_enabled' => 'boolean',
            'must_change_password' => 'boolean',
            'password' => 'hashed',
        ];
    }

    protected function name(): Attribute
    {
        return Attribute::get(function () {
            return trim(($this->first_name ?? '') . ' ' . ($this->last_name ?? ''));
        });
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function expenses()
    {
        return $this->hasMany(Expense::class);
    }

    public function warehouses()
    {
        return $this->hasMany(Warehouse::class, 'manager_id');
    }

    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function deliveries()
    {
        return $this->hasMany(Delivery::class, 'driver_id');
    }

    public function sessions()
    {
        return $this->hasMany(UserSession::class);
    }

    public function manager()
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    public function hasPermission(string $permission): bool
    {
        if (!$this->relationLoaded('role')) {
            $this->load('role.permissions');
        } elseif ($this->role && !$this->role->relationLoaded('permissions')) {
            $this->role->load('permissions');
        }

        if (strtolower((string) ($this->role?->name ?? '')) === 'admin') {
            return true;
        }

        if (!$this->role) {
            return false;
        }

        return $this->role->permissions->contains('name', $permission);
    }

    public function hasAnyPermission(array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if ($this->hasPermission($permission)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Mark the user as online after a successful login.
     */
    public function markOnline(?string $ip = null): void
    {
        $this->forceFill([
            'status' => UserStatus::ONLINE,
            'last_login_at' => now(),
            'last_login_ip' => $ip,
        ])->save();
    }

    /**
     * Mark presence offline without touching account-level statuses.
     */
    public function markOffline(): void
    {
        if (! UserStatus::isPresence($this->status)) {
            return;
        }

        $this->forceFill(['status' => UserStatus::OFFLINE])->save();
    }

    public function isOnline(): bool
    {
        return $this->status === UserStatus::ONLINE;
    }
}
