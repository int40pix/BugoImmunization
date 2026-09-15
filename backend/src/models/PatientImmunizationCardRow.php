<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PatientImmunizationCardRow extends Model
{
    protected $fillable = [
        'patient_id',
        'vaccine_name',
        'dose_count',
        'doses',
        'remarks',
    ];

    protected $casts = [
        'dose_count' => 'integer',
        'doses' => 'array',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }
}