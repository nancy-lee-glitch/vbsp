import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShieldCheck, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Coins, 
  Building2, 
  CheckCircle2, 
  X, 
  Sparkles,
  Lock,
  Globe
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'deposit' | 'withdrawal' | 'allocation' | 'kyc';
  title: string;
  participantMasked: string;
  accountMasked: string;
  maskedAmount: string;
  assetType: string;
  depositoryLocation: string;
  timeAgo: string;
  flag?: string;
}

const FIRST_NAMES = [
  'Marcus', 'David', 'Sarah', 'Anthony', 'Elena', 'James', 'Robert', 'Jennifer', 
  'Michael', 'Thomas', 'Daniel', 'Sophia', 'Alexander', 'Patricia', 'William', 
  'Christopher', 'Matthew', 'Victoria', 'Richard', 'Kenneth', 'Elizabeth'
];

const LAST_INITIALS = ['V.', 'M.', 'B.', 'K.', 'R.', 'T.', 'W.', 'P.', 'S.', 'H.', 'C.', 'D.', 'G.', 'L.', 'F.'];

const TITLES = ['', '', 'Capt. ', 'Maj. ', 'Dr. ', 'Lt. Col. ', 'Cmdr. ', 'Sgt. Maj. ', 'Chief '];

const DEPOSITORIES = [
  'Zurich Segregated FreePort Vault',
  'Delaware Depository (Wilmington)',
  'LBMA Approved London Vault',
  'Singapore Le Freeport Bullion Enclave',
  'Salt Lake City Sovereign Vault',
  'Zurich Alpine Deep Storage'
];

const DEPOSIT_AMOUNTS = [
  '$**,500.00 USD',
  '$**,000.00 USD',
  '$**,850.00 USD',
  '$***,200.00 USD',
  '$*,750.00 USD',
  '**.00 oz Gold (999.9 Fine)',
  '***.50 oz Silver (LBMA)',
  '$**,000.00 (Wire Transfer)',
  '$***,000.00 (Bullion IRA Rollover)'
];

const WITHDRAWAL_AMOUNTS = [
  '$**,200.00 USD (Disbursed)',
  '$**,000.00 USD (Fedwire)',
  '**.50 oz Gold Bar (Segregated Delivery)',
  '***.00 oz Silver Eagle Delivery',
  '$*,500.00 USD (ACH Settled)',
  '$**,800.00 USD (Certified Check)'
];

