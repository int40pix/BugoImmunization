<?php

namespace App\Http\Controllers;

use App\Models\Guardian;
use App\Models\ImmunizationRecord;
use App\Models\Patient;
use App\Models\Role;
use App\Models\User;
use App\Models\Vaccine;
use App\Services\VaccineSchedulingPriorityService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class GuardianController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim(
            (string) $request->input(
                'search',
                ''
            )
        );

        $guardians = Guardian::query()
            ->with([
                'user.accountRole',
            ])
            ->withCount('patients')
            ->when(
                $search !== '',
                function ($query) use ($search) {
                    $query->where(
                        function ($query) use ($search) {
                            $query
                                ->where(
                                    'guardian_no',
                                    'like',
                                    "%{$search}%"
                                )
                                ->orWhere(
                                    'name',
                                    'like',
                                    "%{$search}%"
                                )
                                ->orWhere(
                                    'contact_number',
                                    'like',
                                    "%{$search}%"
                                )
                                ->orWhere(
                                    'mother_maiden_name',
                                    'like',
                                    "%{$search}%"
                                )
                                ->orWhere(
                                    'father_name',
                                    'like',
                                    "%{$search}%"
                                )
                                ->orWhereHas(
                                    'user',
                                    function (
                                        $userQuery
                                    ) use (
                                        $search
                                    ) {
                                        $userQuery
                                            ->where(
                                                'email',
                                                'like',
                                                "%{$search}%"
                                            );
                                    }
                                )
                                ->orWhereHas(
                                    'patients',
                                    function (
                                        $patientQuery
                                    ) use (
                                        $search
                                    ) {
                                        $patientQuery
                                            ->where(
                                                'patient_id',
                                                'like',
                                                "%{$search}%"
                                            )
                                            ->orWhere(
                                                'first_name',
                                                'like',
                                                "%{$search}%"
                                            )
                                            ->orWhere(
                                                'middle_name',
                                                'like',
                                                "%{$search}%"
                                            )
                                            ->orWhere(
                                                'last_name',
                                                'like',
                                                "%{$search}%"
                                            )
                                            ->orWhere(
                                                'nickname',
                                                'like',
                                                "%{$search}%"
                                            );
                                    }
                                );
                        }
                    );
                }
            )
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render(
            'guardian/index',
            [
                'guardians' =>
                    $guardians,

                'filters' => [
                    'search' =>
                        $search,
                ],
            ]
        );
    }

    public function create(): Response
    {
        return Inertia::render(
            'guardian/create'
        );
    }

    public function store(
        Request $request,
        VaccineSchedulingPriorityService $schedulingService
    ): RedirectResponse {
        $motherUnavailable =
            $request->boolean(
                'mother_information_unavailable'
            );

        $fatherUnavailable =
            $request->boolean(
                'father_information_unavailable'
            );

        $portalAccess =
            $request->input(
                'portal_access',
                'active'
            );

        $guardianGender =
            $request->input(
                'gender'
            );

        $validated =
            $request->validate([
                'name' => [
                    'required',
                    'string',
                    'max:255',
                ],

                'gender' => [
                    'required',
                    Rule::in([
                        'Male',
                        'Female',
                    ]),
                ],

                'contact_number' => [
                    'nullable',
                    'string',
                    'max:50',
                ],

                'portal_access' => [
                    'required',
                    Rule::in([
                        'none',
                        'active',
                    ]),
                ],

                'email' => [
                    Rule::requiredIf(
                        $portalAccess ===
                            'active'
                    ),

                    'nullable',
                    'email',
                    'max:255',

                    Rule::unique(
                        'users',
                        'email'
                    ),
                ],


                'password' => [
                    Rule::requiredIf(
                        $portalAccess ===
                            'active'
                    ),
                    'nullable',
                    'string',
                    'min:8',
                    'confirmed',
                ],

                'password_confirmation' => [
                    Rule::requiredIf(
                        $portalAccess ===
                            'active'
                    ),
                    'nullable',
                    'string',
                    'min:8',
                ],

                'mother_maiden_name' => [
                    'nullable',
                    'string',
                    'max:255',
                ],

                'father_name' => [
                    'nullable',
                    'string',
                    'max:255',
                ],

                'mother_information_unavailable' => [
                    'nullable',
                    'boolean',
                ],

                'father_information_unavailable' => [
                    'nullable',
                    'boolean',
                ],

                'children' => [
                    'required',
                    'array',
                    'min:1',
                ],

                'children.*.mother_name' => [
                    'nullable',
                    'string',
                    'max:255',
                ],

                'children.*.father_name' => [
                    'nullable',
                    'string',
                    'max:255',
                ],

                'children.*.mother_information_unavailable' => [
                    'nullable',
                    'boolean',
                ],

                'children.*.father_information_unavailable' => [
                    'nullable',
                    'boolean',
                ],

                'children.*.first_name' => [
                    'required',
                    'string',
                    'max:255',
                ],

                'children.*.middle_name' => [
                    'nullable',
                    'string',
                    'max:255',
                ],

                'children.*.last_name' => [
                    'required',
                    'string',
                    'max:255',
                ],

                'children.*.nickname' => [
                    'nullable',
                    'string',
                    'max:255',
                ],

                'children.*.date_of_birth' => [
                    'required',
                    'date',
                    'before_or_equal:today',
                ],

                'children.*.sex' => [
                    'required',
                    Rule::in([
                        'Male',
                        'Female',
                    ]),
                ],

                'children.*.guardian_relationship' => [
                    'required',
                    Rule::in(
                        $this->guardianRelationshipOptions(
                            $guardianGender
                        )
                    ),
                ],

                'children.*.address' => [
                    'required',
                    'string',
                    'max:1000',
                ],

                'children.*.birth_type' => [
                    'nullable',
                    'string',
                    'max:100',
                ],

                'children.*.is_full_term' => [
                    'nullable',
                    'boolean',
                ],

                'children.*.multiple_birth' => [
                    'nullable',
                    'string',
                    'max:100',
                ],

                'children.*.birth_attendant' => [
                    'nullable',
                    'string',
                    'max:255',
                ],

                'children.*.blood_type' => [
                    'nullable',
                    'string',
                    'max:10',
                ],

                'children.*.birth_weight' => [
                    'nullable',
                    'numeric',
                    'min:0',
                    'max:20',
                ],

                'children.*.birth_length' => [
                    'nullable',
                    'numeric',
                    'min:0',
                    'max:200',
                ],

                'children.*.head_circumference' => [
                    'nullable',
                    'numeric',
                    'min:0',
                    'max:200',
                ],

                'children.*.chest_circumference' => [
                    'nullable',
                    'numeric',
                    'min:0',
                    'max:200',
                ],

                'children.*.birth_order' => [
                    'nullable',
                    'integer',
                    'min:1',
                    'max:50',
                ],

                'children.*.birth_registration_date' => [
                    'nullable',
                    'date',
                ],

                'children.*.birth_registration_place' => [
                    'nullable',
                    'string',
                    'max:255',
                ],

                'children.*.birth_family_notes' => [
                    'nullable',
                    'string',
                    'max:3000',
                ],

                'children.*.medical_background' => [
                    'nullable',
                    'string',
                    'max:1000',
                ],

                'children.*.allergies' => [
                    'nullable',
                    'string',
                    'max:1000',
                ],

                'children.*.existing_conditions' => [
                    'nullable',
                    'string',
                    'max:1000',
                ],

                'children.*.bcg_received_at_birth' => [
                    'nullable',
                    'boolean',
                ],

                'children.*.bcg_date_administered' => [
                    'nullable',
                    'date',
                    'before_or_equal:today',
                ],

                'children.*.hepb_received_at_birth' => [
                    'nullable',
                    'boolean',
                ],

                'children.*.hepb_date_administered' => [
                    'nullable',
                    'date',
                    'before_or_equal:today',
                ],
            ]);

        $guardian =
            DB::transaction(
                function () use (
                    $validated,
                    $motherUnavailable,
                    $fatherUnavailable
                ) {
                    $guardianRole =
                        Role::query()
                            ->where(
                                'name',
                                'guardian'
                            )
                            ->firstOrFail();

                    $hasPortalAccess =
                        $validated[
                            'portal_access'
                        ] ===
                        'active';

                    $user =
                        User::create([
                            'name' =>
                                trim(
                                    $validated[
                                        'name'
                                    ]
                                ),

                            'email' =>
                                $hasPortalAccess
                                    ? strtolower(
                                        trim(
                                            $validated[
                                                'email'
                                            ]
                                        )
                                    )
                                    : null,

                            'password' =>
                                $hasPortalAccess
                                    ? Hash::make(
                                        $validated[
                                            'password'
                                        ]
                                    )
                                    : null,

                            /*
                             * This old string column
                             * still exists temporarily.
                             */
                            'role' =>
                                'patient',

                            'role_id' =>
                                $guardianRole
                                    ->id,

                            'status' =>
                                'active',

                            'account_status' =>
                                $hasPortalAccess
                                    ? 'active'
                                    : 'unclaimed',

                            'must_change_password' =>
                                false,
                        ]);

                    $guardian =
                        Guardian::create([
                            'user_id' =>
                                $user->id,

                            'guardian_no' =>
                                $this
                                    ->generateGuardianNumber(),

                            'name' =>
                                trim(
                                    $validated[
                                        'name'
                                    ]
                                ),

                            'gender' =>
                                $validated[
                                    'gender'
                                ],

                            /*
                             * Temporary legacy copy.
                             * This can be removed
                             * after old guardian auth
                             * columns are cleaned up.
                             */
                            'email' =>
                                $hasPortalAccess
                                    ? strtolower(
                                        trim(
                                            $validated[
                                                'email'
                                            ]
                                        )
                                    )
                                    : null,

                            'contact_number' =>
                                $this
                                    ->nullableTrim(
                                        $validated[
                                            'contact_number'
                                        ]
                                        ?? null
                                    ),

                            'password' =>
                                null,

                            'mother_maiden_name' =>
                                $motherUnavailable
                                    ? null
                                    : $this
                                        ->nullableTrim(
                                            $validated[
                                                'mother_maiden_name'
                                            ]
                                            ?? null
                                        ),

                            'father_name' =>
                                $fatherUnavailable
                                    ? null
                                    : $this
                                        ->nullableTrim(
                                            $validated[
                                                'father_name'
                                            ]
                                            ?? null
                                        ),

                            'mother_information_unavailable' =>
                                $motherUnavailable,

                            'father_information_unavailable' =>
                                $fatherUnavailable,

                            'status' =>
                                'active',
                        ]);

                    $bcgVaccine = Vaccine::where('name', 'like', '%BCG%')->first();
                    $hepbVaccine = Vaccine::where('name', 'like', '%Hepatitis B%')->first();

                    foreach (
                        $validated[
                            'children'
                        ] as $child
                    ) {
                        $patient = Patient::create([
                            'guardian_id' =>
                                $guardian
                                    ->id,

                            'patient_id' =>
                                $this
                                    ->generatePatientId(),

                            'first_name' =>
                                trim(
                                    $child[
                                        'first_name'
                                    ]
                                ),

                            'middle_name' =>
                                $this
                                    ->nullableTrim(
                                        $child[
                                            'middle_name'
                                        ]
                                        ?? null
                                    ),

                            'last_name' =>
                                trim(
                                    $child[
                                        'last_name'
                                    ]
                                ),

                            'nickname' =>
                                $this
                                    ->nullableTrim(
                                        $child[
                                            'nickname'
                                        ]
                                        ?? null
                                    ),

                            'date_of_birth' =>
                                $child[
                                    'date_of_birth'
                                ],

                            'sex' =>
                                $child[
                                    'sex'
                                ],

                            'guardian_relationship' =>
                                trim(
                                    $child[
                                        'guardian_relationship'
                                    ]
                                ),

                            'address' =>
                                trim(
                                    $child[
                                        'address'
                                    ]
                                ),

                            'mother_name' =>
                                $this
                                    ->nullableTrim(
                                        $child['mother_name']
                                        ?? $child['mother_maiden_name']
                                        ?? $validated['mother_maiden_name']
                                        ?? null
                                    ),

                            'father_name' =>
                                $this
                                    ->nullableTrim(
                                        $child['father_name']
                                        ?? $validated['father_name']
                                        ?? null
                                    ),

                            'birth_type' =>
                                $this
                                    ->nullableTrim(
                                        $child[
                                            'birth_type'
                                        ]
                                        ?? null
                                    ),

                            'is_full_term' =>
                                $child[
                                    'is_full_term'
                                ]
                                ?? null,

                            'multiple_birth' =>
                                $this
                                    ->nullableTrim(
                                        $child[
                                            'multiple_birth'
                                        ]
                                        ?? null
                                    ),

                            'birth_attendant' =>
                                $this
                                    ->nullableTrim(
                                        $child[
                                            'birth_attendant'
                                        ]
                                        ?? null
                                    ),

                            'blood_type' =>
                                $this
                                    ->nullableTrim(
                                        $child[
                                            'blood_type'
                                        ]
                                        ?? null
                                    ),

                            'birth_weight' =>
                                $child[
                                    'birth_weight'
                                ]
                                ?? null,

                            'birth_length' =>
                                $child[
                                    'birth_length'
                                ]
                                ?? null,

                            'head_circumference' =>
                                $child[
                                    'head_circumference'
                                ]
                                ?? null,

                            'chest_circumference' =>
                                $child[
                                    'chest_circumference'
                                ]
                                ?? null,

                            'birth_order' =>
                                $child[
                                    'birth_order'
                                ]
                                ?? null,

                            'birth_registration_date' =>
                                $child[
                                    'birth_registration_date'
                                ]
                                ?? null,

                            'birth_registration_place' =>
                                $this
                                    ->nullableTrim(
                                        $child[
                                            'birth_registration_place'
                                        ]
                                        ?? null
                                    ),

                            'birth_family_notes' =>
                                $this
                                    ->nullableTrim(
                                        $child[
                                            'birth_family_notes'
                                        ]
                                        ?? null
                                    ),

                            'medical_background' =>
                                $this
                                    ->nullableTrim(
                                        $child[
                                            'medical_background'
                                        ]
                                        ?? null
                                    ),

                            'allergies' =>
                                $this
                                    ->nullableTrim(
                                        $child[
                                            'allergies'
                                        ]
                                        ?? null
                                    ),

                            'existing_conditions' =>
                                $this
                                    ->nullableTrim(
                                        $child[
                                            'existing_conditions'
                                        ]
                                        ?? null
                                    ),

                            'status' =>
                                'Active',
                        ]);

                        if (!empty($child['bcg_received_at_birth']) && $bcgVaccine) {
                            ImmunizationRecord::create([
                                'patient_id' => $patient->id,
                                'vaccine_id' => $bcgVaccine->id,
                                'dose_number' => 1,
                                'date_administered' => !empty($child['bcg_date_administered']) ? $child['bcg_date_administered'] : $patient->date_of_birth,
                                'administered_by' => null,
                                'source' => 'Hospital / Birth Facility',
                                'remarks' => 'Received at birth',
                            ]);
                        }

                        if (!empty($child['hepb_received_at_birth']) && $hepbVaccine) {
                            ImmunizationRecord::create([
                                'patient_id' => $patient->id,
                                'vaccine_id' => $hepbVaccine->id,
                                'dose_number' => 1,
                                'date_administered' => !empty($child['hepb_date_administered']) ? $child['hepb_date_administered'] : $patient->date_of_birth,
                                'administered_by' => null,
                                'source' => 'Hospital / Birth Facility',
                                'remarks' => 'Birth dose received at birth',
                            ]);
                        }
                    }

                    return $guardian;
                }
            );

        $schedulingService
            ->generateSchedules();

        return redirect()
            ->route(
                'guardians.show',
                $guardian
            )
            ->with(
                'success',
                $guardian->user?->account_status === 'active'
                    ? 'Family registered and portal access activated.'
                    : 'Family registered successfully. Portal access can be activated later.'
            );
    }

    public function show(
        Guardian $guardian
    ): Response {
        $guardian->load([
            'user.accountRole',

            'patients' =>
                fn ($query) =>
                    $query
                        ->orderBy(
                            'date_of_birth'
                        )
                        ->orderBy(
                            'first_name'
                        )
                        ->orderBy(
                            'last_name'
                        ),
        ]);

        return Inertia::render(
            'guardian/show',
            [
                'guardian' => [
                    'id' =>
                        $guardian->id,

                    'guardian_no' =>
                        $guardian
                            ->guardian_no,

                    'name' =>
                        $guardian->name,

                    'gender' =>
                        $guardian->gender,

                    'email' =>
                        $guardian
                            ->user
                            ?->email,

                    'contact_number' =>
                        $guardian
                            ->contact_number,

                    'status' =>
                        $guardian
                            ->status,

                    'account_status' =>
                        $guardian
                            ->user
                            ?->account_status
                        ?? 'unclaimed',

                    'must_change_password' =>
                        (bool) (
                            $guardian
                                ->user
                                ?->must_change_password
                            ?? false
                        ),

                    'mother_maiden_name' =>
                        $guardian
                            ->mother_maiden_name,

                    'father_name' =>
                        $guardian
                            ->father_name,

                    'mother_information_unavailable' =>
                        (bool)
                        $guardian
                            ->mother_information_unavailable,

                    'father_information_unavailable' =>
                        (bool)
                        $guardian
                            ->father_information_unavailable,

                    'patients' =>
                        $guardian
                            ->patients
                            ->map(
                                fn (
                                    Patient $patient
                                ) => [
                                    'id' =>
                                        $patient
                                            ->id,

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
                                        optional(
                                            $patient
                                                ->date_of_birth
                                        )->format(
                                            'Y-m-d'
                                        ),

                                    'sex' =>
                                        $patient
                                            ->sex,

                                    'guardian_relationship' =>
                                        $patient
                                            ->guardian_relationship,

                                    'address' =>
                                        $patient
                                            ->address,

                                    'status' =>
                                        $patient
                                            ->status,

                                    'patient_url' =>
                                        route(
                                            'patients.show',
                                            $patient
                                        ),
                                ]
                            )
                            ->values(),
                ],
            ]
        );
    }

    public function edit(
        Guardian $guardian
    ): Response {
        $guardian->load(
            'user'
        );

        return Inertia::render(
            'guardian/edit',
            [
                'guardian' => [
                    'id' =>
                        $guardian->id,

                    'guardian_no' =>
                        $guardian
                            ->guardian_no,

                    'name' =>
                        $guardian->name,

                    'gender' =>
                        $guardian->gender,

                    'email' =>
                        $guardian
                            ->user
                            ?->email,

                    'contact_number' =>
                        $guardian
                            ->contact_number,

                    'mother_maiden_name' =>
                        $guardian
                            ->mother_maiden_name,

                    'father_name' =>
                        $guardian
                            ->father_name,

                    'mother_information_unavailable' =>
                        (bool)
                        $guardian
                            ->mother_information_unavailable,

                    'father_information_unavailable' =>
                        (bool)
                        $guardian
                            ->father_information_unavailable,

                    'status' =>
                        $guardian
                            ->status,

                    'account_status' =>
                        $guardian
                            ->user
                            ?->account_status
                        ?? 'unclaimed',
                ],
            ]
        );
    }

    public function update(
        Request $request,
        Guardian $guardian
    ): RedirectResponse {
        $guardian->loadMissing(
            'user'
        );

        $motherUnavailable =
            $request->boolean(
                'mother_information_unavailable'
            );

        $fatherUnavailable =
            $request->boolean(
                'father_information_unavailable'
            );

        $validated =
            $request->validate([
                'name' => [
                    'required',
                    'string',
                    'max:255',
                ],

                'gender' => [
                    'required',
                    Rule::in([
                        'Male',
                        'Female',
                    ]),
                ],

                'email' => [
                    'nullable',
                    'email',
                    'max:255',

                    Rule::unique(
                        'users',
                        'email'
                    )->ignore(
                        $guardian
                            ->user
                            ?->id
                    ),
                ],

                'contact_number' => [
                    'nullable',
                    'string',
                    'max:50',
                ],

                'mother_maiden_name' => [
                    Rule::requiredIf(
                        ! $motherUnavailable
                    ),
                    'nullable',
                    'string',
                    'max:255',
                ],

                'father_name' => [
                    Rule::requiredIf(
                        ! $fatherUnavailable
                    ),
                    'nullable',
                    'string',
                    'max:255',
                ],

                'mother_information_unavailable' => [
                    'nullable',
                    'boolean',
                ],

                'father_information_unavailable' => [
                    'nullable',
                    'boolean',
                ],

                'status' => [
                    'required',
                    Rule::in([
                        'active',
                        'inactive',
                    ]),
                ],
            ]);

        DB::transaction(
            function () use (
                $validated,
                $guardian,
                $motherUnavailable,
                $fatherUnavailable
            ) {
                $guardian->update([
                    'name' =>
                        trim(
                            $validated[
                                'name'
                            ]
                        ),

                    'gender' =>
                        $validated[
                            'gender'
                        ],

                    'contact_number' =>
                        $this
                            ->nullableTrim(
                                $validated[
                                    'contact_number'
                                ]
                                ?? null
                            ),

                    'mother_maiden_name' =>
                        $motherUnavailable
                            ? null
                            : $this
                                ->nullableTrim(
                                    $validated[
                                        'mother_maiden_name'
                                    ]
                                    ?? null
                                ),

                    'father_name' =>
                        $fatherUnavailable
                            ? null
                            : $this
                                ->nullableTrim(
                                    $validated[
                                        'father_name'
                                    ]
                                    ?? null
                                ),

                    'mother_information_unavailable' =>
                        $motherUnavailable,

                    'father_information_unavailable' =>
                        $fatherUnavailable,

                    'status' =>
                        $validated[
                            'status'
                        ],
                ]);

                if ($guardian->user) {
                    $guardian
                        ->user
                        ->update([
                            'name' =>
                                trim(
                                    $validated[
                                        'name'
                                    ]
                                ),

                            /*
                             * Keep current email if
                             * none was supplied.
                             */
                            'email' =>
                                array_key_exists(
                                    'email',
                                    $validated
                                )
                                    ? $this
                                        ->nullableTrim(
                                            $validated[
                                                'email'
                                            ]
                                        )
                                    : $guardian
                                        ->user
                                        ->email,

                            'status' =>
                                $validated[
                                    'status'
                                ],

                            'account_status' =>
                                $validated[
                                    'status'
                                ] ===
                                'inactive'
                                    ? 'inactive'
                                    : (
                                        $guardian
                                            ->user
                                            ->account_status ===
                                        'inactive'
                                            ? 'active'
                                            : $guardian
                                                ->user
                                                ->account_status
                                    ),
                        ]);
                }
            }
        );

        return redirect()
            ->route(
                'guardians.show',
                $guardian
            )
            ->with(
                'success',
                'Family account updated successfully.'
            );
    }

    private function generateGuardianNumber(): string
    {
        $year =
            now()->format('Y');

        $latestGuardian =
            Guardian::query()
                ->lockForUpdate()
                ->latest('id')
                ->first();

        $nextNumber =
            $latestGuardian
                ? $latestGuardian->id + 1
                : 1;

        return sprintf(
            'GRD-%s-%06d',
            $year,
            $nextNumber
        );
    }

    private function generatePatientId(): string
    {
        $latestPatient =
            Patient::query()
                ->lockForUpdate()
                ->latest('id')
                ->first();

        if (! $latestPatient) {
            return 'PT-000001';
        }

        if (
            preg_match(
                '/^PT-(\d+)$/',
                (string)
                $latestPatient
                    ->patient_id,
                $matches
            )
        ) {
            return sprintf(
                'PT-%06d',
                ((int) $matches[1]) + 1
            );
        }

        return sprintf(
            'PT-%06d',
            $latestPatient->id + 1
        );
    }

    private function guardianRelationshipOptions(
        ?string $gender
    ): array {
        if ($gender === 'Female') {
            return [
                'Mother',
                'Grandmother',
                'Aunt',
                'Sister',
                'Female Legal Guardian',
                'Other',
            ];
        }

        if ($gender === 'Male') {
            return [
                'Father',
                'Grandfather',
                'Uncle',
                'Brother',
                'Male Legal Guardian',
                'Other',
            ];
        }

        return [];
    }

    private function nullableTrim(
        mixed $value
    ): ?string {
        if ($value === null) {
            return null;
        }

        $value =
            trim(
                (string) $value
            );

        return $value === ''
            ? null
            : $value;
    }
}