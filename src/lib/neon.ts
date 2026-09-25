/// <reference types="vite/client" />

// =============================================================================
// CASSIVON CAPITAL SAVINGS PLAN (CCSP) - NEON POSTGRESQL CLIENT LIB
// =============================================================================
// Direct Neon PostgreSQL connectivity is powered by the 'postgres' / '@neondatabase/serverless' 
// packages via DATABASE_URL connection pooling and synchronized REST API endpoints.
// All Supabase requirements have been completely removed in favor of native Neon PostgreSQL.
// =============================================================================

export const isNeonConfigured = (): boolean => true;

/**
 * Checks if a value is NaN or not a finite valid number
 */
export function isInvalidNumber(val: any): boolean {
  if (val === null || val === undefined) return true;
  if (typeof val === 'number') {
    return isNaN(val) || Number.isNaN(val) || !isFinite(val);
  }
  const parsed = Number(val);
  return isNaN(parsed) || Number.isNaN(parsed) || !isFinite(parsed);
}

/**
 * Universal integer sanitizer to prevent PostgreSQL:
 * "Invalid input syntax for type integer: 'NaN'"
 * Explicitly uses both isNaN() and Number.isNaN() checks.
 */
export function sanitizeInteger(value: any, fallback = 1): number {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'number') {
    if (isNaN(value) || Number.isNaN(value) || !isFinite(value)) return fallback;
    return Math.floor(value);
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    const directParse = parseInt(trimmed, 10);
    if (!isNaN(directParse) && !Number.isNaN(directParse) && isFinite(directParse)) return directParse;

    // Try extracting numeric characters e.g. "usr_01" -> 1, "usr_99" -> 99
    const digitsOnly = trimmed.replace(/\D/g, '');
    if (digitsOnly.length > 0) {
      const extracted = parseInt(digitsOnly, 10);
      if (!isNaN(extracted) && !Number.isNaN(extracted) && isFinite(extracted) && extracted > 0) return extracted;
    }
  }
  const parsed = parseInt(String(value), 10);
  if (isNaN(parsed) || Number.isNaN(parsed) || !isFinite(parsed)) return fallback;
  return parsed;
}

/**
 * Universal numeric float sanitizer to prevent NaN or undefined in database queries
 * Explicitly validates with isNaN() and Number.isNaN().
 */
export function sanitizeNumeric(value: any, fallback = 0.0): number {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'number') {
    if (isNaN(value) || Number.isNaN(value) || !isFinite(value)) return fallback;
    return Number(value.toFixed(2));
  }
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9.-]/g, '');
    if (!cleaned) return fallback;
    const parsed = parseFloat(cleaned);
    if (!isNaN(parsed) && !Number.isNaN(parsed) && isFinite(parsed)) {
      return Number(parsed.toFixed(2));
    }
    return fallback;
  }
  const parsed = Number(value);
  if (isNaN(parsed) || Number.isNaN(parsed) || !isFinite(parsed)) return fallback;
  return Number(parsed.toFixed(2));
}

/**
 * Validates and sanitizes all numeric fields within a UserAccount object
 * prior to writing to PostgreSQL to prevent 'NaN' syntax errors.
 */
