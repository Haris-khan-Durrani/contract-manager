# Contract Management System — Technical Specification & Architecture Document

---

## 1. System Overview & GHL-First Architectural Vision

The Contract Management System is a specialized contract and dynamic form generation engine built on top of **GoHighLevel (GHL)**.

### Core Architectural Principle: GHL-First, MySQL-Light
- **GoHighLevel is the operational data platform**: Contacts, opportunities, users, custom fields, CRM statuses, final signed PDFs, media files, conversation notes, and marketing/operational workflows remain natively inside GoHighLevel.
- **MySQL 8+ is strictly lightweight**: It stores only contract-engine-specific information such as template document schemas, form schemas, version history, conditional rules, signing tokens, immutable contract snapshots, and audit logs. The backend does **not** create local mirror tables for Contacts, Opportunities, Users, or Pipelines.

```
                    GOHIGHLEVEL
               OPERATIONAL BACKBONE
                       │
       ┌───────────────┼────────────────┐
       │               │                │
    Contacts      Opportunities        Users
 Custom Fields    Custom Fields     Identity
       │               │                │
       ├───────────────┼────────────────┤
       │               │                │
     Files        Conversations      Workflows
       │               │                │
       └───────────────┼────────────────┘
                       │
               Private Integration Token
                       │
                       ▼
                 NODE.JS BACKEND
                       │
       ┌───────────────┼────────────────┐
       │               │                │
    Contract          Form          Condition
     Engine          Engine          Engine
 (Authoritative)  (Authoritative) (Authoritative)
       │               │                │
       └───────────────┼────────────────┘
                       ▼
                  VUE 3 (UI)
        (Reactive Preview Only)
                       │
                LIGHTWEIGHT MYSQL 8+
                       │
          Templates / Forms / Versions
          Rules / Access / Snapshots
          Tokens / Signing Audit
```

---

## 2. Authentication & Authorization Model

There are two completely distinct credentials in the system:

1. **GHL Signed User Context (Authentication)**:
   - Internal users access the application embedded as a GHL Custom Page.
   - Vue frontend obtains cryptographically signed GHL user context.
   - Node backend decrypts/validates the context using the App Shared Secret and extracts: `userId`, `locationId`, and user info.
   - Node verifies the user against the `app_user_access` allowlist.
   - **Zero Application Credentials**: There are no application usernames, passwords, registrations, or password reset endpoints. URL query parameters (e.g. `?userId=...`) are strictly rejected.
2. **GHL Private Integration Token (Backend API Communication)**:
   - Stored server-side only (never exposed to Vue / client).
   - Injected by the central backend GHL service client for API calls to the sub-account (e.g. fetching contacts, creating custom fields, uploading signed PDFs).
3. **Public Client Signing Exception**:
   - Clients sign contracts via `/sign/:token`.
   - Single-use, encrypted, expiring token; requires no GHL account.

---

## 3. Contract Creation Modes

The application strictly supports **two modes** of contract creation:

### 3.1. Automatic Mode (Webhook Triggered)
```
GHL Opportunity WON
       ↓
Workflow Custom Webhook (POST /api/webhooks/ghl/contract-trigger)
  Headers: Authorization: Bearer <RANDOM_WEBHOOK_SECRET>
  Payload: { locationId, contactId, opportunityId, trigger }
       ↓
Backend validates webhook secret & checks idempotency
       ↓
Fetch latest Contact + Opportunity + Assigned User using Private Integration Token
       ↓
Rule Engine matches appropriate Contract Template
       ↓
Validate required contract/form fields:
       ├── Missing required info  ──> State: AWAITING_FORM (Sales sees "Complete Form")
       └── All required present   ──> State: READY (Sales sees "Review & Send")
       ↓
Sync status to GHL Contract Status Custom Field
```

### 3.2. Manual Mode (User Triggered)
```
Authorized User in GHL Custom Page
       ↓
Clicks + Create Contract
       ↓
STEP 1: SELECT CONTRACT TEMPLATE (Mandatory first step)
  (Determines form, mappings, validity rules, clauses, conditions)
       ↓
STEP 2: SELECT GHL CONTACT (Search GHL API)
       ↓
STEP 3: SELECT OPPORTUNITY (If applicable)
       ↓
LOAD CONTRACT FORM (Prefilled with live GHL data)
       ↓
USER COMPLETES FORM (Live conditions show/hide fields & swap contract clauses)
       ↓
DYNAMIC CONTRACT PREVIEW (Real-time reactive feedback)
       ↓
DISPATCH CONTRACT (Authoritative backend recalculation + Immutable Snapshot frozen)
```

---

## 4. Central Form Builder & Data Sourcing

