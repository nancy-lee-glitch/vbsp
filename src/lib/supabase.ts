/// <reference types="vite/client" />

// =============================================================================
// CASSIVON CAPITAL SAVINGS PLAN (CCSP) - COMPATIBILITY SHIM
// =============================================================================
// Direct Neon PostgreSQL connectivity is powered by Neon Serverless PostgreSQL.
// Supabase requirements are completely removed in favor of native Neon PostgreSQL.
// =============================================================================

export {
  isNeonConfigured,
  isInvalidNumber,
  sanitizeInteger,
  sanitizeNumeric,
  sanitizeParticipantAccountData,
  NEON_DATABASE_SCHEMA_SQL,
  NEON_DATABASE_SCHEMA_SQL as SUPABASE_DATABASE_SCHEMA_SQL
} from './neon';

export const isSupabaseConfigured = (): boolean => false;
