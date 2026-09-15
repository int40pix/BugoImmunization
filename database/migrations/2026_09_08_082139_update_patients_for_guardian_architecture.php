<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            /*
            |--------------------------------------------------------------------------
            | Remove old patient-account relationship
            |--------------------------------------------------------------------------
            */
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');

            /*
            |--------------------------------------------------------------------------
            | Link child to guardian account
            |--------------------------------------------------------------------------
            */
            $table->foreignId('guardian_id')
                ->nullable()
                ->after('id')
                ->constrained('guardians')
                ->nullOnDelete();

            /*
            |--------------------------------------------------------------------------
            | Child General / Birth Information
            |--------------------------------------------------------------------------
            */
            $table->string('nickname')
                ->nullable()
                ->after('last_name');

            $table->string('mother_name')
                ->nullable()
                ->after('nickname');

            $table->string('father_name')
                ->nullable()
                ->after('mother_name');

            $table->string('birth_type')
                ->nullable()
                ->after('date_of_birth');

            $table->boolean('is_full_term')
                ->nullable()
                ->after('birth_type');

            $table->string('multiple_birth')
                ->nullable()
                ->after('is_full_term');

            $table->string('birth_attendant')
                ->nullable()
                ->after('multiple_birth');

            $table->string('blood_type', 10)
                ->nullable()
                ->after('birth_attendant');

            $table->decimal('birth_weight', 5, 2)
                ->nullable()
                ->after('blood_type');

            $table->decimal('birth_length', 5, 2)
                ->nullable()
                ->after('birth_weight');

            $table->decimal('head_circumference', 5, 2)
                ->nullable()
                ->after('birth_length');

            $table->decimal('chest_circumference', 5, 2)
                ->nullable()
                ->after('head_circumference');

            $table->unsignedTinyInteger('birth_order')
                ->nullable()
                ->after('chest_circumference');

            $table->date('birth_registration_date')
                ->nullable()
                ->after('birth_order');

            $table->string('birth_registration_place')
                ->nullable()
                ->after('birth_registration_date');

            $table->text('birth_family_notes')
                ->nullable()
                ->after('birth_registration_place');

            /*
            |--------------------------------------------------------------------------
            | Remove duplicated guardian identity from patient record
            |--------------------------------------------------------------------------
            */
            $table->dropColumn([
                'guardian_name',
                'guardian_contact',
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            /*
            |--------------------------------------------------------------------------
            | Restore old guardian fields
            |--------------------------------------------------------------------------
            */
            $table->string('guardian_name')
                ->after('address');

            $table->string('guardian_contact')
                ->nullable()
                ->after('guardian_name');

            /*
            |--------------------------------------------------------------------------
            | Remove new birth/general-information fields
            |--------------------------------------------------------------------------
            */
            $table->dropForeign(['guardian_id']);

            $table->dropColumn([
                'guardian_id',
                'nickname',
                'mother_name',
                'father_name',
                'birth_type',
                'is_full_term',
                'multiple_birth',
                'birth_attendant',
                'blood_type',
                'birth_weight',
                'birth_length',
                'head_circumference',
                'chest_circumference',
                'birth_order',
                'birth_registration_date',
                'birth_registration_place',
                'birth_family_notes',
            ]);

            /*
            |--------------------------------------------------------------------------
            | Restore old patient-user relationship
            |--------------------------------------------------------------------------
            */
            $table->foreignId('user_id')
                ->nullable()
                ->after('id')
                ->constrained()
                ->nullOnDelete();
        });
    }
};