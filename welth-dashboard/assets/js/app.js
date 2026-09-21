/**
 * app.js — FinTrack Master Entrypoint & Global Orchestration
 * Initializes theme, currency, router, live clock, and global toast notifications.
 */

document.addEventListener('DOMContentLoaded', () => {
  if (typeof initTheme === 'function') initTheme();
  if (typeof initCurrency === 'function') initCurrency();
  if (typeof initFormDate === 'function') initFormDate();
  startLiveClock();
  if (typeof renderProfile === 'function') renderProfile();
  if (typeof renderAccountCards === 'function') renderAccountCards();
  if (typeof initRouter === 'function') initRouter();
  if (typeof refreshDashboard === 'function') refreshDashboard();
});

/* ═══════════════════════ LIVE DATE & CLOCK ═══════════════════════ */

function startLiveClock() {
  function update() {
    const now = new Date();
    
    // Format Date: e.g. Mon, 21 Sep 2026
    const dateOptions = { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' };
    const dateStr = now.toLocaleDateString('en-US', dateOptions);

    // Format Time: e.g. 11:24:35 PM
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
    const timeStr = now.toLocaleTimeString('en-US', timeOptions);

    const dateEl = document.getElementById('live-date');
    const timeEl = document.getElementById('live-time');

    if (dateEl) dateEl.textContent = dateStr;
    if (timeEl) timeEl.textContent = timeStr;
  }

  update();
  setInterval(update, 1000);
}

/* ═══════════════════════ CURRENCY SWITCHER ═══════════════════════ */

function initCurrency() {
  const current = FinTrackDB.getCurrency();
  const settingsSelect = document.getElementById('settings-currency-select');
  if (settingsSelect) settingsSelect.value = current.code;
}

function handleCurrencyChange(code) {
  FinTrackDB.setCurrency(code);
  const settingsSelect = document.getElementById('settings-currency-select');
  if (settingsSelect) settingsSelect.value = code;

  if (typeof refreshDashboard === 'function') {
    refreshDashboard();
  }

  if (typeof activeAccountDetailsId !== 'undefined' && activeAccountDetailsId && typeof renderAccountDetailsPage === 'function') {
    renderAccountDetailsPage(activeAccountDetailsId, typeof activeAccountDetailsRange !== 'undefined' ? activeAccountDetailsRange : 'all');
  }

  const curr = FinTrackDB.getCurrency();
  showToast(`Currency changed to ${curr.name}`, '💱');
}

/* ═══════════════════════ TOAST NOTIFICATIONS ═══════════════════════ */

let toastTimeout = null;

function showToast(msg, icon = '✅') {
  const toast = document.getElementById('toast');
  const msgEl = document.getElementById('toast-msg');
  const iconEl = document.getElementById('toast-icon');

  if (!toast) return;
  if (toastTimeout) clearTimeout(toastTimeout);

  if (msgEl) msgEl.textContent = msg;
  if (iconEl) iconEl.textContent = icon;
  toast.classList.remove('hidden');

  toastTimeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, 2500);
}
