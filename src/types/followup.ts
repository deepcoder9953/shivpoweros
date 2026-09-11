export type FollowupType =
  | 'Call'
  | 'WhatsApp'
  | 'Email'
  | 'Meeting'
  | 'Visit'
  | 'Other';

export type FollowupStatus = 'Pending' | 'Completed' | 'Cancelled' | 'Rescheduled';

export interface FollowupRecord {
  id: string;
  lead_id?: string | null;
  customer_id?: string | null;
  assigned_to?: string;
  followup_date: string;
  followup_type: FollowupType;
  subject?: string;
  notes?: string;
  status: FollowupStatus;
  created_at: string;
  updated_at: string;
  lead_name?: string;
  customer_name?: string;
}

export interface FollowupFormData {
  lead_id?: string | null;
  customer_id?: string | null;
  assigned_to?: string;
  followup_date: string;
  followup_type?: FollowupType;
  subject?: string;
  notes?: string;
  status?: FollowupStatus;
}
