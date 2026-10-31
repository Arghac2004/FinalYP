"use client";

import React, { useState, useEffect } from 'react';
import { useFinTrack } from '@/context/FinTrackContext';
import { ArrowLeft, X } from 'lucide-react';

const EditTransactionModal = ({ isOpen, onClose, transaction }) => {
  const { accounts, updateTransaction, currency } = useFinTrack();

  const [type, setType] = useState('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('Other');
  const [account, setAccount] = useState('personal');

  useEffect(() => {
    if (transaction) {
      setType(transaction.type || 'expense');
      setDescription(transaction.description || '');
      setAmount(transaction.amount !== undefined ? String(transaction.amount) : '');
      setDate(transaction.date || new Date().toISOString().split('T')[0]);
      setCategory(transaction.category || 'Other');
      setAccount(transaction.account || (accounts[0]?.id || 'personal'));
    }
  }, [transaction, accounts]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !transaction) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!description.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    if (updateTransaction) {
      updateTransaction(transaction.id, {
        description: description.trim(),
        amount: parsedAmount,
        type,
        category,
        account,
        date,
      });
    }

    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden transform transition-all">
        {/* Header with Back button */}
        <div className="px-5 sm:px-6 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer mr-1"
            >
              ← Back
            </button>
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Edit Transaction</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form (Scrollable) */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
          {/* Type Switcher */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Type</label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  type === 'expense'
                    ? 'bg-red-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  type === 'income'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Income
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Grocery Store"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800"
            />
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Amount ({currency?.symbol || '$'})
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          {/* Category & Account */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 cursor-pointer"
              >
                <option value="Groceries">Groceries</option>
                <option value="Housing">Housing / Rent</option>
                <option value="Transport">Transport</option>
                <option value="Subscriptions">Subscriptions</option>
                <option value="Shopping">Shopping</option>
                <option value="Dining">Food & Dining</option>
                <option value="Utilities">Utilities</option>
                <option value="Salary">Salary / Income</option>
                <option value="Investments">Investments</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Account</label>
              <select
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 cursor-pointer"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm transition-all active:scale-98 cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTransactionModal;
