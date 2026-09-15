<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Patient extends Model
{
    protected $fillable = [
        'guardian_id',
        'patient_id',
        'first_name',
        'middle_name',
        'last_name',
        'nickname',
        'date_of_birth',
        'sex',
        'address',

        'mother_name',
        'father_name',
        'birth_type',
        'is_full_term',
        'multiple_birth',
        'birth_attendant',
        'blood_type',
        'birth_weight',
        'birth_length',
        'head_circumference',
        'chest_circumference',
        'birth_order',
        'birth_registration_date',
        'birth_registration_place',
        'birth_family_notes',

        'guardian_relationship',

        'medical_background',
        'allergies',
        'existing_conditions',
        'status',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'birth_registration_date' => 'date',
        'is_full_term' => 'boolean',

        'birth_weight' => 'decimal:2',
        'birth_length' => 'decimal:2',
        'head_circumference' => 'decimal:2',
        'chest_circumference' => 'decimal:2',
    ];

    /**
     * Parent / guardian account that owns this child record.
     */
    public function guardian(): BelongsTo
    {
        return $this->belongsTo(Guardian::class);
    }

    /**
     * Actual immunization records/history
     * belonging to this patient.
     */
    public function immunizationRecords(): HasMany
    {
        return $this->hasMany(
            ImmunizationRecord::class
        );
    }

    /**
     * Patient-specific manual immunization card rows.
     */
    public function immunizationCardRows(): HasMany
    {
        return $this->hasMany(
            PatientImmunizationCardRow::class
        );
    }

    /**
     * Optional vaccines explicitly assigned
     * to this patient.
     */
    public function optionalVaccines(): BelongsToMany
    {
        return $this->belongsToMany(
            Vaccine::class,
            'patient_vaccines'
        )
            ->withPivot([
                'added_by',
                'notes',
            ])
            ->withTimestamps();
    }

    /**
     * Patient-specific planned vaccine doses.
     */
    public function vaccineSchedules(): HasMany
    {
        return $this->hasMany(
            PatientVaccineSchedule::class
        );
    }
}