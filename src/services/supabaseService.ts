import { 
  supabase, 
  isSupabaseConfigured, 
  sanitizeInteger, 
  sanitizeNumeric 
} from '../lib/supabase';
import { 
  UserAccount, 
  SiteBrandingSettings, 
  TSPFund, 
  PaymentMethodConfig, 
  TSPTransaction, 
  ParticipantMessage, 
  TSPDocument, 
  TSPLoan,
  KYCVerificationProfile,
  IdentificationDocument
} from '../types';
import { MOCK_USERS, DEFAULT_SITE_BRANDING, TSP_FUNDS, DEFAULT_PAYMENT_METHODS } from '../data/mockData';

// Storage cache keys for graceful offline fallback or local sync
const CACHE_KEYS = {
  USERS: 'vbsp_users_registry',
  BRANDING: 'vbsp_branding_settings',
  FUNDS: 'vbsp_managed_funds',
  PAYMENTS: 'vbsp_payment_methods',
  DOCUMENTS: 'vbsp_user_documents',
  MESSAGES: 'vbsp_messages_mailbox',
  DEPOSITS: 'vbsp_deposits_list',
  LOANS: 'vbsp_loan_applications',
  WITHDRAWALS: 'vbsp_withdrawals_list'
};

function safeGetCache<T>(key: string, fallback: T): T {
  try {
    if (typeof window === 'undefined') return fallback;
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function safeSetCache<T>(key: string, data: T): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  } catch {}
}

// =============================================================================
// 1. PARTICIPANTS & ACCOUNTS
// =============================================================================

export async function getDbParticipantId(user: { id?: string | number; accountNumber?: string; email?: string }): Promise<number> {
  // If user already has a valid numeric ID, sanitize and return
  if (user.id !== undefined && user.id !== null) {
    const parsed = sanitizeInteger(user.id, 0);
    if (parsed > 0) return parsed;
  }

  // Otherwise, query Supabase for participant row by account number or email
  if (isSupabaseConfigured()) {
    try {
      if (user.accountNumber) {
        const { data, error } = await supabase
          .from('participant_accounts')
          .select('id')
          .eq('account_number', user.accountNumber)
          .maybeSingle();

        if (data?.id) return Number(data.id);
      }

      if (user.email) {
        const { data, error } = await supabase
          .from('participant_accounts')
          .select('id')
          .ilike('email', user.email.trim())
          .maybeSingle();

        if (data?.id) return Number(data.id);
      }
    } catch (e) {
      console.warn('Could not query participant_accounts by account/email', e);
    }
  }

  // Extract digits from id if format is usr_01 or similar
  if (typeof user.id === 'string') {
    const digits = user.id.replace(/\D/g, '');
    if (digits.length > 0) {
      const parsedDigits = parseInt(digits, 10);
      if (!isNaN(parsedDigits) && parsedDigits > 0) return parsedDigits;
    }
  }

  // Safe universal fallback integer to avoid PostgreSQL NaN error
  return 1;
}

export async function fetchAllParticipants(): Promise<UserAccount[]> {
  try {
    const res = await fetch('/api/participants');
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.participants) && json.participants.length > 0) {
        safeSetCache(CACHE_KEYS.USERS, json.participants);
        return json.participants;
      }
    }
  } catch (e) {
    // continue to Supabase / local cache
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('participant_accounts')
        .select('*')
        .order('id', { ascending: true });

      if (!error && data && data.length > 0) {
        const mapped: UserAccount[] = data.map((row: any) => ({
          id: String(row.id),
          name: row.full_name || 'Participant',
          email: row.email,
          accountNumber: row.account_number,
          thriftlinePin: row.thriftline_pin || '829415',
          employingAgency: row.employing_agency || 'Federal / Private Reserve',
          planType: row.plan_type || 'VBSP Sovereign Custody (Self-Directed / IRA)',
          hireDate: row.hire_date || '2020-01-01',
          totalBalance: Number(row.total_balance || 0),
          traditionalBalance: Number(row.traditional_balance || 0),
          rothBalance: Number(row.roth_balance || 0),
          ytdReturn: Number(row.ytd_return || 22.8),
          vaultDepositaryLocation: row.vault_depository_location || 'Zurich Segregated Vault',
          goldOuncesEquivalent: Number(row.gold_ounces_equivalent || 0),
          silverOuncesEquivalent: Number(row.silver_ounces_equivalent || 0),
          phone: row.phone || '+1 (202) 555-0194',
          address: row.address || 'Washington, DC',
          ytdContributions: { employee: 0, agencyMatch: 0, agencyAutomatic: 0 },
          contributionAllocations: { 'G': 50, 'S': 25, 'L_BALANCED': 25 },
          currentHoldings: [
            { fundCode: 'G', shares: Number((Number(row.traditional_balance || 0) * 0.5 / 94.65).toFixed(2)), sharePrice: 94.65, balance: Number(row.traditional_balance || 0) * 0.5, percentage: 50.0, metalWeight: 'Fine Gold' },
            { fundCode: 'S', shares: Number((Number(row.traditional_balance || 0) * 0.25 / 86.30).toFixed(2)), sharePrice: 86.30, balance: Number(row.traditional_balance || 0) * 0.25, percentage: 25.0, metalWeight: 'Pure Silver' }
          ],
          beneficiaries: [],
          activeLoans: [],
          transactions: [],
          unreadMessagesCount: 0,
          pendingActionsCount: 0,
          isAgencyEligible: true,
          kycProfile: {
            overallStatus: (row.kyc_status as any) || 'Not Verified',
            riskTier: 'Tier 1 Individual',
            ssnMasked: '***-**-4912',
            additionalDocuments: []
          }
        }));

        safeSetCache(CACHE_KEYS.USERS, mapped);
        return mapped;
      }
    } catch (err) {
      console.warn('Supabase fetchAllParticipants failed, using local cache:', err);
    }
  }

  return safeGetCache<UserAccount[]>(CACHE_KEYS.USERS, MOCK_USERS);
}

