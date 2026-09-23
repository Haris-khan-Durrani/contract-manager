# 📑 Contract & Form Management System (GoHighLevel First)

A centralized, enterprise-grade Contract Lifecycle Management (CLM) and dynamic form generation platform natively built for **GoHighLevel (GHL)**.

![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)
![Vue.js](https://img.shields.io/badge/Vue.js-3.x-emerald.svg)
![MySQL](https://img.shields.io/badge/MySQL-8.0%2B-blue.svg)
![Vite](https://img.shields.io/badge/Vite-6.x-purple.svg)
![Playwright](https://img.shields.io/badge/Playwright-PDF%20Engine-orange.svg)
![License](https://img.shields.io/badge/License-Proprietary-red.svg)

---

## 🌟 Overview & Architecture

The **Contract Management System** provides high-conversion digital contract workflows directly integrated with GoHighLevel CRM. It replaces fragmented third-party e-sign tools with a native, secure, and customizable platform.

### Core Architectural Principle: GHL-First, MySQL-Light
* **GoHighLevel is the operational backbone**: Contacts, won opportunities, CRM custom fields, pipeline stages, conversation notes, and final signed PDF files are kept natively inside GoHighLevel.
* **MySQL 8+ is strictly lightweight**: Stores template schemas, form schemas, conditional evaluation rules, immutable contract snapshots, cryptographic signing tokens, and audit event logs.
* **Zero Standalone Passwords**: Authentication is enforced through cryptographically verified GHL SSO session tokens with granular Role-Based Access Control (RBAC).

```
                     GOHIGHLEVEL CRM
                (Operational Data Backbone)
             Contacts · Opportunities · Custom Fields
             Files · Notes · Workflows · Users
                        │
                        ▼ (REST API v2 / Webhooks / SSO)
           ┌───────────────────────────────┐
           │     Node.js / Express API     │
           │  • Contract Lifecycle State   │
           │  • Condition & Formula Engine │
           │  • Playwright PDF Generator   │
           │  • Audit Trail & QR Generator │
           └───────────────┬───────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
    Vue 3 Single Page App         Lightweight MySQL 8+
    (Embedded GHL View &         (Templates, Form Schemas,
    Public Client Signing Portal)  Snapshots, Audit Logs)
```

---

## ✨ Key Features

* **Visual Contract Template Builder**:
  * Rich HTML/CSS document canvas with real-time reactive variable substitution.
  * Embed dynamic tokens like `{{client_name}}`, `{{contract_value}}`, and Schedule One applicant details.
  * Conditional Clause Engine (AND/OR logic, 14 operators) allowing clauses to show or hide based on form values or CRM fields.

* **Dynamic Form & Questionnaire Engine**:
  * Visual form builder supporting Short Text, Paragraphs, Numbers, Currency, Dropdowns, Date Pickers, and File Uploads.
  * Live GoHighLevel Custom Field discovery and automatic bi-directional mapping.
  * Safe Math Formula Engine for automatic fee calculation, discount deductions, and schedule breakdowns.
  * Multi-applicant support (Individual vs. Team/Family applications).

* **Dual Contract Creation Modes**:
  * **Automated Flow**: Triggered automatically via GHL Webhooks when an opportunity transitions to `Won` or moves to a specific pipeline stage.
  * **Manual Flow**: Agents choose a contract template, search live GHL leads/contacts, fill custom intake forms, and generate instant signing links.

* **Secure Client Signing Portal (`/sign/:token`)**:
  * Mobile-responsive, zero-login signing experience for end clients.
  * Multiple signature methods: **Draw** (smooth canvas), **Type** (cursive typography), or **Upload** (signature image).
  * Legal consent checkbox with tamper-proof IP and User-Agent capture.
  * Direct PDF download restricted to authenticated sales agents; clients receive finalized copies via their representative.

* **QR Code & Tamper Verification (`/verify/:token`)**:
  * Every executed agreement embeds a cryptographic QR verification stamp on each page.
  * Scanning the QR code opens a public verification screen confirming document integrity, SHA-256 fingerprint, signing timestamp, and authenticity.

* **Auto-Dispatch via GoHighLevel Conversations**:
  * One-click contract dispatch directly from the contract workspace and creation wizard.
  * Sends text messages (SMS) and/or branded HTML invitation emails to the recipient through GoHighLevel's native `POST /conversations/messages` API.
  * All outbound messages and internal contract dispatch notes are embedded directly into the contact's GoHighLevel Conversation stream.

* **Role-Based Access Control (RBAC) & Sales Privacy**:
  * Three user tiers: `SUPER_ADMIN`, `ADMIN`, and `SALES`.
  * **Sales Data Isolation**: Sales representatives (e.g., Akram Mammeri) only view and generate contracts for leads assigned to their GHL account.
  * Built-in admin toggle (`RESTRICT_CONTACTS_TO_ASSIGNED`) to switch between restricted and team-wide data visibility.

---

## 🗂️ Project Structure

```
contractmanager/
├── client/                     # Vue 3 Frontend (Vite + Pinia + Vue Router)
│   ├── public/                 # Static assets, SVG icons, favicons
│   ├── src/
│   │   ├── components/         # Reusable UI components (SignaturePad, Layout)
│   │   ├── router/             # Client-side route definitions
│   │   ├── services/           # Axios API client with GHL auth interceptors
│   │   ├── stores/             # Pinia state stores (Auth, User context)
│   │   ├── views/              # Page views (Dashboard, Contracts, Builders, etc.)
│   │   └── style.css           # Global SaaS design system & theme variables
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Node.js / Express Backend
│   ├── data/                   # Optional local runtime storage
│   ├── src/
│   │   ├── config/             # Database connection (MySQL pool) & environment
│   │   ├── db/                 # SQL schemas, migration runner & seed data
│   │   ├── middleware/         # GHL Auth validator & RBAC permission checks
│   │   ├── routes/             # REST API routers (contracts, templates, forms, sign, verify, ghl)
│   │   ├── services/           # Core engines (pdfService, conditionEngine, formulaEngine, ghlService)
│   │   └── app.js              # Express app bootstrap & background workers
│   ├── tests/                  # Automated test suites
│   └── package.json
│
├── .env.example                # Sample environment configuration template
├── .gitignore                  # Git ignore rules for node_modules, .env, and builds
├── docker-compose.yml          # Container configuration for MySQL, API, and Client
├── package.json                # Workspace runner scripts
├── run-dev.js                  # Concurrent dev runner for client & server
├── SPECIFICATION.md            # Comprehensive architectural design document
└── README.md                   # Project documentation & installation guide
```

---

## 🚀 Installation & Setup Guide

### Prerequisites
Make sure you have the following installed on your machine:
* **Node.js**: v18.0.0 or higher (v20+ recommended)
* **npm**: v9.0.0 or higher
* **MySQL**: v8.0 or higher (or Docker)
* **Git**

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/Haris-khan-Durrani/contract-manager.git
cd contract-manager
```

---

### Step 2: Install Dependencies

Install all root, backend, and frontend dependencies:

```bash
# Install workspace root dependencies
npm install

# Install backend dependencies
cd server
npm install

# Install Playwright browser binaries for PDF generation
npx playwright install chromium

# Install frontend dependencies
cd ../client
npm install

# Return to root
cd ..
```

---

### Step 3: Database & Environment Configuration

1. Make sure your MySQL 8+ server is running.
2. Create an empty database in MySQL:
   ```sql
   CREATE DATABASE contractmanager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Copy the `.env.example` file to create your root `.env`:
   ```bash
   cp .env.example .env
   ```
4. Edit `.env` with your database credentials:
   ```env
   # Database Configuration
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_NAME=contractmanager
   DB_USER=root
   DB_PASSWORD=your_mysql_password

   # Server Configuration
   PORT=3001
   NODE_ENV=development
   ```

*(Note: All integration credentials such as GHL Shared Secret, Private Integration Tokens, Webhook Secrets, and Rate Limits are stored dynamically in the MySQL `system_settings` table and editable directly in the Admin UI).*

---

### Step 4: Run Database Migrations & Seeds

Run the database migration script to construct tables and load initial contract templates:

```bash
# Run database schema migrations
npm run migrate

# (Optional) Seed standard templates & initial admin user
npm run seed
```

This creates all core tables:
* `contract_templates` & `contract_template_versions`
* `contract_forms`
* `contract_instances` & `contract_signatures`
* `app_user_access` (RBAC allowlist)
* `system_settings` (Dynamic runtime configurations)
* `contract_audit_logs`

---

### Step 5: Start the Development Server

You can launch both the backend API and frontend Vite development server concurrently with a single command from the project root:

```bash
npm run dev
```

* **Frontend Application**: `http://localhost:5173`
* **Backend REST API**: `http://localhost:3001`
* **Health Check**: `http://localhost:3001/api/health`

---

## 🐳 Alternative: Running with Docker Compose

If you prefer running via Docker without configuring a local MySQL instance:

```bash
# Launch MySQL 8, Backend API, and Frontend Vite container
docker-compose up --build
```

To stop all services:
```bash
docker-compose down
```

---

## ⚙️ GoHighLevel (GHL) Setup & Integration

### 1. Embed as a Custom Menu Link in GHL
1. In your GoHighLevel Agency / Sub-Account Settings, navigate to **Custom Menu Links**.
2. Click **Add New Link**:
   * **Title**: `Contracts & Agreements`
   * **URL**: `https://your-domain.com` (or your ngrok tunnel during development)
   * **Icon**: Select contract/document icon.
   * **Open inside iFrame**: **Yes**.
3. The platform will automatically verify user authentication using GHL SSO.

### 2. Configure Private Integration Token (PIT)
1. In GoHighLevel, navigate to **Settings** → **Developers** → **Private Integrations**.
2. Create a new token with the following scopes:
   * `contacts.readonly`, `contacts.write`
   * `opportunities.readonly`, `opportunities.write`
   * `users.readonly`
   * `custom-fields.readonly`, `custom-fields.write`
   * `conversations/message.readonly`, `conversations/message.write`
3. In ContractManager, log in as an Admin and navigate to **Settings** (`/settings`).
4. Paste the token into the **GHL Private Integration Token** field and click **Save Settings**.

### 3. Automated Webhook Trigger (Won Deals)
To automatically initiate contract generation when an opportunity is won:
1. In GHL Workflows, create a trigger on **Opportunity Status Changed** → `Won`.
2. Add a **Webhook** action:
   * **Method**: `POST`
   * **URL**: `https://your-domain.com/api/webhook/opportunity-won`
   * **Headers**: `Authorization: Bearer <GHL_WEBHOOK_SECRET>`
   * **Payload**: Send contact ID, opportunity ID, and template mapping key.

---

## 🧪 Testing

The system includes comprehensive automated unit and integration tests covering the condition evaluation engine, math formulas, auth tokens, and security rules:

```bash
# Run complete test suite
npm test
```

### Included Test Suites:
* `tests/conditionEngine.test.js`: Validates all 14 conditional operators (`EQUALS`, `CONTAINS`, `IN`, `GREATER_THAN`, compound `AND`/`OR` groups).
* `tests/formulaEngine.test.js`: Validates math expressions, operator precedence, and injection prevention.
* `tests/securityAndAuth.test.js`: Validates JWT verification, rejection of tampered tokens, and header authorization.
* `tests/edgeCaseSecurityMatrix.test.js`: Verifies expired tokens, cross-location isolation, and permission boundaries.
* `tests/e2eLifecycle.test.js`: Validates full contract lifecycle from draft to execution and immutable snapshot freeze.

---

## 🔒 Security & Compliance

* **Immutable Snapshots**: Once a contract is dispatched, a frozen JSON snapshot (`snapshot_json`) preserves the exact document HTML, populated responses, and signers. Subsequent CRM updates never alter an executed contract.
* **Audit Trail**: Every event (Creation, Viewing, Signing, Expiration, Verification) records client IP, user agent, and timestamp.
* **SHA-256 PDF Hash**: Every finalized PDF generates an immutable cryptographic checksum embedded into both the audit certificate and verification portal.
* **Restricted PDF Distribution**: Raw PDF generation endpoints require authenticated agent credentials, preventing unauthorized client scraping.

---

## 📄 License

This software is proprietary and confidential. Unauthorized copying, distribution, or modification of any part of this codebase is strictly prohibited.
