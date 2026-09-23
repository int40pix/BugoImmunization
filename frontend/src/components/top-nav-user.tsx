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
import { NotificationsDropdown } from '@/components/notifications-dropdown';
import {
    ChevronDown,
    LogOut,
    Settings,
    ShieldCheck,
} from 'lucide-react';

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

    const rawRole = user.account_role?.name || (user as any).role || 'staff';
    const roleInfo = getRoleDetails(rawRole);

    return (
        <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Theme Toggle */}
            <AppearanceToggleDropdown />

            {/* Notifications Dropdown */}
            <NotificationsDropdown />

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

