

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Pencil, Plus, Syringe } from 'lucide-react';
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

            <div className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-7">

                {/* HEADER */}

                <div className="space-y-4">

                    <Button
                        type="button"
                        variant="ghost"
                        asChild
                    >
                        <Link href={route('vaccine-inventory.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Vaccine Inventory
                        </Link>
                    </Button>


                    <div className="row g-3 align-items-center justify-content-between">
                        <div className="col-12 col-md-8">
                            <h1 className="text-2xl font-bold">
                                Vaccine Master List
                            </h1>

                            <p className="mt-2 text-muted-foreground">
                                Manage vaccine definitions,
                                classifications, required doses,
                                and immunization schedules.
                            </p>
                        </div>

                        <div className="col-12 col-md-4 d-flex justify-content-start justify-content-md-end">
                            <Button
                                type="button"
                                size="sm"
                                className="h-8 sm:h-9 text-xs sm:text-sm px-3"
                                onClick={() =>
                                    setShowAddVaccine(
                                        !showAddVaccine
                                    )
                                }
                            >
                                <Plus className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                {showAddVaccine
                                    ? 'Close Add Vaccine'
                                    : 'Add Vaccine'}
                            </Button>
                        </div>
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
                        {/* Mobile View (< md): Compact card list, zero horizontal overflow */}
                        <div className="d-block d-md-none divide-y divide-border/60 rounded-lg border">
                            {vaccines.length === 0 ? (
                                <div className="p-6 text-center space-y-2">
                                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                        <Syringe className="h-5 w-5" />
                                    </div>
                                    <p className="font-medium text-xs text-foreground">No vaccines defined</p>
                                    <p className="text-[11px] text-muted-foreground">
                                        Click Add Vaccine above to register a new vaccine.
                                    </p>
                                </div>
                            ) : (
                                vaccines.map((vaccine) => (
                                    <div key={vaccine.id} className="p-3 space-y-2 hover:bg-muted/15 transition-colors">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="font-semibold text-xs text-foreground">{vaccine.name}</p>
                                                {vaccine.description && (
                                                    <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-2">
                                                        {vaccine.description}
                                                    </p>
                                                )}
                                            </div>
                                            <span
                                                className={`inline-flex shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                                    vaccine.category === 'routine'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-blue-100 text-blue-700'
                                                }`}
                                            >
                                                {formatCategory(vaccine.category)}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px]">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <span>Doses: <strong className="text-foreground">{vaccine.required_doses}</strong></span>
                                                {vaccine.schedules.length > 0 && (
                                                    <span>• {vaccine.schedules.length} scheduled intervals</span>
                                                )}
                                            </div>

                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="h-7 px-2 text-[11px] font-medium"
                                                asChild
                                            >
                                                <Link href={route('vaccine.edit', vaccine.id)}>
                                                    <Pencil className="mr-1 h-3 w-3" />
                                                    Edit
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Desktop View (md+): Fluid table */}
                        <div className="d-none d-md-block overflow-x-auto">
                            <div className="rounded-lg border">
                                <table className="w-full table-fixed text-sm">
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

                                    <tbody>
                                        {vaccines.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="px-4 py-12 text-center"
                                                >
                                                    <div className="flex flex-col items-center justify-center space-y-2.5">
                                                        <div className="rounded-full bg-muted p-3 text-muted-foreground">
                                                            <Syringe className="h-6 w-6" />
                                                        </div>
                                                        <p className="font-medium text-foreground">No vaccines defined</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Click the Add Vaccine button above to register a new vaccine into the master catalog.
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            vaccines.map((vaccine) => (
                                                <tr
                                                    key={vaccine.id}
                                                    className="border-b last:border-b-0"
                                                >
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

                                                    <td className="border-r px-4 py-4 text-center align-middle">
                                                        <span
                                                            className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
                                                                vaccine.category === 'routine'
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : 'bg-blue-100 text-blue-700'
                                                            }`}
                                                        >
                                                            {formatCategory(
                                                                vaccine.category
                                                            )}
                                                        </span>
                                                    </td>

                                                    <td className="border-r px-4 py-4 text-center align-middle">
                                                        <span className="font-semibold">
                                                            {vaccine.required_doses}
                                                        </span>
                                                    </td>

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

                                                    <td className="px-4 py-4 text-center align-middle">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={route(
                                                                    'vaccine.edit',
                                                                    vaccine.id
                                                                )}
                                                            >
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </Link>
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