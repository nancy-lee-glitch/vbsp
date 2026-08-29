import React, { useState } from 'react';
import { 
  PaymentMethodConfig, 
  PaymentMethodCategory,
  AuditLogEntry 
} from '../../types';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Coins, 
  Building, 
  CreditCard, 
  QrCode, 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter, 
  Sliders, 
  DollarSign, 
  Clock, 
  ShieldCheck, 
  ExternalLink,
  Power,
  RefreshCw,
  Info
} from 'lucide-react';

interface AdminPaymentMethodsManagerProps {
  paymentMethods: PaymentMethodConfig[];
  onUpdatePaymentMethods: (methods: PaymentMethodConfig[], logDetails?: string) => void;
}

export const AdminPaymentMethodsManager: React.FC<AdminPaymentMethodsManagerProps> = ({
  paymentMethods,
  onUpdatePaymentMethods
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [toastMessage, setToastMessage] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethodConfig | null>(null);

  // New Method Form State
  const [newCategory, setNewCategory] = useState<PaymentMethodCategory>('crypto');
  const [newName, setNewName] = useState('');
  const [newBadgeText, setNewBadgeText] = useState('');
  const [newMinDeposit, setNewMinDeposit] = useState<number>(5000);
  const [newMaxDeposit, setNewMaxDeposit] = useState<number>(300000);
  const [newProcessingTime, setNewProcessingTime] = useState('Instant - 15 Mins');
  const [newInstructions, setNewInstructions] = useState('');
  const [newIsEnabled, setNewIsEnabled] = useState(true);

  // Bank Specific
  const [newBankName, setNewBankName] = useState('');
  const [newAccountHolderName, setNewAccountHolderName] = useState('');
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [newRoutingNumber, setNewRoutingNumber] = useState('');
  const [newSwiftBic, setNewSwiftBic] = useState('');
  const [newBankAddress, setNewBankAddress] = useState('');

  // Crypto Specific
  const [newCoinSymbol, setNewCoinSymbol] = useState('');
  const [newNetwork, setNewNetwork] = useState('');
  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [newMemoOrTag, setNewMemoOrTag] = useState('');

  // P2P Specific
  const [newPayPalEmail, setNewPayPalEmail] = useState('');
  const [newCashAppTag, setNewCashAppTag] = useState('');
  const [newZelleIdentifier, setNewZelleIdentifier] = useState('');
  const [newRecipientName, setNewRecipientName] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 5000);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Toggle Method ON / OFF
  const handleToggleStatus = (method: PaymentMethodConfig) => {
    const updatedStatus = !method.isEnabled;
    const updated = paymentMethods.map(m => 
      m.id === method.id 
        ? { ...m, isEnabled: updatedStatus, updatedAt: new Date().toISOString().split('T')[0] } 
        : m
    );

    const logDetails = `Payment channel "${method.name}" toggled ${updatedStatus ? 'ENABLED (Visible to Users)' : 'DISABLED (Hidden from Users)'}.`;
    onUpdatePaymentMethods(updated, logDetails);
    showToast(`Payment method "${method.name}" is now ${updatedStatus ? 'ENABLED for user deposits' : 'DISABLED and hidden'}.`);
  };

  // Delete Payment Method
  const handleDeleteMethod = (method: PaymentMethodConfig) => {
    if (confirm(`Are you sure you want to remove payment method "${method.name}"? Participants will no longer be able to select this channel for bullion deposits.`)) {
      const updated = paymentMethods.filter(m => m.id !== method.id);
      const logDetails = `Payment channel "${method.name}" (ID: ${method.id}) was DELETED from active gateways.`;
      onUpdatePaymentMethods(updated, logDetails);
      showToast(`Payment method "${method.name}" was permanently removed.`);
    }
  };

  // Open Edit Modal with Prepopulated Data
  const handleOpenEdit = (method: PaymentMethodConfig) => {
    setEditingMethod(method);
    setNewCategory(method.category);
    setNewName(method.name);
    setNewBadgeText(method.badgeText || '');
    setNewMinDeposit(method.minDepositUsd || 5000);
    setNewMaxDeposit(method.maxDepositUsd || 300000);
    setNewProcessingTime(method.processingTime || 'Instant - 15 Mins');
    setNewInstructions(method.instructions || '');
    setNewIsEnabled(method.isEnabled);

    setNewBankName(method.bankName || '');
    setNewAccountHolderName(method.accountHolderName || '');
    setNewAccountNumber(method.accountNumber || '');
    setNewRoutingNumber(method.routingNumber || '');
    setNewSwiftBic(method.swiftBic || '');
    setNewBankAddress(method.bankAddress || '');

    setNewCoinSymbol(method.coinSymbol || '');
    setNewNetwork(method.network || '');
    setNewWalletAddress(method.walletAddress || '');
    setNewMemoOrTag(method.memoOrTag || '');

    setNewPayPalEmail(method.payPalEmail || '');
    setNewCashAppTag(method.cashAppTag || '');
    setNewZelleIdentifier(method.zelleIdentifier || '');
    setNewRecipientName(method.recipientName || '');

    setIsEditModalOpen(true);
  };

  // Save Existing Method Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMethod || !newName.trim()) return;

    const updated: PaymentMethodConfig[] = paymentMethods.map(m => {
      if (m.id === editingMethod.id) {
        return {
          ...m,
          name: newName,
          category: newCategory,
          isEnabled: newIsEnabled,
          badgeText: newBadgeText || undefined,
          minDepositUsd: newMinDeposit,
          maxDepositUsd: newMaxDeposit,
          processingTime: newProcessingTime,
          instructions: newInstructions,
          bankName: newCategory === 'bank_transfer' ? newBankName : undefined,
          accountHolderName: (newCategory === 'bank_transfer' || newCategory === 'custom') ? newAccountHolderName : undefined,
          accountNumber: newCategory === 'bank_transfer' ? newAccountNumber : undefined,
          routingNumber: newCategory === 'bank_transfer' ? newRoutingNumber : undefined,
          swiftBic: newCategory === 'bank_transfer' ? newSwiftBic : undefined,
          bankAddress: newCategory === 'bank_transfer' ? newBankAddress : undefined,
          coinSymbol: newCategory === 'crypto' ? newCoinSymbol.toUpperCase() : undefined,
          network: newCategory === 'crypto' ? newNetwork : undefined,
          walletAddress: newCategory === 'crypto' ? newWalletAddress.trim() : undefined,
          memoOrTag: (newCategory === 'crypto' && newMemoOrTag.trim()) ? newMemoOrTag.trim() : undefined,
          payPalEmail: newCategory === 'paypal' ? newPayPalEmail.trim() : undefined,
          cashAppTag: newCategory === 'cashapp' ? (newCashAppTag.startsWith('$') ? newCashAppTag.trim() : `$${newCashAppTag.trim()}`) : undefined,
          zelleIdentifier: newCategory === 'zelle' ? newZelleIdentifier.trim() : undefined,
          recipientName: ['paypal', 'cashapp', 'zelle', 'custom'].includes(newCategory) ? newRecipientName : undefined,
          updatedAt: new Date().toISOString().split('T')[0]
        };
      }
      return m;
    });

    const logDetails = `Payment channel "${newName}" updated by Super Admin (wallet/account/limits modified).`;
    onUpdatePaymentMethods(updated, logDetails);
    setIsEditModalOpen(false);
    setEditingMethod(null);
    showToast(`Payment method "${newName}" details successfully updated and published.`);
  };

  // Open Create Modal with Cleared Form
  const handleOpenAdd = () => {
    setNewCategory('crypto');
    setNewName('');
    setNewBadgeText('');
    setNewMinDeposit(5000);
    setNewMaxDeposit(300000);
    setNewProcessingTime('Instant - 15 Mins');
    setNewInstructions('Transfer funds to the specified address/account. Enter your VBSP Account Number in the transaction memo.');
    setNewIsEnabled(true);

    setNewBankName('');
    setNewAccountHolderName('');
    setNewAccountNumber('');
    setNewRoutingNumber('');
    setNewSwiftBic('');
    setNewBankAddress('');

    setNewCoinSymbol('BTC');
    setNewNetwork('Bitcoin Mainnet (Native SegWit)');
    setNewWalletAddress('');
    setNewMemoOrTag('');

    setNewPayPalEmail('');
    setNewCashAppTag('$');
    setNewZelleIdentifier('');
    setNewRecipientName('Vertex Bullion Custody Service');

    setIsAddModalOpen(true);
  };

  // Create New Method
  const handleCreateMethod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newId = `pay-${newCategory}-${Date.now().toString().slice(-6)}`;
    const newMethod: PaymentMethodConfig = {
      id: newId,
      name: newName,
      category: newCategory,
      isEnabled: newIsEnabled,
      badgeText: newBadgeText || undefined,
      minDepositUsd: Number(newMinDeposit) || 5000,
      maxDepositUsd: Number(newMaxDeposit) || 300000,
      processingTime: newProcessingTime || 'Instant - 15 Mins',
      instructions: newInstructions || 'Send payment using the designated account details. Enter your Account Number in the memo.',
      bankName: newCategory === 'bank_transfer' ? newBankName : undefined,
      accountHolderName: (newCategory === 'bank_transfer' || newCategory === 'custom') ? newAccountHolderName : undefined,
      accountNumber: newCategory === 'bank_transfer' ? newAccountNumber : undefined,
      routingNumber: newCategory === 'bank_transfer' ? newRoutingNumber : undefined,
      swiftBic: newCategory === 'bank_transfer' ? newSwiftBic : undefined,
      bankAddress: newCategory === 'bank_transfer' ? newBankAddress : undefined,
      coinSymbol: newCategory === 'crypto' ? (newCoinSymbol.toUpperCase() || 'COIN') : undefined,
      network: newCategory === 'crypto' ? newNetwork : undefined,
      walletAddress: newCategory === 'crypto' ? newWalletAddress.trim() : undefined,
      memoOrTag: (newCategory === 'crypto' && newMemoOrTag.trim()) ? newMemoOrTag.trim() : undefined,
      payPalEmail: newCategory === 'paypal' ? newPayPalEmail.trim() : undefined,
      cashAppTag: newCategory === 'cashapp' ? (newCashAppTag.startsWith('$') ? newCashAppTag.trim() : `$${newCashAppTag.trim()}`) : undefined,
      zelleIdentifier: newCategory === 'zelle' ? newZelleIdentifier.trim() : undefined,
      recipientName: ['paypal', 'cashapp', 'zelle', 'custom'].includes(newCategory) ? newRecipientName : undefined,
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updated = [newMethod, ...paymentMethods];
    const logDetails = `New payment channel "${newName}" (${newCategory}) created by Super Admin. Status: ${newIsEnabled ? 'ACTIVE' : 'DISABLED'}.`;
    onUpdatePaymentMethods(updated, logDetails);
    setIsAddModalOpen(false);
    showToast(`New payment method "${newName}" has been registered into the depository catalog.`);
  };

  // Filter Methods
  const filteredMethods = paymentMethods.filter(method => {
    const matchesSearch = 
      method.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (method.coinSymbol && method.coinSymbol.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (method.walletAddress && method.walletAddress.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (method.bankName && method.bankName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (method.accountNumber && method.accountNumber.includes(searchQuery)) ||
      (method.cashAppTag && method.cashAppTag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (method.payPalEmail && method.payPalEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (method.zelleIdentifier && method.zelleIdentifier.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = 
      selectedCategoryFilter === 'ALL' || 
      method.category === selectedCategoryFilter;

    return matchesSearch && matchesCategory;
  });

  const activeCount = paymentMethods.filter(m => m.isEnabled).length;
  const disabledCount = paymentMethods.filter(m => !m.isEnabled).length;
  const cryptoCount = paymentMethods.filter(m => m.category === 'crypto').length;
  const bankCount = paymentMethods.filter(m => m.category === 'bank_transfer').length;
  const p2pCount = paymentMethods.filter(m => ['cashapp', 'paypal', 'zelle'].includes(m.category)).length;

  return (
    <div className="space-y-6" id="admin-payment-methods-manager">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 bg-emerald-50 border-l-4 border-emerald-600 rounded-xs text-xs text-emerald-950 font-bold flex items-center gap-2.5 shadow-2xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Overview Statistics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 bg-white border border-slate-300 rounded-xs shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Payment Gateways</span>
          <div className="text-2xl font-black text-[#112e51] mt-1">{paymentMethods.length}</div>
          <span className="text-[10px] text-slate-500 font-medium">Configured in Master Vault</span>
        </div>

        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xs shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Active (Displaying to Users)</span>
          <div className="text-2xl font-black text-emerald-900 mt-1">{activeCount}</div>
          <span className="text-[10px] text-emerald-700 font-medium">Toggled ON in User Modal</span>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-300 rounded-xs shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Disabled / Hidden</span>
          <div className="text-2xl font-black text-slate-700 mt-1">{disabledCount}</div>
          <span className="text-[10px] text-slate-500 font-medium">Toggled OFF by Super Admin</span>
        </div>

        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xs shadow-2xs">
          <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">Crypto & Coins</span>
          <div className="text-2xl font-black text-amber-900 mt-1">{cryptoCount}</div>
          <span className="text-[10px] text-amber-800 font-medium">BTC, ETH, USDT, SOL, etc.</span>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-300 rounded-xs shadow-2xs">
          <span className="text-[11px] font-bold text-[#005ea2] uppercase tracking-wider block">Banks & P2P Channels</span>
          <div className="text-2xl font-black text-[#112e51] mt-1">{bankCount + p2pCount}</div>
          <span className="text-[10px] text-blue-800 font-medium">Fedwire, CashApp, PayPal, Zelle</span>
        </div>
      </div>

      {/* Main Control Panel Card */}
      <div className="bg-white border border-slate-300 rounded-xs p-5 sm:p-6 shadow-2xs space-y-5">
        
        {/* Header with Title and Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-base font-bold text-[#112e51] flex items-center gap-2">
              <Coins className="w-5 h-5 text-[#f2a900]" />
              <span>Depository Payment Gateways, Bank Accounts & Crypto Wallets</span>
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Control the payment channels available to participants when making bullion deposits ($5,000 - $300,000). Add new coin wallets, edit bank details, or toggle channels ON/OFF in real time.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-[#005ea2] hover:bg-[#112e51] text-white font-bold text-xs rounded-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors border border-[#004f87] shrink-0"
            id="admin-add-payment-method-btn"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Payment Channel / Coin</span>
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
            {[
              { id: 'ALL', label: 'All Channels' },
              { id: 'crypto', label: 'Crypto Coins' },
              { id: 'bank_transfer', label: 'Bank / Fedwire' },
              { id: 'cashapp', label: 'Cash App' },
              { id: 'paypal', label: 'PayPal' },
              { id: 'zelle', label: 'Zelle' },
              { id: 'custom', label: 'Custom' }
            ].map(cat => {
              const isSelected = selectedCategoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-xs transition-all cursor-pointer whitespace-nowrap border text-xs ${
                    isSelected 
                      ? 'bg-[#112e51] text-white border-[#112e51] shadow-2xs font-bold' 
                      : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100 font-medium'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search coin, address, bank, routing..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xs pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-[#112e51] outline-none font-medium"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Payment Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMethods.map((method) => {
            const isCrypto = method.category === 'crypto';
            const isBank = method.category === 'bank_transfer';
            const isCashApp = method.category === 'cashapp';
            const isPayPal = method.category === 'paypal';
            const isZelle = method.category === 'zelle';

            return (
              <div 
                key={method.id}
                className={`p-4 sm:p-5 rounded-xs border transition-all space-y-3.5 relative ${
                  method.isEnabled 
                    ? 'bg-white border-slate-300 shadow-2xs' 
                    : 'bg-slate-50/80 border-dashed border-slate-300 opacity-80'
                }`}
                id={`payment-card-${method.id}`}
              >
                {/* Card Top Row: Category Icon, Name, Badge, and Toggle Switch */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xs flex items-center justify-center shrink-0 border ${
                      isCrypto ? 'bg-amber-50 text-amber-700 border-amber-300' :
                      isBank ? 'bg-blue-50 text-[#005ea2] border-blue-300' :
                      isCashApp ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                      isPayPal ? 'bg-indigo-50 text-indigo-700 border-indigo-300' :
                      'bg-purple-50 text-purple-700 border-purple-300'
                    }`}>
                      {isCrypto ? <Coins className="w-5 h-5" /> :
                       isBank ? <Building className="w-5 h-5" /> :
                       <CreditCard className="w-5 h-5" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h3 className="font-bold text-sm text-[#112e51] truncate">
                          {method.name}
                        </h3>
                        {method.badgeText && (
                          <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded-2xs text-[10px] font-bold border border-slate-200">
                            {method.badgeText}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="capitalize font-semibold">{method.category.replace('_', ' ')}</span>
                        <span>•</span>
                        <span>Limits: <strong>${(method.minDepositUsd || 5000).toLocaleString()} - ${(method.maxDepositUsd || 300000).toLocaleString()}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(method)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        method.isEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                      title={method.isEnabled ? 'Click to Disable / Hide from Users' : 'Click to Enable / Display to Users'}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          method.isEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className={`text-[10px] font-bold ${method.isEnabled ? 'text-emerald-700' : 'text-slate-500'}`}>
                      {method.isEnabled ? 'DISPLAY ON' : 'DISABLED OFF'}
                    </span>
                  </div>
                </div>

                {/* Specific Channel Identifiers */}
                <div className="p-3 bg-slate-50 rounded-xs border border-slate-200 text-xs space-y-2">
                  
                  {/* Crypto Details */}
                  {isCrypto && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-semibold">Coin / Network:</span>
                        <span className="font-bold text-slate-900 font-mono bg-white px-2 py-0.5 rounded-xs border border-slate-200">
                          {method.coinSymbol} • {method.network || 'Mainnet'}
                        </span>
                      </div>
                      
                      <div>
                        <div className="text-[11px] text-slate-500 font-semibold flex items-center justify-between mb-0.5">
                          <span>Deposit Wallet Address:</span>
                          <button
                            onClick={() => handleCopy(method.walletAddress || '', method.id)}
                            className="text-[#005ea2] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                          >
                            {copiedId === method.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedId === method.id ? 'Copied!' : 'Copy Address'}</span>
                          </button>
                        </div>
                        <div className="p-1.5 bg-white border border-slate-300 rounded-xs font-mono text-[11px] font-bold text-slate-900 break-all select-all">
                          {method.walletAddress || 'No address configured'}
                        </div>
                      </div>

                      {method.memoOrTag && (
                        <div className="flex items-center justify-between text-[11px] pt-1">
                          <span className="text-slate-500 font-semibold">Memo / Destination Tag:</span>
                          <span className="font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-xs">
                            {method.memoOrTag}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bank Wire Details */}
                  {isBank && (
                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Bank Name:</span>
                        <strong className="text-slate-900 text-right">{method.bankName}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Beneficiary:</span>
                        <strong className="text-slate-900 text-right">{method.accountHolderName}</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Account Number:</span>
                        <div className="flex items-center gap-1.5">
                          <strong className="text-slate-900 font-mono">{method.accountNumber}</strong>
                          <button 
                            onClick={() => handleCopy(method.accountNumber || '', `acct-${method.id}`)}
                            className="text-slate-400 hover:text-[#005ea2]"
                          >
                            {copiedId === `acct-${method.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Routing (ABA) / SWIFT:</span>
                        <strong className="text-slate-900 font-mono">{method.routingNumber} / {method.swiftBic}</strong>
                      </div>
                    </div>
                  )}

                  {/* Cash App Details */}
                  {isCashApp && (
                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">CashApp $Cashtag:</span>
                        <div className="flex items-center gap-1.5">
                          <strong className="text-emerald-700 font-mono text-xs font-bold">{method.cashAppTag}</strong>
                          <button 
                            onClick={() => handleCopy(method.cashAppTag || '', `tag-${method.id}`)}
                            className="text-slate-400 hover:text-emerald-700"
                          >
                            {copiedId === `tag-${method.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Recipient Name:</span>
                        <strong className="text-slate-900">{method.recipientName}</strong>
                      </div>
                    </div>
                  )}

                  {/* PayPal Details */}
                  {isPayPal && (
                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">PayPal Email:</span>
                        <div className="flex items-center gap-1.5">
                          <strong className="text-blue-700 font-mono text-xs font-bold">{method.payPalEmail}</strong>
                          <button 
                            onClick={() => handleCopy(method.payPalEmail || '', `pp-${method.id}`)}
                            className="text-slate-400 hover:text-blue-700"
                          >
                            {copiedId === `pp-${method.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Recipient Legal Entity:</span>
                        <strong className="text-slate-900">{method.recipientName}</strong>
                      </div>
                    </div>
                  )}

                  {/* Zelle Details */}
                  {isZelle && (
                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Zelle Email / Phone:</span>
                        <div className="flex items-center gap-1.5">
                          <strong className="text-purple-700 font-mono text-xs font-bold">{method.zelleIdentifier}</strong>
                          <button 
                            onClick={() => handleCopy(method.zelleIdentifier || '', `zl-${method.id}`)}
                            className="text-slate-400 hover:text-purple-700"
                          >
                            {copiedId === `zl-${method.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Enrolled Name:</span>
                        <strong className="text-slate-900">{method.recipientName}</strong>
                      </div>
                    </div>
                  )}

                  {/* Custom Details */}
                  {method.category === 'custom' && (
                    <div className="text-[11px] text-slate-700 font-medium leading-relaxed">
                      {method.instructions}
                    </div>
                  )}
                </div>

                {/* Instructions snippet & SLA */}
                <div className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                  {method.instructions}
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{method.processingTime}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(method)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xs flex items-center gap-1 cursor-pointer transition-colors border border-slate-300"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#005ea2]" />
                      <span>Edit Details</span>
                    </button>

                    <button
                      onClick={() => handleDeleteMethod(method)}
                      className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-xs cursor-pointer transition-colors"
                      title="Delete Payment Channel"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {filteredMethods.length === 0 && (
          <div className="p-8 text-center bg-slate-50 rounded-xs border border-dashed border-slate-300 space-y-3">
            <Coins className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="font-bold text-sm text-slate-700">No payment methods match your query</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search keywords or category filters, or add a new payment method/coin.
            </p>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-[#112e51] text-white font-bold text-xs rounded-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Payment Channel</span>
            </button>
          </div>
        )}

      </div>

      {/* ============================================================ */}
      {/* ADD NEW PAYMENT METHOD / COIN MODAL */}
      {/* ============================================================ */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xs shadow-2xl border border-slate-300 w-full max-w-2xl my-auto overflow-hidden animate-in fade-in">
            
            {/* Modal Header */}
            <div className="bg-[#112e51] text-white p-5 flex items-center justify-between border-b border-[#002f5a]">
              <div className="flex items-center gap-2.5">
                <Plus className="w-5 h-5 text-[#f2a900]" />
                <div>
                  <h3 className="font-bold text-base text-white">Add New Depository Payment Channel</h3>
                  <p className="text-[11px] text-slate-300">Configure Bank Wire, Crypto Coin, CashApp, PayPal, or Zelle</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-300 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateMethod} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              
              {/* Category Selector */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  1. Payment Channel Type / Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'crypto', label: 'Crypto Coin / Wallet', icon: Coins, desc: 'BTC, ETH, USDT, SOL, LTC, etc.' },
                    { id: 'bank_transfer', label: 'Bank Wire / Fedwire', icon: Building, desc: 'Depository Routing & Account' },
                    { id: 'cashapp', label: 'Cash App', icon: CreditCard, desc: '$Cashtag Mobile' },
                    { id: 'paypal', label: 'PayPal', icon: CreditCard, desc: 'Commercial Clearing Email' },
                    { id: 'zelle', label: 'Zelle Pay', icon: CreditCard, desc: 'Direct Bank Settlement' },
                    { id: 'custom', label: 'Custom Channel', icon: Sliders, desc: 'Other Settlement Rails' }
                  ].map(cat => {
                    const isSelected = newCategory === cat.id;
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setNewCategory(cat.id as PaymentMethodCategory);
                          if (cat.id === 'crypto' && !newName) setNewName('Bitcoin (BTC)');
                          if (cat.id === 'bank_transfer' && !newName) setNewName('Federal Depository Wire');
                          if (cat.id === 'cashapp' && !newName) setNewName('Cash App Clearing');
                          if (cat.id === 'paypal' && !newName) setNewName('PayPal Official Clearing');
                          if (cat.id === 'zelle' && !newName) setNewName('Zelle Bank Settlement');
                        }}
                        className={`p-2.5 rounded-xs text-left border cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-blue-50 border-blue-600 text-blue-950 font-bold' 
                            : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-[#005ea2]' : 'text-slate-500'}`} />
                          <span className="font-bold text-xs">{cat.label}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{cat.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Method Display Name & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Display Name for Users <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Bitcoin (BTC) or Depository Fedwire"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 font-bold text-slate-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Badge Text (Optional)
                  </label>
                  <input
                    type="text"
                    value={newBadgeText}
                    onChange={(e) => setNewBadgeText(e.target.value)}
                    placeholder="e.g. Native SegWit, Instant, Recommended"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 font-semibold text-slate-800 focus:bg-white"
                  />
                </div>
              </div>

              {/* DYNAMIC FIELDS: CRYPTO */}
              {newCategory === 'crypto' && (
                <div className="p-4 bg-amber-50/70 border border-amber-300 rounded-xs space-y-3">
                  <div className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-amber-700" />
                    <span>Cryptocurrency & Coin Specifics</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Coin Symbol (e.g. BTC, ETH, USDT, SOL, LTC)</label>
                      <input
                        type="text"
                        required
                        value={newCoinSymbol}
                        onChange={(e) => setNewCoinSymbol(e.target.value.toUpperCase())}
                        placeholder="BTC"
                        className="w-full bg-white border border-slate-300 rounded-xs px-3 py-2 font-mono font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Network / Standard</label>
                      <input
                        type="text"
                        required
                        value={newNetwork}
                        onChange={(e) => setNewNetwork(e.target.value)}
                        placeholder="e.g. Bitcoin Mainnet (SegWit), TRC-20, ERC-20, Solana"
                        className="w-full bg-white border border-slate-300 rounded-xs px-3 py-2 font-semibold text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Depository Receiving Wallet Address <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newWalletAddress}
                      onChange={(e) => setNewWalletAddress(e.target.value)}
                      placeholder="e.g. bc1q... or 0x... or TR7..."
                      className="w-full bg-white border border-slate-300 rounded-xs px-3 py-2 font-mono font-bold text-slate-900 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Memo / Destination Tag (Optional - for XRP, TON, Stellar, etc.)
                    </label>
                    <input
                      type="text"
                      value={newMemoOrTag}
                      onChange={(e) => setNewMemoOrTag(e.target.value)}
                      placeholder="e.g. 10928374 or leave blank if not required"
                      className="w-full bg-white border border-slate-300 rounded-xs px-3 py-2 font-mono text-slate-800"
                    />
                  </div>
                </div>
              )}

              {/* DYNAMIC FIELDS: BANK WIRE */}
              {newCategory === 'bank_transfer' && (
                <div className="p-4 bg-blue-50/70 border border-blue-300 rounded-xs space-y-3">
                  <div className="font-bold text-xs text-blue-950 flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-[#005ea2]" />
                    <span>Depository Bank Wire & Routing Specifics</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Bank Name</label>
                      <input
                        type="text"
                        required
                        value={newBankName}
                        onChange={(e) => setNewBankName(e.target.value)}
                        placeholder="e.g. JPMorgan Chase Bank, N.A."
                        className="w-full bg-white border border-slate-300 rounded-xs px-3 py-2 font-semibold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Account Holder / Beneficiary Name</label>
                      <input
                        type="text"
                        required
                        value={newAccountHolderName}
                        onChange={(e) => setNewAccountHolderName(e.target.value)}
                        placeholder="e.g. Vertex Bullion Savings Plan Trust"
                        className="w-full bg-white border border-slate-300 rounded-xs px-3 py-2 font-semibold text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Account Number</label>
                      <input
                        type="text"
                        required
                        value={newAccountNumber}
                        onChange={(e) => setNewAccountNumber(e.target.value)}
                        placeholder="772091482019"
                        className="w-full bg-white border border-slate-300 rounded-xs px-3 py-2 font-mono font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Routing Number (ABA)</label>
                      <input
                        type="text"
                        required
                        value={newRoutingNumber}
                        onChange={(e) => setNewRoutingNumber(e.target.value)}
                        placeholder="021000021"
                        className="w-full bg-white border border-slate-300 rounded-xs px-3 py-2 font-mono font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">SWIFT / BIC Code</label>
                      <input
                        type="text"
                        value={newSwiftBic}
                        onChange={(e) => setNewSwiftBic(e.target.value)}
                        placeholder="CHASUS33XXX"
                        className="w-full bg-white border border-slate-300 rounded-xs px-3 py-2 font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Bank Physical Address</label>
                    <input
                      type="text"
                      value={newBankAddress}
                      onChange={(e) => setNewBankAddress(e.target.value)}
                      placeholder="e.g. 383 Madison Avenue, New York, NY 10017"
                      className="w-full bg-white border border-slate-300 rounded-xs px-3 py-2 font-semibold text-slate-800"
                    />
                  </div>
                </div>
              )}

              {/* DYNAMIC FIELDS: CASH APP */}
              {newCategory === 'cashapp' && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-300 rounded-xs space-y-3">
                  <div className="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-emerald-700" />
                    <span>Cash App Details</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Cash App $Cashtag</label>
                      <input
                        type="text"
                        required
                        value={newCashAppTag}
                        onChange={(e) => setNewCashAppTag(e.target.value)}
                        placeholder="$VBSPVaultReserve"
                        className="w-full bg-white border border-slate-300 rounded-xs px-3 py-2 font-mono font-bold text-emerald-800"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Display / Recipient Name</label>
                      <input
                        type="text"
                        required
                        value={newRecipientName}
                        onChange={(e) => setNewRecipientName(e.target.value)}
                        placeholder="e.g. Vertex Bullion Custody Service"
                        className="w-full bg-white border border-slate-300 rounded-xs px-3 py-2 font-semibold text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* DYNAMIC FIELDS: PAYPAL */}
              {newCategory === 'paypal' && (
                <div className="p-4 bg-indigo-50/70 border border-indigo-300 rounded-xs space-y-3">
                  <div className="font-bold text-xs text-indigo-950 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-indigo-700" />
                    <span>PayPal Account Details</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">PayPal Email Address</label>
                      <input
                        type="email"
                        required
                        value={newPayPalEmail}
                        onChange={(e) => setNewPayPalEmail(e.target.value)}
                        placeholder="clearing@vbsp-custody.org"
                        className="w-full bg-white border border-slate-300 rounded-xs px-3 py-2 font-mono font-bold text-indigo-800"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Recipient Business Name</label>
                      <input
                        type="text"
                        required
                        value={newRecipientName}
                        onChange={(e) => setNewRecipientName(e.target.value)}
                        placeholder="e.g. Vertex Bullion Savings Custody Corp"
                        className="w-full bg-white border border-slate-300 rounded-xs px-3 py-2 font-semibold text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* DYNAMIC FIELDS: ZELLE */}
              {newCategory === 'zelle' && (
                <div className="p-4 bg-purple-50/70 border border-purple-300 rounded-xs space-y-3">
                  <div className="font-bold text-xs text-purple-950 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-purple-700" />
                    <span>Zelle Account Details</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Zelle Enrolled Email or Phone Number</label>
                      <input
                        type="text"
                        required
                        value={newZelleIdentifier}
                        onChange={(e) => setNewZelleIdentifier(e.target.value)}
                        placeholder="depository@vbsp.org or +1 (202) 555-0199"
                        className="w-full bg-white border border-slate-300 rounded-xs px-3 py-2 font-mono font-bold text-purple-800"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Registered Legal Entity Name</label>
                      <input
                        type="text"
                        required
                        value={newRecipientName}
                        onChange={(e) => setNewRecipientName(e.target.value)}
                        placeholder="Vertex Bullion Savings Plan LLC"
                        className="w-full bg-white border border-slate-300 rounded-xs px-3 py-2 font-semibold text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Deposit Limits & Processing SLA */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Minimum Deposit ($)</label>
                  <input
                    type="number"
                    min="100"
                    value={newMinDeposit}
                    onChange={(e) => setNewMinDeposit(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 font-mono font-bold text-slate-900"
                  />
                  <span className="text-[10px] text-slate-500">Standard: $5,000</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Maximum Deposit ($)</label>
                  <input
                    type="number"
                    max="1000000"
                    value={newMaxDeposit}
                    onChange={(e) => setNewMaxDeposit(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 font-mono font-bold text-slate-900"
                  />
                  <span className="text-[10px] text-slate-500">Standard: $300,000</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Settlement Speed</label>
                  <input
                    type="text"
                    value={newProcessingTime}
                    onChange={(e) => setNewProcessingTime(e.target.value)}
                    placeholder="e.g. Instant (~3 mins)"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 font-semibold text-slate-800"
                  />
                </div>
              </div>

              {/* Payment Instructions */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Participant Instructions (Displayed in User Modal)
                </label>
                <textarea
                  rows={2}
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  placeholder="Enter specific instructions, reference memo requirements, or network warnings..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xs p-2.5 font-medium text-slate-900"
                />
              </div>

              {/* Toggle Enable Immediately */}
              <div className="p-3 bg-slate-100 rounded-xs border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Make Active for User Deposits Immediately</div>
                  <div className="text-[11px] text-slate-500">If unchecked, this channel will remain hidden until toggled ON.</div>
                </div>
                <input
                  type="checkbox"
                  checked={newIsEnabled}
                  onChange={(e) => setNewIsEnabled(e.target.checked)}
                  className="w-5 h-5 rounded cursor-pointer accent-[#005ea2]"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#005ea2] hover:bg-[#112e51] text-white font-bold rounded-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Save & Register Channel</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* EDIT PAYMENT METHOD MODAL */}
      {/* ============================================================ */}
      {isEditModalOpen && editingMethod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xs shadow-2xl border border-slate-300 w-full max-w-2xl my-auto overflow-hidden animate-in fade-in">
            
            {/* Modal Header */}
            <div className="bg-[#112e51] text-white p-5 flex items-center justify-between border-b border-[#002f5a]">
              <div className="flex items-center gap-2.5">
                <Edit3 className="w-5 h-5 text-[#f2a900]" />
                <div>
                  <h3 className="font-bold text-base text-white">Edit Payment Channel: {editingMethod.name}</h3>
                  <p className="text-[11px] text-slate-300">Modify Wallet Address, Tag, Bank Account, or Instructions</p>
                </div>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-300 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              
              {/* Method Display Name & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Display Name for Users <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 font-bold text-slate-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Badge Text (Optional)
                  </label>
                  <input
                    type="text"
                    value={newBadgeText}
                    onChange={(e) => setNewBadgeText(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 font-semibold text-slate-800 focus:bg-white"
                  />
                </div>
              </div>

              {/* DYNAMIC EDIT FIELDS: CRYPTO */}
              {newCategory === 'crypto' && (
                <div className="p-4 bg-amber-50/70 border border-amber-300 rounded-xs space-y-3">
                  <div className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-amber-700" />
                    <span>Cryptocurrency Wallet & Network</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Coin Symbol</label>
                      <input
                        type="text"
                        required
                        value={newCoinSymbol}
                        onChange={(e) => setNewCoinSymbol(e.target.value.toUpperCase())}
                        className="w-full bg-white border border-slate-300 rounded-xs px-3 py-2 font-mono font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Network Standard</label>
                      <input
                        type="text"
                        required
                        value={newNetwork}
                        onChange={(e) => setNewNetwork(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xs px-3 py-2 font-semibold text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Wallet Address <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newWalletAddress}
                      onChange={(e) => setNewWalletAddress(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xs px-3 py-2 font-mono font-bold text-slate-900 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Memo / Destination Tag (Optional)
                    </label>
                    <input
                      type="text"
                      value={newMemoOrTag}
                      onChange={(e) => setNewMemoOrTag(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xs px-3 py-2 font-mono text-slate-800"
                    />
                  </div>
                </div>
              )}

              {/* DYNAMIC EDIT FIELDS: BANK WIRE */}
              {newCategory === 'bank_transfer' && (
                <div className="p-4 bg-blue-50/70 border border-blue-300 rounded-xs space-y-3">
                  <div className="font-bold text-xs text-blue-950 flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-[#005ea2]" />
                    <span>Depository Wire & Account Details</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Bank Name</label>
                      <input
                        type="text"
                        required
                        value={newBankName}
                        onChange={(e) => setNewBankName(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xs px-3 py-2 font-semibold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Beneficiary Name</label>
                      <input
                        type="text"
                        required
                        value={newAccountHolderName}
                        onChange={(e) => setNewAccountHolderName(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xs px-3 py-2 font-semibold text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Account Number</label>
                      <input
                        type="text"
                        required
                        value={newAccountNumber}
                        onChange={(e) => setNewAccountNumber(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xs px-3 py-2 font-mono font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Routing Number (ABA)</label>
                      <input
                        type="text"
                        required
                        value={newRoutingNumber}
                        onChange={(e) => setNewRoutingNumber(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xs px-3 py-2 font-mono font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">SWIFT / BIC</label>
                      <input
                        type="text"
                        value={newSwiftBic}
                        onChange={(e) => setNewSwiftBic(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xs px-3 py-2 font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Bank Address</label>
                    <input
                      type="text"
                      value={newBankAddress}
                      onChange={(e) => setNewBankAddress(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xs px-3 py-2 font-semibold text-slate-800"
                    />
                  </div>
                </div>
              )}

              {/* DYNAMIC EDIT FIELDS: CASH APP */}
              {newCategory === 'cashapp' && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-300 rounded-xs space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">CashApp $Cashtag</label>
                      <input
                        type="text"
                        required
                        value={newCashAppTag}
                        onChange={(e) => setNewCashAppTag(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xs px-3 py-2 font-mono font-bold text-emerald-800"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Display Name</label>
                      <input
                        type="text"
                        required
                        value={newRecipientName}
                        onChange={(e) => setNewRecipientName(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xs px-3 py-2 font-semibold text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* DYNAMIC EDIT FIELDS: PAYPAL */}
              {newCategory === 'paypal' && (
                <div className="p-4 bg-indigo-50/70 border border-indigo-300 rounded-xs space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">PayPal Email</label>
                      <input
                        type="email"
                        required
                        value={newPayPalEmail}
                        onChange={(e) => setNewPayPalEmail(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xs px-3 py-2 font-mono font-bold text-indigo-800"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Recipient Legal Entity</label>
                      <input
                        type="text"
                        required
                        value={newRecipientName}
                        onChange={(e) => setNewRecipientName(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xs px-3 py-2 font-semibold text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* DYNAMIC EDIT FIELDS: ZELLE */}
              {newCategory === 'zelle' && (
                <div className="p-4 bg-purple-50/70 border border-purple-300 rounded-xs space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Zelle Email / Phone</label>
                      <input
                        type="text"
                        required
                        value={newZelleIdentifier}
                        onChange={(e) => setNewZelleIdentifier(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xs px-3 py-2 font-mono font-bold text-purple-800"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Enrolled Legal Name</label>
                      <input
                        type="text"
                        required
                        value={newRecipientName}
                        onChange={(e) => setNewRecipientName(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xs px-3 py-2 font-semibold text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Deposit Limits */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Minimum Deposit ($)</label>
                  <input
                    type="number"
                    min="100"
                    value={newMinDeposit}
                    onChange={(e) => setNewMinDeposit(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Maximum Deposit ($)</label>
                  <input
                    type="number"
                    max="1000000"
                    value={newMaxDeposit}
                    onChange={(e) => setNewMaxDeposit(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Settlement Speed</label>
                  <input
                    type="text"
                    value={newProcessingTime}
                    onChange={(e) => setNewProcessingTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 font-semibold text-slate-800"
                  />
                </div>
              </div>

              {/* Instructions */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Participant Instructions</label>
                <textarea
                  rows={2}
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xs p-2.5 font-medium text-slate-900"
                />
              </div>

              {/* Toggle Status */}
              <div className="p-3 bg-slate-100 rounded-xs border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Payment Channel Status</div>
                  <div className="text-[11px] text-slate-500">Toggle whether this channel is enabled and visible to participants.</div>
                </div>
                <input
                  type="checkbox"
                  checked={newIsEnabled}
                  onChange={(e) => setNewIsEnabled(e.target.checked)}
                  className="w-5 h-5 rounded cursor-pointer accent-[#005ea2]"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
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
                  <Check className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
