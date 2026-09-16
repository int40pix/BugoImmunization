import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    Check,
    CheckCircle2,
    Clock,
    Copy,
    Filter,
    KeyRound,
    RefreshCw,
    Search,
    ShieldAlert,
    UserCheck,
    Users,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
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
import AppLayout from '@/layouts/app-layout';

interface ResetRequest {
    id: number;
    status: 'pending' | 'resolved';
    requested_at: string | null;
    resolved_at: string | null;
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
        role_label: string;
        is_guardian: boolean;
        account_status: string;
    };
    guardian: {
        name: string;
        guardian_no?: string;
        contact_number?: string;
    } | null;
    account: {
        email: string;
        account_status: string;
    };
    resolved_by: string | null;
}

interface PageProps {
    requests: ResetRequest[];
    flash?: {
        success?: string;
        error?: string;
        temporary_password?: string;
        temporary_password_request_id?: number;
        temporary_password_user_name?: string;
    };
    [key: string]: unknown;
}

export default function PasswordResetRequestsIndex({ requests = [] }: PageProps) {
    const { flash } = usePage<PageProps>().props;

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'resolved'>('all');
    const [roleFilter, setRoleFilter] = useState<'all' | 'staff' | 'guardian'>('all');

    // Resolve confirmation modal state
    const [selectedRequest, setSelectedRequest] = useState<ResetRequest | null>(null);
    const [isResolving, setIsResolving] = useState(false);

    // Temporary password copied state
    const [copied, setCopied] = useState(false);

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Account Recovery Requests', href: '/admin/password-reset-requests' },
    ];

    const copyPassword = (pwd: string) => {
        navigator.clipboard.writeText(pwd);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const handleConfirmResolve = () => {
        if (!selectedRequest) return;
        setIsResolving(true);

        router.post(
            `/admin/password-reset-requests/${selectedRequest.id}/resolve`,
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setIsResolving(false);
                    setSelectedRequest(null);
                },
            }
        );
    };

    const filteredRequests = useMemo(() => {
        return requests.filter((req) => {
            // Status filter
            if (statusFilter !== 'all' && req.status !== statusFilter) {
                return false;
            }

            // Role filter
            if (roleFilter === 'staff' && req.user.is_guardian) {
                return false;
            }
            if (roleFilter === 'guardian' && !req.user.is_guardian) {
                return false;
            }

            // Search query filter
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase().trim();
                const userName = req.user.name?.toLowerCase() || '';
                const userEmail = req.user.email?.toLowerCase() || '';
                const guardianNo = req.guardian?.guardian_no?.toLowerCase() || '';
                const roleName = req.user.role_label?.toLowerCase() || '';

                return (
                    userName.includes(query) ||
                    userEmail.includes(query) ||
                    guardianNo.includes(query) ||
                    roleName.includes(query)
                );
            }

            return true;
        });
    }, [requests, statusFilter, roleFilter, searchQuery]);

    const pendingCount = useMemo(() => {
        return requests.filter((r) => r.status === 'pending').length;
    }, [requests]);

    const resolvedCount = useMemo(() => {
        return requests.filter((r) => r.status === 'resolved').length;
    }, [requests]);

    const staffPendingCount = useMemo(() => {
        return requests.filter((r) => r.status === 'pending' && !r.user.is_guardian).length;
    }, [requests]);

    const guardianPendingCount = useMemo(() => {
        return requests.filter((r) => r.status === 'pending' && r.user.is_guardian).length;
    }, [requests]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Account Recovery Requests - Admin" />

            <div className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-7">
                {/* Page Title & Context Header */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                                <KeyRound className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                    Account Recovery Requests
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Process temporary password reset requests for health center staff and guardian portal accounts.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.reload({ only: ['requests'] })}
                            className="gap-1.5 text-xs font-medium"
                        >
                            <RefreshCw className="h-3.5 w-3.5" />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Newly Generated Temporary Password Card */}
                {flash?.temporary_password && (
                    <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-sm dark:bg-emerald-950/20">
                        <CardHeader className="border-b border-emerald-500/20 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-base font-semibold text-foreground">
                                        Temporary Password Generated
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        {flash.temporary_password_user_name
                                            ? `Generated for ${flash.temporary_password_user_name}. Provide this directly to the user.`
                                            : 'Give this directly to the user. It is only shown once.'}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="pt-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="flex-1 rounded-lg border border-emerald-500/20 bg-background px-4 py-3 font-mono text-xl font-bold tracking-wider text-foreground">
                                    {flash.temporary_password}
                                </div>

                                <Button
                                    type="button"
                                    variant="default"
                                    onClick={() => copyPassword(flash.temporary_password!)}
                                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="h-4 w-4" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-4 w-4" />
                                            Copy Password
                                        </>
                                    )}
                                </Button>
                            </div>

                            <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed">
                                The account requires the user to create their own new password upon first signing in with this temporary password.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Metric Summary Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="flex items-center justify-between p-5">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Pending Requests
                                </p>
                                <p className="mt-1 text-2xl font-bold text-foreground">
                                    {pendingCount}
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                                <Clock className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center justify-between p-5">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Staff Requests (Pending)
                                </p>
                                <p className="mt-1 text-2xl font-bold text-foreground">
                                    {staffPendingCount}
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                                <Users className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center justify-between p-5">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Guardian Requests (Pending)
                                </p>
                                <p className="mt-1 text-2xl font-bold text-foreground">
                                    {guardianPendingCount}
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600">
                                <KeyRound className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center justify-between p-5">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Resolved Requests
                                </p>
                                <p className="mt-1 text-2xl font-bold text-foreground">
                                    {resolvedCount}
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter & Search Bar */}
                <Card>
                    <CardHeader className="border-b pb-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search by name, email, role, or ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 h-9 text-xs"
                                />
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <div className="flex items-center rounded-lg border border-border/60 bg-muted/40 p-1 text-xs font-medium">
                                    <button
                                        type="button"
                                        onClick={() => setStatusFilter('all')}
                                        className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                                            statusFilter === 'all'
                                                ? 'bg-background text-foreground shadow-xs font-semibold'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        All Status
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStatusFilter('pending')}
                                        className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                                            statusFilter === 'pending'
                                                ? 'bg-background text-foreground shadow-xs font-semibold'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        Pending ({pendingCount})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStatusFilter('resolved')}
                                        className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                                            statusFilter === 'resolved'
                                                ? 'bg-background text-foreground shadow-xs font-semibold'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        Resolved
                                    </button>
                                </div>

                                <div className="flex items-center rounded-lg border border-border/60 bg-muted/40 p-1 text-xs font-medium">
                                    <button
                                        type="button"
                                        onClick={() => setRoleFilter('all')}
                                        className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                                            roleFilter === 'all'
                                                ? 'bg-background text-foreground shadow-xs font-semibold'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        All Roles
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRoleFilter('staff')}
                                        className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                                            roleFilter === 'staff'
                                                ? 'bg-background text-foreground shadow-xs font-semibold'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        Staff Only
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRoleFilter('guardian')}
                                        className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                                            roleFilter === 'guardian'
                                                ? 'bg-background text-foreground shadow-xs font-semibold'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        Guardians Only
                                    </button>
                                </div>
                            </div>
                        </div>
                    </CardHeader>

                    {/* Table of Requests */}
                    <CardContent className="p-0">
                        {filteredRequests.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
                                    <Filter className="h-6 w-6" />
                                </div>
                                <h3 className="mt-4 text-sm font-semibold text-foreground">
                                    No password recovery requests found
                                </h3>
                                <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                                    {searchQuery || statusFilter !== 'all' || roleFilter !== 'all'
                                        ? 'No requests match your current filters. Try resetting the search or filter options.'
                                        : 'There are currently no password reset requests submitted.'}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="border-b bg-muted/40 text-muted-foreground font-medium uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-3.5">Requester Account</th>
                                            <th className="px-6 py-3.5">Account Role</th>
                                            <th className="px-6 py-3.5">Requested At</th>
                                            <th className="px-6 py-3.5">Status</th>
                                            <th className="px-6 py-3.5">Resolution Details</th>
                                            <th className="px-6 py-3.5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {filteredRequests.map((req) => {
                                            const isPending = req.status === 'pending';
                                            const roleBadgeColor = req.user.is_guardian
                                                ? 'bg-purple-500/10 text-purple-700 border-purple-500/20'
                                                : req.user.role === 'admin'
                                                  ? 'bg-red-500/10 text-red-700 border-red-500/20'
                                                  : 'bg-blue-500/10 text-blue-700 border-blue-500/20';

                                            return (
                                                <tr
                                                    key={req.id}
                                                    className="hover:bg-muted/20 transition-colors"
                                                >
                                                    {/* Requester Account */}
                                                    <td className="px-6 py-4">
                                                        <div className="font-semibold text-foreground">
                                                            {req.user.name}
                                                        </div>
                                                        <div className="text-muted-foreground font-mono text-[11px]">
                                                            {req.user.email}
                                                        </div>
                                                        {req.guardian?.guardian_no && (
                                                            <div className="text-[11px] text-muted-foreground">
                                                                Guardian No: {req.guardian.guardian_no}
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* Account Role */}
                                                    <td className="px-6 py-4">
                                                        <Badge
                                                            variant="outline"
                                                            className={`capitalize font-medium ${roleBadgeColor}`}
                                                        >
                                                            {req.user.role_label}
                                                        </Badge>
                                                    </td>

                                                    {/* Requested At */}
                                                    <td className="px-6 py-4 text-muted-foreground">
                                                        {req.requested_at ? (
                                                            <div>
                                                                <p className="font-medium text-foreground">
                                                                    {new Date(req.requested_at).toLocaleDateString('en-US', {
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        year: 'numeric',
                                                                    })}
                                                                </p>
                                                                <p className="text-[11px]">
                                                                    {new Date(req.requested_at).toLocaleTimeString('en-US', {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit',
                                                                    })}
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            '—'
                                                        )}
                                                    </td>

                                                    {/* Status Badge */}
                                                    <td className="px-6 py-4">
                                                        {isPending ? (
                                                            <Badge
                                                                variant="outline"
                                                                className="bg-amber-500/10 text-amber-700 border-amber-500/30 gap-1"
                                                            >
                                                                <Clock className="h-3 w-3" />
                                                                Pending Action
                                                            </Badge>
                                                        ) : (
                                                            <Badge
                                                                variant="outline"
                                                                className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30 gap-1"
                                                            >
                                                                <CheckCircle2 className="h-3 w-3" />
                                                                Resolved
                                                            </Badge>
                                                        )}
                                                    </td>

                                                    {/* Resolution Details */}
                                                    <td className="px-6 py-4 text-muted-foreground">
                                                        {req.resolved_by ? (
                                                            <div>
                                                                <p className="font-medium text-foreground">
                                                                    By {req.resolved_by}
                                                                </p>
                                                                <p className="text-[11px]">
                                                                    {req.resolved_at
                                                                        ? new Date(req.resolved_at).toLocaleDateString('en-US', {
                                                                              month: 'short',
                                                                              day: 'numeric',
                                                                              hour: '2-digit',
                                                                              minute: '2-digit',
                                                                          })
                                                                        : ''}
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground/60 italic">
                                                                Awaiting administrator
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="px-6 py-4 text-right">
                                                        {isPending ? (
                                                            <Button
                                                                size="sm"
                                                                variant="default"
                                                                className="h-8 gap-1.5 text-xs bg-amber-600 hover:bg-amber-700 text-white"
                                                                onClick={() => setSelectedRequest(req)}
                                                            >
                                                                <KeyRound className="h-3.5 w-3.5" />
                                                                Generate Temporary Password
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8 gap-1.5 text-xs text-muted-foreground"
                                                                onClick={() => setSelectedRequest(req)}
                                                            >
                                                                <RefreshCw className="h-3.5 w-3.5" />
                                                                Regenerate
                                                            </Button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Resolve / Generate Temporary Password Confirmation Dialog */}
            <Dialog
                open={!!selectedRequest}
                onOpenChange={(open) => {
                    if (!open) setSelectedRequest(null);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <KeyRound className="h-5 w-5 text-amber-600" />
                            Generate Temporary Password
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            Are you sure you want to generate a new temporary password for{' '}
                            <span className="font-semibold text-foreground">
                                {selectedRequest?.user.name}
                            </span>{' '}
                            ({selectedRequest?.user.email})?
                        </DialogDescription>
                    </DialogHeader>

                    <div className="rounded-lg border bg-muted/30 p-3.5 text-xs text-muted-foreground space-y-2">
                        <div className="flex items-start gap-2">
                            <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                            <div>
                                <p className="font-medium text-foreground">
                                    Password change will be mandatory on next login.
                                </p>
                                <p className="mt-0.5">
                                    The user will be required to create their own permanent password before gaining access to the rest of the system.
                                </p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setSelectedRequest(null)}
                            disabled={isResolving}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="default"
                            onClick={handleConfirmResolve}
                            disabled={isResolving}
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                        >
                            {isResolving ? 'Generating...' : 'Generate & Resolve'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

