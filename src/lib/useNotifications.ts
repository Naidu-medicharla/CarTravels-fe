import { useState, useEffect, useCallback, useRef } from 'react';
import { api, NotificationItem, BASE_URL } from './api';

// ── Config ────────────────────────────────────────────────────────────────────

// How long to wait before reconnecting after a dropped SSE connection
const SSE_RECONNECT_DELAY_MS = 3_000;

// ─────────────────────────────────────────────────────────────────────────────

export function useNotifications(token: string | null) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [panelOpen, setPanelOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // ── Fetch full list (called when panel opens) ─────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const data = await api.getMyNotifications(token);
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    } catch {
      // silently fail — network issues shouldn't break the UI
    }
  }, [token]);

  // ── Panel controls ────────────────────────────────────────────────────────
  const openPanel = useCallback(() => {
    setPanelOpen(true);
    fetchNotifications(); // load full list when panel opens
  }, [fetchNotifications]);

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
  }, [token]);

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
  }, [token]);

  // ── SSE connection (replaces setInterval polling) ─────────────────────────
  useEffect(() => {
    if (!token) return;

    // Seed the badge count immediately on mount (no waiting for first SSE push)
    api.getNotificationCount(token)
      .then(count => setUnreadCount(count))
      .catch(() => { });

    let isActive = true;

    const connect = async () => {
      if (!isActive) return;

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        // Use fetch (not EventSource) so we can send the Authorization header
        const response = await fetch(`${BASE_URL}/notification/stream`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'text/event-stream',
          },
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(`SSE failed: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (isActive) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Process complete lines; keep any partial line in the buffer
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue; // skip heartbeats & blanks

            try {
              const incoming: NotificationItem[] = JSON.parse(line.slice(6));
              if (incoming.length > 0) {
                // Prepend new notifications and bump the badge
                setNotifications(prev => [...incoming, ...prev]);
                setUnreadCount(prev => prev + incoming.length);
              }
            } catch {
              // ignore malformed JSON
            }
          }
        }
      } catch (err: any) {
        if (err?.name === 'AbortError') return; // intentional close, don't reconnect
        // Network error / server restart → reconnect after delay
        if (isActive) {
          setTimeout(connect, SSE_RECONNECT_DELAY_MS);
        }
      }
    };

    connect();

    // Cleanup: abort the stream when token changes or component unmounts
    return () => {
      isActive = false;
      abortRef.current?.abort();
    };
  }, [token]);

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
