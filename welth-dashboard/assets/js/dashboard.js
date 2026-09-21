/**
 * dashboard.js — FinTrack Dashboard Page Module
 * Handles dashboard metrics calculations, account switcher pills, budget display, and account cards.
 */

let currentDashboardAccount = 'all';

function switchDashboardAccount(accId) {
  currentDashboardAccount = accId;
  refreshDashboard();
}

function renderDashboardAccountPills() {
  const container = document.getElementById('dashboard-account-pills');
  const label = document.getElementById('dashboard-active-account-label');
  if (!container) return;

  const accounts = FinTrackDB.getAccounts();
  const items = [{ id: 'all', name: 'All Accounts' }, ...accounts];

  const currentAcc = items.find(a => a.id === currentDashboardAccount);
  if (label && currentAcc) {
    label.textContent = currentAcc.name;
  }

  container.innerHTML = items.map(item => {
    const isSelected = item.id === currentDashboardAccount;
    const activeClass = isSelected
      ? 'bg-primary text-white shadow-sm font-bold'
      : 'text-slate-600 hover:text-slate-900 font-semibold';

    return `
      <button type="button" onclick="switchDashboardAccount('${item.id}')"
        class="px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${activeClass}">
        ${escapeHtml(item.name)}
      </button>
    `;
  }).join('');
}

// Live Refresh for all dashboard widgets
function refreshDashboard() {
  const metrics = FinTrackDB.getMetrics(currentDashboardAccount);

  // 1. Budget Card
  const budgetPctEl = document.getElementById('budget-pct');
  const budgetBarEl = document.getElementById('budget-bar');
  const budgetSpentEl = document.getElementById('budget-spent');
  const budgetTotalEl = document.getElementById('budget-total');
  const budgetRemainingEl = document.getElementById('budget-remaining');

  if (budgetPctEl) budgetPctEl.textContent = `${metrics.budgetPct}%`;
  if (budgetBarEl) budgetBarEl.style.width = `${metrics.budgetPct}%`;
  if (budgetSpentEl) budgetSpentEl.textContent = formatUSD(metrics.totalExpense);
  if (budgetTotalEl) budgetTotalEl.textContent = formatUSD(metrics.annualBudget);
  if (budgetRemainingEl) budgetRemainingEl.textContent = formatUSD(metrics.budgetRemaining);

  // 2. Available Balance Card
  const balanceEl = document.getElementById('available-balance');
  const balanceGrowth = document.getElementById('balance-growth');

  if (balanceEl) {
    balanceEl.textContent = formatUSD(metrics.availableBalance);
    if (metrics.availableBalance < 0) {
      balanceEl.classList.add('text-red-600');
    } else {
      balanceEl.classList.remove('text-red-600');
    }
  }

  if (balanceGrowth && metrics.hasData) {
    balanceGrowth.textContent = metrics.availableBalance >= 0 ? '+6%' : '-3%';
  }

  // 3. Total Savings Card
  const savingsEl = document.getElementById('total-savings');
  const savingsYtd = document.getElementById('savings-ytd');

  if (savingsEl) savingsEl.textContent = formatUSD(metrics.totalSavings);
  if (savingsYtd && metrics.hasData) {
    savingsYtd.textContent = '+12%';
  }

  // 4. Render Table, Donut Chart, Account Pills, and Account Cards
  renderDashboardAccountPills();
  if (typeof renderTransactionsTable === 'function') {
    renderTransactionsTable(currentDashboardAccount);
  }
  if (typeof renderExpenseDonutChart === 'function') {
    renderExpenseDonutChart(currentDashboardAccount);
  }
  renderAccountCards();
  if (typeof populateAccountDropdown === 'function') {
    populateAccountDropdown();
  }
}

/* ═══════════════════════ ACCOUNT CARDS RENDERING (DOUBLE-CLICK TO OPEN) ═══════════════════════ */