export async function updateParticipantBalances(
  participantId: string | number,
  balances: {
    totalBalance: number;
    traditionalBalance: number;
    rothBalance: number;
    goldOunces?: number;
    silverOunces?: number;
  }
): Promise<boolean> {
  try {
    await fetch(`/api/participants/${participantId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(balances)
    });
  } catch (e) {}

  const integerId = sanitizeInteger(participantId);

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('participant_accounts')
        .update({
          total_balance: sanitizeNumeric(balances.totalBalance),
          traditional_balance: sanitizeNumeric(balances.traditionalBalance),
          roth_balance: sanitizeNumeric(balances.rothBalance),
          gold_ounces_equivalent: balances.goldOunces !== undefined ? sanitizeNumeric(balances.goldOunces) : undefined,
          silver_ounces_equivalent: balances.silverOunces !== undefined ? sanitizeNumeric(balances.silverOunces) : undefined,
          updated_at: new Date().toISOString()
        })
        .eq('id', integerId);

      if (!error) return true;
      console.error('Supabase updateParticipantBalances error:', error);
    } catch (e) {
      console.error('Supabase balance update exception:', e);
    }
  }

  // Local fallback
  const cachedUsers = safeGetCache<UserAccount[]>(CACHE_KEYS.USERS, MOCK_USERS);
  const updated = cachedUsers.map(u => {
    if (sanitizeInteger(u.id) === integerId || u.id === String(participantId)) {
      return {
        ...u,
        totalBalance: balances.totalBalance,
        traditionalBalance: balances.traditionalBalance,
        rothBalance: balances.rothBalance,
        goldOuncesEquivalent: balances.goldOunces ?? u.goldOuncesEquivalent,
        silverOuncesEquivalent: balances.silverOunces ?? u.silverOuncesEquivalent
      };
    }
    return u;
  });
  safeSetCache(CACHE_KEYS.USERS, updated);
  return true;
}

export async function upsertParticipantAccount(user: UserAccount): Promise<UserAccount> {
  try {
    const res = await fetch('/api/participants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.user) {
        user = json.user;
      }
    }
  } catch (e) {}

  const integerId = sanitizeInteger(user.id);

  if (isSupabaseConfigured()) {
    try {
      const payload: any = {
        account_number: user.accountNumber,
        email: user.email.toLowerCase().trim(),
        full_name: user.name,
        employing_agency: user.employingAgency,
        plan_type: user.planType,
        thriftline_pin: user.thriftlinePin || '829415',
        total_balance: sanitizeNumeric(user.totalBalance),
        traditional_balance: sanitizeNumeric(user.traditionalBalance),
        roth_balance: sanitizeNumeric(user.rothBalance),
        ytd_return: sanitizeNumeric(user.ytdReturn),
        vault_depository_location: user.vaultDepositaryLocation,
        gold_ounces_equivalent: sanitizeNumeric(user.goldOuncesEquivalent),
        silver_ounces_equivalent: sanitizeNumeric(user.silverOuncesEquivalent),
        phone: user.phone,
        address: user.address,
        kyc_status: user.kycProfile?.overallStatus || 'Not Verified',
        updated_at: new Date().toISOString()
      };

      if (integerId > 0 && !isNaN(integerId)) {
        payload.id = integerId;
      }

      const { data, error } = await supabase
        .from('participant_accounts')
        .upsert(payload, { onConflict: 'account_number' })
        .select()
        .single();

      if (!error && data) {
        return {
          ...user,
          id: String(data.id),
          totalBalance: Number(data.total_balance),
          traditionalBalance: Number(data.traditional_balance),
          rothBalance: Number(data.roth_balance)
        };
      }
    } catch (e) {
      console.warn('Supabase upsertParticipantAccount exception:', e);
    }
  }

  // Local fallback
  const cached = safeGetCache<UserAccount[]>(CACHE_KEYS.USERS, MOCK_USERS);
  const exists = cached.findIndex(u => u.accountNumber === user.accountNumber || u.id === user.id);
  let updatedList: UserAccount[];
  if (exists >= 0) {
    updatedList = cached.map((u, i) => i === exists ? user : u);
  } else {
    updatedList = [user, ...cached];
  }
  safeSetCache(CACHE_KEYS.USERS, updatedList);
  return user;
}

export async function deleteParticipantAccount(participantId: string | number): Promise<boolean> {
  try {
    await fetch(`/api/participants/${participantId}`, { method: 'DELETE' });
  } catch (e) {}

  const integerId = sanitizeInteger(participantId);

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('participant_accounts')
        .delete()
        .eq('id', integerId);

      if (!error) return true;
    } catch (e) {
      console.error('Supabase delete error:', e);
    }
  }

  const cached = safeGetCache<UserAccount[]>(CACHE_KEYS.USERS, MOCK_USERS);
  safeSetCache(CACHE_KEYS.USERS, cached.filter(u => sanitizeInteger(u.id) !== integerId && u.id !== String(participantId)));
  return true;
}

// =============================================================================
// 2. DEPOSITS & PAYMENT PROOFS (FIXES "Invalid input syntax for type integer: 'NaN'")
// =============================================================================

export interface DepositProofRecord {
  id?: number;
  tx_id: string;
  participant_id: number; // Strictly a valid integer
  account_number: string;
  participant_name: string;
  amount: number;
  fund_code: string;
  payment_method_id?: string;
  payment_method_name?: string;
  payment_reference?: string;
  sender_identifier?: string;
  proof_file_name?: string;
  proof_file_data?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  admin_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export async function submitDepositProof(
  user: { id?: string | number; accountNumber: string; name: string; email?: string },
  depositData: {
    amount: number;
    fundCode: string;
    paymentMethodId?: string;
    paymentMethodName: string;
    paymentReference?: string;
    senderIdentifier?: string;
    proofFileName?: string;
    proofFileData?: string;
    txId?: string;
  }
): Promise<{ success: boolean; txId: string; error?: string }> {
  const participantId = await getDbParticipantId(user);
  const cleanAmount = sanitizeNumeric(depositData.amount, 5000);
  const txId = depositData.txId || `TX-DEP-${Math.floor(100000 + Math.random() * 900000)}`;

  const record: DepositProofRecord = {
    tx_id: txId,
    participant_id: sanitizeInteger(participantId, 1),
    account_number: user.accountNumber,
    participant_name: user.name,
    amount: cleanAmount,
    fund_code: depositData.fundCode || 'G',
    payment_method_id: depositData.paymentMethodId,
    payment_method_name: depositData.paymentMethodName,
    payment_reference: depositData.paymentReference || '',
    sender_identifier: depositData.senderIdentifier || '',
    proof_file_name: depositData.proofFileName || 'Remittance_Voucher.pdf',
    proof_file_data: depositData.proofFileData || '',
    status: 'Pending',
    admin_notes: 'Awaiting Super Admin Depository Sign-off',
    created_at: new Date().toISOString()
  };

  // 1. Submit directly to Neon PostgreSQL via backend REST API
  try {
    const res = await fetch('/api/deposits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reference_id: record.tx_id,
        participant_id: record.participant_id,
        user_account_number: record.account_number,
        user_name: record.participant_name,
        target_fund_code: record.fund_code,
        payment_method_id: record.payment_method_id,
        payment_method_name: record.payment_method_name,
        amount: record.amount,
        estimated_shares: record.amount / 68.45,
        transaction_hash: record.payment_reference,
        proof_file_name: record.proof_file_name,
        receipt_image_url: record.proof_file_data,
        status: record.status,
        notes: record.admin_notes
      })
    });
    if (res.ok) {
      const cachedDeposits = safeGetCache<DepositProofRecord[]>(CACHE_KEYS.DEPOSITS, []);
      safeSetCache(CACHE_KEYS.DEPOSITS, [record, ...cachedDeposits]);
      return { success: true, txId };
    }
  } catch (err: any) {
    console.warn('Neon backend deposit submit fallback:', err);
  }

  // Local storage fallback for offline demo
  const cachedDeposits = safeGetCache<DepositProofRecord[]>(CACHE_KEYS.DEPOSITS, []);
  safeSetCache(CACHE_KEYS.DEPOSITS, [record, ...cachedDeposits]);
  return { success: true, txId };
}

export async function fetchDeposits(participantId?: number | string): Promise<DepositProofRecord[]> {
  try {
    const res = await fetch('/api/deposits');
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.deposits)) {
        const mapped = json.deposits.map((d: any) => ({
          id: d.id,
          tx_id: d.reference_id || `DEP-${d.id}`,
          participant_id: d.participant_id,
          account_number: d.user_account_number,
          participant_name: d.user_name,
          amount: Number(d.amount),
          fund_code: d.target_fund_code || 'G',
          payment_method_id: d.payment_method_id,
          payment_method_name: d.payment_method_name,
          payment_reference: d.transaction_hash,
          sender_identifier: d.proof_file_name,
          proof_file_name: d.proof_file_name,
          proof_file_data: d.receipt_image_url,
          status: d.status,
          admin_notes: d.notes,
          created_at: d.created_at
        }));
        safeSetCache(CACHE_KEYS.DEPOSITS, mapped);
        if (participantId !== undefined) {
          const cleanId = sanitizeInteger(participantId);
          return mapped.filter((d: any) => d.participant_id === cleanId || d.account_number === String(participantId));
        }
        return mapped;
      }
    }
  } catch (e) {
    console.warn('Neon fetchDeposits error, using cache:', e);
  }

  const cached = safeGetCache<DepositProofRecord[]>(CACHE_KEYS.DEPOSITS, []);
  if (participantId !== undefined) {
    const cleanId = sanitizeInteger(participantId);
    return cached.filter(d => d.participant_id === cleanId);
  }
  return cached;
}

export async function updateDepositStatus(
  depositId: number, 
  status: 'Approved' | 'Rejected', 
  adminNotes?: string
): Promise<boolean> {
  const cleanId = sanitizeInteger(depositId);

  try {
    const res = await fetch(`/api/deposits/${cleanId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminNotes })
    });
    if (res.ok) {
      const cached = safeGetCache<DepositProofRecord[]>(CACHE_KEYS.DEPOSITS, []);
      safeSetCache(CACHE_KEYS.DEPOSITS, cached.map(d => d.id === cleanId ? { ...d, status, admin_notes: adminNotes } : d));
      return true;
    }
  } catch (e) {
    console.warn('Neon updateDepositStatus exception:', e);
  }

  const cached = safeGetCache<DepositProofRecord[]>(CACHE_KEYS.DEPOSITS, []);
  safeSetCache(CACHE_KEYS.DEPOSITS, cached.map(d => d.id === cleanId ? { ...d, status, admin_notes: adminNotes } : d));
  return true;
}

