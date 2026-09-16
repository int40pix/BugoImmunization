# Web-Based Pediatric Immunization Tracking, Vaccine Inventory Management, and Automated Reminder Notification System with QR Code-Enabled Patient Record Management

**System**: Barangay Bugo Immunization Management System (`Bugo`)  
**Institution**: College of Information Technology, **Tagoloan Community College**, Tagoloan, Misamis Oriental  
**Beneficiary / Client**: Barangay Bugo Health Center, Greymar, Bugo, Cagayan de Oro City, Misamis Oriental  
**Client Representative**: Elena B. Nuque  
**Capstone Coordinator**: Neptale S. Roa III, MIT  
**Development Team (Team Catalyst)**:
* **BUICO, JUSTINE V.** (Project Manager)
* **ALERTA, BRANDOLPH O.**
* **ALVAREZ, ADRIANA**
* **CAÑEDA, JOBERT T.**
* **MATA, MARK LOURENCE B.**
* **SUMILLA, ARRON GABRIEL T.**
* **URGELLO, JOHNBERT S.**

**Methodology**: Waterfall Model (Planning, System Design, Development, Testing, Deployment, Evaluation)  
**Architecture**: 3-Tier Web Architecture (Presentation Layer + Application Layer + Database Layer)  

---

## 1. Project Directory Structure

This project strictly adheres to the Capstone Project Structure & Organization Standards:

```
Bugo/
├── README.md                              # Main capstone project overview and guide
├── start_project.bat                      # 1-click concurrent server launcher
├── .gitignore                             # Version control ignore definitions
│
├── docs/                                  # Capstone Documentation Library
│   ├── README.md                          # Documentation index
│   ├── requirements/                      # System Requirements Specification (SRS - Waterfall Phase 1)
│   │   └── system_requirements.md
│   ├── architecture/                      # 3-Tier architecture design (Waterfall Phase 2)
│   │   └── system_architecture.md
│   ├── database/                          # Comprehensive data dictionary
│   │   └── data_dictionary.md
│   ├── diagrams/                          # Context diagram, Level-0 DFD, IPO & ERD
│   │   └── erd_and_workflows.md
│   ├── api/                               # Complete API & route endpoint catalog (85 routes)
│   │   └── route_catalog.md
│   └── user-manual/                       # Operating manuals for Admin, Staff (Nurses/BHWs), and Guardians
│       └── user_guide.md
│
├── frontend/                              # Presentation Layer (ReactJS 19 + TypeScript + Bootstrap + Vite)
│   ├── package.json                       # Frontend packages & build scripts
│   ├── vite.config.js                     # Vite build configuration (output: backend/public/build)
│   ├── tsconfig.json                      # TypeScript compiler configuration
│   ├── index.html                         # SPA entrypoint HTML
│   └── src/
│       ├── components/                    # UI elements, buttons, modals, QR scanners
│       ├── pages/                         # Application views (Auth, Patient, Guardian, Staff)
│       ├── layouts/                       # Layout components (AppLayout, AuthLayout)
│       ├── features/                      # Modular features (ImmunizationCard, Inventory, Scheduling)
│       ├── services/                      # API client services & endpoint callers
│       ├── hooks/                         # Custom React hooks (appearance, mobile, state)
│       └── utils/                         # Helper functions & utility methods
│
├── backend/                               # Application Layer (Laravel Framework / PHP 8.2+)
│   ├── composer.json                      # PHP packages & PSR-4 autoloading
│   ├── artisan                            # Command line CLI runner
│   ├── .env.example                       # Sanitized backend environment template
│   ├── bootstrap/app.php                  # Application configuration & middleware
│   ├── public/index.php                   # HTTP request handling entrypoint
│   └── src/
│       ├── controllers/                   # HTTP request handlers & controllers
│       ├── models/                        # Eloquent ORM database models
│       ├── routes/                        # Web, API, and console route definitions
│       ├── services/                      # Core business services (Scheduling, FEFO)
│       ├── middleware/                    # Role-based access control & auth middleware
│       ├── requests/                      # Form request validation classes
│       ├── config/                        # Application configuration files
│       └── utils/                         # Backend utilities & ID generators
│
├── database/                              # Database Layer (MySQL / Relational Store)
│   ├── migrations/                        # Chronological database migrations
│   ├── seeders/                           # Seeders (Roles, default Admin, Vaccines)
│   ├── factories/                         # Model factories for testing
│   └── schemas/                           # Standalone SQL schema dump & restore docs
│       ├── README.md
│       ├── bugo_schema.sql
│       └── restore_database.bat
│
├── tests/                                 # Centralized Test Suites (PHPUnit)
│   ├── unit/                              # Isolated unit tests
│   ├── integration/                       # Integration tests (Dashboard, Settings)
│   └── system/                            # System & feature tests (Auth, PatientManagement)
│
└── assets/                                # Capstone Media & Documents
    ├── README.md                          # Assets directory reference
    ├── images/                            # Health center seals & mockups
    ├── icons/                             # SVG iconography & symbols
    ├── fonts/                             # Custom typography assets
    └── documents/                         # Proposal, interview forms, DOH cards, checklists
```

---

## 2. Technology Stack

* **Presentation Layer**: ReactJS 19, TypeScript 5.7, Bootstrap 5 (Responsive Grid & Utilities), Tailwind CSS v4, Radix UI Primitives, Lucide Icons, Vite 6
* **Application Layer**: Laravel 12, PHP 8.2+
* **Database Layer**: MySQL 8.0+ / MariaDB 10.4+
* **Testing & Quality**: PHPUnit 11, manual cross-browser testing, physical Android mobile testing
* **QR Code Technology**: In-browser QR camera scanner (`html5-qrcode`) and dynamic Patient ID QR generator (`qrcode.react`)
* **Evaluation Standard**: ISO/IEC 25010 Software Quality Standard

---

## 3. Installation & Quick Launch

### Prerequisites
* PHP 8.2+ with MySQL PDO and ZIP extensions enabled in `php.ini`
* Composer 2.x
* Node.js 20.x+ & npm
* XAMPP (Apache + MySQL running)

### Single-Click Launch (Recommended)
1. Restore the database: Double-click [`database/schemas/restore_database.bat`](database/schemas/restore_database.bat).
2. Start the project: Double-click [`start_project.bat`](start_project.bat).
3. Access the web portal:
   * **Frontend Application**: [http://localhost:5173](http://localhost:5173) or [http://127.0.0.1:8000](http://127.0.0.1:8000)
   * **Backend API**: [http://127.0.0.1:8000](http://127.0.0.1:8000)

---

## 4. Quality Assurance & Testing

Execute the automated test suite from `backend/`:
```bash
php artisan test
```
**Status**: **34 passed (89 assertions), 0 failures**.

Execute TypeScript validation:
```bash
npx tsc --noEmit
```
**Status**: **0 errors**.

Execute production build:
```bash
npm run build
```
**Status**: **Built successfully in ~8s**.
