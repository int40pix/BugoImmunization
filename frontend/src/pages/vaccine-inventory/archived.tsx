import { Button } from '@/components/ui/button';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

import { Input } from '@/components/ui/input';

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
    Link,
    router,
    usePage,
} from '@inertiajs/react';

import {
    Archive,
    ArrowLeft,
    Search,
} from 'lucide-react';

import { InventorySubnav } from './components/inventory-subnav';

import {
    useEffect,
    useRef,
    useState,
} from 'react';


/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

type VaccineMaster = {
    id: number;
    name: string;
};


type VaccineOption = {
    id: number;
    name: string;
};


type ArchivedVaccineInventory = {
    id: number;

    vaccine_id: number;

    vaccine:
        VaccineMaster | null;

    batch_number: string;
    quantity: number;

    expiration_date: string;

    manufacturer:
        string | null;

    supplier:
        string | null;

    remarks:
        string | null;

    is_archived: boolean;

    archived_at:
        string | null;

    archive_reason:
        string | null;
};


/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function ArchivedVaccineInventory() {

    /*
    |--------------------------------------------------------------------------
    | PAGE PROPS
    |--------------------------------------------------------------------------
    */

    const {
        vaccines,
        vaccineOptions,
        filters,
    } = usePage<{
        vaccines:
            ArchivedVaccineInventory[];

        vaccineOptions:
            VaccineOption[];

        filters: {
            search?: string;
            vaccine_id?: string;
            archive_reason?: string;
        };
    }>().props;


    /*
    |--------------------------------------------------------------------------
    | FILTER STATES
    |--------------------------------------------------------------------------
    */

    const [
        search,
        setSearch,
    ] = useState(
        filters.search || ''
    );


    const [
        vaccineId,
        setVaccineId,
    ] = useState(
        filters.vaccine_id || 'all'
    );


    const [
        archiveReason,
        setArchiveReason,
    ] = useState(
        filters.archive_reason || 'all'
    );


    /*
    |--------------------------------------------------------------------------
    | FILTER REQUEST
    |--------------------------------------------------------------------------
    */

    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const timeout =
            setTimeout(() => {

                router.get(
                    route(
                        'vaccine-inventory.archived'
                    ),

                    {
                        search,

                        vaccine_id:
                            vaccineId,

                        archive_reason:
                            archiveReason,
                    },

                    {
                        preserveState: true,

                        preserveScroll: true,

                        replace: true,
                    }
                );

            }, 400);


        return () =>
            clearTimeout(
                timeout
            );

    }, [
        search,
        vaccineId,
        archiveReason,
    ]);


    /*
    |--------------------------------------------------------------------------
    | FORMAT ARCHIVE REASON
    |--------------------------------------------------------------------------
    */

    function formatArchiveReason(
        reason: string | null
    ) {

        if (!reason) {
            return 'Unknown';
        }


        if (
            reason === 'expired'
        ) {
            return 'Expired';
        }


        if (
            reason === 'out_of_stock'
        ) {
            return 'Out of Stock';
        }


        return reason
            .replaceAll(
                '_',
                ' '
            )
            .replace(
                /\b\w/g,
                (character) =>
                    character.toUpperCase()
            );
    }


    /*
    |--------------------------------------------------------------------------
    | FORMAT DATE
    |--------------------------------------------------------------------------
    */

    function formatDate(
        date: string | null
    ) {

        if (!date) {
            return '—';
        }


        return new Date(
            date
        ).toLocaleDateString(
            'en-PH',
            {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            }
        );
    }


    /*
    |--------------------------------------------------------------------------
    | PAGE
    |--------------------------------------------------------------------------
    */

    return (

        <AppLayout>


            <Head title="Archived Vaccine Batches" />


            <div className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-7">


                {/* ========================================================= */}
                {/* HEADER */}
                {/* ========================================================= */}

                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Archived Vaccine Batches
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        View historical vaccine batches that were archived after expiration, depletion, or recall.
                    </p>
                </div>

                <InventorySubnav current="archived" />


                {/* ========================================================= */}
                {/* ARCHIVE INFO */}
                {/* ========================================================= */}

                <Card>

                    <CardContent className="pt-6">

                        <div className="flex gap-3">

                            <Archive className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />


                            <div>

                                <p className="font-medium">

                                    Historical Inventory

                                </p>


                                <p className="mt-1 text-sm text-muted-foreground">

                                    Archived batches remain
                                    recorded for historical
                                    purposes.

                                    Remaining quantities are
                                    preserved but are not
                                    considered usable vaccine
                                    stock.

                                </p>

                            </div>

                        </div>

                    </CardContent>

                </Card>


                {/* ========================================================= */}
                {/* FILTERS */}
                {/* ========================================================= */}

                <Card>

                    <CardContent className="pt-6">

                        <div className="grid gap-4 md:grid-cols-3">


                            {/* SEARCH */}

                            <div className="relative">

                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />


                                <Input
                                    type="search"
                                    placeholder="Search archived batches..."
                                    className="pl-10"
                                    value={
                                        search
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setSearch(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>


                            {/* VACCINE FILTER */}

                            <Select
                                value={
                                    vaccineId
                                }
                                onValueChange={(
                                    value
                                ) =>
                                    setVaccineId(
                                        value
                                    )
                                }
                            >

                                <SelectTrigger>

                                    <SelectValue placeholder="All vaccines" />

                                </SelectTrigger>


                                <SelectContent>

                                    <SelectItem value="all">

                                        All Vaccines

                                    </SelectItem>


                                    {vaccineOptions.map(
                                        (
                                            vaccine
                                        ) => (

                                            <SelectItem
                                                key={
                                                    vaccine.id
                                                }
                                                value={
                                                    String(
                                                        vaccine.id
                                                    )
                                                }
                                            >

                                                {
                                                    vaccine.name
                                                }

                                            </SelectItem>

                                        )
                                    )}

                                </SelectContent>

                            </Select>


                            {/* ARCHIVE REASON */}

                            <Select
                                value={
                                    archiveReason
                                }
                                onValueChange={(
                                    value
                                ) =>
                                    setArchiveReason(
                                        value
                                    )
                                }
                            >

                                <SelectTrigger>

                                    <SelectValue placeholder="All archive reasons" />

                                </SelectTrigger>


                                <SelectContent>

                                    <SelectItem value="all">

                                        All Archive Reasons

                                    </SelectItem>


                                    <SelectItem value="expired">

                                        Expired

                                    </SelectItem>


                                    <SelectItem value="out_of_stock">

                                        Out of Stock

                                    </SelectItem>

                                </SelectContent>

                            </Select>


                        </div>

                    </CardContent>

                </Card>


                {/* ========================================================= */}
                {/* ARCHIVED TABLE */}
                {/* ========================================================= */}

                <Card>


                    <CardHeader>

                        <CardTitle>
                            Archived Records
                        </CardTitle>

                    </CardHeader>


                    <CardContent>


                        <div className="overflow-x-auto">


                            <div className="overflow-hidden rounded-lg border">


                                <table className="w-full text-left text-sm">


                                    {/* ===================================== */}
                                    {/* HEADER */}
                                    {/* ===================================== */}

                                    <thead className="border-b">

                                        <tr>

                                            <th className="px-4 py-3 font-medium">
                                                Vaccine
                                            </th>


                                            <th className="px-4 py-3 font-medium">
                                                Batch Number
                                            </th>


                                            <th className="px-4 py-3 text-center font-medium">
                                                Remaining Stock
                                            </th>


                                            <th className="px-4 py-3 font-medium">
                                                Expiration Date
                                            </th>


                                            <th className="px-4 py-3 font-medium">
                                                Archive Reason
                                            </th>


                                            <th className="px-4 py-3 font-medium">
                                                Archived On
                                            </th>

                                        </tr>

                                    </thead>


                                    {/* ===================================== */}
                                    {/* BODY */}
                                    {/* ===================================== */}

                                    <tbody>


                                        {vaccines.length === 0 ? (

                                            <tr>

                                                <td
                                                    colSpan={6}
                                                    className="px-4 py-12 text-center"
                                                >

                                                    <Archive className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />


                                                    <p className="font-medium">

                                                        No archived batches found.

                                                    </p>


                                                    <p className="mt-1 text-sm text-muted-foreground">

                                                        Archived vaccine
                                                        batches will appear
                                                        here.

                                                    </p>

                                                </td>

                                            </tr>

                                        ) : (

                                            vaccines.map(
                                                (
                                                    inventory
                                                ) => (

                                                    <tr
                                                        key={
                                                            inventory.id
                                                        }
                                                        className="border-b last:border-b-0"
                                                    >


                                                        {/* VACCINE */}

                                                        <td className="px-4 py-4">

                                                            <div>

                                                                <p className="font-medium">

                                                                    {
                                                                        inventory.vaccine
                                                                            ?.name ??
                                                                        'Unknown Vaccine'
                                                                    }

                                                                </p>


                                                                {inventory.manufacturer && (

                                                                    <p className="mt-1 text-xs text-muted-foreground">

                                                                        {
                                                                            inventory.manufacturer
                                                                        }

                                                                    </p>

                                                                )}

                                                            </div>

                                                        </td>


                                                        {/* BATCH */}

                                                        <td className="px-4 py-4">

                                                            <span className="font-medium">

                                                                {
                                                                    inventory.batch_number
                                                                }

                                                            </span>

                                                        </td>


                                                        {/* REMAINING */}

                                                        <td className="px-4 py-4 text-center">

                                                            <span className="font-semibold">

                                                                {
                                                                    inventory.quantity
                                                                }

                                                            </span>

                                                        </td>


                                                        {/* EXPIRATION */}

                                                        <td className="px-4 py-4">

                                                            {
                                                                formatDate(
                                                                    inventory.expiration_date
                                                                )
                                                            }

                                                        </td>


                                                        {/* REASON */}

                                                        <td className="px-4 py-4">

                                                            <span
                                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                                                                    inventory.archive_reason ===
                                                                    'expired'
                                                                        ? 'bg-red-100 text-red-700'
                                                                        : 'bg-gray-100 text-gray-700'
                                                                }`}
                                                            >

                                                                {
                                                                    formatArchiveReason(
                                                                        inventory.archive_reason
                                                                    )
                                                                }

                                                            </span>

                                                        </td>


                                                        {/* ARCHIVED DATE */}

                                                        <td className="px-4 py-4">

                                                            {
                                                                formatDate(
                                                                    inventory.archived_at
                                                                )
                                                            }

                                                        </td>


                                                    </tr>

                                                )
                                            )

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