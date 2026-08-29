import React, { useState } from 'react';
import { 
  X, 
  ArrowRight, 
  DollarSign, 
  Coins, 
  Building, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Copy, 
  Check, 
  Upload, 
  QrCode, 
  Info,
  Sliders,
  ExternalLink
} from 'lucide-react';
import { 
  UserAccount, 
  TSPFund, 
  TSPTransaction, 
  PaymentMethodConfig 
} from '../../types';

interface DepositFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount;
  funds: TSPFund[];
  paymentMethods?: PaymentMethodConfig[];
  onDepositSubmitted: (newTransaction: TSPTransaction, notificationMsg: string) => void;
}

export const DepositFundsModal: React.FC<DepositFundsModalProps> = ({
  isOpen,
  onClose,
  user,
  funds,
  paymentMethods = [],
  onDepositSubmitted
}) => {
  // Only display payment methods toggled ON by the Super Admin
  const availableMethods = paymentMethods.filter(m => m.isEnabled);
  const initialMethod = availableMethods[0] || null;

  const [depositAmount, setDepositAmount] = useState<number>(5000);
  const [selectedMethodId, setSelectedMethodId] = useState<string>(initialMethod?.id || '');
  const [selectedFundCode, setSelectedFundCode] = useState<string>('G');
  const [methodCategoryFilter, setMethodCategoryFilter] = useState<string>('ALL');
  const [remittanceReference, setRemittanceReference] = useState<string>('');
  const [senderIdentifier, setSenderIdentifier] = useState<string>(user.name);
  const [uploadedReceiptName, setUploadedReceiptName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  // Selected Fund & Metal Equivalents
  const selectedFund = funds.find(f => f.code === selectedFundCode) || funds[0];
  const fundPrice = selectedFund?.currentSharePrice || 94.65;
  const estimatedMetalShares = (depositAmount / fundPrice).toFixed(3);

  // Selected Payment Method
  const selectedMethod = availableMethods.find(m => m.id === selectedMethodId) || availableMethods[0];

  // Statutory Limits: Minimum $5,000, Maximum $300,000
  const MIN_DEPOSIT = selectedMethod?.minDepositUsd || 5000;
  const MAX_DEPOSIT = selectedMethod?.maxDepositUsd || 300000;
  const isAmountValid = depositAmount >= 5000 && depositAmount <= 300000;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedReceiptName(e.target.files[0].name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAmountValid || !selectedMethod) return;

    setIsSubmitting(true);

    const targetFundName = selectedFund?.name || 'Gold Sovereign (G-Fund)';
    const methodName = selectedMethod.name;

    const newTx: TSPTransaction = {
      id: `TX-DEP-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toISOString().split('T')[0],
      type: `Bullion Deposit / ${selectedFundCode}-Fund Acquisition`,
      description: `${methodName} deposit allocated to ${targetFundName}. Channel: ${selectedMethod.category.toUpperCase()}. Ref/TxID: ${remittanceReference || 'Direct Remittance'}`,
      amount: depositAmount,
      status: 'Pending',
      metalEquivalent: `+${estimatedMetalShares} ${selectedFundCode === 'G' ? 'oz Gold' : selectedFundCode === 'S' ? 'oz Silver' : selectedFundCode === 'P' ? 'oz Platinum' : 'Target Units'}`,
      userId: user.id,
      userName: user.name,
      userAccount: user.accountNumber,
      fundCode: selectedFundCode,
      category: 'Deposit',
      paymentMethodName: selectedMethod.name,
      paymentMethodId: selectedMethod.id,
      paymentReference: remittanceReference || undefined,
      senderAccountOrWallet: senderIdentifier || undefined
    };

    const msg = `Deposit request for $${depositAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} via ${selectedMethod.name} to ${selectedFundCode}-Fund submitted with status PENDING. Super Admin depository sign-off required before ledger balance is credited. Confirmation #${newTx.id}`;

    setTimeout(() => {
      setIsSubmitting(false);
      onDepositSubmitted(newTx, msg);
      onClose();
    }, 400);
  };

  // Filtered Methods by Category Pill
  const filteredMethods = availableMethods.filter(m => {
    if (methodCategoryFilter === 'ALL') return true;
    return m.category === methodCategoryFilter;
  });

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
      id="deposit-funds-modal"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white rounded-xs shadow-2xl border border-slate-300 overflow-hidden my-auto animate-in fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#112e51] text-white p-5 flex items-center justify-between border-b border-[#002f5a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xs bg-[#002f5a] flex items-center justify-center text-[#f2a900] border border-[#004f87] shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Deposit Funds & Acquire Physical Bullion</h2>
              <p className="text-[11px] text-slate-300">Statutory Limits: $5,000 Min – $300,000 Max • Super Admin Approval Required</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1.5 rounded-xs hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Administrative Policy Notice */}
        <div className="bg-amber-50 border-b border-amber-200 p-3 px-5 flex items-start gap-2.5 text-xs text-amber-900">
          <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Master Depository Ledger Policy: </span>
            All incoming deposits via Bank Wire, Crypto Coins, PayPal, CashApp, or Zelle are logged as <strong className="font-bold">Pending</strong> and must be verified and signed off by the Super Admin before portfolio balance is credited.
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
          
          {/* STEP 1: Destination Bullion Asset Fund */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              1. Select Destination Bullion Asset Fund
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {funds.map((fund) => {
                const isSelected = selectedFundCode === fund.code;
                return (
                  <button
                    key={fund.code}
                    type="button"
                    onClick={() => setSelectedFundCode(fund.code)}
                    className={`p-2.5 rounded-xs text-left border cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-[#112e51] text-white border-[#112e51] shadow-2xs' 
                        : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-mono font-black text-xs ${isSelected ? 'text-[#f2a900]' : 'text-[#112e51]'}`}>
                        {fund.code}-Fund
                      </span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#f2a900]" />}
                    </div>
                    <div className="text-[10px] font-bold mt-1 line-clamp-1">
                      {fund.name.split('(')[0]}
                    </div>
                    <div className="text-[10px] opacity-80 mt-0.5 font-mono">
                      ${(fund.currentSharePrice ?? 0).toFixed(2)}/sh
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: Deposit Amount with Strict $5,000 - $300,000 Limits */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-800">
                2. Deposit Amount (USD) <span className="text-red-600 font-bold">*</span>
              </label>
              <span className="text-[11px] font-bold text-slate-500">
                Limit: <strong>$5,000.00 – $300,000.00</strong>
              </span>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-600 font-black text-base">
                $
              </div>
              <input
                type="number"
                min="5000"
                max="300000"
                step="100"
                value={depositAmount || ''}
                onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)}
                className={`w-full bg-slate-50 border rounded-xs pl-9 pr-4 py-2.5 text-base font-black text-slate-900 focus:bg-white outline-none font-mono ${
                  !isAmountValid 
                    ? 'border-red-500 focus:border-red-600' 
                    : 'border-slate-300 focus:border-[#112e51]'
                }`}
                placeholder="5000"
                required
              />
            </div>

            {/* Validation Alerts */}
            {depositAmount > 0 && depositAmount < 5000 && (
              <div className="mt-1.5 p-2 bg-red-50 border border-red-300 rounded-xs text-[11px] text-red-700 font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>Deposit amount must be at least $5,000.00 USD (Statutory Minimum).</span>
              </div>
            )}

            {depositAmount > 300000 && (
              <div className="mt-1.5 p-2 bg-red-50 border border-red-300 rounded-xs text-[11px] text-red-700 font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>Deposit amount cannot exceed $300,000.00 USD per transaction. For institutional allocations above $300k, contact the Sovereign Custody Desk.</span>
              </div>
            )}

            {/* Quick Amount Presets ($5,000 - $300,000) */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 mt-2 text-[11px] text-slate-600">
              <span className="font-semibold">
                Est. Bullion Backing: <strong className="text-slate-900 font-mono">+{estimatedMetalShares} units</strong>
              </span>
              <div className="flex flex-wrap gap-1">
                {[
                  { label: '$5K (Min)', val: 5000 },
                  { label: '$10K', val: 10000 },
                  { label: '$25K', val: 25000 },
                  { label: '$50K', val: 50000 },
                  { label: '$100K', val: 100000 },
                  { label: '$300K (Max)', val: 300000 }
                ].map(preset => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => setDepositAmount(preset.val)}
                    className={`px-2 py-1 rounded-2xs border text-[10px] font-bold cursor-pointer transition-colors ${
                      depositAmount === preset.val 
                        ? 'bg-[#112e51] text-white border-[#112e51]' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* STEP 3: Dynamic Payment Method Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-800">
                3. Select Payment Method / Remittance Channel <span className="text-red-600">*</span>
              </label>
              <span className="text-[10px] text-slate-500 font-medium">
                {availableMethods.length} Active Gateways
              </span>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none text-[11px]">
              {[
                { id: 'ALL', label: 'All Means' },
                { id: 'crypto', label: 'Crypto Coins' },
                { id: 'bank_transfer', label: 'Bank Wire' },
                { id: 'cashapp', label: 'Cash App' },
                { id: 'paypal', label: 'PayPal' },
                { id: 'zelle', label: 'Zelle' }
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setMethodCategoryFilter(cat.id)}
                  className={`px-2.5 py-1 rounded-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                    methodCategoryFilter === cat.id
                      ? 'bg-[#005ea2] text-white border-[#005ea2]'
                      : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Payment Method Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {filteredMethods.map((method) => {
                const isSelected = selectedMethod?.id === method.id;
                const isCrypto = method.category === 'crypto';
                const isBank = method.category === 'bank_transfer';
                const isCashApp = method.category === 'cashapp';
                const isPayPal = method.category === 'paypal';
                const isZelle = method.category === 'zelle';

                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedMethodId(method.id)}
                    className={`p-3 rounded-xs text-left border cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected 
                        ? 'bg-blue-50/80 border-blue-600 ring-1 ring-blue-600 shadow-2xs' 
                        : 'bg-slate-50 border-slate-300 hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xs flex items-center justify-center shrink-0 border mt-0.5 ${
                      isCrypto ? 'bg-amber-100 text-amber-800 border-amber-300' :
                      isBank ? 'bg-blue-100 text-[#005ea2] border-blue-300' :
                      isCashApp ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                      isPayPal ? 'bg-indigo-100 text-indigo-800 border-indigo-300' :
                      'bg-purple-100 text-purple-800 border-purple-300'
                    }`}>
                      {isCrypto ? <Coins className="w-4 h-4" /> :
                       isBank ? <Building className="w-4 h-4" /> :
                       <CreditCard className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-xs text-slate-900 truncate">
                          {method.name}
                        </div>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#005ea2] shrink-0" />}
                      </div>

                      {method.badgeText && (
                        <span className="inline-block mt-0.5 px-1.5 py-0.2 bg-slate-200/70 text-slate-700 rounded-2xs text-[9px] font-bold">
                          {method.badgeText}
                        </span>
                      )}

                      <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{method.processingTime}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 4: Selected Payment Method Instructions & Vault Address Details */}
          {selectedMethod && (
            <div className="p-4 bg-slate-900 text-white rounded-xs border border-slate-800 space-y-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#f2a900]" />
                  <span className="font-bold text-xs text-white">
                    Official Remittance Details: {selectedMethod.name}
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/60 px-2 py-0.5 rounded-xs border border-emerald-800">
                  Verified Depository Rail
                </span>
              </div>

              {/* CRYPTO WALLET DETAILS */}
              {selectedMethod.category === 'crypto' && (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-300">
                    <span>Coin & Network:</span>
                    <strong className="text-white font-mono bg-slate-800 px-2 py-0.5 rounded-xs">
                      {selectedMethod.coinSymbol} ({selectedMethod.network})
                    </strong>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1">
                      <span>Vault Receiving Address:</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(selectedMethod.walletAddress || '', 'crypto-addr')}
                        className="text-[#f2a900] hover:text-white font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedKey === 'crypto-addr' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'crypto-addr' ? 'Copied to Clipboard!' : 'Copy Address'}</span>
                      </button>
                    </div>
                    <div className="p-2 bg-slate-950 border border-slate-700 rounded-xs font-mono text-[11px] text-emerald-300 break-all select-all font-bold">
                      {selectedMethod.walletAddress}
                    </div>
                  </div>

                  {selectedMethod.memoOrTag && (
                    <div className="flex items-center justify-between text-[11px] bg-slate-800/80 p-2 rounded-xs">
                      <span className="text-slate-300">Destination Memo / Tag:</span>
                      <div className="flex items-center gap-2">
                        <strong className="text-[#f2a900] font-mono">{selectedMethod.memoOrTag}</strong>
                        <button
                          type="button"
                          onClick={() => handleCopy(selectedMethod.memoOrTag || '', 'crypto-tag')}
                          className="text-slate-400 hover:text-white"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* BANK WIRE DETAILS */}
              {selectedMethod.category === 'bank_transfer' && (
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300">Depository Bank:</span>
                    <strong className="text-white">{selectedMethod.bankName}</strong>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300">Beneficiary Title:</span>
                    <strong className="text-white">{selectedMethod.accountHolderName}</strong>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-300">Account Number:</span>
                    <div className="flex items-center gap-2">
                      <strong className="text-emerald-300 font-mono font-bold">{selectedMethod.accountNumber}</strong>
                      <button
                        type="button"
                        onClick={() => handleCopy(selectedMethod.accountNumber || '', 'bank-acct')}
                        className="text-[#f2a900] hover:text-white text-[10px] flex items-center gap-1"
                      >
                        {copiedKey === 'bank-acct' ? 'Copied' : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-300">Routing (ABA) / SWIFT:</span>
                    <strong className="text-white font-mono">{selectedMethod.routingNumber} / {selectedMethod.swiftBic}</strong>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300">Bank Address:</span>
                    <span className="text-slate-300 text-right">{selectedMethod.bankAddress}</span>
                  </div>
                </div>
              )}

              {/* CASH APP DETAILS */}
              {selectedMethod.category === 'cashapp' && (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">CashApp $Cashtag:</span>
                    <div className="flex items-center gap-2">
                      <strong className="text-emerald-400 font-mono text-sm font-bold">{selectedMethod.cashAppTag}</strong>
                      <button
                        type="button"
                        onClick={() => handleCopy(selectedMethod.cashAppTag || '', 'cash-tag')}
                        className="text-[#f2a900] hover:text-white text-[10px] flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'cash-tag' ? 'Copied' : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300">Account Name:</span>
                    <strong className="text-white">{selectedMethod.recipientName}</strong>
                  </div>
                </div>
              )}

              {/* PAYPAL DETAILS */}
              {selectedMethod.category === 'paypal' && (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">PayPal Remittance Email:</span>
                    <div className="flex items-center gap-2">
                      <strong className="text-blue-300 font-mono font-bold">{selectedMethod.payPalEmail}</strong>
                      <button
                        type="button"
                        onClick={() => handleCopy(selectedMethod.payPalEmail || '', 'paypal-email')}
                        className="text-[#f2a900] hover:text-white text-[10px] flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'paypal-email' ? 'Copied' : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300">Commercial Entity:</span>
                    <strong className="text-white">{selectedMethod.recipientName}</strong>
                  </div>
                </div>
              )}

              {/* ZELLE DETAILS */}
              {selectedMethod.category === 'zelle' && (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Zelle Enrolled Email/Phone:</span>
                    <div className="flex items-center gap-2">
                      <strong className="text-purple-300 font-mono font-bold">{selectedMethod.zelleIdentifier}</strong>
                      <button
                        type="button"
                        onClick={() => handleCopy(selectedMethod.zelleIdentifier || '', 'zelle-id')}
                        className="text-[#f2a900] hover:text-white text-[10px] flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'zelle-id' ? 'Copied' : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300">Enrolled Name:</span>
                    <strong className="text-white">{selectedMethod.recipientName}</strong>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="p-2.5 bg-slate-800/80 rounded-xs text-[11px] text-slate-300 leading-relaxed border-t border-slate-700">
                <span className="text-[#f2a900] font-bold">Important Remittance Instruction: </span>
                {selectedMethod.instructions}
              </div>
            </div>
          )}

          {/* STEP 5: Payment Proof & Remitter Details */}
          <div className="space-y-3 pt-1">
            <label className="block text-xs font-bold text-slate-800">
              4. Payment Confirmation / Transaction Hash / Remittance Reference
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Transaction Hash / Wire Trace / Note ID <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={remittanceReference}
                  onChange={(e) => setRemittanceReference(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-[#112e51] outline-none font-mono"
                  placeholder={
                    selectedMethod?.category === 'crypto' ? 'e.g. 0x8a91b... / Tx Hash' :
                    selectedMethod?.category === 'bank_transfer' ? 'e.g. Fedwire IMAD/OMAD Trace #' :
                    'e.g. CashApp / PayPal Confirmation ID'
                  }
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Sender Wallet Address / Account Name
                </label>
                <input
                  type="text"
                  value={senderIdentifier}
                  onChange={(e) => setSenderIdentifier(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-[#112e51] outline-none"
                  placeholder="e.g. Marcus Vance or sender wallet address"
                />
              </div>
            </div>

            {/* Optional Receipt Attachment */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Attach Payment Receipt / Screenshot (Optional)
              </label>
              <div className="flex items-center gap-3">
                <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xs border border-slate-300 text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors">
                  <Upload className="w-3.5 h-3.5 text-slate-600" />
                  <span>Choose File...</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-[11px] text-slate-500 truncate max-w-xs font-medium">
                  {uploadedReceiptName || 'No file selected (JPG, PNG, PDF supported)'}
                </span>
              </div>
            </div>
          </div>

          {/* Summary Box */}
          <div className="p-3.5 bg-slate-100 rounded-xs border border-slate-200 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Participant:</span>
              <strong className="text-slate-900">{user.name} ({user.accountNumber})</strong>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Selected Payment Channel:</span>
              <strong className="text-slate-900">{selectedMethod?.name || 'Not Selected'}</strong>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Deposit Amount:</span>
              <strong className="text-slate-900 font-mono text-sm">
                ${depositAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
              </strong>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Initial Transaction Status:</span>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-2xs font-bold text-[10px] border border-amber-300">
                PENDING SUPER ADMIN SIGN-OFF
              </span>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-semibold rounded-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isAmountValid || !selectedMethod}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#112e51] hover:bg-[#002f5a] text-white text-xs font-bold rounded-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors border border-[#002f5a] disabled:opacity-50"
              id="submit-deposit-request-btn"
            >
              <Coins className="w-4 h-4 text-[#f2a900]" />
              <span>{isSubmitting ? 'Submitting to Depository Ledger...' : 'Submit Deposit for Admin Approval'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
