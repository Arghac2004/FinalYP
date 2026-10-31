"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';

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
  'Housing':        { color: '#6366F1' },
  'Transportation': { color: '#3B82F6' },
  'Transport':      { color: '#3B82F6' },
  'Groceries':      { color: '#10B981' },
  'Utilities':      { color: '#F59E0B' },
  'Entertainment':  { color: '#EC4899' },
  'Food & Dining':  { color: '#F97316' },
  'Dining':         { color: '#F97316' },
  'Healthcare':     { color: '#EF4444' },
  'Salary':         { color: '#10B981' },
  'Freelance':      { color: '#8B5CF6' },
  'Investments':    { color: '#06B6D4' },
  'Subscriptions':  { color: '#8B5CF6' },
  'Shopping':       { color: '#EC4899' },
  'Other':          { color: '#64748B' },
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
  { id: 'work', name: 'Work Account', type: 'Current Account', currency: 'INR', initialBalance: 25000, isActive: true, isDefault: false },
  { id: 'personal', name: 'Personal Account', type: 'Savings Account', currency: 'INR', initialBalance: 84000, isActive: true, isDefault: true },
];

const DEFAULT_TRANSACTIONS = [
  {
    id: 'tx_1',
    description: 'Tech Salary (Monthly)',
    amount: 75000,
    type: 'income',
    category: 'Salary',
    account: 'work',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    paymentMethod: 'IMPS Bank Transfer',
    paymentProvider: 'bank',
    paymentStatus: 'success',
    merchantName: 'Tech Corp India Ltd',
    merchantLocation: 'Bengaluru, India',
    receiptNumber: 'RR-SAL-892144',
  },
  {
    id: 'tx_2',
    description: 'Apartment Rent',
    amount: 18000,
    type: 'expense',
    category: 'Housing',
    account: 'personal',
    date: new Date().toISOString().split('T')[0],
    time: '11:30 AM',
    paymentMethod: 'UPI AutoPay',
    paymentProvider: 'razorpay',
    paymentStatus: 'success',
    merchantName: 'Godrej Prime Estates',
    merchantLocation: 'Mumbai, India',
    receiptNumber: 'RR-RNT-443120',
  },
  {
    id: 'tx_3',
    description: 'Supermarket Groceries',
    amount: 500,
    type: 'expense',
    category: 'Groceries',
    account: 'personal',
    date: new Date().toISOString().split('T')[0],
    time: '04:15 PM',
    paymentMethod: 'UPI / Razorpay',
    paymentProvider: 'razorpay',
    paymentStatus: 'success',
    razorpayPaymentId: 'pay_rzp_mock_grocery500',
    razorpayOrderId: 'order_mock_grocery500',
    merchantName: 'Reliance Smart / Blinkit',
    merchantLocation: 'Mumbai, Maharashtra, India',
    receiptNumber: 'RR-GRO-500122',
  },
  {
    id: 'tx_4',
    description: 'Cloud Software Subscription',
    amount: 499,
    type: 'expense',
    category: 'Subscriptions',
    account: 'work',
    date: new Date().toISOString().split('T')[0],
    time: '06:45 PM',
    paymentMethod: 'Razorpay Card',
    paymentProvider: 'razorpay',
    paymentStatus: 'success',
    merchantName: 'GitHub / DigitalOcean',
    merchantLocation: 'Online Merchant',
    receiptNumber: 'RR-SUB-102944',
  },
];

const FinTrackContext = createContext(null);