- **Unlimited Fields**: The Form Builder places no arbitrary application-level limit on the number of fields an Admin can configure.
- **Storage Choice per Field**:
  - `Contract Only` $\rightarrow$ Kept in `form_response_json` in MySQL.
  - `GHL Contact Field` / `GHL Contact Custom Field` $\rightarrow$ Synchronized to GHL Contact.
  - `GHL Opportunity Field` / `GHL Opportunity Custom Field` $\rightarrow$ Synchronized to GHL Opportunity.
- **Dynamic GHL Field Discovery**:
  - Builder queries GHL Custom Fields API (`GET /locations/:locationId/customFields`) and binds to immutable `ghlFieldId` and `ghlFieldKey` (preventing breakage if a label is renamed).
- **On-The-Fly GHL Field Creation**:
  - Admins can click `[ Create New GHL Field ]` in the builder. The backend calls GHL's API (`POST /locations/:locationId/customFields` for `contact` or `opportunity`) and automatically records the returned ID in the form schema.

---

## 5. Dynamic Variables, Safe Formulas & Precedence

### 5.1. Variable Syntax
- `{{contact.first_name}}`, `{{contact.passport_number}}`
- `{{opportunity.name}}`, `{{opportunity.value}}`
- `{{form.dependents}}`, `{{form.spouse_name}}`
- `{{calc.total_amount_with_vat}}`
- `{{system.current_date}}`, `{{system.contract_id}}`

### 5.2. Safe Formula Engine (No `eval` / `new Function`)
- Formulas for calculations (e.g. fees, VAT, net balance) run through a secure mathematical expression parser.
- Strictly supported operators: `+`, `-`, `*`, `/`, `%`, `min`, `max`, `round`, `percentage`.
- **Zero dynamic code execution** to prevent arbitrary code injection.

### 5.3. Precedence & Authority
- **Precedence**: `Manual Form Value` $\rightarrow$ `GHL Field Value` $\rightarrow$ `Template Default`.
- **Authoritative Execution**: The Vue frontend runs formulas and conditions for **live UI preview only**. The Node.js backend authoritatively recalculates all values and clause selections before generating the send snapshot.

---

## 6. Unified Condition Engine

A single recursive condition engine (`AND`, `OR`, arbitrary nesting) powers:
1. **Form Visibility**: Show/hide questions.
2. **Contract Clauses**: Include/exclude document sections, terms, and schedules.
3. **Webhook Routing**: Select matching template.

Supported operators:
`equals`, `not_equals`, `contains`, `not_contains`, `greater_than`, `less_than`, `greater_or_equal`, `less_or_equal`, `is_empty`, `is_not_empty`, `in`, `not_in`, `starts_with`, `ends_with`.

---

## 7. Playwright PDF Pipeline & GHL File Integration

```
IMMUTABLE SNAPSHOT (Frozen at Send)
       │
       ▼
CLIENT SIGNS (Public Portal: /sign/:token)
       │
       ▼
NODE PLAYWRIGHT CHROMIUM RENDERER
       │ (Generates pristine A4 PDF + Audit Certificate + SHA-256)
       ▼
GHL FILE UPLOAD (POST /forms/upload-custom-files?contactId=...&locationId=...)
       ├── Upload Success  ──> State: COMPLETED
       │                        - Update GHL Status to "Completed"
       │                        - Update GHL Contract PDF URL custom field
       │                        - Create GHL Conversation InternalComment with attachment
       │
       └── Upload Failure  ──> State: SIGNED_PENDING_STORAGE
                                - Contract is legally signed; client never re-signs
                                - Background retry worker uploads PDF to GHL on recovery
```

---

## 8. Database Schema (Lightweight MySQL 8+)

