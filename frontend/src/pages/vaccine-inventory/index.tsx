import AppLayout from '@/layouts/app-layout';
import {
    Head,
    router,
    usePage,
} from '@inertiajs/react';
import {
    Archive,
    ChevronDown,
    ChevronRight,
    List,
    LoaderCircle,
    PackagePlus,
    Search,
} from 'lucide-react';
import {
    useEffect,
    useState,
} from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type VaccineOption = {
    id: number;
    name: string;
};

type BatchRow = {
    id: number;
    batch_number: string;
    quantity: number;
    reserved: number;
    free_capacity: number;
    date_received: string | null;
    expiration_date: string;
    manufacturer: string | null;
    supplier: string | null;
    remarks: string | null;
    status:
        | 'Available'
        | 'Low Batch Quantity'
        | 'Out of Stock'
        | 'Expired'
        | 'Expiring Soon';
    days_until_expiry: number;
};

type VaccineInventoryRow = {
    id: number;
    name: string;
    category: string | null;
    batch_count: number;
    usable_stock: number;
    reserved_stock: number;
    free_stock: number;
    remaining_demand: number;
    stock_health:
        | 'Available'
        | 'Low Stock'
        | 'Out of Stock';
    demand_coverage:
        | 'Sufficient'
        | 'Insufficient'
        | 'No Current Demand';
    batches: BatchRow[];
};

type Summary = {
    total_vaccines: number;
    total_existing_batches: number;
    total_usable_stock: number;
    low_stock_vaccines: number;
    out_of_stock_vaccines: number;
    expiring_soon_vaccines: number;
};

type Props = {
    vaccines: VaccineInventoryRow[];
    vaccineOptions: VaccineOption[];
    summary: Summary;
    filters: {
        search?: string;
        status?: string;
        vaccine_id?: string;
    };
};

function formatDate(value: string | null) {
    if (!value) {
        return '—';
    }

    const [year, month, day] =
        value.split('-').map(Number);

    return new Date(
        year,
        month - 1,
        day,
    ).toLocaleDateString(
        'en-US',
        {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        },
    );
}

function stockHealthClass(
    status: VaccineInventoryRow['stock_health'],
) {
    if (status === 'Available') {
        return 'border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400';
    }

    if (status === 'Low Stock') {
        return 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400';
    }

    return 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400';
}

function coverageClass(
    status: VaccineInventoryRow['demand_coverage'],
) {
    if (status === 'Sufficient') {
        return 'border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400';
    }

    if (status === 'Insufficient') {
        return 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400';
    }

    return 'border-border bg-muted text-muted-foreground';
}

function batchStatusClass(
    status: BatchRow['status'],
) {
    if (status === 'Available') {
        return 'border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400';
    }

    if (
        status === 'Low Batch Quantity'
        ||
        status === 'Expiring Soon'
    ) {
        return 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400';
    }

    return 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400';
}

