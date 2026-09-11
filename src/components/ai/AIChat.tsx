import React, { useState, useRef, useEffect } from 'react';
import { Lead } from '../../types/lead';
import { AIMessage as AIMessageType, AIActionButton } from '../../types/ai';
import { AIMessage } from './AIMessage';
import { AIPromptSuggestions } from './AIPromptSuggestions';
import {
  Send,
  Trash2,
  Sparkles,
  Loader2,
  Building2,
  X,
  Bot,
  RefreshCw,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface AIChatProps {
  messages: AIMessageType[];
  isLoading: boolean;
  loadingStatus?: string;
  leadContext: Lead | null;
  onClearLeadContext: () => void;
  onSendMessage: (text: string) => void;
  onClearConversation: () => void;
  onActionClick: (action: AIActionButton) => void;
  isGeminiConfigured: boolean;
}

export const AIChat: React.FC<AIChatProps> = ({
  messages,
  isLoading,
  loadingStatus = 'Thinking...',
  leadContext,
  onClearLeadContext,
  onSendMessage,
  onClearConversation,
  onActionClick,
  isGeminiConfigured,
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    onSendMessage(inputValue.trim());
    setInputValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSelectPrompt = (prompt: string) => {
    onSendMessage(prompt);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-230px)] min-h-[550px] bg-slate-50/50 rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Top Header Bar */}
      <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-xs">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Shiv Power AI Sales Copilot
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3 h-3" /> Live CRM Grounded
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Answers questions, analyzes real leads, and drafts high-converting communications
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              type="button"
              onClick={onClearConversation}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg border border-slate-200 hover:border-red-200 transition-colors"
              title="Clear current session chat history"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear Chat</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Lead Context Bar */}
      {leadContext && (
        <div className="bg-blue-50/80 border-b border-blue-100 px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-slate-600">Active Lead Context:</span>
            <span className="font-bold text-slate-900">{leadContext.company_name}</span>
            <span className="text-slate-400">•</span>
            <span className="text-blue-700 font-medium">Stage: {leadContext.status}</span>
            <span className="text-slate-400">•</span>
            <span className="text-emerald-700 font-semibold">Score: {leadContext.lead_score}/100</span>
          </div>
          <button
            type="button"
            onClick={onClearLeadContext}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-blue-100/60 transition-colors"
            title="Clear active lead context"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Chat Messages Scroll Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center text-center max-w-xl mx-auto py-8">
            <div className="w-14 h-14 rounded-2xl bg-blue-100/80 text-blue-600 flex items-center justify-center mb-4 shadow-2xs">
              <Bot className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-1">
              Welcome to Shiv Power Solution AI Assistant
            </h4>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              I am your internal sales & business copilot. I can query real CRM records, prioritize hot leads, draft WhatsApp & email follow-ups, and help you prepare for customer calls.
            </p>

            <div className="w-full text-left">
              <AIPromptSuggestions
                onSelectPrompt={handleSelectPrompt}
                leadContextCompanyName={leadContext?.company_name}
              />
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <AIMessage key={msg.id} message={msg} onActionClick={onActionClick} />
            ))}

            {isLoading && (
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shrink-0 shadow-xs animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-4 shadow-2xs max-w-md">
                  <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                    <span>{loadingStatus}</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Quick Suggestions Chips (when messages present) */}
      {messages.length > 0 && !isLoading && (
        <div className="px-4 py-1.5 bg-white border-t border-slate-100 overflow-x-auto">
          <AIPromptSuggestions
            onSelectPrompt={handleSelectPrompt}
            leadContextCompanyName={leadContext?.company_name}
          />
        </div>
      )}

      {/* Input Form Bar */}
      <div className="bg-white p-3 sm:p-4 border-t border-slate-200">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
              onKeyDown={handleKeyDown}
              placeholder={
                leadContext
                  ? `Ask anything about ${leadContext.company_name} or sales strategy...`
                  : 'Ask about leads, follow-ups, sales priorities, or draft a message...'
              }
              className="w-full resize-none px-4 py-2.5 bg-slate-50 focus:bg-white text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400 max-h-32"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white disabled:text-slate-400 font-semibold rounded-xl text-sm transition-all flex items-center justify-center shrink-0 shadow-xs cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>

        <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
          <span>Press Enter to send, Shift + Enter for new line</span>
          <span>Powered by Google Gemini 3.8 Flash</span>
        </div>
      </div>
    </div>
  );
};
