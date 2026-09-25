# System Conceptual Framework, DFDs, ERD & Clinical Workflows

## Web-Based Pediatric Immunization Tracking, Vaccine Inventory Management, and Automated Reminder Notification System with QR Code-Enabled Patient Record Management

* **System Identifier**: Barangay Bugo Immunization Management System (`Bugo`)  
* **Methodology**: Waterfall Model System Design Phase (Ardiansyah et al., 2022)  
* **Design & Diagramming Tool**: draw.io Architectural Modeling (JGraph Ltd, 2020)  
* **Beneficiary**: Barangay Bugo Health Center, Cagayan de Oro City, Misamis Oriental  

---

## 1. Conceptual Framework (IPO Model - Manuscript Figure 1.0)

```mermaid
flowchart LR
    subgraph INPUT["INPUT"]
        I1["Patient Demographics<br/>(Name, DOB, Birth Vitals, Purok)"]
        I2["EPI Immunization Guidelines<br/>(DOH Milestone Intervals & Doses)"]
        I3["Staff Credentials & Roles<br/>(Admin, Nurse, Midwife, BHW)"]
        I4["Vaccine Batch & Inventory Data<br/>(Lot Numbers, Expiration, Quantities)"]
        I5["Report Filter Criteria<br/>(Date Range, Vaccine Biologic, Dose)"]
    end

    subgraph PROCESS["PROCESS"]
        P1["1.0 User Authentication & RBAC Access Control"]
        P2["2.0 Patient & Guardian Profiling with QR Generation"]
        P3["3.0 Vaccine Inventory Management (FEFO & Audit Ledger)"]
        P4["4.0 Immunization Scheduling & Next-Visit Engine"]
        P5["5.0 Clinical Vaccine Administration & Dose Deduction"]
        P6["6.0 Automated Reminders & Alert Notification Engine"]
        P7["7.0 Reporting & Decision Support (Coverage & Schedule Status)"]
    end

    subgraph OUTPUT["OUTPUT"]
        O1["Patient High-Contrast QR Code & Digital Health Pass"]
        O2["Interactive Digital Child Immunization Card (Bakuna Card)"]
        O3["Vaccine Coverage Report (PDF & CSV Formats)"]
        O4["Immunization Schedule Status Report (PDF & CSV Formats)"]
        O5["Automated Weekly Monday Reminders (Single Next-Visit Alert)"]
        O6["Cold Chain Stock Alerts (Low Stock, Near Expiry, Wastage)"]
        O7["Immutable Inventory Transaction Audit Ledger"]
    end

    INPUT --> PROCESS --> OUTPUT
```

---

## 2. Research Methodology: Waterfall Model (Manuscript Figure 2.0)

```mermaid
flowchart TD
    Phase1["1. Planning and Requirement Gathering Phase<br/><i>Key Informant Interviews, TCL Inspection, DOH Guidelines, SRS Document</i>"]
    Phase2["2. System Design Phase<br/><i>draw.io Multi-Tier Architecture, ERD, Context Diagram, Level-0/1 DFDs, UI Wireframes</i>"]
    Phase3["3. Development Phase<br/><i>Client Tier: React 19 + Bootstrap 5 + Tailwind; App Tier: Laravel 12; Data Tier: MySQL</i>"]
    Phase4["4. Testing Phase<br/><i>Automated PHPUnit Tests (66 tests, 310 assertions), Cross-Browser & Android Device Verification</i>"]
    Phase5["5. Deployment Phase<br/><i>Apache Web Server Hosting, Compiled Vite Production Assets, Live MySQL Migration</i>"]
    Phase6["6. Evaluation Phase<br/><i>ISO/IEC 25010 Software Product Quality Evaluation (Functional, Usability, Security)</i>"]

    Phase1 --> Phase2
    Phase2 --> Phase3
    Phase3 --> Phase4
    Phase4 --> Phase5
    Phase5 --> Phase6
```

---

## 3. Context Diagram (System Level-0 DFD)

The Context Diagram defines the global operational boundary of the Bugo Immunization Management System, illustrating interactions with all external human and automated entities:

