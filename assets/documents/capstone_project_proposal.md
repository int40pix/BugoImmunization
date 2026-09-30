# DESIGN AND DEVELOPMENT OF A WEB-BASED PEDIATRIC IMMUNIZATION TRACKING, VACCINE INVENTORY MANAGEMENT, AND AUTOMATED REMINDER NOTIFICATION SYSTEM WITH QR CODE-ENABLED PATIENT RECORD MANAGEMENT

**A Capstone Project Proposal**  
Presented to  
The Faculty of the College of Information Technology  
**Tagoloan Community College**  
Tagoloan, Misamis Oriental  

In Partial Fulfillment  
Of the Requirements for the Degree  
**Bachelor of Science in Information Technology**  

**By (Team Catalyst):**  
* **ALERTA, BRANDOLPH O.**  
* **ALVAREZ, ADRIANA**  
* **BUICO, JUSTINE V.** (Project Manager)  
* **CAÑEDA, JOBERT T.**  
* **MATA, MARK LOURENCE B.**  
* **SUMILLA, ARRON GABRIEL T.**  
* **URGELLO, JOHNBERT S.**  

**Beneficiary / Client**: Barangay Bugo Health Center, Greymar, Bugo, Cagayan de Oro City, Misamis Oriental  
**Client Representative**: Elena B. Nuque (Adviser / Previous President, Bugo Health Center)  
**Capstone Coordinator / Instructor**: Neptale S. Roa III, MIT  
**Date of Submission**: MAY 2026  

---

## TABLE OF CONTENTS

| Section | Page |
| :--- | :---: |
| **TITLE PAGE** | i |
| **TABLE OF CONTENTS** | ii |
| **CHAPTER 1: BACKGROUND OF THE STUDY** | 1 |
| &nbsp;&nbsp;&nbsp;&nbsp;Project Context | 1 |
| &nbsp;&nbsp;&nbsp;&nbsp;Purpose and Description | 2 |
| &nbsp;&nbsp;&nbsp;&nbsp;Conceptual Framework | 3 |
| &nbsp;&nbsp;&nbsp;&nbsp;Objectives of the Study | 5 |
| &nbsp;&nbsp;&nbsp;&nbsp;Scope and Limitations | 6 |
| &nbsp;&nbsp;&nbsp;&nbsp;Definition of Terms | 7 |
| **CHAPTER 2: REVIEW OF RELATED LITERATURE AND STUDIES** | 10 |
| &nbsp;&nbsp;&nbsp;&nbsp;Related Literature | 11 |
| &nbsp;&nbsp;&nbsp;&nbsp;Related Studies | 14 |
| &nbsp;&nbsp;&nbsp;&nbsp;Synthesis of the Study | 16 |
| **CHAPTER 3: RESEARCH METHODOLOGY** | 17 |
| &nbsp;&nbsp;&nbsp;&nbsp;Waterfall Model Overview | 17 |
| &nbsp;&nbsp;&nbsp;&nbsp;Planning and Requirement Gathering Phase | 19 |
| &nbsp;&nbsp;&nbsp;&nbsp;System Design Phase | 19 |
| &nbsp;&nbsp;&nbsp;&nbsp;Development Phase | 20 |
| &nbsp;&nbsp;&nbsp;&nbsp;Testing Phase | 22 |
| &nbsp;&nbsp;&nbsp;&nbsp;Deployment Phase | 23 |
| &nbsp;&nbsp;&nbsp;&nbsp;Evaluation Phase | 24 |
| **REFERENCES** | 25 |
| **APPENDICES** | 28 |
| &nbsp;&nbsp;&nbsp;&nbsp;APPENDIX A: Scanned Copy of Received Letter to the Client | 28 |
| &nbsp;&nbsp;&nbsp;&nbsp;APPENDIX B: Scanned Copy of Interview Guide Questions | 29 |
| &nbsp;&nbsp;&nbsp;&nbsp;APPENDIX C: Scanned Copy of Child Immunization Record | 30 |
| &nbsp;&nbsp;&nbsp;&nbsp;APPENDIX D: Scanned Copy of Individual Treatment Record (ITR) | 31 |
| &nbsp;&nbsp;&nbsp;&nbsp;APPENDIX E: Scanned Copy of Baby's Health Record Book | 33 |
| &nbsp;&nbsp;&nbsp;&nbsp;APPENDIX F: Scanned Copy of Immunization Record from Baby's Health Book | 34 |
| &nbsp;&nbsp;&nbsp;&nbsp;APPENDIX G: Photographic Documentation of Health Center Fieldwork | 35 |

---

# CHAPTER 1: BACKGROUND OF THE STUDY

### 1.1 Project Context

Children are more vulnerable to illnesses because their immune systems are still developing, making their health a priority. Vaccination is a cost-effective way to protect children from infectious diseases, strengthen immunity, and reduce child mortality. However, challenges in immunization access and monitoring remain, highlighting the need for improved systems to ensure timely and complete vaccination (United Nations, 2015; Gavi, the Vaccine Alliance, 2023). 

Barangay Bugo Health Center is the primary healthcare facility in the community, providing services such as immunization and basic medical care. It is managed by a small team of healthcare workers who currently rely on manual record-keeping for vaccination tracking. This locale was chosen due to its active role in immunization programs and its need for a more efficient system to manage and monitor vaccination records.

One of the main problems faced by the Bugo Health Center is the lack of a proper system for monitoring vaccine supplies. Because vaccine stocks are not tracked efficiently, the health center may experience shortages that can prevent children from receiving their scheduled immunizations. This causes inconvenience for patients and their families who travel to the health center expecting vaccination services only to find that the required vaccine is unavailable. Such situations can lead to missed immunization opportunities, service delays, complaints, and reduced public trust in healthcare services. 

The health center also relies on paper records and logbooks to manage patient information, which can result in incomplete records, reporting delays, and difficulties in tracking immunization schedules. According to Rahmadhan and Handayani (2023), manual data recording increases the risk of errors, data loss, and inconsistencies that affect the accuracy and timeliness of immunization information.

To address these challenges, the study proposes the design and development of a **Web-Based Pediatric Immunization Tracking, Vaccine Inventory Management, and Automated Reminder Notification System with QR Code-Enabled Patient Record Management**. The proposed system monitors vaccine inventory in real time, tracks stock availability, and utilizes inventory thresholds to identify low-stock vaccines before shortages occur. This information supports healthcare personnel in maintaining vaccine availability and helps prevent unnecessary visits by informing parents about vaccine availability before their scheduled appointments.

The system also manages pediatric immunization records through a centralized platform and assigns a unique QR code to every registered patient. By scanning the QR code, authorized healthcare personnel can quickly access, verify, and update patient vaccination information without manually searching through paper records. The system further supports automated in-app reminder notifications for upcoming schedules, overdue vaccinations, and vaccine stock updates. Through the integration of vaccination tracking, inventory monitoring, automated reminders, and QR code-enabled record management, the proposed system aims to improve service efficiency, reduce missed opportunities for immunization, and support better healthcare delivery at Barangay Bugo Health Center.

