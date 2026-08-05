import React from 'react';
import { CheckCircle2, Sparkles, AlertTriangle, XCircle, ShieldCheck } from 'lucide-react';

interface EnrichmentBadgeProps {
  status: 'extracted' | 'ai_enriched' | 'needs_review' | 'not_found' | string;
  sourcePriority?: number;
  confidence?: number;
  onClick?: () => void;
}

export const EnrichmentBadge: React.FC<EnrichmentBadgeProps> = ({
  status,
  sourcePriority = 1,
  confidence,
  onClick,
}) => {
  const normStatus = (status || '').toLowerCase();

  let badgeElement = null;

  if (normStatus === 'extracted' || normStatus === 'verified') {
    badgeElement = (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>✓ Extracted</span>
      </span>
    );
  } else if (normStatus === 'ai_enriched' || normStatus === 'enriched') {
    badgeElement = (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold shadow-sm shadow-cyan-500/10">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
        <span>✨ AI Enriched</span>
        <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 font-mono text-[10px]">
          P{sourcePriority}
        </span>
      </span>
    );
  } else if (normStatus === 'needs_review') {
    badgeElement = (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
        <AlertTriangle className="w-3.5 h-3.5" />
        <span>⚠ Needs Review</span>
      </span>
    );
  } else {
    badgeElement = (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
        <XCircle className="w-3.5 h-3.5" />
        <span>❌ Not Found</span>
      </span>
    );
  }

  return (
    <div
      onClick={onClick}
      className={onClick ? 'cursor-pointer hover:opacity-85 transition-opacity' : ''}
    >
      {badgeElement}
    </div>
  );
};
