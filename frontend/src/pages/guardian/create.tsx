import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Baby,
    CheckCircle2,
    HeartPulse,
    Home,
    KeyRound,
    Loader2,
    MapPin,
    Pencil,
    ShieldAlert,
    UserRound,
    UsersRound,
} from 'lucide-react';
import React, { FormEvent, useMemo, useState } from 'react';
import { PhoneInput } from './components/phone-input';
import { RegistrationSection } from './components/registration-section';
import { RegistrationStepper } from './components/registration-stepper';

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
    mother_name: string;
    father_name: string;
    mother_information_unavailable: boolean;
    father_information_unavailable: boolean;
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
    mother_name: '',
    father_name: '',
    mother_information_unavailable: false,
    father_information_unavailable: false,
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

const selectClassName =
    'h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground shadow-2xs transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50';

export default function GuardianCreate() {
    const [step, setStep] = useState(1);

    // Symmetrical 3-column input state for Guardian Name
    const [guardianFirstName, setGuardianFirstName] = useState('');
    const [guardianMiddleName, setGuardianMiddleName] = useState('');
    const [guardianLastName, setGuardianLastName] = useState('');

    const { data, setData, post, processing, errors } = useForm<FamilyForm>({
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

    const updateGuardianName = (first: string, middle: string, last: string) => {
        setGuardianFirstName(first);
        setGuardianMiddleName(middle);
        setGuardianLastName(last);
        const fullName = [first.trim(), middle.trim(), last.trim()]
            .filter(Boolean)
            .join(' ');
        setData('name', fullName);
    };

    const setGuardianGender = (gender: GuardianGender) => {
        setData('gender', gender);
        setData('children', [
            {
                ...child,
                guardian_relationship: '',
            },
        ]);
    };

    const setChild = <K extends keyof ChildForm>(key: K, value: ChildForm[K]) => {
        setData('children', [
            {
                ...child,
                [key]: value,
            },
        ]);
    };

    const relationshipOptions = useMemo(() => {
        if (data.gender === 'Female') return femaleRelationships;
        if (data.gender === 'Male') return maleRelationships;
        return [];
    }, [data.gender]);

    // Validation checks:
    // Step 1: Guardian Information only (NO parent requirements on guardian!)
    const guardianValid =
        guardianFirstName.trim() !== '' &&
        guardianLastName.trim() !== '' &&
        data.gender !== '' &&
        (data.portal_access === 'none' ||
            (data.email.trim() !== '' &&
                data.password.length >= 8 &&
                data.password_confirmation !== '' &&
                data.password === data.password_confirmation));

    // Step 2: Child Information (Parent information belongs here!)
    const childValid =
        child.first_name.trim() !== '' &&
        child.last_name.trim() !== '' &&
        child.date_of_birth !== '' &&
        child.sex !== '' &&
        child.guardian_relationship !== '' &&
        child.address.trim() !== '' &&
        (child.mother_information_unavailable || child.mother_name.trim() !== '') &&
        (child.father_information_unavailable || child.father_name.trim() !== '');

    // Max step allowed for manual click in stepper
    const maxAccessibleStep = guardianValid ? (childValid ? 3 : 2) : 1;

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post('/guardians', {
            preserveScroll: true,
        });
    };

    const breadcrumbs = [
        { title: 'Patients', href: '/patients' },
        { title: 'Register Family', href: '/guardians/create' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Register Family - Bugo Health Center" />

            {/* Standardized container & layout across all steps */}
            <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8">
                {/* 1. Page Header (Consistent across Step 1 to 3) */}
                <div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => router.visit('/patients')}
                        className="-ml-3 mb-2 text-muted-foreground hover:text-foreground h-8 text-xs gap-1.5"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to Patients
                    </Button>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Register Family
                        </h1>
                        <Badge variant="secondary" className="text-xs font-medium">
                            Patient Management
                        </Badge>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Register a guardian account and initial pediatric patient record in one coordinated workflow.
                    </p>
                </div>

                {/* 2. Stepper / Progress Indicator (Consistent 3-step system) */}
                <RegistrationStepper
                    currentStep={step}
                    onStepClick={(targetStep) => setStep(targetStep)}
                    maxAccessibleStep={maxAccessibleStep}
                />

                {/* 3. Main Form Card */}
                <form onSubmit={handleSubmit}>
                    {/* STEP 1: GUARDIAN ACCOUNT & PORTAL ACCESS */}
                    {step === 1 && (
                        <Card className="border border-border/70 shadow-2xs rounded-xl overflow-hidden bg-card">
                            <CardHeader className="border-b border-border/60 px-6 py-4 bg-muted/15">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <CardTitle className="text-base font-semibold text-foreground">
                                            Step 1: Guardian Information
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground">
                                            Register the primary account holder, guardian contact, and portal access credentials.
                                        </p>
                                    </div>
                                    <Badge variant="outline" className="text-xs font-mono">
                                        Step 1 of 3
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="p-6 sm:p-8 space-y-6">
                                {/* Subsection 1: Basic Guardian Information */}
                                <RegistrationSection
                                    icon={UserRound}
                                    title="Guardian Account Holder"
                                    description="Primary legal caregiver and contact for health center communications."
                                >
                                    <div className="space-y-4">
                                        {/* Symmetrical 3-Column: First Name | Middle Name | Last Name */}
                                        <div className="grid gap-4 sm:grid-cols-3">
                                            <Field
                                                label="First Name"
                                                required
                                                error={errors.name}
                                            >
                                                <Input
                                                    value={guardianFirstName}
                                                    onChange={(e) =>
                                                        updateGuardianName(
                                                            e.target.value,
                                                            guardianMiddleName,
                                                            guardianLastName
                                                        )
                                                    }
                                                    placeholder="e.g. Maria"
                                                    className="h-9 text-xs"
                                                    required
                                                />
                                            </Field>

                                            <Field label="Middle Name">
                                                <Input
                                                    value={guardianMiddleName}
                                                    onChange={(e) =>
                                                        updateGuardianName(
                                                            guardianFirstName,
                                                            e.target.value,
                                                            guardianLastName
                                                        )
                                                    }
                                                    placeholder="e.g. Dela Cruz"
                                                    className="h-9 text-xs"
                                                />
                                            </Field>

                                            <Field
                                                label="Last Name"
                                                required
                                                error={errors.name}
                                            >
                                                <Input
                                                    value={guardianLastName}
                                                    onChange={(e) =>
                                                        updateGuardianName(
                                                            guardianFirstName,
                                                            guardianMiddleName,
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="e.g. Santos"
                                                    className="h-9 text-xs"
                                                    required
                                                />
                                            </Field>
                                        </div>

                                        {/* Symmetrical 2-Column: Gender | Contact Number */}
                                        <div className="grid gap-4 sm:grid-cols-2 items-start">
                                            <Field
                                                label="Guardian Gender"
                                                required
                                                error={errorBag.gender}
                                            >
                                                <select
                                                    id="guardian-gender"
                                                    value={data.gender}
                                                    onChange={(e) =>
                                                        setGuardianGender(
                                                            e.target.value as GuardianGender
                                                        )
                                                    }
                                                    className={selectClassName}
                                                    required
                                                >
                                                    <option value="">Select guardian gender</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Male">Male</option>
                                                </select>
                                            </Field>

                                            <Field
                                                label="Contact Number"
                                                error={errors.contact_number}
                                            >
                                                <PhoneInput
                                                    value={data.contact_number}
                                                    onChange={(val) => setData('contact_number', val)}
                                                    placeholder="912 345 6789"
                                                    error={errors.contact_number}
                                                />
                                            </Field>
                                        </div>
                                    </div>
                                </RegistrationSection>

                                {/* Subsection 2: Patient Portal Access */}
                                <RegistrationSection
                                    icon={KeyRound}
                                    title="Patient Portal Access"
                                    description="Guardian online portal for viewing child immunization records and clinic appointments."
                                >
                                    <div className="space-y-4">
                                        <Field
                                            label="Portal Access Mode"
                                            required
                                        >
                                            <select
                                                value={data.portal_access}
                                                onChange={(e) => {
                                                    const val = e.target.value as PortalAccess;
                                                    setData('portal_access', val);
                                                    if (val === 'none') {
                                                        setData('email', '');
                                                        setData('password', '');
                                                        setData('password_confirmation', '');
                                                    }
                                                }}
                                                className={selectClassName}
                                            >
                                                <option value="active">
                                                    Activate portal access now (Online account)
                                                </option>
                                                <option value="none">
                                                    No online access for now (Walk-in records only)
                                                </option>
                                            </select>
                                        </Field>

                                        {data.portal_access === 'active' ? (
                                            <div className="rounded-lg border border-border/60 bg-background p-4 shadow-2xs">
                                                {/* Symmetrical 3-Column: Email | Password | Confirm Password */}
                                                <div className="grid gap-4 sm:grid-cols-3 items-start">
                                                    <Field
                                                        label="Email Address"
                                                        required
                                                        error={errors.email}
                                                    >
                                                        <Input
                                                            type="email"
                                                            value={data.email}
                                                            onChange={(e) =>
                                                                setData('email', e.target.value)
                                                            }
                                                            placeholder="guardian@example.com"
                                                            className="h-9 text-xs"
                                                            required
                                                        />
                                                    </Field>

                                                    <Field
                                                        label="Password (min. 8 chars)"
                                                        required
                                                        error={errorBag.password}
                                                    >
                                                        <Input
                                                            type="password"
                                                            value={data.password}
                                                            onChange={(e) =>
                                                                setData('password', e.target.value)
                                                            }
                                                            placeholder="Minimum 8 characters"
                                                            className="h-9 text-xs"
                                                            required
                                                        />
                                                    </Field>

                                                    <Field
                                                        label="Confirm Password"
                                                        required
                                                        error={errorBag.password_confirmation}
                                                    >
                                                        <Input
                                                            type="password"
                                                            value={data.password_confirmation}
                                                            onChange={(e) =>
                                                                setData(
                                                                    'password_confirmation',
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="Re-enter password"
                                                            className="h-9 text-xs"
                                                            required
                                                        />
                                                    </Field>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="rounded-lg border border-dashed border-border/80 bg-background/50 p-3.5 text-xs text-muted-foreground flex items-center gap-2.5">
                                                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                                <span>
                                                    No login email or password required. Clinic staff can access and administer vaccines for this family anytime.
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </RegistrationSection>
                            </CardContent>

                            {/* Standardized Form Card Footer */}
                            <CardFooter className="border-t border-border/60 px-6 py-4 bg-muted/10 flex items-center justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.visit('/patients')}
                                    className="h-9 px-4 text-xs"
                                >
                                    Cancel
                                </Button>

                                <Button
                                    type="button"
                                    size="sm"
                                    disabled={!guardianValid}
                                    onClick={() => setStep(2)}
                                    className="h-9 px-4 text-xs gap-1.5 font-medium"
                                >
                                    Continue to Child Info
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

                    {/* STEP 2: CHILD & MEDICAL INFORMATION */}
                    {step === 2 && (
                        <Card className="border border-border/70 shadow-2xs rounded-xl overflow-hidden bg-card">
                            <CardHeader className="border-b border-border/60 px-6 py-4 bg-muted/15">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <CardTitle className="text-base font-semibold text-foreground">
                                            Step 2: Child & Medical Information
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground">
                                            Register the pediatric patient, parents of this child, birth metrics, and medical profile.
                                        </p>
                                    </div>
                                    <Badge variant="outline" className="text-xs font-mono">
                                        Step 2 of 3
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="p-6 sm:p-8 space-y-6">
                                {/* Subsection 1: Basic Child Information */}
                                <RegistrationSection
                                    icon={Baby}
                                    title="Basic Child Information"
                                    description="Official legal name, birth date, and sex of the pediatric patient."
                                >
                                    <div className="space-y-4">
                                        {/* Symmetrical 3-Column: First Name | Middle Name | Last Name */}
                                        <div className="grid gap-4 sm:grid-cols-3">
                                            <Field
                                                label="First Name"
                                                required
                                                error={errorBag['children.0.first_name']}
                                            >
                                                <Input
                                                    value={child.first_name}
                                                    onChange={(e) =>
                                                        setChild('first_name', e.target.value)
                                                    }
                                                    placeholder="e.g. Lucas"
                                                    className="h-9 text-xs"
                                                    required
                                                />
                                            </Field>

                                            <Field
                                                label="Middle Name"
                                                error={errorBag['children.0.middle_name']}
                                            >
                                                <Input
                                                    value={child.middle_name}
                                                    onChange={(e) =>
                                                        setChild('middle_name', e.target.value)
                                                    }
                                                    placeholder="e.g. Dela Cruz"
                                                    className="h-9 text-xs"
                                                />
                                            </Field>

                                            <Field
                                                label="Last Name"
                                                required
                                                error={errorBag['children.0.last_name']}
                                            >
                                                <Input
                                                    value={child.last_name}
                                                    onChange={(e) =>
                                                        setChild('last_name', e.target.value)
                                                    }
                                                    placeholder="e.g. Santos"
                                                    className="h-9 text-xs"
                                                    required
                                                />
                                            </Field>
                                        </div>

                                        {/* Symmetrical 3-Column: Nickname | Date of Birth | Sex */}
                                        <div className="grid gap-4 sm:grid-cols-3">
                                            <Field
                                                label="Nickname"
                                                error={errorBag['children.0.nickname']}
                                            >
                                                <Input
                                                    value={child.nickname}
                                                    onChange={(e) =>
                                                        setChild('nickname', e.target.value)
                                                    }
                                                    placeholder="Optional call name"
                                                    className="h-9 text-xs"
                                                />
                                            </Field>

                                            <Field
                                                label="Date of Birth"
                                                required
                                                error={errorBag['children.0.date_of_birth']}
                                            >
                                                <Input
                                                    type="date"
                                                    max={new Date().toISOString().split('T')[0]}
                                                    value={child.date_of_birth}
                                                    onChange={(e) =>
                                                        setChild('date_of_birth', e.target.value)
                                                    }
                                                    className="h-9 text-xs"
                                                    required
                                                />
                                            </Field>

                                            <Field
                                                label="Sex"
                                                required
                                                error={errorBag['children.0.sex']}
                                            >
                                                <select
                                                    value={child.sex}
                                                    onChange={(e) =>
                                                        setChild('sex', e.target.value)
                                                    }
                                                    className={selectClassName}
                                                    required
                                                >
                                                    <option value="">Select sex</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                </select>
                                            </Field>
                                        </div>

                                        {/* Symmetrical 2-Column: Relationship to Guardian | Assigned Guardian */}
                                        <div className="grid gap-4 sm:grid-cols-2 items-start">
                                            <Field
                                                label="Relationship to Guardian"
                                                required
                                                error={errorBag['children.0.guardian_relationship']}
                                            >
                                                <select
                                                    value={child.guardian_relationship}
                                                    onChange={(e) =>
                                                        setChild(
                                                            'guardian_relationship',
                                                            e.target.value
                                                        )
                                                    }
                                                    className={selectClassName}
                                                    required
                                                >
                                                    <option value="">Select relationship</option>
                                                    {relationshipOptions.map((rel) => (
                                                        <option key={rel} value={rel}>
                                                            {rel}
                                                        </option>
                                                    ))}
                                                </select>
                                            </Field>

                                            <Field label="Assigned Guardian">
                                                <div className="flex h-9 items-center gap-2 rounded-md border border-border/60 bg-muted/20 px-3 text-xs text-muted-foreground">
                                                    <UserRound className="h-3.5 w-3.5 text-primary shrink-0" />
                                                    <span className="truncate">
                                                        Guardian: <strong className="text-foreground">{data.name || 'Account holder'}</strong> {data.gender ? `(${data.gender})` : ''}
                                                    </span>
                                                </div>
                                            </Field>
                                        </div>
                                    </div>
                                </RegistrationSection>

                                {/* Subsection 2: Parents of Child (Belongs strictly to Child!) */}
                                <RegistrationSection
                                    icon={UsersRound}
                                    title="Parents of Child"
                                    description="Biological or official parental details recorded specifically for this child."
                                >
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="rounded-lg border border-border/60 bg-background p-4 space-y-3 shadow-2xs">
                                            <Field
                                                label="Mother's Maiden Name"
                                                required={!child.mother_information_unavailable}
                                                error={errorBag['children.0.mother_name']}
                                            >
                                                <Input
                                                    value={child.mother_name}
                                                    disabled={child.mother_information_unavailable}
                                                    onChange={(e) =>
                                                        setChild('mother_name', e.target.value)
                                                    }
                                                    placeholder="Mother's full maiden name"
                                                    className="h-9 text-xs"
                                                />
                                            </Field>
                                            <label className="flex items-center gap-2 text-xs text-muted-foreground select-none cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={child.mother_information_unavailable}
                                                    onChange={(e) => {
                                                        setChild(
                                                            'mother_information_unavailable',
                                                            e.target.checked
                                                        );
                                                        if (e.target.checked) {
                                                            setChild('mother_name', '');
                                                        }
                                                    }}
                                                    className="h-3.5 w-3.5 rounded border-input text-primary"
                                                />
                                                Information unavailable
                                            </label>
                                        </div>

                                        <div className="rounded-lg border border-border/60 bg-background p-4 space-y-3 shadow-2xs">
                                            <Field
                                                label="Father's Name"
                                                required={!child.father_information_unavailable}
                                                error={errorBag['children.0.father_name']}
                                            >
                                                <Input
                                                    value={child.father_name}
                                                    disabled={child.father_information_unavailable}
                                                    onChange={(e) =>
                                                        setChild('father_name', e.target.value)
                                                    }
                                                    placeholder="Father's full name"
                                                    className="h-9 text-xs"
                                                />
                                            </Field>
                                            <label className="flex items-center gap-2 text-xs text-muted-foreground select-none cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={child.father_information_unavailable}
                                                    onChange={(e) => {
                                                        setChild(
                                                            'father_information_unavailable',
                                                            e.target.checked
                                                        );
                                                        if (e.target.checked) {
                                                            setChild('father_name', '');
                                                        }
                                                    }}
                                                    className="h-3.5 w-3.5 rounded border-input text-primary"
                                                />
                                                Information unavailable
                                            </label>
                                        </div>
                                    </div>
                                </RegistrationSection>

                                {/* Subsection 3: Residential Address */}
                                <RegistrationSection
                                    icon={Home}
                                    title="Residential Address"
                                    description="Official household residence for community health center mapping and tracking."
                                >
                                    <Field
                                        label="Complete Residential Address"
                                        required
                                        error={errorBag['children.0.address']}
                                    >
                                        <Textarea
                                            value={child.address}
                                            onChange={(e) =>
                                                setChild('address', e.target.value)
                                            }
                                            placeholder="e.g. Purok 2, Barangay Bugo, Cagayan de Oro City"
                                            className="min-h-[72px] text-xs resize-none"
                                            required
                                        />
                                    </Field>
                                </RegistrationSection>

                                {/* Subsection 4: Birth Details & Measurements */}
                                <RegistrationSection
                                    icon={HeartPulse}
                                    title="Birth Details & Measurements"
                                    description="Clinical delivery information and measurements at birth."
                                >
                                    <div className="space-y-4">
                                        {/* Symmetrical 3-Column: Birth Type | Full Term | Multiple Birth */}
                                        <div className="grid gap-4 sm:grid-cols-3">
                                            <Field label="Birth Type">
                                                <select
                                                    value={child.birth_type}
                                                    onChange={(e) =>
                                                        setChild('birth_type', e.target.value)
                                                    }
                                                    className={selectClassName}
                                                >
                                                    <option value="">Not recorded</option>
                                                    <option value="Normal">Normal Spontaneous</option>
                                                    <option value="Cesarean">Cesarean Section</option>
                                                    <option value="Assisted">Assisted Delivery</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </Field>

                                            <Field label="Gestational Term">
                                                <select
                                                    value={
                                                        child.is_full_term === null
                                                            ? ''
                                                            : child.is_full_term
                                                              ? 'yes'
                                                              : 'no'
                                                    }
                                                    onChange={(e) =>
                                                        setChild(
                                                            'is_full_term',
                                                            e.target.value === ''
                                                                ? null
                                                                : e.target.value === 'yes'
                                                        )
                                                    }
                                                    className={selectClassName}
                                                >
                                                    <option value="">Not recorded</option>
                                                    <option value="yes">Full Term (≥ 37 weeks)</option>
                                                    <option value="no">Preterm (&lt; 37 weeks)</option>
                                                </select>
                                            </Field>

                                            <Field label="Multiple Birth">
                                                <select
                                                    value={child.multiple_birth}
                                                    onChange={(e) =>
                                                        setChild('multiple_birth', e.target.value)
                                                    }
                                                    className={selectClassName}
                                                >
                                                    <option value="">Not recorded</option>
                                                    <option value="Single">Single Birth</option>
                                                    <option value="Twin">Twin</option>
                                                    <option value="Triplet">Triplet</option>
                                                    <option value="Other">Other multiple</option>
                                                </select>
                                            </Field>
                                        </div>

                                        {/* Symmetrical 3-Column: Birth Attendant | Blood Type | Birth Order */}
                                        <div className="grid gap-4 sm:grid-cols-3">
                                            <Field label="Birth Attendant">
                                                <Input
                                                    value={child.birth_attendant}
                                                    onChange={(e) =>
                                                        setChild('birth_attendant', e.target.value)
                                                    }
                                                    placeholder="e.g. Dr. Ramos, Midwife"
                                                    className="h-9 text-xs"
                                                />
                                            </Field>

                                            <Field label="Blood Type">
                                                <select
                                                    value={child.blood_type}
                                                    onChange={(e) =>
                                                        setChild('blood_type', e.target.value)
                                                    }
                                                    className={selectClassName}
                                                >
                                                    <option value="">Unknown / Not recorded</option>
                                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(
                                                        (b) => (
                                                            <option key={b} value={b}>
                                                                {b}
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                            </Field>

                                            <Field label="Birth Order">
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={child.birth_order}
                                                    onChange={(e) =>
                                                        setChild('birth_order', e.target.value)
                                                    }
                                                    placeholder="e.g. 1"
                                                    className="h-9 text-xs"
                                                />
                                            </Field>
                                        </div>

                                        {/* Symmetrical 4-Column: Metrics (Weight, Length, Head, Chest) */}
                                        <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                                            <Field label="Birth Weight (kg)">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={child.birth_weight}
                                                    onChange={(e) =>
                                                        setChild('birth_weight', e.target.value)
                                                    }
                                                    placeholder="e.g. 3.2"
                                                    className="h-9 text-xs"
                                                />
                                            </Field>

                                            <Field label="Body Length (cm)">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.1"
                                                    value={child.birth_length}
                                                    onChange={(e) =>
                                                        setChild('birth_length', e.target.value)
                                                    }
                                                    placeholder="e.g. 50"
                                                    className="h-9 text-xs"
                                                />
                                            </Field>

                                            <Field label="Head Circumf. (cm)">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.1"
                                                    value={child.head_circumference}
                                                    onChange={(e) =>
                                                        setChild('head_circumference', e.target.value)
                                                    }
                                                    placeholder="e.g. 34.5"
                                                    className="h-9 text-xs"
                                                />
                                            </Field>

                                            <Field label="Chest Circumf. (cm)">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.1"
                                                    value={child.chest_circumference}
                                                    onChange={(e) =>
                                                        setChild('chest_circumference', e.target.value)
                                                    }
                                                    placeholder="e.g. 33.0"
                                                    className="h-9 text-xs"
                                                />
                                            </Field>
                                        </div>

                                        {/* Symmetrical 2-Column: Registration Date | Registration Place */}
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <Field label="Birth Registration Date">
                                                <Input
                                                    type="date"
                                                    value={child.birth_registration_date}
                                                    onChange={(e) =>
                                                        setChild(
                                                            'birth_registration_date',
                                                            e.target.value
                                                        )
                                                    }
                                                    className="h-9 text-xs"
                                                />
                                            </Field>

                                            <Field label="Birth Registration Place">
                                                <Input
                                                    value={child.birth_registration_place}
                                                    onChange={(e) =>
                                                        setChild(
                                                            'birth_registration_place',
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="e.g. Bugo, Cagayan de Oro City"
                                                    className="h-9 text-xs"
                                                />
                                            </Field>
                                        </div>

                                        {/* Full row: Family Notes */}
                                        <Field label="Birth / Family Notes">
                                            <Textarea
                                                value={child.birth_family_notes}
                                                onChange={(e) =>
                                                    setChild('birth_family_notes', e.target.value)
                                                }
                                                placeholder="Any additional notes or observations from delivery"
                                                className="min-h-[60px] text-xs resize-none"
                                            />
                                        </Field>
                                    </div>
                                </RegistrationSection>

                                {/* Subsection 5: Medical Background */}
                                <RegistrationSection
                                    icon={ShieldAlert}
                                    title="Medical Information & Allergies"
                                    description="Clinical background, known drug/food allergies, and existing diagnoses."
                                >
                                    <div className="space-y-4">
                                        {/* Symmetrical 2-Column: Allergies | Existing Conditions */}
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <Field label="Allergies">
                                                <Textarea
                                                    value={child.allergies}
                                                    onChange={(e) =>
                                                        setChild('allergies', e.target.value)
                                                    }
                                                    placeholder="Known allergies to medications, vaccines, or food"
                                                    className="min-h-[70px] text-xs resize-none"
                                                />
                                            </Field>

                                            <Field label="Existing Medical Conditions">
                                                <Textarea
                                                    value={child.existing_conditions}
                                                    onChange={(e) =>
                                                        setChild('existing_conditions', e.target.value)
                                                    }
                                                    placeholder="e.g. Asthma, G6PD, Congenital heart condition"
                                                    className="min-h-[70px] text-xs resize-none"
                                                />
                                            </Field>
                                        </div>

                                        {/* Full row: Medical Background */}
                                        <Field label="Medical Background">
                                            <Textarea
                                                value={child.medical_background}
                                                onChange={(e) =>
                                                    setChild('medical_background', e.target.value)
                                                }
                                                placeholder="Relevant medical history or health center notes"
                                                className="min-h-[60px] text-xs resize-none"
                                            />
                                        </Field>
                                    </div>
                                </RegistrationSection>
                            </CardContent>

                            {/* Standardized Form Card Footer */}
                            <CardFooter className="border-t border-border/60 px-6 py-4 bg-muted/10 flex items-center justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setStep(1)}
                                    className="h-9 px-4 text-xs gap-1.5"
                                >
                                    <ArrowLeft className="h-3.5 w-3.5" />
                                    Back to Step 1
                                </Button>

                                <Button
                                    type="button"
                                    size="sm"
                                    disabled={!childValid}
                                    onClick={() => setStep(3)}
                                    className="h-9 px-4 text-xs gap-1.5 font-medium"
                                >
                                    Continue to Review
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

                    {/* STEP 3: REVIEW & CONFIRM */}
                    {step === 3 && (
                        <Card className="border border-border/70 shadow-2xs rounded-xl overflow-hidden bg-card">
                            <CardHeader className="border-b border-border/60 px-6 py-4 bg-muted/15">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <CardTitle className="text-base font-semibold text-foreground">
                                            Step 3: Review & Complete Registration
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground">
                                            Verify all guardian and pediatric details before saving to the clinic registry.
                                        </p>
                                    </div>
                                    <Badge variant="outline" className="text-xs font-mono">
                                        Step 3 of 3
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="p-6 sm:p-8 space-y-6">
                                {/* Error notification banner if any backend errors */}
                                {Object.keys(errors).length > 0 && (
                                    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-xs text-destructive space-y-1">
                                        <div className="flex items-center gap-2 font-semibold">
                                            <AlertCircle className="h-4 w-4" />
                                            <span>Please correct the following errors before completing registration:</span>
                                        </div>
                                        <ul className="list-disc list-inside space-y-0.5 pl-6 text-[11px]">
                                            {Object.entries(errors).map(([k, err]) => (
                                                <li key={k}>{err}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Summary Section 1: Guardian Information */}
                                <RegistrationSection
                                    icon={UserRound}
                                    title="Guardian Account Holder"
                                    description="Primary legal contact and portal account."
                                    action={
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setStep(1)}
                                            className="h-7 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground gap-1.5"
                                        >
                                            <Pencil className="h-3 w-3" />
                                            Edit
                                        </Button>
                                    }
                                >
                                    <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                                        <SummaryItem label="Full Name" value={data.name} />
                                        <SummaryItem label="Gender" value={data.gender} />
                                        <SummaryItem
                                            label="Contact Number"
                                            value={data.contact_number || 'None provided'}
                                        />
                                        <SummaryItem
                                            label="Portal Access"
                                            value={
                                                data.portal_access === 'active'
                                                    ? 'Active (Online Account)'
                                                    : 'No Online Access'
                                            }
                                        />
                                        {data.portal_access === 'active' && (
                                            <div className="col-span-2 sm:col-span-4">
                                                <SummaryItem
                                                    label="Portal Email"
                                                    value={data.email}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </RegistrationSection>

                                {/* Summary Section 2: Child Information */}
                                <RegistrationSection
                                    icon={Baby}
                                    title="Child Information"
                                    description="Primary pediatric patient profile."
                                    action={
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setStep(2)}
                                            className="h-7 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground gap-1.5"
                                        >
                                            <Pencil className="h-3 w-3" />
                                            Edit
                                        </Button>
                                    }
                                >
                                    <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                                        <SummaryItem
                                            label="Child Name"
                                            value={[child.first_name, child.middle_name, child.last_name]
                                                .filter(Boolean)
                                                .join(' ')}
                                        />
                                        <SummaryItem label="Nickname" value={child.nickname} />
                                        <SummaryItem
                                            label="Date of Birth"
                                            value={child.date_of_birth}
                                        />
                                        <SummaryItem label="Sex" value={child.sex} />
                                        <div className="col-span-2 sm:col-span-4">
                                            <SummaryItem
                                                label="Relationship to Guardian"
                                                value={child.guardian_relationship}
                                            />
                                        </div>
                                    </div>
                                </RegistrationSection>

                                {/* Summary Section 3: Parents of Child */}
                                <RegistrationSection
                                    icon={UsersRound}
                                    title="Parents of Child"
                                    description="Parental records specific to this child."
                                    action={
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setStep(2)}
                                            className="h-7 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground gap-1.5"
                                        >
                                            <Pencil className="h-3 w-3" />
                                            Edit
                                        </Button>
                                    }
                                >
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <SummaryItem
                                            label="Mother's Maiden Name"
                                            value={
                                                child.mother_information_unavailable
                                                    ? 'Information unavailable'
                                                    : child.mother_name
                                            }
                                        />
                                        <SummaryItem
                                            label="Father's Name"
                                            value={
                                                child.father_information_unavailable
                                                    ? 'Information unavailable'
                                                    : child.father_name
                                            }
                                        />
                                    </div>
                                </RegistrationSection>

                                {/* Summary Section 4: Address */}
                                <RegistrationSection
                                    icon={MapPin}
                                    title="Residential Address"
                                    description="Household residence location."
                                    action={
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setStep(2)}
                                            className="h-7 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground gap-1.5"
                                        >
                                            <Pencil className="h-3 w-3" />
                                            Edit
                                        </Button>
                                    }
                                >
                                    <SummaryItem label="Complete Address" value={child.address} />
                                </RegistrationSection>

                                {/* Summary Section 5: Birth & Medical Profile */}
                                <RegistrationSection
                                    icon={HeartPulse}
                                    title="Birth & Medical Profile"
                                    description="Clinical delivery metrics and medical history."
                                    action={
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setStep(2)}
                                            className="h-7 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground gap-1.5"
                                        >
                                            <Pencil className="h-3 w-3" />
                                            Edit
                                        </Button>
                                    }
                                >
                                    <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                                        <SummaryItem label="Birth Type" value={child.birth_type} />
                                        <SummaryItem
                                            label="Gestational Term"
                                            value={
                                                child.is_full_term === true
                                                    ? 'Full Term'
                                                    : child.is_full_term === false
                                                      ? 'Preterm'
                                                      : 'Not recorded'
                                            }
                                        />
                                        <SummaryItem label="Blood Type" value={child.blood_type} />
                                        <SummaryItem
                                            label="Birth Weight"
                                            value={
                                                child.birth_weight
                                                    ? `${child.birth_weight} kg`
                                                    : 'Not recorded'
                                            }
                                        />
                                        <SummaryItem
                                            label="Body Length"
                                            value={
                                                child.birth_length
                                                    ? `${child.birth_length} cm`
                                                    : 'Not recorded'
                                            }
                                        />
                                        <SummaryItem
                                            label="Head Circumference"
                                            value={
                                                child.head_circumference
                                                    ? `${child.head_circumference} cm`
                                                    : 'Not recorded'
                                            }
                                        />
                                        <SummaryItem
                                            label="Allergies"
                                            value={child.allergies || 'None reported'}
                                        />
                                        <SummaryItem
                                            label="Existing Conditions"
                                            value={child.existing_conditions || 'None reported'}
                                        />
                                    </div>
                                </RegistrationSection>
                            </CardContent>

                            {/* Standardized Form Card Footer */}
                            <CardFooter className="border-t border-border/60 px-6 py-4 bg-muted/10 flex items-center justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setStep(2)}
                                    disabled={processing}
                                    className="h-9 px-4 text-xs gap-1.5"
                                >
                                    <ArrowLeft className="h-3.5 w-3.5" />
                                    Back to Step 2
                                </Button>

                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={processing || !guardianValid || !childValid}
                                    className="h-9 px-5 text-xs font-medium gap-1.5"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            Completing Registration...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                            Complete Registration
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    )}
                </form>
            </div>
        </AppLayout>
    );
}

/*
|--------------------------------------------------------------------------
| REUSABLE LOCAL HELPER COMPONENTS
|--------------------------------------------------------------------------
*/

function Field({
    label,
    required = false,
    error,
    helper,
    children,
}: {
    label: string;
    required?: boolean;
    error?: string;
    helper?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground flex items-center gap-0.5">
                {label}
                {required && <span className="text-destructive font-semibold">*</span>}
            </Label>
            {children}
            {helper && !error && (
                <p className="text-[11px] text-muted-foreground">{helper}</p>
            )}
            {error && (
                <p className="text-[11px] font-medium text-destructive">{error}</p>
            )}
        </div>
    );
}

function SummaryItem({
    label,
    value,
}: {
    label: string;
    value?: React.ReactNode;
}) {
    return (
        <div className="space-y-0.5">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground block">
                {label}
            </span>
            <div className="text-xs font-semibold text-foreground">
                {value || <span className="text-muted-foreground font-normal italic">None provided</span>}
            </div>
        </div>
    );
}
