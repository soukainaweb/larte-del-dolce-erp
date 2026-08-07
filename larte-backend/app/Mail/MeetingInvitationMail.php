<?php

namespace App\Mail;

use App\Models\Meeting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class MeetingInvitationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Meeting $meeting,
        public string $joinUrl,
        public string $recipientName = '',
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Meeting invitation: ' . $this->meeting->title,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.meetings.invitation',
            with: [
                'meeting' => $this->meeting,
                'joinUrl' => $this->joinUrl,
                'recipientName' => $this->recipientName,
            ],
        );
    }
}
