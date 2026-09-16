import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Pencil } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';

interface Staff {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'nurse' | 'midwife' | 'bhw';
    created_at: string;
}

interface StaffShowProps {
    staff: Staff;
}

export default function StaffShow({ staff }: StaffShowProps) {
    const breadcrumbs = [
        { title: 'Staff Management', href: '/staff' },
        { title: staff.name, href: `/staff/${staff.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${staff.name} - Staff Details`} />

            <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8">
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

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                Staff Details
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                View the account information and role of this health center personnel.
                            </p>
                        </div>

                        <Button asChild variant="outline">
                            <Link href={`/staff/${staff.id}/edit`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Staff
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Account Information</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <p className="text-sm text-muted-foreground">Full Name</p>
                                <p className="mt-1 font-medium">{staff.name}</p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">Email Address</p>
                                <p className="mt-1 font-medium">{staff.email}</p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">Role</p>
                                <p className="mt-1 font-medium capitalize">{staff.role}</p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <p className="mt-1 font-medium text-emerald-600 dark:text-emerald-400">Active</p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">Date Created</p>
                                <p className="mt-1 font-medium">
                                    {new Date(staff.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}