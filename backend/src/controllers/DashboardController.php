<?php

namespace App\Http\Controllers;

use App\Models\ImmunizationRecord;
use App\Models\Patient;
use App\Models\PatientVaccineSchedule;
use App\Models\Vaccine;
use App\Models\VaccineInventory;
use App\Services\VaccineSchedulingPriorityService;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(
        VaccineSchedulingPriorityService $priorityService
    ): Response {
        $today = Carbon::today();
        $lowStockThreshold = 20;

        /*
        |--------------------------------------------------------------------------
        | CORE DASHBOARD COUNTS
        |--------------------------------------------------------------------------
        */

        $totalPatients = Patient::query()
            ->count();

        $startOfWeek = $today
            ->copy()
            ->startOfWeek(Carbon::MONDAY);

        $endOfWeek = $today
            ->copy()
            ->endOfWeek(Carbon::SUNDAY);

        $vaccinatedThisWeek = ImmunizationRecord::query()
            ->whereBetween(
                'date_administered',
                [
                    $startOfWeek->toDateString(),
                    $endOfWeek->toDateString(),
                ]
            )
            ->count();

        $upcomingSchedules = PatientVaccineSchedule::query()
            ->where('status', 'scheduled')
            ->whereDate(
                'scheduled_date',
                '>=',
                $today
            )
            ->count();

        /*
        |--------------------------------------------------------------------------
        | TCL / IMMUNIZATION WORKLOAD
        |--------------------------------------------------------------------------
        */

        $candidatePool = $priorityService
            ->getCandidatePool();

        $overdueImmunizations = $candidatePool
            ->filter(
                fn (array $item) =>
                    ($item['schedule_label'] ?? null)
                    === 'Overdue'
            )
            ->count();

        $currentAgeImmunizations = $candidatePool
            ->filter(
                fn (array $item) =>
                    ($item['schedule_label'] ?? null)
                    === 'Current Age'
            )
            ->count();

        $recentDueImmunizations = $candidatePool
            ->filter(
                fn (array $item) =>
                    ($item['schedule_label'] ?? null)
                    === 'Recent Due'
            )
            ->count();

        /*
        |--------------------------------------------------------------------------
        | VACCINE-LEVEL INVENTORY HEALTH
        |--------------------------------------------------------------------------
        |
        | IMPORTANT:
        | Inventory health is calculated per VACCINE, not per batch.
        |
        | A vaccine with two batches is evaluated from the combined usable
        | quantity of both active, non-expired batches.
        |
        | Vaccines with no batches still appear as Out of Stock because this
        | starts from the Vaccine Master List.
        |
        */

        $vaccines = Vaccine::query()
            ->orderBy('name')
            ->get([
                'id',
                'name',
            ]);

        $usableStockByVaccine = VaccineInventory::query()
            ->where('is_archived', false)
            ->whereDate(
                'expiration_date',
                '>=',
                $today
            )
            ->selectRaw(
                'vaccine_id, SUM(quantity) as usable_stock'
            )
            ->groupBy('vaccine_id')
            ->pluck(
                'usable_stock',
                'vaccine_id'
            )
            ->map(
                fn ($quantity) => (int) $quantity
            );

        /*
        |--------------------------------------------------------------------------
        | RESERVED SCHEDULED DOSES
        |--------------------------------------------------------------------------
        |
        | Every scheduled dose consumes one reservation slot from its vaccine.
        | Physical inventory is still deducted only on administration.
        |
        */

        $reservedByVaccine = PatientVaccineSchedule::query()
            ->where('status', 'scheduled')
            ->whereNotNull(
                'vaccine_inventory_id'
            )
            ->selectRaw(
                'vaccine_id, COUNT(*) as reserved_count'
            )
            ->groupBy('vaccine_id')
            ->pluck(
                'reserved_count',
                'vaccine_id'
            )
            ->map(
                fn ($count) => (int) $count
            );

        /*
        |--------------------------------------------------------------------------
        | REMAINING CURRENT DEMAND
        |--------------------------------------------------------------------------
        */

        $remainingDemandByVaccine = $priorityService
            ->getDemandByVaccineDose()
            ->groupBy('vaccine_id')
            ->map(
                fn ($rows) =>
                    (int) $rows->sum(
                        'unscheduled_patients'
                    )
            );

        $vaccineStockDemand = $vaccines
            ->map(function (Vaccine $vaccine) use (
                $usableStockByVaccine,
                $reservedByVaccine,
                $remainingDemandByVaccine,
                $lowStockThreshold
            ) {
                $usableStock = (int) $usableStockByVaccine
                    ->get(
                        $vaccine->id,
                        0
                    );

                $reservedStock = (int) $reservedByVaccine
                    ->get(
                        $vaccine->id,
                        0
                    );

                $freeStock = max(
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

                $stockHealth = match (true) {
                    $usableStock <= 0 =>
                        'Out of Stock',

                    $usableStock <= $lowStockThreshold =>
                        'Low Stock',

                    default =>
                        'Available',
                };

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

                    'usableStock' =>
                        $usableStock,

                    'reservedStock' =>
                        $reservedStock,

                    'freeStock' =>
                        $freeStock,

                    'remainingDemand' =>
                        $remainingDemand,

                    'stockHealth' =>
                        $stockHealth,

                    'demandCoverage' =>
                        $demandCoverage,
                ];
            })
            ->values();

        $availableVaccines = $vaccineStockDemand
            ->where(
                'stockHealth',
                'Available'
            )
            ->count();

        $lowStockVaccines = $vaccineStockDemand
            ->where(
                'stockHealth',
                'Low Stock'
            )
            ->count();

        $outOfStockVaccines = $vaccineStockDemand
            ->where(
                'stockHealth',
                'Out of Stock'
            )
            ->count();

        $inventoryAlerts =
            $lowStockVaccines
            + $outOfStockVaccines;

        /*
        |--------------------------------------------------------------------------
        | RETURN DASHBOARD
        |--------------------------------------------------------------------------
        */

        return Inertia::render(
            'dashboard',
            [
                'dashboard' => [
                    'totalPatients' =>
                        $totalPatients,

                    'vaccinatedThisWeek' =>
                        $vaccinatedThisWeek,

                    'upcomingSchedules' =>
                        $upcomingSchedules,

                    'inventoryAlerts' =>
                        $inventoryAlerts,

                    'overdueImmunizations' =>
                        $overdueImmunizations,

                    'currentAgeImmunizations' =>
                        $currentAgeImmunizations,

                    'recentDueImmunizations' =>
                        $recentDueImmunizations,
                ],

                'inventoryHealth' => [
                    'available' =>
                        $availableVaccines,

                    'lowStock' =>
                        $lowStockVaccines,

                    'outOfStock' =>
                        $outOfStockVaccines,
                ],

                'vaccineStockDemand' =>
                    $vaccineStockDemand,
            ]
        );
    }
}
