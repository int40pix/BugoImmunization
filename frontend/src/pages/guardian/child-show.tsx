import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    ClipboardList,
    Syringe,
    UserRound,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

type RecordItem = {
    id: number;
    vaccine: string;
    dose_number: number;
    date_administered: string | null;
    source: string | null;
    remarks: string | null;
};

type ScheduleItem = {
    id: number;
    vaccine: string;
    dose_number: number;
    scheduled_date: string | null;
};

type Patient = {
    id: number;
    patient_id: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    nickname: string | null;
    date_of_birth: string;
    sex: string;
    status: string;
    records: RecordItem[];
    schedules: ScheduleItem[];
};

type Props = {
    guardian: {
        name: string;
    };
    patient: Patient;
};

function formatDate(value: string | null) {
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
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

export default function GuardianChildShow({
    guardian,
    patient,
}: Props) {
    const patientName = [
        patient.first_name,
        patient.middle_name,
        patient.last_name,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <>
            <Head title={`${patientName} - Guardian Portal`} />

            <div className="min-h-screen bg-background text-foreground">
                <header className="border-b">
                    <div className="mx-auto flex max-w-5xl items-center gap-3 px-5 py-4">
                        <img
                            src="/images/bugo-health-center-logo.png"
                            alt=""
                            className="h-10 w-10 rounded-full object-contain"
                        />

                        <div>
                            <p className="font-bold">
                                Barangay Bugo Health Center
                            </p>

                            <p className="text-xs text-muted-foreground">
                                Guardian Portal
                            </p>
                        </div>
                    </div>
                </header>

                <main className="mx-auto max-w-5xl space-y-5 px-5 py-6">
                    <Button
                        type="button"
                        variant="ghost"
                        asChild
                    >
                        <Link href="/guardian/dashboard">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to My Children
                        </Link>
                    </Button>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Pediatric Patient Record
                                    </p>

                                    <h1 className="mt-1 text-2xl font-bold">
                                        {patientName}
                                    </h1>

                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                        <Badge variant="outline">
                                            {patient.patient_id}
                                        </Badge>

                                        <Badge variant="secondary">
                                            {patient.status}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="flex h-14 w-14 items-center justify-center rounded-full border">
                                    <UserRound className="h-6 w-6" />
                                </div>
                            </div>

                            <div className="mt-6 grid gap-4 sm:grid-cols-3">
                                <Info
                                    label="Date of Birth"
                                    value={formatDate(
                                        patient.date_of_birth,
                                    )}
                                />

                                <Info
                                    label="Sex"
                                    value={patient.sex}
                                />

                                <Info
                                    label="Guardian"
                                    value={guardian.name}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="border-b">
                            <div className="flex items-center gap-2">
                                <CalendarDays className="h-5 w-5" />
                                <CardTitle>
                                    Upcoming Appointments
                                </CardTitle>
                            </div>
                        </CardHeader>

                        {patient.schedules.length === 0 ? (
                            <CardContent className="py-10 text-center text-sm text-muted-foreground">
                                No upcoming vaccination
                                appointments are currently
                                scheduled.
                            </CardContent>
                        ) : (
                            <CardContent className="divide-y p-0">
                                {patient.schedules.map(
                                    (schedule) => (
                                        <div
                                            key={schedule.id}
                                            className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div>
                                                <p className="font-semibold">
                                                    {
                                                        schedule.vaccine
                                                    }
                                                </p>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    Dose{' '}
                                                    {
                                                        schedule.dose_number
                                                    }
                                                </p>
                                            </div>

                                            <Badge variant="outline">
                                                {formatDate(
                                                    schedule.scheduled_date,
                                                )}
                                            </Badge>
                                        </div>
                                    ),
                                )}
                            </CardContent>
                        )}
                    </Card>

                    <Card>
                        <CardHeader className="border-b">
                            <div className="flex items-center gap-2">
                                <ClipboardList className="h-5 w-5" />
                                <CardTitle>
                                    Immunization History
                                </CardTitle>
                            </div>
                        </CardHeader>

                        {patient.records.length === 0 ? (
                            <CardContent className="py-10 text-center text-sm text-muted-foreground">
                                No administered vaccine doses have
                                been recorded yet.
                            </CardContent>
                        ) : (
                            <CardContent className="divide-y p-0">
                                {patient.records.map(
                                    (record) => (
                                        <div
                                            key={record.id}
                                            className="flex gap-4 p-5"
                                        >
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border">
                                                <Syringe className="h-4 w-4" />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                                    <p className="font-semibold">
                                                        {
                                                            record.vaccine
                                                        }{' '}
                                                        · Dose{' '}
                                                        {
                                                            record.dose_number
                                                        }
                                                    </p>

                                                    <span className="text-sm text-muted-foreground">
                                                        {formatDate(
                                                            record.date_administered,
                                                        )}
                                                    </span>
                                                </div>

                                                {record.remarks && (
                                                    <p className="mt-2 text-sm text-muted-foreground">
                                                        {
                                                            record.remarks
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ),
                                )}
                            </CardContent>
                        )}
                    </Card>
                </main>
            </div>
        </>
    );
}

function Info({
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
