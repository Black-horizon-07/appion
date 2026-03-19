import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET: Check if user has linked accounts
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accounts = await db.account.findMany({
      where: { userId: session.user.id as string },
      select: {
        provider: true,
        providerAccountId: true,
      },
    });

    console.log("Accounts for user", session.user.id, ":", accounts);

    const googleAccount = accounts.find((a) => a.provider === 'google');

    // Also get the user's name/email for display
    const user = await db.user.findUnique({
      where: { id: session.user.id as string },
      select: { name: true, email: true, image: true },
    });

    return NextResponse.json({
      accounts: accounts.map((a) => ({ provider: a.provider })),
      googleLinked: !!googleAccount,
      user,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
  }
}

// DELETE: Unlink a Google account
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await db.account.deleteMany({
      where: {
        userId: session.user.id as string,
        provider: 'google',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to unlink account' }, { status: 500 });
  }
}
