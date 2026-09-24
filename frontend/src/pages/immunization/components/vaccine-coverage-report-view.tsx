import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Calendar,
    CheckCircle2,
    Download,
    FileSpreadsheet,
    FileText,
    Filter,
    Printer,
    RotateCcw,
    Search,
    ShieldCheck,
    Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';

export type CoverageSummary = {
    vaccine_id: number;
    name: string;
    category: string;
    required_doses: number;
    target_population: number;
    total_administered: number;
    dose_1: number;
    dose_2: number;
    dose_3: number;
    booster: number;
    coverage_pct: number;
    completion_pct: number;
};

export type VaccinatedChild = {
    id: number;
    date_administered: string;
    date_administered_formatted: string;
    patient_id: string;
    patient_name: string;
    date_of_birth: string;
    age_at_admin: string;
    sex: string;
    guardian_name: string;
    guardian_contact: string;
    address: string;
    vaccine_name: string;
    dose_number: number;
    dose_label: string;
    batch_number: string;
    injection_site: string;
    administered_by: string;
    remarks: string;
};

export type CoverageReportData = {
    filters: {
        date_from: string | null;
        date_to: string | null;
        vaccine_id: string;
        dose_number: string;
    };
    target_population: number;
    total_doses_administered: number;
    vaccine_summaries: CoverageSummary[];
    vaccinated_children: VaccinatedChild[];
    generated_at: string;
    generated_by: string;
};

type Props = {
    reportData?: CoverageReportData;
    vaccines: Array<{ id: number; name: string; category: string }>;
};

