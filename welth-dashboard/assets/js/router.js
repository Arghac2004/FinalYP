/**
 * router.js — FinTrack Client-Side Hash Router
 * Handles hash changes and view switching for SPA navigation.
 */

function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

function navigateTo(route) {
  window.location.hash = route;
}

function handleRoute() {
  const hash = window.location.hash || '#/';
  const dashboardView = document.getElementById('view-dashboard');
  const addTxView = document.getElementById('view-add-transaction');
  const accountView = document.getElementById('view-account-details');

  // Hide all views first
  if (dashboardView) dashboardView.classList.add('hidden');
  if (addTxView) addTxView.classList.add('hidden');
  if (accountView) accountView.classList.add('hidden');

  if (hash === '#/add-transaction') {
    if (addTxView) {
      addTxView.classList.remove('hidden');
      if (typeof initPageAddTransaction === 'function') {
        initPageAddTransaction();
      }
    }
  } else if (hash.startsWith('#/account/')) {
    const accId = hash.replace('#/account/', '').trim();
    if (accountView) {
      accountView.classList.remove('hidden');
      if (typeof renderAccountDetailsPage === 'function') {
        renderAccountDetailsPage(accId, typeof activeAccountDetailsRange !== 'undefined' ? activeAccountDetailsRange : 'all');
      }
    }
  } else {
    if (dashboardView) {
      dashboardView.classList.remove('hidden');
      if (typeof activeAccountDetailsId !== 'undefined') {
        activeAccountDetailsId = null;
      }
      if (typeof refreshDashboard === 'function') {
        refreshDashboard();
      }
    }
  }
}
