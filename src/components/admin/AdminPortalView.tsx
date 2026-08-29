import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  FileEdit, 
  History, 
  AlertTriangle, 
  Sliders, 
  Search, 
  CheckCircle2, 
  Eye, 
  Lock, 
  Database, 
  Globe, 
  Download,
  Plus,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Save,
  LogOut,
  SlidersHorizontal,
  Layers,
  Sparkles,
  UserPlus,
  Trash2,
  Edit3,
  Key,
  ShieldAlert,
  Coins,
  Building,
  Check,
  X,
  ExternalLink,
  Mail,
  Image as ImageIcon,
  FileText,
  CreditCard,
  Fingerprint,
  Clock
} from 'lucide-react';
import { MOCK_AUDIT_LOGS, MOCK_FRAUD_ALERTS, MOCK_ANNOUNCEMENTS } from '../../data/mockData';
import { 
  AuditLogEntry, 
  FraudAlert, 
  UserAccount, 
  TSPFund, 
  VBSPAccountType, 
  AdminTab,
  SiteBrandingSettings,
  AdminEmailDispatch,
  PaymentMethodConfig
} from '../../types';
import { AdminEmailCenter } from './AdminEmailCenter';
import { AdminBrandingManager } from './AdminBrandingManager';
import { AdminPaymentMethodsManager } from './AdminPaymentMethodsManager';

