# System Route & Endpoint Catalog

This catalog documents the web routes, HTTP endpoint interfaces, and scheduled background daemons in the Barangay Bugo Immunization Management System.

---

## 1. Authentication & Security Routes

| Method | URI | Route Name | Action / Controller | Middleware | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | `home` | Closure | None | Redirects authenticated users by role; guests to `/login`. |
| `GET` | `/login` | `login` | `AuthenticatedSessionController@create` | `guest` | Renders unified login screen for clinic staff and guardians. |
| `POST` | `/login` | `login.store` | `AuthenticatedSessionController@store` | `guest` | Authenticates credentials and redirects to role dashboard. |
| `POST` | `/logout` | `logout` | `AuthenticatedSessionController@destroy` | `auth` | Invalidates session and redirects user to `/login`. |
| `GET` | `/change-temporary-password` | `password.first-change` | `FirstLoginPasswordController@edit` | `auth` | Enforces mandatory password change for temporary accounts. |
| `POST` | `/change-temporary-password` | `password.first-change.update`| `FirstLoginPasswordController@update` | `auth` | Stores permanent password and clears `must_change_password`. |
| `GET` | `/forgot-password` | `password.request` | `PasswordResetRequestController@create` | `guest` | Renders guardian reset request submission form. |
| `POST` | `/forgot-password` | `password.email` | `PasswordResetRequestController@store` | `guest` | Submits reset request to admin queue (enforces 1 pending). |

---

## 2. Staff Management Routes (Admin Only)

| Method | URI | Route Name | Action / Controller | Middleware | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/staff` | `staff.index` | `StaffController@index` | `auth`, `role:admin` | Lists all health center staff accounts. |
| `GET` | `/staff/create` | `staff.create` | Inertia Closure | `auth`, `role:admin` | Registration form for new nurse/midwife/BHW. |
| `POST` | `/staff` | `staff.store` | `StaffController@store` | `auth`, `role:admin` | Stores new staff user with temporary credentials. |
| `GET` | `/staff/{user}` | `staff.show` | `StaffController@show` | `auth`, `role:admin` | Displays staff profile and clinical activity. |
| `GET` | `/staff/{user}/edit` | `staff.edit` | `StaffController@edit` | `auth`, `role:admin` | Edit form for staff information and role. |
| `PUT` | `/staff/{user}` | `staff.update` | `StaffController@update` | `auth`, `role:admin` | Updates staff user details. |
| `PUT` | `/staff/{user}/status` | `staff.toggle-status` | `StaffController@toggleStatus` | `auth`, `role:admin` | Activates or deactivates staff account. |
| `POST` | `/staff/{user}/reset-password` | `staff.reset-password` | `StaffController@resetPassword` | `auth`, `role:admin` | Admin direct password reset for staff. |
| `GET` | `/admin/password-reset-requests` | `admin.password-reset-requests.index` | `AdminPasswordResetRequestController@index` | `auth`, `role:admin` | Lists pending guardian password reset requests. |
| `POST` | `/admin/password-reset-requests/{request}/resolve` | `admin.password-reset-requests.resolve` | `AdminPasswordResetRequestController@resolve` | `auth`, `role:admin` | Resolves reset request and issues temporary password. |

---

## 3. Guardian & Family Management Routes

| Method | URI | Route Name | Action / Controller | Middleware | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/guardians` | `guardians.index` | `GuardianController@index` | `auth` | Lists registered guardians and family units. |
| `GET` | `/guardians/create` | `guardians.create` | `GuardianController@create` | `auth` | Form to register a new family guardian profile. |
| `POST` | `/guardians` | `guardians.store` | `GuardianController@store` | `auth` | Creates new guardian record and auto-generates `GRD-YYYY-XXXX`. |
| `GET` | `/guardians/{guardian}` | `guardians.show` | `GuardianController@show` | `auth` | View guardian profile and dependent children. |
| `GET` | `/guardians/{guardian}/edit`| `guardians.edit` | `GuardianController@edit` | `auth` | Edit guardian contact & family details. |
| `PUT` | `/guardians/{guardian}` | `guardians.update` | `GuardianController@update` | `auth` | Updates guardian information. |
| `POST` | `/guardians/{guardian}/portal/activate` | `guardians.portal.activate` | `GuardianAccessController@activate` | `auth`, `role:admin,nurse,midwife,bhw` | Provisions portal credentials with temporary password. |
| `POST` | `/guardians/{guardian}/portal/reset-password` | `guardians.portal.reset-password` | `GuardianAccessController@resetTemporaryPassword` | `auth`, `role:admin,nurse,midwife,bhw` | Generates new temporary password for guardian. |
| `PATCH`| `/guardians/{guardian}/portal/disable` | `guardians.portal.disable` | `GuardianAccessController@disable` | `auth`, `role:admin,nurse,midwife,bhw` | Revokes portal access. |

