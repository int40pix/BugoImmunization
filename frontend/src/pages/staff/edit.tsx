import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
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

    function submit(e: React.FormEvent) {
        e.preventDefault();

        put(`/staff/${staff.id}`);
    }

    return (
        <AppLayout>
            <Head title={`Edit ${staff.name}`} />

            <div className="max-w-4xl space-y-6 p-6">
                <div>
                    <Link href={`/staff/${staff.id}`}>
                        <Button variant="ghost" type="button">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Staff Details
                        </Button>
                    </Link>

                    <h1 className="mt-4 text-2xl font-bold">
                        Edit Staff Account
                    </h1>

                    <p className="mt-2 text-muted-foreground">
                        Update the account information of this staff member.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Staff Account Information</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Full Name
                                </Label>

                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData(
                                            'name',
                                            e.target.value,
                                        )
                                    }
                                />

                                {errors.name && (
                                    <p className="text-sm text-red-500">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">
                                    Email Address
                                </Label>

                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData(
                                            'email',
                                            e.target.value,
                                        )
                                    }
                                />

                                {errors.email && (
                                    <p className="text-sm text-red-500">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">
                                    Role
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
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="admin">
                                        Admin
                                    </option>

                                    <option value="nurse">
                                        Nurse
                                    </option>

                                    <option value="midwife">
                                        Midwife
                                    </option>

                                    <option value="bhw">
                                        BHW
                                    </option>
                                </select>

                                {errors.role && (
                                    <p className="text-sm text-red-500">
                                        {errors.role}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end gap-3">
                                <Link href={`/staff/${staff.id}`}>
                                    <Button
                                        type="button"
                                        variant="outline"
                                    >
                                        Cancel
                                    </Button>
                                </Link>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                >
                                    {processing
                                        ? 'Saving...'
                                        : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}