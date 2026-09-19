/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

// Read Supabase environment variables from Vite or window or process
const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {};
const procEnv = (typeof process !== 'undefined' && process.env) ? process.env : {};

const supabaseUrl = 
  metaEnv.VITE_SUPABASE_URL || 
  procEnv.VITE_SUPABASE_URL ||
  procEnv.SUPABASE_URL ||
  '';

const supabaseAnonKey = 
  metaEnv.VITE_SUPABASE_ANON_KEY || 
  procEnv.VITE_SUPABASE_ANON_KEY ||
  procEnv.SUPABASE_ANON_KEY ||
  '';

// Check if credentials are valid URL and key
export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl.startsWith('http') && 
    supabaseAnonKey.length > 10
  );
};

// Create the Supabase client
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : createClient(
      'https://placeholder-project.supabase.co', 
      'placeholder-anon-key-that-is-safe-for-local-fallback-vbsp',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

/**
 * Universal integer sanitizer to prevent PostgreSQL:
 * "Invalid input syntax for type integer: 'NaN'"
 */
export function sanitizeInteger(value: any, fallback = 1): number {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'number') {
    if (isNaN(value) || !isFinite(value)) return fallback;
    return Math.floor(value);
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    const directParse = parseInt(trimmed, 10);
    if (!isNaN(directParse)) return directParse;

    // Try extracting numeric characters e.g. "usr_01" -> 1, "usr_99" -> 99
    const digitsOnly = trimmed.replace(/\D/g, '');
    if (digitsOnly.length > 0) {
      const extracted = parseInt(digitsOnly, 10);
      if (!isNaN(extracted) && extracted > 0) return extracted;
    }
  }
  return fallback;
}

/**
 * Universal numeric float sanitizer to prevent NaN or undefined in database queries
 */
export function sanitizeNumeric(value: any, fallback = 0.0): number {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'number') {
    if (isNaN(value) || !isFinite(value)) return fallback;
    return Number(value.toFixed(2));
  }
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(cleaned);
    if (!isNaN(parsed) && isFinite(parsed)) {
      return Number(parsed.toFixed(2));
    }
  }
  return fallback;
}

/**
 * SQL Schema migration statement for user convenience or Supabase SQL Editor
 */
