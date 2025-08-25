import db from './db';
import { getVapidKeys } from './db';
import webpush from 'web-push';

// Get all subscriptions from DB
function getAllSubscriptionsWithInterval() {
    // Fetch uuid, subscription, and interval_minutes
    const rows = db.prepare('SELECT uuid, subscription, interval_minutes, last_sent FROM subscriptions').all() as Array<{ uuid: string, subscription: string, interval_minutes: number, last_sent?: string }>;
    return rows.map(row => ({ uuid: row.uuid, subscription: row.subscription, interval: row.interval_minutes, last_sent: row.last_sent }));
}

let lastMinute = -1;

export async function sendNotificationsToAll() {
    const keys = getVapidKeys();
    if (!keys) throw new Error('VAPID keys not found');
    webpush.setVapidDetails(
        'mailto:example@yourdomain.org',
        keys.publicKey,
        keys.privateKey
    );

    // Message: "It is now " + current time (24-hour format, e.g. "14:05")
    const now = new Date();
    if (now.getMinutes() === lastMinute) {
        // Already sent for this minute
        console.log('Notifications already sent for this minute, skipping.');
        return;
    }

    const minutesToday = now.getHours() * 60 + now.getMinutes();
    console.log('Sending notifications at', now.toISOString(), 'minutesToday:', minutesToday);
    lastMinute = now.getMinutes();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const message = `It is now ${hours}:${minutes}`;

    const subs = getAllSubscriptionsWithInterval();
    for (const { uuid, subscription, interval } of subs) {
        // Check interval first
        let shouldSend = false;
        if (interval && interval > 0) {
            if (minutesToday % interval === 0) {
                shouldSend = true;
            }
        }
        if (!shouldSend) {
            console.log(`Skipping uuid ${uuid} (interval ${interval}): interval not reached.`);
            continue;
        }
        if (!subscription) {
            console.warn(`Skipping uuid ${uuid}: subscription is empty.`);
            continue;
        }
        // Check if subscription is base64 encoded (simple check: only base64 chars and length multiple of 4)
        const base64Regex = /^[A-Za-z0-9+/=]+$/;
        if (!base64Regex.test(subscription) || subscription.length % 4 !== 0) {
            console.log(`Skipping uuid ${uuid}: subscription is not base64 encoded.`);
            continue;
        }
        let decodedSub: unknown;
        try {
            const jsonStr = Buffer.from(subscription, 'base64').toString('utf8');
            decodedSub = JSON.parse(jsonStr);
        } catch (err) {
            console.warn(`Error decoding/parsing subscription for uuid ${uuid}:`, err);
            console.log(`Skipping uuid ${uuid}: failed to decode or parse subscription.`);
            continue;
        }
        try {
            const decodedSubTyped = decodedSub as webpush.PushSubscription;
            await webpush.sendNotification(decodedSubTyped, JSON.stringify({ title: 'Pushy', body: message }));
            console.log(`Sent notification to uuid ${uuid}`);
            // Update last_sent in DB
            db.prepare('UPDATE subscriptions SET last_sent = ? WHERE uuid = ?').run(now.toISOString(), uuid);
        } catch (err) {
            // Log and continue
            console.error(`Error sending notification to uuid ${uuid}:`, err);
        }
    }
}
