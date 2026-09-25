# Database Data Dictionary

**Database Name**: `bugo_immunization`  
**Collation**: `utf8mb4_unicode_ci`  
**Database Engine**: InnoDB (MySQL 8.0+ / MariaDB 10.4+)  
**Data Integrity Standards**: Relational Foreign Keys, Cascading Rules, and ACID Transaction Boundaries  

---

## 1. Schema Overview & Table Summary

The relational database schema is composed of **14 core tables** categorized into 6 functional domains:

| Domain | Table Name | Description | Cardinality Context |
| :--- | :--- | :--- | :--- |
| **Authentication & RBAC** | `roles` | System authorization roles (`admin`, `nurse`, `midwife`, `bhw`, `guardian`). | 1:M with `users` |
| | `users` | User credentials, security tokens, account status, and initial password state. | 1:1 with `guardians`, 1:M with audit & request logs |
| | `password_reset_requests` | Staff-moderated password recovery requests with single-pending constraint. | N:1 with `users` |
| **Demographics & Family** | `guardians` | Household profiles, contact numbers, and parent details. | 1:1 with `users`, 1:M with `patients` |
| | `patients` | Pediatric clinical profiles, standardized `patient_id`, birth vitals, and QR codes. | N:1 with `guardians`, 1:M with schedules & records |
| **Vaccine Master Catalog**| `vaccines` | Master dictionary of routine and optional vaccines, indications, required doses. | 1:M with inventory, schedules, and records |
| | `vaccine_schedules` | Standard age milestones, dosing sequence, and interval guidelines. | N:1 with `vaccines` |
| | `patient_vaccines` | Explicit optional vaccine series enrolled per individual pediatric patient. | N:M link between `patients` and `vaccines` |
| **Inventory & Auditing** | `vaccine_inventories` | Batches received, lot numbers, available doses, and FEFO expiry tracking. | N:1 with `vaccines`, 1:M with transactions |
| | `vaccine_inventory_transactions` | Immutable audit ledger logging received, administered, wastage, spoilage, and adjustments. | N:1 with `vaccine_inventories`, `vaccines`, `users` |
| **Scheduling & Clinical** | `patient_vaccine_schedules` | Planned and suggested milestone doses, status tracking (`upcoming`, `scheduled`, `overdue`). | N:1 with `patients`, `vaccines`, `vaccine_inventories` |
| | `immunization_records` | Clinical administration history, provider attribution, lot numbers, and dose sequences. | N:1 with `patients`, `vaccines`, `vaccine_inventories` |
| | `patient_immunization_card_rows`| Custom line items and historical immunization rows on the digital Bakuna card. | N:1 with `patients` |
| **Notifications & System** | `notifications` | Polymorphic system alerts, stock threshold warnings, and automated visit reminders. | MorphTo `notifiable` (`users`) |

---

## 2. Table Specifications

### 2.1 `roles`
Stores access control and role-based permissions.
* `id` (`bigint unsigned`, PK, auto-increment): Unique role identifier.
* `name` (`varchar(255)`, unique, not null): System slug (`admin`, `nurse`, `midwife`, `bhw`, `guardian`).
* `display_name` (`varchar(255)`, not null): Human-readable role title.
* `created_at`, `updated_at` (`timestamp`, nullable): Audit timestamps.

### 2.2 `users`
Stores user login credentials, authorization linkage, and security states.
* `id` (`bigint unsigned`, PK, auto-increment): Primary user ID.
* `role_id` (`bigint unsigned`, FK -> `roles.id`, nullable, on delete restrict): Assigned role.
* `name` (`varchar(255)`, not null): Full legal name.
* `email` (`varchar(255)`, unique, not null): Unique login identifier.
* `password` (`varchar(255)`, not null): Bcrypt-hashed password (12 rounds).
* `role` (`varchar(255)`, nullable): Legacy role string compatibility cache.
* `status` (`varchar(255)`, nullable): Account activity state (`active`, `inactive`).
* `account_status` (`varchar(255)`, default: `'active'`): Workflow state (`active`, `temporary`, `unclaimed`).
* `must_change_password` (`tinyint(1)`, default: `0`): Enforces mandatory password change upon initial login or reset.
* `email_verified_at` (`timestamp`, nullable): Verification timestamp.
* `remember_token` (`varchar(100)`, nullable): Session persistence token.
* `created_at`, `updated_at` (`timestamp`, nullable): Audit timestamps.

