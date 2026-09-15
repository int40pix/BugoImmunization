import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import { useState } from 'react';


export type AgeUnit =
    | 'days'
    | 'weeks'
    | 'months'
    | 'years';


export type Schedule = {
    dose_number: number;
    recommended_age: string;
    interval: string;
};


type Props = {
    schedules: Schedule[];
    requiredDoses: number;
    onSchedulesChange: (schedules: Schedule[]) => void;
    errors?: Record<string, string | undefined>;
};


export default function VaccineScheduleForm({
    schedules,
    requiredDoses,
    onSchedulesChange,
    errors = {},
}: Props) {

    const [intervalMode, setIntervalMode] = useState<
        'same' | 'different'
    >(() => {
        const intervals = schedules
            .slice(1)
            .map((s) => s.interval)
            .filter(Boolean);

        return new Set(intervals).size <= 1
            ? 'same'
            : 'different';
    });


    /*
    |--------------------------------------------------------------------------
    | AGE HELPERS
    |--------------------------------------------------------------------------
    */

    function getAgeValue(age: string): string {
        return age?.trim().split(/\s+/)[0] ?? '';
    }


    function getAgeUnit(age: string): AgeUnit {
        const unit =
            age?.trim().toLowerCase().split(/\s+/)[1];

        if (unit === 'day' || unit === 'days') {
            return 'days';
        }

        if (unit === 'week' || unit === 'weeks') {
            return 'weeks';
        }

        if (unit === 'year' || unit === 'years') {
            return 'years';
        }

        return 'months';
    }


    function createAge(
        value: string,
        unit: AgeUnit
    ): string {
        if (!value) {
            return '';
        }

        if (Number(value) !== 1) {
            return `${value} ${unit}`;
        }

        return `1 ${unit.slice(0, -1)}`;
    }


    function formatAge(age: string): string {
        if (!age) {
            return '';
        }

        const value = Number(getAgeValue(age));
        const unit = getAgeUnit(age);

        if (value === 0 && unit === 'days') {
            return 'At birth';
        }

        const whole = Math.floor(value);

        const fraction =
            Math.round((value - whole) * 4) / 4;

        const symbols: Record<number, string> = {
            0.25: '¼',
            0.5: '½',
            0.75: '¾',
        };

        const symbol = symbols[fraction];

        const readableValue = symbol
            ? whole === 0
                ? symbol
                : `${whole}${symbol}`
            : String(value);

        const readableUnit =
            value === 1
                ? unit.slice(0, -1)
                : unit;

        return `${readableValue} ${readableUnit}`;
    }


    /*
    |--------------------------------------------------------------------------
    | AGE UPDATES
    |--------------------------------------------------------------------------
    */

    function updateAgeValue(
        index: number,
        value: string
    ) {
        const updated = [...schedules];

        updated[index] = {
            ...updated[index],
            recommended_age: createAge(
                value,
                getAgeUnit(
                    updated[index].recommended_age
                )
            ),
        };

        onSchedulesChange(updated);
    }


    function updateAgeUnit(
        index: number,
        unit: AgeUnit
    ) {
        const updated = [...schedules];

        updated[index] = {
            ...updated[index],
            recommended_age: createAge(
                getAgeValue(
                    updated[index].recommended_age
                ),
                unit
            ),
        };

        onSchedulesChange(updated);
    }


    /*
    |--------------------------------------------------------------------------
    | INTERVAL UPDATES
    |--------------------------------------------------------------------------
    */

    function updateInterval(
        index: number,
        value: string
    ) {
        const updated = [...schedules];

        if (intervalMode === 'same') {
            for (let i = 1; i < updated.length; i++) {
                updated[i] = {
                    ...updated[i],
                    interval: value,
                };
            }
        } else {
            updated[index] = {
                ...updated[index],
                interval: value,
            };
        }

        onSchedulesChange(updated);
    }


    function changeIntervalMode(
        mode: 'same' | 'different'
    ) {
        setIntervalMode(mode);

        if (mode !== 'same') {
            return;
        }

        const value =
            schedules[1]?.interval ?? '';

        const updated = schedules.map(
            (schedule, index) => ({
                ...schedule,
                interval:
                    index === 0
                        ? ''
                        : value,
            })
        );

        onSchedulesChange(updated);
    }


    /*
    |--------------------------------------------------------------------------
    | PAGE
    |--------------------------------------------------------------------------
    */

    return (
        <div className="space-y-4">

            {/* HEADER */}

            <div>
                <h3 className="text-lg font-semibold">
                    Immunization Schedule
                </h3>

                <p className="text-sm text-muted-foreground">
                    Enter the recommended age and required
                    interval for each dose.
                </p>
            </div>


            {/* INTERVAL PATTERN */}

            {requiredDoses > 1 && (
                <div className="flex flex-wrap items-center gap-3">

                    <span className="text-sm font-medium">
                        Interval Pattern:
                    </span>

                    <Button
                        type="button"
                        size="sm"
                        variant={
                            intervalMode === 'same'
                                ? 'default'
                                : 'outline'
                        }
                        onClick={() =>
                            changeIntervalMode('same')
                        }
                    >
                        Same Throughout
                    </Button>

                    <Button
                        type="button"
                        size="sm"
                        variant={
                            intervalMode === 'different'
                                ? 'default'
                                : 'outline'
                        }
                        onClick={() =>
                            changeIntervalMode('different')
                        }
                    >
                        Different Per Dose
                    </Button>

                </div>
            )}


            {/* TABLE */}

            <div className="overflow-hidden rounded-lg border">

                {/* TABLE HEADER */}

                <div className="grid grid-cols-[90px_1fr_220px] bg-muted/40 text-sm font-semibold">

                    <div className="border-r px-4 py-3 text-center">
                        Dose
                    </div>

                    <div className="border-r px-4 py-3">
                        Recommended Age
                    </div>

                    <div className="px-4 py-3 text-center">
                        Required Interval
                    </div>

                </div>


                {/* DOSE ROWS */}

                {schedules.map((schedule, index) => {

                    const ageValue =
                        getAgeValue(
                            schedule.recommended_age
                        );

                    const ageUnit =
                        getAgeUnit(
                            schedule.recommended_age
                        );

                    const readableAge =
                        formatAge(
                            schedule.recommended_age
                        );

                    const showIntervalInput =
                        index > 0 &&
                        (
                            intervalMode === 'different' ||
                            index === 1
                        );


                    return (
                        <div
                            key={schedule.dose_number}
                            className="grid grid-cols-[90px_1fr_220px] border-t"
                        >

                            {/* DOSE */}

                            <div className="flex items-center justify-center border-r px-3 py-4 font-semibold">
                                {schedule.dose_number}
                            </div>


                            {/* RECOMMENDED AGE */}

                            <div className="border-r px-4 py-4">

                                <div className="grid gap-2 sm:grid-cols-[1fr_150px]">

                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.25"
                                        placeholder="e.g. 1.5"
                                        value={ageValue}
                                        onChange={(e) =>
                                            updateAgeValue(
                                                index,
                                                e.target.value
                                            )
                                        }
                                    />

                                    <Select
                                        value={ageUnit}
                                        onValueChange={(value) =>
                                            updateAgeUnit(
                                                index,
                                                value as AgeUnit
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>

                                        <SelectContent>

                                            <SelectItem value="days">
                                                Days
                                            </SelectItem>

                                            <SelectItem value="weeks">
                                                Weeks
                                            </SelectItem>

                                            <SelectItem value="months">
                                                Months
                                            </SelectItem>

                                            <SelectItem value="years">
                                                Years
                                            </SelectItem>

                                        </SelectContent>
                                    </Select>

                                </div>


                                {readableAge && (
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        Displays as:{' '}

                                        <span className="font-medium text-foreground">
                                            {readableAge}
                                        </span>
                                    </p>
                                )}


                                {errors[
                                    `schedules.${index}.recommended_age`
                                ] && (
                                    <p className="mt-2 text-sm text-red-500">
                                        {
                                            errors[
                                                `schedules.${index}.recommended_age`
                                            ]
                                        }
                                    </p>
                                )}

                            </div>


                            {/* REQUIRED INTERVAL */}

                            <div className="flex items-center justify-center px-4 py-4">

                                {index === 0 ? (

                                    /*
                                     * Initial dose now uses the
                                     * same box shape as interval
                                     * inputs for symmetry.
                                     */

                                    <div className="w-full space-y-2">

                                        <div className="flex h-10 items-center justify-center rounded-md border">
                                            <span className="text-sm font-medium">
                                                Initial dose
                                            </span>
                                        </div>

                                        <p className="text-center text-xs text-muted-foreground">
                                            No previous dose
                                        </p>

                                    </div>

                                ) : showIntervalInput ? (

                                    <div className="w-full space-y-2">

                                        <div className="relative">

                                            <Input
                                                type="number"
                                                min="1"
                                                step="1"
                                                placeholder="e.g. 28"
                                                value={
                                                    schedule.interval
                                                }
                                                onChange={(e) =>
                                                    updateInterval(
                                                        index,
                                                        e.target.value
                                                    )
                                                }
                                                className="pr-14"
                                            />

                                            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-foreground">
                                                days
                                            </span>

                                        </div>

                                        <p className="text-center text-xs text-muted-foreground">
                                            After Dose{' '}
                                            {schedule.dose_number - 1}
                                        </p>

                                        {errors[
                                            `schedules.${index}.interval`
                                        ] && (
                                            <p className="text-sm text-red-500">
                                                {
                                                    errors[
                                                        `schedules.${index}.interval`
                                                    ]
                                                }
                                            </p>
                                        )}

                                    </div>

                                ) : (

                                    <div className="w-full space-y-2">

                                        <div className="flex h-10 items-center justify-center rounded-md border">
                                            <span className="text-sm font-medium">
                                                {schedule.interval || '—'} days
                                            </span>
                                        </div>

                                        <p className="text-center text-xs text-muted-foreground">
                                            Same interval
                                        </p>

                                    </div>

                                )}

                            </div>

                        </div>
                    );
                })}

            </div>


            {/* PREVIEW */}

            <div className="rounded-lg border bg-muted/20 p-4">

                <p className="mb-2 text-sm font-semibold">
                    Immunization Card Schedule Preview
                </p>

                <div className="text-sm">

                    <span className="font-semibold">
                        {requiredDoses}{' '}
                        {requiredDoses === 1
                            ? 'dose'
                            : 'doses'}
                    </span>

                    {' ('}

                    {schedules.map((schedule, index) => (
                        <span key={schedule.dose_number}>

                            {formatAge(
                                schedule.recommended_age
                            ) ||
                                `Dose ${schedule.dose_number}`}

                            {index < schedules.length - 2
                                ? ', '
                                : index === schedules.length - 2
                                  ? ' & '
                                  : ''}

                        </span>
                    ))}

                    {')'}

                </div>

            </div>

        </div>
    );
}