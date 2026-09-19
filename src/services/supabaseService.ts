// =============================================================================
// LEGACY COMPATIBILITY SHIM - FORWARDING TO NEON DATABASE SERVICE (dbService.ts)
// =============================================================================
// All database calls now directly route to Neon PostgreSQL via dbService.ts.
// =============================================================================

export * from './dbService';
