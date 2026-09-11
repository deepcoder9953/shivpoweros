import { supabase, isSupabaseConfigured } from './supabase';
import {
  Quotation,
  QuotationFormData,
  QuotationItem,
  QuotationItemFormData,
  QuotationStatus,
} from '../types/quotation';
import { activitiesService } from './activitiesService';

// Seed sample quotations conforming strictly to DB schema
let localQuotations: Quotation[] = [
  {
    id: 'quote-1',
    quotation_number: 'SPS-2026-0001',
    customer_id: 'cust-1',
    lead_id: 'lead-1',
    project_id: 'proj-2',
    title: '250 kVA Silent CPCB IV+ DG Set Installation',
    description: 'Turnkey supply, testing & commissioning of Cummins 250 kVA Silent Generator Set with AMF Control Panel.',
    amount: 1850000.0,
    tax: 333000.0, // 18% GST
    total: 2183000.0,
    status: 'sent',
    valid_until: new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    customer_name: 'Apex Healthcare Super Speciality',
    customer: {
      id: 'cust-1',
      company_name: 'Apex Healthcare Super Speciality',
      contact_person: 'Dr. Rakesh Verma',
      phone: '+91 98210 44521',
      email: 'purchase@apexhealth.in',
      address: 'Plot 4, Institutional Area, Sector 62, Noida, UP 201309',
      location: 'Sector 62, Noida, UP',
      gst_number: '07AAACA1122B1Z1',
    },
    lead: {
      id: 'lead-1',
      company_name: 'Apex Healthcare Super Speciality',
      contact_person: 'Dr. Rakesh Verma',
      phone: '+91 98210 44521',
      email: 'purchase@apexhealth.in',
      source: 'Google Ads',
      status: 'Qualified',
    },
    project: {
      id: 'proj-2',
      project_name: '250 kVA Silent DG Set Commissioning & AMF Sync',
      status: 'Planning',
    },
    subtotal: 1850000.0,
    items: [
      {
        id: 'qitem-1',
        quotation_id: 'quote-1',
        item_name: '250 kVA Silent CPCB IV+ DG Set',
        description: 'Cummins QSL9-G5 engine with Stamford alternator, AMF panel, base fuel tank, acoustic canopy',
        quantity: 1,
        unit_price: 1650000.0,
        total: 1650000.0,
        unit: 'Set',
      },
      {
        id: 'qitem-2',
        quotation_id: 'quote-1',
        item_name: 'Installation, Testing & Commissioning',
        description: 'Civil foundation guidance, cabling up to 25m, exhaust piping & copper earthing pits',
        quantity: 1,
        unit_price: 200000.0,
        total: 200000.0,
        unit: 'Job',
      },
    ],
  },
  {
    id: 'quote-2',
    quotation_number: 'SPS-2026-0002',
    customer_id: 'cust-2',
    lead_id: 'lead-2',
    project_id: 'proj-1',
    title: '500 kW Rooftop Solar Power Plant EPC',
    description: 'Turnkey EPC solar plant with Tier-1 Mono PERC half-cut modules, grid-tie string inverters, and net-metering liaison.',
    amount: 22500000.0,
    tax: 2700000.0, // 12% GST
    total: 25200000.0,
    status: 'accepted',
    valid_until: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    customer_name: 'Shree Balaji Textile Mills',
    customer: {
      id: 'cust-2',
      company_name: 'Shree Balaji Textile Mills',
      contact_person: 'Anil Agarwal',
      phone: '+91 94140 33219',
      email: 'anil@balajitex.com',
      address: 'RIICO Industrial Area, Phase 3, Bhiwadi, Rajasthan 301019',
      location: 'Bhiwadi Industrial Area, Rajasthan',
      gst_number: '08BBBCA4455C1Z9',
    },
    lead: {
      id: 'lead-2',
      company_name: 'Shree Balaji Textile Mills',
      contact_person: 'Anil Agarwal',
      phone: '+91 94140 33219',
      email: 'anil@balajitex.com',
      source: 'Website',
      status: 'Won',
    },
    project: {
      id: 'proj-1',
      project_name: '500 kW Rooftop Solar Power Plant Installation',
      status: 'In Progress',
    },
    subtotal: 22500000.0,
    items: [
      {
        id: 'qitem-3',
        quotation_id: 'quote-2',
        item_name: '550 Wp Tier-1 Mono PERC Half-Cut Solar Modules',
        description: 'High-efficiency solar PV modules with 25-year performance warranty',
        quantity: 910,
        unit_price: 16500.0,
        total: 15015000.0,
        unit: 'Nos',
      },
      {
        id: 'qitem-4',
        quotation_id: 'quote-2',
        item_name: '100 kW 3-Phase Grid-Tie String Inverters',
        description: 'Multi-MPPT solar inverters with built-in DC disconnect & remote cloud monitoring',
        quantity: 5,
        unit_price: 340000.0,
        total: 1700000.0,
        unit: 'Nos',
      },
      {
        id: 'qitem-5',
        quotation_id: 'quote-2',
        item_name: 'Galvanized HDG Module Mounting Structures & Balance of System',
        description: 'Anodized aluminum clamps, DC cables, AC combiners, lightning arrestors & earth grid',
        quantity: 1,
        unit_price: 5785000.0,
        total: 5785000.0,
        unit: 'Set',
      },
    ],
  },
  {
    id: 'quote-3',
    quotation_number: 'SPS-2026-0003',
    customer_id: 'cust-1',
    lead_id: 'lead-1',
    project_id: null,
    title: 'Comprehensive Annual Maintenance Contract (AMC)',
    description: '24x7 Comprehensive AMC for 250 kVA DG set including scheduled preventive visits, lube & filter replacements, and breakdown visits.',
    amount: 120000.0,
    tax: 21600.0, // 18% GST
    total: 141600.0,
    status: 'negotiation',
    valid_until: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    customer_name: 'Apex Healthcare Super Speciality',
    customer: {
      id: 'cust-1',
      company_name: 'Apex Healthcare Super Speciality',
      contact_person: 'Dr. Rakesh Verma',
      phone: '+91 98210 44521',
      email: 'purchase@apexhealth.in',
      address: 'Plot 4, Institutional Area, Sector 62, Noida, UP 201309',
    },
    subtotal: 120000.0,
    items: [
      {
        id: 'qitem-6',
        quotation_id: 'quote-3',
        item_name: 'Annual Maintenance Service (4 Scheduled Services)',
        description: 'Complete inspection of cooling, fuel, battery, governor, and safety shutdowns',
        quantity: 1,
        unit_price: 70000.0,
        total: 70000.0,
        unit: 'Year',
      },
      {
        id: 'qitem-7',
        quotation_id: 'quote-3',
        item_name: 'Consumables Kit (Fleetguard Filters & Valvoline Oil)',
        description: 'Lube filters, fuel filters, bypass filter, and 15W40 CI4+ engine oil top-up',
        quantity: 1,
        unit_price: 50000.0,
        total: 50000.0,
        unit: 'Kit',
      },
    ],
  },
  {
    id: 'quote-4',
    quotation_number: 'SPS-2026-0004',
    customer_id: 'cust-2',
    lead_id: null,
    project_id: null,
    title: '100 kVA Online Modular 3-Phase UPS System',
    description: 'High-frequency double conversion online UPS with 30 min LiFePO4 battery rack for critical loom automated drive systems.',
    amount: 850000.0,
    tax: 153000.0, // 18% GST
    total: 1003000.0,
    status: 'draft',
    valid_until: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    customer_name: 'Shree Balaji Textile Mills',
    customer: {
      id: 'cust-2',
      company_name: 'Shree Balaji Textile Mills',
      contact_person: 'Anil Agarwal',
      phone: '+91 94140 33219',
      email: 'anil@balajitex.com',
      address: 'RIICO Industrial Area, Phase 3, Bhiwadi, Rajasthan 301019',
    },
    subtotal: 850000.0,
    items: [
      {
        id: 'qitem-8',
        quotation_id: 'quote-4',
        item_name: '100 kVA Modular 3-Phase Online UPS',
        description: 'Unity power factor (kVA = kW), touchscreen display, SNMP card for remote telemetry',
        quantity: 1,
        unit_price: 550000.0,
        total: 550000.0,
        unit: 'Nos',
      },
      {
        id: 'qitem-9',
        quotation_id: 'quote-4',
        item_name: 'LiFePO4 51.2V 200Ah High-C Battery Bank with Rack',
        description: 'Integrated BMS, cycle life > 4000 cycles, 5-year replacement warranty',
        quantity: 1,
        unit_price: 300000.0,
        total: 300000.0,
        unit: 'Bank',
      },
    ],
  },
];

