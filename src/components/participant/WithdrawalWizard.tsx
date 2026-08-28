import React, { useState } from 'react';
import { 
  X, 
  LifeBuoy, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  DollarSign, 
  Calendar, 
  ShieldAlert,
  FileCheck
} from 'lucide-react';
import { UserAccount } from '../../types';

interface WithdrawalWizardProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount;
  onWithdrawalSubmitted: (amount: number, type: string, message: string) => void;
}

export const WithdrawalWizard: React.FC<WithdrawalWizardProps> = ({
  isOpen,
  onClose,
  user,
  onWithdrawalSubmitted
}) => {
  const [withdrawalType, setWithdrawalType] = useState<'financial_hardship' | 'age_59_half' | 'post_separation'>('financial_hardship');
  const [amount, setAmount] = useState<number>(5000);
  const [taxWithholdingPercent, setTaxWithholdingPercent] = useState<number>(20);
  const [hardshipReason, setHardshipReason] = useState<string>('Negative monthly cash flow / extraordinary living expenses');
  const [eSignature, setESignature] = useState<string>('');

  if (!isOpen) return null;

  const maxAllowed = Math.floor(user.traditionalBalance);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eSignature.trim()) return;

    const netAmount = amount * (1 - taxWithholdingPercent / 100);
    const msg = `Withdrawal request for $${amount.toLocaleString()} (${withdrawalType.replace('_', ' ')}) has been submitted. Net disbursement after ${taxWithholdingPercent}% tax withholding: $${netAmount.toLocaleString()}. Confirmation #TSP-WDL-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    onWithdrawalSubmitted(amount, withdrawalType, msg);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200" id="withdrawal-wizard">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-800 flex items-center justify-center text-amber-400">
              <LifeBuoy className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-black text-sm text-white">Withdrawal & Distribution Request</h2>
              <p className="text-[11px] text-slate-300">In-Service Hardship & Separation Disbursements</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Select Distribution Category</label>
            <select 
              value={withdrawalType}
              onChange={(e: any) => setWithdrawalType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
            >
              <option value="financial_hardship">In-Service Financial Hardship (Must meet IRS criteria)</option>
              <option value="age_59_half">Age-Based In-Service (Age 59½ or older)</option>
              <option value="post_separation">Post-Separation Full/Partial Distribution</option>
            </select>
          </div>

          {withdrawalType === 'financial_hardship' && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Hardship Certification Reason</label>
              <select 
                value={hardshipReason}
                onChange={(e) => setHardshipReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
              >
                <option value="Negative monthly cash flow / extraordinary living expenses">Negative recurring monthly cash flow</option>
                <option value="Unreimbursed medical expenses">Unreimbursed extraordinary medical expenses</option>
                <option value="Casualty loss due to federally declared disaster">Casualty loss / federally declared natural disaster</option>
                <option value="Legal expenses for separation or divorce">Legal expenses for separation or divorce</option>
              </select>
            </div>
          )}

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Gross Withdrawal Amount ($)</span>
              <span className="text-blue-900 font-black">${amount.toLocaleString()}</span>
            </div>
            <input 
              type="range" 
              min="1000" 
              max={maxAllowed} 
              step="500"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full accent-blue-900"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1">
              <span>Min: $1,000</span>
              <span>Available Pre-Tax Balance: ${maxAllowed.toLocaleString()}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Federal Income Tax Withholding Rate</label>
            <div className="flex items-center gap-3">
              <input 
                type="number" 
                min="10" 
                max="50"
                value={taxWithholdingPercent}
                onChange={(e) => setTaxWithholdingPercent(Math.max(10, Math.min(50, Number(e.target.value))))}
                className="w-24 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 text-center"
              />
              <span className="text-xs text-slate-600">
                (Mandatory minimum 10% on hardship; 20% standard on eligible rollover distributions)
              </span>
            </div>
          </div>

          {/* Tax summary breakdown */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
            <div className="font-bold text-slate-900">Estimated Disbursement Breakdown:</div>
            <div className="flex justify-between">
              <span className="text-slate-600">Gross Requested:</span>
              <span className="font-bold text-slate-900">${amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-rose-700">
              <span>Federal Tax Withholding ({taxWithholdingPercent}%):</span>
              <span className="font-bold">-${((amount * taxWithholdingPercent) / 100).toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200 text-emerald-800 font-black text-sm">
              <span>Net Direct Deposit to Checking:</span>
              <span>${(amount * (1 - taxWithholdingPercent / 100)).toLocaleString()}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Type Full Legal Name as Electronic Signature
            </label>
            <input 
              type="text" 
              value={eSignature}
              onChange={(e) => setESignature(e.target.value)}
              placeholder="Marcus Vance"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-blue-900"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={!eSignature.trim()}
              className="px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <span>Submit Distribution Request</span>
              <FileCheck className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
