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

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';

import AppLayout from '@/layouts/app-layout';

import {
    Head,
    Link,
    router,
    usePage,
} from '@inertiajs/react';

import {
    Archive,
    ArrowLeft,
    Clock,
    Eye,
    History,
    Info,
    Search,
    ShieldAlert,
    User,
} from 'lucide-react';

import { InventorySubnav } from './components/inventory-subnav';

import {
    useEffect,
    useRef,
    useState,
} from 'react';


/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

type VaccineMaster = {
    id: number;
    name: string;
};


type VaccineOption = {
    id: number;
    name: string;
};


type ArchivedVaccineInventory = {
    id: number;

    vaccine_id: number;

    vaccine:
        VaccineMaster | null;

    batch_number: string;
    quantity: number;

    expiration_date: string;

    manufacturer:
        string | null;

    supplier:
        string | null;

    remarks:
        string | null;

    is_archived: boolean;

    archived_at:
        string | null;

    archive_reason:
        string | null;

    archive_transaction?: {
        id: number;
        transaction_type: string;
        quantity_change: number;
        balance_after: number;
        remarks: string | null;
        created_at: string;
        user?: {
            id: number;
            name: string;
        } | null;
    } | null;
};


/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function ArchivedVaccineInventory() {

    /*
    |--------------------------------------------------------------------------
    | PAGE PROPS
    |--------------------------------------------------------------------------
    */

    const {
        vaccines,
        vaccineOptions,
        filters,
    } = usePage<{
        vaccines:
            ArchivedVaccineInventory[];

        vaccineOptions:
            VaccineOption[];

        filters: {
            search?: string;
            vaccine_id?: string;
            archive_reason?: string;
            highlighted_batch_id?: string;
        };
    }>().props;


    /*
    |--------------------------------------------------------------------------
    | FILTER & SELECTION STATES
    |--------------------------------------------------------------------------
    */

    const highlightedBatchId =
        filters.highlighted_batch_id ||
        (typeof window !== 'undefined'
            ? new URLSearchParams(window.location.search).get('highlighted_batch_id') ||
              new URLSearchParams(window.location.search).get('batch_id')
            : null);

    const [
        selectedBatch,
        setSelectedBatch,
    ] = useState<ArchivedVaccineInventory | null>(null);

    const [
        sheetOpen,
        setSheetOpen,
    ] = useState(false);

    const [
        search,
        setSearch,
    ] = useState(
        filters.search || ''
    );


    const [
        vaccineId,
        setVaccineId,
    ] = useState(
        filters.vaccine_id || 'all'
    );


    const [
        archiveReason,
        setArchiveReason,
    ] = useState(
        filters.archive_reason || 'all'
    );


    /*
    |--------------------------------------------------------------------------
    | AUTO-SELECT / HIGHLIGHT ON LOAD
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (highlightedBatchId && vaccines.length > 0) {
            const match = vaccines.find(
                (v) =>
                    String(v.id) === String(highlightedBatchId) ||
                    v.batch_number.toLowerCase() === String(highlightedBatchId).toLowerCase()
            );
            if (match) {
                setSelectedBatch(match);
                setSheetOpen(true);
            }
        }
    }, [highlightedBatchId, vaccines]);


    /*
    |--------------------------------------------------------------------------
    | FILTER REQUEST
    |--------------------------------------------------------------------------
    */

    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const timeout =
            setTimeout(() => {

                router.get(
                    route(
                        'vaccine-inventory.archived'
                    ),

                    {
                        search,

                        vaccine_id:
                            vaccineId,

                        archive_reason:
                            archiveReason,
                    },

                    {
                        preserveState: true,

                        preserveScroll: true,

                        replace: true,
                    }
                );

            }, 400);


        return () =>
            clearTimeout(
                timeout
            );

    }, [
        search,
        vaccineId,
        archiveReason,
    ]);


    /*
    |--------------------------------------------------------------------------
    | FORMAT ARCHIVE REASON
    |--------------------------------------------------------------------------
    */

    function formatArchiveReason(
        reason: string | null
    ) {

        if (!reason) {
            return 'Unknown';
        }


        if (
            reason === 'expired'
        ) {
            return 'Expired';
        }


        if (
            reason === 'out_of_stock'
        ) {
            return 'Out of Stock';
        }


        return reason
            .replaceAll(
                '_',
                ' '
            )
            .replace(
                /\b\w/g,
                (character) =>
                    character.toUpperCase()
            );
    }


    /*
    |--------------------------------------------------------------------------
    | FORMAT DATE
    |--------------------------------------------------------------------------
    */

    function formatDate(
        date: string | null
    ) {

        if (!date) {
            return '—';
        }


        return new Date(
            date
        ).toLocaleDateString(
            'en-PH',
            {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            }
        );
    }


    /*
    |--------------------------------------------------------------------------
    | FORMAT DATE TIME
    |--------------------------------------------------------------------------
    */

    function formatDateTime(
        date: string | null
    ) {

        if (!date) {
            return '—';
        }


        return new Date(
            date
        ).toLocaleString(
            'en-PH',
            {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            }
        );
    }


    /*
    |--------------------------------------------------------------------------
    | PAGE
    |--------------------------------------------------------------------------
    */

    return (

        <AppLayout>


            <Head title="Archived Vaccine Batches" />


            <div className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-4 sm:gap-6 p-2.5 sm:p-4 lg:p-6">


                {/* ========================================================= */}
                {/* HEADER */}
                {/* ========================================================= */}

                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                        Archived Vaccine Batches
                    </h1>
                    <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                        View historical vaccine batches that were archived after expiration, depletion, or recall.
                    </p>
                </div>

                <InventorySubnav current="archived" />


                {/* ========================================================= */}
                {/* ARCHIVE INFO */}
                {/* ========================================================= */}

                <Card>

                    <CardContent className="p-3.5 sm:p-5">

                        <div className="flex gap-3">

                            <Archive className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />


                            <div>

                                <p className="font-medium text-sm">

                                    Historical Inventory

                                </p>


                                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">

                                    Archived batches remain
                                    recorded for historical
                                    purposes.

                                    Remaining quantities are
                                    preserved but are not
                                    considered usable vaccine
                                    stock.

                                </p>

                            </div>

                        </div>

                    </CardContent>

                </Card>


                {/* ========================================================= */}
                {/* FILTERS */}
                {/* ========================================================= */}

                <Card>

                    <CardContent className="p-3 sm:p-4">

                        <div className="grid gap-3 md:grid-cols-3">


                            {/* SEARCH */}

                            <div className="relative">

                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />


                                <Input
                                    type="search"
                                    placeholder="Search archived batches..."
                                    className="pl-10"
                                    value={
                                        search
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setSearch(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>


                            {/* VACCINE FILTER */}

                            <Select
                                value={
                                    vaccineId
                                }
                                onValueChange={(
                                    value
                                ) =>
                                    setVaccineId(
                                        value
                                    )
                                }
                            >

                                <SelectTrigger>

                                    <SelectValue placeholder="All vaccines" />

                                </SelectTrigger>


                                <SelectContent>

                                    <SelectItem value="all">

                                        All Vaccines

                                    </SelectItem>


                                    {vaccineOptions.map(
                                        (
                                            vaccine
                                        ) => (

                                            <SelectItem
                                                key={
                                                    vaccine.id
                                                }
                                                value={
                                                    String(
                                                        vaccine.id
                                                    )
                                                }
                                            >

                                                {
                                                    vaccine.name
                                                }

                                            </SelectItem>

                                        )
                                    )}

                                </SelectContent>

                            </Select>


                            {/* ARCHIVE REASON */}

                            <Select
                                value={
                                    archiveReason
                                }
                                onValueChange={(
                                    value
                                ) =>
                                    setArchiveReason(
                                        value
                                    )
                                }
                            >

                                <SelectTrigger>

                                    <SelectValue placeholder="All archive reasons" />

                                </SelectTrigger>


                                <SelectContent>

                                    <SelectItem value="all">

                                        All Archive Reasons

                                    </SelectItem>


                                    <SelectItem value="expired">

                                        Expired

                                    </SelectItem>


                                    <SelectItem value="out_of_stock">

                                        Out of Stock

                                    </SelectItem>

                                </SelectContent>

                            </Select>


                        </div>

                    </CardContent>

                </Card>


                {/* ========================================================= */}
                {/* ARCHIVED TABLE */}
                {/* ========================================================= */}

                <Card>


                    <CardHeader>

                        <CardTitle>
                            Archived Records
                        </CardTitle>

                    </CardHeader>


                    <CardContent className="p-0 sm:p-6">
                        {vaccines.length === 0 ? (
                            <div className="px-4 py-12 text-center">
                                <Archive className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                                <p className="font-medium text-sm">No archived batches found.</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Archived vaccine batches will appear here.
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Mobile Card List View (<md) */}
                                <div className="d-block d-md-none divide-y divide-border">
                                    {vaccines.map((inventory) => {
                                        const isHighlighted =
                                            (highlightedBatchId &&
                                                (String(inventory.id) === String(highlightedBatchId) ||
                                                    inventory.batch_number.toLowerCase() === String(highlightedBatchId).toLowerCase())) ||
                                            selectedBatch?.id === inventory.id;

                                        return (
                                            <div
                                                key={`mob-${inventory.id}`}
                                                className={`p-3 space-y-2 transition-colors ${
                                                    isHighlighted
                                                        ? 'bg-primary/10 ring-1 ring-inset ring-primary/40'
                                                        : 'hover:bg-muted/40'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <div className="font-semibold text-foreground text-xs">
                                                            {inventory.vaccine?.name ?? 'Unknown Vaccine'}
                                                        </div>
                                                        <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
                                                            Batch #{inventory.batch_number}
                                                        </div>
                                                    </div>
                                                    <span
                                                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                                            inventory.archive_reason === 'expired'
                                                                ? 'border border-destructive/25 bg-destructive/15 text-destructive'
                                                                : inventory.archive_reason === 'out_of_stock'
                                                                ? 'border border-amber-500/25 bg-amber-500/15 text-amber-700 dark:text-amber-400'
                                                                : 'border bg-muted text-muted-foreground'
                                                        }`}
                                                    >
                                                        {formatArchiveReason(inventory.archive_reason)}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2 text-[11px] bg-muted/30 rounded-lg p-2 border border-border/50">
                                                    <div>
                                                        <span className="text-muted-foreground">Remaining: </span>
                                                        <strong className="text-foreground font-semibold">{inventory.quantity} doses</strong>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Exp: </span>
                                                        <span className="text-foreground">{formatDate(inventory.expiration_date)}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                                                    <span>Archived: {formatDate(inventory.archived_at)}</span>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-7 text-xs px-2"
                                                        onClick={() => {
                                                            setSelectedBatch(inventory);
                                                            setSheetOpen(true);
                                                        }}
                                                    >
                                                        <Eye className="mr-1 h-3 w-3" />
                                                        Details
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Desktop Table View (>=md) */}
                                <div className="d-none d-md-block overflow-x-auto">
                                    <div className="overflow-hidden rounded-lg border">
                                        <table className="w-full text-left text-sm">
                                            <thead className="border-b">
                                                <tr>
                                                    <th className="px-4 py-3 font-medium">Vaccine</th>
                                                    <th className="px-4 py-3 font-medium">Batch Number</th>
                                                    <th className="px-4 py-3 text-center font-medium">Remaining Stock</th>
                                                    <th className="px-4 py-3 font-medium">Expiration Date</th>
                                                    <th className="px-4 py-3 font-medium">Archive Reason</th>
                                                    <th className="px-4 py-3 font-medium">Archived On</th>
                                                    <th className="px-4 py-3 text-right font-medium">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {vaccines.map((inventory) => {
                                                    const isHighlighted =
                                                        (highlightedBatchId &&
                                                            (String(inventory.id) === String(highlightedBatchId) ||
                                                                inventory.batch_number.toLowerCase() === String(highlightedBatchId).toLowerCase())) ||
                                                        selectedBatch?.id === inventory.id;

                                                    return (
                                                        <tr
                                                            key={inventory.id}
                                                            className={`border-b last:border-b-0 transition-colors ${
                                                                isHighlighted
                                                                    ? 'bg-primary/10 ring-1 ring-inset ring-primary/40'
                                                                    : 'hover:bg-muted/40'
                                                            }`}
                                                        >
                                                            <td className="px-4 py-4">
                                                                <div>
                                                                    <p className="font-medium">
                                                                        {inventory.vaccine?.name ?? 'Unknown Vaccine'}
                                                                    </p>
                                                                    {inventory.manufacturer && (
                                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                                            {inventory.manufacturer}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                <span className="font-mono font-medium">
                                                                    {inventory.batch_number}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-4 text-center">
                                                                <span className="font-semibold">
                                                                    {inventory.quantity}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                {formatDate(inventory.expiration_date)}
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                <span
                                                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                                                                        inventory.archive_reason === 'expired'
                                                                            ? 'border border-destructive/25 bg-destructive/15 text-destructive'
                                                                            : inventory.archive_reason === 'out_of_stock'
                                                                            ? 'border border-amber-500/25 bg-amber-500/15 text-amber-700 dark:text-amber-400'
                                                                            : 'border bg-muted text-muted-foreground'
                                                                    }`}
                                                                >
                                                                    {formatArchiveReason(inventory.archive_reason)}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                {formatDate(inventory.archived_at)}
                                                            </td>
                                                            <td className="px-4 py-4 text-right">
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setSelectedBatch(inventory);
                                                                        setSheetOpen(true);
                                                                    }}
                                                                >
                                                                    <Eye className="mr-1.5 h-3.5 w-3.5" />
                                                                    View Details
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>


                </Card>


            </div>


            {/* ============================================================= */}
            {/* ARCHIVED BATCH DETAILS SHEET */}
            {/* ============================================================= */}

            <Sheet
                open={sheetOpen}
                onOpenChange={setSheetOpen}
            >

                <SheetContent className="overflow-y-auto sm:max-w-md">

                    <SheetHeader className="border-b pb-4">

                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">

                            <Archive className="h-4 w-4" />

                            Archived Vaccine Record

                        </div>

                        <SheetTitle className="text-xl font-bold">

                            {selectedBatch?.vaccine?.name ?? 'Unknown Vaccine'}

                        </SheetTitle>

                        <SheetDescription className="text-xs">

                            Archived on {formatDateTime(selectedBatch?.archived_at ?? null)}

                        </SheetDescription>

                    </SheetHeader>


                    {selectedBatch && (

                        <div className="space-y-5 py-5 text-sm">

                            {/* BADGES */}

                            <div className="flex flex-wrap items-center gap-2">

                                <span
                                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                        selectedBatch.archive_reason === 'expired'
                                            ? 'border border-destructive/30 bg-destructive/15 text-destructive'
                                            : selectedBatch.archive_reason === 'out_of_stock'
                                            ? 'border border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-400'
                                            : 'border bg-secondary text-secondary-foreground'
                                    }`}
                                >

                                    Reason: {formatArchiveReason(selectedBatch.archive_reason)}

                                </span>

                                <span className="inline-flex items-center rounded-full border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">

                                    Status: Archived

                                </span>

                            </div>


                            {/* AUDIT ATTRIBUTION */}

                            <div className="space-y-3 rounded-lg border bg-muted/30 p-4">

                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">

                                    Audit Trail

                                </h4>

                                <div className="grid grid-cols-2 gap-3 text-xs">

                                    <div>

                                        <span className="block text-muted-foreground">
                                            Action Logged By
                                        </span>

                                        <span className="mt-0.5 flex items-center gap-1.5 font-semibold text-foreground">

                                            <User className="h-3.5 w-3.5 text-muted-foreground" />

                                            {selectedBatch.archive_transaction?.user?.name
                                                ? selectedBatch.archive_transaction.user.name
                                                : 'System (Automated)'}

                                        </span>

                                    </div>

                                    <div>

                                        <span className="block text-muted-foreground">
                                            Archived Timestamp
                                        </span>

                                        <span className="mt-0.5 block font-medium text-foreground">

                                            {formatDateTime(selectedBatch.archived_at)}

                                        </span>

                                    </div>

                                    <div>

                                        <span className="block text-muted-foreground">
                                            Stock at Archival
                                        </span>

                                        <span className="mt-0.5 block font-semibold text-foreground">

                                            {selectedBatch.archive_transaction
                                                ? Math.abs(selectedBatch.archive_transaction.quantity_change)
                                                : selectedBatch.quantity}{' '}
                                            doses deducted

                                        </span>

                                    </div>

                                    <div>

                                        <span className="block text-muted-foreground">
                                            Current Active Stock
                                        </span>

                                        <span className="mt-0.5 block font-semibold text-foreground">

                                            0 doses (Archived)

                                        </span>

                                    </div>

                                </div>


                                {(selectedBatch.archive_transaction?.remarks || selectedBatch.remarks) && (

                                    <div className="border-t pt-2 text-xs">

                                        <span className="block font-medium text-muted-foreground">
                                            Audit Remarks:
                                        </span>

                                        <p className="mt-1 whitespace-pre-wrap rounded border border-border/50 bg-background/60 p-2.5 text-foreground">

                                            {selectedBatch.archive_transaction?.remarks || selectedBatch.remarks}

                                        </p>

                                    </div>

                                )}

                            </div>


                            {/* BATCH DETAILS */}

                            <div className="space-y-3 rounded-lg border p-4">

                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">

                                    Batch Details

                                </h4>

                                <div className="space-y-2.5 text-xs">

                                    <div className="flex items-center justify-between border-b border-border/50 py-1">

                                        <span className="text-muted-foreground">
                                            Batch Number
                                        </span>

                                        <span className="font-mono font-semibold">

                                            {selectedBatch.batch_number}

                                        </span>

                                    </div>

                                    <div className="flex items-center justify-between border-b border-border/50 py-1">

                                        <span className="text-muted-foreground">
                                            Expiration Date
                                        </span>

                                        <span className="font-medium">

                                            {formatDate(selectedBatch.expiration_date)}

                                        </span>

                                    </div>

                                    <div className="flex items-center justify-between border-b border-border/50 py-1">

                                        <span className="text-muted-foreground">
                                            Manufacturer
                                        </span>

                                        <span className="font-medium">

                                            {selectedBatch.manufacturer || '—'}

                                        </span>

                                    </div>

                                    <div className="flex items-center justify-between py-1">

                                        <span className="text-muted-foreground">
                                            Supplier
                                        </span>

                                        <span className="font-medium">

                                            {selectedBatch.supplier || '—'}

                                        </span>

                                    </div>

                                </div>

                            </div>


                            {/* ACTIONS */}

                            <div className="space-y-2 pt-2">

                                <Button
                                    type="button"
                                    variant="default"
                                    className="w-full"
                                    onClick={() => {
                                        router.visit(
                                            route('vaccine-inventory.transactions', {
                                                search: selectedBatch.batch_number,
                                            })
                                        );
                                    }}
                                >

                                    <History className="mr-2 h-4 w-4" />

                                    View Full Transaction Ledger

                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setSheetOpen(false)}
                                >

                                    Close

                                </Button>

                            </div>

                        </div>

                    )}

                </SheetContent>

            </Sheet>


        </AppLayout>
    );
}