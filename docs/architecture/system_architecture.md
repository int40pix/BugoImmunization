# Multi-Tier System Architecture Document

## Web-Based Pediatric Immunization Tracking, Vaccine Inventory Management, and Automated Reminder Notification System with QR Code-Enabled Patient Record Management

* **System Identifier**: Barangay Bugo Immunization Management System (`Bugo`)  
* **Architecture Standard**: Multi-Tier Horizontal System Architecture (Manuscript Figure 3.0)  
* **Design & Modeling Tool**: draw.io Architectural Design (JGraph Ltd, 2020)  
* **Methodology**: Waterfall Model System Design Phase (Ardiansyah et al., 2022)  

---

## 1. Architectural Blueprint (Multi-Tier Horizontal Model)

The Barangay Bugo Immunization Management System is architected as a **3-Tier Enterprise Web Application** engineered horizontally to model clear separation of concerns, scalability across rural health center devices, and strict data consistency:

```
+=======================================================================================================================+
|                                        CLIENT TIER (PRESENTATION LAYER)                                               |
+=======================================================================================================================+
|  Clinic Desktop Workstations           Health Center Mobile Tablets              Guardian Mobile Smartphones          |
|  * Admin & Nurse Desk (1920x1080)      * Midwife & BHW Triage (1024x768)        * Parent Digital Portal (390x844)     |
|  * High-speed clinical entry           * Touchscreen vitals & attendance        * Child Bakuna Card & QR display      |
|                                                                                                                       |
|  +-----------------------------------------------------------------------------------------------------------------+  |
|  | Presentation Components (React 19 + TypeScript 5.7 + Tailwind CSS v4 + Bootstrap 5 Grid)                        |  |
|  | * Interactive Child Bakuna Electronic Health Card       * High-Contrast Dynamic QR Generator (qrcode.react)    |  |
|  | * Real-time Camera QR Scanner (html5-qrcode)            * Stock Adjustment & Cold Chain Wastage Modals          |  |
|  | * Reports Hub (Vaccine Coverage & Schedule Status)     * In-App Interactive Notification Center                |  |
|  +-----------------------------------------------------------------------------------------------------------------+  |
+===========================================================+===========================================================+
                                                            |
                                        HTTPS / TLS 1.3     |  Inertia.js Single-Page Protocol
                                        JSON / Form-Data    |  PDF & CSV File Streams
                                                            v
+=======================================================================================================================+
|                                    APPLICATION TIER (APPLICATION & LOGIC LAYER)                                       |
+=======================================================================================================================+
|  Web Server & Gateway: Apache 2.4 / Nginx + PHP 8.2+ FastCGI (XAMPP / Production Linux Host)                           |
|                                                                                                                       |
|  +-----------------------------------------+  +-----------------------------------------+  +-----------------------+  |
|  | HTTP Kernel & RBAC Routing Engine       |  | Core Controllers                        |  | Request Validation    |  |
|  | * Route Middleware: 'auth', 'role:...'  |  | * PatientController                     |  | * Form Requests       |  |
|  | * 'password.changed' (First Login Rule) |  | * ImmunizationController                |  | * CSRF Protection     |  |
|  | * Single-Pending Reset Rule             |  | * VaccineInventoryController            |  | * Param Sanitization  |  |
|  | * Public Auth vs Protected Clinic Area  |  | * ImmunizationReportController          |  |                       |  |
|  +-----------------------------------------+  +-----------------------------------------+  +-----------------------+  |
|                                                            |                                                          |
|                                                            v                                                          |
|  +-----------------------------------------------------------------------------------------------------------------+  |
|  | Domain Business Logic & Algorithm Services                                                                      |  |
|  | * VaccineSchedulingPriorityService: Evaluates DOH intervals, flags completion candidates, reserves scarce doses |  |
|  | * VaccineEligibilityService: Filters eligible vaccines matching infant age milestone in days/weeks              |  |
|  | * VaccineInventoryService: Enforces First-Expired, First-Out (FEFO), threshold alerts, and batch auto-archival   |  |
|  | * AutomatedReminderDispatcher: Evaluates upcoming visits, groups multiple vaccines, overwrites duplicate alerts|  |
|  | * ReportingExportEngine: Generates landscape A4 PDFs (Barryvdh DomPDF) and RFC-4180 UTF-8 BOM CSV streams      |  |
|  +-----------------------------------------------------------------------------------------------------------------+  |
|                                                            |                                                          |
|                                                            v                                                          |
|  +-----------------------------------------------------------------------------------------------------------------+  |
|  | System Background Daemons & Artisan Schedulers (Cron Jobs)                                                      |  |
|  | * 05:55 AM Daily: 'inventory:auto-archive' (Retires expired & depleted lots, records audit transactions)         |  |
|  | * 06:00 AM Daily: 'generate-vaccine-schedules' (Reconciles schedules & priorities against live inventory)       |  |
|  | * 06:10 AM Daily: 'inventory:check-alerts' (Issues Low Stock, Out of Stock, Near Expiry notifications)            |  |
|  | * 08:00 AM Mondays: 'visits:send-reminders' (Weekly automated visit notification dispatch to guardian accounts) |  |
|  +-----------------------------------------------------------------------------------------------------------------+  |
+===========================================================+===========================================================+
                                                            |
                                        PDO / SQL Engine    |  ACID Transaction Boundaries
                                        Port 3306 (TCP)     |  Prepared Statement Execution
                                                            v
+=======================================================================================================================+
|                                      DATA TIER (PERSISTENCE & STORAGE LAYER)                                          |
+=======================================================================================================================+
|  Relational Database Management System: MySQL 8.0+ / MariaDB 10.4+ (Database: `bugo_immunization`, InnoDB Engine)     |
|                                                                                                                       |
|  +--------------------+  +--------------------+  +--------------------+  +--------------------+  +-----------------+  |
|  | Users & RBAC       |  | Demographics       |  | Vaccine Catalog    |  | Cold Chain Inv.    |  | Clinical Records|  |
|  | * roles            |  | * guardians        |  | * vaccines         |  | * vaccine_inv.     |  | * pat_vacc_sched|  |
|  | * users            |  | * patients         |  | * vaccine_sched.   |  | * inventory_trans. |  | * immuniz_rec.  |  |
|  | * password_resets  |  |                    |  | * patient_vaccines |  |                    |  | * card_rows     |  |
|  +--------------------+  +--------------------+  +--------------------+  +--------------------+  +-----------------+  |
|                                                                                                                       |
|  * ACID Transaction Integrity: Synchronized decrement of vaccine stock + logging of immutable transaction + record    |
|  * File System Storage: Public build assets (`backend/public/build`), database dumps (`database/schemas`)             |
+=======================================================================================================================+
```

