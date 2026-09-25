# System Requirements Specification (SRS)

## Web-Based Pediatric Immunization Tracking, Vaccine Inventory Management, and Automated Reminder Notification System with QR Code-Enabled Patient Record Management

* **System Identifier**: Barangay Bugo Immunization Management System (`Bugo`)  
* **Institution**: College of Information Technology, **Tagoloan Community College**, Tagoloan, Misamis Oriental  
* **Beneficiary**: Barangay Bugo Health Center, Cagayan de Oro City, Misamis Oriental  
* **Client Representative**: Elena B. Nuque  
* **Development Team (Team Catalyst)**:  
  * Justine V. Buico (Project Manager)  
  * Brandolph O. Alerta  
  * Adriana Alvarez  
  * Jobert T. Cañeda  
  * Mark Lourence B. Mata  
  * Arron Gabriel T. Sumilla  
  * Johnbert S. Urgello  
* **Methodology**: Waterfall Model (Ardiansyah et al., 2022)  

---

## 1. Executive Summary & Purpose

The purpose of the system is to provide a centralized web-based platform that streamlines pediatric immunization management, vaccine cold-chain inventory monitoring, and patient record tracking at Barangay Bugo Health Center. The system replaces labor-intensive, error-prone paper Target Client Lists (TCL) and handwritten Baby's Health Record booklets with an automated, QR code-enabled platform providing real-time stock monitoring, threshold-based shortage/expiration alerts, prioritized dose scheduling, and multi-channel appointment reminder notifications.

---

## 2. Stakeholder & User Roles

| Role | Description | Access Scope |
| :--- | :--- | :--- |
| **Administrator** | Health center administrator / IT officer | System-wide configuration, staff account management, user role assignments, guardian password reset resolutions, and audit tracking. |
| **Nurse** | Registered clinic nurse | Patient intake, clinical assessment, single-click vaccine administration recording, schedule progression, inventory management, and report generation. |
| **Midwife** | Clinic midwife | Infant birth registration, anthropometrics tracking (weight, length, head/chest circumferences), immunization records, and scheduling. |
| **Barangay Health Worker (BHW)** | Community health worker | QR code scanning, patient lookup, appointment verification, triage vitals logging, and follow-ups. |
| **Parent / Guardian** | Mothers, fathers, or registered caregivers | Guardian portal access, viewing child digital Bakuna cards, consolidated next-visit reminder alerts, and high-contrast QR passes on mobile devices. |

---

## 3. Core Functional Modules (Manuscript Specific Objectives)

### 3.1 Module 1: Patient Management Module
* **FR-1.1 (Pediatric Intake & Birth Demographics)**: Record complete pediatric profile including full name, sex, date of birth, place of birth, address (Purok/Zone in Bugo), birth weight, birth length, head circumference, chest circumference, birth order, gestational maturity, birth attendant, and birth registration details matching the official DOH Baby's Health Record Book.
* **FR-1.2 (Standardized Patient ID & QR Code Generation)**: Automatically assign every infant a standardized unique Patient ID (`PT-XXXXXX`) and generate a high-contrast QR code linked directly to their profile.
* **FR-1.3 (Household & Family Linkage)**: Link pediatric records N:1 to verified parent/guardian profiles (`GRD-YYYY-XXXX`).
* **FR-1.4 (Instant Record Retrieval via QR)**: Support instant record retrieval when healthcare personnel scan a patient's QR code via camera or handheld scanner, eliminating manual logbook searching.
* **FR-1.5 (Profile Maintenance & Medical History)**: Allow authorized personnel to update medical background, allergies, existing conditions, and toggle patient active/inactive status.

### 3.2 Module 2: Vaccination Tracking & Reporting Module
* **FR-2.1 (Clinical Administration in One Click)**: Record vaccine administration, dosage, administering health worker, batch/lot number, and remarks with a single click.
* **FR-2.2 (Schedule Generation & Interval Progression)**: Automatically compute the next milestone vaccination schedule upon dose administration based on Philippine DOH childhood immunization intervals.
* **FR-2.3 (Vaccination History & Status)**: Maintain a chronological immunization history displaying completed, pending, and overdue statuses.
* **FR-2.4 (Electronic Child Immunization Card)**: Generate an interactive digital immunization card mirroring the official DOH Child Immunization Record (BCG, Hepatitis B, Pentavalent 1-3, OPV 1-3, IPV 1-2, PCV 1-3, MMR 1-2, and SIA vaccines).
* **FR-2.5 (Printable Records & Health Passes)**: Support printing and reprinting of digital immunization cards and QR code passes for clinic visits.
* **FR-2.6 (Vaccine Coverage Report)**: Generate comprehensive coverage reports offering a complete list of vaccines along with details about vaccinated children, filterable in real-time by date range (`date_from`, `date_to`), vaccine biologic, and dose number. Exportable in landscape A4 PDF and RFC-4180 CSV formats.
* **FR-2.7 (Immunization Schedule Status Report)**: Generate schedule status reports outlining each child's status, calculating exact timeline difference (days overdue or approaching), and supporting 1-click status synchronization (`overdue` vs `upcoming`) depending on whether the target date has passed or is approaching. Exportable in PDF and CSV formats.

