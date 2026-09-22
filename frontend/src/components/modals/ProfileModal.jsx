import React, { useState } from 'react';
import { useFinTrack, CURRENCIES } from '../../context/FinTrackContext';

const ProfileModal = () => {
  const {
    isProfileModalOpen,
    setIsProfileModalOpen,
    profile,
    setProfile,
    theme,
    setTheme,
    currencyCode,
    setCurrency,
  } = useFinTrack();

  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(profile.firstName || '');
  const [lastName, setLastName] = useState(profile.lastName || '');

  if (!isProfileModalOpen) return null;

  const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'User Profile';
  const initials = profile.firstName
    ? `${profile.firstName[0] || ''}${profile.lastName[0] || ''}`.toUpperCase()
    : 'U';

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfile({
      ...profile,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: profile.email || `${(firstName.trim() || 'user').toLowerCase()}@fintrack.app`,
    });
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row min-h-[500px] max-h-[92vh]">
        {/* Left Sidebar Tabs */}
        <aside className="w-full md:w-64 bg-slate-50/70 dark:bg-slate-800/50 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 p-4 sm:p-5 flex flex-col justify-between">
          <div className="space-y-4">
            {/* User Info Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200/60 dark:border-slate-700">
              <div className="w-11 h-11 rounded-full bg-slate-900 dark:bg-primary text-white flex items-center justify-center font-bold text-sm shadow-md">
                {initials}
              </div>
              <div className="truncate">
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm tracking-tight truncate">{fullName}</h3>
                <p className="text-[11px] text-slate-400 truncate">{profile.email || 'user@fintrack.app'}</p>
              </div>
            </div>

            {/* Nav Menu */}
            <nav className="flex md:flex-col gap-1 overflow-x-auto scrollbar-none py-1">
              {[
                { id: 'profile', label: 'My Profile', icon: '👤' },
                { id: 'settings', label: 'Settings', icon: '⚙️' },
                { id: 'security', label: 'Security', icon: '🛡️' },
                { id: 'guidelines', label: 'Guidelines', icon: '📜' },
                { id: 'privacy', label: 'Privacy', icon: '🔒' },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsEditing(false);
                    }}
                    className={`whitespace-nowrap flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs border border-slate-200/60 dark:border-slate-600'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="hidden md:block pt-4 border-t border-slate-200/60 dark:border-slate-700 text-[10px] text-slate-400">
            FinTrack v2.0 • Secured
          </div>
        </aside>

        {/* Right Tab Content */}
        <div className="flex-1 p-5 sm:p-7 flex flex-col justify-between overflow-y-auto">
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
            <h2 className="text-base font-bold text-slate-900 capitalize">
              {activeTab === 'profile' ? 'Account Profile' : activeTab}
            </h2>
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(false)}
              className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              {!isEditing ? (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">First Name</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{profile.firstName || 'Not set'}</p>
                    </div>
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Last Name</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{profile.lastName || 'Not set'}</p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Email Address</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{profile.email || 'user@fintrack.app'}</p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFirstName(profile.firstName || '');
                        setLastName(profile.lastName || '');
                        setIsEditing(true);
                      }}
                      className="btn-3d px-4 py-2 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-xs transition-all text-xs cursor-pointer"
                    >
                      ✏️ Edit Profile
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-primary outline-none transition-all text-xs text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-primary outline-none transition-all text-xs text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-3d px-5 py-2 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: SETTINGS (Theme & Currency) */}
          {activeTab === 'settings' && (
            <div className="space-y-6 text-xs">
              {/* Currency Changer */}
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-2">Display Currency</label>
                <select
                  value={currencyCode}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full sm:w-72 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 font-semibold outline-none cursor-pointer hover:border-primary transition-all"
                >
                  {Object.keys(CURRENCIES).map((c) => (
                    <option key={c} value={c}>
                      {c} ({CURRENCIES[c].symbol} - {CURRENCIES[c].name})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">Updates all ledger metrics and currency formats globally.</p>
              </div>

              {/* Theme Selector */}
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-2">Appearance / Theme</label>
                <div className="grid grid-cols-3 gap-3 max-w-md">
                  {[
                    { id: 'light', label: 'Light Mode', icon: '☀️' },
                    { id: 'dark', label: 'Dark Mode', icon: '🌙' },
                    { id: 'system', label: 'System', icon: '💻' },
                  ].map((t) => {
                    const isSelected = theme === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTheme(t.id)}
                        className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-primary bg-primary/5 text-primary font-bold shadow-xs'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span className="text-xl mb-1">{t.icon}</span>
                        <span className="text-xs">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 space-y-1">
                <h4 className="font-bold text-slate-800 dark:text-slate-200">2-Factor Authentication</h4>
                <p className="text-[11px] text-slate-400">Protects your ledger with high-security time-based tokens.</p>
                <span className="inline-block text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded mt-2">
                  Active
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 space-y-1">
                <h4 className="font-bold text-slate-800 dark:text-slate-200">Active Encryption</h4>
                <p className="text-[11px] text-slate-400">AES-256 client-side isolated storage for financial privacy.</p>
              </div>
            </div>
          )}

          {/* TAB 4: GUIDELINES */}
          {activeTab === 'guidelines' && (
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <p className="font-semibold text-slate-800 dark:text-slate-200">FinTrack Community & Ledger Guidelines:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-[11px]">
                <li>Keep personal and commercial/work expenses separated into distinct accounts.</li>
                <li>Set an annual budget target to accurately monitor expense ceilings.</li>
                <li>Regularly review monthly bar charts to detect irregular spending trends.</li>
              </ul>
            </div>
          )}

          {/* TAB 5: PRIVACY */}
          {activeTab === 'privacy' && (
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <p className="font-semibold text-slate-800 dark:text-slate-200">Privacy & Data Retention:</p>
              <p className="text-[11px] leading-relaxed">
                FinTrack processes your transactions locally in your browser storage. No financial numbers or bank credentials are sent to external third-party servers.
              </p>
            </div>
          )}

          {/* Bottom Bar */}
          <div className="pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(false)}
              className="px-5 py-2 bg-slate-900 dark:bg-primary text-white font-bold text-xs rounded-xl shadow-xs hover:bg-slate-800 transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
