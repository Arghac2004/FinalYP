import React from 'react';
import { useFinTrack } from '../context/FinTrackContext';

const Toast = () => {
  const { toast } = useFinTrack();

  if (!toast.visible) return null;

  return (
    <div id="toast" className="fixed bottom-20 sm:bottom-6 right-6 z-50 animate-fadeIn">
      <div className="bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl border border-slate-700/50 flex items-center gap-2.5">
        <span className="text-base">{toast.icon || '✅'}</span>
        <span>{toast.message || 'Updated successfully'}</span>
      </div>
    </div>
  );
};

export default Toast;