### 2.3 `guardians`
Stores parent or legal guardian household profile data.
* `id` (`bigint unsigned`, PK, auto-increment): Primary guardian ID.
* `user_id` (`bigint unsigned`, FK -> `users.id`, nullable, unique, on delete cascade): Linked authentication user.
* `guardian_no` (`varchar(255)`, unique, not null): Standardized household ID (`GRD-YYYY-XXXX`).
* `name` (`varchar(255)`, not null): Guardian full legal name.
* `gender` (`varchar(50)`, nullable): Sex/gender of guardian (`Male`, `Female`).
* `email` (`varchar(255)`, nullable): Notification and correspondence email.
* `contact_number` (`varchar(255)`, nullable): 11-digit mobile contact number for SMS/portal alerts.
* `mother_maiden_name` (`varchar(255)`, nullable): Mother's maiden name for clinical records.
* `father_name` (`varchar(255)`, nullable): Father's legal name.
* `mother_information_unavailable` (`tinyint(1)`, default: `0`): Flag if mother info is omitted.
* `father_information_unavailable` (`tinyint(1)`, default: `0`): Flag if father info is omitted.
* `status` (`varchar(255)`, default: `'active'`): Profile lifecycle status.
* `created_at`, `updated_at` (`timestamp`, nullable): Audit timestamps.

### 2.4 `patients`
Stores pediatric infant health, anthropometrics, and birth records.
* `id` (`bigint unsigned`, PK, auto-increment): Primary patient record ID.
* `guardian_id` (`bigint unsigned`, FK -> `guardians.id`, nullable, on delete cascade): Household parent link.
* `patient_id` (`varchar(255)`, unique, not null): Standardized pediatric identifier (`PT-XXXXXX`).
* `first_name` (`varchar(255)`, not null): Child given name.
* `middle_name` (`varchar(255)`, nullable): Child middle name.
* `last_name` (`varchar(255)`, not null): Child family surname.
* `nickname` (`varchar(255)`, nullable): Familiar child name.
* `date_of_birth` (`date`, not null): Birth date used to evaluate immunization eligibility intervals.
* `sex` (`enum('Male', 'Female')`, not null): Biological sex.
* `address` (`text`, not null): Barangay residence address (Purok/Zone, Bugo, CDO).
* `guardian_relationship` (`varchar(255)`, nullable): Relationship to guardian (`Mother`, `Father`, `Aunt`, `Grandmother`, etc.).
* `mother_name` (`varchar(255)`, nullable): Recorded mother name.
* `father_name` (`varchar(255)`, nullable): Recorded father name.
* `birth_type` (`varchar(100)`, nullable): Gestational birth type (`Single`, `Twin`, `Triplet`).
* `is_full_term` (`tinyint(1)`, nullable): Maturity flag (`1` for full-term >= 37 weeks, `0` for preterm).
* `multiple_birth` (`varchar(100)`, nullable): Context if part of multiple gestation.
* `birth_attendant` (`varchar(255)`, nullable): Attending clinician (`Physician`, `Nurse`, `Midwife`, `Traditional Hilot`).
* `blood_type` (`varchar(10)`, nullable): ABO/Rh blood grouping.
* `birth_weight` (`decimal(8,2)`, nullable): Anthropometric birth weight in kilograms.
* `birth_length` (`decimal(8,2)`, nullable): Anthropometric birth length in centimeters.
* `head_circumference` (`decimal(8,2)`, nullable): Head circumference in centimeters.
* `chest_circumference` (`decimal(8,2)`, nullable): Chest circumference in centimeters.
* `birth_order` (`int`, nullable): Birth order rank among siblings.
* `birth_registration_date` (`date`, nullable): Civil registration date.
* `birth_registration_place` (`varchar(255)`, nullable): Municipality or hospital of birth.
* `birth_family_notes` (`text`, nullable): Family or socio-economic clinical notes.
* `medical_background` (`text`, nullable): Pre-existing medical conditions, chronic illnesses.
* `allergies` (`text`, nullable): Documented adverse reactions or contraindications.
* `existing_conditions` (`text`, nullable): Present symptoms or diagnoses.
* `status` (`varchar(255)`, default: `'Active'`): Active clinical status (`Active`, `Inactive`, `Transferred`).
* `created_at`, `updated_at` (`timestamp`, nullable): Audit timestamps.