```sql
-- 1. Authorization Allowlist Table
CREATE TABLE IF NOT EXISTS app_user_access (
  id INT AUTO_INCREMENT PRIMARY KEY,
  location_id VARCHAR(64) NOT NULL,
  ghl_user_id VARCHAR(64) NOT NULL,
  app_role ENUM('SUPER_ADMIN', 'ADMIN', 'SALES') NOT NULL DEFAULT 'SALES',
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_location_user (location_id, ghl_user_id),
  INDEX idx_location (location_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Contract Forms Schema Table
CREATE TABLE IF NOT EXISTS contract_forms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  location_id VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  schema_json JSON NOT NULL, -- Field definitions, types, GHL IDs, sources, validation
  created_by VARCHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_location (location_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Contract Templates Table
CREATE TABLE IF NOT EXISTS contract_templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  location_id VARCHAR(64) NOT NULL,
  form_id INT NULL,
  name VARCHAR(255) NOT NULL,
  contract_type VARCHAR(100) NOT NULL,
  current_version INT NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  validity_days INT NOT NULL DEFAULT 7,
  document_schema_json JSON NOT NULL, -- Document clauses and dynamic tokens
  conditional_rules_json JSON NULL, -- Clause visibility logic
  creation_rules_json JSON NULL,    -- Webhook matching rules
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (form_id) REFERENCES contract_forms(id) ON DELETE SET NULL,
  INDEX idx_location_type (location_id, contract_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Contract Template Versions (Audit & Rollback)
CREATE TABLE IF NOT EXISTS contract_template_versions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  template_id INT NOT NULL,
  version_number INT NOT NULL,
  document_schema_json JSON NOT NULL,
  form_schema_snapshot JSON NULL,
  created_by VARCHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (template_id) REFERENCES contract_templates(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Contract Instances Table
CREATE TABLE IF NOT EXISTS contract_instances (
  id INT AUTO_INCREMENT PRIMARY KEY,
  location_id VARCHAR(64) NOT NULL,
  template_id INT NOT NULL,
  template_version INT NOT NULL,
  ghl_contact_id VARCHAR(64) NOT NULL,
  ghl_opportunity_id VARCHAR(64) NULL,
  assigned_user_id VARCHAR(64) NOT NULL,
  created_by_user_id VARCHAR(64) NOT NULL,
  creation_mode ENUM('AUTOMATIC', 'MANUAL') NOT NULL,
  state ENUM(
    'AWAITING_FORM',
    'READY',
    'SENT',
    'VIEWED',
    'SIGNED',
    'SIGNED_PENDING_STORAGE',
    'COMPLETED',
    'EXPIRED',
    'CANCELLED',
    'DECLINED',
    'SUPERSEDED'
  ) NOT NULL DEFAULT 'AWAITING_FORM',
  form_response_json JSON NULL,       -- Contract-specific local form values
  snapshot_json JSON NULL,            -- Frozen immutable document & data at send
  signing_token VARCHAR(128) UNIQUE NULL,
  token_expires_at TIMESTAMP NULL,
  viewed_at TIMESTAMP NULL,
  signed_at TIMESTAMP NULL,
  pdf_sha256 VARCHAR(64) NULL,
  ghl_file_url VARCHAR(512) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (template_id) REFERENCES contract_templates(id),
  INDEX idx_location_state (location_id, state),
  INDEX idx_contact (ghl_contact_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Contract Audit Log Table
CREATE TABLE IF NOT EXISTS contract_audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  contract_instance_id INT NOT NULL,
  actor_type ENUM('USER', 'CLIENT', 'SYSTEM') NOT NULL,
  actor_id VARCHAR(64) NULL,
  action VARCHAR(100) NOT NULL,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  metadata_json JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contract_instance_id) REFERENCES contract_instances(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 9. Comprehensive Contract State Machine

- **`AWAITING_FORM`**: Webhook auto-created contract requiring sales input for missing mandatory fields.
- **`READY`**: All data and mandatory form fields validated; contract generated and ready to send.
- **`SENT`**: Contract dispatched to client via Email/SMS with secure signing link (immutable snapshot frozen).
- **`VIEWED`**: Client opened public signing portal.
- **`SIGNED`**: Client signed the document.
- **`SIGNED_PENDING_STORAGE`**: Client signed, but GHL API temporarily failed on PDF upload. Queued for automatic background retry without prompting client to re-sign.
- **`COMPLETED`**: Final signed PDF generated, uploaded to GHL Contact documents, and contact/opportunity tags, fields, and conversation note posted.
- **`EXPIRED`**: Validity window lapsed without signature.
- **`CANCELLED`**: Revoked by sales or admin prior to signing.
- **`DECLINED`**: Client rejected the terms or declined signature.
- **`SUPERSEDED`**: Replaced by a revised contract instance.

---

## 10. Central Admin Navigation & Template Tabs

### Application Navigation
```
CONTRACT MANAGEMENT
 ├── Dashboard
 ├── Contracts (All Contracts, My Contracts, + Create Contract)
 ├── Templates (Contract Templates, Contract Builder)
 ├── Forms (Forms List, Form Builder)
 ├── Automation (Contract Rules, Conditions)
 ├── GHL Integration (Field Mapping & Discovery, Sync Status)
 └── Administration (Users & Access, Roles, Settings)
```

### Unified Contract Template Configuration Tabs
```
[ Legal Services Agreement ]
─────────────────────────────────────────────────────────────────────────────
[ Builder ]   [ Form ]   [ Variables ]   [ Conditions ]   [ Rules ]   [ Validity ]   [ Versions ]
```
