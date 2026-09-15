# System Architecture Document

**System**: Barangay Bugo Immunization Management System  
**Pattern**: Modern Monolithic Single Page Application (Laravel + Inertia.js + React)  

---

## 1. Architectural Overview

The system uses a **Monolithic Single-Page Application (SPA)** architecture powered by [Inertia.js](https://inertiajs.com/). Unlike traditional decoupled architectures requiring complex REST API serialization and duplicate routing definitions, Inertia connects Laravel's server-side controllers and routing directly to React component views.

```
+-------------------------------------------------------------+
|                     Client Browser                          |
|  [ React 19 SPA + Vite 6 + Tailwind CSS + Lucide Icons ]    |
+------------------------------+------------------------------+
                               | (JSON Page Props & HTML)
                               v
+-------------------------------------------------------------+
|                    Laravel Backend Core                     |
|                                                             |
|  +---------------------+        +------------------------+  |
|  |   Routing & RBAC    | -----> |      Controllers       |  |
|  |  Middleware Filters |        | (Inertia::render/JSON) |  |
|  +---------------------+        +-----------+------------+  |
|                                             |               |
|                                             v               |
|                                 +------------------------+  |
|                                 |    Domain Services     |  |
|                                 |  - SchedulingPriority  |  |
|                                 |  - ImmunizationSchedule|  |
|                                 +-----------+------------+  |
|                                             |               |
|                                             v               |
|                                 +------------------------+  |
|                                 |   Eloquent ORM Models  |  |
|                                 +-----------+------------+  |
+---------------------------------------------+---------------+
                                              | (MySQL Driver)
                                              v
+-------------------------------------------------------------+
|                      Database Tier                          |
|             MySQL / MariaDB (`bugo_immunization`)           |
+-------------------------------------------------------------+
```

---

## 2. Layered Responsibilities

### 2.1 Presentation Tier (Frontend)
* **Location**: `resources/js/`
* **Technologies**: React 19, TypeScript, Inertia React adapter, Tailwind CSS v4, Radix UI.
* **Component Breakdown**:
  * `pages/`: Page-level Inertia components mapped directly to backend controller actions (e.g. `patient/index.tsx`, `guardian/dashboard.tsx`).
  * `components/`: Reusable UI elements (modals, buttons, QR scanner, data tables).
  * `layouts/`: Master wrappers providing navigation bars, breadcrumbs, sidebar menus, and flash toast alerts (`app-layout.tsx`, `auth-layout.tsx`).
  * `hooks/`: Custom React hooks for responsive design and reactive states.
  * `types/`: Strongly typed TypeScript contracts for patients, vaccines, inventory, and users.

### 2.2 Application & Business Logic Tier (Backend)
* **Location**: `app/`
* **Technologies**: Laravel 11/12, PHP 8.2+.
* **Components**:
  * **Controllers (`app/Http/Controllers/`)**: Handle HTTP requests, input validation, and render Inertia views with scoped datasets.
  * **Domain Services (`app/Services/`)**:
    * `VaccineSchedulingPriorityService`: Computes vaccine eligibility based on birth date, dose requirements, and stock inventory.
    * `PatientImmunizationScheduleService`: Generates milestones and appointment records per patient.
  * **Middleware (`app/Http/Middleware/`)**: Role-based access control (`RoleMiddleware`), first-login temporary password enforcement (`EnsurePasswordIsChanged`), and session persistence.
  * **Eloquent Models (`app/Models/`)**: Data entities containing relationship definitions, attribute casts, and query scopes.

### 2.3 Data Storage Tier (Database)
* **Location**: `database/`
* **Engines**: MySQL (production & local runtime), SQLite (automated in-memory testing).
* **Components**:
  * `database/migrations/`: Immutable chronological database schema migrations.
  * `database/seeders/`: Default seeders for roles (`admin`, `nurse`, `midwife`, `bhw`, `guardian`), default administrators, and childhood vaccine regimens.
  * `database/schemas/`: Standalone SQL database dumps and data reference dictionaries.

---

## 3. Key Design Decisions

1. **Inertia.js over Decoupled REST/GraphQL**:
   * Eliminates the need for client-side state duplicate stores (such as Redux) and authentication token storage in `localStorage`.
   * Sessions, CSRF, and routing remain server-guarded, enhancing security.
2. **First-Expired, First-Out (FEFO) Inventory Allocation**:
   * When scheduling vaccines or administering doses, the inventory service automatically sorts available lots by earliest `expiration_date`.
3. **Unified Account Hierarchy with Cascading Integrity**:
   * Staff accounts are standalone `users`.
   * Guardian accounts link 1:1 between `users` and `guardians`.
   * Patient records (children) belong to `guardians` without requiring their own login credentials.
   * Deleting a guardian safely cascades to their child records and clinical rows, preventing orphaned healthcare records.