### 2.5 `vaccines`
Master catalog of routine childhood vaccines and optional biologics.
* `id` (`bigint unsigned`, PK, auto-increment): Vaccine identifier.
* `name` (`varchar(255)`, not null): Biologic title (e.g., `BCG`, `Pentavalent`, `OPV`, `IPV`, `PCV`, `MMR`, `Hepatitis B`).
* `description` (`text`, nullable): Disease target and clinical indications.
* `category` (`enum('routine', 'optional')`, default: `'routine'`): Expanded Program on Immunization (EPI) routine vs optional vaccine.
* `required_doses` (`int`, default: `1`): Number of doses required for full immunization series completion.
* `created_at`, `updated_at` (`timestamp`, nullable): Audit timestamps.

### 2.6 `vaccine_schedules`
Standard recommended age milestones and intervals per dose.
* `id` (`bigint unsigned`, PK, auto-increment): Rule identifier.
* `vaccine_id` (`bigint unsigned`, FK -> `vaccines.id`, on delete cascade): Targeted vaccine.
* `dose_number` (`int`, not null): Dose rank (1, 2, 3...).
* `recommended_age` (`int`, not null): Recommended administration age in weeks/days.
* `interval_from_previous` (`int`, nullable): Minimum days required since previous dose.
* `created_at`, `updated_at` (`timestamp`, nullable): Audit timestamps.

### 2.7 `vaccine_inventories`
Batch-specific inventory records tracking received lots, available stock, and FEFO expiry.
* `id` (`bigint unsigned`, PK, auto-increment): Inventory lot ID.
* `vaccine_id` (`bigint unsigned`, FK -> `vaccines.id`, on delete cascade): Associated vaccine.
* `batch_number` (`varchar(255)`, unique, not null): Manufacturer batch/lot identifier (e.g. `BCG-2026-001`).
* `quantity` (`int`, not null): Available count of unadministered, unreserved doses.
* `date_received` (`date`, not null): Intake date at health center cold storage.
* `expiration_date` (`date`, not null): Lot expiration date utilized for FEFO allocation sorting.
* `manufacturer` (`varchar(255)`, nullable): Biologic manufacturer or pharmaceutical company.
* `supplier` (`varchar(255)`, nullable): Supply chain source (e.g. DOH Regional Office X).
* `remarks` (`text`, nullable): Cold chain storage notes, vial presentation.
* `is_archived` (`tinyint(1)`, default: `0`): Archival state (`0` = active in cold chain, `1` = retired/archived).
* `archived_at` (`timestamp`, nullable): Timestamp when lot was marked inactive.
* `archive_reason` (`varchar(255)`, nullable): Reason code (`Expired`, `Depleted`, `Damaged`, `Cold Chain Failure`).
* `created_at`, `updated_at` (`timestamp`, nullable): Audit timestamps.

