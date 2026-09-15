import { Button } from '@/components/ui/button';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import { useForm } from '@inertiajs/react';

import VaccineScheduleForm, {
    type Schedule,
} from './vaccine-schedule-form';


type VaccineCategory =
    | 'routine'
    | 'optional';


type AddVaccineFormData = {
    name: string;
    description: string;
    required_doses: number;
    category: VaccineCategory;
    schedules: Schedule[];
};


type AddVaccineFormProps = {
    onCancel: () => void;
};


export default function AddVaccineForm({
    onCancel,
}: AddVaccineFormProps) {

    /*
    |--------------------------------------------------------------------------
    | FORM
    |--------------------------------------------------------------------------
    */

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
    } = useForm<AddVaccineFormData>({
        name: '',
        description: '',
        required_doses: 1,
        category: 'routine',

        schedules: [
            {
                dose_number: 1,
                recommended_age: '',
                interval: '',
            },
        ],
    });


    /*
    |--------------------------------------------------------------------------
    | NESTED VALIDATION ERRORS
    |--------------------------------------------------------------------------
    */

    const formErrors =
        errors as Record<
            string,
            string | undefined
        >;


    /*
    |--------------------------------------------------------------------------
    | CHANGE REQUIRED DOSES
    |--------------------------------------------------------------------------
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
    | UPDATE SCHEDULES
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

        post(
            route(
                'vaccine.store'
            ),
            {
                preserveScroll:
                    true,

                onSuccess:
                    () => {
                        reset();
                        onCancel();
                    },
            }
        );
    }


    /*
    |--------------------------------------------------------------------------
    | CANCEL
    |--------------------------------------------------------------------------
    */

    function cancelForm() {
        reset();
        onCancel();
    }


    return (
        <Card className="border-2">

            <CardHeader>

                <CardTitle>
                    Add Vaccine Type
                </CardTitle>

                <p className="text-sm text-muted-foreground">
                    Add a vaccine to the
                    master list and define
                    its immunization
                    schedule.
                </p>

            </CardHeader>


            <CardContent>

                <form
                    onSubmit={
                        submitVaccine
                    }
                    className="space-y-6"
                >

                    {/* ======================================== */}
                    {/* VACCINE INFORMATION */}
                    {/* ======================================== */}

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
                                    {errors.name}
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


                    {/* ======================================== */}
                    {/* CLASSIFICATION */}
                    {/* ======================================== */}

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
                            Routine vaccines are
                            intended to appear as
                            part of the standard
                            immunization schedule.
                            Optional vaccines can
                            later be assigned to
                            specific patients.
                        </p>


                        {errors.category && (
                            <p className="text-sm text-red-500">
                                {errors.category}
                            </p>
                        )}

                    </div>


                    {/* ======================================== */}
                    {/* DESCRIPTION */}
                    {/* ======================================== */}

                    <div className="space-y-2">

                        <Label htmlFor="description">
                            Description
                        </Label>

                        <textarea
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
                            placeholder="Optional vaccine description"
                            className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />

                        {errors.description && (
                            <p className="text-sm text-red-500">
                                {errors.description}
                            </p>
                        )}

                    </div>


                    {/* ======================================== */}
                    {/* IMMUNIZATION SCHEDULE */}
                    {/* ======================================== */}

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


                    {/* ======================================== */}
                    {/* BUTTONS */}
                    {/* ======================================== */}

                    <div className="flex justify-end gap-3 border-t pt-4">

                        <Button
                            type="button"
                            variant="outline"
                            onClick={
                                cancelForm
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
                                ? 'Saving...'
                                : 'Save Vaccine'}
                        </Button>

                    </div>

                </form>

            </CardContent>

        </Card>
    );
}