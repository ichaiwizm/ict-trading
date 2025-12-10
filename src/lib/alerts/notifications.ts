// Browser notification utilities

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export function showNotification(
  title: string,
  options?: NotificationOptions
): Notification | null {
  if (!('Notification' in window)) {
    return null;
  }

  if (Notification.permission !== 'granted') {
    return null;
  }

  const notification = new Notification(title, {
    icon: '/icons/trading-icon.png',
    badge: '/icons/badge.png',
    requireInteraction: false,
    ...options,
  });

  // Auto close after 5 seconds
  setTimeout(() => notification.close(), 5000);

  return notification;
}

export function showTradingAlert(
  type: 'setup' | 'entry' | 'killzone' | 'price',
  title: string,
  body: string
) {
  const tagMap = {
    setup: 'ict-setup',
    entry: 'ict-entry',
    killzone: 'ict-killzone',
    price: 'ict-price',
  };

  return showNotification(title, {
    body,
    tag: tagMap[type],
  });
}
