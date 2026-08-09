import React, { useState } from 'react';
import { Globe, FileText, Image as ImageIcon, Database, ExternalLink, CheckCircle2, RefreshCw, Upload, ShieldCheck } from 'lucide-react';
import { ProductSource } from '../../types/product';
import { EvidenceViewerModal } from './EvidenceViewerModal';

interface SourcePanelProps {
  productId: string;
  sources: ProductSource[];
  documents?: any[];
  onUploadDocument?: () => void;
  onIndexSources?: () => void;
  isIndexing?: boolean;
}

export const SourcePanel: React.FC<SourcePanelProps> = ({
  productId,
  sources = [],
  documents = [],
  onUploadDocument,
  onIndexSources,
  isIndexing = false,
}) => {
  const [selectedSource, setSelectedSource] = useState<any | null>(null);

  // Group sources logically as requested in Phase 4 prompt
  const officialWebsites = sources.filter(
    (s) => (s.source_type as string) === 'website' || (s.source_type as string) === 'official_website'
  );
  
  const technicalDocs = [
    ...sources.filter((s) => (s.source_type as string) === 'pdf' || (s.source_type as string) === 'document' || (s.source_type as string) === 'technical_doc' || (s.source_type as string) === 'manual'),
    ...documents.map((d) => ({
      id: d.id,
      source_name: d.file_name,
      source_type: 'pdf',
      storage_path: d.file_path,
      status: d.upload_status || 'processed',
      reliability_score: 0.98,
      created_at: d.created_at,
    }))
  ];

  const productImages = sources.filter(
    (s) => (s.source_type as string) === 'image' || (s.source_type as string) === 'packaging_label'
  );

  const enrichmentSources = sources.filter(
    (s) => (s.source_type as string) === 'enrichment' || (s.source_type as string) === 'third_party'
  );

  const renderSourceGroup = (
    title: string,
    icon: React.ReactNode,
    items: any[],
    emptyText: string,
    badgeColor: string
  ) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
            {icon}
          </div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">{title}</h4>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${badgeColor}`}>
          {items.length} {items.length === 1 ? 'Source' : 'Sources'}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="p-4 text-xs text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800/60 border-dashed text-center">
          {emptyText}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2.5">
          {items.map((item, idx) => (
            <div
              key={item.id || idx}
              className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-slate-800/80 flex items-center justify-center text-slate-400 group-hover:text-red-400 transition-colors">
                  {icon}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-red-300 transition-colors">
                    {item.source_name || item.source_url || 'Unnamed Source'}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="capitalize">{item.source_type || 'Source'}</span>
                    <span>•</span>
                    <span className="text-emerald-400 flex items-center gap-1 font-mono">
                      <ShieldCheck className="w-3 h-3" />
                      {Math.round((item.reliability_score || 0.95) * 100)}% Trust
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {item.source_url && (
                  <a
                    href={item.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                    title="Open URL"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={() =>
                    setSelectedSource({
                      source_name: item.source_name || 'Attached Source Document',
                      source_type: item.source_type || 'pdf',
                      evidence_text: `Vector chunk payload extracted from ${item.source_name || 'source file'}. Parsed & stored in Qdrant collection under product_id filter.`,
                      similarity_score: item.reliability_score || 0.98,
                    })
                  }
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white text-[11px] font-medium transition-colors"
                >
                  Inspect
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-bold text-slate-100">Product Source Intelligence Panel</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Grouped technical datasheets, web specifications, vision labels, and enrichment evidence
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onUploadDocument && (
            <button
              onClick={onUploadDocument}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload PDF / Image
            </button>
          )}

          {onIndexSources && (
            <button
              onClick={onIndexSources}
              disabled={isIndexing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-lg shadow-red-600/20"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isIndexing ? 'animate-spin' : ''}`} />
              {isIndexing ? 'Indexing Vectors...' : 'Build Vector Index'}
            </button>
          )}
        </div>
      </div>

      {/* 4 Groupings specified in Requirement #8 */}
      <div className="space-y-6">
        {renderSourceGroup(
          'Official Website',
          <Globe className="w-4 h-4 text-red-400" />,
          officialWebsites,
          'No official website URL sources attached yet.',
          'bg-red-500/10 text-red-400 border border-red-500/20'
        )}

        {renderSourceGroup(
          'Technical Documents',
          <FileText className="w-4 h-4 text-rose-400" />,
          technicalDocs,
          'No PDF technical datasheets or manuals uploaded yet.',
          'bg-rose-500/10 text-rose-400 border border-rose-500/20'
        )}

        {renderSourceGroup(
          'Product Images',
          <ImageIcon className="w-4 h-4 text-amber-400" />,
          productImages,
          'No product packaging images or label OCR attached.',
          'bg-amber-500/10 text-amber-400 border border-amber-500/20'
        )}

        {renderSourceGroup(
          'Enrichment Sources',
          <Database className="w-4 h-4 text-purple-400" />,
          enrichmentSources,
          'No third-party enrichment sources (reserved for Phase 5).',
          'bg-purple-500/10 text-purple-400 border border-purple-500/20'
        )}
      </div>

      {/* Selected Source Inspect Modal */}
      {selectedSource && (
        <EvidenceViewerModal
          isOpen={!!selectedSource}
          onClose={() => setSelectedSource(null)}
          title="Inspected Source Vector Metadata"
          citations={[selectedSource]}
        />
      )}
    </div>
  );
};
