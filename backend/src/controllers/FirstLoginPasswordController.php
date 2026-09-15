<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class FirstLoginPasswordController extends Controller
{
    public function edit(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        if (! $user->must_change_password) {
            return $this->redirectForUser($request);
        }

        return Inertia::render('auth/change-temporary-password');
    }

    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (! $user->must_change_password) {
            return $this->redirectForUser($request);
        }

        $validated = $request->validate([
            'password' => [
                'required',
                'confirmed',
                Password::min(8),
            ],
        ]);

        $user->forceFill([
            'password' => Hash::make($validated['password']),
            'must_change_password' => false,
            'account_status' => 'active',
            'status' => 'active',
        ])->save();

        $request->session()->regenerate();

        return $this
            ->redirectForUser($request)
            ->with(
                'success',
                'Your password has been created successfully.'
            );
    }

    private function redirectForUser(
        Request $request
    ): RedirectResponse {
        $user = $request->user();

        $user->loadMissing(
            'accountRole'
        );

        if (
            $user->accountRole?->name ===
            'guardian'
        ) {
            return redirect()->route(
                'guardian.dashboard'
            );
        }

        return redirect()->route(
            'dashboard'
        );
    }
}
