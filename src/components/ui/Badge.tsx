import React from 'react';
import { LeadStatus, LeadSource } from '../../types/lead';

interface StatusBadgeProps {
  status: LeadStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  const getStatusStyles = (st: LeadStatus) => {
    switch (st) {
      case 'New':
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/80 ring-1 ring-blue-500/20';
      case 'Contacted':
        return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/80 ring-1 ring-indigo-500/20';
      case 'Qualified':
        return 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/80 ring-1 ring-cyan-500/20';
      case 'Proposal Sent':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/80 ring-1 ring-amber-500/20';
      case 'Negotiation':
        return 'bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800/80 ring-1 ring-purple-500/20';
      case 'Won':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80 ring-1 ring-emerald-500/20 font-bold';
      case 'Lost':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/80 ring-1 ring-rose-500/20';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const getDotColor = (st: LeadStatus) => {
    switch (st) {
      case 'New':
        return 'bg-blue-500';
      case 'Contacted':
        return 'bg-indigo-500';
      case 'Qualified':
        return 'bg-cyan-500';
      case 'Proposal Sent':
        return 'bg-amber-500';
      case 'Negotiation':
        return 'bg-purple-500';
      case 'Won':
        return 'bg-emerald-500';
      case 'Lost':
        return 'bg-rose-500';
      default:
        return 'bg-slate-400';
    }
  };

  return (
    <span
      id={`status-badge-${status.toLowerCase().replace(/\s+/g, '-')}`}
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${sizeClasses} ${getStatusStyles(
        status
      )} transition-colors duration-150 whitespace-nowrap`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${getDotColor(status)}`} />
      {status}
    </span>
  );
};

interface SourceBadgeProps {
  source: LeadSource;
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({ source }) => {
  const getSourceStyles = (src: LeadSource) => {
    switch (src) {
      case 'JustDial':
        return 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800';
      case 'Website':
        return 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800';
      case 'WhatsApp':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Facebook':
        return 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800';
      case 'Instagram':
        return 'bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800';
      case 'Google':
        return 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'Referral':
        return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'Cold Outreach':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <span
      id={`source-badge-${source.toLowerCase().replace(/\s+/g, '-')}`}
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getSourceStyles(
        source
      )} whitespace-nowrap`}
    >
      {source}
    </span>
  );
};

interface ScoreBadgeProps {
  score: number;
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score }) => {
  let colorClass = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  let barColor = 'bg-slate-400';
  let tier = 'Low';
  let emoji = '';

  if (score >= 80) {
    colorClass = 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-800 ring-1 ring-orange-500/20 font-bold';
    barColor = 'bg-orange-500';
    tier = 'HOT';
    emoji = '🔥';
  } else if (score >= 70) {
    colorClass = 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800 ring-1 ring-amber-500/20 font-semibold';
    barColor = 'bg-amber-500';
    tier = 'Warm';
  } else if (score >= 40) {
    colorClass = 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    barColor = 'bg-blue-400';
    tier = 'Cold';
  } else {
    colorClass = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    barColor = 'bg-slate-400';
    tier = 'Low';
  }

  return (
    <div className="inline-flex items-center gap-2">
      <div className="w-10 bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden hidden sm:block">
        <div
          className={`h-full rounded-full ${barColor}`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${colorClass} whitespace-nowrap`}
        title={`AI Lead Score: ${score}/100 (${tier})`}
      >
        <span>{score}/100</span>
        {emoji && <span>{emoji}</span>}
        <span className="text-[10px] uppercase tracking-wider font-semibold opacity-90">{tier}</span>
      </span>
    </div>
  );
};
