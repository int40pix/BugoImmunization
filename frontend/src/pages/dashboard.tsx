import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    Boxes,
    CalendarDays,
    CircleAlert,
    Clock3,
    PackageCheck,
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
    stockHealth:
        | 'Available'
        | 'Low Stock'
        | 'Out of Stock';
    demandCoverage:
        | 'Sufficient'
        | 'Insufficient'
        | 'No Current Demand';
};

type DashboardProps = {
    dashboard: DashboardData;
    inventoryHealth: InventoryHealth;
    vaccineStockDemand: VaccineStockDemand[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: '',
        href: '/dashboard',
    },
];

export default function Dashboard({
    dashboard,
    inventoryHealth,
    vaccineStockDemand = [],
}: DashboardProps) {
    const stats = [
        {
            label: 'Total Patients',
            value: dashboard.totalPatients,
            description:
                'Registered pediatric patients',
            icon: Users,
            onClick: () =>
                router.visit(
                    route('patients.index'),
                ),
        },
        {
            label: 'Vaccinated This Week',
            value: dashboard.vaccinatedThisWeek,
            description:
                'Vaccinations recorded Monday–Sunday',
            icon: Syringe,
            onClick: () =>
                router.visit(
                    route(
                        'immunization.index',
                    ),
                ),
        },
        {
            label: 'Upcoming Schedules',
            value: dashboard.upcomingSchedules,
            description:
                'Upcoming stock-backed vaccine doses',
            icon: CalendarDays,
            onClick: () =>
                router.visit(
                    route(
                        'immunization.index',
                    ),
                ),
        },
        {
            label: 'Inventory Alerts',
            value: dashboard.inventoryAlerts,
            description:
                'Low-stock and out-of-stock vaccines',
            icon: Boxes,
            onClick: () =>
                router.visit(
                    route(
                        'vaccine-inventory.index',
                    ),
                ),
        },
    ];

    const workload = [
        {
            label: 'Current Age',
            value:
                dashboard.currentAgeImmunizations,
            description:
                'Vaccinations currently due by age',
        },
        {
            label: 'Recent Due',
            value:
                dashboard.recentDueImmunizations,
            description:
                'Recently due vaccinations',
        },
        {
            label: 'Overdue',
            value:
                dashboard.overdueImmunizations,
            description:
                'Vaccinations requiring follow-up',
        },
        {
            label: 'Scheduled',
            value:
                dashboard.upcomingSchedules,
            description:
                'Upcoming stock-backed doses',
        },
    ];

    const maxWorkload = Math.max(
        1,
        ...workload.map(
            (item) => item.value,
        ),
    );

    const maxInventoryValue = Math.max(
        1,
        ...vaccineStockDemand.flatMap(
            (item) => [
                item.freeStock,
                item.remainingDemand,
            ],
        ),
    );

    const totalInventoryVaccines =
        inventoryHealth.available
        + inventoryHealth.lowStock
        + inventoryHealth.outOfStock;

    const attentionItems = [
        {
            title: 'Overdue Immunizations',
            count:
                dashboard.overdueImmunizations,
            description:
                'Vaccinations needing immediate follow-up.',
            icon: AlertTriangle,
            onClick: () =>
                router.visit(
                    route(
                        'immunization.index',
                    ),
                ),
        },
        {
            title: 'Current Age',
            count:
                dashboard.currentAgeImmunizations,
            description:
                'Vaccinations currently due based on age.',
            icon: Syringe,
            onClick: () =>
                router.visit(
                    route(
                        'immunization.index',
                    ),
                ),
        },
        {
            title: 'Recent Due',
            count:
                dashboard.recentDueImmunizations,
            description:
                'Recently due vaccinations needing review.',
            icon: Clock3,
            onClick: () =>
                router.visit(
                    route(
                        'immunization.index',
                    ),
                ),
        },
        {
            title: 'Inventory Alerts',
            count:
                dashboard.inventoryAlerts,
            description:
                'Vaccines currently low or out of usable stock.',
            icon: Boxes,
            onClick: () =>
                router.visit(
                    route(
                        'vaccine-inventory.index',
                    ),
                ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Staff Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* ========================================================= */}
                {/* HEADER */}
                {/* ========================================================= */}

                <div>
                    <h1 className="text-2xl font-bold">
                        Barangay Bugo Health Center
                    </h1>

                    <p className="mt-1 text-muted-foreground">
                        Pediatric Immunization Management
                        System
                    </p>
                </div>

                {/* ========================================================= */}
                {/* SUMMARY */}
                {/* ========================================================= */}

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {stats.map((item) => {
                        const Icon =
                            item.icon;

                        return (
                            <button
                                key={item.label}
                                type="button"
                                onClick={
                                    item.onClick
                                }
                                className="group rounded-xl border p-5 text-left transition-all hover:border-foreground/20 hover:bg-muted/30"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            {
                                                item.label
                                            }
                                        </p>

                                        <p className="mt-2 text-3xl font-bold">
                                            {
                                                item.value
                                            }
                                        </p>
                                    </div>

                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                </div>

                                <p className="mt-3 text-xs text-muted-foreground">
                                    {
                                        item.description
                                    }
                                </p>
                            </button>
                        );
                    })}
                </div>

                {/* ========================================================= */}
                {/* INVENTORY VISUALS */}
                {/* ========================================================= */}

                <div className="grid gap-6 xl:grid-cols-[0.8fr_1.6fr]">
                    <InventoryHealthCard
                        inventoryHealth={
                            inventoryHealth
                        }
                        total={
                            totalInventoryVaccines
                        }
                    />

                    <div className="overflow-hidden rounded-xl border">
                        <div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    Vaccine Stock vs Demand
                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Free usable stock compared
                                    with remaining current
                                    immunization demand.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    router.visit(
                                        route(
                                            'vaccine-inventory.index',
                                        ),
                                    )
                                }
                                className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
                            >
                                View Inventory
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="p-5">
                            <div className="mb-5 flex flex-wrap gap-5 text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                                    Free stock
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" />
                                    Remaining demand
                                </div>
                            </div>

                            <div className="space-y-5">
                                {vaccineStockDemand.map(
                                    (vaccine) => (
                                        <div
                                            key={
                                                vaccine.id
                                            }
                                            className="grid gap-3 lg:grid-cols-[150px_minmax(0,1fr)_120px]"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold">
                                                    {
                                                        vaccine.name
                                                    }
                                                </p>

                                                <p className="mt-0.5 text-xs text-muted-foreground">
                                                    {
                                                        vaccine.stockHealth
                                                    }
                                                </p>
                                            </div>

                                            <div className="space-y-2">
                                                <ChartBar
                                                    value={
                                                        vaccine.freeStock
                                                    }
                                                    maxValue={
                                                        maxInventoryValue
                                                    }
                                                    className="bg-emerald-500"
                                                />

                                                <ChartBar
                                                    value={
                                                        vaccine.remainingDemand
                                                    }
                                                    maxValue={
                                                        maxInventoryValue
                                                    }
                                                    className="bg-blue-500"
                                                />
                                            </div>

                                            <div className="flex items-center justify-end gap-3 text-xs">
                                                <span className="font-semibold">
                                                    {
                                                        vaccine.freeStock
                                                    }{' '}
                                                    free
                                                </span>

                                                <span className="text-muted-foreground">
                                                    {
                                                        vaccine.remainingDemand
                                                    }{' '}
                                                    demand
                                                </span>
                                            </div>
                                        </div>
                                    ),
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ========================================================= */}
                {/* WORKLOAD + ATTENTION */}
                {/* ========================================================= */}

                <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
                    <div className="rounded-xl border">
                        <div className="border-b p-5">
                            <h2 className="text-lg font-semibold">
                                Immunization Workload
                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Current immunization
                                attention and scheduling
                                workload.
                            </p>
                        </div>

                        <div className="space-y-5 p-5">
                            {workload.map(
                                (item) => {
                                    const width =
                                        item.value ===
                                        0
                                            ? 0
                                            : Math.max(
                                                  8,
                                                  (item.value /
                                                      maxWorkload)
                                                      * 100,
                                              );

                                    return (
                                        <div
                                            key={
                                                item.label
                                            }
                                            className="space-y-2"
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <div>
                                                    <p className="font-medium">
                                                        {
                                                            item.label
                                                        }
                                                    </p>

                                                    <p className="text-xs text-muted-foreground">
                                                        {
                                                            item.description
                                                        }
                                                    </p>
                                                </div>

                                                <span className="text-lg font-bold">
                                                    {
                                                        item.value
                                                    }
                                                </span>
                                            </div>

                                            <div className="h-2 overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className="h-full rounded-full bg-foreground transition-all"
                                                    style={{
                                                        width: `${width}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                },
                            )}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border">
                        <div className="border-b p-5">
                            <h2 className="text-lg font-semibold">
                                Attention Needed
                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Items currently requiring
                                staff review.
                            </p>
                        </div>

                        <div className="divide-y">
                            {attentionItems.map(
                                (item) => {
                                    const Icon =
                                        item.icon;

                                    return (
                                        <button
                                            key={
                                                item.title
                                            }
                                            type="button"
                                            onClick={
                                                item.onClick
                                            }
                                            className="group flex w-full items-center gap-4 p-5 text-left transition-colors hover:bg-muted/30"
                                        >
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                                                <Icon className="h-5 w-5" />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="font-medium">
                                                        {
                                                            item.title
                                                        }
                                                    </p>

                                                    {item.count >
                                                    0 ? (
                                                        <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-600 dark:text-red-400">
                                                            {
                                                                item.count
                                                            }
                                                        </span>
                                                    ) : (
                                                        <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                                                            Clear
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {
                                                        item.description
                                                    }
                                                </p>
                                            </div>

                                            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
                                        </button>
                                    );
                                },
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function ChartBar({
    value,
    maxValue,
    className,
}: {
    value: number;
    maxValue: number;
    className: string;
}) {
    const width =
        value <= 0
            ? 0
            : Math.max(
                  3,
                  (value / maxValue) * 100,
              );

    return (
        <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
                className={`h-full rounded-full transition-all ${className}`}
                style={{
                    width: `${width}%`,
                }}
            />
        </div>
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
    const circumference =
        2 * Math.PI * radius;

    const availableLength =
        total > 0
            ? (inventoryHealth.available /
                  total)
                  * circumference
            : 0;

    const lowStockLength =
        total > 0
            ? (inventoryHealth.lowStock /
                  total)
                  * circumference
            : 0;

    const outOfStockLength =
        total > 0
            ? (inventoryHealth.outOfStock /
                  total)
                  * circumference
            : 0;

    const availableOffset = 0;

    const lowStockOffset =
        -availableLength;

    const outOfStockOffset =
        -(availableLength
            + lowStockLength);

    return (
        <div className="overflow-hidden rounded-xl border">
            <div className="border-b p-5">
                <h2 className="text-lg font-semibold">
                    Vaccine Stock Health
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    Overall vaccine-level
                    availability across the master
                    list.
                </p>
            </div>

            <div className="flex flex-col items-center gap-6 p-6 sm:flex-row xl:flex-col">
                <div className="relative h-48 w-48 shrink-0">
                    <svg
                        viewBox="0 0 120 120"
                        className="-rotate-90"
                    >
                        <circle
                            cx="60"
                            cy="60"
                            r={radius}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="14"
                            className="text-muted"
                        />

                        {availableLength >
                            0 && (
                            <circle
                                cx="60"
                                cy="60"
                                r={
                                    radius
                                }
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="14"
                                strokeLinecap="butt"
                                strokeDasharray={`${availableLength} ${circumference}`}
                                strokeDashoffset={
                                    availableOffset
                                }
                                className="text-emerald-500"
                            />
                        )}

                        {lowStockLength >
                            0 && (
                            <circle
                                cx="60"
                                cy="60"
                                r={
                                    radius
                                }
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="14"
                                strokeLinecap="butt"
                                strokeDasharray={`${lowStockLength} ${circumference}`}
                                strokeDashoffset={
                                    lowStockOffset
                                }
                                className="text-amber-500"
                            />
                        )}

                        {outOfStockLength >
                            0 && (
                            <circle
                                cx="60"
                                cy="60"
                                r={
                                    radius
                                }
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="14"
                                strokeLinecap="butt"
                                strokeDasharray={`${outOfStockLength} ${circumference}`}
                                strokeDashoffset={
                                    outOfStockOffset
                                }
                                className="text-red-500"
                            />
                        )}
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold">
                            {total}
                        </span>

                        <span className="text-xs text-muted-foreground">
                            vaccines
                        </span>
                    </div>
                </div>

                <div className="grid w-full gap-3">
                    <HealthLegend
                        icon={
                            PackageCheck
                        }
                        label="Available"
                        value={
                            inventoryHealth.available
                        }
                        dotClass="bg-emerald-500"
                    />

                    <HealthLegend
                        icon={
                            CircleAlert
                        }
                        label="Low Stock"
                        value={
                            inventoryHealth.lowStock
                        }
                        dotClass="bg-amber-500"
                    />

                    <HealthLegend
                        icon={
                            AlertTriangle
                        }
                        label="Out of Stock"
                        value={
                            inventoryHealth.outOfStock
                        }
                        dotClass="bg-red-500"
                    />
                </div>
            </div>
        </div>
    );
}

function HealthLegend({
    icon: Icon,
    label,
    value,
    dotClass,
}: {
    icon: typeof Boxes;
    label: string;
    value: number;
    dotClass: string;
}) {
    return (
        <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
                <span
                    className={`h-2.5 w-2.5 rounded-full ${dotClass}`}
                />

                <Icon className="h-4 w-4 text-muted-foreground" />

                <span className="text-sm font-medium">
                    {label}
                </span>
            </div>

            <span className="text-sm font-bold">
                {value}
            </span>
        </div>
    );
}