---

## 2. Layered Responsibilities & Technical Stack

### 2.1 Client Tier (Presentation Layer)
* **Hardware Profile**: Desktop Workstations (Bugo triage counter), Android Tablets (field immunization sessions), Mobile Smartphones (guardians checking Bakuna status).
* **Software Profile**: Modern HTML5 Web Browsers (Chrome, Edge, Firefox, Safari Mobile).
* **Key Frameworks & Libraries**:
  * **ReactJS 19 & TypeScript 5.7**: Declarative component hierarchy and strict type verification.
  * **Inertia.js (v2)**: Client-side router eliminating traditional REST boilerplate while preserving Single-Page Application (SPA) responsiveness.
  * **Tailwind CSS v4 & Bootstrap 5 Grid**: Responsive grid mechanics, modal utilities, and adaptive layouts.
  * **html5-qrcode**: Real-time video stream decoding for camera-based patient ID retrieval.
  * **qrcode.react**: High-contrast SVG/Canvas QR generation for child health passes.
  * **Lucide React**: Medical and administrative icon set.

### 2.2 Application Tier (Web & Logic Layer)
* **Runtime**: PHP 8.2+ running on Apache 2.4 (mod_php or FastCGI).
* **Core Framework**: Laravel 12.
* **Core Architectural Subsystems**:
  1. **Authentication & RBAC Gatekeeper**:
     * Unified login gateway redirecting staff to clinic dashboards and guardians to mobile family portals.
     * Temporary password enforcement (`must_change_password` flag).
     * Single-pending request restriction preventing spamming of password reset submissions.
  2. **Clinical Immunization Engine**:
     * Single-click dose recording with automatic batch selection via First-Expired, First-Out (FEFO).
     * Atomic database transactions ensuring stock decrement matches clinical dose recording.
     * Dynamic next-visit suggested date calculator based on Philippine Department of Health (DOH) standard intervals.
  3. **Cold Chain & Inventory Management Engine**:
     * Immutable transaction ledger (`vaccine_inventory_transactions`) recording received stock, administered doses, open-vial wastage, spoilage, and manual count reconciliations.
     * Threshold-driven warning system triggering notifications for near-expiry (<= 30 days) and low stock (<= 15 doses).
     * Daily auto-archival daemon retiring expired and depleted lots.
  4. **Automated Notification & Reminder Dispatcher**:
     * Weekly Monday 8:00 AM cron runner dispatching consolidated next-visit reminders.
     * Anti-bloat deduplication: Deletes outdated visit reminders for the same child to keep guardian inboxes clean.
     * Multi-recipient stock alerts alerting staff of cold chain shortages.
  5. **Reporting & Health Decision Support**:
     * **Vaccine Coverage Report**: Calculates target cohort size, dose completion rates (Dose 1-3, Boosters, Total Administered), and line listings of vaccinated children; filterable by date range, vaccine biologic, and dose.
     * **Immunization Schedule Status Report**: Classifies active scheduled children as `Upcoming` or `Overdue` based on target date difference, with a 1-click status synchronization engine.
     * Dual export pipeline: Landscape A4 PDFs via `Barryvdh\DomPDF` and RFC-4180 CSV spreadsheets with UTF-8 Byte Order Marks (BOM).