### 2.8 `vaccine_inventory_transactions`
Comprehensive audit ledger capturing every balance mutation across the cold chain.
* `id` (`bigint unsigned`, PK, auto-increment): Transaction ledger ID.
* `vaccine_id` (`bigint unsigned`, FK -> `vaccines.id`, on delete cascade): Associated vaccine biologic.
* `vaccine_inventory_id` (`bigint unsigned`, FK -> `vaccine_inventories.id`, nullable, on delete set null): Targeted lot.
* `user_id` (`bigint unsigned`, FK -> `users.id`, nullable, on delete set null): Healthcare worker performing the transaction (null if automated system job).
* `patient_id` (`bigint unsigned`, FK -> `patients.id`, nullable, on delete set null): Recipient patient if transaction is clinical administration.
* `immunization_record_id` (`bigint unsigned`, FK -> `immunization_records.id`, nullable, on delete set null): Specific clinical administration event link.
* `transaction_type` (`varchar(255)`, not null): Mutation category:
  * `received`: Initial stock intake.
  * `administered`: Clinical deduction upon dose administration.
  * `wastage`: Vial breakages, reconstituted expired vials, or open vial wastage.
  * `spoilage`: Unopened cold chain failure or thermal breach.
  * `expired`: Disposal of batch reaching expiration date.
  * `adjustment`: Physical inventory reconciliation or count correction.
  * `archived`: Automatic or manual retirement of batch from active circulation.
* `quantity_change` (`int`, not null): Signed integer reflecting change (`+100`, `-1`, `-10`).
* `balance_after` (`int`, not null): Snapshot of batch stock balance immediately following mutation.
* `batch_number` (`varchar(255)`, not null): Historical snapshot string of batch number.
* `remarks` (`text`, nullable): Clinical or audit narrative explaining the transaction.
* `created_at`, `updated_at` (`timestamp`, nullable): Timestamp of the audit event.
* *Indexes*: `['vaccine_id', 'created_at']`, `['vaccine_inventory_id', 'created_at']`, `['transaction_type']`.

### 2.9 `patient_vaccines`
Junction table tracking optional or supplemental vaccines assigned to a specific child.
* `id` (`bigint unsigned`, PK, auto-increment): Assignment record ID.
* `patient_id` (`bigint unsigned`, FK -> `patients.id`, on delete cascade): Enrolled child.
* `vaccine_id` (`bigint unsigned`, FK -> `vaccines.id`, on delete restrict): Optional vaccine selected from master list.
* `added_by` (`bigint unsigned`, FK -> `users.id`, nullable, on delete set null): Staff member authorizing enrollment.
* `notes` (`text`, nullable): Clinical indications or parental request notes.
* `created_at`, `updated_at` (`timestamp`, nullable): Timestamps.
* *Unique Key*: `['patient_id', 'vaccine_id']` prevents duplicate elective assignment.

### 2.10 `patient_vaccine_schedules`
Stores individualized planned vaccination appointments, priority status, and batch reservations.
* `id` (`bigint unsigned`, PK, auto-increment): Schedule appointment ID.
* `patient_id` (`bigint unsigned`, FK -> `patients.id`, on delete cascade): Scheduled child.
* `vaccine_id` (`bigint unsigned`, FK -> `vaccines.id`, on delete restrict): Target vaccine.
* `vaccine_inventory_id` (`bigint unsigned`, FK -> `vaccine_inventories.id`, nullable, on delete set null): Reserved batch via priority dose allocation.
* `dose_number` (`unsigned tinyint`, not null): Scheduled dose sequence (e.g. 1, 2, 3).
* `scheduled_date` (`date`, nullable): Target appointment date computed by the scheduling engine or staff.
* `status` (`varchar(20)`, default: `'scheduled'`): Current lifecycle state:
  * `scheduled`: Planned appointment within normal target timeframe.
  * `upcoming`: Target date is approaching within alert window (0-7 days).
  * `overdue`: Target appointment date has elapsed without clinical administration.
  * `completed`: Administered and confirmed in clinical records.
  * `cancelled`: Deferred or contraindicated.
