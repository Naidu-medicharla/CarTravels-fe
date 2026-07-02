import { useState, useEffect, useCallback, useRef } from 'react';
import { api, NotificationItem } from './api';

const POLL_INTERVAL_MS = 30_000; // 30 seconds

export function useNotifications(token: string | null) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [panelOpen, setPanelOpen] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch unread count (lightweight — used for badge polling)
  const refreshCount = useCallback(async () => {
    if (!token) return;
    try {
      const count = await api.getNotificationCount(token);
      setUnreadCount(count);
    } catch {
      // silently fail — network issues shouldn't break the UI
    }
  }, [token]);

  // Fetch full notification list (heavier — only when panel is opened)
  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const data = await api.getMyNotifications(token);
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    } catch {
      // silently fail
    }
  }, [token]);

  // Open panel: fetch full list + stop polling while panel is open
  const openPanel = useCallback(() => {
    setPanelOpen(true);
    fetchNotifications();
  }, [fetchNotifications]);

  // Close panel
  const closePanel = useCallback(() => {
    setPanelOpen(false);
  }, []);

  // Mark single notification as read and remove it from the list
  const markRead = useCallback(async (id: number) => {
    if (!token) return;
    try {
      await api.markNotificationRead(token, id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      // silently fail
    }
  }, [token]);

  // Mark all as read and clear the list
  const markAllRead = useCallback(async () => {
    if (!token) return;
    try {
      await api.markAllNotificationsRead(token);
      setNotifications([]);
      setUnreadCount(0);
    } catch {
      // silently fail
    }
  }, [token]);

  // Start polling on mount, clear on unmount
  useEffect(() => {
    if (!token) return;
    refreshCount(); // immediate first check

    intervalRef.current = setInterval(refreshCount, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [token, refreshCount]);

  return {
    notifications,
    unreadCount,
    panelOpen,
    openPanel,
    closePanel,
    markRead,
    markAllRead,
    fetchNotifications,
  };
}
