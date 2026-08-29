import React, { useState } from 'react';
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
  CheckCircle2,
  Clock,
  AlertTriangle,
  Coins,
  ShieldCheck,
  Inbox
} from 'lucide-react';

interface TransactionHistoryProps {
  transactions?: TSPTransaction[];
  accountNumber?: string;
  userName?: string;
  onOpenDepositModal?: () => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions = [],
  accountNumber = 'VBSP-0089-4412-98',
  userName = 'Marcus Vance',
  onOpenDepositModal
}) => {
  const [filterType, setFilterType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = transactions.filter(tx => {
    const matchesFilter = filterType === 'All' ? true : tx.type.toLowerCase().includes(filterType.toLowerCase());
    const matchesQuery = 
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
      tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['Transaction ID', 'Date', 'Type', 'Amount', 'Description', 'Metal Equivalent', 'Status'];
    const rows = filtered.map(t => [
      t.id,
      t.date,
      t.type,
      t.amount,
      `"${t.description.replace(/"/g, '""')}"`,
      t.metalEquivalent || 'N/A',
      t.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VBSP_Depository_Ledger_${accountNumber}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12" id="transaction-history">
      {/* Header */}
      <div className="bg-white border border-[#e2e8f0] rounded-xs p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <History className="w-5 h-5 text-[#0f2942]" />
            <h2 className="text-xl font-black text-[#0f2942]">Sovereign Activity & Transaction Ledger</h2>
          </div>
          <p className="text-xs text-slate-600">
            Official immutable accounting ledger of all bullion acquisitions, wire deposits, agency matches, interfund rebalances, loans, and custody disbursements.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onOpenDepositModal && (
            <button
              onClick={onOpenDepositModal}
              className="px-3.5 py-2 bg-[#112e51] hover:bg-[#002f5a] text-white text-xs font-bold rounded-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs border border-[#002f5a]"
            >
              <Coins className="w-3.5 h-3.5 text-[#f2a900]" />
              <span>Deposit Funds</span>
            </button>
          )}

          <button 
            onClick={handleExportCSV}
            disabled={transactions.length === 0}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xs transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-300 disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#e2e8f0] rounded-xs p-3.5 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search description, tx ID, or fund code..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xs pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#112e51]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs font-bold">
          {['All', 'Deposit', 'Match', 'Rebalance', 'Loan', 'Fee', 'Pending'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-xs transition-colors cursor-pointer shrink-0 text-xs ${
                filterType === t 
                  ? 'bg-[#0f2942] text-white' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction Table / Clean Ledger State */}
      <div className="bg-white border border-[#e2e8f0] rounded-xs shadow-2xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto border border-slate-200">
              <Inbox className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                {transactions.length === 0 ? 'Clean Depository Ledger (0 Transactions)' : 'No Matching Transactions Found'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                {transactions.length === 0 
                  ? 'This new account has a clean ledger with no posted financial transactions. Any wire deposits, bullion purchases, or loans you initiate will appear here and require Super Admin approval.' 
                  : `No activity found matching filter "${filterType}" or search term "${searchQuery}".`}
              </p>
            </div>
            {transactions.length === 0 && onOpenDepositModal && (
              <button
                onClick={onOpenDepositModal}
                className="mt-2 px-4 py-2 bg-[#112e51] hover:bg-[#002f5a] text-white text-xs font-bold rounded-xs inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Coins className="w-4 h-4 text-[#f2a900]" />
                <span>Initiate First Bullion Deposit</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-3 px-4">Tx ID & Date</th>
                  <th className="py-3 px-3">Type & Operation</th>
                  <th className="py-3 px-4">Description & Asset Details</th>
                  <th className="py-3 px-3 text-right">Amount (USD)</th>
                  <th className="py-3 px-4 text-center">Depository Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.map((tx) => {
                  const isPositive = tx.amount >= 0;
                  const isPending = tx.status === 'Pending';
                  const isRejected = tx.status === 'Rejected';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 font-mono">{tx.id}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {tx.date}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        <div className="flex items-center gap-1.5">
                          {isPending ? (
                            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          ) : isRejected ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                          ) : isPositive ? (
                            <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                          )}
                          <span>{tx.type}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs sm:max-w-md">
                        <div className="font-medium text-slate-800">{tx.description}</div>
                        {tx.metalEquivalent && (
                          <div className="text-[11px] text-amber-800 font-mono mt-0.5 flex items-center gap-1 font-semibold">
                            <Coins className="w-3 h-3 text-amber-600" />
                            <span>{tx.metalEquivalent}</span>
                          </div>
                        )}
                        {tx.adminNotes && (
                          <div className="text-[10px] text-slate-500 mt-0.5 italic">
                            Admin Note: {tx.adminNotes}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <span className={`font-mono font-bold ${
                          isPending ? 'text-amber-700' :
                          isRejected ? 'text-slate-400 line-through' :
                          tx.amount > 0 ? 'text-emerald-700' :
                          tx.amount < 0 ? 'text-slate-900' : 'text-slate-500'
                        }`}>
                          {tx.amount === 0 ? '$0.00' : `${tx.amount > 0 ? '+' : ''}$${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-300 rounded-2xs font-bold text-[10px]">
                            <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                            <span>Pending Admin Approval</span>
                          </span>
                        ) : isRejected ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-900 border border-red-300 rounded-2xs font-bold text-[10px]">
                            <AlertTriangle className="w-3 h-3 text-red-600" />
                            <span>Declined</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-2xs font-bold text-[10px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            <span>Settled & Approved</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
