// =============================================================================
// CASSIVON CAPITAL SAVINGS PLAN (CCSP) - NEON POSTGRESQL DATABASE SERVICE (dbService.ts)
// =============================================================================
// Primary client interface for Neon PostgreSQL database operations.
// =============================================================================

import { 
  sanitizeInteger, 
  sanitizeNumeric,
  isInvalidNumber,
  sanitizeParticipantAccountData
} from '../lib/supabase';
import { 
  UserAccount, 
  SiteBrandingSettings, 
  TSPFund, 
  PaymentMethodConfig 
} from '../types';
import { MOCK_USERS, DEFAULT_SITE_BRANDING, TSP_FUNDS, DEFAULT_PAYMENT_METHODS } from '../data/mockData';

// Storage cache keys for graceful offline fallback or local sync
const CACHE_KEYS = {
  USERS: 'ccsp_users_registry',
  BRANDING: 'ccsp_branding_settings',
  FUNDS: 'ccsp_managed_funds',
  PAYMENTS: 'ccsp_payment_methods',
  DOCUMENTS: 'ccsp_user_documents',
  MESSAGES: 'ccsp_messages_mailbox',
  DEPOSITS: 'ccsp_deposits_list',
  LOANS: 'ccsp_loan_applications',
  WITHDRAWALS: 'ccsp_withdrawals_list',
  KYC: 'ccsp_kyc_documents'
};

