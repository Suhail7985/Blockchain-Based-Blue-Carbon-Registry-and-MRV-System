import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useVoiceAlert } from '../hooks/useVoiceAlert';

const NotificationContext = createContext(null);

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};

const POLL_INTERVAL_MS = 30_000; // 30 seconds

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { announceTokenCredit } = useVoiceAlert();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Track which token_minted notifications we've already announced
  const announcedIds = useRef(new Set());

  /**
   * Fetch full notification list (called when opening bell dropdown)
   */
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await api.get('/notifications?limit=25');
      if (res.data.success) {
        const incoming = res.data.notifications || [];
        setNotifications(incoming);
        setUnreadCount(res.data.unreadCount || 0);

        // Check for new token_minted notifications and trigger voice alert
        incoming
          .filter(
            (n) =>
              n.type === 'token_minted' &&
              !n.isRead &&
              !announcedIds.current.has(n._id)
          )
          .forEach((n) => {
            announcedIds.current.add(n._id);
            announceTokenCredit({
              tokens: n.metadata?.tokens,
              co2eq: n.metadata?.co2eq,
              plantationId: n.metadata?.plantationId || '',
              userName: user?.name,
            });
          });
      }
    } catch (err) {
      console.error('[Notifications] Fetch failed:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, announceTokenCredit, user?.name]);

  /**
   * Lightweight unread-count poll (doesn't replace full list on every tick)
   */
  const pollUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/notifications/unread-count');
      if (res.data.success) {
        const newCount = res.data.count;
        // If unread count grew, fetch full list to get new notifications + voice alert
        if (newCount > unreadCount) {
          await fetchNotifications();
        } else {
          setUnreadCount(newCount);
        }
      }
    } catch {
      // Silent — don't log noisy polling errors
    }
  }, [isAuthenticated, unreadCount, fetchNotifications]);

  // Initial fetch on auth
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  // Polling interval
  useEffect(() => {
    if (!isAuthenticated) return;
    const timer = setInterval(pollUnreadCount, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [isAuthenticated, pollUnreadCount]);

  /**
   * Mark a single notification as read
   */
  const markRead = useCallback(async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('[Notifications] markRead failed:', err.message);
    }
  }, []);

  /**
   * Mark all as read
   */
  const markAllRead = useCallback(async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('[Notifications] markAllRead failed:', err.message);
    }
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        open,
        setOpen,
        fetchNotifications,
        markRead,
        markAllRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
