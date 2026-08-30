import React, { useState } from 'react';
import { 
  X, 
  DollarSign, 
  HelpCircle, 
  Shield, 
  CheckCircle2, 
  ArrowRight, 
  Home, 
  Briefcase, 
  Building2, 
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { UserAccount, TSPLoan } from '../../types';

interface LoanRequestWizardProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount;
  onLoanSubmitted: (newLoan: TSPLoan, message: string) => void;
}

export const LoanRequestWizard: React.FC<LoanRequestWizardProps> = ({
  isOpen,
  onClose,
  user,
  onLoanSubmitted
}) => {
  const [loanType, setLoanType] = useState<'General Purpose' | 'Residential'>('General Purpose');
  const [loanAmount, setLoanAmount] = useState<number>(15000);
  const [termYears, setTermYears] = useState<number>(3);
  const [bankRouting, setBankRouting] = useState<string>('051000033');
  const [bankAccount, setBankAccount] = useState<string>('••••••••4892');
  const [eSignature, setESignature] = useState<string>('');
  const [step, setStep] = useState<1 | 2 | 3>(1);

  if (!isOpen) return null;

  // Maximum loan calculation (Lesser of 50% vested balance or $50,000 minus outstanding loan)
  const maxLoanAllowed = Math.min(50000 - 8500, Math.floor(user.totalBalance * 0.5));
  const interestRate = 4.25; // Current G Fund loan rate

  // Calculate bi-weekly payroll payment
  const periods = termYears * 26;
  const periodRate = (interestRate / 100) / 26;
  const biweeklyPayment = (loanAmount * (periodRate * Math.pow(1 + periodRate, periods))) / (Math.pow(1 + periodRate, periods) - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eSignature.trim()) return;

    const newLoan: TSPLoan = {
      id: `LOAN-2026-${Math.floor(100 + Math.random() * 900)}`,
      type: loanType,
      originalAmount: loanAmount,
      currentBalance: loanAmount,
      interestRate: interestRate,
      issueDate: new Date().toISOString().split('T')[0],
      termMonths: termYears * 12,
      repaymentPerPayPeriod: Math.round(biweeklyPayment * 100) / 100,
      status: 'Processing',
      collateralAsset: `Segregated ${loanType === 'General Purpose' ? 'Gold Sovereign Reserve' : 'Depository Bullion Reserve'}`,
      userId: user.id,
      userName: user.name,
      userAccount: user.accountNumber,
      purpose: `${loanType} Bullion-Backed Loan Application`
    };

    onLoanSubmitted(newLoan, `Your $${loanAmount.toLocaleString()} ${loanType} loan application has been submitted (ID: #${newLoan.id}). Status: PROCESSING (Pending Super Admin Depository Approval). Funds will disburse upon admin authorization.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200" id="loan-request-wizard">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-800 flex items-center justify-center text-amber-400">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-black text-sm text-white">VBSP Loan Application</h2>
              <p className="text-[11px] text-slate-300">Borrow Against Your Own VBSP Account</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50 text-[11px] font-bold">
          <div className={`p-2.5 text-center border-b-2 ${step >= 1 ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-400'}`}>
            1. Amount & Term
          </div>
          <div className={`p-2.5 text-center border-b-2 ${step >= 2 ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-400'}`}>
            2. Direct Deposit
          </div>
          <div className={`p-2.5 text-center border-b-2 ${step >= 3 ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-400'}`}>
            3. Review & E-Sign
          </div>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Select Loan Purpose</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => { setLoanType('General Purpose'); setTermYears(Math.min(termYears, 5)); }}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      loanType === 'General Purpose' ? 'border-blue-900 bg-blue-50/70 text-blue-950 font-bold' : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <Briefcase className="w-4 h-4 text-blue-800 mb-1" />
                    <div className="text-xs">General Purpose</div>
                    <div className="text-[10px] text-slate-500 font-normal">Term 1 to 5 years • No documentation</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setLoanType('Residential'); setTermYears(15); }}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      loanType === 'Residential' ? 'border-blue-900 bg-blue-50/70 text-blue-950 font-bold' : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <Home className="w-4 h-4 text-blue-800 mb-1" />
                    <div className="text-xs">Residential Loan</div>
                    <div className="text-[10px] text-slate-500 font-normal">Term 1 to 15 years • Purchase of home</div>
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Requested Loan Amount ($)</span>
                  <span className="text-blue-900 font-black text-sm">${loanAmount.toLocaleString()}</span>
                </div>
                <input 
                  type="range" 
                  min="1000" 
                  max={maxLoanAllowed} 
                  step="500"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full accent-blue-900"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>Min: $1,000</span>
                  <span>Max Available: ${maxLoanAllowed.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Repayment Term</label>
                <select 
                  value={termYears}
                  onChange={(e) => setTermYears(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  <option value={1}>1 Year (26 Pay Periods)</option>
                  <option value={2}>2 Years (52 Pay Periods)</option>
                  <option value={3}>3 Years (78 Pay Periods)</option>
                  <option value={4}>4 Years (104 Pay Periods)</option>
                  <option value={5}>5 Years (130 Pay Periods)</option>
                  {loanType === 'Residential' && (
                    <>
                      <option value={10}>10 Years (260 Pay Periods)</option>
                      <option value={15}>15 Years (390 Pay Periods)</option>
                    </>
                  )}
                </select>
              </div>

              {/* Repayment Summary Box */}
              <div className="bg-slate-900 text-white rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">Interest Rate (G Fund Rate):</span>
                  <span className="font-bold text-amber-300">{interestRate}% Fixed</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">Automatic Payroll Deduction:</span>
                  <span className="font-black text-emerald-300 text-base">
                    ${biweeklyPayment.toFixed(2)} <span className="text-xs font-normal text-slate-300">/ paycheck</span>
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                  Loan principal and interest are paid directly back into your own VBSP account. $50 loan fee is deducted from disbursement.
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Continue to Direct Deposit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-xs text-blue-900 font-medium">
                Funds are disbursed via direct deposit within 2 to 3 business days of approval.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Disbursement Bank Account</label>
                <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl space-y-1 text-xs">
                  <div className="font-bold text-slate-900">Navy Federal Credit Union (Checking)</div>
                  <div className="text-slate-600">Routing: 051000033 • Account: ••••••••4892</div>
                  <div className="text-[10px] text-emerald-700 font-bold">Verified on file</div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Employing Agency Payroll Office</label>
                <input 
                  type="text" 
                  value="USDA National Finance Center (NFC)" 
                  disabled
                  className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 cursor-not-allowed"
                />
              </div>

              <div className="flex justify-between pt-4">
                <button 
                  onClick={() => setStep(1)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Back
                </button>
                <button 
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Continue to E-Signature</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2 text-slate-700">
                <div className="font-bold text-slate-900">Loan Terms Summary</div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>Loan Amount: <strong>${loanAmount.toLocaleString()}</strong></div>
                  <div>Term: <strong>{termYears} Years</strong></div>
                  <div>Interest Rate: <strong>{interestRate}%</strong></div>
                  <div>Bi-Weekly Deduction: <strong>${biweeklyPayment.toFixed(2)}</strong></div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Participant Agreement & Promissory Note</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  I authorize my employing agency to deduct ${biweeklyPayment.toFixed(2)} from my basic pay every pay period until this loan is repaid in full.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Type Your Full Legal Name as Electronic Signature
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

              <div className="flex justify-between pt-2">
                <button 
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Back
                </button>
                <button 
                  type="submit"
                  disabled={!eSignature.trim()}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <span>Submit Loan Request</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
