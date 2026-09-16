import AppLayout from '@/layouts/app-layout';
import ImmunizationCard, {
    type ImmunizationCardVaccine,
    type ManualCardRow,
} from './components/immunization-card';
import PatientHeader from './components/patient-header';
import PatientWorkspaceNav from './components/patient-workspace-nav';
import VaccinationManagement, {
    type OptionalVaccine,
    type VaccinationOption,
} from './components/vaccination-management';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link, usePage } from '@inertiajs/react';
import { Baby, HeartPulse, Pencil, UserRound, UsersRound } from 'lucide-react';
import { useState } from 'react';

type ImmunizationRecord = {
    id: number;
    vaccine_id: number;
    dose_number: number;
    date_administered: string;
    source: string;
    remarks: string | null;
    vaccine?: { id: number; name: string };
    administeredBy?: { id: number; name: string };
};

type Patient = {
    id: number;
    patient_id: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    nickname?: string | null;
    date_of_birth: string;
    sex: string;
    address: string;
    guardian_name?: string | null;
    guardian_contact?: string | null;
    guardian_relationship: string | null;
    guardian?: {
        id?: number;
        guardian_no?: string;
        name?: string;
        email?: string;
        contact_number?: string | null;
        mother_maiden_name?: string | null;
        father_name?: string | null;
        mother_information_unavailable?: boolean;
        father_information_unavailable?: boolean;
    } | null;
    mother_name?: string | null;
    father_name?: string | null;
    birth_type?: string | null;
    is_full_term?: boolean | null;
    multiple_birth?: string | null;
    birth_attendant?: string | null;
    blood_type?: string | null;
    birth_weight?: string | number | null;
    birth_length?: string | number | null;
    head_circumference?: string | number | null;
    chest_circumference?: string | number | null;
    birth_order?: string | number | null;
    birth_registration_date?: string | null;
    birth_registration_place?: string | null;
    birth_family_notes?: string | null;
    medical_background: string | null;
    allergies: string | null;
    existing_conditions: string | null;
    status: string;
    immunizationRecords: ImmunizationRecord[];
};

type PageProps = {
    patient: Patient;
    vaccinationOptions: VaccinationOption[];
    immunizationCard: ImmunizationCardVaccine[];
    optionalVaccines: OptionalVaccine[];
    immunizationCardRows: ManualCardRow[];
    errors?: Record<string, string>;
    flash?: { success?: string };
};

type Section = 'general' | 'vaccination' | 'history';

