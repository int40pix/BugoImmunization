import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type AppNotification, type SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import {
    Bell,
    CalendarClock,
    CheckCheck,
    CircleAlert,
    Clock3,
    PackageX,
    Syringe,
    Trash2,
    UserPlus,
} from 'lucide-react';
import React from 'react';

function NotificationIcon({ type = 'default' }: { type?: string }) {
    switch (type) {
        case 'inventory':
            return <PackageX className="h-4 w-4" />;
        case 'schedule':
            return <Clock3 className="h-4 w-4" />;
        case 'patient':
            return <UserPlus className="h-4 w-4" />;
        case 'vaccination':
            return <Syringe className="h-4 w-4" />;
        case 'overdue':
            return <CircleAlert className="h-4 w-4" />;
        default:
            return <Bell className="h-4 w-4" />;
    }
}

function getPriorityClass(priority: string = 'normal') {
    switch (priority) {
        case 'critical':
            return 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300';
        case 'warning':
            return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300';
        case 'success':
            return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300';
        default:
            return 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300';
    }
}

function formatNotificationTime(date?: string | null) {
    if (!date) return '';
    const createdAt = new Date(date);
    if (isNaN(createdAt.getTime())) return '';
    const now = new Date();
    const difference = now.getTime() - createdAt.getTime();
    const minutes = Math.floor(difference / 1000 / 60);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return createdAt.toLocaleDateString();
}

interface NotificationsDropdownProps {
    className?: string;
    align?: 'start' | 'center' | 'end';
}

export function NotificationsDropdown({
    className = '',
    align = 'end',
}: NotificationsDropdownProps) {
    const { auth } = usePage<SharedData>().props;
    const notifications: AppNotification[] = auth?.notifications ?? [];
    const unreadCount = auth?.unread_notifications_count ?? 0;

    function markAsRead(notification: AppNotification) {
        const isAlreadyRead = notification.read || notification.is_read;

        if (isAlreadyRead) {
            if (notification.url) {
                router.visit(notification.url);
            }
            return;
        }

        router.patch(
            `/notifications/${notification.id}/read`,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    if (notification.url) {
                        router.visit(notification.url);
                    }
                },
            },
        );
    }

    function markAllAsRead() {
        router.patch(
            '/notifications/read-all',
            {},
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    }

    function removeNotification(notificationId: number | string) {
        router.delete(`/notifications/${notificationId}`, {
            preserveScroll: true,
            preserveState: true,
        });
    }

    function clearAllNotifications() {
        router.delete('/notifications', {
            preserveScroll: true,
            preserveState: true,
        });
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    aria-label="Notifications"
                    className={`relative flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-muted/40 text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
                >
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-background shadow-xs">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                className="w-[360px] sm:w-[380px] max-w-[calc(100vw-1.5rem)] overflow-hidden p-0 shadow-lg"
                align={align}
                sideOffset={8}
            >
                {/* Header */}
                <div className="flex items-center justify-between gap-3 border-b px-4 py-3 bg-muted/40">
                    <div>
                        <p className="text-sm font-semibold tracking-tight">Notifications</p>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                            {unreadCount > 0
                                ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                                : 'You are all caught up'}
                        </p>
                    </div>

                    {unreadCount > 0 && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                markAllAsRead();
                            }}
                            className="text-muted-foreground hover:text-foreground inline-flex shrink-0 items-center gap-1 text-xs font-medium transition-colors"
                        >
                            <CheckCheck className="h-3.5 w-3.5" />
                            Mark all read
                        </button>
                    )}
                </div>

                {/* Notifications List */}
                <div className="max-h-[350px] overflow-y-auto divide-y divide-border/40">
                    {notifications.length > 0 ? (
                        notifications.map((notification) => {
                            const isRead = notification.read || notification.is_read;
                            const createdTime = formatNotificationTime(
                                notification.created_at,
                            );

                            return (
                                <DropdownMenuItem
                                    key={notification.id}
                                    onSelect={(e) => {
                                        e.preventDefault();
                                        markAsRead(notification);
                                    }}
                                    className={`group relative flex cursor-pointer items-start gap-3 rounded-none px-4 py-3 focus:bg-accent/60 transition-colors ${
                                        !isRead ? 'bg-primary/5' : ''
                                    }`}
                                >
                                    <div
                                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full mt-0.5 ${getPriorityClass(
                                            notification.priority,
                                        )}`}
                                    >
                                        <NotificationIcon type={notification.type} />
                                    </div>

                                    <div className="min-w-0 flex-1 pr-6">
                                        <div className="flex items-start gap-1.5">
                                            <p
                                                className={`min-w-0 flex-1 text-xs leading-snug line-clamp-1 ${
                                                    !isRead
                                                        ? 'font-semibold text-foreground'
                                                        : 'font-medium text-foreground/85'
                                                }`}
                                            >
                                                {notification.title}
                                            </p>

                                            {!isRead && (
                                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary mt-1" />
                                            )}
                                        </div>

                                        {notification.description && (
                                            <p className="text-muted-foreground mt-1 text-xs leading-relaxed line-clamp-2">
                                                {notification.description}
                                            </p>
                                        )}

                                        {createdTime && (
                                            <p className="text-muted-foreground/80 mt-1.5 text-[11px] font-medium">
                                                {createdTime}
                                            </p>
                                        )}
                                    </div>

                                    {/* Delete Button */}
                                    <button
                                        type="button"
                                        aria-label="Remove notification"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            removeNotification(notification.id);
                                        }}
                                        className="text-muted-foreground/60 hover:text-destructive absolute top-3 right-3 p-1 transition-colors opacity-80 sm:opacity-0 sm:group-hover:opacity-100"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </DropdownMenuItem>
                            );
                        })
                    ) : (
                        <div className="p-8 text-center">
                            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground mb-2.5">
                                <Bell className="h-5 w-5" />
                            </div>
                            <p className="text-xs font-semibold text-foreground">No notifications</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                We'll let you know when new updates or reminders arrive.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                    <div className="border-t bg-muted/20 p-2 text-center">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                clearAllNotifications();
                            }}
                            className="text-muted-foreground hover:text-destructive text-xs font-medium transition-colors"
                        >
                            Clear all notifications
                        </button>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default NotificationsDropdown;

