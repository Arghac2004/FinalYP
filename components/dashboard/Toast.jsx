"use client";

import React from 'react';
import { useFinTrack } from '@/context/FinTrackContext';
import {
  CheckCircle2,
  Trash2,
  Edit3,
  Settings,
  AlertCircle,
  Info,
  Sparkles,
  CreditCard,
  ArrowRightLeft
} from 'lucide-react';

const TOAST_ICONS = {
  check: CheckCircle2,
  success: CheckCircle2,
  trash: Trash2,
  delete: Trash2,
  edit: Edit3,
  settings: Settings,
  alert: AlertCircle,
  error: AlertCircle,
  info: Info,
  sparkles: Sparkles,
  card: CreditCard,
  currency: ArrowRightLeft,
};

const Toast = () => {
  const { toast } = useFinTrack();

  if (!toast.visible) return null;

  const IconComp = TOAST_ICONS[toast.type || toast.iconType] || CheckCircle2;

  return (
    <div id="toast" className="fixed bottom-20 sm:bottom-6 right-6 z-50 animate-fadeIn">
      <div className="bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl border border-slate-700/50 flex items-center gap-2.5">
        <IconComp className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>{toast.message || 'Updated successfully'}</span>
      </div>
    </div>
  );
};

export default Toast;
