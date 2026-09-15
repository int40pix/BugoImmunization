<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vaccines', function (Blueprint $table) {
            $table->unsignedTinyInteger('required_doses')
                ->default(1)
                ->after('description');
        });

        DB::table('vaccines')->where('name', 'BCG')->update([
            'required_doses' => 1,
        ]);

        DB::table('vaccines')->where('name', 'Hepatitis B')->update([
            'required_doses' => 1,
        ]);

        DB::table('vaccines')->where('name', 'Pentavalent')->update([
            'required_doses' => 3,
        ]);

        DB::table('vaccines')->where('name', 'OPV')->update([
            'required_doses' => 3,
        ]);

        DB::table('vaccines')->where('name', 'IPV')->update([
            'required_doses' => 2,
        ]);

        DB::table('vaccines')->where('name', 'PCV')->update([
            'required_doses' => 3,
        ]);

        DB::table('vaccines')->where('name', 'MMR')->update([
            'required_doses' => 2,
        ]);
    }

    public function down(): void
    {
        Schema::table('vaccines', function (Blueprint $table) {
            $table->dropColumn('required_doses');
        });
    }
};