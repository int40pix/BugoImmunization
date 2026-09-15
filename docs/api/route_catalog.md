# System Route & Endpoint Catalog

This catalog documents the web routes and endpoint interfaces in the Barangay Bugo Immunization Management System.

---

## 1. Authentication & Security Routes

| Method | URI | Route Name | Action / Controller | Middleware | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/login` | `login` | `AuthenticatedSessionController@create` | `guest` | Renders unified login screen for staff and guardians. |
| `POST` | `/login` | `login.store` | `AuthenticatedSessionController@store` | `guest` | Authenticates user credentials and redirects by role. |
| `POST` | `/logout` | `logout` | `AuthenticatedSessionController@destroy` | `auth` | Invalidates session and logs out user to `/login`. |
| `GET` | `/change-temporary-password` | `password.first-change` | `FirstLoginPasswordController@edit` | `auth` | Forces initial password update for temporary accounts. |
| `POST` | `/change-temporary-password` | `password.first-change.update`| `FirstLoginPasswordController@update` | `auth` | Saves permanent password. |
| `GET` | `/forgot-password` | `password.request` | `PasswordResetRequestController@create` | `guest` | Renders guardian reset request submission form. |
| `POST` | `/forgot-password` | `password.email` | `PasswordResetRequestController@store` | `guest` | Submits reset request to admin queue. |

---

## 2. Staff Management Routes (Admin Only)

| Method | URI | Route Name | Action / Controller | Middleware | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/staff` | `staff.index` | `StaffController@index` | `auth`, `role:admin` | Lists all health center staff accounts. |
| `GET` | `/staff/create` | `staff.create` | Inertia Closure | `auth`, `role:admin` | Registration form for new nurse/midwife/BHW. |
| `POST` | `/staff` | `staff.store` | `StaffController@store` | `auth`, `role:admin` | Stores new staff user with temporary credentials. |
| `GET` | `/staff/{user}` | `staff.show` | `StaffController@show` | `auth`, `role:admin` | Displays staff profile and activity. |
| `GET` | `/staff/{user}/edit` | `staff.edit` | `StaffController@edit` | `auth`, `role:admin` | Edit form for staff information and role. |
| `PUT` | `/staff/{user}` | `staff.update` | `StaffController@update` | `auth`, `role:admin` | Updates staff user details. |
| `PUT` | `/staff/{user}/status` | `staff.toggle-status` | `StaffController@toggleStatus` | `auth`, `role:admin` | Activates or deactivates staff account. |

---

## 3. Guardian & Family Management Routes

| Method | URI | Route Name | Action / Controller | Middleware | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/guardians` | `guardians.index` | `GuardianController@index` | `auth` | Lists registered guardians and family units. |
| `GET` | `/guardians/create` | `guardians.create` | `GuardianController@create` | `auth` | Form to register a new family guardian. |
| `POST` | `/guardians` | `guardians.store` | `GuardianController@store` | `auth` | Creates new guardian record and auto-generates ID. |
| `GET` | `/guardians/{guardian}` | `guardians.show` | `GuardianController@show` | `auth` | View guardian profile and dependent children. |
| `GET` | `/guardians/{guardian}/edit`| `guardians.edit` | `GuardianController@edit` | `auth` | Edit guardian contact & family details. |
| `PUT` | `/guardians/{guardian}` | `guardians.update` | `GuardianController@update` | `auth` | Updates guardian information. |
| `POST` | `/guardians/{guardian}/portal/activate` | `guardians.portal.activate` | `GuardianAccessController@activate` | `auth` | Provisions portal login credentials for guardian. |
| `PATCH`| `/guardians/{guardian}/portal/disable` | `guardians.portal.disable` | `GuardianAccessController@disable` | `auth` | Revokes portal access. |

---

## 4. Patient (Pediatric) Management Routes

| Method | URI | Route Name | Action / Controller | Middleware | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/patients` | `patients.index` | `PatientController@index` | `auth` | Searchable patient directory with age/sex filters. |
| `GET` | `/guardians/{guardian}/patients/create` | `guardians.patients.create` | `PatientController@createForGuardian` | `auth` | Form to register a child under specific guardian. |
| `POST` | `/guardians/{guardian}/patients` | `guardians.patients.store` | `PatientController@storeForGuardian` | `auth` | Saves child, triggers scheduling engine. |
| `GET` | `/patients/{patient}` | `patients.show` | `PatientController@show` | `auth` | Patient Clinical Workspace (records, schedules, card).|
| `GET` | `/patients/{patient}/edit`| `patients.edit` | `PatientController@edit` | `auth` | Edit child birth, physical, and medical data. |
| `PUT` | `/patients/{patient}` | `patients.update` | `PatientController@update` | `auth` | Updates patient information. |
| `PUT` | `/patients/{patient}/status` | `patients.toggle-status` | `PatientController@toggleStatus` | `auth` | Toggles patient Active/Inactive status. |
| `POST` | `/patients/{patient}/optional-vaccines` | `patients.optional-vaccines.assign` | `PatientController@assignOptionalVaccine` | `auth` | Assigns an optional vaccine series to patient. |
| `DELETE`| `/patients/{patient}/optional-vaccines/{vaccine}` | `patients.optional-vaccines.remove` | `PatientController@removeOptionalVaccine` | `auth` | Removes optional vaccine assignment. |

