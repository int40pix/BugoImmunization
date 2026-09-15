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
    if (!Schema::hasTable('vaccine_inventories')) {
        Schema::create('vaccine_inventories', function (Blueprint $table) {
            $table->id();
            $table->string('vaccine_type');
            $table->string('batch_number')->unique();
            $table->integer('quantity');
            $table->date('date_received');
            $table->date('expiration_date');
            $table->string('manufacturer')->nullable();
            $table->string('supplier')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    } else {
        Schema::table('vaccine_inventories', function (Blueprint $table) {
            $table->string('vaccine_type')->after('id');
            $table->string('batch_number')->unique()->after('vaccine_type');
            $table->integer('quantity')->after('batch_number');
            $table->date('date_received')->after('quantity');
            $table->date('expiration_date')->after('date_received');
            $table->string('manufacturer')->nullable()->after('expiration_date');
            $table->string('supplier')->nullable()->after('manufacturer');
            $table->text('remarks')->nullable()->after('supplier');
        });
    }
}

public function down(): void
{
    Schema::dropIfExists('vaccine_inventories');
}
};