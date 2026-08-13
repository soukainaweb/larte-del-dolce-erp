<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InAppNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $title,
        public string $message,
        public string $type,
        public ?string $actionUrl = null,
        public string $recipientName = '',
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->title,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.notifications.in-app',
            with: [
                'notificationTitle' => $this->title,
                'notificationMessage' => $this->message,
                'notificationType' => $this->type,
                'actionUrl' => $this->actionUrl,
                'recipientName' => $this->recipientName,
                'isRtl' => $this->isRtlContent(),
            ],
        );
    }

    protected function isRtlContent(): bool
    {
        return (bool) preg_match('/[\x{0600}-\x{06FF}]/u', $this->title . $this->message);
    }
}