function safeGetCache<T>(key: string, fallback: T): T {
  try {
    if (typeof window === 'undefined') return fallback;
    const item = localStorage.getItem(key) || localStorage.getItem(key.replace('ccsp_', 'vbsp_'));
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

  // Extract digits from id if format is usr_01 or similar
  if (typeof user.id === 'string') {
    const digits = user.id.replace(/\D/g, '');
    if (digits.length > 0) {
      const parsedDigits = parseInt(digits, 10);
      if (!isNaN(parsedDigits) && parsedDigits > 0) return parsedDigits;
    }
  }

  // Look up participant ID by email or account number in cached/remote participants
  try {
    const cached = safeGetCache<UserAccount[]>(CACHE_KEYS.USERS, []);
    const found = cached.find(u => 
      (user.accountNumber && u.accountNumber === user.accountNumber) ||
      (user.email && u.email?.toLowerCase() === user.email?.toLowerCase())
    );
    if (found?.id) {
      const p = sanitizeInteger(found.id, 0);
      if (p > 0) return p;
    }
  } catch {}

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
    console.warn('REST /api/participants fetch failed, using cache:', e);
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
  const integerId = sanitizeInteger(participantId);

  // Explicit validation using Number.isNaN() and isNaN() checks before sending to DB
  const cleanTotal = (isNaN(balances.totalBalance) || Number.isNaN(balances.totalBalance))
    ? 0.0 : sanitizeNumeric(balances.totalBalance, 0.0);
  const cleanTrad = (isNaN(balances.traditionalBalance) || Number.isNaN(balances.traditionalBalance))
    ? 0.0 : sanitizeNumeric(balances.traditionalBalance, 0.0);
  const cleanRoth = (isNaN(balances.rothBalance) || Number.isNaN(balances.rothBalance))
    ? 0.0 : sanitizeNumeric(balances.rothBalance, 0.0);
  const cleanGold = balances.goldOunces !== undefined
    ? ((isNaN(balances.goldOunces) || Number.isNaN(balances.goldOunces)) ? 0.0 : sanitizeNumeric(balances.goldOunces, 0.0))
    : undefined;
  const cleanSilver = balances.silverOunces !== undefined
    ? ((isNaN(balances.silverOunces) || Number.isNaN(balances.silverOunces)) ? 0.0 : sanitizeNumeric(balances.silverOunces, 0.0))
    : undefined;

  const sanitizedBalances = {
    totalBalance: cleanTotal,
    traditionalBalance: cleanTrad,
    rothBalance: cleanRoth,
    ...(cleanGold !== undefined ? { goldOunces: cleanGold } : {}),
    ...(cleanSilver !== undefined ? { silverOunces: cleanSilver } : {})
  };

  try {
    const res = await fetch(`/api/participants/${participantId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitizedBalances)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.user) {
        const cached = safeGetCache<UserAccount[]>(CACHE_KEYS.USERS, MOCK_USERS);
        const updated = cached.map(u => (u.id === String(participantId) || sanitizeInteger(u.id) === integerId) ? data.user : u);
        safeSetCache(CACHE_KEYS.USERS, updated);
        return true;
      }
    }
  } catch (e) {
    console.warn('Balance update failed via REST:', e);
  }

  // Local cache update
  const cachedUsers = safeGetCache<UserAccount[]>(CACHE_KEYS.USERS, MOCK_USERS);
  const updated = cachedUsers.map(u => {
    if (sanitizeInteger(u.id) === integerId || u.id === String(participantId)) {
      return {
        ...u,
        totalBalance: cleanTotal,
        traditionalBalance: cleanTrad,
        rothBalance: cleanRoth,
        goldOuncesEquivalent: cleanGold ?? u.goldOuncesEquivalent,
        silverOuncesEquivalent: cleanSilver ?? u.silverOuncesEquivalent
      };
    }
    return u;
  });
  safeSetCache(CACHE_KEYS.USERS, updated);
  return true;
}

export async function upsertParticipantAccount(user: UserAccount): Promise<UserAccount> {
  // Explicitly validate all numeric values with Number.isNaN() and isNaN() before DB transit
  const sanitizedUser = sanitizeParticipantAccountData(user);

  try {
    const res = await fetch('/api/participants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitizedUser)
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.user) {
        sanitizedUser.id = String(json.user.id || sanitizedUser.id);
      }
    }
  } catch (e) {
    console.warn('Upsert participant account exception:', e);
  }

  // Local cache sync
  const cached = safeGetCache<UserAccount[]>(CACHE_KEYS.USERS, MOCK_USERS);
  const exists = cached.findIndex(u => u.accountNumber === sanitizedUser.accountNumber || u.id === sanitizedUser.id);
  let updatedList: UserAccount[];
  if (exists >= 0) {
    updatedList = cached.map((u, i) => i === exists ? sanitizedUser : u);
  } else {
    updatedList = [sanitizedUser, ...cached];
  }
  safeSetCache(CACHE_KEYS.USERS, updatedList);
  return sanitizedUser;
}

export async function deleteParticipantAccount(participantId: string | number): Promise<boolean> {
  try {
    await fetch(`/api/participants/${participantId}`, { method: 'DELETE' });
  } catch (e) {
    console.warn('Delete participant account exception:', e);
  }

  const integerId = sanitizeInteger(participantId);
  const cached = safeGetCache<UserAccount[]>(CACHE_KEYS.USERS, MOCK_USERS);
  const filtered = cached.filter(u => sanitizeInteger(u.id) !== integerId && u.id !== String(participantId));
  safeSetCache(CACHE_KEYS.USERS, filtered);
  return true;
}

// =============================================================================
// 2. DEPOSITS & PAYMENT PROOFS
// =============================================================================

export interface DepositProofRecord {
  id?: number;
  tx_id?: string;
  reference_id?: string;
  participant_id: number;
  account_number?: string;
  user_account_number?: string;
  participant_name?: string;
  user_name?: string;
  amount: number;
  fund_code?: string;
  target_fund_code?: string;
  payment_method_id?: string;
  payment_method_name?: string;
  payment_reference?: string;
  transaction_hash?: string;
  sender_identifier?: string;
  proof_file_name?: string;
  receipt_image_url?: string;
  status: string;
  admin_notes?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DepositProofInput {
  amount: number;
  fundCode?: string;
  fund_code?: string;
  paymentMethodId?: string;
  payment_method_id?: string;
  paymentMethodName?: string;
  payment_method_name?: string;
  paymentReference?: string;
  payment_reference?: string;
  transactionHash?: string;
  transaction_hash?: string;
  senderIdentifier?: string;
  sender_identifier?: string;
  proofFileName?: string;
  proof_file_name?: string;
  proofFileData?: string;
  proof_file_data?: string;
  receiptImageUrl?: string;
  receipt_image_url?: string;
  notes?: string;
  txId?: string;
  tx_id?: string;
}

export async function submitDepositProof(
  user: { id?: string | number; accountNumber?: string; name?: string; email?: string },
  depositData: DepositProofInput
): Promise<{ success: boolean; txId: string; deposit?: DepositProofRecord }> {
  // Explicit validation using Number.isNaN() and isNaN() checks before sending deposit amount to DB
  const rawAmount = Number(depositData.amount);
  if (isNaN(rawAmount) || Number.isNaN(rawAmount) || !isFinite(rawAmount) || rawAmount <= 0) {
    throw new Error(`Invalid deposit amount "${depositData.amount}". Amount must be a positive numeric value.`);
  }

  const pId = await getDbParticipantId(user);
  const txId = depositData.txId || depositData.tx_id || `DEP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const sanitizedAmount = sanitizeNumeric(rawAmount, 0.0);
  const sanitizedParticipantId = sanitizeInteger(pId, 1);

  const payload = {
    reference_id: txId,
    tx_id: txId,
    participant_id: sanitizedParticipantId,
    user_account_number: user.accountNumber || 'CCSP-0089-4412-98',
    account_number: user.accountNumber || 'CCSP-0089-4412-98',
    user_name: user.name || 'Allocated Vault Participant',
    participant_name: user.name || 'Allocated Vault Participant',
    amount: sanitizedAmount,
    target_fund_code: depositData.fundCode || depositData.fund_code || 'G',
    fund_code: depositData.fundCode || depositData.fund_code || 'G',
    payment_method_id: depositData.paymentMethodId || depositData.payment_method_id || '',
    payment_method_name: depositData.paymentMethodName || depositData.payment_method_name || '',
    payment_reference: depositData.paymentReference || depositData.payment_reference || depositData.transactionHash || depositData.transaction_hash || '',
    transaction_hash: depositData.transactionHash || depositData.transaction_hash || depositData.paymentReference || '',
    proof_file_name: depositData.proofFileName || depositData.proof_file_name || 'transfer_receipt.png',
    receipt_image_url: depositData.receiptImageUrl || depositData.receipt_image_url || depositData.proofFileData || depositData.proof_file_data || '',
    status: 'Pending Review',
    notes: depositData.notes || 'Institutional bullion wire confirmation submitted.',
    admin_notes: depositData.notes || 'Institutional bullion wire confirmation submitted.'
  };

  try {
    const res = await fetch('/api/deposits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.deposit) {
        const cached = safeGetCache<DepositProofRecord[]>(CACHE_KEYS.DEPOSITS, []);
        safeSetCache(CACHE_KEYS.DEPOSITS, [data.deposit, ...cached]);
        return { success: true, txId, deposit: data.deposit };
      }
    }
  } catch (e) {
    console.warn('REST submitDepositProof exception:', e);
  }

  // Fallback cache
  const cached = safeGetCache<DepositProofRecord[]>(CACHE_KEYS.DEPOSITS, []);
  const localRecord: DepositProofRecord = {
    id: Date.now(),
    ...payload,
    created_at: new Date().toISOString()
  };
  safeSetCache(CACHE_KEYS.DEPOSITS, [localRecord, ...cached]);

  return { success: true, txId, deposit: localRecord };
}

export async function fetchDeposits(participantId?: number | string): Promise<DepositProofRecord[]> {
  try {
    const res = await fetch('/api/deposits');
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.deposits)) {
        safeSetCache(CACHE_KEYS.DEPOSITS, json.deposits);
        if (participantId) {
          const cleanId = sanitizeInteger(participantId);
          return json.deposits.filter((d: any) => sanitizeInteger(d.participant_id) === cleanId);
        }
        return json.deposits;
      }
    }
  } catch (e) {
    console.warn('fetchDeposits exception:', e);
  }

  const cached = safeGetCache<DepositProofRecord[]>(CACHE_KEYS.DEPOSITS, []);
  if (participantId) {
    const cleanId = sanitizeInteger(participantId);
    return cached.filter(d => sanitizeInteger(d.participant_id) === cleanId);
  }
  return cached;
}

