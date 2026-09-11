import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Lead, LeadFormData, LeadStatus, TeamMember } from '../types/lead';
import { Customer, CustomerFormData } from '../types/customer';
import { Task, TaskFormData } from '../types/task';
import { FollowupRecord, FollowupFormData } from '../types/followup';
import { ActivityRecord } from '../types/activity';
import { Quotation, QuotationFormData, QuotationStatus } from '../types/quotation';
import { Project } from '../types/project';

// Services
import { leadsService } from '../lib/leadsService';
import { customersService } from '../lib/customersService';
import { tasksService } from '../lib/tasksService';
import { followupsService } from '../lib/followupsService';
import { activitiesService } from '../lib/activitiesService';
import { quotationsService } from '../lib/quotationsService';
import { projectsService } from '../lib/projectsService';
import { isSupabaseConfigured } from '../lib/supabase';
import { initTheme } from '../lib/theme';

// Navigation & Layout Shell
import { CRMTab } from '../components/crm/CRMNavigation';
import { Sidebar } from '../components/navigation/Sidebar';
import { TopHeader } from '../components/navigation/TopHeader';
import { MobileBottomNav } from '../components/navigation/MobileBottomNav';
import { MobileMoreDrawer } from '../components/navigation/MobileMoreDrawer';
import { MobileCreateActionSheet } from '../components/navigation/MobileCreateActionSheet';
import { GlobalSearchModal } from '../components/search/GlobalSearchModal';
import { NotificationDrawer } from '../components/notifications/NotificationDrawer';
import { FloatingAITrigger } from '../components/ai/FloatingAITrigger';

// CRM Components
import { CRMOverview } from '../components/crm/CRMOverview';
import { SalesPipeline } from '../components/crm/SalesPipeline';
import { LeadStatsHeader } from '../components/crm/LeadStatsHeader';
import { LeadFilterBar } from '../components/crm/LeadFilterBar';
import { LeadList } from '../components/crm/LeadList';
import { CustomerManagement } from '../components/crm/CustomerManagement';
import { QuotationsManagement } from '../components/quotations/QuotationsManagement';
import { ProjectManagement } from '../components/projects/ProjectManagement';
import { FollowupManagement } from '../components/crm/FollowupManagement';
import { TaskManagement } from '../components/crm/TaskManagement';
import { ActivityTimeline } from '../components/crm/ActivityTimeline';
import { AIAssistant } from '../components/ai';
import { UserLoginsManagement } from '../components/admin/UserLoginsManagement';
import { useAuth } from '../auth/AuthContext';
import { ShieldAlert } from 'lucide-react';

// Modals
import { LeadFormModal, POWER_INDUSTRIES } from '../components/crm/LeadFormModal';
import { LeadDetailModal } from '../components/crm/LeadDetailModal';
import { ConvertLeadModal } from '../components/crm/ConvertLeadModal';
import { FollowupFormModal } from '../components/crm/FollowupFormModal';
import { TaskFormModal } from '../components/crm/TaskFormModal';
import { DeleteConfirmModal } from '../components/crm/DeleteConfirmModal';
import { CustomerFormModal } from '../components/crm/CustomerFormModal';
import { QuotationFormModal } from '../components/quotations/QuotationFormModal';
import { QuotationDetailModal } from '../components/quotations/QuotationDetailModal';
import { QuotationPreviewModal } from '../components/quotations/QuotationPreviewModal';
import { LinkProjectModal } from '../components/quotations/LinkProjectModal';
import { ToastContainer, ToastMessage } from '../components/ui/Toast';

import {
  Download,
  UserPlus,
} from 'lucide-react';

const TAB_TITLES: Record<CRMTab, string> = {
  overview: 'Executive Dashboard',
  leads: 'Leads & Inquiries',
  pipeline: 'Sales Pipeline Kanban',
  customers: 'Customer Accounts (360°)',
  quotations: 'Commercial Quotations',
  projects: 'Project Operations',
  followups: 'Follow-ups & Schedules',
  tasks: 'Team Tasks & Deliverables',
  activities: 'System Activity Logs',
  ai_assistant: 'Shiv Power AI Copilot',
  user_logins: 'Admin: User Login Audit & Supabase Database',
};

