import React, { useState, useEffect } from 'react';
import { 
  PortalView, 
  ParticipantSubView, 
  UserAccount,
  TSPFund,
  SiteBrandingSettings,
  AdminEmailDispatch,
  PaymentMethodConfig
} from './types';
import { 
  TSP_FUNDS, 
  INITIAL_USER, 
  MOCK_USERS, 
  DEFAULT_SITE_BRANDING, 
  INITIAL_EMAIL_DISPATCHES,
  DEFAULT_PAYMENT_METHODS
} from './data/mockData';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { PublicHome } from './components/public/PublicHome';
import { FundPerformanceView } from './components/public/FundPerformanceView';
import { CalculatorsHub } from './components/public/CalculatorsHub';
import { EducationalLibrary } from './components/public/EducationalLibrary';
import { FormsLibrary } from './components/public/FormsLibrary';
import { ContactThriftLine } from './components/public/ContactThriftLine';
import { SecurityPrivacyView } from './components/public/SecurityPrivacyView';
import { ParticipantDashboard } from './components/participant/ParticipantDashboard';
import { AuthModal } from './components/participant/AuthModal';
import { AgencyPortalView } from './components/agency/AgencyPortalView';
import { AdminPortalView } from './components/admin/AdminPortalView';
import { AdminLogin } from './components/admin/AdminLogin';
import { MobileBottomNav } from './components/MobileBottomNav';
import { SovereignPreloader } from './components/SovereignPreloader';
import { LiveActivityToast } from './components/LiveActivityToast';
import { Search, X, ArrowRight } from 'lucide-react';

