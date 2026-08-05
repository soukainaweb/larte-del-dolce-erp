<?php

namespace App\Support;

use App\Models\Customer;
use App\Models\Meeting;
use App\Models\Order;
use App\Models\Sample;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class SalesScope
{
    public static function isSalesRep(?User $user = null): bool
    {
        $user = $user ?? auth()->user();

        return strtolower((string) ($user?->role?->name ?? '')) === 'sales';
    }

    public static function userId(?User $user = null): ?int
    {
        $user = $user ?? auth()->user();

        return $user?->id;
    }

    public static function applyOrderScope(Builder $query, ?User $user = null): Builder
    {
        if (! self::isSalesRep($user)) {
            return $query;
        }

        return $query->where('user_id', self::userId($user));
    }

    public static function applyCustomerScope(Builder $query, ?User $user = null): Builder
    {
        if (! self::isSalesRep($user)) {
            return $query;
        }

        $userId = self::userId($user);

        return $query->where(function (Builder $q) use ($userId) {
            $q->where('user_id', $userId)
                ->orWhereHas('orders', fn (Builder $oq) => $oq->where('user_id', $userId));
        });
    }

    public static function applyMeetingScope(Builder $query, ?User $user = null): Builder
    {
        if (! self::isSalesRep($user)) {
            return $query;
        }

        $userId = self::userId($user);

        return $query->where(function (Builder $q) use ($userId) {
            $q->where('created_by', $userId)
                ->orWhereHas('order', fn (Builder $oq) => $oq->where('user_id', $userId));
        });
    }

    public static function applySampleScope(Builder $query, ?User $user = null): Builder
    {
        if (! self::isSalesRep($user)) {
            return $query;
        }

        return $query->where('salesperson_id', self::userId($user));
    }

    public static function ownsOrder(Order $order, ?User $user = null): bool
    {
        if (! self::isSalesRep($user)) {
            return true;
        }

        return (int) $order->user_id === (int) self::userId($user);
    }

    public static function ownsCustomer(Customer $customer, ?User $user = null): bool
    {
        if (! self::isSalesRep($user)) {
            return true;
        }

        $userId = self::userId($user);

        if ((int) $customer->user_id === (int) $userId) {
            return true;
        }

        return $customer->orders()->where('user_id', $userId)->exists();
    }

    public static function ownsMeeting(Meeting $meeting, ?User $user = null): bool
    {
        if (! self::isSalesRep($user)) {
            return true;
        }

        $userId = self::userId($user);

        if ((int) $meeting->created_by === (int) $userId) {
            return true;
        }

        if ($meeting->order_id) {
            if (! $meeting->relationLoaded('order')) {
                $meeting->load('order');
            }

            return $meeting->order && (int) $meeting->order->user_id === (int) $userId;
        }

        return false;
    }

    public static function ownsSample(Sample $sample, ?User $user = null): bool
    {
        if (! self::isSalesRep($user)) {
            return true;
        }

        return (int) $sample->salesperson_id === (int) self::userId($user);
    }
}
