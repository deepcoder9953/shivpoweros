import React, { useState, useEffect } from 'react';
import { Lead, LeadActivity, FollowUp, LeadStatus } from '../../types/lead';
import { Task } from '../../types/task';
import {
  Quotation,
  getStatusBadgeClass,
  getStatusLabel,
  isQuotationExpired,
  formatINR,
} from '../../types/quotation';
import { StatusBadge, SourceBadge, ScoreBadge } from '../ui/Badge';
import { leadsService } from '../../lib/leadsService';
import { tasksService } from '../../lib/tasksService';
import { quotationsService } from '../../lib/quotationsService';
import {
  X,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Zap,
  Tag,
  Clock,
  MessageSquare,
  CalendarPlus,
  Edit2,
  FileText,
  Activity,
  Send,
  Plus,
  UserCheck,
  CheckSquare,
  Check,
  ShieldCheck,
  Flame,
  Sparkles,
  Eye,
} from 'lucide-react';
import { STATUS_OPTIONS } from './LeadFilterBar';

interface LeadDetailModalProps {
  isOpen: boolean;
  lead: Lead | null;
  onClose: () => void;
  onEdit: (lead: Lead) => void;
  onScheduleFollowUp: (lead: Lead) => void;
  onStatusChange: (leadId: string, status: LeadStatus) => void;
  onNoteAdded: () => void;
  onConvertToCustomer?: (lead: Lead) => void;
  onAddTask?: (lead: Lead) => void;
  onOpenAIAssistant?: (lead: Lead) => void;
  onCreateQuotation?: (lead: Lead) => void;
  onViewQuotation?: (quotation: Quotation) => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  isOpen,
  lead,
  onClose,
  onEdit,
  onScheduleFollowUp,
  onStatusChange,
  onNoteAdded,
  onConvertToCustomer,
  onAddTask,
  onOpenAIAssistant,
  onCreateQuotation,
  onViewQuotation,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'quotations' | 'followups' | 'tasks' | 'notes' | 'activities'>('overview');
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  useEffect(() => {
    if (lead && isOpen) {
      loadLeadDetails(lead.id);
    }
  }, [lead, isOpen]);

  const loadLeadDetails = async (leadId: string) => {
    const [actData, fupData, tData, qData] = await Promise.all([
      leadsService.getActivities(leadId),
      leadsService.getFollowUps(leadId),
      tasksService.getTasksByLead(leadId),
      quotationsService.getQuotationsByLead(leadId),
    ]);
    setActivities(actData);
    setFollowUps(fupData);
    setTasks(tData.tasks || []);
    setQuotations(qData.quotations || []);
  };

  if (!isOpen || !lead) return null;

  const cleanPhone = lead.phone.replace(/[^0-9]/g, '');