interface AdminPortalViewProps {
  onAdminLogout: () => void;
  funds: TSPFund[];
  onUpdateFundPrices: (updatedFunds: TSPFund[]) => void;
  users: UserAccount[];
  onCreateUser: (newUser: UserAccount) => void;
  onUpdateUser: (updatedUser: UserAccount) => void;
  onDeleteUser: (userId: string) => void;
  onImpersonateUser: (user: UserAccount) => void;
  branding: SiteBrandingSettings;
  onUpdateBranding: (updated: SiteBrandingSettings) => void;
  dispatches: AdminEmailDispatch[];
  onSendEmail: (dispatch: AdminEmailDispatch) => void;
  paymentMethods: PaymentMethodConfig[];
  onUpdatePaymentMethods: (methods: PaymentMethodConfig[], logDetails?: string) => void;
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({
  onAdminLogout,
  funds,
  onUpdateFundPrices,
  users,
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
  onImpersonateUser,
  branding,
  onUpdateBranding,
  dispatches,
  onSendEmail,
  paymentMethods,
  onUpdatePaymentMethods,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('prices');
  
  // Fund Prices Control State
  const [editableFunds, setEditableFunds] = useState<TSPFund[]>(funds);
  const [priceSaveMessage, setPriceSaveMessage] = useState('');

  // Participant Management State
  const [searchAccount, setSearchAccount] = useState('');
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<string>('ALL');
  const [selectedParticipant, setSelectedParticipant] = useState<UserAccount | null>(users[0] || null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [participantFeedbackMsg, setParticipantFeedbackMsg] = useState('');

  // New Participant Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('+1 (202) 555-0199');
  const [newUserAddress, setNewUserAddress] = useState('1000 Pennsylvania Ave NW, Washington, DC 20004');
  const [newUserAgency, setNewUserAgency] = useState('Department of the Treasury / Federal Reserve Custody');
  const [newUserPlanType, setNewUserPlanType] = useState<VBSPAccountType>('VBSP Standard Account (Taxable Reserve)');
  const [newUserDeposit, setNewUserDeposit] = useState<number>(50000);
  const [newUserPin, setNewUserPin] = useState<string>('884411');
  const [newUserVault, setNewUserVault] = useState('Zurich FreePort / Delaware Depository Segregated Vault');
  const [allocG, setAllocG] = useState(50);
  const [allocS, setAllocS] = useState(30);
  const [allocP, setAllocP] = useState(10);
  const [allocT, setAllocT] = useState(10);
  const [allocM, setAllocM] = useState(0);

  // Edit Participant Balance State
  const [editBalanceTotal, setEditBalanceTotal] = useState<number>(0);
  const [editTraditional, setEditTraditional] = useState<number>(0);
  const [editRoth, setEditRoth] = useState<number>(0);

  // KYC Inspection Modal State
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [kycParticipant, setKycParticipant] = useState<UserAccount | null>(null);
  const [kycSelectedStatus, setKycSelectedStatus] = useState<string>('Verified (Tier 1 Allocated)');
  const [kycAuditNotes, setKycAuditNotes] = useState<string>('Documents verified against federal and state records.');

  // CMS Announcements State
  const [announcements, setAnnouncements] = useState(MOCK_ANNOUNCEMENTS);
  const [newAnnounceTitle, setNewAnnounceTitle] = useState('');
  const [newAnnounceCategory, setNewAnnounceCategory] = useState<'General' | 'Tax Notice' | 'Regulatory' | 'Maintenance' | 'Vault Audit'>('Vault Audit');

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(MOCK_AUDIT_LOGS);

  // Fraud Alerts State
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>(MOCK_FRAUD_ALERTS);

  // Statutory Parameters State
  const [electiveLimit, setElectiveLimit] = useState(23500);
  const [catchUpLimit, setCatchUpLimit] = useState(7500);
  const [secure2CatchUp, setSecure2CatchUp] = useState(11250);
  const [annualAdditions, setAnnualAdditions] = useState(70000);
  const [goldReserveRatio, setGoldReserveRatio] = useState(40);
  const [paramSaveMessage, setParamSaveMessage] = useState('');

  // Handle individual share price change
  const handlePriceChange = (code: string, field: 'currentSharePrice' | 'oneMonthReturn' | 'ytdReturn', value: number) => {
    setEditableFunds(prev => prev.map(fund => {
      if (fund.code === code) {
        return {
          ...fund,
          [field]: value
        };
      }
      return fund;
    }));
  };

  // Save updated fund prices across the entire platform
  const handleSavePrices = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateFundPrices(editableFunds);
    
    // Add an audit log entry for this price change
    const newLog: AuditLogEntry = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      actor: 'Executive Administrator (VBSP-Board)',
      action: 'BULLION_PRICE_OVERRIDE',
      details: `Daily fund share prices updated across all core bullion funds and lifecycle portfolios. G: $${editableFunds.find(f => f.code === 'G')?.currentSharePrice}, S: $${editableFunds.find(f => f.code === 'S')?.currentSharePrice}`,
      ipAddress: '10.240.1.18 (VBSP-HQ-VPC)',
      status: 'Success'
    };
    setAuditLogs([newLog, ...auditLogs]);

    setPriceSaveMessage('Bullion fund share prices and spot benchmark yields updated and published across all rate tables, participant vaults, and calculators.');
    setTimeout(() => setPriceSaveMessage(''), 5000);
  };

  // Quick Preset Market Simulation
  const handleApplyPreset = (type: 'bull' | 'bear' | 'flat') => {
    const updated = editableFunds.map(fund => {
      let multiplier = 1;
      if (type === 'bull') {
        multiplier = fund.code === 'G' ? 1.018 : fund.code === 'S' ? 1.025 : 1.012;
      } else if (type === 'bear') {
        multiplier = fund.code === 'G' ? 0.995 : 0.982;
      } else {
        multiplier = 1.001;
      }
      return {
        ...fund,
        currentSharePrice: Number(((fund.currentSharePrice ?? 0) * multiplier).toFixed(4)),
        oneMonthReturn: Number(((fund.oneMonthReturn ?? 0) + (type === 'bull' ? 1.2 : type === 'bear' ? -1.5 : 0.1)).toFixed(2)),
        ytdReturn: Number(((fund.ytdReturn ?? 0) + (type === 'bull' ? 1.5 : type === 'bear' ? -1.8 : 0.2)).toFixed(2))
      };
    });
    setEditableFunds(updated);
  };

  // Create New Participant
  const handleCreateParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const gPrice = funds.find(f => f.code === 'G')?.currentSharePrice || 94.65;
    const sPrice = funds.find(f => f.code === 'S')?.currentSharePrice || 86.30;
    const pPrice = funds.find(f => f.code === 'P')?.currentSharePrice || 54.20;
    const tPrice = funds.find(f => f.code === 'T')?.currentSharePrice || 19.42;
    const mPrice = funds.find(f => f.code === 'M')?.currentSharePrice || 42.10;

    const totalAlloc = allocG + allocS + allocP + allocT + allocM;
    const normG = totalAlloc > 0 ? (allocG / totalAlloc) : 0.5;
    const normS = totalAlloc > 0 ? (allocS / totalAlloc) : 0.3;
    const normP = totalAlloc > 0 ? (allocP / totalAlloc) : 0.1;
    const normT = totalAlloc > 0 ? (allocT / totalAlloc) : 0.1;
    const normM = totalAlloc > 0 ? (allocM / totalAlloc) : 0.0;

    const gBal = newUserDeposit * normG;
    const sBal = newUserDeposit * normS;
    const pBal = newUserDeposit * normP;
    const tBal = newUserDeposit * normT;
    const mBal = newUserDeposit * normM;

    const goldOunces = Number((gBal / 2650).toFixed(4));
    const silverOunces = Number((sBal / 31.5).toFixed(2));

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const generatedAccountNum = `VBSP-${Math.floor(1000 + Math.random() * 9000)}-${randomSuffix}-${Math.floor(10 + Math.random() * 89)}`;

    const newUser: UserAccount = {
      id: `usr_vbsp_${Date.now()}`,
      name: newUserName,
      email: newUserEmail,
      accountNumber: generatedAccountNum,
      thriftlinePin: newUserPin,
      employingAgency: newUserAgency,
      planType: newUserPlanType,
      hireDate: new Date().toISOString().split('T')[0],
      totalBalance: newUserDeposit,
      traditionalBalance: Number((newUserDeposit * 0.70).toFixed(2)),
      rothBalance: Number((newUserDeposit * 0.30).toFixed(2)),
      ytdReturn: 18.5,
      vaultDepositaryLocation: newUserVault,
      goldOuncesEquivalent: goldOunces,
      silverOuncesEquivalent: silverOunces,
      phone: newUserPhone,
      address: newUserAddress,
      ytdContributions: {
        employee: Number((newUserDeposit * 0.2).toFixed(2)),
        agencyMatch: Number((newUserDeposit * 0.05).toFixed(2)),
        agencyAutomatic: Number((newUserDeposit * 0.01).toFixed(2))
      },
      contributionAllocations: {
        'G': allocG,
        'S': allocS,
        'P': allocP,
        'T': allocT,
        'M': allocM
      },
      currentHoldings: [
        { fundCode: 'G', shares: Number((gBal / gPrice).toFixed(2)), sharePrice: gPrice, balance: Number(gBal.toFixed(2)), percentage: Math.round(normG * 100), metalWeight: `${goldOunces} oz Fine Gold` },
        { fundCode: 'S', shares: Number((sBal / sPrice).toFixed(2)), sharePrice: sPrice, balance: Number(sBal.toFixed(2)), percentage: Math.round(normS * 100), metalWeight: `${silverOunces} oz Pure Silver` },
        { fundCode: 'T', shares: Number((tBal / tPrice).toFixed(2)), sharePrice: tPrice, balance: Number(tBal.toFixed(2)), percentage: Math.round(normT * 100), metalWeight: 'Sovereign Liquidity' }
      ],
      beneficiaries: [
        {
          id: `ben-${Date.now()}`,
          type: 'Primary',
          name: `${newUserName} Primary Estate Trust`,
          relationship: 'Family Trust',
          sharePercentage: 100
        }
      ],
      activeLoans: []
    };

    onCreateUser(newUser);
    setSelectedParticipant(newUser);
    setIsCreateModalOpen(false);

    // Audit log
    const newLog: AuditLogEntry = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      actor: 'Executive Administrator (VBSP-Board)',
      action: 'PARTICIPANT_REGISTERED',
      details: `Registered new participant: ${newUser.name} (${newUser.accountNumber}) under ${newUser.planType}. Initial vault balance: $${newUser.totalBalance.toLocaleString()}.`,
      ipAddress: '10.240.1.18 (VBSP-HQ-VPC)',
      status: 'Success'
    };
    setAuditLogs([newLog, ...auditLogs]);