// =============================================================================
// 3. MESSAGES (TWO-WAY LIVE MAILBOX: USER <-> ADMIN)
// =============================================================================

export interface DbMessage {
  id?: number;
  participant_id: number; // strictly integer
  sender_type: 'participant' | 'admin' | 'system';
  sender_name: string;
  sender_email?: string;
  recipient_email?: string;
  subject: string;
  body: string;
  category?: string;
  is_read?: boolean;
  is_starred?: boolean;
  created_at?: string;
}

export async function sendLiveMessage(
  user: { id?: string | number; accountNumber?: string; name?: string; email?: string },
  message: {
    sender_type: 'participant' | 'admin' | 'system';
    sender_name: string;
    sender_email?: string;
    recipient_email?: string;
    subject: string;
    body: string;
    category?: string;
    participant_id?: number;
  }
): Promise<DbMessage> {
  const pId = message.participant_id 
    ? sanitizeInteger(message.participant_id) 
    : await getDbParticipantId(user);

  const cleanMessage: DbMessage = {
    participant_id: sanitizeInteger(pId, 1),
    sender_type: message.sender_type,
    sender_name: message.sender_name,
    sender_email: message.sender_email || user.email || '',
    recipient_email: message.recipient_email || 'depository@vbsp.org',
    subject: message.subject,
    body: message.body,
    category: message.category || 'General Inquiry',
    is_read: false,
    is_starred: false,
    created_at: new Date().toISOString()
  };

  try {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanMessage)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.message) {
        const cached = safeGetCache<DbMessage[]>(CACHE_KEYS.MESSAGES, []);
        safeSetCache(CACHE_KEYS.MESSAGES, [data.message, ...cached]);
        return data.message;
      }
    }
  } catch (e) {
    console.warn('Neon sendLiveMessage error:', e);
  }

  // Local fallback
  const cached = safeGetCache<DbMessage[]>(CACHE_KEYS.MESSAGES, []);
  const withId = { ...cleanMessage, id: Date.now() };
  safeSetCache(CACHE_KEYS.MESSAGES, [withId, ...cached]);
  return withId;
}

