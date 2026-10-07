import React, { createContext, useContext, useState } from 'react';

// Define the notification type
interface Notification {
  id: number;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  persist: boolean;
}

// Define the notification context type
interface NotificationContextType {
  notifications: Notification[];
  addNotification: (message: string, type?: 'info' | 'success' | 'warning' | 'error', persist?: boolean) => number;
  removeNotification: (id: number) => void;
  clearNotifications: () => void;
  clearNonPersistent: () => void;
}

// Create Notification context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Notification provider component
export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Add notification
  const addNotification = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', persist: boolean = false) => {
    const id = Date.now() + Math.random();
    const notification: Notification = {
      id,
      message,
      type,
      timestamp: new Date(),
      persist // whether to keep until manually dismissed
    };

    setNotifications(prev => [...prev, notification]);

    // Auto-dismiss non-persistent notifications after 5 seconds
    if (!persist) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
      }, 5000);
    }

    return id;
  };

  // Remove notification
  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Clear only non-persistent notifications
  const clearNonPersistent = () => {
    setNotifications(prev => prev.filter(notif => notif.persist));
  };

  // Context value
  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    clearNonPersistent
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;