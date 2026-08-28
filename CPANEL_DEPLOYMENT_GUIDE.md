# Vertex Bullion Savings Plan (VBSP) Portal - cPanel & Shared Hosting Deployment Guide

This comprehensive guide details everything you need to know about exporting, configuring, and deploying the **Vertex Bullion Savings Plan (VBSP) Portal** to any standard **cPanel shared hosting** (e.g., Namecheap, Bluehost, GoDaddy, Hostinger, SiteGround, cPanel/WHM VPS, or LAMP server).

---

## ⚡ Zero External AI / Gemini Dependencies Confirmation

**The site operates 100% autonomously without any Gemini API key or external server requirements.** All participant tools, KYC uploads, rate calculations, and live support interactions are handled locally, allowing direct plug-and-play hosting on standard cPanel `public_html`.

---

## 1. How to Export This Code from AI Studio

1. In the Google AI Studio interface (top-right navigation bar), locate the **Project Menu / Settings**.
2. Click **"Export to ZIP"** or **"Export to GitHub"**.
3. Save the `.zip` archive to your local computer and extract it.

---

## 2. Shared Hosting Compatibility & Deployment Modes

You can deploy this application to cPanel shared hosting in **two high-performance ways**:

### Method A: Static Web Application (Fastest, 100% Shared Hosting Compatible)
*This is the recommended method for standard cPanel without Node.js root access.*

1. **Build the production files locally:**
   ```bash
   npm install
   npm run build
   ```
   *(This compiles all TypeScript, React 18, and Tailwind CSS components into the `dist/` directory).*
2. **Open cPanel File Manager:**
   - Log in to your cPanel dashboard.
   - Click **File Manager** and navigate to `public_html/` (or your subdomain folder like `public_html/tsp/`).
3. **Upload & Extract:**
   - Upload the contents of the `dist/` folder into `public_html/`.
4. **Add `.htaccess` for Single Page Application (SPA) Routing:**
   Create or edit the `.htaccess` file inside `public_html/` with the following content so deep links and refreshes work seamlessly:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```
5. **Enable Free SSL Certificate:**
   - In cPanel, go to **SSL/TLS Status** or **Let's Encrypt SSL** and click **Run AutoSSL** / **Issue Certificate** to ensure `https://` is active.

---

### Method B: cPanel "Setup Node.js App" (CloudLinux / Phusion Passenger)
*If your shared host has the "Setup Node.js App" icon in cPanel:*

1. Open **Setup Node.js App** in cPanel.
2. Click **Create Application**:
   - **Node.js version**: Choose `18.x`, `20.x`, or `22.x`.
   - **Application root**: `tsp-portal`
   - **Application URL**: Select your domain or subdomain.
   - **Application startup file**: `server.ts` or compiled `dist/server.cjs`.
3. Upload project files, run `npm install` and `npm run build` in the cPanel Terminal or via the Node.js GUI.
4. Click **Restart**.

---

### Method C: Standalone Laravel 11 / PHP & MySQL Stack (or Custom MySQL Backend)
*If deploying as a classic PHP / MySQL Laravel application or connecting to a custom MySQL database:*

1. Ensure your cPanel PHP version is set to **PHP 8.2 or 8.3** via **Select PHP Version** or **MultiPHP Manager**.
2. Create a MySQL Database in cPanel **MySQL Databases**:
   - Database Name: `cpaneluser_tsp`
   - Database Username: `cpaneluser_tspadmin`
   - Database Password: *(Generate a secure password)*
   - Grant **ALL PRIVILEGES** to the user on the database.
3. **Import the SQL Database Schema:**
   - In cPanel, open **phpMyAdmin**.
   - Select your newly created database (`cpaneluser_tsp`) on the left sidebar.
   - Click the **"Import"** tab at the top.
   - Click **"Choose File"** and select the provided `database_schema.sql` file.
   - Click **"Go"** / **"Import"** at the bottom.
   *(This automatically creates all 10 relational tables for participants, fund prices, loans, beneficiaries, audit logs, and pre-seeds the demo participant and admin accounts).*
4. Configure your `.env` file:
   ```env
   APP_NAME="Thrift Savings Plan"
   APP_ENV=production
   APP_KEY=base64:...
   APP_DEBUG=false
   APP_URL=https://yourdomain.com

   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=cpaneluser_tsp
   DB_USERNAME=cpaneluser_tspadmin
   DB_PASSWORD=YourSecurePasswordHere
   ```