export const SUPABASE_DATABASE_SCHEMA_SQL = `
-- =============================================================================
-- VERTEX BULLION SAVINGS PLAN (VBSP) - SUPABASE POSTGRESQL SCHEMA
-- =============================================================================

-- 1. Admin Users
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'SUPER_ADMIN',
  security_pin TEXT DEFAULT '990011',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Participant Accounts
CREATE TABLE IF NOT EXISTS participant_accounts (
  id SERIAL PRIMARY KEY,
  account_number TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  thriftline_pin TEXT DEFAULT '829415',
  full_name TEXT NOT NULL,
  employing_agency TEXT,
  plan_type TEXT DEFAULT 'VBSP Sovereign Custody (Self-Directed / IRA)',
  hire_date TEXT,
  total_balance NUMERIC(18,2) DEFAULT 0.00,
  traditional_balance NUMERIC(18,2) DEFAULT 0.00,
  roth_balance NUMERIC(18,2) DEFAULT 0.00,
  ytd_return NUMERIC(8,2) DEFAULT 22.80,
  vault_depository_location TEXT DEFAULT 'Zurich Segregated Vault (Malca-Amit Depository CH-09)',
  gold_ounces_equivalent NUMERIC(18,4) DEFAULT 0.00,
  silver_ounces_equivalent NUMERIC(18,4) DEFAULT 0.00,
  phone TEXT,
  address TEXT,
  account_status TEXT DEFAULT 'Active / Verified',
  kyc_status TEXT DEFAULT 'Not Verified',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Site Branding
CREATE TABLE IF NOT EXISTS site_branding (
  id SERIAL PRIMARY KEY,
  site_name TEXT DEFAULT 'Vertex Bullion Savings Plan',
  site_subtitle TEXT DEFAULT 'Institutional Sovereign Custody & Allocated Bullion Reserve',
  agency_name TEXT DEFAULT 'VBSP Federal Bullion Depository System',
  slogan TEXT DEFAULT 'Preserving Generational Wealth in Tangible Sovereign Metals',
  announcement_banner TEXT DEFAULT '',
  support_phone TEXT DEFAULT '+1 (202) 555-0194',
  support_email TEXT DEFAULT 'depository@vbsp.org',
  footer_disclaimer TEXT DEFAULT 'The Vertex Bullion Savings Plan (VBSP) is an institutional allocated physical metal custody trust. All bullion holdings are 100% physically allocated, insured by Lloyd''s of London, and audited quarterly by independent LBMA assayers.',
  logo_url TEXT,
  seal_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Deposits / Payment Proofs (Critical: Integer participant_id)
CREATE TABLE IF NOT EXISTS deposits (
  id SERIAL PRIMARY KEY,
  tx_id TEXT UNIQUE NOT NULL,
  participant_id INTEGER NOT NULL REFERENCES participant_accounts(id) ON DELETE CASCADE,
  account_number TEXT NOT NULL,
  participant_name TEXT NOT NULL,
  amount NUMERIC(18,2) NOT NULL,
  fund_code TEXT DEFAULT 'G',
  payment_method_id TEXT,
  payment_method_name TEXT,
  payment_reference TEXT,
  sender_identifier TEXT,
  proof_file_name TEXT,
  proof_file_data TEXT,
  status TEXT DEFAULT 'Pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Messages (Two-way Live Mailbox)
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  participant_id INTEGER NOT NULL REFERENCES participant_accounts(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL, -- 'participant', 'admin', 'system'
  sender_name TEXT NOT NULL,
  sender_email TEXT,
  recipient_email TEXT,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT DEFAULT 'General Inquiry',
  is_read BOOLEAN DEFAULT false,
  is_starred BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. User Documents (Documents Center)
CREATE TABLE IF NOT EXISTS user_documents (
  id SERIAL PRIMARY KEY,
  participant_id INTEGER NOT NULL REFERENCES participant_accounts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- 'statement', 'tax', 'disclosure', 'loan', 'legal', 'custom'
  file_name TEXT NOT NULL,
  file_size TEXT,
  file_data TEXT,
  status TEXT DEFAULT 'Pending', -- 'Approved', 'Pending', 'Rejected'
  is_official BOOLEAN DEFAULT false,
  uploaded_by TEXT DEFAULT 'participant', -- 'participant' or 'admin'
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. KYC Documents
CREATE TABLE IF NOT EXISTS kyc_documents (
  id SERIAL PRIMARY KEY,
  participant_id INTEGER NOT NULL REFERENCES participant_accounts(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL, -- 'ssn_card', 'driver_license_front', 'driver_license_back', 'passport', 'proof_of_address'
  file_name TEXT NOT NULL,
  file_data TEXT,
  file_size TEXT,
  doc_number_masked TEXT,
  issuing_authority TEXT,
  expiration_date TEXT,
  status TEXT DEFAULT 'Pending Review', -- 'Verified', 'Pending Review', 'Action Required'
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Loan Applications
CREATE TABLE IF NOT EXISTS loan_applications (
  id SERIAL PRIMARY KEY,
  loan_id TEXT UNIQUE NOT NULL,
  participant_id INTEGER NOT NULL REFERENCES participant_accounts(id) ON DELETE CASCADE,
  loan_type TEXT NOT NULL, -- 'General Purpose', 'Residential'
  amount NUMERIC(18,2) NOT NULL,
  term_months INTEGER NOT NULL,
  interest_rate NUMERIC(5,2) DEFAULT 4.75,
  monthly_payment NUMERIC(18,2) NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'Pending', -- 'Pending', 'Approved', 'Rejected', 'Active'
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Withdrawal Requests
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id SERIAL PRIMARY KEY,
  request_id TEXT UNIQUE NOT NULL,
  participant_id INTEGER NOT NULL REFERENCES participant_accounts(id) ON DELETE CASCADE,
  withdrawal_type TEXT NOT NULL,
  amount NUMERIC(18,2) NOT NULL,
  reason TEXT,
  disbursement_method TEXT DEFAULT 'Direct Deposit (ACH)',
  bank_name TEXT,
  routing_number TEXT,
  account_number_last4 TEXT,
  status TEXT DEFAULT 'Pending', -- 'Pending', 'Approved', 'Rejected'
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Financial Transactions Ledger
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  tx_code TEXT UNIQUE NOT NULL,
  participant_id INTEGER NOT NULL REFERENCES participant_accounts(id) ON DELETE CASCADE,
  account_number TEXT NOT NULL,
  date TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(18,2) NOT NULL,
  status TEXT DEFAULT 'Pending',
  category TEXT DEFAULT 'Deposit',
  fund_code TEXT,
  metal_equivalent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Announcements & CMS
CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  category TEXT DEFAULT 'general',
  badge TEXT,
  is_pinned BOOLEAN DEFAULT false,
  published_date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Fund Prices
CREATE TABLE IF NOT EXISTS fund_prices (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  current_share_price NUMERIC(12,4) NOT NULL,
  daily_change NUMERIC(8,2) DEFAULT 0.00,
  ytd_return NUMERIC(8,2) DEFAULT 0.00,
  metal_purity TEXT,
  vault_location TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Payment Methods
CREATE TABLE IF NOT EXISTS payment_methods (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  badge_text TEXT,
  bank_name TEXT,
  account_holder_name TEXT,
  account_number TEXT,
  routing_number TEXT,
  swift_bic TEXT,
  bank_address TEXT,
  coin_symbol TEXT,
  network TEXT,
  wallet_address TEXT,
  memo_or_tag TEXT,
  paypal_email TEXT,
  cashapp_tag TEXT,
  zelle_identifier TEXT,
  recipient_name TEXT,
  instructions TEXT,
  min_deposit_usd NUMERIC(18,2) DEFAULT 5000,
  max_deposit_usd NUMERIC(18,2) DEFAULT 300000,
  processing_time TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
`;
