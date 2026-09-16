import { LucideIcon } from 'lucide-react';
import React from 'react';

interface RegistrationSectionProps {
    icon?: LucideIcon | React.ComponentType<{ className?: string }>;
    title: string;
    description?: string;
    action?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}

export function RegistrationSection({
    icon: Icon,
    title,
    description,
    action,
    children,
    className = '',
}: RegistrationSectionProps) {
    return (
        <div
            className={`rounded-xl border border-border/70 bg-muted/15 p-5 space-y-4 transition-colors ${className}`}
        >
            {/* Section Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    {Icon && (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-background text-primary shadow-2xs">
                            <Icon className="h-4 w-4" />
                        </div>
                    )}
                    <div>
                        <h3 className="text-sm font-semibold text-foreground leading-tight">
                            {title}
                        </h3>
                        {description && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                {description}
                            </p>
                        )}
                    </div>
                </div>

                {action && <div className="shrink-0">{action}</div>}
            </div>

            {/* Section Content */}
            <div className="pt-1">{children}</div>
        </div>
    );
}

