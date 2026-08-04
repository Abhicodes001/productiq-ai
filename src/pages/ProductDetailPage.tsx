import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Boxes,
  FileText,
  ShieldCheck,
  Download,
  ExternalLink,
  Layers,
  AlertTriangle,
  FileCheck2,
  CheckCircle2,
  Database,
  Cpu,
  RefreshCw,
  Clock,
  Globe,
  Image as ImageIcon,
  Play,
  Loader2,
} from 'lucide-react';
import { useProductDetail } from '../hooks/useProducts';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/ui/Button';
import { formatDate, formatPercentage } from '../lib/utils';
import { fetchJobStatus, startProductAnalysis } from '../services/api';
import { JobStatusResponse } from '../types/product';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { product, loading, error, refreshProduct } = useProductDetail(id);

  const [activeTab, setActiveTab] = useState<
    'overview' | 'specs' | 'sources' | 'validation' | 'review' | 'export'
  >('overview');

  const [jobStatus, setJobStatus] = useState<JobStatusResponse | null>(null);
  const [isTriggering, setIsTriggering] = useState(false);

  // Poll processing job status if product status is 'processing'
  useEffect(() => {
    if (!id) return;
    let timer: any = null;

    const checkStatus = async () => {
      try {
        const res = await fetchJobStatus(id);
        setJobStatus(res);
        if (res.status === 'completed' || res.status === 'failed') {
          refreshProduct();
        }
      } catch (err) {
        console.error("Job status check error:", err);
      }
    };

    checkStatus();

    if (product?.status === 'processing') {
      timer = setInterval(checkStatus, 2000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [id, product?.status]);

  const handleRunAnalysis = async () => {
    if (!id) return;
    setIsTriggering(true);
    try {
      await startProductAnalysis(id);
      await refreshProduct();
      const statusRes = await fetchJobStatus(id);
      setJobStatus(statusRes);
    } catch (err) {
      console.error("Failed to start analysis:", err);
    } finally {
      setIsTriggering(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-500 font-mono">
        Loading product intelligence record...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/products')}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Products Catalog</span>
        </button>
        <EmptyState
          title="Product Not Found"
          description="The requested product record could not be found or has been deleted."
          actionLabel="Return to Products"
          onAction={() => navigate('/products')}
        />
      </div>
    );
  }

  const tabs = [
    { key: 'overview', label: 'Overview', icon: Boxes },
    { key: 'specs', label: 'Technical Specifications', icon: Layers },
    { key: 'sources', label: 'Sources Lineage', icon: Database },
    { key: 'validation', label: 'Validation Rules', icon: ShieldCheck },
    { key: 'review', label: 'Human Review', icon: FileCheck2 },
    { key: 'export', label: 'Export Data', icon: Download },
  ];

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb Back Navigation */}
      <button
        onClick={() => navigate('/products')}
        className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 font-mono"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Products Catalog</span>
      </button>

      {/* Product Detail Banner Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              {product.name}
            </h1>
            <StatusBadge status={product.status} />
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-400 font-mono">
            <span>Manufacturer: <strong className="text-slate-200">{product.manufacturer}</strong></span>
            <span>Category: <strong className="text-slate-200">{product.category}</strong></span>
            <span>Updated: <strong className="text-slate-200">{formatDate(product.updated_at)}</strong></span>
          </div>

          {product.product_url && (
            <a
              href={product.product_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 font-mono"
            >
              <span>{product.product_url}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* Action Controls & Confidence Score */}
        <div className="flex items-center gap-4 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRunAnalysis}
            disabled={isTriggering || product.status === 'processing'}
            className="gap-1.5 font-mono text-xs"
          >
            {isTriggering || product.status === 'processing' ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-sky-400" />
                <span>Run Ingestion Engine</span>
              </>
            )}
          </Button>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col items-end">
            <span className="text-[10px] font-mono uppercase text-slate-400">
              Extraction Confidence
            </span>
            <span className="text-2xl font-bold font-mono text-sky-400">
              {formatPercentage(product.confidence_score)}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {product.attributes?.length || 0} extracted attributes
            </span>
          </div>
        </div>
      </div>

      {/* PHASE 2: Live Ingestion Pipeline Stage Stepper Banner */}
      {jobStatus && (
        <div className="bg-slate-950 border border-sky-900/60 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-sky-400 animate-pulse" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                Multi-Modal Ingestion Pipeline Status
              </h3>
            </div>
            <span className="text-xs font-mono text-sky-400 font-semibold">
              {jobStatus.progress}% Complete
            </span>
          </div>

          {/* Stepper Stage Nodes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-1">
            {jobStatus.stages_breakdown.map((st, idx) => (
              <div
                key={st.code}
                className={`p-2.5 rounded border text-[11px] font-mono space-y-1 transition-all ${
                  st.status === 'completed'
                    ? 'bg-sky-950/40 border-sky-800/80 text-sky-300'
                    : st.status === 'in_progress'
                    ? 'bg-amber-950/50 border-amber-500/80 text-amber-300 animate-pulse'
                    : 'bg-slate-900/40 border-slate-800/80 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold opacity-75">#{idx + 1}</span>
                  {st.status === 'completed' ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  ) : st.status === 'in_progress' ? (
                    <Loader2 className="w-3 h-3 text-amber-400 animate-spin" />
                  ) : (
                    <Clock className="w-3 h-3 text-slate-600" />
                  )}
                </div>
                <p className="font-medium leading-tight truncate">{st.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail Navigation Tabs */}
      <div className="border-b border-slate-800 flex overflow-x-auto space-x-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-sky-500 text-sky-400 bg-slate-900/50'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Panels */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-6 min-h-[300px]">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider border-b border-slate-800/80 pb-2">
              Product Executive Overview
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-500">Record ID</span>
                <p className="text-xs font-mono text-slate-200 mt-1 truncate">{product.id}</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-500">Connected Sources</span>
                <p className="text-xs font-mono text-slate-200 mt-1">{product.sources_count || 1} Document(s)</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-500">Validation Conflicts</span>
                <p className="text-xs font-mono text-slate-200 mt-1">{product.conflicts_count || 0} Open Issue(s)</p>
              </div>
            </div>

            {product.attributes && product.attributes.length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  Highlight Attributes
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.attributes.map((attr) => (
                    <div key={attr.id} className="bg-slate-950 p-3 rounded border border-slate-800 flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-medium">{attr.key}</span>
                      <span className="font-mono text-slate-100 font-semibold">{attr.value} {attr.unit || ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                icon={Cpu}
                title="AI RAG Pipeline Not Executed Yet"
                description="Attribute extraction, multimodal table vision parsing, and rule validation will run in subsequent pipeline phases."
              />
            )}
          </div>
        )}

        {/* SPECS TAB */}
        {activeTab === 'specs' && (
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider border-b border-slate-800/80 pb-2">
              Extracted Technical Specifications
            </h2>

            {product.attributes && product.attributes.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-mono text-[11px]">
                  <tr>
                    <th className="px-4 py-2 font-semibold">SPECIFICATION KEY</th>
                    <th className="px-4 py-2 font-semibold">VALUE</th>
                    <th className="px-4 py-2 font-semibold">UNIT</th>
                    <th className="px-4 py-2 font-semibold">CONFIDENCE</th>
                    <th className="px-4 py-2 font-semibold">VERIFIED</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {product.attributes.map((attr) => (
                    <tr key={attr.id}>
                      <td className="px-4 py-2.5 font-medium">{attr.key}</td>
                      <td className="px-4 py-2.5 font-mono text-slate-100">{attr.value}</td>
                      <td className="px-4 py-2.5 font-mono text-slate-400">{attr.unit || '—'}</td>
                      <td className="px-4 py-2.5 font-mono">{formatPercentage(attr.confidence)}</td>
                      <td className="px-4 py-2.5">
                        {attr.verified ? (
                          <span className="text-emerald-400 text-[10px] font-mono">✓ Verified</span>
                        ) : (
                          <span className="text-amber-400 text-[10px] font-mono">Unverified</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState
                icon={Layers}
                title="No Structured Specs Extracted"
                description="Technical specifications will populate after PDF parsing and LLM table extraction execution."
              />
            )}
          </div>
        )}

        {/* SOURCES TAB */}
        {activeTab === 'sources' && (
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider border-b border-slate-800/80 pb-2">
              Source Citation & Multi-Modal Data Lineage
            </h2>

            {(product.sources && product.sources.length > 0) || (product.documents && product.documents.length > 0) ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  {product.sources?.map((src) => (
                    <div key={src.id} className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded bg-slate-900 border border-slate-800 text-sky-400">
                          {src.source_type === 'website' ? (
                            <Globe className="w-4 h-4 text-sky-400" />
                          ) : src.source_type === 'pdf' ? (
                            <FileText className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-indigo-400" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-200">{src.source_name}</span>
                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                              {src.source_type}
                            </span>
                          </div>
                          {src.source_url && (
                            <p className="text-[11px] font-mono text-slate-400 mt-0.5 truncate max-w-md">{src.source_url}</p>
                          )}
                          {src.storage_path && (
                            <p className="text-[11px] font-mono text-slate-500 mt-0.5">{src.storage_path}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <span className="text-[10px] font-mono text-slate-500 block">Reliability</span>
                          <span className="text-xs font-mono font-bold text-sky-400">
                            {formatPercentage(src.reliability_score || 0.95)}
                          </span>
                        </div>
                        <span className={`text-[10px] font-mono px-2 py-1 rounded ${
                          src.status === 'processed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}>
                          {src.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                icon={Database}
                title="No Data Sources Attached"
                description="Attach website URLs, PDF technical datasheets, or nameplate image scans to enable automated spec extraction."
              />
            )}
          </div>
        )}

        {/* VALIDATION TAB */}
        {activeTab === 'validation' && (
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider border-b border-slate-800/80 pb-2">
              Validation Engine & Conflict Tracing
            </h2>
            <EmptyState
              icon={ShieldCheck}
              title="Validation Engine Idle"
              description="Rule validation checks physical unit bounds, standard voltage levels, and detects attribute discrepancies across sources."
            />
          </div>
        )}

        {/* REVIEW TAB */}
        {activeTab === 'review' && (
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider border-b border-slate-800/80 pb-2">
              Human-in-the-Loop Review Center
            </h2>
            <EmptyState
              icon={FileCheck2}
              title="Human Review Station"
              description="Review center allows domain engineers to approve low-confidence attributes, resolve source conflicts, and publish verified product models."
            />
          </div>
        )}

        {/* EXPORT TAB */}
        {activeTab === 'export' && (
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider border-b border-slate-800/80 pb-2">
              Commerce & PIM Export Hub
            </h2>
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-200">Standard Product Intelligence JSON</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Export normalized specs for REST API, Akeneo, Shopify, or SAP integration.</p>
              </div>
              <Button size="sm" className="gap-1.5 font-mono">
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
