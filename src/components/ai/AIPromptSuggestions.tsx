import React from 'react';
import {
  Flame,
  CalendarCheck,
  ClockAlert,
  PhoneCall,
  MessageSquare,
  BarChart3,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';

interface AIPromptSuggestionsProps {
  onSelectPrompt: (prompt: string) => void;
  leadContextCompanyName?: string;
}

export const AIPromptSuggestions: React.FC<AIPromptSuggestionsProps> = ({
  onSelectPrompt,
  leadContextCompanyName,
}) => {
  const suggestions = leadContextCompanyName
    ? [
        {
          text: `Summarize ${leadContextCompanyName}`,
          icon: BarChart3,
          category: 'Lead Insights',
        },
        {
          text: `Suggest next action for ${leadContextCompanyName}`,
          icon: Lightbulb,
          category: 'Strategy',
        },
        {
          text: `Prepare me for a call with ${leadContextCompanyName}`,
          icon: PhoneCall,
          category: 'Call Prep',
        },
        {
          text: `Generate a WhatsApp follow-up for ${leadContextCompanyName}`,
          icon: MessageSquare,
          category: 'Drafts',
        },
        {
          text: `How do I handle price objections for ${leadContextCompanyName}?`,
          icon: HelpCircle,
          category: 'Coaching',
        },
      ]
    : [
        {
          text: 'Show my priority leads',
          icon: Flame,
          category: 'Priorities',
        },
        {
          text: 'What follow-ups are due today?',
          icon: CalendarCheck,
          category: 'Pipeline',
        },
        {
          text: 'Which leads are overdue?',
          icon: ClockAlert,
          category: 'Urgent',
        },
        {
          text: 'Give me today’s sales priorities',
          icon: Lightbulb,
          category: 'Priorities',
        },
        {
          text: 'Summarize our hottest lead',
          icon: Flame,
          category: 'Lead Insights',
        },
        {
          text: 'Which leads are in negotiation?',
          icon: BarChart3,
          category: 'Pipeline',
        },
        {
          text: 'Prepare me for my next sales call',
          icon: PhoneCall,
          category: 'Call Prep',
        },
        {
          text: 'How should I respond to "Your price is too high"?',
          icon: HelpCircle,
          category: 'Objection Handling',
        },
      ];

  return (
    <div className="py-2">
      <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-slate-500">
        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
        <span>Suggested Prompts:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPrompt(item.text)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg border border-slate-200 hover:border-blue-200 transition-all text-left shadow-2xs hover:shadow-xs group cursor-pointer"
            >
              <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
              <span>{item.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