---

### 1.2 Purpose and Description

The purpose of the proposed system is to provide a centralized web-based platform that improves pediatric immunization management, vaccine inventory monitoring, and patient record handling at Barangay Bugo Health Center. The system aims to support healthcare personnel in maintaining accurate immunization records, monitoring vaccine availability, and ensuring that vaccination services are delivered efficiently.

The system includes a **Vaccine Inventory Management Module** that tracks vaccine stocks in real time, records vaccine quantities, monitors expiration dates and lot numbers, and utilizes threshold-based alerts to identify approaching vaccine expirations (within 30 days) and low inventory levels (15 doses or fewer) before shortages occur. The module implements a First-Expired, First-Out (FEFO) allocation algorithm to prioritize older viable batches and prevent vaccine spoilage. An immutable transaction audit ledger records all balance changes (receipts, administrations, open-vial wastage, spoilage, and manual adjustments) with user attribution to guarantee strict batch and inventory accountability. The module also utilizes priority flagging to identify patients who are nearing completion of their immunization series, allowing healthcare personnel to reserve and allocate vaccines to these children when supplies are limited.

The proposed system also includes a **Vaccination Tracking Module** that records administered vaccines, monitors immunization schedules based on Department of Health (DOH) standard intervals, and maintains an interactive digital immunization card mirroring the official DOH Baby's Health Record Book. To improve efficiency in managing patient records, each registered patient is assigned a standardized unique Patient ID (`PT-XXXXXX`) and a high-contrast QR code linked directly to their profile. Authorized healthcare personnel can scan the QR code using any smartphone or web camera to instantly access, verify, and update vaccination records in one click without manually searching through logbooks.

The **Reminder and Notification Module** automatically evaluates active patient schedules and dispatches in-app portal notifications regarding upcoming vaccination appointments, overdue immunizations, low vaccine stocks, and batch expirations. The module runs scheduled background daemons every Monday at 08:00 AM to consolidate multiple eligible milestone doses for each child into a single, clean next-visit reminder, employing an anti-bloat deduplication mechanism that purges outdated reminders for the same child to keep guardian inboxes organized.

The system also features a dedicated **Guardian Portal** where parents and registered caregivers can securely log in to monitor their child's vaccination progress, view upcoming appointment schedules, inspect real-time health center vaccine stock availability, and present a digital high-contrast QR pass on mobile devices.

A **Staff Management Module** provides strict Role-Based Access Control (RBAC) across five distinct roles: Administrator, Nurse, Midwife, Barangay Health Worker (BHW), and Guardian. Administrators manage staff credentials, monitor account security, enforce mandatory password changes on first login, and moderate guardian password recovery requests through a single-pending request queue.

Finally, the **Reporting and Health Analytics Module** generates formal DOH-aligned reports, specifically:
1. **Vaccine Coverage Report**: Calculates target cohort size, completion rates per dose (Dose 1, Dose 2, Dose 3, Boosters, and Total Administered), and child line listings; filterable by date range, vaccine biologic, and dose number.
2. **Immunization Schedule Status Report**: Classifies active scheduled children as Upcoming or Overdue with exact day calculations, providing an interactive 1-click status synchronization engine.
Both reports are exportable into landscape A4 PDF format (via DomPDF) and RFC-4180 UTF-8 CSV spreadsheets.

---

### 1.3 Conceptual Framework

The conceptual framework of the proposed Web-Based Pediatric Immunization Tracking, Vaccine Inventory Management, and Automated Reminder Notification System with QR Code-Enabled Patient Record Management follows the **Input–Process–Output (IPO)** model, as shown in Figure 1.0.

```
+-----------------------------------+     +-----------------------------------+     +-----------------------------------+
|               INPUT               |     |              PROCESS              |     |              OUTPUT               |
+-----------------------------------+     +-----------------------------------+     +-----------------------------------+
| • Patient Details                 |     | • Patient Management Module       |     | • Patient QR Code                 |
| • Immunization Details            | --> | • Vaccination Tracking Module     | --> | • Digital Immunization Card       |
| • Staff & Guardian Details        |     | • Staff Management Module         |     | • Updated Vaccination Records     |
| • Vaccine Inventory Details       |     | • Vaccine Inventory Module        |     | • Vaccination Schedules           |
|                                   |     |                                   |     | • Reminder Notifications          |
|                                   |     |                                   |     | • Low-Stock Alerts                |
|                                   |     |                                   |     | • Near-Expiry Vaccine Alerts      |
|                                   |     |                                   |     | • Vaccine Inventory Reports       |
|                                   |     |                                   |     | • Vaccine Coverage Report         |
|                                   |     |                                   |     | • Immunization Schedule Status    |
|                                   |     |                                   |     |   Report                          |
|                                   |     |                                   |     | • Staff & Guardian Records        |
+-----------------------------------+     +-----------------------------------+     +-----------------------------------+
```
**Figure 1.0 Conceptual Framework (IPO Model)**

The **Input** component consists of patient demographic and birth anthropometric details (birth weight, length, head/chest circumferences, birth order, gestational maturity), DOH childhood immunization guidelines, healthcare staff and guardian account credentials, and vaccine inventory details (batch numbers, lot numbers, expiration dates, received quantities, and threshold values).

The **Process** component coordinates the four core functional modules of the system: Patient Management Module (registration, vitals profiling, and QR generation), Vaccination Tracking Module (milestone interval calculations and clinical administration), Staff Management Module (Role-Based Access Control and credential management), and Vaccine Inventory Module (First-Expired, First-Out batch tracking, stock deduction, and automatic archiving).

The **Output** component produces the patient's unique high-contrast QR code and digital health pass, the electronic Child Immunization Card (Bakuna card), updated vaccination records, dynamic vaccination schedules, consolidated next-visit reminder alerts, low-stock alerts, near-expiry alerts, vaccine inventory reports, the official Vaccine Coverage Report (PDF and CSV), the Immunization Schedule Status Report (PDF and CSV with 1-click status synchronization), and verified staff and guardian records.

---

### 1.4 Objectives of the Study

#### General Objective
The general objective of the study is to design and develop a **Web-Based Pediatric Immunization Tracking, Vaccine Inventory Management, and Automated Reminder Notification System with QR Code-Enabled Patient Record Management** for Barangay Bugo Health Center.

#### Specific Objectives
To achieve the general objective, the study will pursue the following specific objectives:

A) **Qualitative Data Gathering**: To gather data on immunization processes, recording workflows, and operational challenges through qualitative data collection techniques, including key informant interviews with health center personnel and direct observation of paper Target Client Lists (TCL) and logbook operations (UNICEF Philippines, 2024).

