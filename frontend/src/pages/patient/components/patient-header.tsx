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

import {
    ArrowLeft,
    Pencil,
    Printer,
    QrCode,
    ScanLine,
} from 'lucide-react';
import { router } from '@inertiajs/react';

import {
    useRef,
    useState,
} from 'react';

import {
    QRCodeSVG,
} from 'qrcode.react';


type PatientHeaderProps = {
    patientRecordId: number;
    patientName: string;
    patientId: string;
    dateOfBirth: string;
    age: string;
    status?: string;
};


export default function PatientHeader({
    patientRecordId,
    patientName,
    patientId,
    dateOfBirth,
    age,
    status,
}: PatientHeaderProps) {

    const [
        qrOpen,
        setQrOpen,
    ] = useState(false);


    const printAreaRef =
        useRef<HTMLDivElement | null>(
            null,
        );


    const patientUrl =
        typeof window !== 'undefined'
            ? `${window.location.origin}/patients/${patientRecordId}`
            : `/patients/${patientRecordId}`;


    function printQrCode() {

        const printContent =
            printAreaRef.current;


        if (!printContent) {
            return;
        }


        const printWindow =
            window.open(
                '',
                '_blank',
                'width=700,height=800',
            );


        if (!printWindow) {
            return;
        }


        printWindow.document.write(`
            <!DOCTYPE html>

            <html>

                <head>

                    <title>
                        ${patientId} - Patient QR Code
                    </title>

                    <style>

                        * {
                            box-sizing: border-box;
                        }

                        body {
                            margin: 0;
                            padding: 40px;
                            font-family: Arial, Helvetica, sans-serif;
                            color: #000;
                            background: #fff;
                        }

                        .page {
                            max-width: 520px;
                            margin: 0 auto;
                            text-align: center;
                        }

                        .health-center {
                            margin: 0;
                            font-size: 20px;
                            font-weight: 700;
                        }

                        .subtitle {
                            margin-top: 5px;
                            font-size: 13px;
                        }

                        .divider {
                            border-top: 1px solid #000;
                            margin: 22px 0;
                        }

                        .qr-wrapper {
                            display: inline-flex;
                            padding: 18px;
                            border: 2px solid #000;
                            border-radius: 12px;
                        }

                        .qr-wrapper svg {
                            display: block;
                        }

                        .patient-name {
                            margin-top: 22px;
                            margin-bottom: 0;
                            font-size: 20px;
                            font-weight: 700;
                        }

                        .patient-id {
                            margin-top: 6px;
                            font-size: 15px;
                        }

                        .instruction {
                            max-width: 380px;
                            margin: 18px auto 0;
                            font-size: 12px;
                            line-height: 1.6;
                        }

                        .footer {
                            margin-top: 28px;
                            padding-top: 16px;
                            border-top: 1px solid #999;
                            font-size: 10px;
                        }

                        @page {
                            size: A4 portrait;
                            margin: 20mm;
                        }

                    </style>

                </head>

                <body>

                    <div class="page">

                        <p class="health-center">
                            Barangay Bugo Health Center
                        </p>

                        <p class="subtitle">
                            Pediatric Immunization Management System
                        </p>

                        <div class="divider"></div>

                        <div class="qr-wrapper">

                            ${printContent.innerHTML}

                        </div>

                        <p class="patient-name">
                            ${patientName}
                        </p>

                        <p class="patient-id">
                            Patient ID:
                            <strong>
                                ${patientId}
                            </strong>
                        </p>

                        <p class="instruction">

                            Scan this QR code using an authorized device
                            to access this patient's digital record.

                        </p>

                        <p class="footer">

                            This QR code is linked to the patient's
                            record in the Barangay Bugo Health Center
                            Pediatric Immunization Management System.

                        </p>

                    </div>

                    <script>

                        window.onload = function () {
                            window.print();
                        };

                        window.onafterprint = function () {
                            window.close();
                        };

                    </script>

                </body>

            </html>
        `);


        printWindow.document.close();
    }


    return (

        <>

            <div className="rounded-2xl border bg-background/70 p-5 shadow-sm">


                <Button
                    variant="ghost"
                    type="button"
                    onClick={() =>
                        window.history.back()
                    }
                    className="h-8 px-0"
                >

                    <ArrowLeft className="mr-2 h-4 w-4" />

                    Back to Patients

                </Button>


                <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">


                    <div>

                        <div className="flex flex-wrap items-center gap-2">

                            <h1 className="text-2xl font-bold">

                                {patientName}

                            </h1>


                            <Badge variant="outline" className="text-muted-foreground font-normal">
                                Pediatric Record
                            </Badge>

                        </div>


                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">

                            <span>
                                {patientId}
                            </span>

                            <span>
                                DOB: {dateOfBirth}
                            </span>

                            <span>
                                Age: {age}
                            </span>

                        </div>

                    </div>


                    <div className="flex flex-wrap items-center gap-2">

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                setQrOpen(
                                    true,
                                )
                            }
                        >

                            <QrCode className="mr-2 h-4 w-4" />

                            Show QR Code

                        </Button>

                        <Button
                            type="button"
                            variant="default"
                            onClick={() => router.visit(`/patients/${patientRecordId}/edit`)}
                        >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Record
                        </Button>

                    </div>


                </div>

            </div>


            <Dialog
                open={
                    qrOpen
                }
                onOpenChange={
                    setQrOpen
                }
            >

                <DialogContent className="sm:max-w-md">

                    <DialogHeader>

                        <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-muted">

                            <ScanLine className="h-5 w-5" />

                        </div>

                        <DialogTitle>

                            Patient QR Code

                        </DialogTitle>

                        <DialogDescription>

                            Scan this QR code to quickly access the patient's digital record.

                        </DialogDescription>

                    </DialogHeader>


                    <div className="rounded-xl border p-5">

                        <div className="flex flex-col items-center text-center">


                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">

                                Barangay Bugo Health Center

                            </p>


                            <div
                                ref={
                                    printAreaRef
                                }
                                className="mt-5 rounded-xl bg-white p-4"
                            >

                                <QRCodeSVG
                                    value={
                                        patientUrl
                                    }
                                    size={
                                        220
                                    }
                                    level="H"
                                    marginSize={
                                        2
                                    }
                                    title={`${patientName} - ${patientId}`}
                                />

                            </div>


                            <h3 className="mt-5 text-lg font-semibold">

                                {patientName}

                            </h3>


                            <p className="mt-1 text-sm text-muted-foreground">

                                Patient ID:{' '}

                                <span className="font-medium text-foreground">

                                    {patientId}

                                </span>

                            </p>


                            <div className="mt-5 w-full rounded-lg bg-muted/40 p-3">

                                <p className="text-xs leading-5 text-muted-foreground">

                                    The QR code contains a link to this patient's record.
                                    Medical information is not stored directly inside the QR code.

                                </p>

                            </div>

                        </div>

                    </div>


                    <DialogFooter className="gap-2 sm:gap-0">

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                setQrOpen(
                                    false,
                                )
                            }
                        >

                            Close

                        </Button>


                        <Button
                            type="button"
                            onClick={
                                printQrCode
                            }
                        >

                            <Printer className="mr-2 h-4 w-4" />

                            Print QR Code

                        </Button>

                    </DialogFooter>

                </DialogContent>

            </Dialog>
        </>
    );
}