<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    /**
     * Mark one notification as read.
     */
    public function markAsRead(
        Request $request,
        DatabaseNotification $notification
    ) {
        abort_unless(
            $notification->notifiable_type === $request->user()::class &&
            (string) $notification->notifiable_id === (string) $request->user()->id,
            403
        );

        if (is_null($notification->read_at)) {
            $notification->markAsRead();
        }

        return back();
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request)
    {
        $request->user()
            ->unreadNotifications
            ->markAsRead();

        return back();
    }

    /**
     * Delete one notification.
     */
    public function destroy(
        Request $request,
        DatabaseNotification $notification
    ) {
        abort_unless(
            $notification->notifiable_type === $request->user()::class &&
            (string) $notification->notifiable_id === (string) $request->user()->id,
            403
        );

        $notification->delete();

        return back();
    }

    /**
     * Delete all notifications.
     */
    public function destroyAll(Request $request)
    {
        $request->user()
            ->notifications()
            ->delete();

        return back();
    }
}