### 3.3 Module 3: Reminder and Notification Module
* **FR-3.1 (Automated Weekly Monday Reminders)**: Automatically scan all scheduled children every Monday at 08:00 AM via scheduled background daemons (`visits:send-reminders`) and dispatch visit reminders for upcoming appointments.
* **FR-3.2 (Single Next-Visit Reminder per Child)**: Consolidate multiple eligible vaccine doses for a child into a single visit reminder to avoid overwhelming guardians.
* **FR-3.3 (Anti-Bloat Notification Overwriting)**: Automatically purge or overwrite previous visit reminder notifications for the same child upon generating a new reminder, ensuring guardian notification inboxes remain clean and relevant.
* **FR-3.4 (Priority Flagging & Dose Allocation)**: Flag patients nearing completion of their immunization series. When vaccine supplies are limited, the system matches available doses with priority-flagged patients and reserves doses exclusively for them.
* **FR-3.5 (Cold Chain Stock & Availability Alerts)**: Generate automated warnings for health center personnel regarding low stock (<= 15 doses), stockouts, near-expiry (<= 30 days), and expired batches.
* **FR-3.6 (In-App Notification Center)**: Provide staff and parents with an interactive notification inbox featuring read/unread toggles and priority badges.

### 3.4 Module 4: Staff Management & Security Module
* **FR-4.1 (Account Administration)**: Allow administrators to create, edit, deactivate, and manage healthcare staff accounts across Admin, Nurse, Midwife, and BHW roles.
* **FR-4.2 (Role-Based Access Control)**: Enforce strict role permissions and route middleware separating clinic clinical functions from guardian portal views.
* **FR-4.3 (Temporary Password & First-Login Security)**: Issue temporary passwords for new accounts and enforce mandatory permanent password changes upon initial login (`must_change_password` flag).
* **FR-4.4 (Guardian Password Reset Queue & Moderation)**: Allow guardians to submit password recovery tickets. Enforce a single-pending request restriction per account with system alert notifications to prevent request spamming.

### 3.5 Module 5: Vaccine Inventory & Cold Chain Module
* **FR-5.1 (Real-Time Stock & Batch Tracking)**: Track vaccine stock quantities, lot/batch numbers, manufacturer, supplier, date received, and expiration dates.
* **FR-5.2 (First-Expired, First-Out Allocation)**: Implement FEFO allocation logic to ensure older viable batches are utilized prior to newer stock, minimizing spoilage.
* **FR-5.3 (Immutable Inventory Transaction Ledger)**: Record every balance mutation across the cold chain in `vaccine_inventory_transactions` with complete user attribution, balance snapshots, and transaction categories (`received`, `administered`, `wastage`, `spoilage`, `adjustment`, `archived`).
* **FR-5.4 (Stock Adjustment & Wastage Logging)**: Enable health workers to log opened vial wastage, cold chain thermal spoilage, and physical inventory reconciliations with mandatory clinical remarks.
* **FR-5.5 (Automated Batch Archiving)**: Run daily daemons at 05:55 AM (`inventory:auto-archive`) to retire expired and depleted batches while preserving permanent audit records.

---

## 4. Non-Functional Requirements (NFR)

* **NFR-1 (Security & Privacy)**: Password hashing with Bcrypt (12 rounds), CSRF protection across all forms, session fixation protection, and RBAC route filtering.
* **NFR-2 (Mobile-Responsive Design)**: Responsive UI engineered using **Bootstrap 5 grid utilities** and CSS to ensure smooth operation across desktop workstations, clinic tablets, and mobile devices.
* **NFR-3 (Performance)**: Sub-second page rendering via Inertia.js and instant QR code decoding via client-side HTML5 camera video streaming.
* **NFR-4 (Data Integrity)**: Relational ACID transactions ensuring vaccine inventory decrements synchronize atomically with immunization records and audit logs.
* **NFR-5 (Offline Resilience)**: Graceful notification and client-side form caching during community internet interruptions.

---

## 5. Software Development Lifecycle (Waterfall Model)

As documented in Chapter 3 of the manuscript (Ardiansyah et al., 2022; Pratrian et al., 2024), the system follows the six sequential phases of the Waterfall Model:
1. **Planning & Requirement Gathering Phase**: Qualitative key informant interviews, logbook inspection, and SRS specification.
2. **System Design Phase**: draw.io architectural modeling, Context Diagram, Level-0/1 DFDs, Entity Relationship Diagram (ERD), and UI wireframes.
3. **Development Phase**: 3-tier implementation (Presentation Layer: ReactJS, HTML, CSS, Bootstrap; Application Layer: Laravel 12; Database Layer: MySQL).
4. **Testing Phase**: PHPUnit backend automated testing (66 unit/integration/feature tests), cross-browser validation, and physical Android mobile trials.
5. **Deployment Phase**: Local server hosting on Apache/MySQL with compiled Vite production assets.
6. **Evaluation Phase**: Usability and reliability evaluation based on the **ISO/IEC 25010** software quality standard using structured questionnaires for staff and parents.
