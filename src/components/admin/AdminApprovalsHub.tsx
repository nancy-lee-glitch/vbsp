import React, { useState, useEffect } from 'react';
import { 
  FileCheck, 
  DollarSign, 
  FileText, 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Download, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  Search, 
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Layers,
  Building,
  User,
  X
} from 'lucide-react';
import { UserAccount } from '../../types';
import { 
  fetchDeposits, 
  updateDepositStatus, 
  DepositProofRecord,
  fetchAllDocumentsAdmin,
  updateDocumentStatus,
  DbUserDocument,
  fetchLoanApplicationsAdmin,
  updateLoanStatus,
  DbLoanApplication,
  fetchWithdrawalsAdmin,
  updateWithdrawalStatus,
  DbWithdrawalRequest,
  updateParticipantBalances,
  fetchAllKycDocumentsAdmin,
  updateKycDocumentStatus,
  DbKycDocument
} from '../../services/dbService';

interface AdminApprovalsHubProps {
  users: UserAccount[];
  onRefreshUsers?: () => void;
}

type SubTab = 'deposits' | 'documents' | 'kyc' | 'loans' | 'withdrawals';

export const AdminApprovalsHub: React.FC<AdminApprovalsHubProps> = ({ users, onRefreshUsers }) => {
  const [subTab, setSubTab] = useState<SubTab>('deposits');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string>('');

  // Data states
  const [deposits, setDeposits] = useState<DepositProofRecord[]>([]);
  const [documents, setDocuments] = useState<DbUserDocument[]>([]);
  const [kycDocs, setKycDocs] = useState<DbKycDocument[]>([]);
  const [loans, setLoans] = useState<DbLoanApplication[]>([]);
  const [withdrawals, setWithdrawals] = useState<DbWithdrawalRequest[]>([]);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Proof Modal
  const [viewingProof, setViewingProof] = useState<{
    title: string;
    fileName: string;
    fileData?: string;
    participant: string;
    details: string;
  } | null>(null);

  const loadAllData = async () => {
    try {
      const [depList, docList, kycList, loanList, wdlList] = await Promise.all([
        fetchDeposits(),
        fetchAllDocumentsAdmin(),
        fetchAllKycDocumentsAdmin(),
        fetchLoanApplicationsAdmin(),
        fetchWithdrawalsAdmin()
      ]);
      setDeposits(depList || []);
      setDocuments(docList || []);
      setKycDocs(kycList || []);
      setLoans(loanList || []);
      setWithdrawals(wdlList || []);
    } catch (e) {
      console.warn('Error loading approvals data:', e);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    loadAllData().finally(() => setIsLoading(false));
    const interval = setInterval(loadAllData, 5000);
    return () => clearInterval(interval);
  }, []);

  const showNotification = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(''), 5000);
  };

  // --- Handlers ---
  const handleApproveDeposit = async (dep: DepositProofRecord) => {
    if (!dep.id && !dep.reference_id) return;
    setIsLoading(true);
    await updateDepositStatus(dep.id || dep.reference_id, 'Approved', 'Approved by Executive Admin. Vault depository custody confirmed.');
    
    // Also update in-memory participant balances if matching
    const matchedUser = users.find(u => u.accountNumber === dep.account_number || u.accountNumber === dep.user_account_number);
    if (matchedUser) {
      const newTotal = matchedUser.totalBalance + dep.amount;
      const newTrad = matchedUser.traditionalBalance + dep.amount;
      await updateParticipantBalances(matchedUser.id, {
        totalBalance: newTotal,
        traditionalBalance: newTrad,
        rothBalance: matchedUser.rothBalance
      });
      if (onRefreshUsers) onRefreshUsers();
    }

    showNotification(`Deposit ${dep.tx_id || dep.reference_id} ($${dep.amount.toLocaleString()}) approved and credited to ${dep.participant_name || 'Participant'}!`);
    await loadAllData();
    setIsLoading(false);
  };

  const handleRejectDeposit = async (dep: DepositProofRecord) => {
    if (!dep.id && !dep.reference_id) return;
    setIsLoading(true);
    await updateDepositStatus(dep.id || dep.reference_id, 'Rejected', 'Unverified remittance trace or receipt mismatch');
    showNotification(`Deposit ${dep.tx_id || dep.reference_id} marked as Rejected.`);
    await loadAllData();
    setIsLoading(false);
  };

  const handleApproveDoc = async (doc: DbUserDocument) => {
    if (!doc.id && !doc.doc_id) return;
    setIsLoading(true);
    await updateDocumentStatus(doc.id || doc.doc_id, 'Approved', 'Verified and cleared by Compliance Auditor');
    showNotification(`Document "${doc.title || doc.file_name}" marked as Approved.`);
    await loadAllData();
    setIsLoading(false);
  };

  const handleRejectDoc = async (doc: DbUserDocument) => {
    if (!doc.id && !doc.doc_id) return;
    setIsLoading(true);
    await updateDocumentStatus(doc.id || doc.doc_id, 'Rejected', 'Legibility issue or incomplete certification');
    showNotification(`Document marked as Rejected.`);
    await loadAllData();
    setIsLoading(false);
  };

  const handleApproveKycDoc = async (doc: DbKycDocument) => {
    if (!doc.id) return;
    setIsLoading(true);
    await updateKycDocumentStatus(doc.id, 'Verified', 'Verified by Compliance Auditor');
    showNotification(`KYC Document "${doc.document_type || doc.file_name}" verified & approved! Participant account status updated.`);
    if (onRefreshUsers) onRefreshUsers();
    await loadAllData();
    setIsLoading(false);
  };

  const handleRejectKycDoc = async (doc: DbKycDocument) => {
    if (!doc.id) return;
    setIsLoading(true);
    await updateKycDocumentStatus(doc.id, 'Rejected', 'Document unreadable, expired, or invalid');
    showNotification(`KYC Document marked as Rejected.`);
    if (onRefreshUsers) onRefreshUsers();
    await loadAllData();
    setIsLoading(false);
  };

  const handleApproveLoan = async (loan: DbLoanApplication) => {
    const loanKey = loan.id || (loan as any).loan_number || loan.loan_id;
    if (!loanKey) return;
    const rawAmt = Number(loan.amount);
    const safeAmt = (isNaN(rawAmt) || Number.isNaN(rawAmt)) ? 0 : rawAmt;
    setIsLoading(true);
    await updateLoanStatus(loanKey, 'Approved', 'Board approval granted. Disbursed via payroll custodial authorization.');
    showNotification(`Loan ${loan.loan_id || (loan as any).loan_number || loanKey} ($${safeAmt.toLocaleString('en-US', { minimumFractionDigits: 2 })}) Approved by Admin!`);
    await loadAllData();
    setIsLoading(false);
  };

  const handleRejectLoan = async (loan: DbLoanApplication) => {
    const loanKey = loan.id || (loan as any).loan_number || loan.loan_id;
    if (!loanKey) return;
    setIsLoading(true);
    await updateLoanStatus(loanKey, 'Rejected', 'Collateral tier ceiling exceeded or pending credit verification');
    showNotification(`Loan ${loan.loan_id || (loan as any).loan_number || loanKey} marked as Rejected.`);
    await loadAllData();
    setIsLoading(false);
  };

  const handleApproveWithdrawal = async (wdl: DbWithdrawalRequest) => {
    const wdlKey = wdl.id || (wdl as any).request_number || wdl.request_id;
    if (!wdlKey) return;
    const rawAmt = Number(wdl.amount);
    const safeAmt = (isNaN(rawAmt) || Number.isNaN(rawAmt)) ? 0 : rawAmt;
    setIsLoading(true);
    await updateWithdrawalStatus(wdlKey, 'Approved', 'Authorized for custodial bank wire distribution.');
    showNotification(`Withdrawal ${wdl.request_id || (wdl as any).request_number || wdlKey} ($${safeAmt.toLocaleString('en-US', { minimumFractionDigits: 2 })}) Approved by Admin!`);
    if (onRefreshUsers) onRefreshUsers();
    await loadAllData();
    setIsLoading(false);
  };

  const handleRejectWithdrawal = async (wdl: DbWithdrawalRequest) => {
    const wdlKey = wdl.id || (wdl as any).request_number || wdl.request_id;
    if (!wdlKey) return;
    setIsLoading(true);
    await updateWithdrawalStatus(wdlKey, 'Rejected', 'Statutory hardship criteria not established or IRS documentation missing');
    showNotification(`Withdrawal ${wdl.request_id || (wdl as any).request_number || wdlKey} marked as Rejected.`);
    await loadAllData();
    setIsLoading(false);
  };

  // Counts for pending badges
  const pendingDepositsCount = deposits.filter(d => d.status === 'Pending' || d.status === 'Pending Review').length;
  const pendingDocsCount = documents.filter(d => d.status === 'Pending' || d.status === 'Pending Review').length;
  const pendingKycCount = kycDocs.filter(k => k.status === 'Pending Review' || k.status === 'Pending').length;
  const pendingLoansCount = loans.filter(l => l.status === 'Pending' || l.status === 'Pending Review' || l.status === 'Processing').length;
  const pendingWdlCount = withdrawals.filter(w => w.status === 'Pending' || w.status === 'Pending Review').length;

  return (
    <div className="space-y-6" id="admin-approvals-hub">
      {/* Header */}
      <div className="bg-white border border-slate-300 rounded-sm p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-black text-[#112e51] flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-[#005ea2]" />
              <span>Depository Approvals & Compliance Hub</span>
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Verify real-time bullion deposits, inspect payment proof receipts, audit legal documentation, and review participant loan & withdrawal requests.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadAllData}
              disabled={isLoading}
              className="px-3.5 py-1.5 bg-[#112e51] hover:bg-[#002f5a] text-white text-xs font-bold rounded-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Queue</span>
            </button>
          </div>
        </div>

        {actionSuccessMsg && (
          <div className="mt-4 p-4 bg-emerald-50 border-l-4 border-emerald-600 rounded-xs text-xs text-emerald-950 font-bold flex items-center gap-2 shadow-2xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* Sub-Tabs */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pt-1">
          <button
            onClick={() => setSubTab('deposits')}
            className={`px-3 py-2 text-xs font-bold rounded-xs border transition-colors flex items-center gap-2 cursor-pointer ${
              subTab === 'deposits' 
                ? 'bg-[#112e51] text-white border-[#112e51]' 
                : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <DollarSign className="w-4 h-4 text-[#f2a900]" />
            <span>1. Deposits & Payment Proofs</span>
            {pendingDepositsCount > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-600 text-white text-[10px] rounded-full font-mono">
                {pendingDepositsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setSubTab('documents')}
            className={`px-3 py-2 text-xs font-bold rounded-xs border transition-colors flex items-center gap-2 cursor-pointer ${
              subTab === 'documents' 
                ? 'bg-[#112e51] text-white border-[#112e51]' 
                : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-400" />
            <span>2. Documents Center Verification</span>
            {pendingDocsCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-600 text-white text-[10px] rounded-full font-mono">
                {pendingDocsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setSubTab('kyc')}
            className={`px-3 py-2 text-xs font-bold rounded-xs border transition-colors flex items-center gap-2 cursor-pointer ${
              subTab === 'kyc' 
                ? 'bg-[#112e51] text-white border-[#112e51]' 
                : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>3. KYC & ID Verifications</span>
            {pendingKycCount > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-600 text-white text-[10px] rounded-full font-mono">
                {pendingKycCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setSubTab('loans')}
            className={`px-3 py-2 text-xs font-bold rounded-xs border transition-colors flex items-center gap-2 cursor-pointer ${
              subTab === 'loans' 
                ? 'bg-[#112e51] text-white border-[#112e51]' 
                : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-4 h-4 text-indigo-400" />
            <span>4. Loan Applications</span>
            {pendingLoansCount > 0 && (
              <span className="px-1.5 py-0.2 bg-purple-600 text-white text-[10px] rounded-full font-mono">
                {pendingLoansCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setSubTab('withdrawals')}
            className={`px-3 py-2 text-xs font-bold rounded-xs border transition-colors flex items-center gap-2 cursor-pointer ${
              subTab === 'withdrawals' 
                ? 'bg-[#112e51] text-white border-[#112e51]' 
                : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <Building className="w-4 h-4 text-emerald-400" />
            <span>5. In-Service Withdrawals</span>
            {pendingWdlCount > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-600 text-white text-[10px] rounded-full font-mono">
                {pendingWdlCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 1. DEPOSITS & PAYMENT PROOFS QUEUE */}
      {/* --------------------------------------------------------------------- */}
      {subTab === 'deposits' && (
        <div className="bg-white border border-slate-300 rounded-sm p-6 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#112e51] flex items-center gap-2">
                <span>Bullion Remittances & Deposit Queue</span>
                <span className="text-xs font-normal text-slate-500">({deposits.length} Records)</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Review payment hashes, wire trace IDs, and receipts. Approving will automatically credit the participant's bullion portfolio.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#112e51] text-white">
                  <th className="p-3">Tx ID / Date</th>
                  <th className="p-3">Participant</th>
                  <th className="p-3">Channel / Reference</th>
                  <th className="p-3">Amount & Fund</th>
                  <th className="p-3">Payment Proof</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Compliance Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {deposits.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 italic">
                      No deposit records submitted yet. When a participant deposits via any payment channel, it will appear here with proof receipt.
                    </td>
                  </tr>
                ) : (
                  deposits.map((dep, idx) => (
                    <tr key={dep.id || idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-900">
                        <div>{dep.tx_id}</div>
                        <div className="text-[10px] text-slate-500 font-sans">{dep.created_at ? new Date(dep.created_at).toLocaleDateString() : 'Today'}</div>
                      </td>

                      <td className="p-3">
                        <strong className="text-slate-900 block">{dep.participant_name}</strong>
                        <span className="text-[11px] font-mono text-slate-500">{dep.account_number}</span>
                      </td>

                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-900 font-bold rounded-2xs text-[10px] border border-blue-200">
                          {dep.payment_method_name || 'Standard Remittance'}
                        </span>
                        <div className="text-[11px] font-mono text-slate-700 mt-1 truncate max-w-[180px]">
                          Ref: {dep.payment_reference || 'Direct'}
                        </div>
                      </td>

                      <td className="p-3">
                        <strong className="text-emerald-700 font-mono text-sm block">
                          ${dep.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </strong>
                        <span className="text-[10px] text-slate-500">
                          Allocated to {dep.fund_code}-Fund
                        </span>
                      </td>

                      <td className="p-3">
                        {dep.proof_file_name || dep.proof_file_data ? (
                          <button
                            onClick={() => setViewingProof({
                              title: `Payment Proof: ${dep.tx_id}`,
                              fileName: dep.proof_file_name || 'Receipt.pdf',
                              fileData: dep.proof_file_data,
                              participant: `${dep.participant_name} (${dep.account_number})`,
                              details: `Amount: $${dep.amount.toLocaleString()} USD | Ref: ${dep.payment_reference || 'N/A'}`
                            })}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xs text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3 h-3 text-amber-700" />
                            <span>View Proof</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">No receipt file</span>
                        )}
                      </td>

                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-2xs text-[10px] font-bold ${
                          dep.status === 'Approved' ? 'bg-emerald-100 text-emerald-900' :
                          dep.status === 'Rejected' ? 'bg-rose-100 text-rose-900' :
                          'bg-amber-100 text-amber-900'
                        }`}>
                          {dep.status}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        {dep.status === 'Pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleApproveDeposit(dep)}
                              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xs text-[11px] flex items-center gap-1 cursor-pointer shadow-2xs"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleRejectDeposit(dep)}
                              className="px-2.5 py-1 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xs text-[11px] flex items-center gap-1 cursor-pointer"
                            >
                              <XCircle className="w-3 h-3" />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">Decided</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 2. DOCUMENTS CENTER VERIFICATION */}
      {/* --------------------------------------------------------------------- */}
      {subTab === 'documents' && (
        <div className="bg-white border border-slate-300 rounded-sm p-6 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#112e51] flex items-center gap-2">
                <span>Submitted User Documents & Legal Forms</span>
                <span className="text-xs font-normal text-slate-500">({documents.length} Records)</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Audited certificates, court orders, IRS 1099-R forms, and proof of address submitted by sovereign participants.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#112e51] text-white">
                  <th className="p-3">Doc ID</th>
                  <th className="p-3">Document Title & File</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Participant ID</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 italic">
                      No documents uploaded yet. Documents submitted in the participant Documents Center will appear here.
                    </td>
                  </tr>
                ) : (
                  documents.map((doc, idx) => (
                    <tr key={doc.id || idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-800">
                        #{doc.id || idx + 1}
                      </td>

                      <td className="p-3">
                        <strong className="text-slate-900 block">{doc.title || doc.file_name}</strong>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-500">{doc.file_name} ({doc.file_size})</span>
                          {doc.file_data && (
                            <button
                              onClick={() => setViewingProof({
                                title: doc.title,
                                fileName: doc.file_name,
                                fileData: doc.file_data,
                                participant: `Participant #${doc.participant_id}`,
                                details: `Category: ${doc.category} | Uploaded by: ${doc.uploaded_by}`
                              })}
                              className="text-blue-700 hover:underline text-[10px] flex items-center gap-0.5 cursor-pointer"
                            >
                              <Eye className="w-2.5 h-2.5" /> View
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-800 font-bold rounded-2xs text-[10px] uppercase">
                          {doc.category}
                        </span>
                      </td>

                      <td className="p-3 font-mono text-slate-700">
                        ID: {doc.participant_id}
                      </td>

                      <td className="p-3 text-[11px] text-slate-500">
                        {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'Recent'}
                      </td>

                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-2xs text-[10px] font-bold ${
                          doc.status === 'Approved' ? 'bg-emerald-100 text-emerald-900' :
                          doc.status === 'Rejected' ? 'bg-rose-100 text-rose-900' :
                          'bg-amber-100 text-amber-900'
                        }`}>
                          {doc.status}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        {doc.status === 'Pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleApproveDoc(doc)}
                              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xs text-[11px] flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleRejectDoc(doc)}
                              className="px-2.5 py-1 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xs text-[11px] flex items-center gap-1 cursor-pointer"
                            >
                              <XCircle className="w-3 h-3" />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">Audited</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 3. KYC & ID VERIFICATIONS */}
      {/* --------------------------------------------------------------------- */}
      {subTab === 'kyc' && (
        <div className="bg-white border border-slate-300 rounded-sm overflow-hidden shadow-2xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-black text-[#112e51] text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Participant Identification & KYC Documents</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Audit uploaded Government IDs, Social Security Cards, Driver Licenses, and Passports. Approving will officially verify the participant's account status.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-600">
              Total Submissions: {kycDocs.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#112e51] text-white">
                  <th className="p-3">Doc ID</th>
                  <th className="p-3">Participant</th>
                  <th className="p-3">Document Type</th>
                  <th className="p-3">File Attachment</th>
                  <th className="p-3">Uploaded Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {kycDocs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 italic">
                      No identification documents uploaded yet.
                    </td>
                  </tr>
                ) : (
                  kycDocs.map((doc, idx) => (
                    <tr key={doc.id || idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-900">
                        #{doc.id}
                      </td>

                      <td className="p-3 font-semibold text-slate-800">
                        {(doc as any).full_name || `Participant #${doc.participant_id}`}
                        <div className="text-[10px] text-slate-500 font-mono">{(doc as any).account_number || `PID: ${doc.participant_id}`}</div>
                      </td>

                      <td className="p-3 text-slate-700 capitalize font-medium">
                        {String(doc.document_type || 'ID').replace(/_/g, ' ')}
                      </td>

                      <td className="p-3 text-slate-600">
                        <button
                          onClick={() => {
                            setViewingProof({
                              title: `KYC: ${String(doc.document_type).replace(/_/g, ' ').toUpperCase()}`,
                              fileName: doc.file_name || 'id_document.pdf',
                              fileData: doc.file_data,
                              participant: (doc as any).full_name || `Participant #${doc.participant_id}`,
                              details: `Status: ${doc.status} | Uploaded: ${doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleString() : 'Recent'}`
                            });
                          }}
                          className="text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                          <span>{doc.file_name || 'View Document'}</span>
                        </button>
                      </td>

                      <td className="p-3 text-slate-500 font-mono text-[11px]">
                        {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : 'Recent'}
                      </td>

                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-2xs text-[10px] font-bold ${
                          doc.status === 'Verified' || doc.status === 'Approved' ? 'bg-emerald-100 text-emerald-900' :
                          doc.status === 'Rejected' || doc.status === 'Action Required' ? 'bg-rose-100 text-rose-900' :
                          'bg-amber-100 text-amber-900'
                        }`}>
                          {doc.status}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        {doc.status === 'Pending Review' || doc.status === 'Pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleApproveKycDoc(doc)}
                              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xs text-[11px] flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Verify & Approve</span>
                            </button>
                            <button
                              onClick={() => handleRejectKycDoc(doc)}
                              className="px-2.5 py-1 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xs text-[11px] flex items-center gap-1 cursor-pointer"
                            >
                              <XCircle className="w-3 h-3" />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">Audited</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 4. LOAN APPLICATIONS */}
      {/* --------------------------------------------------------------------- */}
      {subTab === 'loans' && (
        <div className="bg-white border border-slate-300 rounded-sm p-6 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#112e51] flex items-center gap-2">
                <span>CCSP Bullion-Backed Loan Requests</span>
                <span className="text-xs font-normal text-slate-500">({loans.length} Records)</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Participant borrowings secured by segregated physical gold and silver reserve allocations.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#112e51] text-white">
                  <th className="p-3">Loan ID</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Principal Amount</th>
                  <th className="p-3">Term & Rate</th>
                  <th className="p-3">Monthly Payment</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Depository Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loans.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 italic">
                      No loan applications submitted yet.
                    </td>
                  </tr>
                ) : (
                  loans.map((loan, idx) => (
                    <tr key={loan.id || idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-900">
                        {loan.loan_id}
                        <div className="text-[10px] text-slate-500 font-sans">PID: #{loan.participant_id}</div>
                      </td>

                      <td className="p-3 font-semibold text-slate-800">
                        {loan.loan_type}
                        <div className="text-[10px] text-slate-500 font-normal">{loan.reason}</div>
                      </td>

                      <td className="p-3 font-mono text-sm font-bold text-blue-950">
                        ${loan.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="p-3 text-slate-700">
                        {loan.term_months} Months @ {loan.interest_rate}% APR
                      </td>

                      <td className="p-3 font-mono text-emerald-800 font-semibold">
                        ${loan.monthly_payment.toFixed(2)}/mo
                      </td>

                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-2xs text-[10px] font-bold ${
                          loan.status === 'Approved' || loan.status === 'Active' ? 'bg-emerald-100 text-emerald-900' :
                          loan.status === 'Rejected' ? 'bg-rose-100 text-rose-900' :
                          'bg-amber-100 text-amber-900'
                        }`}>
                          {loan.status}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        {loan.status === 'Pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleApproveLoan(loan)}
                              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xs text-[11px] flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Authorize</span>
                            </button>
                            <button
                              onClick={() => handleRejectLoan(loan)}
                              className="px-2.5 py-1 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xs text-[11px] flex items-center gap-1 cursor-pointer"
                            >
                              <XCircle className="w-3 h-3" />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">Authorized</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 4. IN-SERVICE WITHDRAWALS */}
      {/* --------------------------------------------------------------------- */}
      {subTab === 'withdrawals' && (
        <div className="bg-white border border-slate-300 rounded-sm p-6 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#112e51] flex items-center gap-2">
                <span>In-Service Distribution & Disbursement Requests</span>
                <span className="text-xs font-normal text-slate-500">({withdrawals.length} Records)</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Financial hardship, age 59½, or post-separation withdrawal requests requiring executive depository authorization.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#112e51] text-white">
                  <th className="p-3">Request ID</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Gross Amount</th>
                  <th className="p-3">Disbursement Method</th>
                  <th className="p-3">Reason / Reason Code</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Wire Authorization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 italic">
                      No withdrawal requests submitted yet.
                    </td>
                  </tr>
                ) : (
                  withdrawals.map((wdl, idx) => (
                    <tr key={wdl.id || idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-900">
                        {wdl.request_id}
                        <div className="text-[10px] text-slate-500 font-sans">PID: #{wdl.participant_id}</div>
                      </td>

                      <td className="p-3 font-semibold text-slate-800">
                        {wdl.withdrawal_type.replace(/_/g, ' ').toUpperCase()}
                      </td>

                      <td className="p-3 font-mono text-sm font-bold text-rose-700">
                        ${wdl.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="p-3 text-slate-700">
                        <div className="font-semibold">{wdl.disbursement_method}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{wdl.bank_name} •••• {wdl.account_number_last4}</div>
                      </td>

                      <td className="p-3 text-[11px] text-slate-600 max-w-[200px] truncate">
                        {wdl.reason || 'General Distribution'}
                      </td>

                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-2xs text-[10px] font-bold ${
                          wdl.status === 'Approved' ? 'bg-emerald-100 text-emerald-900' :
                          wdl.status === 'Rejected' ? 'bg-rose-100 text-rose-900' :
                          'bg-amber-100 text-amber-900'
                        }`}>
                          {wdl.status}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        {wdl.status === 'Pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleApproveWithdrawal(wdl)}
                              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xs text-[11px] flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Release Wire</span>
                            </button>
                            <button
                              onClick={() => handleRejectWithdrawal(wdl)}
                              className="px-2.5 py-1 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xs text-[11px] flex items-center gap-1 cursor-pointer"
                            >
                              <XCircle className="w-3 h-3" />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">Disbursed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW PROOF / DOCUMENT MODAL */}
      {viewingProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs">
          <div className="bg-white rounded-sm shadow-2xl border border-slate-300 w-full max-w-xl max-h-[85vh] overflow-y-auto">
            <div className="bg-[#112e51] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#f2a900]" />
                <h3 className="font-bold text-sm">{viewingProof.title}</h3>
              </div>
              <button 
                onClick={() => setViewingProof(null)}
                className="text-slate-300 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xs space-y-1">
                <div><strong>Participant:</strong> {viewingProof.participant}</div>
                <div><strong>File:</strong> {viewingProof.fileName}</div>
                <div><strong>Details:</strong> {viewingProof.details}</div>
              </div>

              {viewingProof.fileData ? (
                <div>
                  <strong className="block text-slate-800 mb-2">Document Preview:</strong>
                  {viewingProof.fileData.startsWith('data:image') ? (
                    <div className="p-2 border border-slate-300 rounded-xs bg-slate-100 flex justify-center max-h-80 overflow-hidden">
                      <img src={viewingProof.fileData} alt="Proof" className="max-h-72 object-contain" />
                    </div>
                  ) : viewingProof.fileData.startsWith('data:application/pdf') ? (
                    <div className="p-4 bg-blue-50 border border-blue-200 text-center rounded-xs space-y-2">
                      <FileText className="w-10 h-10 text-blue-800 mx-auto" />
                      <p className="font-bold text-slate-800">{viewingProof.fileName}</p>
                      <a 
                        href={viewingProof.fileData} 
                        download={viewingProof.fileName}
                        className="inline-block px-4 py-1.5 bg-[#112e51] text-white font-bold rounded-xs cursor-pointer"
                      >
                        Download PDF Document
                      </a>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 border border-slate-200 text-slate-600 italic text-center">
                      Embedded binary document ({viewingProof.fileName})
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-xs text-center text-slate-500 italic">
                  Document metadata logged on depository ledger.
                </div>
              )}

              <div className="flex justify-end pt-3 border-t border-slate-200">
                <button
                  onClick={() => setViewingProof(null)}
                  className="px-4 py-2 bg-[#112e51] text-white font-bold rounded-xs cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
