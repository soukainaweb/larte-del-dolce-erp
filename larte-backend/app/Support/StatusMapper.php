<?php

namespace App\Support;

class StatusMapper
{
    private const ORDER_TO_DB = [
        'pending' => 'pending',
        'approved' => 'confirmed',
        'confirmed' => 'confirmed',
        'production' => 'processing',
        'processing' => 'processing',
        'ready' => 'processing',
        'delivered' => 'completed',
        'completed' => 'completed',
        'cancelled' => 'cancelled',
    ];

    private const ORDER_FROM_DB = [
        'pending' => 'pending',
        'confirmed' => 'approved',
        'processing' => 'production',
        'completed' => 'delivered',
        'cancelled' => 'cancelled',
    ];

    private const PAYMENT_TO_DB = [
        'pending' => 'unpaid',
        'unpaid' => 'unpaid',
        'partial' => 'partial',
        'paid' => 'paid',
        'refunded' => 'refunded',
    ];

    private const PAYMENT_FROM_DB = [
        'unpaid' => 'pending',
        'partial' => 'partial',
        'paid' => 'paid',
        'refunded' => 'refunded',
    ];

    private const PAYMENT_RECORD_TO_DB = [
        'pending' => 'pending',
        'partial' => 'partial',
        'paid' => 'completed',
        'completed' => 'completed',
        'failed' => 'failed',
        'overdue' => 'failed',
        'refunded' => 'refunded',
    ];

    private const PAYMENT_RECORD_FROM_DB = [
        'pending' => 'pending',
        'partial' => 'partial',
        'completed' => 'paid',
        'failed' => 'pending',
        'refunded' => 'refunded',
    ];

    public static function orderToDb(?string $status): ?string
    {
        if ($status === null) {
            return null;
        }

        return self::ORDER_TO_DB[$status] ?? $status;
    }

    public static function orderFromDb(?string $status): ?string
    {
        if ($status === null) {
            return null;
        }

        return self::ORDER_FROM_DB[$status] ?? $status;
    }

    public static function paymentToDb(?string $status): ?string
    {
        if ($status === null) {
            return null;
        }

        return self::PAYMENT_TO_DB[$status] ?? $status;
    }

    public static function paymentFromDb(?string $status): ?string
    {
        if ($status === null) {
            return null;
        }

        return self::PAYMENT_FROM_DB[$status] ?? $status;
    }

    public static function paymentRecordToDb(?string $status): ?string
    {
        if ($status === null) {
            return null;
        }

        return self::PAYMENT_RECORD_TO_DB[$status] ?? $status;
    }

    public static function paymentRecordFromDb(?string $status): ?string
    {
        if ($status === null) {
            return null;
        }

        return self::PAYMENT_RECORD_FROM_DB[$status] ?? $status;
    }

    public static function transformOrder($order)
    {
        if ($order === null) {
            return null;
        }

        $data = is_array($order) ? $order : $order->toArray();

        if (isset($data['status'])) {
            $data['status'] = self::orderFromDb($data['status']);
        }

        if (isset($data['payment_status'])) {
            $data['payment_status'] = self::paymentFromDb($data['payment_status']);
        }

        return $data;
    }

    public static function transformOrderCollection($orders)
    {
        if ($orders instanceof \Illuminate\Pagination\AbstractPaginator) {
            $orders->getCollection()->transform(function ($order) {
                if (isset($order->status)) {
                    $order->status = self::orderFromDb($order->status);
                }
                if (isset($order->payment_status)) {
                    $order->payment_status = self::paymentFromDb($order->payment_status);
                }

                return $order;
            });

            return $orders;
        }

        return collect($orders)->map(function ($order) {
            if (is_object($order) && method_exists($order, 'toArray')) {
                if (isset($order->status)) {
                    $order->status = self::orderFromDb($order->status);
                }
                if (isset($order->payment_status)) {
                    $order->payment_status = self::paymentFromDb($order->payment_status);
                }
            }

            return $order;
        });
    }

    public static function orderStatuses(): array
    {
        return ['pending', 'approved', 'production', 'ready', 'delivered', 'cancelled'];
    }

    public static function paymentStatuses(): array
    {
        return ['pending', 'partial', 'paid', 'refunded'];
    }
}
