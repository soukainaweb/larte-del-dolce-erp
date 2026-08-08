<?php

namespace App\Mail;

use App\Models\Meeting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class MeetingInvitationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Meeting $meeting,
        public string $joinUrl,
        public string $detailsUrl,
        public string $recipientName = '',
        public string $organizerName = '',
        public string $googleCalendarUrl = '',
        public string $icsContent = '',
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
                'detailsUrl' => $this->detailsUrl,
                'recipientName' => $this->recipientName,
                'organizerName' => $this->organizerName,
                'googleCalendarUrl' => $this->googleCalendarUrl,
            ],
        );
    }

    public function attachments(): array
    {
        if ($this->icsContent === '') {
            return [];
        }

        $filename = 'meeting-' . $this->meeting->id . '.ics';

        return [
            Attachment::fromData(fn () => $this->icsContent, $filename)
                ->withMime('text/calendar; charset=UTF-8; method=REQUEST'),
        ];
    }
}
