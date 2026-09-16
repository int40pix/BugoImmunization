import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
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
import { AlertCircle, ArrowDown, ArrowUp, Loader2, Scale } from 'lucide-react';
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
    const [actionType, setActionType] = useState<'wastage' | 'adjustment'>('wastage');
    const [direction, setDirection] = useState<'deduct' | 'add'>('deduct');
    const [amount, setAmount] = useState<string>('1');
    const [remarks, setRemarks] = useState('');
    const [processing, setProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setActionType('wastage');
            setDirection('deduct');
            setAmount('1');
            setRemarks('');
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
                            <Scale className="h-5 w-5" />
                            <DialogTitle>Stock Adjustment / Log Wastage</DialogTitle>
                        </div>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Record inventory changes for batch{' '}
                            <span className="font-mono font-semibold text-foreground">
                                {batch.batch_number}
                            </span>
                            {batch.vaccine_name ? ` (${batch.vaccine_name})` : ''}.
                        </DialogDescription>
                    </DialogHeader>

                    {errorMessage && (
                        <Alert variant="destructive" className="py-2 text-xs">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{errorMessage}</AlertDescription>
                        </Alert>
                    )}

                    {/* Stock Overview Card */}
                    <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3 text-xs border border-border/60">
                        <div>
                            <p className="text-muted-foreground">Current Stock</p>
                            <p className="font-bold text-base text-foreground mt-0.5">
                                {currentQty} doses
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-muted-foreground">Projected Balance</p>
                            <p
                                className={`font-bold text-base mt-0.5 ${
                                    isInvalidBalance
                                        ? 'text-red-600 dark:text-red-400'
                                        : 'text-foreground'
                                }`}
                            >
                                {calculatedBalance} doses
                            </p>
                        </div>
                    </div>

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
                                    ? 'e.g. Broken vial during prep, cold chain temp excursion, or damaged seal'
                                    : 'e.g. Physical inventory count reconciliation'
                            }
                            className="min-h-[75px] text-xs resize-none"
                            required
                        />
                    </div>

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
                            disabled={processing || isInvalidBalance || parsedAmount <= 0}
                            className="h-8 text-xs gap-1.5"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    Saving...
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

