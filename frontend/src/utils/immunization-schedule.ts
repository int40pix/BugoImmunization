/**
 * Utilities for Immunization Card Scheduling & Recommendations
 *
 * Implements standard Philippine DOH EPI schedules and clinic Wednesday alignment
 * for Barangay Bugo Health Center.
 */

export interface CardDoseLike {
    dose_number: number;
    recommended_age?: string | null;
    interval?: string | null;
    record?: {
        date_administered?: string | null;
        [key: string]: any;
    } | null;
    schedule?: {
        scheduled_date?: string | null;
        [key: string]: any;
    } | null;
    recommended_date?: string | null;
    is_due?: boolean | null;
}

export interface CardVaccineLike {
    vaccine_id?: number;
    vaccine_name?: string;
    doses: CardDoseLike[];
    [key: string]: any;
}

/**
 * Parses YYYY-MM-DD string into a Local Date object (time set to local midnight)
 */
export function parseDate(date: string | null | undefined): Date | null {
    if (!date) return null;

    const datePart = date.split('T')[0];
    const parts = datePart.split('-');

    if (parts.length !== 3) return null;

    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
        return null;
    }

    const parsed = new Date(year, month - 1, day);
    if (Number.isNaN(parsed.getTime())) {
        return null;
    }

    return parsed;
}

/**
 * Formats a date string as MM/DD/YY (standard Philippine Immunization Card format)
 */
export function formatCompactDate(date: string | null | undefined): string {
    const parsed = parseDate(date);
    if (!parsed) {
        return '—';
    }

    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    const year = String(parsed.getFullYear()).slice(-2);

    return `${month}/${day}/${year}`;
}

/**
 * Normalizes recommended age strings into formatted display (e.g. 1½ months)
 */
export function formatRecommendedAge(age: string | null | undefined): string {
    if (!age) {
        return '—';
    }

    const normalized = age.trim().toLowerCase();
    if (
        normalized === '0 days' ||
        normalized === '0 day' ||
        normalized === 'at birth' ||
        normalized === 'birth'
    ) {
        return 'At birth';
    }

    return age
        .replace(/(\d+)\.25\b/g, '$1¼')
        .replace(/(\d+)\.5\b/g, '$1½')
        .replace(/(\d+)\.50\b/g, '$1½')
        .replace(/(\d+)\.75\b/g, '$1¾');
}

/**
 * Converts a recommended age string (e.g. '1.5 months', '6 weeks', '9 months') to days
 */
export function recommendedAgeToDays(ageStr: string | null | undefined): number {
    if (!ageStr) return 0;

    const normalized = ageStr.trim().toLowerCase();
    if (
        normalized === '0 days' ||
        normalized === '0 day' ||
        normalized === 'at birth' ||
        normalized === 'birth'
    ) {
        return 0;
    }

    const match = normalized.match(/([\d.]+)\s*(day|days|week|weeks|month|months|mo|mos|year|years|yr|yrs)?/);
    if (!match) return 0;

    const val = parseFloat(match[1]) || 0;
    const unit = match[2] || 'days';

    if (unit.startsWith('day')) return Math.round(val);
    if (unit.startsWith('week')) return Math.round(val * 7);
    if (unit.startsWith('mo')) {
        if (Math.abs(val - 1.5) < 0.01) return 42; // 6 weeks (DOH EPI 1.5 months)
        if (Math.abs(val - 2.5) < 0.01) return 70; // 10 weeks (DOH EPI 2.5 months)
        if (Math.abs(val - 3.5) < 0.01) return 98; // 14 weeks (DOH EPI 3.5 months)
        const whole = Math.floor(val);
        const frac = val - whole;
        return Math.round(whole * 30 + frac * 28);
    }
    if (unit.startsWith('year') || unit.startsWith('yr')) return Math.round(val * 365);

    return Math.round(val);
}

/**
 * Aligns a Date to the next Wednesday (or preserves if already Wednesday).
 * Bugo Health Center conducts regular immunization clinics on Wednesdays.
 */
export function alignToWednesday(date: Date): Date {
    const result = new Date(date);
    const day = result.getDay(); // 0 = Sunday, 3 = Wednesday
    const daysUntilWednesday = (3 - day + 7) % 7;
    result.setDate(result.getDate() + daysUntilWednesday);
    return result;
}

/**
 * Calculates recommended date for a specific dose based on:
 * 1. Server pre-calculated recommended_date if provided
 * 2. Last administered dose of this vaccine + cumulative intervals
 * 3. Last scheduled dose of this vaccine + cumulative intervals
 * 4. Child's date of birth + recommended age
 *
 * Automatically aligns to Bugo Health Center's Wednesday clinic schedule.
 */
