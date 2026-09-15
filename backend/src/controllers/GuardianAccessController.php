<?php

namespace App\Http\Controllers;

use App\Models\Guardian;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class GuardianAccessController extends Controller
{
    /**
     * Activate portal access for a guardian
     * who previously had no device/account access.
     */
    public function activate(
        Request $request,
        Guardian $guardian
    ): RedirectResponse {
        $guardian->loadMissing('user');

        $user = $guardian->user;

        abort_unless(
            $user,
            404,
            'The guardian does not have a linked user account.'
        );

        $validated = $request->validate([
            'email' => [
                'required',
                'email',
                'max:255',

                Rule::unique(
                    'users',
                    'email'
                )->ignore($user->id),
            ],
        ]);

        /*
         * Generate a temporary password.
         *
         * The plain password is displayed only after
         * activation. Only the hash is stored.
         */
        $temporaryPassword = Str::password(
            length: 10,
            letters: true,
            numbers: true,
            symbols: false,
            spaces: false,
        );

        $user->update([
            'name' => $guardian->name,

            'email' => strtolower(
                trim($validated['email'])
            ),

            'password' => Hash::make(
                $temporaryPassword
            ),

            'account_status' => 'temporary',

            'status' => 'active',

            'must_change_password' => true,
        ]);

        return redirect()
            ->route(
                'guardians.show',
                $guardian
            )
            ->with(
                'success',
                'Portal access has been activated successfully.'
            )
            ->with(
                'temporary_password',
                $temporaryPassword
            );
    }

    /**
     * Generate another temporary password.
     */
    public function resetTemporaryPassword(
        Guardian $guardian
    ): RedirectResponse {
        $guardian->loadMissing('user');

        $user = $guardian->user;

        abort_unless(
            $user,
            404,
            'The guardian does not have a linked user account.'
        );

        if (! $user->email) {
            return redirect()
                ->route(
                    'guardians.show',
                    $guardian
                )
                ->with(
                    'error',
                    'This guardian does not have a login email yet.'
                );
        }

        $temporaryPassword = Str::password(
            length: 10,
            letters: true,
            numbers: true,
            symbols: false,
            spaces: false,
        );

        $user->update([
            'password' => Hash::make(
                $temporaryPassword
            ),

            'account_status' => 'temporary',

            'status' => 'active',

            'must_change_password' => true,
        ]);

        return redirect()
            ->route(
                'guardians.show',
                $guardian
            )
            ->with(
                'success',
                'A new temporary password has been generated.'
            )
            ->with(
                'temporary_password',
                $temporaryPassword
            );
    }

    /**
     * Disable guardian portal access.
     */
    public function disable(
        Guardian $guardian
    ): RedirectResponse {
        $guardian->loadMissing('user');

        $user = $guardian->user;

        abort_unless(
            $user,
            404,
            'The guardian does not have a linked user account.'
        );

        $user->update([
            'account_status' => 'inactive',
            'status' => 'inactive',
        ]);

        return redirect()
            ->route(
                'guardians.show',
                $guardian
            )
            ->with(
                'success',
                'Guardian portal access has been disabled.'
            );
    }
}

