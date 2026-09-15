<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vaccine extends Model
{
    protected $fillable = [
        'name',
        'description',
        'required_doses',
        'category',
    ];

    /**
     * Actual immunization records belonging
     * to this vaccine.
     */
    public function immunizationRecords(): HasMany
    {
        return $this->hasMany(
            ImmunizationRecord::class
        );
    }

    /**
     * Inventory batches belonging to this vaccine.
     */
    public function inventory(): HasMany
    {
        return $this->hasMany(
            VaccineInventory::class
        );
    }

    /**
     * Master dose schedule for this vaccine.
     *
     * Example:
     * Dose 1 -> At birth
     * Dose 2 -> 1.5 months
     * Dose 3 -> 2.5 months
     */
    public function schedules(): HasMany
    {
        return $this->hasMany(
            VaccineSchedule::class
        );
    }

    /**
     * Patients who have explicitly added this
     * vaccine to their structured immunization
     * tracking.
     *
     * This relationship is intended for Optional
     * vaccines. Routine vaccines automatically
     * apply to all patients and do not need rows
     * in patient_vaccines.
     */
    public function assignedPatients(): BelongsToMany
    {
        return $this->belongsToMany(
            Patient::class,
            'patient_vaccines'
        )
            ->withPivot([
                'added_by',
                'notes',
            ])
            ->withTimestamps();
    }

    /**
     * Patient-specific planned dose schedules
     * involving this vaccine.
     */
    public function patientSchedules(): HasMany
    {
        return $this->hasMany(
            PatientVaccineSchedule::class
        );
    }
}