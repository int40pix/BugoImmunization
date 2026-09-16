# DESIGN AND DEVELOPMENT OF A WEB-BASED PEDIATRIC IMMUNIZATION TRACKING, VACCINE INVENTORY MANAGEMENT, AND AUTOMATED REMINDER NOTIFICATION SYSTEM WITH QR CODE-ENABLED PATIENT RECORD MANAGEMENT

**A Capstone Project Proposal**  
Presented to the Faculty of the College of Information Technology  
**Tagoloan Community College**, Tagoloan, Misamis Oriental  

In Partial Fulfillment of the Requirements for the Degree  
**Bachelor of Science in Information Technology**

### Proponents (Team Catalyst)
* **BUICO, JUSTINE V.** (Project Manager)
* **ALERTA, BRANDOLPH O.**
* **ALVAREZ, ADRIANA**
* **CAÑEDA, JOBERT T.**
* **MATA, MARK LOURENCE B.**
* **SUMILLA, ARRON GABRIEL T.**
* **URGELLO, JOHNBERT S.**

**Client / Beneficiary**: Barangay Bugo Health Center, Bugo, Greymar, Barangay Hall, Cagayan de Oro City, Misamis Oriental  
**Client Representative**: Elena B. Nuque (Adviser / Previous President, Bugo Health Center)  
**Capstone Coordinator / Instructor**: Neptale S. Roa III, MIT  
**Date of Submission**: May 2026  

---

## Chapter 1: Background of the Study

### 1.1 Project Context
Children are more vulnerable to illnesses because their immune systems are still developing, making their health a priority. Vaccination is a cost-effective way to protect children from infectious diseases, strengthen immunity, and reduce child mortality. However, challenges in immunization access and monitoring remain, highlighting the need for improved systems to ensure timely and complete vaccination (United Nations, 2015; Gavi, the Vaccine Alliance, 2023). 

Barangay Bugo Health Center is the primary healthcare facility in the community, providing services such as immunization and basic medical care. It is managed by a small team of healthcare workers who currently rely on manual record-keeping for vaccination tracking. This locale was chosen due to its active role in immunization programs and its need for a more efficient system to manage and monitor vaccination records.

One of the main problems faced by the Bugo Health Center is the lack of a proper system for monitoring vaccine supplies. Because vaccine stocks are not tracked efficiently, the health center may experience shortages that can prevent children from receiving their scheduled immunizations. This causes inconvenience for patients and their families who travel to the health center expecting vaccination services only to find that the required vaccine is unavailable. Such situations can lead to missed immunization opportunities, service delays, complaints, and reduced public trust in healthcare services. 

The health center also relies on paper records and logbooks to manage patient information, which can result in incomplete records, reporting delays, and difficulties in tracking immunization schedules. According to Rahmadhan and Handayani (2023), manual data recording increases the risk of errors, data loss, and inconsistencies that affect the accuracy and timeliness of immunization information.

To address these challenges, the study proposes the design and development of a **Web-Based Pediatric Immunization Tracking, Vaccine Inventory Management, and Automated Reminder Notification System with QR Code-Enabled Patient Record Management**. The proposed system monitors vaccine inventory in real time, tracks stock availability, and utilizes inventory thresholds to identify low-stock vaccines before shortages occur. This information supports healthcare personnel in maintaining vaccine availability and helps prevent unnecessary visits by informing parents about vaccine availability before their scheduled appointments.

The system also manages pediatric immunization records through a centralized platform and assigns a unique QR code to every registered patient. By scanning the QR code, authorized healthcare personnel can quickly access, verify, and update patient vaccination information without manually searching through records. The system further supports automated reminder notifications for upcoming schedules, overdue vaccinations, and vaccine availability updates. Through the integration of vaccination tracking, inventory monitoring, automated reminders, and QR code-enabled record management, the proposed system aims to improve service efficiency, reduce missed opportunities for immunization, and support better healthcare delivery at Barangay Bugo Health Center.

---

### 1.2 Purpose and Description
The purpose of the proposed system is to provide a centralized web-based platform that improves pediatric immunization management, vaccine inventory monitoring, and patient record handling at Barangay Bugo Health Center. The system aims to support healthcare personnel in maintaining accurate immunization records, monitoring vaccine availability, and ensuring that vaccination services are delivered efficiently.

The system includes:
1. **Vaccine Inventory Management Module**: Tracks vaccine stocks in real time, records vaccine quantities, monitors expiration dates and lot numbers, and utilizes threshold-based alerts to identify approaching vaccine expirations and low inventory levels before shortages occur. It also utilizes priority flagging to identify patients who are nearing completion of their immunization series, allowing healthcare personnel to prioritize these patients during vaccine allocation when supplies are limited.
2. **Vaccination Tracking Module**: Records administered vaccines, monitors immunization schedules, and maintains updated vaccination histories. Each registered patient is assigned a unique QR code linked to their profile for instant contactless retrieval and updating of records.
3. **Reminder and Notification Module**: Automatically sends notifications regarding upcoming vaccination schedules, overdue immunizations, low vaccine availability, and vaccine stock status to prevent failed visits and support schedule compliance.
4. **Patient Management Module**: Handles patient registration, record maintenance, unique Patient ID (PID) and QR code generation, identification, and profile updating.
5. **Staff Management Module**: Manages staff accounts, roles (Admin, Nurse, Midwife, BHW), permissions, and audit accountability.

