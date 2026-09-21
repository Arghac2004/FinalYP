/**
 * account-details.js — FinTrack Account Overview & Analytics Page Module
 * Handles individual account views, range filters, metrics, and bar chart rendering.
 */

let activeAccountDetailsId = null;
let activeAccountDetailsRange = 'all';

function openAccountDetailsPage(accId) {
  navigateTo('#/account/' + accId);
}

function openAccountAddTransaction() {
  navigateTo('#/add-transaction');
  // Preselect active account in form
  setTimeout(() => {
    const select = document.getElementById('page-form-account');
    if (select && activeAccountDetailsId) {
      select.value = activeAccountDetailsId;
      if (typeof updateLivePreview === 'function') {
        updateLivePreview();
      }
    }
  }, 50);
}

function handleAccountRangeChange(range) {
  activeAccountDetailsRange = range;
  if (activeAccountDetailsId) {
    renderAccountDetailsPage(activeAccountDetailsId, range);
  }
}

function renderAccountDetailsPage(accId, range = 'all') {
  const accounts = FinTrackDB.getAccounts();
  const acc = accounts.find(a => a.id === accId) || accounts[0];
  if (!acc) return;

  activeAccountDetailsId = acc.id;

  // 1. Header Details
  const titleEl = document.getElementById('account-header-title');
  const typeEl = document.getElementById('account-header-type');
  const balanceEl = document.getElementById('account-header-balance');
  const countEl = document.getElementById('account-header-count');

  if (titleEl) titleEl.textContent = acc.name;
  if (typeEl) typeEl.textContent = acc.type || 'Savings Account';

  // 2. Fetch Account Transactions & Filter by Range
  let txList = FinTrackDB.getTransactions().filter(t => (t.account || 'personal') === acc.id);
  
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let filteredTx = txList;
  if (range === 'this-month') {
    filteredTx = txList.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
  } else if (range === 'last-month') {
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    filteredTx = txList.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    });
  }

  // 3. Compute Metrics
  let totalIncome = 0;
  let totalExpense = 0;

  txList.forEach(t => {
    const amt = Math.abs(Number(t.amount)) || 0;
    if (t.type === 'income') totalIncome += amt;
    else totalExpense += amt;
  });

  const currentBalance = (acc.initialBalance || 0) + totalIncome - totalExpense;
  if (balanceEl) {
    balanceEl.textContent = formatUSD(currentBalance);
    balanceEl.className = currentBalance >= 0 ? 'text-3xl sm:text-4xl font-black text-slate-900 tracking-tight' : 'text-3xl sm:text-4xl font-black text-red-500 tracking-tight';
  }

  if (countEl) {
    countEl.textContent = `${txList.length} Transaction${txList.length === 1 ? '' : 's'}`;
  }

  // Overview Card Range Metrics
  let rangeIncome = 0;
  let rangeExpense = 0;
  filteredTx.forEach(t => {
    const amt = Math.abs(Number(t.amount)) || 0;
    if (t.type === 'income') rangeIncome += amt;
    else rangeExpense += amt;
  });
  const rangeNet = rangeIncome - rangeExpense;

  const ovIncomeEl = document.getElementById('account-overview-income');
  const ovExpenseEl = document.getElementById('account-overview-expense');
  const ovNetEl = document.getElementById('account-overview-net');

  if (ovIncomeEl) ovIncomeEl.textContent = formatUSD(rangeIncome);
  if (ovExpenseEl) ovExpenseEl.textContent = formatUSD(rangeExpense);
  if (ovNetEl) {
    ovNetEl.textContent = formatUSD(rangeNet);
    ovNetEl.className = rangeNet >= 0 ? 'text-lg sm:text-2xl font-black text-emerald-600 tracking-tight' : 'text-lg sm:text-2xl font-black text-red-500 tracking-tight';
  }

  // 4. Render Income vs Expense Bar Chart
  if (typeof renderAccountBarChart === 'function') {
    renderAccountBarChart('accountBarChart', filteredTx);
  }

  // 5. Render Account Transactions Table
  if (typeof renderAccountDetailsTransactionsTable === 'function') {
    renderAccountDetailsTransactionsTable(acc.id);
  }
}
