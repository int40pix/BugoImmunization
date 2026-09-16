import { NavMain } from '@/components/nav-main';
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    Baby,
    Bell,
    Boxes,
    CalendarDays,
    KeyRound,
    LayoutDashboard,
    Syringe,
    UserCog,
} from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;

    const userRole = auth.user.role;

    const mainNavItems: NavItem[] = [
        ...(userRole === 'guardian'
            ? [
                  {
                      title: 'Guardian Dashboard',
                      url: '/guardian/dashboard',
                      icon: LayoutDashboard,
                  },
                  {
                      title: 'My Children',
                      url: '/guardian/children',
                      icon: Baby,
                  },
                  {
                      title: 'Upcoming Visits',
                      url: '/guardian/visits',
                      icon: CalendarDays,
                  },
              ]
            : []),

        ...(userRole === 'admin'
            ? [
                  {
                      title: 'Staff Dashboard',
                      url: '/dashboard',
                      icon: LayoutDashboard,
                  },
                  {
                      title: 'Staff Management',
                      url: '/staff',
                      icon: UserCog,
                  },
              ]
            : []),

        ...(userRole === 'admin' ||
        userRole === 'nurse' ||
        userRole === 'midwife'
            ? [
                  {
                      title: 'Patient Management',
                      url: '/patients',
                      icon: Baby,
                  },
                  {
                      title: 'Immunization Tracking',
                      url: '/immunization',
                      icon: Syringe,
                  },
                  {
                      title: 'Vaccine Inventory',
                      url: '/vaccine-inventory',
                      icon: Boxes,
                  },
              ]
            : []),

        ...(userRole === 'bhw'
            ? [
                  {
                      title: 'Patient Management',
                      url: '/patients',
                      icon: Baby,
                  },
              ]
            : []),

        ...(userRole === 'patient'
            ? [
                  {
                      title: 'Notification Inbox',
                      url: '/patient/inbox',
                      icon: Bell,
                  },
              ]
            : []),
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link
                                href={
                                    userRole === 'patient'
                                        ? '/patient/inbox'
                                        : userRole === 'guardian'
                                          ? '/guardian/dashboard'
                                          : '/dashboard'
                                }
                                prefetch
                            >
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>
        </Sidebar>
    );
}