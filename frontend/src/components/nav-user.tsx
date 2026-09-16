import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';
import { useIsMobile } from '@/hooks/use-mobile';
import { type AppNotification, type SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import {
    Bell,
    CheckCheck,
    ChevronsUpDown,
    CircleAlert,
    Clock3,
    PackageX,
    Syringe,
    Trash2,
    UserPlus,
} from 'lucide-react';

function NotificationIcon({
    type = 'default',
}: {
    type?: string;
}) {
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
            return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300';

        case 'warning':
            return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300';

        case 'success':
            return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300';

        default:
            return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
    }
}

function formatNotificationTime(date: string) {
    const createdAt = new Date(date);
    const now = new Date();

    const difference =
        now.getTime() - createdAt.getTime();

    const minutes = Math.floor(
        difference / 1000 / 60,
    );

    if (minutes < 1) {
        return 'Just now';
    }

    if (minutes < 60) {
        return `${minutes} min ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }

    const days = Math.floor(hours / 24);

    if (days === 1) {
        return 'Yesterday';
    }

    if (days < 7) {
        return `${days} days ago`;
    }

    return createdAt.toLocaleDateString();
}

export function NavUser() {
    const { auth } = usePage<SharedData>().props;

    const { state } = useSidebar();
    const isMobile = useIsMobile();

    const notifications: AppNotification[] =
        auth.notifications ?? [];

    const unreadCount =
        auth.unread_notifications_count ?? 0;

    function markAsRead(notification: AppNotification) {
        if (notification.read) {
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

    function removeNotification(
        notificationId: number,
    ) {
        router.delete(
            `/notifications/${notificationId}`,
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    }

    function clearAllNotifications() {
        router.delete('/notifications', {
            preserveScroll: true,
            preserveState: true,
        });
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <div className="flex items-center gap-1">
                    {/* Notification Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                aria-label="Notifications"
                                className="hover:bg-sidebar-accent relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors"
                            >
                                <Bell className="h-5 w-5" />

                                {unreadCount > 0 && (
                                    <span className="absolute right-0 top-0 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                                        {unreadCount > 9
                                            ? '9+'
                                            : unreadCount}
                                    </span>
                                )}
                            </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            className="w-[360px] overflow-hidden p-0"
                            align="start"
                            side={
                                isMobile
                                    ? 'top'
                                    : state ===
                                        'collapsed'
                                      ? 'right'
                                      : 'top'
                            }
                            sideOffset={8}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between gap-3 px-4 py-3">
                                <div>
                                    <p className="text-sm font-semibold">
                                        Notifications
                                    </p>

                                    <p className="text-muted-foreground mt-0.5 text-xs">
                                        {unreadCount > 0
                                            ? `${unreadCount} unread notification${
                                                  unreadCount >
                                                  1
                                                      ? 's'
                                                      : ''
                                              }`
                                            : 'You are all caught up'}
                                    </p>
                                </div>

                                {unreadCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={(event) => {
                                            event.preventDefault();
                                            event.stopPropagation();

                                            markAllAsRead();
                                        }}
                                        className="text-muted-foreground hover:text-foreground flex shrink-0 items-center gap-1 text-xs"
                                    >
                                        <CheckCheck className="h-4 w-4" />

                                        Mark all read
                                    </button>
                                )}
                            </div>

                            <DropdownMenuSeparator className="m-0" />

                            {/* Notification List */}
                            <div className="max-h-[360px] overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map(
                                        (notification) => (
                                            <DropdownMenuItem
                                                key={
                                                    notification.id
                                                }
                                                onSelect={(
                                                    event,
                                                ) => {
                                                    event.preventDefault();

                                                    markAsRead(
                                                        notification,
                                                    );
                                                }}
                                                className="group relative cursor-pointer gap-3 rounded-none px-4 py-3"
                                            >
                                                {/* Icon */}
                                                <div
                                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${getPriorityClass(
                                                        notification.priority,
                                                    )}`}
                                                >
                                                    <NotificationIcon
                                                        type={
                                                            notification.type
                                                        }
                                                    />
                                                </div>

                                                {/* Content */}
                                                <div className="min-w-0 flex-1 pr-7">
                                                    <div className="flex items-start gap-2">
                                                        <p
                                                            className={`min-w-0 flex-1 truncate text-sm ${
                                                                notification.read
                                                                    ? 'font-medium'
                                                                    : 'font-semibold'
                                                            }`}
                                                        >
                                                            {
                                                                notification.title
                                                            }
                                                        </p>

                                                        {!notification.read && (
                                                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                                                        )}
                                                    </div>

                                                    {notification.description && (
                                                        <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs leading-relaxed">
                                                            {
                                                                notification.description
                                                            }
                                                        </p>
                                                    )}

                                                    <p className="text-muted-foreground mt-1 text-[11px]">
                                                        {formatNotificationTime(
                                                            notification.created_at ?? '',
                                                        )}
                                                    </p>
                                                </div>

                                                {/* Delete */}
                                                <button
                                                    type="button"
                                                    aria-label="Delete notification"
                                                    onClick={(
                                                        event,
                                                    ) => {
                                                        event.preventDefault();
                                                        event.stopPropagation();

                                                        removeNotification(
                                                            Number(
                                                                notification.id,
                                                            ),
                                                        );
                                                    }}
                                                    className="text-muted-foreground hover:bg-background hover:text-destructive absolute right-2 top-3 flex h-7 w-7 items-center justify-center rounded-md opacity-0 transition-all group-hover:opacity-100"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </DropdownMenuItem>
                                        ),
                                    )
                                ) : (
                                    <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
                                        <div className="bg-muted mb-3 flex h-10 w-10 items-center justify-center rounded-full">
                                            <Bell className="text-muted-foreground h-5 w-5" />
                                        </div>

                                        <p className="text-sm font-medium">
                                            No notifications
                                        </p>

                                        <p className="text-muted-foreground mt-1 max-w-[220px] text-xs">
                                            System alerts and
                                            vaccination reminders
                                            will appear here.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {notifications.length > 0 && (
                                <>
                                    <DropdownMenuSeparator className="m-0" />

                                    <div className="p-2">
                                        <button
                                            type="button"
                                            onClick={(
                                                event,
                                            ) => {
                                                event.preventDefault();
                                                event.stopPropagation();

                                                clearAllNotifications();
                                            }}
                                            className="text-muted-foreground hover:bg-muted hover:text-destructive flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-sm transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />

                                            Clear all
                                        </button>
                                    </div>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* User Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="group flex-1 text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent"
                            >
                                <UserInfo
                                    user={auth.user}
                                />

                                <ChevronsUpDown className="ml-auto size-4" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                            align="end"
                            side={
                                isMobile
                                    ? 'bottom'
                                    : state ===
                                        'collapsed'
                                      ? 'left'
                                      : 'bottom'
                            }
                        >
                            <UserMenuContent
                                user={auth.user}
                            />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}