<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTemporaryPasswordChanged
{
    /**
     * Prevent users with temporary passwords
     * from accessing the rest of the system.
     */
    public function handle(
        Request $request,
        Closure $next
    ): Response {
        $user = $request->user();

        if (
            $user &&
            $user->must_change_password
        ) {
            return redirect()
                ->route('password.first-change');
        }

        return $next($request);
    }
}