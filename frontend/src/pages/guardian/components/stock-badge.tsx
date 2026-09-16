import { Badge } from '@/components/ui/badge';
import React from 'react';

interface StockBadgeProps {
    stockVials?: number | null;
    stockStatus?: 'In Stock' | 'Low Stock' | 'Out of Stock' | string | null;
    className?: string;
    compact?: boolean;
}

export function StockBadge({
    stockVials,
    stockStatus,
    className = '',
    compact = false,
}: StockBadgeProps) {
    const vials = stockVials ?? 0;
    const status = stockStatus ?? (vials <= 0 ? 'Out of Stock' : vials <= 5 ? 'Low Stock' : 'In Stock');

    if (status === 'Out of Stock' || vials <= 0) {
        return (
            <Badge
                variant="outline"
                className={`border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400 font-medium gap-1.5 text-[11px] px-2 py-0.5 whitespace-nowrap ${className}`}
                title="Vaccine vials currently out of stock at Barangay Bugo Health Center"
            >
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                <span>{compact ? '0 vials' : 'Out of Stock (0 vials)'}</span>
            </Badge>
        );
    }

    if (status === 'Low Stock' || vials <= 5) {
        return (
            <Badge
                variant="outline"
                className={`border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-medium gap-1.5 text-[11px] px-2 py-0.5 whitespace-nowrap ${className}`}
                title="Limited vials available at Barangay Bugo Health Center"
            >
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>{compact ? `${vials} left` : `Low Stock (${vials} ${vials === 1 ? 'vial' : 'vials'} left)`}</span>
            </Badge>
        );
    }

    return (
        <Badge
            variant="outline"
            className={`border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium gap-1.5 text-[11px] px-2 py-0.5 whitespace-nowrap ${className}`}
            title="Usable vials available in health center active inventory"
        >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span>{compact ? `${vials} vials` : `In Stock (${vials} ${vials === 1 ? 'vial' : 'vials'} available)`}</span>
        </Badge>
    );
}

export default StockBadge;

