import {
    ClipboardList,
    Syringe,
    UserRound,
} from 'lucide-react';

export type PatientSection =
    | 'general'
    | 'vaccination'
    | 'history';

type PatientWorkspaceNavProps = {
    activeSection: PatientSection;
    onSectionChange: (section: PatientSection) => void;
};

export default function PatientWorkspaceNav({
    activeSection,
    onSectionChange,
}: PatientWorkspaceNavProps) {
    const isSectionActive = (section: PatientSection) => activeSection === section;

    return (
        <div className="grid grid-cols-3 gap-1 rounded-xl border border-border/60 bg-muted/40 p-1 sm:gap-1.5 sm:p-1.5">
            <button
                type="button"
                className={`flex flex-col sm:flex-row items-center sm:justify-start gap-1 sm:gap-3 rounded-lg px-2 sm:px-4 py-2 sm:py-2.5 text-center sm:text-left transition-all ${
                    isSectionActive('general')
                        ? 'border border-primary/40 bg-background text-foreground shadow-xs ring-1 ring-primary/20'
                        : 'border border-transparent bg-transparent text-muted-foreground hover:bg-background/60 hover:text-foreground'
                }`}
                onClick={() => onSectionChange('general')}
            >
                <div
                    className={`flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-md transition-colors ${
                        isSectionActive('general')
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted/60 text-muted-foreground'
                    }`}
                >
                    <UserRound className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>

                <div className="min-w-0 w-full sm:w-auto">
                    <p
                        className={`text-[11px] sm:text-sm font-semibold leading-tight truncate ${
                            isSectionActive('general')
                                ? 'text-foreground'
                                : 'text-muted-foreground'
                        }`}
                    >
                        <span className="sm:hidden">General</span>
                        <span className="hidden sm:inline">General Information</span>
                    </p>
                    <p className="hidden sm:block mt-0.5 truncate text-xs text-muted-foreground">
                        Patient and guardian
                    </p>
                </div>
            </button>

            <button
                type="button"
                className={`flex flex-col sm:flex-row items-center sm:justify-start gap-1 sm:gap-3 rounded-lg px-2 sm:px-4 py-2 sm:py-2.5 text-center sm:text-left transition-all ${
                    isSectionActive('vaccination')
                        ? 'border border-primary/40 bg-background text-foreground shadow-xs ring-1 ring-primary/20'
                        : 'border border-transparent bg-transparent text-muted-foreground hover:bg-background/60 hover:text-foreground'
                }`}
                onClick={() => onSectionChange('vaccination')}
            >
                <div
                    className={`flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-md transition-colors ${
                        isSectionActive('vaccination')
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted/60 text-muted-foreground'
                    }`}
                >
                    <Syringe className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>

                <div className="min-w-0 w-full sm:w-auto">
                    <p
                        className={`text-[11px] sm:text-sm font-semibold leading-tight truncate ${
                            isSectionActive('vaccination')
                                ? 'text-foreground'
                                : 'text-muted-foreground'
                        }`}
                    >
                        <span className="sm:hidden">Vaccination</span>
                        <span className="hidden sm:inline">Vaccination Management</span>
                    </p>
                    <p className="hidden sm:block mt-0.5 truncate text-xs text-muted-foreground">
                        Eligibility and administration
                    </p>
                </div>
            </button>

            <button
                type="button"
                className={`flex flex-col sm:flex-row items-center sm:justify-start gap-1 sm:gap-3 rounded-lg px-2 sm:px-4 py-2 sm:py-2.5 text-center sm:text-left transition-all ${
                    isSectionActive('history')
                        ? 'border border-primary/40 bg-background text-foreground shadow-xs ring-1 ring-primary/20'
                        : 'border border-transparent bg-transparent text-muted-foreground hover:bg-background/60 hover:text-foreground'
                }`}
                onClick={() => onSectionChange('history')}
            >
                <div
                    className={`flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-md transition-colors ${
                        isSectionActive('history')
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted/60 text-muted-foreground'
                    }`}
                >
                    <ClipboardList className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>

                <div className="min-w-0 w-full sm:w-auto">
                    <p
                        className={`text-[11px] sm:text-sm font-semibold leading-tight truncate ${
                            isSectionActive('history')
                                ? 'text-foreground'
                                : 'text-muted-foreground'
                        }`}
                    >
                        <span className="sm:hidden">History</span>
                        <span className="hidden sm:inline">Immunization History</span>
                    </p>
                    <p className="hidden sm:block mt-0.5 truncate text-xs text-muted-foreground">
                        Child vaccination card
                    </p>
                </div>
            </button>
        </div>
    );
}
