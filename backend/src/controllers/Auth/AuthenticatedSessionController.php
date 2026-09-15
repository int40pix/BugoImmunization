<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    public function create(
        Request $request
    ): Response {
        return Inertia::render(
            'auth/login',
            [
                'canResetPassword' =>
                    Route::has(
                        'password.request'
                    ),

                'status' =>
                    $request
                        ->session()
                        ->get(
                            'status'
                        ),
            ]
        );
    }

    public function store(
        LoginRequest $request
    ): RedirectResponse {
        $request->authenticate();

        $request
            ->session()
            ->regenerate();

        $user =
            $request->user();

        $user->loadMissing(
            'accountRole'
        );

        /*
         * Temporary-password users MUST
         * complete first-login setup before
         * entering any dashboard.
         */
        if (
            $user->must_change_password ||
            $user->account_status ===
                'temporary'
        ) {
            /*
             * Keep the two fields consistent.
             */
            if (
                ! $user
                    ->must_change_password
            ) {
                $user->forceFill([
                    'must_change_password' =>
                        true,
                ])->save();
            }

            return redirect()->route(
                'password.first-change'
            );
        }

        if (
            $user->accountRole?->name ===
            'guardian'
        ) {
            return redirect()->route(
                'guardian.dashboard'
            );
        }

        return redirect()->intended(
            route(
                'dashboard',
                absolute: false
            )
        );
    }

    public function destroy(
        Request $request
    ): RedirectResponse {
        Auth::guard(
            'web'
        )->logout();

        $request
            ->session()
            ->invalidate();

        $request
            ->session()
            ->regenerateToken();

        return redirect()->route(
            'login'
        );
    }
}
