import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    ArrowDown,
    ArrowUp,
    Baby,
    Bell,
    Building2,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    ChevronsUpDown,
    Eye,
    History,
    Pencil,
    Search,
    SearchX,
    ShieldCheck,
    X,
} from 'lucide-react';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import ReportsHub from './components/reports-hub';
import { calculateAge, formatDateOfBirth, parseDateOfBirth } from '@/utils/patient-age';

type VaccineDoseItem = {
    id: number;
    dose_number: number;
    date_administered: string | null;
    formatted_date: string | null;
    display_text: string;
};

type MasterlistPatient = {
    id: number;
    patient_id: string;
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    mother_name?: string | null;
    date_of_birth: string;
    guardian_name?: string | null;
    guardian_contact?: string | null;
    address?: string | null;
    sex?: string;
    status?: string;
    vaccine_history?: Record<string, VaccineDoseItem[]>;
    immunization_records?: Array<{
        id: number;
        dose_number: number;
        date_administered: string | null;
        vaccine?: { name: string };
    }>;
    immunizationRecords?: Array<{
        id: number;
        dose_number: number;
        date_administered: string | null;
        vaccine?: { name: string };
    }>;
};

type TclRow = {
    patient_id: number;
    patient_code: string | null;
    patient_name: string;
    vaccine_id: number;
    vaccine_name: string;
    dose_number: number;
    schedule_label: string;
    days_due?: number;
    days_overdue?: number;
    target_wednesday?: string | null;
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
    days_due?: number;
    days_overdue?: number;
    target_wednesday?: string | null;
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
    days_due?: number;
    rows: ScheduledRow[];
};

type Props = {
    tclRows: TclRow[];
    scheduledRows: ScheduledRow[];
    completedRows: CompletedRow[];
    vaccines: Vaccine[];
    coverageReport?: any;
    scheduleStatusReport?: any;
    masterlistPatients?: MasterlistPatient[];
    patients?: MasterlistPatient[];
    initialView?: 'tcl' | 'scheduled' | 'history' | 'reports';
};

