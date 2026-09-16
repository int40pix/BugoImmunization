import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import {
    AlertTriangle,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Eye,
    History,
    Search,
    SearchX,
    ShieldCheck,
} from 'lucide-react';
import { Fragment, useMemo, useState } from 'react';

type TclRow = {
    patient_id: number;
    patient_code: string | null;
    patient_name: string;
    vaccine_id: number;
    vaccine_name: string;
    dose_number: number;
    schedule_label: string;
    inventory_available: boolean;
    available_stock: number;
    is_already_scheduled: boolean;
    scheduled_date: string | null;
};

type ScheduledRow = {
    id: number;
    patient_id: number;
    patient_code: string | null;
    patient_name: string;
    vaccine_id: number;
    vaccine_name: string | null;
    dose_number: number;
    scheduled_date: string | null;
    status: string;
    schedule_label: string | null;
};

type CompletedRow = {
    id: number;
    patient_id: number;
    patient_code: string | null;
    patient_name: string;
    vaccine_id: number | null;
    vaccine_name: string | null;
    dose_number: number;
    batch_number: string;
    date_administered: string | null;
    administered_by_id?: number | null;
    administered_by_name: string;
    consent_given_by?: string | null;
    injection_site?: string | null;
    source?: string | null;
    remarks?: string | null;
};

type Vaccine = {
    id: number;
    name: string;
    category: string;
};

type PatientGroup = {
    patient_id: number;
    patient_code: string | null;
    patient_name: string;
    rows: TclRow[];
};

type ScheduledGroup = {
    key: string;
    patient_id: number;
    patient_code: string | null;
    patient_name: string;
    scheduled_date: string | null;
    schedule_label: string | null;
    rows: ScheduledRow[];
};

type Props = {
    tclRows: TclRow[];
    scheduledRows: ScheduledRow[];
    completedRows: CompletedRow[];
    vaccines: Vaccine[];
};

