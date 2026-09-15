<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('display_name');
            $table->timestamps();
        });

        DB::table('roles')->insert([
            [
                'name' => 'admin',
                'display_name' => 'Administrator',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'nurse',
                'display_name' => 'Nurse',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'midwife',
                'display_name' => 'Midwife',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'bhw',
                'display_name' => 'Barangay Health Worker',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'guardian',
                'display_name' => 'Parent / Guardian',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};