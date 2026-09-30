# Cassivon Capital Savings Plan (CCSP) - Complete Installation & Deployment Guide

This guide explains how to install, build, configure, and deploy the **Cassivon Capital Savings Plan (CCSP) Platform** across:
1. **Vercel (Hobby & Pro Plans)** — Optimized with 10 Serverless Functions and Neon PostgreSQL.
2. **cPanel / Shared Hosting / Apache / Nginx** — Static SPA export with `.htaccess` URL rewrites.
3. **Local Development & Full-Stack Node.js** — Running locally via Vite & Express (`server.ts`).

---

## ⚡ Key Architecture & Highlights

* **10 Serverless Functions (Vercel Hobby Compliant)**: Fully consolidated `/api` folder with exactly 10 endpoint files, well below the 12-function limit of the Vercel Hobby plan.
* **Separated Database Client (`lib/db.js`)**: All database logic lives in `/lib/db.js` outside `/api`, preventing Vercel from counting helper files as serverless functions.
* **Neon Serverless PostgreSQL**: High-performance pooled connection supporting `DATABASE_URL`, `POSTGRES_URL`, `POSTGRES_PRISMA_URL`, and unpooled strings with SSL.
* **Automated Self-Healing Database**: The application automatically checks and boots missing tables on startup if connected to a fresh database instance.
* **Full Institutional Features**: Admin Approvals Hub, Participant ID Verification (KYC), Deposit Proofs & Approvals, Collateralized Loans, Vault Withdrawals, Beneficiaries, Documents Center, and Live Chat / Messaging.

---

## 1. Local Development Setup

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher

### Steps
1. Clone or extract your project repository.
2. Open your terminal in the project root directory and install dependencies:
   ```bash
   npm install
   ```
3. Configure your environment variables in `.env`:
   ```env
   PORT=3000
   NODE_ENV=development
   DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@YOUR_HOST-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
   POSTGRES_URL="postgresql://neondb_owner:YOUR_PASSWORD@YOUR_HOST-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:3000`.

---

## 2. Vercel Deployment (Hobby Plan Ready)

The project has been optimized to deploy seamlessly on the **Vercel Hobby plan** without hitting the 12-function limit.

### Serverless Function Directory (`/api` - 10 Functions)
```
/api
  ├── admin.js        # Admin login, participants, funds, payment methods, beneficiaries, audit logs, transactions
  ├── auth.js         # Participant login & registration
  ├── branding.js     # Site branding & custom assets
  ├── deposits.js     # Payment proofs, deposit requests & approvals
  ├── documents.js    # Statements, tax forms & participant vault uploads
  ├── health.js       # Database connectivity & system health
  ├── kyc.js          # ID verification uploads & administrative approvals
  ├── loans.js        # Collateralized loan applications & approvals
  ├── messages.js     # Secure dispatch & mailbox messaging
  └── withdrawals.js  # Bullion withdrawal requests & processing

/lib
  └── db.js           # Neon PostgreSQL connection client (outside /api)
```

### Deployment Steps on Vercel
1. Push your repository to **GitHub**, **GitLab**, or **Bitbucket**.
2. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New Project"**.
3. Import your Git repository.
4. Set the Build and Output settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Configure Environment Variables in Vercel:
   - Add `DATABASE_URL` with your Neon PostgreSQL connection string:
     ```env
     DATABASE_URL=postgresql://neondb_owner:your_password@ep-dry-boat-b7s0uhrp-pooler.c-13.us-east-1.aws.neon.tech/neondb?sslmode=require
     ```
   - *(Optional)* Add `POSTGRES_URL` with the same string.
6. Click **Deploy**. Vercel will build the frontend into `dist/` and deploy the 10 serverless functions in `/api/`.

---

## 3. Database Setup (Neon PostgreSQL)

### Option A: Automated Bootstrap (Default)
When you start the application or deploy it with a valid `DATABASE_URL`, the server checks whether `participant_accounts` exists. If the database is blank, it automatically initializes all 15 tables and seeds demo accounts.