5. Set the document root to the `public/` directory in cPanel **Domains / Subdomains**.

---

## 3. Administrator Credentials, Private Access & Participant Accounts

> **SECURITY NOTE**: All administrator login links, default credentials, and participant test credentials have been intentionally removed from the public website interface for production security. Refer to the details below for internal administration.

### A. Executive Administrator Access (Private Direct URL)
* **Direct Access URL**: `https://yourdomain.com/#admin` (or `https://yourdomain.com/index.html#admin`)
* **Administrator Email**: `admin@vbsp.org`
* **Master Password**: `VBSP_Master_2026!`
* **FIPS Security Key / Admin PIN**: `990011`
* **Admin Dashboard Features**:
  1. **Master Bullion Fund Prices**: Live price fixing terminal for Gold (G), Silver (S), Platinum (P), Treasury (T), and Rare Minerals (M) funds with real-time portfolio propagation.
  2. **Participant Registry (CRUD)**: Create new participants, adjust portfolio balances, reset PINs, delete records, and launch impersonation test sessions.
  3. **Participant Email & Broadcast Center**: Send official communications, emergency notices, or vault distribution receipts directly to **all participants** or a **selected individual participant**.
  4. **Site Name & Logo Settings**: Change the site title, upload custom logos (via direct image upload or image URL), update header and footer slogans, support telephone, and dispatch email address in real time.
  5. **CMS Bulletins & Vault Notices**: Publish live news, regulatory updates, and annual vault assay audit reports to the homepage.
  6. **Immutable Audit Trail (NIST SP 800-53)**: Comprehensive tamper-evident logging of all administrative actions, logins, and share price updates.
  7. **AI Vault Fraud & Anomaly Detection**: Real-time monitoring of rapid withdrawal velocity, foreign IP logins, and credential attempts.
  8. **Statutory 2026 Limits**: Configure IRS 402(g) elective deferrals ($23,500), catch-up tiers ($7,500 / $11,250), and Treasury reserve ratios.

---

### B. Pre-Configured Test Participant Accounts
The following participant accounts can be used to test participant vault logins and distributions at `https://yourdomain.com/#myaccount`:

1. **Marcus Vance (Standard Custody Account)**
   * **Account Number**: `VBSP-8841-9920-12`
   * **Password**: `FederalTSP2026!`
   * **ThriftLine PIN**: `884411`
   * **MFA Code**: Any 6 digits (e.g., `123456`)
   * **Plan Type**: VBSP Standard Account (Taxable Reserve) • $342,850.12 balance

2. **Dr. Elena Rostova (Sovereign Custody IRA / 401k Rollover)**
   * **Account Number**: `VBSP-1092-3841-04`
   * **Password**: `FederalTSP2026!`
   * **ThriftLine PIN**: `109238`
   * **MFA Code**: Any 6 digits (e.g., `123456`)
   * **Plan Type**: VBSP Sovereign Custody IRA (Tax-Advantaged Bullion) • $618,400.00 balance

3. **Col. James Sterling (Corporate Treasury Reserve)**
   * **Account Number**: `VBSP-5521-7789-99`
   * **Password**: `FederalTSP2026!`
   * **ThriftLine PIN**: `552177`
   * **MFA Code**: Any 6 digits (e.g., `123456`)
   * **Plan Type**: VBSP Corporate & Institutional Treasury Reserve • $1,250,000.00 balance

---

## 4. Email Dispatch & Communication Configuration

