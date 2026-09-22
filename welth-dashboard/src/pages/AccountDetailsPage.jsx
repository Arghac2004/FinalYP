import React, { useState } from 'react';
import { useFinTrack, CATEGORY_STYLES } from '../context/FinTrackContext';
import AccountBarChart from '../components/charts/AccountBarChart';

const AccountDetailsPage = ({ accountId, navigateTo }) => {
  const { accounts, transactions, deleteTransaction, formatCurrency } = useFinTrack();

  const [range, setRange] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const acc = accounts.find((a) => a.id === accountId) || accounts[0];
  if (!acc) {
    return (
      <main className="w-full flex-1 px-4 py-8 max-w-[1400px] mx-auto text-center">
        <p className="text-slate-500">Account not found.</p>
        <button
          onClick={() => navigateTo('#/')}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold"
        >
          Return to Dashboard
        </button>
      </main>
    );
  }

  // All transactions for this account
  const accountTxs = transactions.filter((t) => (t.account || 'personal') === acc.id);

  // Filter by range for overview card metrics
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let rangeTxs = accountTxs;
  if (range === 'this-month') {
    rangeTxs = accountTxs.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
  } else if (range === 'last-month') {
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    rangeTxs = accountTxs.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    });
  }

  // Range metrics
  let rangeIncome = 0;
  let rangeExpense = 0;
  rangeTxs.forEach((t) => {
    const amt = Math.abs(Number(t.amount)) || 0;
    if (t.type === 'income') rangeIncome += amt;
    else rangeExpense += amt;
  });
  const rangeNet = rangeIncome - rangeExpense;

  // Total Account Balance
  let totalIncome = 0;
  let totalExpense = 0;
  accountTxs.forEach((t) => {
    const amt = Math.abs(Number(t.amount)) || 0;
    if (t.type === 'income') totalIncome += amt;
    else totalExpense += amt;
  });
  const currentBalance = (acc.initialBalance || 0) + totalIncome - totalExpense;

  // Filter for table
  let tableTxs = accountTxs;
  if (typeFilter !== 'all') {
    tableTxs = tableTxs.filter((t) => t.type === typeFilter);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    tableTxs = tableTxs.filter(
      (t) =>
        (t.description || '').toLowerCase().includes(q) ||
        (t.category || '').toLowerCase().includes(q)
    );
  }

  return (
    <main id="view-account-details" className="w-full flex-1 px-4 sm:px-6 lg:px-12 py-5 sm:py-8 max-w-[1400px] mx-auto relative z-10 space-y-6 sm:space-y-7 pb-24 md:pb-8 animate-fadeIn">
      {/* Top Nav Actions */}
      <div className="flex items-center justify-between">
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

        <button
          type="button"
          onClick={() => navigateTo('#/add-transaction')}
          className="btn-3d flex items-center gap-1.5 bg-slate-900 dark:bg-primary hover:bg-slate-800 text-white text-xs font-bold px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Transaction
        </button>
      </div>

      {/* Account Title & Balance Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pt-1 sm:pt-2">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-primary tracking-tight">
            {acc.name}
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-0.5 sm:mt-1">{acc.type || 'Savings Account'}</p>
        </div>

        <div className="sm:text-right">
          <div className={`text-2xl sm:text-4xl font-black tracking-tight ${currentBalance >= 0 ? 'text-slate-900' : 'text-red-500'}`}>
            {formatCurrency(currentBalance)}
          </div>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            {accountTxs.length} Transaction{accountTxs.length === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      {/* ── TRANSACTION OVERVIEW CARD (Bar Chart & 3 Metrics) ── */}
      <div className="tilt-card bg-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-card space-y-5 sm:space-y-6">
        {/* Top Overview Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <h2 className="text-sm font-bold text-slate-800">Transaction Overview</h2>

          {/* Range Filter Dropdown */}
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none cursor-pointer hover:border-primary transition-colors"
          >
            <option value="all">All Time</option>
            <option value="last-month">Last Month</option>
            <option value="this-month">This Month</option>
          </select>
        </div>

        {/* 3 Metrics (Total Income, Total Expenses, Net) */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center py-2">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Income</span>
            <p className="text-base sm:text-2xl font-black text-emerald-600 tracking-tight">
              {formatCurrency(rangeIncome)}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Expenses</span>
            <p className="text-base sm:text-2xl font-black text-red-500 tracking-tight">
              {formatCurrency(rangeExpense)}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Net</span>
            <p className={`text-base sm:text-2xl font-black tracking-tight ${rangeNet >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {formatCurrency(rangeNet)}
            </p>
          </div>
        </div>

        {/* Dual Bar Chart */}
        <div className="pt-2">
          <AccountBarChart txList={rangeTxs} />
        </div>
      </div>

      {/* ── ACCOUNT TRANSACTIONS TABLE ── */}
      <div className="tilt-card bg-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <h2 className="text-sm sm:text-base font-bold text-slate-900">Account Transactions</h2>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 sm:w-60">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transactions..."
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none focus:border-primary transition-colors"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none cursor-pointer hover:border-primary transition-colors"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[260px]">
          {tableTxs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 shadow-inner">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs font-medium text-slate-500">No transactions found in this account.</p>
              <button
                type="button"
                onClick={() => navigateTo('#/add-transaction')}
                className="mt-2 text-xs text-primary font-bold hover:underline cursor-pointer"
              >
                + Add transaction to this account
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-semibold">Date</th>
                  <th className="py-3.5 px-4 font-semibold">Description</th>
                  <th className="py-3.5 px-4 font-semibold">Category</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Amount</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Type</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {tableTxs.map((tx) => {
                  const isIncome = tx.type === 'income';
                  const amountStr = isIncome ? `+${formatCurrency(tx.amount)}` : `-${formatCurrency(tx.amount)}`;
                  const amountClass = isIncome ? 'text-emerald-600 font-bold' : 'text-red-500 font-bold';
                  const catStyle = CATEGORY_STYLES[tx.category] || { icon: '📦', color: '#94A3B8' };

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap font-medium text-xs">
                        {tx.date}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200 text-xs">
                        {tx.description}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="category-pill text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200/80 dark:border-slate-700">
                          <span>{catStyle.icon}</span>
                          <span>{tx.category || 'Other'}</span>
                        </span>
                      </td>
                      <td className={`py-3.5 px-4 text-right whitespace-nowrap font-bold text-xs ${amountClass}`}>
                        {amountStr}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-200/60 dark:border-slate-700">
                          <span className={`w-1.5 h-1.5 rounded-full ${isIncome ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
                          {isIncome ? 'Income' : 'Expense'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => deleteTransaction(tx.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all text-xs p-1 cursor-pointer"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
};

export default AccountDetailsPage;
