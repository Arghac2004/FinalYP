import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Transaction from '@/models/Transaction';

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      description,
      amount,
      type,
      category,
      account,
      date,
      time,
      paymentMethod,
      paymentProvider,
      paymentStatus,
      razorpayOrderId,
      razorpayPaymentId,
      merchantName,
      merchantLocation,
      taxAmount,
      receiptNumber,
    } = body;

    if (!description || amount === undefined || !type) {
      return NextResponse.json(
        { error: 'Description, amount, and type are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const id = body.id || 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const now = new Date();

    const newTransaction = await Transaction.create({
      id,
      userId,
      account: account || 'personal',
      description,
      amount: parseFloat(amount) || 0,
      type,
      category: category || 'Other',
      date: date || now.toISOString().split('T')[0],
      time: time || now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      paymentMethod: paymentMethod || 'UPI',
      paymentProvider: paymentProvider || 'razorpay',
      paymentStatus: paymentStatus || 'success',
      razorpayOrderId: razorpayOrderId || null,
      razorpayPaymentId: razorpayPaymentId || null,
      merchantName: merchantName || description,
      merchantLocation: merchantLocation || 'India',
      taxAmount: taxAmount || 0,
      receiptNumber: receiptNumber || `RR-${Date.now().toString().slice(-6)}`,
    });

    const { _id, __v, ...transactionData } = newTransaction.toObject();

    return NextResponse.json({ transaction: transactionData }, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction in MongoDB:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
