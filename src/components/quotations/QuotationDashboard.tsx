import React from 'react';
import { Quotation, isQuotationExpired, formatINR } from '../../types/quotation';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  FileEdit,
  Coins,
} from 'lucide-react';

interface QuotationDashboardProps {
  quotations: Quotation[];
  activeStatusFilter: string;
  onSelectStatusFilter: (status: string) => void;
  onOpenCreateModal: () => void;
}

export const QuotationDashboard: React.FC<QuotationDashboardProps> = ({
  quotations,
  activeStatusFilter,
  onSelectStatusFilter,
  onOpenCreateModal,
}) => {
  // Compute analytics
  const totalCount = quotations.length;
  const totalValue = quotations.reduce((acc, q) => acc + (q.total || 0), 0);

  const acceptedQuotations = quotations.filter((q) => (q.status || '').toLowerCase() === 'accepted');
  const acceptedValue = acceptedQuotations.reduce((acc, q) => acc + (q.total || 0), 0);

  const pendingQuotations = quotations.filter((q) => {
    const s = (q.status || '').toLowerCase();
    return s === 'sent' || s === 'viewed' || s === 'negotiation';
  });
  const pendingValue = pendingQuotations.reduce((acc, q) => acc + (q.total || 0), 0);

  const draftQuotations = quotations.filter((q) => (q.status || '').toLowerCase() === 'draft');

  const rejectedQuotations = quotations.filter((q) => (q.status || '').toLowerCase() === 'rejected');
  const expiredQuotations = quotations.filter((q) => isQuotationExpired(q));

  const winRate = totalCount > 0 ? Math.round((acceptedQuotations.length / totalCount) * 100) : 0;
  const avgQuotationValue = totalCount > 0 ? Math.round(totalValue / totalCount) : 0;

  return (
    <div className="space-y-4 mb-6">
      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Quotations */}
        <div
          id="quotation-stat-total"
          onClick={() => onSelectStatusFilter('all')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeStatusFilter === 'all'
              ? 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 ring-2 ring-blue-400/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Value</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/80 flex items-center justify-center text-blue-700 dark:text-blue-300">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">{formatINR(totalValue)}</div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              {totalCount} quotes
            </span>
          </div>
          <div className="mt-1 text-2xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <span>Avg: {formatINR(avgQuotationValue)}</span>
            <span>•</span>
            <span className="text-blue-600 dark:text-blue-400 font-bold">Win rate {winRate}%</span>
          </div>
        </div>

        {/* Card 2: Accepted (Won) */}
        <div
          id="quotation-stat-accepted"
          onClick={() => onSelectStatusFilter('accepted')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeStatusFilter === 'accepted'
              ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600 ring-2 ring-emerald-400/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Accepted (Won)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-xl sm:text-2xl font-black text-emerald-900 dark:text-emerald-300">{formatINR(acceptedValue)}</div>
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
              {acceptedQuotations.length} quotes
            </span>
          </div>
          <div className="mt-1 text-2xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>Ready for execution / project linking</span>
          </div>
        </div>

        {/* Card 3: In Pipeline (Sent / Viewed / Negotiation) */}
        <div
          id="quotation-stat-pending"
          onClick={() => onSelectStatusFilter('negotiation')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeStatusFilter === 'negotiation' || activeStatusFilter === 'sent' || activeStatusFilter === 'viewed'
              ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-400 dark:border-amber-600 ring-2 ring-amber-400/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">In Negotiation</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/80 flex items-center justify-center text-amber-700 dark:text-amber-300">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-xl sm:text-2xl font-black text-amber-900 dark:text-amber-300">{formatINR(pendingValue)}</div>
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full">
              {pendingQuotations.length} active
            </span>
          </div>
          <div className="mt-1 text-2xs text-amber-700 dark:text-amber-400 flex items-center gap-1">
            <span>Sent & negotiation follow-ups</span>
          </div>
        </div>

        {/* Card 4: Expired or Rejected */}
        <div
          id="quotation-stat-expired"
          onClick={() => onSelectStatusFilter('expired')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeStatusFilter === 'expired'
              ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-400 dark:border-rose-600 ring-2 ring-rose-400/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">Expired / Lost</span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/80 flex items-center justify-center text-rose-700 dark:text-rose-300">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-xl sm:text-2xl font-black text-rose-900 dark:text-rose-300">
              {expiredQuotations.length} <span className="text-sm font-semibold text-rose-600 dark:text-rose-400">expired</span>
            </div>
            <span className="text-xs font-semibold text-rose-800 dark:text-rose-300 bg-rose-100 dark:bg-rose-950 px-2 py-0.5 rounded-full">
              {rejectedQuotations.length} rejected
            </span>
          </div>
          <div className="mt-1 text-2xs text-rose-700 dark:text-rose-400">
            Past validity date or declined by client
          </div>
        </div>
      </div>

      {/* Quick Status Filter Pills */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'all', label: 'All Quotations', count: totalCount },
            { id: 'draft', label: 'Draft', count: draftQuotations.length },
            { id: 'sent', label: 'Sent', count: quotations.filter((q) => (q.status || '').toLowerCase() === 'sent').length },
            { id: 'viewed', label: 'Viewed', count: quotations.filter((q) => (q.status || '').toLowerCase() === 'viewed').length },
            { id: 'negotiation', label: 'Negotiation', count: quotations.filter((q) => (q.status || '').toLowerCase() === 'negotiation').length },
            { id: 'accepted', label: 'Accepted', count: acceptedQuotations.length },
            { id: 'rejected', label: 'Rejected', count: rejectedQuotations.length },
            { id: 'expired', label: 'Expired', count: expiredQuotations.length },
          ].map((item) => {
            const isActive = activeStatusFilter === item.id;
            return (
              <button
                key={item.id}
                id={`filter-pill-${item.id}`}
                type="button"
                onClick={() => onSelectStatusFilter(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>{item.label}</span>
                <span
                  className={`text-2xs px-1.5 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>

        <button
          id="quick-create-quotation-header-btn"
          type="button"
          onClick={onOpenCreateModal}
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors shrink-0"
        >
          <FileEdit className="w-3.5 h-3.5" />
          <span>New Quotation</span>
        </button>
      </div>
    </div>
  );
};
