import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import {
    FileText,
    Pencil,
    UserRound,
} from 'lucide-react';

type GeneralInformationPatient = {
    id: number;
    patient_id: string;
    sex: string;
    address: string;
    guardian_name: string;
    guardian_contact: string | null;
    guardian_relationship: string | null;
    medical_background: string | null;
    allergies: string | null;
    existing_conditions: string | null;
    status: string;

    user?: {
        email: string;
    };
};

type GeneralInformationProps = {
    patient: GeneralInformationPatient;
    patientName: string;
    dateOfBirth: string;
    age: string;
};

export default function GeneralInformation({
    patient,
    patientName,
    dateOfBirth,
    age,
}: GeneralInformationProps) {
    return (
        <Card>
            <CardHeader className="border-b">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle>
                            General Information
                        </CardTitle>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Patient, guardian, account, and
                            medical information.
                        </p>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        asChild
                    >
                        <Link href={`/patients/${patient.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Information
                        </Link>
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
                <section>
                    <div className="mb-4 flex items-center gap-2">
                        <UserRound className="h-4 w-4 text-muted-foreground" />

                        <h3 className="font-semibold">
                            Patient Information
                        </h3>
                    </div>

                    <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                        <InfoItem
                            label="Patient ID"
                            value={patient.patient_id}
                        />

                        <InfoItem
                            label="Full Name"
                            value={patientName}
                        />

                        <InfoItem
                            label="Date of Birth"
                            value={dateOfBirth}
                        />

                        <InfoItem
                            label="Age"
                            value={age}
                        />

                        <InfoItem
                            label="Sex"
                            value={patient.sex}
                        />

                        <InfoItem
                            label="Patient Status"
                            value={patient.status}
                        />

                        <div className="sm:col-span-2 lg:col-span-3">
                            <InfoItem
                                label="Address"
                                value={
                                    patient.address ||
                                    'Not provided'
                                }
                            />
                        </div>
                    </div>
                </section>

                <div className="border-t" />

                <section>
                    <h3 className="mb-4 font-semibold">
                        Guardian Information
                    </h3>

                    <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                        <InfoItem
                            label="Guardian Name"
                            value={patient.guardian_name}
                        />

                        <InfoItem
                            label="Contact Number"
                            value={
                                patient.guardian_contact ??
                                'Not provided'
                            }
                        />

                        <InfoItem
                            label="Relationship"
                            value={
                                patient.guardian_relationship ??
                                'Not provided'
                            }
                        />
                    </div>
                </section>

                <div className="border-t" />

                <section>
                    <h3 className="mb-4 font-semibold">
                        Account Information
                    </h3>

                    <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                        <InfoItem
                            label="Email Address"
                            value={
                                patient.user?.email ??
                                'Not available'
                            }
                        />

                        <InfoItem
                            label="Account Status"
                            value={patient.status}
                        />
                    </div>
                </section>

                <div className="border-t" />

                <section>
                    <div className="mb-4 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />

                        <h3 className="font-semibold">
                            Medical Background
                        </h3>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-3">
                        <MedicalItem
                            label="Medical Background"
                            value={
                                patient.medical_background ??
                                'Not provided'
                            }
                        />

                        <MedicalItem
                            label="Allergies"
                            value={
                                patient.allergies ??
                                'Not provided'
                            }
                        />

                        <MedicalItem
                            label="Existing Conditions"
                            value={
                                patient.existing_conditions ??
                                'Not provided'
                            }
                        />
                    </div>
                </section>
            </CardContent>
        </Card>
    );
}

function InfoItem({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
            </p>

            <p className="mt-1.5 font-medium">
                {value}
            </p>
        </div>
    );
}

function MedicalItem({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-lg border bg-muted/10 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
            </p>

            <p className="mt-2 text-sm font-medium">
                {value}
            </p>
        </div>
    );
}
