```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('guardians', function (Blueprint $table) {
            $table->foreignId('user_id')
                ->nullable()
                ->unique()
                ->after('id')
                ->constrained('users')
                ->cascadeOnDelete();
        });

        $guardianRoleId = DB::table('roles')
            ->where('name', 'guardian')
            ->value('id');

        if (! $guardianRoleId) {
            throw new \RuntimeException(
                'Guardian role was not found. Make sure the roles migration ran successfully first.'
            );
        }

        /*
         * Move every existing guardian login account
         * into the users table.
         *
         * Existing password hashes are copied directly,
         * so current guardian passwords can continue to work.
         */
        DB::table('guardians')
            ->orderBy('id')
            ->get()
            ->each(function ($guardian) use ($guardianRoleId) {
                $existingUser = null;

                /*
                 * Only search by email when the guardian
                 * actually has one.
                 */
                if (! empty($guardian->email)) {
                    $existingUser = DB::table('users')
                        ->where('email', $guardian->email)
                        ->first();
                }

                if ($existingUser) {
                    /*
                     * Make sure the existing email does not
                     * belong to a staff account.
                     */
                    $existingRole = DB::table('roles')
                        ->where('id', $existingUser->role_id)
                        ->value('name');

                    if ($existingRole !== 'guardian') {
                        throw new \RuntimeException(
                            "Guardian email {$guardian->email} is already being used by a staff account."
                        );
                    }

                    $userId = $existingUser->id;
                } else {
                    /*
                     * Guardians with an email/password are
                     * treated as already-active portal users.
                     *
                     * Guardians without login credentials are
                     * treated as unclaimed/no-device accounts.
                     */
                    $hasPortalAccess =
                        ! empty($guardian->email)
                        && ! empty($guardian->password);

                    $userId = DB::table('users')->insertGetId([
                        'name' => $guardian->name,

                        'email' => ! empty($guardian->email)
                            ? strtolower(trim($guardian->email))
                            : null,

                        'email_verified_at' =>
                            $guardian->email_verified_at ?? null,

                        /*
                         * Copy the existing HASHED password.
                         * Do not hash this again.
                         */
                        'password' => $guardian->password ?? null,

                        /*
                         * Keep the old role column populated
                         * temporarily until the final cleanup.
                         */
                        'role' => 'patient',

                        'role_id' => $guardianRoleId,

                        'status' =>
                            ($guardian->status ?? 'active') === 'inactive'
                                ? 'inactive'
                                : 'active',

                        'account_status' =>
                            ($guardian->status ?? 'active') === 'inactive'
                                ? 'inactive'
                                : ($hasPortalAccess
                                    ? 'active'
                                    : 'unclaimed'),

                        'must_change_password' => false,

                        'remember_token' => null,

                        'created_at' =>
                            $guardian->created_at ?? now(),

                        'updated_at' => now(),
                    ]);
                }

                /*
                 * Link the guardian profile to the
                 * corresponding users account.
                 */
                DB::table('guardians')
                    ->where('id', $guardian->id)
                    ->update([
                        'user_id' => $userId,
                    ]);
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $guardianRoleId = DB::table('roles')
            ->where('name', 'guardian')
            ->value('id');

        /*
         * Remember the linked guardian user IDs before
         * removing the foreign key column.
         */
        $guardianUserIds = DB::table('guardians')
            ->whereNotNull('user_id')
            ->pluck('user_id');

        Schema::table('guardians', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropUnique(['user_id']);
            $table->dropColumn('user_id');
        });

        /*
         * Remove only accounts associated with guardians.
         */
        if (
            $guardianRoleId &&
            $guardianUserIds->isNotEmpty()
        ) {
            DB::table('users')
                ->where('role_id', $guardianRoleId)
                ->whereIn('id', $guardianUserIds)
                ->delete();
        }
    }
};