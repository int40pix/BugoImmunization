import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { Link, router, usePage } from '@inertiajs/react';
import { KeyRound, LogOut, QrCode, Settings, ShieldCheck, UserRound } from 'lucide-react';
import React from 'react';
import { type SharedData } from '@/types';

interface GuardianHeaderProps {
    guardianName: string;
    guardianNo?: string;
    contactNumber?: string | null;
    email?: string | null;
    onOpenQrModal?: () => void;
    hasChildren?: boolean;
}

export default function GuardianHeader({
    guardianName,
    guardianNo,
    contactNumber,
    email,
    onOpenQrModal,
    hasChildren = false,
}: GuardianHeaderProps) {
    const { auth } = usePage<SharedData>().props;
    const user = auth?.user;

    const initials = guardianName
        .split(' ')
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'G';

    const handleLogout = () => {
        router.post(route('logout'), {}, {
            preserveScroll: false,
            onSuccess: () => {
                router.visit('/login');
            },
        });
    };

    const page = usePage<SharedData>();
    const url = page.url;
    const isDashboard = url === '/guardian/dashboard';
    const isChildren = url.startsWith('/guardian/children');
    const isVisits = url.startsWith('/guardian/visits');

    return (
        <header className="sticky top-0 z-30 border-b border-border/70 bg-background/95 backdrop-blur-md">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
                {/* Brand Identity */}
                <Link
                    href="/guardian/dashboard"
                    className="flex min-w-0 items-center gap-3 transition-opacity hover:opacity-90"
                >
                    <img
                        src="/images/bugo-health-center-logo.png"
                        alt="Barangay Bugo Health Center"
                        className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-border/60"
                        onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                        }}
                    />

                    <div className="min-w-0 leading-tight">
                        <div className="flex items-center gap-2">
                            <span className="truncate font-bold tracking-tight text-foreground text-sm sm:text-base">
                                Barangay Bugo
                            </span>
                            <Badge
                                variant="outline"
                                className="hidden xs:inline-flex border-blue-500/30 bg-blue-500/10 text-[10px] font-medium text-blue-700 dark:text-blue-300 py-0 px-1.5"
                            >
                                Guardian Portal
                            </Badge>
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                            Pediatric Immunization & Health Records
                        </p>
                    </div>
                </Link>

                {/* Central Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-1 rounded-xl border border-border/60 bg-muted/30 p-1">
                    <Link
                        href="/guardian/dashboard"
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                            isDashboard
                                ? 'bg-background text-foreground shadow-2xs font-semibold'
                                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                        }`}
                    >
                        Dashboard
                    </Link>
                    <Link
                        href="/guardian/children"
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                            isChildren
                                ? 'bg-background text-foreground shadow-2xs font-semibold'
                                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                        }`}
                    >
                        My Children
                    </Link>
                    <Link
                        href="/guardian/visits"
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                            isVisits
                                ? 'bg-background text-foreground shadow-2xs font-semibold'
                                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                        }`}
                    >
                        Upcoming Visits
                    </Link>
                </nav>

                {/* Right Controls */}
                <div className="flex items-center gap-2 sm:gap-2.5">
                    {/* Quick Check-in QR Pass */}
                    {hasChildren && onOpenQrModal && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onOpenQrModal}
                            className="h-8 gap-1.5 rounded-lg border-border/70 text-xs font-medium shadow-2xs hover:border-primary/40 hover:bg-primary/5"
                            title="Show child QR code for health center check-in"
                        >
                            <QrCode className="h-3.5 w-3.5 text-primary" />
                            <span className="hidden sm:inline">Check-in QR</span>
                        </Button>
                    )}

                    {/* Appearance Theme Switcher */}
                    <AppearanceToggleDropdown />

                    {/* Guardian User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="h-8 w-8 rounded-full p-0 ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <Avatar className="h-8 w-8 border border-border/70 bg-primary/10 text-primary">
                                    <AvatarFallback className="text-xs font-semibold">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-60">
                            <DropdownMenuLabel className="p-2 font-normal">
                                <div className="flex flex-col space-y-1">
                                    <div className="flex items-center gap-1.5">
                                        <p className="text-sm font-semibold leading-none text-foreground truncate">
                                            {guardianName}
                                        </p>
                                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                    </div>
                                    {guardianNo && (
                                        <p className="text-[11px] font-mono text-muted-foreground truncate">
                                            {guardianNo}
                                        </p>
                                    )}
                                    <p className="text-xs text-muted-foreground truncate">
                                        {email || user?.email || contactNumber || 'Registered Family Account'}
                                    </p>
                                </div>
                            </DropdownMenuLabel>

                            <DropdownMenuSeparator />

                            <DropdownMenuGroup>
                                <DropdownMenuItem asChild>
                                    <Link href="/guardian/dashboard" className="cursor-pointer">
                                        <UserRound className="mr-2 h-4 w-4 text-muted-foreground" />
                                        My Family Dashboard
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuItem asChild>
                                    <Link href="/settings/profile" className="cursor-pointer">
                                        <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                                        Profile Settings
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuItem asChild>
                                    <Link href="/settings/password" className="cursor-pointer">
                                        <KeyRound className="mr-2 h-4 w-4 text-muted-foreground" />
                                        Change Password
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Sign out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}

