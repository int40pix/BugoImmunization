<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(
        Request $request,
        Closure $next,
        ...$roles
    ): Response {
        $user = $request->user();

        if (! $user) {
            abort(
                403,
                'You must be logged in.'
            );
        }

        $user->loadMissing(
            'accountRole'
        );

        if (! $user->accountRole) {
            abort(
                403,
                'Your account does not have an assigned role.'
            );
        }

        if (! in_array(
            $user->accountRole->name,
            $roles,
            true
        )) {
            abort(
                403,
                'You are not authorized to access this page.'
            );
        }

        return $next($request);
    }
}