```mermaid
flowchart TD
    Staff["Healthcare Staff<br/>(Admin, Nurse, Midwife, BHW)"]
    Guardian["Parents / Guardians"]
    Cron["Automated System Schedulers<br/>(Daily & Weekly Cron Daemons)"]
    HealthAuth["Health Center Management & DOH<br/>(External Health Authority)"]

    System(("Bugo Immunization<br/>Management System<br/>(Process 0.0)"))

    %% Healthcare Staff Flows
    Staff -- "Staff credentials, patient intake data, birth vitals,<br/>vaccine lot stock-in, wastage/spoilage reasons,<br/>clinical dose administration, manual schedule overrides" --> System
    System -- "QR code health cards, digital Bakuna profiles,<br/>low-stock & near-expiry alerts, patient search results,<br/>inventory transaction ledger, password reset moderation queue" --> Staff

    %% Parent/Guardian Flows
    Guardian -- "Portal login credentials, password reset requests" --> System
    System -- "Mobile child Bakuna card, single next-visit appointment alert,<br/>QR health pass, real-time vaccine availability status" --> Guardian

    %% Scheduled Daemons
    Cron -- "Daily trigger (05:55 AM) Auto-archive expired/depleted lots<br/>Daily trigger (06:00 AM) Generate & reconcile schedules<br/>Daily trigger (06:10 AM) Check inventory stock alerts<br/>Weekly trigger (Mon 08:00 AM) Dispatch guardian visit reminders" --> System
    System -- "Archived batch audit logs, scheduled status updates,<br/>broadcasted notification records" --> Cron

    %% Health Authorities / Management
    System -- "Vaccine Coverage Reports (Landscape A4 PDF / UTF-8 CSV),<br/>Immunization Schedule Status Reports (Overdue/Upcoming PDF/CSV),<br/>aggregate cohort coverage analytics" --> HealthAuth
```

---

## 4. Level-1 Data Flow Diagram (DFD Level 1)

The Level-1 DFD decomposes the system into **7 major core processes** and **9 normalized data stores**:

```mermaid
flowchart TD
    %% External Entities
    Staff["Healthcare Staff<br/>(Admin, Nurse, Midwife, BHW)"]
    Guardian["Parent / Guardian"]
    Cron["System Cron Schedulers"]
    DOH["DOH / Management"]

    %% Processes
    P1["1.0 User Authentication &<br/>Account Access Control"]
    P2["2.0 Patient & Guardian<br/>Profiling & QR Generation"]
    P3["3.0 Vaccine Inventory &<br/>Batch Lifecycle Management"]
    P4["4.0 Immunization Scheduling &<br/>Next-Visit Priority Engine"]
    P5["5.0 Clinical Vaccine<br/>Administration & Recording"]
    P6["6.0 Automated Reminders &<br/>Alert Notification Engine"]
    P7["7.0 Reporting & Decision Support<br/>(Coverage & Schedule Status)"]

    %% Data Stores
    D1[("D1: users & roles")]
    D2[("D2: guardians")]
    D3[("D3: patients")]
    D4[("D4: vaccines & vaccine_schedules")]
    D5[("D5: vaccine_inventories & transactions")]
    D6[("D6: patient_vaccine_schedules & patient_vaccines")]
    D7[("D7: immunization_records & card_rows")]
    D8[("D8: notifications")]
    D9[("D9: password_reset_requests")]

    %% P1 Flows
    Staff -- "Login credentials" --> P1
    Guardian -- "Login credentials / Reset request" --> P1
    P1 <--> D1
    P1 --> D9
    P1 -- "Auth session / RBAC redirect" --> Staff
    P1 -- "Portal access / Temp password alert" --> Guardian

    %% P2 Flows
    Staff -- "Guardian details, infant birth vitals, address" --> P2
    P2 --> D2
    P2 --> D3
    P2 -- "Generate standardized PID & QR code" --> Staff
    P2 -- "Trigger schedule creation" --> P4

    %% P3 Flows
    Staff -- "Receive batch, adjust stock, log wastage/spoilage" --> P3
    Cron -- "05:55 AM auto-archive trigger" --> P3
    P3 <--> D4
    P3 <--> D5
    P3 -- "Trigger low-stock / expiry alert" --> P6
    P3 -- "Inventory ledger & balance views" --> Staff

    %% P4 Flows
    D3 --> P4
    D4 --> P4
    Cron -- "06:00 AM daily reconciliation" --> P4
    Staff -- "Manual reschedule override" --> P4
    P4 <--> D6
    P4 <--> D5
    P4 -- "Sync upcoming / overdue statuses" --> P7

    %% P5 Flows
    Staff -- "Scan QR, select due milestone, administer dose" --> P5
    P5 <--> D3
    P5 <--> D4
    P5 --> D7
    P5 -- "Deduct stock & log transaction" --> D5
    P5 -- "Mark schedule completed & compute next" --> D6
    P5 -- "Updated digital Bakuna card" --> Staff
    P5 -- "Updated record visible on mobile" --> Guardian

    %% P6 Flows
    Cron -- "Monday 08:00 AM weekly trigger" --> P6
    Staff -- "Manual send-reminder trigger" --> P6
    P3 -- "Low stock / near expiry event" --> P6
    D6 --> P6
    D2 --> P6
    P6 --> D8
    P6 -- "Single next-visit reminder notification" --> Guardian
    P6 -- "Cold chain alert notification" --> Staff

    %% P7 Flows
    Staff -- "Filter by date, vaccine, dose, or sync status" --> P7
    D3 --> P7
    D4 --> P7
    D6 --> P7
    D7 --> P7
    P7 -- "Vaccine Coverage PDF/CSV" --> Staff
    P7 -- "Schedule Status PDF/CSV" --> Staff
    P7 -- "Official DOH status submissions" --> DOH
```

