"use client";

import React, { useRef, useEffect } from 'react';
import { useFinTrack } from '@/context/FinTrackContext';
import CategoryIcon from '@/components/CategoryIcon';
import {
  CheckCircle2,
  Printer,
  Copy,
  Download,
  ArrowLeft,
  MapPin,
  Clock,
  Calendar,
  Building2,
  ShieldCheck,
  X,
} from 'lucide-react';

const InvoiceModal = ({ isOpen, onClose, transaction }) => {
  const { formatCurrency, showToast } = useFinTrack();
  const printRef = useRef(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !transaction) return null;

  const isIncome = transaction.type === 'income';

  // Calculate pricing breakdown
  const amount = Number(transaction.amount) || 0;
  const isGstApplicable = !isIncome && amount > 0;
  const baseAmount = isGstApplicable ? Math.round((amount / 1.05) * 100) / 100 : amount;
  const gstAmount = isGstApplicable ? Math.round((amount - baseAmount) * 100) / 100 : 0;

  const receiptNumber = transaction.receiptNumber || `RR-${(transaction.id || Date.now().toString()).slice(-6).toUpperCase()}`;
  const paymentTime = transaction.time || new Date(transaction.createdAt || Date.now()).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  const paymentDate = transaction.date || new Date().toISOString().split('T')[0];
  const merchantName = transaction.merchantName || (transaction.category === 'Groceries' ? 'Reliance Smart / Blinkit' : `${transaction.description || 'Retail Store'}`);
  const merchantLocation = transaction.merchantLocation || 'Mumbai, Maharashtra, India';
  const paymentMethod = transaction.paymentMethod || 'UPI (Razorpay Gateway)';
  const paymentId = transaction.razorpayPaymentId || `pay_rzp_${(transaction.id || '987654').slice(-8)}`;
  const orderId = transaction.razorpayOrderId || `order_rr_${(transaction.id || '123456').slice(-8)}`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyReceiptId = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(receiptNumber);
      showToast('Receipt number copied!', 'check');
    }
  };

  return (
    <div
      onClick={(e) => {
        // Close on clicking backdrop
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden transform transition-all">
        
        {/* Sticky Top Bar with prominent Back & Close button */}
        <div className="px-5 sm:px-6 py-3.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between print:hidden flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200/80 dark:bg-slate-700/80 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white text-slate-800 dark:text-slate-100 font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-xs"
            title="Go back to Dashboard (Esc)"
          >
            <ArrowLeft size={15} />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Print Receipt"
            >
              <Printer size={16} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-200/60 dark:bg-slate-700/60 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 dark:hover:text-white flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Bill Container */}
        <div ref={printRef} className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 text-slate-800 dark:text-slate-200">
          
          {/* Header & Logo */}
          <div className="flex items-start justify-between border-b border-slate-200/80 dark:border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md">
                  ₹
                </span>
                <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  RUPEE <span className="text-blue-600">RADAR</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Official UPI & Payment Gateway Transaction Receipt
              </p>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800">
                <ShieldCheck size={13} />
                PAID & VERIFIED
              </span>
              <p className="text-[10px] text-slate-400 font-mono mt-1.5">
                {receiptNumber}
              </p>
            </div>
          </div>

          {/* Amount Paid Callout */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-50/70 dark:from-slate-800/80 dark:via-blue-950/30 dark:to-slate-800/80 border border-blue-100 dark:border-slate-700/80 text-center relative overflow-hidden">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isIncome ? 'Amount Received' : 'Total Amount Paid'}
            </span>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white my-1 tracking-tight">
              {formatCurrency(amount)}
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 size={14} />
              <span>Payment Successful via Razorpay Gateway</span>
            </div>
          </div>

          {/* Payment & Location Meta Grid */}
          <div className="grid grid-cols-2 gap-3.5 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Calendar size={13} />
                <span className="text-[10px] uppercase font-bold tracking-wider">Date</span>
              </div>
              <p className="font-bold text-slate-800 dark:text-slate-200">{paymentDate}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Clock size={13} />
                <span className="text-[10px] uppercase font-bold tracking-wider">Time</span>
              </div>
              <p className="font-bold text-slate-800 dark:text-slate-200">{paymentTime}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Building2 size={13} />
                <span className="text-[10px] uppercase font-bold tracking-wider">Merchant / Paid To</span>
              </div>
              <p className="font-bold text-slate-800 dark:text-slate-200 truncate" title={merchantName}>
                {merchantName}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <MapPin size={13} />
                <span className="text-[10px] uppercase font-bold tracking-wider">Payment Location</span>
              </div>
              <p className="font-bold text-slate-800 dark:text-slate-200 truncate" title={merchantLocation}>
                {merchantLocation}
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
            <div className="px-4 py-2.5 bg-slate-100/70 dark:bg-slate-800/80 font-bold text-slate-600 dark:text-slate-300 flex justify-between">
              <span>Item / Description</span>
              <span>Amount</span>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <CategoryIcon category={transaction.category} size={15} className="text-blue-600 dark:text-blue-400" />
                    <span>{transaction.description || 'Transaction Item'}</span>
                  </p>
                  <p className="text-[11px] text-slate-400">Category: {transaction.category || 'General'}</p>
                </div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatCurrency(baseAmount)}
                </span>
              </div>

              {isGstApplicable && (
                <div className="flex justify-between items-center text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span>GST / Tax (5% included)</span>
                  <span>{formatCurrency(gstAmount)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-sm font-extrabold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>Grand Total</span>
                <span className="text-blue-600 dark:text-blue-400">{formatCurrency(amount)}</span>
              </div>
            </div>
          </div>

          {/* Gateway Technical References */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-[11px] space-y-1 font-mono text-slate-500 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Method:</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span>Razorpay Payment ID:</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{paymentId}</span>
            </div>
            <div className="flex justify-between">
              <span>Razorpay Order ID:</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{orderId}</span>
            </div>
          </div>
        </div>

        {/* Sticky Modal Bottom Bar with prominent Back Button */}
        <div className="px-5 sm:px-6 py-3.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 print:hidden flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-200/80 dark:bg-slate-700/80 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-xs"
          >
            <ArrowLeft size={14} />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyReceiptId}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <Copy size={13} />
              <span className="hidden sm:inline">Copy #</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Download size={14} />
              <span>Print Bill</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InvoiceModal;
