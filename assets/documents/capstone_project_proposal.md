# Capstone Project Proposal

**Project Title**: Barangay Bugo Immunization Management System  
**Proponents**: Capstone Project Development Team  
**Institution**: Department of Information Technology  
**Client**: Barangay Bugo Health Center, Cagayan de Oro City  

---

## 1. Project Background
In community health centers across the Philippines, tracking infant and child immunizations historically relies on physical target client list (TCL) logbooks and paper immunization cards (ECCD cards). These paper-based records are vulnerable to physical deterioration, loss, and transcription errors, leading to missed immunization opportunities (MIOs) and inaccurate barangay-level vaccine coverage calculations.

## 2. Problem Statement
* **Disjointed Record Keeping**: Health workers must cross-reference logbooks and physical records, slowing down clinic consultations.
* **Manual Inventory & Waste**: Tracking vaccine expiration dates across multi-dose vials without automated First-Expired, First-Out (FEFO) scheduling leads to premature wastage.
* **Parental Information Gap**: Parents lack remote visibility into their child's completed vaccines and upcoming due appointments.

## 3. Project Objectives
1. Develop a secure, centralized immunization record management platform for Barangay Bugo Health Center.
2. Implement an automated scheduling engine based on Department of Health (DOH) pediatric immunization guidelines.
3. Establish lot-level vaccine inventory management with automated FEFO allocation.
4. Provide parents and guardians with a mobile-responsive portal for appointment awareness.
5. Support contactless patient lookup using dynamic QR codes on digital immunization cards.

## 4. Scope and Limitations
* **Scope**: Patient registration, Guardian household linkage, Vaccine master catalog, Routine and optional vaccine scheduling, Inventory stock-in/archiving, Clinical dose administration, QR code generation/scanning, and Staff-assisted password resets.
* **Limitations**: The system operates within the local barangay health center and connected web portal; integration with the national Philippine DOH FHSIS cloud database is reserved for Phase 2.

## 5. Development Methodology
The team utilizes the **Agile Development Methodology**, divided into two-week sprints covering:
* Sprint 1: Requirement Gathering & Database Schema Modeling
* Sprint 2: Core MVC Backend & Authentication Engine
* Sprint 3: Pediatric Patient & Guardian Module
* Sprint 4: Vaccine Inventory & FEFO Scheduling Engine
* Sprint 5: Electronic Immunization Card & QR Scanner
* Sprint 6: Testing, Code Review & Deployment
