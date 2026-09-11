import React, { useState, useEffect } from 'react';
import { AICRMInsight } from '../../types/ai';
import { aiService } from '../../lib/aiService';
import {
  Sparkles,
  AlertTriangle,
  Flame,
  TrendingUp,
  Clock,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Building2,
} from 'lucide-react';

interface AILeadInsightsProps {
  onExecuteAction: (insight: AICRMInsight) => void;
}

export const AILeadInsights: React.FC<AILeadInsightsProps> = ({ onExecuteAction }) => {
  const [insights, setInsights] = useState<AICRMInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      const data = await aiService.getSmartCRMInsights();
      setInsights(data);
    } catch (err) {
      console.error('Failed to fetch CRM insights:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
      <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              AI CRM Intelligence & Action Recommendations
            </h3>
            <p className="text-[11px] text-slate-500">
              Real-time heuristic & generative pipeline health detection
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchInsights}
          disabled={isLoading}
          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          title="Refresh insights"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {insights.length === 0 ? (
          <div className="col-span-2 py-8 text-center text-xs text-slate-500">
            <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
            <p className="font-semibold text-slate-700">All CRM pipelines are in healthy status!</p>
            <p className="text-slate-400">No urgent overdue follow-ups or stuck high-priority leads detected.</p>
          </div>
        ) : (
          insights.map((ins) => {
            let Icon = Sparkles;
            let badgeCls = 'bg-blue-50 text-blue-700 border-blue-200';

            if (ins.type === 'urgent_followup') {
              Icon = AlertTriangle;
              badgeCls = 'bg-red-50 text-red-700 border-red-200';
            } else if (ins.type === 'hot_lead') {
              Icon = Flame;
              badgeCls = 'bg-amber-50 text-amber-700 border-amber-200';
            } else if (ins.type === 'opportunity') {
              Icon = TrendingUp;
              badgeCls = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            } else if (ins.type === 'stuck_stage') {
              Icon = Clock;
              badgeCls = 'bg-indigo-50 text-indigo-700 border-indigo-200';
            }

            return (
              <div
                key={ins.id}
                className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/40 hover:bg-white hover:border-blue-200 transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeCls}`}
                    >
                      <Icon className="w-3 h-3" />
                      {ins.type.replace('_', ' ').toUpperCase()}
                    </span>
                    {ins.leadName && (
                      <span className="text-[11px] font-semibold text-slate-600 truncate max-w-[140px]">
                        {ins.leadName}
                      </span>
                    )}
                  </div>

                  <h5 className="font-bold text-slate-900 text-xs sm:text-sm mb-1">{ins.title}</h5>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {ins.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-500">
                    Recommendation:
                  </span>
                  <button
                    type="button"
                    onClick={() => onExecuteAction(ins)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                  >
                    <span>{ins.recommendedAction}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
