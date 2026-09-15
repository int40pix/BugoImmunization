import { Button } from '@/components/ui/button';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import AppLayout from '@/layouts/app-layout';

import {
    Head,
    useForm,
    usePage,
} from '@inertiajs/react';

import { ArrowLeft } from 'lucide-react';

import VaccineScheduleForm, {
    type Schedule,
} from '../vaccine-inventory/components/vaccine-schedule-form';


/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

type VaccineCategory =
    | 'routine'
    | 'optional';


type VaccineScheduleFromServer = {
    id: number;
    vaccine_id: number;
    dose_number: number;
    recommended_age: string;
    interval: number | null;
};


type Vaccine = {
    id: number;
    name: string;
    description: string | null;
    required_doses: number;
    category: VaccineCategory;
    schedules: VaccineScheduleFromServer[];
};


type EditVaccineFormData = {
    name: string;
    description: string;
    required_doses: number;
    category: VaccineCategory;
    schedules: Schedule[];
};


/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function VaccineEdit() {

    /*
    |--------------------------------------------------------------------------
    | PAGE PROPS
    |--------------------------------------------------------------------------
    */

    const {
        vaccine,
    } = usePage<{
        vaccine: Vaccine;
    }>().props;


    /*
    |--------------------------------------------------------------------------
    | INITIAL SCHEDULES
    |--------------------------------------------------------------------------
    |
    | The database gives interval to us as:
    |
    | number | null
    |
    | VaccineScheduleForm uses:
    |
    | string
    |
    | So we convert it here.
    |
    */

    const initialSchedules: Schedule[] =
        vaccine.schedules.map(
            (schedule) => ({
                dose_number:
                    schedule.dose_number,

                recommended_age:
                    schedule.recommended_age,

                interval:
                    schedule.interval === null
                        ? ''
                        : String(
                              schedule.interval
                          ),
            })
        );


    /*
    |--------------------------------------------------------------------------
    | FORM
    |--------------------------------------------------------------------------
    */

    const {
        data,
        setData,
        put,
        processing,
        errors,
    } = useForm<EditVaccineFormData>({

        name:
            vaccine.name,

        description:
            vaccine.description ?? '',

        required_doses:
            vaccine.required_doses,

        category:
            vaccine.category,

        schedules:
            initialSchedules,
    });


    /*
    |--------------------------------------------------------------------------
    | SCHEDULE VALIDATION ERRORS
    |--------------------------------------------------------------------------
    |
    | Laravel may return errors such as:
    |
    | schedules.0.recommended_age
    | schedules.1.interval
    |
    */

    const formErrors =
        errors as Record<
            string,
            string | undefined
        >;


    /*
    |--------------------------------------------------------------------------
    | REQUIRED DOSES
    |--------------------------------------------------------------------------
    |
    | Changing required doses also changes
    | the number of schedule rows.
    |
    */

    function handleRequiredDosesChange(
        value: string
    ) {

        const parsed =
            Number(value);


        const numberOfDoses =
            Number.isFinite(parsed) &&
            parsed >= 1
                ? Math.floor(parsed)
                : 1;


        const updatedSchedules:
            Schedule[] = [];


        for (
            let index = 0;
            index < numberOfDoses;
            index++
        ) {

            const existing =
                data.schedules[index];


            updatedSchedules.push({

                dose_number:
                    index + 1,

                recommended_age:
                    existing
                        ?.recommended_age ??
                    '',

                /*
                 * Dose 1 has no interval because
                 * there is no previous dose.
                 */

                interval:
                    index === 0
                        ? ''
                        : existing
                              ?.interval ??
                          '',
            });
        }


        setData({
            ...data,

            required_doses:
                numberOfDoses,

            schedules:
                updatedSchedules,
        });
    }


    /*
    |--------------------------------------------------------------------------
    | SCHEDULE CHANGES
    |--------------------------------------------------------------------------
    */

    function handleSchedulesChange(
        schedules: Schedule[]
    ) {

        setData(
            'schedules',
            schedules
        );
    }


    /*
    |--------------------------------------------------------------------------
    | SUBMIT
    |--------------------------------------------------------------------------
    */

    function submitVaccine(
        e: React.FormEvent
    ) {

        e.preventDefault();


        put(
            route(
                'vaccine.update',
                vaccine.id
            ),
            {
                preserveScroll:
                    true,
            }
        );
    }


    /*
    |--------------------------------------------------------------------------
    | CANCEL / BACK
    |--------------------------------------------------------------------------
    */

    function cancelEdit() {

        window.history.back();
    }


    /*
    |--------------------------------------------------------------------------
    | PAGE
    |--------------------------------------------------------------------------
    */

    return (

        <AppLayout>

            <Head
                title={`Edit ${vaccine.name}`}
            />


            <div className="max-w-5xl space-y-6 p-6">


                {/* ========================================================= */}
                {/* HEADER */}
                {/* ========================================================= */}

                <div>

                    <Button
                        type="button"
                        variant="ghost"
                        onClick={
                            cancelEdit
                        }
                    >

                        <ArrowLeft className="mr-2 h-4 w-4" />

                        Back

                    </Button>


                    <h1 className="mt-4 text-2xl font-bold">

                        Edit Vaccine

                    </h1>


                    <p className="mt-2 text-muted-foreground">

                        Update the vaccine
                        definition, classification,
                        required doses, and
                        immunization schedule.

                    </p>

                </div>


                {/* ========================================================= */}
                {/* FORM */}
                {/* ========================================================= */}

                <Card>

                    <CardHeader>

                        <CardTitle>
                            Vaccine Information
                        </CardTitle>


                        <p className="text-sm text-muted-foreground">

                            Changes made here update
                            the Vaccine Master List.

                            Existing inventory batches
                            remain connected through
                            the vaccine ID.

                        </p>

                    </CardHeader>


                    <CardContent>

                        <form
                            onSubmit={
                                submitVaccine
                            }
                            className="space-y-6"
                        >


                            {/* ================================================= */}
                            {/* NAME + REQUIRED DOSES */}
                            {/* ================================================= */}

                            <div className="grid gap-4 md:grid-cols-2">


                                {/* VACCINE NAME */}

                                <div className="space-y-2">

                                    <Label htmlFor="vaccine_name">

                                        Vaccine Name

                                    </Label>


                                    <Input
                                        id="vaccine_name"
                                        placeholder="e.g. Pentavalent"
                                        value={
                                            data.name
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setData(
                                                'name',
                                                e.target.value
                                            )
                                        }
                                    />


                                    {errors.name && (

                                        <p className="text-sm text-red-500">

                                            {
                                                errors.name
                                            }

                                        </p>

                                    )}

                                </div>


                                {/* REQUIRED DOSES */}

                                <div className="space-y-2">

                                    <Label htmlFor="required_doses">

                                        Required Doses

                                    </Label>


                                    <Input
                                        id="required_doses"
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={
                                            data.required_doses
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            handleRequiredDosesChange(
                                                e.target.value
                                            )
                                        }
                                    />


                                    {errors.required_doses && (

                                        <p className="text-sm text-red-500">

                                            {
                                                errors.required_doses
                                            }

                                        </p>

                                    )}

                                </div>

                            </div>


                            {/* ================================================= */}
                            {/* CLASSIFICATION */}
                            {/* ================================================= */}

                            <div className="space-y-2">

                                <Label>

                                    Vaccine Classification

                                </Label>


                                <Select
                                    value={
                                        data.category
                                    }
                                    onValueChange={(
                                        value
                                    ) =>
                                        setData(
                                            'category',
                                            value as VaccineCategory
                                        )
                                    }
                                >

                                    <SelectTrigger>

                                        <SelectValue />

                                    </SelectTrigger>


                                    <SelectContent>

                                        <SelectItem value="routine">

                                            Routine / Universal

                                        </SelectItem>


                                        <SelectItem value="optional">

                                            Optional / Patient-Specific

                                        </SelectItem>

                                    </SelectContent>

                                </Select>


                                <p className="text-xs text-muted-foreground">

                                    Routine vaccines form
                                    part of the standard
                                    immunization schedule.

                                    Optional vaccines can
                                    later be assigned to
                                    selected patients.

                                </p>


                                {errors.category && (

                                    <p className="text-sm text-red-500">

                                        {
                                            errors.category
                                        }

                                    </p>

                                )}

                            </div>


                            {/* ================================================= */}
                            {/* DESCRIPTION */}
                            {/* ================================================= */}

                            <div className="space-y-2">

                                <Label htmlFor="description">

                                    Description

                                </Label>


                                <Textarea
                                    id="description"
                                    value={
                                        data.description
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setData(
                                            'description',
                                            e.target.value
                                        )
                                    }
                                    placeholder="Optional vaccine description..."
                                />


                                {errors.description && (

                                    <p className="text-sm text-red-500">

                                        {
                                            errors.description
                                        }

                                    </p>

                                )}

                            </div>


                            {/* ================================================= */}
                            {/* IMMUNIZATION SCHEDULE */}
                            {/* ================================================= */}

                            <VaccineScheduleForm
                                schedules={
                                    data.schedules
                                }
                                requiredDoses={
                                    data.required_doses
                                }
                                onSchedulesChange={
                                    handleSchedulesChange
                                }
                                errors={
                                    formErrors
                                }
                            />


                            {/* ================================================= */}
                            {/* ACTIONS */}
                            {/* ================================================= */}

                            <div className="flex justify-end gap-3 border-t pt-4">

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={
                                        cancelEdit
                                    }
                                    disabled={
                                        processing
                                    }
                                >

                                    Cancel

                                </Button>


                                <Button
                                    type="submit"
                                    disabled={
                                        processing
                                    }
                                >

                                    {processing
                                        ? 'Updating...'
                                        : 'Update Vaccine'}

                                </Button>

                            </div>


                        </form>

                    </CardContent>

                </Card>

            </div>

        </AppLayout>
    );
}