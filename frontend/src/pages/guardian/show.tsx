import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Baby,
    CheckCircle2,
    ChevronRight,
    Copy,
    KeyRound,
    Mail,
    Pencil,
    Phone,
    Plus,
    ShieldCheck,
    UserRound,
    UsersRound,
} from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';

type AccountStatus =
    | 'unclaimed'
    | 'temporary'
    | 'active'
    | 'inactive';

type FamilyPatient = {
    id: number;
    patient_id: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    nickname: string | null;
    date_of_birth: string;
    sex: string;
    guardian_relationship: string | null;
    address: string | null;
    status: string;
    patient_url: string;
};

type Guardian = {
    id: number;
    guardian_no: string;
    name: string;
    gender?: string | null;
    email: string | null;
    contact_number: string | null;
    status: string;
    account_status: AccountStatus;
    must_change_password: boolean;
    mother_maiden_name: string | null;
    father_name: string | null;
    mother_information_unavailable: boolean;
    father_information_unavailable: boolean;
    patients: FamilyPatient[];
};

type PageProps = {
    guardian: Guardian;
    flash?: {
        success?: string;
        error?: string;
        temporary_password?: string;
    };
    errors?: Record<string, string>;
};

function accountStatusLabel(status: AccountStatus) {
    switch (status) {
        case 'unclaimed':
            return 'No Portal Access';

        case 'temporary':
            return 'Temporary Access';

        case 'active':
            return 'Portal Active';

        case 'inactive':
            return 'Portal Disabled';
    }
}

function accountStatusClasses(status: AccountStatus) {
    switch (status) {
        case 'unclaimed':
            return 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400';

        case 'temporary':
            return 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400';

        case 'active':
            return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';

        case 'inactive':
            return 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400';
    }
}

