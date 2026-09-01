import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Lock, 
  User, 
  KeyRound, 
  Smartphone, 
  CheckCircle2, 
  ArrowRight, 
  X, 
  AlertCircle,
  ExternalLink,
  Eye,
  EyeOff,
  Coins,
  Building,
  Check,
  UserPlus,
  Sparkles,
  HelpCircle,
  FileCheck,
  Landmark
} from 'lucide-react';
import { UserAccount, VBSPAccountType } from '../../types';
import { INITIAL_USER, MOCK_USERS } from '../../data/mockData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
  users?: UserAccount[];
  initialMode?: 'login' | 'onboarding';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  users = MOCK_USERS,
  initialMode = 'login'
}) => {
  const [authStep, setAuthStep] = useState<'login' | 'mfa' | 'onboarding' | 'recovery'>('login');
  
  // Selected user for login
  const [selectedUserToLogin, setSelectedUserToLogin] = useState<UserAccount>(users[0] || INITIAL_USER);

  // Login form state
  const [accountNumber, setAccountNumber] = useState('');
  const [password, setPassword] = useState('');
  const [thriftlinePin, setThriftlinePin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // MFA state
  const [mfaCode, setMfaCode] = useState('');
  const [mfaError, setMfaError] = useState('');

  // Onboarding / Registration State
  const [onboardStep, setOnboardStep] = useState<1 | 2 | 3>(1);
  const [onboardName, setOnboardName] = useState('');
  const [onboardEmail, setOnboardEmail] = useState('');
  const [onboardPhone, setOnboardPhone] = useState('');
  const [onboardSsn, setOnboardSsn] = useState('');
  const [onboardDob, setOnboardDob] = useState('');
  const [onboardAgency, setOnboardAgency] = useState('Department of Defense (DoD)');
  const [onboardPlanType, setOnboardPlanType] = useState<VBSPAccountType>('VBSP Standard Account (Taxable Reserve)');
  const [onboardPassword, setOnboardPassword] = useState('');
  const [onboardPin, setOnboardPin] = useState('883142');
  const [isRegistering, setIsRegistering] = useState(false);
  const [createdUser, setCreatedUser] = useState<UserAccount | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState<number>(3);

  // Synchronize initial mode when opened
  useEffect(() => {
    if (isOpen) {
      if (initialMode === 'onboarding') {
        setAuthStep('onboarding');
        setOnboardStep(1);
      } else {
        setAuthStep('login');
      }
      setErrorMessage('');
      setMfaError('');
      setMfaCode('');
      setCreatedUser(null);
      setRedirectCountdown(3);
    }
  }, [isOpen, initialMode]);

  // Automatic redirect and modal closure after registration completes (Step 3)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    let interval: NodeJS.Timeout;

    if (authStep === 'onboarding' && onboardStep === 3 && createdUser) {
      interval = setInterval(() => {
        setRedirectCountdown((prev) => (prev > 1 ? prev - 1 : 1));
      }, 1000);

      timer = setTimeout(() => {
        onLoginSuccess(createdUser);
        onClose();
      }, 2500);
    }

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [authStep, onboardStep, createdUser, onLoginSuccess, onClose]);

  if (!isOpen) return null;

   const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!accountNumber.trim()) {
      setErrorMessage('Please enter your VBSP account number or registered email.');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Please enter your password.');
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountNumber: accountNumber.trim(),
          email: accountNumber.trim(),
          password: password.trim(),
          pin: thriftlinePin.trim(),
        }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        const loggedInUser: UserAccount = {
          id: String(data.user.id),
          name: data.user.full_name || 'Vault Participant',
          email: data.user.email || '',
          accountNumber: data.user.account_number || accountNumber.trim(),
          thriftlinePin: data.user.thriftline_pin || thriftlinePin || '',
          phone: '',
          address: '',
          employingAgency: data.user.employing_agency || '',
          planType: data.user.account_type || 'VBSP Standard Account (Taxable Reserve)',
          hireDate: '',
          totalBalance: Number(data.user.total_balance || 0),
          traditionalBalance: Number(data.user.traditional_balance || 0),
          rothBalance: Number(data.user.roth_balance || 0),
          ytdReturn: 0,
          vaultDepositaryLocation: data.user.vault_facility || 'Zurich FreePort / Delaware Depository',
          goldOuncesEquivalent: Number(data.user.gold_ounces_equivalent || 0),
          silverOuncesEquivalent: Number(data.user.silver_ounces_equivalent || 0),
          ytdContributions: { employee: 0, agencyMatch: 0, agencyAutomatic: 0 },
          contributionAllocations: {},
          currentHoldings: [],
          beneficiaries: [],
          activeLoans: [],
          transactions: [],
          kycProfile: {
            overallStatus: 'Verified',
            riskTier: 'Tier 1 Individual',
            ssnMasked: '***-**-****',
            additionalDocuments: []
          }
        };

        setSelectedUserToLogin(loggedInUser);
        onLoginSuccess(loggedInUser);
        onClose();
        return;
      } else {
        setErrorMessage(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('Unable to connect to the server. Please try again.');
    }
  };

  const handleMfaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMfaError('');

    if (mfaCode.length < 4) {
      setMfaError('Please enter the 6-digit security verification code (Demo: 984210).');
      return;
    }

    // Success
    onLoginSuccess(selectedUserToLogin);
    onClose();
  };

   const handlePerformRegistration = async () => {
    if (!onboardName.trim() || !onboardEmail.trim() || !onboardPassword.trim()) {
      setErrorMessage('Please fill in Full Legal Name, Email and Password.');
      return;
    }

    setIsRegistering(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: onboardName.trim(),
          email: onboardEmail.trim(),
          password: onboardPassword.trim(),
          accountType: onboardPlanType,
        }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        const createdUserAccount: UserAccount = {
          id: String(data.user.id),
          name: data.user.full_name || onboardName.trim(),
          email: data.user.email || onboardEmail.trim(),
          accountNumber: data.user.account_number,
          thriftlinePin: data.user.thriftline_pin || onboardPin,
          phone: onboardPhone || '',
          address: '',
          employingAgency: onboardAgency || '',
          planType: data.user.account_type || onboardPlanType,
          hireDate: new Date().toISOString().split('T')[0],
          totalBalance: 0,
          traditionalBalance: 0,
          rothBalance: 0,
          ytdReturn: 0,
          vaultDepositaryLocation: 'Zurich FreePort & Delaware Depository Segregated Vault',
          goldOuncesEquivalent: 0,
          silverOuncesEquivalent: 0,
          ytdContributions: { employee: 0, agencyMatch: 0, agencyAutomatic: 0 },
          contributionAllocations: { 'G': 50, 'S': 50 },
          currentHoldings: [],
          beneficiaries: [],
          activeLoans: [],
          transactions: [],
          kycProfile: {
            overallStatus: 'Pending Review',
            riskTier: 'Tier 1 Individual',
            ssnMasked: onboardSsn ? `***-**-${onboardSsn.slice(-4)}` : 'Unverified',
            additionalDocuments: []
          }
        };

        setCreatedUser(createdUserAccount);
        setOnboardStep(3);
      } else {
        setErrorMessage(data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrorMessage('Unable to connect to the server. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };
  
  const handleFinishRegistration = () => {
    if (createdUser) {
      onLoginSuccess(createdUser);
      onClose();
    }
  };
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto" 
      id="auth-modal"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-white rounded-sm shadow-2xl border border-slate-300 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header with Mode Switcher */}
        <div className="bg-[#112e51] text-white p-4 sm:p-5 flex items-center justify-between border-b border-[#002f5a]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xs bg-[#002f5a] flex items-center justify-center text-[#f2a900] border border-[#004f87] shrink-0">
              {authStep === 'onboarding' ? <UserPlus className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="font-black text-sm sm:text-base text-white">
                {authStep === 'onboarding' ? 'Open a Bullion Savings Account' : 'Sign In to Your Vault Account'}
              </h2>
              <p className="text-[11px] text-slate-300">
                Vertex Bullion Savings Plan • Institutional Sovereign Custody
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1.5 rounded-sm hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Navigation Tabs (Sign In vs Open Account) */}
        <div className="grid grid-cols-2 bg-slate-100 border-b border-slate-300 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setAuthStep('login'); setErrorMessage(''); }}
            className={`py-2.5 px-3 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              authStep === 'login' || authStep === 'mfa' || authStep === 'recovery'
                ? 'bg-white text-[#005ea2] border-b-2 border-[#005ea2] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Sign In (Existing Member)</span>
          </button>

          <button
            type="button"
            onClick={() => { setAuthStep('onboarding'); setOnboardStep(1); setErrorMessage(''); }}
            className={`py-2.5 px-3 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              authStep === 'onboarding'
                ? 'bg-white text-[#005ea2] border-b-2 border-[#005ea2] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-[#f2a900]" />
            <span>Open Account / Enroll</span>
          </button>
        </div>

        {/* Security Warning Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-[11px] text-amber-900 flex items-center gap-1.5 font-medium">
          <Shield className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span>FIPS 140-2 Level 3 Custody Hardware • 256-Bit TLS Encrypted Session</span>
        </div>

        <div className="p-4 sm:p-6">
          
          {/* ------------------------------------------------ */}
          {/* STEP 1: CREDENTIALS SIGN IN */}
          {/* ------------------------------------------------ */}
          {authStep === 'login' && (
            <div className="space-y-4">
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xs text-xs text-red-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    VBSP Account Number or Registered Email *
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="VBSP-0089-4412-98 or email@agency.gov"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xs pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#005ea2]"
                      required
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Vault Master Password *
                  </label>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xs pl-9 pr-10 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#005ea2]"
                      required
                    />
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      6-Digit ThriftLine PIN *
                    </label>
                    <button 
                      type="button" 
                      onClick={() => setAuthStep('recovery')}
                      className="text-[11px] text-[#005ea2] hover:underline font-semibold cursor-pointer"
                    >
                      Forgot PIN?
                    </button>
                  </div>
                  <div className="relative">
                    <input 
                      type="password" 
                      maxLength={6}
                      value={thriftlinePin}
                      onChange={(e) => setThriftlinePin(e.target.value.replace(/\D/g, ''))}
                      placeholder="829415"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xs pl-9 pr-3 py-2 text-xs font-mono font-bold tracking-widest text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#005ea2]"
                      required
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div className="pt-1">
                  <button 
                    type="submit"
                    className="w-full py-2.5 bg-[#005ea2] hover:bg-[#112e51] text-white font-black text-xs sm:text-sm rounded-xs transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer border border-[#004f87]"
                  >
                    <span>Sign In to Vault Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Account Registration Link */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Not enrolled yet?</span>
                  <button 
                    type="button"
                    onClick={() => { setAuthStep('onboarding'); setOnboardStep(1); }}
                    className="text-[#005ea2] hover:underline font-black cursor-pointer flex items-center gap-1"
                  >
                    <span>Open an Account / Get Started</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ------------------------------------------------ */}
          {/* STEP 2: MULTI-FACTOR AUTHENTICATION (MFA) */}
          {/* ------------------------------------------------ */}
          {authStep === 'mfa' && (
            <form onSubmit={handleMfaSubmit} className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 bg-blue-100 text-[#005ea2] rounded-full flex items-center justify-center mx-auto mb-2">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-slate-900">Two-Step Hardware Verification</h3>
                <p className="text-xs text-slate-600">
                  We sent a 6-digit authentication passcode for <strong>{selectedUserToLogin.name}</strong> to registered phone ending in <strong>•0199</strong>.
                </p>
              </div>

              {mfaError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-xs text-xs text-red-700">
                  {mfaError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 text-center">
                  Enter 6-Digit Passcode (Demo: 984210)
                </label>
                <input 
                  type="text" 
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="984210"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xs py-3 text-center text-xl font-black tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005ea2]"
                  autoFocus
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-[#005ea2] hover:bg-[#112e51] text-white font-bold text-xs sm:text-sm rounded-xs transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Verify & Unlock Bullion Vault</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </button>

              <button 
                type="button" 
                onClick={() => setAuthStep('login')}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-700 font-semibold cursor-pointer"
              >
                Back to Sign In
              </button>
            </form>
          )}

          {/* ------------------------------------------------ */}
          {/* STEP 3: ONBOARDING / NEW ACCOUNT REGISTRATION */}
          {/* ------------------------------------------------ */}
          {authStep === 'onboarding' && (
            <div className="space-y-4">
              
              {/* Progress Steps Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#005ea2] text-white flex items-center justify-center font-bold text-xs">
                    {onboardStep}
                  </div>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                      {onboardStep === 1 && 'Step 1: Participant Information'}
                      {onboardStep === 2 && 'Step 2: Custody Security & PIN'}
                      {onboardStep === 3 && 'Step 3: Vault Title Activated!'}
                    </h3>
                    <span className="text-[10px] text-slate-500">
                      {onboardStep === 1 && 'Personal details and plan classification'}
                      {onboardStep === 2 && 'Set master credentials and ThriftLine PIN'}
                      {onboardStep === 3 && 'Allocated Zurich/NY depository ready'}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-[#005ea2]">
                  {onboardStep} of 3
                </span>
              </div>

              {/* Step 1 Form */}
              {onboardStep === 1 && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Account Classification *
                    </label>
                    <select 
                      value={onboardPlanType}
                      onChange={(e: any) => setOnboardPlanType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#005ea2]"
                    >
                      <option value="VBSP Standard Account (Taxable Reserve)">VBSP Standard Account (Taxable Reserve)</option>
                      <option value="VBSP Sovereign Custody (Self-Directed / IRA)">VBSP Sovereign Custody (Self-Directed / IRA)</option>
                      <option value="VBSP Institutional / Corporate Reserve">VBSP Institutional / Corporate Reserve</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name *</label>
                    <input 
                      type="text" 
                      value={onboardName}
                      onChange={(e) => setOnboardName(e.target.value)}
                      placeholder="e.g. Captain James E. Mitchell"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#005ea2]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Official Email *</label>
                      <input 
                        type="email" 
                        value={onboardEmail}
                        onChange={(e) => setOnboardEmail(e.target.value)}
                        placeholder="james.mitchell@agency.gov"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#005ea2]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone (MFA) *</label>
                      <input 
                        type="tel" 
                        value={onboardPhone}
                        onChange={(e) => setOnboardPhone(e.target.value)}
                        placeholder="(202) 555-0149"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#005ea2]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Last 4 SSN / Tax ID *</label>
                      <input 
                        type="text" 
                        maxLength={4}
                        value={onboardSsn}
                        onChange={(e) => setOnboardSsn(e.target.value.replace(/\D/g, ''))}
                        placeholder="4412"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#005ea2]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth *</label>
                      <input 
                        type="date" 
                        value={onboardDob}
                        onChange={(e) => setOnboardDob(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#005ea2]"
                      />
                    </div>
                  </div>

                  <button 
                    type="button"
                    onClick={() => setOnboardStep(2)}
                    className="w-full py-2.5 bg-[#005ea2] hover:bg-[#112e51] text-white font-bold text-xs rounded-xs cursor-pointer mt-2 flex items-center justify-center gap-2 shadow-xs"
                  >
                    <span>Continue to Security Setup</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Step 2 Form */}
              {onboardStep === 2 && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Create Vault Password *</label>
                    <input 
                      type="password" 
                      value={onboardPassword}
                      onChange={(e) => setOnboardPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#005ea2]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Choose 6-Digit ThriftLine PIN *</label>
                    <input 
                      type="password" 
                      maxLength={6}
                      value={onboardPin}
                      onChange={(e) => setOnboardPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="883142"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 text-xs font-mono font-bold tracking-widest text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#005ea2]"
                    />
                    <span className="text-[10px] text-slate-500 block mt-0.5">Used for automated phone verification and expedited withdrawals.</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xs text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Automatic 1% Agency Contribution + Up to 4% Match Claimed</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>100% Allocated LBMA-Certified Depository Storage Title</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => setOnboardStep(1)}
                      disabled={isRegistering}
                      className="w-1/3 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xs cursor-pointer disabled:opacity-50"
                    >
                      Back
                    </button>
                    <button 
                      type="button"
                      onClick={handlePerformRegistration}
                      disabled={isRegistering}
                      className="w-2/3 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xs cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                    >
                      {isRegistering ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Provisioning Vault...</span>
                        </>
                      ) : (
                        <>
                          <span>Create Account & Allocate Vault</span>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3 Success */}
              {onboardStep === 3 && (
                <div className="space-y-4 text-center py-2 animate-in fade-in">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-slate-900">Sovereign Vault Account Created!</h4>
                    <p className="text-xs text-slate-600 mt-1">
                      Welcome, <strong>{createdUser?.name || onboardName || 'Participant'}</strong>. Your allocated bullion depository account has been provisioned.
                    </p>
                  </div>
                  
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xs text-left text-xs space-y-2 font-medium">
                    <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                      <span className="text-slate-500 font-semibold">Assigned Account #:</span>
                      <strong className="font-mono text-sm text-[#005ea2] font-black bg-blue-50 px-2 py-0.5 rounded-xs border border-blue-200">
                        {createdUser?.accountNumber || 'VBSP-2026-8819-02'}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Depository Facility:</span>
                      <strong className="text-slate-900">Zurich FreePort & Delaware Depository</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Initial Allocation:</span>
                      <strong className="text-emerald-700 font-bold">Gold Sovereign (G) & Silver (S) Funds</strong>
                    </div>
                  </div>

                  {/* Auto Close / Redirect Notice */}
                  <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-xs text-xs text-[#005ea2] flex items-center justify-center gap-2 font-semibold">
                    <div className="w-2.5 h-2.5 bg-[#005ea2] rounded-full animate-ping"></div>
                    <span>Entering your vault in {redirectCountdown}s...</span>
                  </div>

                  <button 
                    type="button"
                    onClick={handleFinishRegistration}
                    className="w-full py-3 bg-[#005ea2] hover:bg-[#112e51] text-white font-black text-xs sm:text-sm rounded-xs cursor-pointer shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Enter Vault Dashboard Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 text-center">
                <button 
                  type="button" 
                  onClick={() => setAuthStep('login')}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer underline"
                >
                  Already have an account? Sign in here
                </button>
              </div>
            </div>
          )}

          {/* ------------------------------------------------ */}
          {/* STEP 4: RECOVERY */}
          {/* ------------------------------------------------ */}
          {authStep === 'recovery' && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h3 className="font-bold text-base text-slate-900">Credentials & PIN Recovery</h3>
                <p className="text-xs text-slate-600">
                  Enter your registered email address on file to receive a secure password and ThriftLine PIN reset link.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Registered Sovereign or Treasury Email</label>
                <input 
                  type="email" 
                  defaultValue="arthur.vance@defense.gov"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#005ea2]"
                />
              </div>

              <button 
                type="button"
                onClick={() => { alert('A password reset instruction email has been dispatched to your email address.'); setAuthStep('login'); }}
                className="w-full py-2.5 bg-[#005ea2] text-white font-bold text-xs rounded-xs hover:bg-[#112e51] cursor-pointer"
              >
                Send Reset Link
              </button>

              <button 
                type="button" 
                onClick={() => setAuthStep('login')}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-700 font-semibold cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