export default function ImmunizationIndex({
    tclRows,
    scheduledRows,
    completedRows,
    vaccines,
}: Props) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [vaccineFilter, setVaccineFilter] = useState('all');
    const [viewMode, setViewMode] = useState<'tcl' | 'scheduled' | 'history'>('tcl');

    const [expandedPatients, setExpandedPatients] = useState<Set<number>>(
        new Set(),
    );

    const [expandedScheduledGroups, setExpandedScheduledGroups] = useState<
        Set<string>
    >(new Set());

    const normalizedSearch = search.trim().toLowerCase();
    const isSpecificVaccineSelected = vaccineFilter !== 'all';

    const selectedVaccine = vaccines.find(
        (vaccine) => String(vaccine.id) === vaccineFilter,
    );

    const matchesPatientSearch = (
        patientName: string,
        patientCode: string | null,
    ) => {
        if (normalizedSearch === '') {
            return true;
        }

        return (
            patientName.toLowerCase().includes(normalizedSearch) ||
            (patientCode ?? '').toLowerCase().includes(normalizedSearch)
        );
    };

    const matchesVaccine = (vaccineId: number | null) => {
        if (vaccineFilter === 'all') {
            return true;
        }

        return String(vaccineId) === vaccineFilter;
    };

    const parseDate = (date: string | null) => {
        if (!date) {
            return null;
        }

        const parsed = new Date(`${date}T00:00:00`);

        if (Number.isNaN(parsed.getTime())) {
            return null;
        }

        return parsed;
    };

    const startOfDay = (date: Date) => {
        const result = new Date(date);
        result.setHours(0, 0, 0, 0);

        return result;
    };

    const addDays = (date: Date, days: number) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);

        return result;
    };

    const getStartOfWeek = (date: Date) => {
        const result = startOfDay(date);
        const day = result.getDay();

        const daysSinceMonday = day === 0 ? 6 : day - 1;

        result.setDate(result.getDate() - daysSinceMonday);

        return result;
    };

    const getPriorityRank = (label: string | null) => {
        if (label === 'Overdue') {
            return 1;
        }

        if (label === 'Recent Due') {
            return 2;
        }

        if (label === 'Current Age') {
            return 3;
        }

        return 4;
    };

    const baseTclRows = useMemo(() => {
        return tclRows.filter((row) => {
            return (
                matchesPatientSearch(
                    row.patient_name,
                    row.patient_code,
                ) && matchesVaccine(row.vaccine_id)
            );
        });
    }, [tclRows, normalizedSearch, vaccineFilter]);

    const filteredTclRows = useMemo(() => {
        return baseTclRows.filter((row) => {
            if (statusFilter === 'current') {
                return row.schedule_label === 'Current Age';
            }

            if (statusFilter === 'recent') {
                return row.schedule_label === 'Recent Due';
            }

            if (statusFilter === 'overdue') {
                return row.schedule_label === 'Overdue';
            }

            return true;
        });
    }, [baseTclRows, statusFilter]);

    const filteredScheduledRows = useMemo(() => {
        return scheduledRows.filter((row) => {
            return (
                matchesPatientSearch(
                    row.patient_name,
                    row.patient_code,
                ) && matchesVaccine(row.vaccine_id)
            );
        });
    }, [scheduledRows, normalizedSearch, vaccineFilter]);

    const filteredCompletedRows = useMemo(() => {
        return completedRows.filter((row) => {
            return (
                matchesPatientSearch(
                    row.patient_name,
                    row.patient_code,
                ) && matchesVaccine(row.vaccine_id)
            );
        });
    }, [completedRows, normalizedSearch, vaccineFilter]);

    const patientGroups = useMemo<PatientGroup[]>(() => {
        const groups = new Map<number, PatientGroup>();

        filteredTclRows.forEach((row) => {
            const existing = groups.get(row.patient_id);

            if (existing) {
                existing.rows.push(row);
                return;
            }

            groups.set(row.patient_id, {
                patient_id: row.patient_id,
                patient_code: row.patient_code,
                patient_name: row.patient_name,
                rows: [row],
            });
        });

        return Array.from(groups.values());
    }, [filteredTclRows]);

    const scheduledGroups = useMemo<ScheduledGroup[]>(() => {
        const groups = new Map<string, ScheduledGroup>();

        filteredScheduledRows.forEach((row) => {
            const dateKey = row.scheduled_date ?? 'no-date';
            const key = `${row.patient_id}-${dateKey}`;

            const existing = groups.get(key);

            if (existing) {
                existing.rows.push(row);

                if (
                    getPriorityRank(row.schedule_label) <
                    getPriorityRank(existing.schedule_label)
                ) {
                    existing.schedule_label = row.schedule_label;
                }

                return;
            }

            groups.set(key, {
                key,
                patient_id: row.patient_id,
                patient_code: row.patient_code,
                patient_name: row.patient_name,
                scheduled_date: row.scheduled_date,
                schedule_label: row.schedule_label,
                rows: [row],
            });
        });

        return Array.from(groups.values()).sort((a, b) => {
            const aDate = a.scheduled_date ?? '';
            const bDate = b.scheduled_date ?? '';

            const dateComparison = aDate.localeCompare(bDate);

            if (dateComparison !== 0) {
                return dateComparison;
            }

            return a.patient_name.localeCompare(b.patient_name);
        });
    }, [filteredScheduledRows]);

    const upcomingSummary = useMemo(() => {
        const today = startOfDay(new Date());

        const thisWeekStart = getStartOfWeek(today);
        const thisWeekEnd = addDays(thisWeekStart, 6);

        const nextWeekStart = addDays(thisWeekStart, 7);
        const nextWeekEnd = addDays(nextWeekStart, 6);

        const remainingThisWeek = scheduledGroups.filter((group) => {
            const scheduledDate = parseDate(group.scheduled_date);

            if (!scheduledDate) {
                return false;
            }

            return scheduledDate >= today && scheduledDate <= thisWeekEnd;
        });

        if (remainingThisWeek.length > 0) {
            return {
                count: remainingThisWeek.length,
                period: 'This week',
            };
        }

        const nextWeek = scheduledGroups.filter((group) => {
            const scheduledDate = parseDate(group.scheduled_date);

            if (!scheduledDate) {
                return false;
            }

            return (
                scheduledDate >= nextWeekStart &&
                scheduledDate <= nextWeekEnd
            );
        });

        return {
            count: nextWeek.length,
            period: 'Next week',
        };
    }, [scheduledGroups]);

    const liveCounts = useMemo(() => {
        return {
            all: baseTclRows.length,

            currentAge: baseTclRows.filter(
                (row) => row.schedule_label === 'Current Age',
            ).length,

            recentDue: baseTclRows.filter(
                (row) => row.schedule_label === 'Recent Due',
            ).length,

            overdue: baseTclRows.filter(
                (row) => row.schedule_label === 'Overdue',
            ).length,

            completed: filteredCompletedRows.length,
        };
    }, [baseTclRows, filteredCompletedRows]);

    const togglePatient = (patientId: number) => {
        setExpandedPatients((current) => {
            const updated = new Set(current);

            if (updated.has(patientId)) {
                updated.delete(patientId);
            } else {
                updated.add(patientId);
            }

            return updated;
        });
    };

    const toggleScheduledGroup = (groupKey: string) => {
        setExpandedScheduledGroups((current) => {
            const updated = new Set(current);

            if (updated.has(groupKey)) {
                updated.delete(groupKey);
            } else {
                updated.add(groupKey);
            }

            return updated;
        });
    };

    const formatDate = (date: string | null) => {
        if (!date) {
            return null;
        }

        return new Intl.DateTimeFormat('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(new Date(`${date}T00:00:00`));
    };

    const getPriorityClass = (label: string | null) => {
        const base =
            'inline-flex items-center justify-center rounded-full border px-2.5 py-1 text-xs font-semibold';

        if (label === 'Overdue') {
            return `${base} border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300`;
        }

        if (label === 'Recent Due') {
            return `${base} border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/50 dark:text-orange-300`;
        }

        if (label === 'Current Age') {
            return `${base} border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300`;
        }

        return `${base} border-border bg-muted text-muted-foreground`;
    };

    const getTclStatus = (row: TclRow) => {
        const base =
            'inline-flex items-center justify-center rounded-full border px-2.5 py-1 text-xs font-medium';

        if (row.is_already_scheduled) {
            return {
                text: 'Scheduled',
                className:
                    `${base} border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/50 dark:text-green-300`,
            };
        }

        if (!row.inventory_available) {
            return {
                text: 'Waiting for stock',
                className:
                    `${base} border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300`,
            };
        }

        return {
            text: 'Awaiting schedule',
            className:
                `${base} border-border bg-muted text-muted-foreground`,
        };
    };

    const getGroupSummary = (patient: PatientGroup) => {
        if (statusFilter === 'overdue') {
            return `${patient.rows.length} ${
                patient.rows.length === 1
                    ? 'overdue vaccine'
                    : 'overdue vaccines'
            }`;
        }

        if (statusFilter === 'current') {
            return `${patient.rows.length} ${
                patient.rows.length === 1
                    ? 'current-age vaccine'
                    : 'current-age vaccines'
            }`;
        }

        if (statusFilter === 'recent') {
            return `${patient.rows.length} ${
                patient.rows.length === 1
                    ? 'recently due vaccine'
                    : 'recently due vaccines'
            }`;
        }

        return `${patient.rows.length} ${
            patient.rows.length === 1
                ? 'vaccination'
                : 'vaccinations'
        } requiring attention`;
    };

    const getVaccineSummary = (patient: PatientGroup) => {
        return patient.rows
            .map((row) => row.vaccine_name)
            .join(' · ');
    };

    const getTclTitle = () => {
        if (isSpecificVaccineSelected) {
            return `${selectedVaccine?.name ?? 'Vaccine'} TCL`;
        }

        return 'TCL (Target Client List)';
    };

    const getEmptyStateText = () => {
        if (isSpecificVaccineSelected) {
            if (statusFilter === 'current') {
                return `No patients currently due for ${
                    selectedVaccine?.name ?? 'this vaccine'
                }.`;
            }

            if (statusFilter === 'recent') {
                return `No patients recently due for ${
                    selectedVaccine?.name ?? 'this vaccine'
                }.`;
            }

            if (statusFilter === 'overdue') {
                return `No overdue patients for ${
                    selectedVaccine?.name ?? 'this vaccine'
                }.`;
            }

            return `No patients currently require ${
                selectedVaccine?.name ?? 'this vaccine'
            }.`;
        }

        return 'No matching patients found.';
    };

    const getTrackingTitle = () => {
        if (viewMode === 'history') {
            return 'Administration History';
        }

        if (viewMode === 'scheduled') {
            return 'Scheduled Vaccinations';
        }

        return getTclTitle();
    };

    const getTrackingDescription = () => {
        if (viewMode === 'history') {
            return 'Complete audit log of all administered pediatric vaccination doses with consent and clinical details.';
        }

        if (viewMode === 'scheduled') {
            return 'Upcoming vaccination appointments generated from the scheduling system.';
        }

        if (isSpecificVaccineSelected) {
            return `Patients currently requiring ${
                selectedVaccine?.name ?? 'this vaccine'
            }.`;
        }

        return 'Patients currently requiring immunization attention.';
    };

    return (
        <AppLayout>
            <Head title="Immunization Tracking" />

            <div className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-7">
                <div>
                    <h1 className="text-2xl font-bold">
                        Immunization Tracking
                    </h1>

                    <p className="mt-2 text-muted-foreground">
                        Monitor pediatric vaccination schedules and immunization
                        status.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Upcoming Visits
                            </CardTitle>
                        </CardHeader>

                        <CardContent>
                            <p className="text-3xl font-bold">
                                {upcomingSummary.count}
                            </p>

                            <p className="mt-1 text-sm text-muted-foreground">
                                {upcomingSummary.period}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Current Age
                            </CardTitle>
                        </CardHeader>

                        <CardContent>
                            <p className="text-3xl font-bold">
                                {liveCounts.currentAge}
                            </p>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Currently due vaccinations
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Overdue
                            </CardTitle>
                        </CardHeader>

                        <CardContent>
                            <p className="text-3xl font-bold">
                                {liveCounts.overdue}
                            </p>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Require attention
                            </p>
                        </CardContent>
                    </Card>

                    <Card
                        className={`cursor-pointer transition-all ${
                            viewMode === 'history'
                                ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                                : 'hover:border-primary/50'
                        }`}
                        onClick={() => setViewMode('history')}
                    >
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Completed
                            </CardTitle>
                        </CardHeader>

                        <CardContent>
                            <p className="text-3xl font-bold">
                                {liveCounts.completed}
                            </p>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Completed vaccinations
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {liveCounts.overdue > 0 ? (
                    <div className="flex flex-col gap-4 rounded-xl border border-red-200 bg-red-50/70 p-4 dark:border-red-900 dark:bg-red-950/20 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                                <AlertTriangle className="h-4 w-4" />
                            </div>

                            <div>
                                <p className="font-semibold text-red-800 dark:text-red-200">
                                    {liveCounts.overdue}{' '}
                                    {liveCounts.overdue === 1
                                        ? 'vaccination requires'
                                        : 'vaccinations require'}{' '}
                                    attention
                                </p>

                                <p className="mt-1 text-sm text-red-700/80 dark:text-red-300/80">
                                    Review overdue vaccinations first so staff can prioritize follow-up.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setViewMode('tcl');
                                setStatusFilter('overdue');
                            }}
                            className="shrink-0 rounded-md border border-red-300 bg-background px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950"
                        >
                            Review overdue
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 rounded-xl border bg-muted/20 p-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300">
                            <CheckCircle2 className="h-4 w-4" />
                        </div>

                        <div>
                            <p className="font-medium">
                                No overdue vaccinations
                            </p>
                            <p className="mt-0.5 text-sm text-muted-foreground">
                                There are no overdue vaccinations in the current view.
                            </p>
                        </div>
                    </div>
                )}

                <Card>
                    <CardContent className="pt-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                                <Input
                                    type="search"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Search patient or Patient ID..."
                                    className="pl-10"
                                />
                            </div>

                            <Select
                                value={vaccineFilter}
                                onValueChange={setVaccineFilter}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All vaccines" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="all">
                                        All vaccines
                                    </SelectItem>

                                    {vaccines.map((vaccine) => (
                                        <SelectItem
                                            key={vaccine.id}
                                            value={String(vaccine.id)}
                                        >
                                            {vaccine.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden">
                    <CardHeader className="border-b py-6">
                        <div className="flex flex-col gap-5">
                            <div>
                                <CardTitle className="text-2xl">
                                    {getTrackingTitle()}
                                </CardTitle>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    {getTrackingDescription()}
                                </p>
                            </div>

                            <div className="flex w-fit overflow-hidden rounded-md border">
                                <button
                                    type="button"
                                    onClick={() => setViewMode('tcl')}
                                    className={`px-5 py-2 text-sm font-medium transition-colors ${
                                        viewMode === 'tcl'
                                            ? 'bg-foreground text-background'
                                            : 'hover:bg-muted'
                                    }`}
                                >
                                    TCL
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setViewMode('scheduled')
                                    }
                                    className={`border-l px-5 py-2 text-sm font-medium transition-colors ${
                                        viewMode === 'scheduled'
                                            ? 'bg-foreground text-background'
                                            : 'hover:bg-muted'
                                    }`}
                                >
                                    Scheduled
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setViewMode('history')
                                    }
                                    className={`border-l px-5 py-2 text-sm font-medium transition-colors ${
                                        viewMode === 'history'
                                            ? 'bg-foreground text-background'
                                            : 'hover:bg-muted'
                                    }`}
                                >
                                    Administration History
                                </button>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-6">
                        {viewMode === 'tcl' ? (
                            <div className="overflow-hidden rounded-lg border">
                                <div className="flex flex-wrap items-center gap-2 border-b bg-muted/20 px-5 py-4">
                                    <button
                                        type="button"
                                        onClick={() => setStatusFilter('all')}
                                        className={`inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                                            statusFilter === 'all'
                                                ? 'bg-foreground text-background'
                                                : 'bg-background hover:bg-muted'
                                        }`}
                                    >
                                        All
                                        <span
                                            className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                                                statusFilter === 'all'
                                                    ? 'bg-background/20'
                                                    : 'bg-muted text-muted-foreground'
                                            }`}
                                        >
                                            {liveCounts.all}
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setStatusFilter('current')}
                                        className={`inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                                            statusFilter === 'current'
                                                ? 'bg-foreground text-background'
                                                : 'bg-background hover:bg-muted'
                                        }`}
                                    >
                                        Current Age
                                        <span
                                            className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                                                statusFilter === 'current'
                                                    ? 'bg-background/20'
                                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                            }`}
                                        >
                                            {liveCounts.currentAge}
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setStatusFilter('recent')}
                                        className={`inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                                            statusFilter === 'recent'
                                                ? 'bg-foreground text-background'
                                                : 'bg-background hover:bg-muted'
                                        }`}
                                    >
                                        Recent Due
                                        <span
                                            className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                                                statusFilter === 'recent'
                                                    ? 'bg-background/20'
                                                    : 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
                                            }`}
                                        >
                                            {liveCounts.recentDue}
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setStatusFilter('overdue')}
                                        className={`inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                                            statusFilter === 'overdue'
                                                ? 'bg-foreground text-background'
                                                : liveCounts.overdue > 0
                                                  ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'
                                                  : 'bg-background hover:bg-muted'
                                        }`}
                                    >
                                        Overdue
                                        <span
                                            className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                                                statusFilter === 'overdue'
                                                    ? 'bg-background/20'
                                                    : liveCounts.overdue > 0
                                                      ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                                                      : 'bg-muted text-muted-foreground'
                                            }`}
                                        >
                                            {liveCounts.overdue}
                                        </span>
                                    </button>
                                </div>

                                {filteredTclRows.length === 0 ? (
                                    isSpecificVaccineSelected ? (
                                        <>
                                            <div className="grid grid-cols-[32%_16%_12%_18%_22%] border-b-2 bg-muted/40 text-sm">
                                                <div className="border-r-2 px-6 py-4 text-left font-semibold">
                                                    Patient
                                                </div>

                                                <div className="border-r-2 px-6 py-4 text-center font-semibold">
                                                    PID
                                                </div>

                                                <div className="border-r-2 px-6 py-4 text-center font-semibold">
                                                    Dose
                                                </div>

                                                <div className="border-r-2 px-6 py-4 text-center font-semibold">
                                                    Priority
                                                </div>

                                                <div className="px-6 py-4 text-center font-semibold">
                                                    Scheduling Status
                                                </div>
                                            </div>

                                            <div className="flex min-h-[170px] flex-col items-center justify-center px-6 py-10 text-center">
                                                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                                    {statusFilter === 'overdue' ? (
                                                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                    ) : (
                                                        <SearchX className="h-5 w-5 text-muted-foreground" />
                                                    )}
                                                </div>

                                                <p className="font-medium">
                                                    {statusFilter === 'overdue'
                                                        ? 'No overdue vaccinations'
                                                        : 'No matching vaccinations'}
                                                </p>

                                                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                                                    {getEmptyStateText()}
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex min-h-[120px] items-center justify-center px-6 py-10 text-center">
                                            <p className="text-sm text-muted-foreground">
                                                {getEmptyStateText()}
                                            </p>
                                        </div>
                                    )
                                ) : isSpecificVaccineSelected ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full table-fixed text-sm">
                                            <thead className="border-b-2 bg-muted/40">
                                                <tr>
                                                    <th className="w-[32%] border-r-2 px-6 py-4 text-left font-semibold">
                                                        Patient
                                                    </th>

                                                    <th className="w-[16%] border-r-2 px-6 py-4 text-center font-semibold">
                                                        PID
                                                    </th>

                                                    <th className="w-[12%] border-r-2 px-6 py-4 text-center font-semibold">
                                                        Dose
                                                    </th>

                                                    <th className="w-[18%] border-r-2 px-6 py-4 text-center font-semibold">
                                                        Priority
                                                    </th>

                                                    <th className="w-[22%] px-6 py-4 text-center font-semibold">
                                                        Scheduling Status
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {filteredTclRows.map(
                                                    (row) => {
                                                        const status =
                                                            getTclStatus(row);

                                                        return (
                                                            <tr
                                                                key={`${row.patient_id}-${row.vaccine_id}-${row.dose_number}`}
                                                                className="border-b-2 last:border-b-0 hover:bg-muted/20"
                                                            >
                                                                <td className="border-r-2 px-6 py-5 text-left align-middle">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            router.visit(
                                                                                route(
                                                                                    'patients.show',
                                                                                    row.patient_id,
                                                                                ),
                                                                            )
                                                                        }
                                                                        className="font-semibold underline-offset-4 hover:underline"
                                                                    >
                                                                        {row.patient_name}
                                                                    </button>
                                                                </td>

                                                                <td className="border-r-2 px-6 py-5 text-center align-middle text-muted-foreground">
                                                                    {row.patient_code ??
                                                                        '—'}
                                                                </td>

                                                                <td className="border-r-2 px-6 py-5 text-center align-middle">
                                                                    Dose{' '}
                                                                    {
                                                                        row.dose_number
                                                                    }
                                                                </td>

                                                                <td className="border-r-2 px-6 py-5 text-center align-middle">
                                                                    <span
                                                                        className={`font-semibold ${getPriorityClass(
                                                                            row.schedule_label,
                                                                        )}`}
                                                                    >
                                                                        {
                                                                            row.schedule_label
                                                                        }
                                                                    </span>
                                                                </td>

                                                                <td className="px-6 py-5 text-center align-middle">
                                                                    <span
                                                                        className={`font-medium ${status.className}`}
                                                                    >
                                                                        {
                                                                            status.text
                                                                        }
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    },
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div>
                                        {patientGroups.map(
                                            (patient, index) => {
                                                const isExpanded =
                                                    expandedPatients.has(
                                                        patient.patient_id,
                                                    );

                                                return (
                                                    <div
                                                        key={
                                                            patient.patient_id
                                                        }
                                                        className={
                                                            index !==
                                                            patientGroups.length -
                                                                1
                                                                ? 'border-b'
                                                                : ''
                                                        }
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                togglePatient(
                                                                    patient.patient_id,
                                                                )
                                                            }
                                                            aria-expanded={
                                                                isExpanded
                                                            }
                                                            className="grid w-full grid-cols-[44px_minmax(0,1fr)_260px] items-center gap-3 px-5 py-5 text-left transition-colors hover:bg-muted/30"
                                                        >
                                                            <div className="flex items-center justify-center text-muted-foreground">
                                                                {isExpanded ? (
                                                                    <ChevronDown className="h-4 w-4" />
                                                                ) : (
                                                                    <ChevronRight className="h-4 w-4" />
                                                                )}
                                                            </div>

                                                            <div className="min-w-0">
                                                                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                                                    <p className="font-semibold">
                                                                        {
                                                                            patient.patient_name
                                                                        }
                                                                    </p>

                                                                    <p className="text-xs text-muted-foreground">
                                                                        {patient.patient_code ??
                                                                            'No Patient ID'}
                                                                    </p>
                                                                </div>

                                                                <p className="mt-1 truncate text-sm text-muted-foreground">
                                                                    {getVaccineSummary(
                                                                        patient,
                                                                    )}
                                                                </p>
                                                            </div>

                                                            <div className="border-l pl-6 text-right">
                                                                <p className="text-sm font-medium">
                                                                    {getGroupSummary(
                                                                        patient,
                                                                    )}
                                                                </p>

                                                                <p className="mt-1 text-xs text-muted-foreground">
                                                                    {isExpanded
                                                                        ? 'Hide details'
                                                                        : 'View details'}
                                                                </p>
                                                            </div>
                                                        </button>

                                                        {isExpanded && (
                                                            <div className="border-t bg-muted/10 px-6 py-2 pl-[72px]">
                                                                {patient.rows.map(
                                                                    (
                                                                        row,
                                                                        rowIndex,
                                                                    ) => {
                                                                        const status =
                                                                            getTclStatus(
                                                                                row,
                                                                            );

                                                                        const scheduledDate =
                                                                            formatDate(
                                                                                row.scheduled_date,
                                                                            );

                                                                        return (
                                                                            <div
                                                                                key={`${row.patient_id}-${row.vaccine_id}-${row.dose_number}`}
                                                                                className={`grid gap-4 py-4 sm:grid-cols-[minmax(180px,1.4fr)_100px_minmax(120px,1fr)_minmax(170px,1.2fr)] sm:items-center ${
                                                                                    rowIndex !==
                                                                                    patient
                                                                                        .rows
                                                                                        .length -
                                                                                        1
                                                                                        ? 'border-b'
                                                                                        : ''
                                                                                }`}
                                                                            >
                                                                                <p className="text-sm font-medium">
                                                                                    {
                                                                                        row.vaccine_name
                                                                                    }
                                                                                </p>

                                                                                <p className="text-center text-sm text-muted-foreground">
                                                                                    Dose{' '}
                                                                                    {
                                                                                        row.dose_number
                                                                                    }
                                                                                </p>

                                                                                <p
                                                                                    className={`text-center text-sm font-medium ${getPriorityClass(
                                                                                        row.schedule_label,
                                                                                    )}`}
                                                                                >
                                                                                    {
                                                                                        row.schedule_label
                                                                                    }
                                                                                </p>

                                                                                <div className="text-right">
                                                                                    <p
                                                                                        className={`text-sm ${status.className}`}
                                                                                    >
                                                                                        {
                                                                                            status.text
                                                                                        }
                                                                                    </p>

                                                                                    {scheduledDate && (
                                                                                        <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                                                                            <CalendarDays className="h-3.5 w-3.5" />

                                                                                            {
                                                                                                scheduledDate
                                                                                            }
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    },
                                                                )}

                                                                <div className="flex justify-end border-t py-3">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            router.visit(
                                                                                route(
                                                                                    'patients.show',
                                                                                    patient.patient_id,
                                                                                ),
                                                                            )
                                                                        }
                                                                        className="inline-flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-xs font-medium transition-colors hover:bg-muted"
                                                                    >
                                                                        <Eye className="h-3.5 w-3.5" />
                                                                        View patient record
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            },
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : viewMode === 'scheduled' ? (
                            <div className="overflow-hidden rounded-lg border">
                                <div className="overflow-x-auto">
                                    <table className="w-full table-fixed text-sm">
                                        <thead className="border-b-2 bg-muted/40">
                                            <tr>
                                                <th className="w-[32%] border-r-2 px-5 py-4 text-left font-semibold">
                                                    Patient
                                                </th>

                                                <th className="w-[16%] border-r-2 px-5 py-4 text-center font-semibold">
                                                    PID
                                                </th>

                                                <th className="w-[20%] border-r-2 px-5 py-4 text-center font-semibold">
                                                    Scheduled Date
                                                </th>

                                                <th className="w-[15%] border-r-2 px-5 py-4 text-center font-semibold">
                                                    Priority
                                                </th>

                                                <th className="w-[17%] px-5 py-4 text-center font-semibold">
                                                    Vaccines
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {scheduledGroups.length === 0 ? (
                                                <tr>
                                                    <td
                                                        colSpan={5}
                                                        className="px-6 py-14"
                                                    >
                                                        <div className="flex flex-col items-center justify-center text-center">
                                                            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                                                <CalendarDays className="h-5 w-5 text-muted-foreground" />
                                                            </div>

                                                            <p className="font-medium">
                                                                No scheduled vaccinations
                                                            </p>

                                                            <p className="mt-1 text-sm text-muted-foreground">
                                                                No appointments match the current patient or vaccine filters.
                                                            </p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                scheduledGroups.map(
                                                    (group) => {
                                                        const isExpanded =
                                                            expandedScheduledGroups.has(
                                                                group.key,
                                                            );

                                                        return (
                                                            <Fragment
                                                                key={group.key}
                                                            >
                                                                <tr
                                                                    onClick={() =>
                                                                        toggleScheduledGroup(
                                                                            group.key,
                                                                        )
                                                                    }
                                                                    className="cursor-pointer border-b-2 transition-colors hover:bg-muted/20"
                                                                >
                                                                    <td className="border-r-2 px-5 py-5 text-left align-middle">
                                                                        <div className="flex items-center gap-3">
                                                                            {isExpanded ? (
                                                                                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                                            ) : (
                                                                                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                                            )}

                                                                            <p className="font-semibold">
                                                                                {
                                                                                    group.patient_name
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                    </td>

                                                                    <td className="border-r-2 px-5 py-5 text-center align-middle text-muted-foreground">
                                                                        {group.patient_code ??
                                                                            '—'}
                                                                    </td>

                                                                    <td className="border-r-2 px-5 py-5 text-center align-middle">
                                                                        {group.scheduled_date ? (
                                                                            <span className="inline-flex items-center justify-center gap-2">
                                                                                <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />

                                                                                {formatDate(
                                                                                    group.scheduled_date,
                                                                                )}
                                                                            </span>
                                                                        ) : (
                                                                            <span className="text-muted-foreground">
                                                                                —
                                                                            </span>
                                                                        )}
                                                                    </td>

                                                                    <td className="border-r-2 px-5 py-5 text-center align-middle">
                                                                        <span
                                                                            className={`font-semibold ${getPriorityClass(
                                                                                group.schedule_label,
                                                                            )}`}
                                                                        >
                                                                            {group.schedule_label ??
                                                                                '—'}
                                                                        </span>
                                                                    </td>

                                                                    <td className="px-5 py-5 text-center align-middle">
                                                                        <p className="font-semibold">
                                                                            {
                                                                                group
                                                                                    .rows
                                                                                    .length
                                                                            }{' '}
                                                                            {group
                                                                                .rows
                                                                                .length ===
                                                                            1
                                                                                ? 'vaccine'
                                                                                : 'vaccines'}
                                                                        </p>

                                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                                            {isExpanded
                                                                                ? 'Hide details'
                                                                                : 'View details'}
                                                                        </p>
                                                                    </td>
                                                                </tr>

                                                                {isExpanded && (
                                                                    <tr className="border-b-2 bg-muted/10">
                                                                        <td
                                                                            colSpan={
                                                                                5
                                                                            }
                                                                            className="p-0"
                                                                        >
                                                                            <table className="w-full table-fixed text-sm">
                                                                                <thead className="border-b bg-muted/20">
                                                                                    <tr>
                                                                                        <th className="w-[55%] border-r px-6 py-3 text-left font-medium text-muted-foreground">
                                                                                            Vaccine
                                                                                        </th>

                                                                                        <th className="w-[20%] border-r px-6 py-3 text-center font-medium text-muted-foreground">
                                                                                            Dose
                                                                                        </th>

                                                                                        <th className="w-[25%] px-6 py-3 text-center font-medium text-muted-foreground">
                                                                                            Priority
                                                                                        </th>
                                                                                    </tr>
                                                                                </thead>

                                                                                <tbody>
                                                                                    {group.rows.map(
                                                                                        (
                                                                                            row,
                                                                                        ) => (
                                                                                            <tr
                                                                                                key={
                                                                                                    row.id
                                                                                                }
                                                                                                className="border-b last:border-b-0"
                                                                                            >
                                                                                                <td className="border-r px-6 py-4 font-medium">
                                                                                                    {row.vaccine_name ??
                                                                                                        'Unknown vaccine'}
                                                                                                </td>

                                                                                                <td className="border-r px-6 py-4 text-center">
                                                                                                    Dose{' '}
                                                                                                    {
                                                                                                        row.dose_number
                                                                                                    }
                                                                                                </td>

                                                                                                <td className="px-6 py-4 text-center">
                                                                                                    <span
                                                                                                        className={`font-medium ${getPriorityClass(
                                                                                                            row.schedule_label,
                                                                                                        )}`}
                                                                                                    >
                                                                                                        {row.schedule_label ??
                                                                                                            '—'}
                                                                                                    </span>
                                                                                                </td>
                                                                                            </tr>
                                                                                        ),
                                                                                    )}
                                                                                </tbody>
                                                                            </table>
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </Fragment>
                                                        );
                                                    },
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-lg border">
                                <div className="flex flex-wrap items-center justify-between gap-4 border-b bg-muted/20 px-5 py-4">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                        <span className="text-sm font-semibold">
                                            Vaccination Administration Audit Log
                                        </span>
                                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                            {filteredCompletedRows.length}{' '}
                                            {filteredCompletedRows.length === 1 ? 'dose' : 'doses'}
                                        </span>
                                    </div>

                                    <p className="text-xs text-muted-foreground">
                                        Verified informed consent, batch lot numbers, and vaccinating staff records
                                    </p>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="border-b bg-muted/40 text-xs uppercase font-medium text-muted-foreground">
                                            <tr>
                                                <th className="px-4 py-3.5 text-left font-semibold">Date Administered</th>
                                                <th className="px-4 py-3.5 text-left font-semibold">Patient</th>
                                                <th className="px-4 py-3.5 text-left font-semibold">Vaccine & Dose</th>
                                                <th className="px-4 py-3.5 text-left font-semibold">Batch No.</th>
                                                <th className="px-4 py-3.5 text-left font-semibold">Injection Site</th>
                                                <th className="px-4 py-3.5 text-left font-semibold">Administered By</th>
                                                <th className="px-4 py-3.5 text-left font-semibold">Consent Given By</th>
                                                <th className="px-4 py-3.5 text-left font-semibold">Remarks</th>
                                                <th className="px-4 py-3.5 text-right font-semibold">Action</th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y">
                                            {filteredCompletedRows.length === 0 ? (
                                                <tr>
                                                    <td colSpan={9} className="px-6 py-14">
                                                        <div className="flex flex-col items-center justify-center text-center">
                                                            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                                                <History className="h-5 w-5 text-muted-foreground" />
                                                            </div>
                                                            <p className="font-medium">No administration records found</p>
                                                            <p className="mt-1 text-sm text-muted-foreground">
                                                                {normalizedSearch || vaccineFilter !== 'all'
                                                                    ? 'No administered vaccinations match your search or filter criteria.'
                                                                    : 'No pediatric vaccinations have been recorded as administered yet.'}
                                                            </p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredCompletedRows.map((row) => (
                                                    <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                                                        <td className="px-4 py-3.5 whitespace-nowrap text-xs font-medium">
                                                            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                                                                <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                                                                {formatDate(row.date_administered)}
                                                            </span>
                                                        </td>

                                                        <td className="px-4 py-3.5">
                                                            <div className="font-medium leading-snug">
                                                                {row.patient_name}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground font-mono">
                                                                {row.patient_code ?? 'PID —'}
                                                            </div>
                                                        </td>

                                                        <td className="px-4 py-3.5 whitespace-nowrap">
                                                            <div className="font-medium text-foreground">
                                                                {row.vaccine_name ?? 'Unknown vaccine'}
                                                            </div>
                                                            <div className="inline-flex items-center mt-0.5 rounded border border-primary/20 bg-primary/5 px-1.5 py-0.5 text-[11px] font-medium text-primary">
                                                                Dose {row.dose_number}
                                                            </div>
                                                        </td>

                                                        <td className="px-4 py-3.5 whitespace-nowrap">
                                                            <span className="rounded bg-muted px-2 py-1 font-mono text-xs font-medium">
                                                                {row.batch_number || '—'}
                                                            </span>
                                                        </td>

                                                        <td className="px-4 py-3.5 text-xs text-muted-foreground max-w-[160px] truncate" title={row.injection_site || undefined}>
                                                            {row.injection_site || '—'}
                                                        </td>

                                                        <td className="px-4 py-3.5 whitespace-nowrap text-xs">
                                                            <span className="font-medium text-foreground">
                                                                {row.administered_by_name}
                                                            </span>
                                                        </td>

                                                        <td className="px-4 py-3.5 whitespace-nowrap text-xs">
                                                            {row.consent_given_by ? (
                                                                <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-medium">
                                                                    <CheckCircle2 className="h-3 w-3" />
                                                                    {row.consent_given_by}
                                                                </span>
                                                            ) : (
                                                                <span className="text-muted-foreground">—</span>
                                                            )}
                                                        </td>

                                                        <td className="px-4 py-3.5 text-xs text-muted-foreground max-w-[180px] truncate" title={row.remarks || undefined}>
                                                            {row.remarks || '—'}
                                                        </td>

                                                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                                                            <button
                                                                type="button"
                                                                onClick={() => router.visit(route('patients.show', row.patient_id))}
                                                                className="inline-flex items-center gap-1.5 rounded-md border bg-background px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                                                            >
                                                                <Eye className="h-3.5 w-3.5" />
                                                                View
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}