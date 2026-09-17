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
    Calendar,
    CalendarDays,
    CheckCircle2,
    Clock3,
    QrCode,
    Syringe,
} from 'lucide-react';
import React, { useState } from 'react';
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
    {
        title: 'My Children',
        href: '/guardian/children',
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

export default function GuardianChildrenIndex({
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

    const qrChildrenList: QrChildItem[] = children.map((c) => ({
        id: c.id,
        patient_id: c.patient_id,
        name: c.name,
        date_of_birth: c.date_of_birth,
        qr_code_value: c.qr_code_value || `/patients/${c.id}`,
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Children - Guardian Portal - Barangay Bugo" />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                {/* Header Section */}
                <div className="row g-3 align-items-center justify-content-between border-b border-border/60 pb-5">
                    <div className="col-12 col-sm-8 space-y-1">
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                My Children
                            </h1>
                            <Badge variant="outline" className="border-border/80 font-medium text-xs">
                                {children.length} {children.length === 1 ? 'Child' : 'Children'} on file
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Pediatric health records, routine vaccine progress, and official digital immunization baby books.
                        </p>
                    </div>

                    {children.length > 0 && (
                        <div className="col-12 col-sm-4 d-flex justify-content-start justify-content-sm-end">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setSelectedChildForQr(children[0]?.id);
                                    setQrModalOpen(true);
                                }}
                                className="h-9 gap-2 rounded-xl border-border/80 bg-card/60 hover:bg-accent text-xs font-medium shadow-2xs"
                            >
                                <QrCode className="h-4 w-4 text-primary" />
                                <span>Check-In QR Pass</span>
                            </Button>
                        </div>
                    )}
                </div>

                {/* Children List */}
                {children.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="py-14 text-center text-sm text-muted-foreground">
                            <Baby className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
                            <p className="text-base font-semibold text-foreground">
                                No children registered yet
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
                                Please visit the Barangay Bugo Health Center with your child's birth certificate to link them to your guardian account.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {children.map((child) => {
                            const progress = child.routine_progress_percent ?? 0;
                            const nextAppt = child.next_appointment;

                            return (
                                <div
                                    key={child.id}
                                    className="group rounded-xl border border-border/70 bg-card p-4 sm:p-5 shadow-2xs transition-all hover:border-border hover:shadow-xs"
                                >
                                    <div className="row g-3 align-items-center justify-content-between">
                                        {/* Child Identity */}
                                        <div className="col-12 col-lg-5">
                                            <div className="flex items-center gap-3.5 min-w-0">
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary font-bold text-base">
                                                    {child.name.charAt(0).toUpperCase()}
                                                </div>

                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h2 className="text-base font-bold text-foreground truncate">
                                                            {child.name}
                                                        </h2>
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
                                                                <span className="font-medium text-foreground">
                                                                    {child.age_display}
                                                                </span>
                                                            </>
                                                        )}
                                                        <span>•</span>
                                                        <span>DOB: {formatDate(child.date_of_birth)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* EPI Progress */}
                                        <div className="col-12 col-sm-6 col-lg-3">
                                            <div className="space-y-1 max-w-[220px]">
                                                <div className="flex items-center justify-between text-[11px]">
                                                    <span className="text-muted-foreground font-medium">Routine EPI</span>
                                                    <span className="font-mono font-semibold text-foreground">
                                                        {child.documented_doses}/12 ({progress}%)
                                                    </span>
                                                </div>
                                                <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
                                                    <div
                                                        className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                                                        style={{ width: `${Math.max(5, progress)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="col-12 col-sm-6 col-lg-4 d-flex align-items-center justify-content-start justify-content-lg-end gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openQrForChild(child.id)}
                                                className="h-8.5 gap-1.5 rounded-lg border-border/70 text-xs font-medium shadow-2xs hover:border-primary/40 hover:bg-primary/5"
                                                title="Open QR check-in pass"
                                            >
                                                <QrCode className="h-3.5 w-3.5 text-primary" />
                                                <span>QR Pass</span>
                                            </Button>

                                            <Button
                                                asChild
                                                variant="outline"
                                                size="sm"
                                                className="h-8.5 gap-1.5 rounded-lg border-border/70 text-xs font-medium shadow-2xs hover:border-primary/40 hover:bg-primary/5"
                                            >
                                                <Link href={`/guardian/children/${child.id}`}>
                                                    <span>Digital Bakuna Card</span>
                                                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Next Dose & Realtime Stock Banner */}
                                    <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/50 bg-muted/20 px-3.5 py-2.5 text-xs">
                                        <div className="flex items-center gap-2 min-w-0">
                                            {child.overdue_count > 0 ? (
                                                <>
                                                    <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                                                    <span className="text-red-700 dark:text-red-400 font-medium">
                                                        {child.overdue_count} overdue dose — please visit the health center for routine catch-up
                                                    </span>
                                                </>
                                            ) : nextAppt ? (
                                                <>
                                                    <Syringe className="h-4 w-4 shrink-0 text-blue-600" />
                                                    <span className="truncate">
                                                        Next Scheduled Dose: <strong>{nextAppt.vaccine}</strong> (Dose {nextAppt.dose_number}) on {formatDate(nextAppt.date)}
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

                                        {/* Realtime Vaccine Stock Indicator */}
                                        {nextAppt && (
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="text-[11px] text-muted-foreground font-medium">
                                                    Health Center Stock:
                                                </span>
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