export const LiveActivityToast: React.FC = () => {
  const [currentActivity, setCurrentActivity] = useState<ActivityItem | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissedByUser, setIsDismissedByUser] = useState(false);

  // Generate a random dynamic realistic activity
  const generateRandomActivity = useCallback((): ActivityItem => {
    // Weighted distribution: 70% deposits/allocations, 25% withdrawals, 5% verified KYC
    const rand = Math.random();
    let type: ActivityItem['type'] = 'deposit';
    if (rand < 0.60) {
      type = 'deposit';
    } else if (rand < 0.85) {
      type = 'withdrawal';
    } else if (rand < 0.95) {
      type = 'allocation';
    } else {
      type = 'kyc';
    }

    const titlePrefix = TITLES[Math.floor(Math.random() * TITLES.length)];
    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastInitial = LAST_INITIALS[Math.floor(Math.random() * LAST_INITIALS.length)];
    const maskedName = `${titlePrefix}${firstName} ${lastInitial.replace('.', '')}*****`;
    
    const randomAccNum = Math.floor(1000 + Math.random() * 9000);
    const maskedAccount = `VBSP-****-${randomAccNum}`;
    const depository = DEPOSITORIES[Math.floor(Math.random() * DEPOSITORIES.length)];

    if (type === 'deposit') {
      const amt = DEPOSIT_AMOUNTS[Math.floor(Math.random() * DEPOSIT_AMOUNTS.length)];
      return {
        id: `act_${Date.now()}_${Math.random()}`,
        type: 'deposit',
        title: 'New Bullion Deposit Received',
        participantMasked: maskedName,
        accountMasked: maskedAccount,
        maskedAmount: amt,
        assetType: amt.includes('Gold') ? 'LBMA 999.9 Gold' : amt.includes('Silver') ? 'Allocated Fine Silver' : 'Sovereign USD Deposit',
        depositoryLocation: depository,
        timeAgo: 'Just now'
      };
    } else if (type === 'withdrawal') {
      const amt = WITHDRAWAL_AMOUNTS[Math.floor(Math.random() * WITHDRAWAL_AMOUNTS.length)];
      return {
        id: `act_${Date.now()}_${Math.random()}`,
        type: 'withdrawal',
        title: 'Vault Withdrawal Disbursed',
        participantMasked: maskedName,
        accountMasked: maskedAccount,
        maskedAmount: amt,
        assetType: amt.includes('Delivery') ? 'Physical Insured Delivery' : 'Direct Depository Payout',
        depositoryLocation: depository,
        timeAgo: 'Just now'
      };
    } else if (type === 'allocation') {
      return {
        id: `act_${Date.now()}_${Math.random()}`,
        type: 'allocation',
        title: 'Vault Fund Reallocation',
        participantMasked: maskedName,
        accountMasked: maskedAccount,
        maskedAmount: '$**,000.00 Allocated',
        assetType: 'G-Fund Gold ⇄ S-Fund Silver',
        depositoryLocation: depository,
        timeAgo: 'Just now'
      };
    } else {
      return {
        id: `act_${Date.now()}_${Math.random()}`,
        type: 'kyc',
        title: 'Tier 1 Sovereign Vault Allocated',
        participantMasked: maskedName,
        accountMasked: maskedAccount,
        maskedAmount: 'Identity Verified & Assayed',
        assetType: 'FIPS 140-3 Segregated Vault',
        depositoryLocation: depository,
        timeAgo: 'Just now'
      };
    }
  }, []);

  useEffect(() => {
    if (isDismissedByUser) return;

    // Show initial pop-up after 3.5 seconds on page load
    const initialTimer = setTimeout(() => {
      const firstActivity = generateRandomActivity();
      setCurrentActivity(firstActivity);
      setIsVisible(true);

      // Hide after 5 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    }, 3500);

    // Then trigger new activity strictly every 10 seconds interval
    const interval = setInterval(() => {
      // 1. Generate new activity item
      const nextActivity = generateRandomActivity();
      setCurrentActivity(nextActivity);
      setIsVisible(true);

      // 2. Hide smoothly after 4.8 seconds
      const hideTimeout = setTimeout(() => {
        setIsVisible(false);
      }, 4800);

      return () => clearTimeout(hideTimeout);
    }, 10000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [isDismissedByUser, generateRandomActivity]);

  if (!currentActivity || isDismissedByUser) {
    return null;
  }

  const isDeposit = currentActivity.type === 'deposit';
  const isWithdrawal = currentActivity.type === 'withdrawal';
  const isAllocation = currentActivity.type === 'allocation';

  return (
    <div 
      className={`fixed bottom-4 left-4 z-40 max-w-sm w-[calc(100vw-2rem)] sm:w-auto transition-all duration-500 ease-out transform ${
        isVisible 
          ? 'translate-y-0 opacity-100 scale-100' 
          : 'translate-y-6 opacity-0 scale-95 pointer-events-none'
      }`}
      role="status"
      aria-live="polite"
      id="vbsp-live-activity-toast"
    >
      <div className="bg-[#0b1b2b]/95 backdrop-blur-md text-white border border-amber-500/40 rounded-sm shadow-2xl p-3.5 sm:p-4 overflow-hidden relative group">
        
        {/* Subtle top accent bar */}
        <div 
          className={`absolute top-0 left-0 right-0 h-1 ${
            isDeposit 
              ? 'bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-400' 
              : isWithdrawal 
              ? 'bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-500' 
              : 'bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-600'
          }`}
        />

        {/* Background glow orb */}
        <div 
          className={`absolute -right-8 -bottom-8 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-20 ${
            isDeposit ? 'bg-emerald-500' : isWithdrawal ? 'bg-blue-500' : 'bg-amber-500'
          }`} 
        />

        <div className="flex items-start gap-3 relative z-10">
          
          {/* Activity Icon Badge */}
          <div className="relative shrink-0 mt-0.5">
            <div 
              className={`w-9 h-9 rounded-full flex items-center justify-center border shadow-inner ${
                isDeposit 
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400' 
                  : isWithdrawal 
                  ? 'bg-blue-950/80 border-blue-500/50 text-blue-400' 
                  : 'bg-amber-950/80 border-amber-500/50 text-amber-400'
              }`}
            >
              {isDeposit && <ArrowDownLeft className="w-4 h-4 text-emerald-400" />}
              {isWithdrawal && <ArrowUpRight className="w-4 h-4 text-sky-400" />}
              {isAllocation && <Coins className="w-4 h-4 text-amber-400" />}
              {currentActivity.type === 'kyc' && <ShieldCheck className="w-4 h-4 text-amber-300" />}
            </div>
            
            {/* Pulsing online indicator */}
            <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isDeposit ? 'bg-emerald-400' : isWithdrawal ? 'bg-blue-400' : 'bg-amber-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isDeposit ? 'bg-emerald-500' : isWithdrawal ? 'bg-blue-500' : 'bg-amber-500'
              }`}></span>
            </span>
          </div>

          {/* Activity Details */}
          <div className="flex-1 min-w-0 pr-4">
            
            {/* Header: Title + Time */}
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className={`text-[11px] font-black uppercase tracking-wider ${
                isDeposit ? 'text-emerald-400' : isWithdrawal ? 'text-sky-300' : 'text-amber-400'
              }`}>
                {currentActivity.title}
              </span>
              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                {currentActivity.timeAgo}
              </span>
            </div>

            {/* Participant Name & Masked Account */}
            <div className="flex items-center gap-1.5 text-xs text-slate-200 font-medium">
              <strong className="text-white font-bold truncate">
                {currentActivity.participantMasked}
              </strong>
              <span className="text-[10px] text-slate-400 font-mono bg-slate-800/80 px-1 py-0.2 rounded-xs border border-slate-700">
                {currentActivity.accountMasked}
              </span>
            </div>

            {/* Masked Amount with High-Security Bullion Tag */}
            <div className="mt-1.5 flex items-center flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-amber-500/15 border border-amber-400/40 text-amber-300 font-mono font-black text-[11px] tracking-wide">
                <Lock className="w-2.5 h-2.5 text-amber-400" />
                {currentActivity.maskedAmount}
              </span>
              
              <span className="text-[10px] text-slate-300 bg-slate-800/60 px-1.5 py-0.5 rounded-xs border border-slate-700/60 font-semibold truncate max-w-[140px]">
                {currentActivity.assetType}
              </span>
            </div>

            {/* Vault Depository Location Verification */}
            <div className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-400 font-medium truncate">
              <Building2 className="w-3 h-3 text-amber-500/80 shrink-0" />
              <span className="truncate">{currentActivity.depositoryLocation}</span>
            </div>

          </div>

          {/* Dismiss button */}
          <button 
            onClick={() => setIsDismissedByUser(true)}
            className="text-slate-400 hover:text-white p-1 rounded-xs hover:bg-slate-800/60 transition-colors cursor-pointer shrink-0 absolute top-2 right-2"
            title="Dismiss notifications"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>

        </div>

        {/* Depository Live Assay Verification Footer */}
        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[9px] text-slate-400 font-mono">
          <span className="flex items-center gap-1 text-emerald-400/90">
            <CheckCircle2 className="w-2.5 h-2.5" />
            VBSP Sovereign Ledger Verified
          </span>
          <span className="text-slate-500">LBMA 999.9 Assayed</span>
        </div>

      </div>
    </div>
  );
};
