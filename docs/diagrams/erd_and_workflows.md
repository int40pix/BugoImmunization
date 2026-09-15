# Entity-Relationship & System Workflow Diagrams

---

## 1. Entity-Relationship Diagram (ERD)

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
        int dose_number
        date administered_date
        string batch_number
        string administered_by
    }
```

---

## 2. Patient Registration & Child Linkage Workflow

```mermaid
sequenceDiagram
    autonumber
    actor HealthWorker as Health Staff (Nurse/BHW)
    participant WebUI as Frontend (Inertia React)
    participant Controller as PatientController
    participant Scheduler as SchedulingService
    participant DB as MySQL Database

    HealthWorker->>WebUI: Navigate to Guardian Profile
    HealthWorker->>WebUI: Fill in child birth & physical info
    WebUI->>Controller: POST /guardians/{guardian}/patients
    Controller->>DB: Check if guardian is Active
    Controller->>DB: Generate PT-XXXXXX ID & insert Patient
    Controller->>Scheduler: Trigger generateSchedules()
    Scheduler->>DB: Evaluate eligible routine doses & FEFO batch availability
    Scheduler->>DB: Insert patient_vaccine_schedules
    Controller-->>WebUI: Redirect to /patients/{patient} with success toast
    WebUI-->>HealthWorker: Render Patient Workspace with schedules & QR code
```

---

## 3. Vaccine Administration & Inventory Deduction Workflow

```mermaid
flowchart TD
    Start([Health Worker opens Patient Workspace]) --> SelectDose[Select Due Vaccine Dose]
    SelectDose --> CheckBatch{Is Active Batch Allocated?}
    CheckBatch -- Yes --> VerifyExpiry[Verify Batch Expiration Date]
    CheckBatch -- No --> ManualSelect[Manually select lot from active inventory]
    ManualSelect --> VerifyExpiry
    VerifyExpiry --> Administer[Administer vaccine injection to infant]
    Administer --> RecordForm[Submit Administration Form: Date, Vaccinator, Notes]
    RecordForm --> DBTransaction[Begin Database Transaction]
    DBTransaction --> SaveRecord[Insert record in immunization_records]
    SaveRecord --> DeductStock[Decrement quantity in vaccine_inventories by 1]
    DeductStock --> UpdateSchedule[Mark patient_vaccine_schedule as Completed]
    UpdateSchedule --> CommitTransaction[Commit Database Transaction]
    CommitTransaction --> SuccessToast[Display Success Notification & update Digital Card]
```

---

## 4. Guardian Portal Login & Temporary Password Flow

```mermaid
flowchart TD
    Login([User submits credentials on /login]) --> CheckAuth{Credentials valid?}
    CheckAuth -- No --> Error[Show Invalid Credentials Alert]
    CheckAuth -- Yes --> CheckTemp{must_change_password is true?}
    CheckTemp -- Yes --> ForcePassword[Redirect to /change-temporary-password]
    ForcePassword --> SubmitNewPass[Guardian submits permanent password]
    SubmitNewPass --> SavePass[Update password & set must_change_password = false]
    SavePass --> CheckRole
    CheckTemp -- No --> CheckRole{User Role?}
    CheckRole -- Guardian --> GuardianDash[Redirect to /guardian/dashboard]
    CheckRole -- Staff/Admin --> StaffDash[Redirect to /dashboard]
```
