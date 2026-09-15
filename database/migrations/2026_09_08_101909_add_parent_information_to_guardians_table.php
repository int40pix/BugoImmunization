<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('guardians', function (Blueprint $table) {
            $table->string('mother_maiden_name')->nullable()->after('contact_number');
            $table->string('father_name')->nullable()->after('mother_maiden_name');

            $table->boolean('mother_information_unavailable')
                ->default(false)
                ->after('father_name');

            $table->boolean('father_information_unavailable')
                ->default(false)
                ->after('mother_information_unavailable');
        });
    }

    public function down(): void
    {
        Schema::table('guardians', function (Blueprint $table) {
            $table->dropColumn([
                'mother_maiden_name',
                'father_name',
                'mother_information_unavailable',
                'father_information_unavailable',
            ]);
        });
    }
};