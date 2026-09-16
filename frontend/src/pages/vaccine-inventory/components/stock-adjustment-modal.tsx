import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
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
    AlertCircle,
    Archive,
    ArrowDown,
    ArrowUp,
    Loader2,
    Scale,
    TriangleAlert,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface StockAdjustmentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    batch: {
        id: number;
        batch_number: string;
        quantity: number;
        vaccine_name?: string;
    } | null;
}

export function StockAdjustmentModal({
    open,
    onOpenChange,
    batch,
}: StockAdjustmentModalProps) {
    const [mode, setMode] = useState<'adjust' | 'archive'>('adjust');

    // Adjustment states
    const [actionType, setActionType] = useState<'wastage' | 'adjustment'>('wastage');
    const [direction, setDirection] = useState<'deduct' | 'add'>('deduct');
    const [amount, setAmount] = useState<string>('1');
    const [remarks, setRemarks] = useState('');

    // Archive states
    const [archiveReason, setArchiveReason] = useState<'manual' | 'recalled'>('manual');
    const [archiveRemarks, setArchiveRemarks] = useState('');

    const [processing, setProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setMode('adjust');
            setActionType('wastage');
            setDirection('deduct');
            setAmount('1');
            setRemarks('');
            setArchiveReason('manual');
            setArchiveRemarks('');
            setErrorMessage(null);
            setProcessing(false);
        }
    }, [open]);

    if (!batch) return null;

    const currentQty = batch.quantity;
    const parsedAmount = parseInt(amount, 10) || 0;
    const effectiveChange = direction === 'deduct' ? -parsedAmount : parsedAmount;
    const calculatedBalance = currentQty + effectiveChange;
    const isInvalidBalance = calculatedBalance < 0;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        if (mode === 'archive') {
            setProcessing(true);
            router.put(
                route('vaccine-inventory.archive', batch.id),
                {
                    archive_reason: archiveReason,
                    remarks: archiveRemarks.trim(),
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setProcessing(false);
                        onOpenChange(false);
                    },
                    onError: (errors) => {
                        setProcessing(false);
                        const msg =
                            errors.archive_reason ||
                            errors.remarks ||
                            'Failed to archive batch. Please try again.';
                        setErrorMessage(msg);
                    },
                }
            );
            return;
        }

        // Mode is 'adjust'
        if (parsedAmount <= 0) {
            setErrorMessage('Quantity must be greater than zero.');
            return;
        }

        if (isInvalidBalance) {
            setErrorMessage('Cannot reduce stock below zero.');
            return;
        }

        if (!remarks.trim()) {
            setErrorMessage('Please provide a reason or remarks for this adjustment.');
            return;
        }

        setProcessing(true);

        router.post(
            route('vaccine-inventory.adjust-stock', batch.id),
            {
                type: actionType,
                quantity_change: effectiveChange,
                remarks: remarks.trim(),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setProcessing(false);
                    onOpenChange(false);
                },
                onError: (errors) => {
                    setProcessing(false);
                    const msg =
                        errors.quantity_change ||
                        errors.remarks ||
                        errors.type ||
                        'Failed to record adjustment. Please try again.';
                    setErrorMessage(msg);
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-w-[95vw] rounded-2xl p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <DialogHeader className="text-left space-y-1">
                        <div className="flex items-center gap-2 text-primary font-semibold text-lg">
                            {mode === 'archive' ? (
                                <Archive className="h-5 w-5 text-destructive" />
                            ) : (
                                <Scale className="h-5 w-5" />
                            )}
                            <DialogTitle>
                                {mode === 'archive'
                                    ? 'Archive Vaccine Batch'
                                    : 'Stock Adjustment / Log Wastage'}
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-xs text-muted-foreground">
                            {mode === 'archive'
                                ? 'Move batch into archived records and reconcile unadministered appointments for '
                                : 'Record inventory changes for batch '}
                            <span className="font-mono font-semibold text-foreground">
                                {batch.batch_number}
                            </span>
                            {batch.vaccine_name ? ` (${batch.vaccine_name})` : ''}.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Mode Toggle Switch */}
                    <div className="grid grid-cols-2 p-1 bg-muted rounded-lg text-xs font-medium">
                        <button
                            type="button"
                            onClick={() => {
                                setMode('adjust');
                                setErrorMessage(null);
                            }}
                            className={`py-1.5 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                                mode === 'adjust'
                                    ? 'bg-background shadow-xs font-semibold text-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Scale className="h-3.5 w-3.5" />
                            Stock Adjustment
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setMode('archive');
                                setErrorMessage(null);
                            }}
                            className={`py-1.5 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                                mode === 'archive'
                                    ? 'bg-background shadow-xs font-semibold text-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Archive className="h-3.5 w-3.5" />
                            Archive Batch
                        </button>
                    </div>

                    {errorMessage && (
                        <Alert variant="destructive" className="py-2 text-xs">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{errorMessage}</AlertDescription>
                        </Alert>
                    )}

                    {/* Current Stock Overview */}
                    <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3 text-xs border border-border/60">
                        <div>
                            <p className="text-muted-foreground">Current Stock</p>
                            <p className="font-bold text-base text-foreground mt-0.5">
                                {currentQty} doses
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-muted-foreground">
                                {mode === 'archive' ? 'Post-Archive Status' : 'Projected Balance'}
                            </p>
                            <p
                                className={`font-bold text-base mt-0.5 ${
                                    mode === 'archive'
                                        ? 'text-muted-foreground'
                                        : isInvalidBalance
                                        ? 'text-red-600 dark:text-red-400'
                                        : 'text-foreground'
                                }`}
                            >
                                {mode === 'archive' ? '0 doses (Archived)' : `${calculatedBalance} doses`}
                            </p>
                        </div>
                    </div>

                    {/* MODE 1: STOCK ADJUSTMENT */}
                    {mode === 'adjust' && (
                        <>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Category</Label>
                                    <Select
                                        value={actionType}
                                        onValueChange={(val: 'wastage' | 'adjustment') => {
                                            setActionType(val);
                                            if (val === 'wastage') {
                                                setDirection('deduct');
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="h-9 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="wastage">Wastage / Spoilage</SelectItem>
                                            <SelectItem value="adjustment">Inventory Correction</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs">Direction</Label>
                                    <Select
                                        value={direction}
                                        onValueChange={(val: 'deduct' | 'add') => setDirection(val)}
                                        disabled={actionType === 'wastage'}
                                    >
                                        <SelectTrigger className="h-9 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="deduct">Deduct Stock (-)</SelectItem>
                                            <SelectItem value="add">Add Stock (+)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="adj-amount" className="text-xs">
                                    Number of Doses
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="adj-amount"
                                        type="number"
                                        min="1"
                                        max={direction === 'deduct' ? currentQty : 99999}
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="h-9 text-xs pl-8"
                                        required
                                    />
                                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                                        {direction === 'deduct' ? (
                                            <ArrowDown className="h-3.5 w-3.5 text-red-500" />
                                        ) : (
                                            <ArrowUp className="h-3.5 w-3.5 text-emerald-500" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="adj-remarks" className="text-xs">
                                    Reason / Remarks <span className="text-red-500">*</span>
                                </Label>
                                <Textarea
                                    id="adj-remarks"
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    placeholder={
                                        actionType === 'wastage'
                                            ? 'e.g. Broken vial during prep, cold chain excursion, or damaged seal'
                                            : 'e.g. Physical count reconciliation or inventory correction'
                                    }
                                    className="min-h-[75px] text-xs resize-none"
                                    required
                                />
                            </div>
                        </>
                    )}

                    {/* MODE 2: ARCHIVE BATCH */}
                    {mode === 'archive' && (
                        <div className="space-y-3.5">
                            <div className="space-y-1.5">
                                <Label className="text-xs">
                                    Reason for Archiving <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={archiveReason}
                                    onValueChange={(val: 'manual' | 'recalled') => setArchiveReason(val)}
                                >
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="manual">Manual Archive / Discontinued</SelectItem>
                                        <SelectItem value="recalled">Manufacturer / Authority Recall</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="archive-modal-remarks" className="text-xs">
                                    Notes / Remarks (Optional)
                                </Label>
                                <Textarea
                                    id="archive-modal-remarks"
                                    value={archiveRemarks}
                                    onChange={(e) => setArchiveRemarks(e.target.value)}
                                    placeholder="Enter audit notes or context for archiving this batch..."
                                    className="min-h-[75px] text-xs resize-none"
                                />
                            </div>

                            {currentQty > 0 && (
                                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                                    <div className="flex items-start gap-2">
                                        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                                        <div className="text-xs text-amber-800 dark:text-amber-300">
                                            <p className="font-semibold">Notice: Remaining stock will be zeroed out</p>
                                            <p className="mt-0.5">
                                                This batch currently has {currentQty} {currentQty === 1 ? 'dose' : 'doses'}. Archiving it will record an archival reduction in the ledger and reconcile unadministered appointments.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter className="pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onOpenChange(false)}
                            disabled={processing}
                            className="h-8 text-xs"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={
                                processing ||
                                (mode === 'adjust' && (isInvalidBalance || parsedAmount <= 0))
                            }
                            className={`h-8 text-xs gap-1.5 ${
                                mode === 'archive'
                                    ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                                    : ''
                            }`}
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    {mode === 'archive' ? 'Archiving...' : 'Saving...'}
                                </>
                            ) : mode === 'archive' ? (
                                <>
                                    <Archive className="h-3.5 w-3.5" />
                                    Confirm Archive
                                </>
                            ) : (
                                'Confirm Adjustment'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
