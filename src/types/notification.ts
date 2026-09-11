export type NotificationType =
  | 'new_lead'
  | 'followup_reminder'
  | 'quote_update'
  | 'task_due'
  | 'customer_conversion'
  | 'general';

export interface NotificationRecord {
  id: string;
  user_id?: string | null;
  title: string;
  message: string;
  type: NotificationType;
  related_record_id?: string | null;
  related_record_type?: string | null;
  is_read: boolean;
  created_at: string;
}

export interface NotificationFormData {
  user_id?: string | null;
  title: string;
  message: string;
  type?: NotificationType;
  related_record_id?: string | null;
  related_record_type?: string | null;
  is_read?: boolean;
}
