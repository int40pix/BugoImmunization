<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('guardians', function (Blueprint $table) {
            $table->id();

            /*
            |--------------------------------------------------------------------------
            | Guardian Identity
            |--------------------------------------------------------------------------
            */
            $table->string('guardian_no')->unique();
            $table->string('name');

            /*
            |--------------------------------------------------------------------------
            | Login / Account Credentials
            |--------------------------------------------------------------------------
            */
            $table->string('email')->unique();
            $table->string('password');
            $table->string('remember_token')->nullable();

            /*
            |--------------------------------------------------------------------------
            | Contact / Account Status
            |--------------------------------------------------------------------------
            */
            $table->string('contact_number')->nullable();
            $table->string('status')->default('active');

            $table->timestamp('email_verified_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guardians');
    }
};