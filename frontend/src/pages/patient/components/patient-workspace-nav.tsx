import { Button } from '@/components/ui/button';
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
    const sectionButtonClass = (
        section: PatientSection,
    ) => {
        if (activeSection === section) {
            return 'border-primary bg-primary text-primary-foreground hover:bg-primary/90';
        }

        return 'bg-background';
    };

    return (
        <div className="grid gap-2 rounded-xl border bg-background p-2 sm:grid-cols-3">
            <Button
                type="button"
                variant="outline"
                className={`h-auto justify-start gap-3 px-4 py-3 ${sectionButtonClass(
                    'general',
                )}`}
                onClick={() =>
                    onSectionChange('general')
                }
            >
                <UserRound className="h-4 w-4 shrink-0" />

                <div className="text-left">
                    <p className="font-semibold">
                        General Information
                    </p>

                    <p
                        className={`text-xs ${
                            activeSection === 'general'
                                ? 'text-primary-foreground/80'
                                : 'text-muted-foreground'
                        }`}
                    >
                        Patient and guardian
                    </p>
                </div>
            </Button>

            <Button
                type="button"
                variant="outline"
                className={`h-auto justify-start gap-3 px-4 py-3 ${sectionButtonClass(
                    'vaccination',
                )}`}
                onClick={() =>
                    onSectionChange('vaccination')
                }
            >
                <Syringe className="h-4 w-4 shrink-0" />

                <div className="text-left">
                    <p className="font-semibold">
                        Vaccination Management
                    </p>

                    <p
                        className={`text-xs ${
                            activeSection ===
                            'vaccination'
                                ? 'text-primary-foreground/80'
                                : 'text-muted-foreground'
                        }`}
                    >
                        Eligibility and administration
                    </p>
                </div>
            </Button>

            <Button
                type="button"
                variant="outline"
                className={`h-auto justify-start gap-3 px-4 py-3 ${sectionButtonClass(
                    'history',
                )}`}
                onClick={() =>
                    onSectionChange('history')
                }
            >
                <ClipboardList className="h-4 w-4 shrink-0" />

                <div className="text-left">
                    <p className="font-semibold">
                        Immunization History
                    </p>

                    <p
                        className={`text-xs ${
                            activeSection === 'history'
                                ? 'text-primary-foreground/80'
                                : 'text-muted-foreground'
                        }`}
                    >
                        Child vaccination card
                    </p>
                </div>
            </Button>
        </div>
    );
}
