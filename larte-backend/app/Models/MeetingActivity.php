<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MeetingActivity extends Model
{
    public const ACTION_CREATED = 'created';
    public const ACTION_UPDATED = 'updated';
    public const ACTION_SCHEDULED = 'scheduled';
    public const ACTION_INVITATION_SENT = 'invitation_sent';
    public const ACTION_STARTED = 'started';
    public const ACTION_ENDED = 'ended';
    public const ACTION_CANCELLED = 'cancelled';
    public const ACTION_JOINED = 'joined';

    protected $fillable = [
        'meeting_id',
        'user_id',
        'action',
        'description',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }

    public function meeting(): BelongsTo
    {
        return $this->belongsTo(Meeting::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
