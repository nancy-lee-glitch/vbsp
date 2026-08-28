import React, { useState } from 'react';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck, 
  Lock,
  Smartphone,
  Save,
  Plus
} from 'lucide-react';
import { UserAccount } from '../../types';

interface BankingContactSettingsProps {
  user: UserAccount;
  onUpdateUser: (updatedUser: UserAccount, message: string) => void;
  onNavigateToKYC?: () => void;
}

export const BankingContactSettings: React.FC<BankingContactSettingsProps> = ({
  user,
  onUpdateUser,
  onNavigateToKYC
}) => {
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [address, setAddress] = useState(user.address);
  const [paperless, setPaperless] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  const [bankRouting, setBankRouting] = useState('051000033');
  const [bankAccount, setBankAccount] = useState('••••••••4892');
  const [bankName, setBankName] = useState('Navy Federal Credit Union');

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserAccount = {
      ...user,
      email,
      phone,
      address
    };
    onUpdateUser(updated, 'Your contact information and communications preferences have been updated.');
    setSuccessMsg('Profile information successfully saved.');
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  return (
    <div className="space-y-6 pb-12" id="banking-contact-settings">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <h2 className="text-xl font-black text-slate-900 mb-1">Profile, Banking & Communications Settings</h2>
        <p className="text-xs text-slate-600">
          Manage your verified direct deposit banking accounts, residential address, multi-factor phone numbers, and electronic paperless preferences.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* KYC & Identity Verification Status Banner */}
      <div className="bg-gradient-to-r from-[#112e51] to-[#005ea2] text-white rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-white/10 text-[#f2a900] flex items-center justify-center font-bold shrink-0 border border-white/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-white">Identity Verification & KYC Documents</span>
              <span className="px-2 py-0.5 bg-emerald-500 text-white rounded text-[10px] font-black uppercase tracking-wider">
                {user.kycProfile?.overallStatus || 'Verified (Tier 1)'}
              </span>
            </div>
            <p className="text-xs text-slate-200 mt-0.5">
              Social Security Card, Government Photo ID, and International Passport records on file for depository compliance.
            </p>
          </div>
        </div>
        {onNavigateToKYC && (
          <button
            type="button"
            onClick={onNavigateToKYC}
            className="px-4 py-2.5 bg-[#f2a900] hover:bg-[#d99600] text-slate-950 font-black text-xs rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            Manage KYC Documents & Uploads
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Information Form */}
        <form onSubmit={handleSaveContact} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-800" />
            <span>Contact & Address on File</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone (MFA & SMS Alerts)</label>
            <input 
              type="text" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Residential Address</label>
            <input 
              type="text" 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
              required
            />
          </div>

          {/* Paperless Toggle */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <div className="font-bold text-xs text-slate-900">Paperless e-Delivery</div>
              <div className="text-[11px] text-slate-500">Receive statements and notices via email</div>
            </div>
            <input 
              type="checkbox" 
              checked={paperless}
              onChange={(e) => setPaperless(e.target.checked)}
              className="w-4 h-4 accent-blue-900 cursor-pointer"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button 
              type="submit"
              className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Contact Updates</span>
            </button>
          </div>
        </form>

        {/* Banking Direct Deposit Section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-700" />
            <span>Verified Direct Deposit Account</span>
          </h3>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-black text-sm text-slate-900">{bankName}</span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded text-[10px] font-black">
                Active Checking
              </span>
            </div>
            <div className="text-xs text-slate-600">
              <div>Routing Transit: <strong>{bankRouting}</strong></div>
              <div>Account Number: <strong>{bankAccount}</strong></div>
            </div>
            <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200">
              Used for loan disbursements, taxable distributions, and direct deposit refunds.
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-800" />
              <span>Direct Deposit Security Notice</span>
            </div>
            <p className="text-[11px]">
              For security against fraud, newly added banking accounts have a 7-day settlement period before distributions can be released.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
