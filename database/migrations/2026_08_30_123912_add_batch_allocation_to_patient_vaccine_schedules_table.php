<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patient_vaccine_schedules', function (Blueprint $table) {
            $table->foreignId('vaccine_inventory_id')
                ->nullable()
                ->after('vaccine_id')
                ->constrained('vaccine_inventories')
                ->restrictOnDelete();

            $table->boolean('is_series_completion_candidate')
                ->default(false)
                ->after('is_manually_adjusted');

            $table->string('priority_reason')
                ->nullable()
                ->after('is_series_completion_candidate');

            $table->unsignedInteger('allocation_rank')
                ->nullable()
                ->after('priority_reason');

            $table->json('allocation_snapshot')
                ->nullable()
                ->after('allocation_rank');

            $table->timestamp('allocated_at')
                ->nullable()
                ->after('allocation_snapshot');
        });
    }

    public function down(): void
    {
        Schema::table('patient_vaccine_schedules', function (Blueprint $table) {
            $table->dropForeign([
                'vaccine_inventory_id',
            ]);

            $table->dropColumn([
                'vaccine_inventory_id',
                'is_series_completion_candidate',
                'priority_reason',
                'allocation_rank',
                'allocation_snapshot',
                'allocated_at',
            ]);
        });
    }
};