### 4.1 Process Decomposition & Subsystem Descriptions

1. **Process 1.0 (User Authentication & Access Control)**:
   * Handles unified login for both clinic staff and guardians via `/login`.
   * Enforces role redirection: Admin (`/dashboard`, `/staff`), Clinic Staff (`/dashboard`, `/immunization`), Guardians (`/guardian/dashboard`).
   * Enforces temporary password changes on initial login via `password.first-change`.
   * Restricts password reset requests to a single pending request per user with real-time flash alert indicators.

2. **Process 2.0 (Patient & Guardian Profiling & QR Generation)**:
   * Registers guardians with formatted number `GRD-YYYY-XXXX`.
   * Enrolls pediatric patients under guardians with formatted ID `PT-XXXXXX` and comprehensive birth anthropometrics (weight, length, head/chest circumferences, birth attendant, gestational maturity).
   * Generates high-contrast QR code encoding the unique `patient_id` for instant camera-based retrieval.

3. **Process 3.0 (Vaccine Inventory & Batch Lifecycle Management)**:
   * Tracks vaccine lots, intake dates, manufacturer, and expiration dates.
   * Enforces First-Expired, First-Out (FEFO) batch prioritization.
   * Records balance mutations in `vaccine_inventory_transactions` (`received`, `administered`, `wastage`, `spoilage`, `adjustment`, `archived`).
   * Daily 05:55 AM daemon auto-archives expired and 0-stock batches while retaining immutable transaction histories.

4. **Process 4.0 (Immunization Scheduling & Next-Visit Priority Engine)**:
   * Dynamically calculates target vaccination dates based on child birth date and DOH EPI recommended intervals.
   * Categorizes pending schedules into `Upcoming` (within approaching window) or `Overdue` (target date passed).
   * Priority Flagging Algorithm: When inventory stock drops below critical thresholds, identifies children nearing full series completion and reserves doses.

5. **Process 5.0 (Clinical Vaccine Administration & Tracking)**:
   * Health worker scans patient QR or opens profile to inspect the interactive digital Bakuna card.
   * Single-click administration commits an ACID database transaction: creates `immunization_records`, decrements `vaccine_inventories.quantity`, appends `vaccine_inventory_transactions`, marks `patient_vaccine_schedules` as `completed`, and computes the subsequent milestone schedule.

6. **Process 6.0 (Automated Reminders & Multi-Channel Notifications)**:
   * Weekly Monday 08:00 AM daemon executes `visits:send-reminders`.
   * Groups multiple eligible vaccine doses for a child into a single, consolidated next-visit reminder.
   * Anti-bloat deduplication: Automatically purges prior visit reminders for the same child to keep guardian notification inboxes clear.
   * Generates in-app notifications with read/unread tracking and priority badges.