export const LeadManagementPage: React.FC = () => {
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.isAdmin ?? false;

  // Navigation Active Tab
  const [activeTab, setActiveTab] = useState<CRMTab>('overview');
  const [aiSelectedLead, setAiSelectedLead] = useState<Lead | null>(null);

  // Shell Layout State
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);

  // Core CRM Data States
  const [leads, setLeads] = useState<Lead[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [followups, setFollowups] = useState<FollowupRecord[]>([]);
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isLiveDatabase, setIsLiveDatabase] = useState(isSupabaseConfigured);
  const [, setErrorMessage] = useState<string | null>(null);

  // Lead Filters (For Leads Tab)
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    source: 'all',
    industry: 'all',
    scoreRange: 'all',
  });
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Lead Modals
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null);
  const [convertingLead, setConvertingLead] = useState<Lead | null>(null);
  const [isDeletingLead, setIsDeletingLead] = useState(false);

  // Cross-Entity Scheduling Modals
  const [followupModalTarget, setFollowupModalTarget] = useState<{
    isOpen: boolean;
    lead?: Lead | null;
    customer?: Customer | null;
    initialData?: FollowupRecord | null;
  }>({ isOpen: false });

  const [taskModalTarget, setTaskModalTarget] = useState<{
    isOpen: boolean;
    lead?: Lead | null;
    customer?: Customer | null;
    initialData?: Task | null;
  }>({ isOpen: false });

  // Quotation Modals
  const [quotationModalTarget, setQuotationModalTarget] = useState<{
    isOpen: boolean;
    lead?: Lead | null;
    customer?: Customer | null;
    initialData?: Quotation | null;
  }>({ isOpen: false });
  const [viewingQuotation, setViewingQuotation] = useState<Quotation | null>(null);
  const [previewingQuotation, setPreviewingQuotation] = useState<Quotation | null>(null);
  const [linkingQuotation, setLinkingQuotation] = useState<Quotation | null>(null);

  // Project Action State (e.g., directed from Quick Create or Quotation acceptance)
  const [projectActionTarget, setProjectActionTarget] = useState<{
    action: 'create' | 'create_from_quotation';
    quotation?: {
      id: string;
      title: string;
      total: number;
      customer_id: string;
    };
  } | null>(null);

  const handleCreateProjectFromQuotation = (quotation: Quotation) => {
    setProjectActionTarget({
      action: 'create_from_quotation',
      quotation: {
        id: quotation.id,
        title: quotation.title || `Execution: ${quotation.quotation_number}`,
        total: quotation.total || 0,
        customer_id: quotation.customer_id,
      },
    });
    setActiveTab('projects');
  };

  // Notifications / Toast
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, type, title, message }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Main Data Loading Pipeline
  const loadAllCRMData = useCallback(async (showToast = false) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [leadsRes, custsRes, tasksRes, fupRes, actRes, members, quotesRes, projsRes] = await Promise.all([
        leadsService.getLeads(),
        customersService.getCustomers(),
        tasksService.getTasks(),
        followupsService.getFollowups(),
        activitiesService.getActivities(),
        leadsService.getTeamMembers(),
        quotationsService.getQuotations(),
        projectsService.getProjects(),
      ]);

      setLeads(leadsRes?.leads || []);
      setIsLiveDatabase(Boolean(leadsRes?.isLive));
      setCustomers(custsRes?.customers || []);
      setQuotations(quotesRes?.quotations || []);
      setProjects(projsRes?.projects || []);
      setTasks(tasksRes?.tasks || []);
      setFollowups(fupRes?.followups || []);
      setActivities(actRes?.activities || []);
      setTeamMembers(members || []);

      if (leadsRes?.error) {
        setErrorMessage(leadsRes.error);
      }

      if (showToast) {
        const leadCount = leadsRes?.leads?.length || 0;
        const custCount = custsRes?.customers?.length || 0;
        const quoteCount = quotesRes?.quotations?.length || 0;
        const fupCount = fupRes?.followups?.length || 0;
        addToast(
          'success',
          'CRM Synchronized',
          `Loaded ${leadCount} leads, ${custCount} customers, ${quoteCount} quotations, ${fupCount} follow-ups.`
        );
      }
    } catch (err: any) {
      const msg = err?.message || 'Failed to sync CRM data from Supabase';
      setErrorMessage(msg);
      addToast('error', 'Sync Failure', msg);
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    initTheme();
    loadAllCRMData();

    // Setup Cmd+K / Ctrl+K keyboard shortcut for global search
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loadAllCRMData]);

  // Quotation Action Handlers
  const handleCreateQuotation = async (formData: QuotationFormData): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await quotationsService.createQuotation(formData);
      if (res.success) {
        await activitiesService.logActivity({
          customer_id: formData.customer_id || undefined,
          lead_id: formData.lead_id || undefined,
          action: 'Quotation Created',
          description: `Quotation ${res.quotation?.quotation_number} generated for ${formData.customer_name || 'Customer'}`,
        });
        addToast('success', 'Quotation Generated', `Quotation #${res.quotation?.quotation_number} created successfully.`);
        await loadAllCRMData();
        return { success: true };
      }
      return { success: false, error: res.error };
    } catch (err: any) {
      return { success: false, error: err.message || 'Quotation creation failed' };
    }
  };

  const handleUpdateQuotation = async (id: string, formData: Partial<QuotationFormData>): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await quotationsService.updateQuotation(id, formData);
      if (res.success) {
        await activitiesService.logActivity({
          customer_id: formData.customer_id || undefined,
          lead_id: formData.lead_id || undefined,
          action: 'Quotation Updated',
          description: `Quotation ${res.quotation?.quotation_number} revised`,
        });
        addToast('success', 'Quotation Updated', 'Changes saved successfully.');
        await loadAllCRMData();
        return { success: true };
      }
      return { success: false, error: res.error };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update quotation' };
    }
  };

  const handleDeleteQuotation = async (id: string): Promise<boolean> => {
    try {
      const res = await quotationsService.deleteQuotation(id);
      if (res.success) {
        addToast('success', 'Quotation Deleted', 'Record removed.');
        await loadAllCRMData();
        return true;
      }
      addToast('error', 'Error', res.error || 'Failed to delete quotation');
      return false;
    } catch (err: any) {
      addToast('error', 'Error', err.message);
      return false;
    }
  };

  const handleStatusChangeQuotation = async (id: string, status: QuotationStatus): Promise<boolean> => {
    try {
      const res = await quotationsService.updateQuotationStatus(id, status);
      if (res.success) {
        addToast('success', 'Status Updated', `Quotation marked as ${status}`);
        await loadAllCRMData();
        return true;
      }
      addToast('error', 'Error', res.error || 'Failed to update status');
      return false;
    } catch (err: any) {
      addToast('error', 'Error', err.message);
      return false;
    }
  };

  const handleDuplicateQuotation = async (quotation: Quotation) => {
    try {
      const res = await quotationsService.duplicateQuotation(quotation.id);
      if (res.success) {
        addToast('success', 'Quotation Duplicated', `Created draft ${res.quotation?.quotation_number}`);
        await loadAllCRMData();
        if (res.quotation) {
          setViewingQuotation(res.quotation);
        }
      }
    } catch (err: any) {
      addToast('error', 'Duplication Failed', err.message);
    }
  };

  const handleLinkProjectQuotation = async (quotationId: string, projectId: string): Promise<boolean> => {
    try {
      const res = await quotationsService.linkToProject(quotationId, projectId);
      if (res.success) {
        addToast('success', 'Project Linked', 'Quotation successfully attached to project.');
        await loadAllCRMData();
        return true;
      }
      addToast('error', 'Linking Failed', res.error);
      return false;
    } catch (err: any) {
      addToast('error', 'Error', err.message);
      return false;
    }
  };

  // Lead Action Handlers
  const handleCreateLead = async (formData: LeadFormData): Promise<boolean> => {
    try {
      const res = await leadsService.createLead(formData);
      if (res.error) {
        addToast('error', 'Failed to Add Lead', res.error);
        return false;
      }
      await activitiesService.logActivity({
        lead_id: res.lead?.id,
        action: 'Lead Created',
        description: `Inquiry captured from ${formData.lead_source} for ${formData.company_name || formData.contact_person}`,
      });
      addToast('success', 'Lead Added', `${formData.company_name || formData.contact_person} saved.`);
      await loadAllCRMData();
      return true;
    } catch (err: any) {
      addToast('error', 'Error', err.message || 'Could not save lead');
      return false;
    }
  };

  const handleUpdateLead = async (id: string, formData: Partial<LeadFormData>): Promise<boolean> => {
    try {
      const res = await leadsService.updateLead(id, formData);
      if (res.error) {
        addToast('error', 'Update Failed', res.error);
        return false;
      }
      await activitiesService.logActivity({
        lead_id: id,
        action: 'Lead Updated',
        description: `Lead profile modified`,
      });
      addToast('success', 'Lead Updated', 'Changes saved successfully.');
      await loadAllCRMData();
      return true;
    } catch (err: any) {
      addToast('error', 'Error', err.message);
      return false;
    }
  };

  const handleDeleteLeadConfirm = async () => {
    if (!deletingLead) return;
    setIsDeletingLead(true);
    try {
      const res = await leadsService.deleteLead(deletingLead.id);
      if (res.error) {
        addToast('error', 'Delete Failed', res.error);
      } else {
        addToast('success', 'Lead Removed', `${deletingLead.company_name} deleted.`);
        setDeletingLead(null);
        await loadAllCRMData();
      }
    } catch (err: any) {
      addToast('error', 'Error', err.message);
    } finally {
      setIsDeletingLead(false);
    }
  };

  const handleQuickStatusChange = async (leadId: string, status: LeadStatus) => {
    try {
      const targetLead = leads.find((l) => l.id === leadId);
      const oldStatus = targetLead?.status;
      const res = await leadsService.updateLead(leadId, { status });
      if (!res.error) {
        await activitiesService.logActivity({
          lead_id: leadId,
          action: 'Stage Advanced',
          description: `Moved from ${oldStatus} to ${status}`,
        });
        addToast('info', 'Status Updated', `Lead stage changed to ${status}`);
        await loadAllCRMData();
      }
    } catch (err: any) {
      addToast('error', 'Failed to update status', err.message);
    }
  };

  const handleQuickAssignChange = async (leadId: string, assignedTo: string) => {
    try {
      const res = await leadsService.updateLead(leadId, { assigned_to: assignedTo });
      if (!res.error) {
        await activitiesService.logActivity({
          lead_id: leadId,
          action: 'Sales Engineer Assigned',
          description: `Assigned to ${assignedTo}`,
        });
        addToast('info', 'Assignment Updated', `Assigned to ${assignedTo}`);
        await loadAllCRMData();
      }
    } catch (err: any) {
      addToast('error', 'Assignment failed', err.message);
    }
  };

  const handleConvertLeadSubmit = async (leadId: string, customerData: CustomerFormData): Promise<boolean> => {
    try {
      const res = await customersService.convertLeadToCustomer(leadId, customerData);
      if (res.success) {
        await activitiesService.logActivity({
          lead_id: leadId,
          customer_id: res.customer?.id,
          action: 'Lead Converted to Customer',
          description: `Lead converted to formal customer account for ${customerData.company_name}`,
        });
        addToast('success', 'Lead Converted!', `${customerData.company_name} is now an Active Customer.`);
        setConvertingLead(null);
        await loadAllCRMData();
        return true;
      } else {
        addToast('error', 'Conversion Failed', res.error);
        return false;
      }
    } catch (err: any) {
      addToast('error', 'Conversion Error', err.message);
      return false;
    }
  };

  // Customer Management Handlers
  const handleCreateCustomer = async (data: CustomerFormData): Promise<boolean> => {
    try {
      await customersService.createCustomer(data);
      await activitiesService.logActivity({
        action: 'Customer Account Created',
        description: `Direct customer registered: ${data.company_name || data.contact_person}`,
      });
      addToast('success', 'Customer Added', `${data.company_name} registered successfully.`);
      await loadAllCRMData();
      return true;
    } catch (err: any) {
      addToast('error', 'Error Creating Customer', err?.message || 'Could not create customer');
      return false;
    }
  };

  const handleUpdateCustomer = async (id: string, data: Partial<CustomerFormData>): Promise<boolean> => {
    try {
      await customersService.updateCustomer(id, data);
      await activitiesService.logActivity({
        customer_id: id,
        action: 'Customer Updated',
        description: `Customer account updated`,
      });
      addToast('success', 'Customer Updated', 'Changes saved successfully.');
      await loadAllCRMData();
      return true;
    } catch (err: any) {
      addToast('error', 'Update Failed', err?.message || 'Could not update customer');
      return false;
    }
  };

  const handleDeleteCustomer = async (id: string): Promise<boolean> => {
    try {
      const res = await customersService.deleteCustomer(id);
      if (res.success) {
        addToast('success', 'Customer Deleted', 'Customer account removed.');
        await loadAllCRMData();
        return true;
      } else {
        addToast('error', 'Delete Failed', res.error);
        return false;
      }
    } catch (err: any) {
      addToast('error', 'Error', err?.message || 'Could not delete customer');
      return false;
    }
  };

  // Follow-up Actions
  const handleCreateFollowup = async (data: FollowupFormData): Promise<boolean> => {
    try {
      await followupsService.createFollowup(data);
      await activitiesService.logActivity({
        lead_id: data.lead_id || undefined,
        customer_id: data.customer_id || undefined,
        action: 'Follow-up Scheduled',
        description: `${data.followup_type} scheduled for ${new Date(data.followup_date).toLocaleDateString('en-IN')}: ${data.subject}`,
      });
      addToast('success', 'Follow-up Scheduled', `Reminder set for ${data.subject}`);
      await loadAllCRMData();
      return true;
    } catch (err: any) {
      addToast('error', 'Error', err?.message || 'Could not schedule follow-up');
      return false;
    }
  };

  const handleUpdateFollowup = async (id: string, data: Partial<FollowupFormData>): Promise<boolean> => {
    try {
      await followupsService.updateFollowup(id, data);
      addToast('success', 'Follow-up Updated', 'Changes saved.');
      await loadAllCRMData();
      return true;
    } catch (err: any) {
      addToast('error', 'Error', err?.message || 'Could not update follow-up');
      return false;
    }
  };

  const handleCompleteFollowup = async (id: string, notes?: string): Promise<boolean> => {
    try {
      const res = await followupsService.completeFollowup(id, notes);
      await activitiesService.logActivity({
        lead_id: res.followup.lead_id || undefined,
        customer_id: res.followup.customer_id || undefined,
        action: 'Follow-up Completed',
        description: `Completed ${res.followup.followup_type}: ${res.followup.subject} ${notes ? `(Notes: ${notes})` : ''}`,
      });
      addToast('success', 'Follow-up Completed', `Marked as done.`);
      await loadAllCRMData();
      return true;
    } catch (err: any) {
      addToast('error', 'Error', err?.message || 'Could not complete follow-up');
      return false;
    }
  };

  const handleDeleteFollowup = async (id: string): Promise<boolean> => {
    try {
      await followupsService.deleteFollowup(id);
      addToast('success', 'Deleted', 'Follow-up record removed.');
      await loadAllCRMData();
      return true;
    } catch (err: any) {
      addToast('error', 'Error', err?.message || 'Could not delete follow-up');
      return false;
    }
  };

  // Task Actions
  const handleCreateTask = async (data: TaskFormData): Promise<boolean> => {
    try {
      await tasksService.createTask(data);
      await activitiesService.logActivity({
        lead_id: data.lead_id || undefined,
        customer_id: data.customer_id || undefined,
        action: 'Task Created',
        description: `Task assigned: ${data.title} (${data.priority}) to ${data.assigned_to}`,
      });
      addToast('success', 'Task Created', `Task "${data.title}" assigned.`);
      await loadAllCRMData();
      return true;
    } catch (err: any) {
      addToast('error', 'Error', err?.message || 'Could not create task');
      return false;
    }
  };

  const handleUpdateTask = async (id: string, data: Partial<TaskFormData>): Promise<boolean> => {
    try {
      await tasksService.updateTask(id, data);
      addToast('success', 'Task Updated', 'Changes saved.');
      await loadAllCRMData();
      return true;
    } catch (err: any) {
      addToast('error', 'Error', err?.message || 'Could not update task');
      return false;
    }
  };

  const handleToggleTaskComplete = async (task: Task) => {
    try {
      const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
      await tasksService.updateTask(task.id, { status: newStatus });
      await activitiesService.logActivity({
        lead_id: task.lead_id || undefined,
        customer_id: task.customer_id || undefined,
        action: newStatus === 'Completed' ? 'Task Completed' : 'Task Reopened',
        description: `Task "${task.title}" status changed to ${newStatus}`,
      });
      addToast('info', 'Task Status', `Task marked as ${newStatus}`);
      await loadAllCRMData();
    } catch (err: any) {
      addToast('error', 'Error', err?.message || 'Could not toggle task');
    }
  };

  const handleDeleteTask = async (id: string): Promise<boolean> => {
    try {
      await tasksService.deleteTask(id);
      addToast('success', 'Task Deleted', 'Task removed.');
      await loadAllCRMData();
      return true;
    } catch (err: any) {
      addToast('error', 'Error', err?.message || 'Could not delete task');
      return false;
    }
  };

  // Filtered Leads Calculation
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // 1. Search filter
      if (filters.search) {
        const term = filters.search.toLowerCase();
        const matchCompany = lead.company_name?.toLowerCase().includes(term);
        const matchContact = lead.contact_person?.toLowerCase().includes(term);
        const matchPhone = lead.phone?.toLowerCase().includes(term);
        const matchEmail = lead.email?.toLowerCase().includes(term);
        const matchReq = lead.requirement?.toLowerCase().includes(term);
        if (!matchCompany && !matchContact && !matchPhone && !matchEmail && !matchReq) {
          return false;
        }
      }

      // 2. Status filter
      if (filters.status !== 'all' && lead.status !== filters.status) {
        return false;
      }

      // 3. Source filter
      if (filters.source !== 'all' && lead.lead_source !== filters.source) {
        return false;
      }

      // 4. Industry filter
      if (filters.industry !== 'all' && lead.industry !== filters.industry) {
        return false;
      }

      // 5. Score Range filter
      if (filters.scoreRange !== 'all') {
        if (filters.scoreRange === 'hot' && lead.lead_score < 80) return false;
        if (filters.scoreRange === 'warm' && (lead.lead_score < 70 || lead.lead_score >= 80)) return false;
        if (filters.scoreRange === 'cold' && (lead.lead_score < 40 || lead.lead_score >= 70)) return false;
        if (filters.scoreRange === 'low' && lead.lead_score >= 40) return false;
      }

      return true;
    });
  }, [leads, filters]);

  // Export CSV
  const exportToCSV = () => {
    const headers = [
      'Company Name',
      'Contact Person',
      'Phone',
      'Email',
      'Location',
      'Source',
      'Status',
      'Score',
      'Industry',
      'Assigned To',
      'Requirement',
    ];
    const rows = filteredLeads.map((l) => [
      `"${(l.company_name || '').replace(/"/g, '""')}"`,
      `"${(l.contact_person || '').replace(/"/g, '""')}"`,
      `"${l.phone}"`,
      `"${l.email || ''}"`,
      `"${(l.location || '').replace(/"/g, '""')}"`,
      `"${l.lead_source}"`,
      `"${l.status}"`,
      l.lead_score,
      `"${(l.industry || '').replace(/"/g, '""')}"`,
      `"${(l.assigned_to || '').replace(/"/g, '""')}"`,
      `"${(l.requirement || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `shiv_power_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('success', 'Export Complete', `${filteredLeads.length} leads exported to CSV.`);
  };

  // Follow-up counts
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const overdueFollowupCount = followups.filter((f) => {
    const d = new Date(f.followup_date);
    return f.status === 'Pending' && d < todayStart;
  }).length;

  const todayFollowupCount = followups.filter((f) => {
    const d = new Date(f.followup_date);
    return f.status === 'Pending' && d >= todayStart && d <= todayEnd;
  }).length;

  const openTaskCount = tasks.filter((t) => t.status !== 'Completed' && t.status !== 'Cancelled').length;

  const unreadNotificationsCount = overdueFollowupCount + todayFollowupCount;

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans transition-colors duration-200">
      {/* 1. Desktop Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onNavigateTab={setActiveTab}
        onOpenCreateSheet={() => setIsCreateSheetOpen(true)}
        counts={{
          leadsCount: leads.length,
          customersCount: customers.length,
          quotationsCount: quotations.length,
          projectsCount: projects.length,
          openTasksCount: openTaskCount,
          todayFollowupCount: todayFollowupCount,
        }}
        isLiveDatabase={isLiveDatabase}
        onRefreshData={() => loadAllCRMData(true)}
        isLoadingData={isLoading}
      />

      {/* 2. Main Application Flow Column */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Top Header with search, notifications, theme switch */}
        <TopHeader
          onOpenMobileDrawer={() => setIsMobileMoreOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenCreateSheet={() => setIsCreateSheetOpen(true)}
          onNavigateTab={setActiveTab}
          unreadNotificationsCount={unreadNotificationsCount}
          isLiveDatabase={isLiveDatabase}
          onRefreshData={() => loadAllCRMData(true)}
          isLoadingData={isLoading}
          activeTabTitle={TAB_TITLES[activeTab] || 'Shiv Power OS'}
          leads={leads}
          customers={customers}
          quotations={quotations}
          projects={projects}
          tasks={tasks}
          onSelectLead={(lead) => setViewingLead(lead)}
          onSelectCustomer={() => setActiveTab('customers')}
          onSelectQuotation={(quot) => setViewingQuotation(quot)}
          onSelectProject={() => setActiveTab('projects')}
        />

        {/* Content Body Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 md:pb-12">
          {/* TAB 1: CRM OVERVIEW DASHBOARD */}
          {activeTab === 'overview' && (
            <CRMOverview
              leads={leads}
              customers={customers}
              quotations={quotations}
              projects={projects}
              followups={followups}
              tasks={tasks}
              activities={activities}
              onNavigateTab={setActiveTab}
              onViewLead={(lead) => setViewingLead(lead)}
              onScheduleFollowup={() => setFollowupModalTarget({ isOpen: true })}
              onCreateQuotation={() => setQuotationModalTarget({ isOpen: true })}
              onConvertToCustomer={(lead) => setConvertingLead(lead)}
              onAddLead={() => {
                setEditingLead(null);
                setIsAddLeadModalOpen(true);
              }}
              onAddCustomer={() => {
                setIsAddCustomerModalOpen(true);
              }}
            />
          )}

          {/* TAB 2: SALES PIPELINE (KANBAN) */}
          {activeTab === 'pipeline' && (
            <SalesPipeline
              leads={leads}
              onStatusChange={handleQuickStatusChange}
              onViewLead={(lead) => setViewingLead(lead)}
              onScheduleFollowup={(lead) => setFollowupModalTarget({ isOpen: true, lead })}
              onConvertToCustomer={(lead) => setConvertingLead(lead)}
              onAddNewLead={() => {
                setEditingLead(null);
                setIsAddLeadModalOpen(true);
              }}
            />
          )}

          {/* TAB 3: LEADS DIRECTORY */}
          {activeTab === 'leads' && (
            <div className="space-y-4">
              {/* Action row with export and add */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Lead Registry ({filteredLeads.length})
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Filter, qualify, score, and convert prospective industrial inquiries.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={exportToCSV}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingLead(null);
                      setIsAddLeadModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Add Lead</span>
                  </button>
                </div>
              </div>

              {/* Top Summary Metrics */}
              <LeadStatsHeader leads={leads} />

              {/* Filter and Search Controls */}
              <LeadFilterBar
                filters={filters}
                onFilterChange={(key, val) => setFilters((prev) => ({ ...prev, [key]: val }))}
                onResetFilters={() =>
                  setFilters({
                    search: '',
                    status: 'all',
                    source: 'all',
                    industry: 'all',
                    scoreRange: 'all',
                  })
                }
                totalFiltered={filteredLeads.length}
                totalLeads={leads.length}
                viewMode={viewMode}
                onToggleViewMode={setViewMode}
                industries={POWER_INDUSTRIES}
              />

              {/* Lead Table / Mobile Card Grid */}
              <LeadList
                leads={filteredLeads}
                viewMode={viewMode}
                onView={(lead) => setViewingLead(lead)}
                onEdit={(lead) => {
                  setEditingLead(lead);
                  setIsAddLeadModalOpen(true);
                }}
                onDelete={(lead) => setDeletingLead(lead)}
                onQuickFollowUp={(lead) => setFollowupModalTarget({ isOpen: true, lead })}
                onStatusChange={handleQuickStatusChange}
                onAssignChange={handleQuickAssignChange}
                teamMembers={teamMembers}
                onOpenAddModal={() => {
                  setEditingLead(null);
                  setIsAddLeadModalOpen(true);
                }}
                hasActiveFilters={
                  Boolean(filters.search) ||
                  filters.status !== 'all' ||
                  filters.source !== 'all' ||
                  filters.industry !== 'all' ||
                  filters.scoreRange !== 'all'
                }
                onResetFilters={() =>
                  setFilters({
                    search: '',
                    status: 'all',
                    source: 'all',
                    industry: 'all',
                    scoreRange: 'all',
                  })
                }
              />
            </div>
          )}

          {/* TAB 4: CUSTOMERS MANAGEMENT */}
          {activeTab === 'customers' && (
            <CustomerManagement
              customers={customers}
              leads={leads}
              teamMembers={teamMembers}
              onCreateCustomer={handleCreateCustomer}
              onUpdateCustomer={handleUpdateCustomer}
              onDeleteCustomer={handleDeleteCustomer}
              onScheduleFollowup={(customer) => setFollowupModalTarget({ isOpen: true, customer })}
              onAddTask={(customer) => setTaskModalTarget({ isOpen: true, customer })}
              onViewLead={(lead) => setViewingLead(lead)}
              onCreateQuotation={(customer) => setQuotationModalTarget({ isOpen: true, customer })}
              onViewQuotation={(quotation) => setViewingQuotation(quotation)}
            />
          )}

          {/* TAB 5: QUOTATIONS MANAGEMENT */}
          {activeTab === 'quotations' && (
            <QuotationsManagement
              quotations={quotations}
              customers={customers}
              leads={leads}
              projects={projects}
              onCreateQuotation={handleCreateQuotation}
              onUpdateQuotation={handleUpdateQuotation}
              onDeleteQuotation={async (id) => {
                const ok = await handleDeleteQuotation(id);
                return { success: ok };
              }}
              onStatusChange={handleStatusChangeQuotation}
              onDuplicateQuotation={async (id) => {
                const target = quotations.find((q) => q.id === id);
                if (target) {
                  await handleDuplicateQuotation(target);
                  return true;
                }
                return false;
              }}
              onLinkProject={handleLinkProjectQuotation}
              onCreateProject={handleCreateProjectFromQuotation}
              onViewCustomer={() => {
                setActiveTab('customers');
              }}
              onViewLead={(leadId) => {
                const found = leads.find((l) => l.id === leadId);
                if (found) setViewingLead(found);
              }}
            />
          )}

          {/* TAB 6: INDUSTRIAL PROJECT MANAGEMENT */}
          {activeTab === 'projects' && (
            <ProjectManagement
              projects={projects}
              customers={customers}
              quotations={quotations}
              tasks={tasks}
              teamMembers={teamMembers}
              onRefreshProjects={() => loadAllCRMData()}
              onNavigateTab={setActiveTab}
              initialAction={projectActionTarget}
              onClearInitialAction={() => setProjectActionTarget(null)}
            />
          )}

          {/* TAB 7: SCHEDULED FOLLOW-UPS */}
          {activeTab === 'followups' && (
            <FollowupManagement
              followups={followups}
              leads={leads}
              customers={customers}
              onOpenScheduleModal={() => setFollowupModalTarget({ isOpen: true })}
              onEditFollowup={(fup) => setFollowupModalTarget({ isOpen: true, initialData: fup })}
              onCompleteFollowup={handleCompleteFollowup}
              onDeleteFollowup={handleDeleteFollowup}
              onViewLead={(lead) => setViewingLead(lead)}
              onViewCustomer={(customer) => {
                setActiveTab('customers');
              }}
            />
          )}

          {/* TAB 8: TASK MANAGEMENT */}
          {activeTab === 'tasks' && (
            <TaskManagement
              tasks={tasks}
              leads={leads}
              customers={customers}
              teamMembers={teamMembers}
              onOpenAddTaskModal={() => setTaskModalTarget({ isOpen: true })}
              onEditTask={(task) => setTaskModalTarget({ isOpen: true, initialData: task })}
              onToggleComplete={handleToggleTaskComplete}
              onDeleteTask={handleDeleteTask}
              onViewLead={(lead) => setViewingLead(lead)}
              onViewCustomer={(customer) => {
                setActiveTab('customers');
              }}
            />
          )}

          {/* TAB 9: ACTIVITY AUDIT LOG */}
          {activeTab === 'activities' && (
            <ActivityTimeline
              activities={activities}
              leads={leads}
              customers={customers}
              onViewLead={(lead) => setViewingLead(lead)}
              onViewCustomer={(customer) => {
                setActiveTab('customers');
              }}
            />
          )}

          {/* TAB 10: AI SALES COPILOT */}
          {activeTab === 'ai_assistant' && (
            <AIAssistant
              leads={leads}
              customers={customers}
              selectedLead={aiSelectedLead}
              onSelectLead={setAiSelectedLead}
              onScheduleFollowup={(lead) => setFollowupModalTarget({ isOpen: true, lead })}
              onAddTask={(lead) => setTaskModalTarget({ isOpen: true, lead })}
              onUpdateLeadStatus={handleQuickStatusChange}
              onUpdateLeadScore={async (leadId, score) => {
                await leadsService.updateLead(leadId, { lead_score: score });
                await loadAllCRMData();
                addToast('success', 'Lead Score Updated', `New score: ${score}/100`);
              }}
            />
          )}

          {/* TAB 11: ADMIN USER LOGIN AUDIT & SUPABASE DATABASE */}
          {activeTab === 'user_logins' && (
            isAdmin ? (
              <UserLoginsManagement />
            ) : (
              <div className="p-8 max-w-xl mx-auto my-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 shadow-inner">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Administrator Access Only
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  The User Logins audit database is strictly restricted to system administrators. Your account ({userProfile.email}) does not have administrative privileges.
                </p>
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setActiveTab('overview')}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xs transition-all"
                  >
                    Return to CRM Overview
                  </button>
                </div>
              </div>
            )
          )}
        </main>

        {/* 3. Mobile Bottom Navigation Bar (Fixed bottom for phone screens) */}
        <MobileBottomNav
          activeTab={activeTab}
          onNavigateTab={setActiveTab}
          onOpenCreateSheet={() => setIsCreateSheetOpen(true)}
          onOpenMoreMenu={() => setIsMobileMoreOpen(true)}
          pendingTasksCount={openTaskCount}
        />
      </div>

      {/* 4. Global Overlays & Drawers */}
      <MobileMoreDrawer
        isOpen={isMobileMoreOpen}
        onClose={() => setIsMobileMoreOpen(false)}
        activeTab={activeTab}
        onNavigateTab={setActiveTab}
        counts={{
          leads: leads.length,
          customers: customers.length,
          quotations: quotations.length,
          projects: projects.length,
          followups: todayFollowupCount,
          tasks: openTaskCount,
        }}
        isLiveDatabase={isLiveDatabase}
        onRefreshData={() => loadAllCRMData(true)}
        isLoadingData={isLoading}
      />

      <MobileCreateActionSheet
        isOpen={isCreateSheetOpen}
        onClose={() => setIsCreateSheetOpen(false)}
        onAddLead={() => {
          setIsCreateSheetOpen(false);
          setEditingLead(null);
          setIsAddLeadModalOpen(true);
        }}
        onAddCustomer={() => {
          setIsCreateSheetOpen(false);
          setIsAddCustomerModalOpen(true);
        }}
        onCreateQuotation={() => {
          setIsCreateSheetOpen(false);
          setQuotationModalTarget({ isOpen: true });
        }}
        onScheduleFollowup={() => {
          setIsCreateSheetOpen(false);
          setFollowupModalTarget({ isOpen: true });
        }}
        onAddTask={() => {
          setIsCreateSheetOpen(false);
          setTaskModalTarget({ isOpen: true });
        }}
        onAddProject={() => {
          setIsCreateSheetOpen(false);
          setProjectActionTarget({ action: 'create' });
          setActiveTab('projects');
        }}
      />

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        leads={leads}
        customers={customers}
        quotations={quotations}
        projects={projects}
        tasks={tasks}
        onNavigateTab={setActiveTab}
        onSelectLead={(lead) => {
          setViewingLead(lead);
        }}
        onSelectCustomer={() => {
          setActiveTab('customers');
        }}
        onSelectQuotation={(quot) => {
          setViewingQuotation(quot);
        }}
        onSelectProject={() => {
          setActiveTab('projects');
        }}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        followups={followups}
        tasks={tasks}
        quotations={quotations}
        onNavigateTab={setActiveTab}
        onCompleteFollowup={handleCompleteFollowup}
        onCompleteTask={handleToggleTaskComplete}
      />

      <FloatingAITrigger
        onNavigateTab={setActiveTab}
        onOpenQuickPrompt={() => {
          setActiveTab('ai_assistant');
        }}
      />

      {/* 5. Direct Quick Add Customer Modal */}
      <CustomerFormModal
        isOpen={isAddCustomerModalOpen}
        onClose={() => setIsAddCustomerModalOpen(false)}
        onSubmit={async (data) => {
          const ok = await handleCreateCustomer(data);
          if (ok) setIsAddCustomerModalOpen(false);
          return ok;
        }}
        teamMembers={teamMembers}
      />

      {/* 6. Lead Form Modal */}
      <LeadFormModal
        isOpen={isAddLeadModalOpen}
        onClose={() => {
          setIsAddLeadModalOpen(false);
          setEditingLead(null);
        }}
        onSubmit={async (data) => {
          if (editingLead) {
            const ok = await handleUpdateLead(editingLead.id, data);
            if (ok) {
              setIsAddLeadModalOpen(false);
              setEditingLead(null);
            }
            return ok;
          } else {
            const ok = await handleCreateLead(data);
            if (ok) {
              setIsAddLeadModalOpen(false);
            }
            return ok;
          }
        }}
        initialData={editingLead}
        teamMembers={teamMembers}
      />

      {/* 7. Lead Detail Modal */}
      <LeadDetailModal
        isOpen={Boolean(viewingLead)}
        lead={viewingLead}
        onClose={() => setViewingLead(null)}
        onEdit={(lead) => {
          setViewingLead(null);
          setEditingLead(lead);
          setIsAddLeadModalOpen(true);
        }}
        onScheduleFollowup={(lead) => {
          setViewingLead(null);
          setFollowupModalTarget({ isOpen: true, lead });
        }}
        onConvertToCustomer={(lead) => {
          setViewingLead(null);
          setConvertingLead(lead);
        }}
        onCreateQuotation={(lead) => {
          setViewingLead(null);
          setQuotationModalTarget({ isOpen: true, lead });
        }}
        onConsultAI={(lead) => {
          setViewingLead(null);
          setAiSelectedLead(lead);
          setActiveTab('ai_assistant');
        }}
      />

      {/* 8. Convert Lead to Customer Modal */}
      <ConvertLeadModal
        isOpen={Boolean(convertingLead)}
        lead={convertingLead}
        teamMembers={teamMembers}
        onClose={() => setConvertingLead(null)}
        onConvert={handleConvertLeadSubmit}
      />

      {/* 9. Delete Lead Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingLead)}
        lead={deletingLead}
        onClose={() => setDeletingLead(null)}
        onConfirm={handleDeleteLeadConfirm}
        isDeleting={isDeletingLead}
      />

      {/* 10. Schedule / Edit Follow-up Modal */}
      <FollowupFormModal
        isOpen={followupModalTarget.isOpen}
        onClose={() => setFollowupModalTarget({ isOpen: false })}
        onSubmit={async (data) => {
          if (followupModalTarget.initialData) {
            return handleUpdateFollowup(followupModalTarget.initialData.id, data);
          } else {
            return handleCreateFollowup(data);
          }
        }}
        initialData={followupModalTarget.initialData}
        targetLead={followupModalTarget.lead}
        targetCustomer={followupModalTarget.customer}
        leads={leads}
        customers={customers}
        teamMembers={teamMembers}
      />

      {/* 11. Add / Edit Task Modal */}
      <TaskFormModal
        isOpen={taskModalTarget.isOpen}
        onClose={() => setTaskModalTarget({ isOpen: false })}
        onSubmit={async (data) => {
          if (taskModalTarget.initialData) {
            return handleUpdateTask(taskModalTarget.initialData.id, data);
          } else {
            return handleCreateTask(data);
          }
        }}
        initialData={taskModalTarget.initialData}
        targetLead={taskModalTarget.lead}
        targetCustomer={taskModalTarget.customer}
        leads={leads}
        customers={customers}
        teamMembers={teamMembers}
      />

      {/* 12. Create / Edit Quotation Modal */}
      <QuotationFormModal
        isOpen={quotationModalTarget.isOpen}
        onClose={() =>
          setQuotationModalTarget({
            isOpen: false,
            lead: null,
            customer: null,
            initialData: null,
          })
        }
        onSubmit={async (data) => {
          if (quotationModalTarget.initialData) {
            return handleUpdateQuotation(quotationModalTarget.initialData.id, data);
          } else {
            return handleCreateQuotation(data);
          }
        }}
        initialData={quotationModalTarget.initialData}
        customers={customers}
        leads={leads}
        preselectedCustomer={quotationModalTarget.customer}
        preselectedLead={quotationModalTarget.lead}
      />

      {/* 13. Quotation Detail Modal */}
      <QuotationDetailModal
        isOpen={Boolean(viewingQuotation)}
        quotation={viewingQuotation}
        onClose={() => setViewingQuotation(null)}
        onEdit={(quotation) => {
          setViewingQuotation(null);
          setQuotationModalTarget({
            isOpen: true,
            initialData: quotation,
          });
        }}
        onPrintPreview={(quotation) => {
          setPreviewingQuotation(quotation);
        }}
        onStatusChange={handleStatusChangeQuotation}
        onDuplicate={handleDuplicateQuotation}
        onLinkProject={(quotation) => {
          setLinkingQuotation(quotation);
        }}
        onViewCustomer={() => {
          setViewingQuotation(null);
          setActiveTab('customers');
        }}
        onViewLead={(leadId) => {
          const found = leads.find((l) => l.id === leadId);
          if (found) {
            setViewingQuotation(null);
            setViewingLead(found);
          }
        }}
      />

      {/* 14. Quotation PDF / Print Preview Modal */}
      <QuotationPreviewModal
        isOpen={Boolean(previewingQuotation)}
        quotation={previewingQuotation}
        onClose={() => setPreviewingQuotation(null)}
      />

      {/* 15. Link Quotation to Project Modal */}
      <LinkProjectModal
        isOpen={Boolean(linkingQuotation)}
        quotation={linkingQuotation}
        projects={projects}
        onClose={() => setLinkingQuotation(null)}
        onLink={handleLinkProjectQuotation}
      />

      {/* 16. Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};