export function getDoseRecommendedDate(
    vaccine: CardVaccineLike,
    targetDose: CardDoseLike,
    dateOfBirth: string | null | undefined,
): string | null {
    // If dose is already marked due, it has no future recommended date
    if (targetDose.is_due) {
        return null;
    }

    // 1. If backend already supplied recommended_date, use it directly
    if (targetDose.recommended_date) {
        return targetDose.recommended_date;
    }

    // 2. If this dose is already administered, return date_administered
    if (targetDose.record?.date_administered) {
        return targetDose.record.date_administered;
    }

    // 3. If this dose is already scheduled, return scheduled_date
    if (targetDose.schedule?.scheduled_date) {
        return targetDose.schedule.scheduled_date;
    }

    const vName = (vaccine.vaccine_name || '').toLowerCase();
    const recAge = (targetDose.recommended_age || '').toLowerCase().trim();
    const isBirthVaccine =
        targetDose.dose_number === 1 && (
            vName.includes('bcg') ||
            vName.includes('hepatitis b') ||
            vName.includes('hep b') ||
            recAge === 'at birth' ||
            recAge === 'birth' ||
            recAge === '0 days' ||
            recAge === '0 day'
        );

    // Birth doses are DUE at birth, not a future recommendation milestone
    if (isBirthVaccine) {
        return null;
    }

    const targetDoseNum = targetDose.dose_number;

    // 4. Find the most recent administered dose prior to targetDoseNum
    let lastAdministered: { dose_number: number; date: Date } | null = null;
    for (const d of vaccine.doses) {
        if (d.dose_number < targetDoseNum && d.record?.date_administered) {
            const parsed = parseDate(d.record.date_administered);
            if (parsed) {
                if (!lastAdministered || d.dose_number > lastAdministered.dose_number) {
                    lastAdministered = { dose_number: d.dose_number, date: parsed };
                }
            }
        }
    }

    // 5. Find the most recent scheduled dose prior to targetDoseNum if none administered
    let lastScheduled: { dose_number: number; date: Date } | null = null;
    if (!lastAdministered) {
        for (const d of vaccine.doses) {
            if (d.dose_number < targetDoseNum && d.schedule?.scheduled_date) {
                const parsed = parseDate(d.schedule.scheduled_date);
                if (parsed) {
                    if (!lastScheduled || d.dose_number > lastScheduled.dose_number) {
                        lastScheduled = { dose_number: d.dose_number, date: parsed };
                    }
                }
            }
        }
    }

    let baseDate: Date | null = null;
    let startDoseNum = 1;

    if (lastAdministered) {
        baseDate = new Date(lastAdministered.date);
        startDoseNum = lastAdministered.dose_number + 1;
    } else if (lastScheduled) {
        baseDate = new Date(lastScheduled.date);
        startDoseNum = lastScheduled.dose_number + 1;
    } else if (dateOfBirth) {
        const parsedDob = parseDate(dateOfBirth);
        if (parsedDob) {
            const firstDose = vaccine.doses.find((d) => d.dose_number === 1) || targetDose;
            const daysFromDob = recommendedAgeToDays(firstDose.recommended_age);
            baseDate = new Date(parsedDob);
            baseDate.setDate(baseDate.getDate() + daysFromDob);
            startDoseNum = 2;
        }
    }

    if (!baseDate) {
        return null;
    }

    // Accumulate intervals up to targetDoseNum
    for (let step = startDoseNum; step <= targetDoseNum; step++) {
        const stepDose = vaccine.doses.find((d) => d.dose_number === step);
        let intervalDays = 28; // Standard 4 weeks for EPI infant multi-dose routine

        if (stepDose?.interval) {
            const parsedInt = parseInt(String(stepDose.interval), 10);
            if (!isNaN(parsedInt) && parsedInt > 0) {
                intervalDays = parsedInt;
            }
        } else if (stepDose?.recommended_age) {
            const prevDose = vaccine.doses.find((d) => d.dose_number === step - 1);
            if (prevDose?.recommended_age) {
                const diffDays =
                    recommendedAgeToDays(stepDose.recommended_age) -
                    recommendedAgeToDays(prevDose.recommended_age);
                if (diffDays > 0) {
                    intervalDays = diffDays;
                }
            }
        }

        baseDate.setDate(baseDate.getDate() + intervalDays);
    }

    // Align to Bugo clinic Wednesday
    baseDate = alignToWednesday(baseDate);

    // If the calculated date is already today or in the past, it is DUE, not a future recommendation
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (baseDate <= today) {
        return null;
    }

    const year = baseDate.getFullYear();
    const month = String(baseDate.getMonth() + 1).padStart(2, '0');
    const day = String(baseDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

/**
 * Checks whether an unadministered, unscheduled dose is currently DUE for administration.
 * Doses are due if:
 * 1. Explicitly flagged as is_due by the backend
 * 2. Birth doses (BCG, Hepatitis B dose 1) that were not toggled as received at birth
 * 3. Doses whose recommended age milestone date from DoB has already arrived (<= today)
 */
export function isDoseDue(
    vaccine: CardVaccineLike,
    targetDose: CardDoseLike,
    dateOfBirth: string | null | undefined,
): boolean {
    if (targetDose.record?.date_administered) {
        return false;
    }
    if (targetDose.schedule?.scheduled_date) {
        return false;
    }
    if (targetDose.is_due) {
        return true;
    }

    const vName = (vaccine.vaccine_name || '').toLowerCase();
    const recAge = (targetDose.recommended_age || '').toLowerCase().trim();
    const isBirthVaccine =
        targetDose.dose_number === 1 && (
            vName.includes('bcg') ||
            vName.includes('hepatitis b') ||
            vName.includes('hep b') ||
            recAge === 'at birth' ||
            recAge === 'birth' ||
            recAge === '0 days' ||
            recAge === '0 day'
        );

    if (isBirthVaccine) {
        return true;
    }

    if (dateOfBirth) {
        const parsedDob = parseDate(dateOfBirth);
        if (parsedDob) {
            const ageDays = recommendedAgeToDays(targetDose.recommended_age);
            const targetDate = new Date(parsedDob);
            targetDate.setDate(targetDate.getDate() + ageDays);

            const today = new Date();
            today.setHours(23, 59, 59, 999);
            if (targetDate <= today) {
                if (targetDose.dose_number === 1) {
                    return true;
                }
                const prevDose = vaccine.doses?.find((d) => d.dose_number === targetDose.dose_number - 1);
                if (prevDose?.record?.date_administered) {
                    return true;
                }
            }
        }
    }

    return false;
}
