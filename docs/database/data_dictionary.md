# Database Data Dictionary

**Database Name**: `bugo_immunization`  
**Collation**: `utf8mb4_unicode_ci`  
**Database Engine**: InnoDB (MySQL / MariaDB)  

---

## 1. Table Summary

| Table Name | Description |
| :--- | :--- |
| `users` | User accounts for administrators, healthcare staff, and guardians. |
| `roles` | System roles (`admin`, `nurse`, `midwife`, `bhw`, `guardian`). |
| `guardians` | Parent / legal guardian profile records. |
| `patients` | Infant / pediatric patient profiles. |
| `vaccines` | Catalog of vaccines, required dose counts, and categories. |
| `vaccine_schedules` | Standard age milestones and interval guidelines per vaccine dose. |
| `vaccine_inventories` | Batches/lots received, stock quantities, and expiration dates. |
| `patient_vaccines` | Optional vaccines assigned to specific patients. |
| `patient_vaccine_schedules` | Scheduled vaccination appointments computed for patients. |
| `immunization_records` | Historical dose administration events. |
| `patient_immunization_card_rows`| Line items printed or displayed on the physical immunization card. |
| `notifications` | In-app alerts and appointment reminders. |
| `password_reset_requests` | Staff-assisted password recovery requests submitted by guardians. |

---

## 2. Table Specifications

### 2.1 `roles`
Stores access control roles.
* `id` (bigint unsigned, PK, auto-increment)
* `name` (varchar(255), unique): System slug (`admin`, `nurse`, `midwife`, `bhw`, `guardian`).
* `display_name` (varchar(255)): Human-readable title.
* `created_at`, `updated_at` (timestamp, nullable)

### 2.2 `users`
Stores login credentials and account state.
* `id` (bigint unsigned, PK, auto-increment)
* `role_id` (bigint unsigned, FK -> `roles.id`, nullable, on delete restrict)
* `name` (varchar(255)): Full name.
* `email` (varchar(255), unique): Login email address.
* `password` (varchar(255)): Bcrypt-hashed password.
* `role` (varchar(255), nullable): Legacy role string compatibility.
* `status` (varchar(255), nullable): Account status (`active`, `inactive`).
* `account_status` (varchar(255), default: `'active'`): Status state (`active`, `temporary`, `unclaimed`).
* `must_change_password` (tinyint(1), default: `0`): Flag enforcing password change on first login.
* `remember_token` (varchar(100), nullable)
* `created_at`, `updated_at` (timestamp, nullable)

### 2.3 `guardians`
Stores parent / guardian household profiles.
* `id` (bigint unsigned, PK, auto-increment)
* `user_id` (bigint unsigned, FK -> `users.id`, nullable, on delete cascade)
* `guardian_no` (varchar(255), unique): Formatted identifier (`GRD-YYYY-XXXX`).
* `name` (varchar(255)): Guardian full name.
* `gender` (varchar(50), nullable): Sex / gender of the guardian.
* `email` (varchar(255), nullable): Contact/notification email.
* `contact_number` (varchar(255), nullable): Mobile/telephone number.
* `mother_maiden_name` (varchar(255), nullable)
* `father_name` (varchar(255), nullable)
* `mother_information_unavailable` (tinyint(1), default: `0`)
* `father_information_unavailable` (tinyint(1), default: `0`)
* `status` (varchar(255), default: `'active'`)
* `created_at`, `updated_at` (timestamp, nullable)