B) **System Modeling and Design**: To design context diagrams, Level-0 and Level-1 data flow diagrams (DFD), entity-relationship diagrams (ERD), and a multi-tier horizontal system architecture using draw.io based on standard software engineering design methodologies (JGraph Ltd, 2020).

C) **Module Development**: To develop the five core integrated modules and reporting subsystems:
1. *Patient Management Module*: Manages pediatric patient intake, birth vitals recording, standardized Patient ID (`PT-XXXXXX`) assignment, dynamic QR code generation, and guardian profile linkage (`GRD-YYYY-XXXX`).
2. *Vaccination Tracking Module*: Records administered vaccines in a single click, dynamically computes subsequent milestone dates based on DOH guidelines, maintains historical records, and renders an interactive electronic Bakuna card.
3. *Vaccine Inventory Module*: Tracks batch lots, expiration dates, and quantities using First-Expired, First-Out (FEFO) logic, records an immutable transaction audit ledger, and enforces automated daily batch archiving.
4. *Reminder and Notification Module*: Dispatches in-app portal notifications for upcoming schedules, overdue immunizations, and stock shortages, executing weekly consolidated reminder routines with anti-bloat deduplication.
5. *Staff Management and Security Module*: Governs user roles across five access levels, temporary password initial-change policies, and guardian password recovery moderation.
6. *Reporting and Health Decision Support*: Generates downloadable Vaccine Coverage Reports and Immunization Schedule Status Reports in landscape A4 PDF and RFC-4180 CSV formats.

D) **System Implementation and Technology Integration**: To implement the web application using a modern full-stack architecture comprising **ReactJS 19**, **TypeScript 5.7**, **Tailwind CSS v4**, and **Bootstrap 5 grid utilities** for a mobile-responsive interface; **Inertia.js v2** as the seamless single-page application bridge; **Laravel 12** (PHP 8.2+) for backend business logic and scheduled cron daemons; **MySQL 8.0+ / MariaDB** for relational ACID-compliant persistence; **Vite 6** as the frontend build tool; and **Visual Studio Code** as the integrated development environment (Castillon et al., 2024; Kochnev, 2023).

E) **Automated and Empirical System Testing**: To verify the system's functional correctness, security constraints, and database integrity using **PHPUnit 11** for backend automated unit, integration, and feature testing, static compilation checks with TypeScript, and manual cross-browser and physical mobile device validation (Bergmann, 2023).

F) **Standardized Software Evaluation**: To evaluate the system's usability, efficiency, and reliability in managing pediatric immunization records, vaccine inventory, reminder notifications, and patient record management using survey questionnaires administered to Barangay Health Workers (BHWs), midwives, nurses, and parents based on the **ISO/IEC 25010** software quality standard.

---

### 1.5 Scope and Limitations

The study focuses on the design and development of a Web-Based Pediatric Immunization Tracking, Vaccine Inventory Management, and Automated Reminder Notification System with QR Code-Enabled Patient Record Management for Barangay Bugo Health Center, Greymar, Bugo, Cagayan de Oro City.

The system provides:
1. Complete pediatric profile intake, birth anthropometrics recording, and automated generation of standardized Patient IDs and high-contrast QR codes.
2. QR code scanning via desktop webcams, smartphones, and Android tablet cameras for instant, search-free patient record retrieval.
3. Clinical dose administration with atomic stock deduction and automated DOH milestone interval calculation.
4. Vaccine inventory management enforcing First-Expired, First-Out (FEFO) batch allocation, threshold-based alerts (low stock $\le 15$ doses, near-expiry $\le 30$ days), an immutable transaction audit ledger, and daily automated batch archiving.
5. In-app portal notification engine dispatching weekly consolidated visit reminders and stock warnings.
6. Dedicated Guardian Portal for parents to view digital Bakuna cards, upcoming visits, real-time vaccine availability, and digital QR passes.
7. Formal health analytics generating exportable Vaccine Coverage and Schedule Status reports in PDF and CSV.
8. Role-Based Access Control across five roles: Administrator, Nurse, Midwife, Barangay Health Worker, and Guardian.

**Limitations**:
1. **Clinical and Financial Scope**: The system does not provide medical diagnosis, clinical treatment prescribing, pharmaceutical sales, or billing and financial accounting services.
2. **External Integration**: The system does not include automated data synchronization with national or external health platforms (such as DOH FHSIS or PhilHealth). Transferred patients from other barangays require manual encoding of previous immunization records by health workers.
3. **Hardware Temperature Tracking Exclusion**: The system focuses strictly on digital vaccine inventory management (batch lot numbers, expiration dates, dose quantities, and FEFO stock rotation) and does not interface with physical IoT hardware, refrigeration sensors, or continuous temperature monitoring devices. Health center temperature compliance and cold-storage monitoring follow standard manual DOH health center protocols.
4. **Local Clinic Hosting and Connectivity**: To ensure uninterrupted clinic operations during community internet outages, the system is designed to be hosted on a local clinic server accessible over the health center's Local Area Network (LAN). Under local LAN deployment, healthcare staff can continue recording vaccinations and managing inventory without public internet access. However, external parent access to the online Guardian Portal and web notification delivery require active internet connectivity.
5. **Digital Device Accessibility**: For parents and caregivers without access to mobile smartphones or digital devices, the health center issues physical printed copies of the child's immunization card with the system-generated QR code attached.

---

### 1.6 Definition of Terms

* **ACID Transactions**. Database operations ensuring Atomicity, Consistency, Isolation, and Durability. In this study, ACID transactions guarantee that clinical dose administration and inventory stock decrement occur simultaneously and reliably without data corruption.
* **Barangay Health Center**. A primary community healthcare facility that delivers basic health services, maternal and child healthcare, and routine pediatric immunizations to barangay residents.
* **Electronic Bakuna Card**. A digital, interactive health record that mirrors the official Department of Health (DOH) Child Immunization Record and Baby's Health Record Book, displaying completed and upcoming vaccine doses.
* **First-Expired, First-Out (FEFO)**. An inventory management algorithm that prioritizes the allocation and administration of vaccine batches with the earliest expiration dates to minimize wastage and spoilage.
* **Guardian Portal**. A dedicated web-based user interface allowing verified parents and caregivers to securely log in, view their child's digital Bakuna card, inspect health center vaccine availability, and view upcoming appointments.
* **Immutable Audit Ledger**. A non-destructible database record (`vaccine_inventory_transactions`) that logs every inventory modification—including stock receipts, clinical administrations, wastage, spoilage, and reconciliations—with user attribution and balance snapshots.
* **Inertia.js**. A client-side routing and adapter library that connects Laravel backend controllers directly with React components, eliminating REST API boilerplate while maintaining single-page application performance.
* **ISO/IEC 25010**. An international software quality evaluation standard used to assess the system across criteria including functional suitability, usability, performance efficiency, and reliability.
* **Milestone Scheduling**. The algorithmic calculation of prospective vaccination dates based on a child's birth date and official Philippine DOH Expanded Program on Immunization (EPI) guidelines.
* **PHPUnit**. An automated testing framework for PHP used in this study to execute 66 automated unit, integration, and feature test cases to ensure backend reliability.
* **Portal Reminders**. Automated in-app notifications generated within the system portal to notify guardians and staff regarding upcoming visits, overdue immunizations, and stock shortages.
* **QR Code (Quick Response Code)**. A two-dimensional matrix barcode containing encoded patient identification data that allows healthcare workers to retrieve patient records instantly through camera scanning.
* **Role-Based Access Control (RBAC)**. A security mechanism that restricts system features and administrative data access based on authorized user roles (Administrator, Nurse, Midwife, BHW, and Guardian).
* **Vaccine Coverage Report**. A health analytics report that calculates target cohorts, dose completion rates, and child line listings filterable by date range, vaccine biologic, and dose number.
* **Vaccine Inventory Threshold**. A predetermined numerical boundary (such as $\le 15$ doses for stock or $\le 30$ days for expiration) that automatically triggers warning alerts for health center staff.

