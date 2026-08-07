<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Meeting extends Model
{
    use HasFactory, SoftDeletes;

    public const STATUS_DRAFT = 'draft';
    public const STATUS_SCHEDULED = 'scheduled';
    public const STATUS_LIVE = 'live';
    public const STATUS_FINISHED = 'finished';
    public const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'title',
        'room_name',
        'meeting_date',
        'meeting_time',
        'customer_id',
        'order_id',
        'notes',
        'status',
        'started_at',
        'ended_at',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'meeting_date' => 'date',
            'started_at' => 'datetime',
            'ended_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Meeting $meeting) {
            if (empty($meeting->room_name)) {
                $meeting->room_name = self::generateRoomName();
            }
            if (empty($meeting->status)) {
                $meeting->status = self::STATUS_DRAFT;
            }
        });
    }

    public static function generateRoomName(): string
    {
        return 'larte-' . Str::lower(Str::random(16));
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function invitees(): HasMany
    {
        return $this->hasMany(MeetingInvitee::class);
    }

    public function activities(): HasMany
    {
        return $this->hasMany(MeetingActivity::class)->orderByDesc('created_at');
    }

    public function isAdminUser(?User $user): bool
    {
        return $user && strtolower((string) ($user->role?->name ?? '')) === 'admin';
    }

    public function isHost(?User $user): bool
    {
        if (! $user) {
            return false;
        }

        if ((int) $this->created_by === (int) $user->id) {
            return true;
        }

        return $this->invitees()
            ->where('user_id', $user->id)
            ->where('role', 'host')
            ->exists();
    }

    public function isInvited(?User $user): bool
    {
        if (! $user) {
            return false;
        }

        if ($this->isHost($user)) {
            return true;
        }

        $email = mb_strtolower(trim((string) $user->email));

        return $this->invitees()
            ->where(function ($query) use ($user, $email) {
                $query->where('user_id', $user->id)
                    ->orWhereRaw('LOWER(email) = ?', [$email]);
            })
            ->exists();
    }

    public function canJoin(?User $user): bool
    {
        if (! $user || ! $this->isInvited($user)) {
            return false;
        }

        if (in_array($this->status, [self::STATUS_CANCELLED, self::STATUS_FINISHED, self::STATUS_DRAFT], true)) {
            return false;
        }

        if ($this->status === self::STATUS_LIVE) {
            return true;
        }

        return $this->status === self::STATUS_SCHEDULED && $this->isHost($user);
    }

    public function canManage(?User $user): bool
    {
        if (! $user) {
            return false;
        }

        if ($this->isAdminUser($user)) {
            return true;
        }

        return $this->isHost($user);
    }
}