export async function fetchMessagesForParticipant(
  user: { id?: string | number; accountNumber?: string; email?: string }
): Promise<DbMessage[]> {
  const pId = await getDbParticipantId(user);

  try {
    const res = await fetch('/api/messages');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        const filtered = data.messages.filter((m: any) => 
          m.participant_id === pId || 
          (user.email && m.recipient_email?.toLowerCase() === user.email.toLowerCase())
        );
        safeSetCache(CACHE_KEYS.MESSAGES, data.messages);
        return filtered;
      }
    }
  } catch (e) {
    console.warn('Neon fetchMessagesForParticipant exception:', e);
  }

  const cached = safeGetCache<DbMessage[]>(CACHE_KEYS.MESSAGES, []);
  return cached.filter(m => m.participant_id === pId);
}

export async function fetchAllMessagesAdmin(): Promise<DbMessage[]> {
  try {
    const res = await fetch('/api/messages');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        safeSetCache(CACHE_KEYS.MESSAGES, data.messages);
        return data.messages;
      }
    }
  } catch (e) {
    console.warn('Neon fetchAllMessagesAdmin exception:', e);
  }

  return safeGetCache<DbMessage[]>(CACHE_KEYS.MESSAGES, []);
}

export async function markMessageAsRead(messageId: number): Promise<boolean> {
  const cleanId = sanitizeInteger(messageId);
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('messages').update({ is_read: true }).eq('id', cleanId);
      return true;
    } catch {}
  }
  const cached = safeGetCache<DbMessage[]>(CACHE_KEYS.MESSAGES, []);
  safeSetCache(CACHE_KEYS.MESSAGES, cached.map(m => m.id === cleanId ? { ...m, is_read: true } : m));
  return true;
}

// =============================================================================
// 4. DOCUMENTS CENTER (STATEMENTS, TAX FORMS, LEGAL DOCS)
// =============================================================================

export interface DbUserDocument {
  id?: number;
  participant_id: number;
  title: string;
  category: 'statement' | 'tax' | 'disclosure' | 'loan' | 'legal' | 'custom';
  file_name: string;
  file_size: string;
  file_data?: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  is_official: boolean;
  uploaded_by: 'participant' | 'admin';
  admin_notes?: string;
  created_at?: string;
}

export async function uploadUserDocument(
  user: { id?: string | number; accountNumber?: string; email?: string },
  doc: {
    title: string;
    category: 'statement' | 'tax' | 'disclosure' | 'loan' | 'legal' | 'custom';
    file_name: string;
    file_size: string;
    file_data?: string;
    is_official?: boolean;
    uploaded_by?: 'participant' | 'admin';
    status?: 'Approved' | 'Pending' | 'Rejected';
  }
): Promise<DbUserDocument> {
  const pId = await getDbParticipantId(user);

  const newDoc: DbUserDocument = {
    participant_id: sanitizeInteger(pId, 1),
    title: doc.title,
    category: doc.category,
    file_name: doc.file_name,
    file_size: doc.file_size,
    file_data: doc.file_data || '',
    status: doc.status || 'Pending',
    is_official: doc.is_official || false,
    uploaded_by: doc.uploaded_by || 'participant',
    admin_notes: 'Under compliance verification',
    created_at: new Date().toISOString()
  };

  try {
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        participant_id: newDoc.participant_id,
        user_account_number: user.accountNumber || '',
        user_name: user.email || 'Participant',
        document_title: newDoc.title,
        document_type: newDoc.category,
        file_name: newDoc.file_name,
        file_url: newDoc.file_data,
        file_size: newDoc.file_size,
        status: newDoc.status,
        compliance_notes: newDoc.admin_notes
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.document) {
        const cached = safeGetCache<DbUserDocument[]>(CACHE_KEYS.DOCUMENTS, []);
        safeSetCache(CACHE_KEYS.DOCUMENTS, [newDoc, ...cached]);
        return newDoc;
      }
    }
  } catch (e) {
    console.warn('Neon uploadUserDocument error:', e);
  }

  const cached = safeGetCache<DbUserDocument[]>(CACHE_KEYS.DOCUMENTS, []);
  const withId = { ...newDoc, id: Date.now() };
  safeSetCache(CACHE_KEYS.DOCUMENTS, [withId, ...cached]);
  return withId;
}

