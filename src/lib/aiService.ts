import { Lead, LeadStatus } from '../types/lead';
import { Customer } from '../types/customer';
import { FollowupRecord } from '../types/followup';
import { Task } from '../types/task';
import { ActivityRecord } from '../types/activity';
import {
  AIMessage,
  AIActionButton,
  FollowupDraftRequest,
  FollowupDraftResult,
  EmailDraftRequest,
  EmailDraftResult,
  LeadSummaryResult,
  CallPrepResult,
  ObjectionHandlerRequest,
  ObjectionHandlerResult,
  AICRMInsight,
} from '../types/ai';

import { leadsService } from './leadsService';
import { customersService } from './customersService';
import { followupsService } from './followupsService';
import { tasksService } from './tasksService';
import { activitiesService } from './activitiesService';

const SYSTEM_PROMPT = `You are the AI Sales & Business Assistant for "Shiv Power Solution".
Shiv Power Solution is an engineering and power solutions business specializing in:
- Diesel Generator sets (Silent CPCB IV+ DG Sets, AMF Panels, Auto Mains Failure, Cummins, Kirloskar, Perkins)
- Rooftop Solar Power Plants (Capex & PPA, Net Metering, Grid-tie)
- Industrial Online UPS & Battery Banks (Li-ion, Tubular, 3-Phase Modular)
- Transformers, Servo Voltage Stabilizers, HT/LT Electric Panels
- Industrial Electrical Contracting & Annual Maintenance Contracts (AMC)

Your role is to act as an intelligent business copilot for:
- Business owner
- Sales managers
- Sales executives
- Support staff

IMPORTANT RULES:
1. Do NOT invent company or lead information that is not available in the provided CRM data.
2. If information is unavailable or unconfirmed, state clearly: "I don't have that information in the current CRM data."
3. Do not claim certainty. Use language like "Based on the available CRM information...".
4. Never fabricate customer revenue, budget, employee size, decision makers, or requirements.
5. Provide actionable, concise, professional sales advice with clear headings, bullet points, and next steps.
6. When addressing sales objections, recommend respectful, honest, and high-value responses focusing on quality, compliance (CPCB IV+), service SLA, and total cost of ownership.`;

class AIService {
  private apiStatusCache: { configured: boolean; checkedAt: number } | null = null;

  /**
   * Check if Gemini API is configured and accessible on the server
   */
  async checkStatus(): Promise<{ configured: boolean; model: string }> {
    try {
      const now = Date.now();
      if (this.apiStatusCache && now - this.apiStatusCache.checkedAt < 30000) {
        return {
          configured: this.apiStatusCache.configured,
          model: 'gemini-3.8-flash',
        };
      }

      const res = await fetch('/api/ai/status', {
        headers: { credentials: 'omit' },
      });
      if (res.ok) {
        const data = await res.json();
        this.apiStatusCache = { configured: Boolean(data.configured), checkedAt: now };
        return { configured: Boolean(data.configured), model: data.model || 'gemini-3.8-flash' };
      }
    } catch {
      // Fallback
    }
    return { configured: false, model: 'gemini-3.8-flash' };
  }