  const getScoreClassification = (score: number) => {
    if (score >= 81) return { label: 'Very Hot', color: 'text-rose-600 bg-rose-50 border-rose-200' };
    if (score >= 61) return { label: 'Hot', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    if (score >= 31) return { label: 'Warm', color: 'text-blue-600 bg-blue-50 border-blue-200' };
    return { label: 'Cold', color: 'text-slate-600 bg-slate-100 border-slate-200' };
  };

  const scoreClass = getScoreClassification(lead.lead_score);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsAddingNote(true);
    try {
      const updatedNotes = lead.notes
        ? `${lead.notes}\n\n[${new Date().toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' })}] ${newNote.trim()}`
        : `[${new Date().toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' })}] ${newNote.trim()}`;

      await leadsService.updateLead(lead.id, { notes: updatedNotes });
      await leadsService.logActivity(lead.id, 'Note Added', newNote.trim());
      setNewNote('');
      await loadLeadDetails(lead.id);
      onNoteAdded();
    } finally {
      setIsAddingNote(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        id="lead-detail-modal"
        className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] my-auto"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
              <StatusBadge status={lead.status} size="md" />
              <SourceBadge source={lead.lead_source} />
              <div className={`px-2 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1 ${scoreClass.color}`}>
                <Flame className="w-3 h-3" />
                <span>Score: {lead.lead_score} ({scoreClass.label})</span>
              </div>
            </div>
            <h2 className="text-xl font-bold text-slate-900 truncate">
              {lead.company_name || lead.contact_person || 'Lead Details'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
              <span>Industry: <strong className="text-slate-700">{lead.industry}</strong></span>
              <span>•</span>
              <span>Assigned: <strong className="text-slate-700">{lead.assigned_to}</strong></span>
              <span>•</span>
              <span>Created: {new Date(lead.created_at).toLocaleDateString('en-IN')}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenAIAssistant && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAIAssistant(lead);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded-xl transition-colors shadow-2xs"
                title="Open AI Sales Copilot for this lead"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>AI Copilot</span>
              </button>
            )}
            {onConvertToCustomer && (
              <button
                type="button"
                onClick={() => onConvertToCustomer(lead)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-colors shadow-2xs"
                title="Convert this lead to an active Customer Account"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Convert to Customer</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onEdit(lead)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Action Ribbon */}
        <div className="px-6 py-2.5 bg-blue-50/60 border-b border-blue-100/80 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-3">
            <a
              href={`tel:${lead.phone}`}
              className="inline-flex items-center gap-1.5 font-semibold text-blue-700 hover:text-blue-900 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              Call {lead.phone}
            </a>
            {cleanPhone && (
              <a
                href={`https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 hover:text-emerald-900 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                WhatsApp
              </a>
            )}
            {lead.email && (
              <a
                href={`mailto:${lead.email}`}
                className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                Email
              </a>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onCreateQuotation && (
              <button
                type="button"
                id="lead-create-quotation-btn"
                onClick={() => onCreateQuotation(lead)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Create Quotation</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onScheduleFollowUp(lead)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              Schedule Follow-up
            </button>
            {onAddTask && (
              <button
                type="button"
                onClick={() => onAddTask(lead)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-700 text-white font-medium hover:bg-slate-800 transition-colors"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                Add Task
              </button>
            )}
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="px-6 border-b border-slate-200 flex items-center gap-6 text-xs font-bold text-slate-500 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            type="button"
            id="lead-tab-quotations"
            onClick={() => setActiveTab('quotations')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'quotations'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Quotations ({quotations.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('followups')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'followups'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Follow-ups ({followUps.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tasks')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'tasks'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent hover:text-slate-800'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Tasks ({tasks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'notes'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Notes</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('activities')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'activities'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent hover:text-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>History ({activities.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Power Requirement Box */}
              <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs mb-1.5">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span>Power Solution Requirement</span>
                </div>
                <p className="text-xs text-amber-950 leading-relaxed">
                  {lead.requirement || 'No specific equipment requirements logged yet.'}
                </p>
              </div>

              {/* Grid Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Contact Information */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                    Contact Information
                  </h3>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Contact Person:</span>
                      <strong className="text-slate-800 font-medium">{lead.contact_person || '—'}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Phone:</span>
                      <strong className="text-slate-800 font-mono font-medium">{lead.phone}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Email:</span>
                      <span className="text-slate-800">{lead.email || '—'}</span>
                    </div>
                    <div className="flex items-start justify-between">
                      <span className="text-slate-500">Location:</span>
                      <span className="text-slate-800 text-right max-w-[200px]">{lead.location || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* Lead Specifications */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                    CRM Details
                  </h3>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Pipeline Status:</span>
                      <select
                        value={lead.status}
                        onChange={(e) => onStatusChange(lead.id, e.target.value as LeadStatus)}
                        className="text-xs font-semibold bg-white border border-slate-300 rounded px-2 py-0.5 text-slate-800"
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Lead Source:</span>
                      <strong className="text-slate-800">{lead.lead_source}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Industry:</span>
                      <strong className="text-slate-800">{lead.industry}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Assigned To:</span>
                      <strong className="text-slate-800">{lead.assigned_to}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Last Updated:</span>
                      <span className="text-slate-600">
                        {new Date(lead.updated_at).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lead Score Scale Visual Guide */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-2 text-xs">
                  <span className="font-bold text-slate-700">Lead Conversion Potential</span>
                  <span className="font-bold text-slate-900">{lead.lead_score} / 100</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      lead.lead_score >= 81
                        ? 'bg-rose-500'
                        : lead.lead_score >= 61
                        ? 'bg-amber-500'
                        : lead.lead_score >= 31
                        ? 'bg-blue-500'
                        : 'bg-slate-400'
                    }`}
                    style={{ width: `${Math.min(Math.max(lead.lead_score, 5), 100)}%` }}
                  />
                </div>
                <div className="grid grid-cols-4 gap-1 text-[10px] text-slate-400 font-semibold mt-2 text-center">
                  <span>0-30: Cold</span>
                  <span>31-60: Warm</span>
                  <span>61-80: Hot</span>
                  <span>81-100: Very Hot</span>
                </div>
              </div>

              {/* Commercial Quotations Summary in Overview */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Commercial Quotations ({quotations.length})
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {onCreateQuotation && (
                      <button
                        type="button"
                        onClick={() => onCreateQuotation(lead)}
                        className="inline-flex items-center gap-1 text-2xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Create Quotation</span>
                      </button>
                    )}
                    {quotations.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('quotations')}
                        className="text-2xs font-semibold text-slate-500 hover:text-slate-800"
                      >
                        View All →
                      </button>
                    )}
                  </div>
                </div>

                {quotations.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No quotations created for this lead yet.</p>
                ) : (
                  <div className="space-y-2">
                    {quotations.slice(0, 3).map((q) => {
                      const expired = isQuotationExpired(q);
                      return (
                        <div
                          key={q.id}
                          className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between hover:bg-slate-100/70 transition-colors"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-slate-900">{q.quotation_number}</span>
                              <span
                                className={`text-3xs font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(
                                  q.status,
                                  expired
                                )}`}
                              >
                                {expired ? 'Expired' : getStatusLabel(q.status)}
                              </span>
                            </div>
                            <span className="text-2xs text-slate-500 truncate block max-w-sm mt-0.5">
                              {q.title}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono text-xs font-bold text-slate-900 block">
                              {formatINR(q.total)}
                            </span>
                            {onViewQuotation && (
                              <button
                                type="button"
                                onClick={() => onViewQuotation(q)}
                                className="text-3xs font-bold text-blue-600 hover:text-blue-800"
                              >
                                View Details
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Internal Notes Preview */}
              {lead.notes && (
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Internal Notes
                  </h3>
                  <pre className="text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                    {lead.notes}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB: QUOTATIONS */}
          {activeTab === 'quotations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Commercial Proposals for this Lead
                  </h3>
                  <p className="text-2xs text-slate-500">
                    Official quotations generated and delivered to {lead.company_name}
                  </p>
                </div>
                {onCreateQuotation && (
                  <button
                    type="button"
                    onClick={() => onCreateQuotation(lead)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Quotation</span>
                  </button>
                )}
              </div>

              {quotations.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-2">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-medium text-slate-600">No quotations generated yet</p>
                  <p className="text-2xs text-slate-400">
                    Create itemized quotations with equipment specifications, automatic GST calculations, and official Shiv Power branding.
                  </p>
                  {onCreateQuotation && (
                    <button
                      type="button"
                      onClick={() => onCreateQuotation(lead)}
                      className="mt-1 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create Quotation Now</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  {quotations.map((q) => {
                    const expired = isQuotationExpired(q);
                    return (
                      <div
                        key={q.id}
                        className="p-3.5 hover:bg-slate-50 flex items-center justify-between gap-4 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black text-slate-900">
                              {q.quotation_number}
                            </span>
                            <span
                              className={`text-3xs font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(
                                q.status,
                                expired
                              )}`}
                            >
                              {expired ? 'Expired' : getStatusLabel(q.status)}
                            </span>
                            <span className="text-2xs text-slate-400">
                              Date: {q.quotation_date || q.created_at.split('T')[0]}
                            </span>
                          </div>
                          <div className="text-xs font-semibold text-slate-800">
                            {q.title}
                          </div>
                          {q.description && (
                            <p className="text-2xs text-slate-500 line-clamp-1">{q.description}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-right">
                            <span className="font-mono text-sm font-extrabold text-slate-900 block">
                              {formatINR(q.total)}
                            </span>
                            <span className="text-3xs text-slate-400">
                              Net: {formatINR(q.amount || q.subtotal)}
                            </span>
                          </div>

                          {onViewQuotation && (
                            <button
                              type="button"
                              onClick={() => onViewQuotation(q)}
                              className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                            >
                              View
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FOLLOW-UPS */}
          {activeTab === 'followups' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Scheduled Follow-ups</h3>
                <button
                  type="button"
                  onClick={() => onScheduleFollowUp(lead)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-colors shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Follow-up</span>
                </button>
              </div>

              {followUps.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-medium text-slate-600">No follow-ups scheduled</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Keep deals moving by scheduling calls, site surveys, or proposal reviews.
                  </p>
                  <button
                    type="button"
                    onClick={() => onScheduleFollowUp(lead)}
                    className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                  >
                    Schedule Now
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {followUps.map((fup) => (
                    <div
                      key={fup.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            {fup.type}
                          </span>
                          <span className="text-xs font-semibold text-slate-800">
                            {new Date(fup.scheduled_at).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              fup.status === 'Completed'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {fup.status}
                          </span>
                        </div>
                        {fup.notes && (
                          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{fup.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TASKS */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Assigned Tasks & Deliverables</h3>
                {onAddTask && (
                  <button
                    type="button"
                    onClick={() => onAddTask(lead)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Task</span>
                  </button>
                )}
              </div>

              {tasks.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <CheckSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-medium text-slate-600">No tasks assigned to this lead</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Assign site inspection, single-line diagram creation, or load calculations.
                  </p>
                  {onAddTask && (
                    <button
                      type="button"
                      onClick={() => onAddTask(lead)}
                      className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                    >
                      Add Task Now
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs flex items-start justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{task.title}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {task.priority}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              task.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {task.status}
                          </span>
                        </div>
                        {task.description && <p className="text-slate-600 mt-1">{task.description}</p>}
                        {task.due_date && (
                          <span className="text-[11px] text-slate-400 mt-1 block font-mono">
                            Due: {new Date(task.due_date).toLocaleDateString('en-IN')}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium shrink-0">
                        {task.assigned_to}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <form onSubmit={handleAddNote} className="space-y-2">
                <label htmlFor="new-note-input" className="block text-xs font-semibold text-slate-700">
                  Add Quick Note / Log Interaction
                </label>
                <div className="flex gap-2">
                  <textarea
                    id="new-note-input"
                    rows={2}
                    placeholder="Enter discussion notes, client feedback, or internal task..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white resize-none"
                  />
                  <button
                    type="submit"
                    disabled={isAddingNote || !newNote.trim()}
                    className="self-end px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                </div>
              </form>

              <div className="mt-4 pt-4 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Existing Notes</h4>
                {lead.notes ? (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed font-sans">
                    {lead.notes}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No notes recorded yet.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: ACTIVITIES & AUDIT TIMELINE */}
          {activeTab === 'activities' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Lead Activity History</h3>
              {activities.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No activity entries found.</p>
              ) : (
                <div className="relative border-l-2 border-slate-200 ml-3 space-y-4 py-2">
                  {activities.map((act) => (
                    <div key={act.id} className="relative pl-6">
                      <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-white border-2 border-blue-500" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{act.action}</span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {new Date(act.created_at).toLocaleString('en-IN', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">{act.description}</p>
                        {act.performed_by && (
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            By {act.performed_by}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
