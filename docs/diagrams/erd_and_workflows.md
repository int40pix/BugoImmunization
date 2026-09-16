# System Conceptual Framework, ERD & Clinical Workflows

## Web-Based Pediatric Immunization Tracking, Vaccine Inventory Management, and Automated Reminder Notification System with QR Code-Enabled Patient Record Management

* **System Identifier**: Barangay Bugo Immunization Management System (`Bugo`)  
* **Methodology**: Waterfall Model (Ardiansyah et al., 2022)  
* **Diagram Standards**: Mermaid Unified Modeling & draw.io Architecture Specifications  

---

## 1. Conceptual Framework (IPO Model - Manuscript Figure 1.0)

```mermaid
flowchart LR
    subgraph INPUT["INPUT"]
        I1["Patient Details (Name, DOB, Metrics, Address)"]
        I2["Immunization Details (DOH Schedules, Intervals)"]
        I3["Staff Details (Admin, Nurse, Midwife, BHW)"]
        I4["Vaccine Inventory Details (Lots, Expiry, Thresholds)"]
    end

    subgraph PROCESS["PROCESS"]
        P1["Patient Management Module (Registration, QR Gen)"]
        P2["Vaccination Tracking Module (Administration, History)"]
        P3["Reminder & Notification Module (Priority Flagging)"]
        P4["Staff Management Module (RBAC, Audit Accounts)"]
        P5["Vaccine Inventory Module (FEFO, Low-Stock Tracking)"]
    end

    subgraph OUTPUT["OUTPUT"]
        O1["Patient QR Code & Electronic Health Card"]
        O2["Updated Vaccination Records & Milestone Dates"]
        O3["Vaccination Schedules & Coverage Reports"]
        O4["Targeted Reminder & Stock Alert Notifications"]
        O5["Low-Stock & Near-Expiry Alerts"]
        O6["Staff Account Records & Audit Logs"]
        O7["Summary Data Overview (DOH Status Reports)"]
    end

    INPUT --> PROCESS --> OUTPUT
```

---

## 2. Research Methodology: Waterfall Model (Manuscript Figure 2.0)

```mermaid
flowchart TD
    Phase1["1. Planning and Requirement Gathering Phase<br/><i>(Structural Interviews, Observation Checklists, SRS)</i>"]
    Phase2["2. System Design Phase<br/><i>(draw.io Architecture, ERD, Context Diagram, Level-0 DFD)</i>"]
    Phase3["3. Development Phase<br/><i>(Presentation: React+Bootstrap, Application: Laravel, Database: MySQL)</i>"]
    Phase4["4. Testing Phase<br/><i>(PHPUnit Backend Tests, Cross-Browser, Android Devices)</i>"]
    Phase5["5. Deployment Phase<br/><i>(Web Server Hosting, Migration to Live MySQL Database)</i>"]
    Phase6["6. Evaluation Phase<br/><i>(ISO/IEC 25010 Software Quality Survey with Staff & Parents)</i>"]

    Phase1 --> Phase2
    Phase2 --> Phase3
    Phase3 --> Phase4
    Phase4 --> Phase5
    Phase5 --> Phase6
```

---

## 3. Context Diagram (Level-0 DFD)

```mermaid
flowchart TD
    Staff["Healthcare Staff<br/>(Admin, Nurse, Midwife, BHW)"]
    Guardian["Parents / Guardians"]
    System(("Bugo Immunization<br/>Management System"))
    Database[("MySQL Database<br/>`bugo`")]

    Staff -- "Patient info, vaccine logs, lot stocks" --> System
    System -- "QR badges, digital cards, stock alerts, reports" --> Staff

    Guardian -- "Portal inquiries, password reset requests" --> System
    System -- "Immunization schedules, QR codes, vaccine availability" --> Guardian

    System <--> Database
```

---

