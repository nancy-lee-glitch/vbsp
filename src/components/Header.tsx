import React, { useState, useEffect, useRef } from 'react';
import { 
  PortalView, 
  UserAccount,
  SiteBrandingSettings,
  TSPFund
} from '../types';
import { 
  Shield, 
  Lock, 
  Search, 
  ChevronDown, 
  User, 
  Building2, 
  SlidersHorizontal, 
  Type, 
  LogOut,
  Sparkles,
  Menu,
  X,
  TrendingUp,
  Calculator,
  FileText,
  HelpCircle,
  ShieldCheck,
  Landmark,
  ArrowRight,
  ExternalLink,
  Phone,
  Coins,
  DollarSign,
  Briefcase,
  AlertCircle,
  UserPlus,
  BookOpen,
  FileCheck,
  ChevronRight,
  Layers
} from 'lucide-react';

interface HeaderProps {
  currentView: PortalView;
  onNavigate: (view: PortalView) => void;
  contrastMode: 'normal' | 'high';
  onToggleContrast: () => void;
  fontSize: 'normal' | 'large' | 'xlarge';
  onChangeFontSize: (size: 'normal' | 'large' | 'xlarge') => void;
  onOpenSearch: () => void;
  currentUser: UserAccount | null;
  onOpenAuthModal: (mode?: 'login' | 'onboarding') => void;
  onLogout: () => void;
  branding: SiteBrandingSettings;
  funds?: TSPFund[];
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  contrastMode,
  onToggleContrast,
  fontSize,
  onChangeFontSize,
  onOpenSearch,
  currentUser,
  onOpenAuthModal,
  onLogout,
  branding,
  funds = []
}) => {
  const [govBannerOpen, setGovBannerOpen] = useState(false);
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Allow external triggers (like the bottom tab bar) to open the side drawer
  useEffect(() => {
    const handleToggleDrawer = () => setSideDrawerOpen(prev => !prev);
    const handleOpenDrawer = () => setSideDrawerOpen(true);
    window.addEventListener('open-vbsp-drawer', handleOpenDrawer);
    window.addEventListener('toggle-vbsp-drawer', handleToggleDrawer);
    return () => {
      window.removeEventListener('open-vbsp-drawer', handleOpenDrawer);
      window.removeEventListener('toggle-vbsp-drawer', handleToggleDrawer);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent background scroll when mobile side drawer is open
  useEffect(() => {
    if (sideDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sideDrawerOpen]);

  // Close drawer and navigate
  const handleNavClick = (view: PortalView) => {
    onNavigate(view);
    setSideDrawerOpen(false);
    setActiveDropdown(null);
  };

  const toggleDropdown = (name: string) => {
    setActiveDropdown(prev => prev === name ? null : name);
  };

  return (
    <header className="w-full border-b border-slate-300 bg-white sticky top-0 z-40" id="tsp-main-header">
      {/* Skip to Content Accessible Link (Section 508 / WCAG 2.1 AA) */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-[#112e51] focus:text-white focus:px-4 focus:py-2 focus:rounded-sm focus:font-bold focus:shadow-md focus:outline-none"
      >
        Skip to main content
      </a>

      {/* ---------------------------------------------------- */}
      {/* 1. OFFICIAL US / INSTITUTIONAL TRUST TOP BANNER */}
      {/* ---------------------------------------------------- */}
      <section className="bg-[#f0f4f8] border-b border-slate-300 text-xs text-[#0f2942] py-1 px-3 sm:px-6 lg:px-8" aria-label="Official institutional trust banner">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            {/* Vault / Sovereign Gold Mini Badge */}
            <span className="inline-block w-4 h-3 bg-[#c58b00] relative overflow-hidden rounded-2xs border border-amber-700 shrink-0" aria-hidden="true">
              <span className="absolute top-0 left-0 w-2 h-1.5 bg-[#0f2942]"></span>
            </span>
            <span className="text-[#0f2942] font-semibold text-[11px] sm:text-xs truncate">
              {branding.sealText || 'Official Sovereign Bullion Custody & Savings Plan'}
            </span>
            <button 
              onClick={() => setGovBannerOpen(!govBannerOpen)}
              className="text-[#005ea2] hover:text-[#0f2942] underline font-bold inline-flex items-center gap-0.5 cursor-pointer ml-1 text-[11px] shrink-0"
              aria-expanded={govBannerOpen}
              aria-label="Toggle official site verification details"
            >
              <span className="hidden sm:inline">Here's how you know</span>
              <span className="sm:hidden">Details</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${govBannerOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Section 508 Accessibility & Language Controls */}
          <div className="flex items-center gap-2 text-xs shrink-0">
            {/* High Contrast Toggle (Desktop) */}
            <div className="hidden md:flex items-center gap-1 bg-white border border-slate-300 rounded-xs px-1.5 py-0.5">
              <span className="text-slate-600 text-[11px]">Contrast:</span>
              <button 
                onClick={onToggleContrast}
                className={`px-1.5 py-0.5 rounded-xs text-[11px] font-semibold cursor-pointer ${contrastMode === 'normal' ? 'bg-[#0f2942] text-white' : 'text-slate-700 hover:bg-slate-100'}`}
                title="Standard Display"
              >
                Std
              </button>
              <button 
                onClick={onToggleContrast}
                className={`px-1.5 py-0.5 rounded-xs text-[11px] font-semibold cursor-pointer ${contrastMode === 'high' ? 'bg-black text-yellow-300' : 'text-slate-700 hover:bg-slate-100'}`}
                title="High Contrast Display"
              >
                High
              </button>
            </div>

            {/* Text Size Scale (Desktop) */}
            <div className="hidden md:flex items-center gap-1 bg-white border border-slate-300 rounded-xs px-1.5 py-0.5">
              <Type className="w-3 h-3 text-slate-600" />
              <button 
                onClick={() => onChangeFontSize('normal')}
                className={`px-1.5 py-0.5 rounded-xs text-[11px] font-bold cursor-pointer ${fontSize === 'normal' ? 'bg-[#0f2942] text-white' : 'text-slate-700 hover:bg-slate-100'}`}
                title="Standard Font Size"
              >
                A
              </button>
              <button 
                onClick={() => onChangeFontSize('large')}
                className={`px-1.5 py-0.5 rounded-xs text-[12px] font-bold cursor-pointer ${fontSize === 'large' ? 'bg-[#0f2942] text-white' : 'text-slate-700 hover:bg-slate-100'}`}
                title="Large Font Size"
              >
                A+
              </button>
            </div>

            {/* Language Selector */}
            <div className="flex items-center bg-white border border-slate-300 rounded-xs overflow-hidden text-[11px]">
              <button 
                onClick={() => setLanguage('en')}
                className={`px-1.5 sm:px-2 py-0.5 font-bold cursor-pointer ${language === 'en' ? 'bg-[#0f2942] text-white' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                EN
              </button>
              <button 
                onClick={() => setLanguage('es')}
                className={`px-1.5 sm:px-2 py-0.5 font-bold cursor-pointer ${language === 'es' ? 'bg-[#0f2942] text-white' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                ES
              </button>
            </div>
          </div>
        </div>

        {/* Security & Verification Details Accordion */}
        {govBannerOpen && (
          <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-slate-300 grid grid-cols-1 md:grid-cols-2 gap-3 pb-2 text-slate-700 text-[11px]">
            <div className="flex items-start gap-2">
              <Building2 className="w-4 h-4 text-[#0f2942] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-[#0f2942] font-bold">100% Allocated Segregated Vaulting</strong>
                All bullion assets in {branding.siteName} are stored in physical, LBMA-certified segregated vaults in New York, Zurich, and London.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-[#0f2942] font-bold">Fiduciary Institutional Security</strong>
                Protected with TLS 1.3 / AES-256 and audited quarterly by third-party precious metals assayers.
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ---------------------------------------------------- */}
      {/* 2. MAIN BRAND & ACTION HUB */}
      {/* ---------------------------------------------------- */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Strictly Aligned Single Row [Icon] VERTEX BULLION SAVINGS PLAN (VBSP) */}
        <div 
          onClick={() => handleNavClick('public_home')}
          className="flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none min-w-0"
          id="vbsp-agency-identity"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleNavClick('public_home')}
        >
          {branding.logoUrl ? (
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xs overflow-hidden border border-slate-300 bg-white flex items-center justify-center p-0.5 shadow-2xs shrink-0">
              <img 
                src={branding.logoUrl} 
                alt={`${branding.siteName} Logo`}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ) : (
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#0f2942] text-white flex items-center justify-center rounded-xs border border-[#002f5a] shadow-xs shrink-0">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-[#f2a900]" />
            </div>
          )}
          
          <div className="min-w-0">
            {/* Responsive single-row title with clamp typography */}
            <div className="flex items-center gap-1.5 truncate">
              <span 
                className="font-bold tracking-tight text-[#0f2942] whitespace-nowrap"
                style={{ fontSize: 'clamp(0.82rem, 3.2vw, 1.2rem)', lineHeight: '1.2' }}
              >
                VERTEX BULLION SAVINGS PLAN (VBSP)
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium hidden sm:block truncate">
              {branding.siteSubtitle || 'Fiduciary Physical Precious Metals & Target-Date Custody'}
            </p>
          </div>
        </div>

        {/* Center Search Input (Desktop) */}
        <div className="hidden lg:flex items-center flex-1 max-w-xs xl:max-w-md mx-3">
          <div 
            onClick={onOpenSearch}
            className="w-full bg-slate-50 border border-slate-300 hover:border-[#005ea2] rounded-xs pl-3 pr-3 py-1.5 text-xs text-slate-600 cursor-pointer flex items-center justify-between transition-colors shadow-2xs group"
            id="header-search-bar"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#005ea2]" />
              <span className="text-slate-500 text-[11px] truncate">Search funds, spot rates, forms, KYC...</span>
            </div>
            <kbd className="px-1.5 py-0.5 bg-slate-200 text-slate-700 text-[9px] font-mono rounded-2xs font-semibold shrink-0">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right Action Hub */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Quick Search Button (Mobile / Tablet) */}
          <button
            onClick={onOpenSearch}
            className="lg:hidden p-2 text-slate-700 hover:text-[#005ea2] hover:bg-slate-100 rounded-xs border border-slate-300 transition-colors cursor-pointer"
            title="Search Site"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Logged-In User Profile vs Logged-Out Actions */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button 
                onClick={() => handleNavClick('participant_dashboard')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold rounded-xs border transition-colors cursor-pointer ${
                  currentView === 'participant_dashboard' 
                    ? 'bg-[#0f2942] text-white border-[#0f2942]' 
                    : 'bg-[#e1f3f8] text-[#005ea2] border-[#b2e3f0] hover:bg-[#c9edf7]'
                }`}
                id="header-participant-myaccount-btn"
                title="Open Participant Dashboard"
              >
                <User className="w-3.5 h-3.5 text-[#f2a900]" />
                <span className="hidden md:inline">My Vault Account</span>
                <span className="md:hidden">Vault</span>
                <span className="text-[10px] font-normal hidden xl:inline text-slate-700">({currentUser.name.split(' ')[0]})</span>
              </button>
              <button 
                onClick={onLogout}
                className="p-1.5 sm:p-2 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-xs border border-slate-300 transition-colors cursor-pointer"
                title="Log Out of Secure Session"
                id="header-logout-btn"
                aria-label="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              
              {/* Distinct Button 1: "Open an Account" */}
              <button 
                onClick={() => onOpenAuthModal('onboarding')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 bg-amber-50 hover:bg-amber-100 text-[#92400e] text-xs font-bold rounded-xs border border-amber-300 transition-colors cursor-pointer shadow-2xs"
                id="header-open-account-btn"
                title="Open a new VBSP Bullion Account"
              >
                <UserPlus className="w-3.5 h-3.5 text-amber-700" />
                <span>Open Account</span>
              </button>

              {/* Distinct Button 2: "Sign In" */}
              <button 
                onClick={() => onOpenAuthModal('login')}
                className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-[#005ea2] hover:bg-[#0f2942] text-white text-xs font-bold rounded-xs shadow-xs transition-colors cursor-pointer border border-[#004f87]"
                id="header-signin-btn"
                title="Sign In to your existing account"
              >
                <Lock className="w-3.5 h-3.5 text-[#f2a900]" />
                <span className="whitespace-nowrap font-bold">Sign In</span>
              </button>
            </div>
          )}

          {/* Standard Accessible Hamburger Menu Button (Top Right on Mobile < 768px) */}
          <button
            onClick={() => setSideDrawerOpen(true)}
            className="md:hidden flex items-center justify-center p-2 text-[#0f2942] hover:bg-slate-100 rounded-xs border border-slate-300 transition-colors cursor-pointer bg-slate-50 shrink-0"
            aria-label="Open Navigation Sidebar Menu"
            title="Open Site Navigation Menu"
            id="mobile-hamburger-btn"
          >
            <Menu className="w-5 h-5 text-[#0f2942]" />
          </button>

        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 3. OFFICIAL DESKTOP PRIMARY NAVIGATION BAR */}
      {/* ---------------------------------------------------- */}
      <nav 
        ref={dropdownRef}
        className="hidden md:block bg-[#112e51] text-white border-t border-[#002f5a] shadow-xs relative" 
        id="vbsp-main-nav" 
        aria-label="Main Navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs font-bold">
          
          {/* Main Plan Sections */}
          <div className="flex items-center space-x-1">
            
            {/* 1. Plan Overview */}
            <button 
              onClick={() => handleNavClick('public_home')}
              className={`px-3.5 py-3 border-b-4 transition-colors cursor-pointer ${
                currentView === 'public_home' 
                  ? 'border-[#f2a900] text-white bg-[#002f5a]' 
                  : 'border-transparent text-slate-100 hover:bg-[#002f5a] hover:text-white'
              }`}
              id="nav-link-home"
            >
              Plan Overview
            </button>

            {/* 2. Fund Performance Dropdown */}
            <div className="relative">
              <button 
                onClick={() => toggleDropdown('funds')}
                className={`px-3.5 py-3 border-b-4 flex items-center gap-1 transition-colors cursor-pointer ${
                  currentView === 'public_funds' || activeDropdown === 'funds'
                    ? 'border-[#f2a900] text-white bg-[#002f5a]' 
                    : 'border-transparent text-slate-100 hover:bg-[#002f5a] hover:text-white'
                }`}
                id="nav-link-funds-menu"
                aria-expanded={activeDropdown === 'funds'}
              >
                <span>Bullion Funds & Rates</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'funds' ? 'rotate-180' : ''}`} />
              </button>

              {/* Funds Dropdown Card */}
              {activeDropdown === 'funds' && (
                <div className="absolute top-full left-0 w-80 bg-white text-slate-900 shadow-2xl border border-slate-200 rounded-b-md p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="text-[10px] font-bold text-[#005ea2] uppercase tracking-wider mb-2">
                    Physical Bullion & Target Funds
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <button 
                      onClick={() => handleNavClick('public_funds')}
                      className="w-full text-left p-2 rounded hover:bg-slate-100 flex items-center justify-between font-bold text-slate-900 group"
                    >
                      <span className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-amber-600" />
                        <span>Daily Share Prices & Spot Rates</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#005ea2]" />
                    </button>
                    <button 
                      onClick={() => handleNavClick('public_funds')}
                      className="w-full text-left p-2 rounded hover:bg-slate-100 flex items-center justify-between text-slate-700 group"
                    >
                      <span className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                        <span>Individual Core Funds (G, S, P, T, M)</span>
                      </span>
                    </button>
                    <button 
                      onClick={() => handleNavClick('public_funds')}
                      className="w-full text-left p-2 rounded hover:bg-slate-100 flex items-center justify-between text-slate-700 group"
                    >
                      <span className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-800" />
                        <span>Target Lifecycle Funds (L 2050 - L 2065)</span>
                      </span>
                    </button>
                    <button 
                      onClick={() => handleNavClick('public_funds')}
                      className="w-full text-left p-2 rounded hover:bg-slate-100 flex items-center justify-between text-slate-700 group border-t border-slate-100 pt-2"
                    >
                      <span className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-amber-700" />
                        <span>Expense Ratios & Low Fee Structure</span>
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Planning & Tools Dropdown */}
            <div className="relative">
              <button 
                onClick={() => toggleDropdown('tools')}
                className={`px-3.5 py-3 border-b-4 flex items-center gap-1 transition-colors cursor-pointer ${
                  currentView === 'public_calculators' || activeDropdown === 'tools'
                    ? 'border-[#f2a900] text-white bg-[#002f5a]' 
                    : 'border-transparent text-slate-100 hover:bg-[#002f5a] hover:text-white'
                }`}
                id="nav-link-tools-menu"
                aria-expanded={activeDropdown === 'tools'}
              >
                <span>Planning Tools & Calculators</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'tools' ? 'rotate-180' : ''}`} />
              </button>

              {/* Tools Dropdown Card */}
              {activeDropdown === 'tools' && (
                <div className="absolute top-full left-0 w-84 bg-white text-slate-900 shadow-2xl border border-slate-200 rounded-b-md p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="text-[10px] font-bold text-[#005ea2] uppercase tracking-wider mb-2">
                    Retirement & Bullion Modeler
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <button 
                      onClick={() => handleNavClick('public_calculators')}
                      className="w-full text-left p-2 rounded hover:bg-slate-100 flex items-center justify-between font-bold text-slate-900 group"
                    >
                      <span className="flex items-center gap-2">
                        <Calculator className="w-4 h-4 text-[#005ea2]" />
                        <span>All 5 Interactive Calculators</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#005ea2]" />
                    </button>
                    <button 
                      onClick={() => handleNavClick('public_calculators')}
                      className="w-full text-left p-2 rounded hover:bg-slate-100 flex items-center justify-between text-slate-700"
                    >
                      <span>Retirement Income & Bullion Modeler</span>
                    </button>
                    <button 
                      onClick={() => handleNavClick('public_calculators')}
                      className="w-full text-left p-2 rounded hover:bg-slate-100 flex items-center justify-between text-slate-700"
                    >
                      <span>How Much Can I Contribute? (2026 Limits)</span>
                    </button>
                    <button 
                      onClick={() => handleNavClick('public_calculators')}
                      className="w-full text-left p-2 rounded hover:bg-slate-100 flex items-center justify-between text-slate-700"
                    >
                      <span>Roth vs. Traditional Bullion Conversion</span>
                    </button>
                    <button 
                      onClick={() => handleNavClick('public_calculators')}
                      className="w-full text-left p-2 rounded hover:bg-slate-100 flex items-center justify-between text-slate-700"
                    >
                      <span>Bullion Custody Loan & Payoff Calculator</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Plan Basics & Education */}
            <button 
              onClick={() => handleNavClick('public_education')}
              className={`px-3.5 py-3 border-b-4 transition-colors cursor-pointer ${
                currentView === 'public_education' 
                  ? 'border-[#f2a900] text-white bg-[#002f5a]' 
                  : 'border-transparent text-slate-100 hover:bg-[#002f5a] hover:text-white'
              }`}
              id="nav-link-education"
            >
              Plan Basics & Life Stages
            </button>

            {/* 5. Forms & Publications */}
            <button 
              onClick={() => handleNavClick('public_forms')}
              className={`px-3.5 py-3 border-b-4 transition-colors cursor-pointer ${
                currentView === 'public_forms' 
                  ? 'border-[#f2a900] text-white bg-[#002f5a]' 
                  : 'border-transparent text-slate-100 hover:bg-[#002f5a] hover:text-white'
              }`}
              id="nav-link-forms"
            >
              Forms & Publications
            </button>

            {/* 6. Security & Vault Audits */}
            <button 
              onClick={() => handleNavClick('public_security')}
              className={`px-3.5 py-3 border-b-4 transition-colors cursor-pointer ${
                currentView === 'public_security' 
                  ? 'border-[#f2a900] text-white bg-[#002f5a]' 
                  : 'border-transparent text-slate-100 hover:bg-[#002f5a] hover:text-white'
              }`}
              id="nav-link-security"
            >
              Security & Vault Audits
            </button>

            {/* 7. ThriftLine & Support */}
            <button 
              onClick={() => handleNavClick('public_contact')}
              className={`px-3.5 py-3 border-b-4 transition-colors cursor-pointer ${
                currentView === 'public_contact' 
                  ? 'border-[#f2a900] text-white bg-[#002f5a]' 
                  : 'border-transparent text-slate-100 hover:bg-[#002f5a] hover:text-white'
              }`}
              id="nav-link-contact"
            >
              ThriftLine & Support
            </button>
          </div>

          {/* Agency Reps & Official Operations Portals */}
          <div className="flex items-center border-l border-[#002f5a] pl-3 my-1">
            <button 
              onClick={() => handleNavClick('agency_portal')}
              className={`px-3 py-1.5 rounded-sm text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                currentView === 'agency_portal' ? 'bg-[#005ea2] text-white' : 'text-slate-200 hover:bg-[#002f5a] hover:text-white'
              }`}
              id="nav-link-agency"
            >
              <Building2 className="w-3.5 h-3.5 text-[#f2a900]" />
              <span>Agency Payroll Reps</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ---------------------------------------------------- */}
      {/* 4. ADVANCED MOBILE / TABLET SIDE NAVIGATION DRAWER */}
      {/* (Built on Steve Krug's "Don't Make Me Think" UX Principles) */}
      {/* ---------------------------------------------------- */}
      {sideDrawerOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex animate-in fade-in duration-200"
          onClick={() => setSideDrawerOpen(false)}
          id="mobile-side-drawer-backdrop"
        >
          {/* Slide-out Drawer Panel */}
          <div 
            className="w-[85vw] max-w-sm bg-[#112e51] text-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-left duration-300"
            onClick={(e) => e.stopPropagation()}
            id="mobile-side-drawer-panel"
          >
            
            {/* Drawer Header with Title & Close (X) */}
            <div className="p-4 bg-[#0a1e36] border-b border-[#002f5a] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-sm bg-[#112e51] border border-[#004f87] flex items-center justify-center text-[#f2a900]">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-white leading-tight">{branding.siteName}</h3>
                  <p className="text-[10px] text-slate-300">Participant Navigation Hub</p>
                </div>
              </div>

              <button
                onClick={() => setSideDrawerOpen(false)}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-sm cursor-pointer transition-colors"
                aria-label="Close navigation sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Navigation Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
              
              {/* Account Status / Login Banner */}
              {currentUser ? (
                <div className="bg-[#002f5a] p-3.5 rounded-sm border border-[#004f87] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#112e51] text-[#f2a900] flex items-center justify-center font-bold text-xs border border-[#004f87]">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="block text-white text-xs">{currentUser.name}</strong>
                        <span className="text-[10px] text-slate-300 font-mono">{currentUser.accountNumber}</span>
                      </div>
                    </div>
                    <button
                      onClick={onLogout}
                      className="p-1.5 text-red-300 hover:text-white hover:bg-red-900/40 rounded cursor-pointer"
                      title="Log Out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleNavClick('participant_dashboard')}
                    className="w-full py-2 bg-[#005ea2] hover:bg-[#004f87] text-white rounded font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Open My Vault Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2 bg-[#002f5a] p-3.5 rounded-sm border border-[#004f87]">
                  <div className="text-center pb-1">
                    <span className="text-[11px] font-bold text-slate-200 block">Sovereign Vault Access</span>
                    <span className="text-[10px] text-slate-300">Sign in to your plan or open a new account</span>
                  </div>
                  
                  {/* Distinct Sign In Button */}
                  <button
                    onClick={() => {
                      setSideDrawerOpen(false);
                      onOpenAuthModal('login');
                    }}
                    className="w-full py-2.5 bg-[#005ea2] hover:bg-[#004f87] text-white rounded font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm border border-[#004f87]"
                  >
                    <Lock className="w-3.5 h-3.5 text-[#f2a900]" />
                    <span>Sign In to Vault Account</span>
                  </button>

                  {/* Distinct Open Account Button */}
                  <button
                    onClick={() => {
                      setSideDrawerOpen(false);
                      onOpenAuthModal('onboarding');
                    }}
                    className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-[#112e51] rounded font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-[#112e51]" />
                    <span>Open an Account / Get Started</span>
                  </button>
                </div>
              )}

              {/* Quick In-Drawer Search Input */}
              <div 
                onClick={() => { setSideDrawerOpen(false); onOpenSearch(); }}
                className="bg-[#002f5a] border border-[#004f87] p-2.5 rounded-sm flex items-center justify-between text-slate-300 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-300">Search funds, forms, rules...</span>
                </div>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </div>

              {/* Group 1: Primary Navigation */}
              <div className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 pt-1">
                  Primary Navigation
                </div>

                <button 
                  onClick={() => handleNavClick('public_home')}
                  className={`w-full text-left py-2.5 px-3 rounded-sm flex items-center justify-between transition-colors cursor-pointer ${
                    currentView === 'public_home' ? 'bg-[#002f5a] text-[#f2a900] font-bold' : 'text-slate-100 hover:bg-[#002f5a]'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Landmark className="w-4 h-4 text-[#f2a900]" />
                    <span>Plan Overview & Home</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button 
                  onClick={() => handleNavClick('public_funds')}
                  className={`w-full text-left py-2.5 px-3 rounded-sm flex items-center justify-between transition-colors cursor-pointer ${
                    currentView === 'public_funds' ? 'bg-[#002f5a] text-[#f2a900] font-bold' : 'text-slate-100 hover:bg-[#002f5a]'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>Bullion Funds & Daily Spot Rates</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button 
                  onClick={() => handleNavClick('public_calculators')}
                  className={`w-full text-left py-2.5 px-3 rounded-sm flex items-center justify-between transition-colors cursor-pointer ${
                    currentView === 'public_calculators' ? 'bg-[#002f5a] text-[#f2a900] font-bold' : 'text-slate-100 hover:bg-[#002f5a]'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Calculator className="w-4 h-4 text-[#00a3e0]" />
                    <span>Planning Tools & 5 Calculators</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button 
                  onClick={() => handleNavClick('public_education')}
                  className={`w-full text-left py-2.5 px-3 rounded-sm flex items-center justify-between transition-colors cursor-pointer ${
                    currentView === 'public_education' ? 'bg-[#002f5a] text-[#f2a900] font-bold' : 'text-slate-100 hover:bg-[#002f5a]'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-amber-300" />
                    <span>Plan Basics & Life Stages (FERS)</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button 
                  onClick={() => handleNavClick('public_forms')}
                  className={`w-full text-left py-2.5 px-3 rounded-sm flex items-center justify-between transition-colors cursor-pointer ${
                    currentView === 'public_forms' ? 'bg-[#002f5a] text-[#f2a900] font-bold' : 'text-slate-100 hover:bg-[#002f5a]'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <FileCheck className="w-4 h-4 text-cyan-300" />
                    <span>Forms, Publications & KYC Docs</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button 
                  onClick={() => handleNavClick('public_security')}
                  className={`w-full text-left py-2.5 px-3 rounded-sm flex items-center justify-between transition-colors cursor-pointer ${
                    currentView === 'public_security' ? 'bg-[#002f5a] text-[#f2a900] font-bold' : 'text-slate-100 hover:bg-[#002f5a]'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Security & Segregated Vault Audits</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button 
                  onClick={() => handleNavClick('public_contact')}
                  className={`w-full text-left py-2.5 px-3 rounded-sm flex items-center justify-between transition-colors cursor-pointer ${
                    currentView === 'public_contact' ? 'bg-[#002f5a] text-[#f2a900] font-bold' : 'text-slate-100 hover:bg-[#002f5a]'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-amber-400" />
                    <span>ThriftLine & Participant Support</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>

              {/* Group 2: Quick Bullion Funds Strip */}
              <div className="bg-[#0a1e36] p-3 rounded-sm border border-[#002f5a] space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#f2a900] flex items-center justify-between">
                  <span>Core Bullion Quick Spot</span>
                  <Coins className="w-3 h-3" />
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <button 
                    onClick={() => handleNavClick('public_funds')}
                    className="p-1.5 bg-[#112e51] hover:bg-[#002f5a] rounded text-left border border-[#004f87] cursor-pointer"
                  >
                    <span className="font-bold text-[#f2a900] block">G - Gold Sovereign</span>
                    <span className="text-[10px] text-slate-300 font-mono">$2,684.50 / oz</span>
                  </button>
                  <button 
                    onClick={() => handleNavClick('public_funds')}
                    className="p-1.5 bg-[#112e51] hover:bg-[#002f5a] rounded text-left border border-[#004f87] cursor-pointer"
                  >
                    <span className="font-bold text-slate-200 block">S - Silver Bullion</span>
                    <span className="text-[10px] text-slate-300 font-mono">$32.40 / oz</span>
                  </button>
                </div>
              </div>

              {/* Group 3: Institutional & Agency */}
              <div className="space-y-1 pt-1 border-t border-[#002f5a]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
                  Agency & Operations
                </div>
                <button 
                  onClick={() => handleNavClick('agency_portal')}
                  className="w-full text-left py-2 px-3 rounded-sm flex items-center justify-between text-slate-200 hover:bg-[#002f5a] cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#f2a900]" />
                    <span>Agency Payroll Representatives</span>
                  </span>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                </button>
              </div>

            </div>

            {/* Drawer Footer: Phone Helpline & Accessibility */}
            <div className="p-3 bg-[#0a1e36] border-t border-[#002f5a] space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#f2a900]" />
                  <span>1-877-968-3778</span>
                </span>
                <span className="text-[10px] text-slate-400">Mon-Fri 7am-9pm ET</span>
              </div>

              <div className="pt-2 border-t border-[#002f5a] flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1">
                  <span className="text-slate-400">Text:</span>
                  <button 
                    onClick={() => onChangeFontSize('normal')} 
                    className={`px-1.5 py-0.5 rounded text-[10px] ${fontSize === 'normal' ? 'bg-[#005ea2] text-white font-bold' : 'text-slate-300'}`}
                  >
                    A
                  </button>
                  <button 
                    onClick={() => onChangeFontSize('large')} 
                    className={`px-1.5 py-0.5 rounded text-[10px] ${fontSize === 'large' ? 'bg-[#005ea2] text-white font-bold' : 'text-slate-300'}`}
                  >
                    A+
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-slate-400">Theme:</span>
                  <button 
                    onClick={onToggleContrast}
                    className="px-1.5 py-0.5 bg-[#002f5a] text-white rounded text-[10px] font-bold cursor-pointer"
                  >
                    {contrastMode === 'normal' ? 'Standard' : 'High Contrast'}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </header>
  );
};
