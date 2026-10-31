import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import razorpay from '@/lib/razorpay';

export async function POST(req) {
  try {
    const { userId } = await auth();
    // Allow either logged in Clerk user or guest testing
    const currentUserId = userId || 'demo_user';

    const body = await req.json();
    const { amount, category, description, merchantName } = body;

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid amount. Must be greater than 0.' },
        { status: 400 }
      );
    }

    const amountInPaise = Math.round(Number(amount) * 100);
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TlIO8sUg8ow0E4';

    let razorpayOrder;

    try {
      razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `RR_${Date.now()}`,
        notes: {
          userId: String(currentUserId),
          category: category || 'General',
          description: description || 'Payment via Rupee Radar',
          merchantName: merchantName || 'Rupee Radar Merchant',
        },
      });
    } catch (rzpErr) {
      console.warn('Razorpay live order creation warning, using simulated fallback:', rzpErr?.message || rzpErr);
      // Fallback for offline/test environments
      razorpayOrder = {
        id: `order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        amount: amountInPaise,
        currency: 'INR',
      };
    }

    return NextResponse.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency || 'INR',
      key: keyId,
    });
  } catch (error) {
    console.error('Payment order creation error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create payment order' },
      { status: 500 }
    );
  }
}
