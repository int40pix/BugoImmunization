import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import {
    Archive,
    History,
    List,
    Package,
    PackagePlus,
} from 'lucide-react';

interface InventorySubnavProps {
    current: 'active' | 'transactions' | 'archived';
}

export function InventorySubnav({ current }: InventorySubnavProps) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
            <div className="flex flex-wrap items-center gap-2">
                <Button
                    variant={current === 'active' ? 'default' : 'outline'}
                    size="sm"
                    asChild
                    className="gap-2 text-xs font-medium"
                >
                    <Link href={route('vaccine-inventory.index')}>
                        <Package className="h-4 w-4" />
                        Active Batches
                    </Link>
                </Button>

                <Button
                    variant={current === 'transactions' ? 'default' : 'outline'}
                    size="sm"
                    asChild
                    className="gap-2 text-xs font-medium"
                >
                    <Link href={route('vaccine-inventory.transactions')}>
                        <History className="h-4 w-4" />
                        Transaction History
                    </Link>
                </Button>

                <Button
                    variant={current === 'archived' ? 'default' : 'outline'}
                    size="sm"
                    asChild
                    className="gap-2 text-xs font-medium"
                >
                    <Link href={route('vaccine-inventory.archived')}>
                        <Archive className="h-4 w-4" />
                        Archived Batches
                    </Link>
                </Button>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="gap-1.5 text-xs font-medium"
                >
                    <Link href={route('vaccine.index')}>
                        <List className="h-3.5 w-3.5" />
                        Vaccine Catalog
                    </Link>
                </Button>

                <Button
                    size="sm"
                    asChild
                    className="gap-1.5 text-xs font-medium"
                >
                    <Link href={route('vaccine-inventory.create')}>
                        <PackagePlus className="h-3.5 w-3.5" />
                        Add Batch
                    </Link>
                </Button>
            </div>
        </div>
    );
}