export async function fetchUserDocuments(
  user: { id?: string | number; accountNumber?: string; email?: string }
): Promise<DbUserDocument[]> {
  const pId = await getDbParticipantId(user);

  try {
    const res = await fetch('/api/documents');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.documents)) {
        const mapped = data.documents.map((d: any) => ({
          id: d.id,
          participant_id: d.participant_id,
          title: d.document_title || 'Document',
          category: d.document_type || 'custom',
          file_name: d.file_name,
          file_size: d.file_size,
          file_data: d.file_url,
          status: d.status,
          is_official: true,
          uploaded_by: 'participant',
          admin_notes: d.compliance_notes,
          created_at: d.created_at
        }));
        safeSetCache(CACHE_KEYS.DOCUMENTS, mapped);
        return mapped.filter((d: any) => d.participant_id === pId);
      }
    }
  } catch (e) {
    console.warn('Neon fetchUserDocuments error:', e);
  }

  const cached = safeGetCache<DbUserDocument[]>(CACHE_KEYS.DOCUMENTS, []);
  return cached.filter(d => d.participant_id === pId);
}

export async function fetchAllDocumentsAdmin(): Promise<DbUserDocument[]> {
  try {
    const res = await fetch('/api/documents');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.documents)) {
        const mapped = data.documents.map((d: any) => ({
          id: d.id,
          participant_id: d.participant_id,
          title: d.document_title || 'Document',
          category: d.document_type || 'custom',
          file_name: d.file_name,
          file_size: d.file_size,
          file_data: d.file_url,
          status: d.status,
          is_official: true,
          uploaded_by: 'participant',
          admin_notes: d.compliance_notes,
          created_at: d.created_at
        }));
        safeSetCache(CACHE_KEYS.DOCUMENTS, mapped);
        return mapped;
      }
    }
  } catch (e) {
    console.warn('Neon fetchAllDocumentsAdmin error:', e);
  }

  return safeGetCache<DbUserDocument[]>(CACHE_KEYS.DOCUMENTS, []);
}

export async function updateDocumentStatus(
  docId: number, 
  status: 'Approved' | 'Pending' | 'Rejected', 
  adminNotes?: string
): Promise<boolean> {
  const cleanId = sanitizeInteger(docId);
  if (isSupabaseConfigured()) {
    try {
      await supabase
        .from('user_documents')
        .update({ status, admin_notes: adminNotes })
        .eq('id', cleanId);
      return true;
    } catch {}
  }

  const cached = safeGetCache<DbUserDocument[]>(CACHE_KEYS.DOCUMENTS, []);
  safeSetCache(CACHE_KEYS.DOCUMENTS, cached.map(d => d.id === cleanId ? { ...d, status, admin_notes: adminNotes } : d));
  return true;
}

// =============================================================================
// 5. KYC IDENTITY DOCUMENTS
// =============================================================================

export interface DbKycDocument {
  id?: number;
  participant_id: number;
  doc_type: string;
  file_name: string;
  file_data?: string;
  file_size?: string;
  doc_number_masked?: string;
  issuing_authority?: string;
  expiration_date?: string;
  status: 'Verified' | 'Pending Review' | 'Action Required';
  admin_notes?: string;
  created_at?: string;
}

export async function submitKycDocument(
  user: { id?: string | number; accountNumber?: string; email?: string },
  kycDoc: {
    doc_type: string;
    file_name: string;
    file_data?: string;
    file_size?: string;
    doc_number_masked?: string;
    issuing_authority?: string;
    expiration_date?: string;
  }
): Promise<boolean> {
  const pId = await getDbParticipantId(user);

  const payload: DbKycDocument = {
    participant_id: sanitizeInteger(pId, 1),
    doc_type: kycDoc.doc_type,
    file_name: kycDoc.file_name,
    file_data: kycDoc.file_data || '',
    file_size: kycDoc.file_size || '1.5 MB',
    doc_number_masked: kycDoc.doc_number_masked || '••••••••',
    issuing_authority: kycDoc.issuing_authority || 'Official Government Authority',
    expiration_date: kycDoc.expiration_date || '2028-12-31',
    status: 'Pending Review',
    admin_notes: 'Document uploaded by participant. Awaiting compliance review.',
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('kyc_documents').insert(payload);
      // Update participant overall status
      await supabase
        .from('participant_accounts')
        .update({ kyc_status: 'Pending Review' })
        .eq('id', pId);

      return true;
    } catch (e) {
      console.warn('Supabase submitKycDocument error:', e);
    }
  }

  return true;
}

export async function fetchKycDocumentsForParticipant(
  user: { id?: string | number; accountNumber?: string; email?: string }
): Promise<DbKycDocument[]> {
  const pId = await getDbParticipantId(user);

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('kyc_documents')
        .select('*')
        .eq('participant_id', pId)
        .order('id', { ascending: false });

      if (!error && data) return data as DbKycDocument[];
    } catch (e) {
      console.warn('Supabase fetchKycDocuments error:', e);
    }
  }

  return [];
}

