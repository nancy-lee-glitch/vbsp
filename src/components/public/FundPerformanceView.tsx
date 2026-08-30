import React, { useState } from 'react';
import { TSPFund } from '../../types';
import { 
  TrendingUp, 
  Shield, 
  BarChart3, 
  Info, 
  ArrowUpRight, 
  ArrowDownRight, 
  Layers, 
  PieChart,
  CheckCircle2
} from 'lucide-react';

interface FundPerformanceViewProps {
  funds: TSPFund[];
}

export const FundPerformanceView: React.FC<FundPerformanceViewProps> = ({ funds }) => {
  const [selectedFund, setSelectedFund] = useState<TSPFund>(funds[2] || funds[0]); // Default C Fund
  const [filterCategory, setFilterCategory] = useState<'All' | 'Core Individual Fund' | 'Lifecycle Fund'>('All');

  const filteredFunds = funds.filter(f => 
    filterCategory === 'All' ? true : f.category === filterCategory
  );

  return (
    <div className="space-y-8 pb-12" id="fund-performance-view">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-md">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-800 text-blue-200 rounded-md text-xs font-bold mb-3">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>OFFICIAL RATES OF RETURN & SHARE PRICES</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
          VBSP Bullion Funds & Custodial Performance
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          The VBSP offers five individual sovereign core bullion and security funds covering LBMA allocated gold, silver reserves, sovereign liquidity, precious metals indexes, and mining reserves, alongside Lifecycle (L) Target-Date Funds. All funds feature 100% audited physical backing and ultra-low custodial fees.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-xs font-bold">
        <button 
          onClick={() => setFilterCategory('All')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${filterCategory === 'All' ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
        >
          All TSP Funds ({funds.length})
        </button>
        <button 
          onClick={() => setFilterCategory('Core Individual Fund')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${filterCategory === 'Core Individual Fund' ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
        >
          Core Individual Funds (G, F, C, S, I)
        </button>
        <button 
          onClick={() => setFilterCategory('Lifecycle Fund')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${filterCategory === 'Lifecycle Fund' ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
        >
          Lifecycle (L) Target-Date Funds
        </button>
      </div>

      {/* Main Table of Fund Performance */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-bold text-slate-800">
            Current Share Prices & Historical Compound Annual Rates of Return (%)
          </div>
          <div className="text-[11px] text-slate-500">
            Net of administrative expenses • Updated Daily
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-3 px-4">Fund Code & Name</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Share Price</th>
                <th className="py-3 px-3">1-Month</th>
                <th className="py-3 px-3">2026 YTD</th>
                <th className="py-3 px-3">1-Year</th>
                <th className="py-3 px-3">3-Year</th>
                <th className="py-3 px-3">5-Year</th>
                <th className="py-3 px-3">10-Year</th>
                <th className="py-3 px-3">Expense Ratio</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredFunds.map((fund) => {
                const isSelected = selectedFund.id === fund.id;
                return (
                  <tr 
                    key={fund.id}
                    onClick={() => setSelectedFund(fund)}
                    className={`hover:bg-blue-50/60 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 font-semibold' : ''}`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs text-white ${
                          fund.code === 'G' ? 'bg-emerald-600' :
                          fund.code === 'F' ? 'bg-blue-600' :
                          fund.code === 'C' ? 'bg-indigo-700' :
                          fund.code === 'S' ? 'bg-amber-600' :
                          fund.code === 'I' ? 'bg-purple-600' :
                          'bg-slate-800'
                        }`}>
                          {fund.code}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900">{fund.name}</div>
                          <div className="text-[10px] text-slate-500 font-normal">{fund.benchmark}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">{fund.category}</td>
                    <td className="py-3.5 px-3 font-bold text-slate-900">${(fund.currentSharePrice ?? 0).toFixed(2)}</td>
                    <td className={`py-3.5 px-3 font-semibold ${(fund.oneMonthReturn ?? 0) >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {(fund.oneMonthReturn ?? 0) >= 0 ? `+${(fund.oneMonthReturn ?? 0).toFixed(2)}%` : `${(fund.oneMonthReturn ?? 0).toFixed(2)}%`}
                    </td>
                    <td className={`py-3.5 px-3 font-black ${(fund.ytdReturn ?? 0) >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {(fund.ytdReturn ?? 0) >= 0 ? `+${(fund.ytdReturn ?? 0).toFixed(2)}%` : `${(fund.ytdReturn ?? 0).toFixed(2)}%`}
                    </td>
                    <td className={`py-3.5 px-3 font-semibold ${(fund.oneYearReturn ?? 0) >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {(fund.oneYearReturn ?? 0) >= 0 ? `+${(fund.oneYearReturn ?? 0).toFixed(2)}%` : `${(fund.oneYearReturn ?? 0).toFixed(2)}%`}
                    </td>
                    <td className="py-3.5 px-3 text-slate-700 font-medium">+{(fund.threeYearReturn ?? 0).toFixed(2)}%</td>
                    <td className="py-3.5 px-3 text-slate-700 font-medium">+{(fund.fiveYearReturn ?? 0).toFixed(2)}%</td>
                    <td className="py-3.5 px-3 font-bold text-blue-900">+{(fund.tenYearReturn ?? 0).toFixed(2)}%</td>
                    <td className="py-3.5 px-3 text-emerald-800 font-bold">{fund.expenseRatio}</td>
                    <td className="py-3.5 px-3 text-right">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedFund(fund); }}
                        className="px-2.5 py-1 bg-slate-900 text-white rounded text-[11px] font-bold hover:bg-blue-900"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Fund Deep Dive Details */}
      {selectedFund && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-blue-900 text-white font-black text-sm rounded-md">
                  {selectedFund.code} Fund
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {selectedFund.category}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                {selectedFund.name}
              </h2>
              <div className="text-xs text-slate-500 mt-1">
                Inception Year: <strong>{selectedFund.inceptionYear}</strong> • Tracking Index: <strong>{selectedFund.benchmark}</strong>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500 block">Current Unit Share Price</span>
              <div className="text-3xl font-black text-blue-900">
                ${selectedFund.currentSharePrice.toFixed(2)}
              </div>
              <span className="text-xs font-bold text-emerald-700">
                Net Expense Ratio: {selectedFund.expenseRatio}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>Investment Strategy & Objective</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                {selectedFund.description}
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 p-3 bg-amber-50 rounded-xl border border-amber-200">
                <Shield className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Risk Profile: {selectedFund.riskLevel}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <PieChart className="w-3.5 h-3.5" />
                <span>Asset Composition & Sector Weighting</span>
              </h3>
              <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                {selectedFund.assetComposition.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-800">
                      <span>{item.asset}</span>
                      <span className="font-bold">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-900 h-full rounded-full" 
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
