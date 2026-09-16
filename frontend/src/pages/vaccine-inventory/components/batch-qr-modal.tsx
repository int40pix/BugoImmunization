import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Check, Copy, Printer, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useRef, useState } from 'react';

interface BatchQrModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    batch: {
        id: number;
        batch_number: string;
        quantity: number;
        expiration_date: string;
        manufacturer?: string | null;
        supplier?: string | null;
        vaccine_name?: string;
    } | null;
}

export function BatchQrModal({ open, onOpenChange, batch }: BatchQrModalProps) {
    const [copied, setCopied] = useState(false);
    const qrContainerRef = useRef<HTMLDivElement>(null);

    if (!batch) return null;

    const qrValue = `batch:${batch.batch_number}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(batch.batch_number);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy batch number', err);
        }
    };

    const handlePrint = () => {
        const svgElement = qrContainerRef.current?.querySelector('svg');
        if (!svgElement) return;

        const svgData = new XMLSerializer().serializeToString(svgElement);
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Vaccine Batch QR - ${batch.batch_number}</title>
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                            margin: 0;
                            padding: 24px;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            text-align: center;
                            color: #111;
                        }
                        .label-card {
                            border: 2px dashed #333;
                            border-radius: 12px;
                            padding: 20px;
                            max-width: 320px;
                            width: 100%;
                            box-sizing: border-box;
                        }
                        .clinic-title {
                            font-size: 11px;
                            text-transform: uppercase;
                            letter-spacing: 0.05em;
                            color: #666;
                            margin-bottom: 6px;
                            font-weight: 600;
                        }
                        .vaccine-name {
                            font-size: 18px;
                            font-weight: 700;
                            margin: 0 0 6px 0;
                            line-height: 1.2;
                        }
                        .batch-no {
                            font-size: 14px;
                            font-family: monospace;
                            font-weight: 600;
                            color: #1a56db;
                            margin: 0 0 14px 0;
                        }
                        .qr-box {
                            display: flex;
                            justify-content: center;
                            margin: 0 auto 12px;
                        }
                        .meta {
                            font-size: 11px;
                            color: #444;
                            margin-top: 4px;
                        }
                        @media print {
                            body {
                                padding: 0;
                            }
                            .label-card {
                                border: 1px solid #000;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="label-card">
                        <div class="clinic-title">Bugo Health Center · Vaccine Batch</div>
                        <h2 class="vaccine-name">${batch.vaccine_name || 'Vaccine Stock'}</h2>
                        <div class="batch-no">LOT: ${batch.batch_number}</div>
                        <div class="qr-box">
                            ${svgData}
                        </div>
                        <div class="meta"><strong>Exp:</strong> ${batch.expiration_date}</div>
                        ${batch.manufacturer ? `<div class="meta"><strong>Mfg:</strong> ${batch.manufacturer}</div>` : ''}
                    </div>
                    <script>
                        window.onload = function() {
                            window.focus();
                            window.print();
                            window.close();
                        };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-w-[95vw] rounded-2xl p-6">
                <DialogHeader className="text-left space-y-1">
                    <div className="flex items-center gap-2 text-primary font-semibold text-lg">
                        <QrCode className="h-5 w-5" />
                        <DialogTitle>Batch QR Code</DialogTitle>
                    </div>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Scan with the clinic reader or print as a physical label for the vaccine vial or shelf box.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4 flex flex-col items-center">
                    <div
                        ref={qrContainerRef}
                        className="rounded-2xl border-2 border-border/80 bg-white p-5 shadow-xs flex flex-col items-center justify-center"
                    >
                        <QRCodeSVG
                            value={qrValue}
                            size={200}
                            level="H"
                            marginSize={2}
                            title={`Batch ${batch.batch_number}`}
                        />
                    </div>

                    <div className="mt-4 text-center space-y-1">
                        <div className="flex items-center justify-center gap-2">
                            <span className="font-mono font-bold text-base text-foreground tracking-wide">
                                {batch.batch_number}
                            </span>
                            <Badge variant="outline" className="text-xs">
                                {batch.quantity} doses left
                            </Badge>
                        </div>
                        {batch.vaccine_name && (
                            <p className="text-xs font-medium text-primary">
                                {batch.vaccine_name}
                            </p>
                        )}
                        <p className="text-[11px] text-muted-foreground">
                            Expires: <span className="font-medium text-foreground">{batch.expiration_date}</span>
                            {batch.manufacturer ? ` · ${batch.manufacturer}` : ''}
                        </p>
                    </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-2 border-t pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        className="h-8 gap-1.5 text-xs"
                    >
                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? 'Copied' : 'Copy Lot #'}
                    </Button>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handlePrint}
                            className="h-8 gap-1.5 text-xs font-medium"
                        >
                            <Printer className="h-3.5 w-3.5 text-primary" />
                            Print Label
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            onClick={() => onOpenChange(false)}
                            className="h-8 text-xs"
                        >
                            Done
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

