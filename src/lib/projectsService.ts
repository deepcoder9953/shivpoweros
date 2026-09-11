import { supabase, isSupabaseConfigured } from './supabase';
import {
  Project,
  ProjectFormData,
  normalizeProjectStatus,
  calculateProjectProgress,
  getProjectStatusLabel,
} from '../types/project';
import { activitiesService } from './activitiesService';
import { tasksService } from './tasksService';

let localProjects: Project[] = [
  {
    id: 'proj-1',
    customer_id: 'cust-2',
    customer_name: 'Shree Balaji Textile Mills',
    customer: {
      id: 'cust-2',
      company_name: 'Shree Balaji Textile Mills',
      contact_person: 'Rajesh Singhania',
      phone: '+91 98250 11223',
      email: 'rajesh@balajitex.com',
    },
    quotation_id: null,
    project_name: '500 kW Rooftop Solar Power Plant Installation',
    description: 'EPC turnkey execution including mono-PERC half-cut solar modules, high-efficiency string inverters, net metering liaison with discom, and grid synchronization.',
    start_date: new Date(Date.now() - 20 * 86400000).toISOString().split('T')[0],
    expected_completion: new Date(Date.now() + 40 * 86400000).toISOString().split('T')[0],
    expected_completion_date: new Date(Date.now() + 40 * 86400000).toISOString().split('T')[0],
    budget: 22500000,
    project_value: 22500000,
    status: 'in_progress',
    assigned_to: 'Deepak Sharma (Sr. Engineer)',
    notes: 'Structure mounting completed on Shed 2. Awaiting discom CEIG approval for synchronization.',
    tasks_count: 2,
    completed_tasks_count: 1,
    progress_percentage: 50,
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'proj-2',
    customer_id: 'cust-1',
    customer_name: 'Apex Healthcare Super Speciality',
    customer: {
      id: 'cust-1',
      company_name: 'Apex Healthcare Super Speciality',
      contact_person: 'Dr. Sameer Verma',
      phone: '+91 98201 44552',
      email: 'verma@apexhealth.in',
    },
    quotation_id: 'quote-1',
    quotation: {
      id: 'quote-1',
      quotation_number: 'SPS-2026-0042',
      title: 'Quotation for 250 kVA Silent DG Set with AMF Panel',
      total: 2124000,
      status: 'accepted',
    },
    project_name: '250 kVA Silent DG Set Commissioning & AMF Sync',
    description: 'Critical ICU power backup installation with auto-mains failure switchgear, acoustic enclosure, and 1000L fuel day tank.',
    start_date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    expected_completion: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    expected_completion_date: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    budget: 2124000,
    project_value: 2124000,
    status: 'planning',
    assigned_to: 'Vikram Mehta (Sales Lead)',
    notes: 'DG set dispatch from factory warehouse scheduled this weekend.',
    tasks_count: 1,
    completed_tasks_count: 0,
    progress_percentage: 0,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'proj-3',
    customer_id: 'cust-3',
    customer_name: 'Radiant Agro Industries',
    customer: {
      id: 'cust-3',
      company_name: 'Radiant Agro Industries',
      contact_person: 'Harish Patel',
      phone: '+91 99099 33441',
      email: 'harish@radiantagro.com',
    },
    quotation_id: null,
    project_name: 'Industrial HT Substation & 11kV Transformer Overhaul',
    description: 'Complete servicing of 11kV/433V 1000kVA transformer, vacuum circuit breaker (VCB) testing, dielectric oil filtering, and relay calibration.',
    start_date: new Date(Date.now() - 45 * 86400000).toISOString().split('T')[0],
    expected_completion: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
    expected_completion_date: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
    budget: 1450000,
    project_value: 1450000,
    status: 'completed',
    assigned_to: 'Deepak Sharma (Sr. Engineer)',
    notes: 'Testing and CEIG inspection completed successfully with test reports handed over.',
    tasks_count: 1,
    completed_tasks_count: 1,
    progress_percentage: 100,
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

function normalizeProject(row: Record<string, any>): Project {
  const normStatus = normalizeProjectStatus(row.status);
  const budget = Number(row.budget ?? row.project_value ?? 0);
  const expected_completion = row.expected_completion || row.expected_completion_date || null;
  const start_date = row.start_date || null;

  return {
    id: String(row.id || crypto.randomUUID()),
    customer_id: row.customer_id,
    customer_name: row.customer?.company_name || row.customer_name || 'Customer',
    customer: row.customer || null,
    quotation_id: row.quotation_id || null,
    quotation: row.quotation || null,
    project_name: row.project_name || row.title || 'Untitled Project',
    description: row.description || '',
    start_date,
    expected_completion,
    expected_completion_date: expected_completion,
    actual_completion_date: row.actual_completion_date || null,
    budget,
    project_value: budget,
    status: normStatus,
    assigned_to: row.assigned_to || 'Unassigned',
    notes: row.notes || '',
    tasks_count: row.tasks_count ?? 0,
    completed_tasks_count: row.completed_tasks_count ?? 0,
    progress_percentage: row.progress_percentage ?? 0,
    created_at: row.created_at || new Date().toISOString(),
    updated_at: row.updated_at || new Date().toISOString(),
  };
}

export const projectsService = {
  /**
   * Fetch all projects with customer joins and task counts
   */
  async getProjects(): Promise<{ projects: Project[]; isLive: boolean; error?: string }> {
    if (!isSupabaseConfigured) {
      // Calculate real task progress for local projects
      const { tasks } = await tasksService.getTasks();
      const enriched = localProjects.map((proj) => {
        const projTasks = tasks.filter((t) => t.project_id === proj.id);
        const progress = calculateProjectProgress(projTasks);
        const completedCount = projTasks.filter((t) => (t.status || '').toLowerCase() === 'completed').length;
        return {
          ...proj,
          tasks_count: projTasks.length,
          completed_tasks_count: completedCount,
          progress_percentage: progress,
        };
      });
      localProjects = enriched;
      return { projects: [...localProjects], isLive: false };
    }

    try {
      // Query projects with customer and quotation relations
      const { data, error } = await supabase
        .from('projects')
        .select('*, customer:customers(id, company_name, contact_person, phone, email), quotation:quotations(id, quotation_number, title, total, status)')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase getProjects error, using local fallback:', error.message);
        return { projects: [...localProjects], isLive: false, error: error.message };
      }

      if (data) {
        const { tasks } = await tasksService.getTasks();
        const normalized = data.map((row) => {
          const proj = normalizeProject(row);
          const projTasks = tasks.filter((t) => t.project_id === proj.id);
          const progress = calculateProjectProgress(projTasks);
          const completedCount = projTasks.filter((t) => (t.status || '').toLowerCase() === 'completed').length;
          return {
            ...proj,
            tasks_count: projTasks.length,
            completed_tasks_count: completedCount,
            progress_percentage: progress,
          };
        });
        localProjects = normalized;
        return { projects: normalized, isLive: true };
      }

      return { projects: [...localProjects], isLive: true };
    } catch (err: any) {
      console.error('Failed to fetch projects:', err);
      return { projects: [...localProjects], isLive: false, error: err?.message };
    }
  },

  /**
   * Fetch single project by ID with full details
   */
  async getProjectById(id: string): Promise<{ project: Project | null; error?: string }> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*, customer:customers(id, company_name, contact_person, phone, email), quotation:quotations(id, quotation_number, title, total, status)')
          .eq('id', id)
          .single();

        if (error) {
          console.warn('Error fetching project by id:', error.message);
        } else if (data) {
          const proj = normalizeProject(data);
          const { tasks } = await tasksService.getTasksByProject(id);
          const progress = calculateProjectProgress(tasks);
          const completedCount = tasks.filter((t) => (t.status || '').toLowerCase() === 'completed').length;
          return {
            project: {
              ...proj,
              tasks_count: tasks.length,
              completed_tasks_count: completedCount,
              progress_percentage: progress,
            },
          };
        }
      } catch (err: any) {
        console.warn('Error fetching project by id:', err);
      }
    }

    const found = localProjects.find((p) => p.id === id) || null;
    if (found) {
      const { tasks } = await tasksService.getTasksByProject(found.id);
      const progress = calculateProjectProgress(tasks);
      const completedCount = tasks.filter((t) => (t.status || '').toLowerCase() === 'completed').length;
      return {
        project: {
          ...found,
          tasks_count: tasks.length,
          completed_tasks_count: completedCount,
          progress_percentage: progress,
        },
      };
    }
    return { project: null };
  },

  /**
   * Fetch projects for a specific customer
   */
  async getProjectsByCustomer(customerId: string): Promise<{ projects: Project[]; error?: string }> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*, customer:customers(id, company_name, contact_person, phone, email)')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          return { projects: data.map(normalizeProject) };
        }
      } catch (err: any) {
        console.warn('Error fetching projects by customer:', err);
      }
    }

    const matched = localProjects.filter((p) => p.customer_id === customerId);
    return { projects: matched };
  },

  /**
   * Create a new project with activity log and quotation linkage
   */
  async createProject(data: ProjectFormData): Promise<{ project: Project; error?: string }> {
    if (!data.project_name?.trim()) {
      return { project: {} as Project, error: 'Project name is required.' };
    }
    if (!data.customer_id) {
      return { project: {} as Project, error: 'Customer is required.' };
    }

    const newId = crypto.randomUUID();
    const now = new Date().toISOString();
    const normStatus = normalizeProjectStatus(data.status);
    const budgetVal = Number(data.budget ?? data.project_value ?? 0);
    const expectedComp = data.expected_completion || data.expected_completion_date || null;

    const localRecord: Project = {
      id: newId,
      customer_id: data.customer_id,
      customer_name: data.customer_id,
      quotation_id: data.quotation_id || null,
      project_name: data.project_name.trim(),
      description: data.description?.trim() || null,
      start_date: data.start_date || null,
      expected_completion: expectedComp,
      expected_completion_date: expectedComp,
      actual_completion_date: null,
      budget: budgetVal,
      project_value: budgetVal,
      status: normStatus,
      assigned_to: data.assigned_to || 'Unassigned',
      notes: data.notes || '',
      tasks_count: 0,
      completed_tasks_count: 0,
      progress_percentage: 0,
      created_at: now,
      updated_at: now,
    };

    // Log Activity asynchronously
    activitiesService.logActivity({
      project_id: newId,
      customer_id: data.customer_id,
      action: 'Project Created',
      description: `New project "${data.project_name}" created with budget ₹${budgetVal.toLocaleString('en-IN')}.`,
      performed_by: data.assigned_to || 'Sales Operations',
    }).catch(() => {});

    if (!isSupabaseConfigured) {
      localProjects.unshift(localRecord);
      // Link quotation if supplied
      if (data.quotation_id) {
        this.linkQuotation(data.quotation_id, newId).catch(() => {});
      }
      return { project: localRecord };
    }

    try {
      // Primary payload using exact specified columns
      const payload: Record<string, any> = {
        id: newId,
        customer_id: data.customer_id,
        project_name: data.project_name.trim(),
        description: data.description?.trim() || null,
        start_date: data.start_date || null,
        expected_completion: expectedComp,
        status: normStatus,
        assigned_to: data.assigned_to || null,
        budget: budgetVal,
        created_at: now,
        updated_at: now,
      };

      if (data.quotation_id) {
        payload.quotation_id = data.quotation_id;
      }

      // Safe insert with column compatibility
      let insertedRow: any = null;
      const { data: inserted, error } = await supabase
        .from('projects')
        .insert([payload])
        .select('*, customer:customers(id, company_name, contact_person)')
        .single();

      if (error) {
        // Retry with alternate column names if schema variant
        const altPayload: Record<string, any> = {
          id: newId,
          customer_id: data.customer_id,
          project_name: data.project_name.trim(),
          description: data.description?.trim() || null,
          start_date: data.start_date || null,
          expected_completion_date: expectedComp,
          project_value: budgetVal,
          status: getProjectStatusLabel(normStatus),
          assigned_to: data.assigned_to || null,
          created_at: now,
          updated_at: now,
        };
        const altResult = await supabase
          .from('projects')
          .insert([altPayload])
          .select('*, customer:customers(id, company_name, contact_person)')
          .single();

        if (altResult.error) {
          console.warn('Supabase project insert failed, fallback to local:', altResult.error.message);
          localProjects.unshift(localRecord);
          return { project: localRecord, error: altResult.error.message };
        }
        insertedRow = altResult.data;
      } else {
        insertedRow = inserted;
      }

      const created = normalizeProject(insertedRow || localRecord);
      localProjects.unshift(created);

      // Link quotation if specified
      if (data.quotation_id) {
        await this.linkQuotation(data.quotation_id, created.id);
      }

      return { project: created };
    } catch (err: any) {
      localProjects.unshift(localRecord);
      return { project: localRecord, error: err?.message };
    }
  },

  /**
   * Update an existing project
   */
  async updateProject(
    id: string,
    updates: Partial<ProjectFormData>
  ): Promise<{ project: Project | null; error?: string }> {
    const existingIndex = localProjects.findIndex((p) => p.id === id);
    const existing = existingIndex !== -1 ? localProjects[existingIndex] : null;

    const normStatus = updates.status ? normalizeProjectStatus(updates.status) : existing?.status || 'planning';
    const budgetVal = updates.budget !== undefined ? Number(updates.budget) : (updates.project_value !== undefined ? Number(updates.project_value) : existing?.budget || 0);
    const expectedComp = updates.expected_completion ?? updates.expected_completion_date ?? existing?.expected_completion ?? null;

    const updatedLocal: Project = {
      ...(existing || {
        id,
        customer_id: updates.customer_id || '',
        project_name: updates.project_name || '',
        budget: budgetVal,
        project_value: budgetVal,
        status: normStatus,
        created_at: new Date().toISOString(),
      }),
      ...updates,
      status: normStatus,
      budget: budgetVal,
      project_value: budgetVal,
      expected_completion: expectedComp,
      expected_completion_date: expectedComp,
      updated_at: new Date().toISOString(),
    };

    if (existingIndex !== -1) {
      localProjects[existingIndex] = updatedLocal;
    }

    // Log Activity
    if (existing && existing.status !== normStatus) {
      activitiesService.logActivity({
        project_id: id,
        customer_id: updatedLocal.customer_id,
        action: 'Project Status Changed',
        description: `Project "${updatedLocal.project_name}" status changed from ${getProjectStatusLabel(existing.status)} to ${getProjectStatusLabel(normStatus)}.`,
        performed_by: updatedLocal.assigned_to || 'System',
      }).catch(() => {});
    } else {
      activitiesService.logActivity({
        project_id: id,
        customer_id: updatedLocal.customer_id,
        action: 'Project Updated',
        description: `Project "${updatedLocal.project_name}" details updated.`,
        performed_by: updatedLocal.assigned_to || 'System',
      }).catch(() => {});
    }

    if (!isSupabaseConfigured) {
      return { project: updatedLocal };
    }

    try {
      const payload: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (updates.project_name !== undefined) payload.project_name = updates.project_name.trim();
      if (updates.customer_id !== undefined) payload.customer_id = updates.customer_id;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.start_date !== undefined) payload.start_date = updates.start_date;
      if (updates.expected_completion !== undefined || updates.expected_completion_date !== undefined) {
        payload.expected_completion = expectedComp;
        payload.expected_completion_date = expectedComp;
      }
      if (updates.budget !== undefined || updates.project_value !== undefined) {
        payload.budget = budgetVal;
        payload.project_value = budgetVal;
      }
      if (updates.status !== undefined) {
        payload.status = normStatus;
      }
      if (updates.assigned_to !== undefined) payload.assigned_to = updates.assigned_to;

      const { data, error } = await supabase
        .from('projects')
        .update(payload)
        .eq('id', id)
        .select('*, customer:customers(id, company_name, contact_person)')
        .single();

      if (error) {
        // Try fallback payload with stripped extra columns
        const cleanPayload: Record<string, any> = {};
        if (payload.project_name) cleanPayload.project_name = payload.project_name;
        if (payload.status) cleanPayload.status = payload.status;
        if (payload.assigned_to !== undefined) cleanPayload.assigned_to = payload.assigned_to;
        if (payload.description !== undefined) cleanPayload.description = payload.description;

        await supabase.from('projects').update(cleanPayload).eq('id', id);
        return { project: updatedLocal };
      }

      const normalized = normalizeProject(data || payload);
      if (existingIndex !== -1) {
        localProjects[existingIndex] = normalized;
      }
      return { project: normalized };
    } catch (err: any) {
      return { project: updatedLocal, error: err?.message };
    }
  },

  /**
   * Delete a project with task cleanup and activity log
   */
  async deleteProject(id: string): Promise<{ success: boolean; error?: string }> {
    const existing = localProjects.find((p) => p.id === id);
    localProjects = localProjects.filter((p) => p.id !== id);

    if (existing) {
      activitiesService.logActivity({
        customer_id: existing.customer_id,
        action: 'Project Deleted',
        description: `Project "${existing.project_name}" was deleted.`,
        performed_by: 'Admin',
      }).catch(() => {});
    }

    if (!isSupabaseConfigured) {
      return { success: true };
    }

    try {
      // Unlink quotations first so foreign key doesn't fail
      await supabase.from('quotations').update({ project_id: null }).eq('project_id', id);

      // Delete child tasks
      await supabase.from('tasks').delete().eq('project_id', id);

      // Delete project
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  },

  /**
   * Helper to link a quotation to a project
   */
  async linkQuotation(quotationId: string, projectId: string): Promise<boolean> {
    try {
      if (isSupabaseConfigured) {
        await supabase
          .from('quotations')
          .update({ project_id: projectId, updated_at: new Date().toISOString() })
          .eq('id', quotationId);
      }
      return true;
    } catch {
      return false;
    }
  },
};
