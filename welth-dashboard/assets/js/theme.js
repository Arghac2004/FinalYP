/**
 * theme.js — FinTrack Theme System
 * Handles Light Mode, Dark Mode, and System Preference detection.
 */

function initTheme() {
  const mode = FinTrackDB.getTheme();
  applyTheme(mode);
}

function selectAppTheme(mode) {
  FinTrackDB.setTheme(mode);
  applyTheme(mode);
  updateThemeUI(mode);
  const labels = { light: 'Light Mode', dark: 'Dark Mode', system: 'System Mode' };
  showToast(`${labels[mode] || mode} activated`, mode === 'dark' ? '🌙' : mode === 'light' ? '☀️' : '💻');
}

function applyTheme(mode) {
  let isDark = false;
  if (mode === 'dark') {
    isDark = true;
  } else if (mode === 'light') {
    isDark = false;
  } else if (mode === 'system') {
    isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  updateThemeUI(mode);
}

function updateThemeUI(activeMode) {
  const modes = ['light', 'dark', 'system'];
  modes.forEach(m => {
    const btn = document.getElementById(`theme-btn-${m}`);
    if (btn) {
      if (m === activeMode) {
        btn.className = 'theme-card flex flex-col items-center justify-center p-4 rounded-xl border-2 border-primary bg-primary/5 text-slate-800 transition-all cursor-pointer shadow-xs';
      } else {
        btn.className = 'theme-card flex flex-col items-center justify-center p-4 rounded-xl border-2 border-slate-200 hover:border-slate-300 text-slate-800 transition-all cursor-pointer';
      }
    }
  });
}

// Watch system theme change if user selected system mode
if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (FinTrackDB.getTheme() === 'system') {
      applyTheme('system');
    }
  });
}