export function sanitizeParticipantAccountData<T extends Record<string, any>>(user: T): T {
  if (!user || typeof user !== 'object') return user;

  const sanitized: any = { ...user };

  // Explicitly validate and sanitize core balances
  sanitized.totalBalance = (isNaN(sanitized.totalBalance) || Number.isNaN(sanitized.totalBalance))
    ? 0.0
    : sanitizeNumeric(sanitized.totalBalance, 0.0);

  sanitized.traditionalBalance = (isNaN(sanitized.traditionalBalance) || Number.isNaN(sanitized.traditionalBalance))
    ? 0.0
    : sanitizeNumeric(sanitized.traditionalBalance, 0.0);

  sanitized.rothBalance = (isNaN(sanitized.rothBalance) || Number.isNaN(sanitized.rothBalance))
    ? 0.0
    : sanitizeNumeric(sanitized.rothBalance, 0.0);

  sanitized.ytdReturn = (isNaN(sanitized.ytdReturn) || Number.isNaN(sanitized.ytdReturn))
    ? 22.8
    : sanitizeNumeric(sanitized.ytdReturn, 22.8);

  if ('goldOuncesEquivalent' in sanitized) {
    sanitized.goldOuncesEquivalent = (isNaN(sanitized.goldOuncesEquivalent) || Number.isNaN(sanitized.goldOuncesEquivalent))
      ? 0.0
      : sanitizeNumeric(sanitized.goldOuncesEquivalent, 0.0);
  }

  if ('silverOuncesEquivalent' in sanitized) {
    sanitized.silverOuncesEquivalent = (isNaN(sanitized.silverOuncesEquivalent) || Number.isNaN(sanitized.silverOuncesEquivalent))
      ? 0.0
      : sanitizeNumeric(sanitized.silverOuncesEquivalent, 0.0);
  }

  // Sanitize YTD contributions
  if (sanitized.ytdContributions && typeof sanitized.ytdContributions === 'object') {
    sanitized.ytdContributions = {
      employee: (isNaN(sanitized.ytdContributions.employee) || Number.isNaN(sanitized.ytdContributions.employee))
        ? 0.0
        : sanitizeNumeric(sanitized.ytdContributions.employee, 0.0),
      agencyMatch: (isNaN(sanitized.ytdContributions.agencyMatch) || Number.isNaN(sanitized.ytdContributions.agencyMatch))
        ? 0.0
        : sanitizeNumeric(sanitized.ytdContributions.agencyMatch, 0.0),
      agencyAutomatic: (isNaN(sanitized.ytdContributions.agencyAutomatic) || Number.isNaN(sanitized.ytdContributions.agencyAutomatic))
        ? 0.0
        : sanitizeNumeric(sanitized.ytdContributions.agencyAutomatic, 0.0),
      total: (isNaN(sanitized.ytdContributions.total) || Number.isNaN(sanitized.ytdContributions.total))
        ? 0.0
        : sanitizeNumeric(sanitized.ytdContributions.total, 0.0),
    };
  }

  // Sanitize contribution allocations
  if (sanitized.contributionAllocations && typeof sanitized.contributionAllocations === 'object') {
    const cleanAlloc: Record<string, number> = {};
    for (const [k, v] of Object.entries(sanitized.contributionAllocations)) {
      cleanAlloc[k] = (isNaN(Number(v)) || Number.isNaN(Number(v))) ? 0 : sanitizeNumeric(v, 0);
    }
    sanitized.contributionAllocations = cleanAlloc;
  }

  // Sanitize current holdings
  if (Array.isArray(sanitized.currentHoldings)) {
    sanitized.currentHoldings = sanitized.currentHoldings.map((h: any) => ({
      ...h,
      shares: (isNaN(h.shares) || Number.isNaN(h.shares)) ? 0.0 : sanitizeNumeric(h.shares, 0.0),
      sharePrice: (isNaN(h.sharePrice) || Number.isNaN(h.sharePrice)) ? 10.0 : sanitizeNumeric(h.sharePrice, 10.0),
      balance: (isNaN(h.balance) || Number.isNaN(h.balance)) ? 0.0 : sanitizeNumeric(h.balance, 0.0),
      percentage: (isNaN(h.percentage) || Number.isNaN(h.percentage)) ? 0 : sanitizeNumeric(h.percentage, 0),
    }));
  }

  // Sanitize active loans
  if (Array.isArray(sanitized.activeLoans)) {
    sanitized.activeLoans = sanitized.activeLoans.map((l: any) => ({
      ...l,
      originalAmount: (isNaN(l.originalAmount) || Number.isNaN(l.originalAmount)) ? 0.0 : sanitizeNumeric(l.originalAmount, 0.0),
      currentBalance: (isNaN(l.currentBalance) || Number.isNaN(l.currentBalance)) ? 0.0 : sanitizeNumeric(l.currentBalance, 0.0),
      interestRate: (isNaN(l.interestRate) || Number.isNaN(l.interestRate)) ? 4.25 : sanitizeNumeric(l.interestRate, 4.25),
      termMonths: (isNaN(l.termMonths) || Number.isNaN(l.termMonths)) ? 36 : sanitizeInteger(l.termMonths, 36),
      repaymentPerPayPeriod: (isNaN(l.repaymentPerPayPeriod) || Number.isNaN(l.repaymentPerPayPeriod)) ? 0.0 : sanitizeNumeric(l.repaymentPerPayPeriod, 0.0),
    }));
  }

  return sanitized as T;
}

/**
 * PostgreSQL Database Schema Reference for Neon cluster
 */
