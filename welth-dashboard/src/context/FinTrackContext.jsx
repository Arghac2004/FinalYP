import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

export const CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar (USD)', code: 'USD' },
  INR: { symbol: '₹', name: 'Indian Rupee (INR)', code: 'INR' },
  EUR: { symbol: '€', name: 'Euro (EUR)', code: 'EUR' },
  GBP: { symbol: '£', name: 'British Pound (GBP)', code: 'GBP' },
  JPY: { symbol: '¥', name: 'Japanese Yen (JPY)', code: 'JPY' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar (CAD)', code: 'CAD' },
  AUD: { symbol: 'A$', name: 'Australian Dollar (AUD)', code: 'AUD' },
};

export const CATEGORY_STYLES = {
  'Housing':        { icon: '🏠', color: '#6366F1' },
  'Transportation': { icon: '🚗', color: '#3B82F6' },
  'Transport':      { icon: '🚗', color: '#3B82F6' },
  'Groceries':      { icon: '🛒', color: '#10B981' },
  'Utilities':      { icon: '⚡', color: '#F59E0B' },
  'Entertainment':  { icon: '🎬', color: '#EC4899' },
  'Food & Dining':  { icon: '🍔', color: '#F97316' },
  'Dining':         { icon: '🍽️', color: '#F97316' },
  'Healthcare':     { icon: '🏥', color: '#EF4444' },
  'Salary':         { icon: '💼', color: '#10B981' },
  'Freelance':      { icon: '💻', color: '#8B5CF6' },
  'Investments':    { icon: '📈', color: '#06B6D4' },
  'Subscriptions':  { icon: '📱', color: '#8B5CF6' },
  'Shopping':       { icon: '🛍️', color: '#EC4899' },
  'Other':          { icon: '📦', color: '#64748B' },
};

const STORAGE_KEYS = {
  TRANSACTIONS: 'fintrack_transactions',
  ACCOUNTS:     'fintrack_accounts',
  BUDGET:       'fintrack_annual_budget',
  PROFILE:      'fintrack_profile',
  THEME:        'fintrack_theme',
  CURRENCY:     'fintrack_currency',
};

const DEFAULT_ACCOUNTS = [
  { id: 'work', name: 'Work', type: 'Current Account', currency: 'USD', initialBalance: 0, isActive: true, isDefault: false },
  { id: 'personal', name: 'Personal', type: 'Savings Account', currency: 'USD', initialBalance: 0, isActive: true, isDefault: true },
];

const FinTrackContext = createContext(null);

