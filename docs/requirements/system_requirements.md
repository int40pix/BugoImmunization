# System Requirements Specification (SRS)

**Project Name**: Barangay Bugo Immunization Management System  
**Version**: 1.0.0  
**Target Beneficiary**: Barangay Bugo Health Center, Cagayan de Oro City, Philippines  

---

## 1. Executive Summary
The Barangay Bugo Immunization Management System is a centralized, digital healthcare information system built to streamline childhood immunization schedules, patient record-keeping, vaccine inventory batch management, and parent/guardian engagement within the Barangay Health Center.

---

## 2. Stakeholder & User Roles

| Role | Description | Access Scope |
| :--- | :--- | :--- |
| **Administrator** | Head health officer or IT administrator | System-wide configuration, staff account management, password reset approvals, audit logs, and overall system maintenance. |
| **Nurse** | Registered clinic nurse | Patient intake, clinical assessment, vaccine administration recording, schedule generation, and inventory management. |
| **Midwife** | Clinic midwife | Infant registration, birth metrics logging, maternal-child immunization records, and scheduling. |
| **Barangay Health Worker (BHW)** | Community healthcare worker | Patient lookups, card verification, QR scanning, attendance logging, and appointment follow-ups. |
| **Parent / Guardian** | Mothers, fathers, or authorized child guardians | Guardian portal access, viewing dependent children's vaccination status, upcoming due dates, and electronic immunization cards. |

---

## 3. Functional Requirements (FR)

### 3.1 Authentication & Account Management
* **FR-1.1**: The system must authenticate users via encrypted credentials using Bcrypt.
* **FR-1.2**: Staff members issued temporary passwords must be compelled to update their credentials upon first login before accessing administrative features.
* **FR-1.3**: Guardians must be able to submit staff-assisted password reset requests through the portal.
* **FR-1.4**: Administrators must have a dedicated moderation queue to review and process password reset requests.

### 3.2 Patient Profile Management
* **FR-2.1**: The system must record detailed infant/child information including full name, sex, date of birth, address, birth weight, birth length, head/chest circumference, and birth registration details.
* **FR-2.2**: Each patient must automatically receive a standardized unique ID (`PT-XXXXXX`).
* **FR-2.3**: Every child must be linked to an active Guardian record.
* **FR-2.4**: Staff must be able to update medical backgrounds, allergies, and existing conditions.
* **FR-2.5**: Staff must be able to toggle patient status between `Active` and `Inactive`.

### 3.3 Vaccine & Schedule Management
* **FR-3.1**: The system must maintain a catalog of routine and optional pediatric vaccines (e.g., BCG, Hepatitis B, Pentavalent, OPV, IPV, PCV, MMR).
* **FR-3.2**: The system must enforce mandatory dose counts, minimum intervals (days/weeks/months), and target ages.
* **FR-3.3**: The automated scheduling engine must generate prioritized immunization appointments based on child age and clinical guidelines.

### 3.4 Vaccine Inventory & Batch Allocation (FEFO)
* **FR-4.1**: Health staff must track vaccine stock by lot/batch number, manufacturer, supplier, date received, and expiration date.
* **FR-4.2**: The system must implement First-Expired, First-Out (FEFO) automated allocation to prioritize vaccines closest to expiration.
* **FR-4.3**: Staff must be able to archive expired or depleted batches with designated reason codes.

### 3.5 Immunization Recording & Electronic Cards
* **FR-5.1**: Health workers must record administered doses with date, administering staff, batch number, and clinical remarks.
* **FR-5.2**: The system must maintain an interactive digital Immunization Card matching Philippine Department of Health (DOH) standard card layouts.
* **FR-5.3**: Staff can add custom immunization card rows for non-standard or transferred vaccinations.

### 3.6 Guardian Portal & QR Code Integration
* **FR-6.1**: Guardians can log in via mobile or desktop to monitor all registered dependents under their household.
* **FR-6.2**: The system must render dynamic QR codes on patient profiles for contactless lookup at the health center.
* **FR-6.3**: Clinic staff can use webcam or device camera scanners to read patient QR codes instantly.

---

## 4. Non-Functional Requirements (NFR)

* **NFR-1 (Security)**: All sessions must use HTTP-only secure cookies with CSRF token validation on all state-altering requests. Role-based access control (RBAC) middleware must intercept unauthorized routes.
* **NFR-2 (Performance)**: Page navigation powered by Inertia.js must provide sub-second client transitions without full browser reloads.
* **NFR-3 (Availability & Reliability)**: Database operations must adhere to ACID transactions, particularly when decrementing inventory upon vaccine administration.
* **NFR-4 (Usability)**: Responsive UI designed with Tailwind CSS and Radix UI primitives, operable on desktop monitors, tablets, and smartphones.
* **NFR-5 (Data Integrity)**: Foreign key cascades must maintain relational integrity between guardians, pediatric patients, and clinical records.

---

## 5. Technical Specifications

* **Operating System**: Cross-platform (Windows / Linux / macOS)
* **Web Server**: Apache (via XAMPP) or Nginx
* **PHP Engine**: PHP 8.2+
* **Database**: MySQL 8.0+ / MariaDB 10.4+
* **Frontend Runtime**: Node.js 20+, React 19, TypeScript 5.7+
* **Asset Bundler**: Vite 6
