
import React, { useState, useCallback, useMemo } from 'react';
import { Upload, FileText, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { Transaction, TransactionType, SummaryStats } from './types';
import { extractTransactionsFromPDF } from './services/geminiService';
import { SummaryCards } from './components/SummaryCards';
import { SpendingCharts } from './components/SpendingCharts';
import { TransactionTable } from './components/TransactionTable';
import { AnalysisPanel } from './components/AnalysisPanel';

const App: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a valid PDF bank statement.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        try {
          const extracted = await extractTransactionsFromPDF(base64);
          setTransactions(extracted);
        } catch (err: any) {
          setError(err.message || 'Failed to process PDF.');
        } finally {
          setIsProcessing(false);
        }
      };
      reader.onerror = () => {
        setError('Error reading file.');
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('An unexpected error occurred.');
      setIsProcessing(false);
    }
  };

  const stats: SummaryStats = useMemo(() => {
    const income = transactions
      .filter(t => t.type === TransactionType.CREDIT)
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter(t => t.type === TransactionType.DEBIT)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const dailyExpensesMap = transactions
      .filter(t => t.type === TransactionType.DEBIT)
      .reduce((acc, t) => {
        acc[t.date] = (acc[t.date] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const categoryTotals = transactions
      .filter(t => t.type === TransactionType.DEBIT)
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const uniqueDays = Object.keys(dailyExpensesMap).length;
    const avgDaily = uniqueDays > 0 ? expenses / uniqueDays : 0;

    let highestDay = { date: 'N/A', amount: 0 };
    (Object.entries(dailyExpensesMap) as [string, number][]).forEach(([date, amount]) => {
      if (amount > highestDay.amount) {
        highestDay = { date, amount };
      }
    });

    return {
      totalIncome: income,
      totalExpenses: expenses,
      netBalance: income - expenses,
      transactionCount: transactions.length,
      averageDailyExpense: avgDaily,
      highestSpendingDay: highestDay,
      categoryTotals
    };
  }, [transactions]);

  return (
    <div className="min-h-screen pb-20">
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-xl">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Smart Expense Tracker</h1>
            </div>
            <div className="text-sm font-medium text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
              India Edition (₹)
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {!transactions.length && !isProcessing && (
          <div className="max-w-xl mx-auto mt-12">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Track your spends in Rupees</h2>
              <p className="text-slate-500">Upload your Indian bank statement PDF. We'll categorize your Food, Travel, and Savings automatically.</p>
            </div>

            <div className="relative group">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="border-2 border-dashed border-slate-300 group-hover:border-indigo-500 bg-white p-12 rounded-3xl transition-all flex flex-col items-center justify-center gap-4 text-center">
                <div className="p-4 bg-indigo-50 rounded-2xl group-hover:bg-indigo-100 transition-colors">
                  <Upload className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-900">Drop bank statement PDF</p>
                  <p className="text-sm text-slate-500">Supports HDFC, SBI, ICICI, and more</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 text-rose-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}
          </div>
        )}

        {isProcessing && (
          <div className="max-w-md mx-auto mt-24 text-center">
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <Loader2 className="w-6 h-6 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Categorizing Transactions...</h3>
                <p className="text-slate-500">Gemini is identifying patterns in your Food, Travel, and other expenses.</p>
              </div>
            </div>
          </div>
        )}

        {transactions.length > 0 && !isProcessing && (
          <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Financial Snapshot</h2>
                <p className="text-slate-500">Detailed breakdown of your transactions in ₹.</p>
              </div>
              <button 
                onClick={() => setTransactions([])}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Reset & Upload
              </button>
            </div>

            <SummaryCards stats={stats} />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 space-y-8">
                <SpendingCharts transactions={transactions} />
                <TransactionTable transactions={transactions} />
              </div>
              <div className="xl:col-span-1">
                <div className="sticky top-24">
                  <AnalysisPanel stats={stats} />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-20 py-8 border-t border-slate-100 text-center">
        <p className="text-sm text-slate-400">
          Secure Local Processing • INR (₹) Supported • Built for Modern Finance
        </p>
      </footer>
    </div>
  );
};

export default App;
