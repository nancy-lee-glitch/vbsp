import React, { useState } from 'react';
import { 
  BookOpen, 
  Coins, 
  TrendingUp, 
  Shield, 
  LifeBuoy, 
  UserCheck, 
  HeartHandshake, 
  Briefcase, 
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const EducationalLibrary: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<string>('basics');

  const topics = [
    { id: 'basics', title: 'TSP Basics & Eligibility', icon: BookOpen },
    { id: 'contributions', title: 'Making Contributions & Agency 5% Match', icon: Coins },
    { id: 'investments', title: 'Investment Options (Core & L Funds)', icon: TrendingUp },
    { id: 'strategies', title: 'Investing Strategies & Dollar-Cost Averaging', icon: Shield },
    { id: 'withdrawals', title: 'Taking Money Out & Loan Options', icon: LifeBuoy },
    { id: 'life-events', title: 'Life Events & Career Transitions', icon: Briefcase },
    { id: 'beneficiaries', title: 'Death & Beneficiary Information', icon: HeartHandshake },
  ];

  return (
    <div className="space-y-8 pb-12" id="educational-library">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-800 text-blue-200 rounded-md text-xs font-bold mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          <span>OFFICIAL FEDERAL EDUCATION & GUIDANCE</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
          Thrift Savings Plan Educational Resource Center
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Comprehensive guidance for federal employees and uniformed service members across all stages of their career. Learn how contributions, investments, loans, and withdrawals work under FERS, CSRS, and BRS.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-4 space-y-2">
          <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-1">
            {topics.map((t) => {
              const Icon = t.icon;
              const isSelected = selectedTopic === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTopic(t.id)}
                  className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                    <span>{t.title}</span>
                  </div>
                  <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                </button>
              );
            })}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-900 space-y-2">
            <div className="font-bold flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-blue-800" />
              <span>Need Personalized Advice?</span>
            </div>
            <p className="text-blue-800 leading-relaxed">
              Launch AVA or call the ThriftLine at 1-877-968-3778 to speak with a certified federal retirement counselor.
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          
          {/* Topic 1: Basics */}
          {selectedTopic === 'basics' && (
            <div className="space-y-6 text-slate-800">
              <div className="border-b border-slate-200 pb-4">
                <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Module 1</span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">TSP Basics & Eligibility</h2>
                <p className="text-xs text-slate-500 mt-1">Foundational principles of the Federal Employees' Retirement System</p>
              </div>

              <div className="prose prose-sm max-w-none space-y-4 text-xs sm:text-sm leading-relaxed text-slate-700">
                <p>
                  The <strong>Thrift Savings Plan (TSP)</strong> is a defined contribution plan that, together with the FERS Basic Annuity and Social Security, forms the three pillars of retirement for most civilian federal employees.
                </p>

                <h3 className="text-base font-bold text-slate-900 mt-4">Who is Eligible?</h3>
                <ul className="space-y-1.5 list-disc pl-5">
                  <li>Federal Employees Retirement System (FERS) employees</li>
                  <li>Civil Service Retirement System (CSRS) employees</li>
                  <li>Members of the Uniformed Services (Active Duty and Ready Reserve, under Blended Retirement System BRS or Legacy)</li>
                  <li>Civilians in certain other federal retirement systems (e.g. Foreign Service)</li>
                </ul>

                <h3 className="text-base font-bold text-slate-900 mt-4">Vesting Requirements</h3>
                <p>
                  You are always <strong>100% vested</strong> in your own contributions and their earnings, as well as Agency Matching Contributions. Agency Automatic (1%) Contributions vest after <strong>3 years</strong> of civilian service (or 2 years for certain non-career and congressional appointments).
                </p>
              </div>
            </div>
          )}

          {/* Topic 2: Contributions */}
          {selectedTopic === 'contributions' && (
            <div className="space-y-6 text-slate-800">
              <div className="border-b border-slate-200 pb-4">
                <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Module 2</span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">Making Contributions & Agency Match</h2>
                <p className="text-xs text-slate-500 mt-1">Traditional pre-tax vs Roth after-tax and maximizing agency matching</p>
              </div>

              <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                    <h4 className="font-bold text-slate-900 mb-1">Traditional (Pre-Tax)</h4>
                    <p className="text-xs text-slate-600">
                      Contributions are deducted before federal and state taxes are calculated, lowering your taxable income today. Taxes are deferred until withdrawal in retirement.
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                    <h4 className="font-bold text-slate-900 mb-1">Roth (After-Tax)</h4>
                    <p className="text-xs text-slate-600">
                      Contributions are made with after-tax dollars. Qualified earnings and distributions in retirement are <strong>100% tax-free</strong>.
                    </p>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-4">The FERS 5% Agency Match Formula</h3>
                <p>
                  If you are FERS, your agency automatically contributes <strong>1%</strong> of your basic pay each pay period, whether you contribute or not. On top of that, your agency matches dollar-for-dollar on the first 3% you contribute, and 50 cents on the dollar for the next 2%.
                </p>
                <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-xs text-emerald-900 font-medium">
                  <strong>Crucial Rule:</strong> Always contribute at least <strong>5%</strong> of your basic pay every paycheck to capture the full free 5% government match!
                </div>
              </div>
            </div>
          )}

          {/* Topic 3: Investments */}
          {selectedTopic === 'investments' && (
            <div className="space-y-6 text-slate-800">
              <div className="border-b border-slate-200 pb-4">
                <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Module 3</span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">Core Individual Funds & Lifecycle (L) Funds</h2>
                <p className="text-xs text-slate-500 mt-1">Understanding the G, F, C, S, I Funds and automated glide paths</p>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <strong className="text-slate-900 block">G Fund (Government Securities)</strong>
                  Invests exclusively in specially issued short-term U.S. Treasuries. Principal and interest guaranteed by the U.S. Government. Zero risk of negative returns.
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <strong className="text-slate-900 block">F Fund (Fixed Income Index)</strong>
                  Tracks the Bloomberg U.S. Aggregate Bond Index. Invests in U.S. government, mortgage-backed, and investment-grade corporate bonds.
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <strong className="text-slate-900 block">C Fund (Common Stock Index)</strong>
                  Replicates the S&P 500 Index of 500 large and medium U.S. corporations (e.g. Apple, Microsoft, NVIDIA, Amazon).
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <strong className="text-slate-900 block">S Fund (Small Cap Stock Index)</strong>
                  Tracks the Dow Jones U.S. Completion Total Stock Market Index. High growth small-and-mid cap companies.
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <strong className="text-slate-900 block">I Fund (International Stock Index)</strong>
                  Tracks MSCI ACWI ex-USA IMI Index for broad international market exposure.
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900">
                  <strong className="block">Lifecycle (L) Funds</strong>
                  Professionally balanced combinations of G, F, C, S, and I funds that automatically shift to more conservative asset allocations as you approach your retirement year.
                </div>
              </div>
            </div>
          )}

          {/* Topic 4: Strategies */}
          {selectedTopic === 'strategies' && (
            <div className="space-y-6 text-slate-800">
              <div className="border-b border-slate-200 pb-4">
                <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Module 4</span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">Investing Strategies & Compound Growth</h2>
              </div>
              <div className="space-y-4 text-xs sm:text-sm text-slate-700">
                <p>
                  Successful retirement investing does not require timing the market. By consistently contributing a portion of every paycheck into diversified index funds, you benefit from <strong>dollar-cost averaging</strong>—buying more shares when prices are low and fewer shares when prices are high.
                </p>
                <p>
                  Rebalancing your portfolio once or twice a year via an <strong>Interfund Transfer (IFT)</strong> helps lock in gains and maintain your target risk profile.
                </p>
              </div>
            </div>
          )}

          {/* Topic 5: Withdrawals */}
          {selectedTopic === 'withdrawals' && (
            <div className="space-y-6 text-slate-800">
              <div className="border-b border-slate-200 pb-4">
                <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Module 5</span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">Taking Money Out & Loan Options</h2>
              </div>
              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                <p>
                  You have several flexible options for accessing your funds:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>General Purpose Loans:</strong> Repayable within 1 to 5 years without documentation.</li>
                  <li><strong>Residential Loans:</strong> Repayable within 1 to 15 years for purchasing a primary home.</li>
                  <li><strong>Age-Based In-Service Withdrawals:</strong> Available after reaching age 59½ while still employed.</li>
                  <li><strong>Hardship Withdrawals:</strong> For certified negative monthly cash flow, medical emergencies, or disasters.</li>
                  <li><strong>Post-Separation Distributions:</strong> Installment payments (monthly, quarterly, annual), partial withdrawals, or lifetime annuities.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Topic 6: Life Events */}
          {selectedTopic === 'life-events' && (
            <div className="space-y-6 text-slate-800">
              <div className="border-b border-slate-200 pb-4">
                <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Module 6</span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">Life Events & Career Transitions</h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Whether you get married, divorced, transfer between federal agencies, enter military active duty, or separate from federal service, your TSP account travels with you. Rollovers from 401(k)s and traditional IRAs into the TSP are accepted at any time.
              </p>
            </div>
          )}

          {/* Topic 7: Beneficiaries */}
          {selectedTopic === 'beneficiaries' && (
            <div className="space-y-6 text-slate-800">
              <div className="border-b border-slate-200 pb-4">
                <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Module 7</span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">Death & Beneficiary Information</h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Designating beneficiaries ensures your TSP account balance is distributed according to your exact wishes rather than the statutory order of precedence. You can manage primary and contingent beneficiaries with 100% total allocation online inside your Participant My Account portal or by filing Form TSP-3.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
