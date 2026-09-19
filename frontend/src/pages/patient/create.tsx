import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Baby, ClipboardList, HeartPulse, Syringe, UserRound, Users } from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';

type Guardian = {
    id: number;
    guardian_no: string;
    name: string;
    email: string;
    contact_number: string | null;
    mother_maiden_name?: string | null;
    father_name?: string | null;
    status: string;
};

type PatientCreateProps = {
    guardian: Guardian;
};

export default function PatientCreate({ guardian }: PatientCreateProps) {
    const today = new Date().toISOString().split('T')[0];

    const { data, setData, post, processing, errors } = useForm({
        guardian_relationship: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        nickname: '',
        date_of_birth: '',
        sex: '',
        address: '',
        mother_name: guardian.mother_maiden_name || '',
        father_name: guardian.father_name || '',

        birth_type: '',
        is_full_term: '',
        multiple_birth: '',
        birth_attendant: '',
        blood_type: '',
        birth_weight: '',
        birth_length: '',
        head_circumference: '',
        chest_circumference: '',
        birth_order: '',
        birth_registration_date: '',
        birth_registration_place: '',
        birth_family_notes: '',

        medical_background: '',
        allergies: '',
        existing_conditions: '',

        bcg_received_at_birth: false,
        bcg_date_administered: '',
        hepb_received_at_birth: false,
        hepb_date_administered: '',
    });

    const breadcrumbs = [
        { title: 'Guardians', href: '/guardians' },
        { title: guardian.name || guardian.guardian_no, href: `/guardians/${guardian.id}` },
        { title: 'Add Child', href: `/guardians/${guardian.id}/patients/create` },
    ];

    function submit(e: React.FormEvent) {
        e.preventDefault();

        post(`/guardians/${guardian.id}/patients`, {
            preserveScroll: true,
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Add Child - ${guardian.name}`} />

            <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
                <div>
                    <Button
                        asChild
                        variant="ghost"
                        className="-ml-3 mb-2 text-muted-foreground hover:text-foreground"
                    >
                        <Link href={`/guardians/${guardian.id}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Family Details
                        </Link>
                    </Button>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Add Child</h1>
                        <Badge variant="secondary">Registered Family</Badge>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Add a complete pediatric patient record under this existing family.
                    </p>
                </div>

                <Card>
                    <CardHeader className="border-b">
                        <div className="flex items-start gap-3">
                            <div className="rounded-lg border p-2">
                                <UserRound className="h-5 w-5 text-primary" />
                            </div>

                            <div>
                                <CardTitle className="text-base">{guardian.name}</CardTitle>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Family ID: <span className="font-mono font-medium">{guardian.guardian_no}</span> · {guardian.email || 'No email'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Contact: {guardian.contact_number ?? 'No contact number provided'}
                                </p>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-4">
                        <p className="text-xs text-muted-foreground">
                            This patient will automatically be registered under this family account.
                        </p>
                    </CardContent>
                </Card>

                <form onSubmit={submit} className="space-y-6">
                    {/* Basic Patient Information */}
                    <Card>
                        <CardHeader className="border-b">
                            <div className="flex items-center gap-3">
                                <Baby className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">Basic Information</CardTitle>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-5 pt-6">
                            <div className="grid gap-4 md:grid-cols-4">
                                <Field label="First Name" required error={errors.first_name}>
                                    <Input
                                        value={data.first_name}
                                        onChange={(e) => setData('first_name', e.target.value)}
                                        placeholder="Given name"
                                        required
                                    />
                                </Field>
                                <Field label="Middle Name" error={errors.middle_name}>
                                    <Input
                                        value={data.middle_name}
                                        onChange={(e) => setData('middle_name', e.target.value)}
                                        placeholder="Middle name"
                                    />
                                </Field>
                                <Field label="Last Name" required error={errors.last_name}>
                                    <Input
                                        value={data.last_name}
                                        onChange={(e) => setData('last_name', e.target.value)}
                                        placeholder="Surname"
                                        required
                                    />
                                </Field>
                                <Field label="Nickname" error={errors.nickname}>
                                    <Input
                                        value={data.nickname}
                                        onChange={(e) => setData('nickname', e.target.value)}
                                        placeholder="e.g. Bunso"
                                    />
                                </Field>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <Field label="Date of Birth" required error={errors.date_of_birth}>
                                    <Input
                                        type="date"
                                        max={today}
                                        value={data.date_of_birth}
                                        onChange={(e) => setData('date_of_birth', e.target.value)}
                                        required
                                    />
                                </Field>

                                <Field label="Sex" required error={errors.sex}>
                                    <select
                                        className="h-10 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                        value={data.sex}
                                        onChange={(e) => setData('sex', e.target.value)}
                                        required
                                    >
                                        <option value="">Select sex</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </Field>

                                <Field label="Relationship to Guardian" required error={errors.guardian_relationship}>
                                    <select
                                        className="h-10 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                        value={data.guardian_relationship}
                                        onChange={(e) => setData('guardian_relationship', e.target.value)}
                                        required
                                    >
                                        <option value="">Select relationship</option>
                                        <option value="Child">Child (Son/Daughter)</option>
                                        <option value="Grandchild">Grandchild</option>
                                        <option value="Niece/Nephew">Niece/Nephew</option>
                                        <option value="Sibling">Sibling</option>
                                        <option value="Ward">Ward / Foster Child</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </Field>
                            </div>

                            <Field label="Home Address" required error={errors.address}>
                                <Input
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="Street, Purok/Sitio, Barangay Bugo, Cagayan de Oro City"
                                    required
                                />
                            </Field>
                        </CardContent>
                    </Card>

                    {/* Parental Records */}
                    <Card>
                        <CardHeader className="border-b">
                            <div className="flex items-center gap-3">
                                <Users className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">Parental Information</CardTitle>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-4 pt-6">
                            <p className="text-xs text-muted-foreground">
                                Pre-filled from family registry when available. Update if biological parents differ.
                            </p>
                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Mother's Maiden Name" error={errors.mother_name}>
                                    <Input
                                        value={data.mother_name}
                                        onChange={(e) => setData('mother_name', e.target.value)}
                                        placeholder="Mother's full maiden name"
                                    />
                                </Field>

                                <Field label="Father's Full Name" error={errors.father_name}>
                                    <Input
                                        value={data.father_name}
                                        onChange={(e) => setData('father_name', e.target.value)}
                                        placeholder="Father's full name"
                                    />
                                </Field>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Birth Information */}
                    <Card>
                        <CardHeader className="border-b">
                            <div className="flex items-center gap-3">
                                <ClipboardList className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">Birth Information</CardTitle>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-5 pt-6">
                            <div className="grid gap-4 md:grid-cols-3">
                                <SelectField
                                    label="Type of Delivery"
                                    value={data.birth_type}
                                    onChange={(v) => setData('birth_type', v)}
                                    options={['Normal', 'Cesarean', 'Assisted', 'Other']}
                                />
                                <SelectField
                                    label="Full Term"
                                    value={data.is_full_term}
                                    onChange={(v) => setData('is_full_term', v)}
                                    options={[['1', 'Yes'], ['0', 'No']]}
                                />
                                <SelectField
                                    label="Multiple Birth"
                                    value={data.multiple_birth}
                                    onChange={(v) => setData('multiple_birth', v)}
                                    options={['Single', 'Twin', 'Triplet', 'Other']}
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <Field label="Birth Attendant" error={errors.birth_attendant}>
                                    <Input
                                        value={data.birth_attendant}
                                        onChange={(e) => setData('birth_attendant', e.target.value)}
                                        placeholder="Doctor / Midwife / Nurse"
                                    />
                                </Field>

                                <SelectField
                                    label="Blood Type"
                                    value={data.blood_type}
                                    onChange={(v) => setData('blood_type', v)}
                                    options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']}
                                />

                                <Field label="Birth Order" error={errors.birth_order}>
                                    <Input
                                        type="number"
                                        min="1"
                                        max="50"
                                        value={data.birth_order}
                                        onChange={(e) => setData('birth_order', e.target.value)}
                                        placeholder="1"
                                    />
                                </Field>
                            </div>

                            <div className="grid gap-4 md:grid-cols-4">
                                <NumberField
                                    label="Birth Weight (kg)"
                                    min="0"
                                    max="20"
                                    value={data.birth_weight}
                                    error={errors.birth_weight}
                                    onChange={(v) => setData('birth_weight', v)}
                                />
                                <NumberField
                                    label="Body Length (cm)"
                                    min="0"
                                    max="200"
                                    value={data.birth_length}
                                    error={errors.birth_length}
                                    onChange={(v) => setData('birth_length', v)}
                                />
                                <NumberField
                                    label="Head Circumference (cm)"
                                    min="0"
                                    max="200"
                                    value={data.head_circumference}
                                    error={errors.head_circumference}
                                    onChange={(v) => setData('head_circumference', v)}
                                />
                                <NumberField
                                    label="Chest Circumference (cm)"
                                    min="0"
                                    max="200"
                                    value={data.chest_circumference}
                                    error={errors.chest_circumference}
                                    onChange={(v) => setData('chest_circumference', v)}
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Birth Registration Date" error={errors.birth_registration_date}>
                                    <Input
                                        type="date"
                                        max={today}
                                        value={data.birth_registration_date}
                                        onChange={(e) => setData('birth_registration_date', e.target.value)}
                                    />
                                </Field>

                                <Field label="Birth Registration Place" error={errors.birth_registration_place}>
                                    <Input
                                        value={data.birth_registration_place}
                                        onChange={(e) => setData('birth_registration_place', e.target.value)}
                                        placeholder="City / Municipality"
                                    />
                                </Field>
                            </div>

                            <Field label="Birth / Family Notes" error={errors.birth_family_notes}>
                                <textarea
                                    className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    value={data.birth_family_notes}
                                    onChange={(e) => setData('birth_family_notes', e.target.value)}
                                    placeholder="Additional birth details or family background observations..."
                                />
                            </Field>
                        </CardContent>
                    </Card>

                    {/* Medical Background */}
                    <Card>
                        <CardHeader className="border-b">
                            <div className="flex items-center gap-3">
                                <HeartPulse className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">Medical Information</CardTitle>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-5 pt-6">
                            <Field label="Medical Background" error={errors.medical_background}>
                                <textarea
                                    className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    value={data.medical_background}
                                    onChange={(e) => setData('medical_background', e.target.value)}
                                    placeholder="Past illnesses, hospitalizations, or newborn complications..."
                                />
                            </Field>

                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Allergies" error={errors.allergies}>
                                    <textarea
                                        className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                        value={data.allergies}
                                        onChange={(e) => setData('allergies', e.target.value)}
                                        placeholder="Known drug or food allergies..."
                                    />
                                </Field>

                                <Field label="Existing Medical Conditions" error={errors.existing_conditions}>
                                    <textarea
                                        className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                        value={data.existing_conditions}
                                        onChange={(e) => setData('existing_conditions', e.target.value)}
                                        placeholder="Chronic conditions or ongoing pediatric health issues..."
                                    />
                                </Field>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Birth Dose Vaccines (BCG & Hepatitis B) */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Syringe className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">Birth Dose Immunizations (Hospital / Birth Facility)</CardTitle>
                            </div>
                            <CardDescription>
                                Mark routine birth doses already administered (e.g. at the hospital or lying-in clinic). These will automatically be recorded on the child's immunization card upon creation.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                {/* BCG toggle */}
                                <div className="rounded-lg border p-4 space-y-3 bg-muted/20">
                                    <div className="flex items-start space-x-2.5">
                                        <Checkbox
                                            id="bcg_received"
                                            checked={data.bcg_received_at_birth}
                                            onCheckedChange={(checked) => {
                                                const isChecked = Boolean(checked);
                                                setData((prev) => ({
                                                    ...prev,
                                                    bcg_received_at_birth: isChecked,
                                                    bcg_date_administered: isChecked ? (prev.bcg_date_administered || prev.date_of_birth || today) : '',
                                                }));
                                            }}
                                        />
                                        <div className="grid gap-1 leading-none">
                                            <Label htmlFor="bcg_received" className="text-sm font-semibold cursor-pointer text-foreground">
                                                BCG Vaccine (At Birth)
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                Protects against childhood tuberculosis meningitis and disseminated disease.
                                            </p>
                                        </div>
                                    </div>

                                    {data.bcg_received_at_birth && (
                                        <div className="pt-1.5 space-y-1">
                                            <Label htmlFor="bcg_date" className="text-xs font-medium">
                                                Date Administered
                                            </Label>
                                            <Input
                                                id="bcg_date"
                                                type="date"
                                                className="h-9 text-xs bg-background"
                                                value={data.bcg_date_administered || data.date_of_birth || today}
                                                max={today}
                                                onChange={(e) => setData('bcg_date_administered', e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Hep B toggle */}
                                <div className="rounded-lg border p-4 space-y-3 bg-muted/20">
                                    <div className="flex items-start space-x-2.5">
                                        <Checkbox
                                            id="hepb_received"
                                            checked={data.hepb_received_at_birth}
                                            onCheckedChange={(checked) => {
                                                const isChecked = Boolean(checked);
                                                setData((prev) => ({
                                                    ...prev,
                                                    hepb_received_at_birth: isChecked,
                                                    hepb_date_administered: isChecked ? (prev.hepb_date_administered || prev.date_of_birth || today) : '',
                                                }));
                                            }}
                                        />
                                        <div className="grid gap-1 leading-none">
                                            <Label htmlFor="hepb_received" className="text-sm font-semibold cursor-pointer text-foreground">
                                                Hepatitis B (Birth Dose)
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                Given within 24 hours of birth to prevent perinatal HBV transmission.
                                            </p>
                                        </div>
                                    </div>

                                    {data.hepb_received_at_birth && (
                                        <div className="pt-1.5 space-y-1">
                                            <Label htmlFor="hepb_date" className="text-xs font-medium">
                                                Date Administered
                                            </Label>
                                            <Input
                                                id="hepb_date"
                                                type="date"
                                                className="h-9 text-xs bg-background"
                                                value={data.hepb_date_administered || data.date_of_birth || today}
                                                max={today}
                                                onChange={(e) => setData('hepb_date_administered', e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Form Actions */}
                    <div className="flex items-center justify-end gap-3 border-t pt-5">
                        <Button asChild variant="outline">
                            <Link href={`/guardians/${guardian.id}`}>Cancel</Link>
                        </Button>

                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creating Patient...' : 'Add Child'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

function Field({
    label,
    error,
    required = false,
    children,
}: {
    label: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-2">
            <Label>
                {label}
                {required && <span className="ml-1 text-destructive">*</span>}
            </Label>
            {children}
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}

function SelectField({
    label,
    value,
    onChange,
    options,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: Array<string | [string, string]>;
}) {
    return (
        <Field label={label}>
            <select
                className="h-10 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                <option value="">Not recorded</option>
                {options.map((option) => {
                    const tuple = Array.isArray(option) ? option : [option, option];
                    return (
                        <option key={tuple[0]} value={tuple[0]}>
                            {tuple[1]}
                        </option>
                    );
                })}
            </select>
        </Field>
    );
}

function NumberField({
    label,
    value,
    min = 0,
    max,
    step = '0.01',
    error,
    onChange,
}: {
    label: string;
    value: string;
    min?: number | string;
    max?: number | string;
    step?: string;
    error?: string;
    onChange: (value: string) => void;
}) {
    return (
        <Field label={label} error={error}>
            <Input
                type="number"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </Field>
    );
}
