import { supabase, isSupabaseConfigured } from './supabase';
import { FollowupRecord, FollowupFormData } from '../types/followup';

let localFollowups: FollowupRecord[] = [
  {
    id: 'fol-1',
    lead_id: 'lead-1',
    customer_id: null,
    lead_name: 'Apex Healthcare Super Speciality',
    assigned_to: 'Vikram Mehta (Sales Lead)',
    followup_date: new Date(Date.now() + 1 * 86400000).toISOString(),
    followup_type: 'Call',
    subject: 'Quotation review call with Hospital Director',
    notes: 'Clarify Cummins DG set warranty terms and AMF panel auto-changeover duration.',
    status: 'Pending',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'fol-2',
    lead_id: 'lead-2',
    customer_id: null,
    lead_name: 'Shree Balaji Textile Mills',
    assigned_to: 'Deepak Sharma (Sr. Engineer)',
    followup_date: new Date(Date.now() + 3 * 86400000).toISOString(),
    followup_type: 'Visit',
    subject: 'Rooftop structural shadow analysis site visit',
    notes: 'Take drone footage and verify cable route length from roof shed to main LT panel.',
    status: 'Pending',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

function normalizeFollowup(row: Record<string, any>): FollowupRecord {
  return {
    id: String(row.id || crypto.randomUUID()),
    lead_id: row.lead_id || null,
    customer_id: row.customer_id || null,
    lead_name: row.lead?.company_name || row.lead?.contact_person || row.lead_name || undefined,
    customer_name: row.customer?.company_name || row.customer_name || undefined,
    assigned_to: row.assigned_to || 'Unassigned',
    followup_date: row.followup_date || row.scheduled_at || new Date().toISOString(),
    followup_type: row.followup_type || row.type || 'Call',
    subject: row.subject || '',
    notes: row.notes || '',
    status: row.status || 'Pending',
    created_at: row.created_at || new Date().toISOString(),
    updated_at: row.updated_at || new Date().toISOString(),
  };
}

export const followupsService = {
  /**
   * Fetch all followups with lead/customer context
   */
  async getFollowups(): Promise<{ followups: FollowupRecord[]; isLive: boolean; error?: string }> {
    if (!isSupabaseConfigured) {
      return { followups: [...localFollowups], isLive: false };
    }

    try {
      const { data, error } = await supabase
        .from('followups')
        .select('*, lead:leads(company_name, contact_person), customer:customers(company_name, contact_person)')
        .order('followup_date', { ascending: true });

      if (error) {
        console.warn('Supabase getFollowups error, fallback to local:', error.message);
        return { followups: [...localFollowups], isLive: false, error: error.message };
      }

      if (data) {
        const normalized = data.map(normalizeFollowup);
        localFollowups = normalized;
        return { followups: normalized, isLive: true };
      }

      return { followups: [...localFollowups], isLive: true };
    } catch (err: any) {
      console.error('Failed to fetch followups:', err);
      return { followups: [...localFollowups], isLive: false, error: err?.message };
    }
  },

  /**
   * Fetch single followup by ID
   */
  async getFollowupById(id: string): Promise<{ followup: FollowupRecord | null; error?: string }> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('followups')
          .select('*, lead:leads(company_name, contact_person), customer:customers(company_name, contact_person)')
          .eq('id', id)
          .single();

        if (error) {
          return { followup: null, error: error.message };
        }
        if (data) {
          return { followup: normalizeFollowup(data) };
        }
      } catch (err: any) {
        console.warn('Error fetching followup by id:', err);
      }
    }

    const found = localFollowups.find((f) => f.id === id) || null;
    return { followup: found };
  },

  /**
   * Create a followup
   */
  async createFollowup(data: FollowupFormData): Promise<{ followup: FollowupRecord; error?: string }> {
    if (!data.followup_date) {
      return { followup: {} as FollowupRecord, error: 'Followup date and time are required.' };
    }
    if (!data.lead_id && !data.customer_id) {
      return { followup: {} as FollowupRecord, error: 'Followup must be associated with a Lead or a Customer.' };
    }

    const newId = crypto.randomUUID();
    const now = new Date().toISOString();

    const localRecord: FollowupRecord = {
      id: newId,
      lead_id: data.lead_id || null,
      customer_id: data.customer_id || null,
      assigned_to: data.assigned_to || 'Unassigned',
      followup_date: data.followup_date,
      followup_type: data.followup_type || 'Call',
      subject: data.subject || '',
      notes: data.notes || '',
      status: data.status || 'Pending',
      created_at: now,
      updated_at: now,
    };

    if (!isSupabaseConfigured) {
      localFollowups.unshift(localRecord);
      return { followup: localRecord };
    }

    try {
      const payload = {
        id: newId,
        lead_id: data.lead_id || null,
        customer_id: data.customer_id || null,
        assigned_to: data.assigned_to || null,
        followup_date: data.followup_date,
        followup_type: data.followup_type || 'Call',
        subject: data.subject || null,
        notes: data.notes || null,
        status: data.status || 'Pending',
        created_at: now,
        updated_at: now,
      };

      const { data: inserted, error } = await supabase
        .from('followups')
        .insert([payload])
        .select()
        .single();

      if (error) {
        localFollowups.unshift(localRecord);
        return { followup: localRecord, error: error.message };
      }

      const created = normalizeFollowup(inserted || payload);
      localFollowups.unshift(created);
      return { followup: created };
    } catch (err: any) {
      localFollowups.unshift(localRecord);
      return { followup: localRecord, error: err?.message };
    }
  },

  /**
   * Update a followup
   */
  async updateFollowup(id: string, updates: Partial<FollowupFormData>): Promise<{ followup: FollowupRecord | null; error?: string }> {
    const existingIndex = localFollowups.findIndex((f) => f.id === id);
    const existing = existingIndex !== -1 ? localFollowups[existingIndex] : null;

    const updatedLocal: FollowupRecord = {
      ...(existing || {
        id,
        followup_date: new Date().toISOString(),
        followup_type: 'Call',
        status: 'Pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (existingIndex !== -1) {
      localFollowups[existingIndex] = updatedLocal;
    }

    if (!isSupabaseConfigured) {
      return { followup: updatedLocal };
    }

    try {
      const payload: Record<string, any> = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('followups')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { followup: updatedLocal, error: error.message };
      }

      const normalized = normalizeFollowup(data || payload);
      if (existingIndex !== -1) {
        localFollowups[existingIndex] = normalized;
      }
      return { followup: normalized };
    } catch (err: any) {
      return { followup: updatedLocal, error: err?.message };
    }
  },

  /**
   * Fetch followups for a specific lead
   */
  async getFollowupsByLead(leadId: string): Promise<{ followups: FollowupRecord[]; error?: string }> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('followups')
          .select('*, lead:leads(company_name, contact_person)')
          .eq('lead_id', leadId)
          .order('followup_date', { ascending: true });

        if (!error && data) {
          return { followups: data.map(normalizeFollowup) };
        }
      } catch (err: any) {
        console.warn('Error fetching lead followups:', err);
      }
    }

    const matched = localFollowups.filter((f) => f.lead_id === leadId);
    return { followups: matched };
  },

  /**
   * Fetch followups for a specific customer
   */
  async getFollowupsByCustomer(customerId: string): Promise<{ followups: FollowupRecord[]; error?: string }> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('followups')
          .select('*, customer:customers(company_name, contact_person)')
          .eq('customer_id', customerId)
          .order('followup_date', { ascending: true });

        if (!error && data) {
          return { followups: data.map(normalizeFollowup) };
        }
      } catch (err: any) {
        console.warn('Error fetching customer followups:', err);
      }
    }

    const matched = localFollowups.filter((f) => f.customer_id === customerId);
    return { followups: matched };
  },

  /**
   * Mark a followup as completed
   */
  async completeFollowup(id: string, completionNotes?: string): Promise<{ followup: FollowupRecord | null; error?: string }> {
    const existing = localFollowups.find((f) => f.id === id);
    const notes = completionNotes
      ? existing?.notes ? `${existing.notes} | Completed: ${completionNotes}` : `Completed: ${completionNotes}`
      : existing?.notes;

    return this.updateFollowup(id, {
      status: 'Completed',
      notes,
    });
  },

  /**
   * Delete a followup
   */
  async deleteFollowup(id: string): Promise<{ success: boolean; error?: string }> {
    localFollowups = localFollowups.filter((f) => f.id !== id);

    if (!isSupabaseConfigured) {
      return { success: true };
    }

    try {
      const { error } = await supabase.from('followups').delete().eq('id', id);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  },
};
