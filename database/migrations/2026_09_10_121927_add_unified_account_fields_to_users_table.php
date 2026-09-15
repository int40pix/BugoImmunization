<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('role_id')
                ->nullable()
                ->after('role')
                ->constrained('roles')
                ->nullOnDelete();

            $table->string('account_status')
                ->default('active')
                ->after('status');

            $table->boolean('must_change_password')
                ->default(false)
                ->after('account_status');
        });

        /*
         * Convert the current string role into the new FK role_id.
         */
        $roles = DB::table('roles')
            ->pluck('id', 'name');

        DB::table('users')
            ->orderBy('id')
            ->get()
            ->each(function ($user) use ($roles) {
                $oldRole = strtolower((string) $user->role);

                /*
                 * Old "patient" user accounts are treated as
                 * guardian accounts in the new architecture.
                 */
                if ($oldRole === 'patient') {
                    $oldRole = 'guardian';
                }

                if (isset($roles[$oldRole])) {
                    DB::table('users')
                        ->where('id', $user->id)
                        ->update([
                            'role_id' => $roles[$oldRole],
                        ]);
                }
            });

        /*
         * Guardians without devices must be allowed to have
         * no email and no password.
         */
        Schema::table('users', function (Blueprint $table) {
            $table->string('email')
                ->nullable()
                ->change();

            $table->string('password')
                ->nullable()
                ->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['role_id']);

            $table->dropColumn([
                'role_id',
                'account_status',
                'must_change_password',
            ]);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('email')
                ->nullable(false)
                ->change();

            $table->string('password')
                ->nullable(false)
                ->change();
        });
    }
};