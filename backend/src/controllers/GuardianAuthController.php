<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class GuardianAuthController extends Controller
{
    public function create(): Response|RedirectResponse
    {
        if (Auth::guard('guardian')->check()) {
            return redirect()->route('guardian.dashboard');
        }

        return Inertia::render('guardian/login');
    }

    public function store(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $remember = $request->boolean('remember');

        $authenticated = Auth::guard('guardian')->attempt(
            [
                'email' => strtolower(trim($credentials['email'])),
                'password' => $credentials['password'],
                'status' => 'active',
            ],
            $remember
        );

        if (! $authenticated) {
            return back()
                ->withInput($request->only('email', 'remember'))
                ->withErrors([
                    'email' => 'These credentials do not match an active guardian account.',
                ]);
        }

        $request->session()->regenerate();

        return redirect()->intended(
            route('guardian.dashboard')
        );
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('guardian')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()
            ->route('guardian.login')
            ->with('status', 'You have been logged out.');
    }
}