---

## 4. Patient (Pediatric) Management Routes

| Method | URI | Route Name | Action / Controller | Middleware | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/patients` | `patients.index` | `PatientController@index` | `auth` | Searchable patient directory with age/sex filters. |
| `GET` | `/guardians/{guardian}/patients/create` | `guardians.patients.create` | `PatientController@createForGuardian` | `auth` | Registration form for child under specific guardian. |
| `POST` | `/guardians/{guardian}/patients` | `guardians.patients.store` | `PatientController@storeForGuardian` | `auth` | Saves child (`PT-XXXXXX`), generates QR & schedules. |
| `GET` | `/patients/{patient}` | `patients.show` | `PatientController@show` | `auth` | Patient Workspace (clinical records, schedules, card).|
| `GET` | `/patients/{patient}/edit`| `patients.edit` | `PatientController@edit` | `auth` | Edit child birth, anthropometric, and medical data. |
| `PUT` | `/patients/{patient}` | `patients.update` | `PatientController@update` | `auth` | Updates patient information. |
| `PUT` | `/patients/{patient}/status` | `patients.toggle-status` | `PatientController@toggleStatus` | `auth` | Toggles patient Active/Inactive status. |
| `POST` | `/patients/{patient}/optional-vaccines` | `patients.optional-vaccines.assign` | `PatientController@assignOptionalVaccine` | `auth` | Assigns optional vaccine series to patient. |
| `DELETE`| `/patients/{patient}/optional-vaccines/{vaccine}` | `patients.optional-vaccines.remove` | `PatientController@removeOptionalVaccine` | `auth` | Removes optional vaccine assignment. |
| `POST` | `/patients/{patient}/immunization-records` | `immunization-records.store` | `ImmunizationRecordController@store` | `auth` | Manual entry of historical or transferred doses. |
| `PUT` | `/patients/{patient}/immunization-records/{record}`| `immunization-records.update` | `ImmunizationRecordController@update` | `auth` | Updates administered record details. |
| `POST` | `/patients/{patient}/immunization-card-rows` | `patients.immunization-card-rows.store` | `PatientImmunizationCardRowController@store` | `auth` | Adds custom line item to digital Bakuna card. |
| `PUT` | `/patients/{patient}/immunization-card-rows/{cardRow}` | `patients.immunization-card-rows.update` | `PatientImmunizationCardRowController@update` | `auth` | Updates custom card row. |
| `DELETE`| `/patients/{patient}/immunization-card-rows/{cardRow}` | `patients.immunization-card-rows.destroy`| `PatientImmunizationCardRowController@destroy`| `auth` | Removes custom card row. |

---

## 5. Vaccine Inventory & Cold Chain Routes

| Method | URI | Route Name | Action / Controller | Middleware | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/vaccines` | `vaccine.index` | `VaccineController@index` | `auth` | Master vaccine catalog and required dose definitions. |
| `POST` | `/vaccines` | `vaccine.store` | `VaccineController@store` | `auth` | Registers new vaccine in master catalog. |
| `GET` | `/vaccines/{vaccine}/edit` | `vaccine.edit` | `VaccineController@edit` | `auth` | Edit form for vaccine master specifications. |
| `PUT` | `/vaccines/{vaccine}` | `vaccine.update` | `VaccineController@update` | `auth` | Updates vaccine specifications. |
| `GET` | `/vaccine-inventory` | `vaccine-inventory.index` | `VaccineInventoryController@index` | `auth` | Cold chain inventory overview, lots, and stock levels. |
| `GET` | `/vaccine-inventory/create`| `vaccine-inventory.create` | `VaccineInventoryController@create` | `auth` | Form to receive incoming vaccine shipment. |
| `POST` | `/vaccine-inventory` | `vaccine-inventory.store` | `VaccineInventoryController@store` | `auth` | Saves received batch and appends transaction ledger. |
| `GET` | `/vaccine-inventory/{vaccineInventory}/edit` | `vaccine-inventory.edit` | `VaccineInventoryController@edit` | `auth` | Edits batch parameters. |
| `PUT` | `/vaccine-inventory/{vaccineInventory}` | `vaccine-inventory.update` | `VaccineInventoryController@update` | `auth` | Updates batch parameters. |
| `PUT` | `/vaccine-inventory/{vaccineInventory}/archive` | `vaccine-inventory.archive` | `VaccineInventoryController@archive` | `auth` | Archives expired, damaged, or depleted lot. |
| `GET` | `/vaccine-inventory/archived` | `vaccine-inventory.archived` | `VaccineInventoryController@archived` | `auth` | Filterable view of archived lots with audit reasons. |
| `GET` | `/vaccine-inventory/transactions` | `vaccine-inventory.transactions` | `VaccineInventoryController@transactions` | `auth` | Complete immutable transaction audit ledger. |
| `POST` | `/vaccine-inventory/{vaccineInventory}/adjust-stock` | `vaccine-inventory.adjust-stock` | `VaccineInventoryController@adjustStock` | `auth` | Adjusts stock (received, wastage, spoilage, correction). |
| `DELETE`| `/vaccine-inventory/{vaccineInventory}` | `vaccine-inventory.destroy` | `VaccineInventoryController@destroy` | `auth` | Soft-deletes unreferenced batch. |

