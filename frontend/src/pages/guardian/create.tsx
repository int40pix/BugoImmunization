import { Head, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Baby,
    Check,
    HeartPulse,
    KeyRound,
    UserRound,
    UsersRound,
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

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

type PortalAccess = 'none' | 'active';
type GuardianGender = '' | 'Male' | 'Female';

type ChildForm = {
    first_name: string;
    middle_name: string;
    last_name: string;
    nickname: string;
    date_of_birth: string;
    sex: string;
    guardian_relationship: string;
    address: string;
    birth_type: string;
    is_full_term: boolean | null;
    multiple_birth: string;
    birth_attendant: string;
    blood_type: string;
    birth_weight: string;
    birth_length: string;
    head_circumference: string;
    chest_circumference: string;
    birth_order: string;
    birth_registration_date: string;
    birth_registration_place: string;
    birth_family_notes: string;
    medical_background: string;
    allergies: string;
    existing_conditions: string;
};

type FamilyForm = {
    name: string;
    gender: GuardianGender;
    email: string;
    password: string;
    password_confirmation: string;
    contact_number: string;
    portal_access: PortalAccess;
    mother_maiden_name: string;
    father_name: string;
    mother_information_unavailable: boolean;
    father_information_unavailable: boolean;
    children: ChildForm[];
};

const emptyChild = (): ChildForm => ({
    first_name: '',
    middle_name: '',
    last_name: '',
    nickname: '',
    date_of_birth: '',
    sex: '',
    guardian_relationship: '',
    address: '',
    birth_type: '',
    is_full_term: null,
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

const femaleRelationships = [
    'Mother',
    'Grandmother',
    'Aunt',
    'Sister',
    'Female Legal Guardian',
    'Other',
];

const maleRelationships = [
    'Father',
    'Grandfather',
    'Uncle',
    'Brother',
    'Male Legal Guardian',
    'Other',
];

export default function GuardianCreate() {
    const [step, setStep] = useState(1);

    const {
        data,
        setData,
        post,
        processing,
        errors,
    } = useForm<FamilyForm>({
        name: '',
        gender: '',
        email: '',
        password: '',
        password_confirmation: '',
        contact_number: '',
        portal_access: 'active',
        mother_maiden_name: '',
        father_name: '',
        mother_information_unavailable: false,
        father_information_unavailable: false,
        children: [emptyChild()],
    });

    const child = data.children[0];

    const errorBag = errors as Record<string, string | undefined>;

    const relationshipOptions = useMemo(() => {
        if (data.gender === 'Female') {
            return femaleRelationships;
        }

        if (data.gender === 'Male') {
            return maleRelationships;
        }

        return [];
    }, [data.gender]);

    const setGuardianGender = (gender: GuardianGender) => {
        setData('gender', gender);

        setData('children', [
            {
                ...child,
                guardian_relationship: '',
            },
        ]);
    };

    const setChild = <K extends keyof ChildForm>(
        key: K,
        value: ChildForm[K],
    ) => {
        setData('children', [
            {
                ...child,
                [key]: value,
            },
        ]);
    };

    const guardianValid =
        data.name.trim() !== '' &&
        data.gender !== '' &&
        (
            data.portal_access === 'none' ||
            (
                data.email.trim() !== '' &&
                data.password.length >= 8 &&
                data.password_confirmation !== '' &&
                data.password === data.password_confirmation
            )
        );

    const parentValid =
        (
            data.mother_information_unavailable ||
            data.mother_maiden_name.trim() !== ''
        ) &&
        (
            data.father_information_unavailable ||
            data.father_name.trim() !== ''
        );

    const childValid =
        child.first_name.trim() !== '' &&
        child.last_name.trim() !== '' &&
        child.date_of_birth !== '' &&
        child.sex !== '' &&
        child.guardian_relationship !== '' &&
        child.address.trim() !== '';

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post('/guardians', {
            preserveScroll: true,
        });
    };

    const steps = [
        ['Guardian Account', UserRound],
        ['Parent Information', UsersRound],
        ['Child Information', Baby],
        ['Review', Check],
    ] as const;

    return (
        <AppLayout>
            <Head title="Register Family" />

            <div className="mx-auto max-w-6xl space-y-6 p-6">
                <div>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>

                    <div className="mt-4 flex items-center gap-2">
                        <h1 className="text-2xl font-bold">
                            Register Family
                        </h1>

                        <Badge variant="secondary">
                            Patient Management
                        </Badge>
                    </div>

                    <p className="mt-2 text-muted-foreground">
                        Register a guardian and the first pediatric patient record.
                        Portal access may be activated now or later.
                    </p>
                </div>

                <div className="grid gap-3 lg:grid-cols-4">
                    {steps.map(([title, Icon], index) => {
                        const number = index + 1;

                        return (
                            <div
                                key={title}
                                className={`rounded-xl border p-4 ${
                                    step === number
                                        ? 'border-primary bg-primary/5'
                                        : step > number
                                          ? 'bg-muted/40'
                                          : ''
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full border">
                                        {step > number ? (
                                            <Check className="h-4 w-4" />
                                        ) : (
                                            <Icon className="h-4 w-4" />
                                        )}
                                    </div>

                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Step {number}
                                        </p>

                                        <p className="font-semibold">
                                            {title}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <form onSubmit={submit}>
                    {step === 1 && (
                        <Card>
                            <CardHeader className="border-b">
                                <CardTitle>
                                    Guardian Account
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-6 pt-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <Field
                                        label="Account Holder Name *"
                                        error={errors.name}
                                    >
                                        <Input
                                            value={data.name}
                                            onChange={(event) =>
                                                setData(
                                                    'name',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </Field>

                                    <Field
                                        label="Contact Number"
                                        error={errors.contact_number}
                                    >
                                        <Input
                                            value={data.contact_number}
                                            onChange={(event) =>
                                                setData(
                                                    'contact_number',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </Field>
                                </div>

                                <div className="grid gap-5 md:grid-cols-2">
                                <div className="grid gap-2">
                                        <Label htmlFor="gender">
                                            Guardian Gender *
                                        </Label>
    
                                        <select
                                            id="gender"
                                            value={data.gender}
                                            onChange={(event) =>
                                                setGuardianGender(
                                                    event.target
                                                        .value as GuardianGender,
                                                )
                                            }
                                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        >
                                            <option value="">
                                                Select guardian gender
                                            </option>
    
                                            <option value="Female">
                                                Female
                                            </option>
    
                                            <option value="Male">
                                                Male
                                            </option>
                                        </select>
    
                                        {errorBag.gender && (
                                            <p className="text-sm text-destructive">
                                                {errorBag.gender}
                                            </p>
                                        )}
                                    </div>
    
                                    <div className="grid gap-2">
                                        <Label htmlFor="portal_access">
                                            Portal Access *
                                        </Label>
    
                                        <select
                                            id="portal_access"
                                            value={data.portal_access}
                                            onChange={(event) => {
                                                const value =
                                                    event.target.value as PortalAccess;
    
                                                setData(
                                                    'portal_access',
                                                    value,
                                                );
    
                                                if (value === 'none') {
                                                    setData('email', '');
                                                    setData('password', '');
                                                    setData(
                                                        'password_confirmation',
                                                        '',
                                                    );
                                                }
                                            }}
                                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        >
                                            <option value="active">
                                                Activate portal access now
                                            </option>
    
                                            <option value="none">
                                                No online access for now
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                {data.portal_access === 'active' && (
                                    <div className="rounded-xl border bg-muted/20 p-5">
                                        <div className="mb-4 flex items-start gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-background">
                                                <KeyRound className="h-5 w-5" />
                                            </div>

                                            <div>
                                                <p className="font-semibold">
                                                    Login Information
                                                </p>

                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    Enter the guardian's email and
                                                    permanent portal password.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid gap-5 lg:grid-cols-3">
                                            <Field
                                                label="Email Address *"
                                                error={errors.email}
                                            >
                                                <Input
                                                    type="email"
                                                    value={data.email}
                                                    autoComplete="email"
                                                    placeholder="guardian@example.com"
                                                    onChange={(event) =>
                                                        setData(
                                                            'email',
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            </Field>

                                            <Field
                                                label="Password *"
                                                error={errorBag.password}
                                            >
                                                <Input
                                                    type="password"
                                                    value={data.password}
                                                    autoComplete="new-password"
                                                    placeholder="Minimum 8 characters"
                                                    onChange={(event) =>
                                                        setData(
                                                            'password',
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            </Field>

                                            <Field
                                                label="Confirm Password *"
                                                error={
                                                    errorBag.password_confirmation
                                                }
                                            >
                                                <Input
                                                    type="password"
                                                    value={
                                                        data.password_confirmation
                                                    }
                                                    autoComplete="new-password"
                                                    placeholder="Re-enter password"
                                                    onChange={(event) =>
                                                        setData(
                                                            'password_confirmation',
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            </Field>
                                        </div>
                                    </div>
                                )}

                                {data.portal_access === 'none' && (
                                    <div className="rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
                                        No email or password is required.
                                        The guardian and patient records will
                                        still be available to authorized staff.
                                    </div>
                                )}

                                <Nav
                                    nextDisabled={!guardianValid}
                                    onNext={() => setStep(2)}
                                />
                            </CardContent>
                        </Card>
                    )}

                    {step === 2 && (
                        <Card>
                            <CardHeader className="border-b">
                                <CardTitle>
                                    Parent Information
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-6 pt-6">
                                <div className="grid gap-5 md:grid-cols-2">
                                    <div className="space-y-3 rounded-xl border p-4">
                                        <Field
                                            label="Mother's Maiden Name"
                                            error={errors.mother_maiden_name}
                                        >
                                            <Input
                                                disabled={
                                                    data.mother_information_unavailable
                                                }
                                                value={data.mother_maiden_name}
                                                onChange={(event) =>
                                                    setData(
                                                        'mother_maiden_name',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>

                                        <label className="flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    data.mother_information_unavailable
                                                }
                                                onChange={(event) => {
                                                    setData(
                                                        'mother_information_unavailable',
                                                        event.target.checked,
                                                    );

                                                    if (event.target.checked) {
                                                        setData(
                                                            'mother_maiden_name',
                                                            '',
                                                        );
                                                    }
                                                }}
                                            />

                                            Information unavailable
                                        </label>
                                    </div>

                                    <div className="space-y-3 rounded-xl border p-4">
                                        <Field
                                            label="Father's Name"
                                            error={errors.father_name}
                                        >
                                            <Input
                                                disabled={
                                                    data.father_information_unavailable
                                                }
                                                value={data.father_name}
                                                onChange={(event) =>
                                                    setData(
                                                        'father_name',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>

                                        <label className="flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    data.father_information_unavailable
                                                }
                                                onChange={(event) => {
                                                    setData(
                                                        'father_information_unavailable',
                                                        event.target.checked,
                                                    );

                                                    if (event.target.checked) {
                                                        setData(
                                                            'father_name',
                                                            '',
                                                        );
                                                    }
                                                }}
                                            />

                                            Information unavailable
                                        </label>
                                    </div>
                                </div>

                                <Nav
                                    back
                                    nextDisabled={!parentValid}
                                    onBack={() => setStep(1)}
                                    onNext={() => setStep(3)}
                                />
                            </CardContent>
                        </Card>
                    )}

                    {step === 3 && (
                        <Card>
                            <CardHeader className="border-b">
                                <CardTitle>
                                    Child Information
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-6 pt-6">
                                <SectionTitle
                                    icon={Baby}
                                    title="Basic Information"
                                />

                                <div className="grid gap-4 md:grid-cols-3">
                                    <Field
                                        label="First Name *"
                                        error={
                                            errorBag[
                                                'children.0.first_name'
                                            ]
                                        }
                                    >
                                        <Input
                                            value={child.first_name}
                                            onChange={(event) =>
                                                setChild(
                                                    'first_name',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </Field>

                                    <Field
                                        label="Middle Name"
                                        error={
                                            errorBag[
                                                'children.0.middle_name'
                                            ]
                                        }
                                    >
                                        <Input
                                            value={child.middle_name}
                                            onChange={(event) =>
                                                setChild(
                                                    'middle_name',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </Field>

                                    <Field
                                        label="Last Name *"
                                        error={
                                            errorBag[
                                                'children.0.last_name'
                                            ]
                                        }
                                    >
                                        <Input
                                            value={child.last_name}
                                            onChange={(event) =>
                                                setChild(
                                                    'last_name',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </Field>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <Field
                                        label="Nickname"
                                        error={
                                            errorBag[
                                                'children.0.nickname'
                                            ]
                                        }
                                    >
                                        <Input
                                            value={child.nickname}
                                            onChange={(event) =>
                                                setChild(
                                                    'nickname',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </Field>

                                    <Field
                                        label="Date of Birth *"
                                        error={
                                            errorBag[
                                                'children.0.date_of_birth'
                                            ]
                                        }
                                    >
                                        <Input
                                            type="date"
                                            value={child.date_of_birth}
                                            onChange={(event) =>
                                                setChild(
                                                    'date_of_birth',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </Field>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <Field
                                        label="Sex *"
                                        error={
                                            errorBag[
                                                'children.0.sex'
                                            ]
                                        }
                                    >
                                        <select
                                            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                                            value={child.sex}
                                            onChange={(event) =>
                                                setChild(
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

                                    <Field
                                        label="Relationship to Guardian *"
                                        error={
                                            errorBag[
                                                'children.0.guardian_relationship'
                                            ]
                                        }
                                    >
                                        <select
                                            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                                            value={
                                                child.guardian_relationship
                                            }
                                            onChange={(event) =>
                                                setChild(
                                                    'guardian_relationship',
                                                    event.target.value,
                                                )
                                            }
                                        >
                                            <option value="">
                                                Select relationship
                                            </option>

                                            {relationshipOptions.map(
                                                (relationship) => (
                                                    <option
                                                        key={relationship}
                                                        value={relationship}
                                                    >
                                                        {relationship}
                                                    </option>
                                                ),
                                            )}
                                        </select>

                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Showing relationships for a{' '}
                                            {data.gender.toLowerCase()} guardian.
                                        </p>
                                    </Field>
                                </div>

                                <Field
                                    label="Address *"
                                    error={
                                        errorBag[
                                            'children.0.address'
                                        ]
                                    }
                                >
                                    <textarea
                                        className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
                                        value={child.address}
                                        onChange={(event) =>
                                            setChild(
                                                'address',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Field>

                                <div className="border-t" />

                                <SectionTitle
                                    icon={HeartPulse}
                                    title="Birth Information"
                                />

                                <div className="grid gap-4 md:grid-cols-3">
                                    <Field label="Birth Type">
                                        <select
                                            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                                            value={child.birth_type}
                                            onChange={(event) =>
                                                setChild(
                                                    'birth_type',
                                                    event.target.value,
                                                )
                                            }
                                        >
                                            <option value="">
                                                Not recorded
                                            </option>

                                            <option value="Normal">
                                                Normal
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

                                    <Field label="Full Term">
                                        <select
                                            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                                            value={
                                                child.is_full_term === null
                                                    ? ''
                                                    : child.is_full_term
                                                      ? 'yes'
                                                      : 'no'
                                            }
                                            onChange={(event) =>
                                                setChild(
                                                    'is_full_term',
                                                    event.target.value === ''
                                                        ? null
                                                        : event.target.value ===
                                                          'yes',
                                                )
                                            }
                                        >
                                            <option value="">
                                                Not recorded
                                            </option>

                                            <option value="yes">
                                                Yes
                                            </option>

                                            <option value="no">
                                                No
                                            </option>
                                        </select>
                                    </Field>

                                    <Field label="Multiple Birth">
                                        <select
                                            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                                            value={child.multiple_birth}
                                            onChange={(event) =>
                                                setChild(
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
                                    <Field label="Birth Attendant">
                                        <Input
                                            value={child.birth_attendant}
                                            onChange={(event) =>
                                                setChild(
                                                    'birth_attendant',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </Field>

                                    <Field label="Blood Type">
                                        <select
                                            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                                            value={child.blood_type}
                                            onChange={(event) =>
                                                setChild(
                                                    'blood_type',
                                                    event.target.value,
                                                )
                                            }
                                        >
                                            <option value="">
                                                Unknown / not recorded
                                            </option>

                                            {[
                                                'A+',
                                                'A-',
                                                'B+',
                                                'B-',
                                                'AB+',
                                                'AB-',
                                                'O+',
                                                'O-',
                                            ].map((value) => (
                                                <option
                                                    key={value}
                                                    value={value}
                                                >
                                                    {value}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>

                                    <Field label="Birth Order">
                                        <Input
                                            type="number"
                                            min="1"
                                            value={child.birth_order}
                                            onChange={(event) =>
                                                setChild(
                                                    'birth_order',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </Field>
                                </div>

                                <div className="grid gap-4 md:grid-cols-4">
                                    <Metric
                                        label="Birth Weight"
                                        unit="kg"
                                        value={child.birth_weight}
                                        onChange={(value) =>
                                            setChild(
                                                'birth_weight',
                                                value,
                                            )
                                        }
                                    />

                                    <Metric
                                        label="Body Length"
                                        unit="cm"
                                        value={child.birth_length}
                                        onChange={(value) =>
                                            setChild(
                                                'birth_length',
                                                value,
                                            )
                                        }
                                    />

                                    <Metric
                                        label="Head Circumference"
                                        unit="cm"
                                        value={
                                            child.head_circumference
                                        }
                                        onChange={(value) =>
                                            setChild(
                                                'head_circumference',
                                                value,
                                            )
                                        }
                                    />

                                    <Metric
                                        label="Chest Circumference"
                                        unit="cm"
                                        value={
                                            child.chest_circumference
                                        }
                                        onChange={(value) =>
                                            setChild(
                                                'chest_circumference',
                                                value,
                                            )
                                        }
                                    />
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <Field label="Birth Registration Date">
                                        <Input
                                            type="date"
                                            value={
                                                child.birth_registration_date
                                            }
                                            onChange={(event) =>
                                                setChild(
                                                    'birth_registration_date',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </Field>

                                    <Field label="Birth Registration Place">
                                        <Input
                                            value={
                                                child.birth_registration_place
                                            }
                                            onChange={(event) =>
                                                setChild(
                                                    'birth_registration_place',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </Field>
                                </div>

                                <Field label="Birth / Family Notes">
                                    <textarea
                                        className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
                                        value={child.birth_family_notes}
                                        onChange={(event) =>
                                            setChild(
                                                'birth_family_notes',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Field>

                                <div className="border-t" />

                                <SectionTitle
                                    icon={HeartPulse}
                                    title="Medical Information"
                                />

                                <Field label="Medical Background">
                                    <textarea
                                        className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
                                        value={child.medical_background}
                                        onChange={(event) =>
                                            setChild(
                                                'medical_background',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Field>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <Field label="Allergies">
                                        <textarea
                                            className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
                                            value={child.allergies}
                                            onChange={(event) =>
                                                setChild(
                                                    'allergies',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </Field>

                                    <Field label="Existing Medical Conditions">
                                        <textarea
                                            className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
                                            value={
                                                child.existing_conditions
                                            }
                                            onChange={(event) =>
                                                setChild(
                                                    'existing_conditions',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </Field>
                                </div>

                                <Nav
                                    back
                                    nextDisabled={!childValid}
                                    onBack={() => setStep(2)}
                                    onNext={() => setStep(4)}
                                    nextLabel="Review Family"
                                />
                            </CardContent>
                        </Card>
                    )}

                    {step === 4 && (
                        <Card>
                            <CardHeader className="border-b">
                                <CardTitle>
                                    Review Family Registration
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-5 pt-6">
                                <div className="rounded-lg border p-4">
                                    <p className="font-semibold">
                                        {data.name}
                                    </p>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Guardian gender: {data.gender}
                                    </p>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Portal access:{' '}
                                        {data.portal_access === 'active'
                                            ? 'Activate now'
                                            : 'No online access for now'}
                                    </p>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {data.portal_access === 'active'
                                            ? data.email
                                            : 'No login email required'}
                                    </p>
                                </div>

                                <div className="rounded-lg border p-4">
                                    <p className="font-semibold">
                                        {[
                                            child.first_name,
                                            child.middle_name,
                                            child.last_name,
                                        ]
                                            .filter(Boolean)
                                            .join(' ')}
                                    </p>

                                    <p className="text-sm text-muted-foreground">
                                        {child.date_of_birth} · {child.sex} ·{' '}
                                        {child.guardian_relationship}
                                    </p>
                                </div>

                                {Object.keys(errors).length > 0 && (
                                    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                                        Please review the form errors before
                                        submitting.
                                    </div>
                                )}

                                <div className="flex justify-between border-t pt-5">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setStep(3)}
                                    >
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back
                                    </Button>

                                    <Button
                                        type="submit"
                                        disabled={processing}
                                    >
                                        {processing
                                            ? 'Creating Family...'
                                            : 'Create Family & Patient'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
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

function SectionTitle({
    icon: Icon,
    title,
}: {
    icon: React.ComponentType<{
        className?: string;
    }>;
    title: string;
}) {
    return (
        <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />

            <h3 className="font-semibold">
                {title}
            </h3>
        </div>
    );
}

function Metric({
    label,
    unit,
    value,
    onChange,
}: {
    label: string;
    unit: string;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <Field label={`${label} (${unit})`}>
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

function Nav({
    back = false,
    nextDisabled = false,
    onBack,
    onNext,
    nextLabel = 'Continue',
}: {
    back?: boolean;
    nextDisabled?: boolean;
    onBack?: () => void;
    onNext: () => void;
    nextLabel?: string;
}) {
    return (
        <div
            className={`flex border-t pt-5 ${
                back
                    ? 'justify-between'
                    : 'justify-end'
            }`}
        >
            {back && (
                <Button
                    type="button"
                    variant="outline"
                    onClick={onBack}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
            )}

            <Button
                type="button"
                disabled={nextDisabled}
                onClick={onNext}
            >
                {nextLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </div>
    );
}
