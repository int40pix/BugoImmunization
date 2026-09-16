# System Architecture Document

## Web-Based Pediatric Immunization Tracking, Vaccine Inventory Management, and Automated Reminder Notification System with QR Code-Enabled Patient Record Management

* **System Identifier**: Barangay Bugo Immunization Management System (`Bugo`)  
* **Architecture Standard**: 3-Tier Web System Architecture (Manuscript Figure 3.0)  
* **Design Modeling**: draw.io Architectural Design (JGraph Ltd, 2020)  

---

## 1. Architectural Design (3-Tier Layered Model)

As documented in Chapter 3 (Figure 3.0) of the manuscript, the system follows a structured **Three-Layer Architecture** composed of the **Presentation Layer**, **Application Layer**, and **Database Layer**:

```
+-------------------------------------------------------------------------------+
|                       PRESENTATION LAYER (Frontend)                           |
|      HTML5  |  CSS3  |  JavaScript  |  ReactJS 19  |  Bootstrap 5 Grid        |
|  * Responsive UI for Desktop Workstations, Clinic Tablets & Mobile Devices    |
|  * QR Code Camera Scanner (html5-qrcode) & Dynamic QR Generator (qrcode.react)|
|  * Interactive DOH Electronic Immunization Card & Form Controls               |
+---------------------------------------+---------------------------------------+
                                        |
                         HTTP / JSON    |    Inertia Protocol
                                        v
+-------------------------------------------------------------------------------+
|                       APPLICATION LAYER (Backend Core)                        |
|                               Laravel 12 Framework                            |
|                                                                               |
|  +------------------------+      +---------------------+                      |
|  |     HTTP Controllers   | ---> |  Routing & RBAC     |                      |
|  |  (Patient, Vaccine,    |      |  Middleware Filters |                      |
|  |   Inventory, Staff)    |      +----------+----------+                      |
|  +-----------+------------+                 |                                 |
|              |                              v                                 |
|              v                   +---------------------+                      |
|  +------------------------+      |   Form Requests     |                      |
|  |    Domain Services     |      |  (Validation Rules) |                      |
|  |  * VaccineScheduling   |      +---------------------+                      |
|  |  * PriorityFlagging    |                                                   |
|  |  * FEFO Allocation     |                                                   |
|  +-----------+------------+                                                   |
|              |                                                                |
|              v                                                                |
|  +-----------------------------------------------------+                      |
|  |         Eloquent ORM Relational Models              |                      |
|  |  (Patient, Guardian, Vaccine, Inventory, Schedules) |                      |
|  +-----------------------------------------------------+                      |
+---------------------------------------+---------------------------------------+
                                        |
                           PDO MySQL    |    Query Execution
                                        v
+-------------------------------------------------------------------------------+
|                         DATABASE LAYER (Persistence)                          |
|                               MySQL 8.0+ / MariaDB                            |
|  * Dedicated `bugo` database schema (21 tables)                               |
|  * Real-time stock counts, lot numbers, threshold levels, and expiry tracking  |
|  * Relational foreign key constraints & cascading data integrity              |
+-------------------------------------------------------------------------------+
```

---

## 2. Layered Responsibilities & Directory Mapping

### 2.1 Presentation Layer (`frontend/src/`)
* **Core Technologies**: ReactJS 19, TypeScript 5.7, Bootstrap 5 (Responsive Grid and Utility Classes), Tailwind CSS v4, Lucide Icons, Vite 6.
* **Responsibilities**:
  * Render user-friendly, mobile-responsive interfaces accessible on clinic desktops and mobile devices.
  * Capture and display real-time stock alerts, upcoming appointments, and overdue notifications.
  * Facilitate camera-based QR code scanning for instantaneous patient record lookups.
  * Render the digital pediatric immunization card matching Philippine Department of Health (DOH) standard layouts.

### 2.2 Application Layer (`backend/`)
* **Core Technologies**: Laravel 12, PHP 8.2+, Composer.
* **Responsibilities**:
  * Execute business logic for patient registration, unique Patient ID (PID) generation, and QR encoding.
  * Process single-click vaccination administration and automated milestone schedule calculation.
  * Enforce First-Expired, First-Out (FEFO) batch allocation logic.
  * Evaluate stock threshold limits and trigger automated notifications.
  * Perform priority flagging to match limited vaccine supplies with children nearing series completion.
  * Enforce role-based access control (RBAC) across Admin, Nurse, Midwife, BHW, and Guardian accounts.

### 2.3 Database Layer (`database/`)
* **Core Technologies**: MySQL / MariaDB (production database: `bugo`), SQLite (in-memory test runner).
* **Responsibilities**:
  * Maintain persistent storage across 21 normalized tables (users, roles, guardians, patients, vaccines, schedules, inventories, records, notifications).
  * Ensure ACID transaction safety when vaccine inventory levels decrement concurrently with dose logging.
  * Chronological migration tracking and 1-click restore utilities (`database/schemas/restore_database.bat`).

---

## 3. Key Design Patterns

1. **Model-View-Controller (MVC) + Inertia Protocol**: Controller actions return Inertia page responses without requiring separate manual JSON serialization layers, ensuring single-page speed with server-side security.
2. **First-Expired, First-Out (FEFO) Strategy**: Inventory queries sort unexpired batches ascending by `expiration_date` to prevent premature vaccine spoilage.
3. **Priority Flagging & Dose Allocation Pattern**: When batch inventory falls below safety thresholds, the system cross-references active patients nearing series completion and targets reminder dispatches exclusively to confirmed candidates.
4. **Scan-First Record Access**: Unique QR codes mapped to Patient IDs bypass manual search queries, reducing record retrieval times to under one second.
