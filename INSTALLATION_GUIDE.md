# Vertex Bullion Savings Plan (VBSP) - Complete Installation & cPanel Deployment Guide

This guide explains how to install, build, and deploy the **Vertex Bullion Savings Plan (VBSP) Portal** to any standard **cPanel shared hosting environment** (e.g. Namecheap, Bluehost, Hostinger, GoDaddy, SiteGround, cPanel/WHM VPS, or Apache/Nginx web server).

---

## ⚡ Zero External AI / Gemini Dependencies

**The entire platform runs 100% autonomously without requiring any Gemini API keys or external server dependencies.**
- All interactive tools, participant calculations, bullion rate engines, and participant services operate locally in the browser or via standard static hosting.
- You can upload the compiled files directly to cPanel `public_html` without configuring external AI keys or cloud billing.

---

## 1. How to Build & Export for cPanel Upload

### Step 1: Export Project Files
In the Google AI Studio interface (top-right menu), click **"Export to ZIP"** or push to a GitHub repository, then extract the files on your computer.

### Step 2: Install Dependencies and Build Locally
Open your command prompt or terminal inside the project folder:
```bash
# 1. Install project dependencies
npm install

# 2. Build the production application
npm run build
```
This generates the optimized production bundle inside the `dist/` directory.

---

## 2. Step-by-Step Upload to cPanel Shared Hosting

### Method A: Static Web Deployment (Recommended for all Shared Hosts)
1. **Log in to your cPanel control panel**.
2. Click on **File Manager**.
3. Navigate to your root directory, typically `public_html/` (or your subdomain directory, e.g., `public_html/vault/`).
4. Click **Upload** and upload all files and folders located inside the `dist/` folder into `public_html/`.
   - Your `public_html/` should contain `index.html`, `assets/`, `manifest.json` (if present), and other static files.

### Step 3: Create / Verify `.htaccess` for Clean Routing
Create a file named `.htaccess` inside `public_html/` with the following content to support client-side routing and page refreshes:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Optional Security Headers & Caching
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
</IfModule>
```

### Step 4: Enable Free SSL Certificate
1. In cPanel, navigate to **SSL/TLS Status** or **Let's Encrypt SSL**.
2. Select your domain and click **Run AutoSSL** / **Issue Certificate** to enable HTTPS (`https://yourdomain.com`).

---

## 3. Account Access & Credentials

> **Security Note:** Public login links do not expose administrative tools. Use the private direct URLs below.

### A. Executive Administrator Access
- **URL**: `https://yourdomain.com/#admin` (or `https://yourdomain.com/index.html#admin`)
- **Administrator Email**: `admin@vbsp.org`
- **Master Password**: `VBSP_Master_2026!`
- **FIPS Security Key / Admin PIN**: `990011`

**Administrator Features:**
1. **Master Bullion Rate Terminal**: Live price management for Gold (G), Silver (S), Platinum (P), Treasury (T), and Rare Minerals (M).
2. **Participant Registry (CRUD)**: Create new participants, adjust vaulted holdings, delete accounts, and launch impersonation sessions.
3. **KYC & Identity Audit Center**: Inspect participant-uploaded SSN cards, Driver's Licenses (front/back), Passports, and update compliance tiers.
4. **Participant Email & Broadcast Center**: Dispatch emails to all participants or selected individual accounts.
5. **Site Name & Custom Logo Settings**: Change brand name, header/footer text, upload custom logo files or image URLs in real time.
6. **Immutable Audit Logs**: Tamper-evident logging of administrative actions.

---

### B. Pre-Configured Test Participant Accounts
Test participant vault logins and distributions at `https://yourdomain.com/#myaccount`:

1. **Marcus Vance (Standard Custody Account)**
   - **Account Number**: `VBSP-8841-9920-12`
   - **Password**: `FederalTSP2026!`
   - **ThriftLine PIN**: `884411`
   - **MFA Code**: Any 6 digits (e.g. `123456`)
   - **Balance**: $342,850.12 (46.8 oz Fine Gold, 420.5 oz Silver)

2. **Dr. Elena Rostova (Sovereign Custody IRA / Rollover)**
   - **Account Number**: `VBSP-1092-3841-04`
   - **Password**: `FederalTSP2026!`
   - **ThriftLine PIN**: `109238`
   - **MFA Code**: Any 6 digits (e.g. `123456`)
   - **Balance**: $618,400.00 (84.5 oz Fine Gold, 760.0 oz Silver)

3. **Col. James Sterling (Corporate Treasury Reserve)**
   - **Account Number**: `VBSP-5521-7789-99`
   - **Password**: `FederalTSP2026!`
   - **ThriftLine PIN**: `552177`
   - **MFA Code**: Any 6 digits (e.g. `123456`)
   - **Balance**: $1,250,000.00 (170.8 oz Fine Gold, 1,530.0 oz Silver)

---

## 4. Participant KYC & Identity Upload Feature

Participants can access the **"ID Verification & KYC"** tab in their dashboard to:
1. Upload/Replace **Social Security Card (SSN)** with encrypted masking (`***-**-4412`).
2. Upload **Driver's License / State ID** (front & back images).
3. Upload **International Passport Booklet** (with photo page verification).
4. Upload **Proof of Address** (Utility Bill or Bank Statement).
5. Inspect uploaded documents via interactive preview lightbox.
6. Track live verification status (**Verified**, **Under Review**, **Action Required**).

---

## 5. MySQL Database Option (Optional)
If connecting to a relational MySQL backend on cPanel:
1. Open cPanel **MySQL Databases** and create a new database (e.g. `user_vbsp`).
2. Open **phpMyAdmin**, select the database, click **Import**, and import `database_schema.sql`.
3. The database schema pre-configures all 10 relational tables for participants, fund prices, loans, beneficiaries, and audit logs.
