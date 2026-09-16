import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Baby, Check, Copy, Printer, QrCode, Sparkles } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import React, { useRef, useState } from 'react';

export type QrChildItem = {
    id: number;
    patient_id: string;
    name: string;
    date_of_birth?: string | null;
    qr_code_value?: string;
};

interface ChildQrModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    childrenList: QrChildItem[];
    selectedChildId?: number;
}

export default function ChildQrModal({
    open,
    onOpenChange,
    childrenList,
    selectedChildId,
}: ChildQrModalProps) {
    const [activeChildId, setActiveChildId] = useState<number>(
        selectedChildId ?? childrenList[0]?.id ?? 0,
    );
    const [copied, setCopied] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    // Sync selected child when modal opens or prop changes
    React.useEffect(() => {
        if (selectedChildId) {
            setActiveChildId(selectedChildId);
        } else if (childrenList.length > 0 && !activeChildId) {
            setActiveChildId(childrenList[0].id);
        }
    }, [selectedChildId, childrenList]);

    const activeChild =
        childrenList.find((c) => c.id === activeChildId) ?? childrenList[0];

    const qrValue =
        activeChild?.qr_code_value ||
        (activeChild ? `/patients/${activeChild.id}` : '');

    const handleCopy = () => {
        if (!activeChild) return;
        navigator.clipboard.writeText(activeChild.patient_id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePrint = () => {
        window.print();
    };

    if (!activeChild) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md p-0 overflow-hidden border-border/80">
                <DialogHeader className="p-5 pb-3 border-b bg-muted/20">
                    <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
                        <Sparkles className="h-3.5 w-3.5" />
                        Digital Health Passport
                    </div>
                    <DialogTitle className="text-lg font-bold text-foreground">
                        Child Check-In QR Pass
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Present this pass at Barangay Bugo Health Center for instant patient look-up.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 space-y-5">
                    {/* Sibling selector if more than 1 child */}
                    {childrenList.length > 1 && (
                        <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border/60 bg-muted/40 p-1 text-xs font-medium">
                            {childrenList.map((child) => (
                                <button
                                    key={child.id}
                                    type="button"
                                    onClick={() => setActiveChildId(child.id)}
                                    className={`flex-1 min-w-[110px] inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                                        activeChildId === child.id
                                            ? 'bg-background text-foreground shadow-xs font-semibold'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <Baby className="h-3.5 w-3.5" />
                                    <span className="truncate">{child.name}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* QR Code Pass Card */}
                    <div
                        ref={printRef}
                        className="rounded-2xl border border-border/70 bg-card p-5 text-center shadow-xs flex flex-col items-center"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <img
                                src="/images/bugo-health-center-logo.png"
                                alt=""
                                className="h-7 w-7 rounded-full object-contain"
                            />
                            <div className="text-left leading-tight">
                                <p className="text-xs font-bold text-foreground">
                                    Barangay Bugo Health Center
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                    Pediatric Immunization Program
                                </p>
                            </div>
                        </div>

                        {/* QR Code Wrapper with stark white background for reliable scanner contrast */}
                        <div className="rounded-xl bg-white p-3.5 shadow-xs border border-zinc-200">
                            <QRCodeSVG
                                value={qrValue}
                                size={190}
                                level="H"
                                marginSize={1}
                                title={`${activeChild.name} - ${activeChild.patient_id}`}
                            />
                        </div>

                        <div className="mt-4">
                            <h3 className="text-base font-bold text-foreground tracking-tight">
                                {activeChild.name}
                            </h3>
                            <div className="mt-1 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                                <span>Patient ID:</span>
                                <span className="font-mono font-semibold text-foreground">
                                    {activeChild.patient_id}
                                </span>
                            </div>
                            {activeChild.date_of_birth && (
                                <p className="mt-0.5 text-[11px] text-muted-foreground">
                                    Born: {activeChild.date_of_birth}
                                </p>
                            )}
                        </div>

                        <div className="mt-4 rounded-lg bg-blue-500/10 border border-blue-500/20 px-3 py-2 text-[11px] text-blue-700 dark:text-blue-300">
                            Health center staff can scan this code with any camera scanner to open your child's complete immunization record.
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleCopy}
                            className="h-8 gap-1.5 text-xs flex-1"
                        >
                            {copied ? (
                                <>
                                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                                    Copied ID
                                </>
                            ) : (
                                <>
                                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                                    Copy Patient ID
                                </>
                            )}
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handlePrint}
                            className="h-8 gap-1.5 text-xs flex-1"
                        >
                            <Printer className="h-3.5 w-3.5 text-muted-foreground" />
                            Print Pass
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

