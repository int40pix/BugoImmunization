import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Baby, ClipboardList, HeartPulse, UserRound } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';

type Guardian = {
    id: number;
    guardian_no: string;
    name: string;
    email: string;
    contact_number: string | null;
    status: string;
};

type PatientCreateProps = {
    guardian: Guardian;
};

export default function PatientCreate({ guardian }: PatientCreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        guardian_relationship: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        nickname: '',
        date_of_birth: '',
        sex: '',
        address: '',

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
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();

        post(`/guardians/${guardian.id}/patients`, {
            preserveScroll: true,
        });
    }

    return (
        <AppLayout>
            <Head title={`Add Child - ${guardian.name}`} />

            <div className="mx-auto max-w-6xl space-y-6 p-6">
                <div>
                    <Button
                        variant="ghost"
                        type="button"
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl font-bold">Add Child</h1>
                        <Badge variant="secondary">Registered Family</Badge>
                    </div>

                    <p className="mt-2 text-muted-foreground">
                        Add a complete pediatric patient record under this existing family.
                    </p>
                </div>

                <Card>
                    <CardHeader className="border-b">
                        <div className="flex items-start gap-3">
                            <div className="rounded-lg border p-2">
                                <UserRound className="h-5 w-5" />
                            </div>

                            <div>
                                <CardTitle>{guardian.name}</CardTitle>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {guardian.guardian_no} · {guardian.email}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {guardian.contact_number ?? 'No contact number provided'}
                                </p>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-5">
                        <p className="text-sm text-muted-foreground">
                            This family is already selected. The child will be linked automatically.
                        </p>
                    </CardContent>
                </Card>

                <form onSubmit={submit} className="space-y-5">
                    <Card>
                        <CardHeader className="border-b">
                            <div className="flex items-center gap-3">
                                <Baby className="h-5 w-5" />
                                <CardTitle>Basic Information</CardTitle>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-5 pt-6">
                            <div className="grid gap-4 md:grid-cols-4">
                                <Field label="First Name *" error={errors.first_name}>
                                    <Input value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} />
                                </Field>
                                <Field label="Middle Name" error={errors.middle_name}>
                                    <Input value={data.middle_name} onChange={(e) => setData('middle_name', e.target.value)} />
                                </Field>
                                <Field label="Last Name *" error={errors.last_name}>
                                    <Input value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} />
                                </Field>
                                <Field label="Nickname" error={errors.nickname}>
                                    <Input value={data.nickname} onChange={(e) => setData('nickname', e.target.value)} />
                                </Field>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <Field label="Date of Birth *" error={errors.date_of_birth}>
                                    <Input type="date" max={new Date().toISOString().split('T')[0]} value={data.date_of_birth} onChange={(e) => setData('date_of_birth', e.target.value)} />
                                </Field>

                                <Field label="Sex *" error={errors.sex}>
                                    <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={data.sex} onChange={(e) => setData('sex', e.target.value)}>
                                        <option value="">Select sex</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </Field>

                                <Field label="Relationship to Guardian *" error={errors.guardian_relationship}>
                                    <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={data.guardian_relationship} onChange={(e) => setData('guardian_relationship', e.target.value)}>
                                        <option value="">Select relationship</option>
                                        <option value="Mother">Mother</option>
                                        <option value="Father">Father</option>
                                        <option value="Grandmother">Grandmother</option>
                                        <option value="Grandfather">Grandfather</option>
                                        <option value="Aunt">Aunt</option>
                                        <option value="Uncle">Uncle</option>
                                        <option value="Sibling">Sibling</option>
                                        <option value="Legal Guardian">Legal Guardian</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </Field>
                            </div>

                            <Field label="Home Address *" error={errors.address}>
                                <Input value={data.address} onChange={(e) => setData('address', e.target.value)} />
                            </Field>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="border-b">
                            <div className="flex items-center gap-3">
                                <ClipboardList className="h-5 w-5" />
                                <CardTitle>Birth Information</CardTitle>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-5 pt-6">
                            <div className="grid gap-4 md:grid-cols-3">
                                <SelectField label="Type of Delivery" value={data.birth_type} onChange={(v) => setData('birth_type', v)} options={['Normal', 'Cesarean', 'Assisted', 'Other']} />
                                <SelectField label="Full Term" value={data.is_full_term} onChange={(v) => setData('is_full_term', v)} options={[['1', 'Yes'], ['0', 'No']]} />
                                <SelectField label="Multiple Birth" value={data.multiple_birth} onChange={(v) => setData('multiple_birth', v)} options={['Single', 'Twin', 'Triplet', 'Other']} />
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <Field label="Birth Attendant" error={errors.birth_attendant}>
                                    <Input value={data.birth_attendant} onChange={(e) => setData('birth_attendant', e.target.value)} />
                                </Field>

                                <SelectField label="Blood Type" value={data.blood_type} onChange={(v) => setData('blood_type', v)} options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']} />

                                <Field label="Birth Order" error={errors.birth_order}>
                                    <Input type="number" min="1" value={data.birth_order} onChange={(e) => setData('birth_order', e.target.value)} />
                                </Field>
                            </div>

                            <div className="grid gap-4 md:grid-cols-4">
                                <NumberField label="Birth Weight (kg)" value={data.birth_weight} onChange={(v) => setData('birth_weight', v)} />
                                <NumberField label="Body Length (cm)" value={data.birth_length} onChange={(v) => setData('birth_length', v)} />
                                <NumberField label="Head Circumference (cm)" value={data.head_circumference} onChange={(v) => setData('head_circumference', v)} />
                                <NumberField label="Chest Circumference (cm)" value={data.chest_circumference} onChange={(v) => setData('chest_circumference', v)} />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Birth Registration Date" error={errors.birth_registration_date}>
                                    <Input type="date" value={data.birth_registration_date} onChange={(e) => setData('birth_registration_date', e.target.value)} />
                                </Field>

                                <Field label="Birth Registration Place" error={errors.birth_registration_place}>
                                    <Input value={data.birth_registration_place} onChange={(e) => setData('birth_registration_place', e.target.value)} />
                                </Field>
                            </div>

                            <Field label="Birth / Family Notes" error={errors.birth_family_notes}>
                                <textarea className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm" value={data.birth_family_notes} onChange={(e) => setData('birth_family_notes', e.target.value)} />
                            </Field>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="border-b">
                            <div className="flex items-center gap-3">
                                <HeartPulse className="h-5 w-5" />
                                <CardTitle>Medical Information</CardTitle>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-5 pt-6">
                            <Field label="Medical Background" error={errors.medical_background}>
                                <textarea className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm" value={data.medical_background} onChange={(e) => setData('medical_background', e.target.value)} />
                            </Field>

                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Allergies" error={errors.allergies}>
                                    <textarea className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm" value={data.allergies} onChange={(e) => setData('allergies', e.target.value)} />
                                </Field>

                                <Field label="Existing Medical Conditions" error={errors.existing_conditions}>
                                    <textarea className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm" value={data.existing_conditions} onChange={(e) => setData('existing_conditions', e.target.value)} />
                                </Field>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-between border-t pt-5">
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>
                            Cancel
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
    children,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            {children}
            {error && <p className="text-sm text-destructive">{error}</p>}
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
            <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={value} onChange={(e) => onChange(e.target.value)}>
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
    onChange,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <Field label={label}>
            <Input type="number" min="0" step="0.01" value={value} onChange={(e) => onChange(e.target.value)} />
        </Field>
    );
}
