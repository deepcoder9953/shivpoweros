import { supabase, isSupabaseConfigured } from './supabase';
import { ActivityRecord, ActivityFormData } from '../types/activity';

let localActivities: ActivityRecord[] = [
  {
    id: 'act-1',
    user_id: null,
    lead_id: 'lead-1',
    customer_id: 'cust-1',
    project_id: 'proj-2',
    quotation_id: 'quote-1',
    action: 'Quotation Generated',
    description: 'Generated quotation SPS-2026-0042 for ₹21,24,000/- for 250 kVA DG Set with AMF Panel.',
    performed_by: 'Vikram Mehta',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'act-2',
    user_id: null,
    lead_id: 'lead-2',
    customer_id: 'cust-2',
    project_id: 'proj-1',
    quotation_id: null,
    action: 'Site Survey Completed',
    description: 'Structural load test verified on shed roofs. Shadow analysis reports positive irradiation.',
    performed_by: 'Deepak Sharma',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
];

function normalizeActivity(row: Record<string, any>): ActivityRecord {
  return {
    id: String(row.id || crypto.randomUUID()),
    user_id: row.user_id || null,
    lead_id: row.lead_id || null,
    customer_id: row.customer_id || null,
    project_id: row.project_id || null,
    quotation_id: row.quotation_id || null,
    action: row.action || 'Log',
    description: row.description || '',
    performed_by: row.performed_by || 'Staff',
    created_at: row.created_at || new Date().toISOString(),
  };
}

export const activitiesService = {
  /**
   * Fetch all activities globally
   */
  async getActivities(): Promise<{ activities: ActivityRecord[]; isLive: boolean; error?: string }> {
    if (!isSupabaseConfigured) {
      return { activities: [...localActivities], isLive: false };
    }

    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.warn('Supabase getActivities error, using fallback:', error.message);
        return { activities: [...localActivities], isLive: false, error: error.message };
      }

      if (data) {
        const normalized = data.map(normalizeActivity);
        localActivities = normalized;
        return { activities: normalized, isLive: true };
      }

      return { activities: [...localActivities], isLive: true };
    } catch (err: any) {
      console.error('Failed to fetch activities:', err);
      return { activities: [...localActivities], isLive: false, error: err?.message };
    }
  },

  /**
   * Fetch activities for a specific lead
   */
  async getActivitiesByLead(leadId: string): Promise<{ activities: ActivityRecord[]; error?: string }> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .eq('lead_id', leadId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          return { activities: data.map(normalizeActivity) };
        }
      } catch (err: any) {
        console.warn('Error fetching lead activities:', err);
      }
    }

    const matched = localActivities.filter((a) => a.lead_id === leadId);
    return { activities: matched };
  },

  /**
   * Fetch activities for a specific customer
   */
  async getActivitiesByCustomer(customerId: string): Promise<{ activities: ActivityRecord[]; error?: string }> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          return { activities: data.map(normalizeActivity) };
        }
      } catch (err: any) {
        console.warn('Error fetching customer activities:', err);
      }
    }

    const matched = localActivities.filter((a) => a.customer_id === customerId);
    return { activities: matched };
  },

  /**
   * Fetch activities for a specific project
   */
  async getActivitiesByProject(projectId: string): Promise<{ activities: ActivityRecord[]; error?: string }> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          return { activities: data.map(normalizeActivity) };
        }
      } catch (err: any) {
        console.warn('Error fetching project activities:', err);
      }
    }

    const matched = localActivities.filter((a) => a.project_id === projectId);
    return { activities: matched };
  },

  /**
   * Create an activity entry
   */
  async createActivity(data: ActivityFormData): Promise<{ activity: ActivityRecord; error?: string }> {
    if (!data.action?.trim()) {
      return { activity: {} as ActivityRecord, error: 'Activity action is required.' };
    }
    if (!data.description?.trim()) {
      return { activity: {} as ActivityRecord, error: 'Activity description is required.' };
    }

    const newId = crypto.randomUUID();
    const now = new Date().toISOString();

    const localRecord: ActivityRecord = {
      id: newId,
      user_id: data.user_id || null,
      lead_id: data.lead_id || null,
      customer_id: data.customer_id || null,
      project_id: data.project_id || null,
      quotation_id: data.quotation_id || null,
      action: data.action,
      description: data.description,
      performed_by: data.performed_by || 'Staff',
      created_at: now,
    };

    if (!isSupabaseConfigured) {
      localActivities.unshift(localRecord);
      return { activity: localRecord };
    }

    try {
      const payload = {
        id: newId,
        user_id: data.user_id || null,
        lead_id: data.lead_id || null,
        customer_id: data.customer_id || null,
        project_id: data.project_id || null,
        quotation_id: data.quotation_id || null,
        action: data.action,
        description: data.description,
        performed_by: data.performed_by || 'Staff',
        created_at: now,
      };

      const { data: inserted, error } = await supabase
        .from('activities')
        .insert([payload])
        .select()
        .single();

      if (error) {
        localActivities.unshift(localRecord);
        return { activity: localRecord, error: error.message };
      }

      const created = normalizeActivity(inserted || payload);
      localActivities.unshift(created);
      return { activity: created };
    } catch (err: any) {
      localActivities.unshift(localRecord);
      return { activity: localRecord, error: err?.message };
    }
  },

  /**
   * Log an activity (alias for createActivity)
   */
  async logActivity(data: ActivityFormData): Promise<{ activity: ActivityRecord; error?: string }> {
    return this.createActivity(data);
  },
};