export default function PatientShow() {
    const {
        patient,
        vaccinationOptions = [],
        immunizationCard = [],
        optionalVaccines = [],
        immunizationCardRows = [],
        errors,
        flash,
    } = usePage<PageProps>().props;

    const [activeSection, setActiveSection] = useState<Section>('general');

    const patientName = [
        patient.first_name,
        patient.middle_name,
        patient.last_name,
    ].filter(Boolean).join(' ');

    const parseDate = (date?: string | null) => {
        if (!date) return null;
        const [y, m, d] = date.split('T')[0].split('-').map(Number);
        if (!y || !m || !d) return null;
        const parsed = new Date(y, m - 1, d);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    };

    const formatDate = (date?: string | null) => {
        const parsed = parseDate(date);
        return parsed
            ? parsed.toLocaleDateString('en-US', {
                  month: 'numeric',
                  day: 'numeric',
                  year: 'numeric',
              })
            : '—';
    };

    const calculateAge = (dob: string) => {
        const birth = parseDate(dob);
        if (!birth) return '—';
        const today = new Date();
        let months =
            (today.getFullYear() - birth.getFullYear()) * 12 +
            (today.getMonth() - birth.getMonth());
        if (today.getDate() < birth.getDate()) months -= 1;
        months = Math.max(0, months);
        if (months < 12) return `${months} ${months === 1 ? 'month' : 'months'}`;
        const years = Math.floor(months / 12);
        const rem = months % 12;
        return rem === 0
            ? `${years} ${years === 1 ? 'year' : 'years'}`
            : `${years} ${years === 1 ? 'year' : 'years'} ${rem} months`;
    };

    const guardianName =
        patient.guardian?.name ?? patient.guardian_name ?? 'Not provided';
    const guardianContact =
        patient.guardian?.contact_number ??
        patient.guardian_contact ??
        'Not provided';
    const guardianEmail = patient.guardian?.email ?? 'Not provided';

    const motherName = patient.guardian?.mother_information_unavailable
        ? 'Information unavailable'
        : patient.guardian?.mother_maiden_name ??
          patient.mother_name ??
          'Not provided';

    const fatherName = patient.guardian?.father_information_unavailable
        ? 'Information unavailable'
        : patient.guardian?.father_name ??
          patient.father_name ??
          'Not provided';

    return (
        <AppLayout>
            <Head title={`${patientName} - Patient Profile`} />

            <div className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-7">
                <PatientHeader
                    patientRecordId={patient.id}
                    patientName={patientName}
                    patientId={patient.patient_id}
                    dateOfBirth={formatDate(patient.date_of_birth)}
                    age={calculateAge(patient.date_of_birth)}
                    status={patient.status}
                />

                <PatientWorkspaceNav
                    activeSection={activeSection}
                    onSectionChange={setActiveSection}
                />

                {activeSection === 'general' && (
                    <Card>
                        <CardHeader className="border-b">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <CardTitle>General Information</CardTitle>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Patient, family, birth, and medical information.
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

                        <CardContent className="space-y-7 pt-6">
                            <InfoSection icon={UserRound} title="Patient Information">
                                <InfoGrid>
                                    <InfoItem label="Patient ID" value={patient.patient_id} />
                                    <InfoItem label="Full Name" value={patientName} />
                                    <InfoItem label="Nickname" value={patient.nickname ?? 'Not provided'} />
                                    <InfoItem label="Date of Birth" value={formatDate(patient.date_of_birth)} />
                                    <InfoItem label="Age" value={calculateAge(patient.date_of_birth)} />
                                    <InfoItem label="Sex" value={patient.sex} />
                                    <InfoItem label="Status" value={patient.status} />
                                    <InfoItem label="Address" value={patient.address || 'Not provided'} wide />
                                </InfoGrid>
                            </InfoSection>

                            <div className="border-t" />

                            <InfoSection icon={UsersRound} title="Family / Guardian Information">
                                <InfoGrid>
                                    <InfoItem label="Guardian" value={guardianName} />
                                    <InfoItem label="Relationship" value={patient.guardian_relationship ?? 'Not provided'} />
                                    <InfoItem label="Contact Number" value={guardianContact} />
                                    <InfoItem label="Guardian Email" value={guardianEmail} />
                                    <InfoItem label="Mother's Maiden Name" value={motherName} />
                                    <InfoItem label="Father's Full Name" value={fatherName} />
                                </InfoGrid>
                            </InfoSection>

                            <div className="border-t" />

                            <InfoSection icon={Baby} title="Birth Information">
                                <InfoGrid>
                                    <InfoItem label="Type of Delivery" value={patient.birth_type ?? 'Not recorded'} />
                                    <InfoItem
                                        label="Full Term"
                                        value={
                                            patient.is_full_term == null
                                                ? 'Not recorded'
                                                : patient.is_full_term
                                                  ? 'Yes'
                                                  : 'No'
                                        }
                                    />
                                    <InfoItem label="Multiple Birth" value={patient.multiple_birth ?? 'Not recorded'} />
                                    <InfoItem label="Birth Attendant" value={patient.birth_attendant ?? 'Not recorded'} />
                                    <InfoItem label="Blood Type" value={patient.blood_type ?? 'Not recorded'} />
                                    <InfoItem label="Birth Order" value={patient.birth_order?.toString() ?? 'Not recorded'} />
                                    <InfoItem label="Birth Weight" value={measure(patient.birth_weight, 'kg')} />
                                    <InfoItem label="Body Length" value={measure(patient.birth_length, 'cm')} />
                                    <InfoItem label="Head Circumference" value={measure(patient.head_circumference, 'cm')} />
                                    <InfoItem label="Chest Circumference" value={measure(patient.chest_circumference, 'cm')} />
                                    <InfoItem label="Birth Registration Date" value={formatDate(patient.birth_registration_date)} />
                                    <InfoItem label="Birth Registration Place" value={patient.birth_registration_place ?? 'Not recorded'} />
                                    <InfoItem label="Birth / Family Notes" value={patient.birth_family_notes ?? 'None recorded'} wide />
                                </InfoGrid>
                            </InfoSection>

                            <div className="border-t" />

                            <InfoSection icon={HeartPulse} title="Medical Information">
                                <InfoGrid>
                                    <InfoItem label="Medical Background" value={patient.medical_background ?? 'None recorded'} wide />
                                    <InfoItem label="Allergies" value={patient.allergies ?? 'None recorded'} />
                                    <InfoItem label="Existing Conditions" value={patient.existing_conditions ?? 'None recorded'} />
                                </InfoGrid>
                            </InfoSection>
                        </CardContent>
                    </Card>
                )}

                {activeSection === 'vaccination' && (
                    <VaccinationManagement
                        patient={patient}
                        patientName={patientName}
                        vaccinationOptions={vaccinationOptions}
                        optionalVaccines={optionalVaccines}
                        flash={flash}
                        errors={errors}
                    />
                )}

                {activeSection === 'history' && (
                    <ImmunizationCard
                        patient={patient}
                        patientName={patientName}
                        formattedDateOfBirth={formatDate(patient.date_of_birth)}
                        formattedAge={calculateAge(patient.date_of_birth)}
                        immunizationCard={immunizationCard}
                        immunizationCardRows={immunizationCardRows}
                        flash={flash}
                        errors={errors}
                    />
                )}
            </div>
        </AppLayout>
    );
}

function InfoSection({
    icon: Icon,
    title,
    children,
}: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section>
            <div className="mb-4 flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">{title}</h3>
            </div>
            {children}
        </section>
    );
}

function InfoGrid({ children }: { children: React.ReactNode }) {
    return (
        <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            {children}
        </div>
    );
}

function InfoItem({
    label,
    value,
    wide = false,
}: {
    label: string;
    value: string;
    wide?: boolean;
}) {
    return (
        <div className={wide ? 'sm:col-span-2 lg:col-span-3' : ''}>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm font-medium">{value}</p>
        </div>
    );
}

function measure(
    value: string | number | null | undefined,
    unit: string,
) {
    return value === null || value === undefined || value === ''
        ? 'Not recorded'
        : `${value} ${unit}`;
}
