import React, { useState, useEffect } from 'react';
import { Lead } from '../../types/lead';
import { FollowupChannel, FollowupTone, FollowupDraftResult } from '../../types/ai';
import { aiService } from '../../lib/aiService';
import {
  MessageSquare,
  Mail,
  Smartphone,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Building2,
  AlertCircle,
  Edit3,
  Loader2,
  SendHorizontal,
} from 'lucide-react';

interface AIFollowupGeneratorProps {
  leads: Lead[];
  initialLead: Lead | null;
  onSelectLead?: (lead: Lead) => void;
}

export const AIFollowupGenerator: React.FC<AIFollowupGeneratorProps> = ({
  leads,
  initialLead,
  onSelectLead,
}) => {
  const [selectedLeadId, setSelectedLeadId] = useState<string>(initialLead?.id || (leads[0]?.id || ''));
  const [channel, setChannel] = useState<FollowupChannel>('WhatsApp');
  const [tone, setTone] = useState<FollowupTone>('Professional');
  const [purpose, setPurpose] = useState<string>('Quotation Follow-up (received quote 3 days ago)');
  const [customNotes, setCustomNotes] = useState<string>('');

  const [isLoading, setIsLoading] = useState(false);
  const [draftResult, setDraftResult] = useState<FollowupDraftResult | null>(null);
  const [editableBody, setEditableBody] = useState<string>('');
  const [editableSubject, setEditableSubject] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const selectedLead = leads.find((l) => l.id === selectedLeadId) || initialLead || leads[0];

  useEffect(() => {
    if (initialLead) {
      setSelectedLeadId(initialLead.id);
    }
  }, [initialLead]);

  const handleGenerate = async () => {
    if (!selectedLead) return;
    setIsLoading(true);
    setCopied(false);
    try {
      const res = await aiService.generateFollowupMessage({
        lead: selectedLead,
        channel,
        tone,
        purpose,
        customNotes,
      });
      setDraftResult(res);
      setEditableBody(res.body);
      setEditableSubject(res.subject || '');
    } catch (err) {
      console.error('Failed to generate follow-up message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate on first mount if lead exists and no draft yet
  useEffect(() => {
    if (selectedLead && !draftResult) {
      handleGenerate();
    }
  }, [selectedLeadId]);

  const handleCopy = () => {
    const textToCopy =
      channel === 'Email' && editableSubject
        ? `Subject: ${editableSubject}\n\n${editableBody}`
        : editableBody;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              AI Follow-up & Sales Message Generator
            </h3>
            <p className="text-xs text-slate-500">
              Draft professional WhatsApp, Email, or SMS messages tailored to real CRM lead history
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Draft only — review & copy before sending manually</span>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-5 space-y-4">
          {/* Target Lead Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Select Target Lead
            </label>
            <div className="relative">
              <select
                value={selectedLeadId}
                onChange={(e) => {
                  setSelectedLeadId(e.target.value);
                  const l = leads.find((lead) => lead.id === e.target.value);
                  if (l && onSelectLead) onSelectLead(l);
                }}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 text-slate-900 font-medium"
              >
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.company_name} — {l.contact_person} ({l.status})
                  </option>
                ))}
              </select>
            </div>

            {selectedLead && (
              <div className="mt-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-0.5">
                <div>
                  <strong>Requirement:</strong> {selectedLead.requirement}
                </div>
                <div>
                  <strong>Phone:</strong> {selectedLead.phone} | <strong>Score:</strong>{' '}
                  <span className="text-emerald-700 font-bold">{selectedLead.lead_score}/100</span>
                </div>
              </div>
            )}
          </div>

          {/* Channel Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Communication Channel
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setChannel('WhatsApp')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                  channel === 'WhatsApp'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                WhatsApp
              </button>

              <button
                type="button"
                onClick={() => setChannel('Email')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                  channel === 'Email'
                    ? 'bg-blue-50 text-blue-800 border-blue-300 shadow-2xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                Email
              </button>

              <button
                type="button"
                onClick={() => setChannel('SMS')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                  channel === 'SMS'
                    ? 'bg-purple-50 text-purple-800 border-purple-300 shadow-2xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                SMS
              </button>
            </div>
          </div>

          {/* Tone Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Tone of Voice
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Professional', 'Friendly', 'Short', 'Persuasive'] as FollowupTone[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-all text-center ${
                    tone === t
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Purpose Presets */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Follow-up Purpose
            </label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 text-slate-800"
            >
              <option value="Quotation Follow-up (received quote 3 days ago)">
                Quotation Follow-up (sent quote recently)
              </option>
              <option value="Initial Introduction & Capabilities Deck">
                Initial Introduction & Credentials
              </option>
              <option value="Schedule Site Survey or Technical Discussion">
                Schedule Site Survey / Engineering Discussion
              </option>
              <option value="Proposal Clarification & Commercial Terms">
                Proposal Clarification & Payment Terms
              </option>
              <option value="Re-engagement for Inactive Power Query">
                Re-engagement for Inactive Inquiry
              </option>
              <option value="Post-Meeting Thank You & Next Steps">
                Post-Meeting Thank You & Action Items
              </option>
            </select>
          </div>

          {/* Custom Notes / Specific context */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Custom Talking Point or Instruction (Optional)
            </label>
            <input
              type="text"
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="e.g., Highlight CPCB IV+ compliance or special 5% discount"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Generate Button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading || !selectedLead}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white disabled:text-slate-400 font-semibold rounded-xl text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Draft with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Follow-up Draft</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Generated Message Preview & Edit */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-slate-50/70 p-4 rounded-xl border border-slate-200">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Draft Preview ({channel} • {tone})
                </span>
                <span className="text-[11px] text-slate-400">
                  {editableBody.length} characters
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                  title="Regenerate message"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Regenerate</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Message</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* If Email, show subject input */}
            {channel === 'Email' && (
              <div className="mb-3">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={editableSubject}
                  onChange={(e) => setEditableSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 text-slate-900"
                />
              </div>
            )}

            {/* Message Body Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Message Content (Editable)
                </label>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Edit3 className="w-3 h-3" /> You can edit directly before copying
                </span>
              </div>
              <textarea
                rows={channel === 'SMS' ? 4 : 12}
                value={editableBody}
                onChange={(e) => setEditableBody(e.target.value)}
                placeholder="Message draft will appear here..."
                className="w-full p-3.5 text-xs sm:text-sm font-mono sm:font-sans bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 text-slate-800 leading-relaxed resize-none shadow-2xs"
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>To send: Click <strong>Copy Message</strong>, then paste into your WhatsApp Desktop, Web, or Outlook.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
