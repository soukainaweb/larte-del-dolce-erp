<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\User;
use App\Models\Permission;

class Role extends Model
{
    use HasFactory, SoftDeletes;


    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'display_name',
        'description',
        'color',
        'icon',
        'status',
        'is_system',
        'guard_name',
    ];


    /**
     * The attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'is_system' => 'boolean',
        ];
    }


    /**
     * Role has many users
     */
    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function permissions()
    {
        return $this->belongsToMany(Permission::class);
    }


    /**
     * Get active users only
     */
    public function activeUsers()
    {
        return $this->hasMany(User::class)
            ->where('status', 'active');
    }


    /**
     * Check if role is system role
     */
    public function isSystemRole(): bool
    {
        return $this->is_system === true;
    }


    /**
     * Scope active roles
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}