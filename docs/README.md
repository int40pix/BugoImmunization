# Project Documentation Index

## Web-Based Pediatric Immunization Tracking, Vaccine Inventory Management, and Automated Reminder Notification System with QR Code-Enabled Patient Record Management

* **System Identifier**: Barangay Bugo Immunization Management System (`Bugo`)  
* **Institution**: College of Information Technology, **Tagoloan Community College**, Tagoloan, Misamis Oriental  
* **Beneficiary**: Barangay Bugo Health Center, Cagayan de Oro City, Misamis Oriental  
* **Proponents (Team Catalyst)**: Justine V. Buico (PM), Brandolph O. Alerta, Adriana Alvarez, Jobert T. Cañeda, Mark Lourence B. Mata, Arron Gabriel T. Sumilla, Johnbert S. Urgello  
* **Client Representative**: Elena B. Nuque  
* **Capstone Coordinator**: Neptale S. Roa III, MIT  
* **Methodology**: Waterfall Model (Ardiansyah et al., 2022)  

---

## 1. Documentation Sections & System Analyst Context

| Section | Location | Description |
| :--- | :--- | :--- |
| **Requirements** | [`requirements/system_requirements.md`](requirements/system_requirements.md) | Software Requirements Specification (SRS), 5 core modules, newly added Vaccine Coverage & Schedule Status Reports, weekly Monday reminders, and Waterfall SDLC phases. |
| **Architecture** | [`architecture/system_architecture.md`](architecture/system_architecture.md) | Multi-Tier Horizontal System Architecture (Presentation, Application, and Database tiers) with Draw.io swimlane specifications. |
| **Database** | [`database/data_dictionary.md`](database/data_dictionary.md) | Complete MySQL data dictionary covering all **14 normalized tables**, data types, foreign key cascades, and cardinality matrix. |
| **Diagrams & DFDs** | [`diagrams/erd_and_workflows.md`](diagrams/erd_and_workflows.md) | Comprehensive system design document: IPO Model, Context Diagram (Level-0 DFD), Level-1 DFD (7 processes, 9 data stores), ERD, sequence diagrams, and UI wireframes. |
| **API & Routes** | [`api/route_catalog.md`](api/route_catalog.md) | Complete catalog of 95+ HTTP endpoints, report exporters, and automated console daemons. |
| **User Manual** | [`user-manual/user_guide.md`](user-manual/user_guide.md) | Operating manuals for Administrators, Healthcare Staff (Nurses, Midwives, BHWs), and Guardians. |

---

## 2. System Analyst Draw.io Architectural Diagram Suite

The following ready-to-open Draw.io files have been created in `docs/diagrams/` conforming to the research study's Waterfall System Design Phase specifications:

| Figure # | Diagram Name | File Path | Description |
| :--- | :--- | :--- | :--- |
| **Figure 3.0** | **Multi-Tier Horizontal Architecture** | [`figure_3_0_system_architecture_multitier.drawio`](diagrams/figure_3_0_system_architecture_multitier.drawio) | Client Tier, Application Tier, and Data Tier horizontal containers with protocols and daemons. |
| **Figure 3.1** | **System Context Diagram (DFD Level-0)** | [`figure_3_1_system_context_diagram.drawio`](diagrams/figure_3_1_system_context_diagram.drawio) | Process 0.0 with Healthcare Personnel, Parents/Guardians, System Cron Schedulers, and DOH. |
| **Figure 3.2** | **Level-1 Data Flow Diagram (DFD Level-1)** | [`figure_3_2_level_1_data_flow_diagram.drawio`](diagrams/figure_3_2_level_1_data_flow_diagram.drawio) | 7 sub-processes (1.0 to 7.0), 9 data stores (D1 to D9), and bidirectional data flows. |
| **Figure 3.3** | **Entity-Relationship Diagram (ERD)** | [`figure_3_3_entity_relationship_diagram.drawio`](diagrams/figure_3_3_entity_relationship_diagram.drawio) | Full 14-table schema with primary keys, foreign keys, and cardinalities (1:1, 1:M). |
| **Figure 4.1** | **Manual Process Flow for Patient** | [`figure_4_1_manual_process_flow_patient.drawio`](diagrams/figure_4_1_manual_process_flow_patient.drawio) | Walk-in and clinical immunization process flow for parent and patient. |
| **Figure 4.2** | **Manual Process Flow for Staff** | [`figure_4_2_manual_process_flow_staff.drawio`](diagrams/figure_4_2_manual_process_flow_staff.drawio) | Manual clinic intake, stock management, and TCL recording flow. |

---

## 3. Technical Stack Quick Reference

* **Frontend (Client Tier)**: ReactJS 19, HTML5, CSS3, Bootstrap 5 (Mobile-Responsive Grid), Tailwind CSS v4, Lucide React, Vite 6
* **Backend (Application Tier)**: Laravel 12 (PHP 8.2+), Eloquent ORM, DomPDF Facade, RFC-4180 CSV Streamer
* **Database (Data Tier)**: MySQL 8.0+ / MariaDB 10.4+ (InnoDB Engine with ACID transaction boundaries)
* **Testing & Quality Assurance**: PHPUnit 11 (66 tests, 310 assertions covering Unit, Integration, and System testing)
* **Evaluation Standard**: ISO/IEC 25010 Software Product Quality Standard
