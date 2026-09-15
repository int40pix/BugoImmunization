<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VaccineInventory extends Model
{
    protected $fillable = [
        'vaccine_id',
        'batch_number',
        'quantity',
        'date_received',
        'expiration_date',
        'manufacturer',
        'supplier',
        'remarks',
        'is_archived',
        'archived_at',
        'archive_reason',
    ];

    protected $casts = [
        'date_received' => 'date',
        'expiration_date' => 'date',

        'is_archived' => 'boolean',
        'archived_at' => 'datetime',
    ];

    public function vaccine(): BelongsTo
    {
        return $this->belongsTo(Vaccine::class);
    }
}