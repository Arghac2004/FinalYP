import React, { useState } from 'react';
import { useFinTrack, CATEGORY_STYLES } from '../context/FinTrackContext';
import ExpenseDonutChart from '../components/charts/ExpenseDonutChart';

const DashboardPage = ({ navigateTo }) => {
  const {
    accounts,
    toggleAccount,
    transactions,
    deleteTransaction,
    currentAccountFilter,
    setCurrentAccountFilter,
    getMetrics,
    formatCurrency,
    setIsBudgetModalOpen,
    setIsCreateAccountOpen,
  } = useFinTrack();

  const [txTypeFilter, setTxTypeFilter] = useState('all');

  const metrics = getMetrics(currentAccountFilter);
  const allAccountsMetrics = getMetrics('all');
  const accountStats = allAccountsMetrics.accounts || {};

  // Active account name label
  const activeAccountObj = accounts.find((a) => a.id === currentAccountFilter);
  const activeLabel = currentAccountFilter === 'all' ? 'All Accounts' : activeAccountObj?.name || 'Account';

  // Filter transactions for recent list
  let displayTxs = transactions;
  if (currentAccountFilter !== 'all') {
    displayTxs = displayTxs.filter((t) => (t.account || 'personal') === currentAccountFilter);
  }
  if (txTypeFilter !== 'all') {
    displayTxs = displayTxs.filter((t) => t.type === txTypeFilter);
  }

  return (
    <main id="view-dashboard" className="w-full flex-1 px-4 sm:px-6 lg:px-12 py-5 sm:py-8 space-y-6 sm:space-y-7 max-w-[1600px] mx-auto relative z-10 pb-24 md:pb-8 animate-fadeIn">
      {/* Title & Account Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">DASHBOARD</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Showing: <span className="font-bold text-primary">{activeLabel}</span>
          </p>
        </div>

        {/* Account Switch Filter Tabs (All / Personal / Work) */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700 overflow-x-auto max-w-full scrollbar-none flex-nowrap">
          <button
            type="button"
            onClick={() => setCurrentAccountFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer whitespace-nowrap ${
              currentAccountFilter === 'all'
                ? 'bg-primary text-white shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold'
            }`}
          >
            All Accounts
          </button>
          {accounts.map((acc) => {
            const isSelected = currentAccountFilter === acc.id;
            return (
              <button
                key={acc.id}
                type="button"
                onClick={() => setCurrentAccountFilter(acc.id)}
                className={`px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-primary text-white shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold'
                }`}
              >
                {acc.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── TOP STATS & BUDGET ROW ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
        {/* Annual Budget Progress Card (Col 6) */}
        <div className="tilt-card md:col-span-6 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-card flex flex-col justify-between">
          <div className="depth-layer flex items-center justify-between mb-4">
            <span className="text-xs sm:text-sm font-bold text-slate-800">Annual Budget Progress</span>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-slate-800">{metrics.budgetPct}%</span>
              <button
                type="button"
                onClick={() => setIsBudgetModalOpen(true)}
                className="text-slate-400 hover:text-primary transition-colors text-xs p-1"
                title="Set/Edit Budget"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                </svg>
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="depth-layer-sm w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 sm:h-3 overflow-hidden mb-4 shadow-inner">
            <div
              className="bg-gradient-to-r from-blue-600 to-cyan-500 h-2.5 sm:h-3 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${metrics.budgetPct}%` }}
            ></div>
          </div>

          {/* Progress Subtext */}
          <div className="depth-layer flex items-center justify-between text-[11px] sm:text-xs text-slate-500 font-medium">
            <span>
              <strong className="text-slate-800 font-semibold">{formatCurrency(metrics.totalExpense)}</strong> spent of{' '}
              <span>{formatCurrency(metrics.annualBudget)}</span>
            </span>
            <span>
              Remaining: <strong className="text-slate-800 font-semibold">{formatCurrency(metrics.budgetRemaining)}</strong>
            </span>
          </div>
        </div>

        {/* Available Balance Card (Col 3 or 6 on mobile) */}
        <div className="tilt-card col-span-6 md:col-span-3 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-card flex flex-col justify-between">
          <span className="depth-layer-sm text-[10px] sm:text-xs font-semibold text-slate-500 tracking-wide uppercase">
            Available Balance
          </span>
          <div className="depth-layer my-1 sm:my-2">
            <span className={`text-2xl sm:text-3xl font-black tracking-tight ${metrics.availableBalance < 0 ? 'text-red-600' : 'text-slate-900'}`}>
              {formatCurrency(metrics.availableBalance)}
            </span>
          </div>
          <div className="depth-layer-sm flex items-center gap-1 sm:gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 sm:px-2 py-0.5 rounded-md border border-emerald-200/50 shadow-xs">
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
              </svg>
              <span>{metrics.hasData ? (metrics.availableBalance >= 0 ? '+6%' : '-3%') : '+0%'}</span>
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 hidden xs:inline">vs last mo</span>
          </div>
        </div>

        {/* Total Savings Card (Col 3 or 6 on mobile) */}
        <div className="tilt-card col-span-6 md:col-span-3 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-card flex flex-col justify-between">
          <span className="depth-layer-sm text-[10px] sm:text-xs font-semibold text-slate-500 tracking-wide uppercase">
            Total Savings
          </span>
          <div className="depth-layer my-1 sm:my-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {formatCurrency(metrics.totalSavings)}
            </span>
          </div>
          <div className="depth-layer-sm flex items-center gap-1 text-[10px] sm:text-xs text-emerald-600 font-bold">
            <span>{metrics.hasData ? '+12%' : '+0%'}</span>
            <span className="text-slate-400 font-normal hidden xs:inline">YTD Growth</span>
          </div>
        </div>
      </div>

      {/* ── MIDDLE GRID: Recent Transactions + Expense Breakdown ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* Recent Transactions Table Card (Col 7) */}
        <div className="tilt-card md:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden flex flex-col">
          <div className="px-4 sm:px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm sm:text-base font-bold text-slate-900">Recent Transactions</h2>
            <div className="flex items-center gap-1.5">
              {['all', 'expense', 'income'].map((t) => {
                const isActive = txTypeFilter === t;
                const label = t === 'all' ? 'All' : t === 'expense' ? 'Expenses' : 'Income';
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTxTypeFilter(t)}
                    className={`tx-tab text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      isActive
                        ? 'active text-white font-bold'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto min-h-[280px] max-h-[420px]">
            {displayTxs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-slate-400">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 shadow-inner">
                  <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs font-medium text-slate-500">No transactions recorded yet.</p>
                <button
                  type="button"
                  onClick={() => navigateTo('#/add-transaction')}
                  className="mt-2 text-xs text-primary font-semibold hover:underline cursor-pointer"
                >
                  + Add your first transaction
                </button>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[11px] font-semibold text-slate-400 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                    <th className="py-3 px-4 sm:px-6 font-medium">Date</th>
                    <th className="py-3 px-3 sm:px-4 font-medium">Description</th>
                    <th className="py-3 px-3 sm:px-4 font-medium">Category</th>
                    <th className="py-3 px-4 sm:px-6 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {displayTxs.map((tx) => {
                    const isIncome = tx.type === 'income';
                    const amountStr = isIncome ? `+${formatCurrency(tx.amount)}` : `-${formatCurrency(tx.amount)}`;
                    const amountClass = isIncome ? 'text-emerald-600 font-bold' : 'text-slate-800 font-bold';
                    const catStyle = CATEGORY_STYLES[tx.category] || { icon: '📦', color: '#94A3B8' };

                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group">
                        <td className="py-3 px-4 sm:px-6 text-slate-500 whitespace-nowrap">{tx.date}</td>
                        <td className="py-3 px-3 sm:px-4 font-semibold text-slate-800 dark:text-slate-200">{tx.description}</td>
                        <td className="py-3 px-3 sm:px-4">
                          <span className="category-pill text-[11px] text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200/50 dark:border-slate-700">
                            <span>{catStyle.icon}</span>
                            <span>{tx.category || 'Other'}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 sm:px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <span className={amountClass}>{amountStr}</span>
                            <button
                              type="button"
                              onClick={() => deleteTransaction(tx.id)}
                              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all text-xs p-1 cursor-pointer"
                              title="Delete"
                            >
                              ✕
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Annual Expense Breakdown Pie Card (Col 5) */}
        <ExpenseDonutChart filterAccountId={currentAccountFilter} />
      </div>

      {/* ── BOTTOM ROW: ACCOUNTS ROW (Add Account + Work + Personal) ── */}
      <div className="space-y-3" id="accounts-container">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Accounts</h2>
          <span className="text-xs text-slate-400 font-medium">Manage and track multiple accounts</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Add New Account Card */}
          <button
            type="button"
            onClick={() => setIsCreateAccountOpen(true)}
            className="tilt-card bg-white border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[185px] transition-all group cursor-pointer shadow-card text-center"
          >
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-primary/10 flex items-center justify-center text-slate-400 group-hover:text-primary transition-all mb-2 shadow-inner">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <span className="text-sm font-bold text-slate-700 group-hover:text-primary transition-colors">
              Add New Account
            </span>
            <span className="text-xs text-slate-400 mt-0.5">Click to connect or create account</span>
          </button>

          {/* Account Cards */}
          {accounts.map((acc) => {
            const stats = accountStats[acc.id] || { balance: acc.initialBalance || 0, income: 0, expense: 0, transactionsCount: 0 };
            const balance = stats.balance;
            const balanceClass = balance >= 0 ? 'text-slate-900' : 'text-red-600';
            const isActive = acc.isActive !== false;
            const isFiltered = currentAccountFilter === acc.id;

            return (
              <div
                key={acc.id}
                onDoubleClick={() => navigateTo(`#/account/${acc.id}`)}
                onClick={() => setCurrentAccountFilter(acc.id)}
                className={`tilt-card account-3d-card p-6 flex flex-col justify-between min-h-[185px] cursor-pointer transition-all ${
                  isFiltered ? 'ring-2 ring-primary ring-offset-2 shadow-lg' : ''
                } ${isActive ? 'opacity-100' : 'opacity-60 bg-slate-50/50'}`}
                title="Click to filter dashboard • Double-click to view Overview & Analytics"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 tracking-tight">{acc.name}</h3>
                      {isFiltered && (
                        <span className="text-[10px] font-bold text-primary bg-primary-light dark:bg-primary/20 px-2 py-0.5 rounded-full border border-primary/20">
                          Active View
                        </span>
                      )}
                      {acc.isDefault && !isFiltered && (
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{acc.type || 'Savings Account'}</p>
                  </div>

                  <div className="flex items-center gap-2.5" onClick={(e) => e.stopPropagation()}>
                    {/* 3D Metallic Chip */}
                    <div className="card-chip" title="EMV Secured"></div>

                    {/* Interactive Animated Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => toggleAccount(acc.id)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isActive ? 'bg-primary shadow-xs' : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                      role="switch"
                      aria-checked={isActive}
                      title={isActive ? 'Click to deactivate' : 'Click to activate'}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                          isActive ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="my-2">
                  <p className={`text-2xl font-black tracking-tight ${balanceClass}`}>
                    {formatCurrency(balance)}
                  </p>
                  <span className="text-[10px] text-slate-400">
                    {stats.transactionsCount || 0} transaction{stats.transactionsCount === 1 ? '' : 's'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100/80 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-semibold text-red-500 text-[11px]">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7 14l5-5 5 5z" />
                      </svg>
                      {stats.expense > 0 ? formatCurrency(stats.expense) : '$0'}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-emerald-600 text-[11px]">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7 10l5 5 5-5z" />
                      </svg>
                      {stats.income > 0 ? formatCurrency(stats.income) : '$0'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateTo(`#/account/${acc.id}`);
                    }}
                    className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Overview →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
};

export default DashboardPage;
