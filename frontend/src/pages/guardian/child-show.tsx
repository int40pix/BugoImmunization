import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Baby,
    Calendar,
    CalendarDays,
    Check,
    CheckCircle2,
    Clock3,
    FileText,
    History,
    Printer,
    QrCode,
    ShieldCheck,
    Sparkles,
    Syringe,
    UserRound,
} from 'lucide-react';
import React, { useState } from 'react';
import ChildQrModal, { type QrChildItem } from './components/child-qr-modal';
import { StockBadge } from './components/stock-badge';

type RecordItem = {
    id: number;
    vaccine: string;
    dose_number: number;
    date_administered: string | null;
    source: string | null;
    batch_number?: string | null;
    remarks: string | null;
    administered_by?: {
        id: number;
        name: string;
    } | null;
};

type ScheduleItem = {
    id: number;
    vaccine_id?: number;
    vaccine: string;
    dose_number: number;
    scheduled_date: string | null;
    stock_vials?: number;
    stock_status?: string;
};

type ImmunizationCardDose = {
    dose_number: number;
    record: {
        id: number;
        dose_number: number;
        date_administered: string | null;
        source: string | null;
        batch_number?: string | null;
        remarks: string | null;
        administered_by?: {
            id: number;
            name: string;
        } | null;
    } | null;
    schedule: {
        id: number;
        scheduled_date: string | null;
        status: string;
        stock_vials?: number;
        stock_status?: string;
    } | null;
};

type ImmunizationCardVaccine = {
    vaccine_id: number;
    vaccine_name: string;
    category: string;
    required_doses: number;
    stock_vials?: number;
    doses: ImmunizationCardDose[];
};

type Sibling = {
    id: number;
    patient_id: string;
    name: string;
    nickname: string | null;
};

type Patient = {
    id: number;
    patient_id: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    nickname: string | null;
    date_of_birth: string | null;
    age_display?: string | null;
    sex: string;
    status: string;
    qr_code_value?: string;
    records: RecordItem[];
    schedules: ScheduleItem[];
    immunization_card?: ImmunizationCardVaccine[];
};

type Props = {
    guardian: {
        id: number;
        name: string;
        guardian_no?: string;
        contact_number?: string | null;
    };
    patient: Patient;
    siblings?: Sibling[];
};

