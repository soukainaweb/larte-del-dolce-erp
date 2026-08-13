<?php

namespace App\Services;

use App\Mail\InAppNotificationMail;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;

class NotificationDeliveryService
{
    private const EMAIL_DEDUP_SECONDS = 120;

    /**
     * Persist an in-app notification and email the same recipient.
     *
     * @param  array{type: string, title: string, message: string}  $payload
     * @param  array{skip_email?: bool}  $options
     */
    public function deliver(User $user, array $payload, array $options = []): ?Notification
    {
        $notification = $this->createInAppNotification($user, $payload);

        if ($notification !== null && ! ($options['skip_email'] ?? false)) {
            $this->sendEmail($user, $payload);
        }

        return $notification;
    }

    /**
     * @param  array{type: string, title: string, message: string}  $payload
     */
    protected function createInAppNotification(User $user, array $payload): ?Notification
    {
        try {
            return Notification::create([
                'user_id' => $user->id,
                'title' => $payload['title'],
                'message' => $payload['message'],
                'type' => $payload['type'],
            ]);
        } catch (\Throwable $e) {
            report($e);

            return null;
        }
    }

    /**
     * @param  array{type: string, title: string, message: string}  $payload
     */
    protected function sendEmail(User $user, array $payload): void
    {
        $email = trim((string) ($user->email ?? ''));

        if ($email === '' || ! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return;
        }

        if (! $this->shouldSendEmail($user, $payload)) {
            return;
        }

        try {
            Mail::to($email)->send(new InAppNotificationMail(
                title: $payload['title'],
                message: $payload['message'],
                type: $payload['type'],
                actionUrl: $this->extractUrlFromMessage($payload['message'] ?? ''),
                recipientName: $this->displayName($user),
            ));
        } catch (\Throwable $e) {
            report($e);
        }
    }

    /**
     * @param  array{type: string, title: string, message: string}  $payload
     */
    protected function shouldSendEmail(User $user, array $payload): bool
    {
        $fingerprint = hash('sha256', implode('|', [
            (string) $user->id,
            (string) ($payload['type'] ?? ''),
            (string) ($payload['title'] ?? ''),
            (string) ($payload['message'] ?? ''),
        ]));

        return Cache::add('notification_email:' . $fingerprint, true, self::EMAIL_DEDUP_SECONDS);
    }

    protected function extractUrlFromMessage(string $message): ?string
    {
        if (preg_match('#https?://[^\s]+#u', $message, $matches)) {
            return rtrim($matches[0], '.,;');
        }

        return null;
    }

    protected function displayName(User $user): string
    {
        return trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? '')) ?: ($user->email ?? '');
    }
}
