/**
 * modals.js — FinTrack Modal Windows & Dialogs
 * Handles Create Account 3D Sheet, Profile & Settings Modal, and Budget Modal.
 */

/* ═══════════════════════ 1. CREATE ACCOUNT 3D MODAL ═══════════════════════ */

function openCreateAccountModal() {
  const modal = document.getElementById('create-account-modal');
  const card = document.getElementById('create-account-card');
  const currencySelect = document.getElementById('acc-currency');
  if (currencySelect) {
    currencySelect.value = FinTrackDB.getCurrency().code;
  }
  if (modal && card) {
    card.classList.remove('animate-sheet3d-close');
    card.classList.add('animate-sheet3d');
    modal.classList.remove('hidden');
    modal.style.opacity = '0';
    requestAnimationFrame(() => {
      modal.style.transition = 'opacity 0.35s cubic-bezier(0.19, 1, 0.22, 1)';
      modal.style.opacity = '1';
    });
  }
}

function closeCreateAccountModal() {
  const modal = document.getElementById('create-account-modal');
  const card = document.getElementById('create-account-card');
  if (modal && card) {
    card.classList.remove('animate-sheet3d');
    card.classList.add('animate-sheet3d-close');
    modal.style.transition = 'opacity 0.28s ease';
    modal.style.opacity = '0';
    setTimeout(() => {
      modal.classList.add('hidden');
      modal.style.opacity = '1';
      card.classList.remove('animate-sheet3d-close');
      const form = document.getElementById('create-account-form');
      if (form) form.reset();
    }, 280);
  }
}

function handleCreateAccountSubmit(e) {
  e.preventDefault();

  const name = document.getElementById('acc-name').value.trim();
  const type = document.getElementById('acc-type').value;
  const currency = document.getElementById('acc-currency') ? document.getElementById('acc-currency').value : 'USD';
  const initialBalance = parseFloat(document.getElementById('acc-balance').value) || 0;
  const isDefault = document.getElementById('acc-default').checked;

  if (!name) return;

  FinTrackDB.addAccount({
    name,
    type,
    currency,
    initialBalance,
    isDefault,
  });

  if (currency) {
    FinTrackDB.setCurrency(currency);
  }

  closeCreateAccountModal();
  renderProfile();
  refreshDashboard();
  showToast('Account created & Profile updated!', '🎉');
}

/* ═══════════════════════ 2. PROFILE & SETTINGS MODAL ═══════════════════════ */

function renderProfile() {
  const profile = FinTrackDB.getProfile();
  const hasName = profile.firstName || profile.lastName;
  const fullName = hasName ? `${profile.firstName} ${profile.lastName}`.trim() : 'Account';
  
  let initials = 'U';
  if (profile.firstName) {
    initials = `${(profile.firstName[0] || '')}${(profile.lastName[0] || '')}`.toUpperCase();
  }

  // Navbar
  const navName = document.getElementById('nav-name');
  const navAvatar = document.getElementById('nav-avatar');
  if (navName) navName.textContent = fullName;
  if (navAvatar) {
    if (hasName) {
      navAvatar.textContent = initials;
    } else {
      navAvatar.innerHTML = `<svg class="w-4 h-4 text-slate-300" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`;
    }
  }

  // Modal
  const modalName = document.getElementById('profile-modal-name');
  const modalAvatar = document.getElementById('profile-modal-avatar');
  const modalEmail = document.getElementById('profile-modal-email');
  const editFirst = document.getElementById('edit-first-name');
  const editLast = document.getElementById('edit-last-name');

  if (modalName) modalName.textContent = fullName;
  if (modalAvatar) modalAvatar.textContent = initials || 'U';
  if (modalEmail) modalEmail.textContent = profile.email || 'user@fintrack.app';
  if (editFirst) editFirst.value = profile.firstName || '';
  if (editLast) editLast.value = profile.lastName || '';
}

function switchAccountTab(tabName, btn) {
  // Update sidebar buttons
  document.querySelectorAll('.acc-tab-btn').forEach(b => {
    b.className = 'acc-tab-btn w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-white/60 transition-colors';
  });

  if (btn) {
    btn.className = 'acc-tab-btn w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-white text-slate-900 shadow-xs border border-slate-200/60 transition-all';
  } else {
    const targetBtn = document.getElementById(`acc-tab-btn-${tabName}`);
    if (targetBtn) {
      targetBtn.className = 'acc-tab-btn w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-white text-slate-900 shadow-xs border border-slate-200/60 transition-all';
    }
  }

  // Update panels
  const panels = ['profile', 'settings', 'security', 'guidelines', 'privacy'];
  panels.forEach(p => {
    const el = document.getElementById(`acc-panel-${p}`);
    if (el) {
      if (p === tabName) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    }
  });
}

function openProfileModal() {
  renderProfile();
  if (typeof initTheme === 'function') initTheme();
  switchAccountTab('profile', document.getElementById('acc-tab-btn-profile'));
  toggleProfileEdit(false);
  const modal = document.getElementById('profile-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeProfileModal() {
  const modal = document.getElementById('profile-modal');
  if (modal) modal.classList.add('hidden');
  toggleProfileEdit(false);
}

function toggleProfileEdit(showEdit) {
  const viewBox = document.getElementById('profile-view-box');
  const editBox = document.getElementById('profile-edit-box');

  if (showEdit) {
    if (viewBox) viewBox.classList.add('hidden');
    if (editBox) editBox.classList.remove('hidden');
  } else {
    if (viewBox) viewBox.classList.remove('hidden');
    if (editBox) editBox.classList.add('hidden');
  }
}

function saveProfileChanges() {
  const firstName = document.getElementById('edit-first-name').value.trim();
  const lastName = document.getElementById('edit-last-name').value.trim();

  const current = FinTrackDB.getProfile();
  current.firstName = firstName;
  current.lastName = lastName;
  if (!current.email) {
    current.email = `${(firstName || 'user').toLowerCase()}@fintrack.app`;
  }
  FinTrackDB.setProfile(current);

  renderProfile();
  toggleProfileEdit(false);
  showToast('Profile updated successfully!', '👤');
}

/* ═══════════════════════ 3. BUDGET MODAL ═══════════════════════ */

function openBudgetModal() {
  const current = FinTrackDB.getAnnualBudget();
  const input = document.getElementById('budget-input');
  if (input && current > 0) input.value = current;
  const modal = document.getElementById('budget-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeBudgetModal() {
  const modal = document.getElementById('budget-modal');
  if (modal) modal.classList.add('hidden');
}

function handleBudgetSubmit(e) {
  e.preventDefault();
  const val = parseFloat(document.getElementById('budget-input').value);
  if (!isNaN(val) && val >= 0) {
    FinTrackDB.setAnnualBudget(val);
    closeBudgetModal();
    refreshDashboard();
    showToast('Annual budget updated!', '🎯');
  }
}
