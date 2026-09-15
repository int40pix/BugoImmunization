import { Head, useForm, usePage } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

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
import { ArrowLeft } from 'lucide-react';


type VaccineOption = {
    id: number;
    name: string;
    category: string;
};


type AddBatchForm = {
    vaccine_id: string;
    batch_number: string;
    quantity: string;
    date_received: string;
    expiration_date: string;
    manufacturer: string;
    supplier: string;
    remarks: string;
};


export default function VaccineCreate() {

    const {
        vaccines,
    } = usePage<{
        vaccines: VaccineOption[];
    }>().props;


    const {
        data,
        setData,
        post,
        processing,
        errors,
    } = useForm<AddBatchForm>({
        vaccine_id: '',
        batch_number: '',
        quantity: '',
        date_received: '',
        expiration_date: '',
        manufacturer: '',
        supplier: '',
        remarks: '',
    });


    function submit(
        e: React.FormEvent
    ) {
        e.preventDefault();

        post(
            route(
                'vaccine-inventory.store'
            )
        );
    }


    return (
        <AppLayout>

            <Head title="Add Vaccine Batch" />


            <div className="max-w-4xl space-y-6 p-6">


                {/* ======================================== */}
                {/* HEADER */}
                {/* ======================================== */}

                <div>

                    <Button
                        variant="ghost"
                        type="button"
                        onClick={() =>
                            window.history.back()
                        }
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>


                    <h1 className="mt-4 text-2xl font-bold">
                        Add Vaccine Batch
                    </h1>


                    <p className="mt-2 text-muted-foreground">
                        Add a new vaccine batch to the
                        health center inventory.
                    </p>

                </div>


                {/* ======================================== */}
                {/* FORM CARD */}
                {/* ======================================== */}

                <Card>

                    <CardHeader>

                        <CardTitle>
                            Vaccine Information
                        </CardTitle>

                    </CardHeader>


                    <CardContent>

                        <form
                            onSubmit={submit}
                            className="space-y-6"
                        >


                            {/* ==================================== */}
                            {/* VACCINE + BATCH NUMBER */}
                            {/* ==================================== */}

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
                                        onValueChange={(
                                            value
                                        ) =>
                                            setData(
                                                'vaccine_id',
                                                value
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
                                                        vaccine
                                                    ) => (

                                                        <SelectItem
                                                            key={
                                                                vaccine.id
                                                            }
                                                            value={String(
                                                                vaccine.id
                                                            )}
                                                        >
                                                            {
                                                                vaccine.name
                                                            }
                                                        </SelectItem>

                                                    )
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
                                        onChange={(
                                            e
                                        ) =>
                                            setData(
                                                'batch_number',
                                                e.target.value
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


                            {/* ==================================== */}
                            {/* QUANTITY + MANUFACTURER */}
                            {/* ==================================== */}

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
                                        onChange={(
                                            e
                                        ) =>
                                            setData(
                                                'quantity',
                                                e.target.value
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
                                        onChange={(
                                            e
                                        ) =>
                                            setData(
                                                'manufacturer',
                                                e.target.value
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


                            {/* ==================================== */}
                            {/* DATES */}
                            {/* ==================================== */}

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
                                        onChange={(
                                            e
                                        ) =>
                                            setData(
                                                'date_received',
                                                e.target.value
                                            )
                                        }
                                        onClick={(
                                            e
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
                                        onChange={(
                                            e
                                        ) =>
                                            setData(
                                                'expiration_date',
                                                e.target.value
                                            )
                                        }
                                        onClick={(
                                            e
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


                            {/* ==================================== */}
                            {/* SUPPLIER */}
                            {/* ==================================== */}

                            <div className="space-y-2">

                                <Label>
                                    Supplier
                                </Label>

                                <Input
                                    placeholder="e.g. DOH Region X"
                                    value={
                                        data.supplier
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setData(
                                            'supplier',
                                            e.target.value
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


                            {/* ==================================== */}
                            {/* REMARKS */}
                            {/* ==================================== */}

                            <div className="space-y-2">

                                <Label>
                                    Remarks
                                </Label>

                                <Textarea
                                    value={
                                        data.remarks
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setData(
                                            'remarks',
                                            e.target.value
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


                            {/* ==================================== */}
                            {/* SUBMIT */}
                            {/* ==================================== */}

                            <div className="flex justify-end">

                                <Button
                                    type="submit"
                                    disabled={
                                        processing
                                    }
                                >

                                    {processing
                                        ? 'Saving...'
                                        : 'Save Vaccine Batch'}

                                </Button>

                            </div>

                        </form>

                    </CardContent>

                </Card>

            </div>

        </AppLayout>
    );
}