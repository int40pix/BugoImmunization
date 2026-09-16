<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::dropIfExists('vaccine_inventory_transactions');

        Schema::create('vaccine_inventory_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vaccine_id')
                ->constrained('vaccines')
                ->cascadeOnDelete();
            $table->foreignId('vaccine_inventory_id')
                ->nullable()
                ->constrained('vaccine_inventories')
                ->nullOnDelete();
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->foreignId('patient_id')
                ->nullable()
                ->constrained('patients')
                ->nullOnDelete();
            $table->foreignId('immunization_record_id')
                ->nullable()
                ->constrained('immunization_records')
                ->nullOnDelete();
            $table->string('transaction_type'); // received, administered, wastage, expired, adjustment, archived
            $table->integer('quantity_change'); // e.g. +50, -1, -5
            $table->integer('balance_after');   // batch balance after transaction
            $table->string('batch_number');     // snapshot of batch number
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->index(['vaccine_id', 'created_at'], 'vit_vaccine_created_idx');
            $table->index(['vaccine_inventory_id', 'created_at'], 'vit_inventory_created_idx');
            $table->index('transaction_type', 'vit_type_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vaccine_inventory_transactions');
    }
};
