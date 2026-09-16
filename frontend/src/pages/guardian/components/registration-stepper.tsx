import { Baby, Check, ClipboardCheck, UserRound } from 'lucide-react';

interface RegistrationStepperProps {
    currentStep: number;
    onStepClick?: (step: number) => void;
    maxAccessibleStep?: number;
}

const steps = [
    {
        number: 1,
        title: 'Guardian Information',
        subtitle: 'Account & portal access',
        icon: UserRound,
    },
    {
        number: 2,
        title: 'Child Information',
        subtitle: 'Pediatric profile & parents',
        icon: Baby,
    },
    {
        number: 3,
        title: 'Review & Confirm',
        subtitle: 'Verify & submit family',
        icon: ClipboardCheck,
    },
];

export function RegistrationStepper({
    currentStep,
    onStepClick,
    maxAccessibleStep = 3,
}: RegistrationStepperProps) {
    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {steps.map((step) => {
                const isCompleted = currentStep > step.number;
                const isCurrent = currentStep === step.number;
                const isUpcoming = currentStep < step.number;
                const isClickable = onStepClick && (isCompleted || (step.number <= maxAccessibleStep));

                const Icon = step.icon;

                return (
                    <button
                        key={step.number}
                        type="button"
                        disabled={!isClickable}
                        onClick={() => isClickable && onStepClick?.(step.number)}
                        className={`group relative flex min-h-[72px] items-center gap-3.5 rounded-xl border p-4 text-left transition-all ${
                            isCurrent
                                ? 'border-primary bg-primary/[0.04] ring-1 ring-primary/20 shadow-2xs'
                                : isCompleted
                                  ? 'border-border/80 bg-muted/20 text-foreground hover:bg-muted/40 cursor-pointer'
                                  : 'border-border/60 bg-card text-muted-foreground opacity-80'
                        } ${!isClickable ? 'cursor-default' : ''}`}
                    >
                        {/* Step Icon / State Indicator */}
                        <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                                isCompleted
                                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                    : isCurrent
                                      ? 'bg-primary text-primary-foreground shadow-xs'
                                      : 'bg-muted text-muted-foreground border border-border/60'
                            }`}
                        >
                            {isCompleted ? (
                                <Check className="h-4 w-4 stroke-[2.5]" />
                            ) : (
                                <Icon className="h-4 w-4" />
                            )}
                        </div>

                        {/* Step Labels */}
                        <div className="min-w-0 flex-1">
                            <p
                                className={`text-[11px] font-medium tracking-wide uppercase ${
                                    isCurrent
                                        ? 'text-primary'
                                        : isCompleted
                                          ? 'text-emerald-600 dark:text-emerald-400'
                                          : 'text-muted-foreground'
                                }`}
                            >
                                {isCompleted
                                    ? `Step ${step.number} · Completed`
                                    : isCurrent
                                      ? `Step ${step.number} · Current`
                                      : `Step ${step.number}`}
                            </p>
                            <p
                                className={`truncate text-sm font-semibold leading-snug ${
                                    isCurrent
                                        ? 'text-foreground font-bold'
                                        : isCompleted
                                          ? 'text-foreground'
                                          : 'text-muted-foreground'
                                }`}
                            >
                                {step.title}
                            </p>
                            <p className="truncate text-[11px] text-muted-foreground">
                                {step.subtitle}
                            </p>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}

