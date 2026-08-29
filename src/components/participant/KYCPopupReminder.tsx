import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  X, 
  FileText, 
  UploadCloud, 
  Clock, 
  Lock, 
  Building2,
  ExternalLink,
  ShieldQuestion
} from 'lucide-react';
import { UserAccount } from '../../types';

interface KYCPopupReminderProps {
  user: UserAccount;
  onNavigateToKyc: () => void;
}

export const KYCPopupReminder: React.FC<KYCPopupReminderProps> = ({
  user,
  onNavigateToKyc
}) => {
  const kycStatus = user.kycProfile?.overallStatus || 'Not Verified';
  const isVerified = kycStatus === 'Verified (Tier 1 Allocated)';
  
  // Track popup visibility in local state
  const [isOpen, setIsOpen] = useState(false);
  const [lastDismissed, setLastDismissed] = useState<number>(0);

  // Automatically show popup when user is not verified, and re-remind periodically
  useEffect(() => {
    if (!isVerified) {
      // Show initially after 1.5 seconds if not dismissed recently
      const timer = setTimeout(() => {
        const now = Date.now();
        if (now - lastDismissed > 60000) { // 1 min reminder interval if unverified
          setIsOpen(true);
        }
      }, 1500);

      return () => clearTimeout(timer);
    } else {
      setIsOpen(false);
    }
  }, [user.id, kycStatus, isVerified, lastDismissed]);

  const handleDismiss = () => {
    setIsOpen(false);
    setLastDismissed(Date.now());
  };

  const handleGoToKyc = () => {
    setIsOpen(false);
    onNavigateToKyc();
  };

  if (isVerified) return null;

  return (
    <>
      {/* Persistent Sticky / Floating Bottom-Right Indicator when popup is minimized */}
      {!isOpen && (
        <div className="fixed bottom-18 sm:bottom-6 right-4 z-40 animate-bounce">
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-red-800 hover:bg-red-700 text-white rounded-xs shadow-lg border border-red-700 text-xs font-bold cursor-pointer transition-all hover:scale-105"
            id="kyc-floating-alert-btn"
          >
            <div className="relative">
              <ShieldAlert className="w-4 h-4 text-amber-300" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-ping"></span>
            </div>
            <span>KYC: {kycStatus === 'Pending Review' ? 'Under Review' : 'Action Required (Not Verified)'}</span>
          </button>
        </div>
      )}

      {/* Modal Popup for Unverified User */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200"
          id="kyc-reminder-popup-modal"
          onClick={handleDismiss}
        >
          <div 
            className="w-full max-w-lg bg-white rounded-xs shadow-2xl border border-slate-300 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`p-5 text-white flex items-center justify-between border-b ${
              kycStatus === 'Pending Review' 
                ? 'bg-[#112e51] border-[#002f5a]' 
                : 'bg-[#8b0000] border-red-950'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xs bg-black/20 flex items-center justify-center text-amber-300 border border-white/20 shrink-0">
                  {kycStatus === 'Pending Review' ? <Clock className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white/15 text-amber-200 rounded-2xs text-[10px] font-bold uppercase tracking-wider mb-1">
                    <span>MANDATORY FEDERAL COMPLIANCE</span>
                  </div>
                  <h3 className="font-bold text-base text-white">
                    {kycStatus === 'Pending Review' 
                      ? 'KYC Verification Under Admin Review' 
                      : 'Identity Verification Required (Not Verified)'}
                  </h3>
                </div>
              </div>
              <button 
                onClick={handleDismiss}
                className="text-white/70 hover:text-white p-1.5 rounded-xs hover:bg-white/10 transition-colors cursor-pointer"
                title="Remind me later"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 text-xs text-slate-700">
              {kycStatus === 'Pending Review' ? (
                <div className="space-y-3">
                  <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xs text-blue-950 space-y-1.5">
                    <div className="font-bold flex items-center gap-1.5 text-blue-900">
                      <Clock className="w-4 h-4 text-blue-700" />
                      <span>Documents Awaiting Super Admin Sign-off</span>
                    </div>
                    <p className="text-[11px] text-blue-800">
                      Your identity documents (Photo ID & Proof of Address) have been uploaded and are currently in the Super Admin Compliance Review Queue.
                    </p>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    The Super Admin is verifying your credentials against the sovereign vault registry. Once approved, full transactional capabilities (including gold/silver transfers and physical delivery) will unlock automatically.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-xs text-red-950 space-y-1.5">
                    <div className="font-bold flex items-center gap-1.5 text-red-900">
                      <Lock className="w-4 h-4 text-red-700" />
                      <span>Depository Account Status: NOT VERIFIED</span>
                    </div>
                    <p className="text-[11px] text-red-800">
                      Per the Bank Secrecy Act (BSA), FinCEN regulations, and Sovereign Custody protocols, new participant accounts must complete KYC verification before executing bullion purchases, loan applications, or withdrawals.
                    </p>
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="font-bold text-slate-900">Required Verification Steps:</div>
                    <ul className="space-y-1.5 text-slate-600">
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-slate-900">1.</span>
                        <span>Upload Government Photo ID (Driver's License or Passport)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-slate-900">2.</span>
                        <span>Verify Social Security Number / Tax Identification</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-slate-900">3.</span>
                        <span>Submit Proof of Residential Address (Utility Bill or Lease)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-slate-900">4.</span>
                        <span>Super Admin reviews and approves Tier 1 bullion allocation</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={handleDismiss}
                  className="w-full sm:w-auto px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-semibold hover:bg-slate-100 rounded-xs cursor-pointer border border-transparent"
                >
                  Remind Me Later
                </button>
                <button
                  onClick={handleGoToKyc}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#112e51] hover:bg-[#002f5a] text-white text-xs font-bold rounded-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors border border-[#002f5a]"
                  id="kyc-popup-verify-now-btn"
                >
                  <UploadCloud className="w-4 h-4 text-[#f2a900]" />
                  <span>{kycStatus === 'Pending Review' ? 'Review Uploaded Documents' : 'Upload Documents & Verify Now'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
