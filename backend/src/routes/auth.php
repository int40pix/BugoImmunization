<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\PasswordResetRequestController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\VerifyEmailController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    /*
    |--------------------------------------------------------------------------
    | Registration
    |--------------------------------------------------------------------------
    |
    | Kept for now because the project still has Laravel's registration
    | feature. We can remove public registration later during final cleanup.
    |
    */

    Route::get(
        'register',
        [RegisteredUserController::class, 'create']
    )->name('register');

    Route::post(
        'register',
        [RegisteredUserController::class, 'store']
    );

    /*
    |--------------------------------------------------------------------------
    | Shared Login
    |--------------------------------------------------------------------------
    |
    | Staff and guardian portal accounts use the same login page.
    |
    */

    Route::get(
        'login',
        [AuthenticatedSessionController::class, 'create']
    )->name('login');

    Route::post(
        'login',
        [AuthenticatedSessionController::class, 'store']
    );

    /*
    |--------------------------------------------------------------------------
    | Guardian Password Reset Request
    |--------------------------------------------------------------------------
    |
    | No email reset link is sent.
    |
    | A guardian submits their existing portal login email. The system
    | creates a pending password-reset request for Admin to process.
    |
    */

    Route::get(
        'forgot-password',
        [PasswordResetRequestController::class, 'create']
    )->name('password.request');

    Route::post(
        'forgot-password',
        [PasswordResetRequestController::class, 'store']
    )->name('password.email');
});

Route::middleware('auth')->group(function () {
    /*
    |--------------------------------------------------------------------------
    | Confirm Password
    |--------------------------------------------------------------------------
    */

    Route::get(
        'confirm-password',
        [ConfirmablePasswordController::class, 'show']
    )->name('password.confirm');

    Route::post(
        'confirm-password',
        [ConfirmablePasswordController::class, 'store']
    );

    /*
    |--------------------------------------------------------------------------
    | Email Verification
    |--------------------------------------------------------------------------
    |
    | These Laravel routes are being left intact for now even though the
    | project is not currently using email verification.
    |
    */

    Route::get(
        'verify-email',
        EmailVerificationPromptController::class
    )->name('verification.notice');

    Route::get(
        'verify-email/{id}/{hash}',
        VerifyEmailController::class
    )
        ->middleware([
            'signed',
            'throttle:6,1',
        ])
        ->name('verification.verify');

    Route::post(
        'email/verification-notification',
        [EmailVerificationNotificationController::class, 'store']
    )
        ->middleware('throttle:6,1')
        ->name('verification.send');

    /*
    |--------------------------------------------------------------------------
    | Logout
    |--------------------------------------------------------------------------
    */

    Route::post(
        'logout',
        [AuthenticatedSessionController::class, 'destroy']
    )->name('logout');
});