---

# CHAPTER 2: REVIEW OF RELATED LITERATURE AND STUDIES

### 2.1 Introduction

This chapter reviews relevant literature and empirical studies related to pediatric immunization tracking, vaccine inventory management, electronic health records, QR code technology, automated notifications, and digital healthcare information management. The discussion establishes the theoretical and technological foundation of the proposed project, identifies strengths and limitations in existing implementations, and clarifies the technical rationale for the features developed for Barangay Bugo Health Center.

---

### 2.2 Related Literature

**Electronic Health Record Systems (EHR)**: Electronic health records serve as digital platforms that store and manage patient medical information in healthcare institutions. Paper-based documentation frequently results in illegible records, incomplete fields, and substantial retrieval delays. Wurster et al. (2022) demonstrated that digital patient record systems significantly enhance clinical documentation quality by organizing patient data into standardized, accessible formats. Furthermore, Kodama et al. (2023) highlighted that electronic medical systems streamline routine clinical workflows and alleviate administrative burdens on nursing personnel. These findings directly support the development of a digital, QR-assisted record system for Barangay Bugo Health Center to overcome traditional logbook bottlenecks.

**Electronic Immunization Registries (EIR)**: Electronic Immunization Registries are specialized health information systems designed to record, track, and consolidate vaccination histories across patient cohorts. Othman et al. (2026) emphasized that EIRs are essential instruments for achieving immunization equity, particularly in low- and middle-income communities, by enabling real-time monitoring and identifying under-immunized or zero-dose children. Similarly, Sheel et al. (2025) reported that electronic registries enhance vaccination coverage analytics, facilitate prompt follow-up of children with missed doses, strengthen data accuracy, and assist public health decision-makers. These studies validate the need for an integrated immunization registry at the barangay level that links patient profiles with live inventory data.

**QR Code Technology in Healthcare**: Quick Response (QR) codes offer a rapid, contactless mechanism for data retrieval and patient identification. Turamari (2022) found that QR technology drastically simplifies information access and improves service delivery speeds. Stephen (2023) demonstrated that QR-assisted data retrieval significantly improves user experience and minimizes manual lookup times. In community pediatric contexts, Akuoko (2022) documented that QR-enabled health materials allow parents to rapidly access age-specific vaccination information and clinical guidelines. In this study, QR technology is leveraged to provide single-scan patient retrieval and digital health passes for guardians visiting the clinic.

**Automated Reminder and Notification Systems**: Automated notification systems deliver timely alerts regarding clinical appointments and immunization schedules. Wagner et al. (2021) demonstrated through a randomized controlled trial that automated reminder interventions substantially improve childhood vaccination timeliness and adherence by notifying parents before scheduled dates. The study verified that proactive appointment reminders significantly reduce default rates and prevent missed vaccination opportunities. In this project, an automated reminder daemon executes weekly to generate consolidated appointment alerts for parents.

**Personnel Management and Access Control in Healthcare**: Administrative and personnel tracking systems are critical for maintaining operational security and accountability in healthcare centers. Castillon et al. (2024) underscored that role-based personnel systems improve administrative transparency, access control, and staff coordination. In the proposed system, a dedicated Staff Management Module enforces Role-Based Access Control (RBAC), initial password modification requirements, and supervised password reset procedures.

---

### 2.3 Related Studies

**Patil et al. (2026)** developed *Vaccicare+*, a centralized digital platform in Pune, India, for managing pediatric vaccination schedules with QR-based data retrieval. While the system improved healthcare delivery and reduced missed appointments, its operational model assumed a high-resource hospital environment and high technological literacy among parents. In contrast, the Barangay Bugo project is specifically tailored for a community health center operating under resource constraints, utilizing a staff-managed workflow where nurses, midwives, and BHWs manage intake while parents access a straightforward, mobile-friendly guardian portal.

**Malik et al. (2026)** evaluated a digital monitoring tool in Lahore to track routine immunization coverage and zero-dose children. A key finding of the study was that patient tracking suffered due to the absence of unique, persistent child identifiers across mobile populations, leading the authors to recommend standardized unique patient codes. The Bugo system implements this recommendation through its Patient Management Module, which assigns a standardized unique Patient ID (`PT-XXXXXX`) and a permanent QR code to every child upon registration.

**Fajardo et al. (2025)** developed the *KidGuard Vaccination & Information Hub* for the Peñaranda Rural Health Unit in Nueva Ecija, achieving high usability scores for localized report generation. However, the system was tightly coupled to the specific administrative workflows of Peñaranda RHU. The Bugo Immunization System adapts this concept by creating specialized administrative reporting engines—specifically the Vaccine Coverage Report and the Immunization Schedule Status Report—designed to address the administrative reporting habits and DOH documentation requirements of Barangay Bugo Health Center.

**Angni et al. (2025)** implemented a *Health Services Monitoring System with Automatic Notification* for Barangay Kauswagan Health Center in Cagayan de Oro City. The system successfully transitioned the clinic from paper records to a digital platform, reducing average record retrieval times from five minutes to under one minute and achieving an 85% staff approval rating. However, the Kauswagan study relied on manual search inputs rather than quick-response hardware scanning. The Bugo system builds upon the Kauswagan findings by integrating a camera-based QR code scanning workflow, enabling search-free record access even during heavy clinic patient volume.

**Castillon et al. (2024)** developed a web-based *Immunization Management Information System* in Southern Mindanao to modernize vaccine inventory and pediatric records. While the system organized stock management effectively, the authors identified a limitation in tracking patient compliance, recommending the future implementation of automated alert features for overdue appointments. The Bugo project directly addresses this gap by incorporating automated background schedulers that detect overdue milestones and issue targeted notifications to guardians and staff.

