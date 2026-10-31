import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    account: { type: String, required: true, index: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    category: { type: String, default: 'Other' },
    date: { type: String, required: true },
    time: { type: String, default: () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) },
    // Payment Gateway Details
    paymentMethod: { type: String, default: 'UPI' },
    paymentProvider: { type: String, default: 'razorpay' },
    paymentStatus: { type: String, enum: ['pending', 'success', 'failed'], default: 'success' },
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
    razorpaySignature: { type: String, default: null },
    merchantName: { type: String, default: '' },
    merchantLocation: { type: String, default: 'India' },
    taxAmount: { type: Number, default: 0 },
    receiptNumber: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

TransactionSchema.index({ userId: 1, id: 1 }, { unique: true });

export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