export async function updateDepositStatus(
  depositId: number | string,
  status: 'Pending Review' | 'Verified & Credited' | 'Rejected' | 'Approved' | 'VAULT_CONFIRMED',
  adminNotes?: string
): Promise<boolean> {
  try {
    const res = await fetch(`/api/deposits/${depositId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminNotes })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        const cached = safeGetCache<DepositProofRecord[]>(CACHE_KEYS.DEPOSITS, []);
        const updated = cached.map(d => {
          if (d.id === Number(depositId) || d.tx_id === String(depositId) || d.reference_id === String(depositId)) {
            return { ...d, status, notes: adminNotes, admin_notes: adminNotes };
          }
          return d;
        });
        safeSetCache(CACHE_KEYS.DEPOSITS, updated);
        return true;
      }
    }
  } catch (e) {
    console.warn('updateDepositStatus exception:', e);
  }

  const cached = safeGetCache<DepositProofRecord[]>(CACHE_KEYS.DEPOSITS, []);
  const updated = cached.map(d => {
    if (d.id === Number(depositId) || d.tx_id === String(depositId) || d.reference_id === String(depositId)) {
      return { ...d, status, notes: adminNotes, admin_notes: adminNotes };
    }
    return d;
  });
  safeSetCache(CACHE_KEYS.DEPOSITS, updated);
  return true;
}

// =============================================================================
// 3. MESSAGING & AUDIT MAILBOX
// =============================================================================

export interface DbMessage {
  id?: number;
  participant_id: number;
  recipient_user_id?: string;
  sender_type?: 'participant' | 'admin' | 'system';
  senderType?: 'participant' | 'admin' | 'system';
  sender_name?: string;
  senderName?: string;
  sender_email?: string;
  senderEmail?: string;
  recipient_email?: string;
  recipientEmail?: string;
  subject: string;
  body: string;
  category?: string;
  is_read?: boolean;
  isRead?: boolean;
  is_starred?: boolean;
  created_at?: string;
}

export interface SendLiveMessageInput {
  senderType?: 'participant' | 'admin' | 'system';
  sender_type?: 'participant' | 'admin' | 'system';
  recipientUserId?: string;
  recipient_user_id?: string;
  senderName?: string;
  sender_name?: string;
  senderEmail?: string;
  sender_email?: string;
  recipientEmail?: string;
  recipient_email?: string;
  subject: string;
  body: string;
  category?: string;
}

export async function sendLiveMessage(
  user: { id?: string | number; accountNumber?: string; name?: string; email?: string },
  messageData: SendLiveMessageInput
): Promise<DbMessage> {
  const pId = await getDbParticipantId(user);

  const payload: DbMessage = {
    participant_id: sanitizeInteger(pId, 1),
    recipient_user_id: messageData.recipientUserId || messageData.recipient_user_id || '',
    sender_type: messageData.senderType || messageData.sender_type || 'participant',
    sender_name: messageData.senderName || messageData.sender_name || user.name || 'Authorized Member',
    sender_email: messageData.senderEmail || messageData.sender_email || user.email || 'participant@cassivon.com',
    recipient_email: messageData.recipientEmail || messageData.recipient_email || 'custody@cassivon.com',
    subject: messageData.subject,
    body: messageData.body,
    category: messageData.category || 'official',
    is_read: false,
    created_at: new Date().toISOString()
  };

  try {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
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
    console.warn('REST sendLiveMessage exception:', e);
  }

  const localMsg: DbMessage = { id: Date.now(), ...payload };
  const cached = safeGetCache<DbMessage[]>(CACHE_KEYS.MESSAGES, []);
  safeSetCache(CACHE_KEYS.MESSAGES, [localMsg, ...cached]);
  return localMsg;
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
        const userMsgs = data.messages.filter((m: any) => 
          sanitizeInteger(m.participant_id) === pId ||
          m.recipient_user_id === String(pId) ||
          m.recipient_user_id === user.accountNumber
        );
        return userMsgs;
      }
    }
  } catch (e) {
    console.warn('fetchMessagesForParticipant exception:', e);
  }

  const cached = safeGetCache<DbMessage[]>(CACHE_KEYS.MESSAGES, []);
  return cached.filter(m => sanitizeInteger(m.participant_id) === pId);
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
    console.warn('fetchAllMessagesAdmin exception:', e);
  }

  return safeGetCache<DbMessage[]>(CACHE_KEYS.MESSAGES, []);
}

export async function markMessageAsRead(messageId: number): Promise<boolean> {
  const cleanId = sanitizeInteger(messageId);
  try {
    await fetch(`/api/messages/${cleanId}/read`, { method: 'PUT' });
  } catch (e) {
    console.warn('markMessageAsRead exception:', e);
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
  doc_id?: string;
  participant_id: number;
  user_account_number?: string;
  user_name?: string;
  document_title?: string;
  title?: string;
  document_type?: string;
  category?: string;
  file_name: string;
  file_size?: string;
  file_url?: string;
  file_data?: string;
  status?: string;
  compliance_notes?: string;
  admin_notes?: string;
  is_official?: boolean;
  uploaded_by?: string;
  created_at?: string;
}

export interface UploadUserDocumentInput {
  title?: string;
  document_title?: string;
  category?: string;
  document_type?: string;
  fileName?: string;
  file_name?: string;
  fileSize?: string;
  file_size?: string;
  fileData?: string;
  file_data?: string;
  fileUrl?: string;
  file_url?: string;
  isOfficial?: boolean;
  is_official?: boolean;
  uploadedBy?: 'participant' | 'admin';
  uploaded_by?: 'participant' | 'admin';
  status?: string;
  adminNotes?: string;
  compliance_notes?: string;
}

export async function uploadUserDocument(
  user: { id?: string | number; accountNumber?: string; name?: string; email?: string },
  docData: UploadUserDocumentInput
): Promise<DbUserDocument> {
  const pId = await getDbParticipantId(user);
  const docId = `DOC-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

  const fileName = docData.fileName || docData.file_name || 'document.pdf';
  const title = docData.title || docData.document_title || fileName;
  const category = docData.category || docData.document_type || 'legal';

  const payload: DbUserDocument = {
    doc_id: docId,
    participant_id: sanitizeInteger(pId, 1),
    user_account_number: user.accountNumber || '',
    user_name: user.name || '',
    document_title: title,
    title: title,
    document_type: category,
    category: category,
    file_name: fileName,
    file_size: docData.fileSize || docData.file_size || '1.2 MB',
    file_url: docData.fileUrl || docData.file_url || docData.fileData || docData.file_data || '',
    status: docData.status || 'Pending',
    compliance_notes: docData.adminNotes || docData.compliance_notes || '',
    admin_notes: docData.adminNotes || docData.compliance_notes || '',
    is_official: docData.isOfficial ?? docData.is_official ?? false,
    uploaded_by: docData.uploadedBy || docData.uploaded_by || 'participant',
    created_at: new Date().toISOString()
  };

  try {
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.document) {
        const cached = safeGetCache<DbUserDocument[]>(CACHE_KEYS.DOCUMENTS, []);
        safeSetCache(CACHE_KEYS.DOCUMENTS, [data.document, ...cached]);
        return data.document;
      }
    }
  } catch (e) {
    console.warn('REST uploadUserDocument exception:', e);
  }

  const localDoc: DbUserDocument = { id: Date.now(), ...payload };
  const cached = safeGetCache<DbUserDocument[]>(CACHE_KEYS.DOCUMENTS, []);
  safeSetCache(CACHE_KEYS.DOCUMENTS, [localDoc, ...cached]);
  return localDoc;
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
        return data.documents.filter((d: any) => sanitizeInteger(d.participant_id) === pId);
      }
    }
  } catch (e) {
    console.warn('fetchUserDocuments exception:', e);
  }

  const cached = safeGetCache<DbUserDocument[]>(CACHE_KEYS.DOCUMENTS, []);
  return cached.filter(d => sanitizeInteger(d.participant_id) === pId);
}

