"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import { useFinTrack } from '@/context/FinTrackContext';
import Background3D from '@/components/dashboard/Background3D';
import ExpenseDonutChart from '@/components/dashboard/charts/ExpenseDonutChart';
import CreateAccountModal from '@/components/dashboard/modals/CreateAccountModal';
import BudgetModal from '@/components/dashboard/modals/BudgetModal';
import ProfileModal from '@/components/dashboard/modals/ProfileModal';
import EditTransactionModal from '@/components/dashboard/modals/EditTransactionModal';
import InvoiceModal from '@/components/dashboard/modals/InvoiceModal';
import PaymentGatewayModal from '@/components/dashboard/PaymentGatewayModal';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import Toast from '@/components/dashboard/Toast';
import MobileBottomNav from '@/components/dashboard/MobileBottomNav';
import { Button } from '@/components/ui/button';
import CategoryIcon from '@/components/CategoryIcon';
import { PlusCircle, Search, Settings, ArrowRight, Lock, MoreVertical, Pencil, Trash2, Check, Zap, FileText, X } from 'lucide-react';

const DashboardContent = () => {
  const router = useRouter();
  const {
    accounts,
    toggleAccount,
    transactions,
    deleteTransaction,
    deleteMultipleTransactions,
    currentAccountFilter,
    setCurrentAccountFilter,
    getMetrics,
    formatCurrency,
    setIsBudgetModalOpen,
    setIsCreateAccountOpen,
    setIsProfileModalOpen,
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    profile,
  } = useFinTrack();

  const [txTypeFilter, setTxTypeFilter] = useState('all');
  const [dateTime, setDateTime] = useState({ date: '-- --- ----', time: '--:--:--' });
  const [selectedTxIds, setSelectedTxIds] = useState([]);
  const [editingTx, setEditingTx] = useState(null);
  const [selectedBillTx, setSelectedBillTx] = useState(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const dateOptions = { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' };
      const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
      setDateTime({
        date: now.toLocaleDateString('en-US', dateOptions),
        time: now.toLocaleTimeString('en-US', timeOptions),
      });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const metrics = getMetrics(currentAccountFilter);
  const allAccountsMetrics = getMetrics('all');
  const accountStats = allAccountsMetrics.accounts || {};

  const activeAccountObj = accounts.find((a) => a.id === currentAccountFilter);
  const activeLabel = currentAccountFilter === 'all' ? 'All Accounts' : activeAccountObj?.name || 'Account';

  let displayTxs = transactions;
  if (currentAccountFilter !== 'all') {
    displayTxs = displayTxs.filter((t) => (t.account || 'personal') === currentAccountFilter);
  }
  if (txTypeFilter !== 'all') {
    displayTxs = displayTxs.filter((t) => t.type === txTypeFilter);
  }

  const isAllSelected = displayTxs.length > 0 && displayTxs.every((t) => selectedTxIds.includes(t.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedTxIds([]);
    } else {
      setSelectedTxIds(displayTxs.map((t) => t.id));
    }
  };

  const toggleSelectTx = (id) => {
    setSelectedTxIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedTxIds.length === 0) return;
    deleteMultipleTransactions(selectedTxIds);
    setSelectedTxIds([]);
  };

  return (
    <div className="min-h-screen relative text-slate-900 dark:text-slate-100 pt-24 pb-20">
      {/* 3D Particle Background */}
      <Background3D />

      <main className="w-full flex-1 px-4 sm:px-6 lg:px-12 py-4 space-y-6 sm:space-y-8 max-w-[1600px] mx-auto relative z-10 animate-fadeIn">
        {/* Sub-header Bar: Live status, Greeting & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                FINANCIAL DASHBOARD
              </h1>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{dateTime.date}</span>
              <span>•</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{dateTime.time}</span>
              <span>•</span>
              <span>Viewing: <strong className="text-blue-600">{activeLabel}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Pay via Gateway Auto-Track Button (Dedicated Full-Screen Page) */}
            <Link href="/payment">
              <button
                type="button"
                className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer shadow-md shadow-blue-500/20"
                title="Make an online payment & auto-record in ledger"
              >
                <Zap size={16} className="text-amber-300 fill-amber-300" />
                <span>Pay via Gateway</span>
              </button>
            </Link>

            <Link href="/transaction/create">
              <button
                type="button"
                className="btn-3d flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer shadow-md"
              >
                <PlusCircle size={16} />
                <span>Add Transaction</span>
              </button>
            </Link>

            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-xs"
              title="Dashboard Settings & Profile"
            >
              <Settings size={15} />
              <span className="hidden md:inline">Settings</span>
            </button>
          </div>
        </div>

        {/* Account Mode Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700 overflow-x-auto max-w-full scrollbar-none flex-nowrap">
          <button
            type="button"
            onClick={() => setCurrentAccountFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer whitespace-nowrap ${
              currentAccountFilter === 'all'
                ? 'bg-blue-600 text-white shadow-sm font-bold'
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
                className={`px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold'
                }`}
              >
                {acc.name}
              </button>
            );
          })}
        </div>

        {/* ── TOP STATS & BUDGET ROW ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
          {/* Annual Budget Progress Card */}
          <div className="tilt-card md:col-span-6 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="depth-layer flex items-center justify-between mb-4">
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                Annual Budget Progress
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-blue-600">{metrics.budgetPct}%</span>
                <button
                  type="button"
                  onClick={() => setIsBudgetModalOpen(true)}
                  className="text-slate-400 hover:text-blue-600 transition-colors text-xs p-1 cursor-pointer"
                  title="Edit Annual Target"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="depth-layer-sm w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden mb-4 shadow-inner">
              <div
                className="bg-gradient-to-r from-blue-600 to-cyan-500 h-3 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${metrics.budgetPct}%` }}
              ></div>
            </div>

            {/* Subtext */}
            <div className="depth-layer flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>
                <strong className="text-slate-800 dark:text-slate-200">{formatCurrency(metrics.totalExpense)}</strong> spent of{' '}
                <span>{formatCurrency(metrics.annualBudget)}</span>
              </span>
              <span>
                Remaining: <strong className="text-slate-800 dark:text-slate-200">{formatCurrency(metrics.budgetRemaining)}</strong>
              </span>
            </div>
          </div>

          {/* Available Balance Card */}
          <div className="tilt-card col-span-6 md:col-span-3 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <span className="depth-layer-sm text-[10px] sm:text-xs font-semibold text-slate-500 tracking-wide uppercase">
              Available Balance
            </span>
            <div className="depth-layer my-2">
              <span className={`text-2xl sm:text-3xl font-black tracking-tight ${metrics.availableBalance < 0 ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>
                {formatCurrency(metrics.availableBalance)}
              </span>
            </div>
            <div className="depth-layer-sm flex items-center gap-1 sm:gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200/50">
                <span>{metrics.hasData ? (metrics.availableBalance >= 0 ? '+6%' : '-3%') : '+0%'}</span>
              </span>
              <span className="text-[10px] sm:text-xs text-slate-400">vs last month</span>
            </div>
          </div>

          {/* Total Savings Card */}
          <div className="tilt-card col-span-6 md:col-span-3 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <span className="depth-layer-sm text-[10px] sm:text-xs font-semibold text-slate-500 tracking-wide uppercase">
              Total Savings
            </span>
            <div className="depth-layer my-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {formatCurrency(metrics.totalSavings)}
              </span>
            </div>
            <div className="depth-layer-sm flex items-center gap-1 text-[10px] sm:text-xs text-emerald-600 font-bold">
              <span>{metrics.hasData ? '+12%' : '+0%'}</span>
              <span className="text-slate-400 font-normal">YTD Growth</span>
            </div>
          </div>
        </div>

        {/* ── MIDDLE GRID: Recent Transactions + Expense Breakdown ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-start">
          {/* Recent Transactions Table Card */}
          <div className="tilt-card md:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Recent Transactions</h2>
                {selectedTxIds.length > 0 && (
                  <div className="flex items-center gap-2 ml-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800 rounded-lg text-xs text-blue-700 dark:text-blue-300 animate-fadeIn">
                    <span className="font-semibold">{selectedTxIds.length} selected</span>
                    <button
                      type="button"
                      onClick={handleBulkDelete}
                      className="flex items-center gap-1 font-bold text-red-600 hover:text-red-700 dark:text-red-400 hover:underline cursor-pointer ml-1"
                    >
                      <Trash2 size={12} />
                      <span>Delete</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedTxIds([])}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 ml-0.5 text-xs cursor-pointer inline-flex items-center"
                      title="Clear Selection"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
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
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-xs font-medium text-slate-500">No transactions recorded yet.</p>
                  <Link
                    href="/transaction/create"
                    className="mt-2 text-xs text-blue-600 font-semibold hover:underline"
                  >
                    + Add your first transaction
                  </Link>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[11px] font-semibold text-slate-400 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                      {/* Select All Circular Button */}
                      <th className="py-3 px-3 sm:px-4 w-10 text-center">
                        <button
                          type="button"
                          onClick={toggleSelectAll}
                          aria-label={isAllSelected ? "Deselect all transactions" : "Select all transactions"}
                          title={isAllSelected ? "Deselect All" : "Select All"}
                          className="inline-flex items-center justify-center cursor-pointer group"
                        >
                          <span
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                              isAllSelected
                                ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                                : selectedTxIds.length > 0
                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 text-blue-600'
                                : 'border-slate-300 dark:border-slate-600 group-hover:border-blue-500'
                            }`}
                          >
                            {isAllSelected && <Check size={10} strokeWidth={3.5} />}
                            {!isAllSelected && selectedTxIds.length > 0 && (
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                            )}
                          </span>
                        </button>
                      </th>
                      <th className="py-3 px-3 sm:px-4 font-medium">Date</th>
                      <th className="py-3 px-3 sm:px-4 font-medium">Description</th>
                      <th className="py-3 px-3 sm:px-4 font-medium">Category</th>
                      <th className="py-3 px-4 sm:px-6 font-medium text-right">Amount</th>
                      <th className="py-3 px-3 sm:px-4 font-medium text-right w-12">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {displayTxs.map((tx) => {
                      const isIncome = tx.type === 'income';
                      const amountStr = isIncome ? `+${formatCurrency(tx.amount)}` : `-${formatCurrency(tx.amount)}`;
                      const amountClass = isIncome ? 'text-emerald-600 font-bold' : 'text-slate-800 dark:text-slate-200 font-bold';
                      const isSelected = selectedTxIds.includes(tx.id);

                      return (
                        <tr
                          key={tx.id}
                          onDoubleClick={() => setSelectedBillTx(tx)}
                          title="Double-click to view verified online bill / receipt"
                          className={`transition-colors group cursor-pointer select-none ${
                            isSelected
                              ? 'bg-blue-50/70 dark:bg-blue-950/30'
                              : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          {/* Circular Select Button */}
                          <td className="py-3 px-3 sm:px-4 text-center">
                            <button
                              type="button"
                              onClick={() => toggleSelectTx(tx.id)}
                              aria-label={isSelected ? "Deselect transaction" : "Select transaction"}
                              title={isSelected ? "Deselect" : "Select"}
                              className="inline-flex items-center justify-center cursor-pointer group"
                            >
                              <span
                                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                                  isSelected
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                                    : 'border-slate-300 dark:border-slate-600 group-hover:border-blue-500'
                                }`}
                              >
                                {isSelected && <Check size={10} strokeWidth={3.5} />}
                              </span>
                            </button>
                          </td>
                          <td className="py-3 px-3 sm:px-4 text-slate-500 whitespace-nowrap">{tx.date}</td>
                          <td className="py-3 px-3 sm:px-4 font-semibold text-slate-800 dark:text-slate-200">{tx.description}</td>
                          <td className="py-3 px-3 sm:px-4">
                            <span className="category-pill text-[11px] text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200/50 dark:border-slate-700 inline-flex items-center gap-1.5">
                              <CategoryIcon category={tx.category} size={13} className="text-blue-500" />
                              <span>{tx.category || 'Other'}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 sm:px-6 text-right whitespace-nowrap">
                            <span className={amountClass}>{amountStr}</span>
                          </td>
                          <td className="py-3 px-3 sm:px-4 text-right whitespace-nowrap">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  type="button"
                                  className="w-7 h-7 rounded-lg inline-flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                  title="Actions"
                                >
                                  <MoreVertical size={15} />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl p-1 z-50">
                                <DropdownMenuItem
                                  onClick={() => setSelectedBillTx(tx)}
                                  className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                                >
                                  <FileText size={13} className="text-emerald-500" />
                                  <span>Online Bill</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setEditingTx(tx)}
                                  className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                                >
                                  <Pencil size={13} className="text-blue-500" />
                                  <span>Edit</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => deleteTransaction(tx.id)}
                                  className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg cursor-pointer"
                                >
                                  <Trash2 size={13} />
                                  <span>Delete</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Table Footer Helper */}
            <div className="px-5 py-2.5 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <FileText size={13} className="text-blue-500" />
                <span><strong>Tip:</strong> Double-click any row to view & print its official online bill.</span>
              </span>
              <span>{displayTxs.length} records</span>
            </div>
          </div>

          {/* Annual Expense Breakdown Pie Card */}
          <ExpenseDonutChart filterAccountId={currentAccountFilter} />
        </div>

        {/* ── BOTTOM ROW: ACCOUNTS GRID ── */}
        <div className="space-y-4" id="accounts-container">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Accounts</h2>
              <p className="text-xs text-slate-400">Manage and track your commercial & personal ledgers</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Add New Account Card */}
            <button
              type="button"
              onClick={() => setIsCreateAccountOpen(true)}
              className="tilt-card bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[190px] transition-all group cursor-pointer shadow-sm text-center"
            >
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-all mb-2">
                <PlusCircle size={24} />
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 transition-colors">
                Add New Account
              </span>
              <span className="text-xs text-slate-400 mt-0.5">Click to connect or create account</span>
            </button>

            {/* Account Cards */}
            {accounts.map((acc) => {
              const stats = accountStats[acc.id] || { balance: acc.initialBalance || 0, income: 0, expense: 0, transactionsCount: 0 };
              const balance = stats.balance;
              const balanceClass = balance >= 0 ? 'text-slate-900 dark:text-white' : 'text-red-600';
              const isActive = acc.isActive !== false;
              const isFiltered = currentAccountFilter === acc.id;

              return (
                <div
                  key={acc.id}
                  onClick={() => setCurrentAccountFilter(acc.id)}
                  className={`tilt-card account-3d-card p-6 flex flex-col justify-between min-h-[190px] cursor-pointer transition-all ${
                    isFiltered ? 'ring-2 ring-blue-600 ring-offset-2 shadow-lg' : ''
                  } ${isActive ? 'opacity-100' : 'opacity-60 bg-slate-50/50'}`}
                  title="Click to filter dashboard • Click 'Overview →' for detailed analytics"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{acc.name}</h3>
                        {isFiltered && (
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded-full border border-blue-200">
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
                      <div className="card-chip" title="EMV Secured"></div>

                      {/* Interactive Toggle Switch */}
                      <button
                        type="button"
                        onClick={() => toggleAccount(acc.id)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          isActive ? 'bg-blue-600 shadow-xs' : 'bg-slate-200 dark:bg-slate-700'
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
                        ▼ {formatCurrency(stats.expense || 0)}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-emerald-600 text-[11px]">
                        ▲ {formatCurrency(stats.income || 0)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/account/${acc.id}`);
                      }}
                      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Overview <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Global Modals & Toast */}
      <CreateAccountModal />
      <ProfileModal />
      <BudgetModal />
      <EditTransactionModal
        isOpen={!!editingTx}
        onClose={() => setEditingTx(null)}
        transaction={editingTx}
      />
      <PaymentGatewayModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentSuccess={(newTx) => {
          setSelectedBillTx(newTx);
        }}
      />
      <InvoiceModal
        isOpen={!!selectedBillTx}
        onClose={() => setSelectedBillTx(null)}
        transaction={selectedBillTx}
      />
      <Toast />
      <MobileBottomNav />
    </div>
  );
};

export default function DashboardPage() {
  return (
    <>
      <SignedIn>
        <DashboardContent />
      </SignedIn>
      <SignedOut>
        <div className="min-h-screen flex flex-col items-center justify-center pt-28 px-4 text-center">
          <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mx-auto">
              <Lock size={28} />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Authentication Required</h2>
            <p className="text-xs text-slate-500">
              Please sign in to your Rupee Radar account to access your personal dashboard and financial accounts.
            </p>
            <div className="pt-2">
              <SignInButton forceRedirectUrl="/dashboard">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl">
                  Sign In to Continue
                </Button>
              </SignInButton>
            </div>
          </div>
        </div>
      </SignedOut>
    </>
  );
}