  /**
   * Core call to server-side Gemini API
   */
  private async callGemini(
    prompt: string,
    systemInstruction: string = SYSTEM_PROMPT,
    messages?: { role: string; content: string }[]
  ): Promise<{ text: string; error?: string }> {
    try {
      // If messages array is provided, use chat endpoint
      const endpoint = messages && messages.length > 0 ? '/api/ai/chat' : '/api/ai/generate';
      const body =
        endpoint === '/api/ai/chat'
          ? JSON.stringify({
              messages: [...(messages || []), { role: 'user', content: prompt }],
              systemInstruction,
              temperature: 0.4,
            })
          : JSON.stringify({
              prompt,
              systemInstruction,
              temperature: 0.4,
            });

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        return {
          text: '',
          error: errData.error || `Server responded with status ${res.status}`,
        };
      }

      const data = await res.json();
      return { text: data.text || '' };
    } catch (err: any) {
      return { text: '', error: err?.message || 'Network error communicating with AI server' };
    }
  }

  /**
   * Build concise CRM context from real records to ground the AI
   */
  private async getRelevantCRMContext(query: string, leadContext?: Lead | null): Promise<string> {
    const [leadsRes, custsRes, fupRes, tasksRes] = await Promise.all([
      leadsService.getLeads(),
      customersService.getCustomers(),
      followupsService.getFollowups(),
      tasksService.getTasks(),
    ]);

    const leads = leadsRes.leads || [];
    const customers = custsRes.customers || [];
    const followups = fupRes.followups || [];
    const tasks = tasksRes.tasks || [];

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const totalLeads = leads.length;
    const hotLeads = leads.filter((l) => l.lead_score >= 80);
    const qualifiedLeads = leads.filter((l) => l.status === 'Qualified');
    const proposalLeads = leads.filter((l) => l.status === 'Proposal Sent');
    const negotiationLeads = leads.filter((l) => l.status === 'Negotiation');
    const newLeads = leads.filter((l) => l.status === 'New');
    const wonLeads = leads.filter((l) => l.status === 'Won');
    const lostLeads = leads.filter((l) => l.status === 'Lost');

    const pendingFollowups = followups.filter((f) => f.status === 'Pending');
    const todayFollowups = pendingFollowups.filter((f) => f.followup_date.startsWith(todayStr));
    const overdueFollowups = pendingFollowups.filter(
      (f) => new Date(f.followup_date) < new Date(todayStr)
    );

    let context = `=== REAL SHIV POWER SOLUTION CRM DATA SUMMARY ===\n`;
    context += `Total Leads in CRM: ${totalLeads}\n`;
    context += `Status breakdown: New (${newLeads.length}), Contacted (${leads.filter((l) => l.status === 'Contacted').length}), Qualified (${qualifiedLeads.length}), Proposal Sent (${proposalLeads.length}), Negotiation (${negotiationLeads.length}), Won (${wonLeads.length}), Lost (${lostLeads.length})\n`;
    context += `Total Active Customers: ${customers.length}\n`;
    context += `Pending Follow-ups: ${pendingFollowups.length} (Due Today: ${todayFollowups.length}, Overdue: ${overdueFollowups.length})\n`;
    context += `Open Tasks: ${tasks.filter((t) => t.status === 'Pending' || t.status === 'In Progress').length}\n\n`;

    if (leadContext) {
      context += `=== CURRENTLY SELECTED LEAD CONTEXT ===\n`;
      context += `Company: ${leadContext.company_name}\n`;
      context += `Contact Person: ${leadContext.contact_person} (${leadContext.phone}, ${leadContext.email || 'No email'})\n`;
      context += `Location: ${leadContext.location || 'Not specified'}\n`;
      context += `Industry: ${leadContext.industry || 'Not specified'}\n`;
      context += `Source: ${leadContext.lead_source || 'Other'}\n`;
      context += `Status: ${leadContext.status} | Lead Score: ${leadContext.lead_score}/100\n`;
      context += `Requirement: ${leadContext.requirement}\n`;
      context += `Assigned To: ${leadContext.assigned_user_name || leadContext.assigned_to}\n`;
      context += `Internal Notes: ${leadContext.notes || 'None'}\n`;
      context += `Added Date: ${leadContext.created_at}\n\n`;

      // Related followups
      const leadFups = followups.filter((f) => f.lead_id === leadContext.id);
      if (leadFups.length > 0) {
        context += `Lead's Scheduled Follow-ups:\n`;
        leadFups.forEach((f) => {
          context += `- ${f.followup_date} (${f.followup_type}): ${f.subject || f.notes || 'Pending'} [Status: ${f.status}]\n`;
        });
        context += `\n`;
      }
    }

    // Include top priority leads summary
    const priorityLeads = hotLeads.slice(0, 5);
    if (priorityLeads.length > 0) {
      context += `Top Priority / Hot Leads (Score >= 80):\n`;
      priorityLeads.forEach((l) => {
        context += `- ${l.company_name} (Score: ${l.lead_score}, Status: ${l.status}, Req: ${l.requirement.substring(0, 70)}...)\n`;
      });
      context += `\n`;
    }

    // Overdue follow-ups list
    if (overdueFollowups.length > 0) {
      context += `Overdue Follow-ups:\n`;
      overdueFollowups.slice(0, 5).forEach((f) => {
        context += `- ${f.lead_name || 'Lead'} (Date: ${f.followup_date}, Type: ${f.followup_type}, Note: ${f.notes || 'No note'})\n`;
      });
      context += `\n`;
    }

    // Today's follow-ups list
    if (todayFollowups.length > 0) {
      context += `Today's Scheduled Follow-ups:\n`;
      todayFollowups.slice(0, 5).forEach((f) => {
        context += `- ${f.lead_name || 'Lead'} (Time: ${f.followup_date}, Type: ${f.followup_type}, Note: ${f.notes || 'No note'})\n`;
      });
      context += `\n`;
    }

    return context;
  }

  /**
   * Main conversational AI assistant with session memory and action triggers
   */
  async generateAIResponse(
    prompt: string,
    leadContext?: Lead | null,
    conversationHistory: AIMessage[] = []
  ): Promise<AIMessage> {
    const crmContext = await this.getRelevantCRMContext(prompt, leadContext);

    // Build chat message turns for Gemini
    const historyPayload = conversationHistory.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      content: m.content,
    }));

    const augmentedPrompt = `${crmContext}\nUser Request: ${prompt}\n\nPlease respond based strictly on the above Shiv Power Solution CRM context. If you recommend actions like scheduling a follow-up or qualifying a lead, specify the exact company name so action buttons can be attached.`;

    const result = await this.callGemini(augmentedPrompt, SYSTEM_PROMPT, historyPayload);

    // Determine if we need interactive action buttons based on leadContext or content
    const actions: AIActionButton[] = [];
    if (leadContext) {
      if (leadContext.status === 'New' || leadContext.status === 'Contacted') {
        actions.push({
          id: 'act-qualify',
          label: 'Mark as Qualified',
          actionType: 'mark_qualified',
          leadId: leadContext.id,
          leadName: leadContext.company_name,
        });
      }
      actions.push({
        id: 'act-fup',
        label: 'Schedule Follow-up',
        actionType: 'schedule_followup',
        leadId: leadContext.id,
        leadName: leadContext.company_name,
      });
      actions.push({
        id: 'act-msg',
        label: 'Draft Follow-up Message',
        actionType: 'generate_message',
        leadId: leadContext.id,
        leadName: leadContext.company_name,
      });
    }

    // Fallback if Gemini failed or key not configured
    if (result.error || !result.text) {
      const fallbackResponse = await this.generateHeuristicCRMAnswer(prompt, leadContext);
      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: fallbackResponse.content,
        timestamp: new Date().toISOString(),
        leadContext: leadContext
          ? {
              id: leadContext.id,
              company_name: leadContext.company_name,
              status: leadContext.status,
              lead_score: leadContext.lead_score,
              requirement: leadContext.requirement,
            }
          : null,
        suggestedActions: fallbackResponse.actions || actions,
        error: Boolean(result.error),
      };
    }

    return {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: result.text,
      timestamp: new Date().toISOString(),
      leadContext: leadContext
        ? {
            id: leadContext.id,
            company_name: leadContext.company_name,
            status: leadContext.status,
            lead_score: leadContext.lead_score,
            requirement: leadContext.requirement,
          }
        : null,
      suggestedActions: actions.length > 0 ? actions : undefined,
    };
  }

  /**
   * Rule-based heuristic CRM answer engine when Gemini is offline / API key unconfigured
   */
  private async generateHeuristicCRMAnswer(
    prompt: string,
    leadContext?: Lead | null
  ): Promise<{ content: string; actions?: AIActionButton[] }> {
    const q = prompt.toLowerCase();
    const [leadsRes, custsRes, fupRes, tasksRes] = await Promise.all([
      leadsService.getLeads(),
      customersService.getCustomers(),
      followupsService.getFollowups(),
      tasksService.getTasks(),
    ]);

    const leads = leadsRes.leads || [];
    const customers = custsRes.customers || [];
    const followups = fupRes.followups || [];
    const tasks = tasksRes.tasks || [];
    const actions: AIActionButton[] = [];

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (q.includes('how many lead') || q.includes('count of lead')) {
      const statuses = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'];
      let breakdown = statuses
        .map((s) => `• **${s}**: ${leads.filter((l) => l.status === s).length}`)
        .join('\n');
      return {
        content: `### Shiv Power Solution — Total Leads Overview\n\nBased on the current CRM data, there are **${leads.length} total leads** recorded:\n\n${breakdown}\n\n*Currently active in sales pipeline (excluding Won/Lost):* **${leads.filter((l) => l.status !== 'Won' && l.status !== 'Lost').length} leads**.`,
      };
    }

    if (q.includes('hot lead') || q.includes('highest score') || q.includes('priority')) {
      const hot = leads.filter((l) => l.lead_score >= 80).sort((a, b) => b.lead_score - a.lead_score);
      if (hot.length === 0) {
        return {
          content: `Based on the available CRM information, there are currently no leads with a lead score of 80 or above.`,
        };
      }

      let text = `### Top Hot / High-Priority Leads (Score >= 80)\n\nFound **${hot.length} high-potential leads** in the CRM:\n\n`;
      hot.forEach((l, i) => {
        text += `${i + 1}. **${l.company_name}** — Score: **${l.lead_score}/100**\n   - **Status**: ${l.status} | **Contact**: ${l.contact_person} (${l.phone})\n   - **Requirement**: ${l.requirement}\n   - **Assigned To**: ${l.assigned_user_name || l.assigned_to}\n\n`;
        if (i === 0) {
          actions.push({
            id: `act-view-${l.id}`,
            label: `View ${l.company_name}`,
            actionType: 'view_lead',
            leadId: l.id,
            leadName: l.company_name,
          });
          actions.push({
            id: `act-fup-${l.id}`,
            label: `Follow-up with ${l.company_name}`,
            actionType: 'schedule_followup',
            leadId: l.id,
            leadName: l.company_name,
          });
        }
      });
      return { content: text, actions };
    }

    if (q.includes('today') && (q.includes('follow') || q.includes('schedule'))) {
      const todayFups = followups.filter(
        (f) => f.status === 'Pending' && f.followup_date.startsWith(todayStr)
      );
      if (todayFups.length === 0) {
        return {
          content: `### Today's Follow-up Schedule\n\nBased on current CRM records, there are **no follow-ups scheduled for today (${todayStr})**.\n\nYou can use the Follow-up Management tab or select a lead to schedule a new touchpoint.`,
        };
      }

      let text = `### Scheduled Follow-ups for Today (${todayStr})\n\nThere are **${todayFups.length} follow-ups** due today:\n\n`;
      todayFups.forEach((f, idx) => {
        text += `${idx + 1}. **${f.lead_name || 'Lead Contact'}** (${f.followup_type})\n   - **Time/Date**: ${f.followup_date}\n   - **Notes**: ${f.notes || f.subject || 'Standard check-in'}\n\n`;
      });
      return { content: text };
    }

    if (q.includes('overdue')) {
      const overdue = followups.filter(
        (f) => f.status === 'Pending' && new Date(f.followup_date) < new Date(todayStr)
      );
      if (overdue.length === 0) {
        return {
          content: `### Overdue Follow-ups\n\nGreat news! Based on the available CRM data, there are **zero overdue follow-ups**. All tasks and touches are up to date.`,
        };
      }
      let text = `### ⚠️ Overdue Follow-ups Requiring Immediate Attention\n\nFound **${overdue.length} overdue follow-up(s)**:\n\n`;
      overdue.forEach((f, idx) => {
        text += `${idx + 1}. **${f.lead_name || 'Lead'}** (${f.followup_type})\n   - **Was Due**: ${f.followup_date}\n   - **Note**: ${f.notes || 'None'}\n\n`;
      });
      return { content: text };
    }

    if (q.includes('customer') && (q.includes('how many') || q.includes('count') || q.includes('total'))) {
      return {
        content: `### Shiv Power Solution — Customers\n\nBased on current CRM data, there are **${customers.length} converted/active customer accounts** registered.`,
      };
    }

    if (leadContext) {
      return {
        content: `### Analysis for ${leadContext.company_name}\n\nBased on the available CRM information:\n- **Current Status**: ${leadContext.status}\n- **Lead Score**: ${leadContext.lead_score}/100\n- **Contact**: ${leadContext.contact_person} (${leadContext.phone})\n- **Location**: ${leadContext.location || 'Not provided'}\n- **Known Requirement**: ${leadContext.requirement}\n- **Assigned Representative**: ${leadContext.assigned_user_name || leadContext.assigned_to}\n- **Notes**: ${leadContext.notes || 'No specific notes recorded'}\n\n**Recommended Next Action**:\nSchedule a call to discuss equipment sizing, project timeline, and delivery logistics.`,
        actions: [
          {
            id: 'act-fup',
            label: 'Schedule Follow-up',
            actionType: 'schedule_followup',
            leadId: leadContext.id,
            leadName: leadContext.company_name,
          },
          {
            id: 'act-msg',
            label: 'Draft Follow-up Message',
            actionType: 'generate_message',
            leadId: leadContext.id,
            leadName: leadContext.company_name,
          },
        ],
      };
    }

    return {
      content: `### Shiv Power Solution CRM Assistant\n\nBased on the current CRM database:\n- **Total Leads**: ${leads.length}\n- **Active Pipeline**: ${leads.filter((l) => l.status !== 'Won' && l.status !== 'Lost').length}\n- **Hot Leads (Score 80+)**: ${leads.filter((l) => l.lead_score >= 80).length}\n- **Total Customers**: ${customers.length}\n- **Follow-ups Due Today**: ${followups.filter((f) => f.status === 'Pending' && f.followup_date.startsWith(todayStr)).length}\n- **Overdue Follow-ups**: ${followups.filter((f) => f.status === 'Pending' && new Date(f.followup_date) < new Date(todayStr)).length}\n\nAsk any specific question such as *"Show me our hot leads"*, *"Which leads need follow-up today?"*, or select a lead to generate custom follow-ups, summaries, or sales call prep!`,
    };
  }

  /**
   * Feature: AI Lead Summary
   */
  async generateLeadSummary(lead: Lead): Promise<LeadSummaryResult> {
    const prompt = `Generate a concise, structured AI Lead Summary for this Shiv Power Solution lead:
Company: ${lead.company_name}
Contact Person: ${lead.contact_person}
Phone: ${lead.phone}
Location: ${lead.location || 'Not provided'}
Industry: ${lead.industry || 'Not provided'}
Requirement: ${lead.requirement}
Status: ${lead.status}
Lead Score: ${lead.lead_score}/100
Source: ${lead.lead_source}
Notes: ${lead.notes || 'None'}
Assigned To: ${lead.assigned_user_name || lead.assigned_to}

Respond strictly with valid JSON conforming to this TypeScript interface:
{
  "leadOverview": "short paragraph",
  "currentSituation": "brief sentence on pipeline stage and engagement level",
  "requirement": "specific technical requirement for generator, solar, UPS, or panels",
  "recentActivity": "status and last known touchpoints",
  "potentialOpportunity": "estimated business value and scope",
  "risksOrMissingInfo": "any unconfirmed details like budget, timeline, or site readiness",
  "recommendedNextStep": "clear actionable next step"
}
Do NOT include markdown block wrappers like \`\`\`json. Output plain JSON only.`;

    const res = await this.callGemini(prompt, SYSTEM_PROMPT);
    if (res.text) {
      try {
        const clean = res.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(clean);
        return parsed as LeadSummaryResult;
      } catch {
        // fallback
      }
    }

    // High quality deterministic fallback based on real lead data
    return {
      leadOverview: `${lead.company_name} is a prospect in the ${lead.industry || 'industrial power'} sector based in ${lead.location || 'India'}, represented by ${lead.contact_person}.`,
      currentSituation: `The lead is currently in the '${lead.status}' stage with an evaluation score of ${lead.lead_score}/100.`,
      requirement: lead.requirement || 'Industrial power backup and electrical installations.',
      recentActivity: `Assigned to ${lead.assigned_user_name || lead.assigned_to}. Notes: "${lead.notes || 'No recent notes'}"`,
      potentialOpportunity: `Strong commercial opportunity for Shiv Power Solution products (DG Set, Solar, or UPS) matching their industrial capacity.`,
      risksOrMissingInfo: lead.notes?.toLowerCase().includes('budget')
        ? 'Budget discussed but pending formal signoff.'
        : 'Specific site readiness date and budget allocation need verification during next contact.',
      recommendedNextStep:
        lead.status === 'Proposal Sent'
          ? 'Initiate follow-up call to review commercial terms and address technical queries.'
          : lead.status === 'Qualified'
          ? 'Prepare customized Shiv Power Solution technical proposal with equipment specifications.'
          : 'Schedule introductory discovery call to confirm scope and load requirements.',
    };
  }

  /**
   * Feature: Suggest Next Action
   */
  async generateNextAction(
    lead: Lead
  ): Promise<{ action: string; channel: string; reason: string; timing: string }> {
    const prompt = `Analyze this Shiv Power Solution lead and recommend the Next Best Action:
Company: ${lead.company_name}
Status: ${lead.status}
Score: ${lead.lead_score}
Requirement: ${lead.requirement}
Notes: ${lead.notes || 'None'}

Provide:
Action (e.g. Schedule Call, Send WhatsApp Specs, Prepare Proposal, Site Survey)
Channel (Call | WhatsApp | Email | Meeting)
Reason (based on CRM facts)
Timing (e.g., Within 24 hours, Tomorrow morning)`;

    const res = await this.callGemini(prompt, SYSTEM_PROMPT);
    if (res.text && res.text.length > 20) {
      return {
        action: `Recommended Action: ${res.text.split('\n')[0].replace(/^Action:\s*/i, '')}`,
        channel: lead.phone ? 'Phone Call / WhatsApp' : 'Email',
        reason: res.text,
        timing: lead.lead_score >= 80 ? 'Within 24 Hours (High Priority)' : 'Within 48 Hours',
      };
    }

    // Fallback logic
    if (lead.status === 'Proposal Sent') {
      return {
        action: 'Schedule Proposal Review Call',
        channel: 'Phone Call',
        reason: `Lead has received the quotation. A structured review call helps clarify DG/Solar specs, warranty terms, and address price concerns directly.`,
        timing: 'Within 24 hours',
      };
    } else if (lead.status === 'Qualified') {
      return {
        action: 'Draft & Send Technical Sizing Proposal',
        channel: 'Email & WhatsApp',
        reason: `Requirements are validated. Providing equipment spec sheets (CPCB IV+ compliant) establishes technical authority.`,
        timing: 'Within 24 hours',
      };
    } else if (lead.status === 'Negotiation') {
      return {
        action: 'Executive Negotiation Meeting',
        channel: 'Meeting / In-person Visit',
        reason: `Lead is in late stage. Offer payment terms or AMC bundled service to close the contract.`,
        timing: 'Today or Tomorrow Morning',
      };
    } else {
      return {
        action: 'Direct Qualification Call',
        channel: 'Phone Call',
        reason: `Verify power load requirements (kVA rating), site location, and decision timeline.`,
        timing: 'Within 4 hours',
      };
    }
  }

  /**
   * Feature: Sales Call Preparation
   */
  async prepareSalesCall(lead: Lead): Promise<CallPrepResult> {
    const prompt = `Prepare a sales executive for an upcoming sales call with this Shiv Power Solution lead:
Company: ${lead.company_name}
Contact: ${lead.contact_person} (${lead.phone})
Location: ${lead.location}
Industry: ${lead.industry}
Requirement: ${lead.requirement}
Status: ${lead.status}
Notes: ${lead.notes}

Return strictly a JSON object:
{
  "companyOverview": "Brief factual summary",
  "knownRequirement": "Equipment / power solution requested",
  "previousInteractions": ["bullet points"],
  "questionsToAsk": ["3-4 technical & commercial questions"],
  "possibleObjections": ["2-3 anticipated objections like price or timeline"],
  "suggestedTalkingPoints": ["3 points highlighting Shiv Power Solution strengths, CPCB IV+ compliance, OEM warranty, rapid service"],
  "recommendedNextStep": "Post-call goal"
}
Plain JSON only. No markdown formatting.`;

    const res = await this.callGemini(prompt, SYSTEM_PROMPT);
    if (res.text) {
      try {
        const clean = res.text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(clean) as CallPrepResult;
      } catch {
        // fallback
      }
    }

    return {
      companyOverview: `${lead.company_name} is an enterprise in ${lead.location || 'the NCR/North India region'} operating in ${lead.industry || 'industrial sector'}.`,
      knownRequirement: lead.requirement,
      previousInteractions: [
        `Lead source: ${lead.lead_source}`,
        `Current pipeline status: ${lead.status}`,
        `CRM record notes: "${lead.notes || 'No prior notes logged'}"`,
      ],
      questionsToAsk: [
        `"What is your total sanctioned electrical load and expected peak running load?"`,
        `"Are you looking for an AMF (Auto Mains Failure) panel or manual changeover for this installation?"`,
        `"What is your target delivery and commissioning deadline at the site?"`,
        `"Do you have existing DG sets or solar systems on-site that require synchronization?"`,
      ],
      possibleObjections: [
        `Price comparison with unorganized DG set assemblers.`,
        `Discussions on CPCB IV+ emission compliance norms and diesel consumption figures.`,
        `Requests for extended credit or payment milestone terms.`,
      ],
      suggestedTalkingPoints: [
        `Shiv Power Solution provides genuine OEM equipment with full manufacturer warranties.`,
        `CPCB IV+ compliant silent DG sets ensure legal adherence and 10-15% lower fuel consumption.`,
        `Dedicated 24/7 technical breakdown support team with guaranteed 4-hour response time in your region.`,
        `Turnkey installation covering civil foundation, exhaust piping, earthing, and electrical approvals.`,
      ],
      recommendedNextStep: `Confirm technical sizing parameters and commit to delivering an itemized official quotation within 24 hours.`,
    };
  }

  /**
   * Feature: Follow-up Message Generator (WhatsApp / Email / SMS)
   */
  async generateFollowupMessage(req: FollowupDraftRequest): Promise<FollowupDraftResult> {
    const { lead, channel, tone, purpose, customNotes } = req;
    const prompt = `Draft a professional ${channel} follow-up message for a sales executive at "Shiv Power Solution":
Target Lead: ${lead.company_name}
Contact Person: ${lead.contact_person}
Requirement: ${lead.requirement}
Current Status: ${lead.status}
Purpose: ${purpose}
Tone: ${tone}
Additional Notes: ${customNotes || 'None'}

Guidelines:
- If WhatsApp: Keep it formatted with clean WhatsApp styling (*bold*, bullet points), concise, friendly yet professional, include a clear call-to-action.
- If Email: Include a Subject line and an Email Body.
- If SMS: Keep it within 160 characters, concise and punchy.
- Mention Shiv Power Solution respectfully.
- Output strictly in this format:
SUBJECT: [Only if Email, otherwise None]
BODY:
[Message text]`;

    const res = await this.callGemini(prompt, SYSTEM_PROMPT);
    if (res.text) {
      let subject = '';
      let body = res.text;

      if (res.text.includes('SUBJECT:') && res.text.includes('BODY:')) {
        const parts = res.text.split('BODY:');
        subject = parts[0].replace('SUBJECT:', '').trim();
        body = parts[1].trim();
      }

      return {
        channel,
        tone,
        subject: channel === 'Email' ? subject || `Shiv Power Solution - Update on ${lead.requirement}` : undefined,
        body,
        leadName: lead.company_name,
        purpose,
      };
    }

    // Fallback template
    if (channel === 'WhatsApp') {
      const whatsappMsg = `Dear *${lead.contact_person}*,

Greetings from *Shiv Power Solution*! ⚡

I am following up regarding your requirement for *${lead.requirement}*. We wanted to check if you had an opportunity to review the details we discussed.

Our engineering team has prepared the equipment specifications and can answer any technical questions regarding installation, CPCB IV+ compliance, and delivery timelines.

Would you be available for a brief 5-minute call today at your convenience?

Warm regards,
*Sales Team*
Shiv Power Solution`;

      return {
        channel,
        tone,
        body: whatsappMsg,
        leadName: lead.company_name,
        purpose,
      };
    } else if (channel === 'SMS') {
      return {
        channel,
        tone,
        body: `Dear ${lead.contact_person}, greetings from Shiv Power Solution. Following up on your ${lead.requirement.substring(0, 30)}... query. Please let us know when we can connect today.`,
        leadName: lead.company_name,
        purpose,
      };
    } else {
      return {
        channel,
        tone,
        subject: `Follow-up: Power Solution Requirement for ${lead.company_name} | Shiv Power Solution`,
        body: `Dear ${lead.contact_person},

I hope this email finds you well.

I am writing to follow up on our recent conversation regarding the ${lead.requirement} for ${lead.company_name}.

At Shiv Power Solution, we specialize in delivering high-reliability power systems tailored to your site specifications, complete with OEM warranties, turnkey installation, and 24/7 maintenance support.

Could you please let us know if you require any additional technical data sheets, single-line diagrams, or an updated commercial quote?

We would be pleased to schedule a short meeting or phone call this week to assist with your timeline.

Thank you for your time and consideration.

Best regards,

Sales & Engineering Team
Shiv Power Solution
Contact: +91 98111 00000 | sales@shivpower.com`,
        leadName: lead.company_name,
        purpose,
      };
    }
  }

  /**
   * Feature: Email Draft Generator
   */
  async generateEmailDraft(req: EmailDraftRequest): Promise<EmailDraftResult> {
    const { lead, emailType, tone = 'Professional', customNotes } = req;
    const prompt = `Write a high-converting ${tone} business sales email for Shiv Power Solution:
Email Type: ${emailType}
Lead Company: ${lead.company_name}
Contact: ${lead.contact_person} (${lead.email || 'Email'})
Requirement: ${lead.requirement}
Status: ${lead.status}
Score: ${lead.lead_score}
Custom Notes: ${customNotes || 'None'}

Format your answer strictly as:
SUBJECT: [Subject line]
BODY:
[Email content]`;

    const res = await this.callGemini(prompt, SYSTEM_PROMPT);
    if (res.text && res.text.includes('SUBJECT:')) {
      const parts = res.text.split('BODY:');
      const subject = parts[0].replace('SUBJECT:', '').trim();
      const body = parts[1] ? parts[1].trim() : res.text;
      return {
        emailType,
        subject,
        body,
        leadName: lead.company_name,
      };
    }

    // Default structured template
    return {
      emailType,
      subject: `${emailType}: ${lead.requirement} for ${lead.company_name} — Shiv Power Solution`,
      body: `Dear ${lead.contact_person},

Greetings from Shiv Power Solution!

We are pleased to connect regarding ${lead.company_name}'s requirements for ${lead.requirement}.

As an established provider of industrial power systems, Shiv Power Solution offers:
• Heavy-duty CPCB IV+ compliant Silent Diesel Generators
• High-efficiency Rooftop Solar Power Installations
• Modular Online 3-Phase UPS and Energy Storage
• Complete Turnkey Electrical Engineering & AMC Services

We would welcome the opportunity to discuss your technical parameters and present a tailored, cost-effective solution.

Please let us know your availability for a brief discussion this week.

Sincerely,

Sales Department
Shiv Power Solution`,
      leadName: lead.company_name,
    };
  }

  /**
   * Feature: Objection Handling
   */
  async handleSalesObjection(req: ObjectionHandlerRequest): Promise<ObjectionHandlerResult> {
    const { objection, lead, productContext } = req;
    const prompt = `You are an expert sales coach for Shiv Power Solution (industrial DG sets, solar systems, UPS, transformers).
A sales executive faced this customer objection:
Objection: "${objection}"
Lead Context: ${lead ? `${lead.company_name} (Requirement: ${lead.requirement})` : 'General customer'}
Product Context: ${productContext || 'Industrial power equipment'}

Provide a respectful, value-focused, and non-manipulative sales response.
Output strictly as JSON:
{
  "objection": "${objection}",
  "suggestedResponse": "Word-for-word spoken response for the sales executive",
  "keyTalkingPoints": ["Point 1", "Point 2", "Point 3"],
  "recommendedFollowupQuestion": "A collaborative question to keep the dialogue constructive",
  "alternativeStrategy": "Tactical fallback option"
}
Plain JSON only.`;

    const res = await this.callGemini(prompt, SYSTEM_PROMPT);
    if (res.text) {
      try {
        const clean = res.text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(clean) as ObjectionHandlerResult;
      } catch {
        // fallback
      }
    }

    // Fallback response for common objections
    const objLower = objection.toLowerCase();
    if (objLower.includes('price') || objLower.includes('expensive') || objLower.includes('high')) {
      return {
        objection,
        suggestedResponse: `"I completely understand your concern about budget, ${lead ? lead.contact_person : 'Sir'}. When comparing upfront prices, it's important to look at the Total Cost of Ownership. Our systems feature CPCB IV+ compliant engines that reduce diesel consumption by up to 12% and come with full OEM-backed warranties, saving you significant operational expenses over the equipment's lifespan. May I show you a 3-year running cost comparison?"`,
        keyTalkingPoints: [
          'CPCB IV+ certified equipment with lower fuel consumption',
          'Genuine OEM components with manufacturer warranty',
          'Turnkey scope includes standard testing, cabling, and safety certifications',
        ],
        recommendedFollowupQuestion: `"What specific equipment capacity or price benchmark are you comparing against so we can align our specifications?"`,
        alternativeStrategy: 'Offer a phased payment schedule or discuss alternative engine configurations (e.g., standard vs premium AMF panel).',
      };
    } else if (objLower.includes('supplier') || objLower.includes('already have')) {
      return {
        objection,
        suggestedResponse: `"We respect that you have an existing vendor in place, and we certainly don't ask you to disrupt that relationship today. Many of our largest clients keep Shiv Power Solution as an approved secondary vendor for urgent breakdown support, specialized AMC, or rapid equipment delivery when their primary vendor faces stock delays. Would you be open to receiving our catalog so you have a verified backup when needed?"`,
        keyTalkingPoints: [
          'Zero risk secondary vendor arrangement',
          'Guaranteed SLA for emergency parts & service',
          'Opportunity to compare technical capabilities without immediate obligation',
        ],
        recommendedFollowupQuestion: `"When does your current maintenance contract or equipment warranty come up for renewal?"`,
        alternativeStrategy: 'Share a case study of a similar facility where Shiv Power Solution delivered emergency backup.',
      };
    } else {
      return {
        objection,
        suggestedResponse: `"I appreciate you sharing that feedback, ${lead ? lead.contact_person : 'Sir'}. Our priority at Shiv Power Solution is ensuring your facility receives reliable, uninterrupted power tailored to your operational schedule without any hidden costs. Let's address your key requirements first so you have all the facts to evaluate."`,
        keyTalkingPoints: [
          'Engineering reliability and local service coverage',
          'Transparent scope of delivery without hidden extra charges',
          'Flexibility to adapt to customer timelines',
        ],
        recommendedFollowupQuestion: `"What is the primary factor that would make this decision easier for your team?"`,
        alternativeStrategy: 'Offer to send a comprehensive technical specification sheet for their engineering team to review.',
      };
    }
  }

  /**
   * Feature: Smart CRM Dashboard Insights
   */
  async getSmartCRMInsights(): Promise<AICRMInsight[]> {
    const [leadsRes, custsRes, fupRes, tasksRes] = await Promise.all([
      leadsService.getLeads(),
      customersService.getCustomers(),
      followupsService.getFollowups(),
      tasksService.getTasks(),
    ]);

    const leads = leadsRes.leads || [];
    const followups = fupRes.followups || [];
    const insights: AICRMInsight[] = [];

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // 1. Overdue follow-ups
    const overdue = followups.filter(
      (f) => f.status === 'Pending' && new Date(f.followup_date) < new Date(todayStr)
    );
    if (overdue.length > 0) {
      const topOverdue = overdue[0];
      insights.push({
        id: 'ins-overdue',
        type: 'urgent_followup',
        title: `${overdue.length} Overdue Follow-up${overdue.length > 1 ? 's' : ''}`,
        description: `Follow-up for ${topOverdue.lead_name || 'prospect'} (${topOverdue.followup_type}) was due on ${topOverdue.followup_date}. Prompt outreach prevents leads from cooling off.`,
        leadId: topOverdue.lead_id || undefined,
        leadName: topOverdue.lead_name,
        severity: 'high',
        recommendedAction: 'Reschedule or Complete Overdue Follow-ups',
        actionType: 'schedule_followup',
      });
    }

    // 2. High-score leads without recent activity
    const hotLeads = leads
      .filter((l) => l.lead_score >= 80 && l.status !== 'Won' && l.status !== 'Lost')
      .sort((a, b) => b.lead_score - a.lead_score);

    if (hotLeads.length > 0) {
      const topHot = hotLeads[0];
      insights.push({
        id: `ins-hot-${topHot.id}`,
        type: 'hot_lead',
        title: `Priority Prospect: ${topHot.company_name}`,
        description: `Lead score is ${topHot.lead_score}/100 with requirement: "${topHot.requirement.substring(0, 60)}...". Currently in ${topHot.status} stage.`,
        leadId: topHot.id,
        leadName: topHot.company_name,
        severity: 'high',
        recommendedAction: 'Engage with Follow-up Message',
        actionType: 'generate_message',
      });
    }

    // 3. Leads in Proposal Sent or Negotiation ready for closing
    const lateStageLeads = leads.filter(
      (l) => l.status === 'Proposal Sent' || l.status === 'Negotiation'
    );
    if (lateStageLeads.length > 0) {
      const closingLead = lateStageLeads[0];
      insights.push({
        id: `ins-closing-${closingLead.id}`,
        type: 'opportunity',
        title: `Closing Opportunity: ${closingLead.company_name}`,
        description: `In ${closingLead.status} stage. Connect to finalize commercial terms, warranty scope, and delivery schedule.`,
        leadId: closingLead.id,
        leadName: closingLead.company_name,
        severity: 'medium',
        recommendedAction: 'Prepare for Sales Call',
        actionType: 'call_prep',
      });
    }

    // 4. Stuck in Contacted or New without qualification
    const stuckLeads = leads.filter((l) => l.status === 'New' || l.status === 'Contacted');
    if (stuckLeads.length >= 2) {
      insights.push({
        id: 'ins-stuck',
        type: 'stuck_stage',
        title: `${stuckLeads.length} Early-Stage Leads Awaiting Qualification`,
        description: `New inquiries need load requirement discovery to advance through the pipeline.`,
        severity: 'info',
        recommendedAction: 'Review Early Pipeline',
        actionType: 'view_lead',
      });
    }

    return insights;
  }
}

export const aiService = new AIService();
