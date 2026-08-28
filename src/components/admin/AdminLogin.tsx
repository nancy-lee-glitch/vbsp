import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  KeyRound, 
  User, 
  AlertCircle, 
  ArrowRight, 
  SlidersHorizontal,
  Eye,
  EyeOff,
  Shield
} from 'lucide-react';
import { SiteBrandingSettings } from '../../types';

interface AdminLoginProps {
  onAdminLoginSuccess: () => void;
  onCancel: () => void;
  branding?: SiteBrandingSettings;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ 
  onAdminLoginSuccess, 
  onCancel,
  branding 
}) => {
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const u = adminUsername.trim().toLowerCase();
      const p = adminPassword.trim();
      const pin = adminPin.trim();

      // Validate administrative credentials
      const validUsers = ['admin@vbsp.org', 'admin@frtib.gov', 'frtib_admin', 'admin', 'executive@vbsp.org'];
      const validPasswords = ['VBSP_Admin_2026!', 'FRTIB_Admin_2026!', 'Admin2026!', 'admin123'];
      const validPins = ['990011', '829415', '123456'];

      if (validUsers.includes(u) && validPasswords.includes(p) && validPins.includes(pin)) {
        setIsLoading(false);
        onAdminLoginSuccess();
      } else {
        setIsLoading(false);
        setErrorMessage('Invalid administrative credentials, master password, or FIPS security PIN.');
      }
    }, 600);
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4" id="admin-login-view">
      <div className="bg-white border-2 border-[#112e51] rounded-sm shadow-xl overflow-hidden">
        {/* Header Banner */}
        <div className="bg-[#112e51] text-white p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {branding?.logoUrl ? (
                <div className="w-12 h-12 rounded-sm overflow-hidden bg-white p-1 border border-slate-300 flex items-center justify-center">
                  <img src={branding.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-sm bg-[#005ea2] flex items-center justify-center text-[#f2a900] border border-[#004f87] shadow-xs">
                  <SlidersHorizontal className="w-6 h-6" />
                </div>
              )}
              <div>
                <span className="text-[11px] font-bold tracking-wider text-[#f2a900] uppercase block">
                  {branding?.siteName || 'VERTEX BULLION SAVINGS PLAN'}
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  Executive Administrative Terminal
                </h1>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-3 leading-relaxed">
            Restricted access for Custodial Board Officers, Bullion Vault Controllers & Compliance Officers. Authenticate to manage spot prices, participants, site branding, and communications.
          </p>
        </div>

        {/* Security Warning */}
        <div className="bg-[#e1f3f8] border-b border-slate-300 p-3.5 text-xs text-[#112e51] flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-[#005ea2] shrink-0 mt-0.5" />
          <div>
            <strong>Authorized Administrative Terminal:</strong> All administrative activities, share price updates, email dispatches, and record overrides are logged into immutable NIST SP 800-53 audit ledgers.
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {errorMessage && (
            <div className="bg-red-50 border border-red-300 text-red-800 text-xs p-3 rounded-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Admin Officer Username / Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input 
                  type="text" 
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="admin@vbsp.org"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xs pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#005ea2] focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Master Administrative Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xs pl-9 pr-10 py-2 text-xs font-mono font-semibold text-slate-900 focus:bg-white focus:border-[#005ea2] focus:outline-none"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Executive Security PIN / FIPS 140-2 Key
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input 
                  type="password"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  placeholder="••••••"
                  maxLength={6}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xs pl-9 pr-3 py-2 text-xs font-mono font-bold tracking-widest text-slate-900 focus:bg-white focus:border-[#005ea2] focus:outline-none"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#005ea2] hover:bg-[#112e51] text-white font-bold text-xs sm:text-sm rounded-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border border-[#004f87]"
            >
              {isLoading ? (
                <span>Authenticating Administrator...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-[#f2a900]" />
                  <span>Access Executive Admin Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <button 
              type="button"
              onClick={onCancel}
              className="text-xs text-slate-600 hover:text-slate-900 underline font-medium cursor-pointer"
            >
              Return to Public Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
