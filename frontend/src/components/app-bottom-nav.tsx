import { Link, usePage } from '@inertiajs/react';
import {
    Baby,
    Boxes,
    CalendarDays,
    LayoutDashboard,
    Syringe,
    UserCog,
    Bell,
} from 'lucide-react';
import { type SharedData } from '@/types';

export function AppBottomNav() {
    const page = usePage<SharedData>();
    const userRole = page.props.auth?.user?.role;
    const url = page.url;

    if (!userRole) {
        return null;
    }

    let navItems: {
        title: string;
        href: string;
        icon: any;
        isActive: boolean;
    }[] = [];

    if (userRole === 'guardian') {
        navItems = [
            {
                title: 'Dashboard',
                href: '/guardian/dashboard',
                icon: LayoutDashboard,
                isActive: url.startsWith('/guardian/dashboard'),
            },
            {
                title: 'My Children',
                href: '/guardian/children',
                icon: Baby,
                isActive: url.startsWith('/guardian/children'),
            },
            {
                title: 'Visits',
                href: '/guardian/visits',
                icon: CalendarDays,
                isActive: url.startsWith('/guardian/visits'),
            },
        ];
    } else if (userRole === 'admin') {
        navItems = [
            {
                title: 'Dashboard',
                href: '/dashboard',
                icon: LayoutDashboard,
                isActive: url === '/dashboard' || url.startsWith('/dashboard?'),
            },
            {
                title: 'Patients',
                href: '/patients',
                icon: Baby,
                isActive: url.startsWith('/patients') || url.startsWith('/guardians'),
            },
            {
                title: 'Inventory',
                href: '/vaccine-inventory',
                icon: Boxes,
                isActive: url.startsWith('/vaccine-inventory') || url.startsWith('/vaccines'),
            },
            {
                title: 'Immunize',
                href: '/immunization',
                icon: Syringe,
                isActive: url.startsWith('/immunization'),
            },
            {
                title: 'Staff',
                href: '/staff',
                icon: UserCog,
                isActive: url.startsWith('/staff'),
            },
        ];
    } else if (userRole === 'nurse' || userRole === 'midwife') {
        navItems = [
            {
                title: 'Dashboard',
                href: '/dashboard',
                icon: LayoutDashboard,
                isActive: url === '/dashboard' || url.startsWith('/dashboard?'),
            },
            {
                title: 'Patients',
                href: '/patients',
                icon: Baby,
                isActive: url.startsWith('/patients') || url.startsWith('/guardians'),
            },
            {
                title: 'Inventory',
                href: '/vaccine-inventory',
                icon: Boxes,
                isActive: url.startsWith('/vaccine-inventory') || url.startsWith('/vaccines'),
            },
            {
                title: 'Immunize',
                href: '/immunization',
                icon: Syringe,
                isActive: url.startsWith('/immunization'),
            },
        ];
    } else if (userRole === 'bhw') {
        navItems = [
            {
                title: 'Dashboard',
                href: '/dashboard',
                icon: LayoutDashboard,
                isActive: url === '/dashboard' || url.startsWith('/dashboard?'),
            },
            {
                title: 'Patients',
                href: '/patients',
                icon: Baby,
                isActive: url.startsWith('/patients') || url.startsWith('/guardians'),
            },
        ];
    } else if (userRole === 'patient') {
        navItems = [
            {
                title: 'Inbox',
                href: '/patient/inbox',
                icon: Bell,
                isActive: url.startsWith('/patient/inbox'),
            },
        ];
    }

    if (navItems.length === 0) {
        return null;
    }

    return (
        <nav
            aria-label="Mobile Bottom Navigation"
            className="fixed inset-x-0 bottom-0 z-30 flex d-flex md:hidden d-md-none h-16 items-center justify-around border-t border-border/80 bg-background/95 px-1 backdrop-blur-md shadow-lg safe-bottom print:hidden"
        >
            {navItems.map((item) => {
                const Icon = item.icon;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex flex-1 flex-col items-center justify-center gap-1 py-1 text-[10px] sm:text-[11px] font-medium transition-colors ${
                            item.isActive
                                ? 'text-primary font-semibold'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <div
                            className={`flex h-8 w-11 items-center justify-center rounded-full transition-all ${
                                item.isActive
                                    ? 'bg-primary/15 text-primary'
                                    : 'text-muted-foreground hover:bg-muted/50'
                            }`}
                        >
                            <Icon className="h-4 w-4" />
                        </div>
                        <span className="truncate max-w-[62px] text-center leading-tight">
                            {item.title}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}

// Backward compatibility alias
export const GuardianBottomNav = AppBottomNav;