export async function fetchAllDocumentsAdmin(): Promise<DbUserDocument[]> {
  try {
    const res = await fetch('/api/documents');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.documents)) {
        safeSetCache(CACHE_KEYS.DOCUMENTS, data.documents);
        return data.documents;
      }
    }
  } catch (e) {
    console.warn('fetchAllDocumentsAdmin exception:', e);
  }

  return safeGetCache<DbUserDocument[]>(CACHE_KEYS.DOCUMENTS, []);
}

export async function updateDocumentStatus(
  docId: number | string, 
  status: 'Approved' | 'Pending' | 'Rejected' | 'Verified', 
  adminNotes?: string
): Promise<boolean> {
  const cleanId = sanitizeInteger(docId);
  const cached = safeGetCache<DbUserDocument[]>(CACHE_KEYS.DOCUMENTS, []);
  safeSetCache(CACHE_KEYS.DOCUMENTS, cached.map(d => 
    (d.id === cleanId || d.doc_id === String(docId)) 
      ? { ...d, status, compliance_notes: adminNotes, admin_notes: adminNotes } 
      : d
  ));
  return true;
}

// =============================================================================
// 5. KYC IDENTITY DOCUMENTS
// =============================================================================

export interface DbKycDocument {
  id?: number;
  participant_id: number;
  doc_type: string;
  document_type?: string;
  file_name: string;
  file_data?: string;
  file_size?: string;
  doc_number_masked?: string;
  issuing_authority?: string;
  expiration_date?: string;
  status: 'Verified' | 'Pending Review' | 'Action Required';
  admin_notes?: string;
  created_at?: string;
  uploaded_at?: string;
}

