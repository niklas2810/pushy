import { sendNotificationsToAll } from './sendNotifications';

function startNotificationJob() {
  setInterval(() => {
    sendNotificationsToAll()
      .catch(err => console.error('Notification error:', err));
  }, 10000); // every 10 seconds
}

export default startNotificationJob;
