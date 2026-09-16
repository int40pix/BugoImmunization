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
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    Calendar,
    CheckCircle2,
    FileText,
    History,
    LoaderCircle,
    PackageCheck,
    QrCode,
    RotateCcw,
    Search,
    Syringe,
    User,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { BatchQrModal } from './components/batch-qr-modal';
import { InventorySubnav } from './components/inventory-subnav';

type TransactionItem = {
    id: number;
    vaccine_id: number;
    vaccine_inventory_id: number | null;
    user_id: number | null;
    patient_id: number | null;
    immunization_record_id: number | null;
    transaction_type:
        | 'received'
        | 'administered'
        | 'adjustment'
        | 'wastage'
        | 'expired'
        | 'archived';
    quantity_change: number;
    balance_after: number | null;
    batch_number: string;
    remarks: string | null;
    created_at: string;
    vaccine?: {
        id: number;
        name: string;
        category: string | null;
    } | null;
    user?: {
        id: number;
        name: string;
        role: string;
    } | null;
    patient?: {
        id: number;
        patient_id: string;
        first_name: string;
        middle_name: string | null;
        last_name: string;
    } | null;
};

type PaginatedData<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    prev_page_url: string | null;
    next_page_url: string | null;
    links: { url: string | null; label: string; active: boolean }[];
};

type Summary = {
    total_received: number;
    total_administered: number;
    total_wastage: number;
    total_transactions: number;
};

type VaccineOption = {
    id: number;
    name: string;
    category: string | null;
};

type Props = {
    transactions: PaginatedData<TransactionItem>;
    summary: Summary;
    vaccines: VaccineOption[];
    filters: {
        search?: string;
        type?: string;
        vaccine_id?: string;
        date_from?: string;
        date_to?: string;
    };
};

function formatDateTime(dateStr: string) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

function getTransactionBadge(type: TransactionItem['transaction_type']) {
    switch (type) {
        case 'received':
            return (
                <Badge
                    variant="outline"
                    className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 gap-1 font-medium text-[11px]"
                >
                    <ArrowUpRight className="h-3 w-3" />
                    Received
                </Badge>
            );
        case 'administered':
            return (
                <Badge
                    variant="outline"
                    className="border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400 gap-1 font-medium text-[11px]"
                >
                    <Syringe className="h-3 w-3" />
                    Administered
                </Badge>
            );
        case 'adjustment':
            return (
                <Badge
                    variant="outline"
                    className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 gap-1 font-medium text-[11px]"
                >
                    <RotateCcw className="h-3 w-3" />
                    Adjustment
                </Badge>
            );
        case 'wastage':
            return (
                <Badge
                    variant="outline"
                    className="border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400 gap-1 font-medium text-[11px]"
                >
                    <AlertTriangle className="h-3 w-3" />
                    Wastage
                </Badge>
            );
        case 'expired':
            return (
                <Badge
                    variant="outline"
                    className="border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400 gap-1 font-medium text-[11px]"
                >
                    <AlertTriangle className="h-3 w-3" />
                    Expired
                </Badge>
            );
        case 'archived':
            return (
                <Badge
                    variant="outline"
                    className="border-muted-foreground/30 bg-muted text-muted-foreground gap-1 font-medium text-[11px]"
                >
                    Archived
                </Badge>
            );
        default:
            return <Badge variant="outline">{type}</Badge>;
    }
}

