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
import { QRCodeSVG } from 'qrcode.react';
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
    recommended_age?: string | null;
    interval?: string | null;
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
    address?: string | null;
    mother_name?: string | null;
    father_name?: string | null;
    guardian_relationship?: string | null;
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

const parseDate = (date: string | null) => {
    if (!date) {
        return null;
    }

    const datePart = date.split('T')[0];
    const parts = datePart.split('-');

    if (parts.length !== 3) {
        return null;
    }

    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    if (
        Number.isNaN(year) ||
        Number.isNaN(month) ||
        Number.isNaN(day)
    ) {
        return null;
    }

    const parsed = new Date(year, month - 1, day);

    if (Number.isNaN(parsed.getTime())) {
        return null;
    }

    return parsed;
};

const formatCompactDate = (date: string | null) => {
    const parsed = parseDate(date);

    if (!parsed) {
        return '—';
    }

    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    const year = String(parsed.getFullYear()).slice(-2);

    return `${month}/${day}/${year}`;
};

const formatRecommendedAge = (age: string | null | undefined) => {
    if (!age) {
        return '—';
    }

    const normalized = age.trim().toLowerCase();

    if (
        normalized === '0 days' ||
        normalized === '0 day' ||
        normalized === 'at birth'
    ) {
        return 'At birth';
    }

    return age
        .replace(/(\d+)\.25\b/g, '$1¼')
        .replace(/(\d+)\.5\b/g, '$1½')
        .replace(/(\d+)\.50\b/g, '$1½')
        .replace(/(\d+)\.75\b/g, '$1¾');
};

