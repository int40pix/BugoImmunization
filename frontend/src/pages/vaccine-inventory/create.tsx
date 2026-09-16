import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';

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
    const today = new Date().toISOString().split('T')[0];

    const { vaccines } = usePage<{
        vaccines: VaccineOption[];
    }>().props;

    const { data, setData, post, processing, errors } = useForm<AddBatchForm>({
        vaccine_id: '',
        batch_number: '',
        quantity: '',
        date_received: today,
        expiration_date: '',
        manufacturer: '',
        supplier: '',
        remarks: '',
    });

    const breadcrumbs = [
        { title: 'Vaccine Inventory', href: '/vaccine-inventory' },
        { title: 'Add Batch', href: '/vaccine-inventory/create' },
    ];

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('vaccine-inventory.store'));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Vaccine Batch" />

            <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8">
                <div>
                    <Button
                        asChild
                        variant="ghost"
                        className="-ml-3 mb-2 text-muted-foreground hover:text-foreground"
                    >
                        <Link href="/vaccine-inventory">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Inventory
                        </Link>
                    </Button>

                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Add Vaccine Batch
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Record a new batch of vaccines received at the health center.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Batch Information</CardTitle>
                        <CardDescription>
                            Enter batch number, doses received, and critical expiration dates.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            {/* Vaccine + Batch Number */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="vaccine_id">
                                        Vaccine <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={data.vaccine_id}
                                        onValueChange={(value) => setData('vaccine_id', value)}
                                    >
                                        <SelectTrigger id="vaccine_id">
                                            <SelectValue placeholder="Select Vaccine" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {vaccines.length === 0 ? (
                                                <SelectItem value="no-vaccines" disabled>
                                                    No vaccines available
                                                </SelectItem>
                                            ) : (
                                                vaccines.map((v) => (
                                                    <SelectItem key={v.id} value={String(v.id)}>
                                                        {v.name} ({v.category})
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {errors.vaccine_id && (
                                        <p className="text-xs text-destructive">{errors.vaccine_id}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="batch_number">
                                        Batch Number <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="batch_number"
                                        value={data.batch_number}
                                        onChange={(e) => setData('batch_number', e.target.value)}
                                        placeholder="e.g. BATCH-2026-001"
                                        required
                                    />
                                    {errors.batch_number && (
                                        <p className="text-xs text-destructive">{errors.batch_number}</p>
                                    )}
                                </div>
                            </div>

                            {/* Quantity + Dates */}
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="quantity">
                                        Quantity (Doses) <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={data.quantity}
                                        onChange={(e) => setData('quantity', e.target.value)}
                                        placeholder="e.g. 50"
                                        required
                                    />
                                    {errors.quantity && (
                                        <p className="text-xs text-destructive">{errors.quantity}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="date_received">
                                        Date Received <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="date_received"
                                        type="date"
                                        max={today}
                                        value={data.date_received}
                                        onChange={(e) => setData('date_received', e.target.value)}
                                        required
                                    />
                                    {errors.date_received && (
                                        <p className="text-xs text-destructive">{errors.date_received}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="expiration_date">
                                        Expiration Date <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="expiration_date"
                                        type="date"
                                        min={today}
                                        value={data.expiration_date}
                                        onChange={(e) => setData('expiration_date', e.target.value)}
                                        required
                                    />
                                    {errors.expiration_date && (
                                        <p className="text-xs text-destructive">{errors.expiration_date}</p>
                                    )}
                                </div>
                            </div>

                            {/* Manufacturer + Supplier */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="manufacturer">Manufacturer</Label>
                                    <Input
                                        id="manufacturer"
                                        value={data.manufacturer}
                                        onChange={(e) => setData('manufacturer', e.target.value)}
                                        placeholder="e.g. Sanofi Pasteur / GSK"
                                    />
                                    {errors.manufacturer && (
                                        <p className="text-xs text-destructive">{errors.manufacturer}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="supplier">Supplier / Source</Label>
                                    <Input
                                        id="supplier"
                                        value={data.supplier}
                                        onChange={(e) => setData('supplier', e.target.value)}
                                        placeholder="e.g. DOH Region X / City Health Office"
                                    />
                                    {errors.supplier && (
                                        <p className="text-xs text-destructive">{errors.supplier}</p>
                                    )}
                                </div>
                            </div>

                            {/* Remarks */}
                            <div className="space-y-2">
                                <Label htmlFor="remarks">Remarks</Label>
                                <Textarea
                                    id="remarks"
                                    value={data.remarks}
                                    onChange={(e) => setData('remarks', e.target.value)}
                                    placeholder="Storage condition details, delivery notes, or special handling..."
                                />
                                {errors.remarks && (
                                    <p className="text-xs text-destructive">{errors.remarks}</p>
                                )}
                            </div>

                            {/* Form Actions */}
                            <div className="flex items-center justify-end gap-3 border-t pt-4">
                                <Button asChild variant="outline">
                                    <Link href="/vaccine-inventory">Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Add Vaccine Batch'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}