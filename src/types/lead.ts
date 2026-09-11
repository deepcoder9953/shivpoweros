export type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'Qualified'
  | 'Proposal Sent'
  | 'Negotiation'
  | 'Won'
  | 'Lost';

export type LeadSource =
  | 'JustDial'
  | 'Website'
  | 'WhatsApp'
  | 'Facebook'
  | 'Instagram'
  | 'Google'
  | 'Referral'
  | 'Cold Outreach'
  | 'Other';

export interface Lead {
  id: string;
  company_name: string;
  contact_person: string;
  phone: string;
  email: string;
  location: string;
  industry: string;
  source?: LeadSource;
  lead_source: LeadSource; // Primary for UI components
  requirement: string;
  status: LeadStatus;
  lead_score: number;
  notes: string;
  assigned_to: string;
  assigned_user_name?: string;
  created_at: string;
  updated_at: string;
}

export interface LeadFormData {
  company_name: string;
  contact_person: string;
  phone: string;
  email?: string;
  location?: string;
  industry?: string;
  source?: LeadSource;
  lead_source: LeadSource;
  requirement: string;
  status: LeadStatus;
  lead_score?: number;
  notes?: string;
  assigned_to: string;
}

export interface LeadActivity {
  id: string;
  lead_id: string;
  action: string;
  description: string;
  performed_by?: string;
  created_at: string;
}

export interface FollowUp {
  id: string;
  lead_id: string;
  scheduled_at: string;
  type: 'Call' | 'Meeting' | 'Site Visit' | 'WhatsApp' | 'Email';
  notes: string;
  status: 'Pending' | 'Completed' | 'Missed' | 'Cancelled';
  created_at: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}
