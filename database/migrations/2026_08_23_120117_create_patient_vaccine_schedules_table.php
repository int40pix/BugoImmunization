<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patient_vaccine_schedules', function (Blueprint $table) {
            $table->id();

            $table->foreignId('patient_id')
                ->constrained('patients')
                ->cascadeOnDelete();

            $table->foreignId('vaccine_id')
                ->constrained('vaccines')
                ->restrictOnDelete();

            /*
             * Specific dose being scheduled.
             *
             * Example:
             * Pentavalent Dose 2
             */
            $table->unsignedTinyInteger('dose_number');

            /*
             * Actual staff-planned administration date.
             *
             * This is separate from dynamically calculated
             * recommended_date and eligible_date.
             */
            $table->date('scheduled_date')
                ->nullable();

            /*
             * Current lifecycle of this planned dose:
             *
             * scheduled
             * completed
             * cancelled
             * deferred
             */
            $table->string('status', 20)
                ->default('scheduled');

            /*
             * Whether staff manually changed the
             * scheduled date after the initial plan.
             */
            $table->boolean('is_manually_adjusted')
                ->default(false);

            /*
             * Staff member responsible for the latest
             * manual schedule adjustment.
             */
            $table->foreignId('adjusted_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            /*
             * When the latest manual adjustment occurred.
             */
            $table->timestamp('adjusted_at')
                ->nullable();

            /*
             * Optional explanation for an adjustment,
             * deferral, or cancellation.
             */
            $table->text('adjustment_reason')
                ->nullable();

            $table->timestamps();

            /*
             * One current planning row per
             * patient + vaccine + dose.
             *
             * We explicitly provide a short constraint
             * name because MySQL limits identifiers
             * to 64 characters.
             */
            $table->unique(
                ['patient_id', 'vaccine_id', 'dose_number'],
                'pvs_patient_vaccine_dose_unique'
            );

            /*
             * Helps queries for scheduled doses
             * by date and status.
             */
            $table->index(
                ['scheduled_date', 'status'],
                'pvs_date_status_index'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patient_vaccine_schedules');
    }
};