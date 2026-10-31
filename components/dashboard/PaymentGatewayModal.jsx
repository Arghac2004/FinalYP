"use client";

import React, { useState, useEffect } from 'react';
import { useFinTrack } from '@/context/FinTrackContext';
import CategoryIcon from '@/components/CategoryIcon';
import { loadRazorpay, initRazorpayRibbonRemover } from '@/lib/loadRazorpay';
import {
  CreditCard,
  Zap,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowLeft,
  Sparkles,
  ShoppingBag,
  Store,
  ShieldCheck,
  Loader2
} from 'lucide-react';

const QUICK_AMOUNTS = [100, 300, 500, 1000, 2500];

const SMART_MERCHANTS = {
  Groceries: 'Reliance Smart / Blinkit Quick',
  Shopping: 'Amazon India / Myntra',
  Dining: 'Zomato / Swiggy Dineout',
  Utilities: 'Tata Power / Adani Electricity',
  Transport: 'Uber India / Ola Cabs',
  Subscriptions: 'Netflix / Spotify India',
  Other: 'UPI Merchant Store',
};

const PaymentGatewayModal = ({ isOpen, onClose, onPaymentSuccess }) => {
  const { accounts, addTransaction, formatCurrency, currency, showToast } = useFinTrack();

  const [amount, setAmount] = useState('500');
  const [category, setCategory] = useState('Groceries');
  const [description, setDescription] = useState('Grocery Shopping');
  const [account, setAccount] = useState(() => accounts[0]?.id || 'personal');
  const [merchantName, setMerchantName] = useState(SMART_MERCHANTS.Groceries);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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

  if (!isOpen) return null;

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    setMerchantName(SMART_MERCHANTS[newCat] || `${newCat} Merchant`);
    if (!description || description.endsWith('Shopping') || description.endsWith('Expense')) {
      setDescription(`${newCat} Shopping`);
    }
  };

  const handlePay = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setErrorMsg('Please enter a valid amount greater than 0.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Create order on Next.js backend
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numAmount,
          category,
          description: description.trim() || `${category} Payment`,
          merchantName: merchantName.trim() || 'UPI Store',
        }),
      });

      const orderData = await res.json();
      if (!res.ok || !orderData.success) {
        throw new Error(orderData.message || 'Failed to create payment order');
      }

      // 2. Load Razorpay SDK and initialize ribbon removal
      const isRzpLoaded = await loadRazorpay();
      initRazorpayRibbonRemover();

      // If Razorpay SDK loaded and we have real/test key
      if (isRzpLoaded && window.Razorpay && !orderData.orderId.startsWith('order_mock_')) {
        const options = {
          key: orderData.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TlIO8sUg8ow0E4',
          amount: orderData.amount,
          currency: orderData.currency || 'INR',
          name: 'Rupee Radar Payment',
          description: description || `${category} Checkout`,
          order_id: orderData.orderId,
          prefill: {
            name: 'Rupee Radar User',
            email: 'user@rupeeradar.in',
            contact: '9876543210',
          },
          theme: {
            color: '#2563EB',
          },
          handler: async function (response) {
            await verifyAndRecordPayment({
              action: 'verify',
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
              amount: numAmount,
              category,
              description,
              account,
              merchantName,
              paymentMethod: 'UPI / Razorpay',
            });
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
              showToast('Payment window closed', 'info');
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp) {
          setErrorMsg(resp.error?.description || 'Payment failed on Razorpay');
          setLoading(false);
        });
        rzp.open();
      } else {
        // Simulated instant payment verification for testing
        const simulatedPaymentId = `pay_rr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        await verifyAndRecordPayment({
          razorpayPaymentId: simulatedPaymentId,
          razorpayOrderId: orderData.orderId,
          razorpaySignature: 'simulated_signature_valid',
          amount: numAmount,
          category,
          description,
          account,
          merchantName,
          paymentMethod: 'UPI (Instant Pay)',
        });
      }
    } catch (err) {
      console.error('Payment checkout error:', err);
      setErrorMsg(err.message || 'An error occurred while initiating payment.');
      setLoading(false);
    }
  };

  const verifyAndRecordPayment = async (verifyPayload) => {
    try {
      const verifyRes = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verifyPayload),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(verifyData.message || 'Payment verification failed');
      }

      // Automatically add to local state
      const savedTx = verifyData.transaction;
      if (addTransaction && savedTx) {
        addTransaction(savedTx);
      }

      showToast(`Payment of ₹${verifyPayload.amount} successful! Auto-recorded.`, 'check');
      setLoading(false);
      onClose();

      if (onPaymentSuccess && savedTx) {
        onPaymentSuccess(savedTx);
      }
    } catch (err) {
      console.error('Verify error:', err);
      setErrorMsg(err.message || 'Payment could not be verified.');
      setLoading(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        // Close on backdrop click
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden transform transition-all">
        
        {/* Modal Header with prominent Back & Close */}
        <div className="px-5 sm:px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-xs"
            title="Go back to Dashboard (Esc)"
          >
            <ArrowLeft size={15} />
            <span>Back to Dashboard</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-white/80 hover:text-white hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X size={17} />
          </button>
        </div>

        {/* Payment Form (Scrollable) */}
        <form onSubmit={handlePay} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
          
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold">
              <Zap size={16} className="text-blue-600 fill-blue-600" />
            </span>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                Rupee Radar Payment Gateway
              </h3>
              <p className="text-[11px] text-slate-400">
                Razorpay UPI & Instant Auto-Track
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Amount Input & Quick Chips */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Payment Amount ({currency?.symbol || '₹'})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-base text-slate-400">
                {currency?.symbol || '₹'}
              </span>
              <input
                type="number"
                step="any"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="500"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none text-base font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800"
              />
            </div>

            {/* Quick Amount Chips */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {QUICK_AMOUNTS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(String(val))}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    amount === String(val)
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  ₹{val}
                </button>
              ))}
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Groceries', 'Shopping', 'Dining', 'Utilities', 'Transport', 'Subscriptions'].map((cat) => {
                const isSel = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryChange(cat)}
                    className={`p-2.5 rounded-xl text-center border transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      isSel
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <span className="flex items-center justify-center">
                      <CategoryIcon category={cat} size={18} className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </span>
                    <span className="text-[11px] leading-none">{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description & Merchant Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Item / Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Grocery Shopping"
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-600 outline-none text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Merchant / Store
              </label>
              <input
                type="text"
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                placeholder="e.g. Reliance Fresh"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-600 outline-none text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          {/* Account selector */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Deduct from Ledger Account
            </label>
            <select
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-600 outline-none text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 cursor-pointer"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.type})
                </option>
              ))}
            </select>
          </div>

          {/* Security & Auto-add Notice */}
          <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/60 text-[11px] text-blue-700 dark:text-blue-300 flex items-start gap-2">
            <ShieldCheck size={16} className="flex-shrink-0 text-blue-600 mt-0.5" />
            <div>
              <p className="font-bold">Instant Automatic Ledger Entry</p>
              <p className="text-blue-600/80 dark:text-blue-400/80 mt-0.5">
                Once payment is completed, the transaction will automatically record in your dashboard with an online bill receipt!
              </p>
            </div>
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3.5 rounded-xl font-bold text-xs border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel / Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3.5 px-4 rounded-xl font-extrabold text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Zap size={16} className="text-amber-300 fill-amber-300" />
                  <span>Pay ₹{amount || 0} via Razorpay</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default PaymentGatewayModal;
