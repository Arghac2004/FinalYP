"use client";

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useFinTrack } from '@/context/FinTrackContext';

const MobileBottomNav = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { setIsProfileModalOpen } = useFinTrack();

  const isHome = pathname === '/dashboard';
  const isPayment = pathname === '/payment';
  const isAddTx = pathname === '/transaction/create';

  return (
    <nav className="mobile-bottom-dock md:hidden">
      <div className="grid grid-cols-4 h-16 items-center px-2">
        {/* 1. Dashboard */}
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 transition-transform ${isHome ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
          title="Dashboard"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          <span className="text-[10px]">Dashboard</span>
        </button>

        {/* 2. Payment Gateway */}
        <button
          type="button"
          onClick={() => router.push('/payment')}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 transition-transform ${isPayment ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
          title="Payment Gateway"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
          <span className="text-[10px]">Pay Gateway</span>
        </button>

        {/* 3. Add Transaction */}
        <button
          type="button"
          onClick={() => router.push('/transaction/create')}
          className="flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95 transition-transform"
          title="Add Transaction"
        >
          <div className={`w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg -mt-5 border-2 border-white dark:border-slate-900 shadow-blue-500/30 ${isAddTx ? 'ring-2 ring-blue-600 ring-offset-2' : ''}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <span className="text-[10px] font-bold text-blue-600">Add</span>
        </button>

        {/* 4. Profile / Settings */}
        <button
          type="button"
          onClick={() => setIsProfileModalOpen(true)}
          className="flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer active:scale-95 transition-transform"
          title="Settings"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          <span className="text-[10px] font-medium">Settings</span>
        </button>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
