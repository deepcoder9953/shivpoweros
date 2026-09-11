import React, { useState, useEffect } from 'react';
import { Lead } from '../../types/lead';
import { LeadSummaryResult, CallPrepResult } from '../../types/ai';
import { aiService } from '../../lib/aiService';
import {
  Sparkles,
  Building2,
  CalendarClock,
  MessageSquare,
  CheckCircle2,
  PhoneCall,
  AlertTriangle,
  HelpCircle,
  Lightbulb,
  Check,
  Copy,
  Loader2,
  Zap,
} from 'lucide-react';

interface AILeadSummaryProps {
  leads: Lead[];
  selectedLead: Lead | null;
  onSelectLead: (lead: Lead) => void;
  onScheduleFollowup: (lead: Lead) => void;
  onGenerateMessage: (lead: Lead) => void;
  onMarkQualified?: (lead: Lead) => void;
}

export const AILeadSummary: React.FC<AILeadSummaryProps> = ({
  leads,
  selectedLead,
  onSelectLead,
  onScheduleFollowup,
  onGenerateMessage,
  onMarkQualified,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'summary' | 'call_prep' | 'next_action'>('summary');
  const [summaryData, setSummaryData] = useState<LeadSummaryResult | null>(null);
  const [callPrepData, setCallPrepData] = useState<CallPrepResult | null>(null);
  const [nextActionData, setNextActionData] = useState<{
    action: string;
    channel: string;
    reason: string;
    timing: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Generate analysis whenever selected lead or sub-tab changes
  useEffect(() => {
    if (!selectedLead) return;

    let isMounted = true;
    const fetchAnalysis = async () => {
      setIsLoading(true);
      try {
        if (activeSubTab === 'summary') {
          const res = await aiService.generateLeadSummary(selectedLead);
          if (isMounted) setSummaryData(res);
        } else if (activeSubTab === 'call_prep') {
          const res = await aiService.prepareSalesCall(selectedLead);
          if (isMounted) setCallPrepData(res);
        } else if (activeSubTab === 'next_action') {
          const res = await aiService.generateNextAction(selectedLead);
          if (isMounted) setNextActionData(res);
        }
      } catch (err) {
        console.error('Failed to generate lead intelligence:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchAnalysis();
    return () => {
      isMounted = false;
    };
  }, [selectedLead, activeSubTab]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(label);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Lead Selector Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Target Lead for AI Analysis
            </label>
            <span className="text-sm font-bold text-slate-900">
              {selectedLead ? selectedLead.company_name : 'No lead selected'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedLead?.id || ''}
            onChange={(e) => {
              const lead = leads.find((l) => l.id === e.target.value);
              if (lead) onSelectLead(lead);
            }}
            className="w-full sm:w-64 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="" disabled>
              Select a Lead to Analyze...
            </option>
            {leads.map((l) => (
              <option key={l.id} value={l.id}>
                {l.company_name} ({l.status} - Score: {l.lead_score})
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedLead ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          {/* Sub Navigation */}
          <div className="border-b border-slate-200 px-4 pt-3 flex items-center justify-between gap-2 overflow-x-auto bg-slate-50/50">
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setActiveSubTab('summary')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                  activeSubTab === 'summary'
                    ? 'border-blue-600 text-blue-600 bg-white shadow-2xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI Lead Summary
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('next_action')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                  activeSubTab === 'next_action'
                    ? 'border-blue-600 text-blue-600 bg-white shadow-2xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                Suggest Next Action
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('call_prep')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                  activeSubTab === 'call_prep'
                    ? 'border-blue-600 text-blue-600 bg-white shadow-2xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <PhoneCall className="w-3.5 h-3.5" />
                Prepare for Call
              </button>
            </div>

            <div className="flex items-center gap-2 pb-2">
              <button
                type="button"
                onClick={() => onScheduleFollowup(selectedLead)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors shadow-2xs"
              >
                <CalendarClock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Schedule Follow-up</span>
              </button>

              <button
                type="button"
                onClick={() => onGenerateMessage(selectedLead)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors shadow-2xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Draft Message</span>
              </button>
            </div>
          </div>

          {/* Tab Content Body */}
          <div className="p-5">
            {isLoading ? (
              <div className="py-16 flex flex-col items-center justify-center text-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
                <p className="text-sm font-semibold text-slate-800">
                  Analyzing CRM intelligence for {selectedLead.company_name}...
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Synthesizing requirements, history, and sales next steps
                </p>
              </div>
            ) : (
              <>
                {/* 1. LEAD SUMMARY TAB */}
                {activeSubTab === 'summary' && summaryData && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Overview */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Lead Overview
                        </span>
                        <p className="text-sm text-slate-800 leading-relaxed font-medium">
                          {summaryData.leadOverview}
                        </p>
                      </div>

                      {/* Current Situation */}
                      <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">
                          Current Situation
                        </span>
                        <p className="text-sm text-slate-800 leading-relaxed font-medium">
                          {summaryData.currentSituation}
                        </p>
                      </div>

                      {/* Requirement */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Equipment & Technical Requirement
                        </span>
                        <p className="text-sm text-slate-800 leading-relaxed font-medium">
                          {summaryData.requirement}
                        </p>
                      </div>

                      {/* Recent Activity */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Recent Activity & Notes
                        </span>
                        <p className="text-sm text-slate-800 leading-relaxed">
                          {summaryData.recentActivity}
                        </p>
                      </div>

                      {/* Potential Opportunity */}
                      <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
                        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                          Potential Opportunity
                        </span>
                        <p className="text-sm text-slate-800 leading-relaxed">
                          {summaryData.potentialOpportunity}
                        </p>
                      </div>

                      {/* Risks / Missing Info */}
                      <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100">
                        <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-1 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Risks / Missing Information
                        </span>
                        <p className="text-sm text-slate-800 leading-relaxed">
                          {summaryData.risksOrMissingInfo}
                        </p>
                      </div>
                    </div>

                    {/* Recommended Next Step Callout */}
                    <div className="p-4 rounded-xl bg-linear-to-r from-blue-600 to-indigo-700 text-white shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200 block mb-0.5">
                          Recommended Next Step
                        </span>
                        <p className="text-sm font-semibold leading-relaxed">
                          {summaryData.recommendedNextStep}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => onScheduleFollowup(selectedLead)}
                          className="px-3 py-1.5 bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold rounded-lg transition-colors shadow-xs"
                        >
                          Execute Action
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. NEXT ACTION TAB */}
                {activeSubTab === 'next_action' && nextActionData && (
                  <div className="space-y-4 max-w-2xl">
                    <div className="p-5 rounded-2xl bg-linear-to-br from-slate-900 to-blue-950 text-white shadow-xs">
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                          Next Best Action
                        </span>
                        <span className="text-xs text-slate-300 font-medium">
                          Timing: {nextActionData.timing}
                        </span>
                      </div>

                      <h4 className="text-lg font-bold text-white mb-2">
                        {nextActionData.action}
                      </h4>

                      <div className="flex items-center gap-3 text-xs text-slate-300 mb-4">
                        <span>Preferred Channel: <strong className="text-white">{nextActionData.channel}</strong></span>
                      </div>

                      <div className="p-3 bg-white/10 rounded-xl text-xs text-slate-200 leading-relaxed mb-4">
                        <strong className="block text-white mb-1">Rationale based on CRM Data:</strong>
                        {nextActionData.reason}
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => onScheduleFollowup(selectedLead)}
                          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
                        >
                          Schedule Follow-up Now
                        </button>
                        <button
                          type="button"
                          onClick={() => onGenerateMessage(selectedLead)}
                          className="px-3.5 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold text-xs rounded-xl transition-colors"
                        >
                          Draft Follow-up Message
                        </button>
                        {selectedLead.status === 'New' && onMarkQualified && (
                          <button
                            type="button"
                            onClick={() => onMarkQualified(selectedLead)}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition-colors"
                          >
                            Mark Qualified
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. CALL PREP TAB */}
                {activeSubTab === 'call_prep' && callPrepData && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Overview & Known req */}
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <h5 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-blue-600" />
                          Target Overview & Requirement
                        </h5>
                        <p className="text-xs text-slate-700 mb-2 leading-relaxed">
                          {callPrepData.companyOverview}
                        </p>
                        <div className="text-xs font-medium text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200">
                          <strong>Requirement:</strong> {callPrepData.knownRequirement}
                        </div>
                      </div>

                      {/* Previous Interactions */}
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <h5 className="font-bold text-slate-900 text-sm mb-1.5">
                          Previous Interactions in CRM
                        </h5>
                        <ul className="text-xs text-slate-700 space-y-1.5">
                          {callPrepData.previousInteractions.map((item, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-blue-500 font-bold">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Questions to Ask & Objections */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50/40 rounded-xl border border-blue-100">
                        <h5 className="font-bold text-blue-900 text-sm mb-2 flex items-center gap-1.5">
                          <HelpCircle className="w-4 h-4 text-blue-600" />
                          Essential Questions to Ask During Call
                        </h5>
                        <ul className="text-xs text-slate-800 space-y-2">
                          {callPrepData.questionsToAsk.map((q, i) => (
                            <li key={i} className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-blue-100">
                              <span className="font-bold text-blue-600 shrink-0">{i + 1}.</span>
                              <span className="font-medium">{q}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-4 bg-amber-50/40 rounded-xl border border-amber-100">
                        <h5 className="font-bold text-amber-900 text-sm mb-2 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          Anticipated Objections
                        </h5>
                        <ul className="text-xs text-slate-800 space-y-2">
                          {callPrepData.possibleObjections.map((obj, i) => (
                            <li key={i} className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-amber-100">
                              <span className="font-bold text-amber-600 shrink-0">•</span>
                              <span>{obj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Talking Points & Goal */}
                    <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100">
                      <h5 className="font-bold text-emerald-900 text-sm mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Key Shiv Power Solution Selling Points
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                        {callPrepData.suggestedTalkingPoints.map((tp, i) => (
                          <div key={i} className="text-xs text-slate-800 bg-white p-2.5 rounded-lg border border-emerald-100">
                            {tp}
                          </div>
                        ))}
                      </div>

                      <div className="p-3 bg-emerald-700 text-white rounded-xl text-xs flex items-center justify-between">
                        <span><strong>Call Goal:</strong> {callPrepData.recommendedNextStep}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(callPrepData.recommendedNextStep, 'goal')}
                          className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-[11px] font-semibold transition-colors"
                        >
                          {copiedSection === 'goal' ? <Check className="w-3 h-3" /> : 'Copy'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800 mb-1">
            Select a Lead to View AI Intelligence
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Choose any lead from the dropdown above to view an instant AI Lead Summary, Next Best Action recommendation, or Sales Call preparation guide.
          </p>
        </div>
      )}
    </div>
  );
};
