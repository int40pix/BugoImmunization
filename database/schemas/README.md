# Database Schemas

This directory contains database schema exports, SQL dumps, and data dictionary references for the **Barangay Bugo Immunization Management System**.

## Contents

* `bugo_immunization_schema.sql`: Full MySQL/MariaDB database dump including table definitions, default roles, system vaccines, sample inventories, and test accounts.

## Schema Architecture

The database is managed primarily through Laravel Eloquent Migrations located in [`../migrations/`](../migrations/).

### Core Entity Relationships
1. **Users & Roles**: `roles` -> `users` (Admin, Nurse, Midwife, BHW, Guardian).
2. **Guardians**: Parent/guardian entities linked 1:1 with `users` who have the `guardian` role.
3. **Patients**: Pediatric infant/child records linked N:1 to `guardians`.
4. **Vaccines & Schedules**: Vaccine catalog and developmental milestone dosing intervals.
5. **Vaccine Inventories**: Batch/lot-specific stock tracking, expiration tracking, and First-Expired, First-Out (FEFO) allocation.
6. **Immunization Records**: Individual vaccine dose administration events.
7. **Patient Immunization Card Rows**: Dynamic physical card line items for health record printouts.
8. **Notifications**: Clinical reminder alerts for health staff and parents.
9. **Password Reset Requests**: Staff-assisted guardian password recovery queue.

## Importing the Schema

To initialize the database from the SQL dump using MySQL CLI:

```bash
mysql -u root -p bugo_immunization < database/schemas/bugo_immunization_schema.sql
```

Alternatively, run fresh migrations with seeders:

```bash
php artisan migrate:fresh --seed
```
