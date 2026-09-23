<?php

namespace App\Http\Controllers;

use App\Models\Guardian;
use App\Models\ImmunizationRecord;
use App\Models\Patient;
use App\Models\Vaccine;
use App\Services\PatientImmunizationScheduleService;
use App\Services\VaccineSchedulingPriorityService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PatientController extends Controller
{
    public function index(Request $request)
    {
        $query = Patient::query()->with('guardian');

        if ($request->filled('search')) {
            $search = trim((string) $request->search);

            $query->where(function ($query) use ($search) {
                $query->where('patient_id', 'like', "%{$search}%")
                    ->orWhere('first_name', 'like', "%{$search}%")
                    ->orWhere('middle_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhereHas('guardian', function ($guardianQuery) use ($search) {
                        $guardianQuery
                            ->where('guardian_no', 'like', "%{$search}%")
                            ->orWhere('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%")
                            ->orWhere('contact_number', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('sex') && $request->sex !== 'both') {
            $query->where('sex', $request->sex);
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('age_group') && $request->age_group !== 'all') {
            switch ($request->age_group) {
                case 'infant':
                    $query->where('date_of_birth', '>=', now()->subYear());
                    break;

                case 'toddler':
                    $query->whereBetween('date_of_birth', [
                        now()->subYears(3),
                        now()->subYear(),
                    ]);
                    break;

                case 'child':
                    $query->whereBetween('date_of_birth', [
                        now()->subYears(12),
                        now()->subYears(3),
                    ]);
                    break;
            }
        }

        $patients = $query
            ->latest()
            ->get()
            ->each(function (Patient $patient) {
                // Temporary compatibility fields for the transferred UX.
                $patient->setAttribute('guardian_name', $patient->guardian?->name);
                $patient->setAttribute('guardian_contact', $patient->guardian?->contact_number);
            });

        $guardians = Guardian::query()
            ->withCount('patients')
            ->with([
                'patients' => function ($query) {
                    $query
                        ->select([
                            'id',
                            'guardian_id',
                            'patient_id',
                            'first_name',
                            'middle_name',
                            'last_name',
                            'date_of_birth',
                            'status',
                        ])
                        ->orderBy('first_name')
                        ->orderBy('last_name');
                },
            ])
            ->orderBy('name')
            ->get([
                'id',
                'guardian_no',
                'name',
                'email',
                'contact_number',
                'mother_maiden_name',
                'father_name',
                'status',
            ]);

        return Inertia::render('patient/index', [
            'patients' => $patients,
            'guardians' => $guardians,

            'filters' => [
                'search' => $request->search,
                'sex' => $request->sex,
                'status' => $request->status,
                'age_group' => $request->age_group,
            ],
        ]);
    }

    /**
     * Show the Add Child form for one existing guardian/family.
     *
     * The guardian is determined by the URL. There is intentionally
     * no guardian selector on this flow.
     */
    public function createForGuardian(Guardian $guardian)
    {
        if ($guardian->status !== 'active') {
            return redirect()
                ->route('guardians.show', $guardian)
                ->withErrors([
                    'guardian' =>
                        'Children can only be added to an active guardian account.',
                ]);
        }

        return Inertia::render('patient/create', [
            'guardian' => [
                'id' => $guardian->id,
                'guardian_no' => $guardian->guardian_no,
                'name' => $guardian->name,
                'email' => $guardian->email,
                'contact_number' => $guardian->contact_number,
                'mother_maiden_name' => $guardian->mother_maiden_name,
                'father_name' => $guardian->father_name,
                'status' => $guardian->status,
            ],
        ]);
    }

    /**
     * Create one real Patient record under an existing guardian/family.
     *
     * Patients do not receive login credentials or User records.
     * The guardian comes from route model binding, so staff cannot
     * accidentally attach the child to a different family from the form.
     */
    public function storeForGuardian(
        Request $request,
        Guardian $guardian,
        VaccineSchedulingPriorityService $schedulingService
    ) {
        if ($guardian->status !== 'active') {
            return redirect()
                ->route('guardians.show', $guardian)
                ->withErrors([
                    'guardian' =>
                        'Children can only be added to an active guardian account.',
                ]);
        }

        $validated = $request->validate([
            'guardian_relationship' => [
                'required',
                'string',
                'max:255',
            ],

            'first_name' => [
                'required',
                'string',
                'max:255',
            ],

            'middle_name' => [
                'nullable',
                'string',
                'max:255',
            ],

            'last_name' => [
                'required',
                'string',
                'max:255',
            ],

            'nickname' => [
                'nullable',
                'string',
                'max:255',
            ],

            'date_of_birth' => [
                'required',
                'date',
                'before_or_equal:today',
            ],

            'sex' => [
                'required',
                'in:Male,Female',
            ],

            'address' => [
                'required',
                'string',
                'max:1000',
            ],

            'mother_name' => [
                'nullable',
                'string',
                'max:255',
            ],

            'father_name' => [
                'nullable',
                'string',
                'max:255',
            ],

            'birth_type' => [
                'nullable',
                'string',
                'max:100',
            ],

            'is_full_term' => [
                'nullable',
                'boolean',
            ],

            'multiple_birth' => [
                'nullable',
                'string',
                'max:100',
            ],

            'birth_attendant' => [
                'nullable',
                'string',
                'max:255',
            ],

            'blood_type' => [
                'nullable',
                'string',
                'max:10',
            ],

            'birth_weight' => [
                'nullable',
                'numeric',
                'min:0',
                'max:20',
            ],

            'birth_length' => [
                'nullable',
                'numeric',
                'min:0',
                'max:200',
            ],

            'head_circumference' => [
                'nullable',
                'numeric',
                'min:0',
                'max:200',
            ],

            'chest_circumference' => [
                'nullable',
                'numeric',
                'min:0',
                'max:200',
            ],

            'birth_order' => [
                'nullable',
                'integer',
                'min:1',
                'max:50',
            ],

            'birth_registration_date' => [
                'nullable',
                'date',
            ],

            'birth_registration_place' => [
                'nullable',
                'string',
                'max:255',
            ],

            'birth_family_notes' => [
                'nullable',
                'string',
                'max:3000',
            ],

            'medical_background' => [
                'nullable',
                'string',
                'max:1000',
            ],

            'allergies' => [
                'nullable',
                'string',
                'max:1000',
            ],

            'existing_conditions' => [
                'nullable',
                'string',
                'max:1000',
            ],

            'bcg_received_at_birth' => [
                'nullable',
                'boolean',
            ],

            'bcg_date_administered' => [
                'nullable',
                'date',
                'before_or_equal:today',
            ],

            'hepb_received_at_birth' => [
                'nullable',
                'boolean',
            ],

            'hepb_date_administered' => [
                'nullable',
                'date',
                'before_or_equal:today',
            ],
        ]);

        $patient = Patient::create([
            'guardian_id' => $guardian->id,
            'patient_id' => $this->generatePatientId(),
            'first_name' => trim($validated['first_name']),
            'middle_name' => isset($validated['middle_name'])
                && trim($validated['middle_name']) !== ''
                    ? trim($validated['middle_name'])
                    : null,
            'last_name' => trim($validated['last_name']),
            'nickname' => isset($validated['nickname'])
                && trim($validated['nickname']) !== ''
                    ? trim($validated['nickname'])
                    : null,
            'date_of_birth' => $validated['date_of_birth'],
            'sex' => $validated['sex'],
            'address' => trim($validated['address']),
            'mother_name' => $validated['mother_name'] ?? null,
            'father_name' => $validated['father_name'] ?? null,
            'birth_type' => $validated['birth_type'] ?? null,
            'is_full_term' => $validated['is_full_term'] ?? null,
            'multiple_birth' => $validated['multiple_birth'] ?? null,
            'birth_attendant' => $validated['birth_attendant'] ?? null,
            'blood_type' => $validated['blood_type'] ?? null,
            'birth_weight' => $validated['birth_weight'] ?? null,
            'birth_length' => $validated['birth_length'] ?? null,
            'head_circumference' => $validated['head_circumference'] ?? null,
            'chest_circumference' => $validated['chest_circumference'] ?? null,
            'birth_order' => $validated['birth_order'] ?? null,
            'birth_registration_date' =>
                $validated['birth_registration_date'] ?? null,
            'birth_registration_place' =>
                $validated['birth_registration_place'] ?? null,
            'birth_family_notes' =>
                $validated['birth_family_notes'] ?? null,
            'guardian_relationship' =>
                trim($validated['guardian_relationship']),
            'medical_background' =>
                $validated['medical_background'] ?? null,
            'allergies' => $validated['allergies'] ?? null,
            'existing_conditions' =>
                $validated['existing_conditions'] ?? null,
            'status' => 'Active',
        ]);

        $bcgVaccine = Vaccine::where('name', 'like', '%BCG%')->first();
        $hepbVaccine = Vaccine::where('name', 'like', '%Hepatitis B%')->first();

        if ($request->boolean('bcg_received_at_birth') && $bcgVaccine) {
            ImmunizationRecord::create([
                'patient_id' => $patient->id,
                'vaccine_id' => $bcgVaccine->id,
                'dose_number' => 1,
                'date_administered' => $request->input('bcg_date_administered') ?: $patient->date_of_birth,
                'administered_by' => null,
                'source' => 'Hospital / Birth Facility',
                'remarks' => 'Received at birth',
            ]);
        }

        if ($request->boolean('hepb_received_at_birth') && $hepbVaccine) {
            ImmunizationRecord::create([
                'patient_id' => $patient->id,
                'vaccine_id' => $hepbVaccine->id,
                'dose_number' => 1,
                'date_administered' => $request->input('hepb_date_administered') ?: $patient->date_of_birth,
                'administered_by' => null,
                'source' => 'Hospital / Birth Facility',
                'remarks' => 'Birth dose received at birth',
            ]);
        }

        /*
         * Immediately refresh the global scheduler after the new child exists.
         *
         * We do not force-schedule this specific patient. The scheduling
         * service re-ranks every eligible unscheduled candidate so clinical
         * priority, stock availability, and FEFO reservation rules remain
         * authoritative.
         */
        $schedulingService->generateSchedules();

        return redirect()
            ->route('patients.show', $patient)
            ->with(
                'success',
                'Child successfully added to the family.'
            );
    }

    public function show(
        Patient $patient,
        PatientImmunizationScheduleService $scheduleService,
        VaccineSchedulingPriorityService $schedulingPriorityService
    ) {
        /*
        |--------------------------------------------------------------------------
        | RECONCILE EXISTING SCHEDULE RESERVATIONS
        |--------------------------------------------------------------------------
        |
        | This only repairs/removes existing scheduled appointments.
        | It does NOT generate new appointments merely because this page was opened.
        |
        */

        $schedulingPriorityService
            ->reconcileScheduledBatchReservations();

        $patient->load([
            'guardian',
            'immunizationRecords.vaccine',
            'immunizationRecords.administeredBy',
            'immunizationRecords.inventoryTransaction',
            'optionalVaccines',
            'immunizationCardRows',
        ]);

        // Temporary compatibility fields for the current transferred UX.
        $patient->setAttribute('guardian_name', $patient->guardian?->name);
        $patient->setAttribute(
            'guardian_contact',
            $patient->guardian?->contact_number
        );
        $patient->setAttribute('immunizationRecords', $patient->immunizationRecords);

        /*
        |--------------------------------------------------------------------------
        | Optional Vaccine Management
        |--------------------------------------------------------------------------
        |
        | Routine vaccines automatically apply to every patient.
        |
        | Optional vaccines only become part of this patient's structured
        | immunization tracking after they are explicitly assigned.
        |
        | We send all optional vaccines to the frontend so staff can see both
        | assigned and currently available optional vaccines.
        |
        */

        $optionalVaccines = Vaccine::query()
            ->where('category', 'optional')
            ->with([
                'schedules' => function ($query) {
                    $query->orderBy('dose_number');
                },
            ])
            ->orderBy('name')
            ->get()
            ->map(function ($vaccine) use ($patient) {
                $assignment = $patient
                    ->optionalVaccines
                    ->firstWhere('id', $vaccine->id);

                $hasRecords = $patient
                    ->immunizationRecords
                    ->contains(
                        'vaccine_id',
                        $vaccine->id
                    );

                $hasSchedules = $patient
                    ->vaccineSchedules()
                    ->where(
                        'vaccine_id',
                        $vaccine->id
                    )
                    ->exists();

                return [
                    'id' => $vaccine->id,
                    'name' => $vaccine->name,
                    'description' => $vaccine->description,
                    'required_doses' => $vaccine->required_doses,
                    'category' => $vaccine->category,

                    'is_assigned' =>
                        $assignment !== null,

                    'notes' =>
                        $assignment?->pivot?->notes,

                    'has_records' =>
                        $hasRecords,

                    'has_schedules' =>
                        $hasSchedules,

                    'can_remove' =>
                        $assignment !== null &&
                        !$hasRecords &&
                        !$hasSchedules,

                    'schedules' =>
                        $vaccine->schedules
                            ->map(function ($schedule) {
                                return [
                                    'dose_number' =>
                                        $schedule->dose_number,

                                    'recommended_age' =>
                                        $schedule->recommended_age,

                                    'interval' =>
                                        $schedule->interval,
                                ];
                            })
                            ->values(),
                ];
            })
            ->values();

        /*
        |--------------------------------------------------------------------------
        | Vaccination Management
        |--------------------------------------------------------------------------
        |
        | These are only the doses that are currently medically eligible for
        | administration according to age, dose order, and interval rules.
        |
        | This remains separate from the immunization card because actual
        | administration can affect physical vaccine inventory.
        |
        */

        $vaccinationOptions = collect(
            $scheduleService->getSchedulingOptions($patient)
        )
            ->map(function (array $option) {
                return [
                    'vaccine_id' =>
                        $option['vaccine_id'],

                    'vaccine_name' =>
                        $option['vaccine_name'],

                    'category' =>
                        $option['category'],

                    'dose_number' =>
                        $option['next_dose'],

                    'required_doses' =>
                        $option['required_doses'],

                    'completed_doses' =>
                        $option['completed_doses'],

                    'doses_remaining' =>
                        $option['doses_remaining'],

                    'schedule_label' =>
                        $option['schedule_label'],

                    'days_due' =>
                        (int) ($option['days_due'] ?? 0),

                    'days_overdue' =>
                        (int) ($option['days_overdue'] ?? 0),

                    'target_wednesday' =>
                        $option['target_wednesday'] ?? null,

                    'recommended_date' =>
                        $option['recommended_date'],

                    'eligible_date' =>
                        $option['eligible_date'],

                    'available_stock' =>
                        $option['available_stock'],

                    'inventory_available' =>
                        $option['inventory_available'],

                    'can_administer' =>
                        $option['can_administer'],

                    'is_scheduled' =>
                        $option['is_scheduled'] ?? false,

                    'scheduled_date' =>
                        $option['scheduled_date'] ?? null,

                    'reserved_batch_id' =>
                        $option['reserved_batch_id'] ?? null,

                    'reserved_batch_number' =>
                        $option['reserved_batch_number'] ?? null,

                    'reserved_batch_expiration_date' =>
                        $option[
                            'reserved_batch_expiration_date'
                        ] ?? null,

                    'reserved_batch_quantity' =>
                        $option['reserved_batch_quantity'] ?? null,

                    'reserved_batch_usable' =>
                        $option['reserved_batch_usable'] ?? false,

                    'priority_reason' =>
                        $option['priority_reason'] ?? null,

                    'is_series_completion_candidate' =>
                        $option[
                            'is_series_completion_candidate'
                        ] ?? false,

                    'allocation_rank' =>
                        $option['allocation_rank'] ?? null,

                    'available_batches' =>
                        $option['available_batches'] ?? [],
                ];
            })
            ->values();

        /*
        |--------------------------------------------------------------------------
        | Immunization Card
        |--------------------------------------------------------------------------
        |
        | The card is the patient's structured vaccination documentation.
        |
        | Routine vaccines:
        |     Always appear.
        |
        | Optional vaccines:
        |     Appear only when they have been assigned to this patient.
        |
        | Every required dose gets a card slot even when the patient does not
        | yet have an ImmunizationRecord for that dose.
        |
        | Existing records are matched by vaccine_id + dose_number.
        |
        | This does NOT perform inventory calculations. Manual card recording
        | and correction are documentation operations, while actual vaccine
        | administration remains handled by Vaccination Management.
        |
        */

        $assignedOptionalVaccineIds = $patient
            ->optionalVaccines
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->values();

        $applicableVaccines = Vaccine::query()
            ->with([
                'schedules' => function ($query) {
                    $query->orderBy('dose_number');
                },
            ])
            ->where(function ($query) use ($assignedOptionalVaccineIds) {
                $query->where('category', 'routine');

                if ($assignedOptionalVaccineIds->isNotEmpty()) {
                    $query->orWhere(function ($query) use ($assignedOptionalVaccineIds) {
                        $query->where('category', 'optional')
                            ->whereIn(
                                'id',
                                $assignedOptionalVaccineIds->all()
                            );
                    });
                }
            })
            ->orderByRaw(
                "CASE WHEN category = 'routine' THEN 0 ELSE 1 END"
            )
            ->orderBy('id')
            ->get();

        $recordsByVaccineAndDose = $patient
            ->immunizationRecords
            ->keyBy(function ($record) {
                return $record->vaccine_id . ':' . $record->dose_number;
            });

        $immunizationCard = $applicableVaccines
            ->map(function ($vaccine) use ($recordsByVaccineAndDose) {
                $doseNumbers = collect();

                /*
                 * Prefer the vaccine schedule definitions because they are the
                 * authoritative schedule rows for each dose.
                 */
                if ($vaccine->schedules->isNotEmpty()) {
                    $doseNumbers = $vaccine->schedules
                        ->pluck('dose_number')
                        ->map(fn ($doseNumber) => (int) $doseNumber)
                        ->filter(fn ($doseNumber) => $doseNumber > 0)
                        ->unique()
                        ->sort()
                        ->values();
                }

                /*
                 * required_doses acts as a fallback and also guarantees that
                 * every expected dose gets a card slot if a schedule row is
                 * accidentally missing.
                 */
                $requiredDoses = max(
                    1,
                    (int) $vaccine->required_doses
                );

                for (
                    $doseNumber = 1;
                    $doseNumber <= $requiredDoses;
                    $doseNumber++
                ) {
                    if (!$doseNumbers->contains($doseNumber)) {
                        $doseNumbers->push($doseNumber);
                    }
                }

                $doseNumbers = $doseNumbers
                    ->unique()
                    ->sort()
                    ->values();

                $doses = $doseNumbers
                    ->map(function ($doseNumber) use (
                        $vaccine,
                        $recordsByVaccineAndDose
                    ) {
                        $doseNumber = (int) $doseNumber;

                        $schedule = $vaccine->schedules
                            ->firstWhere(
                                'dose_number',
                                $doseNumber
                            );

                        $recordKey =
                            $vaccine->id . ':' . $doseNumber;

                        $record = $recordsByVaccineAndDose
                            ->get($recordKey);

                        return [
                            'dose_number' => $doseNumber,

                            'recommended_age' =>
                                $schedule?->recommended_age,

                            'interval' =>
                                $schedule?->interval,

                            'record' => $record
                                ? [
                                    'id' => $record->id,

                                    'vaccine_id' =>
                                        $record->vaccine_id,

                                    'dose_number' =>
                                        $record->dose_number,

                                    'date_administered' =>
                                        $record->date_administered
                                            ?->toDateString(),

                                    'source' =>
                                        $record->source,

                                    'remarks' =>
                                        $record->remarks,

                                    'administered_by' =>
                                        $record->administeredBy
                                            ? [
                                                'id' =>
                                                    $record
                                                        ->administeredBy
                                                        ->id,

                                                'name' =>
                                                    $record
                                                        ->administeredBy
                                                        ->name,
                                            ]
                                            : null,
                                ]
                                : null,
                        ];
                    })
                    ->values();

                return [
                    'vaccine_id' => $vaccine->id,

                    'vaccine_name' => $vaccine->name,

                    'category' => $vaccine->category,

                    'required_doses' =>
                        $requiredDoses,

                    'doses' => $doses,
                ];
            })
            ->values();

        $staffUsers = \App\Models\User::query()
            ->whereDoesntHave('guardian')
            ->where(function ($q) {
                $q->whereNull('role')
                  ->orWhereNotIn('role', ['guardian', 'patient']);
            })
            ->where(function ($q) {
                $q->whereNull('account_status')
                  ->orWhere('account_status', 'Active');
            })
            ->select(['id', 'name', 'email', 'role', 'role_id'])
            ->with('accountRole:id,name')
            ->orderBy('name')
            ->get()
            ->map(fn ($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'role' => $u->accountRole?->name ?? $u->role ?? 'Clinic Staff',
            ])
            ->values();

        return Inertia::render('patient/show', [
            'patient' => $patient,

            'vaccinationOptions' =>
                $vaccinationOptions,

            'staffUsers' =>
                $staffUsers,

            'immunizationCard' =>
                $immunizationCard,

            'optionalVaccines' =>
                $optionalVaccines,

            'immunizationCardRows' =>
                $patient->immunizationCardRows
                    ->map(function ($cardRow) {
                        return [
                            'id' => $cardRow->id,
                            'vaccine_name' => $cardRow->vaccine_name,
                            'dose_count' => $cardRow->dose_count,
                            'doses' => $cardRow->doses ?? [],
                            'remarks' => $cardRow->remarks,
                        ];
                    })
                    ->values(),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Assign Optional Vaccine
    |--------------------------------------------------------------------------
    |
    | Adds an optional vaccine to this patient's structured immunization
    | tracking.
    |
    | Routine vaccines cannot be assigned here because they already apply
    | automatically to every patient.
    |
    */

    public function assignOptionalVaccine(
        Request $request,
        Patient $patient
    ) {
        $validated = $request->validate([
            'vaccine_id' => [
                'required',
                'integer',
                'exists:vaccines,id',
            ],

            'notes' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ]);

        $vaccine = Vaccine::findOrFail(
            $validated['vaccine_id']
        );

        if ($vaccine->category !== 'optional') {
            return back()->withErrors([
                'optional_vaccine' =>
                    'Only optional vaccines can be assigned to a patient.',
            ]);
        }

        $alreadyAssigned = $patient
            ->optionalVaccines()
            ->where(
                'vaccines.id',
                $vaccine->id
            )
            ->exists();

        if ($alreadyAssigned) {
            return back()->withErrors([
                'optional_vaccine' =>
                    "{$vaccine->name} is already assigned to this patient.",
            ]);
        }

        $patient->optionalVaccines()->attach(
            $vaccine->id,
            [
                'added_by' => auth()->id(),

                'notes' =>
                    $validated['notes'] ?? null,
            ]
        );

        return back()->with(
            'success',
            "{$vaccine->name} was added to the patient's optional vaccines."
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Remove Optional Vaccine
    |--------------------------------------------------------------------------
    |
    | An optional vaccine assignment can only be removed while it has no
    | documented immunization records and no patient-specific schedules.
    |
    | This prevents a vaccine from disappearing from the patient's structured
    | tracking while clinical history or scheduling data still depends on it.
    |
    */

    public function removeOptionalVaccine(
        Patient $patient,
        Vaccine $vaccine
    ) {
        if ($vaccine->category !== 'optional') {
            return back()->withErrors([
                'optional_vaccine' =>
                    'Routine vaccines cannot be removed from a patient.',
            ]);
        }

        $isAssigned = $patient
            ->optionalVaccines()
            ->where(
                'vaccines.id',
                $vaccine->id
            )
            ->exists();

        if (!$isAssigned) {
            return back()->withErrors([
                'optional_vaccine' =>
                    "{$vaccine->name} is not assigned to this patient.",
            ]);
        }

        $hasDocumentedRecords = $patient
            ->immunizationRecords()
            ->where(
                'vaccine_id',
                $vaccine->id
            )
            ->exists();

        if ($hasDocumentedRecords) {
            return back()->withErrors([
                'optional_vaccine' =>
                    "{$vaccine->name} cannot be removed because this patient already has a documented dose for it.",
            ]);
        }

        $hasPatientSchedules = $patient
            ->vaccineSchedules()
            ->where(
                'vaccine_id',
                $vaccine->id
            )
            ->exists();

        if ($hasPatientSchedules) {
            return back()->withErrors([
                'optional_vaccine' =>
                    "{$vaccine->name} cannot be removed because this patient already has a vaccine schedule for it.",
            ]);
        }

        $patient
            ->optionalVaccines()
            ->detach($vaccine->id);

        return back()->with(
            'success',
            "{$vaccine->name} was removed from the patient's optional vaccines."
        );
    }

    public function edit(Patient $patient)
    {
        $patient->load([
            'guardian',
            'immunizationRecords.vaccine',
        ]);

        // Temporary compatibility fields for the current transferred UX.
        $patient->setAttribute('guardian_name', $patient->guardian?->name);
        $patient->setAttribute(
            'guardian_contact',
            $patient->guardian?->contact_number
        );

        $vaccines = Vaccine::orderBy('id')->get();

        $guardians = Guardian::query()
            ->where('status', 'active')
            ->orderBy('name')
            ->get([
                'id',
                'guardian_no',
                'name',
                'email',
                'contact_number',
            ]);

        return Inertia::render('patient/edit', [
            'patient' => $patient,
            'vaccines' => $vaccines,
            'guardians' => $guardians,
        ]);
    }

    public function update(
        Request $request,
        Patient $patient
    ) {
        $validated = $request->validate([
            'guardian_id' => [
                'nullable',
                'integer',
                'exists:guardians,id',
            ],
            'guardian_relationship' => ['nullable', 'string', 'max:255'],
            'first_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'nickname' => ['nullable', 'string', 'max:255'],
            'date_of_birth' => ['required', 'date', 'before_or_equal:today'],
            'sex' => ['required', 'in:Male,Female'],
            'address' => ['required', 'string', 'max:1000'],
            'mother_name' => ['nullable', 'string', 'max:255'],
            'father_name' => ['nullable', 'string', 'max:255'],
            'birth_type' => ['nullable', 'string', 'max:100'],
            'is_full_term' => ['nullable', 'boolean'],
            'multiple_birth' => ['nullable', 'string', 'max:100'],
            'birth_attendant' => ['nullable', 'string', 'max:255'],
            'blood_type' => ['nullable', 'string', 'max:10'],
            'birth_weight' => ['nullable', 'numeric', 'min:0', 'max:20'],
            'birth_length' => ['nullable', 'numeric', 'min:0', 'max:200'],
            'head_circumference' => ['nullable', 'numeric', 'min:0', 'max:200'],
            'chest_circumference' => ['nullable', 'numeric', 'min:0', 'max:200'],
            'birth_order' => ['nullable', 'integer', 'min:1', 'max:50'],
            'birth_registration_date' => ['nullable', 'date'],
            'birth_registration_place' => ['nullable', 'string', 'max:255'],
            'birth_family_notes' => ['nullable', 'string', 'max:3000'],
            'medical_background' => ['nullable', 'string', 'max:1000'],
            'allergies' => ['nullable', 'string', 'max:1000'],
            'existing_conditions' => ['nullable', 'string', 'max:1000'],
        ]);

        if (isset($validated['guardian_id'])) {
            $guardianIsActive = Guardian::query()
                ->whereKey($validated['guardian_id'])
                ->where('status', 'active')
                ->exists();

            if (!$guardianIsActive) {
                return back()
                    ->withInput()
                    ->withErrors([
                        'guardian_id' => 'Please select an active guardian account.',
                    ]);
            }
        }

        $patient->update($validated);

        return redirect()
            ->route('patients.index')
            ->with(
                'success',
                'Patient record updated successfully.'
            );
    }

    public function toggleStatus(Patient $patient)
    {
        $newStatus = strtolower((string) $patient->status) === 'active'
            ? 'Inactive'
            : 'Active';

        $patient->update([
            'status' => $newStatus,
        ]);

        return redirect()
            ->back()
            ->with(
                'success',
                "Patient record status updated to {$newStatus}."
            );
    }

    protected function generatePatientId(): string
    {
        $latestPatient = Patient::latest('id')->first();

        $number = $latestPatient
            ? (
                (int) substr(
                    $latestPatient->patient_id,
                    3
                ) + 1
            )
            : 1;

        return 'PT-' . str_pad(
            (string) $number,
            6,
            '0',
            STR_PAD_LEFT
        );
    }
}