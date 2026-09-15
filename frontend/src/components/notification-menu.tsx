import { Bell } from 'lucide-react';

export function NotificationMenu() {
    return (
        <button
            type="button"
            aria-label="Notifications"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted"
        >
            <Bell className="h-5 w-5" />
        </button>
    );
}