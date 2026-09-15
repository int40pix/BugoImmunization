<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ImmunizationRecord extends Model
{
    protected $fillable = [
        'patient_id',
        'vaccine_id',
        'dose_number',
        'date_administered',
        'administered_by',
        'source',
        'remarks',
    ];

    protected $casts = [
        'date_administered' => 'date',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function vaccine(): BelongsTo
    {
        return $this->belongsTo(Vaccine::class);
    }

    public function administeredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'administered_by');
    }
}