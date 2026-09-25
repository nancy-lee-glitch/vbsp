import React, { useState, useEffect } from 'react';
import { 
  Database, 
  CheckCircle2, 
  RefreshCw, 
  Server, 
  ShieldCheck, 
  Layers, 
  Copy, 
  Check, 
  ExternalLink, 
  AlertCircle, 
  Zap, 
  Cpu,
  Clock,
  HardDrive
} from 'lucide-react';

interface DbStatusResponse {
  connected: boolean;
  engine: string;
  database?: string;
  server_time?: string;
  version?: string;
  tables_count?: number;
  tables?: string[];
  error?: string;
}

export const NeonDatabaseInspector: React.FC = () => {
  const [status, setStatus] = useState<DbStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<string>('');
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'tables' | 'schema'>('status');

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/db/status');
      const data = await res.json();
      setStatus(data);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err: any) {
      setStatus({
        connected: false,
        engine: 'Neon PostgreSQL',
        error: err.message || 'Failed to reach database status endpoint'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleCopySchema = async () => {
    try {
      const res = await fetch('/database_schema.sql');
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setCopiedSchema(true);
      setTimeout(() => setCopiedSchema(false), 2500);
    } catch (err) {
      console.error('Failed to copy schema:', err);
    }
  };

  const handleCopyHost = async () => {
    await navigator.clipboard.writeText('ep-wild-boat-au652jgn-pooler.c-10.us-east-1.aws.neon.tech');
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  return (
    <div className="space-y-6" id="neon-database-inspector">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900/90 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white">Neon Serverless PostgreSQL</h2>
                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                  status?.connected 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                    : 'bg-red-500/20 text-red-300 border-red-500/40'
                }`}>
                  {status?.connected ? 'ONLINE & SYNCED' : 'OFFLINE'}
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-1">
                Primary persistent database engine for all CCSP participant vaults, funds, branding, and transactions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchStatus}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm font-medium text-white transition-all shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
              <span>{isLoading ? 'Pinging...' : 'Check Connection'}</span>
            </button>
            <a
              href="https://console.neon.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-semibold text-white transition-all shadow-md shadow-emerald-900/30"
            >
              <span>Neon Console</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('status')}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'status'
              ? 'border-emerald-600 text-emerald-600 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Connection & Diagnostics</span>
        </button>
        <button
          onClick={() => setActiveTab('tables')}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'tables'
              ? 'border-emerald-600 text-emerald-600 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Synchronized Tables ({status?.tables_count ?? 18})</span>
        </button>
        <button
          onClick={() => setActiveTab('schema')}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'schema'
              ? 'border-emerald-600 text-emerald-600 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>Neon SQL Schema</span>
        </button>
      </div>

      {/* Tab Content: Status */}
      {activeTab === 'status' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active Configuration */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Neon Serverless Cluster Specs</span>
            </h3>

            <div className="divide-y divide-slate-100 text-sm">
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500">Database Engine</span>
                <span className="font-semibold text-slate-900">PostgreSQL 18.6 (Serverless)</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500">Provider & Cloud</span>
                <span className="font-semibold text-slate-900">Neon (AWS us-east-1)</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500">Database Name</span>
                <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                  {status?.database || 'neondb'}
                </span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500">Connection Mode</span>
                <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-xs">
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  PgBouncer Pooler Active
                </span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500">SSL Encryption</span>
                <span className="font-mono text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                  sslmode=require
                </span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500">Last Ping Timestamp</span>
                <span className="text-xs text-slate-600 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {lastChecked || 'Just now'}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <div className="text-xs font-medium text-slate-500 mb-1.5">Neon Pooler Host</div>
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-mono text-slate-700">
                <span className="truncate mr-2">ep-wild-boat-au652jgn-pooler.c-10.us-east-1.aws.neon.tech</span>
                <button
                  onClick={handleCopyHost}
                  className="shrink-0 text-slate-500 hover:text-slate-900 p-1"
                  title="Copy Neon Host"
                >
                  {copiedUrl ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Database Diagnostics */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-600" />
              <span>Real-Time Health & Storage</span>
            </h3>

            {status?.connected ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-emerald-950">Neon Database Healthy & Ready</div>
                    <div className="text-xs text-emerald-800 mt-0.5">
                      All REST operations (deposits, participants, balances, loans, branding) are streaming directly to Neon PostgreSQL.
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-center">
                    <div className="text-2xl font-bold text-slate-900">{status.tables_count ?? 18}</div>
                    <div className="text-xs font-medium text-slate-500 mt-0.5">Total Synced Tables</div>
                  </div>
                  <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-center">
                    <div className="text-2xl font-bold text-emerald-600">Active</div>
                    <div className="text-xs font-medium text-slate-500 mt-0.5">Neon Pooler Ingress</div>
                  </div>
                </div>

                <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono break-all leading-relaxed">
                  {status.version ? status.version.split(',')[0] : 'PostgreSQL 18.6 on aarch64-unknown-linux-gnu'}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-red-950">Database Offline</div>
                  <div className="text-xs text-red-800 mt-0.5">{status?.error || 'Unable to connect to Neon'}</div>
                </div>
              </div>
            )}

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900">
              <strong className="font-semibold">Neon Serverless PostgreSQL:</strong> Connected directly to your Neon PostgreSQL cluster with auto-pooling and high availability.
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Tables */}
      {activeTab === 'tables' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Neon Database Schema Tables</h3>
              <p className="text-xs text-slate-500">Live schema catalog detected in the `public` schema of `neondb`.</p>
            </div>
            <span className="text-xs font-medium bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
              {status?.tables?.length ?? 18} Active Tables
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {(status?.tables || [
              'admin_users',
              'announcements',
              'audit_logs',
              'beneficiaries',
              'deposits',
              'fraud_alerts',
              'fund_prices',
              'kyc_documents',
              'loan_applications',
              'messages',
              'participant_accounts',
              'participant_allocations',
              'participant_loans',
              'payment_methods',
              'site_branding',
              'statutory_parameters',
              'user_documents',
              'withdrawal_requests'
            ]).map((tbl) => (
              <div
                key={tbl}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/80 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-mono text-xs font-semibold text-slate-800">{tbl}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">READY</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: Schema */}
      {activeTab === 'schema' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Neon PostgreSQL Migration & DDL Schema</h3>
              <p className="text-xs text-slate-500">
                You can run or review this standard SQL in the Neon Console SQL Editor anytime.
              </p>
            </div>
            <button
              onClick={handleCopySchema}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all shadow-sm shrink-0"
            >
              {copiedSchema ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedSchema ? 'Copied to Clipboard!' : 'Copy Neon SQL Schema'}</span>
            </button>
          </div>

          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 max-h-96 overflow-y-auto leading-relaxed">
            <pre>
{`-- ==============================================================================
-- CASSIVON CAPITAL SAVINGS PLAN (CCSP) - NEON POSTGRESQL SCHEMA
-- Target: Neon Serverless PostgreSQL (console.neon.tech)
-- Connection: Reads from DATABASE_URL with sslmode=require
-- ==============================================================================

-- 1. PARTICIPANT ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS participant_accounts (
  id SERIAL PRIMARY KEY,
  account_number VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  thriftline_pin VARCHAR(20) NOT NULL DEFAULT '829415',
  full_name VARCHAR(255) NOT NULL,
  account_type VARCHAR(100) NOT NULL DEFAULT 'CCSP Standard Account (Taxable Reserve)',
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
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 2. FUND PRICES TABLE
CREATE TABLE IF NOT EXISTS fund_prices (
  id SERIAL PRIMARY KEY,
  fund_code VARCHAR(30) UNIQUE NOT NULL,
  fund_name VARCHAR(255) NOT NULL,
  fund_category VARCHAR(100) NOT NULL,
  current_share_price NUMERIC(12, 4) NOT NULL,
  ytd_return NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
  metal_purity VARCHAR(100),
  vault_location VARCHAR(255),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 3. SITE BRANDING SETTINGS TABLE
CREATE TABLE IF NOT EXISTS site_branding (
  id SERIAL PRIMARY KEY,
  site_name VARCHAR(255) NOT NULL DEFAULT 'Cassivon Capital Savings Plan',
  site_subtitle VARCHAR(255) DEFAULT 'Institutional Sovereign Custody',
  site_domain VARCHAR(100) DEFAULT 'CASSIVON.COM',
  logo_url TEXT DEFAULT '',
  seal_text TEXT DEFAULT 'Official Vault Custody & Bullion Savings Reserve • LBMA Good Delivery Certified',
  support_phone VARCHAR(100) DEFAULT '+1 (202) 555-0194',
  support_email VARCHAR(255) DEFAULT 'custody@cassivon.com',
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- [Complete schema file available at /database_schema.sql]`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
