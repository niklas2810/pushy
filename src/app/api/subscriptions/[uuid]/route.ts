export async function DELETE(req: NextRequest, { params }: { params: { uuid: string } }) {
  const { uuid } = params;
  try {
    const result = db.prepare('DELETE FROM subscriptions WHERE uuid = ?').run(uuid);
    if (result.changes > 0) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }
  } catch (err) {
    console.warn('DELETE /subscriptions/[uuid] error:', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import '@/app/notificationJobServer';

export async function GET(req: NextRequest, { params }: { params: { uuid: string } }) {
  const { uuid } = await params;
  try {
    type SubscriptionItem = {
      interval_minutes: number;
      time_created: number;
      time_updated: number;
      subscription?: string;
      last_sent?: number;
    };
    const row = db.prepare('SELECT interval_minutes, time_created, time_updated, subscription, last_sent FROM subscriptions WHERE uuid = ?').get(uuid) as SubscriptionItem | undefined;
    if (row) {
      let subscriptionDecoded = null;
      if (row.subscription) {
        try {
          subscriptionDecoded = JSON.parse(Buffer.from(row.subscription, 'base64').toString('utf-8'));
        } catch (e) {
          console.warn('Error decoding subscription in GET /subscriptions/[uuid]:', e);
          subscriptionDecoded = null;
        }
      }
      return NextResponse.json({
        minutes: row.interval_minutes,
        time_created: new Date(row.time_created).toISOString(),
        time_updated: new Date(row.time_updated).toISOString(),
        last_sent: row.last_sent ? new Date(row.last_sent).toISOString() : null,
        subscription: subscriptionDecoded
      });
    } else {
      return NextResponse.json({});
    }
  } catch (err) {
    console.warn('GET /subscriptions/[uuid] error:', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { uuid: string } }) {
  const { uuid } = await params;
  const body = await req.json();
  const minutes = Number(body.minutes);
  let subscriptionEncoded = null;
  if (body.subscription) {
    try {
      subscriptionEncoded = Buffer.from(JSON.stringify(body.subscription)).toString('base64');
    } catch (e) {
      console.warn('Error encoding subscription in POST /subscriptions/[uuid]:', e);
      return NextResponse.json({ error: 'Invalid subscription format' }, { status: 400 });
    }
  }
  if (!Number.isInteger(minutes) || minutes < 1 || minutes > 1440) {
    return NextResponse.json({ error: 'Invalid time range' }, { status: 401 });
  }
  try {
    const now = Date.now();
    const existing = db.prepare('SELECT uuid FROM subscriptions WHERE uuid = ?').get(uuid);
    if (existing) {
      db.prepare('UPDATE subscriptions SET interval_minutes = ?, time_updated = ?, subscription = ? WHERE uuid = ?')
        .run(minutes, now, subscriptionEncoded, uuid);
    } else {
      db.prepare('INSERT INTO subscriptions (uuid, time_created, time_updated, interval_minutes, subscription) VALUES (?, ?, ?, ?, ?)')
        .run(uuid, now, now, minutes, subscriptionEncoded);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.warn('POST /subscriptions/[uuid] error:', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
