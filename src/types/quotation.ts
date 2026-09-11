export type QuotationStatus =
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'negotiation'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'Draft'
  | 'Sent'
  | 'Viewed'
  | 'Negotiation'
  | 'Accepted'
  | 'Rejected'
  | 'Expired';

export interface QuotationItem {
  id: string;
  quotation_id: string;
  item_name: string;
  description?: string | null;
  quantity: number;
  unit_price: number;
  total: number;
  unit?: string;
  discount?: number;
  tax?: number;
  created_at?: string;
}

export interface QuotationItemFormData {
  id?: string;
  quotation_id?: string;
  item_name: string;
  description?: string | null;
  quantity: number;
  unit_price: number;
  total?: number;
  unit?: string;
  discount?: number;
  tax?: number;
}

export interface Quotation {
  id: string;
  quotation_number: string;
  customer_id: string;
  lead_id?: string | null;
  title: string;
  description?: string | null;
  amount: number; // Subtotal before tax
  tax: number; // Tax amount in currency
  total: number; // amount + tax
  status: QuotationStatus;
  valid_until?: string | null;
  project_id?: string | null;
  created_at: string;
  updated_at?: string;

  // Joined relational data & display helpers
  customer_name?: string;
  customer?: {
    id?: string;
    company_name?: string;
    contact_person?: string;
    phone?: string;
    email?: string;
    address?: string;
    location?: string;
    gst_number?: string;
  } | null;
  lead?: {
    id?: string;
    company_name?: string;
    contact_person?: string;
    phone?: string;
    email?: string;
    source?: string;
    status?: string;
  } | null;
  project?: {
    id?: string;
    project_name?: string;
    status?: string;
  } | null;
  items?: QuotationItem[];

  // Backward compatibility fields
  subtotal?: number;
  discount?: number;
  notes?: string;
  validity_date?: string | null;
  quotation_date?: string;
  created_by?: string;
}

export interface QuotationFormData {
  quotation_number: string;
  customer_id: string;
  customer_name?: string;
  lead_id?: string | null;
  project_id?: string | null;
  title: string;
  description?: string | null;
  amount?: number;
  tax?: number;
  tax_rate?: number; // In percentage (e.g. 18 for 18%)
  total?: number;
  status?: QuotationStatus;
  valid_until?: string | null;
  items?: QuotationItemFormData[];

  // Backward compatibility fields
  subtotal?: number;
  discount?: number;
  notes?: string;
  validity_date?: string | null;
  quotation_date?: string;
  created_by?: string;
}

export function getStatusLabel(status: string | undefined): string {
  if (!status) return 'Draft';
  const s = status.toLowerCase();
  switch (s) {
    case 'draft':
      return 'Draft';
    case 'sent':
      return 'Sent';
    case 'viewed':
      return 'Viewed';
    case 'negotiation':
      return 'Negotiation';
    case 'accepted':
      return 'Accepted';
    case 'rejected':
      return 'Rejected';
    case 'expired':
      return 'Expired';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

export function isQuotationExpired(quotation: {
  valid_until?: string | null;
  validity_date?: string | null;
  status: string;
}): boolean {
  const normStatus = (quotation.status || '').toLowerCase();
  if (normStatus === 'accepted' || normStatus === 'rejected') {
    return false;
  }
  if (normStatus === 'expired') {
    return true;
  }
  const dateStr = quotation.valid_until || quotation.validity_date;
  if (!dateStr) return false;
  const validUntilDate = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return validUntilDate < now;
}

export function getStatusBadgeClass(status: string | undefined, isExpired = false): string {
  if (isExpired) {
    return 'bg-amber-100 text-amber-800 border-amber-300';
  }
  const s = (status || 'draft').toLowerCase();
  switch (s) {
    case 'draft':
      return 'bg-slate-100 text-slate-700 border-slate-300';
    case 'sent':
      return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'viewed':
      return 'bg-purple-100 text-purple-700 border-purple-300';
    case 'negotiation':
      return 'bg-amber-100 text-amber-700 border-amber-300';
    case 'accepted':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    case 'rejected':
      return 'bg-rose-100 text-rose-700 border-rose-300';
    case 'expired':
      return 'bg-orange-100 text-orange-800 border-orange-300';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-300';
  }
}

export function formatINR(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
}
