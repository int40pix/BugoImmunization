# Database Schemas

This directory contains database schema exports, SQL dumps, restore utilities, and data dictionary references for the **Barangay Bugo Immunization Management System**.

## Contents

* `bugo_schema.sql`: Full MySQL/MariaDB database dump for the dedicated `bugo` database, including all 21 tables, default roles, system vaccines, sample inventory lots, test guardian/patient accounts, and clinical schedules.
* `restore_database.bat`: Single-click automated database restore script targeting XAMPP MySQL.

## Schema Architecture

The database is managed through Laravel Eloquent Migrations located in [`../migrations/`](../migrations/).

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

## Importing & Restoring the Database

### Option 1: Using the Restore Script (Recommended)
Simply double-click `restore_database.bat` in this folder.

### Option 2: Using the MySQL CLI
```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS bugo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root bugo < database/schemas/bugo_schema.sql
```

### Option 3: Using Laravel Artisan Migrations & Seeders
From the `backend/` directory:
```bash
php artisan migrate:fresh --seed
```
