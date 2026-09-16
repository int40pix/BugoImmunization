import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useInitials } from '@/hooks/use-initials';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { type AppNotification, type SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import {
    Bell,
    CheckCheck,
    ChevronDown,
    CircleAlert,
    Clock3,
    LogOut,
    PackageX,
    Settings,
    ShieldCheck,
    Syringe,
    Trash2,
    UserPlus,
} from 'lucide-react';

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
    if (!date) return '';
    const createdAt = new Date(date);
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

function getRoleDetails(roleName?: string) {
    const role = (roleName || 'staff').toLowerCase();
    switch (role) {
        case 'admin':
        case 'administrator':
            return {
                label: 'Administrator',
                badgeClass:
                    'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800',
            };
        case 'nurse':
            return {
                label: 'Nurse',
                badgeClass:
                    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
            };
        case 'midwife':
            return {
                label: 'Midwife',
                badgeClass:
                    'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800',
            };
        case 'bhw':
            return {
                label: 'BHW',
                badgeClass:
                    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
            };
        case 'patient':
        case 'guardian':
            return {
                label: 'Guardian / Patient',
                badgeClass:
                    'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800',
            };
        default:
            return {
                label: role.charAt(0).toUpperCase() + role.slice(1),
                badgeClass:
                    'bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700',
            };
    }
}

export function TopNavUser() {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;
    const getInitials = useInitials();
    const cleanup = useMobileNavigation();

    const notifications: AppNotification[] = auth.notifications ?? [];
    const unreadCount = auth.unread_notifications_count ?? 0;

    const rawRole = user.account_role?.name || (user as any).role || 'staff';
    const roleInfo = getRoleDetails(rawRole);

    function markAsRead(notification: AppNotification) {
        if (notification.read || notification.is_read) {
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
        <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Theme Toggle */}
            <AppearanceToggleDropdown />

            {/* Notifications Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        type="button"
                        aria-label="Notifications"
                        className="relative flex h-8 w-8 items-center justify-center rounded-full border border-border/50 bg-muted/30 text-muted-foreground transition-all hover:bg-muted/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                        <Bell className="h-4 w-4" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white shadow-xs">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    className="w-[360px] overflow-hidden p-0"
                    align="end"
                    sideOffset={8}
                >
                    {/* Notifications Header */}
                    <div className="flex items-center justify-between gap-3 border-b px-4 py-3 bg-muted/40">
                        <div>
                            <p className="text-sm font-semibold">Notifications</p>
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
                                className="text-muted-foreground hover:text-foreground flex shrink-0 items-center gap-1 text-xs font-medium transition-colors"
                            >
                                <CheckCheck className="h-3.5 w-3.5" />
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-[340px] overflow-y-auto divide-y divide-border/40">
                        {notifications.length > 0 ? (
                            notifications.map((notification) => {
                                const isRead = notification.read || notification.is_read;
                                return (
                                    <DropdownMenuItem
                                        key={notification.id}
                                        onSelect={(e) => {
                                            e.preventDefault();
                                            markAsRead(notification);
                                        }}
                                        className="group relative flex cursor-pointer items-start gap-3 rounded-none px-4 py-3 focus:bg-accent/60"
                                    >
                                        <div
                                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${getPriorityClass(
                                                notification.priority,
                                            )}`}
                                        >
                                            <NotificationIcon type={notification.type} />
                                        </div>

                                        <div className="min-w-0 flex-1 pr-6">
                                            <div className="flex items-start gap-2">
                                                <p
                                                    className={`min-w-0 flex-1 truncate text-xs ${
                                                        isRead ? 'font-medium text-muted-foreground' : 'font-semibold text-foreground'
                                                    }`}
                                                >
                                                    {notification.title}
                                                </p>
                                                {!isRead && (
                                                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                                                )}
                                            </div>

                                            {notification.description && (
                                                <p className="text-muted-foreground mt-0.5 line-clamp-2 text-[11px] leading-relaxed">
                                                    {notification.description}
                                                </p>
                                            )}

                                            <p className="text-muted-foreground/80 mt-1 text-[10px]">
                                                {formatNotificationTime(notification.created_at ?? '')}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            aria-label="Delete notification"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                removeNotification(notification.id);
                                            }}
                                            className="text-muted-foreground hover:bg-background hover:text-destructive absolute right-2.5 top-3 flex h-6 w-6 items-center justify-center rounded-md opacity-0 transition-opacity group-hover:opacity-100"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </DropdownMenuItem>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center px-6 py-8 text-center">
                                <div className="bg-muted mb-2.5 flex h-9 w-9 items-center justify-center rounded-full">
                                    <Bell className="text-muted-foreground h-4 w-4" />
                                </div>
                                <p className="text-xs font-semibold">No notifications</p>
                                <p className="text-muted-foreground mt-0.5 max-w-[200px] text-[11px]">
                                    System alerts and vaccination reminders will appear here.
                                </p>
                            </div>
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="border-t p-1.5 bg-muted/20">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    clearAllNotifications();
                                }}
                                className="text-muted-foreground hover:bg-muted hover:text-destructive flex w-full items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Clear all notifications
                            </button>
                        </div>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Divider */}
            <div className="mx-1 h-5 w-px bg-border/60" />

            {/* User Profile Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        type="button"
                        aria-label="User Profile"
                        className="group flex items-center gap-2 rounded-full border border-border/50 bg-muted/30 py-1 pl-1 pr-2.5 transition-all hover:bg-muted/70 hover:border-border/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer shadow-2xs"
                    >
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <Avatar className="h-7 w-7 overflow-hidden rounded-full border border-border/60 shadow-xs">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback className="rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                                    {getInitials(user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-background" />
                        </div>

                        {/* Name & Role (hidden on tiny screens) */}
                        <div className="hidden text-left sm:flex sm:flex-col leading-none gap-0.5">
                            <span className="max-w-[120px] truncate text-xs font-semibold text-foreground">
                                {user.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-medium">
                                {roleInfo.label}
                            </span>
                        </div>

                        <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-60 p-1.5" align="end" sideOffset={8}>
                    {/* Header Card */}
                    <div className="flex items-center gap-3 p-2">
                        <Avatar className="h-9 w-9 overflow-hidden rounded-full border border-border/60 shrink-0">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback className="rounded-full bg-primary/10 text-primary text-xs font-bold">
                                {getInitials(user.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-foreground">
                                {user.name}
                            </p>
                            <p className="truncate text-[11px] text-muted-foreground">
                                {user.email}
                            </p>
                            <div className="mt-1">
                                <span
                                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${roleInfo.badgeClass}`}
                                >
                                    <ShieldCheck className="h-2.5 w-2.5 mr-1" />
                                    {roleInfo.label}
                                </span>
                            </div>
                        </div>
                    </div>

                    <DropdownMenuSeparator className="my-1" />

                    {/* Menu Actions */}
                    <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                            <Link
                                href={route('profile.edit')}
                                className="flex w-full items-center gap-2 cursor-pointer text-xs"
                                onClick={cleanup}
                            >
                                <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>Account Settings</span>
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator className="my-1" />

                    <DropdownMenuItem asChild>
                        <Link
                            method="post"
                            href={route('logout')}
                            as="button"
                            className="flex w-full items-center gap-2 cursor-pointer text-xs text-destructive focus:bg-destructive/10 focus:text-destructive"
                            onClick={cleanup}
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            <span>Log out</span>
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