export default function VaccineInventoryIndex() {
    const {
        vaccines,
        vaccineOptions,
        summary,
        filters,
    } = usePage<Props>().props;

    const [search, setSearch] =
        useState(
            filters.search || '',
        );

    const [status, setStatus] =
        useState(
            filters.status || 'all',
        );

    const [vaccineId, setVaccineId] =
        useState(
            filters.vaccine_id || 'all',
        );

    const [loading, setLoading] =
        useState(false);

    const [
        expandedVaccines,
        setExpandedVaccines,
    ] = useState<Set<number>>(
        new Set(),
    );

    useEffect(() => {
        const timeout =
            setTimeout(() => {
                router.get(
                    route(
                        'vaccine-inventory.index',
                    ),
                    {
                        search,
                        status,
                        vaccine_id:
                            vaccineId,
                    },
                    {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true,
                        onStart: () =>
                            setLoading(
                                true,
                            ),
                        onFinish: () =>
                            setLoading(
                                false,
                            ),
                    },
                );
            }, 350);

        return () =>
            clearTimeout(
                timeout,
            );
    }, [
        search,
        status,
        vaccineId,
    ]);

    const toggleVaccine = (
        vaccineIdValue: number,
    ) => {
        setExpandedVaccines(
            (current) => {
                const next =
                    new Set(
                        current,
                    );

                if (
                    next.has(
                        vaccineIdValue,
                    )
                ) {
                    next.delete(
                        vaccineIdValue,
                    );
                } else {
                    next.add(
                        vaccineIdValue,
                    );
                }

                return next;
            },
        );
    };

    return (
        <AppLayout>
            <Head title="Vaccine Inventory" />

            <div className="max-w-7xl space-y-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold">
                        Vaccine Inventory
                    </h1>

                    <p className="mt-2 text-muted-foreground">
                        Monitor vaccine-level stock,
                        batch availability, expiration
                        dates, and upcoming demand.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <SummaryCard
                        label="Vaccines"
                        value={
                            summary.total_vaccines
                        }
                        description="Vaccine master records"
                    />

                    <SummaryCard
                        label="Usable Stock"
                        value={
                            summary.total_usable_stock
                        }
                        description="Total active non-expired doses"
                    />

                    <SummaryCard
                        label="Low Stock"
                        value={
                            summary.low_stock_vaccines
                        }
                        description="Vaccines low in aggregate stock"
                    />

                    <SummaryCard
                        label="Out of Stock"
                        value={
                            summary.out_of_stock_vaccines
                        }
                        description="Vaccines with no usable doses"
                    />

                    <SummaryCard
                        label="Expiring Soon"
                        value={
                            summary.expiring_soon_vaccines
                        }
                        description="Vaccines with a batch ≤ 30 days"
                    />
                </div>

                <div className="flex flex-wrap gap-3">
                    <Button
                        type="button"
                        onClick={() =>
                            router.visit(
                                route(
                                    'vaccine.index',
                                ),
                            )
                        }
                    >
                        <List className="mr-2 h-4 w-4" />
                        Vaccine Master List
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                            router.visit(
                                route(
                                    'vaccine-inventory.create',
                                ),
                            )
                        }
                    >
                        <PackagePlus className="mr-2 h-4 w-4" />
                        Add Batch
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                            router.visit(
                                route(
                                    'vaccine-inventory.archived',
                                ),
                            )
                        }
                    >
                        <Archive className="mr-2 h-4 w-4" />
                        View Archived
                    </Button>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="grid gap-3 md:grid-cols-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                                <Input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Search vaccine or batch..."
                                    className="pl-9"
                                />
                            </div>

                            <Select
                                value={status}
                                onValueChange={
                                    setStatus
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="all">
                                        All statuses
                                    </SelectItem>

                                    <SelectItem value="out-of-stock">
                                        Out of Stock
                                    </SelectItem>

                                    <SelectItem value="low-stock">
                                        Low Stock
                                    </SelectItem>

                                    <SelectItem value="available">
                                        Available
                                    </SelectItem>

                                    <SelectItem value="insufficient">
                                        Insufficient Demand Coverage
                                    </SelectItem>

                                    <SelectItem value="sufficient">
                                        Sufficient Demand Coverage
                                    </SelectItem>

                                    <SelectItem value="no-demand">
                                        No Current Demand
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={vaccineId}
                                onValueChange={
                                    setVaccineId
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All vaccines" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="all">
                                        All vaccines
                                    </SelectItem>

                                    {vaccineOptions.map(
                                        (vaccine) => (
                                            <SelectItem
                                                key={
                                                    vaccine.id
                                                }
                                                value={String(
                                                    vaccine.id,
                                                )}
                                            >
                                                {
                                                    vaccine.name
                                                }
                                            </SelectItem>
                                        ),
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {loading && (
                            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                                <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                                Updating inventory...
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="border-b">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle>
                                    Vaccine Inventory Records
                                </CardTitle>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Each row represents one vaccine.
                                    Expand a row to inspect its
                                    physical batches.
                                </p>
                            </div>

                            <Badge variant="outline">
                                {
                                    summary.total_existing_batches
                                }{' '}
                                {summary.total_existing_batches ===
                                1
                                    ? 'active batch'
                                    : 'active batches'}
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        {vaccines.length === 0 ? (
                            <div className="px-6 py-12 text-center text-sm text-muted-foreground">
                                No vaccines match the current filters.
                            </div>
                        ) : (
                            <>
                                <div className="hidden grid-cols-[auto_minmax(0,1.6fr)_repeat(4,minmax(72px,0.7fr))_minmax(95px,0.75fr)] items-center gap-4 border-b bg-muted/20 px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground xl:grid">
                                    <div />
                                    <div>Vaccine</div>
                                    <div>Usable</div>
                                    <div>Reserved</div>
                                    <div>Free</div>
                                    <div>Demand</div>
                                    <div className="text-right">Batches</div>
                                </div>

                                <div className="divide-y">
                                {vaccines.map(
                                    (vaccine) => {
                                        const expanded =
                                            expandedVaccines.has(
                                                vaccine.id,
                                            );

                                        return (
                                            <div
                                                key={
                                                    vaccine.id
                                                }
                                            >
                                                <button
                                                    type="button"
                                                    className="grid w-full grid-cols-[auto_minmax(0,1.6fr)_repeat(4,minmax(72px,0.7fr))_minmax(95px,0.75fr)] items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/30"
                                                    onClick={() =>
                                                        toggleVaccine(
                                                            vaccine.id,
                                                        )
                                                    }
                                                >
                                                    <div className="flex h-8 w-8 items-center justify-center">
                                                        {expanded ? (
                                                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                        ) : (
                                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                        )}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <p className="truncate font-semibold">
                                                                {vaccine.name}
                                                            </p>

                                                            {vaccine.category && (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="h-5 px-2 text-[10px] capitalize"
                                                                >
                                                                    {vaccine.category}
                                                                </Badge>
                                                            )}
                                                        </div>

                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                            <Badge
                                                                variant="outline"
                                                                className={`${stockHealthClass(
                                                                    vaccine.stock_health,
                                                                )} h-5 px-2 text-[10px]`}
                                                            >
                                                                {vaccine.stock_health}
                                                            </Badge>

                                                            <Badge
                                                                variant="outline"
                                                                className={`${coverageClass(
                                                                    vaccine.demand_coverage,
                                                                )} h-5 px-2 text-[10px]`}
                                                            >
                                                                {vaccine.demand_coverage}
                                                            </Badge>
                                                        </div>
                                                    </div>

                                                    <Metric
                                                        label="Usable"
                                                        value={vaccine.usable_stock}
                                                    />

                                                    <Metric
                                                        label="Reserved"
                                                        value={vaccine.reserved_stock}
                                                    />

                                                    <Metric
                                                        label="Free"
                                                        value={vaccine.free_stock}
                                                    />

                                                    <Metric
                                                        label="Demand"
                                                        value={vaccine.remaining_demand}
                                                    />

                                                    <div className="text-right">
                                                        <p className="text-sm font-semibold">
                                                            {vaccine.batch_count}{' '}
                                                            {vaccine.batch_count === 1
                                                                ? 'batch'
                                                                : 'batches'}
                                                        </p>

                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            {expanded
                                                                ? 'Hide batches'
                                                                : 'View batches'}
                                                        </p>
                                                    </div>
                                                </button>

                                                {expanded && (
                                                    <div className="border-t bg-muted/10 px-5 py-5">
                                                        {vaccine.batches.length ===
                                                        0 ? (
                                                            <div className="rounded-lg border border-dashed px-5 py-8 text-center">
                                                                <p className="font-medium">
                                                                    No active batches
                                                                </p>

                                                                <p className="mt-1 text-sm text-muted-foreground">
                                                                    This vaccine currently has no active inventory batch.
                                                                </p>

                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    className="mt-4"
                                                                    onClick={() =>
                                                                        router.visit(
                                                                            route(
                                                                                'vaccine-inventory.create',
                                                                            ),
                                                                        )
                                                                    }
                                                                >
                                                                    <PackagePlus className="mr-2 h-4 w-4" />
                                                                    Add Batch
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <div className="overflow-x-auto rounded-lg border">
                                                                <table className="w-full min-w-[900px] text-sm">
                                                                    <thead className="border-b bg-muted/30">
                                                                        <tr>
                                                                            <th className="px-4 py-3 text-left font-medium">
                                                                                Batch
                                                                            </th>
                                                                            <th className="px-4 py-3 text-center font-medium">
                                                                                Quantity
                                                                            </th>
                                                                            <th className="px-4 py-3 text-center font-medium">
                                                                                Reserved
                                                                            </th>
                                                                            <th className="px-4 py-3 text-center font-medium">
                                                                                Free
                                                                            </th>
                                                                            <th className="px-4 py-3 text-left font-medium">
                                                                                Received
                                                                            </th>
                                                                            <th className="px-4 py-3 text-left font-medium">
                                                                                Expiration
                                                                            </th>
                                                                            <th className="px-4 py-3 text-left font-medium">
                                                                                Status
                                                                            </th>
                                                                            <th className="px-4 py-3 text-right font-medium">
                                                                                Actions
                                                                            </th>
                                                                        </tr>
                                                                    </thead>

                                                                    <tbody className="divide-y">
                                                                        {vaccine.batches.map(
                                                                            (
                                                                                batch,
                                                                            ) => (
                                                                                <tr
                                                                                    key={
                                                                                        batch.id
                                                                                    }
                                                                                >
                                                                                    <td className="px-4 py-3">
                                                                                        <p className="font-medium">
                                                                                            {
                                                                                                batch.batch_number
                                                                                            }
                                                                                        </p>

                                                                                        {(batch.manufacturer ||
                                                                                            batch.supplier) && (
                                                                                            <p className="mt-1 text-xs text-muted-foreground">
                                                                                                {[
                                                                                                    batch.manufacturer,
                                                                                                    batch.supplier,
                                                                                                ]
                                                                                                    .filter(
                                                                                                        Boolean,
                                                                                                    )
                                                                                                    .join(
                                                                                                        ' · ',
                                                                                                    )}
                                                                                            </p>
                                                                                        )}
                                                                                    </td>

                                                                                    <td className="px-4 py-3 text-center font-medium">
                                                                                        {
                                                                                            batch.quantity
                                                                                        }
                                                                                    </td>

                                                                                    <td className="px-4 py-3 text-center">
                                                                                        {
                                                                                            batch.reserved
                                                                                        }
                                                                                    </td>

                                                                                    <td className="px-4 py-3 text-center">
                                                                                        {
                                                                                            batch.free_capacity
                                                                                        }
                                                                                    </td>

                                                                                    <td className="px-4 py-3">
                                                                                        {formatDate(
                                                                                            batch.date_received,
                                                                                        )}
                                                                                    </td>

                                                                                    <td className="px-4 py-3">
                                                                                        {formatDate(
                                                                                            batch.expiration_date,
                                                                                        )}
                                                                                    </td>

                                                                                    <td className="px-4 py-3">
                                                                                        <Badge
                                                                                            variant="outline"
                                                                                            className={batchStatusClass(
                                                                                                batch.status,
                                                                                            )}
                                                                                        >
                                                                                            {
                                                                                                batch.status
                                                                                            }
                                                                                        </Badge>
                                                                                    </td>

                                                                                    <td className="px-4 py-3">
                                                                                        <div className="flex justify-end gap-2">
                                                                                            <Button
                                                                                                type="button"
                                                                                                size="sm"
                                                                                                variant="outline"
                                                                                                onClick={() =>
                                                                                                    router.visit(
                                                                                                        route(
                                                                                                            'vaccine-inventory.edit',
                                                                                                            batch.id,
                                                                                                        ),
                                                                                                    )
                                                                                                }
                                                                                            >
                                                                                                Edit
                                                                                            </Button>
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                            ),
                                                                        )}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    },
                                )}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

function Metric({
    label,
    value,
}: {
    label: string;
    value: number;
}) {
    return (
        <div className="hidden xl:block">
            <p className="text-xs text-muted-foreground">
                {label}
            </p>

            <p className="mt-1 text-sm font-semibold">
                {value}
            </p>
        </div>
    );
}

function SummaryCard({
    label,
    value,
    description,
}: {
    label: string;
    value: number;
    description: string;
}) {
    return (
        <Card>
            <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">
                    {label}
                </p>

                <p className="mt-2 text-3xl font-bold">
                    {value}
                </p>

                <p className="mt-2 text-xs text-muted-foreground">
                    {description}
                </p>
            </CardContent>
        </Card>
    );
}
