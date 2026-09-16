import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Syringe } from 'lucide-react';

type Patient = {
    patient_id: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    address: string;
    guardian_name: string;
    guardian_contact: string | null;
    guardian_relationship: string | null;
    medical_background: string | null;
    status: string;
    user?: {
        email: string;
    };
};

type ScheduleItem = {
    vaccine_name: string;
    dose_label: string;
    scheduled_date: string;
    status: string;
    administered_date?: string | null;
    notes?: string | null;
};

type InboxProps = {
    patient: Patient;
};

export default function PatientInbox() {
    const { patient } = usePage<InboxProps>().props;

    const notifications = [
        {
            title: 'Upcoming Immunization Appointment',
            message: 'N/A',
            time: 'DATE',
        },
        {
            title: 'Record Update Completed',
            message: 'N/A',
            time: 'DATE',
        },
        {
            title: 'Pre-visit Reminder',
            message: 'N/A',
            time: 'DATE',
        },
    ];

    const immunizationHistory = [
        {
            vaccine: 'BCG',
            date: 'N/A',
            status: 'Uncomplete',
        },
        {
            vaccine: 'OPV 1',
            date: 'N/A',
            status: 'Uncomplete',
        },
        {
            vaccine: 'Pentavalent 1',
            date: 'N/A',
            status: 'Uncomplete',
        },
        {
            vaccine: 'Pentavalent 2',
            date: 'N/A',
            status: 'Uncomplete',
        },
        {
            vaccine: 'MMR',
            date: 'N/A',
            status: 'Uncomplete',
        },
    ];

    return (
        <AppLayout>
            <Head title="Patient Inbox" />

            <div className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-7">
                <div className="flex flex-col gap-4 rounded-2xl border bg-background/70 p-6 shadow-sm md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold">Notification Inbox</h1>
                            <Badge variant="secondary">Patient Portal</Badge>
                        </div>
                        <p className="mt-2 text-muted-foreground">
                            Welcome {patient.first_name} {patient.last_name}. Your profile and immunization updates are shown below.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">Pediatric Record</Badge>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Patient Profile Summary</span>
                            <Badge variant="outline">Health Record</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-lg border bg-muted/20 p-3">
                            <p className="text-sm text-muted-foreground">Patient ID</p>
                            <p className="mt-1 font-semibold">{patient.patient_id}</p>
                        </div>
                        <div className="rounded-lg border bg-muted/20 p-3">
                            <p className="text-sm text-muted-foreground">Patient Name</p>
                            <p className="mt-1 font-semibold">{patient.first_name} {patient.middle_name ? `${patient.middle_name} ` : ''}{patient.last_name}</p>
                        </div>
                        <div className="rounded-lg border bg-muted/20 p-3">
                            <p className="text-sm text-muted-foreground">Guardian</p>
                            <p className="mt-1 font-semibold">{patient.guardian_name}</p>
                        </div>
                        <div className="rounded-lg border bg-muted/20 p-3">
                            <p className="text-sm text-muted-foreground">Address</p>
                            <p className="mt-1 font-semibold">{patient.address}</p>
                        </div>
                        <div className="rounded-lg border bg-muted/20 p-3">
                            <p className="text-sm text-muted-foreground">Guardian Contact</p>
                            <p className="mt-1 font-semibold">{patient.guardian_contact ?? 'Not provided'}</p>
                        </div>
                        <div className="rounded-lg border bg-muted/20 p-3">
                            <p className="text-sm text-muted-foreground">Relationship</p>
                            <p className="mt-1 font-semibold">{patient.guardian_relationship ?? 'Not provided'}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Recent Notifications
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {notifications.map((item, index) => (
                            <div key={index} className="rounded-lg border p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold">{item.title}</p>
                                            <Badge variant="outline">{item.time}</Badge>
                                        </div>
                                        <p className="mt-2 text-sm text-muted-foreground">{item.message}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Immunization history removed */}
            </div>
        </AppLayout>
    );
}
