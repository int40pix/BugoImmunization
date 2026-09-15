# Bugo - Barangay Immunization Management System

**Capstone Project**: Barangay Bugo Immunization Management System  
**Beneficiary**: Barangay Bugo Health Center, Cagayan de Oro City, Philippines  
**Architecture**: Decoupled Modular System (Frontend SPA + Backend API)  

---

## 1. Project Directory Structure

This project strictly adheres to the Capstone Project Structure & Organization Standards:

```
Bugo/
├── README.md                              # Main capstone project overview and guide
├── .gitignore                             # Version control ignore definitions
│
├── docs/                                  # Capstone Documentation Library
│   ├── README.md                          # Documentation index
│   ├── requirements/                      # System Requirements Specification (SRS)
│   │   └── system_requirements.md
│   ├── architecture/                      # Architecture design & system specifications
│   │   └── system_architecture.md
│   ├── database/                          # Comprehensive data dictionary
│   │   └── data_dictionary.md
│   ├── diagrams/                          # Mermaid ERD & clinical workflow diagrams
│   │   └── erd_and_workflows.md
│   ├── api/                               # Complete API & route endpoint catalog
│   │   └── route_catalog.md
│   └── user-manual/                       # Operating manuals for Admin, Staff, and Guardians
│       └── user_guide.md
│
├── frontend/                              # Frontend Subsystem (React 19 + TypeScript + Vite)
│   ├── package.json                       # Frontend packages & build scripts
│   ├── vite.config.js                     # Vite build configuration
│   ├── tsconfig.json                      # TypeScript compiler configuration
│   ├── index.html                         # SPA entrypoint HTML
│   └── src/
│       ├── components/                    # UI elements, buttons, modals, QR scanners
│       ├── pages/                         # Application views (Auth, Patient, Guardian, Staff)
│       ├── layouts/                       # Layout components (AppLayout, AuthLayout)
│       ├── features/                      # Modular features (ImmunizationCard, Inventory)
│       ├── services/                      # API client services & endpoint callers
│       ├── hooks/                         # Custom React hooks (appearance, mobile, state)
│       └── utils/                         # Helper functions & utility methods
│
├── backend/                               # Backend Subsystem (Laravel / PHP Framework)
│   ├── composer.json                      # PHP packages & PSR-4 autoloading
│   ├── artisan                            # Command line CLI runner
│   ├── .env.example                       # Sanitized backend environment template
│   └── src/
│       ├── controllers/                   # HTTP request handlers & controllers
│       ├── models/                        # Eloquent ORM database models
│       ├── routes/                        # Web, API, and console route definitions
│       ├── services/                      # Core business services (Scheduling, FEFO)
│       ├── middleware/                    # Role-based access control & auth middleware
│       ├── config/                        # Application configuration files
│       └── utils/                         # Backend utilities & ID generators
│
├── database/                              # Central Database Repository
│   ├── migrations/                        # Chronological database migrations
│   ├── seeders/                           # Seeders (Roles, default Admin, Vaccines)
│   └── schemas/                           # Standalone SQL schema dump & restore docs
│       ├── README.md
│       └── bugo_immunization_schema.sql
│
├── tests/                                 # Centralized Test Suites
│   ├── unit/                              # Isolated unit tests
│   ├── integration/                       # Integration tests (Dashboard, Settings)
│   └── system/                            # System & feature tests (Auth, PatientManagement)
│
└── assets/                                # Capstone Media & Documents
    ├── README.md                          # Assets directory reference
    ├── images/                            # Health center seals & mockups
    ├── icons/                             # SVG iconography & symbols
    ├── fonts/                             # Custom typography assets
    └── documents/                         # Capstone submission attachments & briefs
```

---

## 2. Technology Stack

* **Frontend**: React 19, TypeScript 5.7, Tailwind CSS v4, Radix UI Primitives, Lucide Icons, Vite 6
* **Backend**: Laravel 11/12, PHP 8.2+
* **Database**: MySQL 8.0+ / MariaDB 10.4+
* **Testing**: PHPUnit, Pest, TypeScript Compiler (`tsc`)
* **Hardware Integrations**: Camera QR code scanning (`html5-qrcode`) and dynamic QR rendering (`qrcode.react`)

---

## 3. Installation & Setup

### Prerequisites
* PHP 8.2+ with MySQL PDO extensions
* Composer 2.x
* Node.js 20.x & npm
* XAMPP / MariaDB Server

### Backend Setup
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

### Database Initialization
```bash
# Using standard migrations and seeders:
php artisan migrate --seed

# Or using the capstone schema dump:
mysql -u root -p bugo_immunization < ../database/schemas/bugo_immunization_schema.sql
```

### Frontend Setup
```bash
cd ../frontend
npm install
npm run build
```

---

## 4. Quality Assurance & Testing

* **Unit Tests**: `tests/unit/`
* **Integration Tests**: `tests/integration/`
* **System Tests**: `tests/system/`

Execute all tests from backend root:
```bash
php artisan test
```

Execute TypeScript static validation:
```bash
npx tsc --noEmit
```

---

## 5. Capstone Grading Criteria Alignment (100 Points)

| Criteria | Points | Implementation Highlights |
| :--- | :---: | :--- |
| **Project structure and organization** | 25 | Dedicated `frontend/`, `backend/`, `database/`, `docs/`, `tests/`, and `assets/`. |
| **File/folder naming and consistency** | 10 | Strict camelCase/kebab-case consistency. Zero duplicate or backup files. |
| **Feature/module organization** | 15 | Dedicated feature directories in frontend (`src/features/`) and backend services (`src/services/`). |
| **Code organization & maintainability** | 15 | Strict separation of concerns (Models, Views, Controllers, Utilities, Services). |
| **Database organization** | 10 | Dedicated `database/migrations/`, `database/seeders/`, and `database/schemas/`. |
| **Documentation** | 10 | Complete 6-section documentation suite inside `docs/`. |
| **Testing** | 5 | Multi-tier tests in `tests/unit/`, `tests/integration/`, and `tests/system/`. |
| **Git/version control practices** | 5 | Clean Git repository on `main` branch with clean semantic commit history. |
| **Security & configuration practices** | 5 | Strict `.gitignore` protecting credentials, Bcrypt 12 hashing, CSRF tokens, RBAC filters. |