---

### 1.3 Conceptual Framework (IPO Model)


|             INPUT              |       |              PROCESS               |       |   OUTPUT                         |

| * Patient Details              | ----> | * Patient Management Module        | ----> | * Patient QR Code                      
| * Immunization Details         |       | * Vaccination Tracking Module      |       | * Updated Vaccination Records          
| * Staff Details                |       | * Reminder & Notification Module   |       | * Vaccination Schedules & History      
| * Vaccine Inventory Details    |       | * Staff Management Module          |       | * Reminder Notifications               
|                                |       | * Vaccine Inventory Module         |       | * Low-Stock & Near-Expiry Alerts       
|                                |       |                                    |       | * Vaccine Availability Reports         
|                                |       |                                    |       | * Staff Account Records                
|                                |       |                                    |       | * Summary Data Overview Reports        

---

### 1.4 Objectives of the Study

#### General Objective
To design and develop a Web-Based Pediatric Immunization Tracking, Vaccine Inventory Management, and Automated Reminder Notification System with QR Code-Enabled Patient Record Management for Barangay Bugo Health Center.

#### Specific Objectives
1. **Data Gathering**: To gather data on immunization processes and operations through qualitative data collection techniques including key informant reviews and direct observation (UNICEF Philippines, 2024).
2. **System Modeling**: To design context diagrams, data flow diagrams (DFD), and system architecture using draw.io based on standard system design methodologies (JGraph Ltd, 2020).
3. **Module Development**: To develop the five core modules:
   - *Patient Management Module*
   - *Vaccination Tracking Module*
   - *Reminder and Notification Module*
   - *Staff Management Module*
   - *Vaccine Inventory Module*
4. **Web & Mobile Deployment**: To deploy the system as a web-based application using **ReactJS, HTML, CSS, and Bootstrap** for the interface with mobile-responsive design, **Laravel** for backend operations, **MySQL** for database management, and **Visual Studio Code** as the development environment.
5. **Quality Assurance & Testing**: To test the system using functional and system testing approaches with tools such as **PHPUnit** for backend testing and manual/browser-based testing for overall functionality.
6. **Standardized Evaluation**: To evaluate the system's usability, efficiency, and reliability based on the **ISO/IEC 25010** software quality standard using survey questionnaires and user feedback from parents and health center staff.

---

### 1.5 Scope and Limitations
* **Scope**: Pediatric immunization tracking, vaccine inventory monitoring, threshold-based alerts, automated reminder notifications, patient record management with QR code generation/scanning, and staff account management within Barangay Bugo Health Center.
* **Limitations**:
  - Does not provide medical diagnosis, treatment management, pharmaceutical sales, or billing services.
  - Does not feature real-time automatic synchronization with external regional/national systems (e.g., DOH FHSIS).
  - Does not include automated cold-chain refrigerator temperature sensors; relies on staff inventory encoding.
  - Users without smartphone access may utilize physical printed QR immunization cards issued by the health center.

---

## Chapter 3: Research Methodology (Waterfall Model)

The project adopts the **Waterfall Model** (Ardiansyah et al., 2022; Pratrian et al., 2024) comprising six sequential phases:

1. **Planning and Requirement Gathering Phase**: Baseline qualitative data collection via structural interviews with health workers, observation checklists, and examination of TCL logbooks, yielding the System Requirements Specification (SRS).
2. **System Design Phase**: Translation of requirements into UI wireframes, Entity-Relationship Diagrams (ERD), Context Diagrams, and Level-0 Data Flow Diagrams (DFDs) using draw.io.
3. **Development Phase**: Implementation of the 3-layer architecture:
   - *Presentation Layer*: HTML5, CSS3, JavaScript, ReactJS, and Bootstrap for mobile responsiveness.
   - *Application Layer*: Laravel PHP framework implementing business logic, routing, FEFO prioritization, and QR handling.
   - *Database Layer*: MySQL relational database management system.
4. **Testing Phase**: Verification using PHPUnit automated unit/feature tests, manual cross-browser testing, and physical Android mobile testing.
5. **Deployment Phase**: Hosting on a secure web server configured with PHP, MySQL, and Vite asset bundles.
6. **Evaluation Phase**: Empirical software evaluation using ISO/IEC 25010 Software Quality Survey Questionnaires administered to Barangay Health Workers (BHWs), midwives, nurses, and parents.
