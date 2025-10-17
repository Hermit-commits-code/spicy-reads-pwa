// Utility to request push notification permission and register service worker
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return { granted: false, reason: 'Notifications not supported' };
  }
  let permission = Notification.permission;
  if (permission === 'default') {
    permission = await Notification.requestPermission();
  }
  return { granted: permission === 'granted', reason: permission };
}

export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      return reg;
    } catch (e) {
      console.warn('Service worker registration failed:', e);
      return null;
    }
  }
  return null;
}
