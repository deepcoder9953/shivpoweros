import React from 'react';
import { Lead } from '../../types/lead';
import { Customer } from '../../types/customer';
import { FollowupRecord } from '../../types/followup';
import { Task } from '../../types/task';
import { ActivityRecord } from '../../types/activity';
import { Quotation, formatINR } from '../../types/quotation';
import { Project } from '../../types/project';
import { CRMTab } from './CRMNavigation';
import {
  Users,
  TrendingUp,
  CheckCircle2,
  Building2,
  CalendarClock,
  Clock,
  UserPlus,
  ArrowRight,
  Flame,
  Kanban,
  Sparkles,
  FileText,
  FolderKanban,
  CheckSquare,
  AlertTriangle,
  Phone,
  MessageSquare,
  Zap,
} from 'lucide-react';

interface CRMOverviewProps {
  leads?: Lead[];
  customers?: Customer[];
  quotations?: Quotation[];
  projects?: Project[];
  followups?: FollowupRecord[];
  tasks?: Task[];
  activities?: ActivityRecord[];
  onNavigateTab: (tab: CRMTab) => void;
  onAddLead?: () => void;
  onAddCustomer?: () => void;
  onScheduleFollowup?: () => void;
  onCreateQuotation?: () => void;
  onViewLead?: (lead: Lead) => void;
  onConvertToCustomer?: (lead: Lead) => void;
}

