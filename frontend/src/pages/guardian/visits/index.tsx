import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Building2,
    Calendar,
    CheckCircle2,
    Clock3,
    Info,
    MapPin,
    QrCode,
    Syringe,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import ChildQrModal, { type QrChildItem } from '../components/child-qr-modal';
import { StockBadge } from '../components/stock-badge';

type Guardian = {
    id: number;
    guardian_no: string;
    name: string;
    email: string | null;
    contact_number: string | null;
    address?: string | null;
    status?: string;
};

type Appointment = {
    id: number;
    patient_id: number;
    patient_name: string;
    date: string;
    vaccine_id?: number;
    vaccine: string;
    dose_number: number;
    stock_vials?: number;
    stock_status?: string;
};

type Child = {
    id: number;
    patient_id: string;
    name: string;
    nickname: string | null;
    date_of_birth: string | null;
    qr_code_value?: string;
};

type Props = {
    guardian: Guardian;
    children: Child[];
    appointments: Appointment[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Guardian Dashboard',
        href: '/guardian/dashboard',
    },
    {
        title: 'Upcoming Visits',
        href: '/guardian/visits',
    },
];

function formatDate(value: string | null) {
    if (!value) return '—';
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export default function GuardianVisitsIndex({
    guardian,
    children = [],
    appointments = [],
}: Props) {
    const [qrModalOpen, setQrModalOpen] = useState(false);
    const [selectedChildForQr, setSelectedChildForQr] = useState<number | undefined>(
        children[0]?.id,
    );
    const [selectedChildFilter, setSelectedChildFilter] = useState<number | 'all'>('all');

    const filteredAppointments = useMemo(() => {
        if (selectedChildFilter === 'all') return appointments;
        return appointments.filter((a) => a.patient_id === selectedChildFilter);
    }, [appointments, selectedChildFilter]);

    const qrChildrenList: QrChildItem[] = children.map((c) => ({
        id: c.id,
        patient_id: c.patient_id,
        name: c.name,
        date_of_birth: c.date_of_birth,
        qr_code_value: c.qr_code_value || `/patients/${c.id}`,
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Upcoming Visits - Guardian Portal - Barangay Bugo" />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                Upcoming Clinic Visits
                            </h1>
                            <Badge variant="outline" className="border-border/80 font-medium text-xs">
                                {appointments.length}{' '}
                                {appointments.length === 1 ? 'Visit Scheduled' : 'Visits Scheduled'}
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Scheduled pediatric immunization appointments with real-time vaccine inventory status at Barangay Bugo Health Center.
                        </p>
                    </div>

                    {/* Child Filter Tabs */}
                    {children.length > 1 && (
                        <div className="flex items-center gap-1 rounded-xl border border-border/60 bg-muted/30 p-1 self-start sm:self-auto">
                            <button
                                type="button"
                                onClick={() => setSelectedChildFilter('all')}
                                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                                    selectedChildFilter === 'all'
                                        ? 'bg-background text-foreground shadow-2xs font-semibold'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                All Children ({appointments.length})
                            </button>
                            {children.map((child) => {
                                const count = appointments.filter((a) => a.patient_id === child.id).length;
                                return (
                                    <button
                                        key={child.id}
                                        type="button"
                                        onClick={() => setSelectedChildFilter(child.id)}
                                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                                            selectedChildFilter === child.id
                                                ? 'bg-background text-foreground shadow-2xs font-semibold'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        {child.nickname || child.name.split(' ')[0]} ({count})
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left: Appointments List (7 cols) */}
                    <div className="lg:col-span-7 space-y-3.5">
                        {filteredAppointments.length === 0 ? (
                            <Card className="border-dashed">
                                <CardContent className="py-14 text-center text-sm text-muted-foreground">
                                    <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500/60 mb-3" />
                                    <p className="text-base font-semibold text-foreground">
                                        No upcoming visits scheduled
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
                                        {selectedChildFilter !== 'all'
                                            ? 'This child has no pending clinic appointments scheduled at this time.'
                                            : 'All registered children are up to date. Health center staff will book future milestone appointments during routine check-ups.'}
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            filteredAppointments.map((appointment) => (
                                <Card
                                    key={appointment.id}
                                    className="rounded-2xl border-border/70 bg-card shadow-2xs transition-all hover:border-border hover:shadow-xs"
                                >
                                    <CardContent className="p-4 sm:p-5 space-y-3">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                            <div className="flex items-center gap-3.5 min-w-0">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-purple-500/25 bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                                    <Syringe className="h-5 w-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="text-sm font-bold text-foreground truncate">
                                                        {appointment.patient_name}
                                                    </h3>
                                                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                                        <strong className="text-foreground">{appointment.vaccine}</strong> · Dose {appointment.dose_number}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                                                <Badge
                                                    variant="outline"
                                                    className="border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300 font-medium text-xs px-2.5 py-1"
                                                >
                                                    <Calendar className="mr-1.5 h-3.5 w-3.5" />
                                                    {formatDate(appointment.date)}
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Realtime Stock & Actions Bar */}
                                        <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-border/40 pt-3 text-xs">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[11px] text-muted-foreground font-medium">
                                                    Center Inventory:
                                                </span>
                                                <StockBadge
                                                    stockVials={appointment.stock_vials}
                                                    stockStatus={appointment.stock_status}
                                                />
                                            </div>

                                            <Button
                                                asChild
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
                                            >
                                                <Link href={`/guardian/children/${appointment.patient_id}`}>
                                                    <span>View Bakuna Card</span>
                                                    <ArrowRight className="h-3 w-3" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>

                    {/* Right: Preparation Guidelines & Clinic Schedule (5 cols) */}
                    <div className="lg:col-span-5 space-y-4">
                        {/* Visit Preparation Tips Card */}
                        <Card className="rounded-2xl border-border/70 bg-card shadow-2xs">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                                    <Info className="h-4 w-4 text-primary" />
                                    <span>How to Prepare for Your Visit</span>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3.5 text-xs text-muted-foreground pt-0">
                                <div className="flex items-start gap-2.5">
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                                        1
                                    </span>
                                    <div>
                                        <strong className="text-foreground">Bring Physical Baby Book (EPI Card):</strong>
                                        <p className="mt-0.5 leading-relaxed">
                                            Always bring your yellow DOH Immunization Card for staff validation and manual signature stamping.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2.5">
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                                        2
                                    </span>
                                    <div>
                                        <strong className="text-foreground">Comfortable Baby Clothing:</strong>
                                        <p className="mt-0.5 leading-relaxed">
                                            Dress your baby in easily removable clothes for thigh or upper arm vaccine administration.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2.5">
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                                        3
                                    </span>
                                    <div>
                                        <strong className="text-foreground">Arrive 15 Minutes Early:</strong>
                                        <p className="mt-0.5 leading-relaxed">
                                            Arrive before clinic hours to complete temperature and weight vitals screening at the triage desk.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Health Center Information */}
                        <Card className="rounded-2xl border-border/60 bg-card/60 shadow-2xs">
                            <CardContent className="p-5 space-y-3 text-xs">
                                <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                                    <Building2 className="h-4 w-4 text-primary" />
                                    <span>Barangay Bugo Health Center</span>
                                </div>

                                <div className="space-y-2 text-muted-foreground">
                                    <div className="flex items-start gap-2">
                                        <Clock3 className="h-3.5 w-3.5 text-muted-foreground/80 mt-0.5 shrink-0" />
                                        <div>
                                            <strong className="text-foreground">Routine Pediatric Vaccination:</strong>
                                            <p className="mt-0.5">Wednesdays & Thursdays, 8:00 AM – 11:30 AM</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2 pt-1">
                                        <MapPin className="h-3.5 w-3.5 text-muted-foreground/80 mt-0.5 shrink-0" />
                                        <span>Zone 1, Bugo, Cagayan de Oro City</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Check-In QR Modal */}
                <ChildQrModal
                    open={qrModalOpen}
                    onOpenChange={setQrModalOpen}
                    childrenList={qrChildrenList}
                    selectedChildId={selectedChildForQr}
                />
            </div>
        </AppLayout>
    );
}
