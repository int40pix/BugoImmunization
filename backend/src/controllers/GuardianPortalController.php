<?php

namespace App\Http\Controllers;

use App\Models\Guardian;
use App\Models\Patient;
use App\Models\User;
use App\Models\Vaccine;
use App\Models\VaccineInventory;
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
    /**
     * Show the guardian dashboard overview.
     */
    public function dashboard(
        Request $request
    ): Response {
        $data = $this->buildGuardianOverviewData($request);

        return Inertia::render(
            'guardian/dashboard',
            $data
        );
    }


    /**
     * Show the dedicated children directory for the guardian.
     */
    public function childrenIndex(
        Request $request
    ): Response {
        $data = $this->buildGuardianOverviewData($request);

        return Inertia::render(
            'guardian/children/index',
            $data
        );
    }


    /**
     * Show the dedicated upcoming visits schedule for the guardian.
     */
    public function visitsIndex(
        Request $request
    ): Response {
        $data = $this->buildGuardianOverviewData($request);

        return Inertia::render(
            'guardian/visits/index',
            $data
        );
    }


    /**
     * Prepare overview data for guardian portal views.
     */
    protected function buildGuardianOverviewData(
        Request $request
    ): array {
        $user = $request->user();

        $guardian = $this->resolveGuardian(
            $user
        );

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
         | Realtime Vaccine Inventory Usable Stock
         |--------------------------------------------------------------------------
         */
        $usableStockByVaccine = VaccineInventory::query()
            ->where('is_archived', false)
            ->whereDate('expiration_date', '>=', $today)
            ->selectRaw('vaccine_id, SUM(quantity) as usable_stock')
            ->groupBy('vaccine_id')
            ->pluck('usable_stock', 'vaccine_id')
            ->map(fn ($qty) => (int) $qty);

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
                ) use ($today, $usableStockByVaccine) {
                    $scheduled =
                        $patient
                            ->vaccineSchedules
                            ->whereIn(
                                'status',
                                ['scheduled', 'upcoming', 'overdue']
                            )
                            ->sortBy(
                                'scheduled_date'
                            )
                            ->values();

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

                    $ageDisplay = null;
                    if ($patient->date_of_birth) {
                        $dob = Carbon::parse($patient->date_of_birth);
                        $diffDays = (int) $dob->diffInDays($today);
                        $diffWeeks = (int) $dob->diffInWeeks($today);
                        $diffMonths = (int) $dob->diffInMonths($today);
                        $diffYears = (int) $dob->diffInYears($today);

                        if ($diffDays < 7) {
                            $ageDisplay = $diffDays . ' ' . ($diffDays === 1 ? 'day old' : 'days old');
                        } elseif ($diffWeeks < 8) {
                            $ageDisplay = $diffWeeks . ' ' . ($diffWeeks === 1 ? 'week old' : 'weeks old');
                        } elseif ($diffMonths < 24) {
                            $ageDisplay = $diffMonths . ' ' . ($diffMonths === 1 ? 'mo old' : 'mos old');
                        } else {
                            $ageDisplay = $diffYears . ' ' . ($diffYears === 1 ? 'yr old' : 'yrs old');
                        }
                    }

                    $documentedDoses = (int) $patient->immunizationRecords->count();
                    $routineTarget = 12;
                    $routineProgress = min(100, (int) round(($documentedDoses / $routineTarget) * 100));

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

                        'first_name' =>
                            $patient
                                ->first_name,

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

                        'age_display' =>
                            $ageDisplay,

                        'sex' =>
                            $patient
                                ->sex,

                        'status' =>
                            $patient
                                ->status,

                        'portal_status' =>
                            $portalStatus,

                        'documented_doses' =>
                            $documentedDoses,

                        'routine_target_doses' =>
                            $routineTarget,

                        'routine_progress_percent' =>
                            $routineProgress,

                        'overdue_count' =>
                            $overdue
                                ->count(),

                        'qr_code_value' =>
                            url("/patients/{$patient->id}"),

                        'next_appointment' =>
                            $nextSchedule
                                ? [
                                    'vaccine_id' =>
                                        $nextSchedule->vaccine_id,

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

                                    'stock_vials' =>
                                        (int) $usableStockByVaccine->get($nextSchedule->vaccine_id, 0),

                                    'stock_status' =>
                                        match (true) {
                                            (int) $usableStockByVaccine->get($nextSchedule->vaccine_id, 0) <= 0 => 'Out of Stock',
                                            (int) $usableStockByVaccine->get($nextSchedule->vaccine_id, 0) <= 5 => 'Low Stock',
                                            default => 'In Stock',
                                        },
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
                    ) use ($today, $usableStockByVaccine) {
                        return $patient
                            ->vaccineSchedules
                            ->whereIn(
                                'status',
                                ['scheduled', 'upcoming', 'overdue']
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
                                ) use ($patient, $usableStockByVaccine) {
                                    $stockVials = (int) $usableStockByVaccine->get($schedule->vaccine_id, 0);
                                    $stockStatus = match (true) {
                                        $stockVials <= 0 => 'Out of Stock',
                                        $stockVials <= 5 => 'Low Stock',
                                        default => 'In Stock',
                                    };

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

                                        'vaccine_id' =>
                                            $schedule->vaccine_id,

                                        'vaccine' =>
                                            $schedule
                                                ->vaccine
                                                ?->name
                                            ?? 'Vaccination',

                                        'dose_number' =>
                                            (int)
                                            $schedule
                                                ->dose_number,

                                        'stock_vials' =>
                                            $stockVials,

                                        'stock_status' =>
                                            $stockStatus,
                                    ];
                                }
                            );
                    }
                )
                ->sortBy(
                    'date'
                )
                ->values();

        return [
            'guardian' => [
                'id' =>
                    $guardian->id,

                'guardian_no' =>
                    $guardian
                        ->guardian_no,

                'name' =>
                    $guardian
                        ->name,

                'email' =>
                    $user
                        ->email,

                'contact_number' =>
                    $guardian
                        ->contact_number,

                'address' =>
                    $guardian
                        ->address,

                'status' =>
                    $guardian
                        ->status ?? 'Active',
            ],

            'children' =>
                $children,

            'appointments' =>
                $appointments,
        ];
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
            'immunizationRecords.administeredBy',
            'immunizationRecords.inventoryTransaction',
            'vaccineSchedules.vaccine',
            'vaccineSchedules.inventoryBatch',
        ]);

        $today = Carbon::today();
        $ageDisplay = null;
        if ($patient->date_of_birth) {
            $dob = Carbon::parse($patient->date_of_birth);
            $diffDays = (int) $dob->diffInDays($today);
            $diffWeeks = (int) $dob->diffInWeeks($today);
            $diffMonths = (int) $dob->diffInMonths($today);
            $diffYears = (int) $dob->diffInYears($today);

            if ($diffDays < 7) {
                $ageDisplay = $diffDays . ' ' . ($diffDays === 1 ? 'day old' : 'days old');
            } elseif ($diffWeeks < 8) {
                $ageDisplay = $diffWeeks . ' ' . ($diffWeeks === 1 ? 'week old' : 'weeks old');
            } elseif ($diffMonths < 24) {
                $ageDisplay = $diffMonths . ' ' . ($diffMonths === 1 ? 'mo old' : 'mos old');
            } else {
                $ageDisplay = $diffYears . ' ' . ($diffYears === 1 ? 'yr old' : 'yrs old');
            }
        }

        /*
         |--------------------------------------------------------------------------
         | Siblings
         |--------------------------------------------------------------------------
         */
        $siblings = $guardian->patients()
            ->select(['id', 'patient_id', 'first_name', 'middle_name', 'last_name', 'nickname', 'date_of_birth', 'sex'])
            ->orderBy('date_of_birth')
            ->get()
            ->map(function ($child) {
                return [
                    'id' => $child->id,
                    'patient_id' => $child->patient_id,
                    'name' => collect([$child->first_name, $child->middle_name, $child->last_name])->filter()->implode(' '),
                    'nickname' => $child->nickname,
                ];
            })
            ->values();

        /*
         |--------------------------------------------------------------------------
         | Realtime Vaccine Stock
         |--------------------------------------------------------------------------
         */
        $usableStockByVaccine = VaccineInventory::query()
            ->where('is_archived', false)
            ->whereDate('expiration_date', '>=', Carbon::today())
            ->selectRaw('vaccine_id, SUM(quantity) as usable_stock')
            ->groupBy('vaccine_id')
            ->pluck('usable_stock', 'vaccine_id')
            ->map(fn ($qty) => (int) $qty);

        /*
         |--------------------------------------------------------------------------
         | Structured Digital Immunization Card (DOH EPI Standard)
         |--------------------------------------------------------------------------
         */
        $allVaccines = Vaccine::query()
            ->with(['schedules' => fn ($query) => $query->orderBy('dose_number')])
            ->orderByRaw("CASE WHEN category = 'routine' THEN 0 ELSE 1 END")
            ->orderBy('id')
            ->get();
        $immunizationCard = $allVaccines->map(function (Vaccine $vaccine) use ($patient, $usableStockByVaccine) {
            $requiredDoses = max(1, (int) $vaccine->required_doses);
            $recordsByDose = $patient->immunizationRecords
                ->where('vaccine_id', $vaccine->id)
                ->keyBy('dose_number');
            $schedulesByDose = $patient->vaccineSchedules
                ->where('vaccine_id', $vaccine->id)
                ->keyBy('dose_number');

            $vials = (int) $usableStockByVaccine->get($vaccine->id, 0);
            $stockStatus = match (true) {
                $vials <= 0 => 'Out of Stock',
                $vials <= 5 => 'Low Stock',
                default => 'In Stock',
            };

            $doses = collect(range(1, $requiredDoses))->map(function (int $doseNumber) use ($vaccine, $recordsByDose, $schedulesByDose, $vials, $stockStatus) {
                $record = $recordsByDose->get($doseNumber);
                $schedule = $schedulesByDose->get($doseNumber);
                $scheduleDef = $vaccine->schedules->firstWhere('dose_number', $doseNumber);

                return [
                    'dose_number' => $doseNumber,
                    'recommended_age' => $scheduleDef?->recommended_age,
                    'interval' => $scheduleDef?->interval,
                    'record' => $record ? [
                        'id' => $record->id,
                        'dose_number' => (int) $record->dose_number,
                        'date_administered' => $record->date_administered ? Carbon::parse($record->date_administered)->format('Y-m-d') : null,
                        'source' => $record->source,
                        'batch_number' => $record->batch_number ?: $record->inventoryTransaction?->batch_number,
                        'remarks' => $record->remarks,
                        'administered_by' => $record->administeredBy ? [
                            'id' => $record->administeredBy->id,
                            'name' => $record->administeredBy->name,
                        ] : null,
                    ] : null,
                    'schedule' => $schedule ? [
                        'id' => $schedule->id,
                        'scheduled_date' => $schedule->scheduled_date ? Carbon::parse($schedule->scheduled_date)->format('Y-m-d') : null,
                        'status' => $schedule->status,
                        'stock_vials' => $vials,
                        'stock_status' => $stockStatus,
                    ] : null,
                ];
            })->values();

            return [
                'vaccine_id' => $vaccine->id,
                'vaccine_name' => $vaccine->name,
                'category' => $vaccine->category,
                'required_doses' => $requiredDoses,
                'stock_vials' => $vials,
                'stock_status' => $stockStatus,
                'doses' => $doses,
            ];
        })->values();

        /*
         |--------------------------------------------------------------------------
         | Immunization Records (Historical list)
         |--------------------------------------------------------------------------
         */
        $records =
            $patient
                ->immunizationRecords
                ->sortByDesc('date_administered')
                ->map(function ($record) {
                    return [
                        'id' => $record->id,
                        'vaccine' => $record->vaccine?->name ?? 'Vaccine',
                        'dose_number' => (int) $record->dose_number,
                        'date_administered' => $record->date_administered ? Carbon::parse($record->date_administered)->format('Y-m-d') : null,
                        'source' => $record->source,
                        'batch_number' => $record->batch_number ?: $record->inventoryTransaction?->batch_number,
                        'remarks' => $record->remarks,
                        'administered_by' => $record->administeredBy ? [
                            'id' => $record->administeredBy->id,
                            'name' => $record->administeredBy->name,
                        ] : null,
                    ];
                })
                ->values();

        /*
         |--------------------------------------------------------------------------
         | Scheduled Vaccinations
         |--------------------------------------------------------------------------
         */
        $schedules =
            $patient
                ->vaccineSchedules
                ->whereIn('status', ['scheduled', 'upcoming', 'overdue'])
                ->sortBy('scheduled_date')
                ->map(function ($schedule) {
                    return [
                        'id' => $schedule->id,
                        'vaccine' => $schedule->vaccine?->name ?? 'Vaccination',
                        'dose_number' => (int) $schedule->dose_number,
                        'scheduled_date' => $schedule->scheduled_date ? Carbon::parse($schedule->scheduled_date)->format('Y-m-d') : null,
                    ];
                })
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
                    'id' => $guardian->id,
                    'name' => $guardian->name,
                    'guardian_no' => $guardian->guardian_no,
                    'contact_number' => $guardian->contact_number,
                ],

                'patient' => [
                    'id' => $patient->id,
                    'patient_id' => $patient->patient_id,
                    'first_name' => $patient->first_name,
                    'middle_name' => $patient->middle_name,
                    'last_name' => $patient->last_name,
                    'nickname' => $patient->nickname,
                    'date_of_birth' => $patient->date_of_birth ? Carbon::parse($patient->date_of_birth)->format('Y-m-d') : null,
                    'age_display' => $ageDisplay,
                    'sex' => $patient->sex,
                    'address' => $patient->address,
                    'mother_name' => $patient->mother_name,
                    'father_name' => $patient->father_name,
                    'guardian_relationship' => $patient->guardian_relationship,
                    'status' => $patient->status,
                    'qr_code_value' => url("/patients/{$patient->id}"),
                    'records' => $records,
                    'schedules' => $schedules,
                    'immunization_card' => $immunizationCard,
                ],

                'siblings' => $siblings,
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