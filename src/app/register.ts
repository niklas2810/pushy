export async function registerServiceWorker() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    console.log('Registering service worker for push notifications...');
    await navigator.serviceWorker.register('/sw.js');
    // Service worker registration only; notification permission handled separately
  } else {
    console.warn('Service Workers or Notifications are not supported');
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('Notifications API not supported.');
    return 'denied';
  }
  let permission = Notification.permission;
  if (permission !== 'granted') {
    try {
      permission = await Notification.requestPermission();
      console.log('Notification permission result:', permission);
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      return 'denied';
    }
  }
  return permission;
}
