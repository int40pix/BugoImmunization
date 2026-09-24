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
import { router } from '@inertiajs/react';
import {
    AlertCircle,
    AlertTriangle,
    Calendar,
    CheckCircle2,
    Clock,
    Download,
    FileSpreadsheet,
    FileText,
    Filter,
    Loader2,
    Printer,
    RefreshCw,
    RotateCcw,
    Search,
    ShieldAlert,
    Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';

export type ScheduleStatusRow = {
    schedule_id: number;
    patient_id: string;
    patient_name: string;
    date_of_birth: string;
    current_age: string;
    sex: string;
    guardian_name: string;
    guardian_contact: string;
    address: string;
    vaccine_id: number;
    vaccine_name: string;
    dose_number: number;
    dose_label: string;
    scheduled_date: string;
    scheduled_date_formatted: string;
    scheduled_day: string;
    status: 'upcoming' | 'overdue';
    stored_status: string;
    is_overdue: boolean;
    days_diff: number;
    days_label: string;
    remarks: string;
};

export type ScheduleStatusReportData = {
    filters: {
        status: string;
        vaccine_id: string;
        date_from: string | null;
        date_to: string | null;
        search: string;
    };
    summary: {
        total_scheduled: number;
        upcoming_count: number;
        overdue_count: number;
        monitored_children: number;
    };
    rows: ScheduleStatusRow[];
    generated_at: string;
    generated_by: string;
};

type Props = {
    reportData?: ScheduleStatusReportData;
    vaccines: Array<{ id: number; name: string; category: string }>;
};

export default function ScheduleStatusReportView({
    reportData,
    vaccines,
}: Props) {
    const [statusFilter, setStatusFilter] = useState(
        reportData?.filters.status ?? 'all',
    );
    const [selectedVaccine, setSelectedVaccine] = useState(
        reportData?.filters.vaccine_id ?? 'all',
    );
    const [dateFrom, setDateFrom] = useState(
        reportData?.filters.date_from ?? '',
    );
    const [dateTo, setDateTo] = useState(reportData?.filters.date_to ?? '');
    const [searchQuery, setSearchQuery] = useState(
        reportData?.filters.search ?? '',
    );

    const [isSyncing, setIsSyncing] = useState(false);
    const [updatingScheduleId, setUpdatingScheduleId] = useState<number | null>(
        null,
    );

    // Live filtering
    const filteredRows = useMemo(() => {
        if (!reportData?.rows) return [];

        return reportData.rows.filter((row) => {
            // Status filter
            if (statusFilter === 'upcoming' && row.status !== 'upcoming')
                return false;
            if (statusFilter === 'overdue' && row.status !== 'overdue')
                return false;

            // Vaccine filter
            if (selectedVaccine !== 'all') {
                if (String(row.vaccine_id) !== selectedVaccine) return false;
            }

            // Date filter
            if (dateFrom && row.scheduled_date < dateFrom) return false;
            if (dateTo && row.scheduled_date > dateTo) return false;

            // Search query
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchName = row.patient_name.toLowerCase().includes(q);
                const matchId = row.patient_id.toLowerCase().includes(q);
                const matchGuardian = row.guardian_name
                    .toLowerCase()
                    .includes(q);
                const matchVaccine = row.vaccine_name
                    .toLowerCase()
                    .includes(q);
                if (!matchName && !matchId && !matchGuardian && !matchVaccine) {
                    return false;
                }
            }

            return true;
        });
    }, [
        reportData?.rows,
        statusFilter,
        selectedVaccine,
        dateFrom,
        dateTo,
        searchQuery,
    ]);

    const liveSummary = useMemo(() => {
        const total = filteredRows.length;
        const upcoming = filteredRows.filter(
            (r) => r.status === 'upcoming',
        ).length;
        const overdue = filteredRows.filter(
            (r) => r.status === 'overdue',
        ).length;
        const children = new Set(filteredRows.map((r) => r.patient_id)).size;

        return {
            total,
            upcoming,
            overdue,
            children,
        };
    }, [filteredRows]);

    const resetFilters = () => {
        setStatusFilter('all');
        setSelectedVaccine('all');
        setDateFrom('');
        setDateTo('');
        setSearchQuery('');
    };

    // Bulk sync schedule statuses based on target dates
    const handleSyncStatuses = () => {
        setIsSyncing(true);
        router.post(
            '/immunization/reports/schedule-status/sync',
            {},
            {
                preserveScroll: true,
                onFinish: () => setIsSyncing(false),
            },
        );
    };

    // Update individual child schedule status
    const handleUpdateRowStatus = (scheduleId: number, newStatus: string) => {
        setUpdatingScheduleId(scheduleId);
        router.post(
            `/immunization/reports/schedule-status/${scheduleId}/update`,
            {
                status: newStatus,
            },
            {
                preserveScroll: true,
                onFinish: () => setUpdatingScheduleId(null),
            },
        );
    };

    const getExportUrl = (format: 'pdf' | 'csv') => {
        const params = new URLSearchParams();
        if (statusFilter !== 'all') params.append('status', statusFilter);
        if (selectedVaccine !== 'all')
            params.append('vaccine_id', selectedVaccine);
        if (dateFrom) params.append('date_from', dateFrom);
        if (dateTo) params.append('date_to', dateTo);
        if (searchQuery.trim()) params.append('search', searchQuery.trim());

        const queryString = params.toString();
        const base =
            format === 'pdf'
                ? '/immunization/reports/schedule-status/pdf'
                : '/immunization/reports/schedule-status/csv';

        return queryString ? `${base}?${queryString}` : base;
    };

    return (
        <div className="space-y-6">
            {/* Header & Actions */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                        Immunization Schedule Status Report
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                        Outlines each child's status with live target date
                        tracking. Allows updating status to 'Overdue' or
                        'Upcoming' based on scheduled visit timelines.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Sync Statuses Button */}
                    <Button
                        variant="default"
                        size="sm"
                        disabled={isSyncing}
                        onClick={handleSyncStatuses}
                        className="bg-sky-600 hover:bg-sky-700 text-white font-medium"
                        title="Automatically update statuses: Overdue if target date has passed, Upcoming if approaching"
                    >
                        {isSyncing ? (
                            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="mr-1.5 h-4 w-4" />
                        )}
                        Update Statuses (Target Date Sync)
                    </Button>

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
                        className="bg-slate-800 text-white hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600"
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
                            <Filter className="h-4 w-4 text-sky-600" />
                            Filter Schedule Statuses
                        </div>
                        {(statusFilter !== 'all' ||
                            selectedVaccine !== 'all' ||
                            dateFrom ||
                            dateTo ||
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
                    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
                        {/* Status Filter */}
                        <div className="space-y-1">
                            <label className="text-[11px] font-medium text-muted-foreground">
                                Status Scope
                            </label>
                            <Select
                                value={statusFilter}
                                onValueChange={setStatusFilter}
                            >
                                <SelectTrigger className="h-8.5 text-xs bg-background">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Statuses
                                    </SelectItem>
                                    <SelectItem value="upcoming">
                                        Upcoming (Approaching)
                                    </SelectItem>
                                    <SelectItem value="overdue">
                                        Overdue (Passed)
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Vaccine Filter */}
                        <div className="space-y-1">
                            <label className="text-[11px] font-medium text-muted-foreground">
                                Vaccine Antigen
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

                        {/* Date From */}
                        <div className="space-y-1">
                            <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Target Date (From)
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
                                Target Date (To)
                            </label>
                            <Input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="h-8.5 text-xs bg-background"
                            />
                        </div>

                        {/* Search Child / ID */}
                        <div className="space-y-1">
                            <label className="text-[11px] font-medium text-muted-foreground">
                                Search Patient
                            </label>
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Child or PT-ID..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="pl-8 h-8.5 text-xs bg-background"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* KPI Cards */}
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                <Card className="p-4">
                    <div className="text-xs font-medium text-muted-foreground">
                        Total Scheduled Doses
                    </div>
                    <div className="mt-1 text-2xl font-bold flex items-center gap-1.5">
                        <Clock className="h-5 w-5 text-sky-500" />
                        {liveSummary.total}
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                        In current filtered report
                    </p>
                </Card>

                <Card className="p-4 border-emerald-200 dark:border-emerald-950 bg-emerald-50/20">
                    <div className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
                        Upcoming Visits
                    </div>
                    <div className="mt-1 text-2xl font-bold text-emerald-600 flex items-center gap-1.5">
                        <CheckCircle2 className="h-5 w-5" />
                        {liveSummary.upcoming}
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Target date approaching / today
                    </p>
                </Card>

                <Card className="p-4 border-red-200 dark:border-red-950 bg-red-50/20">
                    <div className="text-xs font-medium text-red-800 dark:text-red-300">
                        Overdue Visits
                    </div>
                    <div className="mt-1 text-2xl font-bold text-red-600 flex items-center gap-1.5">
                        <AlertTriangle className="h-5 w-5" />
                        {liveSummary.overdue}
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Target date passed &bull; follow-up
                    </p>
                </Card>

                <Card className="p-4">
                    <div className="text-xs font-medium text-muted-foreground">
                        Monitored Children
                    </div>
                    <div className="mt-1 text-2xl font-bold flex items-center gap-1.5 text-blue-600">
                        <Users className="h-5 w-5" />
                        {liveSummary.children}
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Distinct pediatric patients
                    </p>
                </Card>
            </div>

            {/* Overdue Warning Callout if any */}
            {liveSummary.overdue > 0 && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/80 p-4 dark:border-red-900 dark:bg-red-950/30">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                        <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div className="flex-1 text-xs sm:text-sm">
                        <p className="font-semibold text-red-900 dark:text-red-200">
                            Attention: {liveSummary.overdue}{' '}
                            {liveSummary.overdue === 1
                                ? 'scheduled dose is'
                                : 'scheduled doses are'}{' '}
                            Overdue
                        </p>
                        <p className="mt-0.5 text-red-700 dark:text-red-300 text-xs">
                            The target milestone dates have passed. Health workers
                            can update the schedule status, contact parents via
                            reminders, or reschedule to the next clinic session.
                        </p>
                    </div>
                </div>
            )}

            {/* Line Listing Table Outlining Each Child's Status */}
            <Card>
                <CardHeader className="border-b p-4 sm:p-5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="text-base sm:text-lg font-bold">
                                Child Schedule Status Outlines
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Showing status ('Overdue' vs 'Upcoming') based on whether the target date has passed or is approaching.
                            </p>
                        </div>
                        <Badge variant="outline" className="text-xs bg-muted/40">
                            Showing {filteredRows.length} scheduled visits
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-[11px] sm:text-xs border-collapse">
                            <thead>
                                <tr className="border-b bg-muted/40 font-semibold text-muted-foreground text-[11px]">
                                    <th className="py-2.5 px-2 text-center">Patient ID</th>
                                    <th className="py-2.5 px-2.5">Child Full Name</th>
                                    <th className="py-2.5 px-1.5 text-center">Sex</th>
                                    <th className="py-2.5 px-2">Current Age</th>
                                    <th className="py-2.5 px-2.5">Parent / Guardian</th>
                                    <th className="py-2.5 px-2.5">Vaccine</th>
                                    <th className="py-2.5 px-2 text-center">Dose</th>
                                    <th className="py-2.5 px-2.5">Target Date</th>
                                    <th className="py-2.5 px-2 text-center">Status</th>
                                    <th className="py-2.5 px-2">Timeline / Due Info</th>
                                    <th className="py-2.5 px-2 text-center">Update Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredRows.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={11}
                                            className="text-center p-8 text-muted-foreground"
                                        >
                                            No child schedules match the selected filters.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRows.map((row) => (
                                        <tr
                                            key={row.schedule_id}
                                            className="hover:bg-muted/20 transition-colors"
                                        >
                                            <td className="py-2 px-2 text-center whitespace-nowrap">
                                                <Badge
                                                    variant="secondary"
                                                    className="font-mono text-[10px] px-1.5 py-0"
                                                >
                                                    {row.patient_id}
                                                </Badge>
                                            </td>
                                            <td className="py-2 px-2.5 font-semibold text-foreground whitespace-nowrap">
                                                {row.patient_name}
                                            </td>
                                            <td className="py-2 px-1.5 text-center text-muted-foreground">
                                                {row.sex}
                                            </td>
                                            <td className="py-2 px-2 text-muted-foreground whitespace-nowrap">
                                                {row.current_age}
                                            </td>
                                            <td className="py-2 px-2.5 whitespace-nowrap">
                                                <div className="font-medium text-foreground">
                                                    {row.guardian_name}
                                                </div>
                                                <div className="text-[10px] text-muted-foreground">
                                                    {row.guardian_contact} &bull; {row.address}
                                                </div>
                                            </td>
                                            <td className="py-2 px-2.5 font-semibold text-foreground whitespace-nowrap">
                                                {row.vaccine_name}
                                            </td>
                                            <td className="py-2 px-2 text-center whitespace-nowrap">
                                                <Badge
                                                    variant="outline"
                                                    className="text-[10px] px-2 py-0.5 font-semibold bg-sky-50 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-200 dark:border-sky-800"
                                                >
                                                    {row.dose_label}
                                                </Badge>
                                            </td>
                                            <td className="py-2 px-2.5 whitespace-nowrap">
                                                <div className="font-semibold text-foreground">
                                                    {row.scheduled_date_formatted}
                                                </div>
                                                <div className="text-[10px] text-muted-foreground">
                                                    {row.scheduled_day}
                                                </div>
                                            </td>
                                            <td className="py-2 px-2 text-center whitespace-nowrap">
                                                {row.status === 'overdue' ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
                                                        <AlertTriangle className="h-3 w-3" />
                                                        Overdue
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Upcoming
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-2 px-2 whitespace-nowrap">
                                                <span
                                                    className={`font-semibold ${
                                                        row.status === 'overdue'
                                                            ? 'text-red-600 dark:text-red-400'
                                                            : 'text-emerald-600 dark:text-emerald-400'
                                                    }`}
                                                >
                                                    {row.days_label}
                                                </span>
                                                <div className="text-[10px] text-muted-foreground max-w-[140px] truncate" title={row.remarks}>
                                                    {row.remarks}
                                                </div>
                                            </td>
                                            <td className="py-2 px-2 text-center whitespace-nowrap">
                                                <Select
                                                    value={row.stored_status}
                                                    disabled={
                                                        updatingScheduleId ===
                                                        row.schedule_id
                                                    }
                                                    onValueChange={(val) =>
                                                        handleUpdateRowStatus(
                                                            row.schedule_id,
                                                            val,
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className="h-7 text-xs w-26 mx-auto bg-background">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="upcoming">
                                                            Upcoming
                                                        </SelectItem>
                                                        <SelectItem value="overdue">
                                                            Overdue
                                                        </SelectItem>
                                                        <SelectItem value="scheduled">
                                                            Scheduled
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-3 border-t bg-muted/10 text-xs text-muted-foreground flex items-center justify-between">
                        <span>
                            Showing <strong>{filteredRows.length}</strong> child
                            schedules
                        </span>
                        <span>
                            Barangay Bugo Health Center Milestone Tracking
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
