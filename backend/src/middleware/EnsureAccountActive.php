<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureAccountActive
{
    /**
     * Handle an incoming request.
     *
     * If an authenticated user's account has been deactivated, terminate their
     * session immediately and bounce them to the login page with an explanatory notice.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user) {
            $isInactive = strtolower((string) $user->status) === 'inactive'
                || strtolower((string) $user->account_status) === 'inactive';

            if ($isInactive) {
                Auth::guard('web')->logout();

                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return redirect()->route('login')->withErrors([
                    'email' => 'Your account has been deactivated. Please contact an administrator.',
                ]);
            }
        }

        return $next($request);
    }
}

