import React, { useState } from 'react';
import {
  Zap,
  Activity,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Building2,
  Sparkles,
} from 'lucide-react';
import { Link } from '../../router/Router';

interface DeploymentItem {
  id: string;
  category: 'genset' | 'solar' | 'substation' | 'automation';
  title: string;
  client: string;
  location: string;
  status: 'In Execution' | 'Commissioned' | 'Active Telemetry';
  value: string;
  capacity: string;
  imageUrl: string;
  leadSource: string;
  telemetry: {
    health: string;
    runtime: string;
    load: string;
  };
}

const DEPLOYMENTS: DeploymentItem[] = [
  {
    id: 'proj-01',
    category: 'genset',
    title: '500 kVA Silent DG Industrial Installation',
    client: 'Apex Heavy Forge Pvt Ltd',
    location: 'Faridabad Industrial Area, NCR',
    status: 'Commissioned',
    value: '₹34,50,000',
    capacity: '500 kVA Dual DG Set',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80',
    leadSource: 'Enterprise Quotation approved',
    telemetry: {
      health: '99.98% Uptime',
      runtime: '1,420 hrs',
      load: '78% Optimal',
    },
  },
  {
    id: 'proj-02',
    category: 'solar',
    title: '1.2 MW Rooftop Captive Solar Microgrid',
    client: 'Zenith Logistics Hub',
    location: 'Greater Noida Warehouse Corridor',
    status: 'In Execution',
    value: '₹78,20,000',
    capacity: '1,200 kW Solar Array',
    imageUrl: 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=900&q=80',
    leadSource: 'AI Ingested Inquiry',
    telemetry: {
      health: 'Generating Clean Power',
      runtime: '890 MWh YTD',
      load: 'Grid Synchronized',
    },
  },
  {
    id: 'proj-03',
    category: 'substation',
    title: '33kV / 11kV Indoor Substation Automation',
    client: 'Metro Healthcare Hospital',
    location: 'Gurugram Sector 44',
    status: 'Active Telemetry',
    value: '₹52,00,000',
    capacity: '1600 kVA Transformer',
    imageUrl: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=900&q=80',
    leadSource: 'Direct Commercial Tender',
    telemetry: {
      health: 'Zero Outage SLA',
      runtime: '24/7 Monitored',
      load: '64% Continuous',
    },
  },
  {
    id: 'proj-04',
    category: 'automation',
    title: 'Real-Time SCADA & Fleet Power Control',
    client: 'Shiv Power Central Monitoring Lab',
    location: 'Delhi NCR Operations Hub',
    status: 'Active Telemetry',
    value: 'Cloud Connected',
    capacity: '48 Active Client Nodes',
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=900&q=80',
    leadSource: 'Supabase Live Stream',
    telemetry: {
      health: 'Instant AI Dispatch',
      runtime: 'Real-time sync',
      load: 'Sub-second latency',
    },
  },
];

export const LandingProjectShowcase: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredDeployments =
    activeCategory === 'all'
      ? DEPLOYMENTS
      : DEPLOYMENTS.filter((d) => d.category === activeCategory);

  return (
    <section
      id="deployments"
      className="py-20 border-b border-slate-200/60 dark:border-slate-800/60 relative overflow-hidden bg-white dark:bg-slate-950"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/70 text-emerald-700 dark:text-emerald-300 text-xs font-black uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span>Real-Time Power Deployments</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Powering Critical Industries Across India
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              From high-capacity diesel generators to automated solar microgrids and 33kV substations, Shiv Power Solution unifies project execution, client billing, and telemetry in one place.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'All Operations' },
              { id: 'genset', label: 'Heavy Gensets' },
              { id: 'solar', label: 'Solar EPC' },
              { id: 'substation', label: 'Substations' },
              { id: 'automation', label: 'SCADA Telemetry' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === tab.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Real-time Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredDeployments.map((item) => (
            <div
              key={item.id}
              className="group bg-slate-50/70 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
            >
              {/* Image Container with Live Status Badge */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Top Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/85 backdrop-blur-md text-[10px] font-bold text-white border border-white/10">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      item.status === 'Commissioned'
                        ? 'bg-emerald-400'
                        : item.status === 'Active Telemetry'
                        ? 'bg-cyan-400 animate-pulse'
                        : 'bg-amber-400'
                    }`}
                  />
                  <span>{item.status}</span>
                </div>

                {/* Capacity Pill bottom right */}
                <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-lg bg-blue-600/90 backdrop-blur-sm text-[10px] font-bold text-white shadow-xs">
                  {item.capacity}
                </div>

                {/* Location bottom left */}
                <div className="absolute bottom-3 left-3 text-white/90 text-[11px] font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="truncate max-w-[160px]">{item.location}</span>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                    <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                      <Building2 className="w-3 h-3 text-blue-500" />
                      {item.client}
                    </span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {item.value}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </h3>
                </div>

                {/* Telemetry Strip */}
                <div className="pt-2.5 border-t border-slate-200/60 dark:border-slate-800 grid grid-cols-2 gap-2 text-[10px]">
                  <div className="bg-white dark:bg-slate-950 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block font-medium">Telemetry</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate block mt-0.5">
                      {item.telemetry.health}
                    </span>
                  </div>
                  <div className="bg-white dark:bg-slate-950 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block font-medium">Performance</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate block mt-0.5">
                      {item.telemetry.load}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner linking into dashboard */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white leading-tight">
                Connect your power fleet & manage contracts in real time
              </h4>
              <p className="text-xs text-blue-100 mt-0.5">
                Full lifecycle tracking from RFQ and quotations to live site commissioning.
              </p>
            </div>
          </div>

          <Link
            href="/register"
            className="px-5 py-2.5 rounded-xl bg-white text-blue-700 font-bold text-xs sm:text-sm hover:bg-blue-50 transition-colors shadow-sm shrink-0 flex items-center gap-1.5"
          >
            <span>Explore Live Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
