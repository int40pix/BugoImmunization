import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { Bell, Folder, LayoutGrid } from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;

    const userRole = auth.user.role;

    const mainNavItems: NavItem[] = [
        ...(userRole === 'admin'
            ? [
                  {
                      title: 'Staff Dashboard',
                      url: '/dashboard',
                      icon: LayoutGrid,
                  },
                  {
                      title: 'Staff Management',
                      url: '/staff',
                      icon: Folder,
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
                      icon: Folder,
                  },
                  {
                      title: 'Immunization Tracking',
                      url: '/immunization',
                      icon: Folder,
                  },
                  {
                      title: 'Vaccine Inventory',
                      url: '/vaccine-inventory',
                      icon: Folder,
                  },
              ]
            : []),

        ...(userRole === 'bhw'
            ? [
                  {
                      title: 'Patient Management',
                      url: '/patients',
                      icon: Folder,
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
                            <Link href={userRole === 'patient' ? '/patient/inbox' : '/dashboard'} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>

                <div className="mt-2">
                    <NavUser />
                </div>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>
        </Sidebar>
    );
}