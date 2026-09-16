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
        <div className="grid gap-1.5 rounded-xl border border-border/60 bg-muted/40 p-1.5 sm:grid-cols-3">
            <button
                type="button"
                className={`flex items-center justify-start gap-3 rounded-lg px-4 py-2.5 text-left transition-all ${
                    isSectionActive('general')
                        ? 'border border-primary/40 bg-background text-foreground shadow-xs ring-1 ring-primary/20'
                        : 'border border-transparent bg-transparent text-muted-foreground hover:bg-background/60 hover:text-foreground'
                }`}
                onClick={() => onSectionChange('general')}
            >
                <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors ${
                        isSectionActive('general')
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted/60 text-muted-foreground'
                    }`}
                >
                    <UserRound className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                    <p
                        className={`text-sm font-semibold leading-tight ${
                            isSectionActive('general')
                                ? 'text-foreground'
                                : 'text-muted-foreground'
                        }`}
                    >
                        General Information
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        Patient and guardian
                    </p>
                </div>
            </button>

            <button
                type="button"
                className={`flex items-center justify-start gap-3 rounded-lg px-4 py-2.5 text-left transition-all ${
                    isSectionActive('vaccination')
                        ? 'border border-primary/40 bg-background text-foreground shadow-xs ring-1 ring-primary/20'
                        : 'border border-transparent bg-transparent text-muted-foreground hover:bg-background/60 hover:text-foreground'
                }`}
                onClick={() => onSectionChange('vaccination')}
            >
                <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors ${
                        isSectionActive('vaccination')
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted/60 text-muted-foreground'
                    }`}
                >
                    <Syringe className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                    <p
                        className={`text-sm font-semibold leading-tight ${
                            isSectionActive('vaccination')
                                ? 'text-foreground'
                                : 'text-muted-foreground'
                        }`}
                    >
                        Vaccination Management
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        Eligibility and administration
                    </p>
                </div>
            </button>

            <button
                type="button"
                className={`flex items-center justify-start gap-3 rounded-lg px-4 py-2.5 text-left transition-all ${
                    isSectionActive('history')
                        ? 'border border-primary/40 bg-background text-foreground shadow-xs ring-1 ring-primary/20'
                        : 'border border-transparent bg-transparent text-muted-foreground hover:bg-background/60 hover:text-foreground'
                }`}
                onClick={() => onSectionChange('history')}
            >
                <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors ${
                        isSectionActive('history')
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted/60 text-muted-foreground'
                    }`}
                >
                    <ClipboardList className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                    <p
                        className={`text-sm font-semibold leading-tight ${
                            isSectionActive('history')
                                ? 'text-foreground'
                                : 'text-muted-foreground'
                        }`}
                    >
                        Immunization History
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        Child vaccination card
                    </p>
                </div>
            </button>
        </div>
    );
}