export async function submitKycDocument(
  user: { id?: string | number; accountNumber?: string; email?: string },
  kycDoc: {
    doc_type?: string;
    documentType?: string;
    file_name?: string;
    fileName?: string;
    file_data?: string;
    fileData?: string;
    file_size?: string;
    doc_number_masked?: string;
    issuing_authority?: string;
    expiration_date?: string;
  }
): Promise<boolean> {
  const pId = await getDbParticipantId(user);

  const payload = {
    participantId: sanitizeInteger(pId, 1),
    documentType: kycDoc.doc_type || kycDoc.documentType || 'ssn_card',
    fileName: kycDoc.file_name || kycDoc.fileName || 'id_document.pdf',
    fileData: kycDoc.file_data || kycDoc.fileData || ''
  };

  try {
    const res = await fetch('/api/kyc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.document) {
        const cached = safeGetCache<DbKycDocument[]>(CACHE_KEYS.KYC, []);
        safeSetCache(CACHE_KEYS.KYC, [data.document, ...cached]);
        return true;
      }
    }
  } catch (e) {
    console.warn('REST submitKycDocument error:', e);
  }

  const cached = safeGetCache<DbKycDocument[]>(CACHE_KEYS.KYC, []);
  const localDoc: DbKycDocument = {
    id: Date.now(),
    participant_id: sanitizeInteger(pId, 1),
    doc_type: payload.documentType,
    document_type: payload.documentType,
    file_name: payload.fileName,
    status: 'Pending Review',
    created_at: new Date().toISOString()
  };
  safeSetCache(CACHE_KEYS.KYC, [localDoc, ...cached]);
  return true;
}

export async function fetchKycDocumentsForParticipant(
  user: { id?: string | number; accountNumber?: string; email?: string }
): Promise<DbKycDocument[]> {
  const pId = await getDbParticipantId(user);

  try {
    const res = await fetch(`/api/kyc?participantId=${pId}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.documents)) {
        return data.documents;
      }
    }
  } catch (e) {
    console.warn('fetchKycDocuments error:', e);
  }

  const cached = safeGetCache<DbKycDocument[]>(CACHE_KEYS.KYC, []);
  return cached.filter(k => sanitizeInteger(k.participant_id) === pId);
}

export async function updateKycStatusAdmin(
  participantId: string | number,
  status: 'Verified (Tier 1 Allocated)' | 'Pending Review' | 'Action Required' | 'Not Verified',
  adminNotes?: string
): Promise<boolean> {
  const pId = sanitizeInteger(participantId);

  try {
    await fetch('/api/kyc', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documentId: pId,
        status: status.startsWith('Verified') ? 'Verified' : status === 'Action Required' ? 'Action Required' : 'Pending Review',
        adminNotes
      })
    });
  } catch (e) {
    console.warn('updateKycStatusAdmin error:', e);
  }

  const cached = safeGetCache<UserAccount[]>(CACHE_KEYS.USERS, MOCK_USERS);
  safeSetCache(CACHE_KEYS.USERS, cached.map(u => {
    if (sanitizeInteger(u.id) === pId) {
      return {
        ...u,
        kycProfile: {
          ...u.kycProfile,
          overallStatus: status,
          riskTier: u.kycProfile?.riskTier || 'Tier 1 Individual',
          ssnMasked: u.kycProfile?.ssnMasked || '***-**-4412',
          additionalDocuments: u.kycProfile?.additionalDocuments || []
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
  loan_number?: string;
  loan_id?: string;
  participant_id: number;
  user_account_number?: string;
  user_name?: string;
  loan_type: string;
  requested_amount?: number;
  amount?: number;
  term_months: number;
  interest_rate: number;
  monthly_payment: number;
  collateral_asset?: string;
  status: string;
  purpose?: string;
  reason?: string;
  admin_notes?: string;
  created_at?: string;
}

export interface SubmitLoanInput {
  loanType?: string;
  loan_type?: string;
  amount: number;
  termMonths?: number;
  term_months?: number;
  interestRate?: number;
  interest_rate?: number;
  monthlyPayment?: number;
  monthly_payment?: number;
  purpose?: string;
  reason?: string;
  collateralAsset?: string;
  collateral_asset?: string;
}

export async function submitLoanApplication(
  user: { id?: string | number; accountNumber?: string; name?: string; email?: string },
  loanData: SubmitLoanInput
): Promise<{ success: boolean; loanNumber: string }> {
  // Explicit validation using Number.isNaN() and isNaN() checks
  const rawAmount = Number(loanData.amount);
  const cleanAmount = (isNaN(rawAmount) || Number.isNaN(rawAmount) || !isFinite(rawAmount) || rawAmount <= 0)
    ? 5000.0 : sanitizeNumeric(rawAmount, 5000.0);

  const rawTerm = Number(loanData.termMonths || loanData.term_months);
  const cleanTerm = (isNaN(rawTerm) || Number.isNaN(rawTerm)) ? 36 : sanitizeInteger(rawTerm, 36);

  const rawRate = Number(loanData.interestRate || loanData.interest_rate);
  const cleanRate = (isNaN(rawRate) || Number.isNaN(rawRate)) ? 4.25 : sanitizeNumeric(rawRate, 4.25);

  const rawPayment = Number(loanData.monthlyPayment || loanData.monthly_payment);
  const cleanPayment = (isNaN(rawPayment) || Number.isNaN(rawPayment)) ? 0.0 : sanitizeNumeric(rawPayment, 0.0);

  const pId = await getDbParticipantId(user);
  const loanNumber = `LN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const loanType = loanData.loanType || loanData.loan_type || 'General Purpose Bullion Loan';
  const reason = loanData.purpose || loanData.reason || 'Institutional Bullion Backed Liquidity Facility';

  const payload = {
    loan_number: loanNumber,
    loan_id: loanNumber,
    participant_id: sanitizeInteger(pId, 1),
    user_account_number: user.accountNumber || '',
    user_name: user.name || '',
    loan_type: loanType,
    requested_amount: cleanAmount,
    amount: cleanAmount,
    term_months: cleanTerm,
    interest_rate: cleanRate,
    monthly_payment: cleanPayment,
    collateral_asset: loanData.collateralAsset || loanData.collateral_asset || 'Segregated LBMA Gold Sovereign Bar',
    status: 'Pending Review',
    purpose: reason,
    reason: reason
  };

  try {
    const res = await fetch('/api/loans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.loan) {
        const cached = safeGetCache<DbLoanApplication[]>(CACHE_KEYS.LOANS, []);
        safeSetCache(CACHE_KEYS.LOANS, [data.loan, ...cached]);
        return { success: true, loanNumber };
      }
    }
  } catch (e) {
    console.warn('REST submitLoanApplication error:', e);
  }

  const cached = safeGetCache<DbLoanApplication[]>(CACHE_KEYS.LOANS, []);
  safeSetCache(CACHE_KEYS.LOANS, [{ id: Date.now(), ...payload, created_at: new Date().toISOString() }, ...cached]);
  return { success: true, loanNumber };
}

export async function fetchLoanApplicationsAdmin(): Promise<DbLoanApplication[]> {
  try {
    const res = await fetch('/api/loans');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.loans)) {
        safeSetCache(CACHE_KEYS.LOANS, data.loans);
        return data.loans;
      }
    }
  } catch (e) {
    console.warn('fetchLoanApplicationsAdmin error:', e);
  }

  return safeGetCache<DbLoanApplication[]>(CACHE_KEYS.LOANS, []);
}

