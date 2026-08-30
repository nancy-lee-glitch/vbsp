# Vertex Bullion Savings Plan (VBSP) - Vercel & Neon (PostgreSQL) Deployment Guide

This guide details how to configure, deploy, and run the **Vertex Bullion Savings Plan (VBSP)** application on **Vercel** connected to a **Neon Serverless PostgreSQL** database.

---

## ⚡ Architecture Summary

- **Frontend / Full-Stack Hosting**: Vercel (Edge & Node.js Serverless runtime or Static SPA).
- **Database Engine**: Neon Serverless PostgreSQL (PostgreSQL 15 / 16+ with SSL connection pooling).
- **Connection Configuration**: Single unified `DATABASE_URL` or `POSTGRES_URL` connection string (no separate host/user/password lines needed).
- **SQL DDL & Schema**: Clean PostgreSQL syntax located in `database_schema.sql`.

---

## 1. Setting up Neon (PostgreSQL)

1. Go to [Neon.tech](https://neon.tech) and log in or create a free serverless project.
2. Create a new database (e.g., `neondb` or `vbsp_custody`).
3. In the Neon Project Dashboard, copy your connection string from the **Connection Details** widget:
   - Select **Pooled connection** (recommended for serverless) or **Direct connection**.
   - Your string will look like:
     ```
     postgresql://neondb_owner:YOUR_PASSWORD@ep-solitary-base-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
     ```

---

## 2. Importing the PostgreSQL Database Schema

You can import the schema directly using the Neon Web Console:

1. In the Neon Dashboard, click on **SQL Editor** on the left menu.
2. Open the `database_schema.sql` file from this project and copy its entire content.
3. Paste into the Neon SQL Editor and click **Run**.
4. The schema creates the following 13 PostgreSQL tables:
   - `admin_users` (Executive administrators and RBAC permissions)
   - `fund_prices` (Bullion funds: G-Gold, S-Silver, P-Platinum, T-Treasury, M-Numismatic)
   - `participant_accounts` (Participant profiles, balances, and custody status)
   - `participant_allocations` (Metal holdings, shares, and segregated bar IDs)
   - `payment_methods` (Crypto depository wallets, Fedwire, and P2P rails)
   - `participant_deposits` (Deposit verification requests and receipts)
   - `participant_loans` (Bullion-collateralized loans)
   - `beneficiaries` (Vault title transfer designations)
   - `statutory_parameters` (2026 contribution limits and reserve ratios)
   - `audit_logs` (NIST SP 800-53 compliant immutable audit trail)
   - `fraud_alerts` (Automated anomaly detection alerts)
   - `announcements` (CMS bulletins and annual assay audit notices)
   - `site_branding` (Custom logo, header, and institution titles)

---

## 3. Configuring Environment Variables in Vercel

1. In your [Vercel Dashboard](https://vercel.com), select your imported project.
2. Navigate to **Settings** > **Environment Variables**.
3. Add the following variable:
   - **Key**: `DATABASE_URL` (or `POSTGRES_URL`)
   - **Value**: `postgresql://neondb_owner:YOUR_PASSWORD@ep-sample-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require`
   - **Environments**: Check *Production*, *Preview*, and *Development*.
4. (Optional) If you use AVA AI Assistant with Gemini:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: *(Your Google AI Studio Gemini API Key)*

---

## 4. Local Development with Neon

To test locally against your Neon PostgreSQL database:

1. Update your local `.env` file:
   ```env
   DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-sample-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Check database connectivity by visiting:
   ```
   http://localhost:3000/api/db/status
   ```
   This returns the connected PostgreSQL server time, version, database name, and table list.

---

## 5. Vercel Build & Deploy Settings

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
