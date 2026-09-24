import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    Baby,
    Building2,
    Calendar,
    CalendarDays,
    CheckCircle2,
    Clock3,
    HeartPulse,
    QrCode,
    ShieldCheck,
    Syringe,
    UsersRound,
} from 'lucide-react';
import React, { useState } from 'react';
import ChildQrModal, { type QrChildItem } from './components/child-qr-modal';
import { StockBadge } from './components/stock-badge';

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
    first_name?: string;
    nickname: string | null;
    date_of_birth: string | null;
    age_display?: string | null;
    sex: string;
    status: string;
    portal_status: 'Overdue' | 'Upcoming' | 'No Schedule' | 'Up to Date';
    documented_doses: number;
    routine_target_doses?: number;
    routine_progress_percent?: number;
    overdue_count: number;
    qr_code_value?: string;
    next_appointment: {
        vaccine_id?: number;
        date: string;
        vaccine: string;
        dose_number: number;
        stock_vials?: number;
        stock_status?: string;
    } | null;
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
];

function formatDate(value: string | null) {
    if (!value) return '—';
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function statusBadge(status: Child['portal_status']) {
    if (status === 'Overdue') {
        return (
            <Badge
                variant="outline"
                className="border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400 font-medium gap-1 text-[11px] px-2 py-0.5"
            >
                <AlertCircle className="h-3 w-3" />
                Dose Overdue
            </Badge>
        );
    }

    if (status === 'Upcoming') {
        return (
            <Badge
                variant="outline"
                className="border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300 font-medium gap-1 text-[11px] px-2 py-0.5"
            >
                <Clock3 className="h-3 w-3" />
                Upcoming Dose
            </Badge>
        );
    }

    return (
        <Badge
            variant="outline"
            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium gap-1 text-[11px] px-2 py-0.5"
        >
            <CheckCircle2 className="h-3 w-3" />
            Up to Date
        </Badge>
    );
}

export default function GuardianDashboard({
    guardian,
    children = [],
    appointments = [],
}: Props) {
    const [qrModalOpen, setQrModalOpen] = useState(false);
    const [selectedChildForQr, setSelectedChildForQr] = useState<number | undefined>(
        children[0]?.id,
    );

    const openQrForChild = (childId: number) => {
        setSelectedChildForQr(childId);
        setQrModalOpen(true);
    };

    const hasOverdue = children.some((c) => c.portal_status === 'Overdue');
    const totalDosesDocumented = children.reduce(
        (sum, child) => sum + (child.documented_doses || 0),
        0,
    );

    const nextUpcomingVisit = appointments[0] || null;

    const qrChildrenList: QrChildItem[] = children.map((c) => ({
        id: c.id,
        patient_id: c.patient_id,
        name: c.name,
        date_of_birth: c.date_of_birth,
        qr_code_value: c.qr_code_value || `/patients/${c.id}`,
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Guardian Dashboard - Barangay Bugo Health Center" />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-w-0 overflow-x-hidden">
                {/* Welcome Hero Banner */}
                <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-card to-emerald-500/5 p-3.5 sm:p-6 shadow-xs min-w-0 max-w-full">
                    <div className="row g-3 mx-0 w-full align-items-center justify-content-between">
                        <div className="col-12 col-md-8 space-y-1.5 max-w-2xl">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-300 shrink-0">
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    Verified Family Account
                                </span>
                                <span className="font-mono text-xs text-muted-foreground">
                                    {guardian.guardian_no}
                                </span>
                            </div>

                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground break-words">
                                Welcome, {guardian.name}
                            </h1>

                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                Monitor your children's routine pediatric immunization records, check live vaccine inventory stock, and track upcoming health center visits.
                            </p>
                        </div>

                        {children.length > 0 && (
                            <div className="col-12 col-md-4 d-flex flex-wrap items-center justify-content-start justify-content-md-end gap-2 shrink-0">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedChildForQr(children[0]?.id);
                                        setQrModalOpen(true);
                                    }}
                                    className="h-8 gap-1.5 rounded-lg border-border/80 bg-card/60 hover:bg-accent text-xs font-medium shadow-2xs"
                                >
                                    <QrCode className="h-3.5 w-3.5 text-primary" />
                                    <span>Check-In QR</span>
                                </Button>

                                <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className="h-8 gap-1.5 rounded-lg border-border/80 bg-card/60 hover:bg-accent text-xs font-medium shadow-2xs"
                                >
                                    <Link href="/guardian/children">
                                        <Baby className="h-3.5 w-3.5 text-primary" />
                                        <span>My Children</span>
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Summary Metric Cards */}
                <div className="row g-3 mx-0 w-full">
                    <div className="col-12 col-sm-6 col-lg-4">
                        <Link
                            href="/guardian/children"
                            className="group block h-full rounded-xl border border-border/60 bg-card/60 p-3.5 sm:p-5 shadow-2xs transition-all hover:border-border hover:shadow-xs hover:bg-card"
                        >
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
                                    <UsersRound className="h-5 w-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors truncate">
                                        Registered Children
                                    </p>
                                    <div className="flex items-baseline gap-1.5 sm:gap-2">
                                        <p className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                                            {children.length}
                                        </p>
                                        <span className="text-[11px] sm:text-xs text-muted-foreground truncate">
                                            {children.length === 1 ? 'child on file' : 'children on file'}
                                        </span>
                                    </div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                            </div>
                        </Link>
                    </div>

                    <div className="col-12 col-sm-6 col-lg-4">
                        <Link
                            href="/guardian/visits"
                            className="group block h-full rounded-xl border border-border/60 bg-card/60 p-4 sm:p-5 shadow-2xs transition-all hover:border-border hover:shadow-xs hover:bg-card"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
                                    <CalendarDays className="h-5 w-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                                        Upcoming Visits
                                    </p>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-2xl font-bold tracking-tight text-foreground">
                                            {appointments.length}
                                        </p>
                                        <span className="text-xs text-muted-foreground">
                                            scheduled {appointments.length === 1 ? 'dose' : 'doses'}
                                        </span>
                                    </div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                            </div>
                        </Link>
                    </div>

                    <div className="col-12 col-sm-12 col-lg-4">
                        <div className="h-full rounded-xl border border-border/60 bg-card/60 p-4 sm:p-5 shadow-2xs">
                            <div className="flex items-center gap-4">
                                <div
                                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                                        hasOverdue
                                            ? 'border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400'
                                            : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                    }`}
                                >
                                    <HeartPulse className="h-5 w-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Total Doses Recorded
                                    </p>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-2xl font-bold tracking-tight text-foreground">
                                            {totalDosesDocumented}
                                        </p>
                                        <span className="text-xs text-muted-foreground">
                                            {hasOverdue ? 'attention needed' : 'doses administered'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Next Upcoming Appointment Spotlight with Realtime Stock */}
                {nextUpcomingVisit ? (
                    <div className="rounded-2xl border border-purple-500/25 bg-gradient-to-r from-purple-500/10 via-card to-card p-4 sm:p-5 shadow-2xs min-w-0 max-w-full">
                        <div className="row g-3 mx-0 w-full align-items-center justify-content-between">
                            <div className="col-12 col-md-7">
                                <div className="flex items-center gap-3.5 min-w-0">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-purple-500/25 bg-purple-500/15 text-purple-600 dark:text-purple-400">
                                        <Syringe className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                                                Next Scheduled Visit
                                            </span>
                                            <Badge
                                                variant="outline"
                                                className="border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300 font-medium text-[11px] px-2 py-0"
                                            >
                                                <Calendar className="mr-1 h-3 w-3" />
                                                {formatDate(nextUpcomingVisit.date)}
                                            </Badge>
                                        </div>
                                        <h3 className="text-sm font-bold text-foreground truncate mt-0.5">
                                            {nextUpcomingVisit.patient_name} — {nextUpcomingVisit.vaccine} (Dose {nextUpcomingVisit.dose_number})
                                        </h3>
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 col-md-5 d-flex flex-wrap items-center justify-content-start justify-content-md-end gap-2.5 shrink-0">
                                {/* Realtime Stock Badge */}
                                <StockBadge
                                    stockVials={nextUpcomingVisit.stock_vials}
                                    stockStatus={nextUpcomingVisit.stock_status}
                                />

                                <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className="h-8.5 gap-1.5 rounded-lg border-border/80 text-xs font-medium shadow-2xs"
                                >
                                    <Link href="/guardian/visits">
                                        <span>All Visits ({appointments.length})</span>
                                        <ArrowRight className="h-3.5 w-3.5 ml-0.5 text-muted-foreground" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 sm:p-5 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 shrink-0" />
                        <span>
                            All registered children are up to date on scheduled clinic visits. Health center staff will book future milestone doses during routine check-ups.
                        </span>
                    </div>
                )}

                {/* Small, Compact Children List Section */}
                <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold tracking-tight text-foreground">
                                My Children
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Compact pediatric records with live vaccine inventory status.
                            </p>
                        </div>

                        <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                            <Link href="/guardian/children">
                                <span>Full records page ({children.length})</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </Button>
                    </div>

                    {children.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="py-12 text-center text-sm text-muted-foreground">
                                <Baby className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
                                <p className="font-semibold text-foreground">No child records linked yet</p>
                                <p className="mt-1 text-xs">
                                    Please visit the Barangay Bugo Health Center with your child's birth certificate to link them to your guardian account.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-2.5">
                            {children.map((child) => {
                                const progress = child.routine_progress_percent ?? 0;
                                const nextAppt = child.next_appointment;

                                return (
                                    <div
                                        key={child.id}
                                        className="group rounded-xl border border-border/70 bg-card p-4 shadow-2xs transition-all hover:border-border hover:shadow-xs min-w-0 max-w-full"
                                    >
                                        <div className="row g-3 mx-0 w-full align-items-center justify-content-between">
                                            {/* Child Identity */}
                                            <div className="col-12 col-lg-5">
                                                <div className="flex items-center gap-3.5 min-w-0">
                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary font-bold text-sm">
                                                        {child.name.charAt(0).toUpperCase()}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h3 className="text-sm font-bold text-foreground truncate">
                                                                {child.name}
                                                            </h3>
                                                            {child.nickname && (
                                                                <span className="text-xs text-muted-foreground">
                                                                    ({child.nickname})
                                                                </span>
                                                            )}
                                                            {statusBadge(child.portal_status)}
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                            <span className="font-mono text-[11px] font-medium text-foreground/80">
                                                                {child.patient_id}
                                                            </span>
                                                            <span>•</span>
                                                            <span>{child.sex}</span>
                                                            {child.age_display && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span>{child.age_display}</span>
                                                                </>
                                                            )}
                                                            <span>•</span>
                                                            <span>Born {formatDate(child.date_of_birth)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Center / Routine Progress Pill */}
                                            <div className="col-12 col-sm-6 col-lg-3">
                                                <div className="space-y-1 max-w-[200px]">
                                                    <div className="flex items-center justify-between text-[11px]">
                                                        <span className="text-muted-foreground">EPI Progress</span>
                                                        <span className="font-mono font-semibold text-foreground">{child.documented_doses}/12</span>
                                                    </div>
                                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
                                                        <div
                                                            className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                                                            style={{ width: `${Math.max(5, progress)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right / Actions */}
                                            <div className="col-12 col-sm-6 col-lg-4 d-flex align-items-center justify-content-start justify-content-lg-end gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openQrForChild(child.id)}
                                                    className="h-8 gap-1.5 rounded-lg border-border/70 text-xs font-medium shadow-2xs hover:border-primary/40 hover:bg-primary/5"
                                                    title="Open QR check-in pass"
                                                >
                                                    <QrCode className="h-3.5 w-3.5 text-primary" />
                                                    <span>QR Pass</span>
                                                </Button>

                                                <Button
                                                    asChild
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 gap-1.5 rounded-lg border-border/70 text-xs font-medium shadow-2xs hover:border-primary/40 hover:bg-primary/5"
                                                >
                                                    <Link href={`/guardian/children/${child.id}`}>
                                                        <span>Bakuna Card</span>
                                                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Child Next Dose & Live Inventory Banner */}
                                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2.5 rounded-lg border border-border/50 bg-muted/20 px-3 py-2 text-xs">
                                            <div className="flex items-center gap-2 min-w-0">
                                                {child.overdue_count > 0 ? (
                                                    <>
                                                        <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                                                        <span className="text-red-700 dark:text-red-400 font-medium">
                                                            {child.overdue_count} overdue dose — please visit the clinic
                                                        </span>
                                                    </>
                                                ) : nextAppt ? (
                                                    <>
                                                        <Syringe className="h-4 w-4 shrink-0 text-blue-600" />
                                                        <span className="truncate">
                                                            Next: <strong>{nextAppt.vaccine}</strong> (Dose {nextAppt.dose_number}) on {formatDate(nextAppt.date)}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                                                        <span className="text-muted-foreground">
                                                            Routine immunization doses up to date for this age milestone
                                                        </span>
                                                    </>
                                                )}
                                            </div>

                                            {/* Realtime Vaccine Stock Badge */}
                                            {nextAppt && (
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <span className="text-[11px] text-muted-foreground hidden sm:inline">Center Stock:</span>
                                                    <StockBadge
                                                        stockVials={nextAppt.stock_vials}
                                                        stockStatus={nextAppt.stock_status}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Health Center Information Card */}
                <Card className="rounded-2xl border-border/60 bg-card/60 shadow-2xs">
                    <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                                <Building2 className="h-4 w-4 text-primary" />
                                <span>Barangay Bugo Health Center — Pediatric Services</span>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                Pediatric Immunization Clinic: <strong>Wednesdays, 8:00 AM – 11:30 AM</strong>.
                                <br className="hidden sm:inline" /> Located at Zone 2, Bugo, Cagayan de Oro City.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                            <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 rounded-lg border-border/70 text-xs font-medium"
                            >
                                <Link href="/guardian/visits">
                                    <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span>Check Schedule</span>
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

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