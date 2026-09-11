import React from 'react';
import { Lead } from '../../types/lead';
import { Users, TrendingUp, CheckCircle, Flame, Clock } from 'lucide-react';

interface LeadStatsHeaderProps {
  leads?: Lead[];
}

export const LeadStatsHeader: React.FC<LeadStatsHeaderProps> = ({ leads = [] }) => {
  const safeLeads = leads || [];
  const totalLeads = safeLeads.length;
  const newLeads = safeLeads.filter((l) => l.status === 'New').length;
  const activePipeline = safeLeads.filter((l) =>
    ['Contacted', 'Qualified', 'Proposal Sent', 'Negotiation'].includes(l.status)
  ).length;
  const wonLeads = safeLeads.filter((l) => l.status === 'Won').length;
  const hotLeads = safeLeads.filter((l) => l.lead_score >= 80).length;

  const winRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Leads</span>
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900">{totalLeads}</span>
          <span className="text-xs text-slate-500">In database</span>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">New Inquiries</span>
          <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-sky-700">{newLeads}</span>
          <span className="text-xs text-slate-500">Action needed</span>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">In Pipeline</span>
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-indigo-700">{activePipeline}</span>
          <span className="text-xs text-slate-500">Quotes & Surveys</span>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Deals Won</span>
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-emerald-700">{wonLeads}</span>
          <span className="text-xs font-medium text-emerald-600">({winRate}% Win Rate)</span>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all col-span-2 sm:col-span-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Hot Leads</span>
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
            <Flame className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-amber-700">{hotLeads}</span>
          <span className="text-xs text-amber-600 font-medium">Score ≥ 80</span>
        </div>
      </div>
    </div>
  );
};
