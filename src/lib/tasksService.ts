import { supabase, isSupabaseConfigured } from './supabase';
import { Task, TaskFormData, normalizeTaskStatus, normalizeTaskPriority } from '../types/task';

let localTasks: Task[] = [
  {
    id: 'task-1',
    project_id: 'proj-1',
    lead_id: 'lead-1',
    customer_id: null,
    project_name: '500 kW Rooftop Solar Power Plant Installation',
    lead_name: 'Apex Healthcare Super Speciality',
    assigned_to: 'Deepak Sharma (Sr. Engineer)',
    title: 'Submit Net Metering Application to Discom',
    description: 'Prepare single line diagram, module datasheets, and consumer sanctioned load documentation.',
    priority: 'high',
    status: 'in_progress',
    due_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    completed_at: null,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'task-2',
    project_id: 'proj-1',
    lead_id: null,
    customer_id: null,
    project_name: '500 kW Rooftop Solar Power Plant Installation',
    assigned_to: 'Deepak Sharma (Sr. Engineer)',
    title: 'Structure Fabrication & Shadow Analysis',
    description: 'Complete high-wind load MMS foundation testing on factory roof shed.',
    priority: 'medium',
    status: 'completed',
    due_date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    completed_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'task-3',
    project_id: 'proj-2',
    lead_id: 'lead-2',
    customer_id: null,
    project_name: '250 kVA Silent DG Set Commissioning & AMF Sync',
    lead_name: 'Shree Balaji Textile Mills',
    assigned_to: 'Vikram Mehta (Sales Lead)',
    title: 'Finalize Foundation Inspection & Acoustic Enclosure Placement',
    description: 'Verify vibration isolators and cable trench depth before DG positioning.',
    priority: 'urgent',
    status: 'todo',
    due_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    completed_at: null,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'task-4',
    project_id: 'proj-3',
    lead_id: null,
    customer_id: null,
    project_name: 'Industrial HT Substation & 11kV Transformer Overhaul',
    assigned_to: 'Deepak Sharma (Sr. Engineer)',
    title: 'Oil BDV Breakdown Voltage Testing & Silica Gel Replacement',
    description: 'Sample dielectric oil from conservator tank and measure BDV test (standard > 50kV).',
    priority: 'high',
    status: 'completed',
    due_date: new Date(Date.now() - 15 * 86400000).toISOString().split('T')[0],
    completed_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: 'task-5',
    project_id: null,
    lead_id: 'lead-1',
    customer_id: null,
    assigned_to: 'Vikram Mehta (Sales Lead)',
    title: 'Send revised commercial terms to Dr. Verma',
    description: 'Offer 5% discount on AMF panel if advance payment is cleared within 7 days.',
    priority: 'medium',
    status: 'completed',
    due_date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
    completed_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

function normalizeTask(row: Record<string, any>): Task {
  const normStatus = normalizeTaskStatus(row.status);
  return {
    id: String(row.id || crypto.randomUUID()),
    project_id: row.project_id || null,
    lead_id: row.lead_id || null,
    customer_id: row.customer_id || null,
    project_name: row.project?.project_name || row.project_name || undefined,
    lead_name: row.lead?.company_name || row.lead?.contact_person || row.lead_name || undefined,
    customer_name: row.customer?.company_name || row.customer_name || undefined,
    assigned_to: row.assigned_to || 'Unassigned',
    title: row.title || 'Untitled Task',
    description: row.description || '',
    priority: normalizeTaskPriority(row.priority),
    status: normStatus,
    due_date: row.due_date || null,
    completed_at: row.completed_at || null,
    created_at: row.created_at || new Date().toISOString(),
    updated_at: row.updated_at || new Date().toISOString(),
  };
}

export const tasksService = {
  /**
   * Fetch all tasks
   */
  async getTasks(): Promise<{ tasks: Task[]; isLive: boolean; error?: string }> {
    if (!isSupabaseConfigured) {
      return { tasks: [...localTasks], isLive: false };
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, project:projects(project_name), lead:leads(company_name, contact_person), customer:customers(company_name, contact_person)')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase getTasks error, fallback to local:', error.message);
        return { tasks: [...localTasks], isLive: false, error: error.message };
      }

      if (data) {
        const normalized = data.map(normalizeTask);
        localTasks = normalized;
        return { tasks: normalized, isLive: true };
      }

      return { tasks: [...localTasks], isLive: true };
    } catch (err: any) {
      console.error('Failed to fetch tasks:', err);
      return { tasks: [...localTasks], isLive: false, error: err?.message };
    }
  },

  /**
   * Fetch tasks for a lead
   */
  async getTasksByLead(leadId: string): Promise<{ tasks: Task[]; error?: string }> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('lead_id', leadId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          return { tasks: data.map(normalizeTask) };
        }
      } catch (err: any) {
        console.warn('Error fetching lead tasks:', err);
      }
    }

    const matched = localTasks.filter((t) => t.lead_id === leadId);
    return { tasks: matched };
  },

  /**
   * Fetch tasks for a customer
   */
  async getTasksByCustomer(customerId: string): Promise<{ tasks: Task[]; error?: string }> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          return { tasks: data.map(normalizeTask) };
        }
      } catch (err: any) {
        console.warn('Error fetching customer tasks:', err);
      }
    }

    const matched = localTasks.filter((t) => t.customer_id === customerId);
    return { tasks: matched };
  },

  /**
   * Fetch tasks for a project
   */
  async getTasksByProject(projectId: string): Promise<{ tasks: Task[]; error?: string }> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*, project:projects(project_name)')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          return { tasks: data.map(normalizeTask) };
        }
      } catch (err: any) {
        console.warn('Error fetching project tasks:', err);
      }
    }

    const matched = localTasks.filter((t) => t.project_id === projectId);
    return { tasks: matched };
  },

  /**
   * Fetch single task by ID
   */
  async getTaskById(id: string): Promise<{ task: Task | null; error?: string }> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*, project:projects(project_name), lead:leads(company_name, contact_person), customer:customers(company_name, contact_person)')
          .eq('id', id)
          .single();

        if (error) {
          return { task: null, error: error.message };
        }
        if (data) {
          return { task: normalizeTask(data) };
        }
      } catch (err: any) {
        console.warn('Error fetching task by id:', err);
      }
    }

    const found = localTasks.find((t) => t.id === id) || null;
    return { task: found };
  },

  /**
   * Create a task
   */
  async createTask(data: TaskFormData): Promise<{ task: Task; error?: string }> {
    if (!data.title?.trim()) {
      return { task: {} as Task, error: 'Task title is required.' };
    }

    const newId = crypto.randomUUID();
    const now = new Date().toISOString();

    const localRecord: Task = {
      id: newId,
      project_id: data.project_id || null,
      lead_id: data.lead_id || null,
      customer_id: data.customer_id || null,
      assigned_to: data.assigned_to || 'Unassigned',
      title: data.title,
      description: data.description || '',
      priority: data.priority || 'Medium',
      status: data.status || 'Pending',
      due_date: data.due_date || null,
      completed_at: data.status === 'Completed' ? now : null,
      created_at: now,
      updated_at: now,
    };

    if (!isSupabaseConfigured) {
      localTasks.unshift(localRecord);
      return { task: localRecord };
    }

    try {
      const payload: Record<string, any> = {
        id: newId,
        project_id: data.project_id || null,
        lead_id: data.lead_id || null,
        customer_id: data.customer_id || null,
        assigned_to: data.assigned_to || null,
        title: data.title,
        description: data.description || null,
        priority: data.priority || 'Medium',
        status: data.status || 'Pending',
        due_date: data.due_date || null,
        completed_at: data.status === 'Completed' ? now : null,
        created_at: now,
        updated_at: now,
      };

      const { data: inserted, error } = await supabase
        .from('tasks')
        .insert([payload])
        .select()
        .single();

      if (error) {
        localTasks.unshift(localRecord);
        return { task: localRecord, error: error.message };
      }

      const created = normalizeTask(inserted || payload);
      localTasks.unshift(created);
      return { task: created };
    } catch (err: any) {
      localTasks.unshift(localRecord);
      return { task: localRecord, error: err?.message };
    }
  },

  /**
   * Update a task
   */
  async updateTask(id: string, updates: Partial<TaskFormData>): Promise<{ task: Task | null; error?: string }> {
    const existingIndex = localTasks.findIndex((t) => t.id === id);
    const existing = existingIndex !== -1 ? localTasks[existingIndex] : null;

    const isNowCompleted = updates.status === 'Completed';
    const updatedLocal: Task = {
      ...(existing || {
        id,
        title: '',
        priority: 'Medium',
        status: 'Pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
      ...updates,
      completed_at: isNowCompleted ? (existing?.completed_at || new Date().toISOString()) : (updates.status ? null : existing?.completed_at),
      updated_at: new Date().toISOString(),
    };

    if (existingIndex !== -1) {
      localTasks[existingIndex] = updatedLocal;
    }

    if (!isSupabaseConfigured) {
      return { task: updatedLocal };
    }

    try {
      const payload: Record<string, any> = {
        ...updates,
        completed_at: isNowCompleted ? (existing?.completed_at || new Date().toISOString()) : (updates.status ? null : undefined),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('tasks')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { task: updatedLocal, error: error.message };
      }

      const normalized = normalizeTask(data || payload);
      if (existingIndex !== -1) {
        localTasks[existingIndex] = normalized;
      }
      return { task: normalized };
    } catch (err: any) {
      return { task: updatedLocal, error: err?.message };
    }
  },

  /**
   * Delete a task
   */
  async deleteTask(id: string): Promise<{ success: boolean; error?: string }> {
    localTasks = localTasks.filter((t) => t.id !== id);

    if (!isSupabaseConfigured) {
      return { success: true };
    }

    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  },
};
