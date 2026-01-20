
import React from 'react';
import { SummaryStats } from '../types';
import { Calendar, Tag, Activity, PieChart } from 'lucide-react';

interface AnalysisPanelProps {
  stats: SummaryStats;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ stats }) => {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  // Fix: Explicitly cast Object.entries to [string, number][] to avoid 'unknown' type errors during comparison and when passing value to formatCurrency
  const topCategory = (Object.entries(stats.categoryTotals) as [string, number][]).reduce(
    (max, [cat, val]) => (val > max.val ? { cat, val } : max),
    { cat: 'N/A', val: 0 }
  );

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full">
      <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
        <Activity className="w-5 h-5 text-indigo-600" />
        Spending Patterns
      </h3>
      
      <div className="space-y-6">
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center">
            <Calendar className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Peak Spending Day</p>
            <p className="text-base font-semibold text-slate-900">
              {stats.highestSpendingDay.date !== 'N/A' 
                ? `${new Date(stats.highestSpendingDay.date).toLocaleDateString('en-IN', { month: 'long', day: 'numeric' })}`
                : 'No data'}
            </p>
            <p className="text-sm text-slate-500 mt-1">
               Total: {formatCurrency(stats.highestSpendingDay.amount)}
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center">
            <PieChart className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Top Expenditure</p>
            <p className="text-base font-semibold text-slate-900">
              {topCategory.cat}
            </p>
            <p className="text-sm text-slate-500 mt-1">
               Total: {formatCurrency(topCategory.val)}
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center">
            <Tag className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Volume</p>
            <p className="text-base font-semibold text-slate-900">
              {stats.transactionCount} transactions
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Extracted from statement.
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-xs text-slate-500 leading-relaxed italic">
            "Your average daily expenditure is <strong>{formatCurrency(stats.averageDailyExpense)}</strong>. 
            Most of your spending goes towards <strong>{topCategory.cat.toLowerCase()}</strong>. 
            Consider reviewing high-value transactions in the table below."
          </p>
        </div>
      </div>
    </div>
  );
};