export default function ImmunizationIndex({
    tclRows,
    scheduledRows,
    completedRows,
    vaccines,
    coverageReport,
    scheduleStatusReport,
    masterlistPatients = [],
    patients = [],
    initialView,
}: Props) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [vaccineFilter, setVaccineFilter] = useState('all');
    const [viewMode, setViewMode] = useState<
        'tcl' | 'scheduled' | 'history' | 'reports'
    >(initialView ?? 'tcl');

    const [expandedPatients, setExpandedPatients] = useState<Set<number>>(
        new Set(),
    );

    const [expandedScheduledGroups, setExpandedScheduledGroups] = useState<
        Set<string>
    >(new Set());

    const [isSendingReminder, setIsSendingReminder] = useState<string | null>(null);
    const [sentReminderKeys, setSentReminderKeys] = useState<Set<string>>(new Set());
    const [reminderNotice, setReminderNotice] = useState<{
        message: string;
        type: 'success' | 'info' | 'error';
    } | null>(null);

    useEffect(() => {
        if (!reminderNotice) return;
        const timer = setTimeout(() => {
            setReminderNotice(null);
        }, 7000);
        return () => clearTimeout(timer);
    }, [reminderNotice]);

    const [rescheduleTarget, setRescheduleTarget] = useState<{
        patientId: number;
        patientName: string;
        currentDate: string;
    } | null>(null);
    const [rescheduleDate, setRescheduleDate] = useState('');
    const [rescheduleReason, setRescheduleReason] = useState('');
    const [isRescheduling, setIsRescheduling] = useState(false);

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

    const handleOpenRescheduleModal = (patientId: number, patientName: string, currentDate?: string | null) => {
        const target = currentDate || getNearestWednesday();
        const validWed = isWednesday(target) ? target : getNearestWednesday(target);
        setRescheduleTarget({ patientId, patientName, currentDate: validWed });
        setRescheduleDate(validWed);
        setRescheduleReason('');
    };

    const handleSaveReschedule = (e: React.FormEvent) => {
        e.preventDefault();
        if (!rescheduleTarget || !rescheduleDate || isRescheduling) return;

        if (!isWednesday(rescheduleDate)) {
            return;
        }

        setIsRescheduling(true);
        router.post(
            route('immunization.patients.reschedule', rescheduleTarget.patientId),
            {
                scheduled_date: rescheduleDate,
                adjustment_reason: rescheduleReason.trim() || 'Adjusted by clinic staff',
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setRescheduleTarget(null);
                },
                onFinish: () => {
                    setIsRescheduling(false);
                },
            }
        );
    };

    const handleSendPatientReminder = (patientId: number, key: string) => {
        setIsSendingReminder(key);
        router.post(
            route('immunization.patients.send-reminder', patientId),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: (page) => {
                    const flash = (page.props as any)?.flash;
                    const message = flash?.success || flash?.info || 'Reminders sent';
                    setReminderNotice({
                        message,
                        type: flash?.info ? 'info' : 'success',
                    });
                    setSentReminderKeys((prev) => new Set(prev).add(key));
                    setTimeout(() => {
                        setSentReminderKeys((prev) => {
                            const next = new Set(prev);
                            next.delete(key);
                            return next;
                        });
                    }, 6000);
                },
                onError: () => {
                    setReminderNotice({
                        message: 'Failed to send visit reminder. Please check guardian account.',
                        type: 'error',
                    });
                },
                onFinish: () => setIsSendingReminder(null),
            }
        );
    };

    const handleSendBulkReminders = () => {
        setIsSendingReminder('bulk');
        router.post(
            route('immunization.reminders.send-bulk'),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: (page) => {
                    const flash = (page.props as any)?.flash;
                    const message = flash?.success || flash?.info || 'Reminders sent to all due';
                    setReminderNotice({
                        message,
                        type: flash?.info ? 'info' : 'success',
                    });
                    setSentReminderKeys((prev) => new Set(prev).add('bulk'));
                    setTimeout(() => {
                        setSentReminderKeys((prev) => {
                            const next = new Set(prev);
                            next.delete('bulk');
                            return next;
                        });
                    }, 6000);
                },
                onError: () => {
                    setReminderNotice({
                        message: 'Failed to dispatch bulk reminders. Please try again.',
                        type: 'error',
                    });
                },
                onFinish: () => setIsSendingReminder(null),
            }
        );
    };

    const normalizedSearch = search.trim().toLowerCase();
    const isSpecificVaccineSelected = vaccineFilter !== 'all';

    const selectedVaccine = vaccines.find(
        (vaccine) => String(vaccine.id) === vaccineFilter,
    );

    const activeVaccineKey = useMemo<'BCG' | 'Hep B' | 'Pentavalent' | 'PCV' | 'OPV' | 'IPV' | 'MCV' | null>(() => {
        if (vaccineFilter === 'all') return null;
        const v = vaccines.find((vac) => String(vac.id) === vaccineFilter);
        if (!v) return null;
        const name = v.name.toLowerCase();
        if (name === 'bcg') return 'BCG';
        if (name.includes('hep')) return 'Hep B';
        if (name.includes('penta')) return 'Pentavalent';
        if (name === 'pcv') return 'PCV';
        if (name === 'opv') return 'OPV';
        if (name === 'ipv') return 'IPV';
        if (name === 'mmr' || name === 'mcv' || name.includes('measles')) return 'MCV';
        return null;
    }, [vaccineFilter, vaccines]);

    // Masterlist table sorting & continuous vertical scroll state
    const [masterlistSortField, setMasterlistSortField] = useState<'patient_id' | 'name' | 'age'>('patient_id');
    const [masterlistSortOrder, setMasterlistSortOrder] = useState<'asc' | 'desc'>('asc');
    const [masterlistVisibleCount, setMasterlistVisibleCount] = useState(40);
    const masterlistScrollRef = useRef<HTMLDivElement>(null);

    const handleMasterlistSort = (field: 'patient_id' | 'name' | 'age') => {
        if (masterlistSortField === field) {
            setMasterlistSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setMasterlistSortField(field);
            setMasterlistSortOrder('asc');
        }
    };

    const masterlistData: MasterlistPatient[] = useMemo(() => {
        return (masterlistPatients && masterlistPatients.length > 0) ? masterlistPatients : patients;
    }, [masterlistPatients, patients]);

    const filteredMasterlistPatients = useMemo(() => {
        const term = normalizedSearch;
        return masterlistData.filter((p) => {
            if (!term) return true;
            const fullName = `${p.first_name} ${p.middle_name ?? ''} ${p.last_name}`.toLowerCase();
            const pid = (p.patient_id ?? '').toLowerCase();
            const guardian = (p.guardian_name ?? p.mother_name ?? '').toLowerCase();
            const contact = (p.guardian_contact ?? '').toLowerCase();
            const addr = (p.address ?? '').toLowerCase();

            return (
                fullName.includes(term) ||
                pid.includes(term) ||
                guardian.includes(term) ||
                contact.includes(term) ||
                addr.includes(term)
            );
        });
    }, [masterlistData, normalizedSearch]);

    const sortedMasterlistPatients = useMemo(() => {
        const list = [...filteredMasterlistPatients];
        list.sort((a, b) => {
            let cmp = 0;
            if (masterlistSortField === 'patient_id') {
                cmp = (a.patient_id || '').localeCompare(b.patient_id || '', undefined, { numeric: true });
            } else if (masterlistSortField === 'name') {
                const nameA = `${a.last_name}, ${a.first_name}`.toLowerCase();
                const nameB = `${b.last_name}, ${b.first_name}`.toLowerCase();
                cmp = nameA.localeCompare(nameB);
            } else if (masterlistSortField === 'age') {
                const dateA = new Date(a.date_of_birth).getTime() || 0;
                const dateB = new Date(b.date_of_birth).getTime() || 0;
                cmp = dateB - dateA;
            }
            return masterlistSortOrder === 'asc' ? cmp : -cmp;
        });
        return list;
    }, [filteredMasterlistPatients, masterlistSortField, masterlistSortOrder]);

    const visibleMasterlistPatients = useMemo(() => {
        return sortedMasterlistPatients.slice(0, masterlistVisibleCount);
    }, [sortedMasterlistPatients, masterlistVisibleCount]);

    useEffect(() => {
        setMasterlistVisibleCount(40);
        if (masterlistScrollRef.current) {
            masterlistScrollRef.current.scrollTop = 0;
        }
    }, [search, vaccineFilter, viewMode]);

    const handleMasterlistScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollTop + clientHeight >= scrollHeight - 200) {
            setMasterlistVisibleCount((prev) => Math.min(prev + 30, sortedMasterlistPatients.length));
        }
    };

    const formatBirthDate = (dobString?: string | null): string => {
        if (!dobString) return '—';
        const date = parseDateOfBirth(dobString);
        if (!date) return '—';
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
        });
    };

    const formatPatientAge = (dobString?: string | null): string => {
        if (!dobString) return '—';
        const birthDate = parseDateOfBirth(dobString);
        if (!birthDate) return '—';
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        birthDate.setHours(0, 0, 0, 0);

        if (birthDate > today) return '—';

        let totalMonths =
            (today.getFullYear() - birthDate.getFullYear()) * 12 +
            (today.getMonth() - birthDate.getMonth());

        if (today.getDate() < birthDate.getDate()) {
            totalMonths -= 1;
        }
        totalMonths = Math.max(0, totalMonths);

        if (totalMonths === 0) {
            const diffTime = today.getTime() - birthDate.getTime();
            const totalDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
            if (totalDays === 0) return 'Today';
            return `${totalDays} ${totalDays === 1 ? 'day' : 'days'}`;
        }

        if (totalMonths <= 24) {
            return `${totalMonths} ${totalMonths === 1 ? 'month' : 'months'}`;
        }

        const years = Math.floor(totalMonths / 12);
        const remainingMonths = totalMonths % 12;
        if (remainingMonths === 0) {
            return `${years} ${years === 1 ? 'yr' : 'yrs'}`;
        }
        return `${years} ${years === 1 ? 'yr' : 'yrs'} ${remainingMonths} ${remainingMonths === 1 ? 'mo' : 'mos'}`;
    };

    const getDosesForVaccine = (
        patient: MasterlistPatient,
        vaccineKey: 'BCG' | 'Hep B' | 'Pentavalent' | 'PCV' | 'OPV' | 'IPV' | 'MCV',
    ): VaccineDoseItem[] => {
        if (patient.vaccine_history && patient.vaccine_history[vaccineKey]) {
            return patient.vaccine_history[vaccineKey];
        }

        const records = patient.immunization_records || patient.immunizationRecords;
        if (records && Array.isArray(records)) {
            return records
                .filter((rec) => {
                    const name = rec.vaccine?.name ?? '';
                    if (vaccineKey === 'BCG') return name.toLowerCase() === 'bcg';
                    if (vaccineKey === 'Hep B') return name.toLowerCase().includes('hep');
                    if (vaccineKey === 'Pentavalent') return name.toLowerCase().includes('penta');
                    if (vaccineKey === 'PCV') return name.toLowerCase() === 'pcv';
                    if (vaccineKey === 'OPV') return name.toLowerCase() === 'opv';
                    if (vaccineKey === 'IPV') return name.toLowerCase() === 'ipv';
                    if (vaccineKey === 'MCV') {
                        return (
                            name.toLowerCase() === 'mmr' ||
                            name.toLowerCase() === 'mcv' ||
                            name.toLowerCase().includes('measles')
                        );
                    }
                    return false;
                })
                .sort((a, b) => a.dose_number - b.dose_number)
                .map((rec) => {
                    const dateStr = rec.date_administered;
                    let formattedDate = '—';
                    if (dateStr) {
                        const d = new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'));
                        if (!Number.isNaN(d.getTime())) {
                            formattedDate = d.toLocaleDateString('en-US', {
                                month: 'short',
                                day: '2-digit',
                                year: 'numeric',
                            });
                        }
                    }
                    return {
                        id: rec.id,
                        dose_number: rec.dose_number,
                        date_administered: dateStr,
                        formatted_date: formattedDate,
                        display_text: `D${rec.dose_number} — ${formattedDate}`,
                    };
                });
        }

        return [];
    };

    const renderVaccineDoses = (
        patient: MasterlistPatient,
        vaccineKey: 'BCG' | 'Hep B' | 'Pentavalent' | 'PCV' | 'OPV' | 'IPV' | 'MCV',
    ) => {
        const doses = getDosesForVaccine(patient, vaccineKey);
        if (!doses || doses.length === 0) {
            return <span className="text-muted-foreground/60 select-none font-medium">—</span>;
        }

        return (
            <div className="flex flex-col space-y-1 font-mono text-[11px] leading-relaxed">
                {doses.map((dose) => (
                    <div
                        key={`${patient.id}-${vaccineKey}-${dose.id || dose.dose_number}`}
                        className="text-foreground/90 whitespace-nowrap"
                    >
                        {dose.display_text || `D${dose.dose_number} — ${dose.formatted_date || '—'}`}
                    </div>
                ))}
            </div>
        );
    };

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

                if ((row.days_due ?? 0) > (existing.days_due ?? 0)) {
                    existing.days_due = row.days_due;
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
                days_due: row.days_due,
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

        if (label === 'Upcoming') {
            return `${base} border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-300`;
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
        if (viewMode === 'reports') {
            return 'Immunization Reports & Analytics';
        }

        if (viewMode === 'history') {
            return 'Administration History';
        }

        if (viewMode === 'scheduled') {
            return 'Scheduled Vaccinations';
        }

        return getTclTitle();
    };

    const getTrackingDescription = () => {
        if (viewMode === 'reports') {
            return 'Access the Vaccine Coverage Report and Immunization Schedule Status Report in PDF and CSV formats.';
        }

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

            <div className="mx-auto flex h-full w-full max-w-7xl min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-7 overflow-x-hidden">
                <div>
                    <h1 className="text-2xl font-bold">
                        Immunization Tracking
                    </h1>

                    <p className="mt-2 text-muted-foreground">
                        Monitor pediatric vaccination schedules and immunization
                        status.
                    </p>
                </div>

                <div className="row g-2 g-sm-3 mx-0 w-full">
                    <div className="col-6 col-md-3">
                        <Card className="h-full">
                            <CardHeader className="p-3 pb-0 sm:p-5 sm:pb-2">
                                <CardTitle className="text-xs sm:text-sm font-medium truncate">
                                    Upcoming Visits
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="p-3 pt-1.5 sm:p-5 sm:pt-0">
                                <p className="text-xl sm:text-3xl font-bold">
                                    {upcomingSummary.count}
                                </p>

                                <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-muted-foreground truncate">
                                    {upcomingSummary.period}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="col-6 col-md-3">
                        <Card className="h-full">
                            <CardHeader className="p-3 pb-0 sm:p-5 sm:pb-2">
                                <CardTitle className="text-xs sm:text-sm font-medium truncate">
                                    Current Age
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="p-3 pt-1.5 sm:p-5 sm:pt-0">
                                <p className="text-xl sm:text-3xl font-bold">
                                    {liveCounts.currentAge}
                                </p>

                                <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-muted-foreground truncate">
                                    Currently due vaccinations
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="col-6 col-md-3">
                        <Card className="h-full">
                            <CardHeader className="p-3 pb-0 sm:p-5 sm:pb-2">
                                <CardTitle className="text-xs sm:text-sm font-medium truncate">
                                    Overdue
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="p-3 pt-1.5 sm:p-5 sm:pt-0">
                                <p className="text-xl sm:text-3xl font-bold">
                                    {liveCounts.overdue}
                                </p>

                                <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-muted-foreground truncate">
                                    Require attention
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="col-6 col-md-3">
                        <Card
                            className={`h-full cursor-pointer transition-all ${
                                viewMode === 'history'
                                    ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                                    : 'hover:border-primary/50'
                            }`}
                            onClick={() => setViewMode('history')}
                        >
                            <CardHeader className="p-3 pb-0 sm:p-5 sm:pb-2">
                                <CardTitle className="text-xs sm:text-sm font-medium truncate">
                                    Completed
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="p-3 pt-1.5 sm:p-5 sm:pt-0">
                                <p className="text-xl sm:text-3xl font-bold">
                                    {liveCounts.completed}
                                </p>

                                <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-muted-foreground truncate">
                                    Completed vaccinations
                                </p>
                            </CardContent>
                        </Card>
                    </div>
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

                <Card className="min-w-0 max-w-full overflow-hidden">
                    <CardHeader className="border-b py-4 sm:py-5">
                        <div className="flex flex-col gap-3 sm:gap-4">
                            <div>
                                <CardTitle className="text-lg sm:text-xl font-semibold">
                                    {getTrackingTitle()}
                                </CardTitle>

                                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                                    {getTrackingDescription()}
                                </p>
                            </div>

                            <div className="flex max-w-full overflow-x-auto no-scrollbar rounded-md border">
                                <button
                                    type="button"
                                    onClick={() => setViewMode('tcl')}
                                    className={`shrink-0 whitespace-nowrap px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors ${
                                        viewMode === 'tcl'
                                            ? 'bg-foreground text-background font-semibold'
                                            : 'hover:bg-muted text-muted-foreground'
                                    }`}
                                >
                                    TCL
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setViewMode('scheduled')
                                    }
                                    className={`shrink-0 whitespace-nowrap border-l px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors ${
                                        viewMode === 'scheduled'
                                            ? 'bg-foreground text-background font-semibold'
                                            : 'hover:bg-muted text-muted-foreground'
                                    }`}
                                >
                                    Scheduled
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setViewMode('history')
                                    }
                                    className={`shrink-0 whitespace-nowrap border-l px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors ${
                                        viewMode === 'history'
                                            ? 'bg-foreground text-background font-semibold'
                                            : 'hover:bg-muted text-muted-foreground'
                                    }`}
                                >
                                    Administration History
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setViewMode('reports')
                                    }
                                    className={`shrink-0 whitespace-nowrap border-l px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors ${
                                        viewMode === 'reports'
                                            ? 'bg-foreground text-background font-semibold'
                                            : 'hover:bg-muted text-muted-foreground'
                                    }`}
                                >
                                    Reports
                                </button>
                            </div>
                        </div>
                    </CardHeader>

                    {/* Integrated Filter Bar - Only for TCL, Scheduled, and History views */}
                    {viewMode !== 'reports' && (
                        <div className="border-b bg-muted/20 px-3 sm:px-6 py-2.5 sm:py-3">
                            <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2">
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                                    <Input
                                        type="search"
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                        placeholder="Search patient or Patient ID..."
                                        className="pl-10 h-8.5 sm:h-9 text-xs sm:text-sm bg-background"
                                    />
                                </div>

                                <Select
                                    value={vaccineFilter}
                                    onValueChange={setVaccineFilter}
                                >
                                    <SelectTrigger className="h-8.5 sm:h-9 text-xs sm:text-sm bg-background">
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
                        </div>
                    )}

                    <CardContent className="p-2 sm:p-6 sm:pt-0">
                        {viewMode === 'tcl' ? (
                            <div className="w-full max-w-full overflow-hidden rounded-lg border">
                                {/* Mobile View (< md): Accordion / Compact Cards matching mockup */}
                                <div
                                    onScroll={handleMasterlistScroll}
                                    className="custom-scrollbar d-block d-md-none p-3 space-y-3 overflow-y-auto"
                                    style={{
                                        maxHeight: 'calc(100vh - 290px)',
                                        minHeight: '400px',
                                    }}
                                >
                                    {visibleMasterlistPatients.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center p-8 text-center space-y-2.5">
                                            <div className="rounded-full bg-muted/60 p-3 text-muted-foreground">
                                                <Baby className="h-6 w-6" />
                                            </div>
                                            <p className="font-medium text-foreground text-sm">
                                                No patient records found
                                            </p>
                                            <p className="text-xs text-muted-foreground max-w-xs">
                                                Try clearing your search query or adjusting your filters.
                                            </p>
                                        </div>
                                    ) : (
                                        visibleMasterlistPatients.map((patient) => {
                                            const fullName = `${patient.first_name}${patient.middle_name ? ` ${patient.middle_name}` : ''} ${patient.last_name}`;
                                            const motherOrGuardian = patient.mother_name
                                                ? `Mother: ${patient.mother_name}`
                                                : patient.guardian_name
                                                  ? `Guardian: ${patient.guardian_name}`
                                                  : 'Mother: —';
                                            const isExpanded = expandedTclPatients.has(patient.id);

                                            return (
                                                <div
                                                    key={patient.id}
                                                    className="rounded-xl border border-border/70 bg-card/60 p-3.5 space-y-3 transition-colors hover:border-border"
                                                >
                                                    {/* Header Row: Patient ID, Child Name, Chevron */}
                                                    <div
                                                        onClick={() => toggleTclPatient(patient.id)}
                                                        className="flex items-center justify-between gap-2 cursor-pointer select-none"
                                                    >
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <span className="font-mono text-xs text-muted-foreground shrink-0">
                                                                {patient.patient_id}
                                                            </span>
                                                            <span className="font-bold text-xs sm:text-sm text-foreground truncate" title={fullName}>
                                                                {fullName}
                                                            </span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            className="text-muted-foreground hover:text-foreground shrink-0 p-0.5"
                                                            aria-label={isExpanded ? 'Collapse' : 'Expand'}
                                                        >
                                                            {isExpanded ? (
                                                                <ChevronDown className="h-4 w-4" />
                                                            ) : (
                                                                <ChevronRight className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                    </div>

                                                    {/* Metadata Section: 2 Columns */}
                                                    <div
                                                        onClick={() => toggleTclPatient(patient.id)}
                                                        className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px] text-muted-foreground cursor-pointer select-none"
                                                    >
                                                        {/* Col 1, Row 1: Age | Birth Date */}
                                                        <div className="flex items-center gap-1.5 truncate">
                                                            <CalendarDays className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                                            <span className="truncate">
                                                                {formatPatientAge(patient.date_of_birth)}
                                                            </span>
                                                            <span className="text-muted-foreground/40 shrink-0">|</span>
                                                            <span className="truncate">
                                                                {formatBirthDate(patient.date_of_birth)}
                                                            </span>
                                                        </div>

                                                        {/* Col 2, Row 1: Mother / Guardian */}
                                                        <div className="flex items-center gap-1.5 truncate">
                                                            <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                                            <span className="truncate" title={motherOrGuardian}>
                                                                {motherOrGuardian}
                                                            </span>
                                                        </div>

                                                        {/* Col 1, Row 2: Phone */}
                                                        <div className="flex items-center gap-1.5 truncate font-mono">
                                                            <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                                            <span className="truncate">
                                                                {patient.guardian_contact || '—'}
                                                            </span>
                                                        </div>

                                                        {/* Col 2, Row 2: Purok / Address */}
                                                        <div className="flex items-center gap-1.5 truncate">
                                                            <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                                            <span className="truncate" title={patient.address || undefined}>
                                                                {patient.address || '—'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Expanded Vaccine Grid and Actions */}
                                                    {isExpanded && (
                                                        <div className="pt-2 border-t border-border/40 space-y-3 animate-in fade-in duration-150">
                                                            {/* 2-Column Vaccine Grid */}
                                                            <div className="grid grid-cols-2 gap-2">
                                                                {([
                                                                    { key: 'BCG', label: 'BCG' },
                                                                    { key: 'Hep B', label: 'Hep B' },
                                                                    { key: 'Pentavalent', label: 'Pentavalent' },
                                                                    { key: 'PCV', label: 'PCV' },
                                                                    { key: 'OPV', label: 'OPV' },
                                                                    { key: 'IPV', label: 'IPV' },
                                                                    { key: 'MCV', label: 'MCV' },
                                                                ] as const).map((v) => {
                                                                    const doses = getDosesForVaccine(patient, v.key);
                                                                    return (
                                                                        <div
                                                                            key={v.key}
                                                                            className="rounded-lg border border-border/60 bg-muted/20 p-2.5 flex items-start gap-2 min-h-[58px]"
                                                                        >
                                                                            <div className="w-0.5 self-stretch rounded-full bg-primary shrink-0 my-0.5" />
                                                                            <div className="flex-1 min-w-0">
                                                                                <div className="font-bold text-xs text-foreground leading-tight">
                                                                                    {v.label}
                                                                                </div>
                                                                                <div className="mt-1 space-y-0.5 font-mono text-[11px] leading-tight text-foreground/90">
                                                                                    {doses.length === 0 ? (
                                                                                        <span className="text-muted-foreground/60">—</span>
                                                                                    ) : (
                                                                                        doses.map((dose) => (
                                                                                            <div
                                                                                                key={`${patient.id}-${v.key}-${dose.id || dose.dose_number}`}
                                                                                                className="truncate whitespace-nowrap"
                                                                                            >
                                                                                                {dose.display_text}
                                                                                            </div>
                                                                                        ))
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>

                                                            {/* Action Buttons: View and Edit */}
                                                            <div className="grid grid-cols-2 gap-2.5 pt-1">
                                                                <Button
                                                                    variant="outline"
                                                                    type="button"
                                                                    onClick={() => router.visit(route('patients.show', patient.id))}
                                                                    className="h-9 w-full flex items-center justify-center gap-1.5 rounded-lg border border-border/70 bg-card/60 hover:bg-muted text-xs font-medium text-foreground transition-colors cursor-pointer"
                                                                >
                                                                    <Eye className="h-3.5 w-3.5" />
                                                                    <span>View</span>
                                                                </Button>

                                                                <Button
                                                                    type="button"
                                                                    onClick={() => router.visit(route('patients.edit', patient.id))}
                                                                    className="h-9 w-full flex items-center justify-center gap-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium transition-colors shadow-xs cursor-pointer"
                                                                >
                                                                    <Pencil className="h-3.5 w-3.5" />
                                                                    <span>Edit</span>
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                {/* Desktop View (md+): 15-Column Registry Table */}
                                <div
                                    ref={masterlistScrollRef}
                                    onScroll={handleMasterlistScroll}
                                    className="custom-scrollbar d-none d-md-block w-full overflow-x-auto overflow-y-auto"
                                    style={{
                                        maxHeight: 'calc(100vh - 290px)',
                                        minHeight: '400px',
                                    }}
                                >
                                    <table className="w-full border-separate border-spacing-0 text-left text-xs min-w-[1850px]">
                                        <thead className="sticky top-0 z-20 bg-muted/95 backdrop-blur-md">
                                            <tr className="border-b border-border/60">
                                                {/* 1. Patient ID (sticky top & left) */}
                                                <th
                                                    scope="col"
                                                    className="sticky left-0 top-0 z-30 min-w-[110px] w-[110px] bg-muted/95 px-3.5 py-3 font-semibold text-foreground border-b border-r border-border/60 whitespace-nowrap cursor-pointer select-none transition-colors hover:bg-muted"
                                                    onClick={() => handleMasterlistSort('patient_id')}
                                                >
                                                    <div className="flex items-center gap-1.5">
                                                        <span>Patient ID</span>
                                                        {masterlistSortField === 'patient_id' ? (
                                                            masterlistSortOrder === 'asc' ? (
                                                                <ArrowUp className="h-3.5 w-3.5 text-foreground" />
                                                            ) : (
                                                                <ArrowDown className="h-3.5 w-3.5 text-foreground" />
                                                            )
                                                        ) : (
                                                            <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground/60" />
                                                        )}
                                                    </div>
                                                </th>

                                                {/* 2. Child Name (sticky top & left at 110px) */}
                                                <th
                                                    scope="col"
                                                    className="sticky left-[110px] top-0 z-30 min-w-[190px] w-[190px] bg-muted/95 px-3.5 py-3 font-semibold text-foreground border-b border-r border-border/60 whitespace-nowrap cursor-pointer select-none transition-colors hover:bg-muted"
                                                    onClick={() => handleMasterlistSort('name')}
                                                >
                                                    <div className="flex items-center gap-1.5">
                                                        <span>Child Name</span>
                                                        {masterlistSortField === 'name' ? (
                                                            masterlistSortOrder === 'asc' ? (
                                                                <ArrowUp className="h-3.5 w-3.5 text-foreground" />
                                                            ) : (
                                                                <ArrowDown className="h-3.5 w-3.5 text-foreground" />
                                                            )
                                                        ) : (
                                                            <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground/60" />
                                                        )}
                                                    </div>
                                                </th>

                                                {/* 3. Age */}
                                                <th
                                                    scope="col"
                                                    className="sticky top-0 z-20 min-w-[95px] w-[95px] bg-muted/95 px-3.5 py-3 font-semibold text-foreground border-b border-r border-border/60 whitespace-nowrap cursor-pointer select-none transition-colors hover:bg-muted"
                                                    onClick={() => handleMasterlistSort('age')}
                                                >
                                                    <div className="flex items-center gap-1.5">
                                                        <span>Age</span>
                                                        {masterlistSortField === 'age' ? (
                                                            masterlistSortOrder === 'asc' ? (
                                                                <ArrowUp className="h-3.5 w-3.5 text-foreground" />
                                                            ) : (
                                                                <ArrowDown className="h-3.5 w-3.5 text-foreground" />
                                                            )
                                                        ) : (
                                                            <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground/60" />
                                                        )}
                                                    </div>
                                                </th>

                                                {/* 4. Birth Date */}
                                                <th
                                                    scope="col"
                                                    className="sticky top-0 z-20 min-w-[110px] w-[110px] bg-muted/95 px-3.5 py-3 font-semibold text-foreground border-b border-r border-border/60 whitespace-nowrap"
                                                >
                                                    Birth Date
                                                </th>

                                                {/* 5. Mother / Guardian */}
                                                <th
                                                    scope="col"
                                                    className="sticky top-0 z-20 min-w-[160px] w-[160px] bg-muted/95 px-3.5 py-3 font-semibold text-foreground border-b border-r border-border/60 whitespace-nowrap"
                                                >
                                                    Mother / Guardian
                                                </th>

                                                {/* 6. Contact */}
                                                <th
                                                    scope="col"
                                                    className="sticky top-0 z-20 min-w-[130px] w-[130px] bg-muted/95 px-3.5 py-3 font-semibold text-foreground border-b border-r border-border/60 whitespace-nowrap"
                                                >
                                                    Contact
                                                </th>

                                                {/* 7. Address / Purok */}
                                                <th
                                                    scope="col"
                                                    className="sticky top-0 z-20 min-w-[140px] w-[140px] bg-muted/95 px-3.5 py-3 font-semibold text-foreground border-b border-r border-border/60 whitespace-nowrap"
                                                >
                                                    Address / Purok
                                                </th>

                                                {/* 8. BCG */}
                                                <th
                                                    scope="col"
                                                    className={`sticky top-0 z-20 min-w-[135px] w-[135px] px-3.5 py-3 font-semibold border-b border-r border-border/60 whitespace-nowrap transition-colors ${
                                                        activeVaccineKey === 'BCG'
                                                            ? 'bg-primary/15 text-primary'
                                                            : 'bg-muted/95 text-foreground'
                                                    }`}
                                                >
                                                    BCG
                                                </th>

                                                {/* 9. Hep B */}
                                                <th
                                                    scope="col"
                                                    className={`sticky top-0 z-20 min-w-[140px] w-[140px] px-3.5 py-3 font-semibold border-b border-r border-border/60 whitespace-nowrap transition-colors ${
                                                        activeVaccineKey === 'Hep B'
                                                            ? 'bg-primary/15 text-primary'
                                                            : 'bg-muted/95 text-foreground'
                                                    }`}
                                                >
                                                    Hep B
                                                </th>

                                                {/* 10. Pentavalent */}
                                                <th
                                                    scope="col"
                                                    className={`sticky top-0 z-20 min-w-[140px] w-[140px] px-3.5 py-3 font-semibold border-b border-r border-border/60 whitespace-nowrap transition-colors ${
                                                        activeVaccineKey === 'Pentavalent'
                                                            ? 'bg-primary/15 text-primary'
                                                            : 'bg-muted/95 text-foreground'
                                                    }`}
                                                >
                                                    Pentavalent
                                                </th>

                                                {/* 11. PCV */}
                                                <th
                                                    scope="col"
                                                    className={`sticky top-0 z-20 min-w-[140px] w-[140px] px-3.5 py-3 font-semibold border-b border-r border-border/60 whitespace-nowrap transition-colors ${
                                                        activeVaccineKey === 'PCV'
                                                            ? 'bg-primary/15 text-primary'
                                                            : 'bg-muted/95 text-foreground'
                                                    }`}
                                                >
                                                    PCV
                                                </th>

                                                {/* 12. OPV */}
                                                <th
                                                    scope="col"
                                                    className={`sticky top-0 z-20 min-w-[140px] w-[140px] px-3.5 py-3 font-semibold border-b border-r border-border/60 whitespace-nowrap transition-colors ${
                                                        activeVaccineKey === 'OPV'
                                                            ? 'bg-primary/15 text-primary'
                                                            : 'bg-muted/95 text-foreground'
                                                    }`}
                                                >
                                                    OPV
                                                </th>

                                                {/* 13. IPV */}
                                                <th
                                                    scope="col"
                                                    className={`sticky top-0 z-20 min-w-[140px] w-[140px] px-3.5 py-3 font-semibold border-b border-r border-border/60 whitespace-nowrap transition-colors ${
                                                        activeVaccineKey === 'IPV'
                                                            ? 'bg-primary/15 text-primary'
                                                            : 'bg-muted/95 text-foreground'
                                                    }`}
                                                >
                                                    IPV
                                                </th>

                                                {/* 14. MCV */}
                                                <th
                                                    scope="col"
                                                    className={`sticky top-0 z-20 min-w-[140px] w-[140px] px-3.5 py-3 font-semibold border-b border-r border-border/60 whitespace-nowrap transition-colors ${
                                                        activeVaccineKey === 'MCV'
                                                            ? 'bg-primary/15 text-primary'
                                                            : 'bg-muted/95 text-foreground'
                                                    }`}
                                                >
                                                    MCV
                                                </th>

                                                {/* 15. Actions */}
                                                <th
                                                    scope="col"
                                                    className="sticky top-0 z-20 min-w-[90px] w-[90px] bg-muted/95 px-3 py-3 text-center font-semibold text-foreground border-b border-border/60 whitespace-nowrap"
                                                >
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {visibleMasterlistPatients.length === 0 ? (
                                                <tr>
                                                    <td
                                                        colSpan={15}
                                                        className="px-6 py-16 text-center text-muted-foreground"
                                                    >
                                                        <div className="flex flex-col items-center justify-center space-y-2.5">
                                                            <div className="rounded-full bg-muted/60 p-3 text-muted-foreground">
                                                                <Baby className="h-6 w-6" />
                                                            </div>
                                                            <p className="font-medium text-foreground text-sm">
                                                                No patient records found
                                                            </p>
                                                            <p className="text-xs text-muted-foreground max-w-sm">
                                                                Try clearing your search query or adjusting your filters to find children in the registry.
                                                            </p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                visibleMasterlistPatients.map((patient) => {
                                                    const fullName = `${patient.first_name}${patient.middle_name ? ` ${patient.middle_name}` : ''} ${patient.last_name}`;
                                                    const motherOrGuardian = patient.guardian_name || patient.mother_name || '—';

                                                    return (
                                                        <tr
                                                            key={patient.id}
                                                            className="group border-b border-border/40 hover:bg-muted/20 transition-colors"
                                                        >
                                                            {/* 1. Patient ID: sticky left */}
                                                            <td className="sticky left-0 z-10 min-w-[110px] w-[110px] bg-card group-hover:bg-muted/30 px-3.5 py-3 font-mono text-xs border-b border-r border-border/40 whitespace-nowrap text-foreground/90 font-medium transition-colors">
                                                                {patient.patient_id}
                                                            </td>

                                                            {/* 2. Child Name: sticky left at 110px */}
                                                            <td className="sticky left-[110px] z-10 min-w-[190px] w-[190px] bg-card group-hover:bg-muted/30 px-3.5 py-3 font-medium text-xs border-b border-r border-border/40 whitespace-nowrap transition-colors">
                                                                <div
                                                                    className="truncate max-w-[180px] text-foreground font-semibold"
                                                                    title={fullName}
                                                                >
                                                                    {fullName}
                                                                </div>
                                                            </td>

                                                            {/* 3. Age */}
                                                            <td className="min-w-[95px] w-[95px] px-3.5 py-3 text-xs border-b border-r border-border/40 whitespace-nowrap text-foreground/80">
                                                                {formatPatientAge(patient.date_of_birth)}
                                                            </td>

                                                            {/* 4. Birth Date */}
                                                            <td className="min-w-[110px] w-[110px] px-3.5 py-3 text-xs border-b border-r border-border/40 whitespace-nowrap text-foreground/80">
                                                                {formatBirthDate(patient.date_of_birth)}
                                                            </td>

                                                            {/* 5. Mother / Guardian */}
                                                            <td className="min-w-[160px] w-[160px] px-3.5 py-3 text-xs border-b border-r border-border/40">
                                                                <div
                                                                    className="truncate max-w-[150px] text-foreground/80"
                                                                    title={motherOrGuardian}
                                                                >
                                                                    {motherOrGuardian}
                                                                </div>
                                                            </td>

                                                            {/* 6. Contact */}
                                                            <td className="min-w-[130px] w-[130px] px-3.5 py-3 font-mono text-[11px] border-b border-r border-border/40 whitespace-nowrap text-foreground/80">
                                                                {patient.guardian_contact || '—'}
                                                            </td>

                                                            {/* 7. Address / Purok */}
                                                            <td className="min-w-[140px] w-[140px] px-3.5 py-3 text-xs border-b border-r border-border/40">
                                                                <div
                                                                    className="truncate max-w-[130px] text-foreground/80"
                                                                    title={patient.address || undefined}
                                                                >
                                                                    {patient.address || '—'}
                                                                </div>
                                                            </td>

                                                            {/* 8. BCG */}
                                                            <td
                                                                className={`min-w-[135px] w-[135px] px-3.5 py-3 align-top border-b border-r border-border/40 transition-colors ${
                                                                    activeVaccineKey === 'BCG' ? 'bg-primary/5' : ''
                                                                }`}
                                                            >
                                                                {renderVaccineDoses(patient, 'BCG')}
                                                            </td>

                                                            {/* 9. Hep B */}
                                                            <td
                                                                className={`min-w-[140px] w-[140px] px-3.5 py-3 align-top border-b border-r border-border/40 transition-colors ${
                                                                    activeVaccineKey === 'Hep B' ? 'bg-primary/5' : ''
                                                                }`}
                                                            >
                                                                {renderVaccineDoses(patient, 'Hep B')}
                                                            </td>

                                                            {/* 10. Pentavalent */}
                                                            <td
                                                                className={`min-w-[140px] w-[140px] px-3.5 py-3 align-top border-b border-r border-border/40 transition-colors ${
                                                                    activeVaccineKey === 'Pentavalent' ? 'bg-primary/5' : ''
                                                                }`}
                                                            >
                                                                {renderVaccineDoses(patient, 'Pentavalent')}
                                                            </td>

                                                            {/* 11. PCV */}
                                                            <td
                                                                className={`min-w-[140px] w-[140px] px-3.5 py-3 align-top border-b border-r border-border/40 transition-colors ${
                                                                    activeVaccineKey === 'PCV' ? 'bg-primary/5' : ''
                                                                }`}
                                                            >
                                                                {renderVaccineDoses(patient, 'PCV')}
                                                            </td>

                                                            {/* 12. OPV */}
                                                            <td
                                                                className={`min-w-[140px] w-[140px] px-3.5 py-3 align-top border-b border-r border-border/40 transition-colors ${
                                                                    activeVaccineKey === 'OPV' ? 'bg-primary/5' : ''
                                                                }`}
                                                            >
                                                                {renderVaccineDoses(patient, 'OPV')}
                                                            </td>

                                                            {/* 13. IPV */}
                                                            <td
                                                                className={`min-w-[140px] w-[140px] px-3.5 py-3 align-top border-b border-r border-border/40 transition-colors ${
                                                                    activeVaccineKey === 'IPV' ? 'bg-primary/5' : ''
                                                                }`}
                                                            >
                                                                {renderVaccineDoses(patient, 'IPV')}
                                                            </td>

                                                            {/* 14. MCV */}
                                                            <td
                                                                className={`min-w-[140px] w-[140px] px-3.5 py-3 align-top border-b border-r border-border/40 transition-colors ${
                                                                    activeVaccineKey === 'MCV' ? 'bg-primary/5' : ''
                                                                }`}
                                                            >
                                                                {renderVaccineDoses(patient, 'MCV')}
                                                            </td>

                                                            {/* 15. Actions */}
                                                            <td className="min-w-[90px] w-[90px] px-2 py-3 border-b border-border/40 text-center">
                                                                <div className="flex items-center justify-center gap-1.5">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        type="button"
                                                                        className="h-7 w-7 rounded-lg border border-border/60 bg-background/50 hover:bg-muted hover:text-foreground text-muted-foreground transition-colors cursor-pointer"
                                                                        title="View patient record"
                                                                        onClick={() => router.visit(`/patients/${patient.id}`)}
                                                                    >
                                                                        <Eye className="h-3.5 w-3.5" />
                                                                        <span className="sr-only">View</span>
                                                                    </Button>

                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        type="button"
                                                                        className="h-7 w-7 rounded-lg border border-border/60 bg-background/50 hover:bg-muted hover:text-foreground text-muted-foreground transition-colors cursor-pointer"
                                                                        title="Edit patient record"
                                                                        onClick={() => router.visit(`/patients/${patient.id}/edit`)}
                                                                    >
                                                                        <Pencil className="h-3.5 w-3.5" />
                                                                        <span className="sr-only">Edit</span>
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : viewMode === 'scheduled' ? (
                            <div className="w-full max-w-full overflow-hidden rounded-lg border">
                                {/* Action Bar for Scheduled Sessions */}
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/25 px-4 py-3 sm:px-5">
                                    <div className="flex items-center gap-2">
                                        <CalendarDays className="h-4 w-4 text-primary" />
                                        <span className="text-xs font-semibold text-foreground">
                                            {scheduledGroups.length} Scheduled Patient{scheduledGroups.length === 1 ? '' : 's'}
                                        </span>
                                    </div>

                                    {scheduledGroups.length > 0 && (
                                        <button
                                            type="button"
                                            disabled={isSendingReminder === 'bulk' || sentReminderKeys.has('bulk')}
                                            onClick={handleSendBulkReminders}
                                            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer shadow-2xs ${
                                                sentReminderKeys.has('bulk')
                                                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                    : 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50'
                                            }`}
                                            title="Send reminder notifications to all guardians with upcoming scheduled visits"
                                        >
                                            {sentReminderKeys.has('bulk') ? (
                                                <>
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                                    Reminders sent to all due
                                                </>
                                            ) : isSendingReminder === 'bulk' ? (
                                                'Sending reminders...'
                                            ) : (
                                                <>
                                                    <Bell className="h-3.5 w-3.5" />
                                                    Send Reminders to All Due
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>

                                {/* Prominent System Message for Reminders */}
                                {reminderNotice && (
                                    <div
                                        className={`flex items-center justify-between gap-3 border-b px-4 py-3 text-xs sm:px-5 transition-all ${
                                            reminderNotice.type === 'error'
                                                ? 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200'
                                                : reminderNotice.type === 'info'
                                                  ? 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-200'
                                                  : 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                            <span className="font-semibold">{reminderNotice.message}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setReminderNotice(null)}
                                            className="rounded p-1 hover:opacity-75"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                )}

                                {/* Mobile View (< md): Compact Scheduled Cards */}
                                <div className="d-block d-md-none divide-y divide-border/60">
                                    {scheduledGroups.length === 0 ? (
                                        <div className="p-6 text-center space-y-2">
                                            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                                <CalendarDays className="h-5 w-5" />
                                            </div>
                                            <p className="font-medium text-xs text-foreground">No scheduled vaccinations</p>
                                            <p className="text-[11px] text-muted-foreground">
                                                No appointments match current filters.
                                            </p>
                                        </div>
                                    ) : (
                                        scheduledGroups.map((group) => {
                                            const isExpanded = expandedScheduledGroups.has(group.key);
                                            return (
                                                <div key={group.key} className="p-3 space-y-2 hover:bg-muted/15 transition-colors">
                                                    <div
                                                        onClick={() => toggleScheduledGroup(group.key)}
                                                        className="cursor-pointer space-y-1.5"
                                                    >
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                {isExpanded ? (
                                                                    <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                                                ) : (
                                                                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                                                )}
                                                                <p className="font-semibold text-xs text-foreground truncate">{group.patient_name}</p>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 shrink-0">
                                                                {group.days_due && group.days_due > 0 && group.schedule_label !== 'Current Age' ? (
                                                                    <span className="text-[10px] text-muted-foreground">
                                                                        {group.days_due}d due
                                                                    </span>
                                                                ) : null}
                                                                <span
                                                                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getPriorityClass(
                                                                        group.schedule_label,
                                                                    )}`}
                                                                >
                                                                    {group.schedule_label ?? '—'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between text-[11px] text-muted-foreground pl-5.5">
                                                            <span className="inline-flex items-center gap-1">
                                                                <CalendarDays className="h-3 w-3" />
                                                                {group.scheduled_date ? formatDate(group.scheduled_date) : 'No date'}
                                                            </span>
                                                            <span className="font-medium text-foreground/80">
                                                                {group.rows.length} {group.rows.length === 1 ? 'vaccine' : 'vaccines'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {isExpanded && (
                                                        <div className="ml-5.5 border-t border-border/40 pt-2 space-y-2">
                                                            <div className="space-y-1.5">
                                                                {group.rows.map((row) => (
                                                                    <div key={row.id} className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded bg-muted/30">
                                                                        <span className="font-medium text-foreground">{row.vaccine_name ?? 'Unknown vaccine'}</span>
                                                                        <span className="text-muted-foreground text-[11px]">Dose {row.dose_number}</span>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/30">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => router.visit(route('patients.show', group.patient_id))}
                                                                    className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
                                                                >
                                                                    <Eye className="h-3 w-3" />
                                                                    View
                                                                </button>
                                                                <div className="flex items-center gap-1.5">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleOpenRescheduleModal(group.patient_id, group.patient_name, group.scheduled_date)}
                                                                        className="inline-flex items-center gap-1 text-[11px] font-medium border bg-background px-2 py-1 rounded hover:bg-muted transition-colors"
                                                                    >
                                                                        <CalendarDays className="h-3 w-3 text-primary" />
                                                                        Adjust
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        disabled={isSendingReminder === group.key || sentReminderKeys.has(group.key)}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleSendPatientReminder(group.patient_id, group.key);
                                                                        }}
                                                                        className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded transition-colors ${
                                                                            sentReminderKeys.has(group.key)
                                                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                                                                                : 'bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50'
                                                                        }`}
                                                                    >
                                                                        {sentReminderKeys.has(group.key) ? (
                                                                            <>
                                                                                <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                                                                Reminders sent
                                                                            </>
                                                                        ) : isSendingReminder === group.key ? (
                                                                            'Sending...'
                                                                        ) : (
                                                                            <>
                                                                                <Bell className="h-3 w-3" />
                                                                                Send Reminder
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                {/* Desktop View (md+): Fluid Table */}
                                <div className="d-none d-md-block w-full max-w-full overflow-x-auto">
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
                                                                        <div className="flex flex-col items-center justify-center gap-0.5">
                                                                            <span
                                                                                className={`font-semibold ${getPriorityClass(
                                                                                    group.schedule_label,
                                                                                )}`}
                                                                            >
                                                                                {group.schedule_label ??
                                                                                    '—'}
                                                                            </span>
                                                                            {group.days_due && group.days_due > 0 && group.schedule_label !== 'Current Age' ? (
                                                                                <span className="text-[11px] text-muted-foreground font-medium">
                                                                                    {group.days_due} days due
                                                                                </span>
                                                                            ) : null}
                                                                        </div>
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
                                                                                                    <div className="flex flex-col items-center justify-center gap-0.5">
                                                                                                        <span
                                                                                                            className={`font-semibold ${getPriorityClass(
                                                                                                                row.schedule_label,
                                                                                                            )}`}
                                                                                                        >
                                                                                                            {row.schedule_label ??
                                                                                                                '—'}
                                                                                                        </span>
                                                                                                        {row.days_due && row.days_due > 0 && row.schedule_label !== 'Current Age' ? (
                                                                                                            <span className="text-[10px] text-muted-foreground font-medium">
                                                                                                                {row.days_due} days due
                                                                                                            </span>
                                                                                                        ) : null}
                                                                                                    </div>
                                                                                                </td>
                                                                                            </tr>
                                                                                        ),
                                                                                    )}
                                                                                </tbody>
                                                                            </table>

                                                                            <div className="flex items-center justify-between border-t bg-muted/20 px-6 py-3">
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() =>
                                                                                        router.visit(
                                                                                            route(
                                                                                                'patients.show',
                                                                                                group.patient_id,
                                                                                            ),
                                                                                        )
                                                                                    }
                                                                                    className="inline-flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                                                                                >
                                                                                    <Eye className="h-3.5 w-3.5" />
                                                                                    View patient record
                                                                                </button>

                                                                                <div className="flex items-center gap-2">
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => handleOpenRescheduleModal(group.patient_id, group.patient_name, group.scheduled_date)}
                                                                                        className="inline-flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                                                                                    >
                                                                                        <CalendarDays className="h-3.5 w-3.5 text-primary" />
                                                                                        Adjust Date
                                                                                    </button>

                                                                                    <button
                                                                                        type="button"
                                                                                        disabled={isSendingReminder === group.key || sentReminderKeys.has(group.key)}
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            handleSendPatientReminder(
                                                                                                group.patient_id,
                                                                                                group.key,
                                                                                            );
                                                                                        }}
                                                                                        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium shadow-2xs transition-colors cursor-pointer ${
                                                                                            sentReminderKeys.has(group.key)
                                                                                                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                                                                                : 'bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50'
                                                                                        }`}
                                                                                    >
                                                                                        {sentReminderKeys.has(group.key) ? (
                                                                                            <>
                                                                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                                                                Reminders sent
                                                                                            </>
                                                                                        ) : isSendingReminder === group.key ? (
                                                                                            'Sending reminder...'
                                                                                        ) : (
                                                                                            <>
                                                                                                <Bell className="h-3.5 w-3.5" />
                                                                                                Send Visit Reminder to Guardian
                                                                                            </>
                                                                                        )}
                                                                                    </button>
                                                                                </div>
                                                                            </div>
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
                        ) : viewMode === 'history' ? (
                            <div className="w-full max-w-full overflow-hidden rounded-lg border">
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

                                {/* Mobile View (< md): Compact Administration History Cards */}
                                <div className="d-block d-md-none divide-y divide-border/60">
                                    {filteredCompletedRows.length === 0 ? (
                                        <div className="p-6 text-center space-y-2">
                                            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                                <History className="h-5 w-5" />
                                            </div>
                                            <p className="font-medium text-xs text-foreground">No administration records found</p>
                                            <p className="text-[11px] text-muted-foreground">
                                                {normalizedSearch || vaccineFilter !== 'all'
                                                    ? 'No records match search/filter criteria.'
                                                    : 'No pediatric vaccinations recorded yet.'}
                                            </p>
                                        </div>
                                    ) : (
                                        filteredCompletedRows.map((row) => (
                                            <div key={row.id} className="p-3 space-y-2 hover:bg-muted/15 transition-colors">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <p className="font-semibold text-xs text-foreground">{row.patient_name}</p>
                                                        <p className="text-[10px] text-muted-foreground font-mono">{row.patient_code ?? 'PID —'}</p>
                                                    </div>
                                                    <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                                                        <CalendarDays className="h-3 w-3" />
                                                        {formatDate(row.date_administered)}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between text-xs py-1 px-2 rounded bg-muted/20">
                                                    <span className="font-medium text-foreground">{row.vaccine_name ?? 'Unknown vaccine'}</span>
                                                    <span className="text-primary font-semibold text-[11px]">Dose {row.dose_number}</span>
                                                </div>

                                                <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px]">
                                                    <div className="text-muted-foreground text-[10px] truncate max-w-[60%]">
                                                        <span>Batch: <strong className="font-mono text-foreground">{row.batch_number || '—'}</strong></span>
                                                        <span className="ml-1.5">• {row.administered_by_name}</span>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => router.visit(route('patients.show', row.patient_id))}
                                                        className="inline-flex items-center gap-1 rounded border bg-background px-2 py-1 text-[11px] font-medium transition-colors hover:bg-muted shrink-0"
                                                    >
                                                        <Eye className="h-3 w-3" />
                                                        View
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

{/* Desktop View (md+): Scrollable Table */}
                                <div
                                    className="custom-scrollbar d-none d-md-block w-full overflow-x-auto overflow-y-auto"
                                    style={{
                                        maxHeight: 'calc(100vh - 290px)',
                                        minHeight: '400px',
                                    }}
                                >
                                    <table className="w-full border-separate border-spacing-0 text-left text-xs min-w-[1280px]">
                                        <thead className="sticky top-0 z-20 bg-muted/95 backdrop-blur-md">
                                            <tr className="border-b border-border/60">
                                                <th
                                                    scope="col"
                                                    className="sticky left-0 top-0 z-30 min-w-[140px] w-[140px] bg-muted/95 px-4 py-3.5 font-semibold text-foreground border-b border-r border-border/60 whitespace-nowrap"
                                                >
                                                    Date Administered
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="sticky left-[140px] top-0 z-30 min-w-[180px] w-[180px] bg-muted/95 px-4 py-3.5 font-semibold text-foreground border-b border-r border-border/60 whitespace-nowrap"
                                                >
                                                    Patient
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="sticky top-0 z-20 min-w-[150px] w-[150px] bg-muted/95 px-4 py-3.5 font-semibold text-foreground border-b border-r border-border/60 whitespace-nowrap"
                                                >
                                                    Vaccine & Dose
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="sticky top-0 z-20 min-w-[120px] w-[120px] bg-muted/95 px-4 py-3.5 font-semibold text-foreground border-b border-r border-border/60 whitespace-nowrap"
                                                >
                                                    Batch No.
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="sticky top-0 z-20 min-w-[140px] w-[140px] bg-muted/95 px-4 py-3.5 font-semibold text-foreground border-b border-r border-border/60 whitespace-nowrap"
                                                >
                                                    Injection Site
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="sticky top-0 z-20 min-w-[150px] w-[150px] bg-muted/95 px-4 py-3.5 font-semibold text-foreground border-b border-r border-border/60 whitespace-nowrap"
                                                >
                                                    Administered By
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="sticky top-0 z-20 min-w-[150px] w-[150px] bg-muted/95 px-4 py-3.5 font-semibold text-foreground border-b border-r border-border/60 whitespace-nowrap"
                                                >
                                                    Consent Given By
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="sticky top-0 z-20 min-w-[160px] w-[160px] bg-muted/95 px-4 py-3.5 font-semibold text-foreground border-b border-r border-border/60 whitespace-nowrap"
                                                >
                                                    Remarks
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="sticky top-0 z-20 min-w-[90px] w-[90px] bg-muted/95 px-4 py-3.5 text-right font-semibold text-foreground border-b border-border/60 whitespace-nowrap"
                                                >
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-border/40">
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
                                                    <tr key={row.id} className="group border-b border-border/40 hover:bg-muted/20 transition-colors">
                                                        <td className="sticky left-0 z-10 min-w-[140px] w-[140px] bg-card group-hover:bg-muted/30 px-4 py-3.5 whitespace-nowrap text-xs font-medium border-b border-r border-border/40 transition-colors">
                                                            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                                                                <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                                                                {formatDate(row.date_administered)}
                                                            </span>
                                                        </td>

                                                        <td className="sticky left-[140px] z-10 min-w-[180px] w-[180px] bg-card group-hover:bg-muted/30 px-4 py-3.5 border-b border-r border-border/40 transition-colors">
                                                            <div className="font-medium leading-snug truncate max-w-[170px]" title={row.patient_name}>
                                                                {row.patient_name}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground font-mono">
                                                                {row.patient_code ?? 'PID —'}
                                                            </div>
                                                        </td>

                                                        <td className="min-w-[150px] w-[150px] px-4 py-3.5 whitespace-nowrap border-b border-r border-border/40">
                                                            <div className="font-medium text-foreground">
                                                                {row.vaccine_name ?? 'Unknown vaccine'}
                                                            </div>
                                                            <div className="inline-flex items-center mt-0.5 rounded border border-primary/20 bg-primary/5 px-1.5 py-0.5 text-[11px] font-medium text-primary">
                                                                Dose {row.dose_number}
                                                            </div>
                                                        </td>

                                                        <td className="min-w-[120px] w-[120px] px-4 py-3.5 whitespace-nowrap border-b border-r border-border/40">
                                                            <span className="rounded bg-muted px-2 py-1 font-mono text-xs font-medium">
                                                                {row.batch_number || '—'}
                                                            </span>
                                                        </td>

                                                        <td className="min-w-[140px] w-[140px] px-4 py-3.5 text-xs text-muted-foreground max-w-[160px] truncate border-b border-r border-border/40" title={row.injection_site || undefined}>
                                                            {row.injection_site || '—'}
                                                        </td>

                                                        <td className="min-w-[150px] w-[150px] px-4 py-3.5 whitespace-nowrap text-xs border-b border-r border-border/40">
                                                            <span className="font-medium text-foreground">
                                                                {row.administered_by_name}
                                                            </span>
                                                        </td>

                                                        <td className="min-w-[150px] w-[150px] px-4 py-3.5 whitespace-nowrap text-xs border-b border-r border-border/40">
                                                            {row.consent_given_by ? (
                                                                <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-medium">
                                                                    <CheckCircle2 className="h-3 w-3" />
                                                                    {row.consent_given_by}
                                                                </span>
                                                            ) : (
                                                                <span className="text-muted-foreground">—</span>
                                                            )}
                                                        </td>

                                                        <td className="min-w-[160px] w-[160px] px-4 py-3.5 text-xs text-muted-foreground max-w-[180px] truncate border-b border-r border-border/40" title={row.remarks || undefined}>
                                                            {row.remarks || '—'}
                                                        </td>

                                                        <td className="min-w-[90px] w-[90px] px-4 py-3.5 text-right whitespace-nowrap border-b border-border/40">
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
                        ) : (
                            <div className="p-1 sm:p-2">
                                <ReportsHub
                                    coverageReport={coverageReport}
                                    scheduleStatusReport={scheduleStatusReport}
                                    vaccines={vaccines}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* RESCHEDULE / ADJUST SCHEDULED VISIT DATE MODAL */}
            {rescheduleTarget && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 animate-in fade-in duration-150">
                    <div className="w-full max-w-md rounded-xl border bg-background shadow-2xl overflow-hidden flex flex-col">
                        <div className="flex items-start justify-between gap-3 border-b px-5 py-4 bg-muted/20">
                            <div className="flex items-center gap-2.5 text-primary">
                                <div className="rounded-full bg-primary/10 p-2 text-primary shrink-0">
                                    <CalendarDays className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-base sm:text-lg font-bold text-foreground">
                                        Adjust Scheduled Visit Date
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Adjust the appointment date for {rescheduleTarget.patientName}.
                                    </p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                disabled={isRescheduling}
                                onClick={() => setRescheduleTarget(null)}
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
                                <Label htmlFor="sched-reschedule-date" className="text-xs font-semibold">
                                    New Scheduled Date (Wednesday) <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="sched-reschedule-date"
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
                                <Label htmlFor="sched-reschedule-reason" className="text-xs font-semibold">
                                    Reason for Adjustment (Optional)
                                </Label>
                                <Input
                                    id="sched-reschedule-reason"
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
                                    onClick={() => setRescheduleTarget(null)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={isRescheduling || !rescheduleDate || !isWednesday(rescheduleDate)}
                                >
                                    {isRescheduling ? 'Saving...' : 'Save Scheduled Date'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}