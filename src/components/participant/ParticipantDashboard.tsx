import React, { useState } from 'react';
import { 
  UserAccount, 
  TSPLoan, 
  TSPBeneficiary, 
  ParticipantSubView,
  TSPFund,
  TSPTransaction,
  PaymentMethodConfig
} from '../../types';
import { 
  TrendingUp, 
  PieChart, 
  DollarSign, 
  RefreshCw, 
  LifeBuoy, 
  HeartHandshake, 
  Mail, 
  History, 
  FileText, 
  Settings, 
  ShieldCheck, 
  Shield,
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  Clock, 
  Calendar,
  AlertCircle,
  Building,
  User,
  ChevronRight,
  ExternalLink,
  Bot,
  Coins
} from 'lucide-react';
import { AllocationTransferModal } from './AllocationTransferModal';
import { LoanRequestWizard } from './LoanRequestWizard';
import { WithdrawalWizard } from './WithdrawalWizard';
import { BeneficiaryManager } from './BeneficiaryManager';
import { ParticipantMailbox } from './ParticipantMailbox';
import { TransactionHistory } from './TransactionHistory';
import { DocumentsCenter } from './DocumentsCenter';
import { BankingContactSettings } from './BankingContactSettings';
import { IdentificationKYCManager } from './IdentificationKYCManager';
import { DepositFundsModal } from './DepositFundsModal';
import { KYCPopupReminder } from './KYCPopupReminder';

interface ParticipantDashboardProps {
  user: UserAccount;
  funds?: TSPFund[];
  paymentMethods?: PaymentMethodConfig[];
  onUpdateUser: (updated: UserAccount, bannerMsg?: string) => void;
  activeSubView: ParticipantSubView;
  setActiveSubView: (view: ParticipantSubView) => void;
}

