import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

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
    role: 'nurse' | 'midwife' | 'bhw';
    created_at: string;
}

interface StaffShowProps {
    staff: Staff;
}

export default function StaffShow({ staff }: StaffShowProps) {
    return (
        <AppLayout>
            <Head title={`${staff.name} - Staff Details`} />

            <div className="max-w-4xl space-y-6 p-6">
                <div>
                    <Link href="/staff">
                        <Button variant="ghost" type="button">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Staff Management
                        </Button>
                    </Link>

                    <h1 className="mt-4 text-2xl font-bold">
                        Staff Details
                    </h1>

                    <p className="mt-2 text-muted-foreground">
                        View the account information of this health center
                        personnel.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Full Name
                                </p>

                                <p className="mt-1 font-medium">
                                    {staff.name}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Email Address
                                </p>

                                <p className="mt-1 font-medium">
                                    {staff.email}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Role
                                </p>

                                <p className="mt-1 font-medium capitalize">
                                    {staff.role}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Status
                                </p>

                                <p className="mt-1 font-medium">
                                    Active
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Date Created
                                </p>

                                <p className="mt-1 font-medium">
                                    {new Date(
                                        staff.created_at,
                                    ).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}