export const FinTrackProvider = ({ children }) => {
  const { user, isLoaded: isUserLoaded } = useUser();

  // 1. Currency State
  const [currencyCode, setCurrencyCode] = useState('INR');

  // 2. Theme State
  const [theme, setThemeState] = useState('light');

  // 3. Accounts State
  const [accounts, setAccounts] = useState(DEFAULT_ACCOUNTS);

  // 4. Transactions State
  const [transactions, setTransactions] = useState(DEFAULT_TRANSACTIONS);

  // 5. Budget State
  const [annualBudget, setAnnualBudgetState] = useState(250000);

  // 6. Profile State
  const [profile, setProfileState] = useState({
    firstName: '',
    lastName: '',
    email: '',
    imageUrl: '',
  });

  // 7. Active Dashboard Filter Account ID
  const [currentAccountFilter, setCurrentAccountFilter] = useState('all');

  // 8. Modals visibility
  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // 9. Toast Notification State
  const [toast, setToast] = useState({ visible: false, message: '', type: 'check' });

  // 10. Database sync state
  const [isDbLoading, setIsDbLoading] = useState(false);

  // Load state from localStorage on mount (client-side only initial fallback)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedCurrency = localStorage.getItem(STORAGE_KEYS.CURRENCY);
      if (savedCurrency && CURRENCIES[savedCurrency]) setCurrencyCode(savedCurrency);

      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
      if (savedTheme) setThemeState(savedTheme);

      const savedAccounts = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      if (savedAccounts) setAccounts(JSON.parse(savedAccounts));

      const savedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (savedTransactions) setTransactions(JSON.parse(savedTransactions));

      const savedBudget = localStorage.getItem(STORAGE_KEYS.BUDGET);
      if (savedBudget) setAnnualBudgetState(parseFloat(savedBudget) || 25000);

      const savedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (savedProfile) setProfileState(JSON.parse(savedProfile));
    } catch (e) {
      console.error('Error loading data from localStorage', e);
    }
  }, []);

  // Fetch live data from MongoDB when Clerk user is loaded
  useEffect(() => {
    if (!isUserLoaded || !user) return;

    let isMounted = true;
    const fetchDbData = async () => {
      try {
        setIsDbLoading(true);
        const res = await fetch('/api/data');
        if (!res.ok) {
          console.warn('MongoDB /api/data returned status:', res.status);
          return;
        }

        const data = await res.json();
        if (!isMounted) return;

        if (Array.isArray(data.accounts) && data.accounts.length > 0) {
          setAccounts(data.accounts);
        }
        if (Array.isArray(data.transactions)) {
          setTransactions(data.transactions);
        }
        if (data.settings) {
          if (data.settings.currencyCode && CURRENCIES[data.settings.currencyCode]) {
            setCurrencyCode(data.settings.currencyCode);
          }
          if (data.settings.theme) {
            setThemeState(data.settings.theme);
          }
          if (data.settings.annualBudget !== undefined) {
            setAnnualBudgetState(Number(data.settings.annualBudget));
          }
        }
      } catch (err) {
        console.warn('Could not sync with MongoDB backend (will use local cache):', err);
      } finally {
        if (isMounted) setIsDbLoading(false);
      }
    };

    fetchDbData();

    return () => {
      isMounted = false;
    };
  }, [isUserLoaded, user]);

  // Sync profile with Clerk user when available
  useEffect(() => {
    if (isUserLoaded && user) {
      setProfileState(prev => ({
        firstName: user.firstName || prev.firstName || 'User',
        lastName: user.lastName || prev.lastName || '',
        email: user.primaryEmailAddress?.emailAddress || prev.email || '',
        imageUrl: user.imageUrl || prev.imageUrl || '',
      }));
    }
  }, [isUserLoaded, user]);

  const currency = useMemo(() => {
    return CURRENCIES[currencyCode] || CURRENCIES.USD;
  }, [currencyCode]);

  const showToast = useCallback((message, type = 'check') => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 2800);
  }, []);

  // Backup Save to LocalStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CURRENCY, currencyCode);
    }
  }, [currencyCode]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    }
  }, [theme]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    }
  }, [accounts]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    }
  }, [transactions]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.BUDGET, annualBudget.toString());
    }
  }, [annualBudget]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    }
  }, [profile]);

  // Apply Dark/Light/System Theme
  useEffect(() => {
    if (typeof window === 'undefined') return;

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
      setAccounts(prev => prev.map(a => ({ ...a, currency: code })));
      showToast(`Currency changed to ${CURRENCIES[code].name}`, 'currency');

      if (user) {
        fetch('/api/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currencyCode: code }),
        }).catch(err => console.error('Failed to update currency in MongoDB:', err));
      }
    }
  }, [showToast, user]);

  const setTheme = useCallback((mode) => {
    setThemeState(mode);
    const labels = { light: 'Light Mode', dark: 'Dark Mode', system: 'System Mode' };
    showToast(`${labels[mode] || mode} activated`, 'settings');

    if (user) {
      fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: mode }),
      }).catch(err => console.error('Failed to update theme in MongoDB:', err));
    }
  }, [showToast, user]);

  const addAccount = useCallback(async (newAccData) => {
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

    showToast(`Account "${newAcc.name}" created!`, 'card');

    if (user) {
      try {
        await fetch('/api/accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newAcc),
        });
      } catch (err) {
        console.error('Failed to persist account in MongoDB:', err);
      }
    }

    return newAcc;
  }, [currencyCode, showToast, user]);

  const toggleAccount = useCallback(async (id) => {
    let nextActive = true;
    setAccounts(prev => prev.map(a => {
      if (a.id === id) {
        nextActive = a.isActive === false ? true : false;
        showToast(`${a.name} is now ${nextActive ? 'Enabled' : 'Disabled'}`, 'check');
        return { ...a, isActive: nextActive };
      }
      return a;
    }));

    if (user) {
      try {
        await fetch(`/api/accounts/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: nextActive }),
        });
      } catch (err) {
        console.error('Failed to persist toggle in MongoDB:', err);
      }
    }
  }, [showToast, user]);

  const deleteAccount = useCallback(async (id) => {
    let accName = '';
    setAccounts(prev => {
      const acc = prev.find(a => a.id === id);
      accName = acc?.name || '';
      const remaining = prev.filter(a => a.id !== id);
      if (acc?.isDefault && remaining.length > 0) {
        remaining[0] = { ...remaining[0], isDefault: true };
      }
      return remaining;
    });

    setTransactions(prev => prev.filter(t => t.account !== id));
    showToast(`Account "${accName}" deleted`, 'trash');

    if (user) {
      try {
        await fetch(`/api/accounts/${id}`, {
          method: 'DELETE',
        });
      } catch (err) {
        console.error('Failed to delete account from MongoDB:', err);
      }
    }
  }, [showToast, user]);

  const addTransaction = useCallback(async (txData) => {
    const now = new Date();
    const newTx = {
      id: txData.id || 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      description: txData.description,
      amount: parseFloat(txData.amount) || 0,
      type: txData.type, // 'income' | 'expense'
      category: txData.category || 'Other',
      account: txData.account || 'personal',
      date: txData.date || now.toISOString().split('T')[0],
      time: txData.time || now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      paymentMethod: txData.paymentMethod || 'UPI',
      paymentProvider: txData.paymentProvider || 'razorpay',
      paymentStatus: txData.paymentStatus || 'success',
      razorpayOrderId: txData.razorpayOrderId || null,
      razorpayPaymentId: txData.razorpayPaymentId || null,
      merchantName: txData.merchantName || txData.description,
      merchantLocation: txData.merchantLocation || 'Mumbai, Maharashtra, India',
      taxAmount: txData.taxAmount || 0,
      receiptNumber: txData.receiptNumber || `RR-${Date.now().toString().slice(-6)}`,
      createdAt: txData.createdAt || now.toISOString(),
    };

    setTransactions(prev => [newTx, ...prev]);
    showToast('Transaction recorded successfully!', 'check');

    if (user && !txData._fromDb) {
      try {
        await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTx),
        });
      } catch (err) {
        console.error('Failed to save transaction in MongoDB:', err);
      }
    }

    return newTx;
  }, [showToast, user]);

  const deleteTransaction = useCallback(async (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    showToast('Transaction removed', 'trash');

    if (user) {
      try {
        await fetch(`/api/transactions/${id}`, {
          method: 'DELETE',
        });
      } catch (err) {
        console.error('Failed to delete transaction from MongoDB:', err);
      }
    }
  }, [showToast, user]);

  const updateTransaction = useCallback(async (id, updatedData) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updatedData } : t));
    showToast('Transaction updated successfully!', 'edit');

    if (user) {
      try {
        await fetch(`/api/transactions/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedData),
        });
      } catch (err) {
        console.error('Failed to update transaction in MongoDB:', err);
      }
    }
  }, [showToast, user]);

  const deleteMultipleTransactions = useCallback(async (ids) => {
    if (!ids || ids.length === 0) return;
    const idsSet = new Set(ids);
    setTransactions(prev => prev.filter(t => !idsSet.has(t.id)));
    showToast(`${ids.length} transaction(s) removed`, 'trash');

    if (user) {
      try {
        await Promise.all(
          ids.map(id => fetch(`/api/transactions/${id}`, { method: 'DELETE' }))
        );
      } catch (err) {
        console.error('Failed to bulk delete transactions from MongoDB:', err);
      }
    }
  }, [showToast, user]);

  const setAnnualBudget = useCallback((amount) => {
    setAnnualBudgetState(amount);
    showToast('Annual budget target updated!', 'check');

    if (user) {
      fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ annualBudget: amount }),
      }).catch(err => console.error('Failed to save budget in MongoDB:', err));
    }
  }, [showToast, user]);

  const setProfile = useCallback((newProfile) => {
    setProfileState(newProfile);
    showToast('Profile settings saved!', 'check');
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
      }
      const cat = t.category || 'Other';
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + amt;
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
    deleteAccount,
    transactions,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    deleteMultipleTransactions,
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
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    toast,
    showToast,
    isDbLoading,
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
