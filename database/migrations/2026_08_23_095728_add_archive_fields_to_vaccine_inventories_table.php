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
        Schema::table('vaccine_inventories', function (Blueprint $table) {

            /*
            |--------------------------------------------------------------------------
            | ARCHIVE STATUS
            |--------------------------------------------------------------------------
            |
            | False = batch is part of normal inventory.
            | True  = batch has been archived but is preserved for history.
            |
            */

            $table->boolean('is_archived')
                ->default(false)
                ->after('remarks');


            /*
            |--------------------------------------------------------------------------
            | ARCHIVED DATE
            |--------------------------------------------------------------------------
            |
            | Records when the batch was archived.
            |
            | Active batches keep this as NULL.
            |
            */

            $table->timestamp('archived_at')
                ->nullable()
                ->after('is_archived');


            /*
            |--------------------------------------------------------------------------
            | ARCHIVE REASON
            |--------------------------------------------------------------------------
            |
            | Keeps track of why a legitimate batch was removed
            | from active inventory.
            |
            | Examples:
            |
            | expired
            | out_of_stock
            |
            | Later we can also support:
            |
            | damaged
            | recalled
            | disposed
            |
            */

            $table->string('archive_reason')
                ->nullable()
                ->after('archived_at');
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vaccine_inventories', function (Blueprint $table) {

            $table->dropColumn([
                'is_archived',
                'archived_at',
                'archive_reason',
            ]);
        });
    }
};