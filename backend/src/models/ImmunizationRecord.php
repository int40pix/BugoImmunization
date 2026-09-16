<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ImmunizationRecord extends Model
{
    protected $fillable = [
        'patient_id',
        'vaccine_id',
        'dose_number',
        'batch_number',
        'date_administered',
        'administered_by',
        'consent_given_by',
        'injection_site',
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

    public function inventoryTransaction(): HasOne
    {
        return $this->hasOne(VaccineInventoryTransaction::class, 'immunization_record_id');
    }
}