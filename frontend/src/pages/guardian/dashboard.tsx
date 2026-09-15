import { Head, router } from '@inertiajs/react';
import {
    CalendarDays,
    ChevronRight,
    Clock3,
    LogOut,
    Syringe,
    UserRound,
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

type Guardian = {
    id: number;
    guardian_no: string;
    name: string;
    email: string | null;
    contact_number: string | null;
};

type Appointment = {
    id: number;
    patient_id: number;
    patient_name: string;
    date: string;
    vaccine: string;
    dose_number: number;
};

type Child = {
    id: number;
    patient_id: string;
    name: string;
    nickname: string | null;
    date_of_birth: string | null;
    sex: string;
    status: string;

    portal_status:
        | 'Overdue'
        | 'Upcoming'
        | 'No Schedule';

    documented_doses: number;
    overdue_count: number;

    next_appointment: {
        date: string;
        vaccine: string;
        dose_number: number;
    } | null;
};

type Props = {
    guardian: Guardian;
    children: Child[];
    appointments: Appointment[];
};

function formatDate(
    value: string | null,
) {
    if (!value) {
        return '—';
    }

    const [year, month, day] = value
        .split('-')
        .map(Number);

    return new Date(
        year,
        month - 1,
        day,
    ).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function statusClasses(
    status: Child['portal_status'],
) {
    if (status === 'Overdue') {
        return 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400';
    }

    if (status === 'Upcoming') {
        return 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400';
    }

    return 'border-border bg-muted text-muted-foreground';
}

export default function GuardianDashboard({
    guardian,
    children,
    appointments,
}: Props) {
    const logout = () => {
        router.post(
            '/logout',
            {},
            {
                preserveScroll: false,

                onSuccess: () => {
                    router.visit('/login');
                },
            },
        );
    };

    return (
        <>
            <Head title="Guardian Portal" />

            <div className="min-h-screen bg-background text-foreground">
                {/* Header */}
                <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
                    <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
                        <div className="flex min-w-0 items-center gap-3">
                            <img
                                src="/images/bugo-health-center-logo.png"
                                alt="Barangay Bugo Health Center"
                                className="h-11 w-11 rounded-full object-contain"
                            />

                            <div className="min-w-0">
                                <p className="truncate font-bold">
                                    Barangay Bugo
                                </p>

                                <p className="text-xs text-muted-foreground">
                                    Parent / Guardian Portal
                                </p>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={logout}
                        >
                            <LogOut className="mr-2 h-4 w-4" />

                            <span className="hidden sm:inline">
                                Log out
                            </span>
                        </Button>
                    </div>
                </header>

                {/* Main */}
                <main className="mx-auto max-w-6xl space-y-6 px-5 py-6 pb-24">
                    {/* Welcome */}
                    <section className="rounded-2xl border bg-card p-6">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Welcome back
                                </p>

                                <h1 className="mt-1 text-2xl font-bold">
                                    {guardian.name}
                                </h1>

                                <p className="mt-2 text-sm text-muted-foreground">
                                    {guardian.guardian_no}

                                    {guardian.contact_number
                                        ? ` · ${guardian.contact_number}`
                                        : ''}
                                </p>

                                {guardian.email && (
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {guardian.email}
                                    </p>
                                )}
                            </div>

                            <div className="flex h-14 w-14 items-center justify-center rounded-full border bg-muted/40">
                                <UserRound className="h-6 w-6" />
                            </div>
                        </div>
                    </section>

                    {/* Summary */}
                    <div className="grid gap-4 sm:grid-cols-3">
                        <SummaryCard
                            icon={UsersRound}
                            label="My Children"
                            value={String(
                                children.length,
                            )}
                        />

                        <SummaryCard
                            icon={CalendarDays}
                            label="Upcoming Visits"
                            value={String(
                                appointments.length,
                            )}
                        />

                        <SummaryCard
                            icon={Clock3}
                            label="Needs Attention"
                            value={String(
                                children.filter(
                                    (child) =>
                                        child.portal_status ===
                                        'Overdue',
                                ).length,
                            )}
                        />
                    </div>

                    {/* Children */}
                    <section id="children">
                        <div className="mb-4">
                            <h2 className="text-xl font-bold">
                                My Children
                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">
                                View each child's
                                vaccination status and
                                immunization record.
                            </p>
                        </div>

                        {children.length === 0 ? (
                            <Card>
                                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                                    No patient records are
                                    linked to this guardian
                                    account.
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                {children.map(
                                    (child) => (
                                        <button
                                            key={child.id}
                                            type="button"
                                            className="rounded-2xl border bg-card p-5 text-left transition hover:bg-muted/30"
                                            onClick={() =>
                                                router.visit(
                                                    `/guardian/children/${child.id}`,
                                                )
                                            }
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h3 className="truncate font-bold">
                                                            {
                                                                child.name
                                                            }
                                                        </h3>

                                                        <Badge
                                                            variant="outline"
                                                            className={statusClasses(
                                                                child.portal_status,
                                                            )}
                                                        >
                                                            {
                                                                child.portal_status
                                                            }
                                                        </Badge>
                                                    </div>

                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        {
                                                            child.patient_id
                                                        }{' '}
                                                        ·{' '}
                                                        {formatDate(
                                                            child.date_of_birth,
                                                        )}
                                                    </p>
                                                </div>

                                                <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
                                            </div>

                                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                                <div className="rounded-xl border bg-muted/20 p-3">
                                                    <p className="text-xs text-muted-foreground">
                                                        Documented
                                                        Doses
                                                    </p>

                                                    <p className="mt-1 font-semibold">
                                                        {
                                                            child.documented_doses
                                                        }
                                                    </p>
                                                </div>

                                                <div className="rounded-xl border bg-muted/20 p-3">
                                                    <p className="text-xs text-muted-foreground">
                                                        Next
                                                        Visit
                                                    </p>

                                                    <p className="mt-1 text-sm font-semibold">
                                                        {child.next_appointment
                                                            ? formatDate(
                                                                  child
                                                                      .next_appointment
                                                                      .date,
                                                              )
                                                            : 'No appointment'}
                                                    </p>
                                                </div>
                                            </div>

                                            {child.next_appointment && (
                                                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Syringe className="h-4 w-4" />

                                                    <span>
                                                        {
                                                            child
                                                                .next_appointment
                                                                .vaccine
                                                        }{' '}
                                                        · Dose{' '}
                                                        {
                                                            child
                                                                .next_appointment
                                                                .dose_number
                                                        }
                                                    </span>
                                                </div>
                                            )}

                                            {child.overdue_count >
                                                0 && (
                                                <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">
                                                    {
                                                        child.overdue_count
                                                    }{' '}
                                                    overdue vaccination
                                                    {child.overdue_count >
                                                    1
                                                        ? 's'
                                                        : ''}
                                                </p>
                                            )}
                                        </button>
                                    ),
                                )}
                            </div>
                        )}
                    </section>

                    {/* Appointments */}
                    <section id="appointments">
                        <div className="mb-4">
                            <h2 className="text-xl font-bold">
                                Upcoming Appointments
                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Scheduled vaccination
                                visits for your children.
                            </p>
                        </div>

                        <Card>
                            {appointments.length ===
                            0 ? (
                                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                                    No upcoming
                                    appointments are
                                    currently scheduled.
                                </CardContent>
                            ) : (
                                <CardContent className="divide-y p-0">
                                    {appointments.map(
                                        (
                                            appointment,
                                        ) => (
                                            <div
                                                key={
                                                    appointment.id
                                                }
                                                className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between"
                                            >
                                                <div>
                                                    <p className="font-semibold">
                                                        {
                                                            appointment.patient_name
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        {
                                                            appointment.vaccine
                                                        }{' '}
                                                        ·
                                                        Dose{' '}
                                                        {
                                                            appointment.dose_number
                                                        }
                                                    </p>
                                                </div>

                                                <Badge variant="outline">
                                                    {formatDate(
                                                        appointment.date,
                                                    )}
                                                </Badge>
                                            </div>
                                        ),
                                    )}
                                </CardContent>
                            )}
                        </Card>
                    </section>
                </main>

                {/* Mobile Navigation */}
                <nav className="fixed inset-x-0 bottom-0 z-20 border-t bg-background md:hidden">
                    <div className="grid grid-cols-3">
                        <a
                            href="#children"
                            className="flex flex-col items-center gap-1 py-3 text-xs"
                        >
                            <UsersRound className="h-5 w-5" />
                            Children
                        </a>

                        <a
                            href="#appointments"
                            className="flex flex-col items-center gap-1 py-3 text-xs"
                        >
                            <CalendarDays className="h-5 w-5" />
                            Visits
                        </a>

                        <button
                            type="button"
                            className="flex flex-col items-center gap-1 py-3 text-xs"
                            onClick={logout}
                        >
                            <LogOut className="h-5 w-5" />

                            Logout
                        </button>
                    </div>
                </nav>
            </div>
        </>
    );
}

function SummaryCard({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ComponentType<{
        className?: string;
    }>;

    label: string;
    value: string;
}) {
    return (
        <Card>
            <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border">
                    <Icon className="h-5 w-5" />
                </div>

                <div>
                    <p className="text-sm text-muted-foreground">
                        {label}
                    </p>

                    <p className="text-2xl font-bold">
                        {value}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}