export default function App() {
  // Sovereign Preloader State (Runs on initial site entry)
  const [isPreloaderActive, setIsPreloaderActive] = useState<boolean>(true);

  // Site Branding & Custom Name/Logo State
   const [branding, setBranding] = useState<SiteBrandingSettings>(DEFAULT_SITE_BRANDING);
  const [brandingLoaded, setBrandingLoaded] = useState(false);

  // Load branding from database when the app starts
  useEffect(() => {
    async function loadBranding() {
      try {
        const response = await fetch('/api/branding');
        const data = await response.json();
        if (data.success && data.branding) {
          setBranding({
            siteName: data.branding.siteName || DEFAULT_SITE_BRANDING.siteName,
            siteSubtitle: data.branding.slogan || DEFAULT_SITE_BRANDING.siteSubtitle,
            logoUrl: data.branding.logoUrl || null,
            supportPhone: data.branding.supportPhone || DEFAULT_SITE_BRANDING.supportPhone,
            supportEmail: data.branding.supportEmail || DEFAULT_SITE_BRANDING.supportEmail,
            footerText: data.branding.footerText || DEFAULT_SITE_BRANDING.footerText,
          });
        }
      } catch (error) {
        console.error('Failed to load branding:', error);
      } finally {
        setBrandingLoaded(true);
      }
    }
    loadBranding();
  }, []);

  // Admin Email Dispatch Log State
  const [emailDispatches, setEmailDispatches] = useState<AdminEmailDispatch[]>(() => {
    const saved = localStorage.getItem('vbsp_admin_email_dispatches');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored email dispatches', e);
      }
    }
    return INITIAL_EMAIL_DISPATCHES;
  });

  // Global Live Fund Prices State (Editable by Admin)
  const [funds, setFunds] = useState<TSPFund[]>(() => {
    const saved = localStorage.getItem('vbsp_managed_funds');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored funds', e);
      }
    }
    return TSP_FUNDS;
  });

  // Payment Gateways & Crypto Wallets Configuration (Managed by Admin)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>(() => {
    const saved = localStorage.getItem('vbsp_payment_methods');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored payment methods', e);
      }
    }
    return DEFAULT_PAYMENT_METHODS;
  });

  const handleUpdatePaymentMethods = (updated: PaymentMethodConfig[]) => {
    setPaymentMethods(updated);
    localStorage.setItem('vbsp_payment_methods', JSON.stringify(updated));
  };

  // Participant Accounts Registry State (Full CRUD managed by Admin & Self-Service)
   const [users, setUsers] = useState<UserAccount[]>([]);
  const [usersLoaded, setUsersLoaded] = useState(false);

  // Load real participants from the database
  useEffect(() => {
    async function loadParticipants() {
      try {
        const response = await fetch('/api/admin/participants');
        const data = await response.json();

        if (data.success && data.participants) {
          const mappedUsers: UserAccount[] = data.participants.map((p: any) => ({
            id: String(p.id),
            name: p.full_name || 'Participant',
            email: p.email || '',
            accountNumber: p.account_number || '',
            thriftlinePin: p.thriftline_pin || '',
            phone: '',
            address: '',
            employingAgency: '',
            planType: p.account_type || 'VBSP Standard Account (Taxable Reserve)',
            hireDate: p.created_at ? p.created_at.split('T')[0] : '',
            totalBalance: Number(p.total_balance || 0),
            traditionalBalance: Number(p.traditional_balance || 0),
            rothBalance: Number(p.roth_balance || 0),
            ytdReturn: 0,
            vaultDepositaryLocation: '',
            goldOuncesEquivalent: Number(p.gold_ounces_equivalent || 0),
            silverOuncesEquivalent: Number(p.silver_ounces_equivalent || 0),
            ytdContributions: { employee: 0, agencyMatch: 0, agencyAutomatic: 0 },
            contributionAllocations: {},
            currentHoldings: [],
            beneficiaries: [],
            activeLoans: [],
            transactions: [],
            kycProfile: {
              overallStatus: 'Pending Review',
              riskTier: 'Tier 1 Individual',
              ssnMasked: '***-**-****',
              additionalDocuments: []
            }
          }));

          setUsers(mappedUsers);
        }
      } catch (error) {
        console.error('Failed to load participants:', error);
      } finally {
        setUsersLoaded(true);
      }
    }

    loadParticipants();
  }, []);
  // Admin Auth State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('vbsp_admin_logged_in') === 'true';
  });

  // Navigation State
  const [currentView, setCurrentView] = useState<PortalView>('public_home');
  const [participantSubView, setParticipantSubView] = useState<ParticipantSubView>('overview');

  // Accessibility State
  const [contrastMode, setContrastMode] = useState<'normal' | 'high'>('normal');
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

  // Participant User Active Session State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('vbsp_participant_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored user session', e);
      }
    }
    return null;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'onboarding'>('login');

  const handleOpenAuth = (mode: 'login' | 'onboarding' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  // Site-wide Search Palette State
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Synchronize URL Hash / Routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'admin' || hash === 'admin_portal') {
        setCurrentView('admin_portal');
      } else if (hash === 'participant' || hash === 'myaccount') {
        if (!currentUser) {
          setIsAuthModalOpen(true);
        } else {
          setCurrentView('participant_dashboard');
        }
      } else if (hash === 'agency') {
        setCurrentView('agency_portal');
      } else if (hash === 'funds') {
        setCurrentView('public_funds');
      } else if (hash === 'calculators') {
        setCurrentView('public_calculators');
      } else if (hash === 'forms') {
        setCurrentView('public_forms');
      } else if (hash === 'education') {
        setCurrentView('public_education');
      } else if (hash === 'contact') {
        setCurrentView('public_contact');
      } else if (hash === 'security') {
        setCurrentView('public_security');
      } else if (hash === '' || hash === 'home') {
        setCurrentView('public_home');
      }
    };

    // Check initial hash
    if (window.location.hash) {
      handleHashChange();
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentUser]);

  // Global Keybindings (Cmd+K / Ctrl+K for search, Esc to close modals)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsAuthModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = (view: PortalView) => {
    const hashMap: Record<PortalView, string> = {
      public_home: 'home',
      public_funds: 'funds',
      public_calculators: 'calculators',
      public_education: 'education',
      public_forms: 'forms',
      public_contact: 'contact',
      public_security: 'security',
      participant_dashboard: 'myaccount',
      agency_portal: 'agency',
      admin_portal: 'admin'
    };
    
    if (window.location.hash !== `#${hashMap[view]}`) {
      window.location.hash = hashMap[view];
    }

    if (view === 'participant_dashboard' && !currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Branding Settings Handler
    const handleUpdateBranding = async (updated: SiteBrandingSettings) => {
    setBranding(updated);
    document.title = `${updated.siteName} | ${updated.siteSubtitle || ''}`;

    try {
      await fetch('/api/branding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siteName: updated.siteName,
          slogan: updated.siteSubtitle || '',
          logoUrl: updated.logoUrl || '',
          supportPhone: updated.supportPhone || '',
          supportEmail: updated.supportEmail || '',
          footerText: updated.footerText || '',
        }),
      });
    } catch (error) {
      console.error('Failed to save branding:', error);
    }
  };

  // Admin Email Dispatch Handler
  const handleSendEmail = (dispatch: AdminEmailDispatch) => {
    const updated = [dispatch, ...emailDispatches];
    setEmailDispatches(updated);
    localStorage.setItem('vbsp_admin_email_dispatches', JSON.stringify(updated));
  };

  // Participant Account Handlers (CRUD)
  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    localStorage.setItem('vbsp_participant_session', JSON.stringify(user));

    // Ensure new user exists in the central users registry
    if (!users.some(u => u.id === user.id)) {
      const updatedList = [user, ...users];
      setUsers(updatedList);
      localStorage.setItem('vbsp_users_registry', JSON.stringify(updatedList));
    }

    setCurrentView('participant_dashboard');
    window.location.hash = 'myaccount';
    setParticipantSubView('overview');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('vbsp_participant_session');
    setCurrentView('public_home');
    window.location.hash = 'home';
  };

  const handleCreateUser = (newUser: UserAccount) => {
    const updatedList = [newUser, ...users];
    setUsers(updatedList);
    localStorage.setItem('vbsp_users_registry', JSON.stringify(updatedList));
  };

   const handleUpdateUser = async (updatedUser: UserAccount) => {
    try {
      const response = await fetch('/api/admin/participants', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: updatedUser.id,
          total_balance: updatedUser.totalBalance,
          traditional_balance: updatedUser.traditionalBalance,
          roth_balance: updatedUser.rothBalance,
          full_name: updatedUser.name,
          account_status: 'ACTIVE',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      } else {
        alert(data.message || 'Failed to update participant');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Unable to update participant. Please try again.');
    }
  };

    const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/participants?id=${userId}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        setUsers(prev => prev.filter(u => u.id !== userId));
      } else {
        alert(data.message || 'Failed to delete participant');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Unable to delete participant. Please try again.');
    }
  };
  const handleImpersonateUser = (user: UserAccount) => {
    setCurrentUser(user);
    localStorage.setItem('vbsp_participant_session', JSON.stringify(user));
    setCurrentView('participant_dashboard');
    window.location.hash = 'myaccount';
    setParticipantSubView('overview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Admin Authentication Handlers
  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    localStorage.setItem('vbsp_admin_logged_in', 'true');
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('vbsp_admin_logged_in');
    setCurrentView('public_home');
    window.location.hash = 'home';
  };

  // Update Fund Prices across entire platform & dynamically recalculate participant portfolios
  const handleUpdateFundPrices = (updatedFunds: TSPFund[]) => {
    setFunds(updatedFunds);
    localStorage.setItem('vbsp_managed_funds', JSON.stringify(updatedFunds));

    const gPrice = updatedFunds.find(f => f.code === 'G')?.currentSharePrice || 94.65;
    const sPrice = updatedFunds.find(f => f.code === 'S')?.currentSharePrice || 86.30;
    const pPrice = updatedFunds.find(f => f.code === 'P')?.currentSharePrice || 54.20;

    // Recalculate all registered users based on their active holdings
    const recalculatedUsers = users.map(user => {
      let updatedTotal = 0;
      const updatedHoldings = user.currentHoldings.map(h => {
        const matchingFund = updatedFunds.find(f => f.code === h.fundCode);
        const newPrice = matchingFund ? matchingFund.currentSharePrice : h.sharePrice;
        const newBalance = Number((h.shares * newPrice).toFixed(2));
        updatedTotal += newBalance;
        return {
          ...h,
          sharePrice: newPrice,
          balance: newBalance
        };
      });

      if (updatedTotal === 0) {
        updatedTotal = user.totalBalance;
      }

      const goldHolding = updatedHoldings.find(h => h.fundCode === 'G');
      const silverHolding = updatedHoldings.find(h => h.fundCode === 'S');

      const goldOunces = goldHolding ? Number(((goldHolding.balance) / 2650).toFixed(4)) : user.goldOuncesEquivalent;
      const silverOunces = silverHolding ? Number(((silverHolding.balance) / 31.5).toFixed(2)) : user.silverOuncesEquivalent;

      return {
        ...user,
        totalBalance: updatedTotal,
        traditionalBalance: Number((updatedTotal * 0.70).toFixed(2)),
        rothBalance: Number((updatedTotal * 0.30).toFixed(2)),
        goldOuncesEquivalent: goldOunces,
        silverOuncesEquivalent: silverOunces,
        currentHoldings: updatedHoldings
      };
    });

    setUsers(recalculatedUsers);
    localStorage.setItem('vbsp_users_registry', JSON.stringify(recalculatedUsers));

    if (currentUser) {
      const updatedCurrentUser = recalculatedUsers.find(u => u.id === currentUser.id);
      if (updatedCurrentUser) {
        setCurrentUser(updatedCurrentUser);
        localStorage.setItem('vbsp_participant_session', JSON.stringify(updatedCurrentUser));
      }
    }
  };

  // Search Results Configuration
  const searchableLinks = [
    { title: 'Bullion Savings Growth & Compound Yield Modeler', category: 'Calculators', view: 'public_calculators' as PortalView },
    { title: 'Statutory 2026 Contribution & Addition Limits', category: 'Calculators', view: 'public_calculators' as PortalView },
    { title: 'Physical Vault In-Kind Annuity & Distribution Calculator', category: 'Calculators', view: 'public_calculators' as PortalView },
    { title: 'Roth / Sovereign Custody In-Plan Transfer Modeler', category: 'Calculators', view: 'public_calculators' as PortalView },
    { title: 'Sovereign Wealth Reserve Estimator', category: 'Calculators', view: 'public_calculators' as PortalView },
    { title: 'Core Bullion Funds & Spot Rates (G, S, P, T, M, L Funds)', category: 'Investment Funds', view: 'public_funds' as PortalView },
    { title: 'VBSP Architecture, Eligibility & Account Classifications', category: 'Educational Center', view: 'public_education' as PortalView },
    { title: 'Payroll Direct Deposit & Agency Bullion Matching', category: 'Educational Center', view: 'public_education' as PortalView },
    { title: 'Physical Metal Vault Audits & Bar Verification', category: 'Educational Center', view: 'public_education' as PortalView },
    { title: 'Official VBSP Forms & Custodial Publications', category: 'Forms Library', view: 'public_forms' as PortalView },
    { title: 'Contact Vertex Bullion & Dedicated ThriftLine Officers', category: 'Support', view: 'public_contact' as PortalView },
    { title: 'Security, FIPS 140-2 & Segregated Storage Assays', category: 'Legal & Privacy', view: 'public_security' as PortalView },
    { title: 'Corporate Treasury & Agency Benefits Officers Portal', category: 'Agency Portal', view: 'agency_portal' as PortalView },
    { title: 'VBSP Master Administrative & Custody Control Center', category: 'Admin Operations', view: 'admin_portal' as PortalView },
  ];

  const searchResults = searchableLinks.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div 
      className={`min-h-screen flex flex-col font-sans transition-all ${
        contrastMode === 'high' ? 'bg-black text-white selection:bg-yellow-400 selection:text-black' : 'bg-slate-50 text-[#1b1b1b]'
      } ${
        fontSize === 'large' ? 'text-lg' : fontSize === 'xlarge' ? 'text-xl' : 'text-sm'
      }`}
      id="vbsp-app-root"
    >
      {/* Sovereign Federal Bullion Preloader */}
      {isPreloaderActive && (
        <SovereignPreloader
          brandTitle={branding.siteName}
          brandSubtitle={branding.tagline}
          logoUrl={branding.customLogoUrl}
          onComplete={() => setIsPreloaderActive(false)}
        />
      )}

      {/* Skip to Main Content Link for Section 508 / Screen Readers */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#112e51] focus:text-white focus:font-bold focus:rounded-sm focus:shadow-md"
      >
        Skip to main content
      </a>

      {/* Main Federal Header */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        contrastMode={contrastMode}
        onToggleContrast={() => setContrastMode(prev => prev === 'normal' ? 'high' : 'normal')}
        fontSize={fontSize}
        onChangeFontSize={(size) => setFontSize(size)}
        onOpenSearch={() => setIsSearchOpen(true)}
        currentUser={currentUser}
        onOpenAuthModal={handleOpenAuth}
        onLogout={handleLogout}
        branding={branding}
        funds={funds}
      />

      {/* Main View Router */}
      <main id="main-content" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* PUBLIC PORTALS */}
        {currentView === 'public_home' && (
          <PublicHome 
            onNavigate={handleNavigate}
            onOpenAuth={handleOpenAuth}
            funds={funds}
          />
        )}

        {currentView === 'public_funds' && (
          <FundPerformanceView 
            funds={funds}
          />
        )}

        {currentView === 'public_calculators' && (
          <CalculatorsHub />
        )}

        {currentView === 'public_education' && (
          <EducationalLibrary />
        )}

        {currentView === 'public_forms' && (
          <FormsLibrary />
        )}

        {currentView === 'public_contact' && (
          <ContactThriftLine />
        )}

        {currentView === 'public_security' && (
          <SecurityPrivacyView />
        )}

        {/* PARTICIPANT PORTAL */}
        {currentView === 'participant_dashboard' && currentUser && (
          <ParticipantDashboard 
            user={currentUser}
            funds={funds}
            paymentMethods={paymentMethods}
            onUpdateUser={handleUpdateUser}
            activeSubView={participantSubView}
            setActiveSubView={setParticipantSubView}
          />
        )}

        {/* AGENCY PORTAL */}
        {currentView === 'agency_portal' && (
          <AgencyPortalView />
        )}

        {/* ADMIN PORTAL (PROTECTED BY ADMIN LOGIN) */}
        {currentView === 'admin_portal' && (
          !isAdminAuthenticated ? (
            <AdminLogin 
              onAdminLoginSuccess={handleAdminLoginSuccess}
              onCancel={() => handleNavigate('public_home')}
              branding={branding}
            />
          ) : (
            <AdminPortalView 
              onAdminLogout={handleAdminLogout}
              funds={funds}
              onUpdateFundPrices={handleUpdateFundPrices}
              users={users}
              onCreateUser={handleCreateUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              onImpersonateUser={handleImpersonateUser}
              branding={branding}
              onUpdateBranding={handleUpdateBranding}
              dispatches={emailDispatches}
              onSendEmail={handleSendEmail}
              paymentMethods={paymentMethods}
              onUpdatePaymentMethods={handleUpdatePaymentMethods}
            />
          )
        )}

      </main>

      {/* Federal Footer */}
      <Footer 
        onNavigate={handleNavigate}
        branding={branding}
      />

      {/* Mobile Sticky Bottom Tab Bar for One-Thumb Ergonomic Navigation */}
      <MobileBottomNav 
        currentView={currentView}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onOpenMenu={() => window.dispatchEvent(new CustomEvent('open-vbsp-drawer'))}
      />

      {/* Participant Authentication Modal (Login / MFA / ID.me / User Switcher) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        users={users}
        initialMode={authModalMode}
      />

      {/* Global Site Search Modal */}
      {isSearchOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setIsSearchOpen(false)}
        >
          <div 
            className="w-full max-w-xl bg-white rounded-sm shadow-2xl border border-slate-300 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50">
              <Search className="w-5 h-5 text-slate-500" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search VBSP bullion funds, calculators, forms, policies, or topics..."
                className="w-full text-sm font-semibold text-slate-900 focus:outline-none bg-transparent"
                autoFocus
              />
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-sm cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {searchResults.length > 0 ? (
                searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      handleNavigate(item.view);
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left p-3 rounded-xs hover:bg-[#e1f3f8] flex items-center justify-between transition-colors cursor-pointer border-b border-slate-100 last:border-0"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#112e51]">{item.title}</div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">{item.category}</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#005ea2]" />
                  </button>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-slate-500">
                  No matching VBSP resources found for "{searchQuery}".
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Live Activity Pop-up Notification (Global 10s intervals) */}
      <LiveActivityToast />

    </div>
  );
}
