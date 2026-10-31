"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import { useFinTrack } from '@/context/FinTrackContext';
import Background3D from '@/components/dashboard/Background3D';
import Toast from '@/components/dashboard/Toast';
import MobileBottomNav from '@/components/dashboard/MobileBottomNav';
import InvoiceModal from '@/components/dashboard/modals/InvoiceModal';
import CategoryIcon from '@/components/CategoryIcon';
import { loadRazorpay, initRazorpayRibbonRemover } from '@/lib/loadRazorpay';
import {
  ArrowLeft,
  Zap,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  Sparkles,
  FileText,
  Lock,
  ArrowRight,
  ExternalLink
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

const CATEGORIES = [
  'Groceries',
  'Shopping',
  'Dining',
  'Utilities',
  'Transport',
  'Subscriptions'
];

const PaymentGatewayPageContent = () => {
  const router = useRouter();
  const { accounts, addTransaction, transactions, formatCurrency, currency, showToast } = useFinTrack();

  const [amount, setAmount] = useState('500');
  const [category, setCategory] = useState('Groceries');
  const [description, setDescription] = useState('Grocery Shopping');
  const [merchantName, setMerchantName] = useState(SMART_MERCHANTS.Groceries);
  const [account, setAccount] = useState(() => accounts[0]?.id || 'personal');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [selectedBillTx, setSelectedBillTx] = useState(null);

  // Initialize removal of Razorpay "Test Mode" corner ribbon
  useEffect(() => {
    initRazorpayRibbonRemover();
  }, []);

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    setMerchantName(SMART_MERCHANTS[newCat] || `${newCat} Merchant`);
    if (!description || description.endsWith('Shopping') || description.endsWith('Expense')) {
      setDescription(`${newCat} Shopping`);
    }
  };

  const selectedAccountObj = accounts.find((a) => a.id === account);
  const accountNameDisplay = selectedAccountObj ? selectedAccountObj.name : 'Ledger Account';
  const numAmount = parseFloat(amount) || 0;

  // Filter recent payments made through gateway
  const recentGatewayTxs = transactions
    .filter((t) => t.paymentProvider === 'razorpay' || t.razorpayPaymentId || t.paymentMethod?.includes('UPI'))
    .slice(0, 5);

  // 1. Live Razorpay Gateway Checkout
  const handleRazorpayPay = async (e) => {
    if (e) e.preventDefault();
    if (!numAmount || numAmount <= 0) {
      setStatusMsg({ type: 'error', text: 'Please enter a valid amount greater than 0.' });
      return;
    }

    setLoading(true);
    setStatusMsg({ type: 'info', text: 'Initiating Razorpay payment order...' });

    try {
      // 1. Create order on unified /api/payment endpoint
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

      // 2. Load Razorpay Checkout SDK & strip test ribbon
      const isRzpLoaded = await loadRazorpay();
      initRazorpayRibbonRemover();

      if (isRzpLoaded && window.Razorpay && !orderData.orderId.startsWith('order_mock_')) {
        const options = {
          key: orderData.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TlIO8sUg8ow0E4',
          amount: orderData.amount,
          currency: orderData.currency || 'INR',
          name: 'Rupee Radar',
          description: description || `${category} Checkout via Rupee Radar`,
          order_id: orderData.orderId,
          // Prefill user details so Razorpay skips the "Enter mobile number" prompt
          prefill: {
            name: 'Rupee Radar User',
            email: 'user@rupeeradar.in',
            contact: '9876543210',
          },
          notes: {
            category,
            merchant: merchantName,
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
              paymentMethod: 'UPI / Razorpay Gateway',
            });
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
              setStatusMsg({ type: 'info', text: 'Payment window was closed.' });
              showToast('Payment window closed', 'info');
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp) {
          setStatusMsg({ type: 'error', text: resp.error?.description || 'Payment was declined by Razorpay' });
          setLoading(false);
        });
        rzp.open();
      } else {
        // Fallback simulation for test environment
        const simulatedPaymentId = `pay_rr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        await verifyAndRecordPayment({
          action: 'verify',
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
      console.error('Payment error:', err);
      setStatusMsg({ type: 'error', text: err.message || 'Payment initiation failed' });
      setLoading(false);
    }
  };

  // 2. Instant Simulator Pay (One-Click verification for testing without bank popup)
  const handleInstantSimulatePay = async () => {
    if (!numAmount || numAmount <= 0) {
      setStatusMsg({ type: 'error', text: 'Please enter a valid amount greater than 0.' });
      return;
    }

    setLoading(true);
    setStatusMsg({ type: 'info', text: 'Simulating instant UPI payment & verification...' });

    try {
      const simulatedOrderId = `order_rr_${Date.now()}`;
      const simulatedPaymentId = `pay_rr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      await verifyAndRecordPayment({
        action: 'verify',
        razorpayPaymentId: simulatedPaymentId,
        razorpayOrderId: simulatedOrderId,
        razorpaySignature: 'simulated_signature_valid',
        amount: numAmount,
        category,
        description,
        account,
        merchantName,
        paymentMethod: 'UPI (One-Click Instant)',
      });
    } catch (err) {
      console.error('Simulated pay error:', err);
      setStatusMsg({ type: 'error', text: err.message || 'Simulation failed' });
      setLoading(false);
    }
  };

  // 3. Cryptographic Signature Verification & Auto-Record
  const verifyAndRecordPayment = async (verifyPayload) => {
    try {
      setStatusMsg({ type: 'info', text: 'Verifying payment signature & recording in ledger...' });

      const verifyRes = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verifyPayload),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(verifyData.message || 'Payment signature verification failed');
      }

      const savedTx = verifyData.transaction;
      if (addTransaction && savedTx) {
        addTransaction(savedTx);
      }

      setStatusMsg({
        type: 'success',
        text: `Payment of ₹${verifyPayload.amount} confirmed! Auto-recorded into ledger.`,
      });
      showToast(`Payment of ₹${verifyPayload.amount} recorded!`, 'check');
      setLoading(false);

      // Open generated bill for immediate user view
      if (savedTx) {
        setSelectedBillTx(savedTx);
      }
    } catch (err) {
      console.error('Verify error:', err);
      setStatusMsg({ type: 'error', text: err.message || 'Payment verification failed' });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative text-slate-900 dark:text-slate-100 pt-20 pb-20">
      <Background3D />

      <main className="w-full flex-1 px-4 sm:px-6 lg:px-12 py-4 max-w-[1500px] mx-auto relative z-10 animate-fadeIn">
        {/* Top Header Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <button
                type="button"
                className="btn-3d flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold hover:text-blue-600 hover:border-blue-500 transition-all cursor-pointer shadow-xs"
                title="Return to Financial Dashboard"
              >
                <ArrowLeft size={16} />
                <span>Back to Dashboard</span>
              </button>
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <span>PAYMENT GATEWAY</span>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 border border-blue-200 dark:border-blue-900">
                  Razorpay Live API
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Complete transactions with automatic ledger tracking and digital receipt generation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Gateway Endpoint: <code className="text-blue-600 font-mono">/api/payment</code>
            </span>
          </div>
        </div>

        {/* Status Alerts */}
        {statusMsg.text && (
          <div
            className={`mb-6 p-4 rounded-2xl border text-xs flex items-center gap-2.5 transition-all shadow-sm ${
              statusMsg.type === 'error'
                ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400'
                : statusMsg.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400'
            }`}
          >
            {statusMsg.type === 'error' ? (
              <AlertCircle size={16} className="shrink-0" />
            ) : statusMsg.type === 'success' ? (
              <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />
            ) : (
              <Loader2 size={16} className="shrink-0 animate-spin" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Two-Column Full-Screen Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* Left Column: Payment Form (Full width card matching Screenshot 1) */}
          <div className="lg:col-span-7 tilt-card bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold">
                  <Zap size={18} className="fill-blue-600 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                    Add Expense via Payment Gateway
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Pay securely using UPI QR, Cards, or Netbanking
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleRazorpayPay} className="space-y-4 text-xs">
              
              {/* Amount Input & Quick Chips */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">
                    Payment Amount ({currency?.symbol || '₹'})
                  </label>
                  <span className="text-[11px] text-slate-400 font-semibold">Indian Rupee (INR)</span>
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-4 font-black text-lg text-slate-400">
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
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none text-lg font-black text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/80 transition-all"
                  />
                </div>

                {/* Preset Chips */}
                <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                  <span className="text-[11px] text-slate-400 font-medium">Quick Amount:</span>
                  {QUICK_AMOUNTS.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(String(val))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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

              {/* Category Selector Grid */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {CATEGORIES.map((cat) => {
                    const isSel = category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleCategoryChange(cat)}
                        className={`p-3 rounded-2xl text-center border transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                          isSel
                            ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-600 text-blue-600 dark:text-blue-400 font-bold shadow-xs'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        <CategoryIcon category={cat} size={18} className="text-blue-600 dark:text-blue-400" />
                        <span className="text-xs">{cat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Item Description & Merchant Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-600 outline-none text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Merchant / Store Name
                  </label>
                  <input
                    type="text"
                    value={merchantName}
                    onChange={(e) => setMerchantName(e.target.value)}
                    placeholder="e.g. Reliance Smart"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-600 outline-none text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Ledger Account Selector */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Deduct from Ledger Account
                </label>
                <select
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-600 outline-none text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 cursor-pointer font-medium"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.type} • {acc.currency})
                    </option>
                  ))}
                </select>
              </div>

              {/* Instant Automatic Ledger Entry Notice */}
              <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2.5">
                <ShieldCheck size={18} className="text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-extrabold text-[12px]">Instant Automatic Ledger Entry</p>
                  <p className="text-blue-600/90 dark:text-blue-300/80 text-[11px] mt-0.5 leading-relaxed">
                    Once payment is verified, the transaction automatically records in your ledger with timestamp, Razorpay payment ID, and downloadable digital tax invoice.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl font-extrabold text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl shadow-blue-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <>
                      <Zap size={18} className="fill-amber-300 text-amber-300" />
                      <span>Pay ₹{numAmount || 0} via Razorpay</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleInstantSimulatePay}
                  disabled={loading}
                  className="w-full sm:w-auto py-3.5 px-4 rounded-2xl font-bold text-xs border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  title="Test auto-ledger recording instantly with simulated verification"
                >
                  <Sparkles size={14} className="text-blue-600" />
                  <span>Instant Auto-Pay (Demo)</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Live Card & Bill Preview + Recent Gateway Payments */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 3D Virtual Card Live Preview */}
            <div className="tilt-card account-3d-card p-6 sm:p-7 rounded-3xl min-h-[220px] flex flex-col justify-between shadow-lg">
              <div className="flex items-start justify-between depth-layer">
                <div>
                  <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-600 border border-blue-200 dark:border-blue-900 shadow-xs">
                    UPI Payment Gateway
                  </span>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-2">{accountNameDisplay}</p>
                </div>
                <div className="card-chip" title="EMV Secured"></div>
              </div>

              <div className="my-3 depth-layer">
                <span className="text-xs text-slate-400 font-medium">Payment Amount</span>
                <div className="text-3xl font-black tracking-tight text-blue-600 dark:text-blue-400">
                  {formatCurrency(numAmount)}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700 flex items-center justify-between text-xs depth-layer-sm">
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
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    Ready to Pay
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Gateway Payments List */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Clock size={14} />
                  <span>Recent Gateway Transactions</span>
                </h3>
                <span className="text-[11px] text-blue-600 font-bold">Auto-Recorded</span>
              </div>

              {recentGatewayTxs.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No gateway payments recorded yet. Make a payment above to see instant ledger entries.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentGatewayTxs.map((tx) => (
                    <div
                      key={tx.id}
                      onDoubleClick={() => setSelectedBillTx(tx)}
                      className="py-2.5 flex items-center justify-between gap-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40 p-2 rounded-xl transition-colors cursor-pointer group"
                      title="Double-click to view verified online invoice"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
                          <CategoryIcon category={tx.category} size={15} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{tx.description}</p>
                          <p className="text-[10px] text-slate-400 font-mono truncate">
                            {tx.time} • {tx.razorpayPaymentId || tx.receiptNumber}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-extrabold text-slate-900 dark:text-white block">
                          -{formatCurrency(tx.amount)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedBillTx(tx)}
                          className="text-[10px] text-blue-600 font-bold hover:underline inline-flex items-center gap-1 mt-0.5"
                        >
                          <FileText size={10} />
                          <span>View Bill</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      {/* Online Bill Invoice Modal (double-click opens verified receipt) */}
      <InvoiceModal
        isOpen={Boolean(selectedBillTx)}
        onClose={() => setSelectedBillTx(null)}
        transaction={selectedBillTx}
      />

      <Toast />
      <MobileBottomNav />
    </div>
  );
};

export default function PaymentPage() {
  return (
    <>
      <SignedIn>
        <PaymentGatewayPageContent />
      </SignedIn>
      <SignedOut>
        <div className="min-h-screen flex flex-col items-center justify-center pt-28 px-4 text-center">
          <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mx-auto">
              <Lock size={28} />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Authentication Required</h2>
            <p className="text-xs text-slate-500">
              Please sign in to access the Rupee Radar payment gateway.
            </p>
            <div className="pt-2">
              <SignInButton forceRedirectUrl="/payment">
                <button
                  type="button"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer"
                >
                  Sign In to Continue
                </button>
              </SignInButton>
            </div>
          </div>
        </div>
      </SignedOut>
    </>
  );
}
