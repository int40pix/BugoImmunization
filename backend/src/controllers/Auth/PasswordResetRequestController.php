<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\PasswordResetRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
         * Only guardian portal accounts can create
         * this staff-assisted reset request.
         */
        if (
            $user &&
            $user->accountRole?->name === 'guardian' &&
            $user->account_status !== 'unclaimed' &&
            filled($user->password)
        ) {
            PasswordResetRequest::query()
                ->firstOrCreate(
                    [
                        'user_id' => $user->id,
                        'status' => 'pending',
                    ],
                    [
                        'requested_at' => now(),
                    ]
                );
        }

        return back()->with(
            'status',
            'If the account is eligible for password recovery, your request has been submitted to the administrator.'
        );
    }
}
