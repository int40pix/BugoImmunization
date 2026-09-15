<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql' && DB::getDriverName() !== 'mariadb') {
            return;
        }

        $this->replaceForeignKey(
            'users',
            'role_id',
            'roles',
            'id',
            'restrict'
        );

        $this->replaceForeignKey(
            'guardians',
            'user_id',
            'users',
            'id',
            'cascade'
        );

        $this->replaceForeignKey(
            'patients',
            'guardian_id',
            'guardians',
            'id',
            'cascade'
        );

        $patientChildren = [
            'immunization_records',
            'patient_vaccine_schedules',
            'patient_immunization_card_rows',
            'patient_vaccines',
        ];

        foreach ($patientChildren as $table) {
            if (
                Schema::hasTable($table) &&
                Schema::hasColumn($table, 'patient_id')
            ) {
                $this->replaceForeignKey(
                    $table,
                    'patient_id',
                    'patients',
                    'id',
                    'cascade'
                );
            }
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql' && DB::getDriverName() !== 'mariadb') {
            return;
        }

        /*
         * We intentionally keep the relationships valid on rollback,
         * but remove the cascading behavior from the core hierarchy.
         */

        $this->replaceForeignKey(
            'guardians',
            'user_id',
            'users',
            'id',
            'restrict'
        );

        $this->replaceForeignKey(
            'patients',
            'guardian_id',
            'guardians',
            'id',
            'restrict'
        );

        $patientChildren = [
            'immunization_records',
            'patient_vaccine_schedules',
            'patient_immunization_card_rows',
            'patient_vaccines',
        ];

        foreach ($patientChildren as $table) {
            if (
                Schema::hasTable($table) &&
                Schema::hasColumn($table, 'patient_id')
            ) {
                $this->replaceForeignKey(
                    $table,
                    'patient_id',
                    'patients',
                    'id',
                    'restrict'
                );
            }
        }
    }

    private function replaceForeignKey(
        string $table,
        string $column,
        string $referencedTable,
        string $referencedColumn,
        string $onDelete
    ): void {
        if (
            ! Schema::hasTable($table) ||
            ! Schema::hasColumn($table, $column)
        ) {
            return;
        }

        $existing = DB::select(
            "
                SELECT CONSTRAINT_NAME
                FROM information_schema.KEY_COLUMN_USAGE
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = ?
                  AND COLUMN_NAME = ?
                  AND REFERENCED_TABLE_NAME IS NOT NULL
                LIMIT 1
            ",
            [$table, $column]
        );

        if (! empty($existing)) {
            $constraintName =
                $existing[0]->CONSTRAINT_NAME;

            DB::statement(
                sprintf(
                    'ALTER TABLE `%s` DROP FOREIGN KEY `%s`',
                    str_replace('`', '``', $table),
                    str_replace('`', '``', $constraintName)
                )
            );
        }

        $constraintName =
            sprintf(
                '%s_%s_fk',
                $table,
                $column
            );

        DB::statement(
            sprintf(
                'ALTER TABLE `%s`
                 ADD CONSTRAINT `%s`
                 FOREIGN KEY (`%s`)
                 REFERENCES `%s` (`%s`)
                 ON DELETE %s
                 ON UPDATE CASCADE',
                str_replace('`', '``', $table),
                str_replace('`', '``', $constraintName),
                str_replace('`', '``', $column),
                str_replace('`', '``', $referencedTable),
                str_replace('`', '``', $referencedColumn),
                strtoupper($onDelete)
            )
        );
    }
};
