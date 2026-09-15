<?php

namespace App\Http\Controllers;

use App\Models\PatientVaccineSchedule;
use App\Models\Vaccine;
use App\Models\VaccineInventory;
use App\Services\VaccineSchedulingPriorityService;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VaccineInventoryController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | ACTIVE INVENTORY
    |--------------------------------------------------------------------------
    */

    public function index(
        Request $request,
        VaccineSchedulingPriorityService $priorityService
    ) {
        $today = \Carbon\Carbon::today();
        $lowStockThreshold = 20;

        /*
        |--------------------------------------------------------------------------
        | VACCINE-CENTERED INVENTORY
        |--------------------------------------------------------------------------
        |
        | The main inventory page is built from the Vaccine Master List,
        | not from inventory batch rows. This guarantees that vaccines with
        | zero batches still appear and can be flagged as Out of Stock.
        |
        */

        $vaccines = Vaccine::query()
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'category',
            ]);

        $activeBatches = VaccineInventory::query()
            ->where('is_archived', false)
            ->orderBy('expiration_date')
            ->orderBy('date_received')
            ->orderBy('id')
            ->get()
            ->groupBy('vaccine_id');

        /*
        |--------------------------------------------------------------------------
        | RESERVED DOSES
        |--------------------------------------------------------------------------
        |
        | Every future scheduled dose reserves one exact batch.
        |
        */

        $reservedByBatch = PatientVaccineSchedule::query()
            ->where('status', 'scheduled')
            ->whereNotNull('vaccine_inventory_id')
            ->selectRaw(
                'vaccine_inventory_id, COUNT(*) as reserved_count'
            )
            ->groupBy('vaccine_inventory_id')
            ->pluck(
                'reserved_count',
                'vaccine_inventory_id'
            )
            ->map(
                fn ($count) => (int) $count
            );

        /*
        |--------------------------------------------------------------------------
        | REMAINING DEMAND
        |--------------------------------------------------------------------------
        |
        | Demand returned by the scheduling service already distinguishes
        | scheduled patients from unscheduled patients. For inventory coverage,
        | the remaining demand is the unscheduled eligible demand.
        |
        */

        $remainingDemandByVaccine =
            $priorityService
                ->getDemandByVaccineDose()
                ->groupBy('vaccine_id')
                ->map(
                    fn ($rows) =>
                        (int) $rows->sum(
                            'unscheduled_patients'
                        )
                );

        $inventory = $vaccines
            ->map(function (Vaccine $vaccine) use (
                $activeBatches,
                $reservedByBatch,
                $remainingDemandByVaccine,
                $today,
                $lowStockThreshold
            ) {
                $batches = collect(
                    $activeBatches->get(
                        $vaccine->id,
                        collect()
                    )
                );

                $batchRows = $batches
                    ->map(function (
                        VaccineInventory $batch
                    ) use (
                        $reservedByBatch,
                        $today,
                        $lowStockThreshold
                    ) {
                        $expirationDate =
                            \Carbon\Carbon::parse(
                                $batch->expiration_date
                            )->startOfDay();

                        $isExpired =
                            $expirationDate->lt(
                                $today
                            );

                        $reserved =
                            (int) $reservedByBatch->get(
                                $batch->id,
                                0
                            );

                        $freeCapacity =
                            $isExpired
                                ? 0
                                : max(
                                    0,
                                    (int) $batch->quantity
                                        - $reserved
                                );

                        $daysUntilExpiry =
                            $today->diffInDays(
                                $expirationDate,
                                false
                            );

                        $batchStatus = match (true) {
                            $isExpired =>
                                'Expired',

                            (int) $batch->quantity <= 0 =>
                                'Out of Stock',

                            (int) $batch->quantity <= $lowStockThreshold =>
                                'Low Batch Quantity',

                            $daysUntilExpiry >= 0
                                && $daysUntilExpiry <= 30 =>
                                'Expiring Soon',

                            default =>
                                'Available',
                        };

                        return [
                            'id' =>
                                $batch->id,

                            'batch_number' =>
                                $batch->batch_number,

                            'quantity' =>
                                (int) $batch->quantity,

                            'reserved' =>
                                $reserved,

                            'free_capacity' =>
                                $freeCapacity,

                            'date_received' =>
                                $batch->date_received
                                    ? \Carbon\Carbon::parse(
                                        $batch->date_received
                                    )->toDateString()
                                    : null,

                            'expiration_date' =>
                                $expirationDate
                                    ->toDateString(),

                            'manufacturer' =>
                                $batch->manufacturer,

                            'supplier' =>
                                $batch->supplier,

                            'remarks' =>
                                $batch->remarks,

                            'status' =>
                                $batchStatus,

                            'days_until_expiry' =>
                                $daysUntilExpiry,
                        ];
                    })
                    ->values();

                $usableStock =
                    (int) $batchRows
                        ->filter(
                            fn (array $batch) =>
                                $batch['status']
                                    !== 'Expired'
                        )
                        ->sum('quantity');

                $reservedStock =
                    (int) $batchRows
                        ->filter(
                            fn (array $batch) =>
                                $batch['status']
                                    !== 'Expired'
                        )
                        ->sum('reserved');

                $freeStock =
                    max(
                        0,
                        $usableStock
                            - $reservedStock
                    );

                $remainingDemand =
                    (int) $remainingDemandByVaccine
                        ->get(
                            $vaccine->id,
                            0
                        );

                /*
                 * Stock Health is based on the aggregate usable stock across
                 * every active, non-expired batch for this vaccine.
                 */
                $stockHealth = match (true) {
                    $usableStock <= 0 =>
                        'Out of Stock',

                    $usableStock <= $lowStockThreshold =>
                        'Low Stock',

                    default =>
                        'Available',
                };

                /*
                 * Demand Coverage is separate from stock health.
                 */
                $demandCoverage = match (true) {
                    $remainingDemand <= 0 =>
                        'No Current Demand',

                    $freeStock < $remainingDemand =>
                        'Insufficient',

                    default =>
                        'Sufficient',
                };

                return [
                    'id' =>
                        $vaccine->id,

                    'name' =>
                        $vaccine->name,

                    'category' =>
                        $vaccine->category,

                    'batch_count' =>
                        $batchRows->count(),

                    'usable_stock' =>
                        $usableStock,

                    'reserved_stock' =>
                        $reservedStock,

                    'free_stock' =>
                        $freeStock,

                    'remaining_demand' =>
                        $remainingDemand,

                    'stock_health' =>
                        $stockHealth,

                    'demand_coverage' =>
                        $demandCoverage,

                    'batches' =>
                        $batchRows,
                ];
            });

        /*
        |--------------------------------------------------------------------------
        | FILTERS
        |--------------------------------------------------------------------------
        */

        if ($request->filled('search')) {
            $search =
                strtolower(
                    trim(
                        $request->search
                    )
                );

            $inventory =
                $inventory
                    ->filter(
                        function (
                            array $vaccine
                        ) use (
                            $search
                        ) {
                            if (
                                str_contains(
                                    strtolower(
                                        $vaccine['name']
                                    ),
                                    $search
                                )
                            ) {
                                return true;
                            }

                            return collect(
                                $vaccine['batches']
                            )->contains(
                                function (
                                    array $batch
                                ) use (
                                    $search
                                ) {
                                    $haystack =
                                        strtolower(
                                            implode(
                                                ' ',
                                                array_filter([
                                                    $batch[
                                                        'batch_number'
                                                    ],
                                                    $batch[
                                                        'manufacturer'
                                                    ],
                                                    $batch[
                                                        'supplier'
                                                    ],
                                                ])
                                            )
                                        );

                                    return
                                        str_contains(
                                            $haystack,
                                            $search
                                        );
                                }
                            );
                        }
                    );
        }

        if (
            $request->filled(
                'vaccine_id'
            )
            &&
            $request->vaccine_id !==
                'all'
        ) {
            $inventory =
                $inventory
                    ->where(
                        'id',
                        (int) $request
                            ->vaccine_id
                    );
        }

        if (
            $request->filled(
                'status'
            )
            &&
            $request->status !==
                'all'
        ) {
            $status =
                $request->status;

            $inventory =
                $inventory
                    ->filter(
                        function (
                            array $vaccine
                        ) use (
                            $status
                        ) {
                            return match (
                                $status
                            ) {
                                'out-of-stock' =>
                                    $vaccine[
                                        'stock_health'
                                    ] ===
                                    'Out of Stock',

                                'low-stock' =>
                                    $vaccine[
                                        'stock_health'
                                    ] ===
                                    'Low Stock',

                                'available' =>
                                    $vaccine[
                                        'stock_health'
                                    ] ===
                                    'Available',

                                'insufficient' =>
                                    $vaccine[
                                        'demand_coverage'
                                    ] ===
                                    'Insufficient',

                                'sufficient' =>
                                    $vaccine[
                                        'demand_coverage'
                                    ] ===
                                    'Sufficient',

                                'no-demand' =>
                                    $vaccine[
                                        'demand_coverage'
                                    ] ===
                                    'No Current Demand',

                                default =>
                                    true,
                            };
                        }
                    );
        }

        $inventory =
            $inventory
                ->values();

        /*
        |--------------------------------------------------------------------------
        | SUMMARY
        |--------------------------------------------------------------------------
        */

        $allInventory =
            $vaccines
                ->map(function (
                    Vaccine $vaccine
                ) use (
                    $activeBatches,
                    $today,
                    $lowStockThreshold
                ) {
                    $batches =
                        collect(
                            $activeBatches->get(
                                $vaccine->id,
                                collect()
                            )
                        );

                    $usable =
                        (int) $batches
                            ->filter(
                                fn (
                                    VaccineInventory $batch
                                ) =>
                                    \Carbon\Carbon::parse(
                                        $batch->expiration_date
                                    )
                                        ->startOfDay()
                                        ->gte(
                                            $today
                                        )
                            )
                            ->sum('quantity');

                    return [
                        'batch_count' =>
                            $batches->count(),

                        'usable_stock' =>
                            $usable,

                        'is_low_stock' =>
                            $usable > 0
                            &&
                            $usable <=
                                $lowStockThreshold,

                        'is_out_of_stock' =>
                            $usable <= 0,

                        'has_expiring_soon' =>
                            $batches
                                ->contains(
                                    function (
                                        VaccineInventory $batch
                                    ) use (
                                        $today
                                    ) {
                                        $expiry =
                                            \Carbon\Carbon::parse(
                                                $batch->expiration_date
                                            )
                                                ->startOfDay();

                                        $days =
                                            $today
                                                ->diffInDays(
                                                    $expiry,
                                                    false
                                                );

                                        return
                                            $days >= 0
                                            &&
                                            $days <= 30;
                                    }
                                ),
                    ];
                });

        $summary = [
            'total_vaccines' =>
                $vaccines->count(),

            'total_existing_batches' =>
                $allInventory
                    ->sum(
                        'batch_count'
                    ),

            'total_usable_stock' =>
                $allInventory
                    ->sum(
                        'usable_stock'
                    ),

            'low_stock_vaccines' =>
                $allInventory
                    ->where(
                        'is_low_stock',
                        true
                    )
                    ->count(),

            'out_of_stock_vaccines' =>
                $allInventory
                    ->where(
                        'is_out_of_stock',
                        true
                    )
                    ->count(),

            'expiring_soon_vaccines' =>
                $allInventory
                    ->where(
                        'has_expiring_soon',
                        true
                    )
                    ->count(),
        ];

        return Inertia::render(
            'vaccine-inventory/index',
            [
                'vaccines' =>
                    $inventory,

                'vaccineOptions' =>
                    $vaccines
                        ->map(
                            fn (
                                Vaccine $vaccine
                            ) => [
                                'id' =>
                                    $vaccine->id,

                                'name' =>
                                    $vaccine->name,
                            ]
                        )
                        ->values(),

                'summary' =>
                    $summary,

                'filters' => [
                    'search' =>
                        $request->search,

                    'status' =>
                        $request->status,

                    'vaccine_id' =>
                        $request->vaccine_id,
                ],
            ]
        );
    }


    /*
    |--------------------------------------------------------------------------
    | ARCHIVED INVENTORY
    |--------------------------------------------------------------------------
    |
    | This is intentionally separate from the
    | active inventory page.
    |
    | Archived batches are historical records.
    |
    */

    public function archived(Request $request)
    {
        $query =
            VaccineInventory::query()
                ->with('vaccine')
                ->where(
                    'is_archived',
                    true
                );


        /*
        |--------------------------------------------------------------------------
        | SEARCH
        |--------------------------------------------------------------------------
        */

        if ($request->filled('search')) {

            $search =
                $request->search;


            $query->where(
                function ($query) use ($search) {

                    $query
                        ->whereHas(
                            'vaccine',
                            function ($vaccineQuery) use ($search) {

                                $vaccineQuery->where(
                                    'name',
                                    'like',
                                    "%{$search}%"
                                );
                            }
                        )
                        ->orWhere(
                            'batch_number',
                            'like',
                            "%{$search}%"
                        )
                        ->orWhere(
                            'manufacturer',
                            'like',
                            "%{$search}%"
                        )
                        ->orWhere(
                            'supplier',
                            'like',
                            "%{$search}%"
                        );
                }
            );
        }


        /*
        |--------------------------------------------------------------------------
        | VACCINE FILTER
        |--------------------------------------------------------------------------
        */

        if (
            $request->filled('vaccine_id') &&
            $request->vaccine_id !== 'all'
        ) {

            $query->where(
                'vaccine_id',
                $request->vaccine_id
            );
        }


        /*
        |--------------------------------------------------------------------------
        | ARCHIVE REASON FILTER
        |--------------------------------------------------------------------------
        */

        if (
            $request->filled('archive_reason') &&
            $request->archive_reason !== 'all'
        ) {

            $query->where(
                'archive_reason',
                $request->archive_reason
            );
        }


        /*
        |--------------------------------------------------------------------------
        | GET ARCHIVED INVENTORY
        |--------------------------------------------------------------------------
        */

        $vaccines =
            $query
                ->orderByDesc(
                    'archived_at'
                )
                ->get();


        /*
        |--------------------------------------------------------------------------
        | VACCINE OPTIONS
        |--------------------------------------------------------------------------
        */

        $vaccineOptions =
            Vaccine::query()
                ->orderBy('name')
                ->get([
                    'id',
                    'name',
                ]);


        /*
        |--------------------------------------------------------------------------
        | RETURN ARCHIVED PAGE
        |--------------------------------------------------------------------------
        */

        return Inertia::render(
            'vaccine-inventory/archived',
            [
                'vaccines' =>
                    $vaccines,

                'vaccineOptions' =>
                    $vaccineOptions,

                'filters' => [

                    'search' =>
                        $request->search,

                    'vaccine_id' =>
                        $request->vaccine_id,

                    'archive_reason' =>
                        $request->archive_reason,
                ],
            ]
        );
    }


    /*
    |--------------------------------------------------------------------------
    | CREATE BATCH
    |--------------------------------------------------------------------------
    */

    public function create()
    {
        $vaccines =
            Vaccine::query()
                ->orderBy('name')
                ->get([
                    'id',
                    'name',
                    'category',
                ]);


        return Inertia::render(
            'vaccine-inventory/create',
            [
                'vaccines' =>
                    $vaccines,
            ]
        );
    }


    /*
    |--------------------------------------------------------------------------
    | STORE BATCH
    |--------------------------------------------------------------------------
    */

    public function store(
        Request $request,
        VaccineSchedulingPriorityService $schedulingService
    ) {
        $validated =
            $request->validate([

                'vaccine_id' => [
                    'required',
                    'integer',
                    'exists:vaccines,id',
                ],

                'batch_number' => [
                    'required',
                    'string',
                    'max:255',
                    'unique:vaccine_inventories,batch_number',
                ],

                'quantity' => [
                    'required',
                    'integer',
                    'min:1',
                ],

                'date_received' => [
                    'required',
                    'date',
                ],

                'expiration_date' => [
                    'required',
                    'date',
                    'after:date_received',
                ],

                'manufacturer' => [
                    'nullable',
                    'string',
                    'max:255',
                ],

                'supplier' => [
                    'nullable',
                    'string',
                    'max:255',
                ],

                'remarks' => [
                    'nullable',
                    'string',
                ],
            ]);


        VaccineInventory::create([

            'vaccine_id' =>
                $validated['vaccine_id'],

            'batch_number' =>
                $validated['batch_number'],

            'quantity' =>
                $validated['quantity'],

            'date_received' =>
                $validated['date_received'],

            'expiration_date' =>
                $validated['expiration_date'],

            'manufacturer' =>
                $validated['manufacturer']
                    ?? null,

            'supplier' =>
                $validated['supplier']
                    ?? null,

            'remarks' =>
                $validated['remarks']
                    ?? null,

            'is_archived' =>
                false,

            'archived_at' =>
                null,

            'archive_reason' =>
                null,
        ]);


        /*
        |--------------------------------------------------------------------------
        | RUN AUTOMATIC SCHEDULING
        |--------------------------------------------------------------------------
        |
        | A newly received usable vaccine batch can create new appointment
        | capacity immediately. Existing scheduled appointments remain intact;
        | the scheduling service only considers candidates that are not already
        | scheduled for the same vaccine dose.
        |
        */

        $schedulingService->generateSchedules();


        return redirect()
            ->route(
                'vaccine-inventory.index'
            )
            ->with(
                'success',
                'Vaccine batch added successfully.'
            );
    }


    /*
    |--------------------------------------------------------------------------
    | EDIT BATCH
    |--------------------------------------------------------------------------
    */

    public function edit(
        VaccineInventory $vaccineInventory
    ) {
        $vaccineInventory->load(
            'vaccine'
        );


        $vaccines =
            Vaccine::query()
                ->orderBy('name')
                ->get([
                    'id',
                    'name',
                    'category',
                ]);


        return Inertia::render(
            'vaccine-inventory/edit',
            [
                'vaccine' =>
                    $vaccineInventory,

                'vaccines' =>
                    $vaccines,
            ]
        );
    }


    /*
    |--------------------------------------------------------------------------
    | UPDATE BATCH
    |--------------------------------------------------------------------------
    */

    public function update(
        Request $request,
        VaccineInventory $vaccineInventory,
        VaccineSchedulingPriorityService $schedulingService
    ) {
        $validated =
            $request->validate([

                'vaccine_id' => [
                    'required',
                    'integer',
                    'exists:vaccines,id',
                ],

                'batch_number' => [
                    'required',
                    'string',
                    'max:255',
                    'unique:vaccine_inventories,batch_number,' .
                        $vaccineInventory->id,
                ],

                'quantity' => [
                    'required',
                    'integer',
                    'min:1',
                ],

                'date_received' => [
                    'required',
                    'date',
                ],

                'expiration_date' => [
                    'required',
                    'date',
                    'after:date_received',
                ],

                'manufacturer' => [
                    'nullable',
                    'string',
                    'max:255',
                ],

                'supplier' => [
                    'nullable',
                    'string',
                    'max:255',
                ],

                'remarks' => [
                    'nullable',
                    'string',
                ],
            ]);


        $vaccineInventory->update([

            'vaccine_id' =>
                $validated['vaccine_id'],

            'batch_number' =>
                $validated['batch_number'],

            'quantity' =>
                $validated['quantity'],

            'date_received' =>
                $validated['date_received'],

            'expiration_date' =>
                $validated['expiration_date'],

            'manufacturer' =>
                $validated['manufacturer']
                    ?? null,

            'supplier' =>
                $validated['supplier']
                    ?? null,

            'remarks' =>
                $validated['remarks']
                    ?? null,
        ]);


        /*
        |--------------------------------------------------------------------------
        | RECONCILE SCHEDULES AFTER INVENTORY UPDATE
        |--------------------------------------------------------------------------
        */

        $schedulingService->generateSchedules();


        return redirect()
            ->route(
                'vaccine-inventory.index'
            )
            ->with(
                'success',
                'Vaccine batch updated successfully.'
            );
    }


    /*
    |--------------------------------------------------------------------------
    | ARCHIVE BATCH
    |--------------------------------------------------------------------------
    */

    public function archive(
        VaccineInventory $vaccineInventory,
        VaccineSchedulingPriorityService $schedulingService
    ) {
        /*
         * Don't archive the same batch twice.
         */

        if (
            $vaccineInventory->is_archived
        ) {

            return redirect()
                ->route(
                    'vaccine-inventory.index'
                )
                ->with(
                    'error',
                    'This vaccine batch is already archived.'
                );
        }


        $isExpired =
            $vaccineInventory
                ->expiration_date
                ->isPast();


        $isOutOfStock =
            $vaccineInventory
                ->quantity <= 0;


        /*
         * Currently, legitimate active stock
         * cannot be archived.
         */

        if (
            !$isExpired &&
            !$isOutOfStock
        ) {

            return redirect()
                ->route(
                    'vaccine-inventory.index'
                )
                ->with(
                    'error',
                    'Only expired or out-of-stock batches can currently be archived.'
                );
        }


        /*
         * Determine the reason automatically.
         */

        $archiveReason =
            $isExpired
                ? 'expired'
                : 'out_of_stock';


        $vaccineInventory->update([

            'is_archived' =>
                true,

            'archived_at' =>
                now(),

            'archive_reason' =>
                $archiveReason,
        ]);


        /*
        |--------------------------------------------------------------------------
        | RECONCILE SCHEDULES AFTER ARCHIVE
        |--------------------------------------------------------------------------
        */

        $schedulingService->generateSchedules();


        return redirect()
            ->route(
                'vaccine-inventory.index'
            )
            ->with(
                'success',
                'Vaccine batch archived successfully.'
            );
    }


    /*
    |--------------------------------------------------------------------------
    | DELETE BATCH
    |--------------------------------------------------------------------------
    |
    | Permanent deletion is intended only for
    | records that were created by mistake.
    |
    | Once Immunization Tracking is connected,
    | batches referenced by an immunization
    | record will not be deletable.
    |
    */

    public function destroy(
        VaccineInventory $vaccineInventory
    ) {
        /*
        |--------------------------------------------------------------------------
        | BLOCK DELETE WHEN REFERENCED BY A PATIENT SCHEDULE
        |--------------------------------------------------------------------------
        |
        | Batch records that have already participated in scheduling must remain
        | available for traceability. The database foreign key also protects this,
        | but checking here prevents an unhandled SQL exception from reaching the UI.
        |
        */

        $isReferencedBySchedule =
            PatientVaccineSchedule::query()
                ->where(
                    'vaccine_inventory_id',
                    $vaccineInventory->id
                )
                ->exists();


        if ($isReferencedBySchedule) {
            return redirect()
                ->route(
                    'vaccine-inventory.index'
                )
                ->with(
                    'error',
                    'This vaccine batch cannot be permanently deleted because it is already referenced by a patient vaccine schedule. Archive it instead when eligible.'
                );
        }


        /*
        |--------------------------------------------------------------------------
        | PERMANENT DELETE
        |--------------------------------------------------------------------------
        |
        | Permanent deletion is reserved for completely unused batches that were
        | created by mistake.
        |
        */

        try {
            $vaccineInventory->delete();
        } catch (QueryException $exception) {
            /*
             * Final safety net in case another foreign-key relationship references
             * this batch now or is added later.
             */
            return redirect()
                ->route(
                    'vaccine-inventory.index'
                )
                ->with(
                    'error',
                    'This vaccine batch cannot be permanently deleted because it is already referenced elsewhere in the system.'
                );
        }


        return redirect()
            ->route(
                'vaccine-inventory.index'
            )
            ->with(
                'success',
                'Vaccine batch permanently deleted.'
            );
    }
}