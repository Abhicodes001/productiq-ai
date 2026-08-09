import React from 'react';
import { Layers, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, Database, Award } from 'lucide-react';
import { EnrichmentSummaryResponse } from '../../types/enrichment';

interface EnrichmentSummaryCardProps {
  summary: EnrichmentSummaryResponse;
}

export const EnrichmentSummaryCard: React.FC<EnrichmentSummaryCardProps> = ({ summary }) => {
  const pBreakdown = summary.source_priority_breakdown || { P1: 0, P2: 0, P3: 0, P4: 0, P5: 0 };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Multi-Agent Intelligence Summary</h3>
            <p className="text-xs text-slate-400">Spec completeness & source priority breakdown</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Completeness</span>
          <p className="text-xl font-bold font-mono text-red-400">
            {summary.overall_completeness_percent}%
          </p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
            <span>Extracted</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-100">{summary.extracted_count}</p>
          <span className="text-[10px] text-slate-500 font-mono">From PDF & Scrapes</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-red-400 font-semibold">
            <span>AI Enriched</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold font-mono text-red-400">{summary.ai_enriched_count}</p>
          <span className="text-[10px] text-slate-500 font-mono">Multi-Agent Grounded</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-amber-400 font-semibold">
            <span>Needs Review</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold font-mono text-amber-400">{summary.needs_review_count}</p>
          <span className="text-[10px] text-slate-500 font-mono">Unverified Specs</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-rose-400 font-semibold">
            <span>Missing</span>
            <Database className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold font-mono text-rose-400">{summary.missing_count}</p>
          <span className="text-[10px] text-slate-500 font-mono">Domain Schema Gap</span>
        </div>
      </div>

      {/* Source Priority Tier Breakdown */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Source Priority Tier Hierarchy Breakdown (P1 to P5)
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
            <span className="text-[10px] text-slate-400 block font-bold">P1: Tech Docs</span>
            <span className="text-sm font-bold text-emerald-400">{pBreakdown.P1 || 0} Specs</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
            <span className="text-[10px] text-slate-400 block font-bold">P2: Web Spec</span>
            <span className="text-sm font-bold text-red-400">{pBreakdown.P2 || 0} Specs</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
            <span className="text-[10px] text-slate-400 block font-bold">P3: Catalogs</span>
            <span className="text-sm font-bold text-purple-400">{pBreakdown.P3 || 0} Specs</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
            <span className="text-[10px] text-slate-400 block font-bold">P4: Distributor</span>
            <span className="text-sm font-bold text-amber-400">{pBreakdown.P4 || 0} Specs</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
            <span className="text-[10px] text-slate-400 block font-bold">P5: Other</span>
            <span className="text-sm font-bold text-slate-400">{pBreakdown.P5 || 0} Specs</span>
          </div>
        </div>
      </div>
    </div>
  );
};
