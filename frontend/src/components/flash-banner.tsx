import { usePage } from '@inertiajs/react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { type SharedData } from '@/types';

export function FlashBanner() {
    const { props } = usePage<SharedData>();
    const flash = props.flash;

    const [dismissedKey, setDismissedKey] = useState<string | null>(null);

    const messageType = flash?.success
        ? 'success'
        : flash?.error
          ? 'error'
          : flash?.warning
            ? 'warning'
            : flash?.info
              ? 'info'
              : null;

    const messageText = messageType ? (flash?.[messageType] as string) : null;
    const currentKey = messageText ? `${messageType}:${messageText}` : null;

    // Reset dismissed state when a new flash message appears
    useEffect(() => {
        if (currentKey && dismissedKey !== currentKey) {
            const timer = setTimeout(() => {
                setDismissedKey(currentKey);
            }, 7000);
            return () => clearTimeout(timer);
        }
    }, [currentKey, dismissedKey]);

    if (!messageText || currentKey === dismissedKey) {
        return null;
    }

    const typeConfig = {
        success: {
            icon: CheckCircle2,
            containerClass:
                'border-emerald-200 bg-emerald-50/90 text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-200',
            iconClass: 'text-emerald-600 dark:text-emerald-400',
        },
        error: {
            icon: AlertCircle,
            containerClass:
                'border-destructive/30 bg-destructive/10 text-destructive dark:border-destructive/40 dark:bg-destructive/20 dark:text-destructive',
            iconClass: 'text-destructive',
        },
        warning: {
            icon: AlertTriangle,
            containerClass:
                'border-amber-200 bg-amber-50/90 text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/50 dark:text-amber-200',
            iconClass: 'text-amber-600 dark:text-amber-400',
        },
        info: {
            icon: Info,
            containerClass:
                'border-sky-200 bg-sky-50/90 text-sky-900 dark:border-sky-800/60 dark:bg-sky-950/50 dark:text-sky-200',
            iconClass: 'text-sky-600 dark:text-sky-400',
        },
    }[messageType!];

    const Icon = typeConfig.icon;

    return (
        <div className="px-4 pt-3 sm:px-6">
            <div
                role="alert"
                aria-live="polite"
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm shadow-xs transition-all duration-200 ${typeConfig.containerClass}`}
            >
                <Icon className={`h-5 w-5 shrink-0 ${typeConfig.iconClass}`} />
                <div className="flex-1 font-medium">{messageText}</div>
                <button
                    type="button"
                    onClick={() => setDismissedKey(currentKey)}
                    className="shrink-0 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-current"
                    aria-label="Dismiss alert"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

