import { supabase, isSupabaseConfigured } from './supabase';
import { NotificationRecord, NotificationFormData } from '../types/notification';

let localNotifications: NotificationRecord[] = [
  {
    id: 'notif-1',
    user_id: null,
    title: 'High-Value Lead Received',
    message: 'Dr. Rakesh Verma requested a 250 kVA DG Set quotation (Lead Score: 92/100).',
    type: 'new_lead',
    related_record_id: 'lead-1',
    related_record_type: 'lead',
    is_read: false,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'notif-2',
    user_id: null,
    title: 'Follow-up Scheduled Today',
    message: 'Review quotation SPS-2026-0042 with Apex Healthcare administration.',
    type: 'followup_reminder',
    related_record_id: 'fol-1',
    related_record_type: 'followup',
    is_read: false,
    created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
  {
    id: 'notif-3',
    user_id: null,
    title: 'Discom Liaison Task Pending',
    message: 'Task "Submit Net Metering Application" is due in 3 days for Shree Balaji Textile Mills.',
    type: 'task_due',
    related_record_id: 'task-1',
    related_record_type: 'task',
    is_read: true,
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
];

function normalizeNotification(row: Record<string, any>): NotificationRecord {
  return {
    id: String(row.id || crypto.randomUUID()),
    user_id: row.user_id || null,
    title: row.title || 'Notification',
    message: row.message || '',
    type: row.type || 'general',
    related_record_id: row.related_record_id || null,
    related_record_type: row.related_record_type || null,
    is_read: Boolean(row.is_read),
    created_at: row.created_at || new Date().toISOString(),
  };
}

export const notificationsService = {
  /**
   * Fetch notifications (optionally filtered by user ID)
   */
  async getNotifications(userId?: string): Promise<{ notifications: NotificationRecord[]; isLive: boolean; error?: string }> {
    if (!isSupabaseConfigured) {
      const filtered = userId ? localNotifications.filter((n) => !n.user_id || n.user_id === userId) : localNotifications;
      return { notifications: [...filtered], isLive: false };
    }

    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (userId) {
        query = query.or(`user_id.eq.${userId},user_id.is.null`);
      }

      const { data, error } = await query;

      if (error) {
        console.warn('Supabase getNotifications error, fallback to local:', error.message);
        const filtered = userId ? localNotifications.filter((n) => !n.user_id || n.user_id === userId) : localNotifications;
        return { notifications: [...filtered], isLive: false, error: error.message };
      }

      if (data) {
        const normalized = data.map(normalizeNotification);
        localNotifications = normalized;
        return { notifications: normalized, isLive: true };
      }

      return { notifications: [...localNotifications], isLive: true };
    } catch (err: any) {
      console.error('Failed to fetch notifications:', err);
      return { notifications: [...localNotifications], isLive: false, error: err?.message };
    }
  },

  /**
   * Create a notification
   */
  async createNotification(data: NotificationFormData): Promise<{ notification: NotificationRecord; error?: string }> {
    if (!data.title?.trim()) {
      return { notification: {} as NotificationRecord, error: 'Notification title is required.' };
    }
    if (!data.message?.trim()) {
      return { notification: {} as NotificationRecord, error: 'Notification message is required.' };
    }

    const newId = crypto.randomUUID();
    const now = new Date().toISOString();

    const localRecord: NotificationRecord = {
      id: newId,
      user_id: data.user_id || null,
      title: data.title,
      message: data.message,
      type: data.type || 'general',
      related_record_id: data.related_record_id || null,
      related_record_type: data.related_record_type || null,
      is_read: Boolean(data.is_read),
      created_at: now,
    };

    if (!isSupabaseConfigured) {
      localNotifications.unshift(localRecord);
      return { notification: localRecord };
    }

    try {
      const payload = {
        id: newId,
        user_id: data.user_id || null,
        title: data.title,
        message: data.message,
        type: data.type || 'general',
        related_record_id: data.related_record_id || null,
        related_record_type: data.related_record_type || null,
        is_read: Boolean(data.is_read),
        created_at: now,
      };

      const { data: inserted, error } = await supabase
        .from('notifications')
        .insert([payload])
        .select()
        .single();

      if (error) {
        localNotifications.unshift(localRecord);
        return { notification: localRecord, error: error.message };
      }

      const created = normalizeNotification(inserted || payload);
      localNotifications.unshift(created);
      return { notification: created };
    } catch (err: any) {
      localNotifications.unshift(localRecord);
      return { notification: localRecord, error: err?.message };
    }
  },

  /**
   * Mark a single notification as read
   */
  async markNotificationAsRead(id: string): Promise<{ success: boolean; error?: string }> {
    const item = localNotifications.find((n) => n.id === id);
    if (item) {
      item.is_read = true;
    }

    if (!isSupabaseConfigured) {
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  },

  /**
   * Mark all notifications as read for a user (or all if userId not specified)
   */
  async markAllNotificationsAsRead(userId?: string): Promise<{ success: boolean; error?: string }> {
    localNotifications.forEach((n) => {
      if (!userId || n.user_id === userId || !n.user_id) {
        n.is_read = true;
      }
    });

    if (!isSupabaseConfigured) {
      return { success: true };
    }

    try {
      let query = supabase.from('notifications').update({ is_read: true });
      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        query = query.neq('id', '00000000-0000-0000-0000-000000000000'); // updates all
      }

      const { error } = await query;
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  },
};
