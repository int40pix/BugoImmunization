<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VaccineInventoryTransaction extends Model
{
    protected $fillable = [
        'vaccine_id',
        'vaccine_inventory_id',
        'user_id',
        'patient_id',
        'immunization_record_id',
        'transaction_type',
        'quantity_change',
        'balance_after',
        'batch_number',
        'remarks',
    ];

    protected $casts = [
        'quantity_change' => 'integer',
        'balance_after' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function vaccine(): BelongsTo
    {
        return $this->belongsTo(Vaccine::class);
    }

    public function inventory(): BelongsTo
    {
        return $this->belongsTo(VaccineInventory::class, 'vaccine_inventory_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function immunizationRecord(): BelongsTo
    {
        return $this->belongsTo(ImmunizationRecord::class);
    }
}

