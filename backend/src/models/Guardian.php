<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Guardian extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'guardian_no',
        'name',
        'gender',
        'email',
        'password',
        'contact_number',
        'mother_maiden_name',
        'father_name',
        'mother_information_unavailable',
        'father_information_unavailable',
        'status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'mother_information_unavailable' => 'boolean',
            'father_information_unavailable' => 'boolean',
            'email_verified_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'user_id'
        );
    }

    public function patients(): HasMany
    {
        return $this->hasMany(
            Patient::class,
            'guardian_id'
        );
    }
}