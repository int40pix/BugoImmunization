# Deployment Guide & Operations Runbook

**System**: Barangay Bugo Immunization Management System  
**Target Environments**: Local Development (XAMPP/Laragon) & Production On-Premise Server  

---

## 1. System Requirements
* **Operating System**: Windows Server 2022 / Windows 10/11 or Ubuntu 22.04 LTS
* **Web Server**: Apache 2.4+ or Nginx 1.20+
* **Database**: MySQL 8.0+ or MariaDB 10.4+
* **PHP**: Version 8.2 or 8.3 with extensions (`pdo_mysql`, `mbstring`, `openssl`, `curl`, `gd`, `fileinfo`)
* **Node.js**: Version 20 LTS with npm

---

## 2. Apache XAMPP Deployment Steps

### Step 1: Clone Repository into htdocs
```bash
cd C:\xampp\htdocs
git clone <repo-url> Bugo
cd Bugo
```

### Step 2: Configure Environment
Copy `.env.example` to `.env`:
```bash
cd backend
copy .env.example .env
php artisan key:generate
```

Edit `.env` database configuration:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=bugo_immunization
DB_USERNAME=root
DB_PASSWORD=
```

### Step 3: Database Setup
Start Apache and MySQL from XAMPP Control Panel.
Create the database:
```sql
CREATE DATABASE bugo_immunization CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
Restore the database schema and seed data:
```bash
mysql -u root bugo_immunization < ../database/schemas/bugo_immunization_schema.sql
```

### Step 4: Frontend Compilation
```bash
cd ../frontend
npm install
npm run build
```

---

## 3. Maintenance & Backup Runbook

### Database Daily Backup
```bash
mysqldump -u root bugo_immunization > "C:\Backups\bugo_$(Get-Date -Format 'yyyyMMdd').sql"
```

### Storage Link Check
Ensure the public storage symbolic link is created:
```bash
php artisan storage:link
```

### Clearing Cache
If configurations or routes are modified:
```bash
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```