export async function updateKycStatusAdmin(
  participantId: string | number,
  status: 'Verified (Tier 1 Allocated)' | 'Pending Review' | 'Action Required' | 'Not Verified',
  adminNotes?: string
): Promise<boolean> {
  const pId = sanitizeInteger(participantId);

  if (isSupabaseConfigured()) {
    try {
      await supabase
        .from('participant_accounts')
        .update({ kyc_status: status })
        .eq('id', pId);

      await supabase
        .from('kyc_documents')
        .update({ 
          status: status.startsWith('Verified') ? 'Verified' : status === 'Action Required' ? 'Action Required' : 'Pending Review',
          admin_notes: adminNotes 
        })
        .eq('participant_id', pId);

      return true;
    } catch (e) {
      console.error('Supabase updateKycStatusAdmin error:', e);
    }
  }

  const cached = safeGetCache<UserAccount[]>(CACHE_KEYS.USERS, MOCK_USERS);
  safeSetCache(CACHE_KEYS.USERS, cached.map(u => {
    if (sanitizeInteger(u.id) === pId || u.id === String(participantId)) {
      return {
        ...u,
        kycProfile: {
          ...u.kycProfile,
          overallStatus: status as any
        }
      };
    }
    return u;
  }));
  return true;
}

// =============================================================================
// 6. LOAN APPLICATIONS
// =============================================================================

export interface DbLoanApplication {
  id?: number;
  loan_id: string;
  participant_id: number;
  loan_type: string;
  amount: number;
  term_months: number;
  interest_rate: number;
  monthly_payment: number;
  reason?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Active';
  admin_notes?: string;
  created_at?: string;
}

export async function submitLoanApplication(
  user: { id?: string | number; accountNumber: string; name: string },
  loanData: {
    loan_type: string;
    amount: number;
    term_months: number;
    interest_rate?: number;
    monthly_payment: number;
    reason?: string;
  }
): Promise<{ success: boolean; loanId: string }> {
  const pId = await getDbParticipantId(user);
  const loanId = `LN-${Math.floor(100000 + Math.random() * 900000)}`;

  const newLoan: DbLoanApplication = {
    loan_id: loanId,
    participant_id: sanitizeInteger(pId, 1),
    loan_type: loanData.loan_type,
    amount: sanitizeNumeric(loanData.amount),
    term_months: sanitizeInteger(loanData.term_months, 36),
    interest_rate: sanitizeNumeric(loanData.interest_rate || 4.75),
    monthly_payment: sanitizeNumeric(loanData.monthly_payment),
    reason: loanData.reason || 'General Purpose Borrowing',
    status: 'Pending',
    admin_notes: 'Under review by loan board',
    created_at: new Date().toISOString()
  };

  try {
    const res = await fetch('/api/loans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        loan_number: loanId,
        participant_id: newLoan.participant_id,
        user_account_number: user.accountNumber,
        user_name: user.name,
        loan_type: newLoan.loan_type,
        requested_amount: newLoan.amount,
        term_months: newLoan.term_months,
        interest_rate: newLoan.interest_rate,
        monthly_payment: newLoan.monthly_payment,
        collateral_asset: 'Segregated LBMA Gold Sovereign Bar',
        status: 'Pending Review',
        purpose: newLoan.reason
      })
    });
    if (res.ok) {
      const cached = safeGetCache<DbLoanApplication[]>(CACHE_KEYS.LOANS, []);
      safeSetCache(CACHE_KEYS.LOANS, [newLoan, ...cached]);
      return { success: true, loanId };
    }
  } catch (e) {
    console.warn('Neon submitLoanApplication error:', e);
  }

  const cached = safeGetCache<DbLoanApplication[]>(CACHE_KEYS.LOANS, []);
  safeSetCache(CACHE_KEYS.LOANS, [newLoan, ...cached]);
  return { success: true, loanId };
}

export async function fetchLoanApplicationsAdmin(): Promise<DbLoanApplication[]> {
  try {
    const res = await fetch('/api/loans');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.loans)) {
        const mapped = data.loans.map((l: any) => ({
          id: l.id,
          loan_id: l.loan_number || `LN-${l.id}`,
          participant_id: l.participant_id,
          loan_type: l.loan_type,
          amount: Number(l.requested_amount),
          term_months: l.term_months,
          interest_rate: Number(l.interest_rate),
          monthly_payment: Number(l.monthly_payment),
          reason: l.purpose,
          status: l.status,
          admin_notes: l.purpose,
          created_at: l.created_at
        }));
        safeSetCache(CACHE_KEYS.LOANS, mapped);
        return mapped;
      }
    }
  } catch (e) {
    console.warn('Neon fetchLoanApplicationsAdmin error:', e);
  }

  return safeGetCache<DbLoanApplication[]>(CACHE_KEYS.LOANS, []);
}

