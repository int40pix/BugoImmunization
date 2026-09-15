import { Head, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Baby,
    ClipboardList,
    HeartPulse,
    Save,
    UsersRound,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
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

type Guardian = {
    id: number;
    guardian_no: string;
    name: string;
    email: string;
    contact_number: string | null;
    status?: string;
};

type Patient = {
    id: number;
    patient_id: string;
    guardian_id: number | null;

    first_name: string;
    middle_name: string | null;
    last_name: string;
    nickname: string | null;

    date_of_birth: string;
    sex: string;
    address: string;
    guardian_relationship: string | null;

    birth_type: string | null;
    is_full_term: boolean | null;
    multiple_birth: string | null;
    birth_attendant: string | null;
    blood_type: string | null;
    birth_weight: string | number | null;
    birth_length: string | number | null;
    head_circumference: string | number | null;
    chest_circumference: string | number | null;
    birth_order: string | number | null;
    birth_registration_date: string | null;
    birth_registration_place: string | null;
    birth_family_notes: string | null;

    medical_background: string | null;
    allergies: string | null;
    existing_conditions: string | null;

    guardian?: Guardian | null;

    guardian_name?: string | null;
    guardian_contact?: string | null;
};

type PatientEditProps = {
    patient: Patient;
};

function normalizeDate(value: string | null | undefined) {
    return value ? value.split('T')[0] : '';
}

function toStringValue(
    value: string | number | null | undefined,
) {
    if (value === null || value === undefined) {
        return '';
    }

    return String(value);
}

export default function PatientEdit({
    patient,
}: PatientEditProps) {
    const guardian = patient.guardian;

    const {
        data,
        setData,
        put,
        processing,
        errors,
    } = useForm({
        guardian_relationship:
            patient.guardian_relationship ?? '',

        first_name: patient.first_name ?? '',
        middle_name: patient.middle_name ?? '',
        last_name: patient.last_name ?? '',
        nickname: patient.nickname ?? '',
        date_of_birth: normalizeDate(
            patient.date_of_birth,
        ),
        sex: patient.sex ?? '',
        address: patient.address ?? '',

        birth_type: patient.birth_type ?? '',
        is_full_term:
            patient.is_full_term === null ||
            patient.is_full_term === undefined
                ? ''
                : patient.is_full_term
                  ? '1'
                  : '0',
        multiple_birth:
            patient.multiple_birth ?? '',
        birth_attendant:
            patient.birth_attendant ?? '',
        blood_type: patient.blood_type ?? '',
        birth_weight: toStringValue(
            patient.birth_weight,
        ),
        birth_length: toStringValue(
            patient.birth_length,
        ),
        head_circumference: toStringValue(
            patient.head_circumference,
        ),
        chest_circumference: toStringValue(
            patient.chest_circumference,
        ),
        birth_order: toStringValue(
            patient.birth_order,
        ),
        birth_registration_date: normalizeDate(
            patient.birth_registration_date,
        ),
        birth_registration_place:
            patient.birth_registration_place ?? '',
        birth_family_notes:
            patient.birth_family_notes ?? '',

        medical_background:
            patient.medical_background ?? '',
        allergies: patient.allergies ?? '',
        existing_conditions:
            patient.existing_conditions ?? '',
    });

    function submit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        put(`/patients/${patient.id}`, {
            preserveScroll: true,
        });
    }

    return (
        <AppLayout>
            <Head
                title={`Edit ${patient.first_name} ${patient.last_name}`}
            />

            <div className="mx-auto max-w-6xl space-y-6 p-6">
                <div>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() =>
                            window.history.back()
                        }
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Patient Profile
                    </Button>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl font-bold">
                            Edit Patient Information
                        </h1>

                        <Badge variant="secondary">
                            {patient.patient_id}
                        </Badge>
                    </div>

                    <p className="mt-2 text-muted-foreground">
                        Update the child's clinical and
                        demographic information. Family account
                        information is managed separately from
                        the Registered Family page.
                    </p>
                </div>

                <form
                    onSubmit={submit}
                    className="space-y-5"
                >
                    <Card>
                        <CardHeader className="border-b">
                            <div className="flex items-start gap-3">
                                <UsersRound className="mt-0.5 h-5 w-5" />

                                <div>
                                    <CardTitle>
                                        Registered Family
                                    </CardTitle>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        This patient's family
                                        association is shown for
                                        reference and is not changed
                                        from this form.
                                    </p>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="pt-6">
                            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                                <ReadOnlyItem
                                    label="Family ID"
                                    value={
                                        guardian?.guardian_no ??
                                        'Not available'
                                    }
                                />

                                <ReadOnlyItem
                                    label="Guardian"
                                    value={
                                        guardian?.name ??
                                        patient.guardian_name ??
                                        'Not available'
                                    }
                                />

                                <ReadOnlyItem
                                    label="Contact Number"
                                    value={
                                        guardian?.contact_number ??
                                        patient.guardian_contact ??
                                        'Not provided'
                                    }
                                />

                                <ReadOnlyItem
                                    label="Guardian Email"
                                    value={
                                        guardian?.email ??
                                        'Not available'
                                    }
                                />
                            </div>

                            <div className="mt-5 max-w-md">
                                <Field
                                    label="Relationship to Guardian *"
                                    error={
                                        errors.guardian_relationship
                                    }
                                >
                                    <RelationshipSelect
                                        value={
                                            data.guardian_relationship
                                        }
                                        onChange={(value) =>
                                            setData(
                                                'guardian_relationship',
                                                value,
                                            )
                                        }
                                    />
                                </Field>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="border-b">
                            <div className="flex items-start gap-3">
                                <Baby className="mt-0.5 h-5 w-5" />

                                <div>
                                    <CardTitle>
                                        Basic Information
                                    </CardTitle>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Patient identity and home
                                        information.
                                    </p>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-5 pt-6">
                            <div className="grid gap-4 md:grid-cols-4">
                                <Field
                                    label="First Name *"
                                    error={errors.first_name}
                                >
                                    <Input
                                        value={data.first_name}
                                        onChange={(event) =>
                                            setData(
                                                'first_name',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Field>

                                <Field
                                    label="Middle Name"
                                    error={errors.middle_name}
                                >
                                    <Input
                                        value={data.middle_name}
                                        onChange={(event) =>
                                            setData(
                                                'middle_name',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Field>

                                <Field
                                    label="Last Name *"
                                    error={errors.last_name}
                                >
                                    <Input
                                        value={data.last_name}
                                        onChange={(event) =>
                                            setData(
                                                'last_name',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Field>

                                <Field
                                    label="Nickname"
                                    error={errors.nickname}
                                >
                                    <Input
                                        value={data.nickname}
                                        onChange={(event) =>
                                            setData(
                                                'nickname',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Field>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <Field
                                    label="Date of Birth *"
                                    error={
                                        errors.date_of_birth
                                    }
                                >
                                    <Input
                                        type="date"
                                        max={
                                            new Date()
                                                .toISOString()
                                                .split('T')[0]
                                        }
                                        value={
                                            data.date_of_birth
                                        }
                                        onChange={(event) =>
                                            setData(
                                                'date_of_birth',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Field>

                                <Field
                                    label="Sex *"
                                    error={errors.sex}
                                >
                                    <select
                                        className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                                        value={data.sex}
                                        onChange={(event) =>
                                            setData(
                                                'sex',
                                                event.target.value,
                                            )
                                        }
                                    >
                                        <option value="">
                                            Select sex
                                        </option>
                                        <option value="Male">
                                            Male
                                        </option>
                                        <option value="Female">
                                            Female
                                        </option>
                                    </select>
                                </Field>
                            </div>

                            <Field
                                label="Home Address *"
                                error={errors.address}
                            >
                                <Input
                                    value={data.address}
                                    onChange={(event) =>
                                        setData(
                                            'address',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="border-b">
                            <div className="flex items-start gap-3">
                                <ClipboardList className="mt-0.5 h-5 w-5" />

                                <div>
                                    <CardTitle>
                                        Birth Information
                                    </CardTitle>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Update available information
                                        from the child's birth record.
                                    </p>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-5 pt-6">
                            <div className="grid gap-4 md:grid-cols-3">
                                <Field
                                    label="Type of Delivery"
                                    error={errors.birth_type}
                                >
                                    <select
                                        className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                                        value={data.birth_type}
                                        onChange={(event) =>
                                            setData(
                                                'birth_type',
                                                event.target.value,
                                            )
                                        }
                                    >
                                        <option value="">
                                            Not recorded
                                        </option>
                                        <option value="Normal">
                                            Normal / Vaginal
                                        </option>
                                        <option value="Cesarean">
                                            Cesarean
                                        </option>
                                        <option value="Assisted">
                                            Assisted
                                        </option>
                                        <option value="Other">
                                            Other
                                        </option>
                                    </select>
                                </Field>

                                <Field
                                    label="Full Term"
                                    error={errors.is_full_term}
                                >
                                    <select
                                        className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                                        value={data.is_full_term}
                                        onChange={(event) =>
                                            setData(
                                                'is_full_term',
                                                event.target.value,
                                            )
                                        }
                                    >
                                        <option value="">
                                            Unknown
                                        </option>
                                        <option value="1">
                                            Yes
                                        </option>
                                        <option value="0">
                                            No
                                        </option>
                                    </select>
                                </Field>

                                <Field
                                    label="Multiple Birth"
                                    error={
                                        errors.multiple_birth
                                    }
                                >
                                    <select
                                        className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                                        value={
                                            data.multiple_birth
                                        }
                                        onChange={(event) =>
                                            setData(
                                                'multiple_birth',
                                                event.target.value,
                                            )
                                        }
                                    >
                                        <option value="">
                                            Not recorded
                                        </option>
                                        <option value="Single">
                                            Single birth
                                        </option>
                                        <option value="Twin">
                                            Twin
                                        </option>
                                        <option value="Triplet">
                                            Triplet
                                        </option>
                                        <option value="Other">
                                            Other
                                        </option>
                                    </select>
                                </Field>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <Field
                                    label="Birth Attendant"
                                    error={
                                        errors.birth_attendant
                                    }
                                >
                                    <Input
                                        value={
                                            data.birth_attendant
                                        }
                                        onChange={(event) =>
                                            setData(
                                                'birth_attendant',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Field>

                                <Field
                                    label="Blood Type"
                                    error={errors.blood_type}
                                >
                                    <BloodTypeSelect
                                        value={data.blood_type}
                                        onChange={(value) =>
                                            setData(
                                                'blood_type',
                                                value,
                                            )
                                        }
                                    />
                                </Field>

                                <Field
                                    label="Birth Order"
                                    error={errors.birth_order}
                                >
                                    <Input
                                        type="number"
                                        min="1"
                                        value={data.birth_order}
                                        onChange={(event) =>
                                            setData(
                                                'birth_order',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Field>
                            </div>

                            <div className="grid gap-4 md:grid-cols-4">
                                <MetricField
                                    label="Birth Weight"
                                    unit="kg"
                                    value={
                                        data.birth_weight
                                    }
                                    error={
                                        errors.birth_weight
                                    }
                                    onChange={(value) =>
                                        setData(
                                            'birth_weight',
                                            value,
                                        )
                                    }
                                />

                                <MetricField
                                    label="Body Length"
                                    unit="cm"
                                    value={
                                        data.birth_length
                                    }
                                    error={
                                        errors.birth_length
                                    }
                                    onChange={(value) =>
                                        setData(
                                            'birth_length',
                                            value,
                                        )
                                    }
                                />

                                <MetricField
                                    label="Head Circumference"
                                    unit="cm"
                                    value={
                                        data.head_circumference
                                    }
                                    error={
                                        errors.head_circumference
                                    }
                                    onChange={(value) =>
                                        setData(
                                            'head_circumference',
                                            value,
                                        )
                                    }
                                />

                                <MetricField
                                    label="Chest Circumference"
                                    unit="cm"
                                    value={
                                        data.chest_circumference
                                    }
                                    error={
                                        errors.chest_circumference
                                    }
                                    onChange={(value) =>
                                        setData(
                                            'chest_circumference',
                                            value,
                                        )
                                    }
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <Field
                                    label="Birth Registration Date"
                                    error={
                                        errors.birth_registration_date
                                    }
                                >
                                    <Input
                                        type="date"
                                        value={
                                            data.birth_registration_date
                                        }
                                        onChange={(event) =>
                                            setData(
                                                'birth_registration_date',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Field>

                                <Field
                                    label="Birth Registration Place"
                                    error={
                                        errors.birth_registration_place
                                    }
                                >
                                    <Input
                                        value={
                                            data.birth_registration_place
                                        }
                                        onChange={(event) =>
                                            setData(
                                                'birth_registration_place',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Field>
                            </div>

                            <Field
                                label="Birth / Family Notes"
                                error={
                                    errors.birth_family_notes
                                }
                            >
                                <textarea
                                    className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
                                    value={
                                        data.birth_family_notes
                                    }
                                    onChange={(event) =>
                                        setData(
                                            'birth_family_notes',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="border-b">
                            <div className="flex items-start gap-3">
                                <HeartPulse className="mt-0.5 h-5 w-5" />

                                <div>
                                    <CardTitle>
                                        Medical Information
                                    </CardTitle>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Maintain health information
                                        relevant to pediatric
                                        immunization care.
                                    </p>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-5 pt-6">
                            <Field
                                label="Medical Background"
                                error={
                                    errors.medical_background
                                }
                            >
                                <textarea
                                    className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
                                    value={
                                        data.medical_background
                                    }
                                    onChange={(event) =>
                                        setData(
                                            'medical_background',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>

                            <div className="grid gap-4 md:grid-cols-2">
                                <Field
                                    label="Allergies"
                                    error={errors.allergies}
                                >
                                    <textarea
                                        className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
                                        value={data.allergies}
                                        onChange={(event) =>
                                            setData(
                                                'allergies',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Field>

                                <Field
                                    label="Existing Medical Conditions"
                                    error={
                                        errors.existing_conditions
                                    }
                                >
                                    <textarea
                                        className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
                                        value={
                                            data.existing_conditions
                                        }
                                        onChange={(event) =>
                                            setData(
                                                'existing_conditions',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Field>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                window.history.back()
                            }
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={processing}
                        >
                            <Save className="mr-2 h-4 w-4" />
                            {processing
                                ? 'Saving...'
                                : 'Save Patient Information'}
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
            {error && (
                <p className="text-sm text-destructive">
                    {error}
                </p>
            )}
        </div>
    );
}

function ReadOnlyItem({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
            </p>

            <p className="mt-1 text-sm font-medium">
                {value}
            </p>
        </div>
    );
}

function RelationshipSelect({
    value,
    onChange,
}: {
    value: string;
    onChange: (value: string) => void;
}) {
    const relationships = [
        'Mother',
        'Father',
        'Grandmother',
        'Grandfather',
        'Aunt',
        'Uncle',
        'Sibling',
        'Legal Guardian',
        'Other',
    ];

    return (
        <select
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            value={value}
            onChange={(event) =>
                onChange(event.target.value)
            }
        >
            <option value="">
                Select relationship
            </option>

            {relationships.map((relationship) => (
                <option
                    key={relationship}
                    value={relationship}
                >
                    {relationship}
                </option>
            ))}
        </select>
    );
}

function BloodTypeSelect({
    value,
    onChange,
}: {
    value: string;
    onChange: (value: string) => void;
}) {
    const bloodTypes = [
        'A+',
        'A-',
        'B+',
        'B-',
        'AB+',
        'AB-',
        'O+',
        'O-',
    ];

    return (
        <select
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            value={value}
            onChange={(event) =>
                onChange(event.target.value)
            }
        >
            <option value="">
                Unknown / not recorded
            </option>

            {bloodTypes.map((bloodType) => (
                <option
                    key={bloodType}
                    value={bloodType}
                >
                    {bloodType}
                </option>
            ))}
        </select>
    );
}

function MetricField({
    label,
    unit,
    value,
    error,
    onChange,
}: {
    label: string;
    unit: string;
    value: string;
    error?: string;
    onChange: (value: string) => void;
}) {
    return (
        <Field
            label={`${label} (${unit})`}
            error={error}
        >
            <Input
                type="number"
                min="0"
                step="0.01"
                value={value}
                onChange={(event) =>
                    onChange(event.target.value)
                }
            />
        </Field>
    );
}
