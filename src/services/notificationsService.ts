import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import { NotificationRecord, PageRoute } from '../types';

const STORAGE_KEY = 'mediguard_notifications_v1';

export const INITIAL_NOTIFICATIONS: NotificationRecord[] = [
  {
    id: 'notif-1',
    userId: 'demo-user',
    title: 'Medicine Reminder',
    message: 'Time to take Amoxicillin 500mg (Afternoon Dose). Please log completion.',
    type: 'warning',
    category: 'reminder',
    isRead: false,
    page: 'reminders',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
  },
  {
    id: 'notif-2',
    userId: 'demo-user',
    title: 'Prescription Uploaded',
    message: 'Prescription RX-88492 successfully uploaded and queued for vision parsing.',
    type: 'info',
    category: 'upload',
    isRead: false,
    page: 'history',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
  },
  {
    id: 'notif-3',
    userId: 'demo-user',
    title: 'AI Analysis Complete',
    message: 'Vision AI verification complete for RX-88492. Safety score calculated at 98%.',
    type: 'success',
    category: 'ai_analysis',
    isRead: true,
    page: 'report',
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
  },
  {
    id: 'notif-4',
    userId: 'demo-user',
    title: 'Interaction Warning',
    message: 'Lisinopril + Amoxicillin co-prescription flagged with mild gastric precaution.',
    type: 'warning',
    category: 'interaction',
    isRead: true,
    page: 'report',
    createdAt: new Date(Date.now() - 1000 * 60 * 1440).toISOString(), // 1 day ago
  },
  {
    id: 'notif-5',
    userId: 'demo-user',
    title: 'Profile Updated',
    message: 'Emergency contacts and medical history successfully synchronized.',
    type: 'info',
    category: 'profile',
    isRead: true,
    page: 'profile',
    createdAt: new Date(Date.now() - 1000 * 60 * 2880).toISOString(), // 2 days ago
  },
];

export const notificationsService = {
  /**
   * Fetch all notifications for the user
   */
  async getAll(userId?: string): Promise<NotificationRecord[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((item) => ({
            id: item.id,
            userId: item.user_id,
            title: item.title,
            message: item.message,
            type: item.type,
            category: item.category || 'system',
            isRead: item.is_read,
            page: item.page as PageRoute,
            actionUrl: item.action_url,
            createdAt: item.created_at,
          }));
        }
      } catch (err) {
        console.warn('Supabase fetch notifications failed, falling back to LocalStorage:', err);
      }
    }

    // LocalStorage Fallback
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
        return INITIAL_NOTIFICATIONS;
      }
    } catch (e) {
      console.error('Error loading notifications from LocalStorage:', e);
    }
    return INITIAL_NOTIFICATIONS;
  },

  /**
   * Add a new notification (Stores in database & LocalStorage)
   */
  async addNotification(
    notif: Omit<NotificationRecord, 'id' | 'createdAt' | 'isRead'> & { userId?: string }
  ): Promise<NotificationRecord> {
    const newRecord: NotificationRecord = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: notif.userId || 'demo-user',
      title: notif.title,
      message: notif.message,
      type: notif.type,
      category: notif.category,
      isRead: false,
      page: notif.page,
      actionUrl: notif.actionUrl,
      createdAt: new Date().toISOString(),
    };

    // 1. Update LocalStorage
    try {
      const current = await this.getAll(notif.userId);
      const updated = [newRecord, ...current];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to update LocalStorage for new notification:', e);
    }

    // 2. Persist to Supabase if available
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('notifications').insert({
          id: newRecord.id,
          user_id: newRecord.userId,
          title: newRecord.title,
          message: newRecord.message,
          type: newRecord.type,
          category: newRecord.category,
          is_read: newRecord.isRead,
          page: newRecord.page,
          action_url: newRecord.actionUrl,
          created_at: newRecord.createdAt,
        });
      } catch (err) {
        console.warn('Could not insert notification into Supabase:', err);
      }
    }

    return newRecord;
  },

  /**
   * Mark a single notification as read
   */
  async markAsRead(id: string): Promise<void> {
    try {
      const current = await this.getAll();
      const updated = current.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to mark notification read in LocalStorage:', e);
    }

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      } catch (err) {
        console.error('Error updating notification read state in Supabase:', err);
      }
    }
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    try {
      const current = await this.getAll();
      const updated = current.map((n) => ({ ...n, isRead: true }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to mark all as read in LocalStorage:', e);
    }

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('notifications').update({ is_read: true }).neq('is_read', true);
      } catch (err) {
        console.error('Error marking all as read in Supabase:', err);
      }
    }
  },

  /**
   * Delete a notification
   */
  async deleteNotification(id: string): Promise<void> {
    try {
      const current = await this.getAll();
      const updated = current.filter((n) => n.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to delete notification in LocalStorage:', e);
    }

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('notifications').delete().eq('id', id);
      } catch (err) {
        console.error('Error deleting notification from Supabase:', err);
      }
    }
  },

  /**
   * Subscribe to Supabase Realtime updates on the notifications table
   */
  subscribeToRealtime(onNewNotification: (notif: NotificationRecord) => void) {
    if (!isSupabaseConfigured()) {
      return () => {};
    }

    try {
      const channel = supabase
        .channel('public:notifications')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications' },
          (payload) => {
            if (payload.new) {
              const item = payload.new;
              const notifRecord: NotificationRecord = {
                id: item.id,
                userId: item.user_id,
                title: item.title,
                message: item.message,
                type: item.type,
                category: item.category || 'system',
                isRead: item.is_read,
                page: item.page,
                actionUrl: item.action_url,
                createdAt: item.created_at,
              };
              onNewNotification(notifRecord);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.warn('Realtime subscription error for notifications:', err);
      return () => {};
    }
  },
};
