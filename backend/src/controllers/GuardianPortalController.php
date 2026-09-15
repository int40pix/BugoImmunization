<?php

namespace App\Http\Controllers;

use App\Models\Guardian;
use App\Models\Patient;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class GuardianPortalController extends Controller
{
    /**
     * Show the guardian dashboard.
     */
    public function dashboard(
        Request $request
    ): Response {
        $user = $request->user();

        /*
         * Find the guardian profile connected
         * to the logged-in user.
         *
         * This also repairs older guardian records
         * that existed before user_id was added.
         */
        $guardian = $this->resolveGuardian(
            $user
        );

        /*
         * A guardian account must always have
         * a corresponding guardian profile.
         */
        abort_unless(
            $guardian,
            403,
            'This account does not have a linked guardian profile. Please contact the health center.'
        );

        $guardian->load([
            'patients' => function ($query) {
                $query
                    ->with([
                        'immunizationRecords.vaccine',
                        'vaccineSchedules.vaccine',
                    ])
                    ->orderBy(
                        'date_of_birth'
                    )
                    ->orderBy(
                        'first_name'
                    );
            },
        ]);

        $today = Carbon::today();

        /*
         |--------------------------------------------------------------------------
         | Children
         |--------------------------------------------------------------------------
         */

        $children = $guardian
            ->patients
            ->map(
                function (
                    Patient $patient
                ) use ($today) {
                    $scheduled =
                        $patient
                            ->vaccineSchedules
                            ->where(
                                'status',
                                'scheduled'
                            )
                            ->sortBy(
                                'scheduled_date'
                            )
                            ->values();

                    /*
                     * Vaccinations whose scheduled
                     * date has already passed.
                     */
                    $overdue =
                        $scheduled
                            ->filter(
                                function (
                                    $schedule
                                ) use ($today) {
                                    if (
                                        ! $schedule
                                            ->scheduled_date
                                    ) {
                                        return false;
                                    }

                                    return Carbon::parse(
                                        $schedule
                                            ->scheduled_date
                                    )
                                        ->startOfDay()
                                        ->lt(
                                            $today
                                        );
                                }
                            )
                            ->values();

                    /*
                     * Future/current vaccinations.
                     */
                    $upcoming =
                        $scheduled
                            ->filter(
                                function (
                                    $schedule
                                ) use ($today) {
                                    if (
                                        ! $schedule
                                            ->scheduled_date
                                    ) {
                                        return false;
                                    }

                                    return Carbon::parse(
                                        $schedule
                                            ->scheduled_date
                                    )
                                        ->startOfDay()
                                        ->gte(
                                            $today
                                        );
                                }
                            )
                            ->values();

                    $nextSchedule =
                        $upcoming->first();

                    $portalStatus =
                        match (true) {
                            $overdue
                                ->isNotEmpty()
                                => 'Overdue',

                            $upcoming
                                ->isNotEmpty()
                                => 'Upcoming',

                            default
                                => 'No Schedule',
                        };

                    return [
                        'id' =>
                            $patient->id,

                        'patient_id' =>
                            $patient
                                ->patient_id,

                        'name' =>
                            collect([
                                $patient
                                    ->first_name,

                                $patient
                                    ->middle_name,

                                $patient
                                    ->last_name,
                            ])
                                ->filter()
                                ->implode(
                                    ' '
                                ),

                        'nickname' =>
                            $patient
                                ->nickname,

                        'date_of_birth' =>
                            $patient
                                ->date_of_birth
                                ? Carbon::parse(
                                    $patient
                                        ->date_of_birth
                                )->format(
                                    'Y-m-d'
                                )
                                : null,

                        'sex' =>
                            $patient
                                ->sex,

                        'status' =>
                            $patient
                                ->status,

                        'portal_status' =>
                            $portalStatus,

                        'documented_doses' =>
                            $patient
                                ->immunizationRecords
                                ->count(),

                        'overdue_count' =>
                            $overdue
                                ->count(),

                        'next_appointment' =>
                            $nextSchedule
                                ? [
                                    'date' =>
                                        Carbon::parse(
                                            $nextSchedule
                                                ->scheduled_date
                                        )->format(
                                            'Y-m-d'
                                        ),

                                    'vaccine' =>
                                        $nextSchedule
                                            ->vaccine
                                            ?->name
                                        ?? 'Vaccination',

                                    'dose_number' =>
                                        (int)
                                        $nextSchedule
                                            ->dose_number,
                                ]
                                : null,
                    ];
                }
            )
            ->values();

        /*
         |--------------------------------------------------------------------------
         | Upcoming Appointments
         |--------------------------------------------------------------------------
         */

        $appointments =
            $guardian
                ->patients
                ->flatMap(
                    function (
                        Patient $patient
                    ) use ($today) {
                        return $patient
                            ->vaccineSchedules
                            ->where(
                                'status',
                                'scheduled'
                            )
                            ->filter(
                                function (
                                    $schedule
                                ) use ($today) {
                                    if (
                                        ! $schedule
                                            ->scheduled_date
                                    ) {
                                        return false;
                                    }

                                    return Carbon::parse(
                                        $schedule
                                            ->scheduled_date
                                    )
                                        ->startOfDay()
                                        ->gte(
                                            $today
                                        );
                                }
                            )
                            ->map(
                                function (
                                    $schedule
                                ) use ($patient) {
                                    return [
                                        'id' =>
                                            $schedule
                                                ->id,

                                        'patient_id' =>
                                            $patient
                                                ->id,

                                        'patient_name' =>
                                            collect([
                                                $patient
                                                    ->first_name,

                                                $patient
                                                    ->middle_name,

                                                $patient
                                                    ->last_name,
                                            ])
                                                ->filter()
                                                ->implode(
                                                    ' '
                                                ),

                                        'date' =>
                                            Carbon::parse(
                                                $schedule
                                                    ->scheduled_date
                                            )->format(
                                                'Y-m-d'
                                            ),

                                        'vaccine' =>
                                            $schedule
                                                ->vaccine
                                                ?->name
                                            ?? 'Vaccination',

                                        'dose_number' =>
                                            (int)
                                            $schedule
                                                ->dose_number,
                                    ];
                                }
                            );
                    }
                )
                ->sortBy(
                    'date'
                )
                ->values();

        /*
         |--------------------------------------------------------------------------
         | Render Dashboard
         |--------------------------------------------------------------------------
         */

        return Inertia::render(
            'guardian/dashboard',
            [
                'guardian' => [
                    'id' =>
                        $guardian->id,

                    'guardian_no' =>
                        $guardian
                            ->guardian_no,

                    'name' =>
                        $guardian
                            ->name,

                    /*
                     * Email now comes from users.
                     */
                    'email' =>
                        $user
                            ->email,

                    'contact_number' =>
                        $guardian
                            ->contact_number,
                ],

                'children' =>
                    $children,

                'appointments' =>
                    $appointments,
            ]
        );
    }


    /**
     * Show one child's information.
     */
    public function showChild(
        Request $request,
        Patient $patient
    ): Response {
        $user = $request->user();

        $guardian = $this->resolveGuardian(
            $user
        );

        abort_unless(
            $guardian,
            403,
            'This account does not have a linked guardian profile.'
        );

        /*
         * Prevent guardians from viewing
         * another family's child.
         */
        abort_unless(
            (int) $patient->guardian_id
                ===
            (int) $guardian->id,
            403,
            'You are not authorized to view this patient.'
        );

        $patient->load([
            'immunizationRecords.vaccine',
            'vaccineSchedules.vaccine',
        ]);

        /*
         |--------------------------------------------------------------------------
         | Immunization Records
         |--------------------------------------------------------------------------
         */

        $records =
            $patient
                ->immunizationRecords
                ->sortByDesc(
                    'date_administered'
                )
                ->map(
                    function (
                        $record
                    ) {
                        return [
                            'id' =>
                                $record->id,

                            'vaccine' =>
                                $record
                                    ->vaccine
                                    ?->name
                                ?? 'Vaccine',

                            'dose_number' =>
                                (int)
                                $record
                                    ->dose_number,

                            'date_administered' =>
                                $record
                                    ->date_administered
                                    ? Carbon::parse(
                                        $record
                                            ->date_administered
                                    )->format(
                                        'Y-m-d'
                                    )
                                    : null,

                            'source' =>
                                $record
                                    ->source,

                            'remarks' =>
                                $record
                                    ->remarks,
                        ];
                    }
                )
                ->values();

        /*
         |--------------------------------------------------------------------------
         | Scheduled Vaccinations
         |--------------------------------------------------------------------------
         */

        $schedules =
            $patient
                ->vaccineSchedules
                ->where(
                    'status',
                    'scheduled'
                )
                ->sortBy(
                    'scheduled_date'
                )
                ->map(
                    function (
                        $schedule
                    ) {
                        return [
                            'id' =>
                                $schedule
                                    ->id,

                            'vaccine' =>
                                $schedule
                                    ->vaccine
                                    ?->name
                                ?? 'Vaccination',

                            'dose_number' =>
                                (int)
                                $schedule
                                    ->dose_number,

                            'scheduled_date' =>
                                $schedule
                                    ->scheduled_date
                                    ? Carbon::parse(
                                        $schedule
                                            ->scheduled_date
                                    )->format(
                                        'Y-m-d'
                                    )
                                    : null,
                        ];
                    }
                )
                ->values();

        /*
         |--------------------------------------------------------------------------
         | Render Child Record
         |--------------------------------------------------------------------------
         */

        return Inertia::render(
            'guardian/child-show',
            [
                'guardian' => [
                    'name' =>
                        $guardian
                            ->name,
                ],

                'patient' => [
                    'id' =>
                        $patient->id,

                    'patient_id' =>
                        $patient
                            ->patient_id,

                    'first_name' =>
                        $patient
                            ->first_name,

                    'middle_name' =>
                        $patient
                            ->middle_name,

                    'last_name' =>
                        $patient
                            ->last_name,

                    'nickname' =>
                        $patient
                            ->nickname,

                    'date_of_birth' =>
                        $patient
                            ->date_of_birth
                            ? Carbon::parse(
                                $patient
                                    ->date_of_birth
                            )->format(
                                'Y-m-d'
                            )
                            : null,

                    'sex' =>
                        $patient
                            ->sex,

                    'status' =>
                        $patient
                            ->status,

                    'records' =>
                        $records,

                    'schedules' =>
                        $schedules,
                ],
            ]
        );
    }


    /**
     * Find the guardian profile belonging
     * to the authenticated User.
     *
     * This also repairs guardian records
     * created before user_id was introduced.
     */
    private function resolveGuardian(
        User $user
    ): ?Guardian {
        /*
         * Normal new architecture:
         *
         * users.id
         *     ↓
         * guardians.user_id
         */
        $guardian = Guardian::query()
            ->where(
                'user_id',
                $user->id
            )
            ->first();

        if ($guardian) {
            return $guardian;
        }

        /*
         * Legacy compatibility:
         *
         * Older guardian records stored the
         * email directly inside guardians.
         *
         * We only perform this fallback while
         * that legacy column still exists.
         */
        if (
            Schema::hasColumn(
                'guardians',
                'email'
            )
            &&
            $user->email
        ) {
            $guardian = Guardian::query()
                ->where(
                    'email',
                    $user->email
                )
                ->first();

            /*
             * If we find the old guardian record,
             * repair it permanently by assigning
             * its new users.id FK.
             */
            if ($guardian) {
                $guardian->update([
                    'user_id' =>
                        $user->id,
                ]);

                return $guardian;
            }
        }

        return null;
    }
}