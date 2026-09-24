<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PatientVaccineSchedule extends Model
{
    public const STATUS_SCHEDULED = 'scheduled';
    public const STATUS_UPCOMING = 'upcoming';
    public const STATUS_OVERDUE = 'overdue';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELLED = 'cancelled';

    public const ACTIVE_SCHEDULE_STATUSES = ['scheduled', 'upcoming', 'overdue'];

    protected $fillable = [
        'patient_id',
        'vaccine_id',
        'vaccine_inventory_id',
        'dose_number',
        'scheduled_date',
        'status',
        'is_manually_adjusted',
        'is_series_completion_candidate',
        'priority_reason',
        'allocation_rank',
        'allocation_snapshot',
        'allocated_at',
        'adjusted_by',
        'adjusted_at',
        'adjustment_reason',
    ];

    /**
     * Scope query to pending (unadministered) schedules: scheduled, upcoming, overdue.
     */
    public function scopePending($query)
    {
        return $query->whereIn('status', self::ACTIVE_SCHEDULE_STATUSES);
    }

    protected $casts = [
        'scheduled_date' => 'date',
        'is_manually_adjusted' => 'boolean',
        'is_series_completion_candidate' => 'boolean',
        'allocation_rank' => 'integer',
        'allocation_snapshot' => 'array',
        'allocated_at' => 'datetime',
        'adjusted_at' => 'datetime',
    ];

    /**
     * Patient this planned vaccine dose belongs to.
     */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(
            Patient::class
        );
    }

    /**
     * Vaccine being planned for this patient.
     */
    public function vaccine(): BelongsTo
    {
        return $this->belongsTo(
            Vaccine::class
        );
    }

    /**
     * Exact inventory batch reserved for this appointment.
     */
    public function inventoryBatch(): BelongsTo
    {
        return $this->belongsTo(
            VaccineInventory::class,
            'vaccine_inventory_id'
        );
    }

    /**
     * Staff member responsible for the latest
     * manual schedule adjustment.
     */
    public function adjustedBy(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'adjusted_by'
        );
    }
}