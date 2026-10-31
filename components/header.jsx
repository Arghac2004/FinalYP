"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Sun, Moon, LayoutDashboard } from 'lucide-react';
import { useFinTrack } from '@/context/FinTrackContext';

const Header = () => {
  const { theme, setTheme } = useFinTrack();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = theme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <header className="fixed top-0 w-full z-50">
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-white/80 dark:bg-slate-950/85 backdrop-blur-xl border-b border-slate-200/70 dark:border-white/[0.07] shadow-sm dark:shadow-black/20" />

      <nav className="relative container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0 group flex items-center gap-2">
          <Image
            src="/logoo.png"
            alt="Rupee Radar"
            width={160}
            height={48}
            priority
            className="h-9 w-auto object-contain group-hover:opacity-75 transition-opacity duration-200"
          />
          <span className="hidden md:inline font-black tracking-tight text-base text-slate-900 dark:text-white">
            RUPEE <span className="text-blue-600">RADAR</span>
          </span>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-2.5">
          {/* Dashboard Link / Icon */}
          <Link
            href="/dashboard"
            aria-label="Dashboard"
            title="Dashboard"
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-blue-500/30 transition-all duration-200"
          >
            <LayoutDashboard size={16} className="text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={mounted && isDark ? 'Light Mode' : 'Dark Mode'}
            title={mounted && isDark ? 'Light Mode' : 'Dark Mode'}
            className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-all duration-200"
          >
            {mounted ? (
              isDark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />
            ) : (
              <Moon size={16} />
            )}
          </button>

          {/* Divider */}
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700" />

          {/* Signed In - only avatar */}
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9 rounded-xl ring-2 ring-slate-200 dark:ring-slate-700",
                },
              }}
            />
          </SignedIn>

          {/* Signed Out - login button */}
          <SignedOut>
            <SignInButton forceRedirectUrl="/dashboard">
              <button
                type="button"
                className="h-9 px-4 rounded-xl text-sm font-semibold cursor-pointer bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 transition-all duration-200"
              >
                Login
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </nav>
    </header>
  );
};

export default Header;