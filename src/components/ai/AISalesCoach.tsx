import React, { useState } from 'react';
import { Lead } from '../../types/lead';
import { ObjectionHandlerResult } from '../../types/ai';
import { aiService } from '../../lib/aiService';
import {
  ShieldAlert,
  GraduationCap,
  Sparkles,
  Copy,
  Check,
  Building2,
  HelpCircle,
  CheckCircle2,
  Compass,
  Loader2,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';

interface AISalesCoachProps {
  leads: Lead[];
  initialLead: Lead | null;
}

const COMMON_OBJECTIONS = [
  'Your price is too high.',
  'We already have a supplier.',
  'Send the quotation later.',
  'We need to discuss internally.',
  'We are not interested right now.',
];

const COACHING_PROMPTS = [
  {
    title: 'How should I approach a new industrial lead?',
    category: 'First Outreach',
    prompt:
      'How should a Shiv Power Solution sales executive approach a new manufacturing or healthcare lead who requested a DG set or solar power inquiry?',
  },
  {
    title: 'What should I ask during the first discovery call?',
    category: 'Discovery',
    prompt:
      'What are the top 5 technical and commercial discovery questions to ask during a first call for a DG set or UPS requirement?',
  },
  {
    title: 'How do I follow up without sounding pushy?',
    category: 'Follow-ups',
    prompt:
      'How do I follow up on a proposal with a busy factory owner or hospital purchase manager without sounding aggressive or pushy?',
  },
  {
    title: 'How to explain CPCB IV+ emission value over older engines?',
    category: 'Technical Value',
    prompt:
      'How can I explain the tangible value, legal compliance, and fuel savings of CPCB IV+ DG sets to a price-sensitive customer?',
  },
  {
    title: 'How can I re-engage an inactive lead from last month?',
    category: 'Re-engagement',
    prompt:
      'What is the best strategy to re-engage an industrial power lead that went silent after receiving our initial proposal 30 days ago?',
  },
];

export const AISalesCoach: React.FC<AISalesCoachProps> = ({ leads, initialLead }) => {
  const [activeTab, setActiveTab] = useState<'objections' | 'coaching'>('objections');
  const [selectedLeadId, setSelectedLeadId] = useState<string>(initialLead?.id || '');
  const [objectionText, setObjectionText] = useState(COMMON_OBJECTIONS[0]);
  const [customObjection, setCustomObjection] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [objectionResult, setObjectionResult] = useState<ObjectionHandlerResult | null>(null);
  const [coachingAnswer, setCoachingAnswer] = useState<{ title: string; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const selectedLead = leads.find((l) => l.id === selectedLeadId) || initialLead || null;

  const handleHandleObjection = async () => {
    const textToHandle = customObjection.trim() || objectionText;
    if (!textToHandle) return;

    setIsLoading(true);
    setCopied(false);
    try {
      const res = await aiService.handleSalesObjection({
        objection: textToHandle,
        lead: selectedLead,
        productContext: selectedLead ? selectedLead.requirement : 'Industrial DG sets & Solar systems',
      });
      setObjectionResult(res);
    } catch (err) {
      console.error('Failed to handle objection:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskCoaching = async (item: { title: string; prompt: string }) => {
    setIsLoading(true);
    try {
      const res = await aiService.generateAIResponse(item.prompt, selectedLead);
      setCoachingAnswer({ title: item.title, text: res.content });
    } catch (err) {
      console.error('Failed to generate sales coaching response:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
      {/* Top Header */}
      <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              AI Sales Coach & Objection Handling
            </h3>
            <p className="text-xs text-slate-500">
              Master industrial sales negotiations, answer client objections, and refine call tactics
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('objections')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'objections'
                ? 'bg-white text-purple-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Objection Handling
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('coaching')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'coaching'
                ? 'bg-white text-purple-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sales Playbook
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        {activeTab === 'objections' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Objection Inputs */}
            <div className="lg:col-span-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Tailor for Specific Lead (Optional)
                </label>
                <select
                  value={selectedLeadId}
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                >
                  <option value="">General Client (No specific lead)</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.company_name} ({l.requirement.substring(0, 35)}...)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Select Common Objection
                </label>
                <div className="space-y-1.5">
                  {COMMON_OBJECTIONS.map((obj) => (
                    <button
                      key={obj}
                      type="button"
                      onClick={() => {
                        setObjectionText(obj);
                        setCustomObjection('');
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-medium rounded-xl border transition-all flex items-center justify-between ${
                        objectionText === obj && !customObjection
                          ? 'bg-purple-50 text-purple-900 border-purple-300 shadow-2xs font-semibold'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>"{obj}"</span>
                      {objectionText === obj && !customObjection && (
                        <Check className="w-3.5 h-3.5 text-purple-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Or Type Custom Customer Objection
                </label>
                <input
                  type="text"
                  value={customObjection}
                  onChange={(e) => setCustomObjection(e.target.value)}
                  placeholder="e.g. 'Can you provide 90 days credit without bank guarantee?'"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-100 text-slate-800"
                />
              </div>

              <button
                type="button"
                onClick={handleHandleObjection}
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 text-white disabled:text-slate-400 font-semibold rounded-xl text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing with Sales Coach...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Recommended Response</span>
                  </>
                )}
              </button>
            </div>

            {/* Right Column: Objection Response */}
            <div className="lg:col-span-7">
              {objectionResult ? (
                <div className="space-y-4">
                  {/* Spoken Response Box */}
                  <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Recommended Spoken Response
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(objectionResult.suggestedResponse)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-purple-700 bg-white rounded-lg border border-purple-200 hover:bg-purple-50 transition-colors"
                      >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy Script'}</span>
                      </button>
                    </div>
                    <p className="text-sm font-medium text-slate-900 leading-relaxed italic bg-white p-3.5 rounded-lg border border-purple-100">
                      {objectionResult.suggestedResponse}
                    </p>
                  </div>

                  {/* Key Talking Points */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                      Key Technical & Commercial Value Anchors
                    </span>
                    <div className="space-y-1.5">
                      {objectionResult.keyTalkingPoints.map((pt, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Follow-up Question */}
                  <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200">
                    <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block mb-1">
                      Collaborative Follow-up Question
                    </span>
                    <p className="text-xs text-slate-800 font-semibold">
                      {objectionResult.recommendedFollowupQuestion}
                    </p>
                  </div>

                  {/* Alternative Strategy */}
                  {objectionResult.alternativeStrategy && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                      <strong>Tactical Alternative:</strong> {objectionResult.alternativeStrategy}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                  <ShieldAlert className="w-10 h-10 text-slate-300 mb-2" />
                  <h4 className="text-sm font-bold text-slate-800 mb-1">
                    Select or Enter an Objection
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm">
                    The AI Sales Coach provides non-manipulative, respectful responses emphasizing Shiv Power Solution's quality, CPCB IV+ compliance, and TCO savings.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Coaching Playbook Tab */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Proven Industrial Sales Guides
              </span>
              {COACHING_PROMPTS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAskCoaching(item)}
                  disabled={isLoading}
                  className="w-full p-3 text-left rounded-xl border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-200 transition-all text-xs group cursor-pointer"
                >
                  <span className="text-[10px] font-bold text-purple-600 block uppercase tracking-wider mb-0.5">
                    {item.category}
                  </span>
                  <div className="font-semibold text-slate-900 flex items-center justify-between">
                    <span>{item.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 transition-colors" />
                  </div>
                </button>
              ))}
            </div>

            <div className="lg:col-span-7">
              {isLoading ? (
                <div className="h-full min-h-[350px] flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-xl border border-slate-200">
                  <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-3" />
                  <p className="text-sm font-semibold text-slate-800">
                    Consulting Shiv Power Sales Playbook...
                  </p>
                </div>
              ) : coachingAnswer ? (
                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
                    {coachingAnswer.title}
                  </h4>
                  <div className="text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {coachingAnswer.text}
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[350px] flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Compass className="w-10 h-10 text-slate-300 mb-2" />
                  <h4 className="text-sm font-bold text-slate-800 mb-1">
                    Select a Coaching Question
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Click any guide on the left to view tactical, step-by-step advice for closing deals in the power solutions market.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