---

## 6. Immunization Clinical Tracking & Reporting Routes

| Method | URI | Route Name | Action / Controller | Middleware | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/immunization` | `immunization.index` | `ImmunizationController@index` | `auth` | Immunization clinical overview, queue, and reports hub. |
| `POST` | `/immunization/patients/{patient}/administer` | `immunization.administer` | `ImmunizationController@administer` | `auth` | Single-click administration (records shot & decrements lot). |
| `POST` | `/immunization/patients/{patient}/reschedule` | `immunization.patients.reschedule` | `ImmunizationController@reschedule` | `auth` | Manually adjusts suggested next visit date. |
| `POST` | `/immunization/schedules/{schedule}/send-reminder` | `immunization.schedules.send-reminder` | `ImmunizationReminderController@sendScheduleReminder` | `auth` | Dispatches visit reminder for specific schedule. |
| `POST` | `/immunization/patients/{patient}/send-reminder` | `immunization.patients.send-reminder` | `ImmunizationReminderController@sendPatientReminder` | `auth` | Dispatches single next-visit reminder for child. |
| `POST` | `/immunization/reminders/send-bulk` | `immunization.reminders.send-bulk` | `ImmunizationReminderController@sendBulkReminders` | `auth` | Dispatches visit reminders to all currently due patients. |
| `GET` | `/immunization/modules` | `immunization.modules` | Inertia Closure | `auth` | Feature documentation & module overview screen. |
| `GET` | `/immunization/reports/coverage/pdf` | `immunization.reports.coverage.pdf` | `ImmunizationReportController@exportCoveragePdf` | `auth` | Downloads Vaccine Coverage Report as Landscape A4 PDF. |
| `GET` | `/immunization/reports/coverage/csv` | `immunization.reports.coverage.csv` | `ImmunizationReportController@exportCoverageCsv` | `auth` | Downloads Vaccine Coverage Report as UTF-8 BOM CSV. |
| `GET` | `/immunization/reports/schedule-status/pdf` | `immunization.reports.schedule-status.pdf` | `ImmunizationReportController@exportScheduleStatusPdf` | `auth` | Downloads Immunization Schedule Status Report as PDF. |
| `GET` | `/immunization/reports/schedule-status/csv` | `immunization.reports.schedule-status.csv` | `ImmunizationReportController@exportScheduleStatusCsv` | `auth` | Downloads Immunization Schedule Status Report as CSV. |
| `POST` | `/immunization/reports/schedule-status/sync` | `immunization.reports.schedule-status.sync` | `ImmunizationReportController@syncScheduleStatuses` | `auth` | Synchronizes pending schedules to 'overdue' or 'upcoming'.|
| `POST` | `/immunization/reports/schedule-status/{schedule}/update` | `immunization.reports.schedule-status.update` | `ImmunizationReportController@updateScheduleStatus` | `auth` | Updates individual schedule status ('overdue'/'upcoming'). |

---

## 7. Guardian Mobile Portal Routes

| Method | URI | Route Name | Action / Controller | Middleware | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/guardian/dashboard` | `guardian.dashboard` | `GuardianPortalController@dashboard` | `auth`, `role:guardian` | Mobile-ready portal showing all children & due dates. |
| `GET` | `/guardian/children` | `guardian.children.index` | `GuardianPortalController@childrenIndex` | `auth`, `role:guardian` | Lists guardian's registered children with status badges. |
| `GET` | `/guardian/children/{patient}` | `guardian.children.show` | `GuardianPortalController@showChild` | `auth`, `role:guardian` | View individual child's full card, next visit & QR pass.|
| `GET` | `/guardian/visits` | `guardian.visits.index` | `GuardianPortalController@visitsIndex` | `auth`, `role:guardian` | Timeline of past visits and future scheduled clinic dates. |

