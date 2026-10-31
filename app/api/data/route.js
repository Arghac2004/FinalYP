import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Account from '@/models/Account';
import Transaction from '@/models/Transaction';
import UserSettings from '@/models/UserSettings';

// Minimal starter account for brand-new users to keep free tier MongoDB lean & lightweight
const INITIAL_STARTER_ACCOUNT = {
  id: 'personal',
  name: 'Primary Account',
  type: 'Savings Account',
  currency: 'INR',
  initialBalance: 0,
  isActive: true,
  isDefault: true,
};

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    let [accounts, transactions, settings] = await Promise.all([
      Account.find({ userId }).sort({ createdAt: 1 }).lean(),
      Transaction.find({ userId }).sort({ createdAt: -1 }).lean(),
      UserSettings.findOne({ userId }).lean(),
    ]);

    // If new user with no accounts in MongoDB, create only 1 single starter account (zero bloat)
    if (!accounts || accounts.length === 0) {
      const createdAccount = await Account.create({
        ...INITIAL_STARTER_ACCOUNT,
        userId,
      });

      accounts = [createdAccount.toObject()];
      transactions = [];
    }

    return NextResponse.json({
      accounts: accounts.map(({ _id, __v, ...acc }) => acc),
      transactions: transactions.map(({ _id, __v, ...tx }) => tx),
      settings: settings
        ? {
            annualBudget: settings.annualBudget ?? 250000,
            currencyCode: settings.currencyCode ?? 'INR',
            theme: settings.theme ?? 'light',
          }
        : {
            annualBudget: 250000,
            currencyCode: 'INR',
            theme: 'light',
          },
    });
  } catch (error) {
    console.error('Error fetching data from MongoDB:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
