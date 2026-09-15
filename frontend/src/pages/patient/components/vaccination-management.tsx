import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { router } from '@inertiajs/react';
import {
    CalendarDays,
    CheckCircle2,
    Syringe,
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

type VaccinationManagementProps = {
    patient: {
        id: number;
        status: string;
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
};

export default function VaccinationManagement({
    patient,
    patientName,
    vaccinationOptions,
    optionalVaccines,
    flash,
    errors,
}: VaccinationManagementProps) {
    const [administeringKey, setAdministeringKey] =
        useState<string | null>(null);

    const [selectedAdministration, setSelectedAdministration] =
        useState<VaccinationOption | null>(null);

    const [administrationRemarks, setAdministrationRemarks] =
        useState('');

    const [assigningOptionalVaccineId, setAssigningOptionalVaccineId] =
        useState<number | null>(null);

    const [removingOptionalVaccineId, setRemovingOptionalVaccineId] =
        useState<number | null>(null);

    const [selectedOptionalVaccineId, setSelectedOptionalVaccineId] =
        useState('');

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

        return 'text-muted-foreground';
    };

    const getVaccinationStatus = (
        option: VaccinationOption,
    ) => {
        if (patient.status !== 'Active') {
            return {
                text: 'Patient inactive',
                className:
                    'text-muted-foreground',
            };
        }

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
        if (patient.status !== 'Active') {
            return false;
        }

        return option.can_administer;
    };

    const handleOpenAdministration = (
        option: VaccinationOption,
    ) => {
        if (!canShowAdministerButton(option)) {
            return;
        }

        setSelectedAdministration(option);
        setAdministrationRemarks('');
    };

    const handleCloseAdministration = () => {
        if (administeringKey) {
            return;
        }

        setSelectedAdministration(null);
        setAdministrationRemarks('');
    };

    const handleSubmitAdministration = () => {
        if (!selectedAdministration || administeringKey) {
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
                remarks:
                    administrationRemarks.trim() ||
                    null,
            },
            {
                preserveScroll: true,

                onSuccess: () => {
                    setSelectedAdministration(null);
                    setAdministrationRemarks('');
                },

                onFinish: () => {
                    setAdministeringKey(null);
                },
            },
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

    return (
        <Card>
            <CardHeader className="border-b">
                <div className="flex items-start gap-3">
                    <div className="rounded-lg border p-2">
                        <Syringe className="h-5 w-5" />
                    </div>

                    <div>
                        <CardTitle>
                            Vaccination Management
                        </CardTitle>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Review eligible vaccines and
                            record vaccine administration.
                        </p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-6">
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

                <div className="rounded-xl border">
                    <div className="flex flex-col gap-2 border-b bg-muted/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="font-semibold">
                                Optional Vaccines
                            </h3>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Add an optional vaccine to this patient's
                                structured immunization tracking.
                            </p>
                        </div>

                        {assignedOptionalVaccines.length > 0 && (
                            <Badge
                                variant="outline"
                                className="w-fit"
                            >
                                {assignedOptionalVaccines.length}{' '}
                                assigned
                            </Badge>
                        )}
                    </div>

                    <div className="space-y-4 p-4">
                        {availableOptionalVaccines.length > 0 ? (
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <select
                                    className="h-10 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={selectedOptionalVaccineId}
                                    disabled={assigningOptionalVaccineId !== null}
                                    onChange={(event) =>
                                        setSelectedOptionalVaccineId(
                                            event.target.value,
                                        )
                                    }
                                >
                                    <option value="">
                                        Select an optional vaccine
                                    </option>

                                    {availableOptionalVaccines.map(
                                        (vaccine) => (
                                            <option
                                                key={vaccine.id}
                                                value={String(
                                                    vaccine.id,
                                                )}
                                            >
                                                {vaccine.name} —{' '}
                                                {vaccine.required_doses}{' '}
                                                {vaccine.required_doses === 1
                                                    ? 'dose'
                                                    : 'doses'}
                                            </option>
                                        ),
                                    )}
                                </select>

                                <Button
                                    type="button"
                                    className="shrink-0"
                                    disabled={
                                        !selectedOptionalVaccine ||
                                        assigningOptionalVaccineId !== null
                                    }
                                    onClick={() => {
                                        if (
                                            selectedOptionalVaccine
                                        ) {
                                            handleAssignOptionalVaccine(
                                                selectedOptionalVaccine,
                                            );
                                        }
                                    }}
                                >
                                    <Syringe className="mr-2 h-4 w-4" />

                                    {assigningOptionalVaccineId
                                        ? 'Adding...'
                                        : 'Add Vaccine'}
                                </Button>
                            </div>
                        ) : optionalVaccines.length === 0 ? (
                            <div className="rounded-lg border border-dashed px-4 py-5 text-center">
                                <p className="text-sm font-medium">
                                    No optional vaccines are currently
                                    available.
                                </p>

                                <p className="mt-1 text-xs text-muted-foreground">
                                    Optional vaccines can be added from
                                    the Vaccine Master List.
                                </p>
                            </div>
                        ) : (
                            <div className="rounded-lg border border-dashed px-4 py-4">
                                <p className="text-sm text-muted-foreground">
                                    All currently available optional
                                    vaccines have already been assigned.
                                </p>
                            </div>
                        )}

                        {assignedOptionalVaccines.length > 0 && (
                            <div>
                                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Assigned Optional Vaccines
                                </p>

                                <div className="divide-y rounded-lg border">
                                    {assignedOptionalVaccines.map(
                                        (vaccine) => {
                                            const isRemoving =
                                                removingOptionalVaccineId ===
                                                vaccine.id;

                                            const removalMessage =
                                                getOptionalVaccineRemovalMessage(
                                                    vaccine,
                                                );

                                            return (
                                                <div
                                                    key={vaccine.id}
                                                    className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                                                >
                                                    <div className="min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <p className="font-medium">
                                                                {
                                                                    vaccine.name
                                                                }
                                                            </p>

                                                            <Badge variant="outline">
                                                                Assigned
                                                            </Badge>
                                                        </div>

                                                        {removalMessage && (
                                                            <p className="mt-1 text-xs text-muted-foreground">
                                                                {
                                                                    removalMessage
                                                                }
                                                            </p>
                                                        )}
                                                    </div>

                                                    {vaccine.can_remove ? (
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            className="shrink-0"
                                                            disabled={
                                                                isRemoving ||
                                                                assigningOptionalVaccineId !==
                                                                    null
                                                            }
                                                            onClick={() =>
                                                                handleRemoveOptionalVaccine(
                                                                    vaccine,
                                                                )
                                                            }
                                                        >
                                                            <X className="mr-1.5 h-4 w-4" />

                                                            {isRemoving
                                                                ? 'Removing...'
                                                                : 'Remove'}
                                                        </Button>
                                                    ) : (
                                                        <span className="shrink-0 text-xs text-muted-foreground">
                                                            Locked
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        },
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {selectedAdministration && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                        <div className="w-full max-w-2xl rounded-xl border bg-background shadow-xl">
                            <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
                                <div>
                                    <h3 className="text-lg font-semibold">
                                        Confirm Vaccine Administration
                                    </h3>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Review the details before recording this
                                        administration for {patientName}.
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

                            <div className="space-y-5 p-5">
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-lg border bg-muted/10 p-3">
                                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                            Vaccine
                                        </p>
                                        <p className="mt-1 font-semibold">
                                            {selectedAdministration.vaccine_name}
                                        </p>
                                    </div>

                                    <div className="rounded-lg border bg-muted/10 p-3">
                                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                            Dose
                                        </p>
                                        <p className="mt-1 font-semibold">
                                            Dose {selectedAdministration.dose_number}{' '}
                                            of {selectedAdministration.required_doses}
                                        </p>
                                    </div>

                                    <div className="rounded-lg border bg-muted/10 p-3">
                                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                            Schedule
                                        </p>
                                        <p className="mt-1 font-semibold">
                                            {selectedAdministration.is_scheduled &&
                                            selectedAdministration.scheduled_date
                                                ? formatDate(
                                                      selectedAdministration.scheduled_date,
                                                  )
                                                : 'Walk-in / unscheduled'}
                                        </p>
                                    </div>

                                    {!selectedAdministration.is_scheduled && (
                                        <div className="rounded-lg border bg-muted/10 p-3">
                                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                Available Stock
                                            </p>
                                            <p className="mt-1 font-semibold">
                                                {selectedAdministration.available_stock}{' '}
                                                doses
                                            </p>
                                        </div>
                                    )}

                                    {selectedAdministration.is_scheduled &&
                                    selectedAdministration.reserved_batch_number ? (
                                        <>
                                            <div className="rounded-lg border bg-muted/10 p-3">
                                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                    Reserved Batch
                                                </p>
                                                <p className="mt-1 font-semibold">
                                                    {
                                                        selectedAdministration.reserved_batch_number
                                                    }
                                                </p>
                                            </div>

                                            <div className="rounded-lg border bg-muted/10 p-3">
                                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                    Batch Expiration
                                                </p>
                                                <p className="mt-1 font-semibold">
                                                    {formatDate(
                                                        selectedAdministration.reserved_batch_expiration_date,
                                                    )}
                                                </p>
                                            </div>
                                        </>
                                    ) : selectedAdministration.is_scheduled ? (
                                        <div className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-3 sm:col-span-2">
                                            <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">
                                                No batch currently reserved
                                            </p>
                                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                                This appointment exists, but it does not
                                                currently have an exact inventory batch
                                                assigned.
                                            </p>
                                        </div>
                                    ) : null}

                                    {selectedAdministration.priority_reason && (
                                        <div className="rounded-lg border bg-muted/10 p-3 sm:col-span-2">
                                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                Allocation Priority
                                            </p>
                                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                                <p className="font-semibold">
                                                    {selectedAdministration.priority_reason}
                                                </p>

                                                {selectedAdministration.is_series_completion_candidate && (
                                                    <Badge variant="outline">
                                                        Series Completion Candidate
                                                    </Badge>
                                                )}

                                                {selectedAdministration.allocation_rank !== null && (
                                                    <span className="text-xs text-muted-foreground">
                                                        Rank #{selectedAdministration.allocation_rank}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="administration-remarks"
                                        className="text-sm font-medium"
                                    >
                                        Remarks
                                    </label>

                                    <Textarea
                                        id="administration-remarks"
                                        className="mt-2 min-h-24"
                                        value={administrationRemarks}
                                        maxLength={1000}
                                        placeholder="Optional notes about this administration"
                                        disabled={Boolean(administeringKey)}
                                        onChange={(event) =>
                                            setAdministrationRemarks(
                                                event.target.value,
                                            )
                                        }
                                    />
                                </div>

                                <div className="rounded-lg border border-dashed px-4 py-3">
                                    <p className="text-xs leading-5 text-muted-foreground">
                                        {selectedAdministration.is_scheduled &&
                                        selectedAdministration.reserved_batch_number
                                            ? 'Confirming will create the official immunization record, deduct one dose from the reserved batch, and complete this scheduled appointment.'
                                            : selectedAdministration.is_scheduled
                                              ? 'This scheduled appointment needs a valid reserved batch before administration can be recorded.'
                                              : 'Confirming will create the official immunization record and deduct one unreserved usable dose from inventory.'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col-reverse gap-2 border-t px-5 py-4 sm:flex-row sm:justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={Boolean(administeringKey)}
                                    onClick={handleCloseAdministration}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    type="button"
                                    disabled={Boolean(administeringKey)}
                                    onClick={handleSubmitAdministration}
                                >
                                    <Syringe className="mr-2 h-4 w-4" />

                                    {administeringKey
                                        ? 'Recording...'
                                        : 'Confirm Administration'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {patient.status !==
                    'Active' && (
                    <div className="rounded-lg border border-dashed p-4">
                        <p className="font-medium">
                            Vaccination administration
                            is disabled.
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                            This patient is currently
                            inactive. Historical
                            immunization records remain
                            available.
                        </p>
                    </div>
                )}

                {vaccinationOptions.length ===
                0 ? (
                    <div className="rounded-lg border border-dashed p-8 text-center">
                        <Syringe className="mx-auto h-8 w-8 text-muted-foreground" />

                        <p className="mt-3 font-medium">
                            No vaccines currently require
                            administration.
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                            The patient may have completed
                            the applicable vaccines or may
                            not yet be eligible for the
                            next dose.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-lg border">
                        <table className="w-full table-fixed text-sm">
                            <thead className="bg-muted/30">
                                <tr className="border-b">
                                    <th className="w-[23%] border-r px-3 py-3 text-left font-semibold">
                                        Vaccine
                                    </th>

                                    <th className="w-[13%] border-r px-3 py-3 text-center font-semibold">
                                        Dose
                                    </th>

                                    <th className="w-[15%] border-r px-3 py-3 text-center font-semibold">
                                        Priority
                                    </th>

                                    <th className="w-[20%] border-r px-3 py-3 text-center font-semibold">
                                        Status
                                    </th>

                                    <th className="w-[13%] border-r px-3 py-3 text-center font-semibold">
                                        Stock
                                    </th>

                                    <th className="w-[16%] px-3 py-3 text-center font-semibold">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {vaccinationOptions.map(
                                    (
                                        option,
                                    ) => {
                                        const status =
                                            getVaccinationStatus(
                                                option,
                                            );

                                        const key =
                                            `${option.vaccine_id}-${option.dose_number}`;

                                        const isAdministering =
                                            administeringKey ===
                                            key;

                                        return (
                                            <tr
                                                key={
                                                    key
                                                }
                                                className="border-b last:border-b-0"
                                            >
                                                <td className="border-r px-3 py-3">
                                                    <p className="font-semibold">
                                                        {
                                                            option.vaccine_name
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-xs capitalize text-muted-foreground">
                                                        {
                                                            option.category
                                                        }
                                                    </p>
                                                </td>

                                                <td className="border-r px-3 py-3 text-center">
                                                    <p className="font-medium">
                                                        Dose{' '}
                                                        {
                                                            option.dose_number
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {
                                                            option.completed_doses
                                                        }
                                                        /
                                                        {
                                                            option.required_doses
                                                        }{' '}
                                                        completed
                                                    </p>
                                                </td>

                                                <td className="border-r px-3 py-3 text-center">
                                                    <span
                                                        className={`font-semibold ${getPriorityClass(
                                                            option.schedule_label,
                                                        )}`}
                                                    >
                                                        {
                                                            option.schedule_label
                                                        }
                                                    </span>
                                                </td>

                                                <td className="border-r px-3 py-3 text-center">
                                                    <p
                                                        className={`font-medium ${status.className}`}
                                                    >
                                                        {
                                                            status.text
                                                        }
                                                    </p>

                                                    {option.is_scheduled &&
                                                        option.scheduled_date && (
                                                            <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                                <CalendarDays className="h-3.5 w-3.5" />

                                                                {formatDate(
                                                                    option.scheduled_date,
                                                                )}
                                                            </p>
                                                        )}
                                                </td>

                                                <td className="border-r px-3 py-3 text-center">
                                                    {option.inventory_available ? (
                                                        <>
                                                            <p className="font-medium">
                                                                {
                                                                    option.available_stock
                                                                }
                                                            </p>

                                                            <p className="text-xs text-muted-foreground">
                                                                available
                                                            </p>
                                                        </>
                                                    ) : (
                                                        <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                                                            Out
                                                            of
                                                            stock
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-3 py-3 text-center">
                                                    {canShowAdministerButton(
                                                        option,
                                                    ) ? (
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            disabled={
                                                                isAdministering
                                                            }
                                                            onClick={() =>
                                                                handleOpenAdministration(
                                                                    option,
                                                                )
                                                            }
                                                        >
                                                            <Syringe className="mr-1.5 h-4 w-4" />

                                                            {isAdministering
                                                                ? 'Recording...'
                                                                : 'Administer'}
                                                        </Button>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">
                                                            Not
                                                            available
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    },
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
