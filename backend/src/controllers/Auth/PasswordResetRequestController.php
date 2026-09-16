<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\PasswordResetRequest;
use App\Models\User;
use App\Notifications\AccountRecoveryRequestedNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetRequestController extends Controller
{
    public function create(): Response
    {
        return Inertia::render(
            'auth/forgot-password'
        );
    }

    public function store(
        Request $request
    ): RedirectResponse {
        $validated = $request->validate([
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
            ],
        ]);

        $email = strtolower(
            trim($validated['email'])
        );

        $user = User::query()
            ->with('accountRole')
            ->whereRaw(
                'LOWER(email) = ?',
                [$email]
            )
            ->first();

        /*
         * Do not reveal whether an account exists.
         * Active accounts (staff or guardians) can create
         * this administrator-assisted reset request.
         */
        if (
            $user &&
            $user->account_status !== 'unclaimed' &&
            $user->status !== 'inactive' &&
            filled($user->password)
        ) {
            $resetRequest = PasswordResetRequest::query()
                ->firstOrCreate(
                    [
                        'user_id' => $user->id,
                        'status' => 'pending',
                    ],
                    [
                        'requested_at' => now(),
                    ]
                );

            /*
             * Send notification exclusively to administrators.
             */
            $admins = User::query()
                ->where('status', 'active')
                ->where(function ($query) {
                    $query->where('role', 'admin')
                        ->orWhereHas('accountRole', function ($subQuery) {
                            $subQuery->where('name', 'admin');
                        });
                })
                ->get();

            if ($admins->isNotEmpty()) {
                Notification::send(
                    $admins,
                    new AccountRecoveryRequestedNotification($user, $resetRequest)
                );
            }
        }

        return back()->with(
            'status',
            'If the account is eligible for password recovery, your request has been submitted to the administrator.'
        );
    }
}
