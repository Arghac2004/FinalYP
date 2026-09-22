import React, { useState } from 'react';
import { useFinTrack, CATEGORY_STYLES } from '../context/FinTrackContext';

const AddTransactionPage = ({ navigateTo }) => {
  const { accounts, addTransaction, formatCurrency } = useFinTrack();

  const [type, setType] = useState('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Groceries');
  const [account, setAccount] = useState(() => {
    const def = accounts.find((a) => a.isDefault);
    return def ? def.id : (accounts[0]?.id || 'personal');
  });

  const selectedAccountObj = accounts.find((a) => a.id === account);
  const accountNameDisplay = selectedAccountObj ? selectedAccountObj.name : 'Account';
  const catStyle = CATEGORY_STYLES[category] || { icon: '📦', color: '#94A3B8' };
  const numAmount = parseFloat(amount) || 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim() || isNaN(numAmount) || numAmount <= 0) return;

    addTransaction({
      description: description.trim(),
      amount: numAmount,
      type,
      category,
      account,
      date,
    });

    navigateTo('#/');
  };

  return (
    <main id="view-add-transaction" className="w-full flex-1 px-4 sm:px-6 lg:px-12 py-5 sm:py-8 max-w-[1200px] mx-auto relative z-10 pb-24 md:pb-8 animate-fadeIn">
      {/* Top Back Navigation & Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigateTo('#/')}
            className="btn-3d flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold hover:text-primary transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            <span className="hidden xs:inline">Back to Dashboard</span>
            <span className="xs:hidden">Back</span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Ledger Entry</span>
        </div>
      </div>

      {/* 3D Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left: 3D Form Card (Col 7) */}
        <div className="lg:col-span-7 tilt-card bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-card">
          <div className="depth-layer mb-5 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">New Transaction</h2>
            <p className="text-xs text-slate-400 mt-1">Record a new expense or income entry into your selected account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 text-xs">
            {/* 3D Segmented Type Switch */}
            <div className="depth-layer-sm">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">Transaction Type</label>
              <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`py-2.5 rounded-xl font-bold text-xs transition-all active:scale-98 cursor-pointer ${
                    type === 'expense'
                      ? 'bg-red-500 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  💸 Expense
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`py-2.5 rounded-xl font-bold text-xs transition-all active:scale-98 cursor-pointer ${
                    type === 'income'
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  💰 Income
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="depth-layer-sm">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Grocery store, Client payment"
                required
                className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-xs text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-800/50"
              />
            </div>

            {/* Amount & Date Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 depth-layer-sm">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  required
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-800/50"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-xs text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-800/50"
                />
              </div>
            </div>

            {/* Category & Account Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 depth-layer-sm">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 cursor-pointer"
                >
                  <option value="Groceries">🛒 Groceries</option>
                  <option value="Housing">🏠 Housing / Rent</option>
                  <option value="Transport">🚗 Transport</option>
                  <option value="Subscriptions">📱 Subscriptions</option>
                  <option value="Shopping">🛍️ Shopping</option>
                  <option value="Dining">🍽️ Dining</option>
                  <option value="Utilities">⚡ Utilities</option>
                  <option value="Salary">💼 Salary / Income</option>
                  <option value="Investments">📈 Investments</option>
                  <option value="Other">📦 Other</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Account</label>
                <select
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 cursor-pointer"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.type.split(' ')[0]})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Action Button */}
            <div className="pt-3 depth-layer">
              <button
                type="submit"
                className="btn-3d w-full py-3 sm:py-3.5 bg-primary hover:bg-primary-hover text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Save Transaction
              </button>
            </div>
          </form>
        </div>

        {/* Right: Real-Time 3D Holographic Live Preview Card (Col 5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Transaction Live Preview
          </div>

          {/* 3D Card Live Preview */}
          <div id="live-3d-card" className="tilt-card account-3d-card p-5 sm:p-7 rounded-2xl sm:rounded-3xl min-h-[220px] sm:min-h-[260px] flex flex-col justify-between transition-all">
            <div className="flex items-start justify-between depth-layer">
              <div>
                <span
                  className={`inline-block text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md border shadow-xs ${
                    type === 'expense'
                      ? 'bg-red-100 dark:bg-red-950/60 text-red-600 border-red-200 dark:border-red-900'
                      : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 border-emerald-200 dark:border-emerald-900'
                  }`}
                >
                  {type === 'expense' ? 'Expense' : 'Income'}
                </span>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-2">{accountNameDisplay}</p>
              </div>

              {/* Metallic Chip */}
              <div className="flex items-center gap-2">
                <div className="card-chip" title="EMV Secured"></div>
              </div>
            </div>

            {/* Live Amount Display */}
            <div className="my-3 sm:my-4 depth-layer">
              <span className="text-[11px] sm:text-xs text-slate-400 font-medium">Transaction Amount</span>
              <div
                className={`text-2xl sm:text-3xl font-black tracking-tight mt-0.5 ${
                  type === 'expense' ? 'text-red-500' : 'text-emerald-600'
                }`}
              >
                {type === 'expense' ? '-' : '+'}
                {formatCurrency(numAmount)}
              </div>
            </div>

            {/* Bottom Details (Category + Date + Description) */}
            <div className="pt-3 sm:pt-4 border-t border-slate-200/60 dark:border-slate-700 flex items-center justify-between text-xs depth-layer-sm">
              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {catStyle.icon} {category}
                </span>
                <p className="text-[11px] text-slate-400 truncate max-w-[150px] sm:max-w-[180px]">
                  {description || 'New Purchase'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-semibold text-slate-500">{date}</span>
              </div>
            </div>
          </div>

          {/* 3D Security Info Box */}
          <div className="tilt-card bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700 flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-slate-800 text-primary flex items-center justify-center font-bold text-base flex-shrink-0 shadow-xs">
              🛡️
            </div>
            <div className="text-[11px] text-slate-500 leading-snug">
              <strong className="text-slate-800 dark:text-slate-200 font-semibold block">Instant Ledger Sync</strong>
              Transactions automatically calculate account balances and adjust budget analytics in real time.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AddTransactionPage;
