"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import { useFinTrack } from '@/context/FinTrackContext';
import Background3D from '@/components/dashboard/Background3D';
import AccountBarChart from '@/components/dashboard/charts/AccountBarChart';
import EditTransactionModal from '@/components/dashboard/modals/EditTransactionModal';
import InvoiceModal from '@/components/dashboard/modals/InvoiceModal';
import CategoryIcon from '@/components/CategoryIcon';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import Toast from '@/components/dashboard/Toast';
import MobileBottomNav from '@/components/dashboard/MobileBottomNav';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PlusCircle, Search, Trash2, Lock, TrendingUp, TrendingDown, Scale, MoreVertical, Pencil, FileText } from 'lucide-react';

const AccountDetailsContent = () => {
  const params = useParams();
  const router = useRouter();
  const accountId = params?.id;

  const { accounts, transactions, deleteTransaction, formatCurrency } = useFinTrack();

  const [range, setRange] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [editingTx, setEditingTx] = useState(null);
  const [selectedBillTx, setSelectedBillTx] = useState(null);

  const acc = accounts.find((a) => a.id === accountId) || accounts[0];

  if (!acc) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-28 px-4 text-center">
        <p className="text-slate-500 text-sm">Account not found.</p>
        <Link href="/dashboard" className="mt-4">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  // All transactions for this account
  const accountTxs = transactions.filter((t) => (t.account || 'personal') === acc.id);

  // Range filter
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
    <div className="min-h-screen relative text-slate-900 dark:text-slate-100 pt-28 pb-24">
      <Background3D />

      <main className="w-full flex-1 px-4 sm:px-6 lg:px-12 py-4 max-w-[1400px] mx-auto relative z-10 space-y-6 sm:space-y-8 animate-fadeIn">
        {/* Top Nav Actions */}
        <div className="flex items-center justify-between">
          <Link href="/dashboard">
            <button
              type="button"
              className="btn-3d flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer shadow-xs"
            >
              <ArrowLeft size={16} />
              <span>Back to Dashboard</span>
            </button>
          </Link>

          <Link href="/transaction/create">
            <button
              type="button"
              className="btn-3d flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <PlusCircle size={16} />
              <span>Add Transaction</span>
            </button>
          </Link>
        </div>

        {/* Account Title & Balance Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 tracking-tight">
                {acc.name}
              </h1>
              {acc.isDefault && (
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md">
                  Default
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-semibold mt-1">{acc.type || 'Savings Account'} • {acc.currency || 'USD'}</p>
          </div>

          <div className="sm:text-right bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm p-4 sm:p-0 rounded-2xl sm:rounded-none border sm:border-0 border-slate-200/60 dark:border-slate-800">
            <div className={`text-3xl sm:text-4xl font-black tracking-tight ${currentBalance >= 0 ? 'text-slate-900 dark:text-white' : 'text-red-500'}`}>
              {formatCurrency(currentBalance)}
            </div>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">
              {accountTxs.length} Transaction{accountTxs.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        {/* ── TRANSACTION OVERVIEW CARD (Bar Chart & 3 Metrics) ── */}
        <div className="tilt-card bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          {/* Top Overview Bar with Segmented Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">Transaction Overview</h2>
              <p className="text-[11px] text-slate-400">Income vs expense visual breakdown</p>
            </div>

            {/* Modern Segmented Pills for Range */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto border border-slate-200/60 dark:border-slate-700/60">
              {[
                { id: 'all', label: 'All Time' },
                { id: 'this-month', label: 'This Month' },
                { id: 'last-month', label: 'Last Month' },
              ].map((t) => {
                const isSelected = range === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setRange(t.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3 Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Total Income</span>
                <TrendingUp size={16} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight mt-1">
                {formatCurrency(rangeIncome)}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-red-50/60 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">Total Expenses</span>
                <TrendingDown size={16} className="text-red-500 dark:text-red-400" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-red-500 dark:text-red-400 tracking-tight mt-1">
                {formatCurrency(rangeExpense)}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Net Total</span>
                <Scale size={16} className="text-blue-600 dark:text-blue-400" />
              </div>
              <p className={`text-xl sm:text-2xl font-black tracking-tight mt-1 ${rangeNet >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-500'}`}>
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
        <div className="tilt-card bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Account Transactions</h2>
              <p className="text-[11px] text-slate-400">View and search detailed history</p>
            </div>

            {/* Search & Segmented Filter */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative flex-1 sm:w-60">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search transactions..."
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none focus:border-blue-600 transition-colors"
                />
                <Search size={14} className="text-slate-400 absolute left-3 top-2.5" />
              </div>

              {/* Type Filter Pills */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'income', label: 'Income' },
                  { id: 'expense', label: 'Expense' },
                ].map((tf) => {
                  const isSelected = typeFilter === tf.id;
                  return (
                    <button
                      key={tf.id}
                      type="button"
                      onClick={() => setTypeFilter(tf.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {tf.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto min-h-[260px]">
            {tableTxs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs font-medium text-slate-500">No transactions found in this account.</p>
                <Link
                  href="/transaction/create"
                  className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
                >
                  + Add transaction to this account
                </Link>
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

                    return (
                      <tr
                        key={tx.id}
                        onDoubleClick={() => setSelectedBillTx(tx)}
                        title="Double-click to generate & view online bill / receipt"
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer select-none"
                      >
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap font-medium text-xs">
                          {tx.date}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200 text-xs">
                          {tx.description}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="category-pill text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200/80 dark:border-slate-700 inline-flex items-center gap-1.5">
                            <CategoryIcon category={tx.category} size={13} className="text-blue-500" />
                            <span>{tx.category || 'Other'}</span>
                          </span>
                        </td>
                        <td className={`py-3.5 px-4 text-right whitespace-nowrap font-bold text-xs ${amountClass}`}>
                          {amountStr}
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-200/60 dark:border-slate-700">
                            <span className={`w-1.5 h-1.5 rounded-full ${isIncome ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                            {isIncome ? 'Income' : 'Expense'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
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
        </div>
      </main>

      <EditTransactionModal
        isOpen={!!editingTx}
        onClose={() => setEditingTx(null)}
        transaction={editingTx}
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

export default function AccountPage() {
  return (
    <>
      <SignedIn>
        <AccountDetailsContent />
      </SignedIn>
      <SignedOut>
        <div className="min-h-screen flex flex-col items-center justify-center pt-28 px-4 text-center">
          <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mx-auto">
              <Lock size={28} />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Authentication Required</h2>
            <p className="text-xs text-slate-500">
              Please sign in to view specific account details and analytics.
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
