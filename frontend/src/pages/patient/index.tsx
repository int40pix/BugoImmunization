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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
    QrCode,
    Search,
    ScanLine,
    UsersRound,
    XCircle,
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

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
    const [scannerStarting, setScannerStarting] = useState(false);
    const [scannerError, setScannerError] = useState<string | null>(null);
    const [manualPatientId, setManualPatientId] = useState('');
    const [manualError, setManualError] = useState<string | null>(null);

    const scannerRef = useRef<Html5Qrcode | null>(null);
    const scanHandledRef = useRef(false);

    useEffect(() => {
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

    const stopScanner = async () => {
        const scanner = scannerRef.current;

        if (!scanner) {
            return;
        }

        try {
            if (scanner.isScanning) {
                await scanner.stop();
            }
        } catch {
            // Ignore stop errors.
        }

        try {
            await scanner.clear();
        } catch {
            // Ignore clear errors.
        }

        scannerRef.current = null;
    };

    const handleQrResult = async (decodedText: string) => {
        if (scanHandledRef.current) {
            return;
        }

        try {
            const scannedUrl = new URL(decodedText, window.location.origin);

            if (scannedUrl.origin !== window.location.origin) {
                throw new Error('Invalid QR origin.');
            }

            const match = scannedUrl.pathname.match(/^\/patients\/(\d+)\/?$/);

            if (!match) {
                throw new Error('Invalid patient QR.');
            }

            const patientRecordId = Number(match[1]);

            if (Number.isNaN(patientRecordId)) {
                throw new Error('Invalid patient record.');
            }

            scanHandledRef.current = true;
            setScannerError(null);
            await stopScanner();
            setScannerOpen(false);
            router.visit(`/patients/${patientRecordId}`);
        } catch {
            setScannerError(
                'Invalid patient QR code. Please scan a QR code generated by this system.',
            );
        }
    };

    useEffect(() => {
        if (!scannerOpen) {
            return;
        }

        let cancelled = false;

        const startScanner = async () => {
            setScannerStarting(true);
            setScannerError(null);
            scanHandledRef.current = false;

            await new Promise((resolve) => setTimeout(resolve, 150));

            if (cancelled) {
                return;
            }

            const element = document.getElementById('patient-qr-reader');

            if (!element) {
                setScannerStarting(false);
                setScannerError('Scanner container could not be loaded.');
                return;
            }

            const scanner = new Html5Qrcode('patient-qr-reader');
            scannerRef.current = scanner;

            try {
                await scanner.start(
                    { facingMode: 'environment' },
                    {
                        fps: 10,
                        qrbox: { width: 240, height: 240 },
                        aspectRatio: 1,
                    },
                    (decodedText) => {
                        void handleQrResult(decodedText);
                    },
                    () => {
                        // QR misses are normal while scanning.
                    },
                );
            } catch (error) {
                console.error(error);

                if (!cancelled) {
                    setScannerError(
                        'Unable to access the camera. Please allow camera permission or use manual Patient ID.',
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
    }, [scannerOpen]);

    const closeScanner = async () => {
        await stopScanner();
        setScannerOpen(false);
        setScannerError(null);
        setManualError(null);
        setManualPatientId('');
        scanHandledRef.current = false;
    };

    const handleManualLookup = () => {
        const enteredId = manualPatientId.trim().toUpperCase();
        setManualError(null);

        if (!enteredId) {
            setManualError('Enter a Patient ID first.');
            return;
        }

        const patient = patients.find(
            (item) => item.patient_id.toUpperCase() === enteredId,
        );

        if (!patient) {
            setManualError(
                'Patient ID was not found in the current patient records.',
            );
            return;
        }

        void stopScanner();
        setScannerOpen(false);
        router.visit(`/patients/${patient.id}`);
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

    const handleToggleStatus = (patient: Patient) => {
        const action = patient.status === 'Active' ? 'deactivate' : 'activate';

        const confirmed = window.confirm(
            `Are you sure you want to ${action} ${patient.first_name} ${patient.last_name}?`,
        );

        if (!confirmed) {
            return;
        }

        router.put(
            `/patients/${patient.id}/status`,
            {},
            { preserveScroll: true },
        );
    };

    const getPatientStatusVariant = (
        status: string,
    ): 'default' | 'secondary' | 'outline' | 'destructive' => {
        return status === 'Active' ? 'default' : 'secondary';
    };

    return (
        <AppLayout>
            <Head title="Patient Management" />

            <div className="max-w-7xl space-y-5 p-6">
                <div className="flex flex-col gap-4 rounded-2xl border bg-background/70 p-5 shadow-sm md:flex-row md:items-center md:justify-between">
                    <div>
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

                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">
                            {patients.length} total patients
                        </Badge>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setScannerOpen(true)}
                        >
                            <ScanLine className="mr-2 h-4 w-4" />
                            Scan Patient QR
                        </Button>

                        <Button
                            type="button"
                            onClick={() => router.visit('/guardians/create')}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Register Family
                        </Button>
                    </div>
                </div>

                <div className="flex w-fit rounded-lg border bg-muted/20 p-1">
                    <Button
                        type="button"
                        size="sm"
                        variant={activeTab === 'patients' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('patients')}
                    >
                        <Baby className="mr-2 h-4 w-4" />
                        Patients
                    </Button>

                    <Button
                        type="button"
                        size="sm"
                        variant={activeTab === 'families' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('families')}
                    >
                        <UsersRound className="mr-2 h-4 w-4" />
                        Registered Families
                    </Button>
                </div>

                {activeTab === 'patients' && (
                    <>
                        <Card>
                            <CardContent className="pt-5">
                                <div className="grid gap-3 md:grid-cols-3">
                                    <div className="relative">
                                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            type="search"
                                            placeholder="Search patient..."
                                            className="h-10 pl-9"
                                            value={search}
                                            onChange={(event) =>
                                                setSearch(event.target.value)
                                            }
                                        />
                                    </div>

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
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle>Patient Records</CardTitle>
                            </CardHeader>

                            <CardContent className="pt-0">
                                <div className="overflow-hidden rounded-lg border">
                                    <table className="w-full table-fixed text-left text-xs">
                                        <thead className="bg-muted/30">
                                            <tr className="border-b">
                                                <th className="w-[9%] border-r px-2.5 py-3 font-medium">
                                                    Patient ID
                                                </th>
                                                <th className="w-[17%] border-r px-2.5 py-3 font-medium">
                                                    Patient Name
                                                </th>
                                                <th className="w-[9%] border-r px-2.5 py-3 font-medium">
                                                    DOB
                                                </th>
                                                <th className="w-[8%] border-r px-2.5 py-3 font-medium">
                                                    Age
                                                </th>
                                                <th className="w-[16%] border-r px-2.5 py-3 font-medium">
                                                    Guardian
                                                </th>
                                                <th className="w-[12%] border-r px-2.5 py-3 font-medium">
                                                    Vaccination
                                                </th>
                                                <th className="w-[10%] border-r px-2.5 py-3 font-medium">
                                                    Status
                                                </th>
                                                <th className="w-[19%] px-3 py-3 text-center font-medium">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {patients.length === 0 ? (
                                                <tr>
                                                    <td
                                                        colSpan={8}
                                                        className="px-3 py-10 text-center text-muted-foreground"
                                                    >
                                                        No patient records found.
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
                                                        <td className="border-r px-2.5 py-3">
                                                            <Badge
                                                                variant={getPatientStatusVariant(
                                                                    patient.status,
                                                                )}
                                                                className="text-[11px]"
                                                            >
                                                                {patient.status}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            <div className="flex items-center justify-center gap-2.5">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    type="button"
                                                                    className="h-8 min-w-[76px] px-3 text-xs"
                                                                    onClick={() =>
                                                                        router.visit(
                                                                            `/patients/${patient.id}`,
                                                                        )
                                                                    }
                                                                >
                                                                    <Eye className="mr-1.5 h-3.5 w-3.5" />
                                                                    View
                                                                </Button>

                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    type="button"
                                                                    className="h-8 min-w-[88px] px-3 text-xs"
                                                                    onClick={() =>
                                                                        handleToggleStatus(
                                                                            patient,
                                                                        )
                                                                    }
                                                                >
                                                                    {patient.status ===
                                                                    'Active'
                                                                        ? 'Deactivate'
                                                                        : 'Activate'}
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
                        <Card>
                            <CardContent className="space-y-4 pt-5">
                                <div className="relative max-w-xl">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search guardian, child, Family ID, or Patient ID..."
                                        className="h-10 pl-9"
                                        value={familySearch}
                                        onChange={(event) =>
                                            setFamilySearch(event.target.value)
                                        }
                                    />
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {(
                                        [
                                            ['all', 'All'],
                                            ['Overdue', 'Overdue'],
                                            ['Due Now', 'Due Now'],
                                            ['Upcoming', 'Upcoming'],
                                            ['Completed', 'Completed'],
                                        ] as const
                                    ).map(([value, label]) => (
                                        <Button
                                            key={value}
                                            type="button"
                                            size="sm"
                                            variant={
                                                familyStatusFilter === value
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            onClick={() =>
                                                setFamilyStatusFilter(value)
                                            }
                                        >
                                            {label}
                                        </Button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
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

            <Dialog
                open={scannerOpen}
                onOpenChange={(open) => {
                    if (open) {
                        setScannerOpen(true);
                        return;
                    }

                    void closeScanner();
                }}
            >
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-muted">
                            <QrCode className="h-5 w-5" />
                        </div>
                        <DialogTitle>Scan Patient QR Code</DialogTitle>
                        <DialogDescription>
                            Position the patient's QR code inside the camera frame.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="overflow-hidden rounded-xl border bg-black">
                        <div
                            id="patient-qr-reader"
                            className="min-h-[300px] w-full"
                        />

                        {scannerStarting && (
                            <div className="flex items-center justify-center gap-2 bg-background p-3 text-sm text-muted-foreground">
                                <Camera className="h-4 w-4 animate-pulse" />
                                Starting camera...
                            </div>
                        )}
                    </div>

                    {scannerError && (
                        <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                            <div>
                                <p className="text-sm font-medium text-destructive">
                                    Scanner unavailable
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {scannerError}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="rounded-lg bg-muted/40 p-3">
                        <div className="flex items-start gap-2">
                            <ScanLine className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                            <p className="text-xs leading-5 text-muted-foreground">
                                Only QR codes generated by the Barangay Bugo Health Center patient system are accepted.
                            </p>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <div className="mb-3 flex items-center gap-2">
                            <Keyboard className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm font-medium">
                                Manual Patient ID
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Input
                                value={manualPatientId}
                                onChange={(event) => {
                                    setManualPatientId(event.target.value);
                                    setManualError(null);
                                }}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        handleManualLookup();
                                    }
                                }}
                                placeholder="Example: PT-000001"
                            />

                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleManualLookup}
                            >
                                Open
                            </Button>
                        </div>

                        {manualError && (
                            <p className="mt-2 text-xs text-destructive">
                                {manualError}
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => void closeScanner()}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
