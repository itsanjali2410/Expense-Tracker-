
import React from 'react';
import { SummaryStats } from '../types';
import { TrendingUp, TrendingDown, Wallet, BarChart3 } from 'lucide-react';

interface SummaryCardsProps {
  stats: SummaryStats;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ stats }) => {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 0 
    }).format(val);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Income</span>
          <div className="p-2 bg-emerald-50 rounded-lg">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalIncome)}</div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Expenses</span>
          <div className="p-2 bg-rose-50 rounded-lg">
            <TrendingDown className="w-5 h-5 text-rose-600" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalExpenses)}</div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Net Balance</span>
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Wallet className="w-5 h-5 text-indigo-600" />
          </div>
        </div>
        <div className={`text-2xl font-bold ${stats.netBalance >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
          {formatCurrency(stats.netBalance)}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Avg. Daily Spend</span>
          <div className="p-2 bg-amber-50 rounded-lg">
            <BarChart3 className="w-5 h-5 text-amber-600" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900">{formatCurrency(stats.averageDailyExpense)}</div>
      </div>
    </div>
  );
};