    setParticipantFeedbackMsg(`Participant "${newUser.name}" successfully created with account #${newUser.accountNumber}.`);
    setTimeout(() => setParticipantFeedbackMsg(''), 6000);
  };

  // Open Edit Participant Modal
  const handleOpenEditModal = (user: UserAccount) => {
    setSelectedParticipant(user);
    setEditBalanceTotal(user.totalBalance);
    setEditTraditional(user.traditionalBalance);
    setEditRoth(user.rothBalance);
    setIsEditModalOpen(true);
  };

  // Save Participant Balance Edit
  const handleSaveParticipantEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParticipant) return;

    const updated: UserAccount = {
      ...selectedParticipant,
      totalBalance: editBalanceTotal,
      traditionalBalance: editTraditional,
      rothBalance: editRoth
    };

    onUpdateUser(updated);
    setSelectedParticipant(updated);
    setIsEditModalOpen(false);

    const newLog: AuditLogEntry = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      actor: 'Executive Administrator (VBSP-Board)',
      action: 'VAULT_BALANCE_ADJUST',
      details: `Adjusted balances for ${updated.name} (${updated.accountNumber}). Total: $${updated.totalBalance.toLocaleString()}, Traditional: $${updated.traditionalBalance.toLocaleString()}, Roth: $${updated.rothBalance.toLocaleString()}.`,
      ipAddress: '10.240.1.18 (VBSP-HQ-VPC)',
      status: 'Success'
    };
    setAuditLogs([newLog, ...auditLogs]);

    setParticipantFeedbackMsg(`Successfully updated balances for participant ${updated.name}.`);
    setTimeout(() => setParticipantFeedbackMsg(''), 5000);
  };

  // Open KYC Inspection Modal
  const handleOpenKycModal = (user: UserAccount) => {
    setKycParticipant(user);
    setKycSelectedStatus(user.kycProfile?.overallStatus || 'Verified (Tier 1 Allocated)');
    setKycAuditNotes('Identification documents reviewed against SSA, DMV and State Department custody registries.');
    setIsKycModalOpen(true);
  };

  // Save KYC Status
  const handleSaveKycStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kycParticipant) return;

    const currentKyc = kycParticipant.kycProfile || {
      overallStatus: kycSelectedStatus as any,
      verifiedDate: new Date().toISOString().split('T')[0],
      riskTier: 'Tier 1 Individual'
    };

    const updatedKyc = {
      ...currentKyc,
      overallStatus: kycSelectedStatus as any,
      verifiedDate: new Date().toISOString().split('T')[0]
    };

    const updatedUser: UserAccount = {
      ...kycParticipant,
      kycProfile: updatedKyc
    };

    onUpdateUser(updatedUser);
    setKycParticipant(updatedUser);
    setIsKycModalOpen(false);

    const newLog: AuditLogEntry = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      actor: 'Executive Compliance Officer (AML-KYC)',
      action: 'KYC_DOCUMENT_AUDIT',
      details: `Updated KYC status for ${updatedUser.name} (${updatedUser.accountNumber}) to "${kycSelectedStatus}". ${kycAuditNotes}`,
      ipAddress: '10.240.1.18 (VBSP-HQ-VPC)',
      status: 'Success'
    };
    setAuditLogs([newLog, ...auditLogs]);

    setParticipantFeedbackMsg(`KYC verification compliance record updated for ${updatedUser.name}.`);
    setTimeout(() => setParticipantFeedbackMsg(''), 5000);
  };

  // Delete Participant
  const handleDeleteParticipant = (userId: string, userName: string) => {
    if (confirm(`Are you sure you want to remove participant ${userName}? This action will archive their bullion account.`)) {
      onDeleteUser(userId);
      if (selectedParticipant?.id === userId) {
        setSelectedParticipant(users.find(u => u.id !== userId) || null);
      }
      setParticipantFeedbackMsg(`Participant ${userName} was removed from the active registry.`);
      setTimeout(() => setParticipantFeedbackMsg(''), 5000);
    }
  };

  const handleResolveFraud = (id: string) => {
    setFraudAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'Resolved' as const } : a));
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnounceTitle.trim()) return;

    const newEntry = {
      id: `ANN-${Math.floor(100 + Math.random() * 900)}`,
      title: newAnnounceTitle,
      date: new Date().toISOString().split('T')[0],
      category: newAnnounceCategory,
      summary: 'Administrative bulletin published by VBSP Sovereign Custody Operations.',
      isUrgent: false
    };

    setAnnouncements([newEntry, ...announcements]);
    setNewAnnounceTitle('');
  };

  const handleSaveParameters = (e: React.FormEvent) => {
    e.preventDefault();
    setParamSaveMessage('Statutory 2026 bullion savings limits & reserve ratios updated in database and propagated to public calculators.');
    setTimeout(() => setParamSaveMessage(''), 5000);
  };

  // Filtered participants list
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchAccount.toLowerCase()) ||
      user.accountNumber.toLowerCase().includes(searchAccount.toLowerCase()) ||
      user.email.toLowerCase().includes(searchAccount.toLowerCase()) ||
      user.employingAgency.toLowerCase().includes(searchAccount.toLowerCase());

    const matchesPlan = selectedPlanFilter === 'ALL' || user.planType === selectedPlanFilter;
    return matchesSearch && matchesPlan;
  });

  return (
    <div className="space-y-6 pb-16" id="admin-portal-view">
      
      {/* Executive Admin Top Header Banner */}
      <div className="bg-[#112e51] text-white rounded-sm p-6 sm:p-8 shadow-xs border border-[#002f5a] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#002f5a] text-[#f2a900] rounded-xs text-xs font-bold mb-2 border border-[#004f87]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AUTHENTICATED VBSP EXECUTIVE ACCESS • FIPS 140-2 LEVEL 3 • NIST SP 800-53</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white">
            VBSP Master Administrative & Custody Control Center
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Real-time bullion price fixing terminal, multi-account CRUD registry, segregated vault audits, and statutory parameters.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block text-xs">
            <span className="text-slate-300 block">Logged in as:</span>
            <strong className="text-white font-bold">admin@vbsp.org (Super Admin)</strong>
          </div>
          <button 
            onClick={onAdminLogout}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-800 hover:bg-red-700 text-white text-xs font-bold rounded-sm transition-colors cursor-pointer border border-red-700 shadow-xs"
            id="admin-logout-button"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </div>

      {/* Admin Module Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-300 pb-2 text-xs font-bold overflow-x-auto">
        {[
          { id: 'prices', label: '1. Master Bullion Fund Prices', icon: TrendingUp },
          { id: 'participants', label: '2. Participant Management & Accounts', icon: Users },
          { id: 'payments', label: '3. Payment Gateways & Crypto Wallets', icon: Coins },
          { id: 'email-center', label: '4. Participant Email & Broadcast', icon: Mail },
          { id: 'branding', label: '5. Site Name & Logo Settings', icon: SlidersHorizontal },
          { id: 'cms', label: '6. CMS Bulletins & Vault Notices', icon: FileEdit },
          { id: 'audit', label: '7. Immutable Audit Trail (NIST)', icon: History },
          { id: 'fraud', label: '8. AI Vault Fraud Detection', icon: AlertTriangle },
          { id: 'parameters', label: '9. Statutory 2026 Limits', icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-sm transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border ${
                isSelected 
                  ? 'bg-[#112e51] text-white border-[#112e51] shadow-2xs' 
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#f2a900]' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ---------------------------------------------------- */}
      {/* 1. MASTER FUND SHARE PRICES CONTROL TERMINAL */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'prices' && (
        <div className="space-y-6">
          {priceSaveMessage && (
            <div className="p-4 bg-emerald-50 border-l-4 border-emerald-600 rounded-xs text-xs text-emerald-950 font-bold flex items-center gap-2 shadow-2xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
              <span>{priceSaveMessage}</span>
            </div>
          )}

          <div className="bg-white border border-slate-300 rounded-sm p-6 shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-base font-bold text-[#112e51] flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#005ea2]" />
                  <span>Daily Bullion Fund Share Prices & Spot Yield Manager</span>
                </h2>
                <p className="text-xs text-slate-600">
                  Update unit share closing prices and yields. Changes immediately recalculate all participant portfolio balances, ounce equivalents, and public rate tables.
                </p>
              </div>

              {/* Quick Simulation Presets */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-semibold hidden sm:inline">Market Preset:</span>
                <button 
                  onClick={() => handleApplyPreset('bull')}
                  className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold rounded-xs cursor-pointer border border-emerald-300"
                >
                  + Bull Surge (+1.8%)
                </button>
                <button 
                  onClick={() => handleApplyPreset('bear')}
                  className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-900 font-bold rounded-xs cursor-pointer border border-red-300"
                >
                  - Spot Pullback (-1.8%)
                </button>
                <button 
                  onClick={() => handleApplyPreset('flat')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xs cursor-pointer border border-slate-300"
                >
                  Flat / Steady
                </button>
              </div>
            </div>

            <form onSubmit={handleSavePrices} className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 uppercase tracking-wider font-bold border-b border-slate-300">
                      <th className="p-3">Fund Code & Name</th>
                      <th className="p-3">Vault / Purity</th>
                      <th className="p-3">Current Share Price ($)</th>
                      <th className="p-3">1-Mo Return (%)</th>
                      <th className="p-3">YTD Return (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {editableFunds.map((fund) => (
                      <tr key={fund.code} className="hover:bg-slate-50">
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{fund.name}</div>
                          <div className="text-[11px] text-slate-500">{fund.benchmark}</div>
                        </td>
                        <td className="p-3 text-slate-600 font-medium">
                          {fund.metalPurity || 'LBMA Physical Metal'}
                        </td>
                        <td className="p-3">
                          <div className="relative w-32">
                            <span className="absolute left-2.5 top-2 text-slate-400 font-bold">$</span>
                            <input 
                              type="number"
                              step="0.0001"
                              value={fund.currentSharePrice}
                              onChange={(e) => handlePriceChange(fund.code, 'currentSharePrice', parseFloat(e.target.value) || 0)}
                              className="w-full bg-slate-50 border border-slate-300 rounded-xs pl-6 pr-2 py-1.5 font-bold text-slate-900 focus:bg-white focus:border-[#005ea2]"
                            />
                          </div>
                        </td>
                        <td className="p-3">
                          <input 
                            type="number"
                            step="0.01"
                            value={fund.oneMonthReturn}
                            onChange={(e) => handlePriceChange(fund.code, 'oneMonthReturn', parseFloat(e.target.value) || 0)}
                            className="w-24 bg-slate-50 border border-slate-300 rounded-xs px-2 py-1.5 font-semibold text-slate-900 focus:bg-white"
                          />
                        </td>
                        <td className="p-3">
                          <input 
                            type="number"
                            step="0.01"
                            value={fund.ytdReturn}
                            onChange={(e) => handlePriceChange(fund.code, 'ytdReturn', parseFloat(e.target.value) || 0)}
                            className="w-24 bg-slate-50 border border-slate-300 rounded-xs px-2 py-1.5 font-semibold text-slate-900 focus:bg-white"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-200">
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-[#005ea2] hover:bg-[#112e51] text-white font-bold text-xs rounded-xs flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Publish & Propagate Daily Prices</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2. PARTICIPANT MANAGEMENT & ACCOUNT CREATION */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'participants' && (
        <div className="space-y-6">
          
          {participantFeedbackMsg && (
            <div className="p-4 bg-emerald-50 border-l-4 border-emerald-600 rounded-xs text-xs text-emerald-950 font-bold flex items-center gap-2 shadow-2xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
              <span>{participantFeedbackMsg}</span>
            </div>
          )}

          {/* Action Bar: Search, Filters, and "Create Participant" Button */}
          <div className="bg-white border border-slate-300 rounded-sm p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-base font-bold text-[#112e51] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#005ea2]" />
                  <span>Participant Accounts & Sovereign Custody Registry</span>
                </h2>
                <p className="text-xs text-slate-600">
                  Manage all participant records, create new accounts across the 3 VBSP classifications, adjust balances, and launch participant test sessions.
                </p>
              </div>

              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2.5 bg-[#005ea2] hover:bg-[#112e51] text-white text-xs font-bold rounded-xs flex items-center gap-2 cursor-pointer shadow-xs transition-colors shrink-0"
              >
                <UserPlus className="w-4 h-4 text-[#f2a900]" />
                <span>+ Register New Participant</span>
              </button>
            </div>

            {/* Search and Account Type Filter */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input 
                  type="text" 
                  value={searchAccount}
                  onChange={(e) => setSearchAccount(e.target.value)}
                  placeholder="Search by participant name, account # (e.g. VBSP-0089), email, agency..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xs pl-9 pr-4 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#005ea2]"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Plan Type:</span>
                <select 
                  value={selectedPlanFilter}
                  onChange={(e) => setSelectedPlanFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white"
                >
                  <option value="ALL">All Account Types ({users.length})</option>
                  <option value="VBSP Standard Account (Taxable Reserve)">VBSP Standard (Taxable)</option>
                  <option value="VBSP Sovereign Custody (Self-Directed / IRA)">VBSP Sovereign Custody (IRA)</option>
                  <option value="VBSP Institutional / Corporate Reserve">VBSP Institutional / Corporate</option>
                </select>
              </div>
            </div>

            {/* Participants Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 uppercase tracking-wider font-bold border-b border-slate-200">
                    <th className="p-3">Participant & Account #</th>
                    <th className="p-3">Account Classification</th>
                    <th className="p-3">Vault Depository</th>
                    <th className="p-3 text-right">Total Balance</th>
                    <th className="p-3 text-right">Physical Metal</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => {
                    const isSelected = selectedParticipant?.id === user.id;
                    return (
                      <tr 
                        key={user.id} 
                        className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-blue-50/60' : ''}`}
                      >
                        <td className="p-3">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{user.name}</span>
                            {user.planType.includes('Corporate') && (
                              <Building className="w-3.5 h-3.5 text-indigo-700" />
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            <span className="font-mono font-bold text-[#005ea2]">{user.accountNumber}</span> • {user.email}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            user.planType.includes('IRA') 
                              ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                              : user.planType.includes('Corporate')
                              ? 'bg-purple-100 text-purple-900 border border-purple-300'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}>
                            {user.planType}
                          </span>
                          <div className="text-[10px] text-slate-500 mt-0.5">{user.employingAgency}</div>
                        </td>
                        <td className="p-3 text-slate-600 font-medium">
                          {user.vaultDepositaryLocation || 'Zurich Segregated Depository'}
                        </td>
                        <td className="p-3 text-right">
                          <div className="font-black text-slate-900 text-sm">
                            ${user.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Trad: ${user.traditionalBalance.toLocaleString()} | Roth: ${user.rothBalance.toLocaleString()}
                          </div>
                        </td>
                        <td className="p-3 text-right font-medium text-slate-700">
                          {user.goldOuncesEquivalent ? (
                            <div><strong>{user.goldOuncesEquivalent} oz</strong> Gold</div>
                          ) : null}
                          {user.silverOuncesEquivalent ? (
                            <div className="text-[11px] text-slate-500">{user.silverOuncesEquivalent} oz Silver</div>
                          ) : null}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Impersonate / Login as Participant */}
                            <button
                              onClick={() => onImpersonateUser(user)}
                              title="Log In & Open Participant Dashboard for this User"
                              className="px-2.5 py-1.5 bg-[#005ea2] hover:bg-[#112e51] text-white rounded-xs font-bold text-[11px] flex items-center gap-1 cursor-pointer shadow-2xs"
                            >
                              <Eye className="w-3 h-3 text-[#f2a900]" />
                              <span>View Portal</span>
                            </button>

                            {/* KYC Documents Review */}
                            <button
                              onClick={() => handleOpenKycModal(user)}
                              title="Review Identification & KYC Documents (SSN, DL, Passport)"
                              className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xs font-bold text-[11px] flex items-center gap-1 cursor-pointer shadow-2xs"
                            >
                              <ShieldCheck className="w-3 h-3" />
                              <span>KYC Docs</span>
                            </button>

                            {/* Edit Balances */}
                            <button
                              onClick={() => handleOpenEditModal(user)}
                              title="Adjust Balances & Holdings"
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xs cursor-pointer border border-slate-300"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Participant */}
                            {users.length > 1 && (
                              <button
                                onClick={() => handleDeleteParticipant(user.id, user.name)}
                                title="Remove Participant"
                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xs cursor-pointer border border-red-200"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 3. PAYMENT METHODS & CRYPTO WALLETS MANAGER */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'payments' && (
        <AdminPaymentMethodsManager
          paymentMethods={paymentMethods}
          onUpdatePaymentMethods={(updatedMethods, logDetails) => {
            onUpdatePaymentMethods(updatedMethods, logDetails);
            if (logDetails) {
              const newLog: AuditLogEntry = {
                id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
                actor: 'Executive Administrator (VBSP-Board)',
                action: 'PAYMENT_GATEWAY_CONFIG',
                details: logDetails,
                ipAddress: '10.240.1.18 (VBSP-HQ-VPC)',
                status: 'Success'
              };
              setAuditLogs([newLog, ...auditLogs]);
            }
          }}
        />
      )}

      {/* ---------------------------------------------------- */}
      {/* 4. EMAIL DISPATCH & BROADCAST CENTER */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'email-center' && (
        <AdminEmailCenter
          users={users}
          branding={branding}
          dispatches={dispatches}
          onSendEmail={onSendEmail}
        />
      )}

      {/* ---------------------------------------------------- */}
      {/* 4. SITE BRANDING & LOGO MANAGER */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'branding' && (
        <AdminBrandingManager
          branding={branding}
          onUpdateBranding={onUpdateBranding}
        />
      )}

      {/* ---------------------------------------------------- */}
      {/* 5. CMS CONTENT MANAGER */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'cms' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-300 rounded-sm p-6 shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-[#112e51] border-b border-slate-200 pb-2">
              Publish Public Announcement or System Alert
            </h2>

            <form onSubmit={handleCreateAnnouncement} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Headline / Title</label>
                  <input 
                    type="text" 
                    value={newAnnounceTitle}
                    onChange={(e) => setNewAnnounceTitle(e.target.value)}
                    placeholder="e.g., 2026 Annual Physical Assay Confirms 100% Allocated Specie"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 text-xs font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select 
                    value={newAnnounceCategory}
                    onChange={(e: any) => setNewAnnounceCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 text-xs font-semibold"
                  >
                    <option value="Vault Audit">Vault Audit</option>
                    <option value="General">General News</option>
                    <option value="Tax Notice">Tax Notice (IRS)</option>
                    <option value="Regulatory">Regulatory Directive</option>
                    <option value="Maintenance">System Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button 
                  type="submit"
                  className="px-4 py-2 bg-[#005ea2] hover:bg-[#112e51] text-white text-xs font-bold rounded-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Publish to Homepage News Feed</span>
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white border border-slate-300 rounded-sm p-6 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Live Published Announcements ({announcements.length})
            </h3>
            <div className="divide-y divide-slate-100">
              {announcements.map((a) => (
                <div key={a.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{a.title}</span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold">
                        {a.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Published on: {a.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 4. IMMUTABLE AUDIT LOGS */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-slate-300 rounded-sm p-6 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-base font-bold text-[#112e51] flex items-center gap-2">
                <History className="w-5 h-5 text-[#005ea2]" />
                <span>NIST SP 800-53 Compliant Federal Audit Trail</span>
              </h2>
              <p className="text-xs text-slate-600">
                Cryptographically hashed audit log of all price overrides, participant registrations, vault transfers, and MFA events.
              </p>
            </div>

            <button 
              onClick={() => alert('Exporting SHA-256 Audit Log Bundle for Bureau Veritas & FRTIB Compliance...')}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xs flex items-center gap-1.5 cursor-pointer border border-slate-300"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit Bundle</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 uppercase tracking-wider font-bold border-b border-slate-200">
                  <th className="p-3">Log ID</th>
                  <th className="p-3">Timestamp (UTC)</th>
                  <th className="p-3">Actor / Principal</th>
                  <th className="p-3">Event Action</th>
                  <th className="p-3">Details</th>
                  <th className="p-3">IP Address</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-900">{log.id}</td>
                    <td className="p-3 text-slate-600">{log.timestamp}</td>
                    <td className="p-3 font-semibold text-slate-800">{log.actor}</td>
                    <td className="p-3">
                      <span className="font-mono bg-slate-100 text-[#112e51] px-1.5 py-0.5 rounded text-[11px] font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700 max-w-xs">{log.details}</td>
                    <td className="p-3 font-mono text-slate-500 text-[11px]">{log.ipAddress}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        log.status === 'Success' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 5. FRAUD DETECTION */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'fraud' && (
        <div className="bg-white border border-slate-300 rounded-sm p-6 shadow-2xs space-y-4">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-base font-bold text-[#112e51] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>Real-Time Fraud & Anomaly Monitoring</span>
            </h2>
            <p className="text-xs text-slate-600">
              Heuristic anomaly detection engine monitoring IP velocity, rapid credential changes, and large out-of-pattern vault withdrawal requests.
            </p>
          </div>

          <div className="space-y-3">
            {fraudAlerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-4 border rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  alert.status === 'Resolved' ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-red-50/50 border-red-200'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{alert.type}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      alert.severity === 'High' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {alert.severity} Severity
                    </span>
                    <span className="font-mono text-[11px] text-slate-500 font-bold">
                      Target: {alert.targetAccount}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700">{alert.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {alert.status === 'Open' ? (
                    <button 
                      onClick={() => handleResolveFraud(alert.id)}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark Resolved</span>
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Resolved</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 6. STATUTORY IRS & BULLION LIMITS */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'parameters' && (
        <div className="bg-white border border-slate-300 rounded-sm p-6 shadow-2xs space-y-4">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-base font-bold text-[#112e51] flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#005ea2]" />
              <span>Statutory 2026 Limits & Reserve Ratios</span>
            </h2>
            <p className="text-xs text-slate-600">
              Configure elective deferral limits, SECURE 2.0 catch-up tiers, and treasury gold reserve ratios.
            </p>
          </div>

          {paramSaveMessage && (
            <div className="p-4 bg-emerald-50 border-l-4 border-emerald-600 rounded-xs text-xs text-emerald-950 font-bold flex items-center gap-2 shadow-2xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
              <span>{paramSaveMessage}</span>
            </div>
          )}

          <form onSubmit={handleSaveParameters} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                2026 Standard Elective Deferral Limit ($)
              </label>
              <input 
                type="number" 
                value={electiveLimit}
                onChange={(e) => setElectiveLimit(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Standard Age 50+ Catch-Up Limit ($)
              </label>
              <input 
                type="number" 
                value={catchUpLimit}
                onChange={(e) => setCatchUpLimit(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                SECURE 2.0 Higher Catch-Up Limit (Ages 60-63) ($)
              </label>
              <input 
                type="number" 
                value={secure2CatchUp}
                onChange={(e) => setSecure2CatchUp(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Annual Corporate Additions Limit ($)
              </label>
              <input 
                type="number" 
                value={annualAdditions}
                onChange={(e) => setAnnualAdditions(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 text-xs font-bold"
              />
            </div>

            <div className="pt-3 border-t border-slate-200">
              <button 
                type="submit"
                className="px-5 py-2.5 bg-[#005ea2] hover:bg-[#112e51] text-white text-xs font-bold rounded-xs cursor-pointer shadow-xs"
              >
                <span>Save Statutory Parameters</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* CREATE PARTICIPANT MODAL */}
      {/* ---------------------------------------------------- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-sm shadow-2xl border border-slate-300 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-[#112e51] text-white p-5 flex items-center justify-between border-b border-[#002f5a]">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#f2a900]" />
                <h3 className="font-bold text-base">Register New Participant / Sovereign Holder</h3>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-300 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateParticipant} className="p-6 space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Legal Name *</label>
                  <input 
                    type="text" 
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="e.g. Captain Arthur Vance"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                  <input 
                    type="email" 
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="e.g. arthur.vance@defense.gov"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Account Classification (Plan Type) *</label>
                  <select 
                    value={newUserPlanType}
                    onChange={(e: any) => setNewUserPlanType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 font-bold text-slate-800"
                  >
                    <option value="VBSP Standard Account (Taxable Reserve)">VBSP Standard Account (Taxable Reserve)</option>
                    <option value="VBSP Sovereign Custody (Self-Directed / IRA)">VBSP Sovereign Custody (Self-Directed / IRA)</option>
                    <option value="VBSP Institutional / Corporate Reserve">VBSP Institutional / Corporate Reserve</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Employing Agency / Entity</label>
                  <input 
                    type="text" 
                    value={newUserAgency}
                    onChange={(e) => setNewUserAgency(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Initial Vault Deposit ($ USD) *</label>
                  <input 
                    type="number" 
                    value={newUserDeposit}
                    onChange={(e) => setNewUserDeposit(Number(e.target.value))}
                    min="100"
                    step="100"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ThriftLine 6-Digit PIN *</label>
                  <input 
                    type="text" 
                    maxLength={6}
                    value={newUserPin}
                    onChange={(e) => setNewUserPin(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Segregated Vault Depository Facility</label>
                <select 
                  value={newUserVault}
                  onChange={(e) => setNewUserVault(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 font-semibold text-slate-800"
                >
                  <option value="Zurich FreePort / Delaware Depository Segregated Vault">Zurich FreePort / Delaware Depository Segregated Vault (CH/US)</option>
                  <option value="London Bullion Market (LBMA Vaults - Loomis International)">London Bullion Market (LBMA Vaults - Loomis International)</option>
                  <option value="Geneva FreePort High-Security Vault (Malca-Amit)">Geneva FreePort High-Security Vault (Malca-Amit)</option>
                  <option value="Brinks Manhattan Deep Reserve Vault (NY-01)">Brinks Manhattan Deep Reserve Vault (NY-01)</option>
                </select>
              </div>

              {/* Metal Allocation Percentages */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xs space-y-3">
                <div className="font-bold text-slate-800 flex items-center justify-between">
                  <span>Initial Precious Metal Allocation Target (%):</span>
                  <span className={`font-mono font-bold ${allocG + allocS + allocP + allocT + allocM === 100 ? 'text-emerald-700' : 'text-amber-700'}`}>
                    Total: {allocG + allocS + allocP + allocT + allocM}%
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-600 font-semibold mb-1">G-Fund (Gold %)</label>
                    <input 
                      type="number" 
                      value={allocG}
                      onChange={(e) => setAllocG(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xs p-1.5 font-bold text-slate-900 text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 font-semibold mb-1">S-Fund (Silver %)</label>
                    <input 
                      type="number" 
                      value={allocS}
                      onChange={(e) => setAllocS(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xs p-1.5 font-bold text-slate-900 text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 font-semibold mb-1">P-Fund (Platinum %)</label>
                    <input 
                      type="number" 
                      value={allocP}
                      onChange={(e) => setAllocP(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xs p-1.5 font-bold text-slate-900 text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 font-semibold mb-1">T-Fund (Cash %)</label>
                    <input 
                      type="number" 
                      value={allocT}
                      onChange={(e) => setAllocT(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xs p-1.5 font-bold text-slate-900 text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 font-semibold mb-1">M-Fund (Rare %)</label>
                    <input 
                      type="number" 
                      value={allocM}
                      onChange={(e) => setAllocM(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xs p-1.5 font-bold text-slate-900 text-center"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button 
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-[#005ea2] hover:bg-[#112e51] text-white font-bold rounded-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Register Participant Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* EDIT PARTICIPANT BALANCES MODAL */}
      {/* ---------------------------------------------------- */}
      {isEditModalOpen && selectedParticipant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-sm shadow-2xl border border-slate-300 w-full max-w-lg">
            <div className="bg-[#112e51] text-white p-5 flex items-center justify-between border-b border-[#002f5a]">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#f2a900]" />
                <h3 className="font-bold text-base">Adjust Balances: {selectedParticipant.name}</h3>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-300 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveParticipantEdit} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xs space-y-0.5">
                <div className="font-bold text-slate-900">{selectedParticipant.name} ({selectedParticipant.accountNumber})</div>
                <div className="text-slate-600">{selectedParticipant.planType}</div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Total Portfolio Balance ($)</label>
                <input 
                  type="number" 
                  value={editBalanceTotal}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setEditBalanceTotal(val);
                    setEditTraditional(Number((val * 0.72).toFixed(2)));
                    setEditRoth(Number((val * 0.28).toFixed(2)));
                  }}
                  step="0.01"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 font-black text-slate-900 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Traditional Vault Reserve ($)</label>
                  <input 
                    type="number" 
                    value={editTraditional}
                    onChange={(e) => setEditTraditional(Number(e.target.value))}
                    step="0.01"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Roth / ABT Liquid Reserve ($)</label>
                  <input 
                    type="number" 
                    value={editRoth}
                    onChange={(e) => setEditRoth(Number(e.target.value))}
                    step="0.01"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-[#005ea2] hover:bg-[#112e51] text-white font-bold rounded-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Update Vault Balances</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 8. KYC & IDENTITY DOCUMENTS REVIEW MODAL */}
      {/* ---------------------------------------------------- */}
      {isKycModalOpen && kycParticipant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="bg-[#112e51] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">KYC / AML Identity Document Compliance</h3>
                  <p className="text-xs text-slate-300">
                    Participant: <strong>{kycParticipant.name}</strong> • Account: <strong>{kycParticipant.accountNumber}</strong>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsKycModalOpen(false)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Review Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              
              {/* Document Overview Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Current Status</span>
                  <div className="font-black text-xs text-slate-900">
                    {kycParticipant.kycProfile?.overallStatus || 'Verified (Tier 1 Allocated)'}
                  </div>
                  <div className="text-[10px] text-slate-500">Tier: {kycParticipant.kycProfile?.riskTier || 'Tier 1 Individual'}</div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">SSN / Tax Identification</span>
                  <div className="font-mono font-black text-xs text-slate-900">
                    {kycParticipant.kycProfile?.ssnMasked || '***-**-4412'}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>SSA Record Valid</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Assay / Vault Custody</span>
                  <div className="font-bold text-xs text-emerald-900">Physical Delivery Approved</div>
                  <div className="text-[10px] text-slate-500">{kycParticipant.vaultDepositaryLocation || 'Zurich Segregated Depository'}</div>
                </div>
              </div>

              {/* Uploaded Documents Grid */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-800" />
                  <span>Verified Identity Records on File</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Document 1: SSN Card */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Fingerprint className="w-4 h-4 text-blue-900" />
                        <span>Social Security Card</span>
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded">
                        {kycParticipant.kycProfile?.ssnDocument?.status || 'Verified'}
                      </span>
                    </div>
                    <div className="text-slate-600 text-[11px] space-y-0.5">
                      <div>File: <strong className="font-mono text-slate-800">{kycParticipant.kycProfile?.ssnDocument?.fileName || 'SSA_Card_Vance_M.pdf'}</strong></div>
                      <div>Authority: <span>{kycParticipant.kycProfile?.ssnDocument?.issuingAuthority || 'Social Security Administration'}</span></div>
                    </div>
                  </div>

                  {/* Document 2: Driver's License Front & Back */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-indigo-900" />
                        <span>Driver's License (Front & Back)</span>
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded">
                        {kycParticipant.kycProfile?.driverLicenseFront?.status || 'Verified'}
                      </span>
                    </div>
                    <div className="text-slate-600 text-[11px] space-y-0.5">
                      <div>Number: <strong className="font-mono text-slate-800">{kycParticipant.kycProfile?.driverLicenseFront?.documentNumberMasked || 'VA-D8849****'}</strong></div>
                      <div>Expires: <span>{kycParticipant.kycProfile?.driverLicenseFront?.expirationDate || '2028-11-15'}</span></div>
                    </div>
                  </div>

                  {/* Document 3: Passport Booklet */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Globe className="w-4 h-4 text-amber-900" />
                        <span>International Passport Booklet</span>
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded">
                        {kycParticipant.kycProfile?.passportDocument?.status || 'Verified'}
                      </span>
                    </div>
                    <div className="text-slate-600 text-[11px] space-y-0.5">
                      <div>Passport #: <strong className="font-mono text-slate-800">{kycParticipant.kycProfile?.passportDocument?.documentNumberMasked || 'US-P9942****'}</strong></div>
                      <div>Authority: <span>{kycParticipant.kycProfile?.passportDocument?.issuingAuthority || 'U.S. Department of State'}</span></div>
                    </div>
                  </div>

                  {/* Document 4: Proof of Address */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Building className="w-4 h-4 text-emerald-900" />
                        <span>Proof of Address (Utility Bill)</span>
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded">
                        Verified
                      </span>
                    </div>
                    <div className="text-slate-600 text-[11px] space-y-0.5">
                      <div>Address: <span>{kycParticipant.address}</span></div>
                      <div>Verified: <span>Match Confirmed</span></div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Compliance Status Override Form */}
              <form onSubmit={handleSaveKycStatus} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-slate-700" />
                  <span>Update KYC Compliance Decision</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Audit Compliance Status</label>
                    <select
                      value={kycSelectedStatus}
                      onChange={(e) => setKycSelectedStatus(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-900"
                    >
                      <option value="Verified (Tier 1 Allocated)">Verified (Tier 1 Allocated - Full Bullion Custody)</option>
                      <option value="Under Vault Assay Review">Under Vault Assay Review</option>
                      <option value="Pending Review">Pending Review</option>
                      <option value="Action Required">Action Required (Request Re-Upload)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Compliance Audit Log Notes</label>
                    <input
                      type="text"
                      value={kycAuditNotes}
                      onChange={(e) => setKycAuditNotes(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900"
                      placeholder="e.g. Verified by Depository Assay Officer"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsKycModalOpen(false)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#005ea2] hover:bg-[#112e51] text-white font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Compliance Audit</span>
                  </button>
                </div>
              </form>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