export default function GuardianShow() {
    const {
        guardian,
        flash,
        errors,
    } = usePage<PageProps>().props;

    const [showActivation, setShowActivation] =
        useState(false);

    const [activationEmail, setActivationEmail] =
        useState(guardian.email ?? '');

    const [activating, setActivating] =
        useState(false);

    const [resetting, setResetting] =
        useState(false);

    const [disabling, setDisabling] =
        useState(false);

    const [showResetDialog, setShowResetDialog] =
        useState(false);

    const [showDisableDialog, setShowDisableDialog] =
        useState(false);

    const [copied, setCopied] =
        useState(false);

    useEffect(() => {
        setActivationEmail(
            guardian.email ?? '',
        );
    }, [
        guardian.email,
    ]);

    const formatDate = (
        value: string,
    ) => {
        if (!value) {
            return '—';
        }

        const datePart =
            value.split('T')[0];

        const [
            year,
            month,
            day,
        ] = datePart
            .split('-')
            .map(Number);

        if (
            !year ||
            !month ||
            !day
        ) {
            return value;
        }

        return new Date(
            year,
            month - 1,
            day,
        ).toLocaleDateString(
            'en-US',
            {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            },
        );
    };

    const patientName = (
        patient: FamilyPatient,
    ) =>
        [
            patient.first_name,
            patient.middle_name,
            patient.last_name,
        ]
            .filter(Boolean)
            .join(' ');

    const activatePortal = (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        setActivating(true);

        router.post(
            `/guardians/${guardian.id}/portal/activate`,
            {
                email:
                    activationEmail,
            },
            {
                preserveScroll: true,

                onSuccess: () => {
                    setShowActivation(
                        false,
                    );
                },

                onFinish: () => {
                    setActivating(
                        false,
                    );
                },
            },
        );
    };

    const executeResetPassword = () => {
        setShowResetDialog(false);
        setResetting(true);

        router.post(
            `/guardians/${guardian.id}/portal/reset-password`,
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setResetting(false);
                },
            },
        );
    };

    const executeDisablePortal = () => {
        setShowDisableDialog(false);
        setDisabling(true);

        router.patch(
            `/guardians/${guardian.id}/portal/disable`,
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setDisabling(false);
                },
            },
        );
    };

    const copyTemporaryPassword =
        async () => {
            if (
                !flash?.temporary_password
            ) {
                return;
            }

            await navigator.clipboard.writeText(
                flash.temporary_password,
            );

            setCopied(true);

            window.setTimeout(
                () =>
                    setCopied(
                        false,
                    ),
                2000,
            );
        };

    return (
        <AppLayout>
            <Head
                title={`${guardian.name} - Registered Family`}
            />

            <div className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-7">
                <div className="rounded-2xl border bg-background/70 p-5 shadow-sm">
                    <Button
                        type="button"
                        variant="ghost"
                        className="h-8 px-0"
                        onClick={() =>
                            router.visit(
                                '/patients',
                            )
                        }
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Patient Management
                    </Button>

                    <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-2xl font-bold">
                                    {
                                        guardian.name
                                    }
                                </h1>

                                <Badge variant="outline">
                                    {
                                        guardian.guardian_no
                                    }
                                </Badge>

                                <Badge
                                    variant="outline"
                                    className={accountStatusClasses(
                                        guardian.account_status,
                                    )}
                                >
                                    {accountStatusLabel(
                                        guardian.account_status,
                                    )}
                                </Badge>

                                <Badge
                                    variant={
                                        guardian.status ===
                                        'active'
                                            ? 'default'
                                            : 'secondary'
                                    }
                                >
                                    {
                                        guardian.status
                                    }
                                </Badge>
                            </div>

                            <p className="mt-2 text-sm text-muted-foreground">
                                Registered family
                                account ·{' '}
                                {
                                    guardian
                                        .patients
                                        .length
                                }{' '}
                                {guardian
                                    .patients
                                    .length === 1
                                    ? 'child'
                                    : 'children'}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Button asChild variant="outline">
                                <Link href={`/guardians/${guardian.id}/edit`}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit Family
                                </Link>
                            </Button>

                            <Button
                                type="button"
                                disabled={
                                    guardian.status !==
                                    'active'
                                }
                                onClick={() =>
                                    router.visit(
                                        `/guardians/${guardian.id}/patients/create`,
                                    )
                                }
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Child
                            </Button>
                        </div>
                    </div>
                </div>

                {flash?.success && (
                    <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                        {
                            flash.success
                        }
                    </div>
                )}

                {flash?.error && (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                        {
                            flash.error
                        }
                    </div>
                )}

                {flash?.temporary_password && (
                    <Card className="border-blue-500/30">
                        <CardHeader className="border-b">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg border p-2">
                                    <KeyRound className="h-5 w-5" />
                                </div>

                                <div>
                                    <CardTitle>
                                        Temporary
                                        Password
                                        Generated
                                    </CardTitle>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Give this
                                        directly to
                                        the guardian.
                                        It is only
                                        shown after
                                        generation.
                                    </p>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="pt-6">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="flex-1 rounded-lg border bg-muted/20 px-4 py-3 font-mono text-lg font-semibold tracking-wide">
                                    {
                                        flash.temporary_password
                                    }
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={
                                        copyTemporaryPassword
                                    }
                                >
                                    {copied ? (
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                    ) : (
                                        <Copy className="mr-2 h-4 w-4" />
                                    )}

                                    {copied
                                        ? 'Copied'
                                        : 'Copy Password'}
                                </Button>
                            </div>

                            <p className="mt-3 text-xs text-muted-foreground">
                                The
                                guardian
                                will be
                                required
                                to create
                                a new
                                password
                                after
                                signing in.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {errors &&
                    Object.keys(
                        errors,
                    ).length >
                        0 && (
                        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                            {
                                Object.values(
                                    errors,
                                )[0]
                            }
                        </div>
                    )}

                <Card>
                    <CardHeader className="border-b">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg border p-2">
                                    {guardian.account_status ===
                                    'unclaimed' ? (
                                        <KeyRound className="h-5 w-5" />
                                    ) : (
                                        <ShieldCheck className="h-5 w-5" />
                                    )}
                                </div>

                                <div>
                                    <CardTitle>
                                        Portal
                                        Access
                                    </CardTitle>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Manage
                                        guardian
                                        access to
                                        the online
                                        portal.
                                    </p>
                                </div>
                            </div>

                            <Badge
                                variant="outline"
                                className={accountStatusClasses(
                                    guardian.account_status,
                                )}
                            >
                                {accountStatusLabel(
                                    guardian.account_status,
                                )}
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-5 pt-6">
                        {guardian.account_status ===
                            'unclaimed' && (
                            <div className="rounded-xl border bg-muted/20 p-4">
                                <p className="font-medium">
                                    This
                                    guardian
                                    does not
                                    currently
                                    have online
                                    access.
                                </p>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Their
                                    guardian
                                    profile and
                                    patient
                                    records are
                                    still
                                    available
                                    to health
                                    center
                                    staff.
                                </p>
                            </div>
                        )}

                        {guardian.account_status ===
                            'temporary' && (
                            <div className="rounded-xl border bg-muted/20 p-4">
                                <p className="font-medium">
                                    Temporary
                                    access is
                                    active.
                                </p>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    The
                                    guardian
                                    must sign
                                    in using
                                    their
                                    temporary
                                    password
                                    and create
                                    a new
                                    password.
                                </p>
                            </div>
                        )}

                        {guardian.account_status ===
                            'active' && (
                            <div className="rounded-xl border bg-muted/20 p-4">
                                <p className="font-medium">
                                    Portal
                                    access is
                                    active.
                                </p>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    This
                                    guardian
                                    can sign in
                                    using their
                                    registered
                                    email and
                                    personal
                                    password.
                                </p>
                            </div>
                        )}

                        {guardian.account_status ===
                            'inactive' && (
                            <div className="rounded-xl border bg-muted/20 p-4">
                                <p className="font-medium">
                                    Portal
                                    access is
                                    disabled.
                                </p>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    The
                                    guardian
                                    cannot
                                    currently
                                    sign in.
                                </p>
                            </div>
                        )}

                        {guardian.account_status ===
                            'unclaimed' && (
                            <>
                                {!showActivation ? (
                                    <Button
                                        type="button"
                                        onClick={() =>
                                            setShowActivation(
                                                true,
                                            )
                                        }
                                    >
                                        <KeyRound className="mr-2 h-4 w-4" />
                                        Activate
                                        Portal
                                        Access
                                    </Button>
                                ) : (
                                    <form
                                        onSubmit={
                                            activatePortal
                                        }
                                        className="space-y-4 rounded-xl border p-4"
                                    >
                                        <div>
                                            <h3 className="font-semibold">
                                                Activate
                                                Portal
                                                Access
                                            </h3>

                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Enter
                                                the
                                                guardian's
                                                email.
                                                The
                                                system
                                                will
                                                generate
                                                a
                                                temporary
                                                password.
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="activation_email">
                                                Email
                                                Address
                                            </Label>

                                            <Input
                                                id="activation_email"
                                                type="email"
                                                value={
                                                    activationEmail
                                                }
                                                placeholder="guardian@example.com"
                                                onChange={(
                                                    event,
                                                ) =>
                                                    setActivationEmail(
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                                }
                                                required
                                            />

                                            {errors?.email && (
                                                <p className="text-sm text-destructive">
                                                    {
                                                        errors.email
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                disabled={
                                                    activating
                                                }
                                                onClick={() =>
                                                    setShowActivation(
                                                        false,
                                                    )
                                                }
                                            >
                                                Cancel
                                            </Button>

                                            <Button
                                                type="submit"
                                                disabled={
                                                    activating ||
                                                    activationEmail.trim() ===
                                                        ''
                                                }
                                            >
                                                {activating
                                                    ? 'Activating...'
                                                    : 'Generate Temporary Password'}
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </>
                        )}

                        {guardian.account_status !==
                            'unclaimed' && (
                            <div className="flex flex-wrap gap-2">
                                {(guardian.account_status ===
                                    'temporary' ||
                                    guardian.account_status ===
                                        'active') && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={
                                            resetting
                                        }
                                        onClick={() =>
                                            setShowResetDialog(true)
                                        }
                                    >
                                        <KeyRound className="mr-2 h-4 w-4" />

                                        {resetting
                                            ? 'Generating...'
                                            : 'Reset Password'}
                                    </Button>
                                )}

                                {(guardian.account_status ===
                                    'temporary' ||
                                    guardian.account_status ===
                                        'active') && (
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        disabled={
                                            disabling
                                        }
                                        onClick={() =>
                                            setShowDisableDialog(true)
                                        }
                                    >
                                        {disabling
                                            ? 'Disabling...'
                                            : 'Disable Portal Access'}
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="grid gap-5 lg:grid-cols-2">
                    <Card>
                        <CardHeader className="border-b">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg border p-2">
                                    <UserRound className="h-5 w-5" />
                                </div>

                                <div>
                                    <CardTitle>
                                        Guardian
                                        Account
                                    </CardTitle>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Account
                                        holder and
                                        contact
                                        information.
                                    </p>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-4 pt-6">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Account
                                    Holder
                                </p>

                                <p className="mt-1 font-medium">
                                    {
                                        guardian.name
                                    }
                                </p>
                            </div>

                            {guardian.gender && (
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                        Guardian
                                        Gender
                                    </p>

                                    <p className="mt-1 font-medium">
                                        {
                                            guardian.gender
                                        }
                                    </p>
                                </div>
                            )}

                            <div className="flex items-start gap-3">
                                <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />

                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Email
                                    </p>

                                    <p className="text-sm">
                                        {guardian.email ||
                                            'No portal email'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />

                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Contact
                                        Number
                                    </p>

                                    <p className="text-sm">
                                        {guardian.contact_number ||
                                            'Not provided'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="border-b">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg border p-2">
                                    <UsersRound className="h-5 w-5" />
                                </div>

                                <div>
                                    <CardTitle>
                                        Parent
                                        Information
                                    </CardTitle>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Family-level
                                        parent
                                        information
                                        recorded
                                        during
                                        registration.
                                    </p>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="grid gap-5 pt-6 sm:grid-cols-2">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Mother's
                                    Maiden Name
                                </p>

                                <p className="mt-1 font-medium">
                                    {guardian.mother_information_unavailable
                                        ? 'Information unavailable'
                                        : guardian.mother_maiden_name ||
                                          'Not provided'}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Father's
                                    Full Name
                                </p>

                                <p className="mt-1 font-medium">
                                    {guardian.father_information_unavailable
                                        ? 'Information unavailable'
                                        : guardian.father_name ||
                                          'Not provided'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-4 border-b">
                        <div>
                            <CardTitle>
                                Children /
                                Patient
                                Records
                            </CardTitle>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Each child
                                has an
                                independent
                                patient
                                record,
                                immunization
                                history, and
                                schedule.
                            </p>
                        </div>

                        <Badge variant="outline">
                            {
                                guardian
                                    .patients
                                    .length
                            }{' '}
                            {guardian
                                .patients
                                .length === 1
                                ? 'patient'
                                : 'patients'}
                        </Badge>
                    </CardHeader>

                    <CardContent className="pt-6">
                        {guardian
                            .patients
                            .length ===
                        0 ? (
                            <div className="rounded-xl border border-dashed p-10 text-center">
                                <Baby className="mx-auto h-8 w-8 text-muted-foreground" />

                                <p className="mt-3 font-medium">
                                    No children
                                    registered
                                </p>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Add a child
                                    to create a
                                    patient
                                    record
                                    under this
                                    family.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-3 md:grid-cols-2">
                                {guardian.patients.map(
                                    (
                                        patient,
                                    ) => (
                                        <button
                                            key={
                                                patient.id
                                            }
                                            type="button"
                                            onClick={() =>
                                                router.visit(
                                                    patient.patient_url ||
                                                        `/patients/${patient.id}`,
                                                )
                                            }
                                            className="group rounded-xl border p-4 text-left transition-colors hover:bg-muted/20"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                                                    <Baby className="h-5 w-5" />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <p className="truncate font-semibold">
                                                                {patientName(
                                                                    patient,
                                                                )}
                                                            </p>

                                                            <p className="mt-1 text-xs text-muted-foreground">
                                                                {
                                                                    patient.patient_id
                                                                }{' '}
                                                                ·
                                                                DOB{' '}
                                                                {formatDate(
                                                                    patient.date_of_birth,
                                                                )}
                                                            </p>
                                                        </div>

                                                        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                                                    </div>

                                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                                        <span className="text-xs text-muted-foreground">
                                                            {
                                                                patient.sex
                                                            }
                                                        </span>

                                                        {patient.guardian_relationship && (
                                                            <span className="text-xs text-muted-foreground">
                                                                ·{' '}
                                                                {
                                                                    patient.guardian_relationship
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ),
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Reset Password Confirmation Dialog */}
                <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Reset Guardian Password?</DialogTitle>
                            <DialogDescription>
                                A new temporary password will be generated. The guardian's existing password will immediately stop working and they will be prompted to set a new password upon logging in.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowResetDialog(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={executeResetPassword}
                                disabled={resetting}
                            >
                                {resetting ? 'Generating...' : 'Confirm Reset'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Disable Portal Access Confirmation Dialog */}
                <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Disable Guardian Portal Access?</DialogTitle>
                            <DialogDescription>
                                The guardian will no longer be able to log in or view their child's digital immunization record until their account is re-enabled by health center staff.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowDisableDialog(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={executeDisablePortal}
                                disabled={disabling}
                            >
                                {disabling ? 'Disabling...' : 'Disable Access'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
