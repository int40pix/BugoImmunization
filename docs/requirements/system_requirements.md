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

The purpose of the system is to provide a centralized web-based platform that improves pediatric immunization management, vaccine inventory monitoring, and patient record handling at Barangay Bugo Health Center. The system replaces error-prone paper logbooks (TCL) with an automated, QR code-enabled platform providing real-time stock monitoring, threshold-based shortage/expiration alerts, prioritized dose scheduling, and multi-channel appointment reminder notifications.

---

## 2. Stakeholder & User Roles

| Role | Description | Access Scope |
| :--- | :--- | :--- |
| **Administrator** | Health center administrator / IT officer | System-wide configuration, staff account management, user role assignments, guardian password reset resolutions, and audit tracking. |
| **Nurse** | Registered clinic nurse | Patient intake, clinical assessment, vaccine administration recording in one click, schedule progression, and inventory management. |
| **Midwife** | Clinic midwife | Infant birth registration, physical metrics tracking (weight, length, head/chest circumferences), immunization records, and scheduling. |
| **Barangay Health Worker (BHW)** | Community health worker | QR code scanning, patient lookup, appointment verification, attendance logging, and follow-ups. |
| **Parent / Guardian** | Mothers, fathers, or registered guardians | Guardian portal access, viewing child immunization cards, upcoming schedule dates, and digital QR codes on mobile devices. |

---

## 3. Core Functional Modules (Manuscript Specific Objectives)

### 3.1 Module 1: Patient Management Module
* **FR-1.1 (Registration)**: Record complete pediatric profile including full name, sex, date of birth, place of birth, address, birth weight, birth length, head circumference, chest circumference, birth order, and birth registration details matching the DOH Baby's Health Record Book.
* **FR-1.2 (Unique Patient ID & QR Generation)**: Automatically assign every child a standardized unique Patient ID (`PT-XXXXXX`) and generate a high-contrast QR code linked to their profile.
* **FR-1.3 (Household Linkage)**: Link pediatric records N:1 to verified parent/guardian profiles.
* **FR-1.4 (Patient Identification via QR)**: Support instant record retrieval when healthcare personnel scan a patient's QR code via camera or handheld scanner.
* **FR-1.5 (Profile Maintenance & Status)**: Allow authorized personnel to update medical background, allergies, existing conditions, and toggle patient active/inactive status.

### 3.2 Module 2: Vaccination Tracking Module
* **FR-2.1 (Clinical Administration in One Click)**: Record vaccine administration, dosage, administering health worker, batch/lot number, and remarks with a single click.
* **FR-2.2 (Schedule Generation)**: Automatically compute the next milestone vaccination schedule upon dose administration based on Philippine DOH childhood immunization intervals.
* **FR-2.3 (Vaccination History & Status)**: Maintain a chronological immunization history displaying completed, pending, and overdue statuses.
* **FR-2.4 (Electronic Immunization Card)**: Generate an interactive digital immunization card mirroring the official DOH Child Immunization Record (BCG, Hepatitis B, Pentavalent 1-3, OPV 1-3, IPV 1-2, PCV 1-3, MMR 1-2, and SIA vaccines).
* **FR-2.5 (Printable Records)**: Support printing and reprinting of digital immunization cards with embedded QR identifiers.

### 3.3 Module 3: Reminder and Notification Module
* **FR-3.1 (Schedule Reminders)**: Automatically send notifications to parents regarding upcoming vaccination appointments and due dates.
* **FR-3.2 (Overdue Alerts)**: Generate automated reminders for missed or overdue immunizations to prevent drop-outs.
* **FR-3.3 (Vaccine Stock & Availability Alerts)**: Alert parents and staff regarding vaccine availability and stock status before appointment dates.
* **FR-3.4 (Priority Flagging & Dose Matching)**: Flag patients nearing completion of their immunization series. When vaccine supplies are limited, the system matches available doses with priority-flagged patients and sends notifications exclusively to those scheduled recipients.
* **FR-3.5 (In-App Notification Center)**: Provide staff and parents with an interactive notification inbox featuring read/unread toggles and priority badges.

### 3.4 Module 4: Staff Management Module
* **FR-4.1 (Account Administration)**: Allow administrators to create, edit, deactivate, and manage healthcare staff accounts.
* **FR-4.2 (Role-Based Access Control)**: Enforce strict role permissions across Admin, Nurse, Midwife, and BHW accounts.
* **FR-4.3 (Password Security & First-Login Policy)**: Issue temporary passwords for new accounts and enforce mandatory permanent password changes upon initial login.
* **FR-4.4 (Guardian Password Reset Queue)**: Moderate and resolve staff-assisted password recovery requests submitted by guardians.

### 3.5 Module 5: Vaccine Inventory Module
* **FR-5.1 (Real-Time Stock Tracking)**: Track vaccine stock quantities, lot/batch numbers, manufacturer, supplier, date received, and expiration dates.
* **FR-5.2 (Threshold-Based Alerts)**: Trigger automated low-stock and near-expiry alerts whenever quantities fall below predefined safety thresholds.
* **FR-5.3 (First-Expired, First-Out Allocation)**: Implement FEFO allocation logic to ensure older viable batches are utilized prior to newer stock, minimizing wastage.
* **FR-5.4 (Inventory Archiving)**: Support batch retirement and archiving with documented disposal reasons (e.g., depleted, expired, damaged).
* **FR-5.5 (Summary Data Overview & Reports)**: Generate real-time summary statistics, Immunization Status Reports, and Vaccine Coverage Reports for DOH compliance.

---

## 4. Non-Functional Requirements (NFR)

* **NFR-1 (Security)**: Password hashing with Bcrypt (12 rounds), CSRF protection across all forms, session fixation protection, and RBAC route filtering.
* **NFR-2 (Mobile-Responsive Design)**: Responsive UI engineered using **Bootstrap 5 grid utilities** and CSS to ensure smooth operation across desktop workstations, clinic tablets, and mobile devices.
* **NFR-3 (Performance)**: Sub-second page rendering and instant QR code decoding via client-side camera streaming.
* **NFR-4 (Data Integrity)**: Relational ACID transactions ensuring vaccine inventory decrements synchronize atomically with immunization records.
* **NFR-5 (Offline Awareness)**: Graceful notification and offline data protection during community internet interruptions.

---

## 5. Software Development Lifecycle (Waterfall Model)

As documented in Chapter 3 of the manuscript (Ardiansyah et al., 2022; Pratrian et al., 2024), the system follows the six sequential phases of the Waterfall Model:
1. **Planning & Requirement Gathering Phase**: Qualitative key informant interviews, logbook inspection, and SRS specification.
2. **System Design Phase**: draw.io architectural modeling, Context Diagram, Level-0 DFD, and Entity Relationship Diagram (ERD).
3. **Development Phase**: 3-layer implementation (Presentation Layer: ReactJS, HTML, CSS, Bootstrap; Application Layer: Laravel; Database Layer: MySQL).
4. **Testing Phase**: PHPUnit backend automated testing, cross-browser validation, and physical Android mobile trials.
5. **Deployment Phase**: Local server hosting on Apache/MySQL with compiled Vite production assets.
6. **Evaluation Phase**: Usability and reliability evaluation based on the **ISO/IEC 25010** software quality standard using structured questionnaires for staff and parents.
