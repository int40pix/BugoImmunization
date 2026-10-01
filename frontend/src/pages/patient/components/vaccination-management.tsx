import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    Building2,
    CalendarDays,
    CheckCircle2,
    History,
    Info,
    Layers,
    MapPin,
    Package,
    ShieldCheck,
    Syringe,
    UserCheck,
    X,
} from 'lucide-react';
import { useState } from 'react';

export type VaccinationOption = {
    vaccine_id: number;
    vaccine_name: string;
    category: string;
    dose_number: number;
    required_doses: number;
    completed_doses: number;
    doses_remaining: number;
    schedule_label: string;
    days_due?: number;
    days_overdue?: number;
    target_wednesday?: string | null;
    recommended_date: string | null;
    eligible_date: string | null;
    available_stock: number;
    inventory_available: boolean;
    can_administer: boolean;
    is_scheduled: boolean;
    scheduled_date: string | null;
    reserved_batch_id: number | null;
    reserved_batch_number: string | null;
    reserved_batch_expiration_date: string | null;
    reserved_batch_quantity: number | null;
    reserved_batch_usable: boolean;
    priority_reason: string | null;
    is_series_completion_candidate: boolean;
    allocation_rank: number | null;
    is_manually_adjusted?: boolean;
    adjustment_reason?: string | null;
};

export type OptionalVaccineSchedule = {
    dose_number: number;
    recommended_age: string | null;
    interval: string | null;
};

export type OptionalVaccine = {
    id: number;
    name: string;
    description: string | null;
    required_doses: number;
    category: string;
    is_assigned: boolean;
    notes: string | null;
    has_records: boolean;
    has_schedules: boolean;
    can_remove: boolean;
    schedules: OptionalVaccineSchedule[];
};

type VaccinationRecord = {
    id: number;
    vaccine_id: number;
    dose_number: number;
    batch_number?: string | null;
    date_administered: string;
    source: string;
    remarks: string | null;
    consent_given_by?: string | null;
    injection_site?: string | null;
    vaccine?: { id: number; name: string };
    administeredBy?: { id: number; name: string };
    administered_by?: { id: number; name: string } | number | null;
    inventoryTransaction?: { batch_number?: string };
    inventory_transaction?: { batch_number?: string };
};

type VaccinationManagementProps = {
    patient: {
        id: number;
        status: string;
        first_name?: string;
        last_name?: string;
        patient_id?: string;
        date_of_birth?: string;
        sex?: string;
        guardian_name?: string | null;
        guardian?: {
            name?: string;
            contact_number?: string | null;
        } | null;
        immunizationRecords?: VaccinationRecord[];
        immunization_records?: VaccinationRecord[];
    };
    patientName: string;
    vaccinationOptions: VaccinationOption[];
    optionalVaccines: OptionalVaccine[];
    flash?: {
        success?: string;
    };
    errors?: {
        administration?: string;
        optional_vaccine?: string;
    };
    staffUsers?: any[];
};