export const ParticipantDashboard: React.FC<ParticipantDashboardProps> = ({
  user,
  funds = [],
  paymentMethods = [],
  onUpdateUser,
  activeSubView,
  setActiveSubView,
}) => {
  // Modal states
  const [isAllocationOpen, setIsAllocationOpen] = useState(false);
  const [allocationInitialMode, setAllocationInitialMode] = useState<'allocation' | 'transfer'>('allocation');
  const [isLoanWizardOpen, setIsLoanWizardOpen] = useState(false);
  const [isWithdrawalWizardOpen, setIsWithdrawalWizardOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<string>('');

  const isKycVerified = user.kycProfile?.overallStatus === 'Verified (Tier 1 Allocated)';
  const kycStatusLabel = user.kycProfile?.overallStatus || 'Not Verified';

  const showNotification = (msg: string) => {
    setBannerMessage(msg);
    setTimeout(() => setBannerMessage(''), 8000);
  };

  const handleAllocationUpdate = (updated: UserAccount, msg: string) => {
    onUpdateUser(updated, msg);
    showNotification(msg);
  };

  const handleDepositSubmitted = (newTx: TSPTransaction, msg: string) => {
    const updatedTransactions = [newTx, ...(user.transactions || [])];
    const updated: UserAccount = {
      ...user,
      transactions: updatedTransactions
    };
    onUpdateUser(updated, msg);
    showNotification(msg);
  };

  const handleLoanSubmitted = (newLoan: TSPLoan, msg: string) => {
    const loanTx: TSPTransaction = {
      id: `TX-${newLoan.id}`,
      date: newLoan.issueDate || new Date().toISOString().split('T')[0],
      type: `${newLoan.type} Loan Application`,
      description: `Loan request for $${newLoan.originalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} under administrative review. Repayment: $${newLoan.repaymentPerPayPeriod}/pay period.`,
      amount: newLoan.originalAmount,
      status: 'Pending',
      userId: user.id,
      userName: user.name,
      userAccount: user.accountNumber,
      category: 'Loan'
    };

    const updated: UserAccount = {
      ...user,
      activeLoans: [...user.activeLoans, newLoan],
      transactions: [loanTx, ...(user.transactions || [])]
    };
    onUpdateUser(updated, msg);
    showNotification(msg);
  };

  const handleWithdrawalSubmitted = (amount: number, type: string, msg: string) => {
    const wdlTx: TSPTransaction = {
      id: `TX-WDL-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toISOString().split('T')[0],
      type: `In-Service Withdrawal (${type.replace('_', ' ')})`,
      description: `Disbursement distribution request for $${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} awaiting Super Admin depository wire release.`,
      amount: -amount,
      status: 'Pending',
      userId: user.id,
      userName: user.name,
      userAccount: user.accountNumber,
      category: 'Withdrawal'
    };

    const updated: UserAccount = {
      ...user,
      transactions: [wdlTx, ...(user.transactions || [])]
    };
    onUpdateUser(updated, msg);
    showNotification(msg);
  };

  const handleBeneficiaryUpdate = (updatedBen: TSPBeneficiary[], msg: string) => {
    const updated: UserAccount = {
      ...user,
      beneficiaries: updatedBen
    };
    onUpdateUser(updated, msg);
    showNotification(msg);
  };

  return (
    <div className="space-y-6 pb-12" id="participant-dashboard">
      
      {/* Participant Top Header Banner (USWDS Government Grade) */}
      <div className="bg-[#0f2942] text-white rounded-xs p-4 sm:p-6 shadow-xs border border-[#002f5a]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            {/* Neat Inline Status Pill */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-400 text-[#0f2942] font-bold text-[11px] rounded-2xs uppercase tracking-wider">
                <Shield className="w-3 h-3 text-[#0f2942]" />
                <span>VBSP Depository Account</span>
              </span>
              <span className="text-[11px] text-slate-300 font-medium border-l border-slate-600 pl-2">
                {user.planType} | {user.employingAgency}
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-2xs font-bold text-[10px] ${
                isKycVerified ? 'bg-emerald-800 text-emerald-100' :
                kycStatusLabel === 'Pending Review' ? 'bg-amber-800 text-amber-100' :
                'bg-red-800 text-red-100'
              }`}>
                {isKycVerified ? <CheckCircle2 className="w-3 h-3 text-emerald-300" /> : <Clock className="w-3 h-3 text-amber-300" />}
                <span>KYC: {kycStatusLabel}</span>
              </span>
            </div>
            
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
              Welcome back, {user.name}
            </h1>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-300">
              <span>Account: <strong className="text-white font-mono">{user.accountNumber}</strong></span>
              <span className="text-slate-500">•</span>
              <span>PIN: <strong className="text-white font-mono">••••••</strong></span>
              <span className="text-slate-500">•</span>
              <span>Service Date: <strong className="text-white">{user.hireDate}</strong></span>
            </div>
          </div>

          {/* Quick Actions (Deposit) */}
          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={() => setIsDepositModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2.5 bg-[#f2a900] hover:bg-[#d99b00] text-[#0f2942] rounded-xs text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors border border-amber-500 min-h-[44px] touch-target"
              id="dashboard-header-deposit-btn"
            >
              <Coins className="w-4 h-4 text-[#0f2942]" />
              <span>Deposit Funds</span>
            </button>
          </div>
        </div>
      </div>

      {/* Action Notification Alert */}
      {bannerMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xs text-xs text-emerald-950 flex items-start gap-2.5 font-medium animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div className="flex-1">{bannerMessage}</div>
        </div>
      )}

      {/* Persistent KYC Alert Banner for Unverified / Pending Users */}
      {!isKycVerified && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-950 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm text-amber-900 flex items-center gap-2">
                <span>Identity Verification Status:</span>
                <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded font-black text-xs">
                  {kycStatusLabel}
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-0.5">
                Federal depository compliance requires verified identity documents (SSN & Photo ID) before transactions, bullion deliveries, and loans are disbursed.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveSubView('kyc')}
            className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xs shrink-0 cursor-pointer shadow-xs transition-colors"
          >
            Complete KYC Documents →
          </button>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 pb-2 text-xs font-bold scrollbar-none">
        {[
          { id: 'overview', label: '1. Account Overview', icon: PieChart },
          { id: 'investments', label: '2. Future Allocations & IFT', icon: RefreshCw },
          { id: 'loans', label: '3. Loans & Borrowing', icon: DollarSign },
          { id: 'withdrawals', label: '4. In-Service Withdrawals', icon: LifeBuoy },
          { id: 'beneficiaries', label: '5. Beneficiaries Designation', icon: HeartHandshake },
          { id: 'kyc', label: '6. ID Verification & KYC', icon: ShieldCheck },
          { id: 'documents', label: '7. Statements & 1099-R', icon: FileText },
          { id: 'history', label: '8. Transaction Ledger', icon: History },
          { id: 'messages', label: '9. Secure Mailbox', icon: Mail },
          { id: 'settings', label: '10. Profile & Banking', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeSubView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubView(tab.id as ParticipantSubView)}
              className={`px-3 py-2 rounded-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap min-h-[40px] ${
                isSelected 
                  ? 'bg-[#0f2942] text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-300' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ---------------------------------------------------- */}
      {/* 1. OVERVIEW VIEW */}
      {/* ---------------------------------------------------- */}
      {activeSubView === 'overview' && (
        <div className="space-y-6">
          {/* Main Account Financial Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Balance Overview Card */}
            <div className="md:col-span-8 bg-white border border-[#e2e8f0] rounded-xs p-5 sm:p-6 shadow-2xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Total Portfolio Net Asset Value
                  </span>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0f2942] mt-1 break-all">
                    ${user.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  {user.totalBalance === 0 && (
                    <div className="text-xs text-amber-700 font-semibold mt-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Clean Ledger • Initial deposits and allocations will reflect upon admin sign-off.</span>
                    </div>
                  )}
                </div>

                <div className="sm:text-right">
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full font-bold text-xs border border-emerald-200">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Personal Rate of Return (12-Mo): +{user.ytdReturn}%</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Net of all administrative fees</div>
                </div>
              </div>

              {/* Traditional vs Roth Balance Split */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3.5 bg-slate-50 border border-[#e2e8f0] rounded-xs space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">Traditional (Pre-Tax)</span>
                    <span className="text-[#0f2942] font-mono">${user.traditionalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#0f2942] rounded-full" 
                      style={{ width: user.totalBalance > 0 ? `${(user.traditionalBalance / user.totalBalance) * 100}%` : '0%' }}
                    ></div>
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">Includes Agency 1% Auto & 4% Match</div>
                </div>

                <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xs space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-amber-950">Roth (After-Tax Tax-Free)</span>
                    <span className="text-[#0f2942] font-mono">${user.rothBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="w-full h-2 bg-amber-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-600 rounded-full" 
                      style={{ width: user.totalBalance > 0 ? `${(user.rothBalance / user.totalBalance) * 100}%` : '0%' }}
                    ></div>
                  </div>
                  <div className="text-[10px] text-amber-800 font-medium">100% Tax-Free Qualified Growth</div>
                </div>
              </div>

              {/* 2026 YTD Contributions & Match */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                <div className="p-3 bg-slate-50 rounded-xs border border-[#e2e8f0]">
                  <span className="text-slate-500 block text-[11px]">2026 Employee YTD</span>
                  <span className="font-bold text-[#0f2942] text-base">${user.ytdContributions.employee.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">IRS Limit: $23,500</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xs border border-[#e2e8f0]">
                  <span className="text-slate-500 block text-[11px]">2026 Agency Match YTD</span>
                  <span className="font-bold text-emerald-800 text-base">${user.ytdContributions.agencyMatch.toLocaleString()}</span>
                  <span className="text-[10px] text-emerald-600 block mt-0.5">5% Full Match Captured</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xs border border-[#e2e8f0]">
                  <span className="text-slate-500 block text-[11px]">Total Physical Metal</span>
                  <span className="font-bold text-amber-700 text-base">{user.goldOuncesEquivalent} oz Gold</span>
                  <span className="text-[10px] text-amber-800 block mt-0.5">{user.silverOuncesEquivalent} oz Silver (Direct Vault Allocated)</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="md:col-span-4 space-y-3">
              <div className="bg-white border border-[#e2e8f0] rounded-xs p-4 sm:p-5 shadow-2xs space-y-2.5">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 pb-1 border-b border-slate-100">
                  Frequent Account Actions
                </h3>

                <button 
                  onClick={() => setIsDepositModalOpen(true)}
                  className="w-full text-left p-3 rounded-xs bg-amber-50/80 hover:bg-amber-100 border border-amber-200 hover:border-amber-300 transition-colors flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer min-h-[48px] touch-target shadow-2xs"
                  id="dashboard-action-deposit-funds"
                >
                  <div className="flex items-center gap-2.5">
                    <Coins className="w-4 h-4 text-amber-700" />
                    <span>Deposit Funds & Acquire Bullion</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button 
                  onClick={() => { setAllocationInitialMode('allocation'); setIsAllocationOpen(true); }}
                  className="w-full text-left p-3 rounded-xs bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-colors flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer min-h-[48px] touch-target"
                  id="dashboard-action-future-allocations"
                >
                  <div className="flex items-center gap-2.5">
                    <RefreshCw className="w-4 h-4 text-[#005ea2]" />
                    <span>Change Future Allocations</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button 
                  onClick={() => { setAllocationInitialMode('transfer'); setIsAllocationOpen(true); }}
                  className="w-full text-left p-3 rounded-xs bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-colors flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer min-h-[48px] touch-target"
                  id="dashboard-action-ift-transfer"
                >
                  <div className="flex items-center gap-2.5">
                    <TrendingUp className="w-4 h-4 text-emerald-700" />
                    <span>Interfund Transfer (IFT)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button 
                  onClick={() => setIsLoanWizardOpen(true)}
                  className="w-full text-left p-3 rounded-xs bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-colors flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer min-h-[48px] touch-target"
                  id="dashboard-action-loan-wizard"
                >
                  <div className="flex items-center gap-2.5">
                    <DollarSign className="w-4 h-4 text-amber-700" />
                    <span>Apply for Custody Loan</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button 
                  onClick={() => setIsWithdrawalWizardOpen(true)}
                  className="w-full text-left p-3 rounded-xs bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-colors flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer min-h-[48px] touch-target"
                  id="dashboard-action-withdrawal-wizard"
                >
                  <div className="flex items-center gap-2.5">
                    <LifeBuoy className="w-4 h-4 text-slate-700" />
                    <span>In-Service / Hardship Withdrawal</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button 
                  onClick={() => setActiveSubView('kyc')}
                  className="w-full text-left p-3 rounded-xs bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-colors flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer min-h-[48px] touch-target"
                  id="dashboard-action-kyc-docs"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#005ea2]" />
                    <span>Identity Verification & KYC</span>
                  </div>
                  <span className={`px-1.5 py-0.5 font-bold text-[10px] rounded-2xs ${
                    isKycVerified ? 'bg-emerald-100 text-emerald-800' :
                    kycStatusLabel === 'Pending Review' ? 'bg-amber-100 text-amber-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {kycStatusLabel}
                  </span>
                </button>
              </div>

              {/* Action To-Do / Compliance item */}
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xs text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-xs">
                  <AlertCircle className="w-4 h-4 text-amber-700" />
                  <span>Annual Account Verification Due</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-800">
                  Please verify that your beneficiary designation (Form TSP-3) and primary address are up to date for 2026.
                </p>
              </div>
            </div>
          </div>

          {/* Current Fund Holdings Table */}
          <div className="bg-white border border-[#e2e8f0] rounded-xs shadow-2xs overflow-hidden">
            <div className="p-3.5 sm:p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="font-bold text-xs text-[#0f2942] uppercase tracking-wide">
                Current Fund Holdings & Metal Equivalents
              </h3>
              <button 
                onClick={() => { setAllocationInitialMode('transfer'); setIsAllocationOpen(true); }}
                className="text-xs text-[#005ea2] hover:underline font-bold cursor-pointer"
              >
                Perform Interfund Transfer →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/75 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-3 px-4">Fund Name & Code</th>
                    <th className="py-3 px-3 text-right">Shares Held</th>
                    <th className="py-3 px-3 text-right">Share Price ($)</th>
                    <th className="py-3 px-3 text-right">Current Value ($)</th>
                    <th className="py-3 px-3 text-right">Portfolio Pct</th>
                    <th className="py-3 px-4 text-right">Physical Metal Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {user.currentHoldings.map((holding) => {
                    const pct = user.totalBalance > 0 
                      ? ((holding.balance / user.totalBalance) * 100).toFixed(1) 
                      : '0.0';
                    return (
                      <tr key={holding.fundCode} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-xs bg-[#0f2942] text-white flex items-center justify-center font-bold text-xs">
                              {holding.fundCode}
                            </span>
                            <span className="font-bold text-slate-900">{holding.fundName}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono">{(holding.shares ?? 0).toLocaleString()}</td>
                        <td className="py-3.5 px-3 text-right font-mono">${(holding.sharePrice ?? 0).toFixed(2)}</td>
                        <td className="py-3.5 px-3 text-right font-bold font-mono text-[#0f2942]">
                          ${holding.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-3 text-right font-bold text-slate-700">{pct}%</td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-700">
                          {holding.metalWeight || 'N/A'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Loans Section */}
          {user.activeLoans.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-700" />
                  <span>TSP Participant Loans ({user.activeLoans.length})</span>
                </h3>
                <button 
                  onClick={() => setIsLoanWizardOpen(true)}
                  className="text-xs text-blue-800 hover:underline font-bold cursor-pointer"
                >
                  Request New Loan →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.activeLoans.map((loan) => (
                  <div key={loan.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">{loan.type} Loan ({loan.id})</span>
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        loan.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                        loan.status === 'Processing' ? 'bg-amber-100 text-amber-800' :
                        loan.status === 'Under Review' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {loan.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-slate-600">
                      <div>Current Balance: <strong className="text-slate-900">${loan.currentBalance.toLocaleString()}</strong></div>
                      <div>Original: <strong>${loan.originalAmount.toLocaleString()}</strong></div>
                      <div>Interest Rate: <strong>{loan.interestRate}% Fixed</strong></div>
                      <div>Payroll Deduction: <strong className="text-blue-900">${loan.repaymentPerPayPeriod}/paycheck</strong></div>
                    </div>
                    {loan.status === 'Processing' && (
                      <div className="text-[11px] text-amber-700 font-medium pt-1 border-t border-slate-200 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>Awaiting Super Admin Depository Sign-off and wire issuance.</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-VIEWS */}
      {/* ---------------------------------------------------- */}
      {activeSubView === 'investments' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-lg font-black text-slate-900">Future Payroll Contribution Allocations</h2>
            <p className="text-xs text-slate-600">
              Your future contributions are currently directed according to this percentage formula:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(user.contributionAllocations).map(([code, pct]) => (
                <div key={code} className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="font-bold text-xs text-slate-900">{code} Fund</div>
                  <div className="text-xl font-black text-blue-900">{pct}%</div>
                </div>
              ))}
            </div>
            <div className="pt-3">
              <button 
                onClick={() => { setAllocationInitialMode('allocation'); setIsAllocationOpen(true); }}
                className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Modify Future Allocations
              </button>
            </div>
          </div>
        </div>
      )}

      {activeSubView === 'loans' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">TSP Loan Services</h2>
              <p className="text-xs text-slate-600">Borrow against your own vested balance without credit checks or commercial bank underwriting.</p>
            </div>
            <button 
              onClick={() => setIsLoanWizardOpen(true)}
              className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              Apply for Loan
            </button>
          </div>
        </div>
      )}

      {activeSubView === 'withdrawals' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">In-Service & Post-Separation Distributions</h2>
              <p className="text-xs text-slate-600">Access funds for documented financial hardship, age-based distributions, or separation rollovers.</p>
            </div>
            <button 
              onClick={() => setIsWithdrawalWizardOpen(true)}
              className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              Start Distribution Request
            </button>
          </div>
        </div>
      )}

      {activeSubView === 'beneficiaries' && (
        <BeneficiaryManager 
          user={user} 
          onUpdateBeneficiaries={handleBeneficiaryUpdate} 
        />
      )}

      {activeSubView === 'kyc' && (
        <IdentificationKYCManager 
          user={user} 
          onUpdateUser={handleAllocationUpdate} 
        />
      )}

      {activeSubView === 'documents' && (
        <DocumentsCenter user={user} />
      )}

      {activeSubView === 'history' && (
        <TransactionHistory 
          transactions={user.transactions || []}
          accountNumber={user.accountNumber}
          userName={user.name}
          onOpenDepositModal={() => setIsDepositModalOpen(true)}
        />
      )}

      {activeSubView === 'messages' && (
        <ParticipantMailbox user={user} />
      )}

      {activeSubView === 'settings' && (
        <BankingContactSettings 
          user={user} 
          onUpdateUser={handleAllocationUpdate}
          onNavigateToKYC={() => setActiveSubView('kyc')}
        />
      )}

      {/* Allocation / IFT Modal */}
      <AllocationTransferModal 
        isOpen={isAllocationOpen}
        onClose={() => setIsAllocationOpen(false)}
        user={user}
        onUpdateSuccess={handleAllocationUpdate}
        initialMode={allocationInitialMode}
      />

      {/* Loan Wizard Modal */}
      <LoanRequestWizard 
        isOpen={isLoanWizardOpen}
        onClose={() => setIsLoanWizardOpen(false)}
        user={user}
        onLoanSubmitted={handleLoanSubmitted}
      />

      {/* Withdrawal Wizard Modal */}
      <WithdrawalWizard 
        isOpen={isWithdrawalWizardOpen}
        onClose={() => setIsWithdrawalWizardOpen(false)}
        user={user}
        onWithdrawalSubmitted={handleWithdrawalSubmitted}
      />

      {/* Deposit Funds & Bullion Modal */}
      <DepositFundsModal 
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        user={user}
        funds={funds || []}
        paymentMethods={paymentMethods}
        onDepositSubmitted={handleDepositSubmitted}
      />

      {/* Persistent KYC Reminder Pop-up */}
      <KYCPopupReminder 
        user={user}
        onNavigateToKyc={() => setActiveSubView('kyc')}
      />
    </div>
  );
};