**Batoon et al. (2022)** designed a *Public Health Record Management System (PHRMS)* for the health center in Sto. Rosario, Bulacan. While the system demonstrated high security and reduced physical file retrieval times, it still depended on text-based database search queries. The Bugo project eliminates manual search delays by implementing dynamic QR codes that link directly to the child's profile and electronic Bakuna card.

---

### 2.4 Synthesis of the Study

The reviewed literature and related studies highlight the essential role of digital information systems in modernizing healthcare operations, enhancing patient record accessibility, improving immunization timeliness, and optimizing inventory management. Transitioning from paper logbooks to digital platforms consistently reduces recording errors, eliminates misplaced records, and accelerates clinical intake. 

Existing research illustrates clear technological patterns: Electronic Immunization Registries support comprehensive coverage tracking; QR code mechanisms eliminate manual lookup bottlenecks; automated reminder dispatchers enhance parental adherence; and structured staff management frameworks safeguard institutional data integrity.

However, several critical gaps remain across existing community systems. Prior implementations often lacked real-time integration between clinical administration and vaccine inventory stock deduction, relied on text searches rather than contactless QR scanning, lacked automated overdue schedule detection, or assumed high digital literacy among parents. Furthermore, many systems omitted automated batch expiration tracking and First-Expired, First-Out (FEFO) stock rotation.

The proposed Web-Based Pediatric Immunization Tracking, Vaccine Inventory Management, and Automated Reminder Notification System with QR Code-Enabled Patient Record Management addresses these limitations in an integrated solution. By combining QR-based patient intake, atomic clinical dose recording, FEFO-driven inventory management, automated weekly visit reminders, comprehensive coverage reporting, and a dedicated Guardian Portal within a unified platform, the system delivers a tailored, practical, and sustainable healthcare management tool for Barangay Bugo Health Center.

---

# CHAPTER 3: RESEARCH METHODOLOGY

### 3.1 Software Development Life Cycle: The Waterfall Model

The study adopts the **Waterfall Model** (Ardiansyah et al., 2022; Pratrian et al., 2024; Davies et al., 2023) as the Software Development Life Cycle (SDLC) framework. The Waterfall model provides a structured, sequential engineering approach that requires each phase to be systematically executed, documented, and verified before progressing to the subsequent stage. This linear methodology is particularly suited for healthcare software development, where data integrity, clinical safety, role permissions, and regulatory compliance require fixed specifications and rigorous verification prior to production deployment.

```
+------------------------------------------+
| 1. Planning & Requirement Gathering      |
+--------------------+---------------------+
                     |
                     v
+--------------------+---------------------+
| 2. System Design Phase                   |
+--------------------+---------------------+
                     |
                     v
+--------------------+---------------------+
| 3. Development Phase                     |
+--------------------+---------------------+
                     |
                     v
+--------------------+---------------------+
| 4. Testing Phase                         |
+--------------------+---------------------+
                     |
                     v
+--------------------+---------------------+
| 5. Deployment Phase                      |
+--------------------+---------------------+
                     |
                     v
+--------------------+---------------------+
| 6. Evaluation Phase                      |
+------------------------------------------+
```
**Figure 2.0 Modified Waterfall Model Architecture (Ardiansyah et al., 2022)**

The six sequential phases of the modified Waterfall model adopted for the Barangay Bugo Immunization System are structured as follows:

---

### 3.2 Phase 1: Planning and Requirement Gathering Phase

During the Planning and Requirement Gathering Phase, the proponents conducted baseline qualitative research to understand existing immunization workflows, record-keeping practices, and operational challenges at Barangay Bugo Health Center.

* **Key Activities**:
  - Conducting structured key informant interviews with the health center head, registered nurses, clinic midwives, and Barangay Health Workers (BHWs).
  - Inspecting physical Target Client Lists (TCL), handwritten Baby's Health Record Books, and manual vaccine stock ledgers.
  - Observing walk-in patient intake, triage procedures, and vaccine administration workflows during scheduled immunization days.
  - Reviewing official Department of Health (DOH) Expanded Program on Immunization (EPI) guidelines.
* **Tools Used**: Semi-structured Interview Guides and Observation Checklists.
* **Outputs**: A formal System Requirements Specification (SRS) detailing five core functional modules, user role permissions, inventory threshold requirements, and clinical data flow requirements.

---

### 3.3 Phase 2: System Design Phase

In the System Design Phase, the gathered requirements were translated into formal architectural blueprints, database schemas, and interface wireframes.

* **Key Activities**:
  - Designing a Multi-Tier Horizontal System Architecture separating the Presentation Layer, Application Layer, and Database Layer.
  - Constructing a System Context Diagram (Level-0 DFD) modeling external entity interactions (Healthcare Staff, Guardians, System Schedulers, and Health Authorities).
  - Constructing a Level-1 Data Flow Diagram decomposing the platform into 7 core processes (1.0 to 7.0) and 9 normalized data stores (D1 to D9).
  - Engineering a normalized Entity-Relationship Diagram (ERD) containing 14 relational tables with primary keys, foreign key constraints, cascading policies, and indexing strategies.
  - Designing responsive UI wireframes and user interaction layouts for clinic desktop workstations, triage tablets, and guardian mobile viewports.
* **Tools Used**: Draw.io (JGraph Ltd, 2020) for software architectural modeling and schema visualization.
* **Outputs**: Formal architectural diagrams (`figure_3_0_system_architecture_multitier.drawio`), Entity-Relationship Diagram (`figure_3_3_entity_relationship_diagram.drawio`), Level-0 and Level-1 DFDs, and UI design mockups.

---

### 3.4 Phase 3: Development Phase

In the Development Phase, the technical architecture was engineered into functional software following a 3-tier web architecture:

