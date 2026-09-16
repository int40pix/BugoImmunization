import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { router } from '@inertiajs/react';
import { Html5Qrcode } from 'html5-qrcode';
import {
    AlertCircle,
    Camera,
    CheckCircle2,
    Keyboard,
    Loader2,
    QrCode,
    RefreshCw,
    UploadCloud,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface QrScannerModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
}

export function QrScannerModal({
    open,
    onOpenChange,
    title = 'Scan QR Code',
    description = 'Scan a patient record or vaccine batch QR code using your camera, or upload a QR image.',
}: QrScannerModalProps) {
    const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'manual'>('camera');
    const [scannerStarting, setScannerStarting] = useState(false);
    const [scannerError, setScannerError] = useState<string | null>(null);
    const [scannerSuccess, setScannerSuccess] = useState<string | null>(null);
    const [manualCode, setManualCode] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const scannerRef = useRef<Html5Qrcode | null>(null);
    const scanHandledRef = useRef(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                if (scannerRef.current.isScanning) {
                    await scannerRef.current.stop();
                }
                await scannerRef.current.clear();
            } catch (err) {
                console.warn('Error stopping scanner:', err);
            }
            scannerRef.current = null;
        }
    };

    const processDecodedText = async (decodedText: string) => {
        if (scanHandledRef.current) return;

        const trimmed = decodedText.trim();
        if (!trimmed) {
            setScannerError('QR code contained no data.');
            return;
        }

        try {
            setIsProcessing(true);
            setScannerError(null);

            // 1. Check for Patient URL pattern: /patients/:id (handle full URL, double-origin, or relative)
            const patientUrlMatch = trimmed.match(/\/patients\/(\d+)(?:[/?#]|$)/i);
            if (patientUrlMatch) {
                const patientId = Number(patientUrlMatch[1]);
                if (!Number.isNaN(patientId) && patientId > 0) {
                    scanHandledRef.current = true;
                    setScannerSuccess(`Patient record #${patientId} identified! Redirecting...`);
                    await stopScanner();
                    setTimeout(() => {
                        onOpenChange(false);
                        router.visit(`/patients/${patientId}`);
                    }, 500);
                    return;
                }
            }

            // 2. Check for Vaccine Batch pattern: /vaccine-inventory?search=:batch or BATCH:... or LOT...
            const batchMatch =
                trimmed.match(/batch[:=]([A-Za-z0-9_-]+)/i) ||
                trimmed.match(/lot[:=]([A-Za-z0-9_-]+)/i) ||
                trimmed.match(/\/vaccine-inventory\?search=([A-Za-z0-9_-]+)/i);
            if (batchMatch) {
                const batchNumber = batchMatch[1];
                scanHandledRef.current = true;
                setScannerSuccess(`Vaccine batch ${batchNumber} identified! Redirecting...`);
                await stopScanner();
                setTimeout(() => {
                    onOpenChange(false);
                    router.visit(`/vaccine-inventory?search=${encodeURIComponent(batchNumber)}`);
                }, 500);
                return;
            }

            // 3. Check for Patient ID format: PT-XXXXXX or PAT-XXXX-XXXX
            if (/^(?:PT|PAT)[-0-9A-Za-z]+$/i.test(trimmed)) {
                scanHandledRef.current = true;
                setScannerSuccess(`Patient ID ${trimmed} found! Redirecting to search...`);
                await stopScanner();
                setTimeout(() => {
                    onOpenChange(false);
                    router.visit(`/patients?search=${encodeURIComponent(trimmed)}`);
                }, 500);
                return;
            }

            // 4. Raw numeric database ID: e.g. "12"
            if (/^\d+$/.test(trimmed)) {
                const patientId = Number(trimmed);
                scanHandledRef.current = true;
                setScannerSuccess(`Patient #${patientId} identified! Redirecting...`);
                await stopScanner();
                setTimeout(() => {
                    onOpenChange(false);
                    router.visit(`/patients/${patientId}`);
                }, 500);
                return;
            }

            // 5. Fallback: Search in patients directory
            scanHandledRef.current = true;
            setScannerSuccess(`Searching record for "${trimmed}"...`);
            await stopScanner();
            setTimeout(() => {
                onOpenChange(false);
                router.visit(`/patients?search=${encodeURIComponent(trimmed)}`);
            }, 500);
        } catch (error) {
            console.error('Scan processing error:', error);
            setScannerError('Could not process the QR code. Please ensure it is a valid health center code.');
            setIsProcessing(false);
        }
    };

    // Camera Lifecycle
    useEffect(() => {
        if (!open || activeTab !== 'camera') {
            void stopScanner();
            return;
        }

        let cancelled = false;

        const startScanner = async () => {
            setScannerStarting(true);
            setScannerError(null);
            setScannerSuccess(null);
            scanHandledRef.current = false;

            await new Promise((resolve) => setTimeout(resolve, 200));
            if (cancelled) return;

            const element = document.getElementById('global-qr-reader');
            if (!element) {
                setScannerStarting(false);
                return;
            }

            try {
                const scanner = new Html5Qrcode('global-qr-reader');
                scannerRef.current = scanner;

                await scanner.start(
                    { facingMode: 'environment' },
                    {
                        fps: 10,
                        qrbox: { width: 220, height: 220 },
                        aspectRatio: 1,
                    },
                    (decodedText) => {
                        void processDecodedText(decodedText);
                    },
                    () => {
                        // ignore misses while actively framing
                    },
                );
            } catch (err: any) {
                console.warn('Camera start error:', err);
                if (!cancelled) {
                    setScannerError(
                        'Camera access unavailable. Please grant camera permission or use the "Upload QR Image" / "Manual Code" tab.',
                    );
                }
            } finally {
                if (!cancelled) {
                    setScannerStarting(false);
                }
            }
        };

        void startScanner();

        return () => {
            cancelled = true;
            void stopScanner();
        };
    }, [open, activeTab]);

    // Handle Image File Upload Scan
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setScannerError(null);
        setScannerSuccess(null);
        setIsProcessing(true);

        try {
            const html5QrCode = new Html5Qrcode('file-qr-temp-reader');
            const decodedText = await html5QrCode.scanFile(file, false);
            await html5QrCode.clear();
            void processDecodedText(decodedText);
        } catch (error) {
            console.error('File scan error:', error);
            setScannerError('Could not find a valid QR code in this image. Please try a clearer photo or different file.');
            setIsProcessing(false);
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualCode.trim()) return;
        void processDecodedText(manualCode.trim());
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (!next) {
                    void stopScanner();
                }
                onOpenChange(next);
            }}
        >
            <DialogContent className="sm:max-w-md max-w-[95vw] rounded-2xl p-6">
                <DialogHeader className="text-left space-y-1">
                    <div className="flex items-center gap-2 text-primary font-semibold text-lg">
                        <QrCode className="h-5 w-5" />
                        <DialogTitle>{title}</DialogTitle>
                    </div>
                    <DialogDescription className="text-xs text-muted-foreground">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                {/* Tabs */}
                <div className="flex rounded-lg bg-muted p-1 gap-1 text-xs font-medium mt-3">
                    <button
                        type="button"
                        onClick={() => setActiveTab('camera')}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md transition-all ${
                            activeTab === 'camera'
                                ? 'bg-background text-foreground shadow-xs font-semibold'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Camera className="h-3.5 w-3.5" />
                        Live Camera
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('upload')}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md transition-all ${
                            activeTab === 'upload'
                                ? 'bg-background text-foreground shadow-xs font-semibold'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <UploadCloud className="h-3.5 w-3.5" />
                        Upload Image
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('manual')}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md transition-all ${
                            activeTab === 'manual'
                                ? 'bg-background text-foreground shadow-xs font-semibold'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Keyboard className="h-3.5 w-3.5" />
                        Manual Code
                    </button>
                </div>

                {/* Status Messages */}
                {scannerError && (
                    <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span className="flex-1">{scannerError}</span>
                    </div>
                )}

                {scannerSuccess && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span className="flex-1 font-medium">{scannerSuccess}</span>
                    </div>
                )}

                {/* Tab 1: Camera Scanner View */}
                {activeTab === 'camera' && (
                    <div className="mt-3 flex flex-col items-center">
                        <div className="relative aspect-square w-full max-w-[280px] overflow-hidden rounded-xl border border-border/80 bg-black/90 shadow-inner flex items-center justify-center">
                            <div id="global-qr-reader" className="w-full h-full" />

                            {scannerStarting && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/90 backdrop-blur-xs text-muted-foreground text-xs">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                    <span>Starting clinic camera...</span>
                                </div>
                            )}

                            {isProcessing && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/95 backdrop-blur-xs text-xs font-medium text-foreground">
                                    <Loader2 className="h-7 w-7 animate-spin text-emerald-600" />
                                    <span>Reading QR code...</span>
                                </div>
                            )}
                        </div>
                        <p className="mt-2 text-[11px] text-muted-foreground text-center">
                            Align the QR code within the target frame to scan automatically.
                        </p>
                    </div>
                )}

                {/* Tab 2: Upload Image View */}
                {activeTab === 'upload' && (
                    <div className="mt-3 flex flex-col items-center">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-video w-full rounded-xl border-2 border-dashed border-border/80 hover:border-primary/60 hover:bg-muted/30 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer p-6 text-center"
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                            {isProcessing ? (
                                <>
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    <p className="text-xs font-medium">Scanning uploaded file...</p>
                                </>
                            ) : (
                                <>
                                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                        <UploadCloud className="h-5 w-5" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-semibold text-foreground">
                                            Click to select or drop QR code image
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">
                                            Supports PNG, JPG, WEBP, or screenshots
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                        {/* Hidden reader element for file scans */}
                        <div id="file-qr-temp-reader" className="hidden" />
                    </div>
                )}

                {/* Tab 3: Manual Code View */}
                {activeTab === 'manual' && (
                    <form onSubmit={handleManualSubmit} className="mt-3 space-y-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-foreground">
                                Patient ID or Batch Lot Number
                            </label>
                            <Input
                                value={manualCode}
                                onChange={(e) => setManualCode(e.target.value)}
                                placeholder="e.g. PT-2026-0001 or LOT-BCG-001"
                                className="h-9 text-xs"
                                autoFocus
                            />
                            <p className="text-[10px] text-muted-foreground">
                                Enter the identifier printed directly on the card or vaccine vial.
                            </p>
                        </div>
                        <Button
                            type="submit"
                            disabled={!manualCode.trim() || isProcessing}
                            className="w-full h-8 text-xs font-medium gap-1.5"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    Searching...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Open Record
                                </>
                            )}
                        </Button>
                    </form>
                )}

                {/* Footer Controls */}
                <div className="mt-4 flex items-center justify-between pt-3 border-t border-border/40">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Active QR Engine
                    </span>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => {
                            void stopScanner();
                            onOpenChange(false);
                        }}
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
