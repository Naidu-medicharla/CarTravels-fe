import { useState, useCallback } from 'react';
import { api, NotificationItem } from './api';
import { useGlobalData } from '../context/GlobalDataContext';

export function useNotifications(token: string | null) {
  const { notifications, setNotifications, unreadCount, setUnreadCount } = useGlobalData();
  const [panelOpen, setPanelOpen] = useState(false);

  // ── Panel controls ────────────────────────────────────────────────────────
  const openPanel = useCallback(() => setPanelOpen(true), []);
  const closePanel = useCallback(() => setPanelOpen(false), []);

  // ── Mark single notification as read ─────────────────────────────────────
  const markRead = useCallback(async (id: number) => {
    if (!token) return;
    try {
      await api.markNotificationRead(token, id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      // silently fail
    }
  }, [token, setNotifications, setUnreadCount]);

  // ── Mark all as read ──────────────────────────────────────────────────────
  const markAllRead = useCallback(async () => {
    if (!token) return;
    try {
      await api.markAllNotificationsRead(token);
      setNotifications([]);
      setUnreadCount(0);
    } catch {
      // silently fail
    }
  }, [token, setNotifications, setUnreadCount]);

  return {
    notifications,
    unreadCount,
    panelOpen,
    openPanel,
    closePanel,
    markRead,
    markAllRead,
    fetchNotifications: async () => {} // no-op since it's global now
  };
}
