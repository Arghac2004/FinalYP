/**
 * data.js — FinTrack Data Layer
 * Handles localStorage state for transactions, accounts, budget, profile, theme, and live calculations.
 */

function escapeHtml(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(str));
  return d.innerHTML;
}

const CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar (USD)', code: 'USD' },
  INR: { symbol: '₹', name: 'Indian Rupee (INR)', code: 'INR' },
  EUR: { symbol: '€', name: 'Euro (EUR)', code: 'EUR' },
  GBP: { symbol: '£', name: 'British Pound (GBP)', code: 'GBP' },
  JPY: { symbol: '¥', name: 'Japanese Yen (JPY)', code: 'JPY' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar (CAD)', code: 'CAD' },
  AUD: { symbol: 'A$', name: 'Australian Dollar (AUD)', code: 'AUD' },
};

const FinTrackDB = (() => {
  const KEYS = {
    TRANSACTIONS: 'fintrack_transactions',
    ACCOUNTS:     'fintrack_accounts',
    BUDGET:       'fintrack_annual_budget',
    PROFILE:      'fintrack_profile',
    THEME:        'fintrack_theme',
    CURRENCY:     'fintrack_currency',
  };

  /* ── CURRENCY ── */
  function getCurrency() {
    const code = localStorage.getItem(KEYS.CURRENCY) || 'USD';
    return CURRENCIES[code] || CURRENCIES.USD;
  }

  function setCurrency(code) {
    if (CURRENCIES[code]) {
      localStorage.setItem(KEYS.CURRENCY, code);
    }
  }

  /* ── THEME (Light / Dark / System) ── */
  function getTheme() {
    return localStorage.getItem(KEYS.THEME) || 'light';
  }

  function setTheme(themeMode) {
    localStorage.setItem(KEYS.THEME, themeMode);
  }

  /* ── ACCOUNTS ── */
  function getAccounts() {
    try {
      const data = localStorage.getItem(KEYS.ACCOUNTS);
      if (data) return JSON.parse(data);
    } catch {}
    // Initial default accounts
    return [
      { id: 'work', name: 'Work', type: 'Current Account', initialBalance: 0, isActive: true, isDefault: false },
      { id: 'personal', name: 'Personal', type: 'Savings Account', initialBalance: 0, isActive: true, isDefault: true },
    ];
  }

  function saveAccounts(list) {
    localStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(list));
  }

  function addAccount(acc) {
    const list = getAccounts();
    const id = 'acc_' + Date.now();
    const newAcc = {
      id: id,
      name: acc.name,
      type: acc.type || 'Current Account',
      currency: acc.currency || 'USD',
      initialBalance: parseFloat(acc.initialBalance) || 0,
      isActive: true,
      isDefault: acc.isDefault || false,
      createdAt: new Date().toISOString(),
    };

    if (newAcc.isDefault) {
      list.forEach(a => a.isDefault = false);
    }

    list.push(newAcc);
    saveAccounts(list);

    // If profile is not configured, update profile name based on account creator
    const profile = getProfile();
    if (!profile.firstName || profile.firstName === 'User') {
      const nameParts = acc.name.trim().split(' ');
      profile.firstName = nameParts[0] || 'User';
      profile.lastName = nameParts.slice(1).join(' ') || '';
      if (!profile.email) {
        profile.email = `${profile.firstName.toLowerCase()}@fintrack.app`;
      }
      setProfile(profile);
    }

    return newAcc;
  }

  function toggleAccountActive(id) {
    const list = getAccounts();
    const target = list.find(a => a.id === id);
    if (target) {
      target.isActive = target.isActive === undefined ? false : !target.isActive;
      saveAccounts(list);
    }
    return list;
  }

  /* ── PROFILE ── */
  function getProfile() {
    try {
      const data = localStorage.getItem(KEYS.PROFILE);
      if (data) return JSON.parse(data);
    } catch {}
    return {
      firstName: '',
      lastName: '',
      email: '',
      avatarUrl: '',
    };
  }

  function setProfile(profileData) {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profileData));
  }

  /* ── TRANSACTIONS ── */
  function getTransactions() {
    try {
      const data = localStorage.getItem(KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  function saveTransactions(list) {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(list));
  }

  function addTransaction(tx) {
    const list = getTransactions();
    const newTx = {
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      description: tx.description,
      amount: parseFloat(tx.amount),
      type: tx.type, // 'expense' or 'income'
      category: tx.category || 'Other',
      account: tx.account || 'personal',
      date: tx.date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };
    list.unshift(newTx); // newest on top
    saveTransactions(list);
    return newTx;
  }

  function deleteTransaction(id) {
    const list = getTransactions().filter(t => t.id !== id);
    saveTransactions(list);
  }

  /* ── BUDGET ── */
  function getAnnualBudget() {
    const val = localStorage.getItem(KEYS.BUDGET);
    return val ? parseFloat(val) : 0;
  }

  function setAnnualBudget(amount) {
    localStorage.setItem(KEYS.BUDGET, String(amount));
  }

  /* ── METRICS & LIVE CALCULATIONS ── */
  function getMetrics(filterAccountId = 'all') {
    const txs = getTransactions();
    const accounts = getAccounts();
    const annualBudget = getAnnualBudget();

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryBreakdown = {};

    // Calculate account-specific balances
    const accountBalances = {};
    accounts.forEach(acc => {
      accountBalances[acc.id] = {
        id: acc.id,
        name: acc.name,
        type: acc.type,
        isActive: acc.isActive !== false,
        isDefault: acc.isDefault,
        income: 0,
        expense: 0,
        balance: acc.initialBalance || 0,
        transactionsCount: 0,
      };
    });

    // Process all transactions for account stats
    txs.forEach(tx => {
      const amt = Math.abs(Number(tx.amount)) || 0;
      const accId = tx.account || 'personal';

      if (accountBalances[accId]) {
        accountBalances[accId].transactionsCount++;
      }

      const matchesFilter = filterAccountId === 'all' || accId === filterAccountId;

      if (tx.type === 'income') {
        if (accountBalances[accId]) {
          accountBalances[accId].income += amt;
          accountBalances[accId].balance += amt;
        }
        if (matchesFilter) {
          totalIncome += amt;
        }
      } else {
        if (accountBalances[accId]) {
          accountBalances[accId].expense += amt;
          accountBalances[accId].balance -= amt;
        }
        if (matchesFilter) {
          totalExpense += amt;
          const cat = tx.category || 'Other';
          categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + amt;
        }
      }
    });

    let availableBalance = 0;
    if (filterAccountId !== 'all' && accountBalances[filterAccountId]) {
      availableBalance = accountBalances[filterAccountId].balance;
    } else {
      // Sum balances of all active accounts
      availableBalance = Object.values(accountBalances)
        .filter(a => a.isActive)
        .reduce((sum, a) => sum + a.balance, 0);
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
      accounts: accountBalances,
      hasData: txs.length > 0,
      filterAccountId,
    };
  }

  return {
    getCurrency,
    setCurrency,
    getTheme,
    setTheme,
    getAccounts,
    addAccount,
    toggleAccountActive,
    getProfile,
    setProfile,
    getTransactions,
    addTransaction,
    deleteTransaction,
    getAnnualBudget,
    setAnnualBudget,
    getMetrics,
  };
})();
