import React from 'react';
import { PortalView, UserAccount } from '../types';
import { 
  Landmark, 
  TrendingUp, 
  Calculator, 
  User, 
  Lock,
  Menu
} from 'lucide-react';

interface MobileBottomNavProps {
  currentView: PortalView;
  onNavigate: (view: PortalView) => void;
  currentUser: UserAccount | null;
  onOpenAuth: (mode?: 'login' | 'onboarding') => void;
  onOpenMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onNavigate,
  currentUser,
  onOpenAuth,
  onOpenMenu
}) => {
  return (
    <div 
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0f2942] border-t border-[#002f5a] text-white shadow-2xl px-2 py-1 flex items-center justify-around safe-area-pb"
      id="mobile-bottom-navigation-bar"
      aria-label="Mobile Bottom Tab Bar"
    >
      {/* 1. Home / Overview */}
      <button
        onClick={() => onNavigate('public_home')}
        className={`flex-1 py-1 px-1 flex flex-col items-center justify-center text-center transition-colors cursor-pointer min-h-[48px] touch-target ${
          currentView === 'public_home' 
            ? 'text-amber-400 font-bold' 
            : 'text-slate-300 hover:text-white'
        }`}
        id="bottom-tab-home"
      >
        <Landmark className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] leading-tight block">Overview</span>
      </button>

      {/* 2. Spot / Funds */}
      <button
        onClick={() => onNavigate('public_funds')}
        className={`flex-1 py-1 px-1 flex flex-col items-center justify-center text-center transition-colors cursor-pointer min-h-[48px] touch-target ${
          currentView === 'public_funds' 
            ? 'text-amber-400 font-bold' 
            : 'text-slate-300 hover:text-white'
        }`}
        id="bottom-tab-funds"
      >
        <TrendingUp className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] leading-tight block">Spot & Funds</span>
      </button>

      {/* 3. Calculators */}
      <button
        onClick={() => onNavigate('public_calculators')}
        className={`flex-1 py-1 px-1 flex flex-col items-center justify-center text-center transition-colors cursor-pointer min-h-[48px] touch-target ${
          currentView === 'public_calculators' 
            ? 'text-amber-400 font-bold' 
            : 'text-slate-300 hover:text-white'
        }`}
        id="bottom-tab-calculators"
      >
        <Calculator className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] leading-tight block">Calculators</span>
      </button>

      {/* 4. Vault / Account */}
      {currentUser ? (
        <button
          onClick={() => onNavigate('participant_dashboard')}
          className={`flex-1 py-1 px-1 flex flex-col items-center justify-center text-center transition-colors cursor-pointer min-h-[48px] touch-target ${
            currentView === 'participant_dashboard' 
              ? 'text-amber-400 font-bold' 
              : 'text-slate-300 hover:text-white'
          }`}
          id="bottom-tab-account"
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight block truncate max-w-[60px]">My Vault</span>
        </button>
      ) : (
        <button
          onClick={() => onOpenAuth('login')}
          className="flex-1 py-1 px-1 flex flex-col items-center justify-center text-center text-amber-300 hover:text-amber-200 transition-colors cursor-pointer min-h-[48px] touch-target"
          id="bottom-tab-signin"
        >
          <Lock className="w-5 h-5 mb-0.5 text-amber-400" />
          <span className="text-[10px] leading-tight block font-bold">Sign In</span>
        </button>
      )}

      {/* 5. Menu Drawer */}
      <button
        onClick={onOpenMenu}
        className="flex-1 py-1 px-1 flex flex-col items-center justify-center text-center text-slate-300 hover:text-white transition-colors cursor-pointer min-h-[48px] touch-target"
        id="bottom-tab-menu"
      >
        <Menu className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] leading-tight block">All Menu</span>
      </button>
    </div>
  );
};
