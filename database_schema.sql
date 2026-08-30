-- ==============================================================================
-- VERTEX BULLION SAVINGS PLAN (VBSP.ORG) - POSTGRESQL DATABASE SCHEMA & SEED DATA
-- Target Engine: Neon Serverless PostgreSQL / Vercel Postgres / PostgreSQL 14, 15, 16+
-- Model: Federal Thrift & Sovereign Precious Metals Vaulted Custody System
-- Connection: Reads from single DATABASE_URL or POSTGRES_URL connection string
-- ==============================================================================

-- Enable UUID & Crypto extensions if available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables with CASCADE for clean idempotent schema recreation
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS fraud_alerts CASCADE;
DROP TABLE IF EXISTS statutory_parameters CASCADE;
DROP TABLE IF EXISTS beneficiaries CASCADE;
DROP TABLE IF EXISTS participant_loans CASCADE;
DROP TABLE IF EXISTS participant_allocations CASCADE;
DROP TABLE IF EXISTS payment_methods CASCADE;
DROP TABLE IF EXISTS participant_deposits CASCADE;
DROP TABLE IF EXISTS participant_accounts CASCADE;
DROP TABLE IF EXISTS fund_prices CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS site_branding CASCADE;

-- Drop existing custom ENUM types
DROP TYPE IF EXISTS admin_role_type CASCADE;
DROP TYPE IF EXISTS fund_category_type CASCADE;
DROP TYPE IF EXISTS account_type_enum CASCADE;
DROP TYPE IF EXISTS service_type_enum CASCADE;
DROP TYPE IF EXISTS account_status_enum CASCADE;
DROP TYPE IF EXISTS loan_type_enum CASCADE;
DROP TYPE IF EXISTS loan_status_enum CASCADE;
DROP TYPE IF EXISTS beneficiary_type_enum CASCADE;
DROP TYPE IF EXISTS audit_status_enum CASCADE;
DROP TYPE IF EXISTS fraud_severity_enum CASCADE;
DROP TYPE IF EXISTS fraud_status_enum CASCADE;
DROP TYPE IF EXISTS announcement_category_enum CASCADE;
DROP TYPE IF EXISTS payment_category_enum CASCADE;
DROP TYPE IF EXISTS deposit_status_enum CASCADE;

-- ------------------------------------------------------------------------------
-- ENUM TYPE DEFINITIONS
-- ------------------------------------------------------------------------------
CREATE TYPE admin_role_type AS ENUM (
  'SUPER_ADMIN', 
  'EXECUTIVE_CHAIR', 
  'VAULT_DIRECTOR', 
  'AUDIT_OFFICER', 
  'COMPLIANCE_OFFICER'
);

CREATE TYPE fund_category_type AS ENUM (
  'Core Bullion Fund', 
  'Lifecycle Portfolio'
);

CREATE TYPE account_type_enum AS ENUM (
  'VBSP Standard Account (Taxable Reserve)', 
  'VBSP Sovereign Custody (Self-Directed / IRA)', 
  'VBSP Institutional / Corporate Reserve'
);

CREATE TYPE service_type_enum AS ENUM (
  'STANDARD_INDIVIDUAL', 
  'SOVEREIGN_IRA', 
  'CORPORATE_TREASURY'
);

CREATE TYPE account_status_enum AS ENUM (
  'ACTIVE', 
  'SEPARATED', 
  'RETIRED', 
  'LOCKED'
);

CREATE TYPE loan_type_enum AS ENUM (
  'General Purpose Bullion Loan', 
  'Real Estate / Asset Acquisition'
);

CREATE TYPE loan_status_enum AS ENUM (
  'ACTIVE', 
  'PAID_OFF', 
  'DEFAULTED'
);

CREATE TYPE beneficiary_type_enum AS ENUM (
  'PRIMARY', 
  'CONTINGENT'
);

CREATE TYPE audit_status_enum AS ENUM (
  'Success', 
  'Flagged', 
  'Blocked'
);