## 4. Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    ROLES ||--o{ USERS : "assigned to"
    USERS ||--o| GUARDIANS : "linked to"
    USERS ||--o{ PASSWORD_RESET_REQUESTS : "submits"
    GUARDIANS ||--o{ PATIENTS : "cares for"
    PATIENTS ||--o{ PATIENT_VACCINES : "opts into"
    PATIENTS ||--o{ PATIENT_VACCINE_SCHEDULES : "has"
    PATIENTS ||--o{ IMMUNIZATION_RECORDS : "receives"
    PATIENTS ||--o{ PATIENT_IMMUNIZATION_CARD_ROWS : "displays"
    VACCINES ||--o{ VACCINE_SCHEDULES : "defines"
    VACCINES ||--o{ VACCINE_INVENTORIES : "stocks"
    VACCINES ||--o{ PATIENT_VACCINES : "cataloged in"
    VACCINES ||--o{ IMMUNIZATION_RECORDS : "administered in"
    VACCINE_INVENTORIES ||--o{ PATIENT_VACCINE_SCHEDULES : "reserves batch"

    ROLES {
        bigint id PK
        string name
        string display_name
    }

    USERS {
        bigint id PK
        bigint role_id FK
        string name
        string email
        string password
        string account_status
        boolean must_change_password
    }

    GUARDIANS {
        bigint id PK
        bigint user_id FK
        string guardian_no
        string name
        string contact_number
        string status
    }

    PATIENTS {
        bigint id PK
        bigint guardian_id FK
        string patient_id
        string first_name
        string last_name
        date date_of_birth
        string sex
        string status
    }

    VACCINES {
        bigint id PK
        string name
        string category
        int required_doses
    }

    VACCINE_INVENTORIES {
        bigint id PK
        bigint vaccine_id FK
        string batch_number
        int quantity
        date expiration_date
        boolean is_archived
    }

    IMMUNIZATION_RECORDS {
        bigint id PK
        bigint patient_id FK
        bigint vaccine_id FK
        bigint vaccine_inventory_id FK
        int dose_number
        date immunization_date
        string administered_by
    }
```

---

## 5. Priority Flagging & Dose Allocation Workflow (Manuscript Feature)

```mermaid
flowchart TD
    Trigger([Inventory Module detects Low Stock below Threshold]) --> ScanPatients[Scan Active Children in Target Cohort]
    ScanPatients --> FlagPriority[Priority Flagging: Identify children nearing completion of series]
    FlagPriority --> MatchDoses{Available Doses >= Priority Flagged Children?}
    MatchDoses -- Yes --> AllocateAll[Allocate doses to all flagged children]
    MatchDoses -- No --> RankByDue[Rank flagged children by oldest overdue date]
    RankByDue --> ConfirmAllocation[Staff confirms allocation reservation]
    AllocateAll --> ConfirmAllocation
    ConfirmAllocation --> DispatchReminders[Send targeted notifications ONLY to selected parents]
    DispatchReminders --> InformVisit[Parents notified of confirmed vaccine availability for clinic visit]
```

---

## 6. Single-Click Vaccine Administration & Stock Deduction Workflow

```mermaid
flowchart TD
    Start([Health Worker scans QR or opens Patient Profile]) --> ViewCard[Display Digital Immunization Card]
    ViewCard --> SelectDose[Click Next Due Milestone Dose]
    SelectDose --> FEFOPick[System auto-selects earliest expiring batch via FEFO]
    FEFOPick --> AdministerClick[Click 'Administer Vaccine']
    AdministerClick --> DBTransaction[Begin ACID Database Transaction]
    DBTransaction --> SaveDose[Record Dose in immunization_records]
    SaveDose --> DeductStock[Decrement batch quantity in vaccine_inventories by 1]
    DeductStock --> CalcNext[Calculate & schedule next milestone dose automatically]
    CalcNext --> CommitDB[Commit Transaction]
    CommitDB --> Done([Digital Card updated & success confirmation displayed])
```
