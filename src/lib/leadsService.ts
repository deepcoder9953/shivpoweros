import { supabase, isSupabaseConfigured } from './supabase';
import { Lead, LeadFormData, LeadActivity, FollowUp, TeamMember, LeadStatus, LeadSource } from '../types/lead';

// Seed demo data for Shiv Power Solution when Supabase is connecting or as fallback
const INITIAL_DEMO_LEADS: Lead[] = [
  {
    id: 'lead-1',
    company_name: 'Apex Healthcare Super Speciality',
    contact_person: 'Dr. Rakesh Verma',
    phone: '+91 98210 44521',
    email: 'purchase@apexhealth.in',
    location: 'Sector 62, Noida, UP',
    industry: 'Healthcare & Hospitals',
    lead_source: 'Website',
    requirement: '250 kVA Silent CPCB IV+ DG Set with AMF Panel for critical ICU backup.',
    status: 'Proposal Sent',
    lead_score: 92,
    notes: 'Urgent requirement. Hospital expansion opening next month. Prefers Cummins or Kirloskar.',
    assigned_to: 'Vikram Mehta (Sales Lead)',
    assigned_user_name: 'Vikram Mehta',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'lead-2',
    company_name: 'Shree Balaji Textile Mills',
    contact_person: 'Anil Agarwal',
    phone: '+91 94140 33219',
    email: 'anil@balajitex.com',
    location: 'Bhiwadi Industrial Area, Rajasthan',
    industry: 'Manufacturing & Industrial',
    lead_source: 'JustDial',
    requirement: '500 kW Rooftop Solar Power Plant + 380 kVA DG Synchronisation.',
    status: 'Qualified',
    lead_score: 85,
    notes: 'Power tariff is ₹9.20/unit from discom. Looking for solar PPA or capex model with net metering.',
    assigned_to: 'Vikram Mehta (Sales Lead)',
    assigned_user_name: 'Vikram Mehta',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'lead-3',
    company_name: 'Skyline IT Towers',
    contact_person: 'Pooja Deshmukh',
    phone: '+91 97654 11098',
    email: 'facilities@skylineitpark.com',
    location: 'Cyber City, Gurugram, Haryana',
    industry: 'Data Centers & IT Parks',
    lead_source: 'Google',
    requirement: '120 kVA Modular 3-Phase Online UPS with 30 min Li-ion battery bank.',
    status: 'Negotiation',
    lead_score: 88,
    notes: 'Negotiating payment terms and warranty period. Annual Maintenance Contract (AMC) included.',
    assigned_to: 'Deepak Sharma (Sr. Engineer)',
    assigned_user_name: 'Deepak Sharma',
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'lead-4',
    company_name: 'Grand Hyatt Convention Hub',
    contact_person: 'Siddharth Rao',
    phone: '+91 98801 77234',
    email: 'siddharth@grandhyatthub.com',
    location: 'Aerocity, New Delhi',
    industry: 'Hospitality & Hotels',
    lead_source: 'Referral',
    requirement: '2x 500 kVA DG Sets with Acoustic Enclosure & Auto Synchronizing Panel.',
    status: 'New',
    lead_score: 74,
    notes: 'Referred by Sharma Electricals. Needs site visit survey next Tuesday morning.',
    assigned_to: 'Priya Nair (Sales Engineer)',
    assigned_user_name: 'Priya Nair',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'lead-5',
    company_name: 'Kisan Agro Cold Storage',
    contact_person: 'Mahesh Patil',
    phone: '+91 99234 55671',
    email: 'kisanagro.store@gmail.com',
    location: 'Karnal, Haryana',
    industry: 'Agriculture & Cold Storage',
    lead_source: 'WhatsApp',
    requirement: '160 kVA CPCB IV+ DG set on rental or purchase for potato season.',
    status: 'Contacted',
    lead_score: 65,
    notes: 'Initial contact made. Shared technical brochure. Awaiting load sheet from their technician.',
    assigned_to: 'Priya Nair (Sales Engineer)',
    assigned_user_name: 'Priya Nair',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'lead-6',
    company_name: 'Delhi Public School Campus 2',
    contact_person: 'Surender Negi',
    phone: '+91 98101 22345',
    email: 'admin@dpscampus2.edu.in',
    location: 'Greater Noida, UP',
    industry: 'Educational Institutes',
    lead_source: 'Cold Outreach',
    requirement: '82.5 kVA Silent Generator for school laboratories and administrative wing.',
    status: 'Won',
    lead_score: 95,
    notes: 'PO issued #PO-DPS-2026-89. Commissioning scheduled for 15th of this month.',
    assigned_to: 'Deepak Sharma (Sr. Engineer)',
    assigned_user_name: 'Deepak Sharma',
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  }
];