CREATE TYPE fraud_severity_enum AS ENUM (
  'Low', 
  'Medium', 
  'High', 
  'Critical'
);

CREATE TYPE fraud_status_enum AS ENUM (
  'Open', 
  'Resolved', 
  'Dismissed'
);

CREATE TYPE announcement_category_enum AS ENUM (
  'General', 
  'Vault Audit', 
  'Regulatory', 
  'Maintenance'
);

CREATE TYPE payment_category_enum AS ENUM (
  'crypto', 
  'wire', 
  'p2p'
);

CREATE TYPE deposit_status_enum AS ENUM (
  'SUBMITTED', 
  'VERIFYING_DEPOSIT', 
  'VAULT_CONFIRMED', 
  'REJECTED'
);

-- ------------------------------------------------------------------------------
-- HELPER TRIGGER: Standard updated_at timestamp refresher
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 1. ADMIN USERS TABLE (Executive Bullion Trustees & Compliance Officers)
-- ------------------------------------------------------------------------------
CREATE TABLE admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(191) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL, -- bcrypt for 'VBSP_Admin_2026!'
  security_pin VARCHAR(10) NOT NULL DEFAULT '990011',
  full_name VARCHAR(150) NOT NULL,
  role admin_role_type NOT NULL DEFAULT 'SUPER_ADMIN',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_timestamp_admin_users
