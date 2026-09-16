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
        Schema::table('immunization_records', function (Blueprint $table) {
            $table->string('batch_number', 100)->nullable()->after('dose_number');
            $table->string('consent_given_by', 255)->nullable()->after('administered_by');
            $table->string('injection_site', 100)->nullable()->after('consent_given_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('immunization_records', function (Blueprint $table) {
            $table->dropColumn(['batch_number', 'consent_given_by', 'injection_site']);
        });
    }
};