export async function updateLoanStatus(
  loanId: number | string,
  status: 'Approved' | 'Rejected' | 'Active',
  adminNotes?: string
): Promise<boolean> {
  try {
    await fetch(`/api/loans/${loanId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
  } catch (e) {
    console.warn('Neon updateLoanStatus exception:', e);
  }

  const cached = safeGetCache<DbLoanApplication[]>(CACHE_KEYS.LOANS, []);
  safeSetCache(CACHE_KEYS.LOANS, cached.map(l => (l.id === loanId || l.loan_id === loanId) ? { ...l, status, admin_notes: adminNotes } : l));
  return true;
}

// =============================================================================
// 7. WITHDRAWAL REQUESTS
// =============================================================================

export interface DbWithdrawalRequest {
  id?: number;
  request_id: string;
  participant_id: number;
  withdrawal_type: string;
  amount: number;
  reason?: string;
  disbursement_method: string;
  bank_name?: string;
  routing_number?: string;
  account_number_last4?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  admin_notes?: string;
  created_at?: string;
}

export async function submitWithdrawalRequest(
  user: { id?: string | number; accountNumber: string; name: string },
  wdlData: {
    withdrawal_type: string;
    amount: number;
    reason?: string;
    disbursement_method?: string;
    bank_name?: string;
    routing_number?: string;
    account_number_last4?: string;
  }
): Promise<{ success: boolean; requestId: string }> {
  const pId = await getDbParticipantId(user);
  const requestId = `WDL-${Math.floor(100000 + Math.random() * 900000)}`;

  const newWdl: DbWithdrawalRequest = {
    request_id: requestId,
    participant_id: sanitizeInteger(pId, 1),
    withdrawal_type: wdlData.withdrawal_type,
    amount: sanitizeNumeric(wdlData.amount),
    reason: wdlData.reason || 'Depository In-Service Distribution',
    disbursement_method: wdlData.disbursement_method || 'Direct Deposit (ACH)',
    bank_name: wdlData.bank_name || 'Verified Banking Depository',
    routing_number: wdlData.routing_number || '••••••',
    account_number_last4: wdlData.account_number_last4 || '••••',
    status: 'Pending',
    admin_notes: 'Awaiting Super Admin depository wire release',
    created_at: new Date().toISOString()
  };

  try {
    const res = await fetch('/api/withdrawals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        request_number: requestId,
        participant_id: newWdl.participant_id,
        user_account_number: user.accountNumber,
        user_name: user.name,
        withdrawal_type: newWdl.withdrawal_type,
        amount: newWdl.amount,
        delivery_option: newWdl.disbursement_method,
        destination_address: `${newWdl.bank_name} - Routing: ${newWdl.routing_number}`,
        bank_details: `Acct Last 4: ${newWdl.account_number_last4}`,
        status: 'Pending Review',
        reason: newWdl.reason,
        admin_notes: newWdl.admin_notes
      })
    });
    if (res.ok) {
      const cached = safeGetCache<DbWithdrawalRequest[]>(CACHE_KEYS.WITHDRAWALS, []);
      safeSetCache(CACHE_KEYS.WITHDRAWALS, [newWdl, ...cached]);
      return { success: true, requestId };
    }
  } catch (e) {
    console.warn('Neon submitWithdrawalRequest error:', e);
  }

  const cached = safeGetCache<DbWithdrawalRequest[]>(CACHE_KEYS.WITHDRAWALS, []);
  safeSetCache(CACHE_KEYS.WITHDRAWALS, [newWdl, ...cached]);
  return { success: true, requestId };
}

export async function fetchWithdrawalsAdmin(): Promise<DbWithdrawalRequest[]> {
  try {
    const res = await fetch('/api/withdrawals');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.withdrawals)) {
        const mapped = data.withdrawals.map((w: any) => ({
          id: w.id,
          request_id: w.request_number || `WDL-${w.id}`,
          participant_id: w.participant_id,
          withdrawal_type: w.withdrawal_type,
          amount: Number(w.amount),
          reason: w.reason,
          disbursement_method: w.delivery_option,
          bank_name: w.destination_address,
          status: w.status,
          admin_notes: w.admin_notes,
          created_at: w.created_at
        }));
        safeSetCache(CACHE_KEYS.WITHDRAWALS, mapped);
        return mapped;
      }
    }
  } catch (e) {
    console.warn('Neon fetchWithdrawalsAdmin error:', e);
  }

  return safeGetCache<DbWithdrawalRequest[]>(CACHE_KEYS.WITHDRAWALS, []);
}

export async function updateWithdrawalStatus(
  requestId: number | string,
  status: 'Approved' | 'Rejected',
  adminNotes?: string
): Promise<boolean> {
  try {
    await fetch(`/api/withdrawals/${requestId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminNotes })
    });
  } catch (e) {
    console.warn('Neon updateWithdrawalStatus exception:', e);
  }

  const cached = safeGetCache<DbWithdrawalRequest[]>(CACHE_KEYS.WITHDRAWALS, []);
  safeSetCache(CACHE_KEYS.WITHDRAWALS, cached.map(w => (w.id === requestId || w.request_id === requestId) ? { ...w, status, admin_notes: adminNotes } : w));
  return true;
}

// =============================================================================
// 8. SITE BRANDING (ADMIN CONTROL OVER SITE IDENTITY)
// =============================================================================

export async function fetchSiteBranding(): Promise<SiteBrandingSettings> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('site_branding')
        .select('*')
        .order('id', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        const loaded: SiteBrandingSettings = {
          siteName: data.site_name || DEFAULT_SITE_BRANDING.siteName,
          siteSubtitle: data.site_subtitle || DEFAULT_SITE_BRANDING.siteSubtitle,
          siteDomain: data.site_domain || DEFAULT_SITE_BRANDING.siteDomain,
          logoUrl: data.logo_url || DEFAULT_SITE_BRANDING.logoUrl,
          sealText: data.seal_text || DEFAULT_SITE_BRANDING.sealText,
          supportPhone: data.support_phone || DEFAULT_SITE_BRANDING.supportPhone,
          supportEmail: data.support_email || DEFAULT_SITE_BRANDING.supportEmail,
        };
        safeSetCache(CACHE_KEYS.BRANDING, loaded);
        return loaded;
      }
    } catch (e) {
      console.warn('Supabase fetchSiteBranding error:', e);
    }
  }

  return safeGetCache<SiteBrandingSettings>(CACHE_KEYS.BRANDING, DEFAULT_SITE_BRANDING);
}

