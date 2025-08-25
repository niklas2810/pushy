import db from '@/lib/db';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request, { params }: { params: { uuid: string } }) {
  const { uuid } = params;
  if (!uuid) {
    return NextResponse.json({ error: 'Missing UUID' }, { status: 400 });
  }
  try {
    db.prepare('DELETE FROM subscriptions WHERE uuid = ?').run(uuid);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.warn('DELETE /unsubscribe/[uuid] error:', err);
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
  }
}
