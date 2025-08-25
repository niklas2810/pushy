export async function registerPushNotifications() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    console.log('Registering service worker for push notifications...');
    await navigator.serviceWorker.register('/sw.js');
    // Request notification permission
    let permission = Notification.permission;
    if (Notification && permission !== 'granted') {
      try {
        permission = await Notification.requestPermission();
        console.log('Notification permission result:', permission);
      } catch (err) {
        console.error('Error requesting notification permission:', err);
      }
    }
    // Only proceed with push registration if permission is granted
    if (permission === 'granted') {
      // PushManager registration can proceed here if needed
      console.log('Notification permission granted, ready for push subscription.');
    } else {
      console.warn('Notification permission not granted. Push subscription will not proceed.');
    }
  } else {
    console.warn('Push messaging is not supported');
  }
}
