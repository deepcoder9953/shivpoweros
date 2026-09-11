import React, { useState, useEffect } from 'react';
import { Lead } from '../../types/lead';
import { AIMessage, AIActionButton, AICRMInsight } from '../../types/ai';
import { aiService } from '../../lib/aiService';
import { AIChat } from './AIChat';
import { AILeadSummary } from './AILeadSummary';
import { AIFollowupGenerator } from './AIFollowupGenerator';
import { AISalesCoach } from './AISalesCoach';
import { AILeadInsights } from './AILeadInsights';
import {
  Bot,
  Sparkles,
  MessageSquare,
  FileText,
  Send,
  GraduationCap,
  Building2,
  X,
  CheckCircle2,
  CalendarClock,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface AIAssistantProps {
  leads: Lead[];
  selectedLead: Lead | null;
  onSelectLead: (lead: Lead) => void;
  onScheduleFollowup: (lead: Lead) => void;
  onMarkQualified?: (lead: Lead) => void;
  onViewLeadInCRM?: (leadId: string) => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  leads,
  selectedLead,
  onSelectLead,
  onScheduleFollowup,
  onMarkQualified,
  onViewLeadInCRM,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'lead_intel' | 'messages' | 'coach'>('chat');
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('Thinking...');
  const [geminiStatus, setGeminiStatus] = useState<{ configured: boolean; model: string }>({
    configured: true,
    model: 'gemini-3.8-flash',
  });

  // Check Gemini server status on mount
  useEffect(() => {
    aiService.checkStatus().then((status) => {
      setGeminiStatus(status);
    });
  }, []);

  // Handle send message in chat
  const handleSendMessage = async (text: string) => {
    const userMsg: AIMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      leadContext: selectedLead
        ? {
            id: selectedLead.id,
            company_name: selectedLead.company_name,
            status: selectedLead.status,
            lead_score: selectedLead.lead_score,
            requirement: selectedLead.requirement,
          }
        : null,
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsLoading(true);
    setLoadingStatus('Analyzing CRM records & querying Gemini...');

    try {
      const response = await aiService.generateAIResponse(
        text,
        selectedLead,
        newHistory
      );
      setMessages((prev) => [...prev, response]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content:
            'I encountered an error retrieving the AI response. Please verify network connectivity or check your server configuration.',
          timestamp: new Date().toISOString(),
          error: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle action buttons inside messages
  const handleActionClick = (action: AIActionButton) => {
    const lead = leads.find((l) => l.id === action.leadId) || selectedLead;

    if (action.actionType === 'schedule_followup' && lead) {
      onScheduleFollowup(lead);
    } else if (action.actionType === 'mark_qualified' && lead && onMarkQualified) {
      onMarkQualified(lead);
    } else if (action.actionType === 'generate_message' && lead) {
      onSelectLead(lead);
      setActiveTab('messages');
    } else if (action.actionType === 'call_prep' && lead) {
      onSelectLead(lead);
      setActiveTab('lead_intel');
    } else if (action.actionType === 'view_lead' && action.leadId && onViewLeadInCRM) {
      onViewLeadInCRM(action.leadId);
    }
  };

  // Handle action triggered from Insights panel
  const handleInsightAction = (insight: AICRMInsight) => {
    const lead = leads.find((l) => l.id === insight.leadId);
    if (lead) {
      onSelectLead(lead);
    }

    if (insight.actionType === 'schedule_followup' && lead) {
      onScheduleFollowup(lead);
    } else if (insight.actionType === 'generate_message') {
      setActiveTab('messages');
    } else if (insight.actionType === 'call_prep') {
      setActiveTab('lead_intel');
    } else if (insight.actionType === 'view_lead') {
      if (lead) {
        setActiveTab('lead_intel');
      } else if (onViewLeadInCRM && insight.leadId) {
        onViewLeadInCRM(insight.leadId);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Bar: Assistant Sub-Tabs & Lead Anchor */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Bot className="w-4 h-4" />
            AI Chat Copilot
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('lead_intel')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'lead_intel'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Lead Intelligence
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('messages')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'messages'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Send className="w-4 h-4" />
            Draft Message
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('coach')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'coach'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Sales Coach
          </button>
        </div>

        {/* Lead Context Selector */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="text-slate-500 font-medium hidden sm:inline">Lead Context:</span>
            <select
              value={selectedLead?.id || ''}
              onChange={(e) => {
                const lead = leads.find((l) => l.id === e.target.value);
                if (lead) onSelectLead(lead);
              }}
              className="bg-transparent text-slate-800 font-bold focus:outline-none max-w-[170px] truncate"
            >
              <option value="">No Lead Anchored</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.company_name} ({l.status})
                </option>
              ))}
            </select>
            {selectedLead && (
              <button
                type="button"
                onClick={() => onSelectLead(null as any)}
                className="text-slate-400 hover:text-slate-600 ml-1"
                title="Clear anchor"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main View Mode */}
      {activeTab === 'chat' && (
        <div className="space-y-4">
          <AIChat
            messages={messages}
            isLoading={isLoading}
            loadingStatus={loadingStatus}
            leadContext={selectedLead}
            onClearLeadContext={() => onSelectLead(null as any)}
            onSendMessage={handleSendMessage}
            onClearConversation={() => setMessages([])}
            onActionClick={handleActionClick}
            isGeminiConfigured={geminiStatus.configured}
          />
          <AILeadInsights onExecuteAction={handleInsightAction} />
        </div>
      )}

      {activeTab === 'lead_intel' && (
        <AILeadSummary
          leads={leads}
          selectedLead={selectedLead}
          onSelectLead={onSelectLead}
          onScheduleFollowup={(l) => onScheduleFollowup(l)}
          onGenerateMessage={(l) => {
            onSelectLead(l);
            setActiveTab('messages');
          }}
          onMarkQualified={onMarkQualified}
        />
      )}

      {activeTab === 'messages' && (
        <AIFollowupGenerator
          leads={leads}
          initialLead={selectedLead}
          onSelectLead={onSelectLead}
        />
      )}

      {activeTab === 'coach' && (
        <AISalesCoach leads={leads} initialLead={selectedLead} />
      )}
    </div>
  );
};
