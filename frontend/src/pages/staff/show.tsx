import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Pencil, UserCheck, UserX } from 'lucide-react';
import React, { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';

interface Staff {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'nurse' | 'midwife' | 'bhw';
    status: 'active' | 'inactive';
    created_at: string;
}

interface StaffShowProps {
    staff: Staff;
}

export default function StaffShow({ staff }: StaffShowProps) {
    const { auth } = usePage<{ auth?: { user?: { id: number } } }>().props;
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [statusUpdating, setStatusUpdating] = useState(false);

    const isSelf = auth?.user?.id === staff.id;

    const breadcrumbs = [
        { title: 'Staff Management', href: '/staff' },
        { title: staff.name, href: `/staff/${staff.id}` },
    ];

    const handleConfirmStatusToggle = () => {
        setStatusUpdating(true);
        router.put(
            `/staff/${staff.id}/status`,
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setStatusUpdating(false);
                    setStatusDialogOpen(false);
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${staff.name} - Staff Details`} />

            <div className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-7">
                {/* Back navigation & Page Title */}
                <div>
                    <Button
                        asChild
                        variant="ghost"
                        className="-ml-3 mb-2 text-muted-foreground hover:text-foreground"
                    >
                        <Link href="/staff">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Staff Management
                        </Link>
                    </Button>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex flex-wrap items-center gap-2.5">
                                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                    {staff.name}
                                </h1>
                                <Badge variant="outline" className="capitalize">
                                    {staff.role}
                                </Badge>
                                <Badge
                                    variant={staff.status === 'active' ? 'default' : 'secondary'}
                                    className={
                                        staff.status === 'active'
                                            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                            : 'border-muted text-muted-foreground'
                                    }
                                >
                                    {staff.status === 'active' ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Health center personnel credentials and administrative access controls.
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2-Column Layout: Left is Staff Information, Right is Management Actions */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left: Account Information */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="border-b pb-4">
                            <CardTitle className="text-base font-semibold">Account Information</CardTitle>
                            <p className="text-xs text-muted-foreground">
                                Detailed personnel record and assigned health center role
                            </p>
                        </CardHeader>

                        <CardContent className="space-y-6 pt-6">
                            <div className="grid gap-6 sm:grid-cols-2">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Full Name
                                    </p>
                                    <p className="mt-1.5 text-sm font-semibold text-foreground">
                                        {staff.name}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Email Address
                                    </p>
                                    <p className="mt-1.5 text-sm font-semibold text-foreground">
                                        {staff.email}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Role
                                    </p>
                                    <div className="mt-1.5">
                                        <Badge variant="outline" className="capitalize font-medium">
                                            {staff.role}
                                        </Badge>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Account Status
                                    </p>
                                    <div className="mt-1.5">
                                        <Badge
                                            variant={staff.status === 'active' ? 'default' : 'secondary'}
                                            className={
                                                staff.status === 'active'
                                                    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                                    : 'border-muted text-muted-foreground'
                                            }
                                        >
                                            {staff.status === 'active' ? 'Active Account' : 'Inactive Account'}
                                        </Badge>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Date Created
                                    </p>
                                    <p className="mt-1.5 text-sm font-medium text-foreground">
                                        {new Date(staff.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right: Management Actions Area */}
                    <Card className="h-fit lg:col-span-1">
                        <CardHeader className="border-b pb-4">
                            <CardTitle className="text-base font-semibold">Management Actions</CardTitle>
                            <p className="text-xs text-muted-foreground">
                                Operational actions for this staff account
                            </p>
                        </CardHeader>

                        <CardContent className="space-y-4 pt-6">
                            <Button
                                asChild
                                variant="outline"
                                className="w-full justify-start gap-2 h-9 text-xs font-medium"
                            >
                                <Link href={`/staff/${staff.id}/edit`}>
                                    <Pencil className="h-4 w-4 text-muted-foreground" />
                                    Edit Staff Information
                                </Link>
                            </Button>

                            {isSelf ? (
                                <div className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
                                    You are currently signed into this account. You cannot deactivate your own profile.
                                </div>
                            ) : staff.status === 'active' ? (
                                <Button
                                    variant="destructive"
                                    className="w-full justify-start gap-2 h-9 text-xs font-medium"
                                    onClick={() => setStatusDialogOpen(true)}
                                >
                                    <UserX className="h-4 w-4" />
                                    Deactivate Staff Account
                                </Button>
                            ) : (
                                <Button
                                    variant="default"
                                    className="w-full justify-start gap-2 h-9 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white"
                                    onClick={() => setStatusDialogOpen(true)}
                                >
                                    <UserCheck className="h-4 w-4" />
                                    Activate Staff Account
                                </Button>
                            )}

                            <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground leading-relaxed">
                                {staff.status === 'active'
                                    ? 'Deactivating this account will immediately revoke access and prevent this staff member from logging in.'
                                    : 'Activating this account will restore full access for this staff member.'}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Staff Status Confirmation Dialog */}
            <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {staff.status === 'active'
                                ? 'Deactivate Staff Account?'
                                : 'Activate Staff Account?'}
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to {staff.status === 'active' ? 'deactivate' : 'activate'} the account for{' '}
                            <span className="font-semibold text-foreground">{staff.name}</span> ({staff.email})?{' '}
                            {staff.status === 'active'
                                ? 'They will no longer be able to log in to the clinic management system.'
                                : 'Their account access will be restored.'}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setStatusDialogOpen(false)}
                            disabled={statusUpdating}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant={staff.status === 'active' ? 'destructive' : 'default'}
                            onClick={handleConfirmStatusToggle}
                            disabled={statusUpdating}
                        >
                            {statusUpdating
                                ? 'Updating...'
                                : staff.status === 'active'
                                  ? 'Deactivate Staff'
                                  : 'Activate Staff'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}