```
+=======================================================================================================================+
|                                        CLIENT TIER (PRESENTATION LAYER)                                               |
+=======================================================================================================================+
|  Clinic Desktop Workstations           Health Center Mobile Tablets              Guardian Mobile Smartphones          |
|  * Admin & Nurse Desk (1920x1080)      * Midwife & BHW Triage (1024x768)        * Parent Digital Portal (390x844)     |
|  * High-speed clinical entry           * Touchscreen vitals & attendance        * Child Bakuna Card & QR display      |
|                                                                                                                       |
|  Presentation Components: ReactJS 19 + TypeScript 5.7 + Tailwind CSS v4 + Bootstrap 5 Grid + Radix UI                |
|  * Interactive Child Bakuna Health Card                  * Dynamic QR Code Generator (qrcode.react)                   |
|  * Camera-Based QR Code Scanner (html5-qrcode)           * Batch Wastage & Stock Adjustment Modals                    |
|  * Health Reporting Hub (Coverage & Schedule Status)     * In-App Interactive Notification Center                     |
+===========================================================+===========================================================+
                                                            |
                                        HTTPS / TLS 1.3     |  Inertia.js v2 SPA Protocol
                                        JSON / Form-Data    |  Landscape A4 PDF & RFC-4180 CSV Streams
                                                            v
+=======================================================================================================================+
|                                    APPLICATION TIER (APPLICATION & LOGIC LAYER)                                       |
+=======================================================================================================================+
|  Web Server Gateway: Apache 2.4 / Nginx + PHP 8.2+ FastCGI (Laravel 12 Framework)                                     |
|                                                                                                                       |
|  * HTTP Routing & RBAC Middleware: Role authorization, temporary password enforcement, single-pending reset rules     |
|  * Core Controllers: PatientController, ImmunizationController, VaccineInventoryController, ReportController          |
|  * Domain Services: VaccineSchedulingPriorityService, VaccineInventoryService (FEFO), AutomatedReminderDispatcher    |
|  * Reporting Engine: Barryvdh DomPDF facade (Landscape A4) and RFC-4180 CSV UTF-8 BOM streamer                       |
|                                                                                                                       |
|  Automated Background Cron Daemons:                                                                                   |
|  * 05:55 AM Daily: 'inventory:auto-archive' (Retires expired & depleted lots with audit logs)                         |
|  * 06:00 AM Daily: 'generate-vaccine-schedules' (Reconciles schedules & priorities against live inventory)            |
|  * 06:10 AM Daily: 'inventory:check-alerts' (Issues Low Stock, Stockout, and Near-Expiry notifications)               |
|  * 08:00 AM Mondays: 'visits:send-reminders' (Dispatches consolidated next-visit reminder alerts to guardians)       |
+===========================================================+===========================================================+
                                                            |
                                        PDO / SQL Engine    |  ACID Transaction Boundaries
                                        Port 3306 (TCP)     |  Prepared Statement Execution
                                                            v
+=======================================================================================================================+
|                                      DATA TIER (PERSISTENCE & STORAGE LAYER)                                          |
+=======================================================================================================================+
|  Relational Database Management System: MySQL 8.0+ / MariaDB 10.4+ (Database: `bugo_immunization`, InnoDB Engine)     |
|  14 Normalized Tables:                                                                                                |
|  * Authentication & RBAC: roles, users, password_reset_requests                                                       |
|  * Demographics & Family: guardians, patients                                                                         |
|  * Vaccine Catalog: vaccines, vaccine_schedules, patient_vaccines                                                     |
|  * Vaccine Inventory: vaccine_inventories, vaccine_inventory_transactions                                             |
|  * Clinical & Schedules: patient_vaccine_schedules, immunization_records, patient_immunization_card_rows              |
|  * Notification Engine: notifications                                                                                 |
+=======================================================================================================================+
```
**Figure 3.0 Multi-Tier Horizontal System Architecture**

* **Presentation Layer (Client Tier)**:
  - Engineered using **ReactJS 19** with **TypeScript 5.7** for strict type verification and prevention of client-side runtime exceptions.
  - Styling utilizes **Tailwind CSS v4** combined with **Bootstrap 5 grid utilities** and **Radix UI** primitives, ensuring a mobile-responsive interface accessible across desktop workstations, clinic tablets, and guardian smartphones.
  - **Inertia.js v2** serves as the application bridge, providing single-page application (SPA) responsiveness without the complexity of traditional REST API boilerplate.
  - Contactless camera scanning is implemented using `html5-qrcode`, while dynamic QR code generation is handled by `qrcode.react`.
  - The build process is automated via **Vite 6** through the `laravel-vite-plugin`.

* **Application Layer (Logic Tier)**:
  - Developed using the **Laravel 12** framework running on **PHP 8.2+**.
  - Implements domain services for clinical logic:
    - *VaccineSchedulingPriorityService*: Dynamically computes subsequent milestone dates according to Philippine DOH intervals and flags priority patients nearing series completion.
    - *VaccineInventoryService*: Enforces First-Expired, First-Out (FEFO) batch selection, maintains the immutable transaction ledger, and triggers alerts when stock falls below $\le 15$ doses or expires within $\le 30$ days.
    - *Automated Background Daemons*: Configured via Laravel's console kernel to execute four automated routines:
      1. Daily at 05:55 AM: `inventory:auto-archive` automatically archives expired and zero-stock batches.
      2. Daily at 06:00 AM: Reconciles scheduled appointments against inventory.
      3. Daily at 06:10 AM: Evaluates stock levels and issues low-stock and near-expiry alerts to staff.
      4. Weekly on Mondays at 08:00 AM: `visits:send-reminders` evaluates scheduled visits for the week, consolidates multiple milestone doses into a single visit reminder per child, and overwrites outdated notifications to keep guardian inboxes clean.
  - Reporting is powered by **Barryvdh DomPDF** for landscape A4 PDF documents and an RFC-4180 compliant CSV streaming engine with UTF-8 Byte Order Marks (BOM).

* **Database Layer (Persistence Tier)**:
  - Powered by **MySQL 8.0+ / MariaDB** using the `InnoDB` storage engine to enforce full ACID compliance.
  - The schema is composed of **14 normalized relational tables** categorized into Authentication, Demographics, Vaccine Catalog, Inventory, Clinical Records, and Notifications.
  - Compound indexing is applied on frequent query paths (e.g., `['scheduled_date', 'status']`, `['vaccine_id', 'created_at']`), ensuring sub-second query execution across thousands of pediatric records.

---

### 3.5 Phase 4: Testing Phase

During the Testing Phase, the proponents subjected the system to automated and manual testing methodologies to verify functional accuracy, data consistency, and system stability.

* **Automated Backend Testing with PHPUnit 11**:
  - The backend was tested using a comprehensive automated test suite consisting of **66 automated test cases** and **310 assertions**, achieving a **100% pass rate with zero failures**.
  - *Unit Tests*: Verified date formatting utilities, age calculation algorithms, standardized Patient ID format pattern generation (`PT-XXXXXX`), and batch auto-archiving notification payloads.
  - *Integration Tests*: Verified guardian portal views, real-time stock visibility, Bakuna card rendering, and dynamic next-visit scheduling interval calculations.
  - *System & Feature Tests*: Validated user authentication, role-based redirection, temporary password forced updates, single-pending password reset constraints, patient registration, atomic inventory adjustments, wastage logging, and export pipelines for Vaccine Coverage and Schedule Status reports.
* **Static Typing & Build Verification**:
  - Executed static type checking across all frontend TypeScript files via `npx tsc --noEmit`, completing with **0 errors**.
  - Successfully compiled production frontend bundles using Vite 6 without bundling conflicts.
* **Manual Cross-Browser & Device Verification**:
  - Validated interface responsiveness and camera QR scanning across Google Chrome, Microsoft Edge, Mozilla Firefox, and physical Android mobile devices at various screen resolutions (desktop, tablet, mobile).

---

### 3.6 Phase 5: Deployment Phase

