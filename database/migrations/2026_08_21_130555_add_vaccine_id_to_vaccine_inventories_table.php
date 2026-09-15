<?php

use App\Models\Vaccine;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Add vaccine_id
        |--------------------------------------------------------------------------
        |
        | Keep it nullable temporarily because existing inventory records
        | currently identify vaccines using the old vaccine_type string.
        |
        */

        Schema::table('vaccine_inventories', function (Blueprint $table) {
            $table->foreignId('vaccine_id')
                ->nullable()
                ->after('id')
                ->constrained('vaccines')
                ->restrictOnDelete();
        });


        /*
        |--------------------------------------------------------------------------
        | Link existing inventory records
        |--------------------------------------------------------------------------
        |
        | Existing records currently look like:
        |
        | vaccine_type = "BCG"
        |
        | We find the matching record in vaccines:
        |
        | vaccines.id   = 1
        | vaccines.name = "BCG"
        |
        | and populate:
        |
        | vaccine_inventories.vaccine_id = 1
        |
        */

        DB::table('vaccine_inventories')
            ->orderBy('id')
            ->each(function ($inventory) {

                if (!$inventory->vaccine_type) {
                    return;
                }

                $vaccine = Vaccine::query()
                    ->where(
                        'name',
                        $inventory->vaccine_type
                    )
                    ->first();

                if (!$vaccine) {
                    return;
                }

                DB::table('vaccine_inventories')
                    ->where(
                        'id',
                        $inventory->id
                    )
                    ->update([
                        'vaccine_id' => $vaccine->id,
                    ]);
            });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vaccine_inventories', function (Blueprint $table) {
            $table->dropConstrainedForeignId(
                'vaccine_id'
            );
        });
    }
};