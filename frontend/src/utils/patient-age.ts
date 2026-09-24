export function parseDateOfBirth(dateOfBirth?: string | null): Date | null {
    if (!dateOfBirth) {
        return null;
    }

    const datePart = dateOfBirth.split('T')[0];
    const parts = datePart.split('-');

    if (parts.length !== 3) {
        return null;
    }

    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    if (
        Number.isNaN(year) ||
        Number.isNaN(month) ||
        Number.isNaN(day)
    ) {
        return null;
    }

    const date = new Date(year, month - 1, day);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date;
}

export function formatDateOfBirth(dateOfBirth?: string | null): string {
    const date = parseDateOfBirth(dateOfBirth);

    if (!date) {
        return '—';
    }

    return date.toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
    });
}

export function getFractionCharacter(fraction: number): string {
    if (fraction === 0.25) return '¼';
    if (fraction === 0.5) return '½';
    if (fraction === 0.75) return '¾';
    return '';
}

export function calculateAge(dateOfBirth?: string | null): string {
    if (!dateOfBirth) {
        return '—';
    }

    const birthDate = parseDateOfBirth(dateOfBirth);

    if (!birthDate) {
        return '—';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    birthDate.setHours(0, 0, 0, 0);

    if (birthDate > today) {
        return '—';
    }

    let totalMonths =
        (today.getFullYear() - birthDate.getFullYear()) * 12 +
        (today.getMonth() - birthDate.getMonth());

    if (today.getDate() < birthDate.getDate()) {
        totalMonths -= 1;
    }

    totalMonths = Math.max(0, totalMonths);

    const monthAnchor = new Date(
        birthDate.getFullYear(),
        birthDate.getMonth() + totalMonths,
        birthDate.getDate(),
    );

    const expectedMonth = (birthDate.getMonth() + totalMonths) % 12;

    if (monthAnchor.getMonth() !== expectedMonth) {
        monthAnchor.setDate(0);
    }

    let remainingDays = Math.floor(
        (today.getTime() - monthAnchor.getTime()) /
            (1000 * 60 * 60 * 24),
    );

    remainingDays = Math.max(0, remainingDays);

    let fraction = Math.floor((remainingDays / 30) * 4) / 4;

    if (fraction >= 1) {
        totalMonths += 1;
        fraction = 0;
    }

    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    const fractionCharacter = getFractionCharacter(fraction);

    if (years === 0) {
        if (totalMonths === 0) {
            const diffTime = today.getTime() - birthDate.getTime();
            const totalDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
            return `${totalDays} ${totalDays === 1 ? 'day' : 'days'}`;
        }

        const unit = months === 1 && fraction === 0 ? 'mo' : 'mos';
        return `${months}${fractionCharacter} ${unit}`;
    }

    const yearText = `${years} ${years === 1 ? 'yr' : 'yrs'}`;

    if (months === 0 && fraction === 0) {
        return yearText;
    }

    if (months === 0 && fraction > 0) {
        return `${yearText} ${fractionCharacter} mo`;
    }

    const monthUnit = months === 1 && fraction === 0 ? 'mo' : 'mos';
    return `${yearText} ${months}${fractionCharacter} ${monthUnit}`;
}