7. **Process 7.0 (Immunization Reporting & Analytics)**:
   * **Vaccine Coverage Report**: Computes target cohort, dose completion rates (Dose 1, Dose 2, Dose 3, Boosters, Total), and child line listings; filterable by date range (`date_from`, `date_to`), vaccine biologic, and dose.
   * **Immunization Schedule Status Report**: Outlines each child's status with days elapsed/approaching; provides a 1-click status synchronization button and row-level status updater (`overdue` vs `upcoming`).
   * Dual export engines: Landscape A4 PDFs via DomPDF and RFC-4180 CSV streams with UTF-8 Byte Order Marks (BOM).

---

## 5. Entity-Relationship Diagram (ERD) - Full 14 Tables

```mermaid
erDiagram
    ROLES ||--o{ USERS : "authorizes"
    USERS ||--o| GUARDIANS : "links to"
    USERS ||--o{ PASSWORD_RESET_REQUESTS : "submits"
    USERS ||--o{ PASSWORD_RESET_REQUESTS : "resolves"
    USERS ||--o{ VACCINE_INVENTORY_TRANSACTIONS : "performs"
    USERS ||--o{ NOTIFICATIONS : "receives"

    GUARDIANS ||--o{ PATIENTS : "cares for"

    PATIENTS ||--o{ PATIENT_VACCINES : "enrolled in"
    PATIENTS ||--o{ PATIENT_VACCINE_SCHEDULES : "has planned"
    PATIENTS ||--o{ IMMUNIZATION_RECORDS : "receives"
    PATIENTS ||--o{ PATIENT_IMMUNIZATION_CARD_ROWS : "displays"
    PATIENTS ||--o{ VACCINE_INVENTORY_TRANSACTIONS : "associated with"

    VACCINES ||--o{ VACCINE_SCHEDULES : "defines"
    VACCINES ||--o{ VACCINE_INVENTORIES : "stocks"
    VACCINES ||--o{ PATIENT_VACCINES : "cataloged in"
    VACCINES ||--o{ PATIENT_VACCINE_SCHEDULES : "targets"
    VACCINES ||--o{ IMMUNIZATION_RECORDS : "administered in"
    VACCINES ||--o{ VACCINE_INVENTORY_TRANSACTIONS : "logs"

    VACCINE_INVENTORIES ||--o{ PATIENT_VACCINE_SCHEDULES : "reserves lot"
    VACCINE_INVENTORIES ||--o{ IMMUNIZATION_RECORDS : "dispenses"
    VACCINE_INVENTORIES ||--o{ VACCINE_INVENTORY_TRANSACTIONS : "mutates"

    IMMUNIZATION_RECORDS ||--o| VACCINE_INVENTORY_TRANSACTIONS : "triggers"

    ROLES {
        bigint id PK
        varchar name UK
        varchar display_name
    }

    USERS {
        bigint id PK
        bigint role_id FK
        varchar name
        varchar email UK
        varchar password
        varchar account_status
        boolean must_change_password
    }

    GUARDIANS {
        bigint id PK
        bigint user_id FK,UK
        varchar guardian_no UK
        varchar name
        varchar gender
        varchar contact_number
        varchar email
    }

    PATIENTS {
        bigint id PK
        bigint guardian_id FK
        varchar patient_id UK
        varchar first_name
        varchar last_name
        date date_of_birth
        enum sex
        text address
        decimal birth_weight
        decimal birth_length
        varchar status
    }

    VACCINES {
        bigint id PK
        varchar name
        enum category
        int required_doses
        text description
    }

    VACCINE_SCHEDULES {
        bigint id PK
        bigint vaccine_id FK
        int dose_number
        int recommended_age
        int interval_from_previous
    }

    VACCINE_INVENTORIES {
        bigint id PK
        bigint vaccine_id FK
        varchar batch_number UK
        int quantity
        date date_received
        date expiration_date
        boolean is_archived
        varchar archive_reason
    }

    VACCINE_INVENTORY_TRANSACTIONS {
        bigint id PK
        bigint vaccine_id FK
        bigint vaccine_inventory_id FK
        bigint user_id FK
        bigint patient_id FK
        bigint immunization_record_id FK
        varchar transaction_type
        int quantity_change
        int balance_after
        varchar batch_number
        text remarks
    }

    PATIENT_VACCINES {
        bigint id PK
        bigint patient_id FK
        bigint vaccine_id FK
        bigint added_by FK
        text notes
    }

    PATIENT_VACCINE_SCHEDULES {
        bigint id PK
        bigint patient_id FK
        bigint vaccine_id FK
        bigint vaccine_inventory_id FK
        int dose_number
        date scheduled_date
        varchar status
        boolean is_manually_adjusted
        boolean is_series_completion_candidate
        int allocation_rank
        json allocation_snapshot
    }

    IMMUNIZATION_RECORDS {
        bigint id PK
        bigint patient_id FK
        bigint vaccine_id FK
        bigint vaccine_inventory_id FK
        int dose_number
        date administered_date
        varchar administered_by
        varchar batch_number
        text remarks
    }

    PATIENT_IMMUNIZATION_CARD_ROWS {
        bigint id PK
        bigint patient_id FK
        varchar vaccine_name
        int dose_count
        json doses
        text remarks
    }

    NOTIFICATIONS {
        char id PK
        varchar type
        varchar notifiable_type
        bigint notifiable_id
        text data
        timestamp read_at
    }

    PASSWORD_RESET_REQUESTS {
        bigint id PK
        bigint user_id FK
        enum status
        timestamp requested_at
        timestamp processed_at
        bigint processed_by FK
        text notes
    }
```

