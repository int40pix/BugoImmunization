<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patient_vaccine_schedules', function (Blueprint $table) {
            $table->dropForeign([
                'vaccine_inventory_id',
            ]);

            $table->foreign('vaccine_inventory_id')
                ->references('id')
                ->on('vaccine_inventories')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('patient_vaccine_schedules', function (Blueprint $table) {
            $table->dropForeign([
                'vaccine_inventory_id',
            ]);

            $table->foreign('vaccine_inventory_id')
                ->references('id')
                ->on('vaccine_inventories')
                ->restrictOnDelete();
        });
    }
};