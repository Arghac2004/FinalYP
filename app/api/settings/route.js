import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import UserSettings from '@/models/UserSettings';

export async function PATCH(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    await connectDB();

    const updated = await UserSettings.findOneAndUpdate(
      { userId },
      { $set: body },
      { upsert: true, new: true }
    ).lean();

    return NextResponse.json({ settings: updated });
  } catch (error) {
    console.error('Error updating settings in MongoDB:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