* `is_manually_adjusted` (`boolean`, default: `false`): Flag indicating staff overrode automatic date.
* `is_series_completion_candidate` (`boolean`, default: `false`): Flagged by priority service when child is near completing series.
* `priority_reason` (`varchar(255)`, nullable): Explanation for priority dose allocation.
* `allocation_rank` (`unsigned int`, nullable): Sorting rank under scarce inventory conditions.
* `allocation_snapshot` (`json`, nullable): Snapshot of inventory state at time of dose reservation.
* `allocated_at` (`timestamp`, nullable): Timestamp when dose was locked.
* `adjusted_by` (`bigint unsigned`, FK -> `users.id`, nullable, on delete set null): Staff modifying the schedule.
* `adjusted_at` (`timestamp`, nullable): Adjustment timestamp.
* `adjustment_reason` (`text`, nullable): Staff rationale for date change or deferral.
* `created_at`, `updated_at` (`timestamp`, nullable): Record timestamps.
* *Unique Key*: `['patient_id', 'vaccine_id', 'dose_number']` prevents double-scheduling the same milestone dose.
* *Indexes*: `['scheduled_date', 'status']`.

### 2.11 `immunization_records`
Stores confirmed clinical vaccination administration events.
* `id` (`bigint unsigned`, PK, auto-increment): Clinical encounter record ID.
* `patient_id` (`bigint unsigned`, FK -> `patients.id`, on delete cascade): Recipient child.
* `vaccine_id` (`bigint unsigned`, FK -> `vaccines.id`, on delete cascade): Administered biologic.
* `vaccine_inventory_id` (`bigint unsigned`, FK -> `vaccine_inventories.id`, nullable, on delete set null): Specific inventory batch used.
* `dose_number` (`int`, not null): Dose number administered (e.g. 1 for Pentavalent 1).
* `administered_date` (`date`, not null): Encounter date.
* `administered_by` (`varchar(255)`, not null): Name or designation of health worker administering shot.
* `batch_number` (`varchar(255)`, nullable): Batch number logged at time of administration.
* `remarks` (`text`, nullable): Clinical notes (injection site, adverse events, guardian consent).
* `created_at`, `updated_at` (`timestamp`, nullable): Record timestamps.

### 2.12 `patient_immunization_card_rows`
Configurable line items displayed and rendered on the digital and printed Child Immunization Card.
* `id` (`bigint unsigned`, PK, auto-increment): Card row ID.
* `patient_id` (`bigint unsigned`, FK -> `patients.id`, on delete cascade): Child profile link.
* `vaccine_name` (`varchar(255)`, not null): Biologic title displayed on card grid.
* `dose_count` (`unsigned int`, default: `1`): Number of dose cells rendered for this row.
* `doses` (`json`, not null): Structured JSON array of administered dose objects (`dose_number`, `date`, `batch`, `provider`).
* `remarks` (`text`, nullable): Annotations on physical card.
* `created_at`, `updated_at` (`timestamp`, nullable): Record timestamps.

### 2.13 `notifications`
Laravel polymorphic notification table powering in-app bell alerts, stock warnings, and reminder dispatch logs.
* `id` (`char(36)`, PK, UUID): Unique notification identifier.
* `type` (`varchar(255)`, not null): Notification class name (e.g. `App\Notifications\UpcomingVisitReminderNotification`, `App\Notifications\VaccineStockAlertNotification`, `App\Notifications\BatchArchivedNotification`).
* `notifiable_type` (`varchar(255)`, not null): Target model (`App\Models\User`).
* `notifiable_id` (`bigint unsigned`, not null): ID of recipient user.
* `data` (`text`, not null): JSON-encoded payload containing deep links, child name, clinic date, stock quantities.
* `read_at` (`timestamp`, nullable): Read receipt timestamp (`null` = unread).
* `created_at`, `updated_at` (`timestamp`, nullable): Dispatch timestamps.
* *Index*: `['notifiable_type', 'notifiable_id']`.

