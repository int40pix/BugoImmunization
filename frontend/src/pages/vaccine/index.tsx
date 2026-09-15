import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { ArrowLeft, Pencil, Plus } from 'lucide-react';
import { useState } from 'react';

import AddVaccineForm from '../vaccine-inventory/components/add-vaccine-form';


type VaccineSchedule = {
    id: number;
    dose_number: number;
    recommended_age: string;
    interval: number | null;
};


type Vaccine = {
    id: number;
    name: string;
    description: string | null;
    required_doses: number;
    category: 'routine' | 'optional';
    schedules: VaccineSchedule[];
};


export default function VaccineIndex() {
    const { vaccines } = usePage<{
        vaccines: Vaccine[];
    }>().props;

    const [showAddVaccine, setShowAddVaccine] =
        useState(false);


    /*
    |--------------------------------------------------------------------------
    | HELPERS
    |--------------------------------------------------------------------------
    */

    function formatCategory(category: Vaccine['category']) {
        return category === 'routine'
            ? 'Routine / Universal'
            : 'Optional / Patient-Specific';
    }


    function formatRecommendedAge(age: string) {
        const normalized = age.trim().toLowerCase();

        if (
            normalized === '0 days' ||
            normalized === '0 day'
        ) {
            return 'At birth';
        }

        const [rawValue, unit = 'months'] =
            normalized.split(/\s+/);

        const value = Number(rawValue);

        if (!Number.isFinite(value)) {
            return age;
        }

        const whole = Math.floor(value);

        const fraction =
            Math.round((value - whole) * 4) / 4;

        const fractions: Record<number, string> = {
            0.25: '¼',
            0.5: '½',
            0.75: '¾',
        };

        const symbol = fractions[fraction];

        const displayValue = symbol
            ? whole
                ? `${whole}${symbol}`
                : symbol
            : String(value);

        const displayUnit =
            value === 1 && unit.endsWith('s')
                ? unit.slice(0, -1)
                : unit;

        return `${displayValue} ${displayUnit}`;
    }


    function getSortedSchedules(vaccine: Vaccine) {
        return [...vaccine.schedules].sort(
            (a, b) =>
                a.dose_number - b.dose_number
        );
    }


    /*
    |--------------------------------------------------------------------------
    | PAGE
    |--------------------------------------------------------------------------
    */

    return (
        <AppLayout>
            <Head title="Vaccine Master List" />

            <div className="max-w-7xl space-y-6 p-6">

                {/* HEADER */}

                <div className="space-y-4">

                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() =>
                            window.location.href = route(
                                'vaccine-inventory.index'
                            )
                        }
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Vaccine Inventory
                    </Button>


                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                        <div>
                            <h1 className="text-2xl font-bold">
                                Vaccine Master List
                            </h1>

                            <p className="mt-2 text-muted-foreground">
                                Manage vaccine definitions,
                                classifications, required doses,
                                and immunization schedules.
                            </p>
                        </div>


                        <Button
                            type="button"
                            onClick={() =>
                                setShowAddVaccine(
                                    !showAddVaccine
                                )
                            }
                        >
                            <Plus className="mr-2 h-4 w-4" />

                            {showAddVaccine
                                ? 'Close Add Vaccine'
                                : 'Add Vaccine'}
                        </Button>

                    </div>
                </div>


                {/* ADD VACCINE */}

                {showAddVaccine && (
                    <AddVaccineForm
                        onCancel={() =>
                            setShowAddVaccine(false)
                        }
                    />
                )}


                {/* MASTER LIST */}

                <Card>

                    <CardHeader>
                        <CardTitle>
                            Vaccines
                        </CardTitle>
                    </CardHeader>


                    <CardContent>

                        <div className="overflow-x-auto">

                            <div className="overflow-hidden rounded-lg border">

                                <table className="w-full table-fixed text-sm">

                                    {/* HEADER */}

                                    <thead>
                                        <tr className="border-b">

                                            <th className="w-[28%] border-r px-4 py-4 text-left font-medium">
                                                Vaccine
                                            </th>

                                            <th className="w-[18%] border-r px-4 py-4 text-center font-medium">
                                                Classification
                                            </th>

                                            <th className="w-[14%] border-r px-4 py-4 text-center font-medium">
                                                Required Doses
                                            </th>

                                            <th className="w-[28%] border-r px-4 py-4 text-center font-medium">
                                                Schedule
                                            </th>

                                            <th className="w-[12%] px-4 py-4 text-center font-medium">
                                                Actions
                                            </th>

                                        </tr>
                                    </thead>


                                    {/* BODY */}

                                    <tbody>

                                        {vaccines.length === 0 ? (

                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="px-4 py-12 text-center text-muted-foreground"
                                                >
                                                    No vaccines found.
                                                </td>
                                            </tr>

                                        ) : (

                                            vaccines.map((vaccine) => (

                                                <tr
                                                    key={vaccine.id}
                                                    className="border-b last:border-b-0"
                                                >

                                                    {/* VACCINE */}

                                                    <td className="border-r px-4 py-4 align-middle">

                                                        <p className="font-semibold">
                                                            {vaccine.name}
                                                        </p>

                                                        {vaccine.description && (
                                                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                                                {vaccine.description}
                                                            </p>
                                                        )}

                                                    </td>


                                                    {/* CLASSIFICATION */}

                                                    <td className="border-r px-4 py-4 text-center align-middle">

                                                        <span
                                                            className={
                                                                `inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
                                                                    vaccine.category === 'routine'
                                                                        ? 'bg-green-100 text-green-700'
                                                                        : 'bg-blue-100 text-blue-700'
                                                                }`
                                                            }
                                                        >
                                                            {formatCategory(
                                                                vaccine.category
                                                            )}
                                                        </span>

                                                    </td>


                                                    {/* REQUIRED DOSES */}

                                                    <td className="border-r px-4 py-4 text-center align-middle">

                                                        <span className="font-semibold">
                                                            {vaccine.required_doses}
                                                        </span>

                                                    </td>


                                                    {/* SCHEDULE */}

                                                    <td className="border-r px-4 py-4 align-middle">

                                                        {vaccine.schedules.length === 0 ? (

                                                            <div className="text-center">
                                                                <span className="text-xs text-muted-foreground">
                                                                    No schedule
                                                                </span>
                                                            </div>

                                                        ) : (

                                                            <div className="mx-auto w-fit space-y-1">

                                                                {getSortedSchedules(
                                                                    vaccine
                                                                ).map(
                                                                    (schedule) => (

                                                                        <div
                                                                            key={schedule.id}
                                                                            className="grid grid-cols-[58px_100px] items-center gap-2"
                                                                        >

                                                                            <span className="text-left text-xs font-medium">
                                                                                Dose {schedule.dose_number}
                                                                            </span>

                                                                            <span className="whitespace-nowrap text-left text-xs text-muted-foreground">
                                                                                {formatRecommendedAge(
                                                                                    schedule.recommended_age
                                                                                )}
                                                                            </span>

                                                                        </div>
                                                                    )
                                                                )}

                                                            </div>

                                                        )}

                                                    </td>


                                                    {/* ACTIONS */}

                                                    <td className="px-4 py-4 text-center align-middle">

                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                window.location.href = route(
                                                                    'vaccine.edit',
                                                                    vaccine.id
                                                                )
                                                            }
                                                        >
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </Button>

                                                    </td>

                                                </tr>
                                            ))

                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    </CardContent>

                </Card>

            </div>
        </AppLayout>
    );
}