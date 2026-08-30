import React, { useState } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Shield, 
  HelpCircle, 
  ArrowRight, 
  Percent, 
  RefreshCw, 
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { 
  calculateRetirementModeler,
  calculateContributionLimit,
  calculateAnnuityEstimate,
  calculateRothConversion,
  calculateFederalBallpark
} from '../../utils/calculatorEngines';

export const CalculatorsHub: React.FC = () => {
  const [activeCalc, setActiveCalc] = useState<
    'modeler' | 'contribution' | 'annuity' | 'roth' | 'ballpark'
  >('modeler');

  // 1. Retirement Modeler State
  const [currentAge, setCurrentAge] = useState<number>(38);
  const [retirementAge, setRetirementAge] = useState<number>(62);
  const [currentBalance, setCurrentBalance] = useState<number>(125000);
  const [annualSalary, setAnnualSalary] = useState<number>(95000);
  const [employeePercent, setEmployeePercent] = useState<number>(7);
  const [agencyMatchPercent, setAgencyMatchPercent] = useState<number>(5);
  const [expectedReturn, setExpectedReturn] = useState<number>(7.0);

  const modelerResult = calculateRetirementModeler({
    currentAge,
    retirementAge,
    lifeExpectancy: 88,
    currentBalance,
    annualSalary,
    employeeContributionPercent: employeePercent,
    agencyMatchPercent,
    salaryGrowthRate: 2.5,
    preRetirementReturnRate: expectedReturn,
    postRetirementReturnRate: 4.5,
    inflationRate: 2.5
  });

  // 2. Contribution Limit State
  const [contribAge, setContribAge] = useState<number>(52);
  const [payPeriodCount, setPayPeriodCount] = useState<number>(26);
  const [desiredAnnual, setDesiredAnnual] = useState<number>(31000);

  const contribResult = calculateContributionLimit(contribAge, payPeriodCount, desiredAnnual);

  // 3. Annuity Calculator State
  const [annuityBalance, setAnnuityBalance] = useState<number>(300000);
  const [annuityAge, setAnnuityAge] = useState<number>(62);
  const [annuityOption, setAnnuityOption] = useState<'single_level' | 'single_increasing' | 'joint_100_level' | 'joint_50_level' | 'single_10yr_certain'>('single_level');

  const annuityResult = calculateAnnuityEstimate(annuityBalance, annuityAge, annuityOption);

  // 4. Roth Conversion State
  const [rothConvertAmount, setRothConvertAmount] = useState<number>(50000);
  const [currentFedTax, setCurrentFedTax] = useState<number>(22);
  const [currentStateTax, setCurrentStateTax] = useState<number>(5);
  const [yearsToRetirement, setYearsToRetirement] = useState<number>(18);
  const [annualGrowth, setAnnualGrowth] = useState<number>(7.0);
  const [futureTaxRate, setFutureTaxRate] = useState<number>(22);

  const rothResult = calculateRothConversion(
    rothConvertAmount,
    currentFedTax,
    currentStateTax,
    yearsToRetirement,
    annualGrowth,
    futureTaxRate
  );

  // 5. Federal Ballpark Estimate State
  const [high3, setHigh3] = useState<number>(115000);
  const [serviceYears, setServiceYears] = useState<number>(25);
  const [ballparkAge, setBallparkAge] = useState<number>(62);
  const [ssMonthly, setSsMonthly] = useState<number>(2100);
  const [tspEstBalance, setTspEstBalance] = useState<number>(450000);

  const ballparkResult = calculateFederalBallpark(high3, serviceYears, ballparkAge, ssMonthly, tspEstBalance);

  return (
    <div className="space-y-8 pb-12" id="calculators-hub">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-blue-900/50">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-400/20 text-amber-300 rounded-md text-xs font-bold mb-3">
          <Calculator className="w-3.5 h-3.5 text-amber-400" />
          <span>OFFICIAL FEDERAL RETIREMENT PLANNING TOOLS</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
          Thrift Savings Plan Public Calculators
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Model your future federal retirement nest egg, check statutory 2026 elective contribution limits, estimate lifetime annuities, or assess the triple-pillar Federal Ballpark retirement estimate.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 text-xs font-bold">
        <button 
          onClick={() => setActiveCalc('modeler')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeCalc === 'modeler' ? 'bg-blue-900 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>1. Retirement Income Modeler</span>
        </button>

        <button 
          onClick={() => setActiveCalc('contribution')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeCalc === 'contribution' ? 'bg-blue-900 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>2. How Much Can I Contribute?</span>
        </button>

        <button 
          onClick={() => setActiveCalc('annuity')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeCalc === 'annuity' ? 'bg-blue-900 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>3. Annuity Calculator</span>
        </button>

        <button 
          onClick={() => setActiveCalc('roth')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeCalc === 'roth' ? 'bg-blue-900 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>4. Roth In-Plan Conversion</span>
        </button>

        <button 
          onClick={() => setActiveCalc('ballpark')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeCalc === 'ballpark' ? 'bg-blue-900 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>5. Federal Ballpark Estimate (Triple Pillar)</span>
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 1. RETIREMENT INCOME MODELER */}
      {/* ---------------------------------------------------- */}
      {activeCalc === 'modeler' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Inputs Column */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2">
              Participant Information & Assumptions
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Current Age</label>
                <input 
                  type="number" 
                  value={currentAge}
                  onChange={(e) => setCurrentAge(Math.max(18, Math.min(75, Number(e.target.value))))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Retirement Age</label>
                <input 
                  type="number" 
                  value={retirementAge}
                  onChange={(e) => setRetirementAge(Math.max(currentAge + 1, Math.min(80, Number(e.target.value))))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Current TSP Balance ($)</span>
                <span className="text-blue-900">${currentBalance.toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1000000" 
                step="5000"
                value={currentBalance}
                onChange={(e) => setCurrentBalance(Number(e.target.value))}
                className="w-full accent-blue-900"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Annual Federal Salary ($)</span>
                <span className="text-blue-900">${annualSalary.toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min="30000" 
                max="250000" 
                step="2500"
                value={annualSalary}
                onChange={(e) => setAnnualSalary(Number(e.target.value))}
                className="w-full accent-blue-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Employee Contribution</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={employeePercent}
                    onChange={(e) => setEmployeePercent(Math.max(0, Math.min(100, Number(e.target.value))))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold pr-7"
                  />
                  <span className="absolute right-2.5 top-2.5 text-xs text-slate-500 font-bold">%</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Agency Match (FERS)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={agencyMatchPercent}
                    onChange={(e) => setAgencyMatchPercent(Math.max(0, Math.min(5, Number(e.target.value))))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold pr-7"
                  />
                  <span className="absolute right-2.5 top-2.5 text-xs text-slate-500 font-bold">%</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Expected Investment Return</span>
                <span className="text-emerald-700 font-bold">{(expectedReturn ?? 0).toFixed(1)}% / yr</span>
              </div>
              <input 
                type="range" 
                min="2.0" 
                max="12.0" 
                step="0.5"
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(Number(e.target.value))}
                className="w-full accent-emerald-700"
              />
              <div className="text-[11px] text-slate-500 mt-1">
                Historical composite L Funds have returned ~7% to 10% annualized over long horizons.
              </div>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-7 space-y-5">
            {/* Primary KPI Card */}
            <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-blue-800">
              <div className="text-xs font-bold text-amber-300 uppercase tracking-wide mb-1">
                Projected Nest Egg at Age {retirementAge}
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white mb-2">
                ${Math.round(modelerResult.nestEggAtRetirement).toLocaleString()}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Estimated monthly sustainable retirement withdrawal from TSP: <strong className="text-amber-300 text-sm font-black">${Math.round(modelerResult.monthlyRetirementIncome).toLocaleString()} / month</strong> (${Math.round(modelerResult.annualRetirementIncome).toLocaleString()} / year).
              </p>

              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/15 text-xs">
                <div>
                  <span className="text-slate-400 block">Total You Contributed</span>
                  <span className="font-bold text-white">${Math.round(modelerResult.totalEmployeeContributions).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Agency 5% Match</span>
                  <span className="font-bold text-emerald-300">${Math.round(modelerResult.totalAgencyContributions).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Compound Growth</span>
                  <span className="font-bold text-amber-300">${Math.round(modelerResult.totalGrowth).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Growth & Timeline Sample Table */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide mb-3">
                Projected Accumulation Progression (Sample Milestone Years)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <th className="py-2 px-3">Age</th>
                      <th className="py-2 px-3">Year</th>
                      <th className="py-2 px-3">Annual Contributions</th>
                      <th className="py-2 px-3">Compound Earnings</th>
                      <th className="py-2 px-3 text-right">Projected Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {modelerResult.timeline
                      .filter((p, idx) => idx % Math.max(1, Math.floor((retirementAge - currentAge) / 5)) === 0 || p.age === retirementAge - 1)
                      .slice(0, 6)
                      .map((p) => (
                        <tr key={p.age} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-bold text-slate-900">{p.age}</td>
                          <td className="py-2 px-3 text-slate-600">{p.year}</td>
                          <td className="py-2 px-3 text-slate-700">${Math.round(p.totalContribution).toLocaleString()}</td>
                          <td className="py-2 px-3 text-emerald-700">+${Math.round(p.interestEarned).toLocaleString()}</td>
                          <td className="py-2 px-3 text-right font-black text-blue-900">${Math.round(p.endBalance).toLocaleString()}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2. HOW MUCH CAN I CONTRIBUTE? (2026 LIMITS) */}
      {/* ---------------------------------------------------- */}
      {activeCalc === 'contribution' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2">
              2026 Contribution Parameter Configuration
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Your Age in 2026</label>
              <input 
                type="number" 
                value={contribAge}
                onChange={(e) => setContribAge(Math.max(18, Math.min(80, Number(e.target.value))))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold"
              />
              <div className="text-[11px] text-slate-500 mt-1">
                Ages 50–59 & 64+: $7,500 catch-up. Ages 60–63 (SECURE 2.0): $11,250 higher catch-up.
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payroll Cycle Frequency</label>
              <select 
                value={payPeriodCount}
                onChange={(e) => setPayPeriodCount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold"
              >
                <option value={26}>Bi-Weekly (26 Pay Periods - Most Federal Agencies / NFC / DFAS)</option>
                <option value={24}>Semi-Monthly (24 Pay Periods)</option>
                <option value={12}>Monthly (12 Pay Periods)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Target Annual Contribution ($)</span>
                <span className="text-blue-900 font-black">${desiredAnnual.toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min="1000" 
                max={contribResult.totalAllowedLimit} 
                step="500"
                value={Math.min(desiredAnnual, contribResult.totalAllowedLimit)}
                onChange={(e) => setDesiredAnnual(Number(e.target.value))}
                className="w-full accent-blue-900"
              />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-5">
            <div className="bg-white border-2 border-emerald-600/50 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 font-bold text-xs rounded-md">
                  2026 Statutory Limits Verified
                </span>
                <span className="text-xs text-slate-500">IRC Section 402(g)</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-semibold">Regular Elective Limit</div>
                  <div className="text-xl font-black text-slate-900">${contribResult.regularLimit.toLocaleString()}</div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-semibold">Eligible Catch-Up</div>
                  <div className="text-xl font-black text-emerald-800">
                    {contribResult.catchUpLimit > 0 ? `+$${contribResult.catchUpLimit.toLocaleString()}` : '$0'}
                  </div>
                  <div className="text-[10px] text-slate-500">{contribResult.eligibleCatchUpType}</div>
                </div>

                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 col-span-2 sm:col-span-1">
                  <div className="text-[11px] text-emerald-900 font-semibold">Total Max Allowed</div>
                  <div className="text-xl font-black text-emerald-950">${contribResult.totalAllowedLimit.toLocaleString()}</div>
                </div>
              </div>

              {/* Recommended Per-Paycheck Strategy */}
              <div className="bg-blue-950 text-white rounded-xl p-4 space-y-2">
                <div className="text-xs text-amber-300 font-bold uppercase">Optimal Per-Paycheck Deduction</div>
                <div className="text-2xl font-black text-white">
                  ${(contribResult.recommendedPerPayPeriod ?? 0).toFixed(2)} <span className="text-xs font-normal text-slate-300">/ per pay period ({payPeriodCount} cycles)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {contribResult.notes}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 3. ANNUITY CALCULATOR */}
      {/* ---------------------------------------------------- */}
      {activeCalc === 'annuity' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2">
              TSP Life Annuity Parameters
            </h2>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>TSP Balance to Convert into Annuity ($)</span>
                <span className="text-blue-900 font-black">${annuityBalance.toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min="10000" 
                max="1000000" 
                step="10000"
                value={annuityBalance}
                onChange={(e) => setAnnuityBalance(Number(e.target.value))}
                className="w-full accent-blue-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Annuitant Age</label>
              <input 
                type="number" 
                value={annuityAge}
                onChange={(e) => setAnnuityAge(Math.max(50, Math.min(85, Number(e.target.value))))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Annuity Payout Structure</label>
              <select 
                value={annuityOption}
                onChange={(e: any) => setAnnuityOption(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold"
              >
                <option value="single_level">Single Life - Level Payments (Highest Initial Monthly Payout)</option>
                <option value="single_increasing">Single Life - 2% Annual Inflation Protection Increase</option>
                <option value="joint_100_level">Joint Life - 100% Survivor Benefit with Spouse</option>
                <option value="joint_50_level">Joint Life - 50% Survivor Benefit with Spouse</option>
                <option value="single_10yr_certain">Single Life - 10-Year Certain Feature</option>
              </select>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-5">
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white rounded-2xl p-6 shadow-md border border-slate-800 space-y-4">
              <div className="text-xs font-bold text-amber-300 uppercase">
                Estimated Guaranteed Monthly Lifetime Payout
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white">
                ${Math.round(annuityResult.monthlyPayment).toLocaleString()} <span className="text-xs font-normal text-slate-300">/ month for life</span>
              </div>
              <div className="text-xs text-slate-300">
                Annual Payout: <strong className="text-white">${Math.round(annuityResult.annualPayment).toLocaleString()} / year</strong>
              </div>

              <div className="pt-4 border-t border-white/15 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Selected Option:</span>
                  <span className="font-bold text-white text-right">{annuityResult.payoutOption}</span>
                </div>
                {annuityResult.hasSpouseSurvivorBenefit && (
                  <div className="flex justify-between text-emerald-300">
                    <span>Survivor Monthly Annuity:</span>
                    <span className="font-bold">${Math.round(annuityResult.survivorMonthlyPayment).toLocaleString()} / month</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 4. ROTH IN-PLAN CONVERSION */}
      {/* ---------------------------------------------------- */}
      {activeCalc === 'roth' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2">
              In-Plan Roth Conversion Modeler
            </h2>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Traditional Amount to Convert ($)</span>
                <span className="text-blue-900 font-black">${rothConvertAmount.toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min="5000" 
                max="250000" 
                step="5000"
                value={rothConvertAmount}
                onChange={(e) => setRothConvertAmount(Number(e.target.value))}
                className="w-full accent-blue-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fed Tax Bracket</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={currentFedTax}
                    onChange={(e) => setCurrentFedTax(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold pr-6"
                  />
                  <span className="absolute right-2 top-2 text-xs text-slate-500 font-bold">%</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">State Tax Bracket</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={currentStateTax}
                    onChange={(e) => setCurrentStateTax(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold pr-6"
                  />
                  <span className="absolute right-2 top-2 text-xs text-slate-500 font-bold">%</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Years Until Retirement</span>
                <span className="text-blue-900 font-bold">{yearsToRetirement} years</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="35" 
                value={yearsToRetirement}
                onChange={(e) => setYearsToRetirement(Number(e.target.value))}
                className="w-full accent-blue-900"
              />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white border-2 border-purple-800/40 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-purple-100 text-purple-900 font-bold text-xs rounded-md">
                  Roth Tax-Free Growth Analysis
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-rose-50 p-3 rounded-xl border border-rose-200">
                  <div className="text-[11px] text-rose-900 font-bold">Estimated Tax Due Today</div>
                  <div className="text-xl font-black text-rose-950">${Math.round(rothResult.currentEstimatedTax).toLocaleString()}</div>
                  <div className="text-[10px] text-rose-800">Paid on current annual tax return</div>
                </div>

                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  <div className="text-[11px] text-emerald-900 font-bold">Tax-Free Nest Egg in {yearsToRetirement} Yrs</div>
                  <div className="text-xl font-black text-emerald-950">${Math.round(rothResult.futureProjectedValueRoth).toLocaleString()}</div>
                  <div className="text-[10px] text-emerald-800">100% Tax-Free Withdrawals</div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-2">
                <div className="font-bold text-slate-900">Long-Term Comparison:</div>
                <p>
                  If kept in Traditional, the projected balance of ${Math.round(rothResult.futureProjectedValueTraditional).toLocaleString()} would incur ~${Math.round(rothResult.futureEstimatedTaxAtRetirement).toLocaleString()} in taxes at retirement.
                </p>
                <div className="font-black text-emerald-800 text-sm">
                  Estimated Net Advantage of Converting: +${Math.round(rothResult.netFutureRothAdvantage).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 5. FEDERAL BALLPARK ESTIMATE */}
      {/* ---------------------------------------------------- */}
      {activeCalc === 'ballpark' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2">
              Three-Pillar FERS / CSRS Inputs
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">High-3 Average Salary ($)</label>
              <input 
                type="number" 
                value={high3}
                onChange={(e) => setHigh3(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Years of Service</label>
                <input 
                  type="number" 
                  value={serviceYears}
                  onChange={(e) => setServiceYears(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Retirement Age</label>
                <input 
                  type="number" 
                  value={ballparkAge}
                  onChange={(e) => setBallparkAge(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Monthly Social Security ($)</label>
              <input 
                type="number" 
                value={ssMonthly}
                onChange={(e) => setSsMonthly(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Projected VBSP Bullion Balance at Retirement ($)</label>
              <input 
                type="number" 
                value={tspEstBalance}
                onChange={(e) => setTspEstBalance(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold"
              />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 space-y-4">
              <div className="text-xs font-bold text-amber-300 uppercase">
                Total Combined Federal Monthly Retirement Income
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white">
                ${Math.round(ballparkResult.totalMonthlyRetirementIncome).toLocaleString()} <span className="text-xs font-normal text-slate-300">/ month</span>
              </div>
              <div className="text-xs text-slate-300">
                Annual Total: <strong className="text-white">${Math.round(ballparkResult.totalAnnualRetirementIncome).toLocaleString()} / year</strong> • <strong className="text-emerald-400 font-bold">{(ballparkResult.replacementRatio ?? 0).toFixed(1)}%</strong> of High-3 Salary
              </div>

              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/15 text-xs">
                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                  <span className="text-slate-400 block mb-0.5">Pillar 1: FERS Annuity</span>
                  <span className="font-black text-blue-300 text-sm">${Math.round(ballparkResult.fersBasicAnnuityMonthly).toLocaleString()} / mo</span>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                  <span className="text-slate-400 block mb-0.5">Pillar 2: Social Security</span>
                  <span className="font-black text-purple-300 text-sm">${Math.round(ballparkResult.socialSecurityMonthly).toLocaleString()} / mo</span>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                  <span className="text-slate-400 block mb-0.5">Pillar 3: VBSP Drawdown</span>
                  <span className="font-black text-amber-300 text-sm">${Math.round(ballparkResult.tspMonthlyDrawdown).toLocaleString()} / mo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