export const CRMOverview: React.FC<CRMOverviewProps> = ({
  leads = [],
  customers = [],
  quotations = [],
  projects = [],
  followups = [],
  tasks = [],
  onNavigateTab,
  onAddLead,
  onAddCustomer,
  onScheduleFollowup,
  onCreateQuotation,
  onViewLead,
}) => {
  const safeLeads = leads || [];
  const safeCustomers = customers || [];
  const safeQuotations = quotations || [];
  const safeProjects = projects || [];
  const safeFollowups = followups || [];
  const safeTasks = tasks || [];

  const totalLeads = safeLeads.length;
  const newLeads = safeLeads.filter((l) => l.status === 'New').length;
  const contactedLeads = safeLeads.filter((l) => l.status === 'Contacted').length;
  const qualifiedLeads = safeLeads.filter((l) => l.status === 'Qualified').length;
  const proposalSentLeads = safeLeads.filter((l) => l.status === 'Proposal Sent').length;
  const negotiationLeads = safeLeads.filter((l) => l.status === 'Negotiation').length;
  const wonLeads = safeLeads.filter((l) => l.status === 'Won').length;
  const lostLeads = safeLeads.filter((l) => l.status === 'Lost').length;

  // Open Pipeline (active leads)
  const openPipeline = totalLeads - (wonLeads + lostLeads);
  const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

  // Date calculations
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const pendingFollowups = safeFollowups.filter((f) => f.status === 'Pending');
  const overdueFollowups = pendingFollowups.filter((f) => new Date(f.followup_date) < todayStart);
  const todayFollowups = pendingFollowups.filter((f) => {
    const fDate = new Date(f.followup_date);
    return fDate >= todayStart && fDate <= todayEnd;
  });

  const totalCustomers = safeCustomers.length;
  const hotLeads = safeLeads.filter((l) => l.lead_score >= 80);
  const totalQuotationValue = safeQuotations.reduce((acc, q) => acc + (q.total || 0), 0);
  const pendingTasks = safeTasks.filter((t) => t.status === 'Pending' || t.status === 'In Progress');
  const activeProjects = safeProjects.filter((p) => p.status !== 'Completed' && p.status !== 'Cancelled');

  // Quotations awaiting client action
  const pendingQuotations = safeQuotations.filter((q) => {
    const s = (q.status || '').toLowerCase();
    return s === 'sent' || s === 'viewed' || s === 'negotiation';
  });

  // Most prominent lead to follow up
  const topPriorityLead = hotLeads[0] || safeLeads.find((l) => l.status === 'Proposal Sent' || l.status === 'Qualified') || safeLeads[0];

  return (
    <div className="space-y-6">
      {/* 1. AI Business Briefing & Today's Top Priorities */}
      <div className="bg-linear-to-br from-blue-950 via-slate-900 to-indigo-950 rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-white border border-blue-900/60 shadow-lg relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-amber-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 fill-amber-300" />
              <span>AI Business Briefing · {now.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Business Command Center
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              You have <strong className="text-white">{openPipeline} active deals</strong> in the pipeline valued at <strong className="text-emerald-400">{formatINR(totalQuotationValue)}</strong>.
              {overdueFollowups.length > 0 && (
                <> <span className="text-rose-400 font-semibold">{overdueFollowups.length} follow-ups are overdue</span> and need immediate attention.</>
              )}
              {topPriorityLead && (
                <> Top priority today: reconnect with <strong className="text-amber-300">{topPriorityLead.company_name}</strong> ({topPriorityLead.contact_person}) regarding {topPriorityLead.requirement || 'inquiry'}.</>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {topPriorityLead && (
              <button
                type="button"
                onClick={() => {
                  if (onViewLead) onViewLead(topPriorityLead);
                  else onNavigateTab('leads');
                }}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
              >
                <span>View Priority Lead</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={() => onNavigateTab('ai_assistant')}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>Ask AI Copilot</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Core Metrics (Responsive Grid with Dark Mode support) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Metric 1: Total Leads */}
        <div
          onClick={() => onNavigateTab('leads')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Leads</span>
            <div className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">{totalLeads}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-1.5">
            <span className="text-blue-600 dark:text-blue-400 font-semibold">{newLeads} new</span>
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </div>
        </div>

        {/* Metric 2: Open Pipeline */}
        <div
          onClick={() => onNavigateTab('pipeline')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pipeline</span>
            <div className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">{openPipeline}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-1.5">
            <span>{proposalSentLeads + negotiationLeads} in quote</span>
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </div>
        </div>

        {/* Metric 3: Active Customers */}
        <div
          onClick={() => onNavigateTab('customers')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Customers</span>
            <div className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Building2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">{totalCustomers}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-1.5">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{conversionRate}% win</span>
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </div>
        </div>

        {/* Metric 4: Quotations */}
        <div
          onClick={() => onNavigateTab('quotations')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Quotations</span>
            <div className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">{safeQuotations.length}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-1.5 truncate">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold truncate">
              {formatINR(totalQuotationValue)}
            </span>
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </div>
        </div>

        {/* Metric 5: Projects */}
        <div
          onClick={() => onNavigateTab('projects')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Projects</span>
            <div className="p-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <FolderKanban className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">{activeProjects.length}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-1.5">
            <span>{safeProjects.length} total</span>
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </div>
        </div>

        {/* Metric 6: Follow-ups & Reminders */}
        <div
          onClick={() => onNavigateTab('followups')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-rose-300 dark:hover:border-rose-700 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Follow-ups</span>
            <div className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <CalendarClock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">{pendingFollowups.length}</span>
            {overdueFollowups.length > 0 && (
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">({overdueFollowups.length} overdue)</span>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] border-t border-slate-100 dark:border-slate-800 pt-1.5">
            <span className="text-amber-600 dark:text-amber-400 font-semibold">{todayFollowups.length} today</span>
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </div>
        </div>
      </div>

      {/* 3. Today's Priorities Action Hub */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                Today&apos;s High-Priority Actions
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Overdue follow-ups, quotes needing confirmation, and warm leads
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('followups')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            All Action Items <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Priority Card 1: Overdue & Today Follow-ups */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Overdue Calls &amp; Visits
                </span>
                <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                  {overdueFollowups.length}
                </span>
              </div>
              {overdueFollowups.length > 0 ? (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {overdueFollowups[0].subject}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    {overdueFollowups[0].notes || `Scheduled for ${new Date(overdueFollowups[0].followup_date).toLocaleDateString('en-IN')}`}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 py-2">
                  No overdue follow-ups! Great job keeping schedule clean.
                </p>
              )}
            </div>
            <div className="pt-3 mt-2 border-t border-slate-200/70 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => onNavigateTab('followups')}
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
              >
                Clear Follow-ups <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Priority Card 2: Hot Leads */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-orange-500" /> Hot Leads (≥80 Score)
                </span>
                <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300">
                  {hotLeads.length}
                </span>
              </div>
              {hotLeads.length > 0 ? (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {hotLeads[0].company_name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    {hotLeads[0].contact_person} · {hotLeads[0].requirement || 'High purchase intent identified'}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 py-2">
                  No high-priority leads flagged yet. Capture more inquiries.
                </p>
              )}
            </div>
            <div className="pt-3 mt-2 border-t border-slate-200/70 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => onNavigateTab('leads')}
                className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
              >
                Engage Hot Leads <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Priority Card 3: Pending Quotations */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <FileText className="w-3 h-3" /> Quotes Awaiting Decision
                </span>
                <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  {pendingQuotations.length}
                </span>
              </div>
              {pendingQuotations.length > 0 ? (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {pendingQuotations[0].quotation_number} · {pendingQuotations[0].customer_name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    Amount: <strong className="text-emerald-600 dark:text-emerald-400">{formatINR(pendingQuotations[0].total)}</strong>
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 py-2">
                  No quotes currently pending client feedback.
                </p>
              )}
            </div>
            <div className="pt-3 mt-2 border-t border-slate-200/70 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => onNavigateTab('quotations')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                Follow Up on Quotes <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Lead Pipeline Distribution Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Sales Pipeline Stage Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time breakdown of all {totalLeads} captured inquiries
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            {wonLeads} Won · {lostLeads} Lost · {openPipeline} Active Deals
          </span>
        </div>

        {totalLeads === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-850 rounded-xl">
            No leads recorded. Add a lead to start tracking pipeline conversion.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
              {newLeads > 0 && (
                <div
                  style={{ width: `${(newLeads / totalLeads) * 100}%` }}
                  className="bg-sky-500 h-full transition-all"
                  title={`New: ${newLeads}`}
                />
              )}
              {contactedLeads > 0 && (
                <div
                  style={{ width: `${(contactedLeads / totalLeads) * 100}%` }}
                  className="bg-blue-500 h-full transition-all"
                  title={`Contacted: ${contactedLeads}`}
                />
              )}
              {qualifiedLeads > 0 && (
                <div
                  style={{ width: `${(qualifiedLeads / totalLeads) * 100}%` }}
                  className="bg-amber-500 h-full transition-all"
                  title={`Qualified: ${qualifiedLeads}`}
                />
              )}
              {proposalSentLeads > 0 && (
                <div
                  style={{ width: `${(proposalSentLeads / totalLeads) * 100}%` }}
                  className="bg-purple-500 h-full transition-all"
                  title={`Proposal Sent: ${proposalSentLeads}`}
                />
              )}
              {negotiationLeads > 0 && (
                <div
                  style={{ width: `${(negotiationLeads / totalLeads) * 100}%` }}
                  className="bg-indigo-500 h-full transition-all"
                  title={`Negotiation: ${negotiationLeads}`}
                />
              )}
              {wonLeads > 0 && (
                <div
                  style={{ width: `${(wonLeads / totalLeads) * 100}%` }}
                  className="bg-emerald-500 h-full transition-all"
                  title={`Won: ${wonLeads}`}
                />
              )}
              {lostLeads > 0 && (
                <div
                  style={{ width: `${(lostLeads / totalLeads) * 100}%` }}
                  className="bg-rose-400 h-full transition-all"
                  title={`Lost: ${lostLeads}`}
                />
              )}
            </div>

            <div className="flex flex-wrap gap-2 pt-1 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-100 dark:border-sky-900/40">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                <span>New ({newLeads})</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-100 dark:border-blue-900/40">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Contacted ({contactedLeads})</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-100 dark:border-amber-900/40">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Qualified ({qualifiedLeads})</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-100 dark:border-purple-900/40">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span>Proposal Sent ({proposalSentLeads})</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/40">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>Negotiation ({negotiationLeads})</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/40">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Won ({wonLeads})</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-100 dark:border-rose-900/40">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span>Lost ({lostLeads})</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 5. Dual Section: Hot Leads & Open Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Hot Leads */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
                  <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  High-Scoring Leads ({hotLeads.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('leads')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                All Leads <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {hotLeads.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 dark:bg-slate-850 rounded-xl">
                <Users className="w-8 h-8 text-slate-400 mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No Hot Leads</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  AI Lead Scoring automatically evaluates inquiries.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {hotLeads.slice(0, 4).map((lead) => {
                  const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
                  return (
                    <div
                      key={lead.id}
                      className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-850 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4
                            onClick={() => {
                              if (onViewLead) onViewLead(lead);
                              else onNavigateTab('leads');
                            }}
                            className="text-xs font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer truncate"
                          >
                            {lead.company_name}
                          </h4>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300">
                            {lead.lead_score}/100 🔥
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                          {lead.contact_person} · {lead.status}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <a
                          href={`tel:${lead.phone}`}
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"
                          title="Call Lead"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        {cleanPhone && (
                          <a
                            href={`https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition-colors"
                            title="WhatsApp Lead"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Open Tasks & Deliverables */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Open Action Tasks ({pendingTasks.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('tasks')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                All Tasks <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {pendingTasks.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 dark:bg-slate-850 rounded-xl">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">All Tasks Completed</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  No pending action items assigned.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {pendingTasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-850 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {task.title}
                        </h4>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            task.priority === 'Urgent'
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                              : task.priority === 'High'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        Assigned to: {task.assigned_to || 'Unassigned'} · Due: {task.due_date || 'N/A'}
                      </p>
                    </div>

                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 shrink-0">
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