### 2.3 Persistence Tier (Database Layer)
* **Database Engine**: MySQL 8.0+ / MariaDB 10.4+ utilizing the `InnoDB` storage engine for full ACID compliance.
* **Schema Design**: 14 normalized relational tables with explicit foreign keys, cascading deletions on parent-child entities, and restrictive deletions on master catalog entities.
* **Performance & Reliability**:
  * Compound indexes on frequent clinical query pathways (e.g. `['scheduled_date', 'status']`, `['vaccine_id', 'created_at']`).
  * Automated database dump and recovery utilities (`database/schemas/restore_database.bat`).

---

## 3. Communication Protocols & Data Exchange Formats

| Pathway | Source Tier | Destination Tier | Protocol / Transport | Data Format | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **User Interactions** | Client Tier | Application Tier | HTTPS / TLS 1.3 | Inertia XHR / JSON | Page navigation, modal forms, clinical submissions. |
| **Authentication** | Client Tier | Application Tier | HTTPS (POST) | Form-Encoded / Cookies | Session token authentication with CSRF token verification. |
| **QR Code Reading** | Client Hardware | Client Tier | W3C MediaDevices API | Video Bitstream | Native camera frame capture decoded client-side into Patient ID. |
| **Application Persistence**| Application Tier | Database Tier | TCP / Port 3306 | Prepared SQL Statements | PDO MySQL queries, transactions, and row locks. |
| **PDF Export** | Application Tier | Client Tier | HTTPS (GET) | `application/pdf` | Binary stream rendered via landscape DomPDF. |
| **CSV Export** | Application Tier | Client Tier | HTTPS (GET) | `text/csv; charset=UTF-8` | Chunked text stream prefixed with UTF-8 BOM (`\xEF\xBB\xBF`). |
| **Scheduled Tasks** | OS Host (Cron) | Application Tier | CLI (PHP Artisan) | Process Exit Codes | Scheduled command invocations (5:55, 6:00, 6:10, 8:00 AM). |

---

## 4. Draw.io Modeling Instructions for System Analyst

When drawing **Figure 3.0: Multi-Tier Horizontal System Architecture** in Draw.io:
1. **Canvas Orientation**: Landscape (A4 or Custom 1200 x 800 px).
2. **Swimlanes / Containers**: Create 3 horizontal container bands:
   * **Top Band**: `Client Tier (Presentation Layer)` (Color: `#dae8fc`, Stroke: `#6c8ebf`).
   * **Middle Band**: `Application Tier (Logic & Server Layer)` (Color: `#d5e8d4`, Stroke: `#82b366`).
   * **Bottom Band**: `Data Tier (Persistence & Storage Layer)` (Color: `#ffe6cc`, Stroke: `#d79b00`).
3. **Connectors**:
   * Use double-headed thick orthogonal arrows with labels:
     * Between Client and App: `"HTTPS / TLS 1.3 (Inertia SPA Protocol & JSON Payloads)"`.
     * Between App and Data: `"PDO MySQL TCP Port 3306 (ACID Transactions & SQL Statements)"`.
4. **Icons & Callouts**:
   * Add camera scan callout into Client tier pointing to QR decoder.
   * Add Cron Scheduler callout into Application tier pointing to the 4 scheduled jobs.
   * Add export callouts (`PDF Engine` and `CSV Streamer`) pointing outward from Application tier.
