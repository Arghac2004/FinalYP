/**
 * transactions.js — FinTrack Transactions Module
 * Handles Transactions Table, Add Transaction page/modal, search, category styles, and deletion.
 */

let activeFilter = 'all';
let accountSearchQuery = '';
let accountTypeFilter = 'all';

/* ── Category Styling Definitions ── */
const CATEGORY_STYLES = {
  'Housing':        { icon: '🏠', color: '#6366F1' },
  'Transportation': { icon: '🚗', color: '#3B82F6' },
  'Groceries':      { icon: '🛒', color: '#10B981' },
  'Utilities':      { icon: '⚡', color: '#F59E0B' },
  'Entertainment':  { icon: '🎬', color: '#EC4899' },
  'Food & Dining':  { icon: '🍔', color: '#F97316' },
  'Healthcare':     { icon: '🏥', color: '#EF4444' },
  'Salary':         { icon: '💼', color: '#10B981' },
  'Freelance':      { icon: '💻', color: '#8B5CF6' },
  'Investments':    { icon: '📈', color: '#06B6D4' },
  'Other':          { icon: '📦', color: '#64748B' },
};

/* ═══════════════════════ DASHBOARD TRANSACTIONS TABLE ═══════════════════════ */

function renderTransactionsTable(filterAccountId = 'all') {
  const tbody = document.getElementById('tx-table-body');
  const emptyState = document.getElementById('tx-empty-state');
  if (!tbody) return;

  let list = FinTrackDB.getTransactions();

  if (filterAccountId && filterAccountId !== 'all') {
    list = list.filter(t => (t.account || 'personal') === filterAccountId);
  }

  if (activeFilter !== 'all') {
    list = list.filter(t => t.type === activeFilter);
  }

  if (list.length === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  tbody.innerHTML = list.map(tx => {
    const isIncome = tx.type === 'income';
    const amountStr = isIncome ? `+${formatUSD(tx.amount)}` : `-${formatUSD(tx.amount)}`;
    const amountClass = isIncome ? 'text-emerald-600 font-bold' : 'text-slate-800 font-bold';
    
    // Format date nicely (DD/MM/YYYY)
    let formattedDate = tx.date;
    try {
      const parts = tx.date.split('-');
      if (parts.length === 3) {
        formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    } catch {
      formattedDate = tx.date;
    }

    const catStyle = CATEGORY_STYLES[tx.category] || { icon: '📦', color: '#94A3B8' };

    return `
      <tr class="hover:bg-slate-50/80 transition-colors group">
        <td class="py-3 px-6 text-slate-500 whitespace-nowrap">${formattedDate}</td>
        <td class="py-3 px-4 font-semibold text-slate-800">${escapeHtml(tx.description)}</td>
        <td class="py-3 px-4">
          <span class="category-pill text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
            <span>${catStyle.icon}</span>
            <span>${escapeHtml(tx.category || 'Other')}</span>
          </span>
        </td>
        <td class="py-3 px-6 text-right whitespace-nowrap">
          <div class="flex items-center justify-end gap-2">
            <span class="${amountClass}">${amountStr}</span>
            <button onclick="removeTransaction('${tx.id}')" class="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all text-xs p-1 cursor-pointer" title="Delete">
              ✕
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function filterTx(type, btn) {
  activeFilter = type;
  document.querySelectorAll('.tx-tab').forEach(b => {
    b.classList.remove('active', 'text-primary', 'bg-primary-light');
    b.classList.add('text-slate-500');
  });
  btn.classList.add('active', 'text-primary', 'bg-primary-light');
  btn.classList.remove('text-slate-500');

  renderTransactionsTable(typeof currentDashboardAccount !== 'undefined' ? currentDashboardAccount : 'all');
}

function removeTransaction(id) {
  FinTrackDB.deleteTransaction(id);
  refreshDashboard();
  if (typeof activeAccountDetailsId !== 'undefined' && activeAccountDetailsId) {
    renderAccountDetailsPage(activeAccountDetailsId);
  }
  showToast('Transaction removed', '🗑️');
}

/* ═══════════════════════ ACCOUNT DETAILS TRANSACTIONS TABLE ═══════════════════════ */

function renderAccountDetailsTransactionsTable(accId) {
  const tbody = document.getElementById('account-tx-tbody');
  const emptyState = document.getElementById('account-tx-empty');
  const countEl = document.getElementById('account-header-count');

  if (!tbody) return;

  let list = FinTrackDB.getTransactions().filter(t => (t.account || 'personal') === accId);

  if (countEl) {
    countEl.textContent = `${list.length} Transaction${list.length === 1 ? '' : 's'}`;
  }

  // Filter by Type
  if (accountTypeFilter !== 'all') {
    list = list.filter(t => t.type === accountTypeFilter);
  }

  // Filter by Search
  if (accountSearchQuery) {
    const q = accountSearchQuery.toLowerCase();
    list = list.filter(t => 
      (t.description || '').toLowerCase().includes(q) || 
      (t.category || '').toLowerCase().includes(q)
    );
  }

  if (list.length === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  tbody.innerHTML = list.map(tx => {
    const isIncome = tx.type === 'income';
    const amountStr = isIncome ? `+${formatUSD(tx.amount)}` : `-${formatUSD(tx.amount)}`;
    const amountClass = isIncome ? 'text-emerald-600 font-bold' : 'text-red-500 font-bold';

    let formattedDate = tx.date;
    try {
      const parts = tx.date.split('-');
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    } catch {}

    const catStyle = CATEGORY_STYLES[tx.category] || { icon: '📦', color: '#94A3B8' };

    return `
      <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group">
        <td class="py-3.5 px-4">
          <input type="checkbox" class="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300 dark:border-slate-600 cursor-pointer"/>
        </td>
        <td class="py-3.5 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap font-medium text-xs">${formattedDate}</td>
        <td class="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200 text-xs">${escapeHtml(tx.description)}</td>
        <td class="py-3.5 px-4">
          <span class="category-pill text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200/80 dark:border-slate-700">
            <span>${catStyle.icon}</span>
            <span>${escapeHtml(tx.category || 'Other')}</span>
          </span>
        </td>
        <td class="py-3.5 px-4 text-right whitespace-nowrap font-bold text-xs ${amountClass}">
          ${amountStr}
        </td>
        <td class="py-3.5 px-4 text-center whitespace-nowrap">
          <span class="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-200/60 dark:border-slate-700">
            <span class="w-1.5 h-1.5 rounded-full ${isIncome ? 'bg-emerald-500' : 'bg-blue-500'}"></span>
            ${isIncome ? 'Income' : 'One-time'}
          </span>
        </td>
        <td class="py-3.5 px-4 text-right">
          <button onclick="removeTransaction('${tx.id}')" class="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all text-xs p-1 cursor-pointer" title="Delete">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function handleAccountSearch(input) {
  accountSearchQuery = input.value.trim();
  if (typeof activeAccountDetailsId !== 'undefined' && activeAccountDetailsId) {
    renderAccountDetailsTransactionsTable(activeAccountDetailsId);
  }
}

function handleAccountTypeFilter(select) {
  accountTypeFilter = select.value;
  if (typeof activeAccountDetailsId !== 'undefined' && activeAccountDetailsId) {
    renderAccountDetailsTransactionsTable(activeAccountDetailsId);
  }
}

/* ═══════════════════════ ADD TRANSACTION PAGE HANDLERS ═══════════════════════ */

function initPageAddTransaction() {
  populateAccountDropdown();
  const dateInput = document.getElementById('page-form-date');
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }
  updateLivePreview();
}

function selectPageType(btn) {
  const type = btn.dataset.type;
  document.getElementById('page-form-type').value = type;

  document.querySelectorAll('.page-type-btn').forEach(b => {
    b.className = 'page-type-btn py-2.5 rounded-xl font-bold text-xs text-slate-600 hover:text-slate-900 transition-all active:scale-98';
  });

  if (type === 'expense') {
    btn.className = 'page-type-btn py-2.5 rounded-xl font-bold text-xs bg-red-500 text-white shadow-md transition-all active:scale-98';
  } else {
    btn.className = 'page-type-btn py-2.5 rounded-xl font-bold text-xs bg-emerald-500 text-white shadow-md transition-all active:scale-98';
  }

  updateLivePreview();
}

function updateLivePreview() {
  const type = document.getElementById('page-form-type')?.value || 'expense';
  const desc = document.getElementById('page-form-desc')?.value.trim() || 'New Purchase';
  const amountVal = parseFloat(document.getElementById('page-form-amount')?.value) || 0;
  const dateVal = document.getElementById('page-form-date')?.value || new Date().toISOString().split('T')[0];
  const catSelect = document.getElementById('page-form-category');
  const catText = catSelect ? catSelect.options[catSelect.selectedIndex]?.text : '🛒 Groceries';
  const accSelect = document.getElementById('page-form-account');
  const accText = accSelect && accSelect.selectedIndex >= 0 ? accSelect.options[accSelect.selectedIndex]?.text.split('(')[0].trim() : 'Account';

  // Update Preview elements
  const badgeEl = document.getElementById('preview-type-badge');
  const accEl = document.getElementById('preview-account-name');
  const amountEl = document.getElementById('preview-amount');
  const catEl = document.getElementById('preview-category');
  const descEl = document.getElementById('preview-desc');
  const dateEl = document.getElementById('preview-date');

  if (badgeEl) {
    if (type === 'expense') {
      badgeEl.textContent = 'Expense';
      badgeEl.className = 'inline-block text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md bg-red-100 text-red-600 border border-red-200 shadow-xs';
    } else {
      badgeEl.textContent = 'Income';
      badgeEl.className = 'inline-block text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-600 border border-emerald-200 shadow-xs';
    }
  }

  if (accEl) accEl.textContent = accText;
  if (amountEl) {
    const formatted = formatUSD(amountVal);
    if (type === 'expense') {
      amountEl.textContent = `-${formatted}`;
      amountEl.className = 'text-3xl font-black text-red-500 tracking-tight mt-0.5';
    } else {
      amountEl.textContent = `+${formatted}`;
      amountEl.className = 'text-3xl font-black text-emerald-600 tracking-tight mt-0.5';
    }
  }
  if (catEl) catEl.textContent = catText;
  if (descEl) descEl.textContent = desc;
  if (dateEl) dateEl.textContent = dateVal;
}

function handlePageTransactionSubmit(e) {
  e.preventDefault();

  const desc = document.getElementById('page-form-desc').value.trim();
  const amount = parseFloat(document.getElementById('page-form-amount').value);
  const type = document.getElementById('page-form-type').value;
  const category = document.getElementById('page-form-category').value;
  const account = document.getElementById('page-form-account').value;
  const date = document.getElementById('page-form-date').value;

  if (!desc || isNaN(amount) || amount <= 0) return;

  FinTrackDB.addTransaction({
    description: desc,
    amount: amount,
    type: type,
    category: category,
    account: account,
    date: date,
  });

  const form = document.getElementById('page-tx-form');
  if (form) form.reset();

  if (typeof activeAccountDetailsId !== 'undefined' && activeAccountDetailsId) {
    navigateTo('#/account/' + activeAccountDetailsId);
    renderAccountDetailsPage(activeAccountDetailsId);
  } else {
    navigateTo('#/');
    refreshDashboard();
  }
  showToast('Transaction recorded successfully!', '✨');
}

/* ═══════════════════════ MODAL TRANSACTION HANDLERS ═══════════════════════ */

function openModal() {
  navigateTo('#/add-transaction');
}

function closeModal() {
  const modal = document.getElementById('tx-modal');
  if (modal) modal.classList.add('hidden');
  const form = document.getElementById('tx-form');
  if (form) form.reset();
  initFormDate();
  resetTypeBtn();
}

function selectType(btn) {
  const type = btn.dataset.type;
  document.getElementById('form-type').value = type;

  document.querySelectorAll('.type-btn').forEach(b => {
    b.className = 'type-btn py-2 rounded-lg font-bold text-xs text-slate-600 hover:text-slate-900 transition-all';
  });

  if (type === 'expense') {
    btn.className = 'type-btn py-2 rounded-lg font-bold text-xs bg-red-500 text-white shadow-sm transition-all';
  } else {
    btn.className = 'type-btn py-2 rounded-lg font-bold text-xs bg-emerald-500 text-white shadow-sm transition-all';
  }
}

function resetTypeBtn() {
  const defaultBtn = document.querySelector('.type-btn[data-type="expense"]');
  if (defaultBtn) selectType(defaultBtn);
}

function handleTransactionSubmit(e) {
  e.preventDefault();

  const desc = document.getElementById('form-desc').value.trim();
  const amount = parseFloat(document.getElementById('form-amount').value);
  const type = document.getElementById('form-type').value;
  const category = document.getElementById('form-category').value;
  const account = document.getElementById('form-account').value;
  const date = document.getElementById('form-date').value;

  if (!desc || isNaN(amount) || amount <= 0) return;

  FinTrackDB.addTransaction({
    description: desc,
    amount: amount,
    type: type,
    category: category,
    account: account,
    date: date,
  });

  closeModal();
  refreshDashboard();
  showToast('Transaction added successfully!', '✨');
}

function populateAccountDropdown() {
  const accounts = FinTrackDB.getAccounts();
  const optionsHtml = accounts.map(acc => `
    <option value="${acc.id}" ${acc.isDefault ? 'selected' : ''}>${escapeHtml(acc.name)} (${acc.type.split(' ')[0]})</option>
  `).join('');

  const modalSelect = document.getElementById('form-account');
  if (modalSelect) modalSelect.innerHTML = optionsHtml;

  const pageSelect = document.getElementById('page-form-account');
  if (pageSelect) pageSelect.innerHTML = optionsHtml;
}

function initFormDate() {
  const dateInput = document.getElementById('form-date');
  if (dateInput) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }
}

function escapeHtml(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(str));
  return d.innerHTML;
}
