<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VaccineSchedule extends Model
{
    protected $fillable = [
        'vaccine_id',
        'dose_number',
        'recommended_age',
        'interval',
    ];

    public function vaccine(): BelongsTo
    {
        return $this->belongsTo(Vaccine::class);
    }
}