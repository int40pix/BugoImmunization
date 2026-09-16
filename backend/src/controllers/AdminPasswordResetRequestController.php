<?php

namespace App\Http\Controllers;

use App\Models\PasswordResetRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AdminPasswordResetRequestController extends Controller
{
    public function index(): Response
    {
        $requests = PasswordResetRequest::query()
            ->with([
                'user:id,name,email,role,role_id,account_status,status',
                'user.guardian:id,user_id,guardian_no,name,contact_number',
                'user.accountRole:id,name,display_name',
                'resolvedBy:id,name',
            ])
            ->latest('requested_at')
            ->get()
            ->map(function (
                PasswordResetRequest $resetRequest
            ) {
                $user = $resetRequest->user;
                $isGuardian = $user ? $user->isGuardian() : false;
                $roleLabel = $user?->accountRole?->display_name
                    ?? ucfirst($user?->role ?? 'User');

                return [
                    'id' => $resetRequest->id,
                    'status' => $resetRequest->status,
                    'requested_at' => optional(
                        $resetRequest->requested_at
                    )->toIso8601String(),
                    'resolved_at' => optional(
                        $resetRequest->resolved_at
                    )->toIso8601String(),

                    'user' => [
                        'id' => $user?->id,
                        'name' => $user?->name ?? 'Unknown',
                        'email' => $user?->email,
                        'role' => $user?->role,
                        'role_label' => $roleLabel,
                        'is_guardian' => $isGuardian,
                        'account_status' => $user?->account_status,
                    ],

                    'guardian' => $isGuardian ? [
                        'name' =>
                            $user?->guardian?->name
                            ?? $user?->name,
                        'guardian_no' =>
                            $user?->guardian?->guardian_no,
                        'contact_number' =>
                            $user?->guardian?->contact_number,
                    ] : null,

                    'account' => [
                        'email' => $user?->email,
                        'account_status' =>
                            $user?->account_status,
                    ],

                    'resolved_by' =>
                        $resetRequest->resolvedBy?->name,
                ];
            })
            ->values();

        return Inertia::render(
            'admin/password-reset-requests/index',
            [
                'requests' => $requests,
            ]
        );
    }

    public function resolve(
        PasswordResetRequest $passwordResetRequest
    ): RedirectResponse {
        if (
            $passwordResetRequest->status !== 'pending'
        ) {
            return back()->with(
                'error',
                'This password reset request has already been processed.'
            );
        }

        $temporaryPassword = Str::password(
            length: 10,
            letters: true,
            numbers: true,
            symbols: false,
            spaces: false
        );

        DB::transaction(
            function () use (
                $passwordResetRequest,
                $temporaryPassword
            ) {
                $passwordResetRequest->loadMissing(
                    'user.accountRole'
                );

                $user =
                    $passwordResetRequest->user;

                if (! $user) {
                    abort(
                        422,
                        'The linked user account could not be found.'
                    );
                }

                if (
                    $user->account_status === 'unclaimed' ||
                    blank($user->email)
                ) {
                    abort(
                        422,
                        'This account does not have active login credentials.'
                    );
                }

                $user->forceFill([
                    'password' => Hash::make(
                        $temporaryPassword
                    ),
                    'account_status' => 'temporary',
                    'must_change_password' => true,
                    'status' => 'active',
                ])->save();

                $passwordResetRequest->forceFill([
                    'status' => 'resolved',
                    'resolved_by' => auth()->id(),
                    'resolved_at' => now(),
                ])->save();
            }
        );

        return back()
            ->with(
                'success',
                'A new temporary password was generated.'
            )
            ->with(
                'temporary_password',
                $temporaryPassword
            )
            ->with(
                'temporary_password_request_id',
                $passwordResetRequest->id
            )
            ->with(
                'temporary_password_user_name',
                $passwordResetRequest->user?->name
            );
    }
}
