import Database from 'better-sqlite3';
import webpush from 'web-push';
import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const db = new Database(path.join(dataDir, 'data.db'));

db.exec(`CREATE TABLE IF NOT EXISTS subscriptions (
  uuid TEXT PRIMARY KEY,
  time_created INTEGER NOT NULL,
  time_updated INTEGER NOT NULL,
  interval_minutes INTEGER NOT NULL,
  subscription TEXT,
  last_sent INTEGER
)`);

// Create preferences table if not exists
db.prepare(`CREATE TABLE IF NOT EXISTS preferences (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
)`).run();

// VAPID key helpers
export function getVapidKeys() {
  const pubRow = db.prepare('SELECT value FROM preferences WHERE key = ?').get('vapid_public') as { value?: string } | undefined;
  const privRow = db.prepare('SELECT value FROM preferences WHERE key = ?').get('vapid_private') as { value?: string } | undefined;
  if (pubRow?.value && privRow?.value) {
    return { publicKey: pubRow.value, privateKey: privRow.value };
  }
  return null;
}

export function setVapidKeys(publicKey: string, privateKey: string) {
  db.prepare('INSERT OR REPLACE INTO preferences (key, value) VALUES (?, ?)').run('vapid_public', publicKey);
  db.prepare('INSERT OR REPLACE INTO preferences (key, value) VALUES (?, ?)').run('vapid_private', privateKey);
}

export function generateVapidKeys() {
  // Use web-push or node crypto to generate keys
  // Here we use web-push for simplicity
  const vapidKeys = webpush.generateVAPIDKeys();
  setVapidKeys(vapidKeys.publicKey, vapidKeys.privateKey);
  return vapidKeys;
}

export default db;
