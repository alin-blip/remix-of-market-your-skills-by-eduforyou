import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminRole } from '@/hooks/useAdminRole';

export interface AdminNotification {
  id: string;
  type: 'new_user' | 'email_failed';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  data?: Record<string, unknown>;
}

export function useAdminNotifications() {
  const { isAdmin } = useAdminRole();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  const addNotification = useCallback((notif: Omit<AdminNotification, 'id' | 'read'>) => {
    setNotifications(prev => [{
      ...notif,
      id: crypto.randomUUID(),
      read: false,
    }, ...prev].slice(0, 50));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (!isAdmin) return;

    const channel = supabase
      .channel('admin-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'profiles' },
        (payload) => {
          const profile = payload.new as { full_name?: string; email?: string; created_at?: string };
          addNotification({
            type: 'new_user',
            title: 'Utilizator nou înregistrat',
            description: profile.full_name || profile.email || 'Unknown user',
            timestamp: profile.created_at || new Date().toISOString(),
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'email_send_log', filter: 'status=eq.failed' },
        (payload) => {
          const log = payload.new as { recipient_email?: string; template_name?: string; error_message?: string; created_at?: string };
          addNotification({
            type: 'email_failed',
            title: 'Email eșuat',
            description: `${log.template_name} → ${log.recipient_email}`,
            timestamp: log.created_at || new Date().toISOString(),
            data: { error: log.error_message },
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, addNotification]);

  return { notifications, unreadCount, markAllRead, dismissNotification };
}
