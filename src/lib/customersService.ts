import { supabase, isSupabaseConfigured } from './supabase';
import { Customer, CustomerFormData } from '../types/customer';

// In-memory fallback dataset for development
let localCustomers: Customer[] = [
  {
    id: 'cust-1',
    lead_id: 'lead-1',
    company_name: 'Apex Healthcare Super Speciality',
    contact_person: 'Dr. Rakesh Verma',
    phone: '+91 98210 44521',
    email: 'purchase@apexhealth.in',
    location: 'Sector 62, Noida, UP',
    industry: 'Healthcare & Hospitals',
    customer_type: 'Business',
    gst_number: '07AAACA1122B1Z1',
    address: 'Plot 4, Institutional Area, Sector 62, Noida, UP 201309',
    assigned_to: 'Vikram Mehta',
    status: 'Active',
    notes: 'Major multi-speciality hospital account. Servicing 250 kVA DG set.',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'cust-2',
    lead_id: 'lead-2',
    company_name: 'Shree Balaji Textile Mills',
    contact_person: 'Anil Agarwal',
    phone: '+91 94140 33219',
    email: 'anil@balajitex.com',
    location: 'Bhiwadi Industrial Area, Rajasthan',
    industry: 'Manufacturing & Industrial',
    customer_type: 'Business',
    gst_number: '08BBBCA4455C1Z9',
    address: 'RIICO Industrial Area, Phase 3, Bhiwadi, Rajasthan 301019',
    assigned_to: 'Vikram Mehta',
    status: 'Active',
    notes: '500 kW Rooftop Solar under commissioning contract.',
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

function normalizeCustomer(row: Record<string, any>): Customer {
  return {
    id: String(row.id || crypto.randomUUID()),
    lead_id: row.lead_id || null,
    company_name: row.company_name || row.company || '',
    contact_person: row.contact_person || row.name || '',
    phone: row.phone || row.mobile || '',
    email: row.email || '',
    location: row.location || row.city || '',
    industry: row.industry || 'General',
    customer_type: row.customer_type || 'Business',
    gst_number: row.gst_number || '',
    address: row.address || '',
    assigned_to: row.assigned_to || 'Unassigned',
    status: row.status || 'Active',
    notes: row.notes || '',
    created_at: row.created_at || new Date().toISOString(),
    updated_at: row.updated_at || new Date().toISOString(),
  };
}

export const customersService = {
  /**
   * Fetch all customers
   */
  async getCustomers(): Promise<{ customers: Customer[]; isLive: boolean; error?: string }> {
    if (!isSupabaseConfigured) {
      return { customers: [...localCustomers], isLive: false };
    }

    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase getCustomers error, falling back locally:', error.message);
        return { customers: [...localCustomers], isLive: false, error: error.message };
      }

      if (data) {
        const normalized = data.map(normalizeCustomer);
        localCustomers = normalized;
        return { customers: normalized, isLive: true };
      }

      return { customers: [...localCustomers], isLive: true };
    } catch (err: any) {
      console.error('Failed to fetch customers:', err);
      return { customers: [...localCustomers], isLive: false, error: err?.message };
    }
  },

  /**
   * Fetch customer by ID
   */
  async getCustomerById(id: string): Promise<{ customer: Customer | null; error?: string }> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          return { customer: null, error: error.message };
        }
        if (data) {
          return { customer: normalizeCustomer(data) };
        }
      } catch (err: any) {
        console.warn('Error fetching customer by id:', err);
      }
    }

    const found = localCustomers.find((c) => c.id === id) || null;
    return { customer: found };
  },

  /**
   * Create a new customer record
   */
  async createCustomer(data: CustomerFormData): Promise<{ customer: Customer; success: boolean; error?: string }> {
    // Validation
    if (!data.phone?.trim()) {
      return { customer: {} as Customer, success: false, error: 'Customer phone number is required.' };
    }
    if (!data.company_name?.trim() && !data.contact_person?.trim()) {
      return { customer: {} as Customer, success: false, error: 'Either company name or contact person is required.' };
    }

    const newId = crypto.randomUUID();
    const now = new Date().toISOString();

    const localRecord: Customer = {
      id: newId,
      lead_id: data.lead_id || null,
      company_name: data.company_name || '',
      contact_person: data.contact_person || '',
      phone: data.phone,
      email: data.email || '',
      location: data.location || '',
      industry: data.industry || 'General',
      customer_type: data.customer_type || 'Business',
      gst_number: data.gst_number || '',
      address: data.address || '',
      assigned_to: data.assigned_to || 'Unassigned',
      status: data.status || 'Active',
      notes: data.notes || '',
      created_at: now,
      updated_at: now,
    };

    if (!isSupabaseConfigured) {
      localCustomers.unshift(localRecord);
      return { customer: localRecord, success: true };
    }

    try {
      const payload = {
        id: newId,
        lead_id: data.lead_id || null,
        company_name: data.company_name || null,
        contact_person: data.contact_person || null,
        phone: data.phone,
        email: data.email || null,
        location: data.location || null,
        industry: data.industry || 'General',
        customer_type: data.customer_type || 'Business',
        gst_number: data.gst_number || null,
        address: data.address || null,
        assigned_to: data.assigned_to || null,
        status: data.status || 'Active',
        notes: data.notes || null,
        created_at: now,
        updated_at: now,
      };

      const { data: inserted, error } = await supabase
        .from('customers')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.warn('Supabase createCustomer error, saving locally:', error.message);
        localCustomers.unshift(localRecord);
        return { customer: localRecord, success: true, error: error.message };
      }

      const created = normalizeCustomer(inserted || payload);
      localCustomers.unshift(created);
      return { customer: created, success: true };
    } catch (err: any) {
      console.error('Error inserting customer:', err);
      localCustomers.unshift(localRecord);
      return { customer: localRecord, success: true, error: err?.message };
    }
  },

  /**
   * Update an existing customer
   */
  async updateCustomer(id: string, updates: Partial<CustomerFormData>): Promise<{ customer: Customer | null; error?: string }> {
    const existingIndex = localCustomers.findIndex((c) => c.id === id);
    const existing = existingIndex !== -1 ? localCustomers[existingIndex] : null;

    const updatedLocal: Customer = {
      ...(existing || {
        id,
        company_name: '',
        contact_person: '',
        phone: '',
        email: '',
        location: '',
        industry: '',
        customer_type: 'Business',
        status: 'Active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (existingIndex !== -1) {
      localCustomers[existingIndex] = updatedLocal;
    }

    if (!isSupabaseConfigured) {
      return { customer: updatedLocal };
    }

    try {
      const payload: Record<string, any> = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('customers')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { customer: updatedLocal, error: error.message };
      }

      const normalized = normalizeCustomer(data || payload);
      if (existingIndex !== -1) {
        localCustomers[existingIndex] = normalized;
      }
      return { customer: normalized };
    } catch (err: any) {
      return { customer: updatedLocal, error: err?.message };
    }
  },

  /**
   * Delete a customer
   */
  async deleteCustomer(id: string): Promise<{ success: boolean; error?: string }> {
    localCustomers = localCustomers.filter((c) => c.id !== id);

    if (!isSupabaseConfigured) {
      return { success: true };
    }

    try {
      const { error } = await supabase.from('customers').delete().eq('id', id);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  },

  /**
   * Check whether a matching customer already exists (by lead_id, phone, email, or company name)
   */
  async findMatchingCustomer(criteria: {
    lead_id?: string | null;
    phone?: string;
    email?: string;
    company_name?: string;
  }): Promise<{ matched: boolean; customer: Customer | null; reason?: string }> {
    const cleanPhone = criteria.phone ? criteria.phone.replace(/[^0-9]/g, '') : '';
    const normEmail = criteria.email ? criteria.email.trim().toLowerCase() : '';
    const normCompany = criteria.company_name ? criteria.company_name.trim().toLowerCase() : '';

    // Check in local cache first
    for (const c of localCustomers) {
      if (criteria.lead_id && c.lead_id === criteria.lead_id) {
        return { matched: true, customer: c, reason: 'Already converted from this lead' };
      }
      if (cleanPhone && c.phone) {
        const cPhone = c.phone.replace(/[^0-9]/g, '');
        if (cPhone && (cPhone === cleanPhone || (cPhone.length >= 10 && cleanPhone.length >= 10 && cPhone.slice(-10) === cleanPhone.slice(-10)))) {
          return { matched: true, customer: c, reason: `Matches phone number: ${c.phone}` };
        }
      }
      if (normEmail && c.email && c.email.trim().toLowerCase() === normEmail) {
        return { matched: true, customer: c, reason: `Matches email address: ${c.email}` };
      }
      if (normCompany && c.company_name && c.company_name.trim().toLowerCase() === normCompany) {
        return { matched: true, customer: c, reason: `Matches company name: ${c.company_name}` };
      }
    }

    if (!isSupabaseConfigured) {
      return { matched: false, customer: null };
    }

    try {
      // Query Supabase for matching lead_id
      if (criteria.lead_id) {
        const { data } = await supabase.from('customers').select('*').eq('lead_id', criteria.lead_id).maybeSingle();
        if (data) {
          return { matched: true, customer: normalizeCustomer(data), reason: 'Already converted from this lead' };
        }
      }

      // Query Supabase for matching phone
      if (cleanPhone && cleanPhone.length >= 10) {
        const last10 = cleanPhone.slice(-10);
        const { data } = await supabase.from('customers').select('*').ilike('phone', `%${last10}%`).limit(1);
        if (data && data.length > 0) {
          return { matched: true, customer: normalizeCustomer(data[0]), reason: `Matches phone number: ${data[0].phone}` };
        }
      }

      // Query Supabase for matching email
      if (normEmail) {
        const { data } = await supabase.from('customers').select('*').ilike('email', normEmail).limit(1);
        if (data && data.length > 0) {
          return { matched: true, customer: normalizeCustomer(data[0]), reason: `Matches email address: ${data[0].email}` };
        }
      }

      // Query Supabase for matching company_name
      if (normCompany) {
        const { data } = await supabase.from('customers').select('*').ilike('company_name', normCompany).limit(1);
        if (data && data.length > 0) {
          return { matched: true, customer: normalizeCustomer(data[0]), reason: `Matches company name: ${data[0].company_name}` };
        }
      }

      return { matched: false, customer: null };
    } catch (err: any) {
      console.warn('Error querying matching customer in Supabase:', err);
      return { matched: false, customer: null };
    }
  },

  /**
   * Convert a qualified/won Lead into a Customer preventing duplicate conversion
   */
  async convertLeadToCustomer(leadId: string, additionalData?: Partial<CustomerFormData>): Promise<{ customer: Customer | null; success: boolean; error?: string; existingCustomer?: Customer }> {
    try {
      // Check duplicate matching first
      const match = await this.findMatchingCustomer({
        lead_id: leadId,
        phone: additionalData?.phone,
        email: additionalData?.email,
        company_name: additionalData?.company_name,
      });

      if (match.matched && match.customer) {
        return {
          customer: null,
          success: false,
          existingCustomer: match.customer,
          error: `Customer already exists (${match.reason}).`,
        };
      }

      // Create new customer linked to lead_id
      const payload: CustomerFormData = {
        lead_id: leadId,
        company_name: additionalData?.company_name || '',
        contact_person: additionalData?.contact_person || '',
        phone: additionalData?.phone || '',
        email: additionalData?.email || '',
        location: additionalData?.location || '',
        industry: additionalData?.industry || '',
        customer_type: additionalData?.customer_type || 'Business',
        gst_number: additionalData?.gst_number || '',
        address: additionalData?.address || additionalData?.location || '',
        assigned_to: additionalData?.assigned_to || '',
        status: 'Active',
        notes: `Converted from Lead ID ${leadId}. ${additionalData?.notes || ''}`,
      };

      return this.createCustomer(payload);
    } catch (err: any) {
      return { customer: null, success: false, error: err?.message || 'Lead conversion failed' };
    }
  },
};