---

## 6. Clinical Sequence & Process Flow Workflows

### 6.1 Single-Click Administration & Atomic Stock Deduction Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Staff as Health Worker (Nurse / Midwife)
    participant UI as Presentation Layer (React)
    participant Ctrl as ImmunizationController
    participant DB as MySQL Database (InnoDB)

    Staff->>UI: Scans Child QR or Selects Patient
    UI->>Ctrl: GET /patients/{id}
    Ctrl->>DB: Query profile, schedules, and FEFO inventory batches
    DB-->>Ctrl: Patient dataset & active batches
    Ctrl-->>UI: Render Digital Bakuna Card with due milestone badges
    Staff->>UI: Clicks "Administer Vaccine" on Due Dose
    UI->>Ctrl: POST /immunization/patients/{id}/administer (vaccine_id, dose_number)
    Note over Ctrl,DB: Begin ACID Transaction (DB::beginTransaction)
    Ctrl->>DB: Lock and select earliest unexpired batch (FEFO)
    Ctrl->>DB: INSERT into immunization_records
    Ctrl->>DB: DECREMENT vaccine_inventories.quantity by 1
    Ctrl->>DB: INSERT into vaccine_inventory_transactions (type: administered, qty: -1)
    Ctrl->>DB: UPDATE patient_vaccine_schedules (status: completed)
    Ctrl->>DB: Calculate & INSERT next milestone dose into patient_vaccine_schedules
    Note over Ctrl,DB: Commit Transaction (DB::commit)
    Ctrl-->>UI: Return updated card state + flash success message
    UI-->>Staff: Display green administered checkmark & updated next visit
```

### 6.2 Weekly Monday Reminder Dispatch Workflow

```mermaid
sequenceDiagram
    autonumber
    participant Cron as Host Cron Daemon
    participant Artisan as visits:send-reminders Command
    participant DB as MySQL Database
    participant Guardian as Parent User Account

    Cron->>Artisan: Triggers command weekly (Monday 08:00 AM)
    Artisan->>DB: Query active patients with pending schedules due >= today
    DB-->>Artisan: Scheduled patients + next visit dates + vaccines
    loop For each scheduled child
        Artisan->>Artisan: Group eligible doses into single next-visit date
        Artisan->>DB: Delete previous UpcomingVisitReminderNotification for child (Anti-bloat)
        Artisan->>DB: Insert new consolidated notification into notifications table
        Artisan-->>Guardian: Deliver in-app alert banner & notification bell badge
    end
    Artisan-->>Cron: Log total reminders dispatched
