import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';

interface Staff {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'nurse' | 'midwife' | 'bhw';
}

interface StaffEditProps {
    staff: Staff;
}

export default function StaffEdit({ staff }: StaffEditProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: staff.name,
        email: staff.email,
        role: staff.role,
    });

    const breadcrumbs = [
        { title: 'Staff Management', href: '/staff' },
        { title: staff.name, href: `/staff/${staff.id}` },
        { title: 'Edit', href: `/staff/${staff.id}/edit` },
    ];

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(`/staff/${staff.id}`);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${staff.name}`} />

            <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8">
                <div>
                    <Button
                        asChild
                        variant="ghost"
                        className="-ml-3 mb-2 text-muted-foreground hover:text-foreground"
                    >
                        <Link href={`/staff/${staff.id}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Staff Details
                        </Link>
                    </Button>

                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Edit Staff Account
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Update the account information and role of this staff member.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Staff Account Information</CardTitle>
                        <CardDescription>
                            Modify contact details and administrative access privileges.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Full Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                {errors.name && (
                                    <p className="text-xs text-destructive">{errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">
                                    Email Address <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                />
                                {errors.email && (
                                    <p className="text-xs text-destructive">{errors.email}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">
                                    Role <span className="text-destructive">*</span>
                                </Label>
                                <select
                                    id="role"
                                    value={data.role}
                                    onChange={(e) =>
                                        setData(
                                            'role',
                                            e.target.value as Staff['role'],
                                        )
                                    }
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    required
                                >
                                    <option value="admin">Administrator</option>
                                    <option value="nurse">Nurse</option>
                                    <option value="midwife">Midwife</option>
                                    <option value="bhw">Barangay Health Worker (BHW)</option>
                                </select>
                                {errors.role && (
                                    <p className="text-xs text-destructive">{errors.role}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-3 border-t pt-4">
                                <Button asChild variant="outline">
                                    <Link href={`/staff/${staff.id}`}>Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}