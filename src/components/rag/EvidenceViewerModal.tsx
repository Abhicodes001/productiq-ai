import React from 'react';
import { X, FileText, Globe, CheckCircle2, ExternalLink, Award, Sparkles } from 'lucide-react';
import { SourceCitation } from '../../types/rag';

interface EvidenceViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  attributeName?: string;
  value?: string;
  confidence?: number;
  citations: SourceCitation[];
}

export const EvidenceViewerModal: React.FC<EvidenceViewerModalProps> = ({
  isOpen,
  onClose,
  title,
  attributeName,
  value,
  confidence,
  citations,
}) => {
  if (!isOpen) return null;

  const confPercent = Math.round((confidence || 0.95) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
              <p className="text-xs text-slate-400">RAG Grounded Source Evidence Traceability</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {attributeName && (
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Attribute</span>
                <p className="text-base font-bold text-slate-100">{attributeName}</p>
              </div>
              {value && (
                <div className="text-right">
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Extracted Value</span>
                  <p className="text-base font-bold text-red-400">{value}</p>
                </div>
              )}
              <div className="text-right">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Confidence</span>
                <div className="flex items-center gap-1.5 justify-end">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-400">{confPercent}%</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Supporting Source Citations ({citations.length})
            </h4>

            {citations.length === 0 ? (
              <div className="p-6 text-center text-slate-400 bg-slate-800/30 rounded-xl border border-slate-800">
                No direct vector context evidence available for this attribute.
              </div>
            ) : (
              citations.map((cite, idx) => (
                <div 
                  key={idx} 
                  className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-colors space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-red-400 font-medium">
                      {cite.source_type === 'pdf' ? (
                        <FileText className="w-4 h-4 text-rose-400" />
                      ) : (
                        <Globe className="w-4 h-4 text-red-400" />
                      )}
                      <span>{cite.source_name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {cite.page_number && (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                          Page {cite.page_number}
                        </span>
                      )}
                      {cite.similarity_score !== undefined && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
                          {Math.round(cite.similarity_score * 100)}% Vector Match
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Evidence Text Box */}
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed relative">
                    <span className="text-slate-500 font-bold select-none mr-1">"</span>
                    {cite.evidence_text}
                    <span className="text-slate-500 font-bold select-none ml-1">"</span>
                  </div>

                  {cite.url && (
                    <a
                      href={cite.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-medium hover:underline pt-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open Source Location
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
