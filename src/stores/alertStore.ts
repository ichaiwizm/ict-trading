import { create } from 'zustand';

interface Alert {
  id: string;
  type: 'setup' | 'price' | 'killzone' | 'entry' | 'info';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface AlertState {
  alerts: Alert[];
  soundEnabled: boolean;
  notificationsEnabled: boolean;

  addAlert: (alert: Omit<Alert, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  clearAlerts: () => void;
  toggleSound: () => void;
  toggleNotifications: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],
  soundEnabled: true,
  notificationsEnabled: true,

  addAlert: (alert) =>
    set((state) => {
      const newAlert: Alert = {
        ...alert,
        id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        read: false,
      };

      if (state.soundEnabled && typeof window !== 'undefined') {
        const audio = new Audio('/sounds/alert.mp3');
        audio.play().catch(() => {});
      }

      if (
        state.notificationsEnabled &&
        typeof window !== 'undefined' &&
        'Notification' in window &&
        Notification.permission === 'granted'
      ) {
        new Notification(newAlert.title, {
          body: newAlert.message,
          icon: '/icon.png',
        });
      }

      return {
        alerts: [newAlert, ...state.alerts].slice(0, 100),
      };
    }),

  markAsRead: (id) =>
    set((state) => ({
      alerts: state.alerts.map((alert) =>
        alert.id === id ? { ...alert, read: true } : alert
      ),
    })),

  clearAlerts: () =>
    set({
      alerts: [],
    }),

  toggleSound: () =>
    set((state) => ({
      soundEnabled: !state.soundEnabled,
    })),

  toggleNotifications: () =>
    set((state) => ({
      notificationsEnabled: !state.notificationsEnabled,
    })),
}));
