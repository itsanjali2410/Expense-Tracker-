
import React from 'react';
import { SummaryStats, CurrencyConfig, Category } from '../../types';
import { Target, TrendingUp, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

interface AnalysisPanelProps {
  stats: SummaryStats;
  currency: CurrencyConfig;
  budgets: Record<string, number>;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ stats, currency, budgets }) => {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat(currency.locale, { style: 'currency', currency: currency.code, maximumFractionDigits: 0 }).format(val);

  // Cast Object.entries to [string, number][] to fix 'unknown' type errors on limit and spent calculations
  const budgetCategories = (Object.entries(budgets) as [string, number][])
    .filter(([_, limit]) => limit > 0)
    .map(([cat, limit]) => {
      const spent = stats.categoryTotals[cat] || 0;
      const percent = limit > 0 ? (spent / limit) * 100 : 0;
      return { cat: cat as Category, limit, spent, percent };
    })
    .sort((a, b) => b.percent - a.percent);

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 h-full">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          Analysis & Budgets
        </h3>
      </div>
      
      <div className="space-y-8">
        {/* Budget Progress Section */}
        <div>
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Target className="w-3.5 h-3.5" />
            Budget Progress
          </h4>
          {budgetCategories.length > 0 ? (
            <div className="space-y-6">
              {budgetCategories.slice(0, 4).map(b => (
                <div key={b.cat} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-slate-700">{b.cat}</span>
                    <span className={`font-black ${b.percent > 90 ? 'text-rose-600' : 'text-slate-900'}`}>
                      {Math.round(b.percent)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-700 ${
                        b.percent > 100 ? 'bg-rose-500' : b.percent > 80 ? 'bg-amber-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${Math.min(b.percent, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                    {/* Fixed 'spent' type inference issue for formatCurrency */}
                    <span>Spent: {formatCurrency(b.spent)}</span>
                    <span>Limit: {formatCurrency(b.limit)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
              <p className="text-sm text-slate-400 font-medium">No budgets set yet. Track your targets by setting limits.</p>
            </div>
          )}
        </div>

        {/* Dynamic Insight */}
        <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 relative overflow-hidden group">
          <div className="relative z-10">
            <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Smart Insight
            </h4>
            <p className="text-xs text-indigo-900 leading-relaxed font-medium">
              {stats.averageDailyExpense > 0 ? (
                <>Your current daily burn is <strong>{formatCurrency(stats.averageDailyExpense)}</strong>. 
                At this rate, your monthly forecast is {formatCurrency(stats.averageDailyExpense * 30)}.</>
              ) : (
                "Upload a statement to see detailed spending velocity and budget alerts."
              )}
            </p>
          </div>
          <Sparkles className="absolute -bottom-4 -right-4 w-16 h-16 text-indigo-100/30 group-hover:text-indigo-200/50 transition-colors" />
        </div>

        {/* Budget Status Tags */}
        <div className="space-y-3">
          {budgetCategories.some(b => b.percent > 100) && (
            <div className="flex items-center gap-3 p-3 bg-rose-50 rounded-xl text-rose-700 border border-rose-100 animate-pulse">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="text-[11px] font-bold uppercase tracking-tight">Overbudget detected</span>
            </div>
          )}
          {budgetCategories.length > 0 && !budgetCategories.some(b => b.percent > 100) && (
            <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl text-emerald-700 border border-emerald-100">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="text-[11px] font-bold uppercase tracking-tight">Within target limits</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
