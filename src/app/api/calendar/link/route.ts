import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await request.json();
    if (!code) {
      return NextResponse.json({ error: 'Authorization code is required' }, { status: 400 });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    
    // We need to match the redirect URI exactly
    const redirectUri = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/profile/calendar`;

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId || '',
        client_secret: clientSecret || '',
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      throw new Error(`Google token error: ${errorData}`);
    }

    const tokens = await tokenResponse.json();

    // Check if account already linked
    const existingAccount = await db.account.findFirst({
      where: {
        userId: session.user.id as string,
        provider: 'google'
      }
    });

    if (existingAccount) {
      await db.account.update({
        where: { id: existingAccount.id },
        data: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token || existingAccount.refresh_token,
          expires_at: Math.floor(Date.now() / 1000) + tokens.expires_in,
        }
      });
    } else {
      await db.account.create({
        data: {
          userId: session.user.id as string,
          type: 'oauth',
          provider: 'google',
          providerAccountId: 'calendar-link-' + session.user.id, // Placeholder ID
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: Math.floor(Date.now() / 1000) + tokens.expires_in,
          token_type: tokens.token_type,
          scope: tokens.scope,
          id_token: tokens.id_token,
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Manual link error:', error);
    return NextResponse.json({ error: 'Failed to link account' }, { status: 500 });
  }
}
