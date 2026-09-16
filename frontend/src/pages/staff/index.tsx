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

            <div className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-7">
                {/* Header with Register Button */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
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

                    <Button asChild className="shrink-0 gap-2 shadow-xs">
                        <Link href="/staff/create">
                            <Plus className="h-4 w-4" />
                            Register Staff
                        </Link>
                    </Button>
                </div>

                {/* Summary Metrics */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="flex items-center justify-between p-5">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Total Personnel</p>
                                <p className="mt-1 text-2xl font-bold text-foreground">{staff.length}</p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Users className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center justify-between p-5">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Active Accounts</p>
                                <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                    {activeCount}
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <UserCheck className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center justify-between p-5">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Inactive Accounts</p>
                                <p className="mt-1 text-2xl font-bold text-muted-foreground">
                                    {inactiveCount}
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                                <UserX className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center justify-between p-5">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Clinical Providers</p>
                                <p className="mt-1 text-2xl font-bold text-foreground">
                                    {clinicalCount}
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4 sm:p-5">
                        <div className="grid gap-3 md:grid-cols-3">
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
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
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
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                                    <tr>
                                        <th className="px-6 py-3.5 font-medium">Personnel</th>
                                        <th className="px-6 py-3.5 font-medium">Role</th>
                                        <th className="px-6 py-3.5 font-medium">Status</th>
                                        <th className="px-6 py-3.5 font-medium">Date Created</th>
                                        <th className="px-6 py-3.5 text-right font-medium">Actions</th>
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
                                                <td className="px-6 py-4">
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

                                                <td className="px-6 py-4">
                                                    {getRoleBadge(member.role)}
                                                </td>

                                                <td className="px-6 py-4">
                                                    {getStatusBadge(member.status)}
                                                </td>

                                                <td className="px-6 py-4 text-xs text-muted-foreground">
                                                    {new Date(member.created_at).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </td>

                                                <td className="px-6 py-4 text-right">
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