---

## 8. In-App Notification Center Routes

| Method | URI | Route Name | Action / Controller | Middleware | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `PATCH`| `/notifications/{notification}/read` | `notifications.read` | `NotificationController@markAsRead` | `auth` | Marks specific notification as read. |
| `PATCH`| `/notifications/read-all` | `notifications.read-all` | `NotificationController@markAllAsRead` | `auth` | Marks all active notifications as read. |
| `DELETE`| `/notifications/{notification}` | `notifications.destroy` | `NotificationController@destroy` | `auth` | Deletes a notification item. |
| `DELETE`| `/notifications` | `notifications.destroy-all` | `NotificationController@destroyAll` | `auth` | Clears all notifications for the user. |

---

## 9. Automated Artisan Background Daemons & Scheduled Tasks

| Schedule | Command Name | Purpose | Target Subsystem |
| :--- | :--- | :--- | :--- |
| **Daily 05:55 AM** | `inventory:auto-archive` | Retires expired and depleted (0-stock) batches; appends audit transaction ledger; notifies staff. | Cold Chain & Inventory |
| **Daily 06:00 AM** | `generate-vaccine-schedules` | Reconciles vaccination schedules against child birth milestones and live vaccine inventory. | Scheduling Engine |
| **Daily 06:10 AM** | `inventory:check-alerts` | Scans cold chain for Low Stock (<= 15 doses), Stockouts, and Near Expiry (<= 30 days). | Notifications & Alerts |
| **Weekly Mon 08:00 AM** | `visits:send-reminders` | Dispatches single consolidated next-visit reminder per child, overwriting previous reminders. | Reminder Engine |