export const DEFAULT_TEAM_MEMBERS: TeamMember[] = [
  { id: 'user-1', name: 'Vikram Mehta', email: 'vikram@shivpowersolutions.com', role: 'Sales Lead' },
  { id: 'user-2', name: 'Deepak Sharma', email: 'deepak@shivpowersolutions.com', role: 'Sr. Power Solutions Engineer' },
  { id: 'user-3', name: 'Priya Nair', email: 'priya@shivpowersolutions.com', role: 'Technical Sales Consultant' },
  { id: 'user-4', name: 'Amit Solanki', email: 'amit@shivpowersolutions.com', role: 'Field Project Manager' },
];

// Local in-memory cache for fallback and optimistic UI updates
let localLeads: Lead[] = [...INITIAL_DEMO_LEADS];
let localActivities: Record<string, LeadActivity[]> = {
  'lead-1': [
    {
      id: 'act-1',
      lead_id: 'lead-1',
      action: 'Proposal Sent',
      description: 'Submitted techno-commercial quote #SPS-QT-2026-104 for 250kVA Cummins DG Set with AMF.',
      performed_by: 'Vikram Mehta',
      created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: 'act-2',
      lead_id: 'lead-1',
      action: 'Lead Created',
      description: 'Lead captured via Website contact form.',
      performed_by: 'System',
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
  ],
};

let localFollowUps: Record<string, FollowUp[]> = {
  'lead-1': [
    {
      id: 'fup-1',
      lead_id: 'lead-1',
      scheduled_at: new Date(Date.now() + 2 * 86400000).toISOString(),
      type: 'Meeting',
      notes: 'Finalize AMC terms and discount structure with hospital director.',
      status: 'Pending',
      created_at: new Date().toISOString(),
    },
  ],
  'lead-4': [
    {
      id: 'fup-2',
      lead_id: 'lead-4',
      scheduled_at: new Date(Date.now() + 1 * 86400000).toISOString(),
      type: 'Site Visit',
      notes: 'Site survey to inspect acoustic room and DG foundation slab.',
      status: 'Pending',
      created_at: new Date().toISOString(),
    },
  ],
};

// Cached table column map detected from Supabase schema
let detectedColumnMap: Record<string, string> | null = null;

/**
 * Normalizes any Supabase record to our standard frontend Lead interface
 */
function normalizeDbLead(row: Record<string, any>): Lead {
  return {
    id: String(row.id || row.lead_id || crypto.randomUUID()),
    company_name: row.company_name || row.company || row.client_name || '',
    contact_person: row.contact_person || row.contact_name || row.name || '',
    phone: row.phone || row.mobile || row.contact_no || '',
    email: row.email || '',
    location: row.location || row.city || row.address || '',
    industry: row.industry || row.industry_type || 'General',
    source: (row.source || row.lead_source || 'Website') as LeadSource,
    lead_source: (row.source || row.lead_source || 'Website') as LeadSource,
    requirement: row.requirement || row.description || row.power_requirement || '',
    status: (row.status || 'New') as LeadStatus,
    lead_score: Number(row.lead_score || row.score || 50),
    notes: row.notes || row.comments || '',
    assigned_to: row.assigned_to || row.assigned_user || 'Unassigned',
    assigned_user_name: row.assigned_user_name || row.assigned_to || 'Unassigned',
    created_at: row.created_at || row.created_date || new Date().toISOString(),
    updated_at: row.updated_at || row.updated_date || new Date().toISOString(),
  };
}

/**
 * Inspects the schema dynamically from Supabase
 */
async function detectSchema(): Promise<Record<string, string>> {
  if (detectedColumnMap) return detectedColumnMap;

  const mapping: Record<string, string> = {
    company_name: 'company_name',
    contact_person: 'contact_person',
    phone: 'phone',
    email: 'email',
    location: 'location',
    industry: 'industry',
    lead_source: 'source',
    requirement: 'requirement',
    status: 'status',
    lead_score: 'lead_score',
    notes: 'notes',
    assigned_to: 'assigned_to',
    created_at: 'created_at',
    updated_at: 'updated_at',
  };

  if (!isSupabaseConfigured) {
    detectedColumnMap = mapping;
    return mapping;
  }

  try {
    const { data, error } = await supabase.from('leads').select('*').limit(1);
    if (!error && data && data.length > 0) {
      const keys = Object.keys(data[0]);
      if (keys.includes('company') && !keys.includes('company_name')) mapping.company_name = 'company';
      if (keys.includes('contact_name') && !keys.includes('contact_person')) mapping.contact_person = 'contact_name';
      if (keys.includes('name') && !keys.includes('contact_person') && !keys.includes('contact_name')) mapping.contact_person = 'name';
      if (keys.includes('mobile') && !keys.includes('phone')) mapping.phone = 'mobile';
      if (keys.includes('city') && !keys.includes('location')) mapping.location = 'city';
      if (keys.includes('source')) mapping.lead_source = 'source';
      else if (keys.includes('lead_source')) mapping.lead_source = 'lead_source';
      if (keys.includes('score') && !keys.includes('lead_score')) mapping.lead_score = 'score';
      if (keys.includes('created_date') && !keys.includes('created_at')) mapping.created_at = 'created_date';
      if (keys.includes('updated_date') && !keys.includes('updated_at')) mapping.updated_at = 'updated_date';
    }
  } catch (err) {
    console.warn('Could not inspect leads schema dynamically, using standard column mapping:', err);
  }

  detectedColumnMap = mapping;
  return mapping;
}

/**
 * Maps LeadFormData to actual DB columns
 */
async function mapLeadToDbPayload(lead: Partial<LeadFormData>): Promise<Record<string, any>> {
  const colMap = await detectSchema();
  const payload: Record<string, any> = {};

  if (lead.company_name !== undefined) payload[colMap.company_name] = lead.company_name;
  if (lead.contact_person !== undefined) payload[colMap.contact_person] = lead.contact_person;
  if (lead.phone !== undefined) payload[colMap.phone] = lead.phone;
  if (lead.email !== undefined) payload[colMap.email] = lead.email;
  if (lead.location !== undefined) payload[colMap.location] = lead.location;
  if (lead.industry !== undefined) payload[colMap.industry] = lead.industry;
  if (lead.source !== undefined || lead.lead_source !== undefined) {
    payload[colMap.lead_source] = lead.source || lead.lead_source;
  }
  if (lead.requirement !== undefined) payload[colMap.requirement] = lead.requirement;
  if (lead.status !== undefined) payload[colMap.status] = lead.status;
  if (lead.lead_score !== undefined) payload[colMap.lead_score] = lead.lead_score;
  if (lead.notes !== undefined) payload[colMap.notes] = lead.notes;
  if (lead.assigned_to !== undefined) payload[colMap.assigned_to] = lead.assigned_to;
  payload[colMap.updated_at] = new Date().toISOString();

  return payload;
}

export const leadsService = {
  /**
   * Fetch all leads with optional search and filters
   */
  async getLeads(): Promise<{ leads: Lead[]; isLive: boolean; error?: string }> {
    if (!isSupabaseConfigured) {
      return { leads: [...localLeads], isLive: false };
    }

    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase getLeads error, using fallback:', error.message);
        return { leads: [...localLeads], isLive: false, error: error.message };
      }

      if (data && data.length > 0) {
        const normalized = data.map(normalizeDbLead);
        // Sync local cache
        localLeads = normalized;
        return { leads: normalized, isLive: true };
      } else {
        // Table is currently empty; provide the seed leads so user sees a functional dashboard
        return { leads: [...localLeads], isLive: true };
      }
    } catch (err: any) {
      console.error('Failed to fetch leads from Supabase:', err);
      return { leads: [...localLeads], isLive: false, error: err?.message || 'Connection failed' };
    }
  },

  /**
   * Fetch single lead by ID
   */
  async getLeadById(id: string): Promise<Lead | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('leads').select('*').eq('id', id).single();
        if (!error && data) {
          return normalizeDbLead(data);
        }
      } catch (err) {
        console.warn('Error fetching lead by id from Supabase:', err);
      }
    }
    return localLeads.find((l) => l.id === id) || null;
  },

  /**
   * Search leads across company, contact person, phone, email, location, or requirement
   */
  async searchLeads(searchTerm: string): Promise<{ leads: Lead[]; error?: string }> {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return this.getLeads();

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .or(`company_name.ilike.%${term}%,contact_person.ilike.%${term}%,phone.ilike.%${term}%,email.ilike.%${term}%,location.ilike.%${term}%,requirement.ilike.%${term}%`);

        if (!error && data) {
          return { leads: data.map(normalizeDbLead) };
        }
      } catch (err: any) {
        console.warn('Supabase search error, falling back to local search:', err);
      }
    }

    const matched = localLeads.filter((l) =>
      l.company_name?.toLowerCase().includes(term) ||
      l.contact_person?.toLowerCase().includes(term) ||
      l.phone?.toLowerCase().includes(term) ||
      l.email?.toLowerCase().includes(term) ||
      l.location?.toLowerCase().includes(term) ||
      l.requirement?.toLowerCase().includes(term)
    );
    return { leads: matched };
  },

  /**
   * Filter leads with multi-criteria filters
   */
  async filterLeads(filters: {
    status?: string;
    source?: string;
    industry?: string;
    assigned_to?: string;
    minScore?: number;
    maxScore?: number;
  }): Promise<{ leads: Lead[]; error?: string }> {
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('leads').select('*');
        if (filters.status && filters.status !== 'all') query = query.eq('status', filters.status);
        if (filters.source && filters.source !== 'all') query = query.eq('source', filters.source);
        if (filters.industry && filters.industry !== 'all') query = query.eq('industry', filters.industry);
        if (filters.assigned_to && filters.assigned_to !== 'all') query = query.eq('assigned_to', filters.assigned_to);
        if (filters.minScore !== undefined) query = query.gte('lead_score', filters.minScore);
        if (filters.maxScore !== undefined) query = query.lte('lead_score', filters.maxScore);

        const { data, error } = await query.order('created_at', { ascending: false });
        if (!error && data) {
          return { leads: data.map(normalizeDbLead) };
        }
      } catch (err: any) {
        console.warn('Supabase filter error, falling back to local filter:', err);
      }
    }

    const filtered = localLeads.filter((l) => {
      if (filters.status && filters.status !== 'all' && l.status !== filters.status) return false;
      if (filters.source && filters.source !== 'all' && (l.source !== filters.source && l.lead_source !== filters.source)) return false;
      if (filters.industry && filters.industry !== 'all' && l.industry !== filters.industry) return false;
      if (filters.assigned_to && filters.assigned_to !== 'all' && l.assigned_to !== filters.assigned_to) return false;
      if (filters.minScore !== undefined && l.lead_score < filters.minScore) return false;
      if (filters.maxScore !== undefined && l.lead_score > filters.maxScore) return false;
      return true;
    });

    return { leads: filtered };
  },

  /**
   * Create a new lead
   */
  async createLead(leadData: LeadFormData): Promise<{ lead: Lead; error?: string }> {
    const newId = crypto.randomUUID();
    const now = new Date().toISOString();

    const localNewLead: Lead = {
      id: newId,
      company_name: leadData.company_name || '',
      contact_person: leadData.contact_person || '',
      phone: leadData.phone,
      email: leadData.email || '',
      location: leadData.location || '',
      industry: leadData.industry || 'General',
      source: (leadData.source || leadData.lead_source || 'Website') as LeadSource,
      lead_source: (leadData.source || leadData.lead_source || 'Website') as LeadSource,
      requirement: leadData.requirement || '',
      status: leadData.status || 'New',
      lead_score: leadData.lead_score ?? 50,
      notes: leadData.notes || '',
      assigned_to: leadData.assigned_to || 'Unassigned',
      created_at: now,
      updated_at: now,
    };

    if (!isSupabaseConfigured) {
      localLeads.unshift(localNewLead);
      this.logActivity(newId, 'Lead Created', `New lead added for ${leadData.company_name || leadData.contact_person}`);
      return { lead: localNewLead };
    }

    try {
      const payload = await mapLeadToDbPayload(leadData);
      payload.id = newId;
      const colMap = await detectSchema();
      payload[colMap.created_at] = now;

      const { data, error } = await supabase.from('leads').insert([payload]).select().single();

      if (error) {
        console.warn('Supabase insert error, falling back locally:', error.message);
        localLeads.unshift(localNewLead);
        this.logActivity(newId, 'Lead Created', `Added locally (Supabase error: ${error.message})`);
        return { lead: localNewLead, error: error.message };
      }

      const created = normalizeDbLead(data || payload);
      localLeads.unshift(created);
      await this.logActivity(created.id, 'Lead Created', `Lead registered from ${leadData.lead_source}`);
      return { lead: created };
    } catch (err: any) {
      console.error('Error inserting lead to Supabase:', err);
      localLeads.unshift(localNewLead);
      return { lead: localNewLead, error: err?.message };
    }
  },

  /**
   * Update an existing lead
   */
  async updateLead(id: string, updates: Partial<LeadFormData>): Promise<{ lead: Lead; error?: string }> {
    const existingIndex = localLeads.findIndex((l) => l.id === id);
    const existing = existingIndex !== -1 ? localLeads[existingIndex] : null;

    const updatedLocal: Lead = {
      ...(existing || {
        id,
        company_name: '',
        contact_person: '',
        phone: '',
        email: '',
        location: '',
        industry: '',
        source: 'Website',
        lead_source: 'Website',
        requirement: '',
        status: 'New',
        lead_score: 50,
        notes: '',
        assigned_to: 'Unassigned',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (existingIndex !== -1) {
      localLeads[existingIndex] = updatedLocal;
    }

    if (!isSupabaseConfigured) {
      this.logActivity(id, 'Lead Updated', 'Lead details modified');
      return { lead: updatedLocal };
    }

    try {
      const payload = await mapLeadToDbPayload(updates);
      const { data, error } = await supabase.from('leads').update(payload).eq('id', id).select().single();

      if (error) {
        console.warn('Supabase update error:', error.message);
        return { lead: updatedLocal, error: error.message };
      }

      const normalized = normalizeDbLead(data || payload);
      if (existingIndex !== -1) {
        localLeads[existingIndex] = normalized;
      }
      return { lead: normalized };
    } catch (err: any) {
      console.error('Error updating lead on Supabase:', err);
      return { lead: updatedLocal, error: err?.message };
    }
  },

  /**
   * Quick status change with activity logging
   */
  async updateStatus(id: string, newStatus: LeadStatus): Promise<{ success: boolean; error?: string }> {
    const existing = localLeads.find((l) => l.id === id);
    const oldStatus = existing?.status || 'Unknown';

    const res = await this.updateLead(id, { status: newStatus });
    if (!res.error) {
      await this.logActivity(id, 'Status Changed', `Status updated from ${oldStatus} to ${newStatus}`);
      return { success: true };
    }
    return { success: false, error: res.error };
  },

  /**
   * Quick assignment change
   */
  async updateAssignment(id: string, assignedTo: string): Promise<{ success: boolean; error?: string }> {
    const res = await this.updateLead(id, { assigned_to: assignedTo });
    if (!res.error) {
      await this.logActivity(id, 'Lead Assigned', `Assigned to ${assignedTo}`);
      return { success: true };
    }
    return { success: false, error: res.error };
  },

  /**
   * Delete a lead
   */
  async deleteLead(id: string): Promise<{ success: boolean; error?: string }> {
    localLeads = localLeads.filter((l) => l.id !== id);
    delete localActivities[id];
    delete localFollowUps[id];

    if (!isSupabaseConfigured) {
      return { success: true };
    }

    try {
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (error) {
        console.warn('Supabase delete error:', error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting lead from Supabase:', err);
      return { success: false, error: err?.message };
    }
  },

  /**
   * Fetch Team Members
   */
  async getTeamMembers(): Promise<TeamMember[]> {
    if (!isSupabaseConfigured) {
      return DEFAULT_TEAM_MEMBERS;
    }

    try {
      const { data, error } = await supabase.from('users').select('id, name, email, role');
      if (!error && data && data.length > 0) {
        return data.map((u: any) => ({
          id: u.id,
          name: u.name || u.full_name || u.email,
          email: u.email || '',
          role: u.role || 'Member',
        }));
      }
    } catch (err) {
      console.warn('Could not load users table from Supabase, using defaults:', err);
    }
    return DEFAULT_TEAM_MEMBERS;
  },

  /**
   * Log an activity for a lead
   */
  async logActivity(leadId: string, action: string, description: string, performedBy?: string): Promise<void> {
    const activity: LeadActivity = {
      id: crypto.randomUUID(),
      lead_id: leadId,
      action,
      description,
      performed_by: performedBy || 'Team Member',
      created_at: new Date().toISOString(),
    };

    if (!localActivities[leadId]) {
      localActivities[leadId] = [];
    }
    localActivities[leadId].unshift(activity);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('activities').insert([
          {
            lead_id: leadId,
            action,
            description,
            performed_by: performedBy,
            created_at: activity.created_at,
          },
        ]);
      } catch (err) {
        // Silently ignore if activities table has distinct schema
      }
    }
  },

  /**
   * Fetch activities for a lead
   */
  async getActivities(leadId: string): Promise<LeadActivity[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .eq('lead_id', leadId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((a: any) => ({
            id: a.id,
            lead_id: a.lead_id,
            action: a.action || 'Activity',
            description: a.description || '',
            performed_by: a.performed_by || 'User',
            created_at: a.created_at || new Date().toISOString(),
          }));
        }
      } catch (err) {
        // fallback
      }
    }
    return localActivities[leadId] || [];
  },

  /**
   * Add a follow-up
   */
  async createFollowUp(
    leadId: string,
    followUpData: { scheduled_at: string; type: FollowUp['type']; notes: string }
  ): Promise<FollowUp> {
    const followUp: FollowUp = {
      id: crypto.randomUUID(),
      lead_id: leadId,
      scheduled_at: followUpData.scheduled_at,
      type: followUpData.type,
      notes: followUpData.notes,
      status: 'Pending',
      created_at: new Date().toISOString(),
    };

    if (!localFollowUps[leadId]) {
      localFollowUps[leadId] = [];
    }
    localFollowUps[leadId].unshift(followUp);

    await this.logActivity(
      leadId,
      'Follow-up Scheduled',
      `${followUpData.type} scheduled for ${new Date(followUpData.scheduled_at).toLocaleDateString()}: ${followUpData.notes}`
    );

    if (isSupabaseConfigured) {
      try {
        await supabase.from('followups').insert([
          {
            lead_id: leadId,
            scheduled_at: followUp.scheduled_at,
            type: followUp.type,
            notes: followUp.notes,
            status: followUp.status,
            created_at: followUp.created_at,
          },
        ]);
      } catch (err) {
        // Silently fallback to local
      }
    }

    return followUp;
  },

  /**
   * Fetch follow-ups for a lead
   */
  async getFollowUps(leadId: string): Promise<FollowUp[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('followups')
          .select('*')
          .eq('lead_id', leadId)
          .order('scheduled_at', { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map((f: any) => ({
            id: f.id,
            lead_id: f.lead_id,
            scheduled_at: f.scheduled_at,
            type: f.type || 'Call',
            notes: f.notes || '',
            status: f.status || 'Pending',
            created_at: f.created_at,
          }));
        }
      } catch (err) {
        // fallback
      }
    }
    return localFollowUps[leadId] || [];
  },
};
