import React, { useState } from 'react';
import { MOCK_TRANSACTIONS } from '../../data/mockData';
import { TSPTransaction } from '../../types';
import { 
  History, 
  Download, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  FileText,
  Calendar,
  CheckCircle2
} from 'lucide-react';

export const TransactionHistory: React.FC = () => {
  const [filterType, setFilterType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = MOCK_TRANSACTIONS.filter(tx => {
    const matchesFilter = filterType === 'All' ? true : tx.type.toLowerCase().includes(filterType.toLowerCase());
    const matchesQuery = tx.description.toLowerCase().includes(searchQuery.toLowerCase()) || tx.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  const handleExportCSV = () => {
    const headers = ['Transaction ID', 'Date', 'Type', 'Amount', 'Description', 'Status'];
    const rows = filtered.map(t => [
      t.id,
      t.date,
      t.type,
      t.amount,
      `"${t.description.replace(/"/g, '""')}"`,
      t.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TSP_Transaction_Ledger_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12" id="transaction-history">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <History className="w-5 h-5 text-blue-800" />
            <h2 className="text-xl font-black text-slate-900">Activity & Transaction History</h2>
          </div>
          <p className="text-xs text-slate-600">
            Official accounting ledger of all payroll deductions, agency matches, transfers, loan repayments, and disbursements.
          </p>
        </div>

        <button 
          onClick={handleExportCSV}
          className="px-4 py-2 bg-slate-900 hover:bg-blue-900 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>Export Official CSV Ledger</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search description or transaction ID..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-800"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs font-bold">
          {['All', 'Payroll', 'Match', 'Transfer', 'Fee'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                filterType === t ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-3.5 px-4">Tx ID & Date</th>
                <th className="py-3.5 px-3">Transaction Type</th>
                <th className="py-3.5 px-4">Description & Fund Allocation</th>
                <th className="py-3.5 px-3 text-right">Amount ($)</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((tx) => {
                const isPositive = tx.amount >= 0;
                return (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{tx.id}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {tx.date}
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-semibold text-[11px]">
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 font-medium">{tx.description}</div>
                    </td>
                    <td className={`py-3.5 px-3 text-right font-black text-sm ${isPositive ? 'text-emerald-700' : 'text-slate-900'}`}>
                      {isPositive ? `+$${tx.amount.toFixed(2)}` : `-$${Math.abs(tx.amount).toFixed(2)}`}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{tx.status}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
