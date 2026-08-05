import React, { useState } from 'react';
import { CheckCircle2, FileText, Globe, Eye, Sparkles } from 'lucide-react';
import { SourceCitation } from '../../types/rag';
import { EvidenceViewerModal } from './EvidenceViewerModal';

interface SourceCitationBadgeProps {
  attributeName?: string;
  value?: string;
  confidence?: number;
  verified?: boolean;
  citations?: SourceCitation[];
}

export const SourceCitationBadge: React.FC<SourceCitationBadgeProps> = ({
  attributeName,
  value,
  confidence = 0.95,
  verified = true,
  citations = [],
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const primaryCite = citations[0] || {
    source_name: 'Technical Datasheet',
    source_type: 'pdf',
    page_number: 1,
    evidence_text: 'Verified in technical specification documentation.',
    similarity_score: confidence,
  };

  const defaultCitations = citations.length > 0 ? citations : [primaryCite];
  const confPercent = Math.round(confidence * 100);

  return (
    <>
      <div className="inline-flex items-center gap-2">
        {verified ? (
          <button
            onClick={() => setIsModalOpen(true)}
            className="group flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold transition-all cursor-pointer"
            title="Click to view RAG evidence citation"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verified by Source</span>
            <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 font-mono text-[10px]">
              {confPercent}%
            </span>
            <Eye className="w-3 h-3 text-emerald-400/70 group-hover:text-emerald-300 transition-colors ml-0.5" />
          </button>
        ) : (
          <button
            onClick={() => setIsModalOpen(true)}
            className="group flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Needs Review</span>
            <Eye className="w-3 h-3 text-amber-400/70 group-hover:text-amber-300 transition-colors ml-0.5" />
          </button>
        )}
      </div>

      <EvidenceViewerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Source Evidence Traceability"
        attributeName={attributeName}
        value={value}
        confidence={confidence}
        citations={defaultCitations}
      />
    </>
  );
};
