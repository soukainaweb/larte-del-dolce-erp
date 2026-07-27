<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class UserSession extends Model
{
    use HasFactory;


    /**
     * Table name
     */
    protected $table = 'user_sessions';


    /**
     * Mass assignable fields
     */
    protected $fillable = [

        'user_id',

        'device',

        'browser',

        'ip_address',

        'last_active_at',

        'is_current',

        'session_token',

        'expires_at',

    ];


    /**
     * Casts
     */
    protected $casts = [

        'last_active_at' => 'datetime',

        'expires_at' => 'datetime',

        'is_current' => 'boolean',

    ];


    /**
     * Relation with User
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}