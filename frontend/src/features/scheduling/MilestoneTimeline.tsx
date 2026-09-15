import React from 'react';

export interface MilestoneItem {
    id: number;
    title: string;
    dueDate: string;
    vaccines: string[];
    isCompleted: boolean;
}

interface MilestoneTimelineProps {
    milestones: MilestoneItem[];
}

export const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({ milestones }) => {
    return (
        <div className="relative border-l-2 border-border pl-6 space-y-6">
            {milestones.map((m) => (
                <div key={m.id} className="relative group">
                    <div
                        className={`absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-background ${
                            m.isCompleted ? 'bg-emerald-500' : 'bg-muted-foreground'
                        }`}
                    />
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
                        <h4 className="text-sm font-semibold text-foreground">{m.title}</h4>
                        <time className="text-xs text-muted-foreground">{m.dueDate}</time>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Vaccines: <span className="font-medium text-foreground">{m.vaccines.join(', ')}</span>
                    </p>
                </div>
            ))}
        </div>
    );
};