export default function VaccineInventoryTransactions() {
    const { transactions, summary, vaccines, filters } = usePage<Props>().props;

    const [search, setSearch] = useState(filters.search || '');
    const [type, setType] = useState(filters.type || 'all');
    const [vaccineId, setVaccineId] = useState(filters.vaccine_id || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [loading, setLoading] = useState(false);

    // Selected batch for Batch QR Modal
    const [selectedBatch, setSelectedBatch] = useState<{
        id: number;
        batch_number: string;
        quantity: number;
        expiration_date: string;
        vaccine_name?: string;
    } | null>(null);
    const [qrModalOpen, setQrModalOpen] = useState(false);

    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const timeout = setTimeout(() => {
            router.get(
                route('vaccine-inventory.transactions'),
                {
                    search: search || undefined,
                    type: type !== 'all' ? type : undefined,
                    vaccine_id: vaccineId !== 'all' ? vaccineId : undefined,
                    date_from: dateFrom || undefined,
                    date_to: dateTo || undefined,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    onStart: () => setLoading(true),
                    onFinish: () => setLoading(false),
                }
            );
        }, 350);

        return () => clearTimeout(timeout);
    }, [search, type, vaccineId, dateFrom, dateTo]);

    const handleClearFilters = () => {
        setSearch('');
        setType('all');
        setVaccineId('all');
        setDateFrom('');
        setDateTo('');
    };

    const hasActiveFilters =
        Boolean(search) ||
        type !== 'all' ||
        vaccineId !== 'all' ||
        Boolean(dateFrom) ||
        Boolean(dateTo);

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Vaccine Inventory', href: route('vaccine-inventory.index') },
                { title: 'Transaction History', href: route('vaccine-inventory.transactions') },
            ]}
        >
            <Head title="Inventory Transaction History - Bugo Health Center" />

            <div className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-7">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Inventory Transaction History</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Complete chronological audit ledger tracking all vaccine movements, administrations, stock receipts, and wastage events.
                    </p>
                </div>

                {/* Shared Sub-navigation */}
                <InventorySubnav current="transactions" />

                {/* Metrics Cards */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Card className="border-border/60">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Total Received
                                </p>
                                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                    +{summary.total_received.toLocaleString()}
                                </p>
                                <p className="text-[11px] text-muted-foreground">Doses stocked into inventory</p>
                            </div>
                            <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <PackageCheck className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Total Administered
                                </p>
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {summary.total_administered.toLocaleString()}
                                </p>
                                <p className="text-[11px] text-muted-foreground">Doses given to patients</p>
                            </div>
                            <div className="h-11 w-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                <Syringe className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Wastage / Spoilage
                                </p>
                                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                                    {summary.total_wastage.toLocaleString()}
                                </p>
                                <p className="text-[11px] text-muted-foreground">Doses discarded or compromised</p>
                            </div>
                            <div className="h-11 w-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Audit Events
                                </p>
                                <p className="text-2xl font-bold text-foreground">
                                    {summary.total_transactions.toLocaleString()}
                                </p>
                                <p className="text-[11px] text-muted-foreground">Total immutable logged transactions</p>
                            </div>
                            <div className="h-11 w-11 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                <History className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter Controls Card */}
                <Card className="border-border/60 shadow-2xs">
                    <CardContent className="pt-5 pb-5">
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                            {/* Search */}
                            <div className="relative lg:col-span-2">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search batch, vaccine, patient, or staff..."
                                    className="pl-10 h-9 text-xs"
                                />
                            </div>

                            {/* Transaction Type */}
                            <div>
                                <Select value={type} onValueChange={setType}>
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder="All Transaction Types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="received">Stock Received (+)</SelectItem>
                                        <SelectItem value="administered">Administered (-)</SelectItem>
                                        <SelectItem value="adjustment">Adjustments</SelectItem>
                                        <SelectItem value="wastage">Wastage / Spoilage</SelectItem>
                                        <SelectItem value="expired">Expired Batches</SelectItem>
                                        <SelectItem value="archived">Archived Batches</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Vaccine Selector */}
                            <div>
                                <Select value={vaccineId} onValueChange={setVaccineId}>
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder="All Vaccines" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Vaccines</SelectItem>
                                        {vaccines.map((v) => (
                                            <SelectItem key={v.id} value={String(v.id)}>
                                                {v.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Date Filter & Clear */}
                            <div className="flex items-center gap-2">
                                <div className="flex-1 flex items-center gap-1">
                                    <Input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                        className="h-9 text-xs px-2"
                                        title="Date From"
                                    />
                                    <span className="text-xs text-muted-foreground">to</span>
                                    <Input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                        className="h-9 text-xs px-2"
                                        title="Date To"
                                    />
                                </div>
                                {hasActiveFilters && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleClearFilters}
                                        className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground"
                                        title="Clear all filters"
                                    >
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </div>

                        {loading && (
                            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                                <LoaderCircle className="h-3.5 w-3.5 animate-spin text-primary" />
                                Updating transaction ledger...
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Transactions Table Card */}
                <Card className="border-border/60 shadow-2xs">
                    <CardHeader className="border-b py-4">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="text-base font-semibold">Transaction Ledger</CardTitle>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Showing {transactions.from ?? 0} to {transactions.to ?? 0} of{' '}
                                    {transactions.total} records
                                </p>
                            </div>
                            <Badge variant="outline" className="self-start sm:self-auto font-mono text-xs">
                                Page {transactions.current_page} of {transactions.last_page}
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        {transactions.data.length === 0 ? (
                            <div className="py-14 px-6 text-center space-y-3">
                                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                                    <History className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-semibold text-sm text-foreground">
                                        No inventory transactions found
                                    </p>
                                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                                        No stock movements match the specified filter criteria. Try adjusting your search query or date range.
                                    </p>
                                </div>
                                {hasActiveFilters && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleClearFilters}
                                        className="text-xs"
                                    >
                                        Reset Filters
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead className="border-b bg-muted/40 text-muted-foreground font-medium uppercase tracking-wider text-[10px]">
                                        <tr>
                                            <th className="py-3 px-4 text-left">Date & Time</th>
                                            <th className="py-3 px-4 text-left">Type</th>
                                            <th className="py-3 px-4 text-left">Vaccine</th>
                                            <th className="py-3 px-4 text-left">Batch / Lot</th>
                                            <th className="py-3 px-4 text-right">Quantity Change</th>
                                            <th className="py-3 px-4 text-right">Balance</th>
                                            <th className="py-3 px-4 text-left">Patient / Destination</th>
                                            <th className="py-3 px-4 text-left">Logged By</th>
                                            <th className="py-3 px-4 text-left">Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/60">
                                        {transactions.data.map((item) => {
                                            const isPositive = item.quantity_change > 0;
                                            const isNegative = item.quantity_change < 0;

                                            return (
                                                <tr
                                                    key={item.id}
                                                    className="hover:bg-muted/30 transition-colors"
                                                >
                                                    {/* Date & Time */}
                                                    <td className="py-3 px-4 whitespace-nowrap text-muted-foreground">
                                                        {formatDateTime(item.created_at)}
                                                    </td>

                                                    {/* Type */}
                                                    <td className="py-3 px-4 whitespace-nowrap">
                                                        {getTransactionBadge(item.transaction_type)}
                                                    </td>

                                                    {/* Vaccine */}
                                                    <td className="py-3 px-4 font-medium text-foreground">
                                                        <div>{item.vaccine?.name || '—'}</div>
                                                        {item.vaccine?.category && (
                                                            <span className="text-[10px] text-muted-foreground capitalize">
                                                                {item.vaccine.category}
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Batch / Lot */}
                                                    <td className="py-3 px-4 whitespace-nowrap">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedBatch({
                                                                    id: item.vaccine_inventory_id || item.id,
                                                                    batch_number: item.batch_number,
                                                                    quantity: item.balance_after ?? 0,
                                                                    expiration_date: '—',
                                                                    vaccine_name: item.vaccine?.name,
                                                                });
                                                                setQrModalOpen(true);
                                                            }}
                                                            className="inline-flex items-center gap-1.5 font-mono font-semibold text-primary hover:underline group"
                                                            title="View Batch QR code"
                                                        >
                                                            <span>{item.batch_number}</span>
                                                            <QrCode className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" />
                                                        </button>
                                                    </td>

                                                    {/* Quantity Change */}
                                                    <td className="py-3 px-4 text-right whitespace-nowrap font-bold">
                                                        <span
                                                            className={
                                                                isPositive
                                                                    ? 'text-emerald-600 dark:text-emerald-400'
                                                                    : isNegative
                                                                    ? 'text-foreground'
                                                                    : 'text-muted-foreground'
                                                            }
                                                        >
                                                            {isPositive ? `+${item.quantity_change}` : item.quantity_change}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground font-normal ml-1">
                                                            doses
                                                        </span>
                                                    </td>

                                                    {/* Balance After */}
                                                    <td className="py-3 px-4 text-right whitespace-nowrap text-muted-foreground font-medium">
                                                        {item.balance_after !== null ? (
                                                            <span>{item.balance_after} doses</span>
                                                        ) : (
                                                            '—'
                                                        )}
                                                    </td>

                                                    {/* Patient / Destination */}
                                                    <td className="py-3 px-4 whitespace-nowrap">
                                                        {item.patient ? (
                                                            <Link
                                                                href={route('patients.show', item.patient.id)}
                                                                className="font-medium text-primary hover:underline flex items-center gap-1.5"
                                                            >
                                                                <span>
                                                                    {item.patient.first_name}{' '}
                                                                    {item.patient.last_name}
                                                                </span>
                                                                <span className="text-[10px] text-muted-foreground font-mono">
                                                                    ({item.patient.patient_id})
                                                                </span>
                                                            </Link>
                                                        ) : (
                                                            <span className="text-muted-foreground">—</span>
                                                        )}
                                                    </td>

                                                    {/* Logged By */}
                                                    <td className="py-3 px-4 whitespace-nowrap">
                                                        {item.user ? (
                                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                                <User className="h-3 w-3 text-muted-foreground/80" />
                                                                <span className="font-medium text-foreground">
                                                                    {item.user.name}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground">System</span>
                                                        )}
                                                    </td>

                                                    {/* Remarks */}
                                                    <td className="py-3 px-4 text-muted-foreground max-w-[200px] truncate" title={item.remarks || ''}>
                                                        {item.remarks || '—'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination Links */}
                        {transactions.links.length > 3 && (
                            <div className="flex items-center justify-between border-t border-border/60 px-4 py-3 text-xs">
                                <div className="text-muted-foreground">
                                    Showing {transactions.from ?? 0} to {transactions.to ?? 0} of{' '}
                                    {transactions.total} transactions
                                </div>
                                <div className="flex items-center gap-1">
                                    {transactions.links.map((link, idx) => {
                                        if (!link.url) {
                                            return (
                                                <span
                                                    key={idx}
                                                    className="px-2.5 py-1 text-muted-foreground/50 text-xs"
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            );
                                        }

                                        return (
                                            <Link
                                                key={idx}
                                                href={link.url}
                                                className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
                                                    link.active
                                                        ? 'bg-primary text-primary-foreground font-medium'
                                                        : 'text-foreground hover:bg-muted'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Batch QR Modal */}
            <BatchQrModal
                open={qrModalOpen}
                onOpenChange={setQrModalOpen}
                batch={selectedBatch}
            />
        </AppLayout>
    );
}