export default function VaccineCoverageReportView({
    reportData,
    vaccines,
}: Props) {
    const [dateFrom, setDateFrom] = useState(
        reportData?.filters.date_from ?? '',
    );
    const [dateTo, setDateTo] = useState(reportData?.filters.date_to ?? '');
    const [selectedVaccine, setSelectedVaccine] = useState(
        reportData?.filters.vaccine_id ?? 'all',
    );
    const [selectedDose, setSelectedDose] = useState(
        reportData?.filters.dose_number ?? 'all',
    );
    const [searchQuery, setSearchQuery] = useState('');

    const targetPopulation = reportData?.target_population ?? 0;

    // Filter children details client-side for live responsiveness
    const filteredChildren = useMemo(() => {
        if (!reportData?.vaccinated_children) return [];

        return reportData.vaccinated_children.filter((child) => {
            // Date filter
            if (dateFrom && child.date_administered < dateFrom) return false;
            if (dateTo && child.date_administered > dateTo) return false;

            // Vaccine filter
            if (selectedVaccine !== 'all') {
                const targetVaccine = vaccines.find(
                    (v) => String(v.id) === selectedVaccine,
                );
                if (
                    targetVaccine &&
                    child.vaccine_name.toLowerCase() !==
                        targetVaccine.name.toLowerCase()
                ) {
                    return false;
                }
            }

            // Dose filter
            if (
                selectedDose !== 'all' &&
                String(child.dose_number) !== selectedDose
            ) {
                return false;
            }

            // Search query
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchName = child.patient_name.toLowerCase().includes(q);
                const matchId = child.patient_id.toLowerCase().includes(q);
                const matchGuardian = child.guardian_name
                    .toLowerCase()
                    .includes(q);
                const matchVaccine = child.vaccine_name
                    .toLowerCase()
                    .includes(q);
                const matchBatch = child.batch_number.toLowerCase().includes(q);
                if (
                    !matchName &&
                    !matchId &&
                    !matchGuardian &&
                    !matchVaccine &&
                    !matchBatch
                ) {
                    return false;
                }
            }

            return true;
        });
    }, [
        reportData?.vaccinated_children,
        dateFrom,
        dateTo,
        selectedVaccine,
        selectedDose,
        searchQuery,
        vaccines,
    ]);

    // Recalculate vaccine summaries based on date/dose filters
    const filteredSummaries = useMemo(() => {
        if (!reportData?.vaccine_summaries) return [];

        return reportData.vaccine_summaries
            .filter((summary) => {
                if (selectedVaccine !== 'all') {
                    return String(summary.vaccine_id) === selectedVaccine;
                }
                return true;
            })
            .map((summary) => {
                // If filters are active, calculate live doses from filtered children
                const matchingChildDoses = filteredChildren.filter(
                    (c) =>
                        c.vaccine_name.toLowerCase() ===
                        summary.name.toLowerCase(),
                );

                const d1 = matchingChildDoses.filter(
                    (c) => c.dose_number === 1,
                ).length;
                const d2 = matchingChildDoses.filter(
                    (c) => c.dose_number === 2,
                ).length;
                const d3 = matchingChildDoses.filter(
                    (c) => c.dose_number === 3,
                ).length;
                const booster = matchingChildDoses.filter(
                    (c) => c.dose_number >= 4,
                ).length;
                const totalAdmin = matchingChildDoses.length;

                const coveragePct =
                    targetPopulation > 0
                        ? Math.min(
                              100,
                              parseFloat(
                                  ((d1 / targetPopulation) * 100).toFixed(1),
                              ),
                          )
                        : 0;

                return {
                    ...summary,
                    dose_1: d1,
                    dose_2: d2,
                    dose_3: d3,
                    booster: booster,
                    total_administered: totalAdmin,
                    coverage_pct: coveragePct,
                };
            });
    }, [
        reportData?.vaccine_summaries,
        filteredChildren,
        selectedVaccine,
        targetPopulation,
    ]);

    const totalFilteredDoses = useMemo(() => {
        return filteredChildren.length;
    }, [filteredChildren]);

    const averageCoverage = useMemo(() => {
        if (filteredSummaries.length === 0) return 0;
        const total = filteredSummaries.reduce(
            (acc, curr) => acc + curr.coverage_pct,
            0,
        );
        return parseFloat((total / filteredSummaries.length).toFixed(1));
    }, [filteredSummaries]);

    const resetFilters = () => {
        setDateFrom('');
        setDateTo('');
        setSelectedVaccine('all');
        setSelectedDose('all');
        setSearchQuery('');
    };

    // Helper to generate export URLs with currently applied filters
    const getExportUrl = (format: 'pdf' | 'csv') => {
        const params = new URLSearchParams();
        if (dateFrom) params.append('date_from', dateFrom);
        if (dateTo) params.append('date_to', dateTo);
        if (selectedVaccine !== 'all')
            params.append('vaccine_id', selectedVaccine);
        if (selectedDose !== 'all') params.append('dose_number', selectedDose);

        const queryString = params.toString();
        const base =
            format === 'pdf'
                ? '/immunization/reports/coverage/pdf'
                : '/immunization/reports/coverage/csv';

        return queryString ? `${base}?${queryString}` : base;
    };

    return (
        <div className="space-y-6">
            {/* Header & Quick Export Actions */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                        Vaccine Coverage Report
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                        Comprehensive list of vaccines with antigen coverage rates
                        and clinical details of vaccinated children.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="border-border text-foreground hover:bg-muted"
                    >
                        <a href={getExportUrl('csv')} download>
                            <FileSpreadsheet className="mr-1.5 h-4 w-4 text-emerald-600" />
                            Export CSV
                        </a>
                    </Button>

                    <Button
                        size="sm"
                        asChild
                        className="bg-teal-600 text-white hover:bg-teal-700"
                    >
                        <a href={getExportUrl('pdf')} target="_blank" rel="noreferrer">
                            <FileText className="mr-1.5 h-4 w-4" />
                            Export PDF
                        </a>
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.print()}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <Printer className="mr-1.5 h-4 w-4" />
                        Print
                    </Button>
                </div>
            </div>

            {/* Filter Bar */}
            <Card className="border border-border/80 bg-muted/20">
                <CardHeader className="p-3.5 sm:p-4 pb-2 border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-foreground">
                            <Filter className="h-4 w-4 text-teal-600" />
                            Filter Vaccine Coverage
                        </div>
                        {(dateFrom ||
                            dateTo ||
                            selectedVaccine !== 'all' ||
                            selectedDose !== 'all' ||
                            searchQuery) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={resetFilters}
                                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                            >
                                <RotateCcw className="mr-1 h-3 w-3" />
                                Reset Filters
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-3.5 sm:p-4">
                    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Date From */}
                        <div className="space-y-1">
                            <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Date Administered (From)
                            </label>
                            <Input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="h-8.5 text-xs bg-background"
                            />
                        </div>

                        {/* Date To */}
                        <div className="space-y-1">
                            <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Date Administered (To)
                            </label>
                            <Input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="h-8.5 text-xs bg-background"
                            />
                        </div>

                        {/* Vaccine Filter */}
                        <div className="space-y-1">
                            <label className="text-[11px] font-medium text-muted-foreground">
                                Vaccine Type
                            </label>
                            <Select
                                value={selectedVaccine}
                                onValueChange={setSelectedVaccine}
                            >
                                <SelectTrigger className="h-8.5 text-xs bg-background">
                                    <SelectValue placeholder="All Vaccines" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Vaccines
                                    </SelectItem>
                                    {vaccines.map((v) => (
                                        <SelectItem
                                            key={v.id}
                                            value={String(v.id)}
                                        >
                                            {v.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Dose Filter */}
                        <div className="space-y-1">
                            <label className="text-[11px] font-medium text-muted-foreground">
                                Dose Number
                            </label>
                            <Select
                                value={selectedDose}
                                onValueChange={setSelectedDose}
                            >
                                <SelectTrigger className="h-8.5 text-xs bg-background">
                                    <SelectValue placeholder="All Doses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Doses</SelectItem>
                                    <SelectItem value="1">Dose 1</SelectItem>
                                    <SelectItem value="2">Dose 2</SelectItem>
                                    <SelectItem value="3">Dose 3</SelectItem>
                                    <SelectItem value="4">Booster / Dose 4+</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* KPI Summary Cards */}
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                <Card className="p-4">
                    <div className="text-xs font-medium text-muted-foreground">
                        Target Cohort Population
                    </div>
                    <div className="mt-1 text-2xl font-bold flex items-center gap-1.5">
                        <Users className="h-5 w-5 text-blue-500" />
                        {targetPopulation}
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Registered active children
                    </p>
                </Card>

                <Card className="p-4">
                    <div className="text-xs font-medium text-muted-foreground">
                        Doses Administered
                    </div>
                    <div className="mt-1 text-2xl font-bold flex items-center gap-1.5 text-teal-600 dark:text-teal-400">
                        <CheckCircle2 className="h-5 w-5" />
                        {totalFilteredDoses}
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Within selected timeframe
                    </p>
                </Card>

                <Card className="p-4">
                    <div className="text-xs font-medium text-muted-foreground">
                        Average Coverage Rate
                    </div>
                    <div className="mt-1 text-2xl font-bold flex items-center gap-1.5 text-emerald-600">
                        <ShieldCheck className="h-5 w-5" />
                        {averageCoverage}%
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Dose 1 / Target cohort ratio
                    </p>
                </Card>

                <Card className="p-4">
                    <div className="text-xs font-medium text-muted-foreground">
                        Antigens Monitored
                    </div>
                    <div className="mt-1 text-2xl font-bold">
                        {filteredSummaries.length}
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                        DOH EPI routine vaccines
                    </p>
                </Card>
            </div>

            {/* 1. Comprehensive List of Vaccines (Coverage Summary) */}
            <Card>
                <CardHeader className="border-b p-4 sm:p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-base sm:text-lg font-bold">
                                1. Vaccine Coverage Summary by Antigen
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Aggregated dose administration and percentage coverage for each vaccine.
                            </p>
                        </div>
                        <Badge variant="outline" className="bg-muted/50 text-xs">
                            {filteredSummaries.length} Antigens
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b bg-muted/40 font-semibold text-muted-foreground">
                                    <th className="p-3 sm:px-4">Vaccine Antigen</th>
                                    <th className="p-3">Category</th>
                                    <th className="p-3 text-center">Required Doses</th>
                                    <th className="p-3 text-center">Target Cohort</th>
                                    <th className="p-3 text-center">Dose 1</th>
                                    <th className="p-3 text-center">Dose 2</th>
                                    <th className="p-3 text-center">Dose 3</th>
                                    <th className="p-3 text-center">Booster</th>
                                    <th className="p-3 text-center font-bold">Total Doses</th>
                                    <th className="p-3 text-center">Coverage Rate</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredSummaries.map((summary) => (
                                    <tr
                                        key={summary.vaccine_id}
                                        className="hover:bg-muted/20 transition-colors"
                                    >
                                        <td className="p-3 sm:px-4 font-semibold text-foreground">
                                            {summary.name}
                                        </td>
                                        <td className="p-3 text-muted-foreground">
                                            {summary.category}
                                        </td>
                                        <td className="p-3 text-center font-mono">
                                            {summary.required_doses}
                                        </td>
                                        <td className="p-3 text-center font-mono text-muted-foreground">
                                            {summary.target_population}
                                        </td>
                                        <td className="p-3 text-center font-mono">
                                            {summary.dose_1}
                                        </td>
                                        <td className="p-3 text-center font-mono">
                                            {summary.dose_2}
                                        </td>
                                        <td className="p-3 text-center font-mono">
                                            {summary.dose_3}
                                        </td>
                                        <td className="p-3 text-center font-mono">
                                            {summary.booster}
                                        </td>
                                        <td className="p-3 text-center font-bold text-foreground">
                                            {summary.total_administered}
                                        </td>
                                        <td className="p-3 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                                                    <div
                                                        className="h-full bg-teal-600 rounded-full"
                                                        style={{
                                                            width: `${Math.min(
                                                                100,
                                                                summary.coverage_pct,
                                                            )}%`,
                                                        }}
                                                    />
                                                </div>
                                                <span className="font-semibold text-teal-700 dark:text-teal-400 font-mono">
                                                    {summary.coverage_pct}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* 2. Details About Vaccinated Children */}
            <Card>
                <CardHeader className="border-b p-4 sm:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="text-base sm:text-lg font-bold">
                                2. Details About Vaccinated Children
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Line listing of pediatric recipients with administration and guardian details.
                            </p>
                        </div>

                        {/* Search Filter */}
                        <div className="relative w-full sm:w-64">
                            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search child or ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 h-8 text-xs bg-background"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b bg-muted/40 font-semibold text-muted-foreground">
                                    <th className="p-3 sm:px-4">Date</th>
                                    <th className="p-3">Patient ID</th>
                                    <th className="p-3">Child Full Name</th>
                                    <th className="p-3 text-center">Sex</th>
                                    <th className="p-3">Age Admin</th>
                                    <th className="p-3">Parent / Guardian</th>
                                    <th className="p-3">Vaccine & Dose</th>
                                    <th className="p-3">Batch Number</th>
                                    <th className="p-3">Administered By</th>
                                    <th className="p-3">Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredChildren.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={10}
                                            className="text-center p-8 text-muted-foreground"
                                        >
                                            No vaccinated children match the selected filters.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredChildren.map((child) => (
                                        <tr
                                            key={child.id}
                                            className="hover:bg-muted/20 transition-colors"
                                        >
                                            <td className="p-3 sm:px-4 font-mono whitespace-nowrap">
                                                {child.date_administered_formatted}
                                            </td>
                                            <td className="p-3 whitespace-nowrap">
                                                <Badge
                                                    variant="secondary"
                                                    className="font-mono text-[11px]"
                                                >
                                                    {child.patient_id}
                                                </Badge>
                                            </td>
                                            <td className="p-3 font-semibold text-foreground whitespace-nowrap">
                                                {child.patient_name}
                                            </td>
                                            <td className="p-3 text-center text-muted-foreground">
                                                {child.sex}
                                            </td>
                                            <td className="p-3 text-muted-foreground whitespace-nowrap">
                                                {child.age_at_admin}
                                            </td>
                                            <td className="p-3 whitespace-nowrap">
                                                <div className="font-medium text-foreground">
                                                    {child.guardian_name}
                                                </div>
                                                <div className="text-[10px] text-muted-foreground">
                                                    {child.guardian_contact} &bull; {child.address}
                                                </div>
                                            </td>
                                            <td className="p-3 whitespace-nowrap">
                                                <span className="font-semibold text-foreground">
                                                    {child.vaccine_name}
                                                </span>{' '}
                                                <Badge
                                                    variant="outline"
                                                    className="text-[10px] ml-1 bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-300"
                                                >
                                                    {child.dose_label}
                                                </Badge>
                                            </td>
                                            <td className="p-3 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                                                {child.batch_number}
                                            </td>
                                            <td className="p-3 text-muted-foreground whitespace-nowrap">
                                                {child.administered_by}
                                            </td>
                                            <td className="p-3 text-muted-foreground max-w-xs truncate">
                                                {child.remarks}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-3 border-t bg-muted/10 text-xs text-muted-foreground flex items-center justify-between">
                        <span>
                            Showing <strong>{filteredChildren.length}</strong> records
                        </span>
                        <span>Official Bugo Health Center Immunization Record</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