function renderAccountCards() {
  const container = document.getElementById('accounts-container');
  if (!container) return;

  const accounts = FinTrackDB.getAccounts();
  const metrics = FinTrackDB.getMetrics('all');
  const accountStats = metrics.accounts || {};

  // Add Account Button is always first item
  const addBtnHtml = `
    <button onclick="openCreateAccountModal()"
      class="tilt-card bg-white border-2 border-dashed border-slate-200 hover:border-primary hover:bg-primary/5 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[185px] transition-all group cursor-pointer shadow-card">
      <div class="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-primary/10 flex items-center justify-center text-slate-400 group-hover:text-primary transition-all mb-2 shadow-inner">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
      </div>
      <span class="text-sm font-bold text-slate-700 group-hover:text-primary transition-colors">Add New Account</span>
      <span class="text-xs text-slate-400 mt-0.5">Click to connect or create account</span>
    </button>
  `;

  // Account cards with 3D Aesthetics, Double Click trigger, and Active Filter Highlight
  const cardsHtml = accounts.map(acc => {
    const stats = accountStats[acc.id] || { balance: acc.initialBalance || 0, income: 0, expense: 0, transactionsCount: 0 };
    const balance = stats.balance;
    const balanceClass = balance >= 0 ? 'text-slate-900' : 'text-red-600';
    const isActive = acc.isActive !== false;
    const isFiltered = currentDashboardAccount === acc.id;

    return `
      <div ondblclick="openAccountDetailsPage('${acc.id}')" onclick="switchDashboardAccount('${acc.id}')"
        class="tilt-card account-3d-card p-6 flex flex-col justify-between min-h-[185px] cursor-pointer transition-all ${isFiltered ? 'ring-2 ring-primary ring-offset-2 shadow-lg' : ''} ${isActive ? 'opacity-100' : 'opacity-60 bg-slate-50/50'}"
        title="Click to filter dashboard • Double-click to view Analytics & Transactions">
        
        <div class="flex items-start justify-between">
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-sm font-bold text-slate-900 tracking-tight">${escapeHtml(acc.name)}</h3>
              ${isFiltered ? '<span class="text-[10px] font-bold text-primary bg-primary-light px-2 py-0.5 rounded-full border border-primary/20">Active View</span>' : ''}
              ${acc.isDefault && !isFiltered ? '<span class="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">Default</span>' : ''}
            </div>
            <p class="text-xs text-slate-400 mt-0.5">${escapeHtml(acc.type || 'Savings Account')}</p>
          </div>
          
          <div class="flex items-center gap-2.5" onclick="event.stopPropagation()">
            <!-- 3D Metallic Chip -->
            <div class="card-chip" title="EMV Secured"></div>

            <!-- Interactive Animated Toggle Switch -->
            <button type="button" onclick="handleAccountToggle('${acc.id}')"
              class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isActive ? 'bg-primary shadow-xs' : 'bg-slate-200'}"
              role="switch" aria-checked="${isActive}" title="${isActive ? 'Click to deactivate' : 'Click to activate'}">
              <span class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${isActive ? 'translate-x-4' : 'translate-x-0'}"></span>
            </button>
          </div>
        </div>

        <div class="my-2">
          <p class="text-2xl font-black tracking-tight ${balanceClass}">${formatUSD(balance)}</p>
          <span class="text-[10px] text-slate-400">${stats.transactionsCount || 0} transaction${stats.transactionsCount === 1 ? '' : 's'}</span>
        </div>

        <div class="flex items-center justify-between pt-3 border-t border-slate-100/80 text-xs">
          <div class="flex items-center gap-3">
            <span class="flex items-center gap-1 font-semibold text-red-500 text-[11px]">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M7 14l5-5 5 5z"/></svg>
              ${stats.expense > 0 ? formatUSD(stats.expense) : '$0'}
            </span>
            <span class="flex items-center gap-1 font-semibold text-emerald-600 text-[11px]">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
              ${stats.income > 0 ? formatUSD(stats.income) : '$0'}
            </span>
          </div>

          <button type="button" onclick="event.stopPropagation(); openAccountDetailsPage('${acc.id}')" class="text-[11px] font-bold text-primary hover:underline flex items-center gap-1">
            Overview →
          </button>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = addBtnHtml + cardsHtml;
}

function handleAccountToggle(accId) {
  const accounts = FinTrackDB.toggleAccountActive(accId);
  const target = accounts.find(a => a.id === accId);
  const status = target && target.isActive !== false ? 'Enabled' : 'Disabled';
  renderAccountCards();
  showToast(`${target ? target.name : 'Account'} is now ${status}`, target && target.isActive !== false ? '🟢' : '⚪');
}

function scrollToAccounts() {
  if (window.location.hash !== '#/' && window.location.hash !== '') {
    navigateTo('#/');
  }
  setTimeout(() => {
    const el = document.getElementById('accounts-container');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 120);
}
