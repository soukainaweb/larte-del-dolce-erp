<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class ActivityLog extends Model
{
    use HasFactory;

    /**
     * Mass assignable attributes
     */
   protected $fillable = [
    'user_id',
    'module',
    'action',
    'description',
    'level',
    'status',
    'ip_address',
];

    /**
     * Cast attributes
     */
    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Activity log belongs to User
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Filter by action
     */
    public function scopeAction($query, $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Filter latest activities
     */
    public function scopeLatestActivity($query)
    {
        return $query->latest();
    }
}