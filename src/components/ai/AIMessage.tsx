import React, { useState } from 'react';
import { AIMessage as AIMessageType, AIActionButton } from '../../types/ai';
import {
  Bot,
  User,
  Copy,
  Check,
  CalendarClock,
  CheckCircle2,
  MessageSquare,
  ExternalLink,
  PhoneCall,
  Sparkles,
  AlertCircle,
  Building2,
} from 'lucide-react';

interface AIMessageProps {
  message: AIMessageType;
  onActionClick?: (action: AIActionButton) => void;
}

export const AIMessage: React.FC<AIMessageProps> = ({ message, onActionClick }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to format basic markdown-like content into structured React nodes
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-2 leading-relaxed text-sm text-slate-800">
        {lines.map((line, idx) => {
          const trimmed = line.trim();

          if (trimmed.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-bold text-slate-900 text-base mt-3 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600 inline" />
                {trimmed.replace('### ', '')}
              </h4>
            );
          }
          if (trimmed.startsWith('## ')) {
            return (
              <h3 key={idx} className="font-bold text-slate-900 text-base mt-3.5 mb-1.5 border-b border-slate-100 pb-1">
                {trimmed.replace('## ', '')}
              </h3>
            );
          }
          if (trimmed.startsWith('# ')) {
            return (
              <h2 key={idx} className="font-bold text-slate-950 text-lg mt-4 mb-2">
                {trimmed.replace('# ', '')}
              </h2>
            );
          }

          // Bullet point
          if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const text = trimmed.replace(/^[•\-\*]\s+/, '');
            return (
              <div key={idx} className="flex items-start gap-2 ml-1 text-slate-700">
                <span className="text-blue-500 font-bold select-none leading-5">•</span>
                <span className="flex-1">{parseInlineStyles(text)}</span>
              </div>
            );
          }

          // Numbered item (e.g. 1. or 2.)
          const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start gap-2 ml-1 text-slate-700">
                <span className="font-semibold text-blue-600 select-none min-w-4 text-xs mt-0.5">
                  {numMatch[1]}.
                </span>
                <span className="flex-1">{parseInlineStyles(numMatch[2])}</span>
              </div>
            );
          }

          // Empty line
          if (!trimmed) {
            return <div key={idx} className="h-1.5" />;
          }

          return (
            <p key={idx} className="text-slate-800">
              {parseInlineStyles(line)}
            </p>
          );
        })}
      </div>
    );
  };

  // Helper for bold and inline highlight
  const parseInlineStyles = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={i} className="italic text-slate-700">
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });
  };

  if (isUser) {
    return (
      <div className="flex justify-end gap-3 mb-4">
        <div className="max-w-2xl bg-blue-600 text-white px-4 py-3 rounded-2xl rounded-tr-xs shadow-xs text-sm">
          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          <div className="text-[10px] text-blue-200 mt-1 text-right">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white shrink-0 shadow-xs">
          <User className="w-4 h-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 mb-5 group">
      <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shrink-0 shadow-xs mt-0.5">
        <Bot className="w-4 h-4" />
      </div>

      <div className="flex-1 max-w-3xl">
        <div className="bg-white border border-slate-200/80 rounded-2xl rounded-tl-xs p-4 shadow-2xs">
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                Shiv Power AI Copilot
              </span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                Gemini 3.8 Flash
              </span>
              {message.error && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> CRM Heuristic Mode
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <span>
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                title="Copy response"
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Lead Context Pill */}
          {message.leadContext && (
            <div className="mb-3 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-semibold">{message.leadContext.company_name}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600">Status: {message.leadContext.status}</span>
              </div>
              <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                Score: {message.leadContext.lead_score}/100
              </span>
            </div>
          )}

          {/* Main Message Content */}
          {renderFormattedContent(message.content)}

          {/* Interactive Action Buttons */}
          {message.suggestedActions && message.suggestedActions.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
              <span className="text-xs text-slate-400 font-medium self-center mr-1">Recommended Actions:</span>
              {message.suggestedActions.map((action) => {
                let Icon = Sparkles;
                let colorCls = 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';

                if (action.actionType === 'schedule_followup') {
                  Icon = CalendarClock;
                  colorCls = 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100';
                } else if (action.actionType === 'mark_qualified') {
                  Icon = CheckCircle2;
                  colorCls = 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100';
                } else if (action.actionType === 'generate_message') {
                  Icon = MessageSquare;
                  colorCls = 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100';
                } else if (action.actionType === 'call_prep') {
                  Icon = PhoneCall;
                  colorCls = 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100';
                } else if (action.actionType === 'view_lead') {
                  Icon = ExternalLink;
                  colorCls = 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100';
                }

                return (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => onActionClick && onActionClick(action)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all shadow-2xs ${colorCls}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {action.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
