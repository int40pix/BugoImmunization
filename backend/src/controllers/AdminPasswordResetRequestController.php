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
                'user:id,name,email,role_id,account_status',
                'user.guardian:id,user_id,guardian_no,name,contact_number',
                'resolvedBy:id,name',
            ])
            ->latest('requested_at')
            ->get()
            ->map(function (
                PasswordResetRequest $resetRequest
            ) {
                return [
                    'id' => $resetRequest->id,
                    'status' => $resetRequest->status,
                    'requested_at' => optional(
                        $resetRequest->requested_at
                    )->toIso8601String(),
                    'resolved_at' => optional(
                        $resetRequest->resolved_at
                    )->toIso8601String(),

                    'guardian' => [
                        'name' =>
                            $resetRequest->user?->guardian?->name
                            ?? $resetRequest->user?->name,
                        'guardian_no' =>
                            $resetRequest->user?->guardian?->guardian_no,
                        'contact_number' =>
                            $resetRequest->user?->guardian?->contact_number,
                    ],

                    'account' => [
                        'email' => $resetRequest->user?->email,
                        'account_status' =>
                            $resetRequest->user?->account_status,
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

        $temporaryPassword = Str::random(10);

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

                if (
                    ! $user ||
                    $user->accountRole?->name !== 'guardian'
                ) {
                    abort(
                        422,
                        'The linked account is not a valid guardian account.'
                    );
                }

                if (
                    $user->account_status === 'unclaimed' ||
                    blank($user->email)
                ) {
                    abort(
                        422,
                        'This guardian does not have active portal credentials.'
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
            );
    }
}
