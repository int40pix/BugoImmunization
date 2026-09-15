<?php

namespace Database\Seeders;

use App\Models\Vaccine;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class VaccineSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        /*
        |--------------------------------------------------------------------------
        | BASELINE VACCINE MASTER LIST
        |--------------------------------------------------------------------------
        |
        | Based on the vaccination card used by the project.
        |
        | Recommended ages are stored in the same format expected by
        | VaccineScheduleForm.
        |
        | Intervals are calculated automatically from the difference
        | between consecutive recommended ages.
        |
        */

        $vaccines = [

            /*
            |--------------------------------------------------------------------------
            | BCG
            |--------------------------------------------------------------------------
            */

            [
                'name' => 'BCG',

                'description' =>
                    'Bacillus Calmette-Guérin vaccine.',

                'required_doses' => 1,

                'category' => 'routine',

                'schedules' => [
                    [
                        'dose_number' => 1,
                        'recommended_age' => '0 days',
                    ],
                ],
            ],


            /*
            |--------------------------------------------------------------------------
            | HEPATITIS B
            |--------------------------------------------------------------------------
            */

            [
                'name' => 'Hepatitis B',

                'description' =>
                    'Hepatitis B vaccine.',

                'required_doses' => 1,

                'category' => 'routine',

                'schedules' => [
                    [
                        'dose_number' => 1,
                        'recommended_age' => '0 days',
                    ],
                ],
            ],


            /*
            |--------------------------------------------------------------------------
            | PENTAVALENT
            |--------------------------------------------------------------------------
            */

            [
                'name' => 'Pentavalent',

                'description' =>
                    'DPT-Hep B-Hib vaccine.',

                'required_doses' => 3,

                'category' => 'routine',

                'schedules' => [
                    [
                        'dose_number' => 1,
                        'recommended_age' => '1.5 months',
                    ],
                    [
                        'dose_number' => 2,
                        'recommended_age' => '2.5 months',
                    ],
                    [
                        'dose_number' => 3,
                        'recommended_age' => '3.5 months',
                    ],
                ],
            ],


            /*
            |--------------------------------------------------------------------------
            | OPV
            |--------------------------------------------------------------------------
            */

            [
                'name' => 'OPV',

                'description' =>
                    'Oral Polio Vaccine.',

                'required_doses' => 3,

                'category' => 'routine',

                'schedules' => [
                    [
                        'dose_number' => 1,
                        'recommended_age' => '1.5 months',
                    ],
                    [
                        'dose_number' => 2,
                        'recommended_age' => '2.5 months',
                    ],
                    [
                        'dose_number' => 3,
                        'recommended_age' => '3.5 months',
                    ],
                ],
            ],


            /*
            |--------------------------------------------------------------------------
            | IPV
            |--------------------------------------------------------------------------
            */

            [
                'name' => 'IPV',

                'description' =>
                    'Inactivated Polio Vaccine.',

                'required_doses' => 2,

                'category' => 'routine',

                'schedules' => [
                    [
                        'dose_number' => 1,
                        'recommended_age' => '3.5 months',
                    ],
                    [
                        'dose_number' => 2,
                        'recommended_age' => '9 months',
                    ],
                ],
            ],


            /*
            |--------------------------------------------------------------------------
            | PCV
            |--------------------------------------------------------------------------
            */

            [
                'name' => 'PCV',

                'description' =>
                    'Pneumococcal Conjugate Vaccine.',

                'required_doses' => 3,

                'category' => 'routine',

                'schedules' => [
                    [
                        'dose_number' => 1,
                        'recommended_age' => '1.5 months',
                    ],
                    [
                        'dose_number' => 2,
                        'recommended_age' => '2.5 months',
                    ],
                    [
                        'dose_number' => 3,
                        'recommended_age' => '3.5 months',
                    ],
                ],
            ],


            /*
            |--------------------------------------------------------------------------
            | MMR
            |--------------------------------------------------------------------------
            */

            [
                'name' => 'MMR',

                'description' =>
                    'Measles, Mumps, and Rubella vaccine.',

                'required_doses' => 2,

                'category' => 'routine',

                'schedules' => [
                    [
                        'dose_number' => 1,
                        'recommended_age' => '9 months',
                    ],
                    [
                        'dose_number' => 2,
                        'recommended_age' => '1 year',
                    ],
                ],
            ],
        ];


        /*
        |--------------------------------------------------------------------------
        | CREATE / UPDATE VACCINES
        |--------------------------------------------------------------------------
        */

        DB::transaction(function () use ($vaccines) {

            foreach ($vaccines as $vaccineData) {

                /*
                 * Create the vaccine if it does not exist.
                 *
                 * If it already exists, update it instead
                 * of creating a duplicate.
                 */

                $vaccine = Vaccine::updateOrCreate(
                    [
                        'name' =>
                            $vaccineData['name'],
                    ],
                    [
                        'description' =>
                            $vaccineData['description'],

                        'required_doses' =>
                            $vaccineData['required_doses'],

                        'category' =>
                            $vaccineData['category'],
                    ]
                );


                /*
                 * Replace any old/incomplete schedule
                 * with the baseline schedule defined above.
                 */

                $vaccine
                    ->schedules()
                    ->delete();


                /*
                 * Build each dose schedule.
                 */

                foreach (
                    $vaccineData['schedules']
                    as $index => $schedule
                ) {

                    /*
                     * Dose 1 has no interval because
                     * there is no previous dose.
                     */

                    $interval = null;


                    if ($index > 0) {

                        $previousSchedule =
                            $vaccineData['schedules'][
                                $index - 1
                            ];


                        $previousAgeDays =
                            $this->recommendedAgeToDays(
                                $previousSchedule[
                                    'recommended_age'
                                ]
                            );


                        $currentAgeDays =
                            $this->recommendedAgeToDays(
                                $schedule[
                                    'recommended_age'
                                ]
                            );


                        $difference =
                            $currentAgeDays -
                            $previousAgeDays;


                        if ($difference > 0) {

                            $interval =
                                (int) round(
                                    $difference
                                );
                        }
                    }


                    /*
                     * Create the schedule row.
                     */

                    $vaccine
                        ->schedules()
                        ->create([
                            'dose_number' =>
                                $schedule[
                                    'dose_number'
                                ],

                            'recommended_age' =>
                                $schedule[
                                    'recommended_age'
                                ],

                            'interval' =>
                                $interval,
                        ]);
                }
            }
        });
    }


    /**
     * Convert a recommended age into days.
     *
     * This intentionally follows the same conversion
     * convention currently used by the frontend:
     *
     * 1 day   = 1 day
     * 1 week  = 7 days
     * 1 month = 30 days
     * 1 year  = 365 days
     */
    private function recommendedAgeToDays(
        string $recommendedAge
    ): float
    {
        $parts = preg_split(
            '/\s+/',
            trim(
                strtolower(
                    $recommendedAge
                )
            )
        );


        $value =
            (float) ($parts[0] ?? 0);


        $unit =
            $parts[1] ?? 'days';


        return match ($unit) {

            'day',
            'days' =>
                $value,

            'week',
            'weeks' =>
                $value * 7,

            'month',
            'months' =>
                $value * 30,

            'year',
            'years' =>
                $value * 365,

            default =>
                $value,
        };
    }
}