export async function updateLoanStatus(
  loanId: number | string,
  status: 'Pending' | 'Approved' | 'Rejected' | 'Active' | 'Pending Review' | string,
  adminNotes?: string
): Promise<boolean> {
  try {
    await fetch(`/api/loans/${loanId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminNotes })
    });
  } catch (e) {
    console.warn('updateLoanStatus error:', e);
  }

  const cached = safeGetCache<DbLoanApplication[]>(CACHE_KEYS.LOANS, []);
  safeSetCache(CACHE_KEYS.LOANS, cached.map(l => 
    (l.id === Number(loanId) || l.loan_number === String(loanId) || l.loan_id === String(loanId)) 
      ? { ...l, status, admin_notes: adminNotes || l.admin_notes } 
      : l
  ));
  return true;
}

// =============================================================================
// 7. WITHDRAWAL REQUESTS
// =============================================================================

export interface DbWithdrawalRequest {
  id?: number;
  request_number?: string;
  request_id?: string;
  participant_id: number;
  user_account_number?: string;
  user_name?: string;
  withdrawal_type: string;
  amount: number;
  delivery_option?: string;
  disbursement_method?: string;
  destination_address?: string;
  bank_name?: string;
  bank_details?: string;
  status: string;
  reason?: string;
  admin_notes?: string;
  created_at?: string;
}

export interface SubmitWithdrawalInput {
  withdrawalType?: string;
  withdrawal_type?: string;
  amount: number;
  deliveryOption?: string;
  delivery_option?: string;
  disbursementMethod?: string;
  disbursement_method?: string;
  destinationAddress?: string;
  destination_address?: string;
  bankName?: string;
  bank_name?: string;
  bankDetails?: string;
  bank_details?: string;
  reason?: string;
}

export async function submitWithdrawalRequest(
  user: { id?: string | number; accountNumber?: string; name?: string; email?: string },
  requestData: SubmitWithdrawalInput
): Promise<{ success: boolean; requestNumber: string }> {
  // Explicit validation using Number.isNaN() and isNaN() checks
  const rawAmount = Number(requestData.amount);
  const cleanAmount = (isNaN(rawAmount) || Number.isNaN(rawAmount) || !isFinite(rawAmount) || rawAmount <= 0)
    ? 0.0 : sanitizeNumeric(rawAmount, 0.0);

  const pId = await getDbParticipantId(user);
  const requestNumber = `WDL-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const withdrawalType = requestData.withdrawalType || requestData.withdrawal_type || 'In-Service Bullion Distribution';
  const deliveryOption = requestData.deliveryOption || requestData.delivery_option || requestData.disbursementMethod || requestData.disbursement_method || 'Insured Armored Courier Delivery';
  const destinationAddress = requestData.destinationAddress || requestData.destination_address || '';
  const bankDetails = requestData.bankDetails || requestData.bank_details || requestData.bankName || requestData.bank_name || '';

  const payload = {
    request_number: requestNumber,
    request_id: requestNumber,
    participant_id: sanitizeInteger(pId, 1),
    user_account_number: user.accountNumber || '',
    user_name: user.name || '',
    withdrawal_type: withdrawalType,
    amount: cleanAmount,
    delivery_option: deliveryOption,
    disbursement_method: deliveryOption,
    destination_address: destinationAddress,
    bank_name: requestData.bankName || requestData.bank_name || '',
    bank_details: bankDetails,
    status: 'Pending Review',
    reason: requestData.reason || 'Sovereign Physical Distribution',
    admin_notes: 'Member submitted physical distribution order. Pending vault custodian approval.'
  };

  try {
    const res = await fetch('/api/withdrawals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.withdrawal) {
        const cached = safeGetCache<DbWithdrawalRequest[]>(CACHE_KEYS.WITHDRAWALS, []);
        safeSetCache(CACHE_KEYS.WITHDRAWALS, [data.withdrawal, ...cached]);
        return { success: true, requestNumber };
      }
    }
  } catch (e) {
    console.warn('REST submitWithdrawalRequest error:', e);
  }

  const cached = safeGetCache<DbWithdrawalRequest[]>(CACHE_KEYS.WITHDRAWALS, []);
  safeSetCache(CACHE_KEYS.WITHDRAWALS, [{ id: Date.now(), ...payload, created_at: new Date().toISOString() }, ...cached]);
  return { success: true, requestNumber };
}

export async function fetchWithdrawalsAdmin(): Promise<DbWithdrawalRequest[]> {
  try {
    const res = await fetch('/api/withdrawals');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.withdrawals)) {
        safeSetCache(CACHE_KEYS.WITHDRAWALS, data.withdrawals);
        return data.withdrawals;
      }
    }
  } catch (e) {
    console.warn('fetchWithdrawalsAdmin error:', e);
  }

  return safeGetCache<DbWithdrawalRequest[]>(CACHE_KEYS.WITHDRAWALS, []);
}

