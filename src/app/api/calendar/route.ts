import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { google } from 'googleapis';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timezone = searchParams.get('timezone') || 'UTC';

    // Fetch the user's google account from DB
    const account = await db.account.findFirst({
      where: {
        userId: session.user.id as string,
        provider: 'google',
      },
    });

    if (!account || !account.access_token) {
      return NextResponse.json({ error: 'Google Account not linked or no access token available' }, { status: 403 });
    }

    // Initialize OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: account.access_token,
      refresh_token: account.refresh_token,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Fetch events from yesterday to tomorrow to safely encompass any ongoing events regardless of server timezone differences
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: yesterday.toISOString(),
      timeMax: tomorrow.toISOString(),
      maxResults: 50,
      singleEvents: true,
      orderBy: 'startTime',
      timeZone: timezone,
    });

    const events = response.data.items || [];
    
    const currentTime = now.getTime();
    let currentEvent = null;

    for (const event of events) {
      if (event.start?.dateTime && event.end?.dateTime) {
        // Timed event
        const start = new Date(event.start.dateTime).getTime();
        const end = new Date(event.end.dateTime).getTime();
        if (currentTime >= start && currentTime <= end) {
          currentEvent = event;
          break;
        }
      } else if (event.start?.date && event.end?.date) {
        // All-day event (Format: YYYY-MM-DD)
        // Check if today falls between the dates
        const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(now); // YYYY-MM-DD
        if (todayStr >= event.start.date && todayStr < event.end.date) {
          currentEvent = event;
          break;
        }
      }
    }

    return NextResponse.json({ currentEvent, upcomingEvents: events });
  } catch (error: any) {
    console.error('Calendar API error', error);
    return NextResponse.json({ error: 'Failed to fetch calendar events', details: error.message }, { status: 500 });
  }
}
