<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('immunization_records', function (Blueprint $table) {
            $table->id();

            $table->foreignId('patient_id')
                ->constrained('patients')
                ->cascadeOnDelete();

            $table->foreignId('vaccine_id')
                ->constrained('vaccines')
                ->cascadeOnDelete();

            $table->unsignedTinyInteger('dose_number');

            $table->date('date_administered');

            $table->foreignId('administered_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('source')->default('Health Center');

            $table->text('remarks')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('immunization_records');
    }
};