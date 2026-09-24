<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Ensure batch 24 exists as archived record if vaccine 4 exists
        $vaccineExists = DB::table('vaccines')->where('id', 4)->exists();
        $batchExists = DB::table('vaccine_inventories')->where('id', 24)->exists();

        if ($vaccineExists && ! $batchExists) {
            DB::table('vaccine_inventories')->insert([
                'id' => 24,
                'vaccine_id' => 4,
                'batch_number' => 'OPV-2026-003',
                'quantity' => 0,
                'date_received' => '2026-09-01',
                'expiration_date' => '2026-09-19',
                'manufacturer' => 'Bio-Pharma Inc.',
                'supplier' => 'DOH Central Office',
                'remarks' => 'Batch automatically archived: Expiration date reached',
                'is_archived' => 1,
                'archived_at' => '2026-09-18 00:22:25',
                'archive_reason' => 'expired',
                'created_at' => '2026-09-01 00:00:00',
                'updated_at' => '2026-09-18 00:22:25',
            ]);
        }

        // Relink transactions for OPV-2026-003
        DB::table('vaccine_inventory_transactions')
            ->where('batch_number', 'OPV-2026-003')
            ->whereNull('vaccine_inventory_id')
            ->update(['vaccine_inventory_id' => 24]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Intentionally keep for audit integrity
    }
};
