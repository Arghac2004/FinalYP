"use client";

import React, { useState, useEffect } from 'react';
import { useFinTrack, CURRENCIES } from '@/context/FinTrackContext';
import { X, CreditCard } from 'lucide-react';

const CreateAccountModal = () => {
  const { isCreateAccountOpen, setIsCreateAccountOpen, addAccount, currencyCode } = useFinTrack();
  const [name, setName] = useState('');
  const [type, setType] = useState('Current Account');
  const [currency, setCurrency] = useState(currencyCode);
  const [initialBalance, setInitialBalance] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    if (isCreateAccountOpen) {
      setCurrency(currencyCode);
    }
  }, [isCreateAccountOpen, currencyCode]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsCreateAccountOpen(false);
    };
    if (isCreateAccountOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCreateAccountOpen, setIsCreateAccountOpen]);

  if (!isCreateAccountOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    addAccount({
      name: name.trim(),
      type,
      currency,
      initialBalance: parseFloat(initialBalance) || 0,
      isDefault,
    });

    setName('');
    setType('Current Account');
    setInitialBalance('');
    setIsDefault(false);
    setIsCreateAccountOpen(false);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsCreateAccountOpen(false);
      }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300"
    >
      <div className="tilt-card bg-white dark:bg-slate-900 rounded-t-[2rem] sm:rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden transform transition-all animate-sheet3d">
        {/* Top Drag Handle for Mobile */}
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mt-3 sm:hidden"></div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCreateAccountOpen(false)}
              className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer mr-1"
            >
              ← Back
            </button>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">Create New Account</h3>
              <p className="text-[11px] text-slate-400">Add a new financial account to your ledger</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsCreateAccountOpen(false)}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Account Name */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Account Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Freelance Income, Chase Bank"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800"
            />
          </div>

          {/* Account Type */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Account Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 cursor-pointer"
            >
              <option value="Current Account">Current</option>
              <option value="Savings Account">Savings</option>
              <option value="Investment Account">Investment</option>
              <option value="Credit Card">Credit Card</option>
            </select>
          </div>

          {/* Currency Selection */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 cursor-pointer"
            >
              {Object.keys(CURRENCIES).map((c) => (
                <option key={c} value={c}>
                  {c} ({CURRENCIES[c].symbol} - {CURRENCIES[c].name})
                </option>
              ))}
            </select>
          </div>

          {/* Initial Balance */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Initial Balance</label>
            <input
              type="number"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800"
            />
          </div>

          {/* Set as Default Toggle */}
          <div className="pt-1 flex items-start gap-3">
            <input
              type="checkbox"
              id="acc-default-react"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 accent-blue-600 rounded mt-0.5 cursor-pointer"
            />
            <div>
              <label htmlFor="acc-default-react" className="font-semibold text-slate-700 dark:text-slate-300 cursor-pointer block">
                Set as Default
              </label>
              <p className="text-[11px] text-slate-400">This account will be selected by default for transactions</p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <CreditCard size={18} />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCreateAccountOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-3d px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Create Account
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAccountModal;
