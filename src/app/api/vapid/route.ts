import { NextResponse } from 'next/server';
import { getVapidKeys, generateVapidKeys } from '@/lib/db';

export async function GET() {
  let keys = getVapidKeys();
  if (!keys) {
    keys = generateVapidKeys();
  }
  if (!keys) {
    return NextResponse.json({ error: 'Failed to generate VAPID keys' }, { status: 500 });
  }
  return NextResponse.json({ publicKey: keys.publicKey });
}
