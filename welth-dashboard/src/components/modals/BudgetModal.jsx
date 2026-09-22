import React, { useState, useEffect } from 'react';
import { useFinTrack } from '../../context/FinTrackContext';

const BudgetModal = () => {
  const { isBudgetModalOpen, setIsBudgetModalOpen, annualBudget, setAnnualBudget } = useFinTrack();
  const [budgetVal, setBudgetVal] = useState(annualBudget || '');

  useEffect(() => {
    if (isBudgetModalOpen) {
      setBudgetVal(annualBudget || '');
    }
  }, [isBudgetModalOpen, annualBudget]);

  if (!isBudgetModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = parseFloat(budgetVal);
    if (!isNaN(val) && val >= 0) {
      setAnnualBudget(val);
      setIsBudgetModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transform transition-all">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Set Annual Budget</h3>
          <button
            type="button"
            onClick={() => setIsBudgetModalOpen(false)}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Annual Budget Target ($)
            </label>
            <input
              type="number"
              value={budgetVal}
              onChange={(e) => setBudgetVal(e.target.value)}
              placeholder="e.g. 25000"
              min="0"
              step="100"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-xs text-slate-800 dark:text-slate-200"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-sm transition-all active:scale-98 cursor-pointer"
          >
            Update Budget
          </button>
        </form>
      </div>
    </div>
  );
};

export default BudgetModal;