export default function VaccinationManagement({
    patient,
    patientName,
    vaccinationOptions,
    optionalVaccines,
    staffUsers,
    flash,
    errors,
}: VaccinationManagementProps) {
    const { auth } = usePage<{
        auth?: {
            user?: {
                id: number;
                name: string;
                role?: string;
            } | null;
        };
    }>().props;

    const [administeringKey, setAdministeringKey] =
        useState<string | null>(null);

    const [selectedAdministration, setSelectedAdministration] =
        useState<VaccinationOption | null>(null);

    const [showProceedModal, setShowProceedModal] = useState(false);
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [rescheduleDate, setRescheduleDate] = useState('');
    const [rescheduleReason, setRescheduleReason] = useState('');
    const [isRescheduling, setIsRescheduling] = useState(false);

    const [administrationRemarks, setAdministrationRemarks] =
        useState('');

    const [consentObtained, setConsentObtained] = useState(false);
    const [consentGivenBy, setConsentGivenBy] = useState('');
    const [healthScreened, setHealthScreened] = useState(true);
    const [allergyChecked, setAllergyChecked] = useState(true);
    const [fiveRightsVerified, setFiveRightsVerified] = useState(true);
    const [injectionSite, setInjectionSite] = useState('');
    const [isCustomSite, setIsCustomSite] = useState(false);

    const [assigningOptionalVaccineId, setAssigningOptionalVaccineId] =
        useState<number | null>(null);

    const [removingOptionalVaccineId, setRemovingOptionalVaccineId] =
        useState<number | null>(null);

    const [selectedOptionalVaccineId, setSelectedOptionalVaccineId] =
        useState('');

    // Session (Batch) Administration State
    const [showSessionModal, setShowSessionModal] = useState(false);
    const [showSessionProceedModal, setShowSessionProceedModal] = useState(false);
    const [isSubmittingSession, setIsSubmittingSession] = useState(false);
    const [sessionAdministeredBy, setSessionAdministeredBy] = useState<string>('');
    const [sessionDateAdministered, setSessionDateAdministered] = useState<string>('');
    const [sessionConsentGivenBy, setSessionConsentGivenBy] = useState<string>('');
    const [sessionRemarks, setSessionRemarks] = useState<string>('');
    const [sessionConsentObtained, setSessionConsentObtained] = useState<boolean>(false);
    const [sessionHealthScreened, setSessionHealthScreened] = useState<boolean>(true);
    const [sessionAllergyChecked, setSessionAllergyChecked] = useState<boolean>(true);
    const [sessionFiveRightsVerified, setSessionFiveRightsVerified] = useState<boolean>(true);
    const [sessionDoseConfigs, setSessionDoseConfigs] = useState<
        Record<
            number,
            {
                selected: boolean;
                injection_site: string;
                is_custom_site: boolean;
                remarks: string;
            }
        >
    >({});

    const parseDate = (date: string | null) => {
        if (!date) {
            return null;
        }

        const datePart = date.split('T')[0];
        const parts = datePart.split('-');

        if (parts.length !== 3) {
            return null;
        }

        const year = Number(parts[0]);
        const month = Number(parts[1]);
        const day = Number(parts[2]);

        if (
            Number.isNaN(year) ||
            Number.isNaN(month) ||
            Number.isNaN(day)
        ) {
            return null;
        }

        const parsed = new Date(
            year,
            month - 1,
            day,
        );

        if (Number.isNaN(parsed.getTime())) {
            return null;
        }

        return parsed;
    };

    const formatDate = (date: string | null) => {
        const parsed = parseDate(date);

        if (!parsed) {
            return '—';
        }

        return parsed.toLocaleDateString('en-US', {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatRecommendedAge = (
        age: string | null,
    ) => {
        if (!age) {
            return '—';
        }

        const normalized = age
            .trim()
            .toLowerCase();

        if (
            normalized === '0 days' ||
            normalized === '0 day' ||
            normalized === 'at birth'
        ) {
            return 'At birth';
        }

        return age
            .replace(
                /(\d+)\.25\b/g,
                '$1¼',
            )
            .replace(
                /(\d+)\.5\b/g,
                '$1½',
            )
            .replace(
                /(\d+)\.50\b/g,
                '$1½',
            )
            .replace(
                /(\d+)\.75\b/g,
                '$1¾',
            );
    };

    const getPriorityClass = (
        label: string,
    ) => {
        if (label === 'Overdue') {
            return 'text-red-600 dark:text-red-400';
        }

        if (label === 'Recent Due') {
            return 'text-orange-600 dark:text-orange-400';
        }

        if (label === 'Current Age') {
            return 'text-blue-600 dark:text-blue-400';
        }

        if (label === 'Upcoming') {
            return 'text-sky-600 dark:text-sky-400';
        }

        return 'text-muted-foreground';
    };

    const getVaccinationStatus = (
        option: VaccinationOption,
    ) => {
        if (option.is_scheduled) {
            return {
                text: 'Scheduled',
                className:
                    'text-green-600 dark:text-green-400',
            };
        }

        if (!option.inventory_available) {
            return {
                text: 'Waiting for stock',
                className:
                    'text-orange-600 dark:text-orange-400',
            };
        }

        return {
            text: 'Eligible',
            className:
                'text-green-600 dark:text-green-400',
        };
    };

    const canShowAdministerButton = (
        option: VaccinationOption,
    ) => {
        return option.can_administer;
    };

    const handleOpenAdministration = (
        option: VaccinationOption,
    ) => {
        if (!canShowAdministerButton(option)) {
            return;
        }

        setSelectedAdministration(option);
        setShowProceedModal(false);
        setAdministrationRemarks('');
        setConsentObtained(false);
        setConsentGivenBy(
            patient.guardian?.name || patient.guardian_name || ''
        );
        setHealthScreened(true);
        setAllergyChecked(true);
        setFiveRightsVerified(true);
        setInjectionSite('');
        setIsCustomSite(false);
    };

    const handleCloseAdministration = () => {
        if (administeringKey) {
            return;
        }

        setSelectedAdministration(null);
        setShowProceedModal(false);
        setAdministrationRemarks('');
        setConsentObtained(false);
        setConsentGivenBy('');
        setHealthScreened(true);
        setAllergyChecked(true);
        setFiveRightsVerified(true);
        setInjectionSite('');
        setIsCustomSite(false);
    };

    const isWednesday = (dateStr: string) => {
        if (!dateStr) return false;
        const [y, m, d] = dateStr.split('-').map(Number);
        if (!y || !m || !d) return false;
        const dateObj = new Date(y, m - 1, d);
        return dateObj.getDay() === 3;
    };

    const getNearestWednesday = (dateStr?: string | null) => {
        const base = dateStr ? new Date(dateStr + 'T00:00:00') : new Date();
        const day = base.getDay();
        const diff = (3 - day + 7) % 7 || 7;
        const wed = new Date(base);
        wed.setDate(base.getDate() + diff);
        const y = wed.getFullYear();
        const m = String(wed.getMonth() + 1).padStart(2, '0');
        const d = String(wed.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const handleOpenRescheduleModal = (initialDate?: string | null) => {
        const target = initialDate || getNearestWednesday();
        setRescheduleDate(isWednesday(target) ? target : getNearestWednesday(target));
        setRescheduleReason('');
        setShowRescheduleModal(true);
    };

    const handleSaveReschedule = (e: React.FormEvent) => {
        e.preventDefault();
        if (!rescheduleDate || isRescheduling) return;

        if (!isWednesday(rescheduleDate)) {
            return;
        }

        setIsRescheduling(true);
        router.post(
            `/immunization/patients/${patient.id}/reschedule`,
            {
                scheduled_date: rescheduleDate,
                adjustment_reason: rescheduleReason.trim() || 'Adjusted by clinic staff',
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowRescheduleModal(false);
                },
                onFinish: () => {
                    setIsRescheduling(false);
                },
            },
        );
    };

    const isAdministrationReady =
        consentObtained &&
        consentGivenBy.trim().length > 0;

    const handleSubmitAdministration = () => {
        if (!selectedAdministration || administeringKey || !isAdministrationReady) {
            return;
        }

        const key =
            `${selectedAdministration.vaccine_id}-${selectedAdministration.dose_number}`;

        setAdministeringKey(key);

        router.post(
            `/immunization/patients/${patient.id}/administer`,
            {
                vaccine_id:
                    selectedAdministration.vaccine_id,
                consent_obtained: true,
                consent_given_by: consentGivenBy.trim(),
                injection_site: injectionSite.trim() || null,
                remarks:
                    administrationRemarks.trim() ||
                    null,
            },
            {
                preserveScroll: true,

                onSuccess: () => {
                    setShowProceedModal(false);
                    handleCloseAdministration();
                },

                onError: () => {
                    setShowProceedModal(false);
                },

                onFinish: () => {
                    setAdministeringKey(null);
                },
            },
        );
    };

    // Helper functions and handlers for Multi-Vaccine Clinical Session Administration
    const getTodayDateString = () => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const sessionCandidates = vaccinationOptions.filter(
        (opt) => opt.can_administer
    );

    const getDefaultInjectionSite = (vaccineName: string): string => {
        const lower = vaccineName.toLowerCase();
        if (
            lower.includes('opv') ||
            lower.includes('rotavirus') ||
            lower.includes('oral')
        ) {
            return 'Oral Drops';
        }
        if (lower.includes('penta') || lower.includes('dpt')) {
            return 'Anterolateral Left Thigh (IM)';
        }
        if (lower.includes('pcv') || lower.includes('pneumo')) {
            return 'Anterolateral Right Thigh (IM)';
        }
        if (lower.includes('ipv') || lower.includes('inactivated polio')) {
            return 'Anterolateral Right Thigh (IM)';
        }
        if (lower.includes('measles') || lower.includes('mmr')) {
            return 'Left Deltoid (SC)';
        }
        if (lower.includes('bcg')) {
            return 'Right Deltoid (ID)';
        }
        if (lower.includes('hep') || lower.includes('hepa')) {
            return 'Anterolateral Right Thigh (IM)';
        }
        return 'Anterolateral Left Thigh (IM)';
    };

    const isOralVaccine = (vaccineName: string): boolean => {
        const lower = vaccineName.toLowerCase();
        return (
            lower.includes('opv') ||
            lower.includes('rotavirus') ||
            lower.includes('oral')
        );
    };

    const handleOpenSessionModal = () => {
        const initialConfigs: Record<
            number,
            {
                selected: boolean;
                injection_site: string;
                is_custom_site: boolean;
                remarks: string;
            }
        > = {};

        sessionCandidates.forEach((cand) => {
            initialConfigs[cand.vaccine_id] = {
                selected: true,
                injection_site: getDefaultInjectionSite(cand.vaccine_name),
                is_custom_site: false,
                remarks: '',
            };
        });

        setSessionDoseConfigs(initialConfigs);
        setSessionConsentGivenBy(
            patient.guardian?.name || patient.guardian_name || ''
        );
        setSessionDateAdministered(getTodayDateString());
        setSessionAdministeredBy(
            auth?.user?.id
                ? String(auth.user.id)
                : staffUsers?.[0]?.id
                  ? String(staffUsers[0].id)
                  : ''
        );
        setSessionConsentObtained(false);
        setSessionHealthScreened(true);
        setSessionAllergyChecked(true);
        setSessionFiveRightsVerified(true);
        setSessionRemarks('');
        setShowSessionProceedModal(false);
        setShowSessionModal(true);
    };

    const handleCloseSessionModal = () => {
        if (isSubmittingSession) return;
        setShowSessionModal(false);
        setShowSessionProceedModal(false);
    };

    const toggleSessionVaccine = (vaccineId: number, selected: boolean) => {
        setSessionDoseConfigs((prev) => ({
            ...prev,
            [vaccineId]: {
                ...prev[vaccineId],
                selected,
            },
        }));
    };

    const updateSessionVaccineSite = (
        vaccineId: number,
        site: string,
        isCustom = false
    ) => {
        setSessionDoseConfigs((prev) => ({
            ...prev,
            [vaccineId]: {
                ...prev[vaccineId],
                injection_site: site,
                is_custom_site: isCustom,
            },
        }));
    };

    const updateSessionVaccineRemarks = (
        vaccineId: number,
        remarks: string
    ) => {
        setSessionDoseConfigs((prev) => ({
            ...prev,
            [vaccineId]: {
                ...prev[vaccineId],
                remarks,
            },
        }));
    };

    const selectedSessionCandidates = sessionCandidates.filter(
        (cand) => sessionDoseConfigs[cand.vaccine_id]?.selected
    );

    const isSessionReady =
        sessionConsentObtained &&
        sessionConsentGivenBy.trim().length > 0 &&
        selectedSessionCandidates.length > 0;

    const handleSubmitSession = () => {
        if (!isSessionReady || isSubmittingSession) return;

        setIsSubmittingSession(true);

        const payloadDoses = selectedSessionCandidates.map((cand) => {
            const config = sessionDoseConfigs[cand.vaccine_id];
            return {
                vaccine_id: cand.vaccine_id,
                injection_site: config?.injection_site?.trim() || null,
                vaccine_inventory_id: cand.reserved_batch_id || null,
                remarks: config?.remarks?.trim() || null,
            };
        });

        router.post(
            `/immunization/patients/${patient.id}/administer-session`,
            {
                consent_obtained: true,
                consent_given_by: sessionConsentGivenBy.trim(),
                administered_by: sessionAdministeredBy
                    ? Number(sessionAdministeredBy)
                    : undefined,
                date_administered: sessionDateAdministered || undefined,
                session_remarks: sessionRemarks.trim() || null,
                doses: payloadDoses,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowSessionProceedModal(false);
                    setShowSessionModal(false);
                },
                onError: () => {
                    setShowSessionProceedModal(false);
                },
                onFinish: () => {
                    setIsSubmittingSession(false);
                },
            }
        );
    };

    const handleAssignOptionalVaccine = (
        vaccine: OptionalVaccine,
    ) => {
        if (vaccine.is_assigned) {
            return;
        }

        const confirmed = window.confirm(
            `Add ${vaccine.name} to ${patientName}'s optional vaccines?\n\nThis vaccine will become part of the patient's structured immunization tracking and child immunization record.`,
        );

        if (!confirmed) {
            return;
        }

        setAssigningOptionalVaccineId(vaccine.id);

        router.post(
            `/patients/${patient.id}/optional-vaccines`,
            {
                vaccine_id: vaccine.id,
                notes: null,
            },
            {
                preserveScroll: true,
                preserveState: true,

                onSuccess: () => {
                    setSelectedOptionalVaccineId('');
                },

                onFinish: () => {
                    setAssigningOptionalVaccineId(null);
                },
            },
        );
    };

    const handleRemoveOptionalVaccine = (
        vaccine: OptionalVaccine,
    ) => {
        if (!vaccine.is_assigned || !vaccine.can_remove) {
            return;
        }

        const confirmed = window.confirm(
            `Remove ${vaccine.name} from ${patientName}'s optional vaccines?\n\nIt will no longer appear in this patient's structured immunization tracking or immunization card.`,
        );

        if (!confirmed) {
            return;
        }

        setRemovingOptionalVaccineId(vaccine.id);

        router.delete(
            `/patients/${patient.id}/optional-vaccines/${vaccine.id}`,
            {
                preserveScroll: true,
                preserveState: true,

                onFinish: () => {
                    setRemovingOptionalVaccineId(null);
                },
            },
        );
    };

    const getOptionalVaccineRemovalMessage = (
        vaccine: OptionalVaccine,
    ) => {
        if (vaccine.has_records) {
            return 'Cannot remove because a dose has already been documented.';
        }

        if (vaccine.has_schedules) {
            return 'Cannot remove because a patient vaccine schedule already exists.';
        }

        return null;
    };

    const assignedOptionalVaccines =
        optionalVaccines.filter(
            (vaccine) => vaccine.is_assigned,
        );

    const availableOptionalVaccines =
        optionalVaccines.filter(
            (vaccine) => !vaccine.is_assigned,
        );

    const selectedOptionalVaccine =
        availableOptionalVaccines.find(
            (vaccine) =>
                String(vaccine.id) ===
                selectedOptionalVaccineId,
        ) ?? null;

    const rawHistoryRecords =
        patient.immunization_records ||
        patient.immunizationRecords ||
        [];

    const historyRecords = [...rawHistoryRecords].sort((a, b) => {
        const dateA = a.date_administered ? new Date(a.date_administered).getTime() : 0;
        const dateB = b.date_administered ? new Date(b.date_administered).getTime() : 0;
        if (dateB !== dateA) {
            return dateB - dateA;
        }
        return b.id - a.id;
    });

    const isSelectedOral =
        Boolean(selectedAdministration?.vaccine_name) &&
        (
            selectedAdministration!.vaccine_name.toLowerCase().includes('opv') ||
            selectedAdministration!.vaccine_name.toLowerCase().includes('oral') ||
            selectedAdministration!.vaccine_name.toLowerCase().includes('rotavirus')
        );

    const siteOptions = isSelectedOral
        ? [
              'Oral (Drops)',
              'Anterolateral Right Thigh (IM)',
              'Anterolateral Left Thigh (IM)',
              'Right Deltoid (IM/SC)',
              'Left Deltoid (IM/SC)',
          ]
        : [
              'Anterolateral Right Thigh (IM)',
              'Anterolateral Left Thigh (IM)',
              'Right Deltoid (IM/SC)',
              'Left Deltoid (IM/SC)',
              'Right Deltoid (ID)',
              'Subcutaneous Right Arm',
              'Subcutaneous Left Arm',
              'Oral (Drops)',
          ];

    return (
        <Card>
            <CardHeader className="border-b p-3.5 sm:p-6">
                <div className="flex items-start gap-3">
                    <div className="rounded-lg border p-2 shrink-0">
                        <Syringe className="h-5 w-5" />
                    </div>

                    <div>
                        <CardTitle className="text-base sm:text-lg">
                            Vaccination Management
                        </CardTitle>

                        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                            Review eligible vaccines and
                            record vaccine administration.
                        </p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4 p-3 sm:p-6">
                {flash?.success && (
                    <div className="flex items-start gap-3 rounded-lg border border-green-500/30 bg-green-500/5 p-4">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />

                        <p className="text-sm font-medium text-green-700 dark:text-green-400">
                            {flash.success}
                        </p>
                    </div>
                )}

                {errors?.administration && (
                    <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
                        <p className="text-sm font-medium text-red-600 dark:text-red-400">
                            {errors.administration}
                        </p>
                    </div>
                )}

                {errors?.optional_vaccine && (
                    <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
                        <p className="text-sm font-medium text-red-600 dark:text-red-400">
                            {errors.optional_vaccine}
                        </p>
                    </div>
                )}

                {/* TWO-COLUMN WORKSPACE: LEFT (ELIGIBLE FOR ADMINISTRATION) / RIGHT (ADMINISTRATION HISTORY) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">
                    {/* LEFT COLUMN: VACCINES DUE / ELIGIBLE FOR ADMINISTRATION */}
                    {(() => {
                        const isAllUpcoming = vaccinationOptions.length > 0 && vaccinationOptions.every((opt) => opt.schedule_label === 'Upcoming');
                        const nextSuggestedDate = vaccinationOptions.find((opt) => opt.scheduled_date)?.scheduled_date;

                        return (
                            <div className="rounded-xl border bg-card overflow-hidden shadow-sm flex flex-col">
                                <div className="flex items-center justify-between border-b bg-muted/20 px-3.5 sm:px-5 py-3 sm:py-3.5 flex-wrap gap-2">
                                    <div className="flex items-center gap-2">
                                        <Syringe className="h-4 w-4 text-primary" />
                                        <h3 className="font-semibold text-xs sm:text-sm text-foreground">
                                            {isAllUpcoming ? 'Suggested Next Visit' : 'Eligible for Administration'}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {sessionCandidates.length >= 2 && (
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={handleOpenSessionModal}
                                                className="h-7 text-[11px] px-2.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                                                title="Administer all eligible vaccines together in this clinical encounter"
                                            >
                                                <Layers className="h-3.5 w-3.5 mr-1" />
                                                Session ({sessionCandidates.length})
                                            </Button>
                                        )}
                                        {vaccinationOptions.length > 0 && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleOpenRescheduleModal(nextSuggestedDate)}
                                                className="h-7 text-[11px] px-2.5 font-medium border-primary/30 text-primary hover:bg-primary/10"
                                            >
                                                <CalendarDays className="h-3.5 w-3.5 mr-1" />
                                                Adjust Visit Date
                                            </Button>
                                        )}
                                        <Badge
                                            variant="outline"
                                            className={`text-[11px] sm:text-xs ${
                                                isAllUpcoming
                                                    ? 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400 font-medium'
                                                    : vaccinationOptions.length > 0
                                                        ? 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400 font-medium'
                                                        : 'border-border text-muted-foreground'
                                            }`}
                                        >
                                            {isAllUpcoming
                                                ? 'Suggested Schedule'
                                                : `${vaccinationOptions.length} ${
                                                      vaccinationOptions.length === 1 ? 'Dose Due' : 'Doses Due'
                                                  }`}
                                        </Badge>
                                    </div>
                                </div>

                                {vaccinationOptions.length === 0 ? (
                                    <div className="p-8 text-center flex flex-col items-center justify-center my-auto">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 mb-3">
                                            <CheckCircle2 className="h-6 w-6" />
                                        </div>
                                        <p className="font-semibold text-sm text-foreground">
                                            Up to Date
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                                            No vaccines currently require administration. The patient is up to date for their current age schedule.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {vaccinationOptions.map((option) => {
                                            const key = `${option.vaccine_id}-${option.dose_number}`;
                                            const canAdminister = canShowAdministerButton(option);

                                            return (
                                                <div
                                                    key={key}
                                                    className="p-3 sm:p-4 transition-colors hover:bg-muted/10 flex flex-col gap-2.5 sm:gap-3"
                                                >
                                                    <div className="flex items-start justify-between gap-2.5">
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                                                <span className="font-semibold text-xs sm:text-sm text-foreground">
                                                                    {option.vaccine_name}
                                                                </span>
                                                                <span className="inline-flex items-center rounded border border-primary/20 bg-primary/5 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium text-primary">
                                                                    Dose {option.dose_number} of {option.required_doses}
                                                                </span>
                                                                <div className="inline-flex items-center gap-1.5 flex-wrap">
                                                                    <span
                                                                        className={`text-[10px] sm:text-xs font-semibold ${getPriorityClass(
                                                                            option.schedule_label,
                                                                        )}`}
                                                                    >
                                                                        {option.schedule_label}
                                                                    </span>
                                                                    {option.days_due && option.days_due > 0 && option.schedule_label !== 'Current Age' ? (
                                                                        <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">
                                                                            ({option.days_due} days due)
                                                                        </span>
                                                                    ) : null}
                                                                </div>
                                                            </div>
                                                            <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 capitalize">
                                                                Category: {option.category}
                                                                {option.scheduled_date && (
                                                                    <>
                                                                        {' • Suggested Date: '}
                                                                        <span className="font-medium text-foreground">
                                                                            {formatDate(option.scheduled_date)}
                                                                        </span>
                                                                    </>
                                                                )}
                                                                {option.is_manually_adjusted && (
                                                                    <span className="ml-1.5 inline-flex items-center px-1.5 py-0.2 rounded text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-medium">
                                                                        Adjusted
                                                                    </span>
                                                                )}
                                                            </p>
                                                        </div>

                                                        <div className="flex items-center gap-1.5 shrink-0">
                                                            {canAdminister ? (
                                                                <>
                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        disabled={Boolean(administeringKey)}
                                                                        onClick={() => handleOpenAdministration(option)}
                                                                        className="shrink-0 h-8 text-xs px-2.5 sm:px-3"
                                                                    >
                                                                        <Syringe className="mr-1.5 h-3.5 w-3.5" />
                                                                        Administer
                                                                    </Button>
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => handleOpenRescheduleModal(option.scheduled_date)}
                                                                        className="shrink-0 h-8 text-xs px-2 sm:px-2.5"
                                                                        title="Adjust Visit Date"
                                                                    >
                                                                        <CalendarDays className="h-3.5 w-3.5 text-primary mr-1" />
                                                                        Adjust
                                                                    </Button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="sm"
                                                                        disabled
                                                                        className="shrink-0 h-8 text-[11px] px-2.5 text-muted-foreground bg-muted/40 cursor-not-allowed"
                                                                        title={`Infant must reach eligible age on ${
                                                                            option.eligible_date ? formatDate(option.eligible_date) : 'due date'
                                                                        }`}
                                                                    >
                                                                        <Syringe className="mr-1.5 h-3.5 w-3.5 opacity-50" />
                                                                        Eligible {option.eligible_date ? formatDate(option.eligible_date) : 'Soon'}
                                                                    </Button>
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => handleOpenRescheduleModal(option.scheduled_date)}
                                                                        className="shrink-0 h-8 text-xs px-2 sm:px-2.5"
                                                                        title="Adjust Suggested Visit Date"
                                                                    >
                                                                        <CalendarDays className="h-3.5 w-3.5 text-primary mr-1" />
                                                                        Adjust
                                                                    </Button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                            {/* STOCK & BATCH STATUS */}
                                            <div className="flex items-center justify-between text-xs rounded-md bg-muted/40 px-3 py-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-muted-foreground">Stock:</span>
                                                    {option.inventory_available ? (
                                                        <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                            In Stock ({option.available_stock}{' '}
                                                            {option.available_stock === 1
                                                                ? 'dose'
                                                                : 'doses'}
                                                            )
                                                            {option.reserved_batch_number && (
                                                                <span className="font-mono text-[11px] text-muted-foreground">
                                                                    • Batch: {option.reserved_batch_number}
                                                                </span>
                                                            )}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 font-medium text-destructive">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                                                            Out of Stock
                                                        </span>
                                                    )}
                                                </div>

                                                {option.reserved_batch_expiration_date && (
                                                    <span className="text-muted-foreground text-[11px]">
                                                        Exp: {formatDate(option.reserved_batch_expiration_date)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* OPTIONAL VACCINES (Rendered only if optional vaccines exist in master list) */}
                        {optionalVaccines.length > 0 && (
                            <div className="border-t p-4 bg-muted/10 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Optional Vaccines
                                    </span>
                                    {assignedOptionalVaccines.length > 0 && (
                                        <Badge variant="outline" className="text-[11px]">
                                            {assignedOptionalVaccines.length} assigned
                                        </Badge>
                                    )}
                                </div>

                                {availableOptionalVaccines.length > 0 && (
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <select
                                            className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-xs shadow-sm outline-none"
                                            value={selectedOptionalVaccineId}
                                            disabled={assigningOptionalVaccineId !== null}
                                            onChange={(e) => setSelectedOptionalVaccineId(e.target.value)}
                                        >
                                            <option value="">Select optional vaccine to add</option>
                                            {availableOptionalVaccines.map((vaccine) => (
                                                <option key={vaccine.id} value={String(vaccine.id)}>
                                                    {vaccine.name} — {vaccine.required_doses}{' '}
                                                    {vaccine.required_doses === 1 ? 'dose' : 'doses'}
                                                </option>
                                            ))}
                                        </select>
                                        <Button
                                            type="button"
                                            size="sm"
                                            className="shrink-0 h-9 text-xs"
                                            disabled={
                                                !selectedOptionalVaccine ||
                                                assigningOptionalVaccineId !== null
                                            }
                                            onClick={() => {
                                                if (selectedOptionalVaccine) {
                                                    handleAssignOptionalVaccine(selectedOptionalVaccine);
                                                }
                                            }}
                                        >
                                            {assigningOptionalVaccineId ? 'Adding...' : 'Add Vaccine'}
                                        </Button>
                                    </div>
                                )}

                                {assignedOptionalVaccines.length > 0 && (
                                    <div className="divide-y rounded-md border bg-background text-xs">
                                        {assignedOptionalVaccines.map((vaccine) => (
                                            <div
                                                key={vaccine.id}
                                                className="flex items-center justify-between p-2.5"
                                            >
                                                <div>
                                                    <span className="font-medium text-foreground">
                                                        {vaccine.name}
                                                    </span>
                                                    {getOptionalVaccineRemovalMessage(vaccine) && (
                                                        <p className="text-[11px] text-muted-foreground">
                                                            {getOptionalVaccineRemovalMessage(vaccine)}
                                                        </p>
                                                    )}
                                                </div>
                                                {vaccine.can_remove && (
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-7 px-2 text-[11px] text-destructive hover:text-destructive"
                                                        disabled={removingOptionalVaccineId === vaccine.id}
                                                        onClick={() => handleRemoveOptionalVaccine(vaccine)}
                                                    >
                                                        <X className="mr-1 h-3 w-3" />
                                                        Remove
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })()}

                    {/* RIGHT COLUMN: IMMUNIZATION & ADMINISTRATION HISTORY */}
                    <div className="rounded-xl border bg-card overflow-hidden shadow-sm flex flex-col">
                        <div className="flex items-center justify-between border-b bg-muted/20 px-3.5 sm:px-5 py-3 sm:py-3.5">
                            <div className="flex items-center gap-2">
                                <History className="h-4 w-4 text-primary" />
                                <h3 className="font-semibold text-xs sm:text-sm text-foreground">
                                    Administration History
                                </h3>
                            </div>
                            <Badge variant="outline" className="text-[11px] sm:text-xs">
                                {historyRecords.length} Recorded
                            </Badge>
                        </div>

                        {historyRecords.length === 0 ? (
                            <div className="p-8 text-center flex flex-col items-center justify-center my-auto">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
                                    <History className="h-6 w-6" />
                                </div>
                                <p className="font-semibold text-sm text-foreground">
                                    No Administration History
                                </p>
                                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                                    Vaccines administered to this patient will appear here along with batch lot numbers, injection site, and consent details.
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Mobile View (< md): Stacked card items with 100% data visibility, zero horizontal clipping */}
                                <div className="block md:hidden divide-y divide-border/60">
                                    {historyRecords.map((record) => {
                                        const batchNo =
                                            record.batch_number ||
                                            (typeof record.inventory_transaction === 'object' && record.inventory_transaction !== null
                                                ? record.inventory_transaction.batch_number
                                                : null) ||
                                            (typeof record.inventoryTransaction === 'object' && record.inventoryTransaction !== null
                                                ? record.inventoryTransaction.batch_number
                                                : null) ||
                                            '—';

                                        const vaccinator =
                                            (typeof record.administered_by === 'object' && record.administered_by !== null
                                                ? record.administered_by.name
                                                : null) ||
                                            (typeof record.administeredBy === 'object' && record.administeredBy !== null
                                                ? record.administeredBy.name
                                                : null) ||
                                            'Clinic Staff';

                                        return (
                                            <div key={record.id} className="p-3.5 space-y-2 hover:bg-muted/10 transition-colors">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <span className="font-semibold text-xs text-foreground">
                                                            {record.vaccine?.name ?? 'Vaccine'}
                                                        </span>
                                                        <span className="ml-1.5 inline-flex items-center rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                                                            Dose {record.dose_number}
                                                        </span>
                                                    </div>
                                                    <span className="text-[11px] font-medium text-foreground whitespace-nowrap shrink-0">
                                                        {formatDate(record.date_administered)}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between text-[11px] gap-2">
                                                    <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-muted/70 px-1.5 py-0.5 rounded text-muted-foreground">
                                                        <span>Lot:</span>
                                                        <span className="font-semibold text-foreground">{batchNo}</span>
                                                    </span>
                                                    <span className="text-muted-foreground truncate text-right">
                                                        Site: <span className="text-foreground font-medium">{record.injection_site || '—'}</span>
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40 gap-2">
                                                    <span className="truncate">
                                                        By: <span className="text-foreground font-medium">{vaccinator}</span>
                                                    </span>
                                                    <span className="truncate text-right">
                                                        Consent: <span className="text-foreground font-medium">{record.consent_given_by || '—'}</span>
                                                    </span>
                                                </div>

                                                {record.remarks && (
                                                    <p className="text-[11px] text-muted-foreground italic bg-muted/30 rounded px-2 py-1">
                                                        Note: {record.remarks}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Desktop View (md+): Fluid table */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-xs min-w-[650px]">
                                        <thead className="bg-muted/30 border-b text-muted-foreground font-semibold">
                                            <tr>
                                                <th className="px-3.5 py-2.5 text-left whitespace-nowrap">Date</th>
                                                <th className="px-3.5 py-2.5 text-left whitespace-nowrap">Vaccine & Dose</th>
                                                <th className="px-3.5 py-2.5 text-left whitespace-nowrap">Batch #</th>
                                                <th className="px-3.5 py-2.5 text-left whitespace-nowrap">Site / Route</th>
                                                <th className="px-3.5 py-2.5 text-left whitespace-nowrap">Vaccinator</th>
                                                <th className="px-3.5 py-2.5 text-left whitespace-nowrap">Consent By</th>
                                                <th className="px-3.5 py-2.5 text-left whitespace-nowrap">Remarks</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {historyRecords.map((record) => {
                                                const batchNo =
                                                    record.batch_number ||
                                                    (typeof record.inventory_transaction === 'object' && record.inventory_transaction !== null
                                                        ? record.inventory_transaction.batch_number
                                                        : null) ||
                                                    (typeof record.inventoryTransaction === 'object' && record.inventoryTransaction !== null
                                                        ? record.inventoryTransaction.batch_number
                                                        : null) ||
                                                    '—';

                                                const vaccinator =
                                                    (typeof record.administered_by === 'object' && record.administered_by !== null
                                                        ? record.administered_by.name
                                                        : null) ||
                                                    (typeof record.administeredBy === 'object' && record.administeredBy !== null
                                                        ? record.administeredBy.name
                                                        : null) ||
                                                    'Clinic Staff';

                                                return (
                                                    <tr key={record.id} className="hover:bg-muted/20 transition-colors">
                                                        <td className="px-3.5 py-3 font-medium whitespace-nowrap">
                                                            {formatDate(record.date_administered)}
                                                        </td>
                                                        <td className="px-3.5 py-3 whitespace-nowrap">
                                                            <div className="font-semibold text-foreground">
                                                                {record.vaccine?.name ?? 'Vaccine'}
                                                            </div>
                                                            <div className="text-[11px] text-muted-foreground">
                                                                Dose {record.dose_number}
                                                            </div>
                                                        </td>
                                                        <td className="px-3.5 py-3 font-mono font-medium whitespace-nowrap">
                                                            {batchNo}
                                                        </td>
                                                        <td
                                                            className="px-3.5 py-3 text-muted-foreground max-w-[130px] truncate"
                                                            title={record.injection_site || undefined}
                                                        >
                                                            {record.injection_site || '—'}
                                                        </td>
                                                        <td className="px-3.5 py-3 whitespace-nowrap">
                                                            {vaccinator}
                                                        </td>
                                                        <td className="px-3.5 py-3 text-muted-foreground whitespace-nowrap">
                                                            {record.consent_given_by || '—'}
                                                        </td>
                                                        <td
                                                            className="px-3.5 py-3 text-muted-foreground max-w-[140px] truncate"
                                                            title={record.remarks || undefined}
                                                        >
                                                            {record.remarks || '—'}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* INTERACTIVE CLINICAL ADMINISTRATION MODAL */}
                {selectedAdministration && (
                    <>
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                        <div className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-xl border bg-background shadow-2xl overflow-hidden">
                            {/* MODAL HEADER */}
                            <div className="flex items-start justify-between gap-4 border-b px-5 py-4 bg-muted/20">
                                <div>
                                    <div className="flex items-center gap-2 text-primary">
                                        <Syringe className="h-5 w-5 text-primary" />
                                        <h3 className="text-lg font-semibold text-foreground">
                                            Confirm Vaccine Administration
                                        </h3>
                                    </div>

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Patient: <span className="font-semibold text-foreground">{patientName}</span>
                                        {patient.patient_id ? ` • ID: ${patient.patient_id}` : ''}
                                        {patient.date_of_birth ? ` • DOB: ${formatDate(patient.date_of_birth)}` : ''}
                                    </p>
                                </div>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    disabled={Boolean(administeringKey)}
                                    onClick={handleCloseAdministration}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* MODAL BODY (SCROLLABLE) */}
                            <div className="flex-1 overflow-y-auto space-y-5 p-5 text-sm">
                                {/* DOSE & INVENTORY SUMMARY */}
                                <div className="grid gap-3 sm:grid-cols-3">
                                    <div className="rounded-lg border bg-muted/20 p-3">
                                        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                            Vaccine & Dose
                                        </p>
                                        <p className="mt-1 font-semibold text-sm text-foreground">
                                            {selectedAdministration.vaccine_name}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Dose {selectedAdministration.dose_number} of {selectedAdministration.required_doses}
                                        </p>
                                    </div>

                                    <div className="rounded-lg border bg-muted/20 p-3">
                                        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                            Inventory Batch
                                        </p>
                                        <p className="mt-1 font-mono font-semibold text-sm text-foreground">
                                            {selectedAdministration.reserved_batch_number || 'Next FEFO Batch'}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {selectedAdministration.is_scheduled && selectedAdministration.reserved_batch_expiration_date
                                                ? `Exp: ${formatDate(selectedAdministration.reserved_batch_expiration_date)}`
                                                : `${selectedAdministration.available_stock} doses in stock`}
                                        </p>
                                    </div>

                                    <div className="rounded-lg border bg-muted/20 p-3">
                                        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                            Appointment Status
                                        </p>
                                        <p className="mt-1 font-semibold text-sm text-foreground">
                                            {selectedAdministration.is_scheduled && selectedAdministration.scheduled_date
                                                ? formatDate(selectedAdministration.scheduled_date)
                                                : 'Walk-in / Unscheduled'}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {selectedAdministration.priority_reason || 'Standard Care'}
                                        </p>
                                    </div>
                                </div>

                                {/* SECTION 1: PARENT / GUARDIAN INFORMED CONSENT */}
                                <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 space-y-3">
                                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                                        <ShieldCheck className="h-5 w-5" />
                                        <h4 className="font-semibold text-sm">
                                            1. Parent / Guardian Informed Consent
                                        </h4>
                                    </div>

                                    <div className="flex items-start space-x-2.5 pt-1">
                                        <Checkbox
                                            id="consent-checkbox"
                                            checked={consentObtained}
                                            onCheckedChange={(checked) => setConsentObtained(Boolean(checked))}
                                            disabled={Boolean(administeringKey)}
                                        />
                                        <div className="grid gap-1 leading-none">
                                            <label
                                                htmlFor="consent-checkbox"
                                                className="text-xs font-medium leading-normal cursor-pointer select-none text-foreground"
                                            >
                                                Informed Consent Verified and Granted <span className="text-destructive">*</span>
                                            </label>
                                            <p className="text-[11px] text-muted-foreground leading-normal">
                                                I confirm that the parent/guardian or authorized representative was informed about the vaccine purpose, expected benefits, and possible mild adverse reactions, and has granted consent.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 pt-1">
                                        <Label htmlFor="consent-given-by" className="text-xs font-medium">
                                            Consent Given By (Name of Parent / Guardian / Caregiver) <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="consent-given-by"
                                            type="text"
                                            value={consentGivenBy}
                                            onChange={(e) => setConsentGivenBy(e.target.value)}
                                            placeholder="e.g. Maria Santos (Mother)"
                                            className="h-9 text-xs bg-background"
                                            disabled={Boolean(administeringKey)}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* SECTION 2: PRE-VACCINATION CLINICAL SAFETY SCREENING */}
                                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
                                    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400">
                                        <CheckCircle2 className="h-5 w-5" />
                                        <h4 className="font-semibold text-sm">
                                            2. Pre-Vaccination Clinical Safety Checklist
                                        </h4>
                                    </div>

                                    <div className="space-y-2.5 pt-1">
                                        <div className="flex items-start space-x-2.5">
                                            <Checkbox
                                                id="health-screened"
                                                checked={healthScreened}
                                                onCheckedChange={(checked) => setHealthScreened(Boolean(checked))}
                                                disabled={Boolean(administeringKey)}
                                            />
                                            <div className="grid gap-0.5 leading-none">
                                                <label
                                                    htmlFor="health-screened"
                                                    className="text-xs font-medium leading-normal cursor-pointer select-none text-foreground"
                                                >
                                                    Health Assessment Cleared
                                                </label>
                                                <p className="text-[11px] text-muted-foreground">
                                                    Child has been physically evaluated today with no acute high fever, moderate-to-severe illness, or active contraindications.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start space-x-2.5">
                                            <Checkbox
                                                id="allergy-checked"
                                                checked={allergyChecked}
                                                onCheckedChange={(checked) => setAllergyChecked(Boolean(checked))}
                                                disabled={Boolean(administeringKey)}
                                            />
                                            <div className="grid gap-0.5 leading-none">
                                                <label
                                                    htmlFor="allergy-checked"
                                                    className="text-xs font-medium leading-normal cursor-pointer select-none text-foreground"
                                                >
                                                    Allergy & Adverse Reaction Check
                                                </label>
                                                <p className="text-[11px] text-muted-foreground">
                                                    Verified no prior severe anaphylactic or hypersensitivity reaction to previous doses of this vaccine or vaccine components.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start space-x-2.5">
                                            <Checkbox
                                                id="five-rights"
                                                checked={fiveRightsVerified}
                                                onCheckedChange={(checked) => setFiveRightsVerified(Boolean(checked))}
                                                disabled={Boolean(administeringKey)}
                                            />
                                            <div className="grid gap-0.5 leading-none">
                                                <label
                                                    htmlFor="five-rights"
                                                    className="text-xs font-medium leading-normal cursor-pointer select-none text-foreground"
                                                >
                                                    Five Rights of Medication Verified
                                                </label>
                                                <p className="text-[11px] text-muted-foreground">
                                                    Right Patient, Right Vaccine, Right Dose Number, Right Route, and Right Time (batch not expired and cold chain maintained).
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 3: ADMINISTRATION DETAILS & REMARKS */}
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="injection-site-select" className="text-xs font-medium">
                                                Injection Site & Route
                                            </Label>
                                            <span className="text-[10px] text-muted-foreground">Optional</span>
                                        </div>

                                        <select
                                            id="injection-site-select"
                                            value={isCustomSite ? '__custom__' : injectionSite}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === '__custom__') {
                                                    setIsCustomSite(true);
                                                    setInjectionSite('');
                                                } else {
                                                    setIsCustomSite(false);
                                                    setInjectionSite(val);
                                                }
                                            }}
                                            className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs text-foreground shadow-xs outline-none focus:border-primary focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                            disabled={Boolean(administeringKey)}
                                        >
                                            <option value="">Select site &amp; route...</option>
                                            {siteOptions.map((opt) => (
                                                <option key={opt} value={opt}>
                                                    {opt}
                                                </option>
                                            ))}
                                            <option value="__custom__">Other / Custom Site...</option>
                                        </select>

                                        {isCustomSite && (
                                            <Input
                                                id="custom-injection-site-input"
                                                type="text"
                                                placeholder="Type custom administration site / route..."
                                                value={injectionSite}
                                                onChange={(e) => setInjectionSite(e.target.value)}
                                                className="h-8 text-xs bg-background mt-1.5"
                                                disabled={Boolean(administeringKey)}
                                                autoFocus
                                            />
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="administration-remarks" className="text-xs font-medium">
                                            Clinical Remarks / Observations (Optional)
                                        </Label>
                                        <Input
                                            id="administration-remarks"
                                            type="text"
                                            value={administrationRemarks}
                                            maxLength={1000}
                                            placeholder="e.g. Child calm, advised on fever monitoring"
                                            className="h-9 text-xs"
                                            disabled={Boolean(administeringKey)}
                                            onChange={(e) => setAdministrationRemarks(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* INVENTORY & AUDIT NOTICE */}
                                <div className="rounded-lg border border-dashed bg-muted/20 px-3.5 py-2.5 text-xs text-muted-foreground">
                                    <p>
                                        Confirming will create the official immunization record, log an archival reduction of 1 dose in the transaction ledger, and fulfill the appointment.
                                    </p>
                                </div>
                            </div>

                            {/* MODAL FOOTER */}
                            <div className="flex flex-col-reverse gap-2 border-t px-5 py-3.5 bg-muted/20 sm:flex-row sm:justify-between sm:items-center">
                                <div className="text-xs text-muted-foreground">
                                    {!isAdministrationReady && (
                                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                                            * Informed consent and caregiver name required to proceed
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-9 sm:h-8 text-xs w-full sm:w-auto"
                                        disabled={Boolean(administeringKey)}
                                        onClick={handleCloseAdministration}
                                    >
                                        Cancel
                                    </Button>

                                    <Button
                                        type="button"
                                        size="sm"
                                        className="h-9 sm:h-8 text-xs w-full sm:w-auto font-medium"
                                        disabled={!isAdministrationReady || Boolean(administeringKey)}
                                        onClick={() => setShowProceedModal(true)}
                                    >
                                        <Syringe className="mr-1.5 h-4 w-4" />
                                        {administeringKey ? 'Recording...' : 'Confirm & Administer Dose'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CONFIRMATION POPUP MODAL: "Proceed administering?" */}
                    {showProceedModal && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 animate-in fade-in duration-150">
                            <div className="w-full max-w-md rounded-xl border bg-background shadow-2xl overflow-hidden flex flex-col">
                                {/* Header */}
                                <div className="flex items-start justify-between gap-3 border-b px-5 py-4 bg-muted/20">
                                    <div className="flex items-center gap-2.5 text-primary">
                                        <div className="rounded-full bg-primary/10 p-2 text-primary shrink-0">
                                            <Syringe className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-base sm:text-lg font-bold text-foreground">
                                                Proceed administering?
                                            </h3>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                Please review the summary details below before finalizing.
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        disabled={Boolean(administeringKey)}
                                        onClick={() => setShowProceedModal(false)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Body: 5 bits of details */}
                                <div className="p-5 space-y-3.5 text-xs sm:text-sm">
                                    <div className="rounded-lg border bg-card divide-y divide-border/60 overflow-hidden shadow-sm">
                                        {/* 1. Administered by */}
                                        <div className="p-3 flex items-start gap-3 bg-muted/10">
                                            <UserCheck className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                            <div className="min-w-0 flex-1">
                                                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                                                    Administered by:
                                                </span>
                                                <span className="font-semibold text-foreground text-sm">
                                                    {auth?.user?.name || 'Clinic Staff'}
                                                </span>
                                                {auth?.user?.role && (
                                                    <span className="text-muted-foreground text-xs ml-1.5">
                                                        ({auth.user.role})
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* 2. Vaccine batch deducted from */}
                                        <div className="p-3 flex items-start gap-3 bg-primary/5">
                                            <Package className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                            <div className="min-w-0 flex-1">
                                                <span className="text-[11px] font-semibold uppercase tracking-wider text-primary block">
                                                    Vaccine batch deducted from:
                                                </span>
                                                <span className="font-mono font-bold text-foreground text-sm">
                                                    {selectedAdministration.reserved_batch_number || 'Next FEFO Batch'}
                                                </span>
                                                {selectedAdministration.reserved_batch_expiration_date && (
                                                    <div className="text-xs text-muted-foreground mt-0.5">
                                                        Exp: {formatDate(selectedAdministration.reserved_batch_expiration_date)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* 3. Date */}
                                        <div className="p-3 flex items-start gap-3 bg-muted/10">
                                            <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                            <div className="min-w-0 flex-1">
                                                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                                                    Date:
                                                </span>
                                                <span className="font-semibold text-foreground text-sm">
                                                    {new Date().toLocaleDateString('en-US', {
                                                        month: 'long',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    })}
                                                </span>
                                            </div>
                                        </div>

                                        {/* 4. Vaccine type */}
                                        <div className="p-3 flex items-start gap-3">
                                            <Syringe className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                            <div className="min-w-0 flex-1">
                                                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                                                    Vaccine type:
                                                </span>
                                                <span className="font-semibold text-foreground text-sm">
                                                    {selectedAdministration.vaccine_name}
                                                </span>
                                                <span className="text-muted-foreground text-xs block mt-0.5">
                                                    Dose {selectedAdministration.dose_number} of {selectedAdministration.required_doses} ({selectedAdministration.category})
                                                </span>
                                            </div>
                                        </div>

                                        {/* 5. Area of vaccination */}
                                        <div className="p-3 flex items-start gap-3 bg-blue-500/5">
                                            <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                            <div className="min-w-0 flex-1">
                                                <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300 block">
                                                    Area of vaccination:
                                                </span>
                                                <span className="font-semibold text-foreground text-sm">
                                                    {injectionSite.trim() || 'Not specified (Optional)'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                                        <span>Patient: <strong className="text-foreground">{patientName}</strong></span>
                                        <span>Consent: <strong className="text-foreground">{consentGivenBy}</strong></span>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-end gap-2 border-t px-5 py-3.5 bg-muted/20">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-9 text-xs"
                                        disabled={Boolean(administeringKey)}
                                        onClick={() => setShowProceedModal(false)}
                                    >
                                        Cancel
                                    </Button>

                                    <Button
                                        type="button"
                                        size="sm"
                                        className="h-9 text-xs font-semibold"
                                        disabled={Boolean(administeringKey)}
                                        onClick={handleSubmitAdministration}
                                    >
                                        <Syringe className="mr-1.5 h-4 w-4" />
                                        {administeringKey ? 'Administering...' : 'Proceed'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* RESCHEDULE / ADJUST SUGGESTED VISIT DATE MODAL */}
            {showRescheduleModal && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 animate-in fade-in duration-150">
                            <div className="w-full max-w-md rounded-xl border bg-background shadow-2xl overflow-hidden flex flex-col">
                                <div className="flex items-start justify-between gap-3 border-b px-5 py-4 bg-muted/20">
                                    <div className="flex items-center gap-2.5 text-primary">
                                        <div className="rounded-full bg-primary/10 p-2 text-primary shrink-0">
                                            <CalendarDays className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-base sm:text-lg font-bold text-foreground">
                                                Adjust Suggested Visit Date
                                            </h3>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                Customize the suggested appointment date for {patientName}.
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        disabled={isRescheduling}
                                        onClick={() => setShowRescheduleModal(false)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>

                                <form onSubmit={handleSaveReschedule} className="p-5 space-y-4">
                                    <div className="rounded-lg border bg-muted/20 p-3 text-xs space-y-1">
                                        <div className="flex items-center gap-1.5 font-semibold text-foreground">
                                            <Building2 className="h-3.5 w-3.5 text-primary" />
                                            <span>Barangay Bugo Health Center Clinic Policy:</span>
                                        </div>
                                        <p className="text-muted-foreground">
                                            Routine pediatric immunization is conducted every <strong>Wednesday (8:00 AM – 11:30 AM)</strong> at Zone 2. Visit dates must be scheduled on a Wednesday.
                                        </p>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="reschedule-date" className="text-xs font-semibold">
                                            Scheduled Visit Date (Wednesday) <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="reschedule-date"
                                            type="date"
                                            min={new Date().toISOString().split('T')[0]}
                                            value={rescheduleDate}
                                            onChange={(e) => setRescheduleDate(e.target.value)}
                                            required
                                            className={`text-xs sm:text-sm ${
                                                rescheduleDate && !isWednesday(rescheduleDate)
                                                    ? 'border-amber-500 focus-visible:ring-amber-500'
                                                    : ''
                                            }`}
                                        />
                                        {rescheduleDate && !isWednesday(rescheduleDate) && (
                                            <div className="flex items-center justify-between gap-2 p-2 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs">
                                                <span>Selected date is not a Wednesday.</span>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-6 text-[11px] px-2 border-amber-500/30 text-amber-800 dark:text-amber-300"
                                                    onClick={() => setRescheduleDate(getNearestWednesday(rescheduleDate))}
                                                >
                                                    Snap to Wednesday
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="reschedule-reason" className="text-xs font-semibold">
                                            Reason for Adjustment (Optional)
                                        </Label>
                                        <Input
                                            id="reschedule-reason"
                                            type="text"
                                            placeholder="e.g., Parent requested different clinic Wednesday"
                                            value={rescheduleReason}
                                            onChange={(e) => setRescheduleReason(e.target.value)}
                                            maxLength={255}
                                            className="text-xs sm:text-sm"
                                        />
                                    </div>

                                    <div className="flex items-center justify-end gap-2 pt-2 border-t">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={isRescheduling}
                                            onClick={() => setShowRescheduleModal(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            size="sm"
                                            disabled={isRescheduling || !rescheduleDate || !isWednesday(rescheduleDate)}
                                        >
                                            {isRescheduling ? 'Saving...' : 'Save Suggested Date'}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

            {/* MULTI-VACCINE CLINICAL SESSION ADMINISTRATION MODAL */}
            {showSessionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 animate-in fade-in duration-150">
                    <div className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl border bg-background shadow-2xl overflow-hidden">
                        {/* MODAL HEADER */}
                        <div className="flex items-start justify-between gap-4 border-b px-5 py-4 bg-muted/20">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-600 dark:text-emerald-400 shrink-0 border border-emerald-500/20">
                                    <Layers className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-base sm:text-lg font-bold text-foreground">
                                            Clinical Session Administration
                                        </h3>
                                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                                            Multi-Vaccine Encounter
                                        </span>
                                    </div>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        Patient: <span className="font-semibold text-foreground">{patientName}</span>
                                        {patient.patient_id ? ` • ID: ${patient.patient_id}` : ''}
                                        {patient.date_of_birth ? ` • DOB: ${formatDate(patient.date_of_birth)}` : ''}
                                    </p>
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                disabled={isSubmittingSession}
                                onClick={handleCloseSessionModal}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* MODAL BODY (SCROLLABLE) */}
                        <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-5 p-4 sm:p-6 text-sm">
                            {/* SHARED ENCOUNTER DETAILS */}
                            <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
                                <div className="flex items-center gap-2 text-foreground font-semibold text-xs uppercase tracking-wider">
                                    <UserCheck className="h-4 w-4 text-primary" />
                                    <span>Clinical Encounter Details</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="session-admin-by" className="text-xs font-medium">
                                            Administered By
                                        </Label>
                                        <select
                                            id="session-admin-by"
                                            value={sessionAdministeredBy}
                                            onChange={(e) => setSessionAdministeredBy(e.target.value)}
                                            className="w-full text-xs h-9 rounded-md border border-input bg-background px-2.5 text-foreground shadow-xs outline-none focus:border-primary focus:ring-1 focus:ring-ring"
                                            disabled={isSubmittingSession}
                                        >
                                            {staffUsers && staffUsers.length > 0 ? (
                                                staffUsers.map((staff) => (
                                                    <option key={staff.id} value={staff.id}>
                                                        {staff.name} ({staff.role})
                                                    </option>
                                                ))
                                            ) : auth?.user ? (
                                                <option value={auth.user.id}>
                                                    {auth.user.name} ({auth.user.role || 'Staff'})
                                                </option>
                                            ) : (
                                                <option value="">Health Center Staff</option>
                                            )}
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="session-date-admin" className="text-xs font-medium">
                                            Date Administered
                                        </Label>
                                        <Input
                                            id="session-date-admin"
                                            type="date"
                                            max={getTodayDateString()}
                                            min={patient.date_of_birth ? patient.date_of_birth.split('T')[0] : undefined}
                                            value={sessionDateAdministered}
                                            onChange={(e) => setSessionDateAdministered(e.target.value)}
                                            className="h-9 text-xs bg-background"
                                            disabled={isSubmittingSession}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="session-consent-given" className="text-xs font-medium">
                                            Consent Given By <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="session-consent-given"
                                            type="text"
                                            placeholder="e.g. Maria Santos (Mother)"
                                            value={sessionConsentGivenBy}
                                            onChange={(e) => setSessionConsentGivenBy(e.target.value)}
                                            className="h-9 text-xs bg-background"
                                            disabled={isSubmittingSession}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 1: PARENT / GUARDIAN INFORMED CONSENT & SAFETY CHECKLIST */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* Informed Consent */}
                                <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-3.5 space-y-2">
                                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                                        <ShieldCheck className="h-4 w-4 shrink-0" />
                                        <h4 className="font-semibold text-xs sm:text-sm">
                                            Informed Consent Verified
                                        </h4>
                                    </div>

                                    <div className="flex items-start space-x-2 pt-1">
                                        <Checkbox
                                            id="session-consent-cb"
                                            checked={sessionConsentObtained}
                                            onCheckedChange={(checked) => setSessionConsentObtained(Boolean(checked))}
                                            disabled={isSubmittingSession}
                                        />
                                        <div className="grid gap-1 leading-none">
                                            <label
                                                htmlFor="session-consent-cb"
                                                className="text-xs font-medium leading-normal cursor-pointer select-none text-foreground"
                                            >
                                                Consent Granted for Session <span className="text-destructive">*</span>
                                            </label>
                                            <p className="text-[11px] text-muted-foreground leading-tight">
                                                Caregiver informed of session vaccines, benefits, and possible mild reactions.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Clinical Checklist */}
                                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 space-y-2">
                                    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400">
                                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                                        <h4 className="font-semibold text-xs sm:text-sm">
                                            Pre-Vaccination Safety Screen
                                        </h4>
                                    </div>

                                    <div className="space-y-1.5 pt-1 text-xs">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="session-health-screen"
                                                checked={sessionHealthScreened}
                                                onCheckedChange={(c) => setSessionHealthScreened(Boolean(c))}
                                                disabled={isSubmittingSession}
                                            />
                                            <label htmlFor="session-health-screen" className="text-[11px] font-medium cursor-pointer">
                                                Health assessment cleared (no acute fever)
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="session-allergy-check"
                                                checked={sessionAllergyChecked}
                                                onCheckedChange={(c) => setSessionAllergyChecked(Boolean(c))}
                                                disabled={isSubmittingSession}
                                            />
                                            <label htmlFor="session-allergy-check" className="text-[11px] font-medium cursor-pointer">
                                                No known severe allergic history
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="session-five-rights"
                                                checked={sessionFiveRightsVerified}
                                                onCheckedChange={(c) => setSessionFiveRightsVerified(Boolean(c))}
                                                disabled={isSubmittingSession}
                                            />
                                            <label htmlFor="session-five-rights" className="text-[11px] font-medium cursor-pointer">
                                                5 Rights &amp; Cold Chain Verified
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 2: VACCINE DOSES CHECKLIST & ANATOMICAL INJECTION SITES */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div className="flex items-center gap-2">
                                        <Syringe className="h-4 w-4 text-primary" />
                                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Select Vaccines to Administer &amp; Injection Sites
                                        </span>
                                    </div>
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                        {selectedSessionCandidates.length} of {sessionCandidates.length} Selected
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {sessionCandidates.map((option) => {
                                        const config = sessionDoseConfigs[option.vaccine_id] || {
                                            selected: true,
                                            injection_site: getDefaultInjectionSite(option.vaccine_name),
                                            is_custom_site: false,
                                            remarks: '',
                                        };
                                        const isSelected = config.selected;
                                        const isOral = isOralVaccine(option.vaccine_name);

                                        return (
                                            <div
                                                key={option.vaccine_id}
                                                className={`border rounded-xl p-3.5 space-y-3 transition ${
                                                    isSelected
                                                        ? 'bg-card border-border shadow-xs'
                                                        : 'opacity-50 bg-muted/20 border-dashed'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <label className="flex items-start gap-2.5 cursor-pointer select-none min-w-0">
                                                        <Checkbox
                                                            checked={isSelected}
                                                            onCheckedChange={(checked) =>
                                                                toggleSessionVaccine(option.vaccine_id, Boolean(checked))
                                                            }
                                                            disabled={isSubmittingSession}
                                                            className="mt-0.5"
                                                        />
                                                        <div>
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="font-bold text-xs sm:text-sm text-foreground">
                                                                    {option.vaccine_name}
                                                                </span>
                                                                <span className="inline-flex items-center rounded border border-primary/20 bg-primary/5 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                                                                    Dose {option.dose_number} of {option.required_doses}
                                                                </span>
                                                                <span className={`text-[10px] font-semibold ${getPriorityClass(option.schedule_label)}`}>
                                                                    {option.schedule_label}
                                                                </span>
                                                            </div>
                                                            <p className="text-[11px] text-muted-foreground mt-0.5 capitalize">
                                                                Category: {option.category}
                                                            </p>
                                                        </div>
                                                    </label>

                                                    <div className="text-right shrink-0">
                                                        {option.reserved_batch_number ? (
                                                            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-muted text-foreground border">
                                                                Batch: {option.reserved_batch_number}
                                                            </span>
                                                        ) : (
                                                            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                                                In Stock ({option.available_stock} doses)
                                                            </span>
                                                        )}
                                                        {option.reserved_batch_expiration_date && (
                                                            <span className="block text-[10px] text-muted-foreground mt-0.5">
                                                                Exp: {formatDate(option.reserved_batch_expiration_date)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* ROUTE & SITE CONTROLS */}
                                                {isSelected && (
                                                    <div className="pt-2.5 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                                                        <span className="font-medium text-muted-foreground shrink-0">
                                                            {isOral ? 'Administration Route:' : 'Injection Site:'}
                                                        </span>

                                                        {isOral ? (
                                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold text-xs border border-emerald-500/20">
                                                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                                                Oral Drops (Liquid)
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-wrap items-center gap-1.5">
                                                                {[
                                                                    { label: 'Left Thigh (IM)', value: 'Anterolateral Left Thigh (IM)' },
                                                                    { label: 'Right Thigh (IM)', value: 'Anterolateral Right Thigh (IM)' },
                                                                    { label: 'Left Deltoid', value: 'Left Deltoid (IM/SC)' },
                                                                    { label: 'Right Deltoid', value: 'Right Deltoid (ID)' },
                                                                ].map((site) => {
                                                                    const isActive = config.injection_site === site.value && !config.is_custom_site;
                                                                    return (
                                                                        <button
                                                                            key={site.value}
                                                                            type="button"
                                                                            disabled={isSubmittingSession}
                                                                            onClick={() => updateSessionVaccineSite(option.vaccine_id, site.value, false)}
                                                                            className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition ${
                                                                                isActive
                                                                                    ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                                                                                    : 'bg-background hover:bg-muted text-foreground border-input'
                                                                            }`}
                                                                        >
                                                                            {site.label}
                                                                        </button>
                                                                    );
                                                                })}

                                                                <button
                                                                    type="button"
                                                                    disabled={isSubmittingSession}
                                                                    onClick={() =>
                                                                        updateSessionVaccineSite(
                                                                            option.vaccine_id,
                                                                            config.is_custom_site ? config.injection_site : '',
                                                                            true
                                                                        )
                                                                    }
                                                                    className={`px-2 py-1 rounded-md text-[11px] font-medium border transition ${
                                                                        config.is_custom_site
                                                                            ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                                                                            : 'bg-background hover:bg-muted text-foreground border-input'
                                                                    }`}
                                                                >
                                                                    Custom...
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {isSelected && config.is_custom_site && !isOral && (
                                                    <Input
                                                        type="text"
                                                        placeholder="Specify custom injection site / route..."
                                                        value={config.injection_site}
                                                        onChange={(e) =>
                                                            updateSessionVaccineSite(option.vaccine_id, e.target.value, true)
                                                        }
                                                        className="h-8 text-xs bg-background mt-1"
                                                        disabled={isSubmittingSession}
                                                        autoFocus
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* SECTION 3: GENERAL SESSION REMARKS */}
                            <div className="space-y-1.5">
                                <Label htmlFor="session-general-remarks" className="text-xs font-semibold">
                                    Session Remarks (Optional)
                                </Label>
                                <Input
                                    id="session-general-remarks"
                                    type="text"
                                    placeholder="e.g. Well-tolerated, no acute distress observed during post-vaccination observation"
                                    value={sessionRemarks}
                                    onChange={(e) => setSessionRemarks(e.target.value)}
                                    maxLength={1000}
                                    className="h-9 text-xs"
                                    disabled={isSubmittingSession}
                                />
                            </div>

                            {/* INVENTORY & UNIFIED NOTIFICATION NOTICE */}
                            <div className="rounded-xl border border-dashed bg-muted/20 p-3.5 text-xs text-muted-foreground space-y-1">
                                <div className="font-semibold text-foreground flex items-center gap-1.5">
                                    <Package className="h-3.5 w-3.5 text-primary" />
                                    <span>Atomic Record &amp; Consolidated Notification</span>
                                </div>
                                <p>
                                    Confirming records all selected doses in a single transaction, deducts batches, and sends a single consolidated next-visit notification to the guardian.
                                </p>
                            </div>
                        </div>

                        {/* MODAL FOOTER */}
                        <div className="flex flex-col-reverse gap-2 border-t px-5 py-3.5 bg-muted/20 sm:flex-row sm:justify-between sm:items-center">
                            <div className="text-xs text-muted-foreground">
                                {!isSessionReady && (
                                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                                        * Informed consent, caregiver name, and at least 1 dose required
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-9 text-xs"
                                    disabled={isSubmittingSession}
                                    onClick={handleCloseSessionModal}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    type="button"
                                    size="sm"
                                    className="h-9 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                                    disabled={!isSessionReady || isSubmittingSession}
                                    onClick={() => setShowSessionProceedModal(true)}
                                >
                                    <Syringe className="mr-1.5 h-4 w-4" />
                                    Record All {selectedSessionCandidates.length} Doses
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CONFIRMATION POPUP MODAL FOR SESSION: "Proceed with Session Administration?" */}
            {showSessionProceedModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4 animate-in fade-in duration-150">
                    <div className="w-full max-w-lg rounded-xl border bg-background shadow-2xl overflow-hidden flex flex-col">
                        <div className="flex items-start justify-between gap-3 border-b px-5 py-4 bg-muted/20">
                            <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400">
                                <div className="rounded-full bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400 shrink-0">
                                    <Layers className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-base sm:text-lg font-bold text-foreground">
                                        Proceed with Session Administration?
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Please review the session summary before recording into the health record.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-2 text-xs border rounded-lg p-3 bg-muted/10">
                                <div>
                                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Patient</span>
                                    <strong className="text-foreground text-xs">{patientName}</strong>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Consent By</span>
                                    <strong className="text-foreground text-xs">{sessionConsentGivenBy}</strong>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Administered By</span>
                                    <strong className="text-foreground text-xs">
                                        {staffUsers?.find((s) => String(s.id) === String(sessionAdministeredBy))?.name ||
                                            auth?.user?.name ||
                                            'Health Center Staff'}
                                    </strong>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Date</span>
                                    <strong className="text-foreground text-xs">{sessionDateAdministered}</strong>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <span className="font-semibold text-xs text-foreground block">
                                    Vaccines to be Administered ({selectedSessionCandidates.length}):
                                </span>
                                <div className="border rounded-lg divide-y bg-card overflow-hidden">
                                    {selectedSessionCandidates.map((cand) => {
                                        const config = sessionDoseConfigs[cand.vaccine_id];
                                        return (
                                            <div key={cand.vaccine_id} className="p-2.5 flex items-center justify-between text-xs">
                                                <div>
                                                    <strong className="text-foreground">{cand.vaccine_name}</strong>
                                                    <span className="text-muted-foreground ml-1.5">
                                                        (Dose {cand.dose_number} of {cand.required_doses})
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-medium text-primary text-[11px] block">
                                                        {config?.injection_site || 'Standard Site'}
                                                    </span>
                                                    {cand.reserved_batch_number && (
                                                        <span className="font-mono text-[10px] text-muted-foreground">
                                                            {cand.reserved_batch_number}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-[11px] text-emerald-800 dark:text-emerald-300">
                                A single consolidated next-visit notification will be sent to the guardian user, and routine milestone schedules will be recalculated automatically.
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 border-t px-5 py-3.5 bg-muted/20">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-9 text-xs"
                                disabled={isSubmittingSession}
                                onClick={() => setShowSessionProceedModal(false)}
                            >
                                Back to Edit
                            </Button>

                            <Button
                                type="button"
                                size="sm"
                                className="h-9 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                                disabled={isSubmittingSession}
                                onClick={handleSubmitSession}
                            >
                                <Syringe className="mr-1.5 h-4 w-4" />
                                {isSubmittingSession ? 'Recording Session...' : 'Confirm & Record All Doses'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            </CardContent>
        </Card>
    );
}
