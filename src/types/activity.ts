export interface ActivityRecord {
  id: string;
  user_id?: string | null;
  lead_id?: string | null;
  customer_id?: string | null;
  project_id?: string | null;
  quotation_id?: string | null;
  action: string;
  description: string;
  performed_by?: string;
  created_at: string;
}

export interface ActivityFormData {
  user_id?: string | null;
  lead_id?: string | null;
  customer_id?: string | null;
  project_id?: string | null;
  quotation_id?: string | null;
  action: string;
  description: string;
  performed_by?: string;
}
