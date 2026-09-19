import React from 'react';

export interface CardDoseItem {
    id: number;
    vaccineName: string;
    doseNumber: number;
    targetAge: string;
    dateGiven: string | null;
    batchNumber: string | null;
    administeredBy: string | null;
    status: 'Completed' | 'Pending' | 'Overdue';
}

interface ImmunizationCardViewProps {
    patientName: string;
    patientId: string;
    dateOfBirth: string;
    doses: CardDoseItem[];
}

export const ImmunizationCardView: React.FC<ImmunizationCardViewProps> = ({
    patientName,
    patientId,
    dateOfBirth,
    doses,
}) => {
    return (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
                <div>
                    <h3 className="text-lg font-semibold tracking-tight text-foreground">
                        Republic of the Philippines - Department of Health
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Barangay Bugo Health Center &bull; Child Immunization Card
                    </p>
                </div>
                <div className="text-left sm:text-right">
                    <span className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                        ID: {patientId}
                    </span>
                    <p className="mt-1 text-xs text-muted-foreground">DOB: {dateOfBirth}</p>
                </div>
            </div>

            <div className="mb-4">
                <span className="text-sm font-medium text-foreground">Child Name: </span>
                <span className="text-sm font-semibold text-foreground">{patientName}</span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[650px]">
                    <thead className="border-b border-border bg-muted/50 uppercase tracking-wider text-muted-foreground">
                        <tr>
                            <th className="px-3 py-2.5">Vaccine</th>
                            <th className="px-3 py-2.5">Dose</th>
                            <th className="px-3 py-2.5">Target Age</th>
                            <th className="px-3 py-2.5">Date Given</th>
                            <th className="px-3 py-2.5">Lot / Batch</th>
                            <th className="px-3 py-2.5">Vaccinator</th>
                            <th className="px-3 py-2.5">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {doses.map((dose) => (
                            <tr key={dose.id} className="hover:bg-muted/30 transition-colors">
                                <td className="px-3 py-2.5 font-medium text-foreground">{dose.vaccineName}</td>
                                <td className="px-3 py-2.5">{dose.doseNumber}</td>
                                <td className="px-3 py-2.5 text-muted-foreground">{dose.targetAge}</td>
                                <td className="px-3 py-2.5">{dose.dateGiven || '—'}</td>
                                <td className="px-3 py-2.5 font-mono text-muted-foreground">{dose.batchNumber || '—'}</td>
                                <td className="px-3 py-2.5">{dose.administeredBy || '—'}</td>
                                <td className="px-3 py-2.5">
                                    <span
                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                            dose.status === 'Completed'
                                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                                : dose.status === 'Overdue'
                                                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                        }`}
                                    >
                                        {dose.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
