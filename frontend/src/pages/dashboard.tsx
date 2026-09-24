import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    Boxes,
    CalendarDays,
    ChevronRight,
    Clock3,
    KeyRound,
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
    pendingRecoveryCount?: number;
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
    const { auth } = usePage<SharedData>().props;
    const isAdmin = auth?.user?.role === 'admin';
    const pendingRecoveryCount = dashboard.pendingRecoveryCount ?? 0;

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

            <div className="mx-auto flex h-full w-full max-w-7xl min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-7 overflow-x-hidden">
                {/* ========================================================= */}
                {/* HEADER & QUICK ACTIONS */}
                {/* ========================================================= */}
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between w-full min-w-0">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-foreground break-words">
                                Barangay Bugo Health Center
                            </h1>
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 shrink-0">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Live Operations
                            </span>
                        </div>
                        <p className="mt-0.5 text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                            Pediatric Immunization & Vaccine Inventory Management System
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto min-w-0">
                        {isAdmin && (
                            <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="h-7.5 sm:h-8 shrink-0 gap-1 rounded-lg border-border/60 text-[11px] sm:text-xs font-medium shadow-2xs justify-center sm:justify-start"
                            >
                                <Link href="/admin/password-reset-requests">
                                    <KeyRound className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                                    <span className="truncate">Recovery</span>
                                    {pendingRecoveryCount > 0 && (
                                        <Badge
                                            variant="secondary"
                                            className="ml-1 px-1 py-0 text-[9px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-400 border-none"
                                        >
                                            {pendingRecoveryCount}
                                        </Badge>
                                    )}
                                </Link>
                            </Button>
                        )}
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="h-7.5 sm:h-8 shrink-0 gap-1 rounded-lg border-border/60 text-[11px] sm:text-xs font-medium shadow-2xs justify-center sm:justify-start"
                        >
                            <Link href={route('patients.index')}>
                                <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground shrink-0" />
                                <span className="truncate">Patients</span>
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="h-7.5 sm:h-8 shrink-0 gap-1 rounded-lg border-border/60 text-[11px] sm:text-xs font-medium shadow-2xs justify-center sm:justify-start"
                        >
                            <Link href={route('vaccine-inventory.index')}>
                                <Boxes className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground shrink-0" />
                                <span className="truncate">Stock</span>
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="h-7.5 sm:h-8 shrink-0 gap-1 rounded-lg border-border/60 text-[11px] sm:text-xs font-medium shadow-2xs justify-center sm:justify-start"
                        >
                            <Link href={route('immunization.index')}>
                                <Syringe className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground shrink-0" />
                                <span className="truncate">Tracker</span>
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* ========================================================= */}
                {/* 4 SUMMARY STAT CARDS (2x2 on Mobile via col-6, 4-col on Desktop via col-lg-3) */}
                {/* ========================================================= */}
                <div className="row g-2 g-sm-3 mx-0 w-full">
                    {stats.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div key={item.label} className="col-6 col-lg-3 px-1 sm:px-1.5">
                                <button
                                    type="button"
                                    onClick={item.onClick}
                                    className="group flex flex-col justify-between w-full h-full rounded-xl border border-border/60 bg-card p-2.5 sm:p-4 text-left shadow-2xs transition-all hover:border-border hover:shadow-xs hover:bg-muted/20 cursor-pointer min-w-0"
                                >
                                    <div className="flex items-start justify-between gap-1.5 sm:gap-2 min-w-0">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[10px] sm:text-[11px] font-medium text-muted-foreground truncate" title={item.label}>
                                                {item.label}
                                            </p>
                                            <p className="mt-1 text-lg sm:text-2xl font-bold tracking-tight text-foreground">
                                                {item.value}
                                            </p>
                                        </div>
                                        <div
                                            className={`flex h-7 w-7 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg border ${item.colorClass}`}
                                        >
                                            <Icon className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5" />
                                        </div>
                                    </div>

                                    <div className="mt-2 hidden sm:flex items-center justify-between border-t border-border/40 pt-2 text-[10px] text-muted-foreground group-hover:text-foreground transition-colors">
                                        <span className="truncate">{item.description}</span>
                                        <ArrowRight className="h-3 w-3 shrink-0 ml-1 transition-transform group-hover:translate-x-0.5" />
                                    </div>
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* ========================================================= */}
                {/* ROW 2: VACCINE STOCK HEALTH & STOCK VS DEMAND */}
                {/* ========================================================= */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-stretch w-full min-w-0">
                    {/* Left: Stock Health Donut (4 cols) */}
                    <div className="lg:col-span-4 min-w-0 w-full flex flex-col">
                        <InventoryHealthCard
                            inventoryHealth={inventoryHealth}
                            total={totalInventoryVaccines}
                        />
                    </div>

                    {/* Right: Stock vs Demand Table (8 cols) */}
                    <div className="lg:col-span-8 min-w-0 w-full flex flex-col">
                        <div className="flex h-full flex-col justify-between rounded-xl border border-border/60 bg-card shadow-2xs overflow-hidden w-full">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 border-b border-border/40 px-4 py-3 sm:px-5">
                                <div>
                                    <h2 className="text-sm font-semibold text-foreground">
                                        Vaccine Stock vs Demand
                                    </h2>
                                    <p className="text-[11px] text-muted-foreground">
                                        Usable stock compared with active patient demand
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="flex items-center gap-3 text-[11px]">
                                        <div className="flex items-center gap-1.5">
                                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                            <span className="font-medium text-foreground/80">
                                                Free Stock
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="h-2 w-2 rounded-full bg-blue-500" />
                                            <span className="font-medium text-foreground/80">
                                                Active Demand
                                            </span>
                                        </div>
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
                            </div>

                            <div className="flex flex-1 flex-col justify-around p-3 sm:p-4.5 space-y-2 w-full min-w-0">
                                {vaccineStockDemand.map((vaccine) => {
                                    const stockWidth = Math.min(
                                        100,
                                        Math.max(
                                            vaccine.freeStock > 0 ? 6 : 0,
                                            (vaccine.freeStock / maxInventoryValue) * 100,
                                        ),
                                    );
                                    const demandWidth = Math.min(
                                        100,
                                        Math.max(
                                            vaccine.remainingDemand > 0 ? 6 : 0,
                                            (vaccine.remainingDemand / maxInventoryValue) * 100,
                                        ),
                                    );

                                    return (
                                        <div
                                            key={vaccine.id}
                                            className="flex items-center gap-2.5 sm:gap-3 rounded-lg border border-border/40 bg-muted/15 px-3 py-1.5 sm:py-2 transition-colors hover:bg-muted/30"
                                        >
                                            {/* Vaccine Name & Status Badge */}
                                            <div className="w-24 sm:w-28 shrink-0 min-w-0">
                                                <span
                                                    className="block text-xs font-semibold text-foreground truncate"
                                                    title={vaccine.name}
                                                >
                                                    {vaccine.name}
                                                </span>
                                                <span
                                                    className={`inline-block text-[10px] font-medium px-1.5 py-0.2 rounded-full border mt-0.5 ${getStockBadge(
                                                        vaccine.stockHealth,
                                                    )}`}
                                                >
                                                    {vaccine.stockHealth}
                                                </span>
                                            </div>

                                            {/* Dual Comparison Bars */}
                                            <div className="flex-1 space-y-1.5 min-w-0">
                                                <div className="h-2 w-full overflow-hidden rounded-full bg-muted/70">
                                                    <div
                                                        className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                                                        style={{ width: `${stockWidth}%` }}
                                                        title={`Free Stock: ${vaccine.freeStock}`}
                                                    />
                                                </div>
                                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
                                                    <div
                                                        className="h-full rounded-full bg-blue-500 transition-all duration-300"
                                                        style={{ width: `${demandWidth}%` }}
                                                        title={`Active Demand: ${vaccine.remainingDemand}`}
                                                    />
                                                </div>
                                            </div>

                                            {/* Counts: Free & Need */}
                                            <div className="flex items-center gap-2 sm:gap-3 shrink-0 text-right">
                                                <div className="w-11 sm:w-13 text-right">
                                                    <span className="block text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                                        {vaccine.freeStock}
                                                    </span>
                                                    <span className="block text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">
                                                        Free
                                                    </span>
                                                </div>

                                                <div className="w-11 sm:w-13 text-right">
                                                    <span className="block text-xs font-bold text-blue-600 dark:text-blue-400">
                                                        {vaccine.remainingDemand}
                                                    </span>
                                                    <span className="block text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">
                                                        Need
                                                    </span>
                                                </div>
                                            </div>
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
                <div className="row g-3 items-stretch mx-0 w-full">
                    {/* Workload card (50%) */}
                    <div className="col-12 col-lg-6 min-w-0 max-w-full px-0 sm:px-2 lg:h-full">
                        <div className="flex lg:h-full flex-col justify-between rounded-xl border border-border/60 bg-card shadow-2xs overflow-hidden">
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
                    </div>

                    {/* Attention items card (50%) */}
                    <div className="col-12 col-lg-6 min-w-0 max-w-full px-0 sm:px-2 lg:h-full">
                        <div className="flex lg:h-full flex-col justify-between rounded-xl border border-border/60 bg-card shadow-2xs overflow-hidden">
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
                                            className="group flex flex-1 w-full items-center justify-between gap-2 sm:gap-3 px-3 py-2.5 sm:px-4 sm:py-3 text-left transition-colors hover:bg-muted/30 cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                                                <div
                                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                                                        hasAlert
                                                            ? 'border-red-500/25 bg-red-500/10 text-red-600 dark:text-red-400'
                                                            : 'border-border/60 bg-muted/30 text-muted-foreground'
                                                    }`}
                                                >
                                                    <Icon className="h-4 w-4" />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <p className="text-xs font-semibold text-foreground break-words">
                                                            {item.title}
                                                        </p>
                                                        <span
                                                            className={`text-xs font-bold shrink-0 ${
                                                                hasAlert
                                                                    ? 'text-red-600 dark:text-red-400'
                                                                    : 'text-muted-foreground'
                                                            }`}
                                                        >
                                                            ({item.count})
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-muted-foreground truncate">
                                                        {item.description}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Right-aligned status badge & action chevron */}
                                            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 pl-1">
                                                {hasAlert ? (
                                                    <span className="rounded-full bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-red-600 dark:text-red-400 whitespace-nowrap">
                                                        <span className="hidden sm:inline">{item.count} action needed</span>
                                                        <span className="sm:hidden">{item.count} action</span>
                                                    </span>
                                                ) : (
                                                    <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[9px] sm:text-[10px] font-medium text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                                        All clear
                                                    </span>
                                                )}
                                                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground shrink-0" />
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
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
    const radius = 46;
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
        <div className="flex flex-col justify-between rounded-xl border border-border/60 bg-card p-4 sm:p-5 shadow-2xs h-full">
            <div className="border-b border-border/40 pb-3">
                <h2 className="text-sm font-semibold text-foreground">
                    Vaccine Stock Health
                </h2>
                <p className="text-[11px] text-muted-foreground">
                    Formulary availability across master list
                </p>
            </div>

            {/* Centered Body: Big Donut Chart + Status Details Grouped Together */}
            <div className="flex-1 flex flex-col items-center justify-center py-4 my-auto gap-5 sm:gap-6 w-full">
                {/* Big Donut Chart */}
                <div className="relative h-44 w-44 sm:h-48 sm:w-48 lg:h-52 lg:w-52 shrink-0">
                    <svg viewBox="0 0 120 120" className="-rotate-90 h-full w-full">
                        <circle
                            cx="60"
                            cy="60"
                            r={radius}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="12"
                            className="text-muted/40"
                        />

                        {availableLength > 0 && (
                            <circle
                                cx="60"
                                cy="60"
                                r={radius}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="12"
                                strokeLinecap="round"
                                strokeDasharray={`${availableLength} ${circumference}`}
                                strokeDashoffset={availableOffset}
                                className="text-emerald-500 transition-all duration-500"
                            />
                        )}

                        {lowStockLength > 0 && (
                            <circle
                                cx="60"
                                cy="60"
                                r={radius}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="12"
                                strokeLinecap="round"
                                strokeDasharray={`${lowStockLength} ${circumference}`}
                                strokeDashoffset={lowStockOffset}
                                className="text-amber-500 transition-all duration-500"
                            />
                        )}

                        {outOfStockLength > 0 && (
                            <circle
                                cx="60"
                                cy="60"
                                r={radius}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="12"
                                strokeLinecap="round"
                                strokeDasharray={`${outOfStockLength} ${circumference}`}
                                strokeDashoffset={outOfStockOffset}
                                className="text-red-500 transition-all duration-500"
                            />
                        )}
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                            {total}
                        </span>
                        <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-0.5">
                            Formulary
                        </span>
                    </div>
                </div>

                {/* 3 Metric Status Badges - Positioned right below the chart */}
                <div className="grid grid-cols-3 gap-2 sm:gap-2.5 w-full">
                    <div className="flex flex-col items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2 sm:p-2.5 text-center">
                        <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            Available
                        </span>
                        <span className="text-base sm:text-lg font-bold text-foreground mt-0.5">
                            {inventoryHealth.available}
                        </span>
                    </div>

                    <div className="flex flex-col items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 p-2 sm:p-2.5 text-center">
                        <span className="text-[10px] sm:text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                            Low Stock
                        </span>
                        <span className="text-base sm:text-lg font-bold text-foreground mt-0.5">
                            {inventoryHealth.lowStock}
                        </span>
                    </div>

                    <div className="flex flex-col items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 p-2 sm:p-2.5 text-center">
                        <span className="text-[10px] sm:text-[11px] font-semibold text-red-600 dark:text-red-400">
                            Out of Stock
                        </span>
                        <span className="text-base sm:text-lg font-bold text-foreground mt-0.5">
                            {inventoryHealth.outOfStock}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

