<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\PatientImmunizationCardRow;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PatientImmunizationCardRowController extends Controller
{
    /**
     * Create a new patient-specific manual immunization card row.
     *
     * These rows are historical/display-only entries and do not
     * participate in vaccine inventory, scheduling, priority,
     * or the Vaccine Master List.
     */
    public function store(
        Request $request,
        Patient $patient
    ): RedirectResponse {
        $validated = $request->validate([
            'vaccine_name' => [
                'required',
                'string',
                'max:255',
            ],

            'dose_count' => [
                'required',
                'integer',
                'min:1',
                'max:10',
            ],

            'doses' => [
                'required',
                'array',
                'min:1',
                'max:10',
            ],

            'doses.*.dose_number' => [
                'required',
                'integer',
                'min:1',
                'max:10',
            ],

            'doses.*.recommended_age' => [
                'nullable',
                'string',
                'max:100',
            ],

            'doses.*.date_administered' => [
                'nullable',
                'date',
                'before_or_equal:today',
            ],

            'doses.*.remarks' => [
                'nullable',
                'string',
                'max:1000',
            ],

            'remarks' => [
                'nullable',
                'string',
                'max:2000',
            ],
        ]);

        $this->validateDoseStructure($request, $validated);

        $patient->immunizationCardRows()->create([
            'vaccine_name' => trim($validated['vaccine_name']),
            'dose_count' => $validated['dose_count'],
            'doses' => $this->normalizeDoses($validated['doses']),
            'remarks' => $this->normalizeNullableString(
                $validated['remarks'] ?? null
            ),
        ]);

        return back()->with(
            'success',
            'Historical immunization row added successfully.'
        );
    }

    /**
     * Update an existing patient-specific manual immunization card row.
     */
    public function update(
        Request $request,
        Patient $patient,
        PatientImmunizationCardRow $cardRow
    ): RedirectResponse {
        $this->ensureRowBelongsToPatient($patient, $cardRow);

        $validated = $request->validate([
            'vaccine_name' => [
                'required',
                'string',
                'max:255',
            ],

            'dose_count' => [
                'required',
                'integer',
                'min:1',
                'max:10',
            ],

            'doses' => [
                'required',
                'array',
                'min:1',
                'max:10',
            ],

            'doses.*.dose_number' => [
                'required',
                'integer',
                'min:1',
                'max:10',
            ],

            'doses.*.recommended_age' => [
                'nullable',
                'string',
                'max:100',
            ],

            'doses.*.date_administered' => [
                'nullable',
                'date',
                'before_or_equal:today',
            ],

            'doses.*.remarks' => [
                'nullable',
                'string',
                'max:1000',
            ],

            'remarks' => [
                'nullable',
                'string',
                'max:2000',
            ],
        ]);

        $this->validateDoseStructure($request, $validated);

        $cardRow->update([
            'vaccine_name' => trim($validated['vaccine_name']),
            'dose_count' => $validated['dose_count'],
            'doses' => $this->normalizeDoses($validated['doses']),
            'remarks' => $this->normalizeNullableString(
                $validated['remarks'] ?? null
            ),
        ]);

        return back()->with(
            'success',
            'Historical immunization row updated successfully.'
        );
    }

    /**
     * Delete a patient-specific manual immunization card row.
     */
    public function destroy(
        Patient $patient,
        PatientImmunizationCardRow $cardRow
    ): RedirectResponse {
        $this->ensureRowBelongsToPatient($patient, $cardRow);

        $cardRow->delete();

        return back()->with(
            'success',
            'Historical immunization row removed successfully.'
        );
    }

    /**
     * Make sure the row being modified belongs to the patient
     * from the route.
     */
    private function ensureRowBelongsToPatient(
        Patient $patient,
        PatientImmunizationCardRow $cardRow
    ): void {
        abort_unless(
            $cardRow->patient_id === $patient->id,
            404
        );
    }

    /**
     * Validate that the submitted dose array matches dose_count
     * and contains exactly one entry for each dose number.
     */
    private function validateDoseStructure(
        Request $request,
        array $validated
    ): void {
        $doseCount = (int) $validated['dose_count'];
        $doses = $validated['doses'];

        if (count($doses) !== $doseCount) {
            $request->validate([
                'doses' => [
                    Rule::in(['__invalid_dose_count__']),
                ],
            ]);

            return;
        }

        $doseNumbers = collect($doses)
            ->pluck('dose_number')
            ->map(fn ($doseNumber) => (int) $doseNumber)
            ->sort()
            ->values()
            ->all();

        $expectedDoseNumbers = range(1, $doseCount);

        if ($doseNumbers !== $expectedDoseNumbers) {
            $request->validate([
                'doses' => [
                    Rule::in(['__invalid_dose_numbers__']),
                ],
            ]);
        }
    }

    /**
     * Normalize the JSON dose data before storing it.
     */
    private function normalizeDoses(array $doses): array
    {
        return collect($doses)
            ->map(function (array $dose): array {
                return [
                    'dose_number' => (int) $dose['dose_number'],

                    'recommended_age' => $this->normalizeNullableString(
                        $dose['recommended_age'] ?? null
                    ),

                    'date_administered' =>
                        $dose['date_administered'] ?? null,

                    'remarks' => $this->normalizeNullableString(
                        $dose['remarks'] ?? null
                    ),
                ];
            })
            ->sortBy('dose_number')
            ->values()
            ->all();
    }

    /**
     * Convert empty strings into null while preserving actual text.
     */
    private function normalizeNullableString(
        ?string $value
    ): ?string {
        if ($value === null) {
            return null;
        }

        $value = trim($value);

        return $value === ''
            ? null
            : $value;
    }
}