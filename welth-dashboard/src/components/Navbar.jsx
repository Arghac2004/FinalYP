import React, { useState, useEffect } from 'react';
import { useFinTrack } from '../context/FinTrackContext';

const Navbar = ({ navigateTo }) => {
  const { profile, setIsProfileModalOpen } = useFinTrack();
  const [dateTime, setDateTime] = useState({ date: '-- --- ----', time: '--:--:--' });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const dateOptions = { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' };
      const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
      setDateTime({
        date: now.toLocaleDateString('en-US', dateOptions),
        time: now.toLocaleTimeString('en-US', timeOptions),
      });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const fullName = profile.firstName || profile.lastName
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : 'Profile';

  const initials = profile.firstName
    ? `${profile.firstName[0] || ''}${profile.lastName[0] || ''}`.toUpperCase()
    : 'U';

  return (
    <header className="w-full bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-12 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Left: Brand Logo & Live Date/Time */}
      <div className="flex flex-col">
        <button
          type="button"
          onClick={() => navigateTo('#/')}
          className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 flex items-center cursor-pointer leading-tight text-left"
        >
          <span className="text-primary">Fin</span>Track
        </button>
        <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-slate-400 mt-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{dateTime.date}</span>
          <span className="text-slate-300">•</span>
          <span className="font-semibold text-slate-600 dark:text-slate-300">{dateTime.time}</span>
        </div>
      </div>

      {/* Right: Actions & User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Add Transaction Button */}
        <button
          type="button"
          onClick={() => navigateTo('#/add-transaction')}
          className="btn-3d flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span className="hidden sm:inline">Add Transaction</span>
          <span className="sm:hidden font-bold">Add</span>
        </button>

        {/* Search Icon */}
        <button
          type="button"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Search"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </button>

        {/* Bell Notification Icon */}
        <button
          type="button"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Notifications"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        </button>

        {/* User Avatar (Opens Profile Modal) */}
        <button
          type="button"
          onClick={() => setIsProfileModalOpen(true)}
          title="View Profile"
          className="flex items-center gap-1.5 sm:gap-2 pl-1 pr-2 sm:pr-2.5 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-900 dark:bg-primary text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {profile.firstName ? initials : (
              <svg className="w-3.5 h-3.5 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            )}
          </div>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 hidden md:inline">{fullName}</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
