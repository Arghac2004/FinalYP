import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Account from '@/models/Account';

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, type, currency, initialBalance, isDefault } = body;

    if (!name) {
      return NextResponse.json({ error: 'Account name is required' }, { status: 400 });
    }

    await connectDB();

    const id = body.id || 'acc_' + Date.now();

    if (isDefault) {
      await Account.updateMany({ userId }, { isDefault: false });
    }

    const newAccount = await Account.create({
      id,
      userId,
      name,
      type: type || 'Current Account',
      currency: currency || 'USD',
      initialBalance: parseFloat(initialBalance) || 0,
      isActive: true,
      isDefault: Boolean(isDefault),
    });

    const { _id, __v, ...accountData } = newAccount.toObject();

    return NextResponse.json({ account: accountData }, { status: 201 });
  } catch (error) {
    console.error('Error creating account in MongoDB:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
