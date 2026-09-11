import { Lead } from './lead';
import { Customer } from './customer';
import { FollowupRecord } from './followup';
import { Task } from './task';
import { ActivityRecord } from './activity';

export type AIMessageRole = 'user' | 'assistant' | 'system';

export type AIActionType =
  | 'schedule_followup'
  | 'mark_qualified'
  | 'generate_message'
  | 'view_lead'
  | 'copy_text'
  | 'call_prep';

export interface AIActionButton {
  id: string;
  label: string;
  actionType: AIActionType;
  leadId?: string;
  leadName?: string;
  payload?: any;
}

export interface AIMessage {
  id: string;
  role: AIMessageRole;
  content: string;
  timestamp: string;
  leadContext?: {
    id: string;
    company_name: string;
    status: string;
    lead_score: number;
    requirement?: string;
  } | null;
  suggestedActions?: AIActionButton[];
  error?: boolean;
}

export type FollowupChannel = 'WhatsApp' | 'Email' | 'SMS';
export type FollowupTone = 'Professional' | 'Friendly' | 'Short' | 'Persuasive';

export interface FollowupDraftRequest {
  lead: Lead;
  channel: FollowupChannel;
  tone: FollowupTone;
  purpose: string;
  customNotes?: string;
}

export interface FollowupDraftResult {
  channel: FollowupChannel;
  tone: FollowupTone;
  subject?: string;
  body: string;
  leadName: string;
  purpose: string;
}

export type EmailDraftType =
  | 'Introduction'
  | 'Follow-up'
  | 'Quotation Follow-up'
  | 'Meeting Confirmation'
  | 'Proposal Follow-up'
  | 'Thank You'
  | 'Re-engagement'
  | 'Lost Lead Reactivation';

export interface EmailDraftRequest {
  lead: Lead;
  emailType: EmailDraftType;
  tone?: FollowupTone;
  customNotes?: string;
}

export interface EmailDraftResult {
  emailType: EmailDraftType;
  subject: string;
  body: string;
  leadName: string;
}

export interface LeadSummaryResult {
  leadOverview: string;
  currentSituation: string;
  requirement: string;
  recentActivity: string;
  potentialOpportunity: string;
  risksOrMissingInfo: string;
  recommendedNextStep: string;
}

export interface CallPrepResult {
  companyOverview: string;
  knownRequirement: string;
  previousInteractions: string[];
  questionsToAsk: string[];
  possibleObjections: string[];
  suggestedTalkingPoints: string[];
  recommendedNextStep: string;
}

export interface ObjectionHandlerRequest {
  objection: string;
  lead?: Lead | null;
  productContext?: string;
}

export interface ObjectionHandlerResult {
  objection: string;
  suggestedResponse: string;
  keyTalkingPoints: string[];
  recommendedFollowupQuestion: string;
  alternativeStrategy: string;
}

export interface AICRMInsight {
  id: string;
  type:
    | 'urgent_followup'
    | 'hot_lead'
    | 'inactive_lead'
    | 'stuck_stage'
    | 'high_score'
    | 'opportunity';
  title: string;
  description: string;
  leadId?: string;
  leadName?: string;
  severity: 'high' | 'medium' | 'info';
  recommendedAction: string;
  actionType: AIActionType;
}

export interface AISalesCoachTopic {
  id: string;
  title: string;
  prompt: string;
  category: 'objection' | 'approach' | 'first_call' | 're_engagement' | 'pricing';
}
