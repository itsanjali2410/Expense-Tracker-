
import React, { useMemo, useState } from 'react';
import { Transaction, TransactionType } from '../types';
import { ChevronDown, ChevronUp, Search, Tag } from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
}

export const TransactionTable: React.FC<TransactionTableProps> = ({ transactions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filteredAndSorted = useMemo(() => {
    return [...transactions]
      .filter(t => 
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortDir === 'asc' ? dateA - dateB : dateB - dateA;
      });
  }, [transactions, searchTerm, sortDir]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Food & Dining': return 'bg-orange-100 text-orange-700';
      case 'Travel': return 'bg-blue-100 text-blue-700';
      case 'Savings/Investments': return 'bg-emerald-100 text-emerald-700';
      case 'Shopping': return 'bg-purple-100 text-purple-700';
      case 'Utilities': return 'bg-slate-100 text-slate-700';
      case 'Entertainment': return 'bg-pink-100 text-pink-700';
      case 'Health': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-50 text-slate-500';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-slate-900">Transaction History</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by description or category..."
            className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full sm:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <th 
                className="px-6 py-4 cursor-pointer hover:text-slate-900 transition-colors"
                onClick={() => setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')}
              >
                <div className="flex items-center gap-1">
                  Date
                  {sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </div>
              </th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAndSorted.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                  {new Date(t.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                  {t.description}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight ${getCategoryColor(t.category)}`}>
                    {t.category}
                  </span>
                </td>
                <td className={`px-6 py-4 text-sm font-semibold text-right whitespace-nowrap ${
                  t.type === TransactionType.CREDIT ? 'text-emerald-600' : 'text-slate-900'
                }`}>
                  {t.type === TransactionType.DEBIT ? '-' : '+'} {formatCurrency(t.amount)}
                </td>
              </tr>
            ))}
            {filteredAndSorted.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