export const NEON_DATABASE_SCHEMA_SQL = `
-- =============================================================================
-- CASSIVON CAPITAL SAVINGS PLAN (CCSP) - NEON POSTGRESQL SCHEMA
-- =============================================================================

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

CREATE TABLE IF NOT EXISTS participant_accounts (
  id SERIAL PRIMARY KEY,
  account_number TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  thriftline_pin TEXT DEFAULT '829415',
  full_name TEXT NOT NULL,
  employing_agency TEXT,
  plan_type TEXT DEFAULT 'CCSP Sovereign Custody (Self-Directed / IRA)',
  hire_date TEXT,
  total_balance NUMERIC(18,2) DEFAULT 0.00,
  traditional_balance NUMERIC(18,2) DEFAULT 0.00,
  roth_balance NUMERIC(18,2) DEFAULT 0.00,
  ytd_return NUMERIC(8,2) DEFAULT 22.80,
  vault_facility TEXT DEFAULT 'Zurich FreePort / Delaware Depository Segregated Vault',
  gold_ounces_equivalent NUMERIC(18,4) DEFAULT 0.00,
  silver_ounces_equivalent NUMERIC(18,4) DEFAULT 0.00,
  phone TEXT,
  address TEXT,
  account_status TEXT DEFAULT 'Active / Verified',
  kyc_status TEXT DEFAULT 'Verified (Tier 1 Allocated)',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_branding (
  id SERIAL PRIMARY KEY,
  site_name TEXT DEFAULT 'Cassivon Capital Savings Plan',
  site_subtitle TEXT DEFAULT 'Institutional Sovereign Custody & Allocated Bullion Reserve',
  agency_name TEXT DEFAULT 'CCSP Federal Bullion Depository System',
  slogan TEXT DEFAULT 'Preserving Generational Wealth in Tangible Sovereign Metals',
  support_phone TEXT DEFAULT '+1 (202) 555-0194',
  support_email TEXT DEFAULT 'depository@cassivon.com',
  logo_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deposits (
  id SERIAL PRIMARY KEY,
  reference_id TEXT UNIQUE NOT NULL,
  participant_id INTEGER NOT NULL REFERENCES participant_accounts(id) ON DELETE CASCADE,
  user_account_number TEXT NOT NULL,
  user_name TEXT NOT NULL,
  amount NUMERIC(18,2) NOT NULL,
  target_fund_code TEXT DEFAULT 'G',
  payment_method_id TEXT,
  payment_method_name TEXT,
  transaction_hash TEXT,
  proof_file_name TEXT,
  status TEXT DEFAULT 'Pending Review',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id SERIAL PRIMARY KEY,
  request_number TEXT UNIQUE NOT NULL,
  participant_id INTEGER NOT NULL REFERENCES participant_accounts(id) ON DELETE CASCADE,
  user_account_number TEXT NOT NULL,
  user_name TEXT NOT NULL,
  withdrawal_type TEXT NOT NULL,
  amount NUMERIC(18,2) NOT NULL,
  delivery_option TEXT DEFAULT 'Insured Armored Courier Delivery',
  destination_address TEXT,
  bank_details TEXT,
  status TEXT DEFAULT 'Pending Review',
  reason TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS loan_applications (
  id SERIAL PRIMARY KEY,
  loan_number TEXT UNIQUE NOT NULL,
  participant_id INTEGER NOT NULL REFERENCES participant_accounts(id) ON DELETE CASCADE,
  user_account_number TEXT NOT NULL,
  user_name TEXT NOT NULL,
  loan_type TEXT NOT NULL,
  requested_amount NUMERIC(18,2) NOT NULL,
  term_months INTEGER NOT NULL,
  interest_rate NUMERIC(5,2) DEFAULT 4.25,
  monthly_payment NUMERIC(18,2) NOT NULL,
  collateral_asset TEXT DEFAULT 'Segregated LBMA Gold Sovereign Bar',
  status TEXT DEFAULT 'Pending Review',
  purpose TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kyc_documents (
  id SERIAL PRIMARY KEY,
  participant_id INTEGER NOT NULL REFERENCES participant_accounts(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_data TEXT,
  file_size TEXT,
  status TEXT DEFAULT 'Pending Review',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  participant_id INTEGER NOT NULL REFERENCES participant_accounts(id) ON DELETE CASCADE,
  recipient_user_id TEXT,
  sender_type TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_email TEXT,
  recipient_email TEXT,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT DEFAULT 'official',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_documents (
  id SERIAL PRIMARY KEY,
  doc_id TEXT UNIQUE NOT NULL,
  participant_id INTEGER NOT NULL REFERENCES participant_accounts(id) ON DELETE CASCADE,
  user_account_number TEXT NOT NULL,
  user_name TEXT NOT NULL,
  document_title TEXT NOT NULL,
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT,
  file_size TEXT,
  status TEXT DEFAULT 'Verified',
  compliance_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_methods (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  symbol TEXT,
  network TEXT,
  wallet_address TEXT,
  memo_tag TEXT,
  bank_name TEXT,
  account_holder TEXT,
  routing_number TEXT,
  account_number TEXT,
  swift_bic TEXT,
  handle TEXT,
  qr_image_url TEXT,
  instructions TEXT,
  min_deposit NUMERIC(18,2) DEFAULT 5000,
  max_deposit NUMERIC(18,2) DEFAULT 300000,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fund_prices (
  id SERIAL PRIMARY KEY,
  fund_code TEXT UNIQUE NOT NULL,
  fund_name TEXT NOT NULL,
  current_share_price NUMERIC(12,4) NOT NULL,
  daily_change NUMERIC(8,2) DEFAULT 0.00,
  ytd_return NUMERIC(8,2) DEFAULT 0.00,
  metal_purity TEXT,
  vault_location TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
`;
