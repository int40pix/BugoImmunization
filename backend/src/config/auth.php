<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Authentication Defaults
    |--------------------------------------------------------------------------
    |
    | Staff accounts continue using the default "web" guard.
    | Guardian accounts use their own "guardian" guard.
    |
    */

    'defaults' => [
        'guard' => env('AUTH_GUARD', 'web'),
        'passwords' => env('AUTH_PASSWORD_BROKER', 'users'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Authentication Guards
    |--------------------------------------------------------------------------
    */

    'guards' => [

        /*
         * Staff authentication.
         *
         * Uses the users table and App\Models\User.
         */
        'web' => [
            'driver' => 'session',
            'provider' => 'users',
        ],

        /*
         * Parent / guardian authentication.
         *
         * Uses the guardians table and App\Models\Guardian.
         */
        'guardian' => [
            'driver' => 'session',
            'provider' => 'guardians',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | User Providers
    |--------------------------------------------------------------------------
    */

    'providers' => [

        /*
         * Staff accounts only:
         * Admin, BHW, Nurse, Midwife.
         */
        'users' => [
            'driver' => 'eloquent',
            'model' => App\Models\User::class,
        ],

        /*
         * Parent / guardian accounts.
         */
        'guardians' => [
            'driver' => 'eloquent',
            'model' => App\Models\Guardian::class,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Resetting Passwords
    |--------------------------------------------------------------------------
    */

    'passwords' => [

        /*
         * Staff password reset broker.
         */
        'users' => [
            'provider' => 'users',
            'table' => env(
                'AUTH_PASSWORD_RESET_TOKEN_TABLE',
                'password_reset_tokens'
            ),
            'expire' => 60,
            'throttle' => 60,
        ],

        /*
         * Guardian password reset broker.
         *
         * For now this can share the same reset-token table.
         * The email address identifies the account/provider.
         */
        'guardians' => [
            'provider' => 'guardians',
            'table' => env(
                'AUTH_PASSWORD_RESET_TOKEN_TABLE',
                'password_reset_tokens'
            ),
            'expire' => 60,
            'throttle' => 60,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Password Confirmation Timeout
    |--------------------------------------------------------------------------
    */

    'password_timeout' => env(
        'AUTH_PASSWORD_TIMEOUT',
        10800
    ),

];