BEFORE UPDATE ON admin_users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- ------------------------------------------------------------------------------
-- 2. VBSP BULLION FUNDS TABLE (G-Gold, S-Silver, P-Platinum, T-Treasury, M-Numismatic & Lifecycle Portfolios)
-- ------------------------------------------------------------------------------
CREATE TABLE fund_prices (
  id SERIAL PRIMARY KEY,
  fund_code VARCHAR(20) NOT NULL UNIQUE, -- 'G', 'S', 'P', 'T', 'M', 'L-Preserve', 'L-Balanced', 'L-Growth'
  fund_name VARCHAR(150) NOT NULL,
  category fund_category_type NOT NULL,
  metal_purity VARCHAR(100) NOT NULL, -- e.g. '.9999 LBMA Physical Gold'
  vault_location VARCHAR(150) NOT NULL, -- e.g. 'Zurich / London / New York Federal Depository'
  benchmark VARCHAR(150) NOT NULL,
  current_share_price DECIMAL(10,4) NOT NULL,
  one_month_return DECIMAL(6,2) NOT NULL DEFAULT 0.00,
  ytd_return DECIMAL(6,2) NOT NULL DEFAULT 0.00,
  one_year_return DECIMAL(6,2) NOT NULL DEFAULT 0.00,
  three_year_return DECIMAL(6,2) NOT NULL DEFAULT 0.00,
  five_year_return DECIMAL(6,2) NOT NULL DEFAULT 0.00,
  ten_year_return DECIMAL(6,2) NOT NULL DEFAULT 0.00,
  expense_ratio VARCHAR(20) NOT NULL DEFAULT '0.048%',
  risk_level VARCHAR(50) NOT NULL DEFAULT 'Moderate',
  inception_year INTEGER NOT NULL DEFAULT 1987,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_timestamp_fund_prices
BEFORE UPDATE ON fund_prices
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- ------------------------------------------------------------------------------
-- 3. PARTICIPANT ACCOUNTS TABLE (Standard, Sovereign Custody IRA, Corporate Reserve)
-- ------------------------------------------------------------------------------
CREATE TABLE participant_accounts (
  id SERIAL PRIMARY KEY,
  account_number VARCHAR(50) NOT NULL UNIQUE, -- e.g. VBSP-0089-4412-98
  email VARCHAR(191) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL, -- bcrypt for 'VertexBullion2026!'
  thriftline_pin VARCHAR(10) NOT NULL DEFAULT '829415',
  full_name VARCHAR(150) NOT NULL,
  account_type account_type_enum NOT NULL DEFAULT 'VBSP Standard Account (Taxable Reserve)',
  ssn_last4 CHAR(4) NOT NULL DEFAULT '4412',
  date_of_birth DATE NOT NULL DEFAULT '1984-06-15',
  service_type service_type_enum NOT NULL DEFAULT 'STANDARD_INDIVIDUAL',
  employing_agency VARCHAR(150) NOT NULL DEFAULT 'Vertex Sovereign Asset Custody & Treasury',
  total_balance DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  traditional_balance DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  roth_balance DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  gold_ounces_equivalent DECIMAL(10,4) NOT NULL DEFAULT 0.0000,
  silver_ounces_equivalent DECIMAL(10,4) NOT NULL DEFAULT 0.0000,
  vault_facility VARCHAR(150) NOT NULL DEFAULT 'Zurich FreePort / Delaware Depository Segregated Vault',
  vesting_years INTEGER NOT NULL DEFAULT 12,
  is_mfa_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  account_status account_status_enum NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_timestamp_participant_accounts
BEFORE UPDATE ON participant_accounts
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- ------------------------------------------------------------------------------
-- 4. PARTICIPANT ALLOCATIONS TABLE (Holdings per Fund & Physical Bullion Ounces)
-- ------------------------------------------------------------------------------
CREATE TABLE participant_allocations (
  id SERIAL PRIMARY KEY,
  participant_id INTEGER NOT NULL REFERENCES participant_accounts(id) ON DELETE CASCADE,
  fund_code VARCHAR(20) NOT NULL,
  allocation_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00, -- Future savings allocation %
  shares_owned DECIMAL(12,4) NOT NULL DEFAULT 0.0000,
  metal_ounces DECIMAL(12,4) NOT NULL DEFAULT 0.0000,
  balance_amount DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  segregated_bar_serial VARCHAR(100) NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_timestamp_participant_allocations
BEFORE UPDATE ON participant_allocations
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- ------------------------------------------------------------------------------
-- 5. PAYMENT GATEWAYS & CRYPTO WALLETS CONFIGURATION TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE payment_methods (
  id VARCHAR(50) PRIMARY KEY,
  category payment_category_enum NOT NULL,
  name VARCHAR(150) NOT NULL,
  symbol VARCHAR(20) NULL,
  network VARCHAR(100) NULL,
  wallet_address TEXT NULL,
  memo_tag VARCHAR(100) NULL,
  bank_name VARCHAR(150) NULL,
  account_holder VARCHAR(150) NULL,
  routing_number VARCHAR(50) NULL,
  account_number VARCHAR(50) NULL,
  swift_bic VARCHAR(50) NULL,
  handle VARCHAR(100) NULL,
  qr_image_url TEXT NULL,
  instructions TEXT NOT NULL,
  min_deposit DECIMAL(12,2) NOT NULL DEFAULT 5000.00,
  max_deposit DECIMAL(12,2) NOT NULL DEFAULT 300000.00,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_timestamp_payment_methods
BEFORE UPDATE ON payment_methods
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- ------------------------------------------------------------------------------
-- 6. PARTICIPANT DEPOSITS & VAULT TRANSFERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE participant_deposits (
  id SERIAL PRIMARY KEY,
  reference_id VARCHAR(50) NOT NULL UNIQUE,
  participant_id INTEGER NOT NULL REFERENCES participant_accounts(id) ON DELETE CASCADE,
  target_fund_code VARCHAR(20) NOT NULL,
  payment_method_id VARCHAR(50) NOT NULL,
  deposit_amount DECIMAL(14,2) NOT NULL,
  estimated_shares DECIMAL(12,4) NOT NULL DEFAULT 0.0000,
  transaction_hash_or_ref VARCHAR(200) NOT NULL,
  proof_file_name VARCHAR(255) NULL,
  status deposit_status_enum NOT NULL DEFAULT 'SUBMITTED',
  admin_notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_timestamp_participant_deposits
BEFORE UPDATE ON participant_deposits
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- ------------------------------------------------------------------------------
-- 7. PARTICIPANT LOANS TABLE (Bullion-Collateralized Liquid Loans)
-- ------------------------------------------------------------------------------
CREATE TABLE participant_loans (
  id SERIAL PRIMARY KEY,
  participant_id INTEGER NOT NULL REFERENCES participant_accounts(id) ON DELETE CASCADE,
  loan_number VARCHAR(50) NOT NULL UNIQUE,
  loan_type loan_type_enum NOT NULL DEFAULT 'General Purpose Bullion Loan',
  original_amount DECIMAL(12,2) NOT NULL,
  outstanding_balance DECIMAL(12,2) NOT NULL,
  interest_rate DECIMAL(5,3) NOT NULL DEFAULT 4.250,
  monthly_payment DECIMAL(10,2) NOT NULL,
  remaining_payments INTEGER NOT NULL,
  collateral_asset VARCHAR(200) NOT NULL DEFAULT 'Segregated Gold Sovereign Bar #LBMA-CH-99410',
  maturity_date DATE NOT NULL,
  status loan_status_enum NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_timestamp_participant_loans
BEFORE UPDATE ON participant_loans
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- ------------------------------------------------------------------------------
-- 8. BENEFICIARIES TABLE (Physical Bullion Vault Title Transfer)
-- ------------------------------------------------------------------------------
CREATE TABLE beneficiaries (
  id SERIAL PRIMARY KEY,
  participant_id INTEGER NOT NULL REFERENCES participant_accounts(id) ON DELETE CASCADE,
  full_name VARCHAR(150) NOT NULL,
  relationship VARCHAR(100) NOT NULL,
  share_percentage DECIMAL(5,2) NOT NULL,
  beneficiary_type beneficiary_type_enum NOT NULL DEFAULT 'PRIMARY',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 9. STATUTORY CONTRIBUTION PARAMETERS TABLE (2026 Limits & Treasury Additions)
-- ------------------------------------------------------------------------------
CREATE TABLE statutory_parameters (
  id SERIAL PRIMARY KEY,
  tax_year INTEGER NOT NULL UNIQUE,
  elective_deferral_limit DECIMAL(10,2) NOT NULL DEFAULT 23500.00,
  catch_up_limit DECIMAL(10,2) NOT NULL DEFAULT 7500.00,
  secure2_catch_up_limit DECIMAL(10,2) NOT NULL DEFAULT 11250.00,
  annual_additions_limit DECIMAL(10,2) NOT NULL DEFAULT 70000.00,
  gold_reserve_ratio DECIMAL(5,2) NOT NULL DEFAULT 40.00,
  updated_by VARCHAR(100) NOT NULL DEFAULT 'VBSP Board Directive',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_timestamp_statutory_parameters
BEFORE UPDATE ON statutory_parameters
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- ------------------------------------------------------------------------------
-- 10. AUDIT LOGS TABLE (NIST SP 800-53 Compliant Vault Audit Trail)
-- ------------------------------------------------------------------------------
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  event_id VARCHAR(50) NOT NULL UNIQUE,
  actor VARCHAR(150) NOT NULL,
  action VARCHAR(100) NOT NULL,
  details TEXT NOT NULL,
  ip_address VARCHAR(100) NOT NULL,
  status audit_status_enum NOT NULL DEFAULT 'Success',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 11. FRAUD ALERTS TABLE (Automated Anomaly & Vault Security Detection)
-- ------------------------------------------------------------------------------
CREATE TABLE fraud_alerts (
  id SERIAL PRIMARY KEY,
  alert_code VARCHAR(50) NOT NULL UNIQUE,
  target_account VARCHAR(50) NOT NULL,
  alert_type VARCHAR(150) NOT NULL,
  severity fraud_severity_enum NOT NULL DEFAULT 'Medium',
  description TEXT NOT NULL,
  status fraud_status_enum NOT NULL DEFAULT 'Open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMPTZ NULL DEFAULT NULL
);

-- ------------------------------------------------------------------------------
-- 12. ANNOUNCEMENTS & MARKET BULLETINS TABLE (CMS News Feed)
-- ------------------------------------------------------------------------------
CREATE TABLE announcements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category announcement_category_enum NOT NULL DEFAULT 'General',
  summary TEXT NOT NULL,
  content TEXT NULL,
  is_urgent BOOLEAN NOT NULL DEFAULT FALSE,
  published_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 13. SITE BRANDING SETTINGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE site_branding (
  id SERIAL PRIMARY KEY,
  site_name VARCHAR(150) NOT NULL DEFAULT 'Vertex Bullion Savings Plan',
  tagline VARCHAR(255) NOT NULL DEFAULT 'Sovereign Specie & Vaulted Bullion Custody',
  short_acronym VARCHAR(20) NOT NULL DEFAULT 'VBSP',
  logo_url TEXT NULL,
  support_phone VARCHAR(50) NOT NULL DEFAULT '1-800-842-8771',
  support_email VARCHAR(100) NOT NULL DEFAULT 'treasury@vbsp.org',
  vault_headquarters VARCHAR(255) NOT NULL DEFAULT 'One Federal Specie Way, Suite 100, Zurich / New York',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_timestamp_site_branding
BEFORE UPDATE ON site_branding
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- ------------------------------------------------------------------------------
-- INDEXES FOR QUERY OPTIMIZATION (PostgreSQL / Neon)
-- ------------------------------------------------------------------------------
CREATE INDEX idx_participant_allocations_pid ON participant_allocations(participant_id);
CREATE INDEX idx_participant_loans_pid ON participant_loans(participant_id);
CREATE INDEX idx_beneficiaries_pid ON beneficiaries(participant_id);
CREATE INDEX idx_deposits_pid ON participant_deposits(participant_id);
CREATE INDEX idx_audit_logs_event_id ON audit_logs(event_id);
CREATE INDEX idx_fraud_alerts_target ON fraud_alerts(target_account);
CREATE INDEX idx_payment_methods_active ON payment_methods(is_active);


-- ==============================================================================
-- INITIAL SEED DATA (Pre-Configured VBSP Accounts, Funds, Limits, Gateways, Logs)
-- ==============================================================================

-- 1. Seed Admin Account (Password: VBSP_Admin_2026! / PIN: 990011)
INSERT INTO admin_users (username, email, password_hash, security_pin, full_name, role, is_active)
VALUES ('admin@vbsp.org', 'admin@vbsp.org', '$2y$12$e6xU7Ld1g1vYQ7K/qK7JDe0R5sBZb2zXF5pA5xG5sJ.6wXq2ZJzKO', '990011', 'Executive Administrator (VBSP Board)', 'SUPER_ADMIN', TRUE);

-- 2. Seed VBSP Bullion Funds (G, S, P, T, M and Lifecycle Portfolios)
INSERT INTO fund_prices (fund_code, fund_name, category, metal_purity, vault_location, benchmark, current_share_price, one_month_return, ytd_return, one_year_return, three_year_return, five_year_return, ten_year_return, expense_ratio, risk_level, inception_year) VALUES
('G', 'G-Fund: Physical Gold Sovereign Reserve', 'Core Bullion Fund', '.9999 Fine LBMA Good Delivery Gold', 'Zurich FreePort / Delaware Depository Segregated Vault', 'LBMA Gold Price PM (USD/oz)', 68.4500, 1.42, 14.85, 21.40, 12.10, 14.25, 9.80, '0.038%', 'Low (Physical Capital Preservation)', 1987),
('S', 'S-Fund: Physical Silver Industrial & Monetary Reserve', 'Core Bullion Fund', '.999 Fine Physical Silver Bullion Bars & Coins', 'London Bullion Market Vaults / Salt Lake Depository', 'LBMA Silver Price (USD/oz)', 34.2000, 2.15, 18.60, 28.50, 15.30, 11.90, 8.40, '0.045%', 'Moderate to High (Monetary & Industrial Demand)', 2001),
('P', 'P-Fund: Physical Platinum & Palladium Green Reserve', 'Core Bullion Fund', '.9995 Pure Physical Platinum & Catalytic Metals', 'Geneva FreePort Segregated Vaults', 'LPPM Platinum Spot Index', 28.9000, 0.85, 9.40, 14.20, 7.80, 8.10, 6.50, '0.048%', 'High (Industrial & Strategic Green Tech)', 2005),
('T', 'T-Fund: Treasury Bullion Liquidity Yield Fund', 'Core Bullion Fund', 'Short-Term Sovereign T-Bills + Overnight Bullion Collateral', 'Federal Reserve Depository & Overnight Yield Desk', 'U.S. Treasury 3-Month Bill Index', 19.4200, 0.38, 4.45, 4.52, 4.12, 3.25, 2.65, '0.032%', 'Very Low (Guaranteed Principal & Liquid Yield)', 1987),
('M', 'M-Fund: Strategic Rare & Numismatic Specie Fund', 'Core Bullion Fund', 'Certified MS-70 Historical Sovereign & Pre-1933 Gold Coins', 'High-Security Manhattan Reserve Depository', 'PCGS & NGC Rare Coin Benchmark 3000', 84.1000, 1.95, 16.30, 22.80, 18.50, 16.20, 14.10, '0.055%', 'High (Rarity & Scarcity Alpha)', 2010),
('L-Preserve', 'L-Preserve: Sovereign Wealth Capital Protection', 'Lifecycle Portfolio', '60% Gold (G), 20% Treasury (T), 15% Silver (S), 5% Platinum (P)', 'Global Multi-Jurisdictional Allocated Vaults', 'VBSP Conservative Bullion Benchmark Index', 48.9500, 0.95, 11.80, 15.40, 9.80, 10.45, 8.90, '0.039%', 'Conservative (Capital Preservation)', 2005),
('L-Balanced', 'L-Balanced: Growth & Precious Specie Accumulator', 'Lifecycle Portfolio', '40% Gold (G), 30% Silver (S), 15% Numismatics (M), 15% Treasury (T)', 'Global Multi-Jurisdictional Allocated Vaults', 'VBSP Balanced Bullion Growth Benchmark', 58.2000, 1.45, 16.20, 22.10, 13.90, 13.25, 11.40, '0.042%', 'Moderate Growth (Balanced Metal Accumulation)', 2005),
('L-Growth', 'L-Growth: Maximum Precious Metal Expansion', 'Lifecycle Portfolio', '35% Silver (S), 30% Gold (G), 20% Numismatic (M), 15% Platinum (P)', 'Global Multi-Jurisdictional Allocated Vaults', 'VBSP Maximum Metal Expansion Index', 71.4000, 1.85, 20.40, 27.80, 16.60, 15.50, 13.20, '0.046%', 'Maximum Growth (High Appreciation Focus)', 2020);

-- 3. Seed Participant Account (Marcus Vance, VBSP Standard Account)
INSERT INTO participant_accounts (account_number, email, password_hash, thriftline_pin, full_name, account_type, ssn_last4, date_of_birth, service_type, employing_agency, total_balance, traditional_balance, roth_balance, gold_ounces_equivalent, silver_ounces_equivalent, vault_facility, vesting_years, is_mfa_enabled, account_status)
VALUES ('VBSP-0089-4412-98', 'marcus.vance@usda.gov', '$2y$12$e6xU7Ld1g1vYQ7K/qK7JDe0R5sBZb2zXF5pA5xG5sJ.6wXq2ZJzKO', '829415', 'Marcus Vance', 'VBSP Standard Account (Taxable Reserve)', '4412', '1984-06-15', 'STANDARD_INDIVIDUAL', 'Vertex Sovereign Asset Custody & Treasury', 342850.12, 246852.09, 95998.03, 128.4520, 842.1500, 'Zurich FreePort / Delaware Depository Segregated Vault', 12, TRUE, 'ACTIVE');

-- 4. Seed Participant Allocations (G-Fund Gold, S-Fund Silver, T-Fund Treasury)
INSERT INTO participant_allocations (participant_id, fund_code, allocation_percentage, shares_owned, metal_ounces, balance_amount, segregated_bar_serial) VALUES
(1, 'G', 50.00, 2504.3836, 64.2260, 171425.06, 'LBMA-CH-99410A / LBMA-CH-99410B'),
(1, 'S', 30.00, 3007.4571, 505.2900, 102855.04, 'AG-999-US-441829'),
(1, 'T', 20.00, 3530.8970, 0.0000, 68570.02, NULL);

-- 5. Seed Payment Gateways & Crypto Depository Wallets
INSERT INTO payment_methods (id, category, name, symbol, network, wallet_address, memo_tag, bank_name, account_holder, routing_number, account_number, swift_bic, handle, instructions, min_deposit, max_deposit, is_active) VALUES
('pm-btc', 'crypto', 'Bitcoin Vault Custody', 'BTC', 'Bitcoin Mainnet (SegWit/Native)', 'bc1q9vbsp88z9yvx72k40pqr3m7ltn42vcsz80x69w', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Send exact BTC amount to the segregated vault depository address. Confirmations require 3 blocks.', 5000.00, 300000.00, TRUE),
('pm-usdt-trc20', 'crypto', 'Tether USD (TRC-20)', 'USDT', 'Tron Network (TRC-20)', 'TX9VbSpVaultCustodyTRC20OfficialAlloc78kQ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Instant settlement via Tron network. Always ensure you select TRC-20 standard before sending.', 5000.00, 300000.00, TRUE),
('pm-eth', 'crypto', 'Ethereum Specie Reserve', 'ETH', 'Ethereum Mainnet (ERC-20)', '0x8841F9027B9B42A6836B29Cc9C57917C5840eA77', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Direct depository for Ethereum and ERC-20 based sovereign settlement.', 5000.00, 300000.00, TRUE),
('pm-usdc-sol', 'crypto', 'USD Coin (Solana)', 'USDC', 'Solana Network (SPL)', 'VbSpSoLVauLtSPL998842100USDCAllocDepository', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Sub-second confirmation time via Solana SPL USDC token rail.', 5000.00, 300000.00, TRUE),
('pm-fedwire', 'wire', 'Federal Depository Fedwire', 'USD', 'Fedwire / Clearing House Interbank (CHIPS)', NULL, NULL, 'Federal Reserve Depository Bank of New York / Custody Trust', 'Vertex Sovereign Bullion Savings Trust, LLC', '021000021', '8841092841920', 'FRNYUS33XXX', NULL, 'Initiate domestic or international Fedwire with your assigned participant account number in reference line 72.', 5000.00, 300000.00, TRUE),
('pm-zelle', 'p2p', 'Zelle Institutional Settlement', 'USD', 'Early Warning Services / Instant Zelle', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'settlement@vbsp.org', 'Send instantaneous funds via Zelle banking partner with memo including your VBSP Account Number.', 5000.00, 300000.00, TRUE),
('pm-cashapp', 'p2p', 'CashApp Business Pay', 'USD', 'Block Inc. Cash Rail', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '$VBSPCustodyTreasury', 'Direct peer payment for accredited participants. Enter VBSP ID in notes.', 5000.00, 300000.00, TRUE);

-- 6. Seed Active Bullion-Collateralized Loan
INSERT INTO participant_loans (participant_id, loan_number, loan_type, original_amount, outstanding_balance, interest_rate, monthly_payment, remaining_payments, collateral_asset, maturity_date, status)
VALUES (1, 'LN-2024-88412', 'General Purpose Bullion Loan', 15000.00, 8240.50, 4.250, 170.11, 48, 'Segregated Gold Sovereign Bar #LBMA-CH-99410', '2028-03-01', 'ACTIVE');

-- 7. Seed Beneficiaries (Physical Title Transfer)
INSERT INTO beneficiaries (participant_id, full_name, relationship, share_percentage, beneficiary_type) VALUES
(1, 'Elena Vance', 'Spouse', 80.00, 'PRIMARY'),
(1, 'Oliver Vance', 'Child', 20.00, 'PRIMARY'),
(1, 'Sarah Vance Miller', 'Sister', 100.00, 'CONTINGENT');

-- 8. Seed 2026 Bullion Savings Parameters
INSERT INTO statutory_parameters (tax_year, elective_deferral_limit, catch_up_limit, secure2_catch_up_limit, annual_additions_limit, gold_reserve_ratio, updated_by)
VALUES (2026, 23500.00, 7500.00, 11250.00, 70000.00, 40.00, 'VBSP Executive Custody Directive 2026-01');

-- 9. Seed NIST SP 800-53 Compliant Audit Logs
INSERT INTO audit_logs (event_id, actor, action, details, ip_address, status) VALUES
('LOG-8801', 'admin_security_lead (Sarah Jenkins)', 'MFA_POLICY_ENFORCE', 'Enforced FIDO2 WebAuthn & Authenticator MFA requirement for all agency support staff.', '149.101.100.22', 'Success'),
('LOG-8800', 'cms_content_editor (David Cho)', 'NEWS_PUBLISH', 'Published news release: 2026 Contribution Limit Reminders & SECURE 2.0 Provisions.', '149.101.100.45', 'Success'),
('LOG-8799', 'compliance_officer (Elena Rossi)', 'SECTION_508_AUDIT_PASS', 'Executed WCAG 2.1 Level AA automated compliance scan across all 24 public pages. Zero critical violations.', '149.101.100.19', 'Success'),
('LOG-8798', 'system_fraud_monitor', 'SUSPICIOUS_TRANSFER_FLAGGED', 'Flagged transaction for participant #VBSP-0041-9923-11: $48,000 withdrawal request after recent credential reset from untrusted overseas IP.', '198.51.100.72', 'Flagged');

-- 10. Seed Fraud & Vault Security Alerts
INSERT INTO fraud_alerts (alert_code, target_account, alert_type, severity, description, status) VALUES
('FRAUD-01', 'VBSP-0041-9923-11', 'Large Out-of-Pattern Transfer', 'High', 'Withdrawal request of $48,000 initiated within 4 hours of phone number and email change from foreign ASN.', 'Open'),
('FRAUD-02', 'VBSP-4410-1892', 'Rapid Password & PIN Change', 'Medium', '3 failed ThriftLine PIN attempts followed by immediate online password reset from unknown TOR exit node.', 'Open');

-- 11. Seed Announcements & Market Reports
INSERT INTO announcements (title, category, summary, is_urgent, published_date) VALUES
('2026 Annual Vault Audit Confirms 100% Segregated Specie Allocation', 'Vault Audit', 'Independent assayers Bureau Veritas and ALS Global have completed physical barcode audits across Zurich, London, and NY vaults. All participant metal verified 1:1.', FALSE, '2026-08-10'),
('2026 Elective Deferral and Catch-Up Contribution Limits Announced', 'General', 'The IRS and VBSP Custody Board announced the 2026 elective deferral limit of $23,500, with $7,500 standard catch-up and $11,250 higher catch-up for ages 60-63.', FALSE, '2026-01-05'),
('Scheduled System Maintenance: Monthly Processing Window', 'Maintenance', 'Online account access will experience brief maintenance on Sunday, September 6 between 1:00 AM - 6:00 AM ET.', FALSE, '2026-08-20');

-- 12. Seed Site Default Branding
INSERT INTO site_branding (site_name, tagline, short_acronym, logo_url, support_phone, support_email, vault_headquarters) VALUES
('Vertex Bullion Savings Plan', 'Sovereign Specie & Vaulted Bullion Custody', 'VBSP', NULL, '1-800-842-8771', 'treasury@vbsp.org', 'One Federal Specie Way, Suite 100, Zurich / New York');
