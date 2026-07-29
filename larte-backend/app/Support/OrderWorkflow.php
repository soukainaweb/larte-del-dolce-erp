<?php

namespace App\Support;

use InvalidArgumentException;

/**
 * Canonical order workflow stored in DB.
 *
 * draft → submitted → approved → preparing → ready → assigned → delivered → archived
 * Branches: rejected (from submitted), cancelled (from most active states)
 */
final class OrderWorkflow
{
    public const DRAFT = 'draft';
    public const SUBMITTED = 'submitted';
    public const APPROVED = 'approved';
    public const PREPARING = 'preparing';
    public const READY = 'ready';
    public const ASSIGNED = 'assigned';
    public const DELIVERED = 'delivered';
    public const CANCELLED = 'cancelled';
    public const REJECTED = 'rejected';
    public const ARCHIVED = 'archived';

    /** @var array<string, list<string>> */
    private const TRANSITIONS = [
        self::DRAFT => [self::SUBMITTED, self::CANCELLED],
        self::SUBMITTED => [self::APPROVED, self::REJECTED, self::CANCELLED],
        self::APPROVED => [self::PREPARING, self::CANCELLED],
        self::PREPARING => [self::READY, self::CANCELLED],
        self::READY => [self::ASSIGNED, self::CANCELLED],
        self::ASSIGNED => [self::DELIVERED, self::CANCELLED],
        self::DELIVERED => [self::ARCHIVED],
        self::REJECTED => [self::DRAFT, self::CANCELLED],
        self::CANCELLED => [],
        self::ARCHIVED => [],
    ];

    /** @var array<string, string> */
    private const TRANSITION_PERMISSIONS = [
        self::DRAFT . '>' . self::SUBMITTED => 'orders.create',
        self::SUBMITTED . '>' . self::APPROVED => 'orders.update',
        self::SUBMITTED . '>' . self::REJECTED => 'orders.update',
        self::APPROVED . '>' . self::PREPARING => 'orders.update',
        self::PREPARING . '>' . self::READY => 'orders.update',
        self::READY . '>' . self::ASSIGNED => 'orders.update',
        self::ASSIGNED . '>' . self::DELIVERED => 'orders.update',
        self::DELIVERED . '>' . self::ARCHIVED => 'orders.update',
        self::REJECTED . '>' . self::DRAFT => 'orders.update',
    ];

    /** @var array<string, string> Legacy + frontend aliases → canonical DB slug */
    private const TO_CANONICAL = [
        'draft' => self::DRAFT,
        'submitted' => self::SUBMITTED,
        'pending' => self::SUBMITTED,
        'approved' => self::APPROVED,
        'validated' => self::APPROVED,
        'confirmed' => self::APPROVED,
        'preparing' => self::PREPARING,
        'production' => self::PREPARING,
        'processing' => self::PREPARING,
        'in_production' => self::PREPARING,
        'ready' => self::READY,
        'assigned' => self::ASSIGNED,
        'in_delivery' => self::ASSIGNED,
        'delivered' => self::DELIVERED,
        'completed' => self::DELIVERED,
        'cancelled' => self::CANCELLED,
        'rejected' => self::REJECTED,
        'archived' => self::ARCHIVED,
    ];

    /** @var array<string, string> Canonical DB slug → frontend API status */
    private const TO_FRONTEND = [
        self::DRAFT => 'draft',
        self::SUBMITTED => 'pending',
        self::APPROVED => 'validated',
        self::PREPARING => 'in_production',
        self::READY => 'ready',
        self::ASSIGNED => 'in_delivery',
        self::DELIVERED => 'delivered',
        self::CANCELLED => 'cancelled',
        self::REJECTED => 'rejected',
        self::ARCHIVED => 'archived',
    ];

    public static function canonical(?string $status): ?string
    {
        if ($status === null || $status === '') {
            return null;
        }

        $key = strtolower(trim($status));

        return self::TO_CANONICAL[$key] ?? $key;
    }

    public static function toFrontend(?string $dbStatus): ?string
    {
        $canonical = self::canonical($dbStatus);

        if ($canonical === null) {
            return null;
        }

        return self::TO_FRONTEND[$canonical] ?? $canonical;
    }

    public static function statuses(): array
    {
        return array_keys(self::TO_FRONTEND);
    }

    public static function frontendStatuses(): array
    {
        return array_values(array_unique(self::TO_FRONTEND));
    }

    public static function canTransition(?string $from, ?string $to): bool
    {
        $fromCanonical = self::canonical($from);
        $toCanonical = self::canonical($to);

        if (!$fromCanonical || !$toCanonical || $fromCanonical === $toCanonical) {
            return false;
        }

        return in_array($toCanonical, self::TRANSITIONS[$fromCanonical] ?? [], true);
    }

    public static function permissionForTransition(?string $from, ?string $to): string
    {
        $fromCanonical = self::canonical($from);
        $toCanonical = self::canonical($to);
        $key = $fromCanonical . '>' . $toCanonical;

        if ($toCanonical === self::CANCELLED) {
            return 'orders.update';
        }

        if (!isset(self::TRANSITION_PERMISSIONS[$key])) {
            throw new InvalidArgumentException("No permission mapping for transition {$key}");
        }

        return self::TRANSITION_PERMISSIONS[$key];
    }

    public static function assertTransitionAllowed(?string $from, ?string $to): void
    {
        if (!self::canTransition($from, $to)) {
            $fromLabel = self::toFrontend($from) ?? ($from ?? 'unknown');
            $toLabel = self::toFrontend($to) ?? ($to ?? 'unknown');

            throw new InvalidArgumentException(
                "Transition interdite: {$fromLabel} → {$toLabel}"
            );
        }
    }

    public static function allowedTargets(?string $from): array
    {
        $fromCanonical = self::canonical($from);

        if (!$fromCanonical) {
            return [];
        }

        return array_map(
            fn (string $status) => self::toFrontend($status),
            self::TRANSITIONS[$fromCanonical] ?? []
        );
    }
}
