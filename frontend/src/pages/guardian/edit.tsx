import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Check, ShieldAlert, User, Users } from 'lucide-react';
import { FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';

interface GuardianData {
    id: number;
    guardian_no: string;
    name: string;
    gender: string | null;
    email: string | null;
    contact_number: string | null;
    mother_maiden_name: string | null;
    father_name: string | null;
    mother_information_unavailable: boolean;
    father_information_unavailable: boolean;
    status: string;
    account_status: string;
}

interface GuardianEditProps {
    guardian: GuardianData;
}

export default function GuardianEdit({ guardian }: GuardianEditProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: guardian.name || '',
        gender: guardian.gender || 'Female',
        email: guardian.email || '',
        contact_number: guardian.contact_number || '',
        mother_maiden_name: guardian.mother_maiden_name || '',
        father_name: guardian.father_name || '',
        mother_information_unavailable: guardian.mother_information_unavailable || false,
        father_information_unavailable: guardian.father_information_unavailable || false,
        status: guardian.status || 'active',
    });

    const breadcrumbs = [
        { title: 'Guardians', href: '/guardians' },
        { title: guardian.name || guardian.guardian_no, href: `/guardians/${guardian.id}` },
        { title: 'Edit', href: `/guardians/${guardian.id}/edit` },
    ];

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        put(`/guardians/${guardian.id}`);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Family - ${guardian.name}`} />

            <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8">
                <div>
                    <Button asChild variant="ghost" className="-ml-3 mb-2 text-muted-foreground hover:text-foreground">
                        <Link href={`/guardians/${guardian.id}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Family Details
                        </Link>
                    </Button>
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                Edit Family & Guardian
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Guardian ID: <span className="font-mono font-medium">{guardian.guardian_no}</span>
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Guardian Contact & Personal Details */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">Guardian Information</CardTitle>
                            </div>
                            <CardDescription>
                                Primary contact and identification details for this family head.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        Full Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g. Maria Santos Dela Cruz"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-xs text-destructive">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="gender">
                                        Gender <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={data.gender}
                                        onValueChange={(val) => setData('gender', val)}
                                    >
                                        <SelectTrigger id="gender">
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Female">Female</SelectItem>
                                            <SelectItem value="Male">Male</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.gender && (
                                        <p className="text-xs text-destructive">{errors.gender}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="contact_number">Contact Number</Label>
                                    <Input
                                        id="contact_number"
                                        type="tel"
                                        value={data.contact_number}
                                        onChange={(e) => setData('contact_number', e.target.value)}
                                        placeholder="e.g. 09123456789"
                                    />
                                    {errors.contact_number && (
                                        <p className="text-xs text-destructive">{errors.contact_number}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="e.g. guardian@example.com"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Used for guardian portal login and digital notifications.
                                    </p>
                                    {errors.email && (
                                        <p className="text-xs text-destructive">{errors.email}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2 sm:w-1/2">
                                <Label htmlFor="status">
                                    Account Status <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={data.status}
                                    onValueChange={(val) => setData('status', val)}
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.status && (
                                    <p className="text-xs text-destructive">{errors.status}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Parental Registry Details */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">Parental Information</CardTitle>
                            </div>
                            <CardDescription>
                                Official parental records required for maternal and child health tracking.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {/* Mother's Info */}
                            <div className="rounded-lg border p-4 space-y-3 bg-muted/20">
                                <div className="space-y-2">
                                    <Label htmlFor="mother_maiden_name">
                                        Mother's Maiden Name {!data.mother_information_unavailable && <span className="text-destructive">*</span>}
                                    </Label>
                                    <Input
                                        id="mother_maiden_name"
                                        value={data.mother_maiden_name}
                                        onChange={(e) => setData('mother_maiden_name', e.target.value)}
                                        disabled={data.mother_information_unavailable}
                                        placeholder="Mother's full maiden name"
                                        required={!data.mother_information_unavailable}
                                    />
                                    {errors.mother_maiden_name && (
                                        <p className="text-xs text-destructive">{errors.mother_maiden_name}</p>
                                    )}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="mother_unavailable"
                                        checked={data.mother_information_unavailable}
                                        onCheckedChange={(checked) => {
                                            setData((prev) => ({
                                                ...prev,
                                                mother_information_unavailable: Boolean(checked),
                                                mother_maiden_name: checked ? '' : prev.mother_maiden_name,
                                            }));
                                        }}
                                    />
                                    <Label htmlFor="mother_unavailable" className="text-xs font-normal text-muted-foreground cursor-pointer">
                                        Mother's information is unknown or unavailable
                                    </Label>
                                </div>
                            </div>

                            {/* Father's Info */}
                            <div className="rounded-lg border p-4 space-y-3 bg-muted/20">
                                <div className="space-y-2">
                                    <Label htmlFor="father_name">
                                        Father's Full Name {!data.father_information_unavailable && <span className="text-destructive">*</span>}
                                    </Label>
                                    <Input
                                        id="father_name"
                                        value={data.father_name}
                                        onChange={(e) => setData('father_name', e.target.value)}
                                        disabled={data.father_information_unavailable}
                                        placeholder="Father's full name"
                                        required={!data.father_information_unavailable}
                                    />
                                    {errors.father_name && (
                                        <p className="text-xs text-destructive">{errors.father_name}</p>
                                    )}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="father_unavailable"
                                        checked={data.father_information_unavailable}
                                        onCheckedChange={(checked) => {
                                            setData((prev) => ({
                                                ...prev,
                                                father_information_unavailable: Boolean(checked),
                                                father_name: checked ? '' : prev.father_name,
                                            }));
                                        }}
                                    />
                                    <Label htmlFor="father_unavailable" className="text-xs font-normal text-muted-foreground cursor-pointer">
                                        Father's information is unknown or unavailable
                                    </Label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Form Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Button asChild variant="outline">
                            <Link href={`/guardians/${guardian.id}`}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving Changes...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

