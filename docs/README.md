# Project Documentation Index

## Web-Based Pediatric Immunization Tracking, Vaccine Inventory Management, and Automated Reminder Notification System with QR Code-Enabled Patient Record Management

**System**: Barangay Bugo Immunization Management System (`Bugo`)  
**Institution**: College of Information Technology, **Tagoloan Community College**, Tagoloan, Misamis Oriental  
**Beneficiary**: Barangay Bugo Health Center, Cagayan de Oro City, Misamis Oriental  
**Proponents (Team Catalyst)**: Justine V. Buico (PM), Brandolph O. Alerta, Adriana Alvarez, Jobert T. Cañeda, Mark Lourence B. Mata, Arron Gabriel T. Sumilla, Johnbert S. Urgello  
**Client Representative**: Elena B. Nuque  
**Capstone Coordinator**: Neptale S. Roa III, MIT  
**Methodology**: Waterfall Model (Ardiansyah et al., 2022)  

---

## Documentation Sections

| Section | Location | Description |
| :--- | :--- | :--- |
| **Requirements** | [`requirements/system_requirements.md`](requirements/system_requirements.md) | Software Requirements Specification (SRS), 5 core modules, user personas, and Waterfall SDLC phases. |
| **Architecture** | [`architecture/system_architecture.md`](architecture/system_architecture.md) | 3-Tier architecture (Presentation, Application, Database layers) per Figure 3.0 of manuscript. |
| **Database** | [`database/data_dictionary.md`](database/data_dictionary.md) | Complete MySQL data dictionary, table schemas, relationships, and foreign key constraints. |
| **Diagrams** | [`diagrams/erd_and_workflows.md`](diagrams/erd_and_workflows.md) | Input-Process-Output (IPO) Conceptual Framework, Waterfall Model, Context Diagram, and ERD. |
| **API & Routes** | [`api/route_catalog.md`](api/route_catalog.md) | Complete catalog of 85 HTTP routes, controller actions, and RBAC middleware. |
| **User Manual** | [`user-manual/user_guide.md`](user-manual/user_guide.md) | Operating manuals for Administrators, Healthcare Staff (Nurses, Midwives, BHWs), and Guardians. |

---

## Technical Stack Quick Reference

* **Frontend (Presentation Layer)**: ReactJS 19, HTML5, CSS3, Bootstrap 5 (Mobile-Responsive Grid), Tailwind CSS, Vite 6
* **Backend (Application Layer)**: Laravel 12 (PHP 8.2+)
* **Database (Database Layer)**: MySQL 8.0+ / MariaDB 10.4+
* **Testing & Quality Assurance**: PHPUnit 11 (Unit, Integration, and System testing), Cross-Browser and Android Testing
* **Evaluation Standard**: ISO/IEC 25010 Software Product Quality Standard
