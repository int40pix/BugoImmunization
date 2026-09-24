import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, FileText, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import ScheduleStatusReportView, {
    ScheduleStatusReportData,
} from './schedule-status-report-view';
import VaccineCoverageReportView, {
    CoverageReportData,
} from './vaccine-coverage-report-view';

type Props = {
    coverageReport?: CoverageReportData;
    scheduleStatusReport?: ScheduleStatusReportData;
    vaccines: Array<{ id: number; name: string; category: string }>;
    initialReport?: 'coverage' | 'schedule-status';
};

export default function ReportsHub({
    coverageReport,
    scheduleStatusReport,
    vaccines,
    initialReport = 'coverage',
}: Props) {
    const [activeReport, setActiveReport] = useState<'coverage' | 'schedule-status'>(
        initialReport,
    );

    return (
        <div className="space-y-6">
            {/* Report Sub-Tabs Switcher */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b pb-4">
                <div className="flex max-w-full overflow-x-auto no-scrollbar rounded-lg border bg-muted/40 p-1">
                    <button
                        type="button"
                        onClick={() => setActiveReport('coverage')}
                        className={`flex items-center gap-2 rounded-md px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
                            activeReport === 'coverage'
                                ? 'bg-background text-foreground shadow-sm font-semibold'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <ShieldCheck className="h-4 w-4 text-teal-600" />
                        Vaccine Coverage Report
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveReport('schedule-status')}
                        className={`flex items-center gap-2 rounded-md px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
                            activeReport === 'schedule-status'
                                ? 'bg-background text-foreground shadow-sm font-semibold'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Calendar className="h-4 w-4 text-sky-600" />
                        Immunization Schedule Status Report
                    </button>
                </div>

                <div className="text-xs text-muted-foreground hidden sm:block">
                    Barangay Bugo Health Center &bull; DOH Compliance Reports
                </div>
            </div>

            {/* Active Report View */}
            {activeReport === 'coverage' ? (
                <VaccineCoverageReportView
                    reportData={coverageReport}
                    vaccines={vaccines}
                />
            ) : (
                <ScheduleStatusReportView
                    reportData={scheduleStatusReport}
                    vaccines={vaccines}
                />
            )}
        </div>
    );
}
