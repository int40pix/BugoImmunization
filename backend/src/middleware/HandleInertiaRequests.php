<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(
        Request $request
    ): ?string {
        return parent::version(
            $request
        );
    }

    public function share(
        Request $request
    ): array {
        [$message, $author] = str(
            Inspiring::quotes()->random()
        )->explode('-');

        $user = $request->user();

        if ($user) {
            $user->loadMissing(
                'accountRole'
            );
        }

        return [
            ...parent::share(
                $request
            ),

            'name' =>
                config('app.name'),

            'quote' => [
                'message' =>
                    trim($message),

                'author' =>
                    trim($author),
            ],

            'status' => fn () =>
                $request
                    ->session()
                    ->get('status'),

            'flash' => [
                'status' => fn () =>
                    $request
                        ->session()
                        ->get('status'),

                'success' => fn () =>
                    $request
                        ->session()
                        ->get('success') ?: $request->session()->get('status'),

                'error' => fn () =>
                    $request
                        ->session()
                        ->get('error'),

                'warning' => fn () =>
                    $request
                        ->session()
                        ->get('warning'),

                'info' => fn () =>
                    $request
                        ->session()
                        ->get('info'),

                'temporary_password' =>
                    fn () =>
                    $request
                        ->session()
                        ->get(
                            'temporary_password'
                        ),
            ],

            'auth' => [
                'user' => $user
                    ? [
                        'id' =>
                            $user->id,

                        'name' =>
                            $user->name,

                        'email' =>
                            $user->email,

                        'role' =>
                            $user
                                ->accountRole
                                ?->name,

                        'status' =>
                            $user->status,

                        'account_status' =>
                            $user
                                ->account_status,

                        'must_change_password' =>
                            (bool)
                            $user
                                ->must_change_password,
                    ]
                    : null,

                'notifications' => fn () =>
                    $user
                        ? $user
                            ->notifications()
                            ->latest()
                            ->take(10)
                            ->get()
                            ->map(
                                function (
                                    $notification
                                ) {
                                    $data =
                                        $notification
                                            ->data;

                                    return [
                                        'id' =>
                                            $notification
                                                ->id,

                                        'type' =>
                                            $data[
                                                'type'
                                            ]
                                            ?? 'general',

                                        'title' =>
                                            $data[
                                                'title'
                                            ]
                                            ?? 'Notification',

                                        'description' =>
                                            $data[
                                                'description'
                                            ]
                                            ?? null,

                                        'url' =>
                                            $data[
                                                'url'
                                            ]
                                            ?? null,

                                        'priority' =>
                                            $data[
                                                'priority'
                                            ]
                                            ?? 'info',

                                        'read' =>
                                            ! is_null(
                                                $notification
                                                    ->read_at
                                            ),

                                        'created_at' =>
                                            $notification
                                                ->created_at
                                                ?->toISOString(),
                                    ];
                                }
                            )
                        : [],

                'unread_notifications_count' => fn () =>
                    $user
                        ? $user
                            ->unreadNotifications()
                            ->count()
                        : 0,
            ],
        ];
    }
}