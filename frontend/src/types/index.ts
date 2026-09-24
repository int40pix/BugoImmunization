import { type LucideIcon } from 'lucide-react';
import React from 'react';

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | React.ComponentType<{ className?: string }> | null;
    isActive?: boolean;
    items?: NavItem[];
}

export interface AccountRole {
    id: number;
    name: string;
    description?: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at?: string | null;
    account_role_id?: number | null;
    must_change_password?: boolean;
    is_active?: boolean;
    account_role?: AccountRole | null;
    created_at?: string;
    updated_at?: string;
    [key: string]: unknown;
}

export interface AppNotification {
    id: number | string;
    title: string;
    message?: string;
    description?: string | null;
    type?: string;
    priority?: string;
    read?: boolean;
    is_read?: boolean;
    url?: string | null;
    created_at?: string;
    [key: string]: any;
}

export interface SharedData {
    name: string;
    quote: {
        message: string;
        author: string;
    };
    auth: {
        user: User;
        notifications?: AppNotification[];
        unread_notifications_count?: number;
    };
    status?: string | null;
    flash?: {
        status?: string | null;
        success?: string | null;
        error?: string | null;
        warning?: string | null;
        info?: string | null;
        temp_password?: string | null;
        [key: string]: unknown;
    };
    [key: string]: unknown;
}
