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
import { Head, Link, router } from '@inertiajs/react';
import {
    Eye,
    Plus,
    Search,
    ShieldCheck,
    UserCheck,
    Users,
    UserX,
} from 'lucide-react';

interface Staff {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'nurse' | 'midwife' | 'bhw';
    status: 'active' | 'inactive';
    created_at: string;
}

interface Filters {
    search?: string;
    role?: string;
    status?: string;
}

interface StaffIndexProps {
    staff: Staff[];
    filters: Filters;
}

function getRoleBadge(role: Staff['role']) {
    switch (role) {
        case 'admin':
            return (
                <Badge
                    variant="outline"
                    className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                >
                    Administrator
                </Badge>
            );
        case 'nurse':
            return (
                <Badge
                    variant="outline"
                    className="border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                >
                    Nurse
                </Badge>
            );
        case 'midwife':
            return (
                <Badge
                    variant="outline"
                    className="border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400"
                >
                    Midwife
                </Badge>
            );
        case 'bhw':
            return (
                <Badge
                    variant="outline"
                    className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                >
                    BHW
                </Badge>
            );
        default:
            return (
                <Badge variant="outline" className="capitalize">
                    {role}
                </Badge>
            );
    }
}

function getStatusBadge(status: Staff['status']) {
    if (status === 'active') {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Active
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
            Inactive
        </span>
    );
}