### 2.14 `password_reset_requests`
Stores staff-assisted account recovery tickets submitted by guardians or staff with single-pending restriction.
* `id` (`bigint unsigned`, PK, auto-increment): Request ticket ID.
* `user_id` (`bigint unsigned`, FK -> `users.id`, on delete cascade): Account requesting password reset.
* `status` (`enum('pending', 'approved', 'rejected')`, default: `'pending'`): Moderation state.
* `requested_at` (`timestamp`, not null): Submission timestamp.
* `processed_at` (`timestamp`, nullable): Resolution timestamp.
* `processed_by` (`bigint unsigned`, FK -> `users.id`, nullable, on delete set null): Admin resolving the ticket.
* `notes` (`text`, nullable): Administrative resolution notes.
* `created_at`, `updated_at` (`timestamp`, nullable): Timestamps.

---

## 3. Relational Foreign Key Map & Cardinality Matrix

```
+--------------------+            +-------------------+            +---------------------+
|       ROLES        | 1        M |       USERS       | 1        1 |      GUARDIANS      |
|--------------------|<-----------|-------------------|----------->|---------------------|
| id (PK)            |            | id (PK)           |            | id (PK)             |
| name               |            | role_id (FK)      |            | user_id (FK, Unique)|
+--------------------+            +-------------------+            +---------------------+
                                            | 1                               | 1
                                            |                                 |
                                            | M                               | M
                                            v                                 v
                                  +-------------------+            +---------------------+
                                  | PASSWORD_RESETS   |            |      PATIENTS       |
                                  |-------------------|            |---------------------|
                                  | id (PK)           |            | id (PK)             |
                                  | user_id (FK)      |            | guardian_id (FK)    |
                                  | processed_by (FK) |            +---------------------+
                                  +-------------------+                       | 1
                                                                              |
         +--------------------------------------------------------------------+--------------------------+
         | 1                                     | 1                                                    | 1
         v M                                     v M                                                    v M
+--------------------+                  +--------------------+                                 +--------------------+
|  PATIENT_VACCINES  |                  | PAT_VACC_SCHEDULES |                                 |  IMMUNIZ_RECORDS   |
|--------------------|                  |--------------------|                                 |--------------------|
| id (PK)            |                  | id (PK)            |                                 | id (PK)            |
| patient_id (FK)    |                  | patient_id (FK)    |                                 | patient_id (FK)    |
| vaccine_id (FK)    |                  | vaccine_id (FK)    |                                 | vaccine_id (FK)    |
| added_by (FK)      |                  | vacc_inventory_id  |                                 | vacc_inventory_id  |
+--------------------+                  +--------------------+                                 +--------------------+
         | M                                     | M                                                    | M
         |                                       |                                                      |
         +-------------------+                   +--------------------+                                 |
                             | 1                                      | 1                               | 1
                             v                                        v                                 v
                      +---------------------------------------------------------------------------------------+
                      |                                       VACCINES                                        |
                      |---------------------------------------------------------------------------------------|
                      | id (PK), name, category, required_doses                                               |
                      +---------------------------------------------------------------------------------------+
                                     | 1                                      | 1
                                     v M                                      v M
                      +--------------------+                           +--------------------+
                      | VACCINE_SCHEDULES  |                           | VACCINE_INVENTORY  |
                      |--------------------|                           |--------------------|
                      | id (PK)            |                           | id (PK)            |
                      | vaccine_id (FK)    |                           | vaccine_id (FK)    |
                      | recommended_age    |                           | batch_number       |
                      +--------------------+                           | quantity, expiry   |
                                                                       +--------------------+
                                                                                  | 1
                                                                                  v M
                                                                       +--------------------+
                                                                       | INVENTORY_TRANS    |
                                                                       |--------------------|
                                                                       | id (PK)            |
                                                                       | vaccine_id (FK)    |
                                                                       | vacc_inventory_id  |
                                                                       | user_id (FK)       |
                                                                       | patient_id (FK)    |
                                                                       | record_id (FK)     |
                                                                       | trans_type, amount |
                                                                       +--------------------+
```
