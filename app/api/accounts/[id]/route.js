import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Account from '@/models/Account';
import Transaction from '@/models/Transaction';

export async function PATCH(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    await connectDB();

    const updatedAccount = await Account.findOneAndUpdate(
      { id, userId },
      { $set: body },
      { new: true }
    ).lean();

    if (!updatedAccount) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const { _id, __v, ...accountData } = updatedAccount;

    return NextResponse.json({ account: accountData });
  } catch (error) {
    console.error('Error updating account in MongoDB:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();

    const deletedAccount = await Account.findOneAndDelete({ id, userId });
    if (!deletedAccount) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Cascade delete transactions
    await Transaction.deleteMany({ account: id, userId });

    // If deleted account was default, set another remaining account as default
    if (deletedAccount.isDefault) {
      const remaining = await Account.findOne({ userId });
      if (remaining) {
        remaining.isDefault = true;
        await remaining.save();
      }
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error deleting account in MongoDB:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