export default function StaffIndex({
    staff,
    filters,
}: StaffIndexProps) {
    const updateFilters = (key: keyof Filters, value: string) => {
        router.get(
            '/staff',
            {
                ...filters,
                [key]: value,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const activeCount = staff.filter((s) => s.status === 'active').length;
    const inactiveCount = staff.filter((s) => s.status === 'inactive').length;
    const clinicalCount = staff.filter((s) => s.role === 'nurse' || s.role === 'midwife').length;

    return (
        <AppLayout>
            <Head title="Staff Management" />

            <div className="mx-auto flex h-full w-full max-w-7xl min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-7 overflow-x-hidden">
                {/* Header with Register Button */}
                <div className="row g-3 mx-0 w-full align-items-center justify-content-between">
                    <div className="col-12 col-sm-8">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                Staff Management
                            </h1>
                            <Badge variant="outline" className="border-border/70 text-xs font-normal">
                                Personnel Directory
                            </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Manage authorized health center personnel accounts, credentials, and access roles.
                        </p>
                    </div>

                    <div className="col-12 col-sm-4 d-flex justify-content-start justify-content-sm-end">
                        <Button asChild className="shrink-0 gap-2 shadow-xs">
                            <Link href="/staff/create">
                                <Plus className="h-4 w-4" />
                                Register Staff
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Summary Metrics */}
                <div className="row g-2 g-sm-3 mx-0 w-full">
                    <div className="col-6 col-lg-3">
                        <Card className="h-full">
                            <CardContent className="flex items-center justify-between p-3 sm:p-5">
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] sm:text-xs font-medium text-muted-foreground truncate">Total Personnel</p>
                                    <p className="mt-0.5 sm:mt-1 text-xl sm:text-2xl font-bold text-foreground">{staff.length}</p>
                                </div>
                                <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-primary/10 text-primary">
                                    <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="col-6 col-lg-3">
                        <Card className="h-full">
                            <CardContent className="flex items-center justify-between p-3 sm:p-5">
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] sm:text-xs font-medium text-muted-foreground truncate">Active Accounts</p>
                                    <p className="mt-0.5 sm:mt-1 text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                        {activeCount}
                                    </p>
                                </div>
                                <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                    <UserCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="col-6 col-lg-3">
                        <Card className="h-full">
                            <CardContent className="flex items-center justify-between p-3 sm:p-5">
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] sm:text-xs font-medium text-muted-foreground truncate">Inactive Accounts</p>
                                    <p className="mt-0.5 sm:mt-1 text-xl sm:text-2xl font-bold text-muted-foreground">
                                        {inactiveCount}
                                    </p>
                                </div>
                                <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-muted text-muted-foreground">
                                    <UserX className="h-4 w-4 sm:h-5 sm:w-5" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="col-6 col-lg-3">
                        <Card className="h-full">
                            <CardContent className="flex items-center justify-between p-3 sm:p-5">
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] sm:text-xs font-medium text-muted-foreground truncate">Clinical Providers</p>
                                    <p className="mt-0.5 sm:mt-1 text-xl sm:text-2xl font-bold text-foreground">
                                        {clinicalCount}
                                    </p>
                                </div>
                                <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                    <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Filters */}
                <Card className="min-w-0 max-w-full">
                    <CardContent className="p-4 sm:p-5">
                        <div className="row g-3 mx-0 w-full">
                            <div className="col-12 col-md-4">
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search staff by name or email..."
                                        className="pl-10"
                                        defaultValue={filters.search ?? ''}
                                        onChange={(e) => updateFilters('search', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="col-12 col-md-4">
                                <Select
                                    value={filters.role ?? 'all'}
                                    onValueChange={(value) => updateFilters('role', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All roles" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All roles</SelectItem>
                                        <SelectItem value="nurse">Nurse</SelectItem>
                                        <SelectItem value="midwife">Midwife</SelectItem>
                                        <SelectItem value="bhw">Barangay Health Worker (BHW)</SelectItem>
                                        <SelectItem value="admin">Administrator</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="col-12 col-md-4">
                                <Select
                                    value={filters.status ?? 'all'}
                                    onValueChange={(value) => updateFilters('status', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All statuses</SelectItem>
                                        <SelectItem value="active">Active Accounts</SelectItem>
                                        <SelectItem value="inactive">Inactive Accounts</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card className="min-w-0 max-w-full overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between border-b px-4 sm:px-6 py-4">
                        <div>
                            <CardTitle className="text-base font-semibold">Staff Accounts</CardTitle>
                            <p className="text-xs text-muted-foreground">
                                Registered personnel and operational access credentials
                            </p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                            {staff.length} {staff.length === 1 ? 'account' : 'accounts'}
                        </Badge>
                    </CardHeader>

                    <CardContent className="p-0">
                        {/* Mobile View (< md): Compact card list, fits 100% width on any phone */}
                        <div className="d-block d-md-none divide-y divide-border/60">
                            {staff.length === 0 ? (
                                <div className="p-6 text-center space-y-2">
                                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <p className="font-medium text-xs text-foreground">No staff accounts found</p>
                                    <p className="text-[11px] text-muted-foreground">
                                        Try adjusting your search query or role filter.
                                    </p>
                                </div>
                            ) : (
                                staff.map((member) => (
                                    <div key={member.id} className="p-3 space-y-2 hover:bg-muted/15 transition-colors">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-xs text-primary">
                                                    {member.name
                                                        .split(' ')
                                                        .map((n) => n[0])
                                                        .slice(0, 2)
                                                        .join('')
                                                        .toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold text-foreground truncate">{member.name}</p>
                                                    <p className="text-[11px] text-muted-foreground truncate">{member.email}</p>
                                                </div>
                                            </div>
                                            <div className="shrink-0">
                                                {getStatusBadge(member.status)}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px]">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                {getRoleBadge(member.role)}
                                                <span className="text-[10px] text-muted-foreground">
                                                    {new Date(member.created_at).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </span>
                                            </div>
                                            <Button
                                                asChild
                                                variant="outline"
                                                size="sm"
                                                className="h-7 px-2.5 text-[11px] font-medium gap-1 shrink-0"
                                            >
                                                <Link href={`/staff/${member.id}`}>
                                                    <Eye className="h-3 w-3 text-muted-foreground" />
                                                    View
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Desktop View (md+): Fluid table with full details */}
                        <div className="d-none d-md-block w-full overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                                    <tr>
                                        <th className="px-4 lg:px-6 py-3.5 font-medium">Personnel</th>
                                        <th className="px-4 lg:px-6 py-3.5 font-medium">Role</th>
                                        <th className="px-4 lg:px-6 py-3.5 font-medium">Status</th>
                                        <th className="px-4 lg:px-6 py-3.5 font-medium">Date Created</th>
                                        <th className="px-4 lg:px-6 py-3.5 text-right font-medium">Actions</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-border/60">
                                    {staff.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center space-y-2.5">
                                                    <div className="rounded-full bg-muted p-3 text-muted-foreground">
                                                        <Users className="h-6 w-6" />
                                                    </div>
                                                    <p className="font-medium text-foreground">No staff accounts found</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Try adjusting your search query or role filter.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        staff.map((member) => (
                                            <tr key={member.id} className="transition-colors hover:bg-muted/30">
                                                <td className="px-4 lg:px-6 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-xs text-primary">
                                                            {member.name
                                                                .split(' ')
                                                                .map((n) => n[0])
                                                                .slice(0, 2)
                                                                .join('')
                                                                .toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-foreground">{member.name}</p>
                                                            <p className="text-xs text-muted-foreground">{member.email}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-4 lg:px-6 py-3.5">
                                                    {getRoleBadge(member.role)}
                                                </td>

                                                <td className="px-4 lg:px-6 py-3.5">
                                                    {getStatusBadge(member.status)}
                                                </td>

                                                <td className="px-4 lg:px-6 py-3.5 text-xs text-muted-foreground">
                                                    {new Date(member.created_at).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </td>

                                                <td className="px-4 lg:px-6 py-3.5 text-right">
                                                    <Button
                                                        asChild
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 gap-1.5 text-xs font-medium"
                                                    >
                                                        <Link href={`/staff/${member.id}`}>
                                                            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                                                            View Details
                                                        </Link>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}