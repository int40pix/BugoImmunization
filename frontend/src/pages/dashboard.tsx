import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    Boxes,
    CalendarDays,
    ChevronRight,
    Clock3,
    Syringe,
    Users,
} from 'lucide-react';

type DashboardData = {
    totalPatients: number;
    vaccinatedThisWeek: number;
    upcomingSchedules: number;
    inventoryAlerts: number;
    overdueImmunizations: number;
    currentAgeImmunizations: number;
    recentDueImmunizations: number;
};

type InventoryHealth = {
    available: number;
    lowStock: number;
    outOfStock: number;
};

type VaccineStockDemand = {
    id: number;
    name: string;
    usableStock: number;
    reservedStock: number;
    freeStock: number;
    remainingDemand: number;
    stockHealth: 'Available' | 'Low Stock' | 'Out of Stock';
    demandCoverage: 'Sufficient' | 'Insufficient' | 'No Current Demand';
};

type DashboardProps = {
    dashboard: DashboardData;
    inventoryHealth: InventoryHealth;
    vaccineStockDemand: VaccineStockDemand[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

function getStockBadge(health: string) {
    switch (health) {
        case 'Available':
            return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
        case 'Low Stock':
            return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
        case 'Out of Stock':
            return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
        default:
            return 'bg-muted text-muted-foreground border-border';
    }
}

export default function Dashboard({
    dashboard,
    inventoryHealth,
    vaccineStockDemand = [],
}: DashboardProps) {
    const stats = [
        {
            label: 'Total Registered Patients',
            value: dashboard.totalPatients,
            description: 'Pediatric records on file',
            icon: Users,
            colorClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
            onClick: () => router.visit(route('patients.index')),
        },
        {
            label: 'Vaccinated This Week',
            value: dashboard.vaccinatedThisWeek,
            description: 'Mon–Sun administered doses',
            icon: Syringe,
            colorClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
            onClick: () => router.visit(route('immunization.index')),
        },
        {
            label: 'Upcoming Schedules',
            value: dashboard.upcomingSchedules,
            description: 'Stock-backed upcoming doses',
            icon: CalendarDays,
            colorClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
            onClick: () => router.visit(route('immunization.index')),
        },
        {
            label: 'Inventory Alerts',
            value: dashboard.inventoryAlerts,
            description: 'Low-stock & depleted vaccines',
            icon: Boxes,
            colorClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
            onClick: () => router.visit(route('vaccine-inventory.index')),
        },
    ];

    const workload = [
        {
            label: 'Current Due',
            value: dashboard.currentAgeImmunizations,
            description: 'Due based on child age milestone',
            color: 'bg-blue-500',
        },
        {
            label: 'Recent Due',
            value: dashboard.recentDueImmunizations,
            description: 'Recently due doses needing review',
            color: 'bg-amber-500',
        },
        {
            label: 'Overdue',
            value: dashboard.overdueImmunizations,
            description: 'Delayed doses requiring follow-up',
            color: 'bg-red-500',
        },
        {
            label: 'Scheduled',
            value: dashboard.upcomingSchedules,
            description: 'Confirmed doses with stock reserved',
            color: 'bg-purple-500',
        },
    ];

    const maxWorkload = Math.max(1, ...workload.map((item) => item.value));
    const maxInventoryValue = Math.max(
        1,
        ...vaccineStockDemand.flatMap((item) => [item.freeStock, item.remainingDemand]),
    );

    const totalInventoryVaccines =
        inventoryHealth.available + inventoryHealth.lowStock + inventoryHealth.outOfStock;

    const attentionItems = [
        {
            title: 'Overdue Immunizations',
            count: dashboard.overdueImmunizations,
            description: 'Children with missed doses needing guardian contact.',
            icon: AlertTriangle,
            onClick: () => router.visit(route('immunization.index')),
        },
        {
            title: 'Current Age Due',
            count: dashboard.currentAgeImmunizations,
            description: 'Vaccines due for administration at current milestone.',
            icon: Syringe,
            onClick: () => router.visit(route('immunization.index')),
        },
        {
            title: 'Recent Due Review',
            count: dashboard.recentDueImmunizations,
            description: 'Recent doses awaiting confirmation or completion.',
            icon: Clock3,
            onClick: () => router.visit(route('immunization.index')),
        },
        {
            title: 'Stock & Depletion Alerts',
            count: dashboard.inventoryAlerts,
            description: 'Vaccines below reorder thresholds or out of stock.',
            icon: Boxes,
            onClick: () => router.visit(route('vaccine-inventory.index')),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Staff Dashboard" />

            <div className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-5 p-4 sm:p-6 lg:p-7">
                {/* ========================================================= */}
                {/* HEADER & QUICK ACTIONS */}
                {/* ========================================================= */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex flex-wrap items-center gap-2.5">
                            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                                Barangay Bugo Health Center
                            </h1>
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Live Operations
                            </span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            Pediatric Immunization & Vaccine Inventory Management System
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 rounded-lg border-border/60 text-xs font-medium shadow-2xs"
                        >
                            <Link href={route('patients.index')}>
                                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                Patients Directory
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 rounded-lg border-border/60 text-xs font-medium shadow-2xs"
                        >
                            <Link href={route('vaccine-inventory.index')}>
                                <Boxes className="h-3.5 w-3.5 text-muted-foreground" />
                                Vaccine Stock
                            </Link>
                        </Button>
                        <Button
                            asChild
                            size="sm"
                            className="h-8 gap-1.5 rounded-lg text-xs font-medium shadow-2xs bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            <Link href={route('immunization.index')}>
                                <Syringe className="h-3.5 w-3.5" />
                                Immunization Tracker
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* ========================================================= */}
                {/* 4 SUMMARY STAT CARDS */}
                {/* ========================================================= */}
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.label}
                                type="button"
                                onClick={item.onClick}
                                className="group flex flex-col justify-between rounded-xl border border-border/60 bg-card p-4 text-left shadow-2xs transition-all hover:border-border hover:shadow-xs hover:bg-muted/20 cursor-pointer"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[11px] font-medium text-muted-foreground">
                                            {item.label}
                                        </p>
                                        <p className="mt-1.5 text-2xl font-bold tracking-tight text-foreground">
                                            {item.value}
                                        </p>
                                    </div>
                                    <div
                                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${item.colorClass}`}
                                    >
                                        <Icon className="h-4.5 w-4.5" />
                                    </div>
                                </div>

                                <div className="mt-2.5 flex items-center justify-between border-t border-border/40 pt-2 text-[10px] text-muted-foreground group-hover:text-foreground transition-colors">
                                    <span>{item.description}</span>
                                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* ========================================================= */}
                {/* ROW 2: VACCINE STOCK HEALTH & STOCK VS DEMAND */}
                {/* ========================================================= */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                    {/* Left: Stock Health Donut (4 cols) */}
                    <div className="lg:col-span-4 h-full">
                        <InventoryHealthCard
                            inventoryHealth={inventoryHealth}
                            total={totalInventoryVaccines}
                        />
                    </div>

                    {/* Right: Stock vs Demand Table (8 cols) */}
                    <div className="lg:col-span-8 flex h-full flex-col justify-between rounded-xl border border-border/60 bg-card shadow-2xs overflow-hidden">
                        <div className="flex items-center justify-between border-b border-border/40 px-4 py-3 sm:px-5">
                            <div>
                                <h2 className="text-sm font-semibold text-foreground">
                                    Vaccine Stock vs Demand
                                </h2>
                                <p className="text-[11px] text-muted-foreground">
                                    Usable stock compared with active patient demand
                                </p>
                            </div>

                            <Button
                                asChild
                                variant="ghost"
                                size="sm"
                                className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
                            >
                                <Link href={route('vaccine-inventory.index')}>
                                    View Full Inventory
                                    <ArrowRight className="h-3 w-3 ml-0.5" />
                                </Link>
                            </Button>
                        </div>

                        <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
                            {/* Structured Table Column Header Bar */}
                            <div className="mb-2.5 flex items-center gap-3 px-3 pb-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/30">
                                <span className="w-28 sm:w-32 shrink-0">Vaccine</span>
                                <span className="w-24 shrink-0 text-center">Status</span>
                                <div className="flex-1 flex items-center gap-4 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                        <span className="normal-case font-medium text-[11px] text-foreground/80">
                                            Free Stock
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                                        <span className="normal-case font-medium text-[11px] text-foreground/80">
                                            Active Demand
                                        </span>
                                    </div>
                                </div>
                                <span className="w-14 shrink-0 text-right">Free</span>
                                <span className="w-14 shrink-0 text-right">Need</span>
                            </div>

                            {/* Vaccine rows - strictly aligned tabular grid */}
                            <div className="space-y-2 flex-1 flex flex-col justify-around">
                                {vaccineStockDemand.map((vaccine) => {
                                    const stockWidth = Math.min(
                                        100,
                                        Math.max(
                                            vaccine.freeStock > 0 ? 5 : 0,
                                            (vaccine.freeStock / maxInventoryValue) * 100,
                                        ),
                                    );
                                    const demandWidth = Math.min(
                                        100,
                                        Math.max(
                                            vaccine.remainingDemand > 0 ? 5 : 0,
                                            (vaccine.remainingDemand / maxInventoryValue) * 100,
                                        ),
                                    );

                                    return (
                                        <div
                                            key={vaccine.id}
                                            className="flex items-center gap-3 rounded-lg border border-border/40 bg-muted/15 px-3 py-1.5 transition-colors hover:bg-muted/30"
                                        >
                                            {/* Column 1: Vaccine Name */}
                                            <span
                                                className="w-28 sm:w-32 shrink-0 text-xs font-semibold text-foreground truncate"
                                                title={vaccine.name}
                                            >
                                                {vaccine.name}
                                            </span>

                                            {/* Column 2: Status Badge (centered, fixed width) */}
                                            <div className="w-24 shrink-0 flex justify-center">
                                                <span
                                                    className={`inline-block w-full text-center text-[10px] font-medium px-2 py-0.5 rounded-full border ${getStockBadge(
                                                        vaccine.stockHealth,
                                                    )}`}
                                                >
                                                    {vaccine.stockHealth}
                                                </span>
                                            </div>

                                            {/* Column 3: Proportional dual progress bar */}
                                            <div className="flex-1 space-y-1 min-w-0">
                                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/70">
                                                    <div
                                                        className="h-full rounded-full bg-emerald-500 transition-all"
                                                        style={{ width: `${stockWidth}%` }}
                                                    />
                                                </div>
                                                {vaccine.remainingDemand > 0 ? (
                                                    <div className="h-1 w-full overflow-hidden rounded-full bg-muted/50">
                                                        <div
                                                            className="h-full rounded-full bg-blue-500 transition-all"
                                                            style={{ width: `${demandWidth}%` }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="h-1 w-full" />
                                                )}
                                            </div>

                                            {/* Column 4 & 5: Aligned Counts */}
                                            <span className="w-14 shrink-0 text-right font-semibold text-xs text-emerald-600 dark:text-emerald-400">
                                                {vaccine.freeStock}
                                            </span>
                                            <span className="w-14 shrink-0 text-right font-medium text-xs text-blue-600 dark:text-blue-400">
                                                {vaccine.remainingDemand}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ========================================================= */}
                {/* ROW 3: IMMUNIZATION WORKLOAD & ATTENTION NEEDED */}
                {/* ========================================================= */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
                    {/* Workload card (50%) */}
                    <div className="flex h-full flex-col justify-between rounded-xl border border-border/60 bg-card shadow-2xs overflow-hidden">
                        <div className="border-b border-border/40 px-4 py-3 sm:px-5">
                            <h2 className="text-sm font-semibold text-foreground">
                                Immunization Workload
                            </h2>
                            <p className="text-[11px] text-muted-foreground">
                                Active scheduling and follow-up workload distribution
                            </p>
                        </div>

                        <div className="flex flex-1 flex-col justify-between gap-2.5 p-4 sm:p-5">
                            {workload.map((item) => {
                                const width =
                                    item.value === 0
                                        ? 0
                                        : Math.max(6, (item.value / maxWorkload) * 100);

                                return (
                                    <div
                                        key={item.label}
                                        className="space-y-1.5 rounded-lg border border-border/30 bg-muted/10 px-3.5 py-2"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="min-w-0 flex items-center gap-2">
                                                <span className={`h-2 w-2 rounded-full shrink-0 ${item.color}`} />
                                                <p className="text-xs font-semibold text-foreground truncate">
                                                    {item.label}
                                                </p>
                                                <span className="text-[11px] text-muted-foreground hidden sm:inline truncate">
                                                    — {item.description}
                                                </span>
                                            </div>

                                            <span className="text-xs font-bold text-foreground shrink-0 px-2 py-0.5 rounded-md bg-muted/60">
                                                {item.value}
                                            </span>
                                        </div>

                                        <div className="h-1.5 overflow-hidden rounded-full bg-muted/60">
                                            <div
                                                className={`h-full rounded-full transition-all ${item.color}`}
                                                style={{ width: `${width}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Attention items card (50%) */}
                    <div className="flex h-full flex-col justify-between rounded-xl border border-border/60 bg-card shadow-2xs overflow-hidden">
                        <div className="border-b border-border/40 px-4 py-3 sm:px-5">
                            <h2 className="text-sm font-semibold text-foreground">
                                Attention Needed
                            </h2>
                            <p className="text-[11px] text-muted-foreground">
                                Clinical items requiring immediate staff action
                            </p>
                        </div>

                        <div className="flex flex-1 flex-col justify-between divide-y divide-border/40">
                            {attentionItems.map((item) => {
                                const Icon = item.icon;
                                const hasAlert = item.count > 0;

                                return (
                                    <button
                                        key={item.title}
                                        type="button"
                                        onClick={item.onClick}
                                        className="group flex flex-1 w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/30 cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div
                                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                                                    hasAlert
                                                        ? 'border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400'
                                                        : 'border-border/60 bg-muted/40 text-muted-foreground'
                                                }`}
                                            >
                                                <Icon className="h-4 w-4" />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-semibold text-foreground">
                                                    {item.title}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground truncate">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Right-aligned status badge & action chevron */}
                                        <div className="flex items-center gap-2.5 shrink-0 pl-2">
                                            {hasAlert ? (
                                                <span className="rounded-full bg-red-500/10 border border-red-500/20 px-2.5 py-0.5 text-[10px] font-bold text-red-600 dark:text-red-400">
                                                    {item.count} action needed
                                                </span>
                                            ) : (
                                                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                                                    All clear
                                                </span>
                                            )}
                                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function InventoryHealthCard({
    inventoryHealth,
    total,
}: {
    inventoryHealth: InventoryHealth;
    total: number;
}) {
    const radius = 38;
    const circumference = 2 * Math.PI * radius;

    const availableLength =
        total > 0 ? (inventoryHealth.available / total) * circumference : 0;
    const lowStockLength =
        total > 0 ? (inventoryHealth.lowStock / total) * circumference : 0;
    const outOfStockLength =
        total > 0 ? (inventoryHealth.outOfStock / total) * circumference : 0;

    const availableOffset = 0;
    const lowStockOffset = -availableLength;
    const outOfStockOffset = -(availableLength + lowStockLength);

    return (
        <div className="flex h-full flex-col justify-between rounded-xl border border-border/60 bg-card p-4 sm:p-5 shadow-2xs">
            <div>
                <h2 className="text-sm font-semibold text-foreground">
                    Vaccine Stock Health
                </h2>
                <p className="text-[11px] text-muted-foreground">
                    Formulary availability across master list
                </p>
            </div>

            {/* Donut Chart - Vertically centered in remaining card space */}
            <div className="my-auto flex flex-col items-center justify-center py-4">
                <div className="relative h-32 w-32 shrink-0">
                    <svg viewBox="0 0 100 100" className="-rotate-90 h-full w-full">
                        <circle
                            cx="50"
                            cy="50"
                            r={radius}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="10"
                            className="text-muted/40"
                        />

                        {availableLength > 0 && (
                            <circle
                                cx="50"
                                cy="50"
                                r={radius}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="10"
                                strokeLinecap="round"
                                strokeDasharray={`${availableLength} ${circumference}`}
                                strokeDashoffset={availableOffset}
                                className="text-emerald-500 transition-all duration-500"
                            />
                        )}

                        {lowStockLength > 0 && (
                            <circle
                                cx="50"
                                cy="50"
                                r={radius}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="10"
                                strokeLinecap="round"
                                strokeDasharray={`${lowStockLength} ${circumference}`}
                                strokeDashoffset={lowStockOffset}
                                className="text-amber-500 transition-all duration-500"
                            />
                        )}

                        {outOfStockLength > 0 && (
                            <circle
                                cx="50"
                                cy="50"
                                r={radius}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="10"
                                strokeLinecap="round"
                                strokeDasharray={`${outOfStockLength} ${circumference}`}
                                strokeDashoffset={outOfStockOffset}
                                className="text-red-500 transition-all duration-500"
                            />
                        )}
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold tracking-tight text-foreground">
                            {total}
                        </span>
                        <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">
                            Formulary
                        </span>
                    </div>
                </div>
            </div>

            {/* 3-Column Metric Status Badges - Pinned flush at bottom */}
            <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-border/40">
                <div className="flex flex-col items-center rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-1.5 text-center">
                    <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                        Available
                    </span>
                    <span className="text-base font-bold text-foreground">
                        {inventoryHealth.available}
                    </span>
                </div>

                <div className="flex flex-col items-center rounded-lg border border-amber-500/20 bg-amber-500/5 p-1.5 text-center">
                    <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
                        Low Stock
                    </span>
                    <span className="text-base font-bold text-foreground">
                        {inventoryHealth.lowStock}
                    </span>
                </div>

                <div className="flex flex-col items-center rounded-lg border border-red-500/20 bg-red-500/5 p-1.5 text-center">
                    <span className="text-[10px] font-medium text-red-600 dark:text-red-400">
                        Out of Stock
                    </span>
                    <span className="text-base font-bold text-foreground">
                        {inventoryHealth.outOfStock}
                    </span>
                </div>
            </div>
        </div>
    );
}

