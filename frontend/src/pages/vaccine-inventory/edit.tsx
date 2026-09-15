import { Head, useForm, usePage } from '@inertiajs/react';

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

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import AppLayout from '@/layouts/app-layout';

import {
    ArrowLeft,
    LoaderCircle,
    TriangleAlert,
} from 'lucide-react';

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

type VaccineOption = {
    id: number;
    name: string;
    category: string;
};


type VaccineInventory = {
    id: number;

    vaccine_id: number;

    batch_number: string;
    quantity: number;

    date_received: string;
    expiration_date: string;

    manufacturer: string | null;
    supplier: string | null;
    remarks: string | null;
};


type EditBatchForm = {
    vaccine_id: string;
    batch_number: string;
    quantity: number;
    date_received: string;
    expiration_date: string;
    manufacturer: string;
    supplier: string;
    remarks: string;
};


/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function VaccineEdit() {

    /*
    |--------------------------------------------------------------------------
    | PAGE PROPS
    |--------------------------------------------------------------------------
    */

    const {
        vaccine,
        vaccines,
    } = usePage<{
        vaccine: VaccineInventory;
        vaccines: VaccineOption[];
    }>().props;


    /*
    |--------------------------------------------------------------------------
    | INITIAL FORM DATA
    |--------------------------------------------------------------------------
    */

    const initialData = useRef<EditBatchForm>({
        vaccine_id:
            String(
                vaccine.vaccine_id,
            ),

        batch_number:
            vaccine.batch_number,

        quantity:
            vaccine.quantity,

        date_received:
            vaccine.date_received,

        expiration_date:
            vaccine.expiration_date,

        manufacturer:
            vaccine.manufacturer ?? '',

        supplier:
            vaccine.supplier ?? '',

        remarks:
            vaccine.remarks ?? '',
    });


    /*
    |--------------------------------------------------------------------------
    | FORM
    |--------------------------------------------------------------------------
    */

    const {
        data,
        setData,
        put,
        processing,
        errors,
    } = useForm<EditBatchForm>(
        initialData.current,
    );


    /*
    |--------------------------------------------------------------------------
    | UNSAVED CHANGES
    |--------------------------------------------------------------------------
    */

    const [
        leaveDialogOpen,
        setLeaveDialogOpen,
    ] = useState(false);


    const [
        submitting,
        setSubmitting,
    ] = useState(false);


    const pendingAction =
        useRef<(() => void) | null>(
            null,
        );


    /*
    |--------------------------------------------------------------------------
    | CHECK IF FORM CHANGED
    |--------------------------------------------------------------------------
    */

    const hasUnsavedChanges =
        JSON.stringify(data) !==
        JSON.stringify(
            initialData.current,
        );


    /*
    |--------------------------------------------------------------------------
    | BROWSER REFRESH / CLOSE WARNING
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        function handleBeforeUnload(
            event: BeforeUnloadEvent,
        ) {

            if (
                !hasUnsavedChanges ||
                submitting
            ) {
                return;
            }


            event.preventDefault();

            event.returnValue = '';
        }


        window.addEventListener(
            'beforeunload',
            handleBeforeUnload,
        );


        return () => {

            window.removeEventListener(
                'beforeunload',
                handleBeforeUnload,
            );
        };

    }, [
        hasUnsavedChanges,
        submitting,
    ]);


    /*
    |--------------------------------------------------------------------------
    | REQUEST LEAVE
    |--------------------------------------------------------------------------
    */

    function requestLeave(
        action: () => void,
    ) {

        if (
            !hasUnsavedChanges ||
            submitting
        ) {

            action();

            return;
        }


        pendingAction.current =
            action;


        setLeaveDialogOpen(
            true,
        );
    }


    /*
    |--------------------------------------------------------------------------
    | DISCARD CHANGES
    |--------------------------------------------------------------------------
    */

    function discardChanges() {

        const action =
            pendingAction.current;


        pendingAction.current =
            null;


        setLeaveDialogOpen(
            false,
        );


        if (
            action
        ) {

            action();
        }
    }


    /*
    |--------------------------------------------------------------------------
    | KEEP EDITING
    |--------------------------------------------------------------------------
    */

    function keepEditing() {

        pendingAction.current =
            null;


        setLeaveDialogOpen(
            false,
        );
    }


    /*
    |--------------------------------------------------------------------------
    | SUBMIT
    |--------------------------------------------------------------------------
    */

    function submit(
        e: React.FormEvent,
    ) {

        e.preventDefault();


        setSubmitting(
            true,
        );


        put(
            route(
                'vaccine-inventory.update',
                vaccine.id,
            ),

            {
                preserveScroll: true,

                onError: () => {

                    setSubmitting(
                        false,
                    );
                },

                onFinish: () => {

                    setSubmitting(
                        false,
                    );
                },
            },
        );
    }


    /*
    |--------------------------------------------------------------------------
    | PAGE
    |--------------------------------------------------------------------------
    */

    return (

        <AppLayout>


            <Head title="Edit Vaccine Batch" />


            <div className="max-w-4xl space-y-6 p-6">


                {/* ========================================================= */}
                {/* HEADER */}
                {/* ========================================================= */}

                <div>


                    <Button
                        variant="ghost"
                        type="button"
                        disabled={
                            processing
                        }
                        onClick={() =>
                            requestLeave(
                                () =>
                                    window.history.back(),
                            )
                        }
                    >

                        <ArrowLeft className="mr-2 h-4 w-4" />

                        Back

                    </Button>


                    <h1 className="mt-4 text-2xl font-bold">

                        Edit Vaccine Batch

                    </h1>


                    <p className="mt-2 text-muted-foreground">

                        Update an existing vaccine batch
                        in the health center inventory.

                    </p>


                    {hasUnsavedChanges && (

                        <div className="mt-4 inline-flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">

                            <TriangleAlert className="h-4 w-4" />

                            You have unsaved changes

                        </div>

                    )}

                </div>


                {/* ========================================================= */}
                {/* FORM */}
                {/* ========================================================= */}

                <Card>


                    <CardHeader>

                        <CardTitle>

                            Vaccine Information

                        </CardTitle>

                    </CardHeader>


                    <CardContent>


                        <form
                            onSubmit={
                                submit
                            }
                            className="space-y-6"
                        >


                            {/* ================================================= */}
                            {/* VACCINE + BATCH */}
                            {/* ================================================= */}

                            <div className="grid gap-4 md:grid-cols-2">


                                {/* VACCINE */}

                                <div className="space-y-2">


                                    <Label>

                                        Vaccine

                                    </Label>


                                    <Select
                                        value={
                                            data.vaccine_id
                                        }
                                        disabled={
                                            processing
                                        }
                                        onValueChange={(
                                            value,
                                        ) =>
                                            setData(
                                                'vaccine_id',
                                                value,
                                            )
                                        }
                                    >


                                        <SelectTrigger>

                                            <SelectValue placeholder="Select Vaccine" />

                                        </SelectTrigger>


                                        <SelectContent>


                                            {vaccines.length === 0 ? (

                                                <SelectItem
                                                    value="no-vaccines"
                                                    disabled
                                                >

                                                    No vaccines available

                                                </SelectItem>

                                            ) : (

                                                vaccines.map(
                                                    (
                                                        vaccineOption,
                                                    ) => (

                                                        <SelectItem
                                                            key={
                                                                vaccineOption.id
                                                            }
                                                            value={
                                                                String(
                                                                    vaccineOption.id,
                                                                )
                                                            }
                                                        >

                                                            {
                                                                vaccineOption.name
                                                            }

                                                        </SelectItem>

                                                    ),
                                                )

                                            )}


                                        </SelectContent>


                                    </Select>


                                    {errors.vaccine_id && (

                                        <p className="text-sm text-red-500">

                                            {
                                                errors.vaccine_id
                                            }

                                        </p>

                                    )}


                                </div>


                                {/* BATCH NUMBER */}

                                <div className="space-y-2">


                                    <Label>

                                        Batch Number

                                    </Label>


                                    <Input
                                        placeholder="e.g. BCG-2026-001"
                                        value={
                                            data.batch_number
                                        }
                                        disabled={
                                            processing
                                        }
                                        onChange={(
                                            e,
                                        ) =>
                                            setData(
                                                'batch_number',
                                                e.target.value,
                                            )
                                        }
                                    />


                                    {errors.batch_number && (

                                        <p className="text-sm text-red-500">

                                            {
                                                errors.batch_number
                                            }

                                        </p>

                                    )}


                                </div>


                            </div>


                            {/* ================================================= */}
                            {/* QUANTITY + MANUFACTURER */}
                            {/* ================================================= */}

                            <div className="grid gap-4 md:grid-cols-2">


                                {/* QUANTITY */}

                                <div className="space-y-2">


                                    <Label>

                                        Quantity Received

                                    </Label>


                                    <Input
                                        type="number"
                                        min="1"
                                        value={
                                            data.quantity
                                        }
                                        disabled={
                                            processing
                                        }
                                        onChange={(
                                            e,
                                        ) =>
                                            setData(
                                                'quantity',
                                                Number(
                                                    e.target.value,
                                                ),
                                            )
                                        }
                                    />


                                    {errors.quantity && (

                                        <p className="text-sm text-red-500">

                                            {
                                                errors.quantity
                                            }

                                        </p>

                                    )}


                                </div>


                                {/* MANUFACTURER */}

                                <div className="space-y-2">


                                    <Label>

                                        Manufacturer

                                    </Label>


                                    <Input
                                        placeholder="e.g. Sanofi"
                                        value={
                                            data.manufacturer
                                        }
                                        disabled={
                                            processing
                                        }
                                        onChange={(
                                            e,
                                        ) =>
                                            setData(
                                                'manufacturer',
                                                e.target.value,
                                            )
                                        }
                                    />


                                    {errors.manufacturer && (

                                        <p className="text-sm text-red-500">

                                            {
                                                errors.manufacturer
                                            }

                                        </p>

                                    )}


                                </div>


                            </div>


                            {/* ================================================= */}
                            {/* DATES */}
                            {/* ================================================= */}

                            <div className="grid gap-4 md:grid-cols-2">


                                {/* DATE RECEIVED */}

                                <div className="space-y-2">


                                    <Label>

                                        Date Received

                                    </Label>


                                    <Input
                                        type="date"
                                        value={
                                            data.date_received
                                        }
                                        disabled={
                                            processing
                                        }
                                        onChange={(
                                            e,
                                        ) =>
                                            setData(
                                                'date_received',
                                                e.target.value,
                                            )
                                        }
                                        onClick={(
                                            e,
                                        ) =>
                                            e.currentTarget.showPicker?.()
                                        }
                                    />


                                    {errors.date_received && (

                                        <p className="text-sm text-red-500">

                                            {
                                                errors.date_received
                                            }

                                        </p>

                                    )}


                                </div>


                                {/* EXPIRATION DATE */}

                                <div className="space-y-2">


                                    <Label>

                                        Expiration Date

                                    </Label>


                                    <Input
                                        type="date"
                                        value={
                                            data.expiration_date
                                        }
                                        disabled={
                                            processing
                                        }
                                        onChange={(
                                            e,
                                        ) =>
                                            setData(
                                                'expiration_date',
                                                e.target.value,
                                            )
                                        }
                                        onClick={(
                                            e,
                                        ) =>
                                            e.currentTarget.showPicker?.()
                                        }
                                    />


                                    {errors.expiration_date && (

                                        <p className="text-sm text-red-500">

                                            {
                                                errors.expiration_date
                                            }

                                        </p>

                                    )}


                                </div>


                            </div>


                            {/* ================================================= */}
                            {/* SUPPLIER */}
                            {/* ================================================= */}

                            <div className="space-y-2">


                                <Label>

                                    Supplier

                                </Label>


                                <Input
                                    placeholder="e.g. DOH Region X"
                                    value={
                                        data.supplier
                                    }
                                    disabled={
                                        processing
                                    }
                                    onChange={(
                                        e,
                                    ) =>
                                        setData(
                                            'supplier',
                                            e.target.value,
                                        )
                                    }
                                />


                                {errors.supplier && (

                                    <p className="text-sm text-red-500">

                                        {
                                            errors.supplier
                                        }

                                    </p>

                                )}


                            </div>


                            {/* ================================================= */}
                            {/* REMARKS */}
                            {/* ================================================= */}

                            <div className="space-y-2">


                                <Label>

                                    Remarks

                                </Label>


                                <Textarea
                                    value={
                                        data.remarks
                                    }
                                    disabled={
                                        processing
                                    }
                                    onChange={(
                                        e,
                                    ) =>
                                        setData(
                                            'remarks',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Optional remarks..."
                                />


                                {errors.remarks && (

                                    <p className="text-sm text-red-500">

                                        {
                                            errors.remarks
                                        }

                                    </p>

                                )}


                            </div>


                            {/* ================================================= */}
                            {/* SUBMIT */}
                            {/* ================================================= */}

                            <div className="flex items-center justify-end gap-3">


                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={
                                        processing
                                    }
                                    onClick={() =>
                                        requestLeave(
                                            () =>
                                                window.history.back(),
                                        )
                                    }
                                >

                                    Cancel

                                </Button>


                                <Button
                                    type="submit"
                                    disabled={
                                        processing ||
                                        !hasUnsavedChanges
                                    }
                                >


                                    {processing ? (

                                        <>

                                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />

                                            Updating...

                                        </>

                                    ) : (

                                        'Update Vaccine Batch'

                                    )}


                                </Button>


                            </div>


                        </form>


                    </CardContent>


                </Card>


            </div>


            {/* ============================================================= */}
            {/* UNSAVED CHANGES CONFIRMATION */}
            {/* ============================================================= */}

            <Dialog
                open={
                    leaveDialogOpen
                }
                onOpenChange={(
                    open,
                ) => {

                    if (
                        processing
                    ) {
                        return;
                    }


                    if (
                        !open
                    ) {

                        keepEditing();
                    }
                }}
            >


                <DialogContent className="sm:max-w-md">


                    <DialogHeader>


                        <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">

                            <TriangleAlert className="h-5 w-5" />

                        </div>


                        <DialogTitle>

                            Discard unsaved changes?

                        </DialogTitle>


                        <DialogDescription>

                            You have changes that have not been saved yet.
                            If you leave this page, those changes will be lost.

                        </DialogDescription>


                    </DialogHeader>


                    <div className="rounded-lg border bg-muted/20 p-3">

                        <p className="text-sm text-muted-foreground">

                            Vaccine batch:{' '}

                            <span className="font-medium text-foreground">

                                {
                                    data.batch_number ||
                                    vaccine.batch_number
                                }

                            </span>

                        </p>

                    </div>


                    <DialogFooter className="gap-2 sm:gap-0">


                        <Button
                            type="button"
                            variant="outline"
                            onClick={
                                keepEditing
                            }
                        >

                            Keep Editing

                        </Button>


                        <Button
                            type="button"
                            variant="destructive"
                            onClick={
                                discardChanges
                            }
                        >

                            Discard Changes

                        </Button>


                    </DialogFooter>


                </DialogContent>


            </Dialog>


        </AppLayout>

    );
}