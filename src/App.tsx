import React, { useState, useEffect, useRef } from 'react';
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
import { 
  fetchSiteBranding, 
  saveSiteBranding,
  fetchAllParticipants, 
  upsertParticipantAccount, 
  deleteParticipantAccount, 
  fetchFundPrices, 
  fetchPaymentMethods, 
  savePaymentMethod 
} from './services/dbService';

export default function App() {
  // Sovereign Preloader State (Runs on initial site entry)
  const [isPreloaderActive, setIsPreloaderActive] = useState<boolean>(true);

  // Site Branding & Custom Name/Logo State
  const [branding, setBranding] = useState<SiteBrandingSettings>(() => {
    const saved = localStorage.getItem('ccsp_branding_settings') || localStorage.getItem('vbsp_branding_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored branding settings', e);
      }
    }
    return DEFAULT_SITE_BRANDING;
  });

  // Admin Email Dispatch Log State
  const [emailDispatches, setEmailDispatches] = useState<AdminEmailDispatch[]>(() => {
    const saved = localStorage.getItem('ccsp_admin_email_dispatches') || localStorage.getItem('vbsp_admin_email_dispatches');
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
    const saved = localStorage.getItem('ccsp_managed_funds') || localStorage.getItem('vbsp_managed_funds');
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
    const saved = localStorage.getItem('ccsp_payment_methods') || localStorage.getItem('vbsp_payment_methods');
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
    localStorage.setItem('ccsp_payment_methods', JSON.stringify(updated));
    updated.forEach(m => savePaymentMethod(m).catch(e => console.warn(e)));
  };

  // Participant Accounts Registry State (Full CRUD managed by Admin & Self-Service)
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('ccsp_users_registry') || localStorage.getItem('vbsp_users_registry');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored users', e);
      }
    }
    return MOCK_USERS;
  });

  // Neon PostgreSQL Database Initial State Loader (Hydrates from Neon on mount via dbService.ts)
  useEffect(() => {
    fetchSiteBranding()
      .then(b => {
        if (b) {
          setBranding(b);
          document.title = `${b.siteName} | ${b.siteSubtitle}`;
        }
      })
      .catch(err => console.warn('Neon PostgreSQL database branding load notice:', err));

    fetchAllParticipants()
      .then(pList => {
        if (pList && pList.length > 0) {
          setUsers(pList);
          // Keep active participant session in sync with fresh Neon database record
          setCurrentUser(prevUser => {
            if (!prevUser) return null;
            const freshUser = pList.find(p => 
              (prevUser.id && String(p.id) === String(prevUser.id)) || 
              (prevUser.accountNumber && p.accountNumber && p.accountNumber === prevUser.accountNumber) ||
              (prevUser.email && p.email && p.email.toLowerCase() === prevUser.email.toLowerCase())
            );
            if (freshUser) {
              localStorage.setItem('ccsp_participant_session', JSON.stringify(freshUser));
              return freshUser;
            }
            return prevUser;
          });
        }
      })
      .catch(err => console.warn('Neon PostgreSQL database participants load notice:', err));

    fetchFundPrices()
      .then(fList => {
        if (fList && fList.length > 0) {
          setFunds(fList);
        }
      })
      .catch(err => console.warn('Neon PostgreSQL database funds load notice:', err));

    fetchPaymentMethods()
      .then(pMethods => {
        if (pMethods && pMethods.length > 0) {
          setPaymentMethods(pMethods);
        }
      })
      .catch(err => console.warn('Neon PostgreSQL database payment methods load notice:', err));
  }, []);

  // Admin Auth State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('ccsp_admin_logged_in') === 'true' || localStorage.getItem('vbsp_admin_logged_in') === 'true';
  });

  // Navigation State
  const [currentView, setCurrentView] = useState<PortalView>('public_home');
  const [participantSubView, setParticipantSubView] = useState<ParticipantSubView>('overview');

  // Accessibility State
  const [contrastMode, setContrastMode] = useState<'normal' | 'high'>('normal');
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

  // Participant User Active Session State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      localStorage.removeItem('vbsp_participant_session');
      const saved = localStorage.getItem('ccsp_participant_session');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error parsing stored user session', e);
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

  // Keep refs up-to-date for stable hash routing without effect re-triggers
  const currentUserRef = useRef<UserAccount | null>(currentUser);
  currentUserRef.current = currentUser;
  const currentViewRef = useRef<PortalView>(currentView);
  currentViewRef.current = currentView;

  // Active 5-second polling sync: keeps participant data, balances, and status in sync with Neon PostgreSQL
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(async () => {
      try {
        const pList = await fetchAllParticipants();
        if (pList && pList.length > 0) {
          setUsers(pList);
          setCurrentUser(prevUser => {
            if (!prevUser) return null;
            const fresh = pList.find(p => 
              (prevUser.id && String(p.id) === String(prevUser.id)) ||
              (prevUser.accountNumber && p.accountNumber && p.accountNumber === prevUser.accountNumber) ||
              (prevUser.email && p.email && p.email.toLowerCase() === prevUser.email.toLowerCase())
            );
            if (fresh) {
              localStorage.setItem('ccsp_participant_session', JSON.stringify(fresh));
              return fresh;
            }
            return prevUser;
          });
        }
      } catch (e) {
        // silent sync fallback
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [currentUser?.id, currentUser?.accountNumber]);

  // Synchronize URL Hash / Routing - Stable, no redirect loops on state changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim();
      const participantSubViews: ParticipantSubView[] = [
        'overview', 'investments', 'loans', 'withdrawals', 
        'beneficiaries', 'kyc', 'documents', 'history', 'messages', 'settings'
      ];

      if (hash === 'admin' || hash === 'admin_portal') {
        setCurrentView('admin_portal');
      } else if (hash === 'participant' || hash === 'myaccount') {
        if (!currentUserRef.current) {
          setIsAuthModalOpen(true);
        } else {
          setCurrentView('participant_dashboard');
        }
      } else if (participantSubViews.includes(hash as ParticipantSubView)) {
        if (!currentUserRef.current) {
          setIsAuthModalOpen(true);
        } else {
          setCurrentView('participant_dashboard');
          setParticipantSubView(hash as ParticipantSubView);
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
      } else if (hash === 'home') {
        setCurrentView('public_home');
      } else if (hash === '') {
        // Only reset to public_home if user is NOT logged in or not on participant dashboard
        if (!currentUserRef.current && currentViewRef.current !== 'participant_dashboard') {
          setCurrentView('public_home');
        }
      }
    };

    // Check initial hash on mount
    if (window.location.hash) {
      handleHashChange();
    } else if (currentUserRef.current) {
      // If returning with valid session and no hash, keep user on dashboard
      setCurrentView('participant_dashboard');
      window.location.hash = 'myaccount';
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []); // Run ONCE on mount - will not kick user out when currentUser updates!

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
  const handleUpdateBranding = (updated: SiteBrandingSettings) => {
    setBranding(updated);
    localStorage.setItem('ccsp_branding_settings', JSON.stringify(updated));
    document.title = `${updated.siteName} | ${updated.siteSubtitle}`;
    saveSiteBranding(updated).catch(err => console.warn('Neon database branding sync notice:', err));
  };

  // Admin Email Dispatch Handler
  const handleSendEmail = (dispatch: AdminEmailDispatch) => {
    const updated = [dispatch, ...emailDispatches];
    setEmailDispatches(updated);
    localStorage.setItem('ccsp_admin_email_dispatches', JSON.stringify(updated));
  };

  // Participant Account Handlers (CRUD)
  const handleLoginSuccess = (user: UserAccount) => {
    if (!user || (!user.id && !user.accountNumber)) return;

    setCurrentUser(user);
    localStorage.setItem('ccsp_participant_session', JSON.stringify(user));

    // Ensure new user exists in the central users registry
    setUsers(prevUsers => {
      const idx = prevUsers.findIndex(u => 
        (user.id && String(u.id) === String(user.id)) || 
        (user.accountNumber && u.accountNumber === user.accountNumber)
      );
      if (idx >= 0) {
        const copy = [...prevUsers];
        copy[idx] = user;
        localStorage.setItem('ccsp_users_registry', JSON.stringify(copy));
        return copy;
      }
      const updatedList = [user, ...prevUsers];
      localStorage.setItem('ccsp_users_registry', JSON.stringify(updatedList));
      return updatedList;
    });

    setCurrentView('participant_dashboard');
    window.location.hash = 'myaccount';
    setParticipantSubView('overview');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ccsp_participant_session');
    setCurrentView('public_home');
    window.location.hash = 'home';
  };

  const handleCreateUser = (newUser: UserAccount) => {
    const updatedList = [newUser, ...users];
    setUsers(updatedList);
    localStorage.setItem('ccsp_users_registry', JSON.stringify(updatedList));
    upsertParticipantAccount(newUser).catch(err => console.warn('Neon database user create notice:', err));
  };

  const handleUpdateUser = (updated: UserAccount) => {
    const updatedList = users.map(u => 
      (String(u.id) === String(updated.id) || u.accountNumber === updated.accountNumber) ? updated : u
    );
    setUsers(updatedList);
    localStorage.setItem('ccsp_users_registry', JSON.stringify(updatedList));

    if (
      currentUser && 
      (String(currentUser.id) === String(updated.id) || 
       (currentUser.accountNumber && currentUser.accountNumber === updated.accountNumber) ||
       (currentUser.email && currentUser.email.toLowerCase() === updated.email.toLowerCase()))
    ) {
      setCurrentUser(updated);
      localStorage.setItem('ccsp_participant_session', JSON.stringify(updated));
    }
    upsertParticipantAccount(updated).catch(err => console.warn('Neon database user update notice:', err));
  };

  const handleDeleteUser = (userId: string) => {
    const updatedList = users.filter(u => u.id !== userId);
    setUsers(updatedList);
    localStorage.setItem('ccsp_users_registry', JSON.stringify(updatedList));

    if (currentUser?.id === userId) {
      setCurrentUser(null);
      localStorage.removeItem('ccsp_participant_session');
    }
    deleteParticipantAccount(userId).catch(err => console.warn('Neon database user delete notice:', err));
  };

  const handleImpersonateUser = (user: UserAccount) => {
    setCurrentUser(user);
    localStorage.setItem('ccsp_participant_session', JSON.stringify(user));
    setCurrentView('participant_dashboard');
    window.location.hash = 'myaccount';
    setParticipantSubView('overview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Admin Authentication Handlers
  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    localStorage.setItem('ccsp_admin_logged_in', 'true');
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('ccsp_admin_logged_in');
    setCurrentView('public_home');
    window.location.hash = 'home';
  };

  // Update Fund Prices across entire platform & dynamically recalculate participant portfolios
  const handleUpdateFundPrices = (updatedFunds: TSPFund[]) => {
    setFunds(updatedFunds);
    localStorage.setItem('ccsp_managed_funds', JSON.stringify(updatedFunds));

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
    localStorage.setItem('ccsp_users_registry', JSON.stringify(recalculatedUsers));

    if (currentUser) {
      const updatedCurrentUser = recalculatedUsers.find(u => u.id === currentUser.id);
      if (updatedCurrentUser) {
        setCurrentUser(updatedCurrentUser);
        localStorage.setItem('ccsp_participant_session', JSON.stringify(updatedCurrentUser));
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
    { title: 'Cassivon Capital Architecture, Eligibility & Account Classifications', category: 'Educational Center', view: 'public_education' as PortalView },
    { title: 'Payroll Direct Deposit & Agency Bullion Matching', category: 'Educational Center', view: 'public_education' as PortalView },
    { title: 'Physical Metal Vault Audits & Bar Verification', category: 'Educational Center', view: 'public_education' as PortalView },
    { title: 'Official Cassivon Capital Forms & Custodial Publications', category: 'Forms Library', view: 'public_forms' as PortalView },
    { title: 'Contact Cassivon Capital & Dedicated Custody Officers', category: 'Support', view: 'public_contact' as PortalView },
    { title: 'Security, FIPS 140-2 & Segregated Storage Assays', category: 'Legal & Privacy', view: 'public_security' as PortalView },
    { title: 'Corporate Treasury & Agency Benefits Officers Portal', category: 'Agency Portal', view: 'agency_portal' as PortalView },
    { title: 'Cassivon Capital Master Administrative & Custody Control Center', category: 'Admin Operations', view: 'admin_portal' as PortalView },
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
      id="ccsp-app-root"
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
            branding={branding}
          />
        )}

        {currentView === 'public_funds' && (
          <FundPerformanceView 
            funds={funds}
            branding={branding}
          />
        )}

        {currentView === 'public_calculators' && (
          <CalculatorsHub />
        )}

        {currentView === 'public_education' && (
          <EducationalLibrary branding={branding} />
        )}

        {currentView === 'public_forms' && (
          <FormsLibrary branding={branding} />
        )}

        {currentView === 'public_contact' && (
          <ContactThriftLine branding={branding} />
        )}

        {currentView === 'public_security' && (
          <SecurityPrivacyView branding={branding} />
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
        onOpenMenu={() => window.dispatchEvent(new CustomEvent('open-ccsp-drawer'))}
      />

      {/* Participant Authentication Modal (Login / MFA / ID.me / User Switcher) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        users={users}
        initialMode={authModalMode}
        branding={branding}
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
                placeholder="Search Cassivon Capital bullion funds, calculators, forms, policies, or topics..."
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
                  No matching resources found for "{searchQuery}".
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Live Activity Pop-up Notification (Global 10s intervals) */}
      <LiveActivityToast branding={branding} />

    </div>
  );
}
