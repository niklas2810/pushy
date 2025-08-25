// Open website when notification is clicked
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});
// Auto-update service worker on new version
self.addEventListener('install', () => {
  console.log('Service worker: Installed. Skipping waiting to activate new version.');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('Service worker: Activated. Claiming clients.');
  event.waitUntil(self.clients.claim());
});
// Listen for push events
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Push Notification';
  const options = {
    title: 'Pushy - Scheduled Notification',
    body: data.body || 'You have a new notification!',
    icon: '/favicon.ico',
    silent: true
  };
  event.waitUntil(self.registration.showNotification(title, options));
});


// Listen for subscribe messages from client
self.addEventListener('message', async function(event) {
  const { action, uuid, minutes } = event.data || {};
  console.log('Service worker received message:', event.data);
  if (action === 'subscribe' && uuid && typeof minutes === 'number') {
    try {
      // Check PushManager permissionState if available
      if (self.registration.pushManager.permissionState) {
        const state = await self.registration.pushManager.permissionState({userVisibleOnly: true});
        console.log('Service worker: PushManager.permissionState:', state);
        if (state !== 'granted') {
          console.warn('Service worker: Push permission not granted:', state);
          return;
        }
      }

      // Unsubscribe from existing subscription if present
      const existingSubscription = await self.registration.pushManager.getSubscription();
      if (existingSubscription) {
        try {
          const unsubscribed = await existingSubscription.unsubscribe();
          console.log('Service worker: Existing subscription unsubscribed:', unsubscribed);
        } catch (unsubErr) {
          console.warn('Service worker: Failed to unsubscribe existing subscription:', unsubErr);
        }
      }

      console.log('Service worker: Registering push subscription for UUID:', uuid, 'with interval (minutes):', minutes);
      const vapidKey = await getVapidKey();
      console.log('Service worker: VAPID key obtained.');
      // Register push subscription
      const subscription = await self.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey
      }).catch(err => {
        console.error('Service worker: Error during push subscription:', err);
        throw err;
      });
      console.log('Service worker: Push subscription obtained:', subscription);
      console.log('Service worker: Sending subscription to server for UUID:', uuid);
      // Send subscription and interval to server
      const response = await fetch(`/api/subscriptions/${uuid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minutes, subscription })
      });
      console.log('Service worker: Server response status:', response.status);
      if (response.ok) {
        console.log('Service worker: Subscription registered and sent to server successfully.');
      } else {
        console.error('Service worker: Failed to send subscription to server.', await response.text());
      }
    } catch (err) {
      // Optionally, post error back to client
      console.error('Service worker subscribe error:', err);
    }
  }
});

// Helper to get VAPID key from server
async function getVapidKey() {
  try {
    const res = await fetch('/api/vapid');
    const data = await res.json();
    if (data.publicKey) {
      // Convert base64 public key to Uint8Array
      return urlBase64ToUint8Array(data.publicKey);
    }
  } catch (err) {
    console.error('Failed to fetch VAPID key:', err);
  }
  return undefined;
}

// Helper to convert base64 to Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
