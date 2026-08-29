import React, { useState } from 'react';
import { 
  Shield, 
  TrendingUp, 
  Calculator, 
  FileText, 
  ArrowRight, 
  DollarSign, 
  Users, 
  Percent, 
  Lock, 
  CheckCircle2, 
  Calendar, 
  ArrowUpRight,
  BookOpen,
  LifeBuoy,
  Building2,
  AlertCircle,
  HelpCircle,
  PiggyBank,
  Landmark,
  FileCheck,
  Coins,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Phone,
  Clock,
  Sparkles,
  Info,
  Layers,
  Sliders,
  Award
} from 'lucide-react';
import { MOCK_NEWS } from '../../data/mockData';
import { PortalView, TSPFund } from '../../types';

interface PublicHomeProps {
  onNavigate: (view: PortalView) => void;
  onOpenAuth: (mode?: 'login' | 'onboarding') => void;
  funds: TSPFund[];
}

export const PublicHome: React.FC<PublicHomeProps> = ({
  onNavigate,
  onOpenAuth,
  funds,
}) => {
  const [fundTab, setFundTab] = useState<'core' | 'lifecycle'>('core');
  const [lifeStageTab, setLifeStageTab] = useState<number>(0);
  
  // Interactive Mini Calculator on Landing Page
  const [calcAge, setCalcAge] = useState<number>(35);
  const [calcRetireAge, setCalcRetireAge] = useState<number>(62);
  const [calcSalary, setCalcSalary] = useState<number>(85000);
  const [calcContributionPct, setCalcContributionPct] = useState<number>(10);
  const [calcCurrentBalance, setCalcCurrentBalance] = useState<number>(75000);

  // Quick projection calculation
  const yearsToRetire = Math.max(1, calcRetireAge - calcAge);
  const annualContrib = (calcSalary * (calcContributionPct + 5)) / 100; // 5% matching
  const estimatedFutureBalance = Math.round(
    calcCurrentBalance * Math.pow(1.065, yearsToRetire) + 
    annualContrib * ((Math.pow(1.065, yearsToRetire) - 1) / 0.065)
  );
  const estimatedMonthlyIncome = Math.round((estimatedFutureBalance * 0.04) / 12);
  const estimatedGoldOz = (estimatedFutureBalance / 2650).toFixed(1);

  const coreFunds = funds.filter(f => ['G', 'S', 'P', 'T', 'M'].includes(f.code));
  const lifecycleFunds = funds.filter(f => f.code.startsWith('L'));

  const displayedFunds = fundTab === 'core' ? coreFunds : lifecycleFunds;

  // Life Stages Data
  const lifeStages = [
    {
      title: 'New to the Plan',
      subtitle: 'Starting your career and enrollment',
      badge: 'First 90 Days',
      headline: 'Get Started with Automatic Enrollment and Full 5% Agency Match',
      content: 'New participants are automatically enrolled at 5% of basic pay in an age-appropriate Lifecycle (L) Fund. Ensure you contribute at least 5% to claim the full dollar-for-dollar matching funds from day one.',
      bullets: [
        'Automatic 1% agency contribution + up to 4% matching contribution.',
        'Default investment in a target-date Lifecycle Fund tailored to your retirement horizon.',
        'Immediate 100% tax-advantaged compounding in physical allocated bullion reserves.'
      ],
      ctaText: 'Review New Participant Guide',
      ctaView: 'public_education' as PortalView
    },
    {
      title: 'Mid-Career Growth',
      subtitle: 'Maximizing contributions & loans',
      badge: 'Career Building',
      headline: 'Accelerate Bullion Growth & Rebalance Your Asset Mix',
      content: 'Take advantage of Interfund Transfers (IFT) to rebalance your holdings between sovereign gold, silver reserves, and core liquidity. You can also borrow up to 50% of your vested balance via bullion custody loans without liquidating physical metal.',
      bullets: [
        'Increase elective deferrals toward the annual $23,500 statutory limit.',
        'Execute unlimited Interfund Transfers (IFT) across G, S, P, T, and M funds.',
        'Access General Purpose and Residential Bullion Loans with low interest returned to your account.'
      ],
      ctaText: 'Explore Contribution Strategies',
      ctaView: 'public_calculators' as PortalView
    },
    {
      title: 'Age 50+ & Catch-Up',
      subtitle: 'SECURE 2.0 catch-up limits',
      badge: 'Age 50 to 63',
      headline: 'Maximize Catch-Up Deferrals & Roth Conversions',
      content: 'Participants aged 50 and older can contribute an additional $7,500 in catch-up contributions. Under SECURE 2.0, participants aged 60 to 63 qualify for a special super catch-up limit of $11,250.',
      bullets: [
        'Standard catch-up: $7,500 in addition to the $23,500 elective limit ($31,000 total).',
        'Special SECURE 2.0 catch-up for ages 60–63: $11,250 ($34,750 total).',
        'Model in-plan Roth bullion conversions for tax-free retirement distributions.'
      ],
      ctaText: 'Calculate Catch-Up Limits',
      ctaView: 'public_calculators' as PortalView
    },
    {
      title: 'Retired & Distributions',
      subtitle: 'Vault delivery & withdrawals',
      badge: 'Retirement Phase',
      headline: 'Flexible Retirement Withdrawals & Physical Vault Bar Delivery',
      content: 'When you retire, choose between partial lump-sum withdrawals, monthly installment payouts, or direct physical delivery of certified gold and silver bullion bars to your address via secure armored courier.',
      bullets: [
        'Option for direct physical delivery of LBMA-certified gold and silver bars.',
        'Flexible monthly, quarterly, or annual installment distributions.',
        'Direct rollover to external IRAs or inherited beneficiary trusts.'
      ],
      ctaText: 'View Withdrawal Options',
      ctaView: 'public_forms' as PortalView
    }
  ];

  return (
    <div className="space-y-10 sm:space-y-14 pb-16" id="public-home-container">
      
      {/* ---------------------------------------------------- */}
      {/* 1. OFFICIAL STATUTORY ALERT BANNER */}
      {/* ---------------------------------------------------- */}
      <div className="bg-[#e1f3f8] border-l-4 border-[#005ea2] p-4 sm:p-5 rounded-xs text-xs text-[#112e51] flex flex-col sm:flex-row items-start justify-between gap-3 shadow-2xs">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#005ea2] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-xs sm:text-sm block mb-1 text-[#112e51]">
              Official 2026 Contribution Ceilings & SECURE 2.0 Rules in Effect
            </span>
            <p className="text-slate-700 leading-relaxed text-xs">
              The 2026 elective contribution limit is <strong>$23,500</strong>. Standard catch-up contributions for participants age 50 and older are <strong>$7,500</strong>. Under the SECURE 2.0 Act, participants ages 60–63 are eligible for an elevated catch-up limit of <strong>$11,250</strong>. Review your agency payroll deductions to ensure you capture the full 5% matching.
            </p>
          </div>
        </div>
        <button 
          onClick={() => onNavigate('public_calculators')}
          className="inline-flex items-center gap-1.5 text-[#005ea2] hover:text-[#112e51] font-bold shrink-0 underline cursor-pointer self-start sm:self-center"
        >
          <span>Calculate 2026 Limits</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 2. COMMANDING HERO SECTION WITH LIVE DAILY RATES CARD */}
      {/* ---------------------------------------------------- */}
      <section 
        className="bg-[#112e51] text-white rounded-sm p-6 sm:p-8 lg:p-10 shadow-md border border-[#002f5a] relative overflow-hidden" 
        id="public-hero-banner"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center relative z-10">
          
          {/* Left Column: Plan Statement & Key CTAs */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#002f5a] text-[#f2a900] rounded-xs text-[11px] sm:text-xs font-bold border border-[#004f87]">
              <Shield className="w-3.5 h-3.5" />
              <span>OFFICIAL SOVEREIGN BULLION SAVINGS & RETIREMENT PLAN</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
              Building Lifetime Financial Security with Sovereign Bullion
            </h1>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
              The Vertex Bullion Savings Plan (VBSP) is a fiduciary tax-deferred savings and physical precious metals custody plan. Providing federal civil servants, uniformed members, and institutional participants direct access to 100% allocated physical gold, silver, and low-cost target-date index funds.
            </p>

            {/* Hero Action Buttons - Distinct Get Started and Sign In */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button 
                onClick={() => onOpenAuth('onboarding')}
                className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-[#112e51] font-black text-xs sm:text-sm rounded-xs shadow-md transition-all flex items-center gap-2 cursor-pointer border border-amber-300 hover:scale-[1.01]"
                id="hero-open-account-button"
              >
                <Coins className="w-4 h-4 text-[#112e51]" />
                <span>Open an Account / Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button 
                onClick={() => onOpenAuth('login')}
                className="px-5 py-3.5 bg-[#005ea2] hover:bg-[#004f87] text-white font-bold text-xs sm:text-sm rounded-xs transition-colors flex items-center gap-2 cursor-pointer border border-[#004f87] shadow-xs"
                id="hero-login-button"
              >
                <Lock className="w-4 h-4 text-[#f2a900]" />
                <span>Sign In to Vault</span>
              </button>

              <button 
                onClick={() => onNavigate('public_calculators')}
                className="px-5 py-3.5 bg-white hover:bg-slate-100 text-[#112e51] font-bold text-xs sm:text-sm rounded-xs transition-colors flex items-center gap-2 cursor-pointer border border-white shadow-xs"
                id="hero-calculators-button"
              >
                <Calculator className="w-4 h-4 text-[#005ea2]" />
                <span>Estimate Retirement Income</span>
              </button>

              <button 
                onClick={() => onNavigate('public_funds')}
                className="px-5 py-3.5 bg-[#002f5a] hover:bg-[#002347] text-white font-bold text-xs sm:text-sm rounded-xs transition-colors flex items-center gap-2 cursor-pointer border border-[#004f87]"
                id="hero-funds-button"
              >
                <TrendingUp className="w-4 h-4 text-[#f2a900]" />
                <span>Fund Performance & Prices</span>
              </button>
            </div>
          </div>

          {/* Right Column: Live Daily Rates Ticker Card */}
          <div className="lg:col-span-5">
            <div className="bg-[#002f5a]/90 backdrop-blur-xs border border-[#004f87] rounded-sm p-4 sm:p-5 text-white shadow-xl space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-[#004f87]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
                    Daily Share Prices & Spot Rates
                  </span>
                </div>
                <span className="text-[10px] text-slate-300 font-mono">
                  Market Close • Net
                </span>
              </div>

              {/* Quick 4-Fund Price Strip */}
              <div className="space-y-2 text-xs">
                {coreFunds.slice(0, 4).map((f) => {
                  const isPositive = f.ytdReturn >= 0;
                  return (
                    <div 
                      key={f.code}
                      onClick={() => onNavigate('public_funds')}
                      className="p-2.5 bg-[#112e51]/80 hover:bg-[#112e51] rounded-xs border border-[#004f87] flex items-center justify-between transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-0.5 bg-[#f2a900] text-[#112e51] font-black text-[11px] rounded-xs">
                          {f.code}
                        </span>
                        <div>
                          <span className="font-bold block text-white text-xs group-hover:text-[#f2a900] transition-colors">
                            {f.name.split('(')[0]}
                          </span>
                          <span className="text-[10px] text-slate-300">
                            {f.benchmark}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-black text-xs sm:text-sm text-white">
                          ${(f.currentSharePrice ?? 0).toFixed(4)}
                        </div>
                        <div className={`text-[10px] font-mono font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                          YTD: {isPositive ? `+${(f.ytdReturn ?? 0).toFixed(2)}%` : `${(f.ytdReturn ?? 0).toFixed(2)}%`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-300 border-t border-[#004f87]">
                <span className="text-[11px]">Expense Ratio: <strong className="text-white">0.048%</strong></span>
                <button 
                  onClick={() => onNavigate('public_funds')}
                  className="text-xs font-bold text-[#f2a900] hover:text-white flex items-center gap-1 cursor-pointer underline"
                >
                  <span>All Funds & Spot Rates</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* Plan Key Metrics Strip (4 Pillars) */}
        <div className="mt-8 pt-6 border-t border-[#002f5a] grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#002f5a] p-3.5 sm:p-4 rounded-xs border border-[#004f87]">
            <div className="flex items-center gap-1.5 text-slate-300 text-xs font-semibold mb-1">
              <DollarSign className="w-3.5 h-3.5 text-[#f2a900]" />
              <span>2026 Elective Limit</span>
            </div>
            <div className="text-lg sm:text-2xl font-black text-white">$23,500</div>
            <div className="text-[10px] sm:text-[11px] text-[#f2a900]">+$7,500 / $11,250 catch-up</div>
          </div>

          <div className="bg-[#002f5a] p-3.5 sm:p-4 rounded-xs border border-[#004f87]">
            <div className="flex items-center gap-1.5 text-slate-300 text-xs font-semibold mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#f2a900]" />
              <span>Total Custody Assets</span>
            </div>
            <div className="text-lg sm:text-2xl font-black text-white">$890+ Billion</div>
            <div className="text-[10px] sm:text-[11px] text-slate-300">LBMA Sovereign Segregation</div>
          </div>

          <div className="bg-[#002f5a] p-3.5 sm:p-4 rounded-xs border border-[#004f87]">
            <div className="flex items-center gap-1.5 text-slate-300 text-xs font-semibold mb-1">
              <Users className="w-3.5 h-3.5 text-[#f2a900]" />
              <span>Active Participants</span>
            </div>
            <div className="text-lg sm:text-2xl font-black text-white">6.9 Million</div>
            <div className="text-[10px] sm:text-[11px] text-slate-300">Civilian, Military & Federal</div>
          </div>

          <div className="bg-[#002f5a] p-3.5 sm:p-4 rounded-xs border border-[#004f87]">
            <div className="flex items-center gap-1.5 text-slate-300 text-xs font-semibold mb-1">
              <Percent className="w-3.5 h-3.5 text-[#f2a900]" />
              <span>Net Expense Ratio</span>
            </div>
            <div className="text-lg sm:text-2xl font-black text-white">0.048%</div>
            <div className="text-[10px] sm:text-[11px] text-slate-300">48¢ per $1,000 invested</div>
          </div>
        </div>

      </section>

      {/* ---------------------------------------------------- */}
      {/* 3. "I WANT TO..." QUICK ACTION TASK BAR (ICONIC TSP STYLE) */}
      {/* ---------------------------------------------------- */}
      <section className="bg-white border border-slate-300 rounded-sm p-6 sm:p-8 shadow-2xs" id="quick-actions-bar">
        <div className="mb-4">
          <span className="text-[11px] font-bold text-[#005ea2] uppercase tracking-wider block mb-0.5">
            Quick Self-Service Portal
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#112e51]">
            I want to...
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          <button
            onClick={() => onNavigate('public_funds')}
            className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xs text-left transition-all hover:border-[#005ea2] flex items-start gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded bg-[#e1f3f8] text-[#005ea2] flex items-center justify-center shrink-0 group-hover:bg-[#005ea2] group-hover:text-white transition-colors">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs text-slate-900 group-hover:text-[#005ea2] block">
                Check Fund Prices & Rates
              </span>
              <span className="text-[11px] text-slate-500 line-clamp-1">
                Live daily bullion share prices
              </span>
            </div>
          </button>

          <button
            onClick={() => onOpenAuth('onboarding')}
            className="p-4 bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200 rounded-xs text-left transition-all hover:border-amber-400 flex items-start gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 group-hover:bg-[#f2a900] group-hover:text-[#112e51] transition-colors">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs text-slate-900 group-hover:text-amber-900 block">
                Open a Bullion Account
              </span>
              <span className="text-[11px] text-slate-500 line-clamp-1">
                Enroll & claim 5% matching
              </span>
            </div>
          </button>

          <button
            onClick={() => onOpenAuth('login')}
            className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xs text-left transition-all hover:border-[#005ea2] flex items-start gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded bg-[#e1f3f8] text-[#005ea2] flex items-center justify-center shrink-0 group-hover:bg-[#005ea2] group-hover:text-white transition-colors">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs text-slate-900 group-hover:text-[#005ea2] block">
                Sign In to My Account
              </span>
              <span className="text-[11px] text-slate-500 line-clamp-1">
                Access your vaulted balances
              </span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('public_calculators')}
            className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xs text-left transition-all hover:border-[#005ea2] flex items-start gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded bg-[#e1f3f8] text-[#005ea2] flex items-center justify-center shrink-0 group-hover:bg-[#005ea2] group-hover:text-white transition-colors">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs text-slate-900 group-hover:text-[#005ea2] block">
                Estimate Retirement Income
              </span>
              <span className="text-[11px] text-slate-500 line-clamp-1">
                Compound bullion projections
              </span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('public_forms')}
            className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xs text-left transition-all hover:border-[#005ea2] flex items-start gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded bg-[#e1f3f8] text-[#005ea2] flex items-center justify-center shrink-0 group-hover:bg-[#005ea2] group-hover:text-white transition-colors">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs text-slate-900 group-hover:text-[#005ea2] block">
                Upload KYC / ID Documents
              </span>
              <span className="text-[11px] text-slate-500 line-clamp-1">
                SSN, Driver's License & Passport
              </span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('public_forms')}
            className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xs text-left transition-all hover:border-[#005ea2] flex items-start gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded bg-[#e1f3f8] text-[#005ea2] flex items-center justify-center shrink-0 group-hover:bg-[#005ea2] group-hover:text-white transition-colors">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs text-slate-900 group-hover:text-[#005ea2] block">
                Download Official Forms
              </span>
              <span className="text-[11px] text-slate-500 line-clamp-1">
                TSP-3, TSP-20, TSP-75, 1099-R
              </span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('public_education')}
            className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xs text-left transition-all hover:border-[#005ea2] flex items-start gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded bg-[#e1f3f8] text-[#005ea2] flex items-center justify-center shrink-0 group-hover:bg-[#005ea2] group-hover:text-white transition-colors">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs text-slate-900 group-hover:text-[#005ea2] block">
                Learn Plan Rules & 5% Match
              </span>
              <span className="text-[11px] text-slate-500 line-clamp-1">
                FERS, CSRS & Uniformed Rules
              </span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('public_security')}
            className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xs text-left transition-all hover:border-[#005ea2] flex items-start gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded bg-[#e1f3f8] text-[#005ea2] flex items-center justify-center shrink-0 group-hover:bg-[#005ea2] group-hover:text-white transition-colors">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs text-slate-900 group-hover:text-[#005ea2] block">
                Verify Vault Custody
              </span>
              <span className="text-[11px] text-slate-500 line-clamp-1">
                Zurich, London, NY assay audits
              </span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('public_contact')}
            className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xs text-left transition-all hover:border-[#005ea2] flex items-start gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded bg-[#e1f3f8] text-[#005ea2] flex items-center justify-center shrink-0 group-hover:bg-[#005ea2] group-hover:text-white transition-colors">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs text-slate-900 group-hover:text-[#005ea2] block">
                Contact ThriftLine Specialist
              </span>
              <span className="text-[11px] text-slate-500 line-clamp-1">
                Live Chat & Phone Directory
              </span>
            </div>
          </button>

        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 4. BULLION FUNDS & PERFORMANCE SPOTLIGHT TABLE */}
      {/* ---------------------------------------------------- */}
      <section className="bg-white border border-slate-300 rounded-sm p-6 sm:p-8 shadow-2xs" id="daily-prices-section">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#005ea2] uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Investment Performance</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#112e51]">
              Daily Share Prices & Historical Fund Returns
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Official closing share prices as of the latest market close. Net of all administrative and depository fees.
            </p>
          </div>

          {/* Toggle Core vs Lifecycle Funds */}
          <div className="flex items-center bg-slate-100 p-1 rounded-sm border border-slate-300 self-start sm:self-center">
            <button
              onClick={() => setFundTab('core')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xs transition-colors cursor-pointer ${
                fundTab === 'core' 
                  ? 'bg-[#112e51] text-white shadow-2xs' 
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Individual Core Funds (G, S, P, T, M)
            </button>
            <button
              onClick={() => setFundTab('lifecycle')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xs transition-colors cursor-pointer ${
                fundTab === 'lifecycle' 
                  ? 'bg-[#112e51] text-white shadow-2xs' 
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Target Lifecycle Funds (L Funds)
            </button>
          </div>
        </div>

        {/* Interactive Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#f0f0f0] border-b border-slate-300 text-slate-700 font-bold uppercase text-[11px]">
                <th className="py-3 px-3.5">Fund Code</th>
                <th className="py-3 px-3.5">Fund Name & Sovereign Benchmark</th>
                <th className="py-3 px-3.5 text-right">Closing Price</th>
                <th className="py-3 px-3.5 text-right">1-Month</th>
                <th className="py-3 px-3.5 text-right">YTD Return</th>
                <th className="py-3 px-3.5 text-right hidden sm:table-cell">1-Year</th>
                <th className="py-3 px-3.5 text-right hidden md:table-cell">5-Year</th>
                <th className="py-3 px-3.5 text-right">Expense Ratio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {displayedFunds.map((fund) => {
                const isPositive = fund.ytdReturn >= 0;
                const isMonthPositive = fund.oneMonthReturn >= 0;
                const isOneYrPositive = fund.oneYearReturn >= 0;
                return (
                  <tr 
                    key={fund.code} 
                    onClick={() => onNavigate('public_funds')}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-3.5 font-bold text-[#112e51]">
                      <span className="px-2.5 py-1 bg-[#e1f3f8] text-[#005ea2] rounded-xs font-black text-xs border border-[#b2e3f0]">
                        {fund.code}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-slate-900 font-bold">
                      {fund.name}
                      <span className="block text-[11px] text-slate-500 font-normal">{fund.benchmark}</span>
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-black text-slate-900 text-xs sm:text-sm">
                      ${(fund.currentSharePrice ?? 0).toFixed(4)}
                    </td>
                    <td className={`py-3 px-3.5 text-right font-mono font-bold ${isMonthPositive ? 'text-emerald-700' : 'text-red-700'}`}>
                      {isMonthPositive ? `+${(fund.oneMonthReturn ?? 0).toFixed(2)}%` : `${(fund.oneMonthReturn ?? 0).toFixed(2)}%`}
                    </td>
                    <td className={`py-3 px-3.5 text-right font-mono font-black ${isPositive ? 'text-emerald-700' : 'text-red-700'}`}>
                      {isPositive ? `+${(fund.ytdReturn ?? 0).toFixed(2)}%` : `${(fund.ytdReturn ?? 0).toFixed(2)}%`}
                    </td>
                    <td className={`py-3 px-3.5 text-right font-mono font-bold hidden sm:table-cell ${isOneYrPositive ? 'text-emerald-700' : 'text-red-700'}`}>
                      {isOneYrPositive ? `+${(fund.oneYearReturn ?? 0).toFixed(2)}%` : `${(fund.oneYearReturn ?? 0).toFixed(2)}%`}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-700 hidden md:table-cell">
                      +{(fund.fiveYearReturn ?? 0).toFixed(2)}%
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono text-slate-600 font-bold">
                      {fund.expenseRatio}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-slate-500">
            *Past performance does not guarantee future results. Bullion funds reflect physical London bullion fix and allocated assay custody.
          </span>
          <button 
            onClick={() => onNavigate('public_funds')}
            className="font-bold text-[#005ea2] hover:text-[#112e51] flex items-center gap-1 underline cursor-pointer"
          >
            <span>View Full Historical Charts & Prospectuses</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 5. RETIREMENT JOURNEY BY LIFE STAGE (INTERACTIVE TABS) */}
      {/* ---------------------------------------------------- */}
      <section className="bg-slate-100 border border-slate-300 rounded-sm p-6 sm:p-8" id="life-stages-section">
        <div className="max-w-2xl mb-6">
          <div className="text-xs font-bold text-[#005ea2] uppercase tracking-wider mb-1">
            Tailored Guidance Across Your Career
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#112e51]">
            Your Bullion Retirement Journey
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Whether you just joined the federal workforce or are preparing for physical vault distribution, select your career stage below:
          </p>
        </div>

        {/* Life Stages Tab Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
          {lifeStages.map((stage, idx) => (
            <button
              key={stage.title}
              onClick={() => setLifeStageTab(idx)}
              className={`p-3.5 rounded-sm text-left transition-all border cursor-pointer ${
                lifeStageTab === idx
                  ? 'bg-white border-[#005ea2] shadow-sm text-[#112e51]'
                  : 'bg-slate-200/70 border-slate-300 hover:bg-white/80 text-slate-700'
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#005ea2] block mb-0.5">
                {stage.badge}
              </span>
              <div className="font-bold text-xs sm:text-sm text-[#112e51]">
                {stage.title}
              </div>
            </button>
          ))}
        </div>

        {/* Selected Stage Detail Card */}
        <div className="bg-white p-6 sm:p-8 rounded-sm border border-slate-300 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base sm:text-lg font-black text-[#112e51]">
              {lifeStages[lifeStageTab].headline}
            </h3>
            <span className="px-2.5 py-1 bg-[#e1f3f8] text-[#005ea2] font-bold text-xs rounded-xs">
              {lifeStages[lifeStageTab].badge}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {lifeStages[lifeStageTab].content}
          </p>

          <div className="space-y-2 pt-2">
            {lifeStages[lifeStageTab].bullets.map((b, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{b}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={() => onNavigate(lifeStages[lifeStageTab].ctaView)}
              className="px-5 py-2.5 bg-[#005ea2] hover:bg-[#112e51] text-white font-bold text-xs rounded-xs flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              <span>{lifeStages[lifeStageTab].ctaText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 6. INTERACTIVE RETIREMENT MODELER WIDGET */}
      {/* ---------------------------------------------------- */}
      <section className="bg-[#112e51] text-white rounded-sm p-6 sm:p-8 lg:p-10 shadow-md border border-[#002f5a]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#002f5a] text-[#f2a900] rounded-xs text-[11px] font-bold border border-[#004f87]">
              <Calculator className="w-3.5 h-3.5" />
              <span>INSTANT RETIREMENT INCOME ESTIMATOR</span>
            </div>
            
            <h2 className="text-xl sm:text-3xl font-black text-white leading-tight">
              Model Your Future Bullion Nest Egg
            </h2>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Adjust your current age, salary, and contribution rate to instantly project your estimated balance at retirement, including the 5% agency matching contribution and physical gold equivalency.
            </p>

            <button
              onClick={() => onNavigate('public_calculators')}
              className="px-4 py-2.5 bg-white hover:bg-slate-100 text-[#112e51] font-bold text-xs rounded-xs flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
            >
              <span>Open Full 5-Module Calculator Suite</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#005ea2]" />
            </button>
          </div>

          {/* Interactive Slider Box */}
          <div className="lg:col-span-7 bg-[#002f5a] p-5 sm:p-6 rounded-sm border border-[#004f87] space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Current Age: <strong className="text-white font-mono">{calcAge} yrs</strong>
                </label>
                <input
                  type="range"
                  min="20"
                  max="65"
                  value={calcAge}
                  onChange={(e) => setCalcAge(Number(e.target.value))}
                  className="w-full accent-[#f2a900]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Target Retirement Age: <strong className="text-white font-mono">{calcRetireAge} yrs</strong>
                </label>
                <input
                  type="range"
                  min="55"
                  max="75"
                  value={calcRetireAge}
                  onChange={(e) => setCalcRetireAge(Number(e.target.value))}
                  className="w-full accent-[#f2a900]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Annual Salary: <strong className="text-white font-mono">${calcSalary.toLocaleString()}</strong>
                </label>
                <input
                  type="range"
                  min="35000"
                  max="200000"
                  step="5000"
                  value={calcSalary}
                  onChange={(e) => setCalcSalary(Number(e.target.value))}
                  className="w-full accent-[#f2a900]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Your Contribution: <strong className="text-white font-mono">{calcContributionPct}% (+5% match)</strong>
                </label>
                <input
                  type="range"
                  min="1"
                  max="25"
                  value={calcContributionPct}
                  onChange={(e) => setCalcContributionPct(Number(e.target.value))}
                  className="w-full accent-[#f2a900]"
                />
              </div>

            </div>

            {/* Live Result Strip */}
            <div className="pt-4 border-t border-[#004f87] grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-[#112e51] rounded-xs border border-[#004f87]">
                <span className="text-[10px] font-bold text-slate-300 block uppercase">Projected Total Balance</span>
                <div className="text-base sm:text-xl font-black text-[#f2a900] font-mono mt-0.5">
                  ${estimatedFutureBalance.toLocaleString()}
                </div>
              </div>

              <div className="p-3 bg-[#112e51] rounded-xs border border-[#004f87]">
                <span className="text-[10px] font-bold text-slate-300 block uppercase">Est. Monthly Income</span>
                <div className="text-base sm:text-xl font-black text-white font-mono mt-0.5">
                  ${estimatedMonthlyIncome.toLocaleString()} / mo
                </div>
              </div>

              <div className="p-3 bg-[#112e51] rounded-xs border border-[#004f87]">
                <span className="text-[10px] font-bold text-slate-300 block uppercase">Physical Bullion Equiv.</span>
                <div className="text-base sm:text-xl font-black text-emerald-400 font-mono mt-0.5">
                  {estimatedGoldOz} oz Gold
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 7. THREE PILLARS OF FERS RETIREMENT */}
      {/* ---------------------------------------------------- */}
      <section className="bg-slate-100 border border-slate-300 rounded-sm p-6 sm:p-8" id="three-pillars-section">
        <div className="max-w-2xl mb-6">
          <div className="text-xs font-bold text-[#005ea2] uppercase tracking-wider mb-1">
            Understanding Your Federal Retirement Architecture
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#112e51]">
            The Three Pillars of FERS Retirement
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Federal Employees Retirement System (FERS) is designed as a three-tier package. Your Bullion Savings Plan (VBSP) is the primary growth engine you control directly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xs border border-slate-300 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xs bg-[#e1f3f8] text-[#005ea2] flex items-center justify-center font-bold">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Tier 1: Guaranteed Pension</span>
              <h3 className="text-base font-bold text-[#112e51] mt-0.5">FERS Basic Annuity</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Defined monthly benefit administered by the Office of Personnel Management (OPM), calculated from your High-3 average salary and years of creditable federal service.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xs border border-slate-300 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xs bg-[#e1f3f8] text-[#005ea2] flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Tier 2: Federal Entitlement</span>
              <h3 className="text-base font-bold text-[#112e51] mt-0.5">Social Security</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Monthly retirement benefits based on your 35 highest-earning years across civilian federal and private sector work, indexed for inflation (COLA).
            </p>
          </div>

          <div className="bg-white p-5 rounded-xs border-2 border-[#005ea2] shadow-xs space-y-3 relative">
            <div className="absolute top-3 right-3 px-2 py-0.5 bg-[#005ea2] text-white text-[10px] font-bold rounded-xs">
              Your Primary Growth Engine
            </div>
            <div className="w-10 h-10 rounded-xs bg-[#112e51] text-[#f2a900] flex items-center justify-center font-bold">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#005ea2]">Tier 3: Defined Contribution</span>
              <h3 className="text-base font-bold text-[#112e51] mt-0.5">Bullion Savings Plan (VBSP)</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tax-advantaged savings with up to <strong>5% automatic and matching agency contributions</strong>. Invest in 5 low-cost core funds or Lifecycle target-date allocations.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 8. OFFICIAL ANNOUNCEMENTS & NEWS BULLETINS */}
      {/* ---------------------------------------------------- */}
      <section className="bg-white border border-slate-300 rounded-sm p-6 sm:p-8 shadow-2xs">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
          <h2 className="text-lg sm:text-xl font-black text-[#112e51] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#005ea2]" />
            <span>Official FRTIB Bulletins & Participant News</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MOCK_NEWS.slice(0, 3).map((item) => (
            <div key={item.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xs space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="px-2 py-0.5 bg-[#e1f3f8] text-[#005ea2] rounded-xs font-bold font-mono">
                  {item.category}
                </span>
                <span className="text-slate-500 font-medium">{item.date}</span>
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2">
                {item.title}
              </h3>
              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                {item.summary}
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
