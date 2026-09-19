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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-4 min-w-0 max-w-full">
            <div className="flex max-w-full overflow-x-auto no-scrollbar items-center gap-1 rounded-lg border border-border/60 bg-muted/40 p-1 text-xs font-medium shrink-0">
                <Link
                    href={route('vaccine-inventory.index')}
                    className={`inline-flex shrink-0 items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        current === 'active'
                            ? 'bg-background text-foreground shadow-xs font-semibold'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    <Package className="h-4 w-4" />
                    <span className="sm:hidden">Active</span>
                    <span className="hidden sm:inline">Active Batches</span>
                </Link>

                <Link
                    href={route('vaccine-inventory.transactions')}
                    className={`inline-flex shrink-0 items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        current === 'transactions'
                            ? 'bg-background text-foreground shadow-xs font-semibold'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    <History className="h-4 w-4" />
                    <span className="sm:hidden">History</span>
                    <span className="hidden sm:inline">Transaction History</span>
                </Link>

                <Link
                    href={route('vaccine-inventory.archived')}
                    className={`inline-flex shrink-0 items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        current === 'archived'
                            ? 'bg-background text-foreground shadow-xs font-semibold'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    <Archive className="h-4 w-4" />
                    <span className="sm:hidden">Archived</span>
                    <span className="hidden sm:inline">Archived Batches</span>
                </Link>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="flex-1 sm:flex-initial gap-1.5 text-xs font-medium"
                >
                    <Link href={route('vaccine.index')}>
                        <List className="h-3.5 w-3.5" />
                        Vaccine Catalog
                    </Link>
                </Button>

                <Button
                    size="sm"
                    asChild
                    className="flex-1 sm:flex-initial gap-1.5 text-xs font-medium"
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

