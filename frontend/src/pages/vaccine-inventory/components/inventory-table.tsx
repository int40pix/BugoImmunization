import { Button } from '@/components/ui/button';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import { Label } from '@/components/ui/label';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import { Textarea } from '@/components/ui/textarea';

import { router } from '@inertiajs/react';

import {
    Archive,
    Clock3,
    LoaderCircle,
    PackageSearch,
    Pencil,
    Settings2,
    TriangleAlert,
} from 'lucide-react';

import {
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


type VaccineInventory = {
    id: number;

    vaccine_id: number;
    vaccine: VaccineMaster | null;

    batch_number: string;
    quantity: number;
    expiration_date: string;

    manufacturer: string | null;
    supplier: string | null;
    remarks: string | null;

    is_archived: boolean;
    archived_at: string | null;
    archive_reason: string | null;

    /*
     * Added by VaccineInventoryController.
     */
    days_until_expiry?: number;
    is_near_expiry?: boolean;
};


type InventoryTableProps = {
    vaccines: VaccineInventory[];
    loading?: boolean;
};


type ConfirmationType =
    | 'archive'
    | null;


/*
|--------------------------------------------------------------------------
| CONSTANTS
|--------------------------------------------------------------------------
*/

const NEAR_EXPIRY_DAYS = 30;


/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function InventoryTable({
    vaccines,
    loading = false,
}: InventoryTableProps) {

    /*
    |--------------------------------------------------------------------------
    | MANAGE MODAL
    |--------------------------------------------------------------------------
    */

    const [
        selectedBatch,
        setSelectedBatch,
    ] = useState<VaccineInventory | null>(
        null,
    );


    const [
        manageOpen,
        setManageOpen,
    ] = useState(false);


    /*
    |--------------------------------------------------------------------------
    | CONFIRMATION MODAL
    |--------------------------------------------------------------------------
    */

    const [
        confirmationType,
        setConfirmationType,
    ] = useState<ConfirmationType>(
        null,
    );


    const [
        confirmationBatch,
        setConfirmationBatch,
    ] = useState<VaccineInventory | null>(
        null,
    );


    const [
        processing,
        setProcessing,
    ] = useState(false);

    const [
        archiveReason,
        setArchiveReason,
    ] = useState<string>('manual');

    const [
        archiveRemarks,
        setArchiveRemarks,
    ] = useState<string>('');


    /*
    |--------------------------------------------------------------------------
    | OPEN MANAGE MODAL
    |--------------------------------------------------------------------------
    */

    function openManageModal(
        inventory: VaccineInventory,
    ) {

        setSelectedBatch(
            inventory,
        );

        setManageOpen(
            true,
        );
    }


    /*
    |--------------------------------------------------------------------------
    | CLOSE MANAGE MODAL
    |--------------------------------------------------------------------------
    */

    function closeManageModal() {

        if (processing) {
            return;
        }

        setManageOpen(
            false,
        );

        setSelectedBatch(
            null,
        );
    }


    /*
    |--------------------------------------------------------------------------
    | OPEN CONFIRMATION
    |--------------------------------------------------------------------------
    */

    function openConfirmation(
        type: Exclude<ConfirmationType, null>,
        inventory: VaccineInventory,
    ) {

        setConfirmationType(
            type,
        );

        setConfirmationBatch(
            inventory,
        );

        if (type === 'archive') {
            setArchiveReason('manual');
            setArchiveRemarks('');
        }
    }


    /*
    |--------------------------------------------------------------------------
    | CLOSE CONFIRMATION
    |--------------------------------------------------------------------------
    */

    function closeConfirmation() {

        if (processing) {
            return;
        }

        setConfirmationType(
            null,
        );

        setConfirmationBatch(
            null,
        );

        setArchiveReason('manual');
        setArchiveRemarks('');
    }


    /*
    |--------------------------------------------------------------------------
    | DATE HELPERS
    |--------------------------------------------------------------------------
    */

    function parseLocalDate(
        value: string,
    ) {

        const datePart =
            value.split('T')[0];

        const [
            year,
            month,
            day,
        ] = datePart
            .split('-')
            .map(Number);


        if (
            !year ||
            !month ||
            !day
        ) {
            return null;
        }


        const parsed =
            new Date(
                year,
                month - 1,
                day,
            );


        parsed.setHours(
            0,
            0,
            0,
            0,
        );


        return parsed;
    }


    function getDaysUntilExpiry(
        inventory: VaccineInventory,
    ) {

        if (
            typeof inventory.days_until_expiry ===
            'number'
        ) {
            return inventory.days_until_expiry;
        }


        const expiry =
            parseLocalDate(
                inventory.expiration_date,
            );


        if (!expiry) {
            return null;
        }


        const today =
            new Date();


        today.setHours(
            0,
            0,
            0,
            0,
        );


        return Math.round(
            (
                expiry.getTime() -
                today.getTime()
            ) /
                (
                    1000 *
                    60 *
                    60 *
                    24
                ),
        );
    }


    function isBatchExpired(
        inventory: VaccineInventory,
    ) {

        const daysUntilExpiry =
            getDaysUntilExpiry(
                inventory,
            );


        return (
            daysUntilExpiry !== null &&
            daysUntilExpiry < 0
        );
    }


    function isBatchNearExpiry(
        inventory: VaccineInventory,
    ) {

        if (
            typeof inventory.is_near_expiry ===
            'boolean'
        ) {
            return inventory.is_near_expiry;
        }


        const daysUntilExpiry =
            getDaysUntilExpiry(
                inventory,
            );


        return (
            daysUntilExpiry !== null &&
            daysUntilExpiry >= 0 &&
            daysUntilExpiry <=
                NEAR_EXPIRY_DAYS
        );
    }


    function formatExpirationDate(
        value: string,
    ) {

        const parsed =
            parseLocalDate(
                value,
            );


        if (!parsed) {
            return '—';
        }


        return parsed.toLocaleDateString(
            'en-PH',
            {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            },
        );
    }


    function getExpiryLabel(
        inventory: VaccineInventory,
    ) {

        const days =
            getDaysUntilExpiry(
                inventory,
            );


        if (days === null) {
            return null;
        }


        if (days < 0) {
            const overdueDays =
                Math.abs(days);

            return overdueDays === 1
                ? 'Expired 1 day ago'
                : `Expired ${overdueDays} days ago`;
        }


        if (days === 0) {
            return 'Expires today';
        }


        if (days === 1) {
            return 'Expires tomorrow';
        }


        if (
            days <=
            NEAR_EXPIRY_DAYS
        ) {
            return `${days} days left`;
        }


        return null;
    }


    /*
    |--------------------------------------------------------------------------
    | ARCHIVE ELIGIBILITY
    |--------------------------------------------------------------------------
    */

    function canArchiveBatch(
        inventory: VaccineInventory,
    ) {

        return !inventory.is_archived;
    }


    /*
    |--------------------------------------------------------------------------
    | ARCHIVE BATCH
    |--------------------------------------------------------------------------
    */

    function archiveBatch() {

        if (!confirmationBatch) {
            return;
        }


        if (
            !canArchiveBatch(
                confirmationBatch,
            )
        ) {

            closeConfirmation();

            return;
        }


        setProcessing(
            true,
        );


        router.put(
            route(
                'vaccine-inventory.archive',
                confirmationBatch.id,
            ),

            {
                archive_reason: archiveReason,
                remarks: archiveRemarks,
            },

            {
                preserveScroll: true,

                onSuccess: () => {

                    setConfirmationType(
                        null,
                    );

                    setConfirmationBatch(
                        null,
                    );

                    setArchiveReason(
                        'manual',
                    );

                    setArchiveRemarks(
                        '',
                    );

                    setManageOpen(
                        false,
                    );

                    setSelectedBatch(
                        null,
                    );
                },

                onFinish: () => {

                    setProcessing(
                        false,
                    );
                },
            },
        );
    }




    /*
    |--------------------------------------------------------------------------
    | FORMAT ARCHIVE REASON
    |--------------------------------------------------------------------------
    */

    function formatArchiveReason(
        reason: string | null,
    ) {

        if (!reason) {
            return null;
        }


        if (
            reason === 'out_of_stock'
        ) {

            return 'Out of Stock';
        }


        if (
            reason === 'expired'
        ) {

            return 'Expired';
        }


        return reason
            .replaceAll(
                '_',
                ' ',
            )
            .replace(
                /\b\w/g,
                (character) =>
                    character.toUpperCase(),
            );
    }


    /*
    |--------------------------------------------------------------------------
    | GET STOCK STATUS
    |--------------------------------------------------------------------------
    */

    function getBatchStatus(
        inventory: VaccineInventory,
    ) {

        if (
            inventory.is_archived
        ) {

            return 'Archived';
        }


        if (
            isBatchExpired(
                inventory,
            )
        ) {

            return 'Expired';
        }


        if (
            inventory.quantity <= 0
        ) {

            return 'Out of Stock';
        }


        if (
            inventory.quantity <= 20
        ) {

            return 'Low Stock';
        }


        return 'Available';
    }


    /*
    |--------------------------------------------------------------------------
    | STATUS BADGE CLASS
    |--------------------------------------------------------------------------
    */

    function getStatusClass(
        status: string,
    ) {

        if (
            status === 'Available'
        ) {

            return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300';
        }


        if (
            status === 'Low Stock'
        ) {

            return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300';
        }


        if (
            status === 'Archived'
        ) {

            return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
        }


        return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300';
    }


    /*
    |--------------------------------------------------------------------------
    | PAGE
    |--------------------------------------------------------------------------
    */

    return (

        <>


            {/* ============================================================= */}
            {/* INVENTORY TABLE */}
            {/* ============================================================= */}

            <Card>


                <CardHeader>

                    <CardTitle>
                        Vaccine Inventory Records
                    </CardTitle>

                </CardHeader>


                <CardContent>


                    <div className="overflow-x-auto">


                        <table className="w-full text-left text-sm">


                            {/* ================================================= */}
                            {/* TABLE HEADER */}
                            {/* ================================================= */}

                            <thead className="border-b">

                                <tr>

                                    <th className="px-4 py-3 font-medium">
                                        Vaccine
                                    </th>

                                    <th className="px-4 py-3 font-medium">
                                        Batch Number
                                    </th>

                                    <th className="px-4 py-3 font-medium">
                                        Remaining Stock
                                    </th>

                                    <th className="px-4 py-3 font-medium">
                                        Expiration Date
                                    </th>

                                    <th className="px-4 py-3 font-medium">
                                        Status
                                    </th>

                                    <th className="px-4 py-3 font-medium">
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            {/* ================================================= */}
                            {/* TABLE BODY */}
                            {/* ================================================= */}

                            <tbody>


                                {/* LOADING SKELETON */}

                                {loading ? (

                                    <>

                                        {Array
                                            .from({
                                                length: 5,
                                            })
                                            .map(
                                                (
                                                    _,
                                                    index,
                                                ) => (

                                                    <tr
                                                        key={
                                                            index
                                                        }
                                                        className="border-b"
                                                    >

                                                        {Array
                                                            .from({
                                                                length: 6,
                                                            })
                                                            .map(
                                                                (
                                                                    _,
                                                                    cellIndex,
                                                                ) => (

                                                                    <td
                                                                        key={
                                                                            cellIndex
                                                                        }
                                                                        className="px-4 py-4"
                                                                    >

                                                                        <div className="h-4 animate-pulse rounded bg-muted" />

                                                                    </td>

                                                                ),
                                                            )}

                                                    </tr>

                                                ),
                                            )}

                                    </>

                                ) : vaccines.length === 0 ? (

                                    /* EMPTY STATE */

                                    <tr>

                                        <td
                                            colSpan={6}
                                            className="px-6 py-16"
                                        >

                                            <div className="flex flex-col items-center justify-center text-center">


                                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">

                                                    <PackageSearch className="h-5 w-5 text-muted-foreground" />

                                                </div>


                                                <h3 className="text-sm font-semibold">

                                                    No vaccine batches found

                                                </h3>


                                                <p className="mt-1 max-w-sm text-sm text-muted-foreground">

                                                    No inventory records match your current search or filters.

                                                    Try adjusting the filters or add a new vaccine batch.

                                                </p>


                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="mt-4"
                                                    onClick={() =>
                                                        router.visit(
                                                            route(
                                                                'vaccine-inventory.create',
                                                            ),
                                                        )
                                                    }
                                                >

                                                    Add Vaccine Batch

                                                </Button>


                                            </div>

                                        </td>

                                    </tr>

                                ) : (

                                    vaccines.map(
                                        (
                                            inventory,
                                        ) => {

                                            const vaccineName =
                                                inventory.vaccine
                                                    ?.name ??
                                                'Unknown Vaccine';


                                            const vaccineStatus =
                                                getBatchStatus(
                                                    inventory,
                                                );


                                            const archiveReason =
                                                formatArchiveReason(
                                                    inventory.archive_reason,
                                                );


                                            const nearExpiry =
                                                !inventory.is_archived &&
                                                !isBatchExpired(
                                                    inventory,
                                                ) &&
                                                isBatchNearExpiry(
                                                    inventory,
                                                );


                                            const expiryLabel =
                                                getExpiryLabel(
                                                    inventory,
                                                );


                                            return (

                                                <tr
                                                    key={
                                                        inventory.id
                                                    }
                                                    className={`border-b transition-colors hover:bg-muted/20 ${
                                                        inventory.is_archived
                                                            ? 'opacity-70'
                                                            : nearExpiry
                                                              ? 'bg-amber-500/[0.03]'
                                                              : ''
                                                    }`}
                                                >


                                                    {/* VACCINE */}

                                                    <td className="px-4 py-3">

                                                        <div>

                                                            <p className="font-medium">

                                                                {
                                                                    vaccineName
                                                                }

                                                            </p>


                                                            {inventory.is_archived &&
                                                                archiveReason && (

                                                                    <p className="mt-1 text-xs text-muted-foreground">

                                                                        Archived:{' '}
                                                                        {
                                                                            archiveReason
                                                                        }

                                                                    </p>

                                                                )}

                                                        </div>

                                                    </td>


                                                    {/* BATCH NUMBER */}

                                                    <td className="px-4 py-3">

                                                        {
                                                            inventory.batch_number
                                                        }

                                                    </td>


                                                    {/* STOCK */}

                                                    <td className="px-4 py-3">

                                                        <div className="font-medium">
                                                            {
                                                                inventory.quantity
                                                            }
                                                        </div>

                                                        {inventory.quantity > 0 &&
                                                            inventory.quantity <= 20 &&
                                                            !isBatchExpired(
                                                                inventory,
                                                            ) && (

                                                                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                                                                    Low stock
                                                                </p>

                                                            )}

                                                    </td>


                                                    {/* EXPIRATION */}

                                                    <td className="px-4 py-3">

                                                        <div>

                                                            <p className="font-medium">

                                                                {
                                                                    formatExpirationDate(
                                                                        inventory.expiration_date,
                                                                    )
                                                                }

                                                            </p>


                                                            {expiryLabel && (

                                                                <div
                                                                    className={`mt-1 flex items-center gap-1 text-xs ${
                                                                        isBatchExpired(
                                                                            inventory,
                                                                        )
                                                                            ? 'text-red-600 dark:text-red-400'
                                                                            : nearExpiry
                                                                              ? 'text-amber-600 dark:text-amber-400'
                                                                              : 'text-muted-foreground'
                                                                    }`}
                                                                >

                                                                    <Clock3 className="h-3.5 w-3.5" />

                                                                    <span>

                                                                        {
                                                                            expiryLabel
                                                                        }

                                                                    </span>

                                                                </div>

                                                            )}

                                                        </div>

                                                    </td>


                                                    {/* STATUS */}

                                                    <td className="px-4 py-3">

                                                        <div className="flex flex-wrap gap-2">

                                                            <span
                                                                className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                                                                    vaccineStatus,
                                                                )}`}
                                                            >

                                                                {
                                                                    vaccineStatus
                                                                }

                                                            </span>


                                                            {nearExpiry && (

                                                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">

                                                                    <TriangleAlert className="h-3 w-3" />

                                                                    Near Expiry

                                                                </span>

                                                            )}

                                                        </div>

                                                    </td>


                                                    {/* ACTIONS */}

                                                    <td className="px-4 py-3">

                                                        {inventory.is_archived ? (

                                                            <span className="text-xs text-muted-foreground">

                                                                Historical record

                                                            </span>

                                                        ) : (

                                                            <div className="flex flex-wrap gap-2">


                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    disabled={
                                                                        processing
                                                                    }
                                                                    onClick={() =>
                                                                        router.visit(
                                                                            route(
                                                                                'vaccine-inventory.edit',
                                                                                inventory.id,
                                                                            ),
                                                                        )
                                                                    }
                                                                >

                                                                    <Pencil className="mr-2 h-4 w-4" />

                                                                    Edit

                                                                </Button>


                                                                <Button
                                                                    type="button"
                                                                    variant="secondary"
                                                                    size="sm"
                                                                    disabled={
                                                                        processing
                                                                    }
                                                                    onClick={() =>
                                                                        openManageModal(
                                                                            inventory,
                                                                        )
                                                                    }
                                                                >

                                                                    <Settings2 className="mr-2 h-4 w-4" />

                                                                    Manage

                                                                </Button>


                                                            </div>

                                                        )}

                                                    </td>


                                                </tr>

                                            );
                                        },
                                    )

                                )}


                            </tbody>


                        </table>


                    </div>


                </CardContent>


            </Card>


            {/* ============================================================= */}
            {/* MANAGE MODAL */}
            {/* ============================================================= */}

            <Dialog
                open={
                    manageOpen
                }

                onOpenChange={(
                    open,
                ) => {

                    if (
                        processing
                    ) {
                        return;
                    }


                    setManageOpen(
                        open,
                    );


                    if (
                        !open
                    ) {

                        setSelectedBatch(
                            null,
                        );
                    }
                }}
            >

                <DialogContent className="sm:max-w-lg">


                    {selectedBatch && (

                        <>


                            <DialogHeader>

                                <DialogTitle>

                                    Manage Vaccine Batch

                                </DialogTitle>


                                <DialogDescription>

                                    Choose how this batch should be handled.

                                </DialogDescription>

                            </DialogHeader>


                            {/* BATCH INFO */}

                            <div className="rounded-lg border p-4">


                                <div className="grid gap-3 text-sm">


                                    <div className="flex items-center justify-between gap-4">

                                        <span className="text-muted-foreground">
                                            Vaccine
                                        </span>

                                        <span className="font-medium">

                                            {
                                                selectedBatch
                                                    .vaccine
                                                    ?.name ??
                                                'Unknown Vaccine'
                                            }

                                        </span>

                                    </div>


                                    <div className="flex items-center justify-between gap-4">

                                        <span className="text-muted-foreground">
                                            Batch Number
                                        </span>

                                        <span className="font-medium">

                                            {
                                                selectedBatch.batch_number
                                            }

                                        </span>

                                    </div>


                                    <div className="flex items-center justify-between gap-4">

                                        <span className="text-muted-foreground">
                                            Remaining Stock
                                        </span>

                                        <span className="font-medium">

                                            {
                                                selectedBatch.quantity
                                            }

                                        </span>

                                    </div>


                                    <div className="flex items-center justify-between gap-4">

                                        <span className="text-muted-foreground">
                                            Status
                                        </span>

                                        <div className="flex flex-wrap justify-end gap-2">

                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                                                    getBatchStatus(
                                                        selectedBatch,
                                                    ),
                                                )}`}
                                            >

                                                {
                                                    getBatchStatus(
                                                        selectedBatch,
                                                    )
                                                }

                                            </span>


                                            {!selectedBatch.is_archived &&
                                                !isBatchExpired(
                                                    selectedBatch,
                                                ) &&
                                                isBatchNearExpiry(
                                                    selectedBatch,
                                                ) && (

                                                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">

                                                        Near Expiry

                                                    </span>

                                                )}

                                        </div>

                                    </div>


                                    <div className="flex items-start justify-between gap-4">

                                        <span className="text-muted-foreground">
                                            Expiration
                                        </span>

                                        <div className="text-right">

                                            <span className="font-medium">

                                                {
                                                    formatExpirationDate(
                                                        selectedBatch.expiration_date,
                                                    )
                                                }

                                            </span>


                                            {getExpiryLabel(
                                                selectedBatch,
                                            ) && (

                                                <p
                                                    className={`mt-1 text-xs ${
                                                        isBatchExpired(
                                                            selectedBatch,
                                                        )
                                                            ? 'text-red-600 dark:text-red-400'
                                                            : isBatchNearExpiry(
                                                                    selectedBatch,
                                                                )
                                                              ? 'text-amber-600 dark:text-amber-400'
                                                              : 'text-muted-foreground'
                                                    }`}
                                                >

                                                    {
                                                        getExpiryLabel(
                                                            selectedBatch,
                                                        )
                                                    }

                                                </p>

                                            )}

                                        </div>

                                    </div>


                                </div>


                            </div>


                            {/* NEAR EXPIRY WARNING */}

                            {!selectedBatch.is_archived &&
                                !isBatchExpired(
                                    selectedBatch,
                                ) &&
                                isBatchNearExpiry(
                                    selectedBatch,
                                ) && (

                                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">

                                        <div className="flex items-start gap-3">

                                            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />

                                            <div>

                                                <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">

                                                    Vaccine batch nearing expiration

                                                </p>

                                                <p className="mt-1 text-sm text-muted-foreground">

                                                    This batch {
                                                        getExpiryLabel(
                                                            selectedBatch,
                                                        )?.toLowerCase()
                                                    }. Review stock usage to reduce possible vaccine wastage.

                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                )}


                            {/* ARCHIVE */}

                            <div className="space-y-3 rounded-lg border p-4">


                                <div>

                                    <div className="flex items-center gap-2">

                                        <Archive className="h-4 w-4" />

                                        <h3 className="font-semibold">

                                            Archive Batch

                                        </h3>

                                    </div>


                                    <p className="mt-2 text-sm text-muted-foreground">

                                        Archive preserves this batch for historical records. If any remaining stock exists, it will be zeroed out in the transaction ledger and appointments reconciled.

                                    </p>

                                </div>


                                {canArchiveBatch(
                                    selectedBatch,
                                ) ? (

                                    <Button
                                        type="button"
                                        variant="secondary"
                                        className="w-full"
                                        disabled={
                                            processing
                                        }
                                        onClick={() =>
                                            openConfirmation(
                                                'archive',
                                                selectedBatch,
                                            )
                                        }
                                    >

                                        <Archive className="mr-2 h-4 w-4" />

                                        Archive Batch

                                    </Button>

                                ) : (

                                    <p className="text-sm text-muted-foreground">

                                        This batch is already archived.

                                    </p>

                                )}


                            </div>




                            <DialogFooter>

                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={
                                        processing
                                    }
                                    onClick={
                                        closeManageModal
                                    }
                                >

                                    Cancel

                                </Button>

                            </DialogFooter>


                        </>

                    )}


                </DialogContent>


            </Dialog>


            {/* ============================================================= */}
            {/* CONFIRMATION MODAL */}
            {/* ============================================================= */}

            <Dialog
                open={
                    confirmationType !== null
                }

                onOpenChange={(
                    open,
                ) => {

                    if (
                        !open
                    ) {

                        closeConfirmation();
                    }
                }}
            >

                <DialogContent className="sm:max-w-md">


                    {confirmationBatch && (

                        <>


                            <DialogHeader>


                                <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-muted">
                                    <Archive className="h-5 w-5" />
                                </div>

                                <DialogTitle>
                                    Archive this vaccine batch?
                                </DialogTitle>

                                <DialogDescription>
                                    The batch will be moved to archived records and preserved for historical reference.
                                </DialogDescription>

                            </DialogHeader>


                            {/* DETAILS */}

                            <div className="rounded-lg border bg-muted/20 p-4 text-sm">


                                <div className="flex items-center justify-between gap-4">

                                    <span className="text-muted-foreground">

                                        Vaccine

                                    </span>

                                    <span className="font-medium">

                                        {
                                            confirmationBatch
                                                .vaccine
                                                ?.name ??
                                            'Unknown Vaccine'
                                        }

                                    </span>

                                </div>


                                <div className="mt-3 flex items-center justify-between gap-4">

                                    <span className="text-muted-foreground">

                                        Batch Number

                                    </span>

                                    <span className="font-medium">

                                        {
                                            confirmationBatch.batch_number
                                        }

                                    </span>

                                </div>


                                <div className="mt-3 flex items-center justify-between gap-4">

                                    <span className="text-muted-foreground">

                                        Remaining Stock

                                    </span>

                                    <span className="font-medium">

                                        {
                                            confirmationBatch.quantity
                                        }

                                    </span>

                                </div>


                            </div>


                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="archive-reason" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Reason for Archiving <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={archiveReason}
                                        onValueChange={setArchiveReason}
                                        disabled={processing}
                                    >
                                        <SelectTrigger id="archive-reason" className="w-full">
                                            <SelectValue placeholder="Select reason" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="manual">Manual Archive / Discontinued</SelectItem>
                                            <SelectItem value="recalled">Manufacturer / Authority Recall</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="archive-remarks" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Notes / Remarks (Optional)
                                    </Label>
                                    <Textarea
                                        id="archive-remarks"
                                        value={archiveRemarks}
                                        onChange={(e) => setArchiveRemarks(e.target.value)}
                                        placeholder="Add audit notes or context..."
                                        className="h-20 resize-none text-sm"
                                        disabled={processing}
                                    />
                                </div>

                                {confirmationBatch.quantity > 0 && (
                                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                                        <div className="flex items-start gap-2">
                                            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                                            <div className="text-xs text-amber-800 dark:text-amber-300">
                                                <p className="font-semibold">Notice: Remaining stock will be zeroed out</p>
                                                <p className="mt-0.5">
                                                    This batch currently has {confirmationBatch.quantity} {confirmationBatch.quantity === 1 ? 'dose' : 'doses'}. Archiving it will record an archival reduction in the ledger and reconcile any dependent appointments.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <DialogFooter className="gap-2 sm:gap-0">

                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={
                                        processing
                                    }
                                    onClick={
                                        closeConfirmation
                                    }
                                >

                                    Cancel

                                </Button>

                                <Button
                                    type="button"
                                    disabled={
                                        processing
                                    }
                                    onClick={
                                        archiveBatch
                                    }
                                >

                                    {processing ? (

                                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />

                                    ) : (

                                        <Archive className="mr-2 h-4 w-4" />

                                    )}


                                    {processing
                                        ? 'Archiving...'
                                        : 'Confirm Archive'}

                                </Button>

                            </DialogFooter>


                        </>

                    )}


                </DialogContent>


            </Dialog>


        </>
    );
}
