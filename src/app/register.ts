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
