import { Head, useForm } from '@inertiajs/react';
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
import { ArrowLeft } from 'lucide-react';

export default function StaffCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();

        post('/staff');
    }

    return (
        <AppLayout>
            <Head title="Register Staff" />

            <div className="max-w-4xl space-y-6 p-6">
                <div>
                    <Button
                        variant="ghost"
                        type="button"
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>

                    <h1 className="mt-4 text-2xl font-bold">
                        Register Staff
                    </h1>

                    <p className="mt-2 text-muted-foreground">
                        Create an authorized health center personnel account.
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

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="password">
                                        Password
                                    </Label>

                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) =>
                                            setData(
                                                'password',
                                                e.target.value,
                                            )
                                        }
                                    />

                                    {errors.password && (
                                        <p className="text-sm text-red-500">
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">
                                        Confirm Password
                                    </Label>

                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) =>
                                            setData(
                                                'password_confirmation',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
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
                                            e.target.value,
                                        )
                                    }
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="">
                                        Select role
                                    </option>

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
                                        Barangay Health Worker
                                    </option>
                                </select>

                                {errors.role && (
                                    <p className="text-sm text-red-500">
                                        {errors.role}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                >
                                    {processing
                                        ? 'Registering...'
                                        : 'Register Staff'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}