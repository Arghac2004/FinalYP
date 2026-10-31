"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import { useFinTrack } from '@/context/FinTrackContext';
import Background3D from '@/components/dashboard/Background3D';
import Toast from '@/components/dashboard/Toast';
import MobileBottomNav from '@/components/dashboard/MobileBottomNav';
import { Button } from '@/components/ui/button';
import { loadRazorpay, initRazorpayRibbonRemover } from '@/lib/loadRazorpay';
import CategoryIcon from '@/components/CategoryIcon';
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Lock,
  Zap,
  CreditCard,
  Building2,
  Loader2,
  AlertCircle,
  Pencil
} from 'lucide-react';

const QUICK_AMOUNTS = [100, 300, 500, 1000, 2000];

const SMART_MERCHANTS = {
  Groceries: 'Reliance Smart / Blinkit Quick',
  Shopping: 'Amazon India / Myntra',
  Dining: 'Zomato / Swiggy Dineout',
  Utilities: 'Tata Power / Adani Electricity',
  Transport: 'Uber India / Ola Cabs',
  Subscriptions: 'Netflix / Spotify India',
  Other: 'UPI Merchant Store',
};

const AddTransactionContent = () => {
  const router = useRouter();
  const { accounts, addTransaction, formatCurrency, currency, showToast } = useFinTrack();

  const [entryMode, setEntryMode] = useState('gateway'); // 'gateway' | 'manual'
  const [type, setType] = useState('expense');
  const [description, setDescription] = useState('Grocery Shopping');
  const [amount, setAmount] = useState('500');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Groceries');
  const [merchantName, setMerchantName] = useState(SMART_MERCHANTS.Groceries);
  const [account, setAccount] = useState(() => {
    const def = accounts.find((a) => a.isDefault);
    return def ? def.id : (accounts[0]?.id || 'personal');
  });

  const [isProcessingPay, setIsProcessingPay] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAmountChange = (e) => {
    const val = e.target.value;
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      setAmount(val);
    }
  };

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    setMerchantName(SMART_MERCHANTS[newCat] || `${newCat} Store`);
    if (!description || description.endsWith('Shopping') || description.endsWith('Expense')) {
      setDescription(`${newCat} Shopping`);
    }
  };

  const selectedAccountObj = accounts.find((a) => a.id === account);
  const accountNameDisplay = selectedAccountObj ? selectedAccountObj.name : 'Account';
  const numAmount = parseFloat(amount) || 0;

  // Manual Form Submission
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!description.trim() || isNaN(numAmount) || numAmount <= 0) return;

    addTransaction({
      description: description.trim(),
      amount: numAmount,
      type,
      category,
      account,
      date,
      merchantName: merchantName.trim() || description.trim(),
      paymentMethod: 'Manual Entry (Cash/Transfer)',
      paymentProvider: 'offline',
      paymentStatus: 'success',
    });

    router.push('/dashboard');
  };

  // Payment Gateway Auto-Add Submission
  const handleGatewayPayment = async (e) => {
    e.preventDefault();
    if (!description.trim() || isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Please enter a valid amount greater than 0.');
      return;
    }

    setIsProcessingPay(true);
    setErrorMsg('');

    try {
      // 1. Create order on unified /api/payment endpoint
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numAmount,
          category,
          description: description.trim(),
          merchantName: merchantName.trim() || `${category} Store`,
        }),
      });

      const orderData = await res.json();
      if (!res.ok || !orderData.success) {
        throw new Error(orderData.message || 'Failed to create payment order');
      }

      // 2. Load Razorpay SDK and initialize ribbon remover
      const isLoaded = await loadRazorpay();
      initRazorpayRibbonRemover();

      if (isLoaded && window.Razorpay && !orderData.orderId.startsWith('order_mock_')) {
        const options = {
          key: orderData.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TlIO8sUg8ow0E4',
          amount: orderData.amount,
          currency: orderData.currency || 'INR',
          name: 'Rupee Radar Payment',
          description: description || `${category} Purchase`,
          order_id: orderData.orderId,
          prefill: {
            name: 'Rupee Radar User',
            email: 'user@rupeeradar.in',
            contact: '9876543210',
          },
          theme: { color: '#2563EB' },
          handler: async function (response) {
            await verifyAndSavePayment({
              action: 'verify',
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
              amount: numAmount,
              category,
              description,
              account,
              merchantName,
              paymentMethod: 'UPI / Razorpay Gateway',
            });
          },
          modal: {
            ondismiss: function () {
              setIsProcessingPay(false);
              showToast('Payment cancelled', 'info');
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp) {
          setErrorMsg(resp.error?.description || 'Payment failed on Razorpay');
          setIsProcessingPay(false);
        });
        rzp.open();
      } else {
        // Simulated instant payment checkout
        const simulatedPaymentId = `pay_rr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        await verifyAndSavePayment({
          razorpayPaymentId: simulatedPaymentId,
          razorpayOrderId: orderData.orderId,
          razorpaySignature: 'simulated_valid_signature',
          amount: numAmount,
          category,
          description,
          account,
          merchantName,
          paymentMethod: 'UPI / Razorpay (Auto-Verified)',
        });
      }
    } catch (err) {
      console.error('Payment error:', err);
      setErrorMsg(err.message || 'Failed to process payment');
      setIsProcessingPay(false);
    }
  };

  const verifyAndSavePayment = async (verifyPayload) => {
    try {
      const verifyRes = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verifyPayload),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(verifyData.message || 'Verification failed');
      }

      const savedTx = verifyData.transaction;
      if (addTransaction && savedTx) {
        addTransaction(savedTx);
      }

      showToast(`Payment of ₹${verifyPayload.amount} successful! Auto-added to ledger.`, 'check');
      setIsProcessingPay(false);
      router.push('/dashboard');
    } catch (err) {
      console.error('Verify error:', err);
      setErrorMsg(err.message || 'Payment verification failed');
      setIsProcessingPay(false);
    }
  };

  return (
    <div className="min-h-screen relative text-slate-900 dark:text-slate-100 pt-24 pb-20">
      <Background3D />

      <main className="w-full flex-1 px-4 sm:px-6 lg:px-12 py-4 max-w-[1200px] mx-auto relative z-10 animate-fadeIn">
        {/* Top Back Navigation */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <Link href="/dashboard">
            <button
              type="button"
              className="btn-3d flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold hover:text-blue-600 transition-all cursor-pointer shadow-xs"
            >
              <ArrowLeft size={16} />
              <span>Back to Dashboard</span>
            </button>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">
              Rupee Radar • Ledger & Gateway
            </span>
          </div>
        </div>

        {/* 3D Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Left: Form Card */}
          <div className="lg:col-span-7 tilt-card bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            
            {/* Mode Switcher Tabs */}
            <div className="mb-6">
              <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setEntryMode('gateway')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    entryMode === 'gateway'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Zap size={15} className={entryMode === 'gateway' ? 'text-amber-300 fill-amber-300' : ''} />
                  <span>Pay via Gateway (Auto-Track)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEntryMode('manual')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    entryMode === 'manual'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Pencil size={13} />
                  <span>Manual Entry</span>
                </button>
              </div>
            </div>

            <div className="depth-layer mb-6">
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {entryMode === 'gateway' ? 'Instant Payment & Auto-Add' : 'Manual Ledger Entry'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {entryMode === 'gateway'
                  ? 'Make a purchase through Razorpay UPI/Card and have it automatically recorded with an online bill.'
                  : 'Manually record an offline expense or income into your selected ledger account.'}
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={entryMode === 'gateway' ? handleGatewayPayment : handleManualSubmit} className="space-y-4 sm:space-y-5 text-xs">
              
              {/* Type Switch (Manual Mode Only) */}
              {entryMode === 'manual' && (
                <div className="depth-layer-sm">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">Transaction Type</label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setType('expense')}
                      className={`py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        type === 'expense'
                          ? 'bg-red-500 text-white shadow-md'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Expense
                    </button>
                    <button
                      type="button"
                      onClick={() => setType('income')}
                      className={`py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        type === 'income'
                          ? 'bg-emerald-500 text-white shadow-md'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Income
                    </button>
                  </div>
                </div>
              )}

              {/* Amount Input with Quick Preset Chips */}
              <div className="depth-layer-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">
                    Amount ({currency?.symbol || '₹'})
                  </label>
                  <span className="text-[10px] text-slate-400 font-semibold">{currency?.name || 'Indian Rupee'}</span>
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-base font-bold text-slate-400">
                    {currency?.symbol || '₹'}
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="500"
                    required
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all text-sm font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800"
                  />
                </div>
                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className="text-[10px] text-slate-400 mr-1 font-semibold">Quick:</span>
                  {QUICK_AMOUNTS.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(String(val))}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        amount === String(val)
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      ₹{val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="depth-layer-sm">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Description / Item
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Grocery Shopping, Dinner, Rent"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800"
                />
              </div>

              {/* Category & Merchant Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 depth-layer-sm">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 cursor-pointer"
                  >
                    <option value="Groceries">Groceries</option>
                    <option value="Housing">Housing / Rent</option>
                    <option value="Transport">Transport</option>
                    <option value="Subscriptions">Subscriptions</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Dining">Food & Dining</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Salary">Salary / Income</option>
                    <option value="Investments">Investments</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Merchant / Store</label>
                  <input
                    type="text"
                    value={merchantName}
                    onChange={(e) => setMerchantName(e.target.value)}
                    placeholder="e.g. Reliance Fresh"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Account Selector */}
              <div className="depth-layer-sm">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Ledger Account</label>
                <select
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 cursor-pointer"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 depth-layer">
                {entryMode === 'gateway' ? (
                  <button
                    type="submit"
                    disabled={isProcessingPay}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-blue-500/25 transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isProcessingPay ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Connecting to Razorpay Gateway...</span>
                      </>
                    ) : (
                      <>
                        <Zap size={18} className="text-amber-300 fill-amber-300" />
                        <span>Pay ₹{numAmount || 0} via Razorpay & Auto-Add</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="btn-3d w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 size={18} />
                    <span>Save Transaction</span>
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Right: Live Preview */}
          <div className="lg:col-span-5 space-y-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              Live Bill & Ledger Preview
            </div>

            {/* 3D Card Live Preview */}
            <div id="live-3d-card" className="tilt-card account-3d-card p-6 sm:p-7 rounded-3xl min-h-[240px] flex flex-col justify-between transition-all">
              <div className="flex items-start justify-between depth-layer">
                <div>
                  <span
                    className={`inline-block text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md border shadow-xs ${
                      type === 'expense'
                        ? 'bg-red-100 dark:bg-red-950/60 text-red-600 border-red-200 dark:border-red-900'
                        : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 border-emerald-200 dark:border-emerald-900'
                    }`}
                  >
                    {entryMode === 'gateway' ? 'UPI Gateway Payment' : type === 'expense' ? 'Expense' : 'Income'}
                  </span>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-2">{accountNameDisplay}</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="card-chip" title="EMV Secured"></div>
                </div>
              </div>

              {/* Live Amount Display */}
              <div className="my-4 depth-layer">
                <span className="text-xs text-slate-400 font-medium">Payment Amount</span>
                <div className="text-3xl font-black tracking-tight mt-0.5 text-blue-600 dark:text-blue-400">
                  {formatCurrency(numAmount)}
                </div>
              </div>

              {/* Bottom Details */}
              <div className="pt-4 border-t border-slate-200/60 dark:border-slate-700 flex items-center justify-between text-xs depth-layer-sm">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 inline-flex items-center gap-1.5">
                    <CategoryIcon category={category} size={14} className="text-blue-500" />
                    <span>{category}</span>
                  </span>
                  <p className="text-[11px] text-slate-400 truncate max-w-[180px]">
                    {merchantName || description || 'New Purchase'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-semibold text-slate-500">{date}</span>
                </div>
              </div>
            </div>

            {/* Sync Info Box */}
            <div className="tilt-card bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center font-bold text-base flex-shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div className="text-[11px] text-slate-500 leading-snug">
                <strong className="text-slate-800 dark:text-slate-200 font-semibold block">Automatic Digital Bill Generation</strong>
                Every payment completed through Rupee Radar generates an online invoice receipt that you can view, print, or download anytime by double-clicking on the transaction.
              </div>
            </div>
          </div>
        </div>
      </main>

      <Toast />
      <MobileBottomNav />
    </div>
  );
};

export default function CreateTransactionPage() {
  return (
    <>
      <SignedIn>
        <AddTransactionContent />
      </SignedIn>
      <SignedOut>
        <div className="min-h-screen flex flex-col items-center justify-center pt-28 px-4 text-center">
          <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mx-auto">
              <Lock size={28} />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Authentication Required</h2>
            <p className="text-xs text-slate-500">
              Please sign in to record transactions with Rupee Radar.
            </p>
            <div className="pt-2">
              <SignInButton forceRedirectUrl="/transaction/create">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl">
                  Sign In to Continue
                </Button>
              </SignInButton>
            </div>
          </div>
        </div>
      </SignedOut>
    </>
  );
}