const getVaccineRemarks = (vaccine: ImmunizationCardVaccine) => {
    const remarks = vaccine.doses
        .filter((dose) => Boolean(dose.record?.remarks || dose.record?.batch_number))
        .map((dose) => {
            const parts: string[] = [];
            if (dose.record?.remarks) parts.push(dose.record.remarks);
            if (dose.record?.batch_number) parts.push(`Lot #${dose.record.batch_number}`);
            return `D${dose.dose_number}: ${parts.join(' - ')}`;
        });

    if (remarks.length === 0) {
        return '—';
    }

    return remarks.join(' • ');
};

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

    const patientUrl =
        typeof window !== 'undefined'
            ? `${window.location.origin}/patients/${patient.id}`
            : `/patients/${patient.id}`;

    const handlePrint = () => {
        setActiveTab('card');
        setTimeout(() => {
            window.print();
        }, 100);
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
                <div className={activeTab === 'card' ? 'block' : 'hidden print:block'}>
                    <Card className="immunization-print-area rounded-2xl border-border/70 bg-card shadow-xs overflow-hidden">
                        <style>{`
                            .print-only {
                                display: none;
                            }

                            @media print {
                                @page {
                                    size: A4 landscape;
                                    margin: 6mm 8mm;
                                }

                                html, body {
                                    background: #fff !important;
                                    margin: 0 !important;
                                    padding: 0 !important;
                                }

                                body * {
                                    visibility: hidden !important;
                                }

                                .immunization-print-area,
                                .immunization-print-area * {
                                    visibility: visible !important;
                                }

                                .immunization-print-area {
                                    position: absolute !important;
                                    left: 0 !important;
                                    top: 0 !important;
                                    width: 100% !important;
                                    border: 0 !important;
                                    box-shadow: none !important;
                                    background: #fff !important;
                                    color: #000 !important;
                                    padding: 0 !important;
                                    margin: 0 !important;
                                    page-break-inside: avoid !important;
                                    break-inside: avoid !important;
                                }

                                .immunization-print-area .no-print {
                                    display: none !important;
                                }

                                .immunization-print-area .print-only {
                                    display: block !important;
                                }

                                .immunization-print-area .print-header-container {
                                    border-bottom: 2px solid #000 !important;
                                    padding: 4px 6px 6px 6px !important;
                                }

                                .immunization-print-area .print-header-grid {
                                    display: grid !important;
                                    grid-template-columns: 1fr auto !important;
                                    gap: 16px !important;
                                    align-items: center !important;
                                }

                                .immunization-print-area .print-header-title {
                                    font-size: 16px !important;
                                    font-weight: 700 !important;
                                    margin: 2px 0 0 0 !important;
                                    line-height: 1.15 !important;
                                }

                                .immunization-print-area .print-header-sub {
                                    font-size: 8.5px !important;
                                    letter-spacing: 0.15em !important;
                                    font-weight: 600 !important;
                                    text-transform: uppercase !important;
                                    margin: 0 !important;
                                }

                                .immunization-print-area .print-patient-grid {
                                    margin-top: 5px !important;
                                    display: grid !important;
                                    grid-template-columns: repeat(4, auto) !important;
                                    justify-content: space-between !important;
                                    gap: 12px !important;
                                    font-size: 9.5px !important;
                                    line-height: 1.2 !important;
                                }

                                .immunization-print-area .print-qr-box {
                                    display: flex !important;
                                    flex-direction: column !important;
                                    align-items: center !important;
                                    justify-content: center !important;
                                    border: 1px solid #000 !important;
                                    padding: 3px 5px !important;
                                    background: #fff !important;
                                    flex-shrink: 0 !important;
                                }

                                .immunization-print-area .print-qr-box svg {
                                    display: block !important;
                                    width: 52px !important;
                                    height: 52px !important;
                                }

                                .immunization-print-area .print-qr-box p {
                                    font-size: 7px !important;
                                    line-height: 1.1 !important;
                                    margin: 1px 0 0 0 !important;
                                }

                                .immunization-print-area .immunization-table-wrapper {
                                    display: block !important;
                                    overflow: visible !important;
                                    border: 1.5px solid #000 !important;
                                    border-radius: 0 !important;
                                    margin-top: 6px !important;
                                }

                                .immunization-print-area table {
                                    min-width: 0 !important;
                                    width: 100% !important;
                                    border-collapse: collapse !important;
                                    table-layout: fixed !important;
                                    color: #000 !important;
                                    font-size: 9.5px !important;
                                }

                                .immunization-print-area thead {
                                    display: table-header-group !important;
                                }

                                .immunization-print-area thead tr {
                                    border-bottom: 1.5px solid #000 !important;
                                    background: #f3f4f6 !important;
                                    -webkit-print-color-adjust: exact !important;
                                    print-color-adjust: exact !important;
                                }

                                .immunization-print-area th {
                                    border-right: 1px solid #000 !important;
                                    border-color: #000 !important;
                                    padding: 4px 5px !important;
                                    font-size: 9.5px !important;
                                    font-weight: 700 !important;
                                    text-align: center !important;
                                    line-height: 1.2 !important;
                                    background: #f3f4f6 !important;
                                }

                                .immunization-print-area th:last-child {
                                    border-right: 0 !important;
                                }

                                .immunization-print-area tbody {
                                    display: table-row-group !important;
                                }

                                .immunization-print-area tbody tr {
                                    border-bottom: 1px solid #000 !important;
                                    page-break-inside: avoid !important;
                                    break-inside: avoid !important;
                                }

                                .immunization-print-area tbody tr:last-child {
                                    border-bottom: 0 !important;
                                }

                                .immunization-print-area td {
                                    border-right: 1px solid #000 !important;
                                    border-color: #000 !important;
                                    padding: 2px 4px !important;
                                    font-size: 9.5px !important;
                                    line-height: 1.2 !important;
                                    vertical-align: middle !important;
                                }

                                .immunization-print-area td:last-child {
                                    border-right: 0 !important;
                                }

                                .immunization-print-area td > div,
                                .immunization-print-area td [class*="min-h-"] {
                                    min-height: 42px !important;
                                    height: auto !important;
                                    padding-top: 2px !important;
                                    padding-bottom: 2px !important;
                                }

                                .immunization-print-area .text-sm {
                                    font-size: 9.5px !important;
                                    line-height: 1.2 !important;
                                }

                                .immunization-print-area .text-xs {
                                    font-size: 8px !important;
                                    line-height: 1.1 !important;
                                }

                                .immunization-print-area .text-base {
                                    font-size: 9.5px !important;
                                }

                                .immunization-print-area [class*="text-[10px]"] {
                                    font-size: 7.5px !important;
                                }

                                .immunization-print-area .text-muted-foreground {
                                    color: #333 !important;
                                }

                                .immunization-print-area .badge,
                                .immunization-print-area [class*="Badge"] {
                                    border-color: #555 !important;
                                    padding: 0 3px !important;
                                    font-size: 7.5px !important;
                                    margin-top: 2px !important;
                                }

                                .immunization-print-area .print-signatures-container {
                                    margin-top: 12px !important;
                                    padding: 0 12px 2px 12px !important;
                                    page-break-inside: avoid !important;
                                    break-inside: avoid !important;
                                }

                                .immunization-print-area .print-signatures-grid {
                                    display: grid !important;
                                    grid-template-columns: 1fr 1fr !important;
                                    gap: 48px !important;
                                    text-align: center !important;
                                    font-size: 9px !important;
                                }

                                .immunization-print-area .print-signature-line {
                                    border-top: 1px solid #000 !important;
                                    padding-top: 3px !important;
                                }

                                .immunization-print-area .print-footer-text {
                                    margin-top: 4px !important;
                                    text-align: center !important;
                                    font-size: 7.5px !important;
                                    color: #555 !important;
                                }
                            }
                        `}</style>

                        {/* Dedicated Official DOH Print Header */}
                        <div className="print-only border-b-2 border-black px-4 pb-2 pt-1 print-header-container">
                            <div className="print-header-grid">
                                <div>
                                    <div className="text-center">
                                        <p className="print-header-sub">
                                            Republic of the Philippines · Department of Health
                                        </p>
                                        <p className="print-header-sub font-bold">
                                            Barangay Bugo Health Center — Cagayan de Oro City
                                        </p>
                                        <h1 className="print-header-title">
                                            Child Immunization Record (Bakuna Card)
                                        </h1>
                                    </div>

                                    <div className="print-patient-grid">
                                        <div>
                                            <span className="font-semibold">Patient:</span>{' '}
                                            {patientName}
                                        </div>

                                        <div>
                                            <span className="font-semibold">Patient ID:</span>{' '}
                                            {patient.patient_id}
                                        </div>

                                        <div>
                                            <span className="font-semibold">Date of Birth:</span>{' '}
                                            {formatDate(patient.date_of_birth)}
                                        </div>

                                        <div>
                                            <span className="font-semibold">Age / Sex:</span>{' '}
                                            {patient.age_display || '—'} / {patient.sex}
                                        </div>

                                        {patient.address && (
                                            <div style={{ gridColumn: 'span 2' }}>
                                                <span className="font-semibold">Address:</span>{' '}
                                                {patient.address}
                                            </div>
                                        )}

                                        {patient.mother_name && (
                                            <div>
                                                <span className="font-semibold">Mother:</span>{' '}
                                                {patient.mother_name}
                                            </div>
                                        )}

                                        {patient.father_name && (
                                            <div>
                                                <span className="font-semibold">Father:</span>{' '}
                                                {patient.father_name}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="print-qr-box">
                                    <QRCodeSVG
                                        value={patientUrl}
                                        size={52}
                                        level="H"
                                        marginSize={1}
                                        title={`${patientName} - ${patient.patient_id}`}
                                    />

                                    <p className="font-semibold">
                                        Scan Patient Record
                                    </p>

                                    <p>
                                        {patient.patient_id}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Official DOH Header Stamp (Screen Mode) */}
                        <div className="border-b border-border/70 bg-muted/20 px-4 py-3 sm:px-6 sm:py-4 no-print">
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

                                <div className="flex items-center gap-2 self-start sm:self-auto">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handlePrint}
                                        className="h-8 gap-1.5 text-xs font-medium"
                                    >
                                        <Printer className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span>Print Card</span>
                                    </Button>
                                    <Badge
                                        variant="outline"
                                        className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-medium py-0.5 px-2"
                                    >
                                        <Check className="mr-1 h-3 w-3" />
                                        {administeredCardDoses} Doses Completed
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <CardContent className="p-0">
                            {cardVaccines.length === 0 ? (
                                <div className="p-10 text-center text-sm text-muted-foreground">
                                    No active immunization master schedule found.
                                </div>
                            ) : (
                                <>
                                    {/* Mobile Card List View (<md, Screen only) */}
                                    <div className="block md:hidden no-print divide-y divide-border/60">
                                        {cardVaccines.flatMap((vaccine) =>
                                            vaccine.doses.map((doseItem) => {
                                                const record = doseItem.record;
                                                const schedule = doseItem.schedule;
                                                const isDone = Boolean(record);
                                                const isScheduled = !isDone && Boolean(schedule);
                                                const targetAge =
                                                    formatRecommendedAge(doseItem.recommended_age) !== '—'
                                                        ? formatRecommendedAge(doseItem.recommended_age)
                                                        : getRecommendedAge(
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
                                                                    {vaccine.category !== 'routine' && (
                                                                        <Badge
                                                                            variant="outline"
                                                                            className="text-[10px] py-0 px-1 text-muted-foreground capitalize"
                                                                        >
                                                                            {vaccine.category}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <div className="text-[11px] text-muted-foreground mt-0.5">
                                                                    Target Age: <span className="font-medium text-foreground">{targetAge}</span>
                                                                </div>
                                                            </div>

                                                            {/* Status Badge */}
                                                            <div className="shrink-0">
                                                                {isDone ? (
                                                                    <div className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                                                                        <CheckCircle2 className="h-3 w-3" />
                                                                        <span>{formatCompactDate(record?.date_administered ?? null)}</span>
                                                                    </div>
                                                                ) : isScheduled ? (
                                                                    <div className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:text-blue-400">
                                                                        <Clock3 className="h-3 w-3" />
                                                                        <span>Due: {formatCompactDate(schedule?.scheduled_date ?? null)}</span>
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

                                    {/* Desktop & Official Print Table (Matches Immunization History in Patient View Details) */}
                                    <div className="hidden md:block print:block overflow-x-auto rounded-lg border-2 immunization-table-wrapper">
                                        <table className="w-full min-w-[980px] table-fixed border-collapse text-sm">
                                            <thead>
                                                <tr className="border-b-2 bg-muted/40">
                                                    <th className="w-[17%] border-r-2 px-3 py-3 text-center font-bold">
                                                        Bakuna
                                                    </th>
                                                    <th className="w-[7%] border-r-2 px-2 py-3 text-center font-bold">
                                                        Doses
                                                    </th>
                                                    <th className="w-[20%] border-r-2 px-3 py-3 text-center font-bold">
                                                        Recommended Age
                                                    </th>
                                                    <th className="w-[38%] border-r-2 px-3 py-3 text-center font-bold">
                                                        <span className="block">Petsa ng Bakuna</span>
                                                        <span className="mt-0.5 block text-xs font-medium text-muted-foreground">
                                                            MM/DD/YY
                                                        </span>
                                                    </th>
                                                    <th className="w-[18%] px-3 py-3 text-center font-bold">
                                                        Remarks
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {cardVaccines.map((vaccine) => (
                                                    <tr
                                                        key={vaccine.vaccine_id}
                                                        className="border-b-2 last:border-b-0"
                                                    >
                                                        {/* Vaccine */}
                                                        <td className="border-r-2 px-3 py-4 text-center align-middle">
                                                            <p className="font-bold">
                                                                {vaccine.vaccine_name}
                                                            </p>
                                                            {vaccine.category !== 'routine' && (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="mt-2 capitalize"
                                                                >
                                                                    {vaccine.category}
                                                                </Badge>
                                                            )}
                                                        </td>

                                                        {/* Dose Count */}
                                                        <td className="border-r-2 px-2 py-4 text-center align-middle">
                                                            <span className="text-base font-bold">
                                                                {vaccine.required_doses}
                                                            </span>
                                                        </td>

                                                        {/* Recommended Age */}
                                                        <td className="border-r-2 p-0 align-stretch">
                                                            <div
                                                                className="grid h-full"
                                                                style={{
                                                                    gridTemplateColumns: `repeat(${Math.max(
                                                                        vaccine.doses.length,
                                                                        1,
                                                                    )}, minmax(0, 1fr))`,
                                                                }}
                                                            >
                                                                {vaccine.doses.map((dose) => {
                                                                    const targetAge =
                                                                        formatRecommendedAge(dose.recommended_age) !== '—'
                                                                            ? formatRecommendedAge(dose.recommended_age)
                                                                            : getRecommendedAge(
                                                                                  vaccine.vaccine_name,
                                                                                  dose.dose_number,
                                                                              );

                                                                    return (
                                                                        <div
                                                                            key={`age-${vaccine.vaccine_id}-${dose.dose_number}`}
                                                                            className="relative flex min-h-[72px] min-w-0 items-center justify-center border-r-2 px-2 text-center last:border-r-0"
                                                                        >
                                                                            <span className="absolute left-1.5 top-1 text-[10px] font-bold text-muted-foreground">
                                                                                {dose.dose_number}
                                                                            </span>
                                                                            <span className="text-sm font-medium leading-5 text-muted-foreground">
                                                                                {targetAge}
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </td>

                                                        {/* Vaccine Dates */}
                                                        <td className="border-r-2 p-0 align-stretch">
                                                            <div
                                                                className="grid h-full"
                                                                style={{
                                                                    gridTemplateColumns: `repeat(${Math.max(
                                                                        vaccine.doses.length,
                                                                        1,
                                                                    )}, minmax(0, 1fr))`,
                                                                }}
                                                            >
                                                                {vaccine.doses.map((dose) => {
                                                                    const isDone = Boolean(dose.record?.date_administered);
                                                                    const isScheduled = !isDone && Boolean(dose.schedule?.scheduled_date);

                                                                    return (
                                                                        <div
                                                                            key={`${vaccine.vaccine_id}-${dose.dose_number}`}
                                                                            className="relative flex min-h-[72px] min-w-0 flex-col justify-center border-r-2 px-2 py-3 last:border-r-0 text-center"
                                                                        >
                                                                            <span className="absolute left-1.5 top-1 text-[10px] font-bold text-muted-foreground">
                                                                                {dose.dose_number}
                                                                            </span>

                                                                            {isDone ? (
                                                                                <span className="font-semibold text-foreground">
                                                                                    {formatCompactDate(dose.record?.date_administered ?? null)}
                                                                                </span>
                                                                            ) : isScheduled ? (
                                                                                <div className="flex flex-col items-center">
                                                                                    <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400 no-print">
                                                                                        Due: {formatCompactDate(dose.schedule?.scheduled_date ?? null)}
                                                                                    </span>
                                                                                    <span className="text-[11px] font-medium text-muted-foreground print-only">
                                                                                        Due: {formatCompactDate(dose.schedule?.scheduled_date ?? null)}
                                                                                    </span>
                                                                                </div>
                                                                            ) : (
                                                                                <span className="text-muted-foreground">
                                                                                    —
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </td>

                                                        {/* Remarks */}
                                                        <td className="px-3 py-3 align-middle">
                                                            <p
                                                                className={
                                                                    getVaccineRemarks(vaccine) === '—'
                                                                        ? 'text-center text-muted-foreground'
                                                                        : 'text-xs leading-5'
                                                                }
                                                            >
                                                                {getVaccineRemarks(vaccine)}
                                                            </p>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </CardContent>

                        {/* Official Signatures for Print */}
                        <div className="print-only print-signatures-container">
                            <div className="print-signatures-grid">
                                <div>
                                    <div className="print-signature-line">
                                        Parent / Guardian Signature
                                    </div>
                                </div>

                                <div>
                                    <div className="print-signature-line">
                                        Health Center Physician / Nurse / Midwife
                                    </div>
                                </div>
                            </div>

                            <p className="print-footer-text">
                                Printed from Barangay Bugo Health Center Pediatric Immunization Management System
                            </p>
                        </div>
                    </Card>
                </div>

                {/* TAB 2: UPCOMING VISITS */}
                {activeTab === 'schedules' && (
                    <div className="print:hidden">
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
                    </div>
                )}

                {/* TAB 3: ADMINISTERED HISTORY LOG */}
                {activeTab === 'history' && (
                    <div className="print:hidden">
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
                    </div>
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
