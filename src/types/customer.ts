export type CustomerType =
  | 'Business'
  | 'Individual'
  | 'Dealer'
  | 'Contractor'
  | 'Government'
  | 'Other';

export type CustomerStatus = 'Active' | 'Inactive' | 'Potential' | 'Closed';

export interface Customer {
  id: string;
  lead_id?: string | null;
  company_name: string;
  contact_person: string;
  phone: string;
  email?: string;
  location?: string;
  industry?: string;
  customer_type: CustomerType;
  gst_number?: string;
  address?: string;
  assigned_to?: string;
  status: CustomerStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerFormData {
  lead_id?: string | null;
  company_name?: string;
  contact_person?: string;
  phone: string;
  email?: string;
  location?: string;
  industry?: string;
  customer_type?: CustomerType;
  gst_number?: string;
  address?: string;
  assigned_to?: string;
  status?: CustomerStatus;
  notes?: string;
}