### 2.4 `patients`
Stores pediatric patient health and birth records.
* `id` (bigint unsigned, PK, auto-increment)
* `guardian_id` (bigint unsigned, FK -> `guardians.id`, nullable, on delete cascade)
* `patient_id` (varchar(255), unique): Formatted identifier (`PT-XXXXXX`).
* `first_name` (varchar(255)): Patient given name.
* `middle_name` (varchar(255), nullable)
* `last_name` (varchar(255)): Patient surname.
* `nickname` (varchar(255), nullable)
* `date_of_birth` (date): Patient birth date.
* `sex` (enum: `'Male'`, `'Female'`): Biological sex.
* `address` (text): Residential barangay address.
* `guardian_relationship` (varchar(255), nullable): Relationship to guardian (`Mother`, `Father`, `Aunt`, etc.).
* `mother_name` (varchar(255), nullable)
* `father_name` (varchar(255), nullable)
* `birth_type` (varchar(100), nullable): Single, Twin, etc.
* `is_full_term` (tinyint(1), nullable): Gestational maturity flag.
* `multiple_birth` (varchar(100), nullable)
* `birth_attendant` (varchar(255), nullable): Physician, Nurse, Midwife, Traditional.
* `blood_type` (varchar(10), nullable): ABO/Rh blood group.
* `birth_weight` (decimal(8,2), nullable): Birth weight in kilograms.
* `birth_length` (decimal(8,2), nullable): Birth length in centimeters.
* `head_circumference` (decimal(8,2), nullable): Head circumference in centimeters.
* `chest_circumference` (decimal(8,2), nullable): Chest circumference in centimeters.
* `birth_order` (int, nullable): Birth order rank in family.
* `birth_registration_date` (date, nullable)
* `birth_registration_place` (varchar(255), nullable)
* `birth_family_notes` (text, nullable)
* `medical_background` (text, nullable)
* `allergies` (text, nullable)
* `existing_conditions` (text, nullable)
* `status` (varchar(255), default: `'Active'`): Active/Inactive flag.
* `created_at`, `updated_at` (timestamp, nullable)

### 2.5 `vaccines`
Vaccine master dictionary.
* `id` (bigint unsigned, PK, auto-increment)
* `name` (varchar(255)): Vaccine name (e.g. `BCG`, `Pentavalent`).
* `description` (text, nullable): Indication and medical notes.
* `category` (enum: `'routine'`, `'optional'`, default: `'routine'`)
* `required_doses` (int, default: `1`): Number of doses required for full immunization.
* `created_at`, `updated_at` (timestamp, nullable)

### 2.6 `vaccine_inventories`
Batch-specific inventory stock.
* `id` (bigint unsigned, PK, auto-increment)
* `vaccine_id` (bigint unsigned, FK -> `vaccines.id`, on delete cascade)
* `batch_number` (varchar(255), unique): Lot/batch number.
* `quantity` (int): Number of currently available doses.
* `date_received` (date): Intake date.
* `expiration_date` (date): Expiry date used for FEFO prioritization.
* `manufacturer` (varchar(255), nullable)
* `supplier` (varchar(255), nullable)
* `remarks` (text, nullable)
* `is_archived` (tinyint(1), default: `0`): Archival state.
* `archived_at` (timestamp, nullable)
* `archive_reason` (varchar(255), nullable): Expired, Damaged, Recall, Depleted.
* `created_at`, `updated_at` (timestamp, nullable)

### 2.7 `immunization_records`
Clinical administration history.
* `id` (bigint unsigned, PK, auto-increment)
* `patient_id` (bigint unsigned, FK -> `patients.id`, on delete cascade)
* `vaccine_id` (bigint unsigned, FK -> `vaccines.id`, on delete cascade)
* `dose_number` (int): Dose sequence (1, 2, 3...).
* `administered_date` (date): Date of shot.
* `administered_by` (varchar(255)): Health worker name / ID.
* `batch_number` (varchar(255), nullable): Administered batch number.
* `remarks` (text, nullable)
* `created_at`, `updated_at` (timestamp, nullable)

### 2.8 `password_reset_requests`
Guardian recovery queue.
* `id` (bigint unsigned, PK, auto-increment)
* `user_id` (bigint unsigned, FK -> `users.id`, on delete cascade)
* `status` (enum: `'pending'`, `'approved'`, `'rejected'`, default: `'pending'`)
* `requested_at` (timestamp)
* `processed_at` (timestamp, nullable)
* `processed_by` (bigint unsigned, FK -> `users.id`, nullable)
* `notes` (text, nullable)
* `created_at`, `updated_at` (timestamp, nullable)
