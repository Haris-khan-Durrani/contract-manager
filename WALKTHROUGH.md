# Contract & Form Management System — Complete Walkthrough & GHL Integration Guide

This guide provides a comprehensive overview of how the **Contract & Form Management System** functions, how authentication and GoHighLevel (GHL) Single Sign-On (SSO) work, and how to embed the application directly into GoHighLevel as a Custom Menu Link.

---

## Table of Contents
1. [Application Architecture](#1-application-architecture)
2. [Quick-Start: Running Locally](#2-quick-start-running-locally)
3. [Logging In (Local Dev vs Production)](#3-logging-in-local-dev-vs-production)
4. [Do You Need Marketplace SSO? (Detailed Explanation)](#4-do-you-need-marketplace-sso-detailed-explanation)
5. [How to Embed Inside GoHighLevel](#5-how-to-embed-inside-gohighlevel)
6. [The Two Contract Creation Modes](#6-the-two-contract-creation-modes)
7. [Client Signing Portal & PDF Generation](#7-client-signing-portal--pdf-generation)
8. [Settings & MySQL Dynamic Configuration](#8-settings--mysql-dynamic-configuration)
9. [Troubleshooting & Verification](#9-troubleshooting--verification)

---

## 1. Application Architecture

```
                       ┌─────────────────────────────────────────────────────────┐
                       │                   GoHighLevel (GHL)                     │
                       │  • Custom Menu Link (Iframe)  • Opportunity Workflows   │
                       └────────────────────────────┬────────────────────────────┘
                                                    │
                      ┌─────────────────────────────┴─────────────────────────────┐
                      │                                                           │
                      ▼                                                           ▼
         [MODE 1: Automated Webhook]                                 [MODE 2: Manual In-App]
      GHL Workflow fires webhook on pipeline stage                 Staff member opens GHL Custom Link:
      `POST /api/webhooks/ghl/contract-trigger`                    1. Selects Template + Contact + Opportunity
      • Validates secret & deduplicates idempotency                2. Fills dynamic intake form
      • Evaluates condition rules & creates Contract               3. Clicks "Send for Signature"
                      │                                                           │
                      └─────────────────────────────┬─────────────────────────────┘
                                                    │
                                                    ▼
                                      [Contract State: SENT]
                                      • Freezes immutable snapshot
                                      • Generates single-use signing token
                                      • Sends link to client: `https://.../sign/:token`
                                                    │
                                                    ▼
                                      [Client Public Signing Portal]
                                      • Client views A4 document paper layout
                                      • Signs via Draw (canvas), Type (cursive), or Upload
                                      • Agrees to legal terms and submits
                                                    │
                                                    ▼
                                      [PDF Generation & Auto-Sync]
                                      • Playwright Chromium generates A4 PDF + SHA-256 Certificate
                                      • Uploads PDF to GHL Contact Documents
                                      • Updates GHL custom fields: `contract_status` = 'Signed'
                                      • Posts conversation note with PDF attachment
```

---

## 2. Quick-Start: Running Locally

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MySQL**: MySQL 8+ running on port `3306`
- **Browser**: Google Chrome or Microsoft Edge installed on your machine

### 1. Database Setup
Ensure database credentials are configured in your single root `.env` file:
```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=contractmanager
DB_USER=root
DB_PASSWORD=

PORT=3001
NODE_ENV=development
```

### 2. Run Database Migrations & Seed
In the root directory, run:
```powershell
npm run migrate
npm run seed
```
*`npm run migrate` automatically creates the `contractmanager` database in MySQL if it does not already exist, and generates all tables. `npm run seed` populates sample templates, forms, and system settings.*

### 3. Start Both Backend and Frontend (One Command)
```powershell
npm run dev
```
- **Backend API**: `http://localhost:3001` (with Node `--watch` auto-reload)
- **Frontend UI**: `http://localhost:5173` (with Vite HMR)

---

## 3. Logging In (Local Dev vs Production)

### Local Development Login
When you open **`http://localhost:5173`** directly in your browser:
1. The app detects that it is running standalone outside of a HighLevel iframe.
2. The **Local Dev Mode** card appears on screen.
3. Click **⚡ Login as Super Admin** (or *Admin* / *Sales*).
4. The system requests a development JWT from `POST /api/auth/dev-token`, stores it in `localStorage`, and immediately redirects you to the **Dashboard**.

### Production HighLevel Login
Inside HighLevel, users **never see a login screen**. Authentication is completely automatic and invisible:
1. The user clicks **Contract Manager** in the HighLevel sidebar.
2. HighLevel's parent frame signs a user context token and sends it into the iframe.
3. Our application verifies the signature against your `GHL_SHARED_SECRET`.
4. Role permissions (**SUPER_ADMIN**, **ADMIN**, or **SALES**) are enforced from the `app_user_access` MySQL table.

---

## 4. Do You Need Marketplace SSO? (Detailed Explanation)

> [!IMPORTANT]
> **NO, you do NOT need to purchase or configure an enterprise SSO addon.**

### How GoHighLevel "SSO" Works
GoHighLevel provides **Signed User Context** for Marketplace Apps and Custom Pages for free:

1. **What it is**: Whenever HighLevel embeds an external web app inside its interface, it automatically creates a cryptographically signed JSON Web Token (JWT).
2. **What the token contains**:
   - `userId`: The logged-in GHL user's ID
   - `locationId`: The current sub-account ID
   - `name`: User's full name
   - `email`: User's email address
3. **How it is secured**: The token is signed using your App's **Shared Secret** (HMAC-SHA256). No third-party SSO provider (like Okta, Auth0, or Azure AD) is required.
4. **How our app verifies it**:
   - HighLevel sends the token into the iframe via `postMessage`.
   - The Vue frontend sends it in the `Authorization: Bearer <token>` header to `POST /api/auth/verify`.
   - The backend validates the cryptographic signature using the `GHL_SHARED_SECRET` stored in your MySQL `system_settings` table.

---

## 5. How to Embed Inside GoHighLevel

HighLevel requires embedded iframes to use **HTTPS**. Follow these steps to embed the app:

### Step 1: Expose Localhost via HTTPS Tunnel
For local development, use a free tunneling tool like [ngrok](https://ngrok.com) or Cloudflare Tunnel:
```powershell
ngrok http 5173
```
This gives you a public HTTPS URL, for example: `https://contracts-app.ngrok-free.app`

### Step 2: Register an App in GHL Marketplace (Free)
1. Go to [marketplace.gohighlevel.com](https://marketplace.gohighlevel.com).
2. Click **Create App** and name it **Contract Manager**.
3. Under **App Settings**, copy the **Shared Secret**.
4. In our Contract Manager app, go to **Settings → GHL Shared Secret** and paste this secret (stored securely in MySQL).

### Step 3: Create Custom Menu Link in HighLevel
1. In GoHighLevel, go to **Settings → Custom Menu Links** (in Agency Settings or Sub-Account Settings).
2. Click **+ Create New Link**:
   - **Title**: `Contract Manager`
   - **Icon**: Choose a document/contract icon (e.g. `file-text`).
   - **URL**: `https://contracts-app.ngrok-free.app` (your HTTPS tunnel URL).
   - **Open In**: Select **Inside the App (Iframe)**.
   - **Show on**: Toggle on **Agency** or your selected **Sub-Accounts**.
3. Click **Save**.

The app now appears seamlessly in your GoHighLevel sidebar!

---

## 6. The Two Contract Creation Modes

### Mode 1: Automated Workflow Trigger (Zero Human Effort)
1. **Trigger**: In GHL, an Opportunity moves to a pipeline stage (e.g., *"Proposal Won"*).
2. **Action**: A GHL Workflow fires an HTTP Webhook:
   - **URL**: `https://<your-backend>/api/webhooks/ghl/contract-trigger`
   - **Method**: `POST`
   - **Headers**: `Authorization: Bearer <your_webhook_secret>`
   - **Body**: Standard GHL Opportunity webhook payload.
3. **Execution**:
   - The backend checks for duplicate deliveries using SHA-256 idempotency keys.
   - It fetches Contact and Opportunity details via GHL Private Integration Token.
   - Evaluates template conditional rules.
   - Automatically generates the contract instance in state `AWAITING_FORM` or `READY`.

### Mode 2: Manual In-App Wizard (Sales Rep Flow)
1. In the sidebar, navigate to **Contracts → New Contract**.
2. **Step 1 (Template)**: Select a contract template (e.g., Master Services Agreement).
3. **Step 2 (Contact)**: Select or search for the GHL contact.
4. **Step 3 (Opportunity)**: Select the relevant sales pipeline opportunity.
5. **Step 4 (Form Intake)**: Answer any required intake questions.
6. Click **Create Contract**.
7. From the contract detail view, click **🚀 Send for Signature**.

---

## 7. Client Signing Portal & PDF Generation

### Public Signing URL
When a contract is sent, the system generates a secure, single-use URL:
```
http://localhost:5173/sign/<single-use-token>
```

### Signer Capabilities
The signee does not need a login. On the signing page, they can:
- Review the entire contract formatted in an A4 paper layout.
- Choose their signature method:
  1. **Draw**: Draw on canvas with finger or mouse (high-DPI smoothed).
  2. **Type**: Type their name to generate a legal cursive signature.
  3. **Upload**: Upload a photo/scan of their signature.
- Check the legal consent box (*"I agree to be legally bound by this document"*).
- Click **Sign & Complete**.

### HighLevel Automated Post-Signing Actions
Once signed:
1. **Playwright PDF Generation**: Playwright Chromium renders an exact A4 PDF and computes a SHA-256 cryptographic audit certificate (including signer IP, User-Agent, and exact UTC timestamp).
2. **GHL Upload**: The backend uploads the signed PDF directly to the GHL Contact's document library.
3. **Custom Field Updates**: Updates GHL Contact custom fields:
   - `contract_status` → `Signed`
   - `contract_signed_date` → Current ISO timestamp
   - `contract_pdf_url` → Link to stored PDF
4. **Conversation Note**: Posts an Internal Comment to the GHL conversation thread with the PDF download link.

---

## 8. Settings & MySQL Dynamic Configuration

To ensure zero maintenance overhead, **all application and integration settings are stored in MySQL** rather than static text files:

- **MySQL-Only `.env`**: The `.env` file strictly contains database connection details:
  ```env
  DB_HOST=127.0.0.1
  DB_PORT=3306
  DB_NAME=contractmanager
  DB_USER=root
  DB_PASSWORD=
  PORT=3001
  ```
- **Dynamic `system_settings` Table**:
  All other parameters live in the `system_settings` table:
  - `GHL_SHARED_SECRET`
  - `GHL_PRIVATE_INTEGRATION_TOKEN`
  - `GHL_WEBHOOK_SECRET`
  - `SIGNING_BASE_URL`
  - `EXPIRY_WORKER_CRON` & `RETRY_WORKER_CRON`
- **Super Admin UI (`/admin/settings`)**:
  Super Admins can edit integration credentials directly from the frontend without touching code or restarting the server.

---

## 9. Troubleshooting & Verification

### Running Automated Test Suites
Run the 5 test suites covering 57 edge-case scenarios:
```powershell
npm test
```
*Tests pass with 57/57 assertions including JWT security, replay attack protection, zero-eval formula calculation, and Playwright PDF generation.*

### Common Issues & Solutions

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| `Unknown database 'contractmanager'` | Database has not been migrated yet. | Run `npm run migrate` then `npm run seed`. |
| Loop on Access Denied | Dev token missing or expired. | Go to `http://localhost:5173` and click **⚡ Login as Super Admin**. |
| GHL Iframe displays blank | URL is not HTTPS. | GHL requires HTTPS for iframes. Use `ngrok http 5173` to get an HTTPS tunnel URL. |
| PDF generation fails | Chrome/Edge not installed. | Ensure standard Google Chrome or Microsoft Edge is installed on the host machine. |
