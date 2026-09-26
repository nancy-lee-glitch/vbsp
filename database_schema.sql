-- ==============================================================================
-- CASSIVON CAPITAL SAVINGS PLAN (CCSP) - OFFICIAL NEON POSTGRESQL SCHEMA
-- ==============================================================================
-- 
-- HOW TO RUN THIS IN NEON:
-- 1. Log in to your Neon Dashboard: https://console.neon.tech
-- 2. Select your project (neondb).
-- 3. Click "SQL Editor" in the left sidebar.
-- 4. Paste the SQL code below into the editor.
-- 5. Click the green "Run" button to execute and initialize tables.
-- ==============================================================================

-- Enable Crypto extensions for UUIDs and secure password hashing if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. PARTICIPANT ACCOUNTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS participant_accounts (
  id SERIAL PRIMARY KEY,
  account_number VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  thriftline_pin VARCHAR(20) NOT NULL DEFAULT '829415',
  full_name VARCHAR(255) NOT NULL,
  account_type VARCHAR(100) NOT NULL DEFAULT 'VBSP Standard Account (Taxable Reserve)',
  ssn_last4 VARCHAR(10) DEFAULT '4412',
  employing_agency VARCHAR(255) DEFAULT 'Department of Defense (DoD)',
  hire_date DATE DEFAULT '2020-03-15',
  vault_facility VARCHAR(255) DEFAULT 'Zurich FreePort / Delaware Depository Segregated Vault',
  total_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  traditional_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  roth_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  gold_ounces_equivalent NUMERIC(12, 4) NOT NULL DEFAULT 0.0000,
  silver_ounces_equivalent NUMERIC(12, 4) NOT NULL DEFAULT 0.0000,
  ytd_return NUMERIC(6, 2) NOT NULL DEFAULT 18.40,
  phone VARCHAR(50) DEFAULT '(202) 555-0149',
  address TEXT DEFAULT '400 7th St SW, Washington, DC 20024',
  kyc_status VARCHAR(50) DEFAULT 'Verified (Tier 1 Allocated)',
  account_status VARCHAR(50) DEFAULT 'ACTIVE',
  last_login TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. FUND PRICES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fund_prices (
  id SERIAL PRIMARY KEY,
  fund_code VARCHAR(30) UNIQUE NOT NULL,
  code VARCHAR(30),
  fund_name VARCHAR(255) NOT NULL,
  fund_category VARCHAR(100) NOT NULL,
  current_share_price NUMERIC(12, 4) NOT NULL,
  ytd_return NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
  metal_purity VARCHAR(100),
  vault_location VARCHAR(255),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. SITE BRANDING SETTINGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS site_branding (
  id SERIAL PRIMARY KEY,
  site_name VARCHAR(255) NOT NULL DEFAULT 'Cassivon Capital Savings Plan',
  site_subtitle VARCHAR(255) DEFAULT 'Institutional Sovereign Custody',
  slogan VARCHAR(255) DEFAULT 'Institutional Sovereign Custody',
  site_domain VARCHAR(100) DEFAULT 'CCSP.ORG',
  logo_url TEXT DEFAULT '',
  seal_text TEXT DEFAULT 'Official Vault Custody & Bullion Savings Reserve • LBMA Good Delivery Certified',
  support_phone VARCHAR(100) DEFAULT '1-800-842-8771',
  support_email VARCHAR(255) DEFAULT 'treasury@cassivon.com',
  footer_text TEXT DEFAULT 'Cassivon Capital Savings Plan (CCSP) is an institutional allocated vault custodian.',
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. PAYMENT METHODS CONFIGURATION TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payment_methods (
  id VARCHAR(100) PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  symbol VARCHAR(20),
  network VARCHAR(100),
  wallet_address TEXT,
  memo_tag VARCHAR(100),
  bank_name VARCHAR(255),
  account_holder VARCHAR(255),
  routing_number VARCHAR(100),
  account_number VARCHAR(100),
  swift_bic VARCHAR(100),
  handle VARCHAR(100),
  qr_image_url TEXT,
  instructions TEXT,
  min_deposit NUMERIC(15, 2) DEFAULT 5000.00,
  max_deposit NUMERIC(15, 2) DEFAULT 500000.00,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. DEPOSITS & PAYMENT PROOFS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS deposits (
  id SERIAL PRIMARY KEY,
  reference_id VARCHAR(100) UNIQUE NOT NULL,
  tx_id VARCHAR(100),
  participant_id INTEGER NOT NULL REFERENCES participant_accounts(id) ON DELETE CASCADE,
  user_account_number VARCHAR(100) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  target_fund_code VARCHAR(30) NOT NULL DEFAULT 'G',
  fund_code VARCHAR(30) DEFAULT 'G',
  payment_method_id VARCHAR(100),
  payment_method_name VARCHAR(255),
  amount NUMERIC(15, 2) NOT NULL,
  estimated_shares NUMERIC(12, 4) DEFAULT 0.0000,
  transaction_hash TEXT,
  payment_reference TEXT,
  sender_identifier TEXT,
  proof_file_name VARCHAR(255),
  proof_file_data TEXT,
  receipt_image_url TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'Pending Review',
  admin_notes TEXT,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. WITHDRAWAL REQUESTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id SERIAL PRIMARY KEY,
  request_number VARCHAR(100) UNIQUE NOT NULL,
  request_id VARCHAR(100),
  participant_id INTEGER NOT NULL REFERENCES participant_accounts(id) ON DELETE CASCADE,
  user_account_number VARCHAR(100) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  withdrawal_type VARCHAR(100) NOT NULL DEFAULT 'In-Service Bullion Distribution',
  amount NUMERIC(15, 2) NOT NULL,
  delivery_option VARCHAR(100) DEFAULT 'Insured Armored Courier Delivery',
  destination_address TEXT,
  bank_details TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'Pending Review',
  reason TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. LOAN APPLICATIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS loan_applications (
  id SERIAL PRIMARY KEY,
  loan_number VARCHAR(100) UNIQUE NOT NULL,
  loan_id VARCHAR(100),
  participant_id INTEGER NOT NULL REFERENCES participant_accounts(id) ON DELETE CASCADE,
  user_account_number VARCHAR(100) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  loan_type VARCHAR(100) NOT NULL DEFAULT 'General Purpose Bullion Loan',
  requested_amount NUMERIC(15, 2) NOT NULL,
  amount NUMERIC(15, 2),
  term_months INTEGER NOT NULL DEFAULT 36,
  interest_rate NUMERIC(5, 2) NOT NULL DEFAULT 4.25,
  monthly_payment NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  collateral_asset VARCHAR(255) DEFAULT 'Segregated LBMA Gold Sovereign Bar',
  status VARCHAR(50) NOT NULL DEFAULT 'Pending Review',
  purpose TEXT,
  reason TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. USER DOCUMENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_documents (
  id SERIAL PRIMARY KEY,
  doc_id VARCHAR(100) UNIQUE,
  participant_id INTEGER NOT NULL REFERENCES participant_accounts(id) ON DELETE CASCADE,
  user_account_number VARCHAR(100) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  document_title VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  document_type VARCHAR(100) DEFAULT 'Identification',
  category VARCHAR(100) DEFAULT 'identification',
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT,
  file_data TEXT,
  file_size VARCHAR(50) DEFAULT '1.2 MB',
  status VARCHAR(50) NOT NULL DEFAULT 'Verified',
  is_official BOOLEAN DEFAULT FALSE,
  uploaded_by VARCHAR(50) DEFAULT 'participant',
  compliance_notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 9. MESSAGES & NOTIFICATIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  participant_id INTEGER NOT NULL REFERENCES participant_accounts(id) ON DELETE CASCADE,
  recipient_user_id VARCHAR(100),
  sender_type VARCHAR(50) NOT NULL DEFAULT 'admin',
  sender_name VARCHAR(255) NOT NULL DEFAULT 'VBSP Depository Administration',
  sender_email VARCHAR(255) DEFAULT 'custody@vbsp.org',
  recipient_email VARCHAR(255),
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  category VARCHAR(100) DEFAULT 'official',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  is_starred BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 10. TRANSACTIONS AUDIT LEDGER TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  tx_code VARCHAR(100) UNIQUE NOT NULL,
  participant_id INTEGER NOT NULL REFERENCES participant_accounts(id) ON DELETE CASCADE,
  account_number VARCHAR(100) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Completed',
  category VARCHAR(50) DEFAULT 'General',
  fund_code VARCHAR(30),
  metal_equivalent VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 11. ADMIN USERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL DEFAULT 'SUPER_ADMIN',
  pin VARCHAR(20) NOT NULL DEFAULT '884411',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 12. ROW LEVEL SECURITY (RLS) FOR POSTGRESQL
-- ------------------------------------------------------------------------------
-- Enables RLS on all tables with open policies for seamless web application access
ALTER TABLE participant_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE fund_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Allow public access policies for each table
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Allow public access" ON %I;', t);
    EXECUTE format('CREATE POLICY "Allow public access" ON %I FOR ALL USING (true) WITH CHECK (true);', t);
  END LOOP;
END
$$;

-- ------------------------------------------------------------------------------
-- 13. SEED INITIAL DATA
-- ------------------------------------------------------------------------------

-- Seed Fund Prices
INSERT INTO fund_prices (fund_code, code, fund_name, fund_category, current_share_price, ytd_return, metal_purity, vault_location) VALUES
('G', 'G', 'G-Fund: Physical Gold Sovereign Reserve', 'Core Bullion Fund', 68.4500, 24.80, '99.99% LBMA Fine Gold Bar', 'Zurich FreePort / Delaware Depository'),
('S', 'S', 'S-Fund: Physical Silver Industrial & Monetary Reserve', 'Core Bullion Fund', 34.2000, 31.40, '99.9% Pure Silver Ingot', 'Zurich FreePort Segregated'),
('P', 'P', 'P-Fund: Physical Platinum & Palladium Green Reserve', 'Core Bullion Fund', 28.9000, 14.10, '99.95% Sponge & Bar Ingot', 'London Bullion Vaults'),
('T', 'T', 'T-Fund: Treasury Bullion Liquidity Yield Fund', 'Core Bullion Fund', 19.4200, 8.20, 'Sovereign Bullion Short Notes', 'New York Federal Depository'),
('M', 'M', 'M-Fund: Strategic Rare & Numismatic Specie Fund', 'Core Bullion Fund', 84.1000, 38.60, 'Pre-1933 Sovereign Coins & Specie', 'Delaware Depository High Security'),
('L-Preserve', 'L-Preserve', 'L-Preserve: Sovereign Wealth Capital Protection', 'Lifecycle Portfolio', 48.9500, 16.50, '80% Gold / 20% Treasury Liquidity', 'Zurich / Delaware Depository'),
('L-Balanced', 'L-Balanced', 'L-Balanced: Growth & Precious Specie Accumulator', 'Lifecycle Portfolio', 58.2000, 22.40, '60% Gold / 30% Silver / 10% Platinum', 'Multi-Vault Sovereign Custody'),
('L-Growth', 'L-Growth', 'L-Growth: Maximum Precious Metal Expansion', 'Lifecycle Portfolio', 71.4000, 29.80, '50% Silver / 30% Gold / 20% Strategic', 'Zurich FreePort Global')
ON CONFLICT (fund_code) DO UPDATE SET
  current_share_price = EXCLUDED.current_share_price,
  ytd_return = EXCLUDED.ytd_return;

-- Seed Site Branding (Row 1)
INSERT INTO site_branding (id, site_name, site_subtitle, slogan, site_domain, seal_text, support_phone, support_email)
VALUES (1, 'Cassivon Capital Savings Plan', 'Institutional Sovereign Custody', 'Institutional Sovereign Custody', 'CCSP.ORG', 'Official Vault Custody & Bullion Savings Reserve • LBMA Good Delivery Certified', '1-800-842-8771', 'treasury@cassivon.com')
ON CONFLICT (id) DO UPDATE SET
  site_name = EXCLUDED.site_name,
  site_subtitle = EXCLUDED.site_subtitle;

-- Seed Admin User
INSERT INTO admin_users (email, password_hash, full_name, role, pin)
VALUES ('admin@cassivon.com', '$2b$10$w8T0Mh8e6L0qHk7p5u4tIe2x9j6v4z3b8k1l0m7n5p3q9r8s7t6u', 'Chief Custody Officer', 'SUPER_ADMIN', '884411')
ON CONFLICT (email) DO NOTHING;

-- Seed Demo Participant Accounts
INSERT INTO participant_accounts (
  account_number, email, password_hash, thriftline_pin, full_name, account_type,
  total_balance, traditional_balance, roth_balance, gold_ounces_equivalent, silver_ounces_equivalent,
  ytd_return, employing_agency, vault_facility, phone, address, kyc_status
) VALUES 
(
  'CCSP-0089-4412-98', 'marcus.vance@defense.gov', 'CassivonCapital2026!', '829415',
  'Major Marcus Vance (Ret.)', 'CCSP Sovereign Custody (Self-Directed / IRA)',
  342850.12, 248600.00, 94250.12, 120.4500, 3450.0000,
  18.40, 'Department of Defense (DoD)', 'Zurich FreePort / Delaware Depository Segregated Vault',
  '(202) 555-0149', '400 7th St SW, Washington, DC 20024', 'Verified (Tier 1 Allocated)'
),
(
  'CCSP-0041-8821-14', 'e.vasquez@treasury.gov', 'CassivonCapital2026!', '554411',
  'Elena Vasquez', 'CCSP Standard Account (Taxable Reserve)',
  189420.50, 140000.00, 49420.50, 65.2000, 1850.0000,
  21.60, 'Department of the Treasury', 'Delaware Depository High-Security Vault',
  '(202) 555-0182', '1500 Pennsylvania Ave NW, Washington, DC 20220', 'Verified (Tier 1 Allocated)'
)
ON CONFLICT (email) DO NOTHING;

-- Seed Payment Methods
INSERT INTO payment_methods (id, category, name, symbol, network, wallet_address, instructions, is_active) VALUES
('btc', 'crypto', 'Bitcoin (BTC)', 'BTC', 'Bitcoin Mainnet', 'bc1q9vzp0k2a9h8m849l4y4w04859x03k279w2s84d', 'Send exact BTC amount to the segregated custodian address.', TRUE),
('usdt-trc20', 'crypto', 'Tether USD (TRC-20)', 'USDT', 'Tron (TRC-20)', 'TQ3j8h9k1m5n7p2r4s6t8v0w2x4y6z8a1b', 'Verify Tron network TRC-20 before confirming withdrawal.', TRUE),
('wire-domestic', 'bank', 'Federal Reserve Wire Transfer', NULL, 'Fedwire', NULL, 'Wire directly to CCSP Depository Trust with your Account Number in memo.', TRUE)
ON CONFLICT (id) DO NOTHING;