---

## 5. Immunization Clinical Recording Routes

| Method | URI | Route Name | Action / Controller | Middleware | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/immunization` | `immunization.index` | `ImmunizationController@index` | `auth` | Immunization clinical overview and dashboard. |
| `POST` | `/immunization/patients/{patient}/administer` | `immunization.administer` | `ImmunizationController@administer` | `auth` | Records administered dose, decrements lot inventory. |
| `POST` | `/patients/{patient}/immunization-records` | `immunization-records.store` | `ImmunizationRecordController@store` | `auth` | Manual entry of historical or transferred doses. |
| `PUT` | `/patients/{patient}/immunization-records/{record}`| `immunization-records.update` | `ImmunizationRecordController@update` | `auth` | Updates administered record. |
| `POST` | `/patients/{patient}/immunization-card-rows` | `patients.immunization-card-rows.store` | `PatientImmunizationCardRowController@store` | `auth` | Adds custom row to immunization card. |
| `DELETE`| `/patients/{patient}/immunization-card-rows/{cardRow}` | `patients.immunization-card-rows.destroy`| `PatientImmunizationCardRowController@destroy`| `auth` | Removes custom card row. |

---

## 6. Vaccine & Inventory Routes

| Method | URI | Route Name | Action / Controller | Middleware | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/vaccines` | `vaccine.index` | `VaccineController@index` | `auth` | Master vaccine catalog. |
| `POST` | `/vaccines` | `vaccine.store` | `VaccineController@store` | `auth` | Registers new vaccine in catalog. |
| `PUT` | `/vaccines/{vaccine}` | `vaccine.update` | `VaccineController@update` | `auth` | Updates vaccine specifications. |
| `GET` | `/vaccine-inventory` | `vaccine-inventory.index` | `VaccineInventoryController@index` | `auth` | Batch inventory overview and stock levels. |
| `GET` | `/vaccine-inventory/create`| `vaccine-inventory.create` | `VaccineInventoryController@create` | `auth` | Form to receive incoming vaccine shipment. |
| `POST` | `/vaccine-inventory` | `vaccine-inventory.store` | `VaccineInventoryController@store` | `auth` | Saves received batch and logs stock-in. |
| `PUT` | `/vaccine-inventory/{vaccineInventory}` | `vaccine-inventory.update` | `VaccineInventoryController@update` | `auth` | Edits batch parameters. |
| `PUT` | `/vaccine-inventory/{vaccineInventory}/archive` | `vaccine-inventory.archive` | `VaccineInventoryController@archive` | `auth` | Archives expired, damaged, or depleted lot. |
| `GET` | `/vaccine-inventory/archived` | `vaccine-inventory.archived` | `VaccineInventoryController@archived` | `auth` | Filterable view of archived lots. |

---

## 7. Guardian Portal (Parent Access)

| Method | URI | Route Name | Action / Controller | Middleware | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/guardian/dashboard` | `guardian.dashboard` | `GuardianPortalController@dashboard` | `auth`, `role:guardian` | Mobile-ready portal showing all children & due dates. |
| `GET` | `/guardian/children/{patient}` | `guardian.children.show` | `GuardianPortalController@showChild` | `auth`, `role:guardian` | View individual child's full card & upcoming shots. |