The Deployment Phase involves installing, configuring, and establishing the operational environment for the system at Barangay Bugo Health Center.

* **Local Clinic Server Deployment**:
  - To safeguard clinic operations against internet outages, the web application is hosted on a designated clinic web server using XAMPP (Apache 2.4, PHP 8.2+, MySQL 8.0+).
  - Workstations and tablets within the health center access the platform through the health center's Local Area Network (LAN), allowing uninterrupted patient intake, QR scanning, and dose recording.
* **Migration and Configuration**:
  - Historical patient records, active child profiles, and baseline vaccine inventories are migrated from manual paper Target Client Lists (TCL) into the relational MySQL database using automated database seeding and migration scripts (`restore_database.bat`).
  - Production frontend assets are compiled into `backend/public/build` for optimized local HTTP delivery.
  - Automated concurrent startup scripts (`start_project.bat`) enable one-click server initialization.
* **Network & Portal Connectivity**:
  - External internet access enables registered parents to log into the online Guardian Portal and receive in-app appointment notifications.

---

### 3.7 Phase 6: Evaluation Phase

In the Evaluation Phase, the proponents systematically evaluate the software's quality, usability, and operational acceptability using the **ISO/IEC 25010 Software Product Quality Model** (Fajardo et al., 2025; Zhao et al., 2024).

* **Evaluation Participants**:
  - Healthcare Personnel: Health Center Physician, Public Health Nurses, Midwives, and Barangay Health Workers (BHWs) actively conducting immunization clinics.
  - End-Users: Parents and legal guardians enrolled in the system.
* **Evaluation Criteria (ISO/IEC 25010)**:
  1. *Functional Suitability*: Completeness and correctness of patient registration, QR retrieval, dose administration, inventory tracking, and reporting.
  2. *Performance Efficiency*: Speed of record retrieval via QR scan versus manual logbook search, and response times of report generation.
  3. *Usability*: Ease of navigation, interface clarity, and ease of operating the digital Bakuna card and scanner.
  4. *Reliability & Security*: Data persistence under atomic transactions, role-based boundary enforcement, and audit accountability.
* **Instruments & Analysis**:
  - Structured survey questionnaires based on a 5-point Likert scale.
  - Statistical analysis including mean, standard deviation, and percentage acceptability scores to validate the system's operational efficacy.

---

# REFERENCES

### Conference Papers
* Angni, H. S., Sigua, N. L., Gumahad, J. D., Asilo, J. M. M., Trazo, R. K. C., & Ferrariz, J. O. (2025). Health services monitoring system with automatic notification for Brgy Kauswagan. In *1st International Conference - INNOVEX 2025* (Vol. 1). Horizon University Indonesia. https://kms-fict.horizon.ac.id/ojs/index.php/innovex/article/view/7/8
* Davies, J., Mann, N., Nguyen, N., Chanane, N., Eberhard, S., Cui, J., Winters, A., Kang, K., & Andreassen, H. (2023, December). Leveraging agile and waterfall project management approaches in educational design [Poster presentation]. *Australasian Society for Computers in Learning in Tertiary Education Conference*, Christchurch, New Zealand. https://doi.org/10.14742/apubs.2023.522

### Institutional Publications
* Akuoko, T. W. (2022, August). *Reach out and read: Expanding child immunization and oral health literacy using quick response codes in pediatric clinics in North Carolina* (Doctor of Nursing Practice project, East Carolina University). East Carolina University Scholarship. https://thescholarship.ecu.edu/server/api/core/bitstreams/95500e75-65cc-44c9-a3e4-8c0862909ef8/content
* United Nations Children's Fund (UNICEF) Philippines & Evobiota Consultancy Corporation. (2024). *Qualitative study on routine immunization in selected regions in the Philippines*. UNICEF Philippines. https://www.unicef.org/philippines/reports/qualitative-study-routine-immunization
* United Nations. (2015). *Goal 3: Ensure healthy lives and promote well-being for all at all ages*. United Nations Sustainable Development Goals. https://sdgs.un.org/goals/goal3

### Preprints
* Malik, M. Z., Mian, N., Memon, Z., Mirza, M. W., Rana, U. F., Alvi, M. A., Ahmed, W., Ummad, A., Ali, A., Naveed, U., Malik, K. S., Chaudhary, M. S., Waheed, M., & Sattar, A. (2026). Digital monitoring and action planning to reach zero-dose and under-immunised children: Leveraging data for targeted immunisation responses. *medRxiv*. https://doi.org/10.1101/2026.03.03.26346932

