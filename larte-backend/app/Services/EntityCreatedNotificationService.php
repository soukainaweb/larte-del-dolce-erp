<?php

namespace App\Services;

use App\Models\Inventory;
use App\Models\Meeting;
use App\Models\Notification;
use App\Models\Order;
use App\Models\Sample;
use App\Models\User;
use App\Support\UserStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

class EntityCreatedNotificationService
{
    public function __construct(
        private OrderWorkflowNotificationService $orderWorkflowNotifications,
    ) {
    }

    /**
     * Dispatch in-app notifications after a business entity is persisted.
     *
     * @param  array{extra_user_ids?: list<int>, skip?: bool}  $options
     */
    public function notify(string $entityKey, Model $entity, ?User $creator = null, array $options = []): void
    {
        if ($options['skip'] ?? false) {
            return;
        }

        $creator = $creator ?? auth()->user();

        if ($entityKey === 'order' && $entity instanceof Order && $creator) {
            $this->orderWorkflowNotifications->notifyOrderCreated($entity, $creator);

            return;
        }

        if ($entityKey === 'sample' && $entity instanceof Sample && $creator) {
            $this->orderWorkflowNotifications->notifySampleCreated($entity, $creator);

            return;
        }

        $config = config("entity_notifications.{$entityKey}");
        if (! is_array($config)) {
            return;
        }

        $recipients = $this->resolveRecipients($config, $creator, $entity, $options);
        if ($recipients->isEmpty()) {
            return;
        }

        $payload = $this->buildPayload($config, $entity, $creator);

        foreach ($recipients as $user) {
            $this->createNotification($user, $payload);
        }
    }

    /**
     * @param  array{extra_user_ids?: list<int>}  $options
     * @return Collection<int, User>
     */
    protected function resolveRecipients(array $config, ?User $creator, Model $entity, array $options = []): Collection
    {
        $userIds = collect();

        foreach ($config['recipients']['roles'] ?? [] as $roleSlug) {
            $userIds = $userIds->merge(
                $this->activeUsersByRole($roleSlug)->pluck('id')
            );
        }

        foreach ($config['recipients']['permissions'] ?? [] as $permission) {
            $userIds = $userIds->merge(
                $this->activeUsersWithPermission($permission)->pluck('id')
            );
        }

        if (! empty($config['recipients']['assignee_field'])) {
            $field = $config['recipients']['assignee_field'];
            $assigneeId = $entity->{$field} ?? null;
            if ($assigneeId) {
                $userIds->push((int) $assigneeId);
            }
        }

        if (($config['include_invitees'] ?? false) && $entity instanceof Meeting) {
            $entity->loadMissing('invitees');
            foreach ($entity->invitees as $invitee) {
                if ($invitee->user_id) {
                    $userIds->push((int) $invitee->user_id);
                }
            }
        }

        foreach ($options['extra_user_ids'] ?? [] as $userId) {
            if ($userId) {
                $userIds->push((int) $userId);
            }
        }

        $excludeCreator = $config['exclude_creator'] ?? true;
        if ($excludeCreator && $creator) {
            $userIds = $userIds->reject(fn ($id) => (int) $id === (int) $creator->id);
        }

        $uniqueIds = $userIds->unique()->filter()->values();

        if ($uniqueIds->isEmpty()) {
            return collect();
        }

        return User::query()
            ->whereIn('id', $uniqueIds)
            ->whereNotIn('status', UserStatus::blockedForLogin())
            ->get();
    }

    /**
     * @return array{type: string, title: string, message: string}
     */
    protected function buildPayload(array $config, Model $entity, ?User $creator): array
    {
        $creatorName = $creator ? $this->displayName($creator) : 'مستخدم';
        $url = $this->entityUrl($config, $entity);
        $name = $this->entityDisplayName($config, $entity);
        $number = $this->entityNumber($config, $entity);
        $timestamp = optional($entity->created_at)->format('Y-m-d H:i') ?? now()->format('Y-m-d H:i');

        $lines = [
            sprintf('%s بواسطة %s.', $config['intro'] ?? 'تم إنشاء سجل جديد', $creatorName),
        ];

        if ($name !== null) {
            $lines[] = 'الاسم: ' . $name;
        }

        if ($number !== null) {
            $lines[] = 'الرقم: ' . $number;
        }

        $lines[] = 'التاريخ: ' . $timestamp;
        $lines[] = 'المعرف: ' . $entity->getKey();
        $lines[] = $url;

        return [
            'type' => $config['type'],
            'title' => $config['title'],
            'message' => implode("\n", $lines),
        ];
    }

    protected function entityDisplayName(array $config, Model $entity): ?string
    {
        if ($entity instanceof Inventory) {
            $entity->loadMissing(['product', 'warehouse']);
            $product = $entity->product->name ?? '—';
            $warehouse = $entity->warehouse->name ?? '—';

            return "{$product} / {$warehouse}";
        }

        $field = $config['name_field'] ?? 'name';
        if (! isset($entity->{$field})) {
            return null;
        }

        $value = $entity->{$field};

        if ($entity instanceof User && $field === 'email') {
            $fullName = trim(($entity->first_name ?? '') . ' ' . ($entity->last_name ?? ''));

            return $fullName !== '' ? $fullName : (string) $value;
        }

        return (string) $value;
    }

    protected function entityNumber(array $config, Model $entity): ?string
    {
        $field = $config['number_field'] ?? null;
        if (! $field || ! isset($entity->{$field})) {
            return null;
        }

        $value = $entity->{$field};

        return $value !== null && $value !== '' ? (string) $value : null;
    }

    protected function entityUrl(array $config, Model $entity): string
    {
        $route = $config['route'] ?? '/dashboard';
        $path = str_replace('{id}', (string) $entity->getKey(), $route);

        return $this->frontendBaseUrl() . $path;
    }

    /**
     * @return Collection<int, User>
     */
    protected function activeUsersByRole(string $roleSlug): Collection
    {
        return User::query()
            ->whereHas('role', fn ($q) => $q->where('name', $roleSlug))
            ->whereNotIn('status', UserStatus::blockedForLogin())
            ->get();
    }

    /**
     * @return Collection<int, User>
     */
    protected function activeUsersWithPermission(string $permission): Collection
    {
        return User::query()
            ->whereNotIn('status', UserStatus::blockedForLogin())
            ->whereHas('role.permissions', fn ($q) => $q->where('name', $permission))
            ->get();
    }

    protected function createNotification(User $user, array $payload): void
    {
        try {
            Notification::create([
                'user_id' => $user->id,
                'title' => $payload['title'],
                'message' => $payload['message'],
                'type' => $payload['type'],
            ]);
        } catch (\Throwable $e) {
            report($e);
        }
    }

    protected function displayName(User $user): string
    {
        return trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? '')) ?: ($user->email ?? 'مستخدم');
    }

    protected function frontendBaseUrl(): string
    {
        return rtrim((string) config('app.frontend_url', ''), '/');
    }
}
