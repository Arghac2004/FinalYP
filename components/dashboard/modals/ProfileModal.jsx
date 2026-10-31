"use client";

import React, { useState } from 'react';
import { useFinTrack, CURRENCIES } from '@/context/FinTrackContext';
import {
  User,
  Settings,
  Wallet,
  Shield,
  BookOpen,
  Lock,
  Pencil,
  Sun,
  Moon,
  Monitor,
  Building2,
  CreditCard,
  TrendingUp,
  Landmark,
  Trash2,
  AlertCircle,
  X
} from 'lucide-react';

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
    accounts,
    deleteAccount,
  } = useFinTrack();

  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(profile.firstName || '');
  const [lastName, setLastName] = useState(profile.lastName || '');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

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
    });
    setIsEditing(false);
  };

  const navTabs = [
    { id: 'profile', label: 'My Profile', Icon: User },
    { id: 'settings', label: 'Settings', Icon: Settings },
    { id: 'wallets', label: 'Wallets', Icon: Wallet },
    { id: 'security', label: 'Security', Icon: Shield },
    { id: 'guidelines', label: 'Guidelines', Icon: BookOpen },
    { id: 'privacy', label: 'Privacy', Icon: Lock },
  ];

  const getAccountIcon = (type) => {
    switch (type) {
      case 'Savings Account':
        return Building2;
      case 'Credit Card':
        return CreditCard;
      case 'Investment Account':
        return TrendingUp;
      default:
        return Landmark;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row max-h-[90vh] overflow-hidden transform transition-all">
        {/* Left Sidebar */}
        <aside className="w-full md:w-60 bg-slate-50/80 dark:bg-slate-800/50 p-5 border-b md:border-b-0 md:border-r border-slate-200/60 dark:border-slate-700/80 flex flex-col justify-between">
          <div className="space-y-5">
            {/* User Avatar + Name */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm tracking-tight truncate">{fullName}</h3>
                <p className="text-[11px] text-slate-400 truncate">{profile.email || 'user@rupeeradar.in'}</p>
              </div>
            </div>

            {/* Nav Menu */}
            <nav className="flex md:flex-col gap-1 overflow-x-auto scrollbar-none py-1">
              {navTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const TabIcon = tab.Icon;
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
                    <TabIcon size={15} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="hidden md:block pt-4 border-t border-slate-200/60 dark:border-slate-700 text-[10px] text-slate-400">
            Rupee Radar Dashboard • Secured by Clerk
          </div>
        </aside>

        {/* Right Tab Content */}
        <div className="flex-1 p-5 sm:p-7 flex flex-col justify-between overflow-y-auto">
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white capitalize">
              {activeTab === 'profile' ? 'Account Profile' : activeTab}
            </h2>
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(false)}
              className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              {!isEditing ? (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">First Name</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">{profile.firstName || 'Not set'}</p>
                    </div>
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Last Name</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">{profile.lastName || 'Not set'}</p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Account Email</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">{profile.email || 'user@rupeeradar.in'}</p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFirstName(profile.firstName || '');
                        setLastName(profile.lastName || '');
                        setIsEditing(true);
                      }}
                      className="btn-3d flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-all text-xs cursor-pointer"
                    >
                      <Pencil size={13} />
                      <span>Edit Display Name</span>
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
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-600 outline-none transition-all text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-600 outline-none transition-all text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800"
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
                      className="btn-3d px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer"
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
                  className="w-full sm:w-72 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 font-semibold outline-none cursor-pointer hover:border-blue-600 transition-all"
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
                    { id: 'light', label: 'Light Mode', Icon: Sun },
                    { id: 'dark', label: 'Dark Mode', Icon: Moon },
                    { id: 'system', label: 'System', Icon: Monitor },
                  ].map((t) => {
                    const isSelected = theme === t.id;
                    const ThemeIcon = t.Icon;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTheme(t.id)}
                        className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold shadow-xs'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <ThemeIcon size={20} className="mb-1" />
                        <span className="text-xs">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB: WALLETS — Delete Wallet Option */}
          {activeTab === 'wallets' && (
            <div className="space-y-4 text-xs">
              <p className="text-[11px] text-slate-400">
                Manage your wallets and accounts here. Deleting an account will also permanently remove all its associated transactions.
              </p>

              {accounts.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Wallet size={32} className="mx-auto mb-2 text-slate-400" />
                  No accounts found.
                </div>
              ) : (
                <div className="space-y-3">
                  {accounts.map((acc) => {
                    const AccIcon = getAccountIcon(acc.type);
                    return (
                      <div
                        key={acc.id}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60"
                      >
                        {/* Account Info */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                            <AccIcon size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{acc.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{acc.type} • {acc.currency}</p>
                            {acc.isDefault && (
                              <span className="inline-block text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded mt-0.5">
                                Default
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Delete / Confirm Area */}
                        <div className="flex-shrink-0 ml-3">
                          {confirmDeleteId === acc.id ? (
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-red-500 font-semibold whitespace-nowrap">Are you sure?</span>
                              <button
                                type="button"
                                onClick={() => {
                                  deleteAccount(acc.id);
                                  setConfirmDeleteId(null);
                                }}
                                className="px-2.5 py-1 text-[10px] font-bold bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors cursor-pointer"
                              >
                                Yes, Delete
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2.5 py-1 text-[10px] font-semibold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(acc.id)}
                              disabled={accounts.length <= 1}
                              title={accounts.length <= 1 ? 'At least one account is required' : 'Delete account'}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold
                                text-red-500 hover:text-red-600
                                border border-red-200 dark:border-red-900/60
                                hover:bg-red-50 dark:hover:bg-red-950/40
                                rounded-lg transition-all cursor-pointer
                                disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Trash2 size={13} />
                              <span>Delete</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <p className="text-[10px] text-slate-400 pt-1 flex items-center gap-1">
                <AlertCircle size={13} className="text-amber-500 shrink-0" />
                <span>At least one account must be kept and cannot be deleted.</span>
              </p>
            </div>
          )}

          {/* TAB: SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 space-y-1">
                <h4 className="font-bold text-slate-800 dark:text-slate-200">Clerk Authentication</h4>
                <p className="text-[11px] text-slate-400">Your account is securely protected using industry-standard Clerk Auth with session token verification.</p>
                <span className="inline-block text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded mt-2">
                  Active & Verified
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 space-y-1">
                <h4 className="font-bold text-slate-800 dark:text-slate-200">Local Ledger Storage</h4>
                <p className="text-[11px] text-slate-400">All transaction data is stored directly in your browser&apos;s private local storage space.</p>
              </div>
            </div>
          )}

          {/* TAB 4: GUIDELINES */}
          {activeTab === 'guidelines' && (
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <p className="font-semibold text-slate-800 dark:text-slate-200">Rupee Radar Platform Guidelines:</p>
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
                Rupee Radar processes your transactions locally in your browser storage and secure MongoDB. No financial numbers or bank credentials are sent to unauthorized external servers.
              </p>
            </div>
          )}

          {/* Bottom Bar */}
          <div className="pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(false)}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
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