### Journal Articles
* Ardiansyah, A., Pratmanto, D., & Aji, S. (2022). Sistem Informasi Jasa Servis Printer Dengan Metode Waterfall. *Indonesian Journal on Software Engineering (IJSE)*, 8(1), 35–42. http://ejournal.bsi.ac.id/ejurnal/index.php/ijse18
* Batoon, J. A., Benitez, A. B., Cajucom, K. Z., Dalusung, M. J. M., Faustino, S. J. D., Galvez, I. N. D., & Mercado, L. J. L. (2022). Public Health Record Management System (PHRMS) for the Barangay Health Center of Sto. Rosario. *International Journal of Advanced Trends in Computer Science and Engineering*, 11(3), 112–118. https://doi.org/10.30534/ijatcse/2022/041132022
* Castillon, R., Jr., Alonzo, Z. E., Vesorio, G. B., & Catedrilla, J. M. (2024). Strengthening public child healthcare: Development of an immunization management information system for a local community in Southern Mindanao, Philippines. *Journal of Health Research Studies*, 4(1), 32–45. https://journal-msugensan.org/index.php/JHRS/article/view/62/39
* Fajardo, M. R. M. R., Matalote, J. M. M., Quizon, C. N., Galang, D. M. G., Gonzales, J. M., & Bulaclac, J. R. (2025). KidGuard Vaccination & Information Hub: A localized digital immunization hub for Peñaranda, Nueva Ecija. *International Journal of Innovative Science and Research Technology (IJISRT)*, 10(9), 1351–1360. https://www.ijisrt.com/assets/upload/files/IJISRT25SEP1351.pdf
* Gavi, the Vaccine Alliance. (2023). *Annual progress report 2023: Building resilient routine immunization systems*. Gavi Alliance. https://www.gavi.org/progress-report
* Kodama, K., Konishi, S., Manabe, S., Okada, K., Yamaguchi, J., Wada, S., Sugimoto, K., Itoh, S., Takahashi, D., Kawasaki, R., Matsumura, Y., & Takeda, T. (2023). Impact of an electronic medical record–connected questionnaire on efficient nursing documentation: Usability and efficacy study. *JMIR Nursing*, 6, e51303. https://doi.org/10.2196/51303
* Othman, Z. K., Ahmed, M. M., Okesanya, O. J., Musa, S. S., & Lucero-Prisno, D. E., III. (2026). Digital vaccines for immunization equity: An approach to strengthen vaccine delivery and public trust in low- and middle-income countries. *JAMIA Open*, 9(2), ooag045. https://doi.org/10.1093/jamiaopen/ooag045
* Patil, K., Fartade, P., Kulkarni, H. R., & Lokhande, V. (2026). Vaccicare+: A centralized digital vaccination management system. *Journal of Emerging Technologies and Innovative Research*, 13(1), 75–82. https://www.jetir.org/papers/JETIRHG06075.pdf
* Prasetyo, E., & Putra, A. (2021). Implementasi Waterfall Model Dalam Pengembangan Sistem Informasi Eksekutif Penduduk. *Journal of Information Systems and Informatics*, 3(1), 120–131. http://journal-isi.org/index.php/isi
* Pratrian, Y., Hendriyan, Y., & Kahfi, A. H. (2024). Development of web and mobile health services information system using waterfall method. *Computer Science (CO-SCIENCE)*, 6(1), 39–47. https://doi.org/10.31294/co-science.v6i1.10072
* Rahmadhan, F., & Handayani, P. W. (2023). Factors affecting user acceptance of health center management information systems. *Healthcare Informatics Research*, 29(3), 215–226. https://doi.org/10.4258/hir.2023.29.3.215
* Sheel, M., Sheridan, S., & Arcos, A. (2025). Strengthening immunization registries in primary healthcare settings: A systematic review. *The Lancet Global Health*, 13(4), e612–e624. https://doi.org/10.1016/S2214-109X(24)00450-X
* Stephen, G. (2023). QR code and their application in academic libraries. *International Journal of Information Management*, 8(2), 1–6.
* Turamari, R. N. (2022). QR code and their application in academic libraries. *SSRN Electronic Journal*. https://doi.org/10.2139/ssrn.4461104
* Wagner, N. M., Dempsey, A. F., Narwaney, K. J., Gleason, K. S., Kraus, C. R., Pyrzanowski, J., & Glanz, J. M. (2021). Addressing logistical barriers to childhood vaccination using an automated reminder system and online resource intervention: A randomized controlled trial. *Vaccine*, 39(29), 3983–3990. https://doi.org/10.1016/j.vaccine.2021.05.068
* Wang, W. (2026). Influencing factors of individuals' willingness to share public health data in big data-driven healthcare: An empirical study. *Frontiers in Public Health*, 14(1), 1795–1808. https://doi.org/10.3389/fpubh.2026.1795026
* Wurster, F., Fütterer, G., Beckmann, M., Dittmer, K., Jaschke, J., Köberlein-Neu, J., Okumu, M.-R., Rusniok, C., Pfaff, H., & Karbach, U. (2022). The analyzation of change in documentation due to the introduction of electronic patient records in hospitals—A systematic review. *Journal of Medical Systems*, 46(8), 54. https://doi.org/10.1007/s10916-022-01840-0
* Zhao, X., Zhang, Y., & Liu, H. (2024). Empirical evaluation of digital healthcare systems using ISO/IEC 25010 product quality standards. *Computers in Biology and Medicine*, 170, 107954. https://doi.org/10.1016/j.compbiomed.2024.107954

### Software & Standard Citations
* Bergmann, S. (2023). *PHPUnit: The PHP testing framework* (Version 11) [Computer software]. https://phpunit.de/
* ISO/IEC 25010. (2011). *Systems and software engineering — Systems and software Quality Requirements and Evaluation (SQuaRE) — System and software quality models*. International Organization for Standardization. https://www.iso.org/standard/35733.html
* JGraph Ltd. (2020). *draw.io (Version 6.4.2) [Computer software]*. https://www.drawio.com
* Kirvan, P., Lutkevich, B., & Lewis, S. (2024, November 15). *What is the Waterfall model?* TechTarget. https://www.techtarget.com/searchsoftwarequality/definition/waterfall-model

---

# APPENDICES

### APPENDIX A: Scanned Copy of Received Letter to the Client
*Client*: Elena B. Nuque (Adviser / Previous President, Bugo Health Center)  
*Date of Letter*: March 14, 2026  
*Institution*: Tagoloan Community College, Baluarte, Tagoloan, Misamis Oriental  
*Signatories*: Justine V. Buico (Project Manager), Neptale S. Roa III, MIT (Capstone Project 01 Coordinator / Instructor)  
*(Refer to physical document scan in manuscript records: Page 28)*

### APPENDIX B: Scanned Copy of Interview Guide Questions
*Client Acknowledgment*: Signed consent and interview agreement by Elena B. Nuque (Dated March 14, 2026).  
*Scope of Instrument*: 20 research questions covering patient intake, current manual challenges, reminder protocols, vaccine storage and stock shortages, staff device access, and data privacy safeguards.  
*(Refer to physical document scan in manuscript records: Page 29)*

### APPENDIX C: Scanned Copy of Child Immunization Record
*Official DOH Form*: Department of Health Child Immunization Record (EPI Program).  
*Key Vaccines Documented*: BCG, Hepatitis B, Pentavalent (DPT-Hep B-HiB 1-3), Oral Polio Vaccine (OPV 1-3), Inactivated Polio Vaccine (IPV 1-2), Pneumococcal Conjugate Vaccine (PCV 1-3), and Measles, Mumps, Rubella (MMR 1-2).  
*(Refer to physical document scan in manuscript records: Page 30)*

### APPENDIX D: Scanned Copy of Individual Treatment Record (ITR)
*Health Center Form*: Integrated Clinic Information System (ICLINICSYS) Individual Treatment Record.  
*Content*: Patient identification, anthropometrics (weight, height, BP), clinical consultation details, maternal history, child delivery vitals, and immunization administration logs (Front & Back).  
*(Refer to physical document scan in manuscript records: Pages 31–32)*

### APPENDIX E: Scanned Copy of Baby's Health Record Book
*Clinical Booklet*: Talaan ni Baby (Department of Health).  
*Sample Intake Record*: Child John Jacob A. Fabre (DOB: October 20, 2024; Mother: Nieva A. Alerta; Father: Johny G. Fabre; Birth Weight: 2.67 kg; Attendant: Dr. Manila).  
*(Refer to physical document scan in manuscript records: Page 33)*

### APPENDIX F: Scanned Copy of Immunization Record from Baby's Health Book
*Recorded Doses*: Actual clinical entries showing administration dates for BCG (NMMC), Hepatitis B, Pentavalent 1-3, OPV 1-3, IPV, PCV 1-3, and MMR with Vitamin A drops.  
*(Refer to physical document scan in manuscript records: Page 34)*

### APPENDIX G: Photographic Documentation of Health Center Fieldwork
*Site Visit Documentation*: Proponents (Team Catalyst) conducting on-site observation, key informant interviews, and clinic workflow assessment at Barangay Bugo Health Center, Cagayan de Oro City.  
*(Refer to physical photo records: Page 35)*
