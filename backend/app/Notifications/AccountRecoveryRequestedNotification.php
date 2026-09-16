<?php

namespace App\Notifications;

use App\Models\PasswordResetRequest;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class AccountRecoveryRequestedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public User $requester,
        public PasswordResetRequest $resetRequest
    ) {}

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        $roleName = $this->requester->accountRole?->display_name
            ?? ucfirst($this->requester->role ?? 'User');

        $title = 'Account Recovery Requested';
        $description = "{$this->requester->name} ({$roleName}) requested password recovery.";

        $url = app()->bound('url')
            ? route('admin.password-reset-requests.index')
            : '/admin/password-reset-requests';

        return [
            'type' => 'account_recovery',
            'title' => $title,
            'description' => $description,
            'url' => $url,
            'priority' => 'warning',
            'user_id' => $this->requester->id,
            'user_name' => $this->requester->name,
            'user_email' => $this->requester->email,
            'user_role' => $this->requester->role,
            'request_id' => $this->resetRequest->id,
            'created_at' => now()->toIso8601String(),
        ];
    }

    /**
     * Database representation of notification.
     */
    public function toDatabase(object $notifiable): array
    {
        return $this->toArray($notifiable);
    }
}

