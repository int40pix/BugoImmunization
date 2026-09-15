
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { router } from '@inertiajs/react';
import {
    Bell,
    CalendarClock,
    CheckCheck,
    CircleAlert,
    Clock3,
    PackageX,
    Syringe,
    Trash2,
    TriangleAlert,
    UserPlus,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type NotificationType =
    | 'inventory'
    | 'schedule'
    | 'patient'
    | 'vaccination'
    | 'expiry'
    | 'overdue';

type NotificationPriority =
    | 'critical'
    | 'warning'
    | 'info'
    | 'success';

type Notification = {
    id: number;
    title: string;
    description: string;
    time: string;
    type: NotificationType;
    priority: NotificationPriority;
    read: boolean;
    href?: string;
};

type FilterType = 'all' | 'unread';

const initialNotifications: Notification[] = [
    {
        id: 1,
        title: 'Low vaccine stock',
        description: 'BCG vaccine has only 5 doses remaining.',
        time: '5 min ago',
        type: 'inventory',
        priority: 'warning',
        read: false,
        href: '/vaccine-inventory',
    },
    {
        id: 2,
        title: 'Vaccination due today',
        description: '5 pediatric patients have scheduled vaccinations today.',
        time: '20 min ago',
        type: 'schedule',
        priority: 'info',
        read: false,
        href: '/immunizations',
    },
    {
        id: 3,
        title: 'Vaccination overdue',
        description: 'A patient has an overdue vaccination schedule.',
        time: '45 min ago',
        type: 'overdue',
        priority: 'critical',
        read: false,
        href: '/immunizations',
    },
    {
        id: 4,
        title: 'Vaccine expiring soon',
        description: 'Pentavalent vaccine batch PV-001 expires in 7 days.',
        time: '1 hour ago',
        type: 'expiry',
        priority: 'warning',
        read: false,
        href: '/vaccine-inventory',
    },
    {
        id: 5,
        title: 'New patient registered',
        description: 'A new pediatric patient was added to the system.',
        time: '2 hours ago',
        type: 'patient',
        priority: 'info',
        read: true,
        href: '/patients',
    },
    {
        id: 6,
        title: 'Vaccination completed',
        description: 'A vaccination record was successfully updated.',
        time: '3 hours ago',
        type: 'vaccination',
        priority: 'success',
        read: true,
        href: '/immunizations',
    },
];

function NotificationIcon({
    type,
}: {
    type: NotificationType;
}) {
    switch (type) {
        case 'inventory':
            return <PackageX className="h-4 w-4" />;

        case 'schedule':
            return <CalendarClock className="h-4 w-4" />;

        case 'patient':
            return <UserPlus className="h-4 w-4" />;

        case 'vaccination':
            return <Syringe className="h-4 w-4" />;

        case 'expiry':
            return <Clock3 className="h-4 w-4" />;

        case 'overdue':
            return <CircleAlert className="h-4 w-4" />;

        default:
            return <Bell className="h-4 w-4" />;
    }
}

function getPriorityClasses(
    priority: NotificationPriority,
) {
    switch (priority) {
        case 'critical':
            return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300';

        case 'warning':
            return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300';

        case 'success':
            return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300';

        case 'info':
        default:
            return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
    }
}

export function NotificationMenu() {
    const [notifications, setNotifications] =
        useState<Notification[]>(initialNotifications);

    const [filter, setFilter] =
        useState<FilterType>('all');

    const unreadCount = useMemo(
        () =>
            notifications.filter(
                (notification) => !notification.read,
            ).length,
        [notifications],
    );

    const filteredNotifications = useMemo(() => {
        if (filter === 'unread') {
            return notifications.filter(
                (notification) => !notification.read,
            );
        }

        return notifications;
    }, [filter, notifications]);

    function markAsRead(id: number) {
        setNotifications((current) =>
            current.map((notification) =>
                notification.id === id
                    ? {
                          ...notification,
                          read: true,
                      }
                    : notification,
            ),
        );
    }

    function markAllAsRead() {
        setNotifications((current) =>
            current.map((notification) => ({
                ...notification,
                read: true,
            })),
        );
    }

    function clearNotification(id: number) {
        setNotifications((current) =>
            current.filter(
                (notification) =>
                    notification.id !== id,
            ),
        );
    }

    function clearAllNotifications() {
        setNotifications([]);
    }

    function openNotification(
        notification: Notification,
    ) {
        markAsRead(notification.id);

        if (notification.href) {
            router.visit(notification.href);
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    aria-label="Notifications"
                    className="hover:bg-muted relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
                >
                    <Bell className="h-5 w-5" />

                    {unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-background">
                            {unreadCount > 9
                                ? '9+'
                                : unreadCount}
                        </span>
                    )}
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-[380px] overflow-hidden p-0"
            >
                <div className="flex items-start justify-between gap-4 px-4 py-3">
                    <div>
                        <h3 className="text-sm font-semibold">
                            Notifications
                        </h3>

                        <p className="text-muted-foreground mt-0.5 text-xs">
                            {unreadCount > 0
                                ? `${unreadCount} unread notification${
                                      unreadCount > 1
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
                            className="text-muted-foreground hover:text-foreground flex shrink-0 items-center gap-1.5 text-xs transition-colors"
                        >
                            <CheckCheck className="h-3.5 w-3.5" />
                            Mark all read
                        </button>
                    )}
                </div>

                <DropdownMenuSeparator className="m-0" />

                <div className="flex items-center justify-between px-4 py-2">
                    <div className="bg-muted flex rounded-md p-1">
                        <button
                            type="button"
                            onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                setFilter('all');
                            }}
                            className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                                filter === 'all'
                                    ? 'bg-background shadow-sm'
                                    : 'text-muted-foreground'
                            }`}
                        >
                            All
                        </button>

                        <button
                            type="button"
                            onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                setFilter('unread');
                            }}
                            className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                                filter === 'unread'
                                    ? 'bg-background shadow-sm'
                                    : 'text-muted-foreground'
                            }`}
                        >
                            Unread
                        </button>
                    </div>

                    {notifications.length > 0 && (
                        <button
                            type="button"
                            onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                clearAllNotifications();
                            }}
                            className="text-muted-foreground hover:text-destructive flex items-center gap-1 text-xs transition-colors"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            Clear all
                        </button>
                    )}
                </div>

                <DropdownMenuSeparator className="m-0" />

                <div className="max-h-[390px] overflow-y-auto">
                    {filteredNotifications.length > 0 ? (
                        filteredNotifications.map(
                            (notification) => (
                                <DropdownMenuItem
                                    key={notification.id}
                                    onSelect={(event) => {
                                        event.preventDefault();
                                        openNotification(
                                            notification,
                                        );
                                    }}
                                    className="group relative cursor-pointer gap-3 rounded-none px-4 py-3 focus:bg-muted"
                                >
                                    <div
                                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${getPriorityClasses(
                                            notification.priority,
                                        )}`}
                                    >
                                        <NotificationIcon
                                            type={
                                                notification.type
                                            }
                                        />
                                    </div>

                                    <div className="min-w-0 flex-1 pr-6">
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

                                        <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs leading-relaxed">
                                            {
                                                notification.description
                                            }
                                        </p>

                                        <p className="text-muted-foreground mt-1 text-[11px]">
                                            {notification.time}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        aria-label="Remove notification"
                                        onClick={(event) => {
                                            event.preventDefault();
                                            event.stopPropagation();

                                            clearNotification(
                                                notification.id,
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
                        <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                            <div className="bg-muted mb-3 flex h-11 w-11 items-center justify-center rounded-full">
                                {filter === 'unread' ? (
                                    <CheckCheck className="text-muted-foreground h-5 w-5" />
                                ) : (
                                    <Bell className="text-muted-foreground h-5 w-5" />
                                )}
                            </div>

                            <p className="text-sm font-medium">
                                {filter === 'unread'
                                    ? 'No unread notifications'
                                    : 'No notifications'}
                            </p>

                            <p className="text-muted-foreground mt-1 max-w-[230px] text-xs leading-relaxed">
                                {filter === 'unread'
                                    ? 'You have already read all your notifications.'
                                    : 'System alerts and vaccination reminders will appear here.'}
                            </p>
                        </div>
                    )}
                </div>

                <DropdownMenuSeparator className="m-0" />

                <div className="p-2">
                    <button
                        type="button"
                        onClick={(event) => {
                            event.preventDefault();
                            router.visit('/notifications');
                        }}
                        className="hover:bg-muted w-full rounded-md px-3 py-2 text-center text-sm font-medium transition-colors"
                    >
                        View all notifications
                    </button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

