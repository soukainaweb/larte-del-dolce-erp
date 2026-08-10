<?php

namespace App\Support;

use InvalidArgumentException;

/**
 * Canonical order workflow stored in DB.
 *
 * draft → pending_manager → pending_accountant → pending_responsible → pending_factory
 *   → preparing → ready → assigned → delivered → archived
 * Branches: postponed (factory), rejected (from any approval stage), cancelled
 */
final class OrderWorkflow
{
    public const DRAFT = 'draft';
    public const PENDING_MANAGER = 'pending_manager';
    public const PENDING_ACCOUNTANT = 'pending_accountant';
    public const PENDING_RESPONSIBLE = 'pending_responsible';
    public const PENDING_FACTORY = 'pending_factory';
    /** @deprecated Use PENDING_MANAGER — legacy alias */
    public const SUBMITTED = 'pending_manager';
    /** @deprecated Replaced by pending_factory in the final workflow */
    public const APPROVED = 'approved';
    public const PREPARING = 'preparing';
    public const POSTPONED = 'postponed';
    public const READY = 'ready';
    public const ASSIGNED = 'assigned';
    public const DELIVERED = 'delivered';
    public const CANCELLED = 'cancelled';
    public const REJECTED = 'rejected';
    public const ARCHIVED = 'archived';

    /** Approval stages that cannot be bypassed via generic status PATCH. */
    public const APPROVAL_STATUSES = [
        self::PENDING_MANAGER,
        self::PENDING_ACCOUNTANT,
        self::PENDING_RESPONSIBLE,
    ];

    /** Statuses visible to factory users once administration approval is complete. */
    public const FACTORY_STATUSES = [
        self::PENDING_FACTORY,
        self::PREPARING,
        self::POSTPONED,
        self::READY,
        self::ASSIGNED,
    ];

    /** @var array<string, list<string>> */
    private const TRANSITIONS = [
        self::DRAFT => [self::PENDING_MANAGER, self::CANCELLED],
        self::PENDING_MANAGER => [self::PENDING_ACCOUNTANT, self::REJECTED, self::CANCELLED],
        self::PENDING_ACCOUNTANT => [self::PENDING_RESPONSIBLE, self::REJECTED, self::CANCELLED],
        self::PENDING_RESPONSIBLE => [self::PENDING_FACTORY, self::REJECTED, self::CANCELLED],
        self::PENDING_FACTORY => [self::PREPARING, self::POSTPONED, self::CANCELLED],
        self::PREPARING => [self::READY, self::POSTPONED, self::CANCELLED],
        self::POSTPONED => [self::PREPARING, self::CANCELLED],
        self::READY => [self::ASSIGNED, self::CANCELLED],
        self::ASSIGNED => [self::DELIVERED, self::CANCELLED],
        self::DELIVERED => [self::ARCHIVED],
        self::REJECTED => [self::DRAFT, self::CANCELLED],
        self::CANCELLED => [],
        self::ARCHIVED => [],
        // Legacy alias kept for in-flight production orders
        self::APPROVED => [self::PREPARING, self::PENDING_FACTORY, self::CANCELLED],
    ];

    /** @var array<string, string> */
    private const TRANSITION_PERMISSIONS = [
        self::DRAFT . '>' . self::PENDING_MANAGER => 'orders.create',
        self::PENDING_MANAGER . '>' . self::PENDING_ACCOUNTANT => 'orders.approve.manager',
        self::PENDING_MANAGER . '>' . self::REJECTED => 'orders.approve.manager',
        self::PENDING_ACCOUNTANT . '>' . self::PENDING_RESPONSIBLE => 'orders.approve.accountant',
        self::PENDING_ACCOUNTANT . '>' . self::REJECTED => 'orders.approve.accountant',
        self::PENDING_RESPONSIBLE . '>' . self::PENDING_FACTORY => 'orders.approve.responsible',
        self::PENDING_RESPONSIBLE . '>' . self::REJECTED => 'orders.approve.responsible',
        self::PENDING_FACTORY . '>' . self::PREPARING => 'orders.factory.accept',
        self::PENDING_FACTORY . '>' . self::POSTPONED => 'orders.factory.postpone',
        self::PREPARING . '>' . self::READY => 'orders.factory.ready',
        self::PREPARING . '>' . self::POSTPONED => 'orders.factory.postpone',
        self::POSTPONED . '>' . self::PREPARING => 'orders.factory.accept',
        self::READY . '>' . self::ASSIGNED => 'orders.factory.assign_rep',
        self::ASSIGNED . '>' . self::DELIVERED => 'orders.deliver',
        self::DELIVERED . '>' . self::ARCHIVED => 'orders.update',
        self::REJECTED . '>' . self::DRAFT => 'orders.update',
        self::APPROVED . '>' . self::PREPARING => 'orders.factory.accept',
    ];

    /** @var array<string, string> Legacy + frontend aliases → canonical DB slug */
    private const TO_CANONICAL = [
        'draft' => self::DRAFT,
        'submitted' => self::PENDING_MANAGER,
        'pending' => self::PENDING_MANAGER,
        'pending_manager' => self::PENDING_MANAGER,
        'pending_accountant' => self::PENDING_ACCOUNTANT,
        'pending_responsible' => self::PENDING_RESPONSIBLE,
        'pending_factory' => self::PENDING_FACTORY,
        'approved' => self::APPROVED,
        'validated' => self::APPROVED,
        'confirmed' => self::APPROVED,
        'preparing' => self::PREPARING,
        'production' => self::PREPARING,
        'processing' => self::PREPARING,
        'in_production' => self::PREPARING,
        'postponed' => self::POSTPONED,
        'ready' => self::READY,
        'ready_for_pickup' => self::READY,
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
        self::PENDING_MANAGER => 'pending_manager',
        self::PENDING_ACCOUNTANT => 'pending_accountant',
        self::PENDING_RESPONSIBLE => 'pending_responsible',
        self::PENDING_FACTORY => 'pending_factory',
        self::APPROVED => 'validated',
        self::PREPARING => 'in_production',
        self::POSTPONED => 'postponed',
        self::READY => 'ready_for_pickup',
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

    public static function isApprovalStatus(?string $status): bool
    {
        $canonical = self::canonical($status);

        return $canonical !== null && in_array($canonical, self::APPROVAL_STATUSES, true);
    }

    public static function isFactoryStatus(?string $status): bool
    {
        $canonical = self::canonical($status);

        return $canonical !== null && in_array($canonical, self::FACTORY_STATUSES, true);
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