function formatDate(value: string | null) {
    if (!value) {
        return '—';
    }

    const [year, month, day] = value.split('-').map(Number);

    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function getRecommendedAge(vaccineName: string, doseNumber: number): string {
    const v = vaccineName.toLowerCase();
    if (v.includes('bcg')) return 'At Birth';
    if (v.includes('hepa') || v.includes('hepatitis b')) return 'At Birth';
    if (v.includes('pentavalent') || v.includes('penta') || v.includes('dpt')) {
        if (doseNumber === 1) return '6 Weeks (1½ mos)';
        if (doseNumber === 2) return '10 Weeks (2½ mos)';
        if (doseNumber === 3) return '14 Weeks (3½ mos)';
    }
    if (v.includes('opv') || v.includes('oral polio')) {
        if (doseNumber === 1) return '6 Weeks';
        if (doseNumber === 2) return '10 Weeks';
        if (doseNumber === 3) return '14 Weeks';
    }
    if (v.includes('ipv') || v.includes('inactivated polio')) {
        if (doseNumber === 1) return '14 Weeks (3½ mos)';
        if (doseNumber === 2) return '9 Months';
    }
    if (v.includes('pcv') || v.includes('pneumococcal')) {
        if (doseNumber === 1) return '6 Weeks';
        if (doseNumber === 2) return '10 Weeks';
        if (doseNumber === 3) return '14 Weeks';
    }
    if (v.includes('mmr') || v.includes('measles')) {
        if (doseNumber === 1) return '9 Months';
        if (doseNumber === 2) return '12 Months (1 yr)';
    }
    return `Dose ${doseNumber}`;
}

export default function GuardianChildShow({
    guardian,
    patient,
    siblings = [],
}: Props) {
    const [qrModalOpen, setQrModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'card' | 'schedules' | 'history'>('card');

    const patientName = [
        patient.first_name,
        patient.middle_name,
        patient.last_name,
    ]
        .filter(Boolean)
        .join(' ');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Guardian Dashboard',
            href: '/guardian/dashboard',
        },
        {
            title: 'My Children',
            href: '/guardian/children',
        },
        {
            title: patient.nickname || patient.first_name,
            href: `/guardian/children/${patient.id}`,
        },
    ];

    const qrChildrenList: QrChildItem[] = [
        {
            id: patient.id,
            patient_id: patient.patient_id,
            name: patientName,
            date_of_birth: patient.date_of_birth,
            qr_code_value: patient.qr_code_value || `/patients/${patient.id}`,
        },
        ...siblings
            .filter((s) => s.id !== patient.id)
            .map((s) => ({
                id: s.id,
                patient_id: s.patient_id,
                name: s.name,
                qr_code_value: `/patients/${s.id}`,
            })),
    ];

    const handlePrint = () => {
        window.print();
    };

    const cardVaccines = patient.immunization_card ?? [];
    const totalCardDoses = cardVaccines.reduce((acc, v) => acc + v.required_doses, 0);
    const administeredCardDoses = cardVaccines.reduce(
        (acc, v) => acc + v.doses.filter((d) => Boolean(d.record)).length,
        0,
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${patientName} - Bakuna Card - Barangay Bugo`} />

            <div className="space-y-4 sm:space-y-6 p-2.5 sm:p-4 lg:p-6 max-w-7xl mx-auto w-full">
                {/* Sibling Switcher & Back Button Row */}
                <div className="row g-2 align-items-center justify-content-between print:hidden">
                    <div className="col-auto">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            asChild
                            className="h-7.5 sm:h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                        >
                            <Link href="/guardian/children">
                                <ArrowLeft className="h-3.5 w-3.5" />
                                <span>Back to Children List</span>
                            </Link>
                        </Button>
                    </div>

                    {/* Sibling Switcher Pills */}
                    {siblings.length > 1 && (
                        <div className="col-auto">
                            <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border/60 bg-muted/40 p-1 text-xs font-medium">
                                <span className="px-2 text-muted-foreground hidden sm:inline text-[11px]">
                                    Switch Child:
                                </span>
                                {siblings.map((sib) => (
                                    <Link
                                        key={sib.id}
                                        href={`/guardian/children/${sib.id}`}
                                        className={`rounded-lg px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs font-medium transition-all ${
                                            sib.id === patient.id
                                                ? 'bg-background text-foreground shadow-2xs font-semibold'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        {sib.nickname || sib.name.split(' ')[0]}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Child Profile Card */}
                <div className="rounded-2xl border border-border/70 bg-card p-3.5 sm:p-5 shadow-xs">
                    <div className="row g-3 align-items-center justify-content-between">
                        <div className="col-12 col-md-8">
                            <div className="flex items-start gap-3 sm:gap-4">
                                <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl border border-primary/20 bg-primary/10 text-primary font-bold text-lg sm:text-xl">
                                    {patient.first_name ? patient.first_name.charAt(0).toUpperCase() : 'C'}
                                </div>

                                <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                                            {patientName}
                                        </h1>
                                        {patient.nickname && (
                                            <Badge
                                                variant="outline"
                                                className="border-primary/30 bg-primary/5 text-primary text-xs font-medium"
                                            >
                                                aka &ldquo;{patient.nickname}&rdquo;
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                        <span className="font-mono font-medium text-foreground">
                                            ID: {patient.patient_id}
                                        </span>
                                        <span>•</span>
                                        <span>{patient.sex}</span>
                                        {patient.age_display && (
                                            <>
                                                <span>•</span>
                                                <span className="font-medium text-foreground">
                                                    {patient.age_display}
                                                </span>
                                            </>
                                        )}
                                        <span>•</span>
                                        <span>Born: {formatDate(patient.date_of_birth)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Top Profile Actions */}
                        <div className="col-12 col-md-4 d-flex flex-wrap items-center justify-content-start justify-content-md-end gap-2 print:hidden">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setQrModalOpen(true)}
                                className="h-7.5 sm:h-8 gap-1.5 rounded-lg border-border/80 text-xs font-medium shadow-2xs hover:bg-muted"
                                title="Show Health Center check-in QR pass"
                            >
                                <QrCode className="h-3.5 w-3.5 text-primary" />
                                <span>Check-In QR</span>
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handlePrint}
                                className="h-7.5 sm:h-8 gap-1.5 rounded-lg border-border/80 text-xs font-medium shadow-2xs hover:bg-muted"
                            >
                                <Printer className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>Print Card</span>
                            </Button>
                        </div>
                    </div>

                    {/* Progress & Stat Strip */}
                    <div className="row g-2.5 border-t border-border/50 pt-3 mt-3 text-xs">
                        <div className="col-6 col-md-3">
                            <span className="text-muted-foreground">DOH Target Doses:</span>
                            <p className="font-semibold text-foreground mt-0.5">
                                12 Routine (EPI)
                            </p>
                        </div>
                        <div className="col-6 col-md-3">
                            <span className="text-muted-foreground">Completed Doses:</span>
                            <p className="font-semibold text-foreground mt-0.5 text-emerald-600 dark:text-emerald-400">
                                {administeredCardDoses} of {totalCardDoses > 0 ? totalCardDoses : 12} recorded
                            </p>
                        </div>
                        <div className="col-6 col-md-3">
                            <span className="text-muted-foreground">Upcoming Visits:</span>
                            <p className="font-semibold text-foreground mt-0.5">
                                {patient.schedules.length}{' '}
                                {patient.schedules.length === 1 ? 'visit scheduled' : 'visits scheduled'}
                            </p>
                        </div>
                        <div className="col-6 col-md-3">
                            <span className="text-muted-foreground">Linked Guardian:</span>
                            <p className="font-semibold text-foreground mt-0.5 truncate">
                                {guardian.name}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Segmented View Switcher */}
                <div className="flex max-w-full overflow-x-auto rounded-lg border border-border/60 bg-muted/40 p-1 gap-1 text-xs font-medium print:hidden">
                    <button
                        type="button"
                        onClick={() => setActiveTab('card')}
                        className={`inline-flex shrink-0 items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                            activeTab === 'card'
                                ? 'bg-background text-foreground shadow-2xs font-semibold'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <FileText className="h-3.5 w-3.5" />
                        Digital Bakuna Card (EPI Record)
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('schedules')}
                        className={`inline-flex shrink-0 items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                            activeTab === 'schedules'
                                ? 'bg-background text-foreground shadow-2xs font-semibold'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <CalendarDays className="h-3.5 w-3.5" />
                        Upcoming Visits ({patient.schedules.length})
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('history')}
                        className={`inline-flex shrink-0 items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                            activeTab === 'history'
                                ? 'bg-background text-foreground shadow-2xs font-semibold'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <History className="h-3.5 w-3.5" />
                        Administered Log ({patient.records.length})
                    </button>
                </div>

                {/* TAB 1: OFFICIAL DOH DIGITAL BAKUNA CARD */}
                {activeTab === 'card' && (
                    <Card className="rounded-2xl border-border/70 bg-card shadow-xs overflow-hidden">
                        {/* Official DOH Header Stamp */}
                        <div className="border-b border-border/70 bg-muted/20 px-4 py-3 sm:px-6 sm:py-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-primary">
                                            Republic of the Philippines · Department of Health
                                        </span>
                                    </div>
                                    <h2 className="text-sm sm:text-base font-bold text-foreground">
                                        Barangay Bugo Health Center — Child Immunization Card
                                    </h2>
                                    <p className="text-[11px] sm:text-xs text-muted-foreground">
                                        Expanded Program on Immunization (EPI) Official Record
                                    </p>
                                </div>

                                <Badge
                                    variant="outline"
                                    className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-medium self-start sm:self-auto py-0.5 px-2"
                                >
                                    <Check className="mr-1 h-3 w-3" />
                                    {administeredCardDoses} Doses Completed
                                </Badge>
                            </div>
                        </div>

                        <CardContent className="p-0">
                            {cardVaccines.length === 0 ? (
                                <div className="p-10 text-center text-sm text-muted-foreground">
                                    No active immunization master schedule found.
                                </div>
                            ) : (
                                <>
                                    {/* Mobile Card List View (<md) */}
                                    <div className="d-block d-md-none divide-y divide-border/60">
                                        {cardVaccines.flatMap((vaccine) =>
                                            vaccine.doses.map((doseItem) => {
                                                const record = doseItem.record;
                                                const schedule = doseItem.schedule;
                                                const isDone = Boolean(record);
                                                const isScheduled = !isDone && Boolean(schedule);
                                                const targetAge = getRecommendedAge(
                                                    vaccine.vaccine_name,
                                                    doseItem.dose_number,
                                                );

                                                return (
                                                    <div
                                                        key={`mobile-${vaccine.vaccine_id}-${doseItem.dose_number}`}
                                                        className={`p-3 space-y-2 transition-colors ${
                                                            isDone ? 'bg-emerald-500/[0.03]' : 'hover:bg-muted/30'
                                                        }`}
                                                    >
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div>
                                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                                    <span className="font-semibold text-foreground text-xs">
                                                                        {vaccine.vaccine_name}
                                                                    </span>
                                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-muted text-muted-foreground border border-border/50">
                                                                        Dose {doseItem.dose_number}
                                                                    </span>
                                                                    {vaccine.category === 'Optional' && (
                                                                        <Badge
                                                                            variant="outline"
                                                                            className="text-[10px] py-0 px-1 text-muted-foreground"
                                                                        >
                                                                            Optional
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <div className="text-[11px] text-muted-foreground mt-0.5">
                                                                    Milestone: <span className="font-medium text-foreground">{targetAge}</span>
                                                                </div>
                                                            </div>

                                                            {/* Status Badge */}
                                                            <div className="shrink-0">
                                                                {isDone ? (
                                                                    <div className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                                                                        <CheckCircle2 className="h-3 w-3" />
                                                                        <span>{formatDate(record?.date_administered ?? null)}</span>
                                                                    </div>
                                                                ) : isScheduled ? (
                                                                    <div className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:text-blue-400">
                                                                        <Clock3 className="h-3 w-3" />
                                                                        <span>Due: {formatDate(schedule?.scheduled_date ?? null)}</span>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-[10px] text-muted-foreground/60 italic">
                                                                        Pending
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Stock & Batch info row */}
                                                        <div className="flex items-center justify-between text-[11px] border-t border-border/40 pt-1.5 text-muted-foreground">
                                                            <div>
                                                                {isDone ? (
                                                                    <span className="font-mono text-[10px]">
                                                                        {record?.batch_number ? `Batch #${record.batch_number}` : '—'}
                                                                    </span>
                                                                ) : (
                                                                    <StockBadge
                                                                        stockVials={schedule?.stock_vials ?? vaccine.stock_vials}
                                                                        stockStatus={schedule?.stock_status}
                                                                        compact={true}
                                                                    />
                                                                )}
                                                            </div>
                                                            <div>
                                                                {isDone && record?.administered_by?.name ? (
                                                                    <span className="text-[10px]">
                                                                        By: <strong className="text-foreground">{record.administered_by.name}</strong>
                                                                    </span>
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }),
                                        )}
                                    </div>

                                    {/* Desktop Table View (>=md) */}
                                    <div className="d-none d-md-block overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead className="border-b border-border/60 bg-muted/40 font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">
                                                <tr>
                                                    <th className="px-4 py-3 sm:px-6">Vaccine Name</th>
                                                    <th className="px-3 py-3">Milestone Age</th>
                                                    <th className="px-3 py-3 text-center">Dose</th>
                                                    <th className="px-4 py-3">Status / Date Given</th>
                                                    <th className="px-3 py-3">Inventory Stock</th>
                                                    <th className="px-3 py-3">Batch / Lot</th>
                                                    <th className="px-4 py-3">Administered By</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/60">
                                                {cardVaccines.flatMap((vaccine) =>
                                                    vaccine.doses.map((doseItem) => {
                                                        const record = doseItem.record;
                                                        const schedule = doseItem.schedule;
                                                        const isDone = Boolean(record);
                                                        const isScheduled = !isDone && Boolean(schedule);
                                                        const targetAge = getRecommendedAge(
                                                            vaccine.vaccine_name,
                                                            doseItem.dose_number,
                                                        );

                                                        return (
                                                            <tr
                                                                key={`${vaccine.vaccine_id}-${doseItem.dose_number}`}
                                                                className={
                                                                    isDone
                                                                        ? 'bg-emerald-500/[0.02] hover:bg-emerald-500/[0.05] transition-colors'
                                                                        : 'hover:bg-muted/30 transition-colors'
                                                                }
                                                            >
                                                                <td className="px-4 py-3 sm:px-6 font-semibold text-foreground">
                                                                    <div className="flex items-center gap-2">
                                                                        <span>{vaccine.vaccine_name}</span>
                                                                        {vaccine.category === 'Optional' && (
                                                                            <Badge
                                                                                variant="outline"
                                                                                className="text-[10px] py-0 px-1 text-muted-foreground"
                                                                            >
                                                                                Optional
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                </td>

                                                                <td className="px-3 py-3 text-muted-foreground font-medium">
                                                                    {targetAge}
                                                                </td>

                                                                <td className="px-3 py-3 text-center font-mono font-semibold">
                                                                    Dose {doseItem.dose_number}
                                                                </td>

                                                                <td className="px-4 py-3">
                                                                    {isDone ? (
                                                                        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-medium text-emerald-700 dark:text-emerald-400">
                                                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                                                            <span>{formatDate(record?.date_administered ?? null)}</span>
                                                                        </div>
                                                                    ) : isScheduled ? (
                                                                        <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 font-medium text-blue-700 dark:text-blue-400">
                                                                            <Clock3 className="h-3.5 w-3.5" />
                                                                            <span>Due: {formatDate(schedule?.scheduled_date ?? null)}</span>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-muted-foreground/60 italic">
                                                                            Pending milestone
                                                                        </span>
                                                                    )}
                                                                </td>

                                                                {/* Realtime Inventory Stock Column */}
                                                                <td className="px-3 py-3">
                                                                    {isDone ? (
                                                                        <span className="text-muted-foreground text-[11px]">—</span>
                                                                    ) : (
                                                                        <StockBadge
                                                                            stockVials={schedule?.stock_vials ?? vaccine.stock_vials}
                                                                            stockStatus={schedule?.stock_status}
                                                                            compact={true}
                                                                        />
                                                                    )}
                                                                </td>

                                                                <td className="px-3 py-3 font-mono text-[11px] text-muted-foreground">
                                                                    {record?.batch_number ? (
                                                                        <span>#{record.batch_number}</span>
                                                                    ) : (
                                                                        <span>—</span>
                                                                    )}
                                                                </td>

                                                                <td className="px-4 py-3 text-muted-foreground">
                                                                    {record?.administered_by?.name ? (
                                                                        <span className="font-medium text-foreground">
                                                                            {record.administered_by.name}
                                                                        </span>
                                                                    ) : (
                                                                        <span>—</span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    }),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* TAB 2: UPCOMING VISITS */}
                {activeTab === 'schedules' && (
                    <Card className="rounded-2xl border-border/70 bg-card shadow-xs overflow-hidden">
                        <CardHeader className="border-b border-border/60 bg-muted/20 px-6 py-4">
                            <div className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4 text-primary" />
                                <CardTitle className="text-base font-bold">
                                    Scheduled Health Center Appointments
                                </CardTitle>
                            </div>
                            <CardDescription className="text-xs">
                                Upcoming routine vaccination dates confirmed with live stock counts at Barangay Bugo Health Center.
                            </CardDescription>
                        </CardHeader>

                        {patient.schedules.length === 0 ? (
                            <CardContent className="py-12 text-center text-sm text-muted-foreground">
                                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500/60 mb-2" />
                                <p className="font-semibold text-foreground">No upcoming visits currently scheduled</p>
                                <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
                                    All doses for {patient.first_name} are up to date for this age milestone.
                                </p>
                            </CardContent>
                        ) : (
                            <div className="divide-y divide-border/60">
                                {patient.schedules.map((schedule) => (
                                    <div
                                        key={schedule.id}
                                        className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/20 transition-colors"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                                <Syringe className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-foreground">
                                                    {schedule.vaccine}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    Dose {schedule.dose_number} · Routine EPI milestone
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
                                            <StockBadge
                                                stockVials={schedule.stock_vials}
                                                stockStatus={schedule.stock_status}
                                            />

                                            <Badge
                                                variant="outline"
                                                className="border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300 font-medium px-3 py-1 text-xs"
                                            >
                                                <Calendar className="mr-1.5 h-3.5 w-3.5" />
                                                {formatDate(schedule.scheduled_date)}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                )}

                {/* TAB 3: ADMINISTERED HISTORY LOG */}
                {activeTab === 'history' && (
                    <Card className="rounded-2xl border-border/70 bg-card shadow-xs overflow-hidden">
                        <CardHeader className="border-b border-border/60 bg-muted/20 px-6 py-4">
                            <div className="flex items-center gap-2">
                                <History className="h-4 w-4 text-primary" />
                                <CardTitle className="text-base font-bold">
                                    Administration Timeline
                                </CardTitle>
                            </div>
                            <CardDescription className="text-xs">
                                Chronological log of all vaccine doses received by {patient.first_name}.
                            </CardDescription>
                        </CardHeader>

                        {patient.records.length === 0 ? (
                            <CardContent className="py-12 text-center text-sm text-muted-foreground">
                                <Syringe className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
                                <p className="font-semibold text-foreground">No administered doses on record</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Vaccines administered at the health center or verified external cards will appear here.
                                </p>
                            </CardContent>
                        ) : (
                            <div className="divide-y divide-border/60">
                                {patient.records.map((rec) => (
                                    <div
                                        key={rec.id}
                                        className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/20 transition-colors"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                                <CheckCircle2 className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-foreground">
                                                    {rec.vaccine} (Dose {rec.dose_number})
                                                </p>
                                                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                    {rec.administered_by?.name && (
                                                        <span>Given by {rec.administered_by.name}</span>
                                                    )}
                                                    {rec.batch_number && (
                                                        <span>• Batch #{rec.batch_number}</span>
                                                    )}
                                                    {rec.source && (
                                                        <span>• Source: {rec.source}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="self-start sm:self-auto">
                                            <Badge
                                                variant="outline"
                                                className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium px-3 py-1"
                                            >
                                                <Calendar className="mr-1.5 h-3.5 w-3.5" />
                                                {formatDate(rec.date_administered)}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                )}

                {/* Child QR Modal */}
                <ChildQrModal
                    open={qrModalOpen}
                    onOpenChange={setQrModalOpen}
                    childrenList={qrChildrenList}
                    selectedChildId={patient.id}
                />
            </div>
        </AppLayout>
    );
}
