import React from 'react';

interface BatchExpiryBadgeProps {
    batchNumber: string;
    expirationDate: string;
    quantity: number;
}

export const BatchExpiryBadge: React.FC<BatchExpiryBadgeProps> = ({
    batchNumber,
    expirationDate,
    quantity,
}) => {
    const today = new Date();
    const expiry = new Date(expirationDate);
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));

    let status = 'Good';
    let badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300';

    if (diffDays <= 0) {
        status = 'Expired';
        badgeClass = 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300';
    } else if (diffDays <= 30) {
        status = 'Expires Soon';
        badgeClass = 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300';
    }

    return (
        <div className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium shadow-sm bg-card">
            <span className="font-mono text-muted-foreground">{batchNumber}</span>
            <span className="text-foreground">({quantity} doses)</span>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badgeClass}`}>
                {status} ({diffDays > 0 ? `${diffDays}d left` : 'Expired'})
            </span>
        </div>
    );
};
