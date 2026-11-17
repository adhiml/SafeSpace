import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { Notification } from '../types';
import * as consultationService from '../services/consultationService';
import { useRole } from './RoleContext';

const POLL_MS = 15000;

interface NotificationContextValue {
  items: Notification[];
  unreadCount: number;
  /** Newest notification that arrived while the app was open; drives the in-app banner. */
  banner: Notification | null;
  refresh: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  dismissBanner: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userId, account } = useRole();
  const frozenOut = account?.state === 'unverified'; // such accounts can't load notifications at all
  const [items, setItems] = useState<Notification[]>([]);
  const [banner, setBanner] = useState<Notification | null>(null);
  // Ids already seen. null = first load not done yet, so existing notifications never pop a banner.
  const seen = useRef<Set<string> | null>(null);

  const refresh = useCallback(async () => {
    if (!userId || frozenOut) return;
    const data = await consultationService.getNotifications();
    setItems(data);

    if (seen.current === null) {
      seen.current = new Set(data.map((n) => n._id));
      return;
    }
    const known = seen.current;
    const fresh = data.filter((n) => !n.is_read && !known.has(n._id));
    fresh.forEach((n) => known.add(n._id));
    if (fresh.length > 0) setBanner(fresh[0]); // the API returns newest first
  }, [userId, frozenOut]);

  // Start over whenever the signed-in user changes, then poll while the app is open.
  useEffect(() => {
    seen.current = null;
    setItems([]);
    setBanner(null);
    if (!userId || frozenOut) return;

    refresh().catch(() => undefined);
    const timer = setInterval(() => refresh().catch(() => undefined), POLL_MS);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh().catch(() => undefined);
    });
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, [userId, frozenOut, refresh]);

  const markRead = useCallback(
    async (id: string) => {
      setItems((prev) => prev.map((n) => (n._id === id ? { ...n, is_read: true } : n)));
      try {
        await consultationService.markNotificationRead(id);
      } catch {
        refresh().catch(() => undefined); // undo the optimistic change
      }
    },
    [refresh]
  );

  const markAllRead = useCallback(async () => {
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await consultationService.markAllNotificationsRead();
    } catch {
      refresh().catch(() => undefined);
    }
  }, [refresh]);

  const dismissBanner = useCallback(() => setBanner(null), []);

  const value = useMemo(
    () => ({
      items,
      unreadCount: items.filter((n) => !n.is_read).length,
      banner,
      refresh,
      markRead,
      markAllRead,
      dismissBanner,
    }),
    [items, banner, refresh, markRead, markAllRead, dismissBanner]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};