export async function saveSiteBranding(settings: SiteBrandingSettings): Promise<boolean> {
  safeSetCache(CACHE_KEYS.BRANDING, settings);

  if (isSupabaseConfigured()) {
    try {
      const payload = {
        id: 1,
        site_name: settings.siteName,
        site_subtitle: settings.siteSubtitle,
        site_domain: settings.siteDomain,
        logo_url: settings.logoUrl,
        seal_text: settings.sealText,
        support_phone: settings.supportPhone,
        support_email: settings.supportEmail,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('site_branding')
        .upsert(payload, { onConflict: 'id' });

      if (!error) return true;
      console.error('Supabase saveSiteBranding error:', error);
    } catch (e) {
      console.error('Supabase saveSiteBranding exception:', e);
    }
  }

  return true;
}

// =============================================================================
// 9. FUND PRICES & PAYMENT METHODS
// =============================================================================

export async function fetchFundPrices(): Promise<TSPFund[]> {
  try {
    const res = await fetch('/api/funds');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.funds)) {
        const merged = TSP_FUNDS.map(fund => {
          const matched = data.funds.find((f: any) => f.fund_code === fund.code || f.code === fund.code);
          if (matched) {
            return {
              ...fund,
              currentSharePrice: Number(matched.current_share_price),
              ytdReturn: Number(matched.ytd_return ?? fund.ytdReturn)
            };
          }
          return fund;
        });
        safeSetCache(CACHE_KEYS.FUNDS, merged);
        return merged;
      }
    }
  } catch (e) {
    console.warn('Neon fetchFundPrices error:', e);
  }

  return safeGetCache<TSPFund[]>(CACHE_KEYS.FUNDS, TSP_FUNDS);
}

export async function saveFundPrice(fundCode: string, newPrice: number): Promise<boolean> {
  try {
    await fetch('/api/funds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fundCode, sharePrice: sanitizeNumeric(newPrice) })
    });
  } catch (e) {
    console.warn('Neon saveFundPrice error:', e);
  }

  const cached = safeGetCache<TSPFund[]>(CACHE_KEYS.FUNDS, TSP_FUNDS);
  safeSetCache(CACHE_KEYS.FUNDS, cached.map(f => f.code === fundCode ? { ...f, currentSharePrice: newPrice } : f));
  return true;
}

export async function fetchPaymentMethods(): Promise<PaymentMethodConfig[]> {
  try {
    const res = await fetch('/api/payment-methods');
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.methods) && json.methods.length > 0) {
        const mapped: PaymentMethodConfig[] = json.methods.map((d: any) => ({
          id: d.id,
          name: d.name,
          category: d.category,
          isEnabled: Boolean(d.is_active ?? d.is_enabled ?? true),
          badgeText: d.badge_text || '',
          bankName: d.bank_name || '',
          accountHolderName: d.account_holder || d.account_holder_name || '',
          accountNumber: d.account_number || '',
          routingNumber: d.routing_number || '',
          swiftBic: d.swift_bic || '',
          bankAddress: d.bank_address || '',
          coinSymbol: d.symbol || d.coin_symbol || '',
          network: d.network || '',
          walletAddress: d.wallet_address || '',
          memoOrTag: d.memo_tag || d.memo_or_tag || '',
          payPalEmail: d.paypal_email || '',
          cashAppTag: d.cashapp_tag || '',
          zelleIdentifier: d.zelle_identifier || '',
          recipientName: d.recipient_name || '',
          instructions: d.instructions || '',
          minDepositUsd: Number(d.min_deposit ?? d.min_deposit_usd ?? 5000),
          maxDepositUsd: Number(d.max_deposit ?? d.max_deposit_usd ?? 300000),
          processingTime: d.processing_time || '1 - 3 Business Days',
          createdAt: d.created_at || new Date().toISOString()
        }));
        safeSetCache(CACHE_KEYS.PAYMENTS, mapped);
        return mapped;
      }
    }
  } catch (e) {
    console.warn('Neon fetchPaymentMethods error:', e);
  }

  return safeGetCache<PaymentMethodConfig[]>(CACHE_KEYS.PAYMENTS, DEFAULT_PAYMENT_METHODS);
}

export async function savePaymentMethod(method: PaymentMethodConfig): Promise<boolean> {
  try {
    await fetch('/api/payment-methods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: method.id,
        name: method.name,
        category: method.category,
        symbol: method.coinSymbol,
        network: method.network,
        wallet_address: method.walletAddress,
        memo_tag: method.memoOrTag,
        bank_name: method.bankName,
        account_holder: method.accountHolderName,
        routing_number: method.routingNumber,
        account_number: method.accountNumber,
        swift_bic: method.swiftBic,
        instructions: method.instructions,
        min_deposit: method.minDepositUsd,
        max_deposit: method.maxDepositUsd,
        is_active: method.isEnabled
      })
    });
  } catch (e) {
    console.warn('Neon savePaymentMethod error:', e);
  }

  const cached = safeGetCache<PaymentMethodConfig[]>(CACHE_KEYS.PAYMENTS, DEFAULT_PAYMENT_METHODS);
  const exists = cached.some(m => m.id === method.id);
  const updated = exists ? cached.map(m => m.id === method.id ? method : m) : [...cached, method];
  safeSetCache(CACHE_KEYS.PAYMENTS, updated);
  return true;
}