The Admin Dashboard includes a dedicated **Participant Email & Broadcast Center** (Tab #3).

### How to Send Emails from the Admin Dashboard:
1. Log in to the Admin Dashboard (`#admin`).
2. Navigate to **"3. Participant Email & Broadcast"**.
3. Choose your **Recipient Audience**:
   - **"Broadcast to All Registered Participants"**: Dispatches the message to all accounts in the database.
   - **"Single Specific Participant"**: Select any individual registered user from the dropdown menu.
4. Select an **Email Category / Template Preset**:
   - *Official Announcement / Directive*
   - *Physical Vault Distribution / Delivery Receipt*
   - *Annual Tax Notice & Form 1099-R*
   - *Security Alert & Password Reset Notice*
   - *Quarterly Performance & Statement Summary*
5. Fill in the **Subject Line**, customize the **Body / Content**, and optionally attach a formal reference number.
6. Check the **Live Email Preview** rendered on the right side of the screen.
7. Click **"Dispatch Official Email Communication"**.

### Connecting to cPanel SMTP / Webmail for Production:
In a standalone PHP / Node.js backend on cPanel, configure your `.env` with your cPanel email credentials:
```env
MAIL_MAILER=smtp
MAIL_HOST=mail.yourdomain.com
MAIL_PORT=465
MAIL_USERNAME=thriftline@yourdomain.com
MAIL_PASSWORD=YourCpanelEmailPasswordHere
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS=thriftline@yourdomain.com
MAIL_FROM_NAME="Vertex Bullion Savings Plan"
```

---

## 5. Site Name & Logo Customization Guide

You can customize the entire site identity and brand assets directly from the Admin Dashboard:

1. Log in to the Admin Dashboard (`#admin`).
2. Navigate to **"4. Site Name & Logo Settings"**.
3. **Change Site Name & Slogan**:
   - Update the **Site Name / Brand Title** (e.g., "Vertex Bullion Savings Plan" or your custom institution name).
   - Update the **Sub-Heading & Acronym Badge**.
   - Update the **Organization Custody Entity** and legal entity description.
4. **Upload Custom Logo**:
   - **Drag & Drop or File Upload**: Click or drag any PNG, JPG, WebP, or SVG logo file directly into the upload dropzone. The system automatically converts the file into an optimized image asset.
   - **External Image URL**: Alternatively, paste any direct image URL (e.g., `https://yourdomain.com/assets/logo.png`).
5. **Change Contact Information**:
   - Update the toll-free telephone number, official dispatch email address, and physical vault address.
6. Click **"Save & Apply Branding Changes"**. The changes immediately apply across the entire site header, footer, portals, and email templates.

---

## 4. Key Implemented Features & Architecture

1. **U.S. Web Design System (USWDS) & Federal Compliance**:
   - Official `.gov` banner with accordion verification (*"An official website of the United States government"*).
   - Section 508 / WCAG 2.1 AA accessibility controls: Standard and High Contrast modes, dynamic font scaling (A / A+ / A++), and language switching.
   - Screen reader skip links (`#main-content`) and ARIA roles.

2. **Daily Fund Share Prices & Performance Engine**:
   - Real-time closing prices and 1-month / 1-year / 3-year / 5-year / 10-year historical returns for G, F, C, S, I, and Lifecycle (L) funds.
   - Asset composition breakdowns, benchmark indexing, and ultra-low net expense ratios (0.048% - 0.055%).

3. **5 Federal Interactive Calculators**:
   - **Retirement Income Modeler**: Multi-year compound growth projections with adjustable salary, savings rate, and fund allocations.
   - **How Much Can I Contribute? (2026 Limits)**: Pay-period calculator to optimize employee elective deferrals and maximize agency 5% matching without hitting limits prematurely.
   - **Annuity Calculator**: Estimates monthly lifetime payments with single-life, joint-life, and cash refund annuity options.
   - **Roth In-Plan Conversion Modeler**: Compares tax impacts and future tax-free growth between Traditional and Roth balances.
   - **Federal Ballpark Estimate**: Comprehensive projection integrating FERS Basic Annuity pension + Social Security + TSP savings.

4. **AVA 24/7 Virtual Assistant**:
   - Automated federal retirement assistant ready to answer questions regarding contribution limits, loan eligibility, rollover procedures, FERS vesting, and beneficiary changes.

5. **Official Forms & Publications Library**:
   - Interactive repository of standard government documents including Form TSP-1, Form TSP-3, Form TSP-9 (Change in Address), Form TSP-60 (Rollover In), Summary of the TSP, and Tax Notices.

---

## 5. Summary Checklist Before Going Live on cPanel

- [ ] Uploaded `dist/` contents to `public_html/`.
- [ ] Created `.htaccess` in `public_html/` for SPA routing.
- [ ] Enabled free AutoSSL / Let's Encrypt in cPanel.
- [ ] Verified login with account `TSP-0089-4412-98` / `FederalTSP2026!` / PIN `829415`.
- [ ] Verified calculators and fund performance views load smoothly.
