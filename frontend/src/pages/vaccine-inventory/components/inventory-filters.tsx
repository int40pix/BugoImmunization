import { Input } from '@/components/ui/input';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import { Search } from 'lucide-react';


type VaccineOption = {
    id: number;
    name: string;
};


type InventoryFiltersProps = {
    search: string;
    setSearch: (value: string) => void;

    status: string;
    setStatus: (value: string) => void;

    vaccineId: string;
    setVaccineId: (value: string) => void;

    vaccineOptions: VaccineOption[];
};


export default function InventoryFilters({
    search,
    setSearch,
    status,
    setStatus,
    vaccineId,
    setVaccineId,
    vaccineOptions,
}: InventoryFiltersProps) {
    return (
        <div className="grid gap-4 md:grid-cols-3">

            {/* SEARCH */}

            <div className="relative">

                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                    type="search"
                    placeholder="Search vaccines..."
                    className="pl-10"
                    value={search}
                    onChange={(e) =>
                        setSearch(
                            e.target.value
                        )
                    }
                />

            </div>


            {/* STATUS FILTER */}

            <Select
                value={status}
                onValueChange={(value) =>
                    setStatus(value)
                }
            >

                <SelectTrigger>

                    <SelectValue placeholder="All statuses" />

                </SelectTrigger>


                <SelectContent>

                    <SelectItem value="all">
                        All statuses
                    </SelectItem>

                    <SelectItem value="available">
                        Available
                    </SelectItem>

                    <SelectItem value="low-stock">
                        Low Stock
                    </SelectItem>

                    <SelectItem value="near-expiry">
                        Near Expiry
                    </SelectItem>

                    <SelectItem value="expired">
                        Expired
                    </SelectItem>

                </SelectContent>

            </Select>


            {/* VACCINE FILTER */}

            <Select
                value={vaccineId}
                onValueChange={(value) =>
                    setVaccineId(value)
                }
            >

                <SelectTrigger>

                    <SelectValue placeholder="All vaccine types" />

                </SelectTrigger>


                <SelectContent>

                    <SelectItem value="all">
                        All vaccine types
                    </SelectItem>


                    {vaccineOptions.map(
                        (vaccine) => (

                            <SelectItem
                                key={vaccine.id}
                                value={String(
                                    vaccine.id
                                )}
                            >
                                {vaccine.name}
                            </SelectItem>

                        )
                    )}

                </SelectContent>

            </Select>

        </div>
    );
}
