<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Guardian authentication has moved to the users table.
     *
     * These legacy guardian columns are temporarily retained
     * while the old authentication architecture is being
     * migrated, so they must allow NULL values.
     */
    public function up(): void
    {
        Schema::table('guardians', function (Blueprint $table) {
            $table->string('email')
                ->nullable()
                ->change();

            $table->string('password')
                ->nullable()
                ->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('guardians', function (Blueprint $table) {
            $table->string('email')
                ->nullable(false)
                ->change();

            $table->string('password')
                ->nullable(false)
                ->change();
        });
    }
};