<?php

namespace App\Http\Controllers;

use App\Models\Vaccine;
use App\Models\VaccineSchedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class VaccineController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | VACCINE MASTER LIST
    |--------------------------------------------------------------------------
    */

    public function index()
    {
        $vaccines = Vaccine::with([
            'schedules' => function ($query) {
                $query->orderBy('dose_number');
            },
        ])
            ->latest()
            ->get();

        return Inertia::render('vaccine/index', [
            'vaccines' => $vaccines,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | STORE VACCINE
    |--------------------------------------------------------------------------
    */

    public function store(Request $request)
    {
        $validated = $this->validateVaccine(
            $request
        );

        DB::transaction(
            function () use ($validated) {

                $vaccine = Vaccine::create([
                    'name' =>
                        $validated['name'],

                    'description' =>
                        $validated['description']
                            ?? null,

                    'required_doses' =>
                        $validated['required_doses'],

                    'category' =>
                        $validated['category'],
                ]);

                $this->storeSchedules(
                    $vaccine,
                    $validated['schedules']
                );
            }
        );

        return redirect()
            ->route('vaccine.index')
            ->with(
                'success',
                'Vaccine added successfully.'
            );
    }


    /*
    |--------------------------------------------------------------------------
    | EDIT VACCINE
    |--------------------------------------------------------------------------
    */

    public function edit(Vaccine $vaccine)
    {
        $vaccine->load([
            'schedules' => function ($query) {
                $query->orderBy('dose_number');
            },
        ]);

        return Inertia::render('vaccine/edit', [
            'vaccine' => $vaccine,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | UPDATE VACCINE
    |--------------------------------------------------------------------------
    */

    public function update(
        Request $request,
        Vaccine $vaccine
    ) {
        $validated = $this->validateVaccine(
            $request,
            $vaccine
        );

        DB::transaction(
            function () use (
                $validated,
                $vaccine
            ) {

                $vaccine->update([
                    'name' =>
                        $validated['name'],

                    'description' =>
                        $validated['description']
                            ?? null,

                    'required_doses' =>
                        $validated['required_doses'],

                    'category' =>
                        $validated['category'],
                ]);

                $vaccine
                    ->schedules()
                    ->delete();

                $this->storeSchedules(
                    $vaccine,
                    $validated['schedules']
                );
            }
        );

        return redirect()
            ->route('vaccine.index')
            ->with(
                'success',
                'Vaccine updated successfully.'
            );
    }


    /*
    |--------------------------------------------------------------------------
    | VALIDATE VACCINE
    |--------------------------------------------------------------------------
    */

    private function validateVaccine(
        Request $request,
        ?Vaccine $vaccine = null
    ): array {

        $nameRule = $vaccine
            ? Rule::unique(
                'vaccines',
                'name'
            )->ignore($vaccine->id)
            : Rule::unique(
                'vaccines',
                'name'
            );

        $validator = validator(
            $request->all(),
            [
                'name' => [
                    'required',
                    'string',
                    'max:255',
                    $nameRule,
                ],

                'description' => [
                    'nullable',
                    'string',
                ],

                'required_doses' => [
                    'required',
                    'integer',
                    'min:1',
                ],

                'category' => [
                    'required',
                    'string',
                    'in:routine,optional',
                ],

                'schedules' => [
                    'required',
                    'array',
                    'size:' .
                        $request->input(
                            'required_doses'
                        ),
                ],

                'schedules.*.dose_number' => [
                    'required',
                    'integer',
                    'min:1',
                ],

                'schedules.*.recommended_age' => [
                    'required',
                    'string',
                    'max:255',
                ],

                'schedules.*.interval' => [
                    'nullable',
                    'integer',
                    'min:1',
                ],
            ]
        );


        /*
         * Dose 2 onward must have
         * a required interval.
         */

        $validator->after(
            function ($validator) use ($request) {

                $schedules = $request->input(
                    'schedules',
                    []
                );

                foreach (
                    $schedules as $index => $schedule
                ) {

                    $doseNumber = (int) (
                        $schedule['dose_number']
                        ?? 0
                    );

                    if ($doseNumber <= 1) {
                        continue;
                    }

                    if (
                        empty(
                            $schedule['interval']
                        )
                    ) {
                        $validator
                            ->errors()
                            ->add(
                                "schedules.$index.interval",
                                'The required interval is required for Dose ' .
                                    $doseNumber .
                                    '.'
                            );
                    }
                }
            }
        );

        return $validator->validate();
    }


    /*
    |--------------------------------------------------------------------------
    | STORE SCHEDULES
    |--------------------------------------------------------------------------
    */

    private function storeSchedules(
        Vaccine $vaccine,
        array $schedules
    ): void {

        foreach ($schedules as $schedule) {

            $doseNumber = (int)
                $schedule['dose_number'];

            VaccineSchedule::create([
                'vaccine_id' =>
                    $vaccine->id,

                'dose_number' =>
                    $doseNumber,

                'recommended_age' =>
                    $schedule[
                        'recommended_age'
                    ],

                'interval' =>
                    $doseNumber === 1
                        ? null
                        : (
                            $schedule['interval']
                            ?? null
                        ),
            ]);
        }
    }
}