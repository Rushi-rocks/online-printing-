import React from 'react';
import { WalletAccount, Region } from '../types';
import { formatCurrency } from '../services/dynamicPricing';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RotateCcw, 
  Sparkles, 
  CreditCard, 
  ShieldCheck, 
  Download,
  Filter
} from 'lucide-react';

interface WalletViewProps {
  wallet: WalletAccount;
  currentRegion: Region;
  onOpenTopUp: () => void;
}

export const WalletView: React.FC<WalletViewProps> = ({
  wallet,
  currentRegion,
  onOpenTopUp,
}) => {
  const [filter, setFilter] = React.useState<'all' | 'deposit' | 'print_payment' | 'refund'>('all');

  const filteredTransactions = wallet.transactions.filter((tx) => {
    if (filter === 'all') return true;
    return tx.type === filter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Wallet Balance Hero Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
        <div className="md:col-span-7 bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold">
                <Wallet className="w-4 h-4" />
                <span>CYBER CAFE DIGITAL PASS & WALLET</span>
              </div>
              <span className="font-mono text-xs text-indigo-300/80 uppercase">
                {currentRegion.city} Branch Hub
              </span>
            </div>

            <div className="text-xs text-slate-400">Available Printing Balance</div>
            <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-white mt-1 mb-2 tabular-nums">
              {formatCurrency(wallet.balanceUSD, currentRegion)}
            </div>
            <div className="text-xs text-indigo-300 font-mono">
              ~${wallet.balanceUSD.toFixed(2)} USD standard baseline
            </div>
          </div>

          <div className="relative z-10 pt-6 mt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Zero transaction fees on instant cafe prints</span>
            </div>

            <button
              onClick={onOpenTopUp}
              className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Instant Top-Up Balance</span>
            </button>
          </div>

          {/* Decorative glow */}
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        {/* Quick Perks / Info Cards */}
        <div className="md:col-span-5 grid grid-cols-1 gap-3">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Instant Automated Refunds</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Cancelled jobs or printer jams automatically refund back into your wallet within 1 second.
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Multi-Currency & Travel Ready</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Your balance works across any NetPrint cafe branch in Tokyo, San Francisco, London, or Bengaluru.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Wallet Transaction Ledger</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified record of printing payments, deposits, and automated refunds.
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
            {(['all', 'deposit', 'print_payment', 'refund'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize cursor-pointer ${
                  filter === t
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t === 'all' ? 'All' : t === 'deposit' ? 'Deposits' : t === 'print_payment' ? 'Print Debits' : 'Refunds'}
              </button>
            ))}
          </div>
        </div>

        {/* Table of Transactions */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-6">Transaction ID</th>
                <th className="py-3 px-6">Type</th>
                <th className="py-3 px-6">Description</th>
                <th className="py-3 px-6">Date & Time</th>
                <th className="py-3 px-6 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((tx) => {
                const isDeposit = tx.type === 'deposit';
                const isRefund = tx.type === 'refund';
                const isPositive = isDeposit || isRefund;

                return (
                  <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-medium text-slate-700">
                      {tx.id}
                    </td>
                    <td className="py-3.5 px-6">
                      {isDeposit && (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                          <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                          Deposit
                        </span>
                      )}
                      {tx.type === 'print_payment' && (
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                          <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                          Print Debit
                        </span>
                      )}
                      {isRefund && (
                        <span className="inline-flex items-center gap-1 font-semibold text-indigo-700">
                          <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
                          Refund
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-slate-800 font-medium">
                      {tx.description}
                    </td>
                    <td className="py-3.5 px-6 text-slate-500 font-mono text-[11px]">
                      {new Date(tx.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono font-bold tabular-nums">
                      <span className={isPositive ? 'text-emerald-600' : 'text-slate-900'}>
                        {isPositive ? '+' : ''}
                        {formatCurrency(tx.amountUSD, currentRegion)}
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
