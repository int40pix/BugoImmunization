import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import {
    Baby,
    Camera,
    ChevronRight,
    Eye,
    Keyboard,
    Plus,
    Pencil,
    QrCode,
    Search,
    ScanLine,
    UsersRound,
    XCircle,
} from 'lucide-react';
import { QrScannerModal } from '@/components/qr-scanner-modal';

type Patient = {
    id: number;
    patient_id: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    date_of_birth: string;
    guardian_name: string | null;
    sex: string;
    status: string;
};

type FamilyChild = {
    id: number;
    patient_id: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    date_of_birth: string;
    status: string;
    immunization_status: string;
};

type Guardian = {
    id: number;
    guardian_no: string;
    name: string;
    email: string;
    contact_number: string | null;
    mother_maiden_name: string | null;
    father_name: string | null;
    status: string;
    immunization_status: string;
    patients_count: number;
    patients: FamilyChild[];
};

type Filters = {
    search?: string;
    sex?: string;
    status?: string;
    age_group?: string;
};

type Tab = 'patients' | 'families';
type FamilyStatusFilter =
    | 'all'
    | 'Overdue'
    | 'Due Now'
    | 'Upcoming'
    | 'Completed';

const placeholderVaccinationStatus = 'Uncomplete';

export default function PatientIndex() {
    const { patients, guardians, filters } = usePage<{
        patients: Patient[];
        guardians: Guardian[];
        filters: Filters;
    }>().props;

    const [activeTab, setActiveTab] = useState<Tab>('patients');
    const [search, setSearch] = useState(filters.search || '');
    const [sex, setSex] = useState(filters.sex || 'both');
    const [familySearch, setFamilySearch] = useState('');
    const [familyStatusFilter, setFamilyStatusFilter] =
        useState<FamilyStatusFilter>('all');

    const [scannerOpen, setScannerOpen] = useState(false);
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        if (activeTab !== 'patients') {
            return;
        }

        const timeout = setTimeout(() => {
            router.get(
                route('patients.index'),
                { search, sex },
                {
                    preserveState: true,
                    replace: true,
                },
            );
        }, 400);

        return () => clearTimeout(timeout);
    }, [search, sex, activeTab]);

    const filteredFamilies = useMemo(() => {
        const term = familySearch.trim().toLowerCase();

        return guardians.filter((guardian) => {
            if (
                familyStatusFilter !== 'all' &&
                !guardian.patients.some(
                    (patient) =>
                        patient.immunization_status === familyStatusFilter,
                )
            ) {
                return false;
            }

            if (!term) {
                return true;
            }

            const guardianMatch = [
                guardian.guardian_no,
                guardian.name,
                guardian.email,
                guardian.contact_number ?? '',
            ].some((value) => value.toLowerCase().includes(term));

            if (guardianMatch) {
                return true;
            }

            return guardian.patients.some((patient) =>
                [
                    patient.patient_id,
                    patient.first_name,
                    patient.middle_name ?? '',
                    patient.last_name,
                ].some((value) => value.toLowerCase().includes(term)),
            );
        });
    }, [guardians, familySearch, familyStatusFilter]);

    const getImmunizationStatusClass = (status: string) => {
        switch (status) {
            case 'Overdue':
                return 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300';
            case 'Due Now':
                return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300';
            case 'Upcoming':
                return 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-300';
            case 'Completed':
                return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300';
            default:
                return 'border-border bg-muted/40 text-muted-foreground';
        }
    };



    const parseDateOfBirth = (dateOfBirth: string) => {
        if (!dateOfBirth) {
            return null;
        }

        const datePart = dateOfBirth.split('T')[0];
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

        const date = new Date(year, month - 1, day);

        if (Number.isNaN(date.getTime())) {
            return null;
        }

        return date;
    };

    const formatDateOfBirth = (dateOfBirth: string) => {
        const date = parseDateOfBirth(dateOfBirth);

        if (!date) {
            return '—';
        }

        return date.toLocaleDateString('en-US', {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getFractionCharacter = (fraction: number) => {
        if (fraction === 0.25) return '¼';
        if (fraction === 0.5) return '½';
        if (fraction === 0.75) return '¾';
        return '';
    };

    const calculateAge = (dateOfBirth: string) => {
        const birthDate = parseDateOfBirth(dateOfBirth);

        if (!birthDate) {
            return '—';
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (birthDate > today) {
            return '—';
        }

        let totalMonths =
            (today.getFullYear() - birthDate.getFullYear()) * 12 +
            (today.getMonth() - birthDate.getMonth());

        if (today.getDate() < birthDate.getDate()) {
            totalMonths -= 1;
        }

        totalMonths = Math.max(0, totalMonths);

        const monthAnchor = new Date(
            birthDate.getFullYear(),
            birthDate.getMonth() + totalMonths,
            birthDate.getDate(),
        );

        const expectedMonth =
            (birthDate.getMonth() + totalMonths) % 12;

        if (monthAnchor.getMonth() !== expectedMonth) {
            monthAnchor.setDate(0);
        }

        let remainingDays = Math.floor(
            (today.getTime() - monthAnchor.getTime()) /
                (1000 * 60 * 60 * 24),
        );

        remainingDays = Math.max(0, remainingDays);

        let fraction = Math.floor((remainingDays / 30) * 4) / 4;

        if (fraction >= 1) {
            totalMonths += 1;
            fraction = 0;
        }

        const years = Math.floor(totalMonths / 12);
        const months = totalMonths % 12;
        const fractionCharacter = getFractionCharacter(fraction);

        if (years === 0) {
            if (months === 0 && fraction === 0) {
                return '0 mos';
            }

            return `${months}${fractionCharacter} mos`;
        }

        const yearText = `${years} ${years === 1 ? 'yr' : 'yrs'}`;

        if (months === 0 && fraction === 0) {
            return yearText;
        }

        return `${yearText} ${months}${fractionCharacter} mos`;
    };

    return (
        <AppLayout>
            <Head title="Patient Management" />

            <div className="mx-auto flex h-full w-full max-w-7xl min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-7 overflow-x-hidden">
                <div className="rounded-2xl border bg-background/70 p-4 sm:p-5 shadow-sm min-w-0 max-w-full">
                    <div className="row g-3 mx-0 w-full align-items-center justify-content-between">
                        <div className="col-12 col-md-6">
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold">
                                    Patient Management
                                </h1>
                                <Badge variant="secondary">Staff View</Badge>
                            </div>

                            <p className="mt-1.5 text-muted-foreground">
                                Manage pediatric patient records and their registered family accounts.
                            </p>
                        </div>

                        <div className="col-12 col-md-6 d-flex flex-wrap items-center justify-content-start justify-content-md-end gap-1.5 sm:gap-2">
                            <Badge variant="outline" className="text-xs">
                                {patients.length} total patients
                            </Badge>

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 sm:h-9 text-xs sm:text-sm px-2.5 sm:px-3 gap-1.5"
                                onClick={() => setScannerOpen(true)}
                            >
                                <ScanLine className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                Scan Patient QR
                            </Button>

                            <Button
                                type="button"
                                size="sm"
                                className="h-8 sm:h-9 text-xs sm:text-sm px-2.5 sm:px-3 gap-1.5"
                                onClick={() => router.visit('/guardians/create')}
                            >
                                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                Register Family
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex w-full sm:w-fit rounded-lg border border-border/60 bg-muted/40 p-1 gap-1 text-xs font-medium">
                    <button
                        type="button"
                        onClick={() => setActiveTab('patients')}
                        className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                            activeTab === 'patients'
                                ? 'bg-background text-foreground shadow-xs font-semibold'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Baby className="h-4 w-4" />
                        Patients
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('families')}
                        className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                            activeTab === 'families'
                                ? 'bg-background text-foreground shadow-xs font-semibold'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <UsersRound className="h-4 w-4" />
                        Registered Families
                    </button>
                </div>

                {activeTab === 'patients' && (
                    <>
                        <Card className="min-w-0 max-w-full">
                            <CardContent className="pt-5">
                                <div className="row g-3 mx-0 w-full">
                                    <div className="col-12 col-md-4">
                                        <div className="relative">
                                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                type="search"
                                                placeholder="Search patient..."
                                                className="h-10 pl-10"
                                                value={search}
                                                onChange={(event) =>
                                                    setSearch(event.target.value)
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="col-12 col-md-4">
                                        <Select value={sex} onValueChange={setSex}>
                                            <SelectTrigger className="h-10">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="both">
                                                    Both Sex
                                                </SelectItem>
                                                <SelectItem value="Male">
                                                    Male
                                                </SelectItem>
                                                <SelectItem value="Female">
                                                    Female
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="col-12 col-md-4">
                                        <Select disabled>
                                            <SelectTrigger className="h-10">
                                                <SelectValue placeholder="Completion Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All</SelectItem>
                                                <SelectItem value="complete">
                                                    Complete
                                                </SelectItem>
                                                <SelectItem value="incomplete">
                                                    Incomplete
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="min-w-0 max-w-full overflow-hidden">
                            <CardHeader className="pb-3">
                                <CardTitle>Patient Records</CardTitle>
                            </CardHeader>

                            <CardContent className="pt-0">
                                {/* Mobile View (< md): Compact card list, zero horizontal scroll */}
                                <div className="d-block d-md-none divide-y divide-border/60 rounded-lg border">
                                    {patients.length === 0 ? (
                                        <div className="p-6 text-center space-y-2">
                                            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                                <Baby className="h-5 w-5" />
                                            </div>
                                            <p className="font-medium text-xs text-foreground">No patient records found</p>
                                            <p className="text-[11px] text-muted-foreground">
                                                Try clearing your search query or status filter.
                                            </p>
                                        </div>
                                    ) : (
                                        patients.map((patient) => (
                                            <div key={patient.id} className="p-3 space-y-2 hover:bg-muted/15 transition-colors">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-xs text-foreground truncate">
                                                            {patient.first_name} {patient.middle_name ? `${patient.middle_name} ` : ''}{patient.last_name}
                                                        </p>
                                                        <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground flex-wrap">
                                                            <span className="font-mono bg-muted/70 px-1.5 py-0.2 rounded text-[10px] text-foreground/80 font-medium">
                                                                {patient.patient_id}
                                                            </span>
                                                            <span>•</span>
                                                            <span>Age: {calculateAge(patient.date_of_birth)}</span>
                                                            <span>•</span>
                                                            <span>DOB: {formatDateOfBirth(patient.date_of_birth)}</span>
                                                        </div>
                                                    </div>
                                                    <Badge variant="secondary" className="text-[10px] shrink-0">
                                                        {placeholderVaccinationStatus}
                                                    </Badge>
                                                </div>

                                                <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px]">
                                                    <p className="text-muted-foreground truncate max-w-[55%]">
                                                        <span className="text-foreground/70 font-medium">Guardian:</span> {patient.guardian_name ?? '—'}
                                                    </p>
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            type="button"
                                                            className="h-7 px-2 text-[11px] font-medium"
                                                            onClick={() =>
                                                                router.visit(`/patients/${patient.id}`)
                                                            }
                                                        >
                                                            <Eye className="mr-1 h-3 w-3 text-muted-foreground" />
                                                            View
                                                        </Button>

                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            type="button"
                                                            className="h-7 px-2 text-[11px] font-medium"
                                                            onClick={() =>
                                                                router.visit(`/patients/${patient.id}/edit`)
                                                            }
                                                        >
                                                            <Pencil className="mr-1 h-3 w-3 text-muted-foreground" />
                                                            Edit
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Desktop View (md+): Fluid table with full details */}
                                <div className="d-none d-md-block w-full overflow-x-auto rounded-lg border">
                                    <table className="w-full table-fixed text-left text-xs">
                                        <thead className="bg-muted/30">
                                            <tr className="border-b">
                                                <th className="w-[12%] border-r px-2.5 py-3 font-medium">
                                                    Patient ID
                                                </th>
                                                <th className="w-[24%] border-r px-2.5 py-3 font-medium">
                                                    Patient Name
                                                </th>
                                                <th className="w-[10%] border-r px-2.5 py-3 font-medium">
                                                    DOB
                                                </th>
                                                <th className="w-[10%] border-r px-2.5 py-3 font-medium">
                                                    Age
                                                </th>
                                                <th className="w-[18%] border-r px-2.5 py-3 font-medium">
                                                    Guardian
                                                </th>
                                                <th className="w-[12%] border-r px-2.5 py-3 font-medium">
                                                    Vaccination
                                                </th>
                                                <th className="w-[14%] px-3 py-3 text-center font-medium">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {patients.length === 0 ? (
                                                <tr>
                                                    <td
                                                        colSpan={7}
                                                        className="px-3 py-12 text-center"
                                                    >
                                                        <div className="flex flex-col items-center justify-center space-y-2.5">
                                                            <div className="rounded-full bg-muted p-3 text-muted-foreground">
                                                                <Baby className="h-6 w-6" />
                                                            </div>
                                                            <p className="font-medium text-foreground">No patient records found</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Try clearing your search query or status filter to find patients.
                                                            </p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                patients.map((patient) => (
                                                    <tr
                                                        key={patient.id}
                                                        className="border-b transition-colors last:border-b-0 hover:bg-muted/20"
                                                    >
                                                        <td className="border-r px-2.5 py-3 whitespace-nowrap">
                                                            {patient.patient_id}
                                                        </td>
                                                        <td
                                                            className="border-r px-2.5 py-3 font-medium"
                                                            title={`${patient.first_name} ${patient.middle_name ? `${patient.middle_name} ` : ''}${patient.last_name}`}
                                                        >
                                                            <div className="truncate">
                                                                {patient.first_name}{' '}
                                                                {patient.middle_name
                                                                    ? `${patient.middle_name} `
                                                                    : ''}
                                                                {patient.last_name}
                                                            </div>
                                                        </td>
                                                        <td className="border-r px-2.5 py-3 whitespace-nowrap">
                                                            {formatDateOfBirth(
                                                                patient.date_of_birth,
                                                            )}
                                                        </td>
                                                        <td className="border-r px-2.5 py-3 whitespace-nowrap font-medium">
                                                            {calculateAge(
                                                                patient.date_of_birth,
                                                            )}
                                                        </td>
                                                        <td
                                                            className="border-r px-2.5 py-3"
                                                            title={
                                                                patient.guardian_name ??
                                                                'No guardian'
                                                            }
                                                        >
                                                            <div className="truncate">
                                                                {patient.guardian_name ??
                                                                    '—'}
                                                            </div>
                                                        </td>
                                                        <td className="border-r px-2.5 py-3">
                                                            <Badge
                                                                variant="secondary"
                                                                className="text-[11px]"
                                                            >
                                                                {placeholderVaccinationStatus}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            <div className="flex items-center justify-center gap-1.5">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    type="button"
                                                                    className="h-8 min-w-[65px] px-2.5 text-xs font-medium"
                                                                    onClick={() =>
                                                                        router.visit(
                                                                            `/patients/${patient.id}`,
                                                                        )
                                                                    }
                                                                >
                                                                    <Eye className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                                                                    View
                                                                </Button>

                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    type="button"
                                                                    className="h-8 min-w-[65px] px-2.5 text-xs font-medium"
                                                                    onClick={() =>
                                                                        router.visit(
                                                                            `/patients/${patient.id}/edit`,
                                                                        )
                                                                    }
                                                                >
                                                                    <Pencil className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                                                                    Edit
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}

                {activeTab === 'families' && (
                    <>
                        <Card className="min-w-0 max-w-full">
                            <CardContent className="space-y-4 pt-5">
                                <div className="relative max-w-xl">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search guardian, child, Family ID, or Patient ID..."
                                        className="h-10 pl-10"
                                        value={familySearch}
                                        onChange={(event) =>
                                            setFamilySearch(event.target.value)
                                        }
                                    />
                                </div>

                                <div className="flex max-w-full overflow-x-auto no-scrollbar items-center gap-1 rounded-lg border border-border/50 bg-muted/30 p-1 text-xs">
                                    {(
                                        [
                                            ['all', 'All'],
                                            ['Overdue', 'Overdue'],
                                            ['Due Now', 'Due Now'],
                                            ['Upcoming', 'Upcoming'],
                                            ['Completed', 'Completed'],
                                        ] as const
                                    ).map(([value, label]) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() =>
                                                setFamilyStatusFilter(value)
                                            }
                                            className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                                                familyStatusFilter === value
                                                    ? 'bg-background text-foreground shadow-xs font-semibold'
                                                    : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="min-w-0 max-w-full overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
                                <div>
                                    <CardTitle>Registered Families</CardTitle>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Select a family to view guardian details and manage its children.
                                    </p>
                                </div>
                                <Badge variant="outline">
                                    {filteredFamilies.length}{' '}
                                    {filteredFamilies.length === 1
                                        ? 'family'
                                        : 'families'}
                                </Badge>
                            </CardHeader>

                            <CardContent className="space-y-3">
                                {filteredFamilies.length === 0 ? (
                                    <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
                                        No registered families found for this filter.
                                    </div>
                                ) : (
                                    filteredFamilies.map((guardian) => (
                                        <button
                                            key={guardian.id}
                                            type="button"
                                            onClick={() =>
                                                router.visit(
                                                    `/guardians/${guardian.id}`,
                                                )
                                            }
                                            className="group w-full rounded-xl border p-4 text-left transition-colors hover:bg-muted/20"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                                                    <UsersRound className="h-5 w-5" />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                        <div className="min-w-0">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <p className="truncate font-semibold">
                                                                    {guardian.name}
                                                                </p>
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-[10px]"
                                                                >
                                                                    {guardian.guardian_no}
                                                                </Badge>
                                                            </div>

                                                            <p className="mt-1 text-sm text-muted-foreground">
                                                                {guardian.patients_count}{' '}
                                                                {guardian.patients_count === 1
                                                                    ? 'child'
                                                                    : 'children'}
                                                                {guardian.contact_number
                                                                    ? ` · ${guardian.contact_number}`
                                                                    : ''}
                                                            </p>
                                                        </div>

                                                        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                                                    </div>

                                                    {guardian.patients.length > 0 && (
                                                        <div className="mt-3 flex flex-wrap gap-2">
                                                            {guardian.patients.map(
                                                                (patient) => (
                                                                    <span
                                                                        key={patient.id}
                                                                        className={`inline-flex max-w-full items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getImmunizationStatusClass(
                                                                            patient.immunization_status,
                                                                        )}`}
                                                                    >
                                                                        <span className="max-w-[170px] truncate">
                                                                            {patient.first_name}
                                                                        </span>
                                                                        <span className="ml-1 opacity-80">
                                                                            :{' '}
                                                                            {
                                                                                patient.immunization_status
                                                                            }
                                                                        </span>
                                                                    </span>
                                                                ),
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            <QrScannerModal
                open={scannerOpen}
                onOpenChange={setScannerOpen}
                title="Scan Patient QR Code"
                description="Scan a patient's physical or digital QR code, upload a QR image, or enter their Patient ID."
            />
        </AppLayout>
    );
}