```

### 6.3 Vaccine Coverage & Schedule Status Report Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Staff as Clinic Staff / Admin
    participant UI as Reports Hub (React)
    participant Ctrl as ImmunizationReportController
    participant PDF as DomPDF / CSV Streaming Engine

    Staff->>UI: Opens "Reports" Tab in Immunization Module
    UI->>Staff: Render Vaccine Coverage & Schedule Status views
    alt Vaccine Coverage Report
        Staff->>UI: Selects Date Range, Vaccine Biologic, and Dose Filter
        Staff->>UI: Clicks "Export PDF" or "Export CSV"
        UI->>Ctrl: GET /immunization/reports/coverage/{format}?[filters]
        Ctrl->>PDF: Generate Landscape A4 PDF or UTF-8 BOM CSV stream
        PDF-->>Staff: Initiates browser file download
    else Schedule Status Report
        Staff->>UI: Clicks "Update Statuses (Target Date Sync)"
        UI->>Ctrl: POST /immunization/reports/schedule-status/sync
        Ctrl->>Ctrl: Compare target dates with today: mark passed as overdue, upcoming as approaching
        Ctrl-->>UI: Return synchronized counts & updated rows
        Staff->>UI: Clicks "Export PDF" or "Export CSV"
        UI->>Ctrl: GET /immunization/reports/schedule-status/{format}
        PDF-->>Staff: Initiates browser file download
    end
```

---

## 7. UI Layout Specifications & Wireframe Mapping for Draw.io

The system analyst should model the following screen wireframes in Draw.io representing the primary clinical interfaces:

### 7.1 Desktop Workstation: Clinic Admin/Staff Layout
* **Dimensions**: 1200 x 800 px.
* **Header / Topbar**:
  * Health Center Logo, Current Module Title, Date & Time indicator.
  * Notification Bell with active unread counter badge.
  * User profile dropdown (Name, Role: Nurse/Midwife/Admin, Logout).
* **Navigation Sidebar**:
  * Dashboard (`/dashboard`)
  * Patient Management (`/patients`)
  * Immunization Tracking (`/immunization`)
  * Vaccine Inventory (`/vaccine-inventory`)
  * Vaccine Master List (`/vaccines`)
  * Staff Accounts (`/staff` - Admin only)
* **Main Content Area**: Tabbed workspace (e.g. Schedule Queue, Administer Encounter, Reports Hub).

### 7.2 Immunization Module: Reports Hub View
* **Top Controls Bar**:
  * Report Switcher Tabs: `[ Vaccine Coverage Report ]` | `[ Immunization Schedule Status Report ]`.
  * Date Pickers: `From: [ YYYY-MM-DD ]` `To: [ YYYY-MM-DD ]`.
  * Biologic Selector: `Vaccine: [ All / Pentavalent / BCG / ... ]`.
  * Dose Selector: `Dose: [ All / Dose 1 / Dose 2 / Dose 3 / Booster ]`.
  * Export Action Buttons: `[ Export PDF ]` (red) and `[ Export CSV ]` (green).
* **Vaccine Coverage Summary Cards**:
  * 4 Statistic KPI Tiles: Target Cohort (N), Total Doses Administered (N), Doses 1-3 Completed (N), Coverage Rate (%).
* **Compact Children Table**:
  * Columns: `Date`, `Patient ID`, `Child Full Name`, `Sex`, `Age Admin`, `Parent / Guardian`, `Vaccine`, `Dose`, `Batch Number`, `Administered By`, `Remarks`.
  * Highlight: Dedicated `Vaccine` and `Dose` columns for clean vertical alignment.

### 7.3 Immunization Schedule Status Report View
* **Top Controls Bar**:
  * Status Sync Action: `[ Update Statuses (Target Date Sync) ]` with instant confirmation badge.
  * Search Box: Filter by Child Name or Guardian.
  * Export Action Buttons: `[ Export PDF ]` and `[ Export CSV ]`.
* **Compact Schedule Table**:
  * Columns: `Child Name`, `Sex`, `Age`, `Parent / Guardian`, `Vaccine`, `Dose`, `Target Date`, `Timeline Status` (Overdue red badge / Upcoming green badge), `Timeline Diff` (e.g., "5 days overdue"), `Action Status Updater` (Dropdown: `Overdue` / `Upcoming`).

### 7.4 Guardian Mobile Portal Layout
* **Dimensions**: 390 x 844 px (iPhone / Android Portrait).
* **Header**: Barangay Bugo Health Pass branding with child quick-switcher tabs.
* **Child Hero Card**:
  * Child Photo placeholder, Full Name, Patient ID (`PT-XXXXXX`).
  * High-contrast QR code pass for 1-second scanning at the clinic triage desk.
* **Next Visit Alert Card**:
  * Single consolidated reminder card displaying next appointment date, due vaccines, and health center clinic schedule.
* **Digital Bakuna Card Section**:
  * Collapsible vaccine rows showing completed checkmarks, administration dates, and lot numbers.
