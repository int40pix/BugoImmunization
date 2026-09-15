<?php

namespace App\Utils;

use App\Models\Patient;

class PatientIdGenerator
{
    /**
     * Generate standard unique patient identifier format: PT-XXXXXX
     */
    public static function generate(): string
    {
        $latest = Patient::query()->latest('id')->first();
        $next = $latest ? ((int) substr($latest->patient_id, 3) + 1) : 1;

        return 'PT-' . str_pad((string) $next, 6, '0', STR_PAD_LEFT);
    }
}
