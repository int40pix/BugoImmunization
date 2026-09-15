<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patient_vaccines', function (Blueprint $table) {
            $table->id();

            /*
             * Patient who has this optional vaccine
             * explicitly added to their structured
             * immunization tracking.
             */
            $table->foreignId('patient_id')
                ->constrained('patients')
                ->cascadeOnDelete();

            /*
             * Optional vaccine selected from the
             * Vaccine Master List.
             */
            $table->foreignId('vaccine_id')
                ->constrained('vaccines')
                ->restrictOnDelete();

            /*
             * Staff member who added the optional
             * vaccine to this patient.
             */
            $table->foreignId('added_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            /*
             * Optional context for why this vaccine
             * was added to the patient.
             */
            $table->text('notes')
                ->nullable();

            $table->timestamps();

            /*
             * The same vaccine can only be explicitly
             * added to a patient once.
             */
            $table->unique([
                'patient_id',
                'vaccine_id',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patient_vaccines');
    }
};