### Option B: Manual SQL Execution via Neon Console
1. Log in to [Neon Console](https://console.neon.tech) and select your project.
2. Click **SQL Editor** in the left sidebar.
3. Open `database_schema.sql` from your project root.
4. Copy the entire file content, paste it into the Neon SQL Editor, and click **Run**.
5. This creates the following 15 relational tables:
   - `participant_accounts`
   - `fund_prices`
   - `site_branding`
   - `payment_methods`
   - `deposits`
   - `withdrawal_requests`
   - `loan_applications`
   - `user_documents`
   - `messages`
   - `transactions`
   - `admin_users`
   - `kyc_documents`
   - `beneficiaries`
   - `audit_logs`
   - `ledger_transactions`

---

## 4. cPanel & Shared Hosting Deployment

If you are deploying to a standard cPanel web host (Namecheap, Hostinger, Bluehost, GoDaddy, SiteGround, Apache/Nginx VPS):

### Step 1: Build the Static Bundle
Run the build command locally:
```bash
npm run build
```
This compiles the application and generates the optimized production bundle inside `dist/`.

### Step 2: Upload Files via cPanel File Manager
1. Log in to your cPanel dashboard.
2. Open **File Manager** and navigate to `public_html/` (or your subdomain folder).
3. Upload all files and folders located inside the `dist/` directory into `public_html/`.
4. Ensure `index.html` is directly inside `public_html/`.

### Step 3: Configure `.htaccess` for Client-Side Routing
Create or edit `.htaccess` in your `public_html/` folder:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
</IfModule>
```

### Step 4: Enable SSL
1. In cPanel, open **SSL/TLS Status** or **Let's Encrypt SSL**.
2. Select your domain and click **Run AutoSSL** / **Issue Certificate** to ensure HTTPS is active.

---

## 5. System Credentials & Access Points

> **Security Note:** Public navigation links do not expose the Administrative Portal. Access the administrative login via `#admin` or through the secure footer seal.

### A. Executive Administrator Access
* **Portal URL**: `https://yourdomain.com/#admin`
* **Admin Email**: `admin@cassivon.com`
* **Master Passwords**: `CCSP_Master_2026!` (or `CCSP_Admin_2026!`)
* **Security PIN / FIPS Key**: `884411` (or `990011`, `829415`)

**Executive Administrative Capabilities:**
1. **Approvals Hub**: Review, approve, or reject KYC submissions, payment deposit proofs, participant loan requests, bullion withdrawals, and uploaded documents.
2. **Participant Registry (CRUD)**: Create accounts, adjust balances (Traditional, Roth, Gold oz, Silver oz), update verification tiers, and launch impersonation sessions.
3. **Master Bullion Rate Terminal**: Manage live prices and yields for G-Fund (Gold), S-Fund (Silver), P-Fund (Platinum), T-Fund (Treasury), and Lifecycle Portfolios.
4. **Payment Gateways**: Configure institutional bank wire instructions, Bitcoin (BTC) addresses, and USDT (TRC-20) segregated vault wallets.
5. **Branding Manager**: Update company name, slogan, logo images, support telephone, and compliance disclaimers in real time.
6. **Immutable Audit Logs**: Tamper-evident logging of administrative actions with IP tracking.

---

### B. Pre-Configured Test Participant Accounts
Test vault logins and participant services at `https://yourdomain.com/#myaccount`:

1. **Major Marcus Vance (Ret.)** — Sovereign Custody IRA / Rollover
   * **Email**: `marcus.vance@defense.gov`
   * **Account Number**: `CCSP-0089-4412-98`
   * **Password**: `CassivonCapital2026!` (or `FederalTSP2026!`)
   * **ThriftLine PIN**: `829415`
   * **Portfolio Balance**: $342,850.12 (120.45 oz Gold, 3,450.0 oz Silver)
   * **Status**: Active • Verified (Tier 1 Allocated)

2. **Elena Vasquez** — Standard Taxable Reserve
   * **Email**: `e.vasquez@treasury.gov`
   * **Account Number**: `CCSP-0041-8821-14`
   * **Password**: `CassivonCapital2026!` (or `FederalTSP2026!`)
   * **ThriftLine PIN**: `554411`
   * **Portfolio Balance**: $189,420.50 (65.20 oz Gold, 1,850.0 oz Silver)
   * **Status**: Active • Verified (Tier 1 Allocated)

---

## 6. Participant Verification & Document Workflows

Participants can manage compliance directly within the **"ID Verification & KYC"** and **"Documents Center"** tabs:
1. **Government ID Upload**: Driver's License (front & back), International Passport, or State ID with live camera capture or file upload.
2. **SSN / Tax Identification**: Social Security Card with encrypted masking (`***-**-4412`).
3. **Proof of Residence**: Utility bill or bank statement uploaded directly to Neon PostgreSQL storage.
4. **Deposit Payment Receipts**: Upload payment receipts for bank wires, BTC transfers, or USDT deposits with automatic review queueing in the Admin Approvals Hub.
5. **Full Audit Sync**: Document status updates approved by the Administrator immediately sync in real time across the participant view.

---

## 7. Build Scripts & Verification

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts full-stack development server with Vite HMR on port 3000 |
| `npm run build` | Compiles production SPA and server bundle to `dist/` |
| `npm run lint` | Runs TypeScript typechecker (`tsc --noEmit`) to verify zero errors |
| `npm start` | Boots the compiled production server (`node dist/server.cjs`) |
| `npm run clean` | Cleans previous build artifacts from `dist/` |
