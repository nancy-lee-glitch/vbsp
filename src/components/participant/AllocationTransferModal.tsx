import React, { useState } from 'react';
import { 
  X, 
  RefreshCw, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  PieChart, 
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';
import { UserAccount, TSPFund } from '../../types';
import { TSP_FUNDS } from '../../data/mockData';

interface AllocationTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount;
  onUpdateSuccess: (updatedUser: UserAccount, message: string) => void;
  initialMode?: 'allocation' | 'transfer';
}

export const AllocationTransferModal: React.FC<AllocationTransferModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateSuccess,
  initialMode = 'allocation'
}) => {
  const [activeMode, setActiveMode] = useState<'allocation' | 'transfer'>(initialMode);
  
  // Future Allocation State (percentages sum to 100%)
  const [allocations, setAllocations] = useState<Record<string, number>>({
    'L2050': user.contributionAllocations['L2050'] || 50,
    'C': user.contributionAllocations['C'] || 30,
    'S': user.contributionAllocations['S'] || 15,
    'G': user.contributionAllocations['G'] || 5,
    'F': user.contributionAllocations['F'] || 0,
    'I': user.contributionAllocations['I'] || 0
  });

  // Interfund Transfer (IFT) State
  const [iftAllocations, setIftAllocations] = useState<Record<string, number>>({
    'L2050': 50,
    'C': 30,
    'S': 15,
    'G': 5,
    'F': 0,
    'I': 0
  });

  const [confirmationStep, setConfirmationStep] = useState(false);
  const [successNotice, setSuccessNotice] = useState('');

  if (!isOpen) return null;

  const currentValues = Object.values(activeMode === 'allocation' ? allocations : iftAllocations) as number[];
  const currentSum = currentValues.reduce((a: number, b: number) => a + b, 0);

  const handlePercentageChange = (fundCode: string, value: number) => {
    const val = Math.max(0, Math.min(100, isNaN(value) ? 0 : value));
    if (activeMode === 'allocation') {
      setAllocations(prev => ({ ...prev, [fundCode]: val }));
    } else {
      setIftAllocations(prev => ({ ...prev, [fundCode]: val }));
    }
  };

  const handleExecute = () => {
    if (currentSum !== 100) return;

    if (activeMode === 'allocation') {
      const updated: UserAccount = {
        ...user,
        contributionAllocations: { ...allocations }
      };
      onUpdateSuccess(updated, 'Your future contribution allocation has been successfully updated and will apply to your next paycheck.');
    } else {
      // Recalculate holdings based on IFT
      const newHoldings = (Object.entries(iftAllocations) as [string, number][])
        .filter(([_, pct]) => pct > 0)
        .map(([code, pct]) => {
          const fundInfo = TSP_FUNDS.find(f => f.code === code) || TSP_FUNDS[0];
          const newBal = (user.totalBalance * pct) / 100;
          const newShares = newBal / fundInfo.currentSharePrice;
          return {
            fundCode: code,
            shares: Math.round(newShares * 100) / 100,
            sharePrice: fundInfo.currentSharePrice,
            balance: Math.round(newBal * 100) / 100,
            percentage: pct
          };
        });

      const updated: UserAccount = {
        ...user,
        currentHoldings: newHoldings
      };
      onUpdateSuccess(updated, 'Your Interfund Transfer (IFT) order has been submitted. Confirmation #VBSP-IFT-2026-' + Math.floor(1000 + Math.random() * 9000));
    }

    onClose();
  };

  const fundCodes = ['L2050', 'C', 'S', 'I', 'F', 'G'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-800 flex items-center justify-center text-amber-400">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-black text-sm text-white">Investment Management Wizard</h2>
              <p className="text-[11px] text-slate-300">Change Allocations & Interfund Transfers</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50 text-xs font-bold">
          <button
            onClick={() => { setActiveMode('allocation'); setConfirmationStep(false); }}
            className={`py-3 px-4 text-center border-b-2 transition-colors cursor-pointer ${
              activeMode === 'allocation' ? 'border-blue-900 text-blue-900 bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Change Future Contribution Allocation
          </button>
          <button
            onClick={() => { setActiveMode('transfer'); setConfirmationStep(false); }}
            className={`py-3 px-4 text-center border-b-2 transition-colors cursor-pointer ${
              activeMode === 'transfer' ? 'border-blue-900 text-blue-900 bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            2. Interfund Transfer (Reallocate Balance)
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50/70 border-b border-blue-200 px-5 py-2 text-xs text-blue-900 flex items-center justify-between">
          <span>
            {activeMode === 'allocation' 
              ? 'Directs where your future payroll contributions and agency matches will be invested.'
              : `Reallocates your current balance of $${user.totalBalance.toLocaleString()} among VBSP funds.`}
          </span>
          <span className="font-black">Total: {currentSum}%</span>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {fundCodes.map((code) => {
            const fund = TSP_FUNDS.find(f => f.code === code) || TSP_FUNDS[0];
            const currentVal = activeMode === 'allocation' ? (allocations[code] || 0) : (iftAllocations[code] || 0);

            return (
              <div 
                key={code}
                className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs text-white shrink-0 ${
                    code === 'G' ? 'bg-emerald-600' :
                    code === 'F' ? 'bg-blue-600' :
                    code === 'C' ? 'bg-indigo-700' :
                    code === 'S' ? 'bg-amber-600' :
                    code === 'I' ? 'bg-purple-600' :
                    'bg-slate-800'
                  }`}>
                    {code}
                  </span>
                  <div>
                    <div className="font-bold text-xs text-slate-900">{fund.name}</div>
                    <div className="text-[11px] text-slate-500 font-medium">Share Price: ${(fund.currentSharePrice ?? 0).toFixed(2)} • YTD Return: +{fund.ytdReturn ?? 0}%</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={currentVal}
                    onChange={(e) => handlePercentageChange(code, Number(e.target.value))}
                    className="w-28 sm:w-36 accent-blue-900"
                  />
                  <div className="relative w-18">
                    <input 
                      type="number"
                      min="0"
                      max="100"
                      value={currentVal}
                      onChange={(e) => handlePercentageChange(code, Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-black text-slate-900 text-right pr-6 focus:ring-2 focus:ring-blue-800"
                    />
                    <span className="absolute right-2 top-1.5 text-xs text-slate-500 font-bold">%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs">
            {currentSum === 100 ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Allocations equal exactly 100%
              </span>
            ) : (
              <span className="text-rose-700 font-bold flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Allocations must equal 100% (Currently {currentSum}%)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              onClick={handleExecute}
              disabled={currentSum !== 100}
              className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Confirm & Submit Order</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