let localQuotationItems: QuotationItem[] = [];
// Populate initial line items
localQuotations.forEach((q) => {
  if (q.items) {
    localQuotationItems.push(...q.items);
  }
});

function normalizeQuotation(row: Record<string, any>): Quotation {
  const amountVal = Number(row.amount !== undefined ? row.amount : (row.subtotal || 0));
  const taxVal = Number(row.tax || 0);
  const totalVal = Number(row.total !== undefined ? row.total : (amountVal + taxVal));
  const validUntilVal = row.valid_until || row.validity_date || null;
  const statusVal = ((row.status || 'draft') as string).toLowerCase() as QuotationStatus;

  return {
    id: String(row.id || crypto.randomUUID()),
    quotation_number: row.quotation_number || `SPS-2026-${Date.now().toString().slice(-4)}`,
    customer_id: row.customer_id,
    lead_id: row.lead_id || null,
    project_id: row.project_id || null,
    title: row.title || 'Quotation for Power Equipment',
    description: row.description || row.notes || '',
    amount: amountVal,
    tax: taxVal,
    total: totalVal,
    status: statusVal,
    valid_until: validUntilVal,
    created_at: row.created_at || new Date().toISOString(),
    updated_at: row.updated_at || new Date().toISOString(),

    // Joined relational data & display helpers
    customer_name: row.customer?.company_name || row.customer_name || 'Client Account',
    customer: row.customer || null,
    lead: row.lead || null,
    project: row.project || null,
    items: row.quotation_items ? row.quotation_items.map(normalizeQuotationItem) : undefined,

    // Backward compatibility
    subtotal: amountVal,
    discount: Number(row.discount || 0),
    notes: row.description || row.notes || '',
    validity_date: validUntilVal,
    quotation_date: row.quotation_date || (row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
    created_by: row.created_by || 'Staff',
  };
}

function normalizeQuotationItem(row: Record<string, any>): QuotationItem {
  const qty = Number(row.quantity || 1);
  const unitPrice = Number(row.unit_price || 0);
  const total = Number(row.total !== undefined ? row.total : (qty * unitPrice));

  return {
    id: String(row.id || crypto.randomUUID()),
    quotation_id: row.quotation_id,
    item_name: row.item_name || 'Standard Equipment',
    description: row.description || null,
    quantity: qty,
    unit_price: unitPrice,
    total,
    unit: row.unit || 'Nos',
    discount: Number(row.discount || 0),
    tax: Number(row.tax || 0),
    created_at: row.created_at || new Date().toISOString(),
  };
}

export const quotationsService = {
  /**
   * Fetch all quotations with full joined relational data
   */
  async getQuotations(): Promise<{ quotations: Quotation[]; isLive: boolean; error?: string }> {
    if (!isSupabaseConfigured) {
      return { quotations: [...localQuotations], isLive: false };
    }

    try {
      const { data, error } = await supabase
        .from('quotations')
        .select(`
          *,
          customer:customers(id, company_name, contact_person, phone, email, address, location, gst_number),
          lead:leads(id, company_name, contact_person, phone, email, source, status),
          project:projects(id, project_name, status),
          quotation_items(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase getQuotations error, using local fallback:', error.message);
        return { quotations: [...localQuotations], isLive: false, error: error.message };
      }

      if (data) {
        const normalized = data.map(normalizeQuotation);
        localQuotations = normalized;
        return { quotations: normalized, isLive: true };
      }

      return { quotations: [...localQuotations], isLive: true };
    } catch (err: any) {
      console.error('Failed to fetch quotations:', err);
      return { quotations: [...localQuotations], isLive: false, error: err?.message };
    }
  },

  /**
   * Fetch a single quotation with its line items
   */
  async getQuotationById(id: string): Promise<{ quotation: Quotation | null; error?: string }> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('quotations')
          .select(`
            *,
            customer:customers(id, company_name, contact_person, phone, email, address, location, gst_number),
            lead:leads(id, company_name, contact_person, phone, email, source, status),
            project:projects(id, project_name, status),
            quotation_items(*)
          `)
          .eq('id', id)
          .single();

        if (error) {
          console.warn('Error fetching quotation by ID:', error.message);
        } else if (data) {
          return { quotation: normalizeQuotation(data) };
        }
      } catch (err: any) {
        console.warn('Error fetching quotation by ID from Supabase:', err);
      }
    }

    const found = localQuotations.find((q) => q.id === id) || null;
    return { quotation: found };
  },

  /**
   * Fetch all quotations for a specific customer
   */
  async getQuotationsByCustomer(customerId: string): Promise<{ quotations: Quotation[]; error?: string }> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('quotations')
          .select(`
            *,
            customer:customers(id, company_name, contact_person, phone, email, address, location, gst_number),
            lead:leads(id, company_name, contact_person, phone, email, source, status),
            project:projects(id, project_name, status),
            quotation_items(*)
          `)
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          return { quotations: data.map(normalizeQuotation) };
        }
      } catch (err: any) {
        console.warn('Error fetching customer quotations:', err);
      }
    }

    const filtered = localQuotations.filter((q) => q.customer_id === customerId);
    return { quotations: filtered };
  },

  /**
   * Fetch all quotations for a specific lead
   */
  async getQuotationsByLead(leadId: string): Promise<{ quotations: Quotation[]; error?: string }> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('quotations')
          .select(`
            *,
            customer:customers(id, company_name, contact_person, phone, email, address, location, gst_number),
            lead:leads(id, company_name, contact_person, phone, email, source, status),
            project:projects(id, project_name, status),
            quotation_items(*)
          `)
          .eq('lead_id', leadId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          return { quotations: data.map(normalizeQuotation) };
        }
      } catch (err: any) {
        console.warn('Error fetching lead quotations:', err);
      }
    }

    const filtered = localQuotations.filter((q) => q.lead_id === leadId);
    return { quotations: filtered };
  },

  /**
   * Check if a quotation number is already taken
   */
  async isQuotationNumberUnique(quotationNumber: string, excludeId?: string): Promise<boolean> {
    const trimmed = quotationNumber.trim().toUpperCase();
    if (!trimmed) return false;

    // Check local
    const foundLocal = localQuotations.find(
      (q) => q.quotation_number.trim().toUpperCase() === trimmed && q.id !== excludeId
    );
    if (foundLocal) return false;

    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('quotations').select('id').ilike('quotation_number', trimmed);
        if (excludeId) {
          query = query.neq('id', excludeId);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return false;
        }
      } catch (err) {
        console.warn('Uniqueness check error in Supabase:', err);
      }
    }

    return true;
  },

  /**
   * Automatically generate the next unique quotation number
   * Format: SPS-2026-0001, SPS-2026-0002...
   */
  async generateNextQuotationNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `SPS-${year}-`;

    let maxNum = 0;
    localQuotations.forEach((q) => {
      if (q.quotation_number && q.quotation_number.startsWith(prefix)) {
        const parts = q.quotation_number.split('-');
        const parsed = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(parsed) && parsed > maxNum) {
          maxNum = parsed;
        }
      }
    });

    if (isSupabaseConfigured) {
      try {
        const { data } = await supabase
          .from('quotations')
          .select('quotation_number')
          .ilike('quotation_number', `${prefix}%`)
          .order('quotation_number', { ascending: false })
          .limit(20);

        if (data && data.length > 0) {
          data.forEach((row: any) => {
            if (row.quotation_number) {
              const parts = row.quotation_number.split('-');
              const parsed = parseInt(parts[parts.length - 1], 10);
              if (!isNaN(parsed) && parsed > maxNum) {
                maxNum = parsed;
              }
            }
          });
        }
      } catch (err) {
        console.warn('Error finding max quotation number in Supabase:', err);
      }
    }

    const nextSeq = String(maxNum + 1).padStart(4, '0');
    return `${prefix}${nextSeq}`;
  },

  /**
   * Create a new quotation with line items
   */
  async createQuotation(data: QuotationFormData): Promise<{ quotation: Quotation; success: boolean; error?: string }> {
    if (!data.quotation_number?.trim()) {
      return { quotation: {} as Quotation, success: false, error: 'Quotation number is required.' };
    }
    if (!data.customer_id) {
      return { quotation: {} as Quotation, success: false, error: 'Customer is required.' };
    }
    if (!data.title?.trim()) {
      return { quotation: {} as Quotation, success: false, error: 'Quotation title is required.' };
    }
    if (!data.items || data.items.length === 0) {
      return { quotation: {} as Quotation, success: false, error: 'At least one quotation item is required.' };
    }

    const isUnique = await this.isQuotationNumberUnique(data.quotation_number);
    if (!isUnique) {
      return { quotation: {} as Quotation, success: false, error: `Quotation number "${data.quotation_number}" is already in use.` };
    }

    // Calculate subtotal from items
    let calculatedAmount = 0;
    const validatedItems: QuotationItem[] = [];
    const newQuotationId = crypto.randomUUID();
    const now = new Date().toISOString();

    data.items.forEach((item, index) => {
      const qty = Math.max(1, Number(item.quantity || 1));
      const price = Math.max(0, Number(item.unit_price || 0));
      const lineTotal = Number(item.total !== undefined ? item.total : (qty * price));
      calculatedAmount += lineTotal;

      validatedItems.push({
        id: item.id || crypto.randomUUID(),
        quotation_id: newQuotationId,
        item_name: item.item_name.trim() || `Item ${index + 1}`,
        description: item.description || null,
        quantity: qty,
        unit_price: price,
        total: lineTotal,
        unit: item.unit || 'Nos',
        created_at: now,
      });
    });

    const taxAmount = Math.max(0, Number(data.tax !== undefined ? data.tax : 0));
    const finalTotal = calculatedAmount + taxAmount;
    const normalizedStatus = ((data.status || 'draft') as string).toLowerCase() as QuotationStatus;

    const localRecord: Quotation = {
      id: newQuotationId,
      quotation_number: data.quotation_number.trim().toUpperCase(),
      customer_id: data.customer_id,
      lead_id: data.lead_id || null,
      project_id: data.project_id || null,
      title: data.title.trim(),
      description: data.description || null,
      amount: calculatedAmount,
      tax: taxAmount,
      total: finalTotal,
      status: normalizedStatus,
      valid_until: data.valid_until || null,
      created_at: now,
      updated_at: now,
      subtotal: calculatedAmount,
      items: validatedItems,
    };

    // Save to local memory
    localQuotations.unshift(localRecord);
    localQuotationItems.push(...validatedItems);

    // Save to Supabase if configured
    if (isSupabaseConfigured) {
      try {
        const payload: Record<string, any> = {
          id: newQuotationId,
          quotation_number: localRecord.quotation_number,
          customer_id: localRecord.customer_id,
          lead_id: localRecord.lead_id,
          project_id: localRecord.project_id,
          title: localRecord.title,
          description: localRecord.description,
          amount: calculatedAmount,
          subtotal: calculatedAmount, // fallback
          tax: taxAmount,
          total: finalTotal,
          status: normalizedStatus,
          valid_until: localRecord.valid_until,
          validity_date: localRecord.valid_until, // fallback
          created_at: now,
          updated_at: now,
        };

        const { data: inserted, error: insertError } = await supabase
          .from('quotations')
          .insert([payload])
          .select()
          .single();

        if (insertError) {
          console.warn('Supabase createQuotation error:', insertError.message);
        } else {
          // Insert items
          const itemPayloads = validatedItems.map((it) => ({
            id: it.id,
            quotation_id: newQuotationId,
            item_name: it.item_name,
            description: it.description,
            quantity: it.quantity,
            unit_price: it.unit_price,
            total: it.total,
            unit: it.unit || 'Nos',
            created_at: now,
          }));

          const { error: itemsError } = await supabase.from('quotation_items').insert(itemPayloads);
          if (itemsError) {
            console.warn('Supabase quotation_items insert warning:', itemsError.message);
          }
        }
      } catch (err: any) {
        console.error('Supabase write error during createQuotation:', err);
      }
    }

    // Log activity
    try {
      await activitiesService.createActivity({
        lead_id: localRecord.lead_id,
        customer_id: localRecord.customer_id,
        quotation_id: localRecord.id,
        project_id: localRecord.project_id,
        action: 'Quotation Created',
        description: `Created quotation ${localRecord.quotation_number} ("${localRecord.title}") for ₹${finalTotal.toLocaleString('en-IN')}`,
        performed_by: 'Staff',
      });
    } catch (e) {
      // Non-blocking
    }

    return { quotation: localRecord, success: true };
  },

  /**
   * Update quotation details and line items safely
   */
  async updateQuotation(
    id: string,
    updates: Partial<QuotationFormData>,
    items?: QuotationItemFormData[]
  ): Promise<{ quotation: Quotation | null; success: boolean; error?: string }> {
    const existingIndex = localQuotations.findIndex((q) => q.id === id);
    const existing = existingIndex !== -1 ? localQuotations[existingIndex] : null;

    if (!existing) {
      return { quotation: null, success: false, error: 'Quotation not found.' };
    }

    if (updates.quotation_number && updates.quotation_number.trim().toUpperCase() !== existing.quotation_number) {
      const isUnique = await this.isQuotationNumberUnique(updates.quotation_number, id);
      if (!isUnique) {
        return { quotation: null, success: false, error: `Quotation number "${updates.quotation_number}" is already used.` };
      }
    }

    const now = new Date().toISOString();

    // Recalculate items if provided
    let calculatedAmount = existing.amount;
    let finalItems: QuotationItem[] = existing.items || [];

    if (items && items.length > 0) {
      calculatedAmount = 0;
      finalItems = items.map((it, idx) => {
        const qty = Math.max(1, Number(it.quantity || 1));
        const price = Math.max(0, Number(it.unit_price || 0));
        const lineTotal = Number(it.total !== undefined ? it.total : (qty * price));
        calculatedAmount += lineTotal;

        return {
          id: it.id || crypto.randomUUID(),
          quotation_id: id,
          item_name: it.item_name.trim() || `Item ${idx + 1}`,
          description: it.description || null,
          quantity: qty,
          unit_price: price,
          total: lineTotal,
          unit: it.unit || 'Nos',
          created_at: now,
        };
      });
    }

    const finalTax = updates.tax !== undefined ? Number(updates.tax) : existing.tax;
    const finalTotal = calculatedAmount + finalTax;
    const finalStatus = updates.status
      ? ((updates.status as string).toLowerCase() as QuotationStatus)
      : existing.status;

    const updatedLocal: Quotation = {
      ...existing,
      ...updates,
      amount: calculatedAmount,
      subtotal: calculatedAmount,
      tax: finalTax,
      total: finalTotal,
      status: finalStatus,
      valid_until: updates.valid_until !== undefined ? updates.valid_until : existing.valid_until,
      items: finalItems,
      updated_at: now,
    };

    if (existingIndex !== -1) {
      localQuotations[existingIndex] = updatedLocal;
    }

    // Update line items in local cache
    localQuotationItems = localQuotationItems.filter((i) => i.quotation_id !== id);
    localQuotationItems.push(...finalItems);

    // Save to Supabase if configured
    if (isSupabaseConfigured) {
      try {
        const payload: Record<string, any> = {
          quotation_number: updatedLocal.quotation_number,
          customer_id: updatedLocal.customer_id,
          lead_id: updatedLocal.lead_id,
          project_id: updatedLocal.project_id,
          title: updatedLocal.title,
          description: updatedLocal.description,
          amount: calculatedAmount,
          subtotal: calculatedAmount,
          tax: finalTax,
          total: finalTotal,
          status: finalStatus,
          valid_until: updatedLocal.valid_until,
          validity_date: updatedLocal.valid_until,
          updated_at: now,
        };

        await supabase.from('quotations').update(payload).eq('id', id);

        // Synchronize items safely: delete old items and re-insert new items
        if (items && items.length > 0) {
          await supabase.from('quotation_items').delete().eq('quotation_id', id);
          const itemPayloads = finalItems.map((it) => ({
            id: it.id,
            quotation_id: id,
            item_name: it.item_name,
            description: it.description,
            quantity: it.quantity,
            unit_price: it.unit_price,
            total: it.total,
            unit: it.unit || 'Nos',
            created_at: now,
          }));
          await supabase.from('quotation_items').insert(itemPayloads);
        }
      } catch (err: any) {
        console.warn('Supabase updateQuotation error:', err);
      }
    }

    // Log activity
    try {
      await activitiesService.createActivity({
        lead_id: updatedLocal.lead_id,
        customer_id: updatedLocal.customer_id,
        quotation_id: updatedLocal.id,
        project_id: updatedLocal.project_id,
        action: 'Quotation Updated',
        description: `Updated quotation ${updatedLocal.quotation_number} - Status: ${updatedLocal.status}, Total: ₹${finalTotal.toLocaleString('en-IN')}`,
        performed_by: 'Staff',
      });
    } catch (e) {
      // Non-blocking
    }

    return { quotation: updatedLocal, success: true };
  },

  /**
   * Update quotation status only
   */
  async updateQuotationStatus(id: string, newStatus: QuotationStatus): Promise<{ success: boolean; quotation?: Quotation; error?: string }> {
    const norm = (newStatus as string).toLowerCase() as QuotationStatus;
    const existing = localQuotations.find((q) => q.id === id);
    if (!existing) {
      return { success: false, error: 'Quotation not found.' };
    }

    existing.status = norm;
    existing.updated_at = new Date().toISOString();

    if (isSupabaseConfigured) {
      try {
        await supabase.from('quotations').update({ status: norm, updated_at: existing.updated_at }).eq('id', id);
      } catch (err: any) {
        console.warn('Error updating quotation status in Supabase:', err);
      }
    }

    // Log activity for status change
    try {
      const friendlyStatus = norm.charAt(0).toUpperCase() + norm.slice(1);
      await activitiesService.createActivity({
        lead_id: existing.lead_id,
        customer_id: existing.customer_id,
        quotation_id: existing.id,
        project_id: existing.project_id,
        action: `Quotation ${friendlyStatus}`,
        description: `Quotation ${existing.quotation_number} changed to status: ${friendlyStatus}`,
        performed_by: 'Staff',
      });
    } catch (e) {
      // Non-blocking
    }

    return { success: true, quotation: existing };
  },

  /**
   * Alias for updateQuotationStatus
   */
  async updateStatus(id: string, newStatus: QuotationStatus): Promise<{ success: boolean; quotation?: Quotation; error?: string }> {
    return this.updateQuotationStatus(id, newStatus);
  },

  /**
   * Delete quotation and associated items
   */
  async deleteQuotation(id: string): Promise<{ success: boolean; error?: string }> {
    const existing = localQuotations.find((q) => q.id === id);
    localQuotations = localQuotations.filter((q) => q.id !== id);
    localQuotationItems = localQuotationItems.filter((i) => i.quotation_id !== id);

    if (isSupabaseConfigured) {
      try {
        // Delete items first to avoid foreign key constraints if CASCADE is not set
        await supabase.from('quotation_items').delete().eq('quotation_id', id);
        const { error } = await supabase.from('quotations').delete().eq('id', id);
        if (error) {
          return { success: false, error: error.message };
        }
      } catch (err: any) {
        return { success: false, error: err?.message };
      }
    }

    if (existing) {
      try {
        await activitiesService.createActivity({
          lead_id: existing.lead_id,
          customer_id: existing.customer_id,
          action: 'Quotation Deleted',
          description: `Deleted quotation ${existing.quotation_number} ("${existing.title}")`,
          performed_by: 'Staff',
        });
      } catch (e) {
        // Non-blocking
      }
    }

    return { success: true };
  },

  /**
   * Duplicate quotation: generates a new quotation with unique number, fresh IDs, status='draft'
   */
  async duplicateQuotation(sourceId: string): Promise<{ quotation: Quotation | null; success: boolean; error?: string }> {
    const { quotation: source } = await this.getQuotationById(sourceId);
    if (!source) {
      return { quotation: null, success: false, error: 'Source quotation not found.' };
    }

    const nextNumber = await this.generateNextQuotationNumber();

    // Validity: 30 days from now
    const validUntil = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

    const duplicateData: QuotationFormData = {
      quotation_number: nextNumber,
      customer_id: source.customer_id,
      lead_id: source.lead_id,
      project_id: null, // Reset project on duplicate
      title: `${source.title} (Copy)`,
      description: source.description,
      amount: source.amount,
      tax: source.tax,
      total: source.total,
      status: 'draft',
      valid_until: validUntil,
      items: (source.items || []).map((it) => ({
        item_name: it.item_name,
        description: it.description,
        quantity: it.quantity,
        unit_price: it.unit_price,
        total: it.total,
        unit: it.unit,
      })),
    };

    return this.createQuotation(duplicateData);
  },

  /**
   * Link an accepted quotation to an existing project
   */
  async linkToProject(quotationId: string, projectId: string): Promise<{ success: boolean; quotation?: Quotation; error?: string }> {
    const existing = localQuotations.find((q) => q.id === quotationId);
    if (existing) {
      existing.project_id = projectId;
      existing.updated_at = new Date().toISOString();
    }

    if (isSupabaseConfigured) {
      try {
        await supabase.from('quotations').update({ project_id: projectId }).eq('id', quotationId);
      } catch (err: any) {
        return { success: false, error: err?.message };
      }
    }

    try {
      await activitiesService.createActivity({
        lead_id: existing?.lead_id,
        customer_id: existing?.customer_id,
        quotation_id: quotationId,
        project_id: projectId,
        action: 'Quotation Linked to Project',
        description: `Linked quotation ${existing?.quotation_number} to project ID ${projectId}`,
        performed_by: 'Staff',
      });
    } catch (e) {
      // Non-blocking
    }

    return { success: true, quotation: existing };
  },

  // Line item helpers
  async getQuotationItems(quotationId: string): Promise<{ items: QuotationItem[]; error?: string }> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('quotation_items')
          .select('*')
          .eq('quotation_id', quotationId)
          .order('created_at', { ascending: true });

        if (!error && data) {
          return { items: data.map(normalizeQuotationItem) };
        }
      } catch (err: any) {
        console.warn('Error fetching quotation items:', err);
      }
    }

    const items = localQuotationItems.filter((i) => i.quotation_id === quotationId);
    return { items };
  },
};
