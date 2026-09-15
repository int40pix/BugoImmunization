<?php

namespace App\Utils;

use Carbon\Carbon;

class DateHelper
{
    /**
     * Compute age in months from birth date.
     */
    public static function getAgeInMonths(string|Carbon $dob): int
    {
        $birth = is_string($dob) ? Carbon::parse($dob) : $dob;
        return (int) $birth->diffInMonths(Carbon::now());
    }

    /**
     * Compute age display string (e.g. '3 months', '1 year 2 months').
     */
    public static function formatAge(string|Carbon $dob): string
    {
        $birth = is_string($dob) ? Carbon::parse($dob) : $dob;
        $diff = $birth->diff(Carbon::now());

        if ($diff->y > 0) {
            return $diff->y . ' yr' . ($diff->y > 1 ? 's ' : ' ') . $diff->m . ' mo' . ($diff->m > 1 ? 's' : '');
        }

        if ($diff->m > 0) {
            return $diff->m . ' month' . ($diff->m > 1 ? 's' : '');
        }

        return $diff->d . ' day' . ($diff->d > 1 ? 's' : '');
    }
}