export async function updateWithdrawalStatus(
  requestId: number | string,
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed' | 'Pending Review' | string,
  adminNotes?: string
): Promise<boolean> {
  try {
    await fetch(`/api/withdrawals/${requestId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminNotes })
    });
  } catch (e) {
    console.warn('updateWithdrawalStatus error:', e);
  }

  const cached = safeGetCache<DbWithdrawalRequest[]>(CACHE_KEYS.WITHDRAWALS, []);
  safeSetCache(CACHE_KEYS.WITHDRAWALS, cached.map(w => 
    (w.id === Number(requestId) || w.request_number === String(requestId) || w.request_id === String(requestId)) 
      ? { ...w, status, admin_notes: adminNotes || w.admin_notes } 
      : w
  ));
  return true;
}

// =============================================================================
// 8. SITE BRANDING (ADMIN CONTROL OVER SITE IDENTITY)
// =============================================================================

export async function fetchSiteBranding(): Promise<SiteBrandingSettings> {
  try {
    const res = await fetch('/api/branding');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.branding) {
        safeSetCache(CACHE_KEYS.BRANDING, data.branding);
        return data.branding;
      }
    }
  } catch (e) {
    console.warn('fetchSiteBranding error:', e);
  }

  return safeGetCache<SiteBrandingSettings>(CACHE_KEYS.BRANDING, DEFAULT_SITE_BRANDING);
}

export async function saveSiteBranding(settings: SiteBrandingSettings): Promise<boolean> {
  safeSetCache(CACHE_KEYS.BRANDING, settings);

  try {
    const res = await fetch('/api/branding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) return true;
    }
  } catch (e) {
    console.warn('saveSiteBranding error:', e);
  }

  return true;
}

// =============================================================================
// 9. FUND PRICES (ADMIN EDITING OF BULLION FUND METRICS)
// =============================================================================

export async function fetchFundPrices(): Promise<TSPFund[]> {
  try {
    const res = await fetch('/api/funds');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.funds) && data.funds.length > 0) {
        const mapped: TSPFund[] = data.funds.map((row: any) => ({
          code: row.fund_code || row.code,
          name: row.fund_name || row.name,
          category: row.category || 'Allocated Sovereign Bullion',
          riskLevel: 'Moderate Sovereign',
          currentSharePrice: Number(row.current_share_price),
          ytdReturn: Number(row.ytd_return || 22.8),
          dailyChange: Number(row.daily_change || 0.0),
          dailyChangePercent: Number(row.daily_change || 0.0),
          metalPurity: row.metal_purity || 'LBMA 999.9 Fine',
          vaultDepositaryLocation: row.vault_location || 'Zurich FreePort / Delaware Depository'
        }));
        safeSetCache(CACHE_KEYS.FUNDS, mapped);
        return mapped;
      }
    }
  } catch (e) {
    console.warn('fetchFundPrices error:', e);
  }

  return safeGetCache<TSPFund[]>(CACHE_KEYS.FUNDS, TSP_FUNDS);
}

export async function saveFundPrice(fundCode: string, newPrice: number): Promise<boolean> {
  const rawPrice = Number(newPrice);
  const cleanPrice = (isNaN(rawPrice) || Number.isNaN(rawPrice) || !isFinite(rawPrice))
    ? 10.0 : sanitizeNumeric(rawPrice, 10.0);

  const currentFunds = safeGetCache<TSPFund[]>(CACHE_KEYS.FUNDS, TSP_FUNDS);
  const updatedFunds = currentFunds.map(f => f.code === fundCode ? { ...f, currentSharePrice: cleanPrice } : f);
  safeSetCache(CACHE_KEYS.FUNDS, updatedFunds);

  try {
    await fetch('/api/funds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fundCode, sharePrice: cleanPrice })
    });
  } catch (e) {
    console.warn('saveFundPrice error:', e);
  }

  return true;
}

// =============================================================================
// 10. PAYMENT METHODS (ADMIN CONTROL OVER PAYMENT GATEWAYS)
// =============================================================================

export async function fetchPaymentMethods(): Promise<PaymentMethodConfig[]> {
  try {
    const res = await fetch('/api/payment-methods');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.methods) && data.methods.length > 0) {
        const mapped: PaymentMethodConfig[] = data.methods.map((row: any) => ({
          id: row.id,
          category: row.category as any,
          name: row.name,
          symbol: row.symbol || undefined,
          network: row.network || undefined,
          walletAddress: row.wallet_address || undefined,
          memoTag: row.memo_tag || undefined,
          bankName: row.bank_name || undefined,
          accountHolder: row.account_holder || undefined,
          routingNumber: row.routing_number || undefined,
          accountNumber: row.account_number || undefined,
          swiftBic: row.swift_bic || undefined,
          handle: row.handle || undefined,
          qrImageUrl: row.qr_image_url || undefined,
          instructions: row.instructions || '',
          minDeposit: (isNaN(Number(row.min_deposit)) || Number.isNaN(Number(row.min_deposit))) ? 5000 : Number(row.min_deposit),
          maxDeposit: (isNaN(Number(row.max_deposit)) || Number.isNaN(Number(row.max_deposit))) ? 300000 : Number(row.max_deposit),
          isActive: Boolean(row.is_active !== false)
        }));
        safeSetCache(CACHE_KEYS.PAYMENTS, mapped);
        return mapped;
      }
    }
  } catch (e) {
    console.warn('fetchPaymentMethods error:', e);
  }

  return safeGetCache<PaymentMethodConfig[]>(CACHE_KEYS.PAYMENTS, DEFAULT_PAYMENT_METHODS);
}

export async function savePaymentMethod(method: PaymentMethodConfig): Promise<boolean> {
  // Validate min and max deposit bounds with isNaN() and Number.isNaN()
  const rawMin = Number(method.minDepositUsd ?? (method as any).minDeposit);
  const cleanMin = (isNaN(rawMin) || Number.isNaN(rawMin) || !isFinite(rawMin)) ? 5000 : sanitizeNumeric(rawMin, 5000);

  const rawMax = Number(method.maxDepositUsd ?? (method as any).maxDeposit);
  const cleanMax = (isNaN(rawMax) || Number.isNaN(rawMax) || !isFinite(rawMax)) ? 300000 : sanitizeNumeric(rawMax, 300000);

  const sanitizedMethod: PaymentMethodConfig = {
    ...method,
    minDepositUsd: cleanMin,
    maxDepositUsd: cleanMax,
    ...((method as any).minDeposit !== undefined ? { minDeposit: cleanMin } : {}),
    ...((method as any).maxDeposit !== undefined ? { maxDeposit: cleanMax } : {})
  } as any;

  const currentMethods = safeGetCache<PaymentMethodConfig[]>(CACHE_KEYS.PAYMENTS, DEFAULT_PAYMENT_METHODS);
  const exists = currentMethods.findIndex(m => m.id === sanitizedMethod.id);
  let updatedList: PaymentMethodConfig[];
  if (exists >= 0) {
    updatedList = currentMethods.map((m, i) => i === exists ? sanitizedMethod : m);
  } else {
    updatedList = [...currentMethods, sanitizedMethod];
  }
  safeSetCache(CACHE_KEYS.PAYMENTS, updatedList);

  try {
    await fetch('/api/payment-methods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitizedMethod)
    });
  } catch (e) {
    console.warn('savePaymentMethod error:', e);
  }

  return true;
}

// =============================================================================
// 9. AUDIT LOGS (NEON POSTGRESQL + LOCAL SYNC)
// =============================================================================

export interface LiveAuditLogRecord {
  id: string;
  dbId?: number;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
  ipAddress: string;
  status: 'Success' | 'Flagged' | 'Blocked';
  targetAccount?: string;
  previousState?: string;
  newState?: string;
}

export async function fetchAuditLogs(): Promise<LiveAuditLogRecord[]> {
  try {
    const res = await fetch('/api/audit-logs');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.auditLogs)) {
        return data.auditLogs;
      }
    }
  } catch (e) {
    console.warn('fetchAuditLogs error:', e);
  }
  return [];
}

export async function recordAuditLog(log: {
  action: string;
  details: string;
  actor?: string;
  ipAddress?: string;
  status?: 'Success' | 'Flagged' | 'Blocked';
  targetAccount?: string;
  previousState?: string;
  newState?: string;
}): Promise<boolean> {
  try {
    const res = await fetch('/api/audit-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: log.action,
        details: log.details,
        actor: log.actor || 'Super Administrator (Compliance Officer)',
        ipAddress: log.ipAddress || '10.240.1.18 (CCSP-HQ-VPC)',
        status: log.status || 'Success',
        targetAccount: log.targetAccount || '',
        previousState: log.previousState || '',
        newState: log.newState || ''
      })
    });
    if (res.ok) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('ccsp_db_sync', { detail: { type: 'audit' } }));
        window.dispatchEvent(new CustomEvent('vbsp_db_sync', { detail: { type: 'audit' } }));
      }
      return true;
    }
  } catch (e) {
    console.warn('recordAuditLog error:', e);
  }
  return false;
}

// =============================================================================
// 10. PARTICIPANT LOAN & WITHDRAWAL HELPERS
// =============================================================================

export async function fetchUserLoans(participantId?: string | number, accountNumber?: string): Promise<DbLoanApplication[]> {
  const allLoans = await fetchLoanApplicationsAdmin();
  if (!participantId && !accountNumber) return allLoans;
  return allLoans.filter(l => 
    (participantId && (String(l.participant_id) === String(participantId) || String(l.id) === String(participantId))) ||
    (accountNumber && l.user_account_number && l.user_account_number.toLowerCase() === accountNumber.toLowerCase())
  );
}

export async function fetchUserWithdrawals(participantId?: string | number, accountNumber?: string): Promise<DbWithdrawalRequest[]> {
  const allWdls = await fetchWithdrawalsAdmin();
  if (!participantId && !accountNumber) return allWdls;
  return allWdls.filter(w => 
    (participantId && (String(w.participant_id) === String(participantId) || String(w.id) === String(participantId))) ||
    (accountNumber && w.user_account_number && w.user_account_number.toLowerCase() === accountNumber.toLowerCase())
  );
}
