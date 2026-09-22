import React, { useState, useEffect } from 'react';
import { useFinTrack, CURRENCIES } from '../../context/FinTrackContext';

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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300">
      <div className="tilt-card bg-white rounded-t-[2rem] sm:rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200/80 overflow-hidden transform transition-all animate-sheet3d">
        {/* Top Drag Handle for Mobile 3D Sheet */}
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mt-3 sm:hidden"></div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm tracking-tight">Create New Account</h3>
            <p className="text-[11px] text-slate-400">Add a new financial account to your ledger</p>
          </div>
          <button
            type="button"
            onClick={() => setIsCreateAccountOpen(false)}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
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
              placeholder="e.g. Freelance Income, HDFC Bank"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-xs text-slate-800 dark:text-slate-200"
            />
          </div>

          {/* Account Type */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Account Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 cursor-pointer"
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 cursor-pointer"
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-xs text-slate-800 dark:text-slate-200"
            />
          </div>

          {/* Set as Default Toggle */}
          <div className="pt-1 flex items-start gap-3">
            <input
              type="checkbox"
              id="acc-default-react"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 accent-primary rounded mt-0.5 cursor-pointer"
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
            {/* Sparkle Icon */}
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
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
                className="btn-3d px-5 py-2.5 bg-slate-900 dark:bg-primary hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
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
