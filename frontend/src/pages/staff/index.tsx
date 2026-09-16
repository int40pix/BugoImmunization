import { useState } from 'react';
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { MoreHorizontal, Plus, Search, Users } from 'lucide-react';

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

export default function StaffIndex({
    staff,
    filters,  
}: StaffIndexProps) {

    const updateFilters = (
    key: keyof Filters,
    value: string,
) => {
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
    const [statusDialogMember, setStatusDialogMember] = useState<Staff | null>(null);
    const [statusUpdating, setStatusUpdating] = useState(false);

    return (
        <AppLayout>
            <Head title="Staff Management" />

            <div className="max-w-7xl space-y-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold">
                        Staff Management
                    </h1>

                    <p className="mt-2 text-muted-foreground">
                        Manage authorized health center personnel accounts.
                    </p>
                </div>

                <Button asChild>
                    <Link href="/staff/create">
                        <Plus className="mr-2 h-4 w-4" />
                        Register Staff
                    </Link>
                </Button>

                <Card>
                    <CardContent className="pt-6">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="relative md:col-span-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                                    <Input
                                        type="search"
                                        placeholder="Search staff..."
                                        className="pl-9"
                                        defaultValue={filters.search ?? ''}
                                        onChange={(e) =>
                                            updateFilters('search', e.target.value)
                                        }
                                    />

                            </div>

                                    <Select
                                        value={filters.role ?? 'all'}
                                        onValueChange={(value) =>
                                            updateFilters('role', value)
    }
>
                                <SelectTrigger>
                                    <SelectValue placeholder="All roles" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="all">
                                        All roles
                                    </SelectItem>

                                    <SelectItem value="nurse">
                                        Nurse
                                    </SelectItem>

                                    <SelectItem value="midwife">
                                        Midwife
                                    </SelectItem>

                                    <SelectItem value="bhw">
                                        BHW
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={filters.status ?? 'all'}
                                onValueChange={(value) =>
                                    updateFilters('status', value)
    }
>
                                <SelectTrigger>
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="all">
                                        All statuses
                                    </SelectItem>

                                    <SelectItem value="active">
                                        Active
                                    </SelectItem>

                                    <SelectItem value="inactive">
                                        Inactive
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Staff Accounts</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">
                                            Name
                                        </th>

                                        <th className="px-4 py-3 font-medium">
                                            Email
                                        </th>

                                        <th className="px-4 py-3 font-medium">
                                            Role
                                        </th>

                                        <th className="px-4 py-3 font-medium">
                                            Status
                                        </th>

                                        <th className="px-4 py-3 font-medium">
                                            Date Created
                                        </th>

                                        <th className="px-4 py-3 font-medium">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {staff.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-4 py-12 text-center"
                                            >
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
                                            <tr
                                                key={member.id}
                                                className="border-b"
                                            >
                                                <td className="px-4 py-3">
                                                    {member.name}
                                                </td>

                                                <td className="px-4 py-3">
                                                    {member.email}
                                                </td>

                                                <td className="px-4 py-3 capitalize">
                                                    {member.role}
                                                </td>

                                                <td className="px-4 py-3 capitalize">
                                                    {member.status}
                                                </td>

                                                <td className="px-4 py-3">
                                                    {new Date(
                                                        member.created_at,
                                                    ).toLocaleDateString()}
                                                </td>

                                                <td className="px-4 py-3">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                            >
                                                                <MoreHorizontal className="h-4 w-4" />

                                                                <span className="sr-only">
                                                                    Open actions
                                                                    menu
                                                                </span>
                                                            </Button>
                                                        </DropdownMenuTrigger>

                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={`/staff/${member.id}`}
                                                                >
                                                                    View Details
                                                                </Link>
                                                            </DropdownMenuItem>

                                                            <DropdownMenuItem
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={`/staff/${member.id}/edit`}
                                                                >
                                                                    Edit Staff
                                                                </Link>
                                                            </DropdownMenuItem>

                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    setStatusDialogMember(member)
                                                                }
                                                            >
                                                                {member.status ===
                                                                'active'
                                                                    ? 'Deactivate Account'
                                                                    : 'Activate Account'}
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
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

            {/* Staff Status Confirmation Dialog */}
            <Dialog
                open={!!statusDialogMember}
                onOpenChange={(open) => {
                    if (!open) setStatusDialogMember(null);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {statusDialogMember?.status === 'active'
                                ? 'Deactivate Staff Account?'
                                : 'Activate Staff Account?'}
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to {statusDialogMember?.status === 'active' ? 'deactivate' : 'activate'} the account for{' '}
                            <span className="font-semibold text-foreground">
                                {statusDialogMember?.name}
                            </span>{' '}
                            ({statusDialogMember?.email})?{' '}
                            {statusDialogMember?.status === 'active'
                                ? 'They will no longer be able to log in to the clinic management system.'
                                : 'Their account access will be restored.'}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setStatusDialogMember(null)}
                            disabled={statusUpdating}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant={statusDialogMember?.status === 'active' ? 'destructive' : 'default'}
                            onClick={() => {
                                if (!statusDialogMember) return;
                                setStatusUpdating(true);
                                router.put(
                                    `/staff/${statusDialogMember.id}/status`,
                                    {},
                                    {
                                        preserveScroll: true,
                                        onFinish: () => {
                                            setStatusUpdating(false);
                                            setStatusDialogMember(null);
                                        },
                                    },
                                );
                            }}
                            disabled={statusUpdating}
                        >
                            {statusUpdating
                                ? 'Updating...'
                                : statusDialogMember?.status === 'active'
                                  ? 'Deactivate Staff'
                                  : 'Activate Staff'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}