export const FinTrackProvider = ({ children }) => {
  // 1. Currency State
  const [currencyCode, setCurrencyCode] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.CURRENCY) || 'USD';
  });

  const currency = useMemo(() => {
    return CURRENCIES[currencyCode] || CURRENCIES.USD;
  }, [currencyCode]);

  // 2. Theme State (light, dark, system)
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
  });

  // 3. Accounts State
  const [accounts, setAccounts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_ACCOUNTS;
  });

  // 4. Transactions State
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // 5. Budget State
  const [annualBudget, setAnnualBudgetState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BUDGET);
      return saved ? parseFloat(saved) || 0 : 0;
    } catch {
      return 0;
    }
  });

  // 6. Profile State
  const [profile, setProfileState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (saved) return JSON.parse(saved);
    } catch {}
    return { firstName: 'Argha', lastName: 'Chowdhury', email: 'argha@fintrack.app' };
  });

  // 7. Active Dashboard Filter Account ID ('all', 'personal', 'work', etc.)
  const [currentAccountFilter, setCurrentAccountFilter] = useState('all');

  // 8. Modals visibility state
  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  // 9. Toast Notification State
  const [toast, setToast] = useState({ visible: false, message: '', icon: '✅' });

  const showToast = useCallback((message, icon = '✅') => {
    setToast({ visible: true, message, icon });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 2800);
  }, []);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENCY, currencyCode);
  }, [currencyCode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BUDGET, annualBudget.toString());
  }, [annualBudget]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }, [profile]);

  // Apply Dark/Light/System Theme
  useEffect(() => {
    const applyThemeClass = () => {
      let isDark = false;
      if (theme === 'dark') {
        isDark = true;
      } else if (theme === 'light') {
        isDark = false;
      } else if (theme === 'system') {
        isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyThemeClass();

    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => {
        if (theme === 'system') applyThemeClass();
      };
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme]);

  // Actions
  const setCurrency = useCallback((code) => {
    if (CURRENCIES[code]) {
      setCurrencyCode(code);
      showToast(`Currency changed to ${CURRENCIES[code].name}`, '💱');
    }
  }, [showToast]);

  const setTheme = useCallback((mode) => {
    setThemeState(mode);
    const labels = { light: 'Light Mode', dark: 'Dark Mode', system: 'System Mode' };
    showToast(`${labels[mode] || mode} activated`, mode === 'dark' ? '🌙' : mode === 'light' ? '☀️' : '💻');
  }, [showToast]);

  const addAccount = useCallback((newAccData) => {
    const id = 'acc_' + Date.now();
    const newAcc = {
      id,
      name: newAccData.name,
      type: newAccData.type || 'Current Account',
      currency: newAccData.currency || currencyCode,
      initialBalance: parseFloat(newAccData.initialBalance) || 0,
      isActive: true,
      isDefault: newAccData.isDefault || false,
      createdAt: new Date().toISOString(),
    };

    setAccounts(prev => {
      let updated = prev.map(a => newAcc.isDefault ? { ...a, isDefault: false } : a);
      return [...updated, newAcc];
    });

    if (newAcc.currency) {
      setCurrencyCode(newAcc.currency);
    }

    showToast(`Account "${newAcc.name}" created!`, '🎉');
    return newAcc;
  }, [currencyCode, showToast]);

  const toggleAccount = useCallback((id) => {
    setAccounts(prev => prev.map(a => {
      if (a.id === id) {
        const nextActive = a.isActive === false ? true : false;
        showToast(`${a.name} is now ${nextActive ? 'Enabled' : 'Disabled'}`, nextActive ? '🟢' : '⚪');
        return { ...a, isActive: nextActive };
      }
      return a;
    }));
  }, [showToast]);

  const addTransaction = useCallback((txData) => {
    const newTx = {
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      description: txData.description,
      amount: parseFloat(txData.amount) || 0,
      type: txData.type, // 'income' | 'expense'
      category: txData.category || 'Other',
      account: txData.account || 'personal',
      date: txData.date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    setTransactions(prev => [newTx, ...prev]);
    showToast('Transaction saved successfully!', '✨');
    return newTx;
  }, [showToast]);

  const deleteTransaction = useCallback((id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    showToast('Transaction removed', '🗑️');
  }, [showToast]);

  const setAnnualBudget = useCallback((amount) => {
    setAnnualBudgetState(amount);
    showToast('Annual budget target updated!', '🎯');
  }, [showToast]);

  const setProfile = useCallback((newProfile) => {
    setProfileState(newProfile);
    showToast('Profile settings saved!', '👤');
  }, [showToast]);

  // Currency Formatter
  const formatCurrency = useCallback((val) => {
    const num = Math.abs(Number(val)) || 0;
    const formatted = num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    const sym = currency.symbol;
    return val < 0 ? `-${sym}${formatted}` : `${sym}${formatted}`;
  }, [currency]);

  // Compute Metrics dynamically based on filterAccountId ('all' or specific account id)
  const getMetrics = useCallback((filterAccountId = 'all') => {
    let filteredTxs = transactions;
    if (filterAccountId && filterAccountId !== 'all') {
      filteredTxs = filteredTxs.filter(t => (t.account || 'personal') === filterAccountId);
    }

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryBreakdown = {};

    filteredTxs.forEach(t => {
      const amt = Math.abs(Number(t.amount)) || 0;
      if (t.type === 'income') {
        totalIncome += amt;
      } else {
        totalExpense += amt;
        const cat = t.category || 'Other';
        categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + amt;
      }
    });

    // Account level balances
    const accountStats = {};
    accounts.forEach(acc => {
      accountStats[acc.id] = {
        balance: acc.initialBalance || 0,
        income: 0,
        expense: 0,
        transactionsCount: 0,
      };
    });

    transactions.forEach(t => {
      const accId = t.account || 'personal';
      if (!accountStats[accId]) {
        accountStats[accId] = { balance: 0, income: 0, expense: 0, transactionsCount: 0 };
      }
      const amt = Math.abs(Number(t.amount)) || 0;
      accountStats[accId].transactionsCount += 1;
      if (t.type === 'income') {
        accountStats[accId].income += amt;
        accountStats[accId].balance += amt;
      } else {
        accountStats[accId].expense += amt;
        accountStats[accId].balance -= amt;
      }
    });

    let availableBalance = 0;
    if (filterAccountId === 'all') {
      const activeAccounts = accounts.filter(a => a.isActive !== false);
      availableBalance = activeAccounts.reduce((sum, acc) => {
        return sum + (accountStats[acc.id]?.balance ?? (acc.initialBalance || 0));
      }, 0);
    } else {
      availableBalance = accountStats[filterAccountId]?.balance ?? 0;
    }

    const totalSavings = Math.max(0, availableBalance);
    const budgetPct = annualBudget > 0 ? Math.min(100, Math.round((totalExpense / annualBudget) * 100)) : 0;
    const budgetRemaining = Math.max(0, annualBudget - totalExpense);

    return {
      totalIncome,
      totalExpense,
      availableBalance,
      totalSavings,
      annualBudget,
      budgetPct,
      budgetRemaining,
      categoryBreakdown,
      accounts: accountStats,
      hasData: transactions.length > 0,
      filterAccountId,
    };
  }, [transactions, accounts, annualBudget]);

  const value = {
    currency,
    currencyCode,
    setCurrency,
    theme,
    setTheme,
    accounts,
    addAccount,
    toggleAccount,
    transactions,
    addTransaction,
    deleteTransaction,
    annualBudget,
    setAnnualBudget,
    profile,
    setProfile,
    currentAccountFilter,
    setCurrentAccountFilter,
    formatCurrency,
    getMetrics,
    isCreateAccountOpen,
    setIsCreateAccountOpen,
    isProfileModalOpen,
    setIsProfileModalOpen,
    isBudgetModalOpen,
    setIsBudgetModalOpen,
    toast,
    showToast,
  };

  return (
    <FinTrackContext.Provider value={value}>
      {children}
    </FinTrackContext.Provider>
  );
};

export const useFinTrack = () => {
  const context = useContext(FinTrackContext);
  if (!context) {
    throw new Error('useFinTrack must be used within a FinTrackProvider');
  }
  return context;
};
