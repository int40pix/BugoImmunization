<?php

namespace App\Http\Controllers;

use App\Models\ImmunizationRecord;
use App\Models\Patient;
use App\Models\Vaccine;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ImmunizationRecordController extends Controller
{
    /**
     * Manually document an immunization record from the
     * patient's immunization card.
     *
     * This is documentation only.
     *
     * It does NOT deduct vaccine inventory because this action
     * may be used to encode an existing or externally documented
     * vaccination rather than administer a vaccine at the clinic.
     */
    public function store(
        Request $request,
        Patient $patient
    ): RedirectResponse {
        $validated = $request->validate([
            'vaccine_id' => [
                'required',
                'integer',
                'exists:vaccines,id',
            ],

            'dose_number' => [
                'required',
                'integer',
                'min:1',
            ],

            'date_administered' => [
                'required',
                'date',
                'before_or_equal:today',
            ],

            'source' => [
                'required',
                'string',
                'max:100',
            ],

            'remarks' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ]);

        $vaccine = Vaccine::findOrFail(
            $validated['vaccine_id']
        );

        /*
        |--------------------------------------------------------------------------
        | Make sure this vaccine belongs on this patient's card.
        |--------------------------------------------------------------------------
        |
        | Routine vaccines apply to every patient.
        |
        | Optional vaccines apply only when they have been assigned
        | to this particular patient.
        |
        */

        $isRoutine =
            $vaccine->category === 'routine';

        $isAssignedOptional =
            $vaccine->category === 'optional'
            &&
            $patient
                ->optionalVaccines()
                ->whereKey($vaccine->id)
                ->exists();

        if (
            ! $isRoutine
            &&
            ! $isAssignedOptional
        ) {
            throw ValidationException::withMessages([
                'vaccine_id' =>
                    'This vaccine is not applicable to this patient.',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Validate Dose Number
        |--------------------------------------------------------------------------
        |
        | The dose is locked to a valid slot in the vaccine's
        | configured series.
        |
        */

        $requiredDoses = max(
            1,
            (int) $vaccine->required_doses
        );

        $doseNumber =
            (int) $validated['dose_number'];

        if (
            $doseNumber > $requiredDoses
        ) {
            throw ValidationException::withMessages([
                'dose_number' =>
                    'The selected dose is outside this vaccine\'s configured series.',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Administration Date Cannot Precede Birth
        |--------------------------------------------------------------------------
        */

        $patientBirthDate =
            $patient->date_of_birth
                ?->toDateString();

        if (
            $patientBirthDate
            &&
            $validated['date_administered']
                < $patientBirthDate
        ) {
            throw ValidationException::withMessages([
                'date_administered' =>
                    'The administration date cannot be earlier than the patient\'s date of birth.',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Prevent Duplicate Vaccine + Dose Records
        |--------------------------------------------------------------------------
        |
        | A vaccine dose should occupy only one slot on the
        | patient's immunization card.
        |
        */

        $existingRecord =
            ImmunizationRecord::query()
                ->where(
                    'patient_id',
                    $patient->id
                )
                ->where(
                    'vaccine_id',
                    $vaccine->id
                )
                ->where(
                    'dose_number',
                    $doseNumber
                )
                ->exists();

        if ($existingRecord) {
            throw ValidationException::withMessages([
                'dose_number' =>
                    'This vaccine dose already has an immunization record.',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Create Manual Documentation Record
        |--------------------------------------------------------------------------
        |
        | administered_by remains null because this action records
        | vaccination history. It does not claim that the currently
        | logged-in staff member personally administered the vaccine.
        |
        | Inventory is intentionally untouched.
        |
        */

        ImmunizationRecord::create([
            'patient_id' =>
                $patient->id,

            'vaccine_id' =>
                $vaccine->id,

            'dose_number' =>
                $doseNumber,

            'date_administered' =>
                $validated['date_administered'],

            'administered_by' =>
                null,

            'source' =>
                $validated['source'],

            'remarks' =>
                $validated['remarks'] ?? null,
        ]);

        return back()->with(
            'success',
            'Immunization record documented successfully.'
        );
    }

    /**
     * Correct an existing immunization record.
     *
     * Vaccine and dose number remain locked because changing
     * either would affect the patient's vaccine-series state.
     *
     * Date, source, and remarks may be corrected.
     */
    public function update(
        Request $request,
        Patient $patient,
        ImmunizationRecord $immunizationRecord
    ): RedirectResponse {
        /*
        |--------------------------------------------------------------------------
        | Ownership Check
        |--------------------------------------------------------------------------
        |
        | Make sure the record actually belongs to the patient
        | contained in the URL.
        |
        */

        if (
            (int) $immunizationRecord->patient_id
            !==
            (int) $patient->id
        ) {
            abort(404);
        }

        $validated = $request->validate([
            'date_administered' => [
                'required',
                'date',
                'before_or_equal:today',
            ],

            'source' => [
                'required',
                'string',
                'max:100',
            ],

            'remarks' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Administration Date Cannot Precede Birth
        |--------------------------------------------------------------------------
        */

        $patientBirthDate =
            $patient->date_of_birth
                ?->toDateString();

        if (
            $patientBirthDate
            &&
            $validated['date_administered']
                < $patientBirthDate
        ) {
            throw ValidationException::withMessages([
                'date_administered' =>
                    'The administration date cannot be earlier than the patient\'s date of birth.',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Update Documentation Fields
        |--------------------------------------------------------------------------
        |
        | vaccine_id and dose_number are intentionally excluded.
        |
        */

        $immunizationRecord->update([
            'date_administered' =>
                $validated['date_administered'],

            'source' =>
                $validated['source'],

            'remarks' =>
                $validated['remarks'] ?? null,
        ]);

        return back()->with(
            'success',
            'Immunization record updated successfully.'
        );
    }
}