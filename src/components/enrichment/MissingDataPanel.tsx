import React from 'react';
import { AlertCircle, Sparkles, RefreshCw, ArrowRight, HelpCircle } from 'lucide-react';
import { MissingAttributeItem } from '../../types/enrichment';

interface MissingDataPanelProps {
  missingAttributes: MissingAttributeItem[];
  onEnrichMissing?: () => void;
  isEnriching?: boolean;
}

export const MissingDataPanel: React.FC<MissingDataPanelProps> = ({
  missingAttributes = [],
  onEnrichMissing,
  isEnriching = false,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Missing Technical Specifications</h3>
            <p className="text-xs text-slate-400">
              Identified by domain schema detector based on product category templates
            </p>
          </div>
        </div>

        {missingAttributes.length > 0 && onEnrichMissing && (
          <button
            onClick={onEnrichMissing}
            disabled={isEnriching}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-lg shadow-red-600/20 shrink-0"
          >
            <Sparkles className={`w-4 h-4 ${isEnriching ? 'animate-spin' : ''}`} />
            <span>{isEnriching ? 'Agents Enriching Specs...' : 'Enrich Missing Data'}</span>
          </button>
        )}
      </div>

      {/* Missing Items List */}
      {missingAttributes.length === 0 ? (
        <div className="p-6 text-center text-xs text-emerald-400 bg-emerald-500/10 rounded-xl border border-emerald-500/20 font-medium">
          ✓ All expected industrial domain specifications are fully present and enriched!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {missingAttributes.map((attr, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start justify-between gap-3 hover:border-slate-700 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-200">{attr.attribute_name}</span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase ${
                      attr.importance === 'critical'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : attr.importance === 'recommended'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {attr.importance}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{attr.reason}</p>
              </div>

              <span className="text-[11px] font-mono px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-500 shrink-0">
                ❌ Not Found
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
