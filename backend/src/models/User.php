<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'role_id',
        'status',
        'account_status',
        'must_change_password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'must_change_password' => 'boolean',
        ];
    }

    public function accountRole(): BelongsTo
    {
        return $this->belongsTo(
            Role::class,
            'role_id'
        );
    }

    public function guardian(): HasOne
    {
        return $this->hasOne(
            Guardian::class,
            'user_id'
        );
    }

    public function isGuardian(): bool
    {
        return $this->accountRole?->name === 'guardian'
            || in_array($this->role, ['guardian', 'patient'], true);
    }

    public function isStaff(): bool
    {
        $roleName = $this->accountRole?->name ?? $this->role;

        return in_array(
            $roleName,
            [
                'admin',
                'nurse',
                'midwife',
                'bhw',
            ],
            true
        );
    }

    public function isAdmin(): bool
    {
        return $this->accountRole?->name === 'admin'
            || $this->role === 'admin';
    }

    public function hasRole(string ...$roles): bool
    {
        $currentRole = $this->accountRole?->name ?? $this->role;

        return in_array(
            $currentRole,
            $roles,
            true
        );
    }
}