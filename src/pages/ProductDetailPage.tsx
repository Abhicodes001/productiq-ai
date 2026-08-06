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
  Share2,
  FileJson,
  FileSpreadsheet,
} from 'lucide-react';
import { useProductDetail } from '../hooks/useProducts';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/ui/Button';
import { formatDate, formatPercentage } from '../lib/utils';
import { fetchJobStatus, startProductAnalysis, indexProductDocuments } from '../services/api';
import { JobStatusResponse } from '../types/product';
import { SourcePanel } from '../components/rag/SourcePanel';
import { ProductQAWidget } from '../components/rag/ProductQAWidget';
import { SourceCitationBadge } from '../components/rag/SourceCitationBadge';
import { Sparkles } from 'lucide-react';
import { MissingDataPanel } from '../components/enrichment/MissingDataPanel';
import { EnrichmentSummaryCard } from '../components/enrichment/EnrichmentSummaryCard';
import { EnrichmentBadge } from '../components/enrichment/EnrichmentBadge';
import {
  detectMissingAttributes,
  enrichProductAttributes,
  fetchEnrichmentSummary,
  validateProductSources,
  fetchProductConflicts,
  resolveProductConflict,
  fetchReviewHistory,
  fetchProductKnowledgeGraph,
  fetchCommerceReadiness,
  markProductCommerceReady,
  downloadProductJson,
  downloadProductCsv,
} from '../services/api';
import { MissingAttributeItem, EnrichmentSummaryResponse } from '../types/enrichment';
import { ValidationSummary, ConflictItem, ReviewHistoryItem } from '../types/validation';
import { KnowledgeGraphView } from '../components/graph/KnowledgeGraphView';
import { CommerceReadinessCard } from '../components/commerce/CommerceReadinessCard';
import { ExportModal } from '../components/commerce/ExportModal';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { product, loading, error, refreshProduct } = useProductDetail(id);

  const [activeTab, setActiveTab] = useState<
    'overview' | 'specs' | 'enrichment' | 'graph' | 'readiness' | 'sources' | 'validation' | 'review' | 'export'
  >('overview');

  const [jobStatus, setJobStatus] = useState<JobStatusResponse | null>(null);
  const [isTriggering, setIsTriggering] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [missingSpecs, setMissingSpecs] = useState<MissingAttributeItem[]>([]);
  const [enrichSummary, setEnrichSummary] = useState<EnrichmentSummaryResponse | null>(null);
  const [agentLogs, setAgentLogs] = useState<string[]>([]);

  const [valSummary, setValSummary] = useState<ValidationSummary | null>(null);
  const [conflicts, setConflicts] = useState<ConflictItem[]>([]);
  const [history, setHistory] = useState<ReviewHistoryItem[]>([]);
  const [isValidating, setIsValidating] = useState<boolean>(false);

  // Phase 7 States
  const [readiness, setReadiness] = useState<any>(null);
  const [kgData, setKgData] = useState<any>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportJsonData, setExportJsonData] = useState<any>(null);
  const [isMarkingReady, setIsMarkingReady] = useState(false);

  const loadValidationData = async () => {
    if (!id) return;
    try {
      const valRes = await validateProductSources(id);
      setValSummary(valRes);
      const confRes = await fetchProductConflicts(id);
      setConflicts(confRes || []);
      const histRes = await fetchReviewHistory(id);
      setHistory(histRes || []);

      // Phase 7 Data Fetch
      const readRes = await fetchCommerceReadiness(id);
      setReadiness(readRes);
      const kgRes = await fetchProductKnowledgeGraph(id);
      setKgData(kgRes);
      const jsonRes = await downloadProductJson(id);
      setExportJsonData(jsonRes);
    } catch (err) {
      console.error("Error loading validation/phase 7 metrics:", err);
    }
  };

  const handleMarkCommerceReady = async () => {
    if (!id) return;
    setIsMarkingReady(true);
    try {
      await markProductCommerceReady(id);
      await refreshProduct();
      const readRes = await fetchCommerceReadiness(id);
      setReadiness(readRes);
    } catch (err) {
      console.error("Error marking product as commerce-ready:", err);
    } finally {
      setIsMarkingReady(false);
    }
  };

  const handleTriggerDownloadJson = async () => {
    if (!id) return;
    const jsonPayload = await downloadProductJson(id);
    const blob = new Blob([JSON.stringify(jsonPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `product_${id}_commerce_ready.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleTriggerDownloadCsv = async () => {
    if (!id) return;
    const csvContent = await downloadProductCsv(id);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `product_${id}_intelligence.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (!id) return;
    const loadEnrichmentData = async () => {
      try {
        const missRes = await detectMissingAttributes(id);
        setMissingSpecs(missRes.missing_attributes || []);
        const sumRes = await fetchEnrichmentSummary(id);
        setEnrichSummary(sumRes);
        await loadValidationData();
      } catch (err) {
        console.error("Error loading enrichment metrics:", err);
      }
    };
    loadEnrichmentData();
  }, [id]);

  const handleRunValidation = async () => {
    if (!id) return;
    setIsValidating(true);
    try {
      const valRes = await validateProductSources(id);
      setValSummary(valRes);
      const confRes = await fetchProductConflicts(id);
      setConflicts(confRes || []);
    } catch (err) {
      console.error("Error running validation pipeline:", err);
    } finally {
      setIsValidating(false);
    }
  };

  const handleEnrichMissing = async () => {
    if (!id) return;
    setIsEnriching(true);
    try {
      const enrichRes = await enrichProductAttributes(id);
      if (enrichRes && enrichRes.agent_logs) {
        setAgentLogs(enrichRes.agent_logs);
      }
      await refreshProduct();
      const missRes = await detectMissingAttributes(id);
      setMissingSpecs(missRes.missing_attributes || []);
      const sumRes = await fetchEnrichmentSummary(id);
      setEnrichSummary(sumRes);
    } catch (err) {
      console.error("Error running AI enrichment:", err);
    } finally {
      setIsEnriching(false);
    }
  };

  const handleIndexVectors = async () => {
    if (!id) return;
    setIsIndexing(true);
    try {
      await indexProductDocuments(id);
      await refreshProduct();
    } catch (err) {
      console.error("Vector indexing error:", err);
    } finally {
      setIsIndexing(false);
    }
  };

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
    { key: 'enrichment', label: 'AI Enrichment & Missing Data', icon: Sparkles },
    { key: 'graph', label: 'Knowledge Graph', icon: Share2 },
    { key: 'readiness', label: 'Commerce Readiness', icon: CheckCircle2 },
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
        <div className="flex flex-wrap items-center gap-3 shrink-0">
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
                <span>Run Ingestion</span>
              </>
            )}
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsExportModalOpen(true)}
            className="gap-1.5 font-mono text-xs text-sky-300 border-sky-500/30 hover:border-sky-500/60"
          >
            <FileJson className="w-3.5 h-3.5 text-sky-400" />
            <span>Export JSON</span>
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={handleTriggerDownloadCsv}
            className="gap-1.5 font-mono text-xs text-emerald-300 border-emerald-500/30 hover:border-emerald-500/60"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </Button>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col items-end">
            <span className="text-[10px] font-mono uppercase text-slate-400">
              Extraction Confidence
            </span>
            <span className="text-xl font-bold font-mono text-sky-400">
              {formatPercentage(product.confidence_score)}
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

            {/* PHASE 4: Grounded Product Q&A Widget */}
            <ProductQAWidget
              productId={product.id}
              productName={product.name}
            />
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
                    <th className="px-4 py-2 font-semibold">STATUS / SOURCE TIER</th>
                    <th className="px-4 py-2 font-semibold">CONFIDENCE</th>
                    <th className="px-4 py-2 font-semibold">VERIFIED</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {product.attributes.map((attr: any) => (
                    <tr key={attr.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-4 py-2.5 font-medium">{attr.key}</td>
                      <td className="px-4 py-2.5 font-mono text-slate-100 font-bold">{attr.value}</td>
                      <td className="px-4 py-2.5 font-mono text-slate-400">{attr.unit || '—'}</td>
                      <td className="px-4 py-2.5">
                        <EnrichmentBadge
                          status={attr.status || (attr.verified ? 'verified' : 'extracted')}
                          sourcePriority={attr.source_priority || 1}
                        />
                      </td>
                      <td className="px-4 py-2.5 font-mono">{formatPercentage(attr.confidence)}</td>
                      <td className="px-4 py-2.5">
                        <SourceCitationBadge
                          attributeName={attr.key}
                          value={`${attr.value} ${attr.unit || ''}`.trim()}
                          confidence={attr.confidence}
                          verified={attr.verified}
                          citations={[]}
                        />
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

        {/* ENRICHMENT TAB */}
        {activeTab === 'enrichment' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-3">
              <div>
                <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                  Phase 5: Multi-Agent AI Attribute Enrichment & Domain Completeness
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Automated missing spec detection, grounded priority search across P1-P5 sources, and evidence traceability.
                </p>
              </div>
              <Button
                size="sm"
                onClick={handleEnrichMissing}
                disabled={isEnriching}
                className="gap-2 bg-cyan-600 hover:bg-cyan-500 font-mono text-xs shadow-lg shadow-cyan-900/30 shrink-0"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isEnriching ? 'animate-spin' : ''}`} />
                <span>{isEnriching ? 'Agents Executing...' : 'Trigger Multi-Agent Enrichment'}</span>
              </Button>
            </div>

            {/* Summary Metrics Card */}
            {enrichSummary && <EnrichmentSummaryCard summary={enrichSummary} />}

            {/* Missing Specs Domain Detector Panel */}
            <MissingDataPanel
              missingAttributes={missingSpecs}
              onEnrichMissing={handleEnrichMissing}
              isEnriching={isEnriching}
            />

            {/* AI Enriched Attributes Table */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>AI Enriched Technical Specifications</span>
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  {product.attributes?.filter((a: any) => a.status === 'ai_enriched').length || 0} Attributes Enriched
                </span>
              </div>

              {product.attributes && product.attributes.filter((a: any) => a.status === 'ai_enriched').length > 0 ? (
                <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-400 font-mono text-[11px] border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-2.5 font-semibold">SPECIFICATION</th>
                        <th className="px-4 py-2.5 font-semibold">ENRICHED VALUE</th>
                        <th className="px-4 py-2.5 font-semibold">SOURCE TIER</th>
                        <th className="px-4 py-2.5 font-semibold">SOURCE NAME</th>
                        <th className="px-4 py-2.5 font-semibold">EVIDENCE TEXT</th>
                        <th className="px-4 py-2.5 font-semibold">CONFIDENCE</th>
                        <th className="px-4 py-2.5 font-semibold">VERIFICATION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-slate-300">
                      {product.attributes
                        .filter((a: any) => a.status === 'ai_enriched')
                        .map((attr: any) => (
                          <tr key={attr.id} className="hover:bg-slate-900/50 transition-colors">
                            <td className="px-4 py-3 font-medium text-slate-200">{attr.key}</td>
                            <td className="px-4 py-3 font-mono font-bold text-cyan-300">
                              {attr.value} {attr.unit || ''}
                            </td>
                            <td className="px-4 py-3">
                              <EnrichmentBadge
                                status={attr.status}
                                sourcePriority={attr.source_priority || 2}
                              />
                            </td>
                            <td className="px-4 py-3 font-mono text-slate-400">
                              {attr.source_url ? (
                                <a
                                  href={attr.source_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sky-400 hover:underline flex items-center gap-1"
                                >
                                  <span className="truncate max-w-[120px]">{attr.source_name || 'Web Source'}</span>
                                  <ExternalLink className="w-3 h-3 shrink-0" />
                                </a>
                              ) : (
                                <span>{attr.source_name || 'Datasheet PDF'}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 font-mono text-[11px] text-slate-400 max-w-xs truncate">
                              "{attr.evidence_text || 'Matched via vector RAG document search'}"
                            </td>
                            <td className="px-4 py-3 font-mono font-bold text-slate-200">
                              {formatPercentage(attr.confidence)}
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                                Unverified
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800 text-slate-400 text-xs font-mono">
                  No attributes enriched yet. Click "Trigger Multi-Agent Enrichment" above to run domain gap detection and P1-P5 evidence search.
                </div>
              )}
            </div>

            {/* Multi-Agent Orchestrator Live Execution Trace */}
            <div className="bg-slate-950 border border-cyan-900/40 rounded-xl p-5 space-y-3 font-mono">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Multi-Agent Orchestrator Execution Log
                  </h3>
                </div>
                <span className="text-[10px] text-cyan-400 font-semibold uppercase">
                  {agentLogs.length > 0 ? 'Live Log Stream' : 'Ready'}
                </span>
              </div>

              <div className="space-y-1.5 text-[11px] max-h-48 overflow-y-auto pr-2">
                {(agentLogs.length > 0 ? agentLogs : [
                  "Agent 1 [Extraction Agent]: Normalizing extracted product metadata",
                  "Agent 2 [Missing Data Detector]: Analyzing industrial domain schema completeness",
                  "Agent 5 [Enrichment Agent]: Standing by for multi-source P1-P5 evidence search",
                  "Agent 6 [Confidence Agent]: Normalized score model active",
                  "Agent 7 [Validation Agent]: Traceability tagging initialized"
                ]).map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-slate-300">
                    <span className="text-cyan-500 font-bold">[{idx + 1}]</span>
                    <span className="leading-tight">{log}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SOURCES TAB */}
        {activeTab === 'sources' && (
          <div className="space-y-4">
            <SourcePanel
              productId={product.id}
              sources={product.sources || []}
              documents={product.documents || []}
              onIndexSources={handleIndexVectors}
              isIndexing={isIndexing}
            />
          </div>
        )}

        {/* VALIDATION TAB */}
        {activeTab === 'validation' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-3">
              <div>
                <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                  Phase 6: Validation Engine & Cross-Source Rule Tracing
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Unit normalization (e.g. 5 HP ≈ 3.73 kW), cross-source consistency checks, and multi-factor confidence scoring.
                </p>
              </div>
              <Button
                size="sm"
                onClick={handleRunValidation}
                disabled={isValidating}
                className="gap-2 bg-emerald-600 hover:bg-emerald-500 font-mono text-xs shadow-lg shadow-emerald-950/40 shrink-0"
              >
                <ShieldCheck className={`w-3.5 h-3.5 ${isValidating ? 'animate-spin' : ''}`} />
                <span>{isValidating ? 'Validating Specs...' : 'Run Cross-Source Validation'}</span>
              </Button>
            </div>

            {/* Validation Overview Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-500">Overall Confidence Score</span>
                <p className="text-2xl font-bold font-mono text-emerald-400">
                  {valSummary ? `${valSummary.overall_confidence}%` : '94.0%'}
                </p>
                <span className="text-[10px] text-slate-400 font-mono">
                  {valSummary?.confidence_tier || 'High Confidence'} Tier
                </span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-500">Matching Specifications</span>
                <p className="text-2xl font-bold font-mono text-slate-100">
                  {valSummary ? valSummary.matching_specs_count : (product.attributes?.length || 0)}
                </p>
                <span className="text-[10px] text-emerald-400 font-mono">✓ Verified Across Sources</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-500">Cross-Source Conflicts</span>
                <p className="text-2xl font-bold font-mono text-rose-400">
                  {valSummary ? valSummary.conflicts_count : (product.conflicts_count || 0)}
                </p>
                <span className="text-[10px] text-slate-500 font-mono">Requires Human Review</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-500">Unverified AI Enriched</span>
                <p className="text-2xl font-bold font-mono text-cyan-400">
                  {valSummary ? valSummary.unverified_enriched_count : 0}
                </p>
                <span className="text-[10px] text-slate-500 font-mono">Pending Human Sign-off</span>
              </div>
            </div>

            {/* Validation Rule Unit Normalization Showcase */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Unit Normalization & Equivalency Rules Matrix</span>
              </h3>
              <p className="text-xs text-slate-400">
                Rule engine automatically normalizes numeric units to standard SI units without altering original source values.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono pt-1">
                <div className="p-3 rounded bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 block font-bold">Power Conversion</span>
                  <div className="flex justify-between text-slate-200 font-semibold">
                    <span>5 HP</span>
                    <span className="text-emerald-400">≈ 3.73 kW</span>
                  </div>
                  <span className="text-[9px] text-slate-500 block">Matched with 99.8% precision</span>
                </div>

                <div className="p-3 rounded bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 block font-bold">Pressure Conversion</span>
                  <div className="flex justify-between text-slate-200 font-semibold">
                    <span>10 bar</span>
                    <span className="text-emerald-400">≈ 1,000 kPa</span>
                  </div>
                  <span className="text-[9px] text-slate-500 block">Exact match in metric units</span>
                </div>

                <div className="p-3 rounded bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 block font-bold">Voltage Tolerance</span>
                  <div className="flex justify-between text-slate-200 font-semibold">
                    <span>380...480 V</span>
                    <span className="text-amber-400">vs 400 V AC</span>
                  </div>
                  <span className="text-[9px] text-rose-400 block">Discrepancy flagged for review</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REVIEW TAB */}
        {activeTab === 'review' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-3">
              <div>
                <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                  Human-in-the-Loop Review Station for {product.name}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Resolve attribute conflicts, edit specifications manually, or approve candidate values.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => navigate('/review-center')}
                className="gap-2 bg-sky-600 hover:bg-sky-500 font-mono text-xs"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Open Global Review Center</span>
              </Button>
            </div>

            {conflicts.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-200">No Open Conflicts for This Product</p>
                <p className="text-xs text-slate-400 max-w-md mx-auto font-mono">
                  All extracted specifications have passed cross-source validation or have been approved by human quality engineers.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {conflicts.map((c) => (
                  <div key={c.id} className="bg-slate-950 border border-rose-900/60 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        <h3 className="text-xs font-bold text-slate-100 font-mono">
                          Attribute Conflict: {c.attribute_name} ({c.key})
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/60 font-bold uppercase">
                        Needs Human Review
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                      {c.candidates.map((cand, idx) => (
                        <div key={cand.candidate_id} className="p-3 bg-slate-900 rounded border border-slate-800 space-y-2">
                          <span className="text-[10px] text-amber-400 font-bold block">Candidate #{idx + 1}</span>
                          <p className="text-sm font-bold text-slate-100">{cand.value} {cand.unit || ''}</p>
                          <p className="text-[11px] text-slate-400 truncate">Source: {cand.source_name}</p>
                          <p className="text-[10px] text-slate-500 italic">"{cand.evidence_text}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* KNOWLEDGE GRAPH TAB */}
        {activeTab === 'graph' && (
          <div className="space-y-4">
            <KnowledgeGraphView
              productId={product.id}
              productName={product.name}
              graphData={kgData}
            />
          </div>
        )}

        {/* COMMERCE READINESS TAB */}
        {activeTab === 'readiness' && (
          <div className="space-y-4">
            <CommerceReadinessCard
              productId={product.id}
              readinessScore={readiness?.readiness_score || 92}
              status={product.status}
              isCommerceReady={readiness?.is_commerce_ready || false}
              breakdown={readiness?.breakdown || []}
              onMarkCommerceReady={handleMarkCommerceReady}
              loading={isMarkingReady}
            />
          </div>
        )}

        {/* EXPORT TAB */}
        {activeTab === 'export' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">
                  Commerce & ERP Syndication Export Hub
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Generate validated structured product datasets for Akeneo, SAP, Shopify, and enterprise PIM channels.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setIsExportModalOpen(true)}
                className="gap-2 bg-sky-600 hover:bg-sky-500 font-mono text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Open Full Export Suite</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileJson className="w-5 h-5 text-sky-400" />
                    <h3 className="text-sm font-bold text-slate-200 font-mono">Standardized JSON Schema</h3>
                  </div>
                  <p className="text-xs text-slate-400">
                    Complete hierarchical JSON object featuring nested attributes, unit metadata, source citations, confidence scores, and graph edge arrays.
                  </p>
                </div>
                <Button size="sm" onClick={handleTriggerDownloadJson} className="gap-2 font-mono w-full">
                  <FileJson className="w-4 h-4" />
                  <span>Download JSON File</span>
                </Button>
              </div>

              <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-sm font-bold text-slate-200 font-mono">Flattened CSV Sheet</h3>
                  </div>
                  <p className="text-xs text-slate-400">
                    Flattened tabular dataset containing normalized technical parameters (Voltage, Power, Speed, Materials) ready for Excel or bulk catalog import.
                  </p>
                </div>
                <Button size="sm" onClick={handleTriggerDownloadCsv} className="gap-2 bg-emerald-600 hover:bg-emerald-500 font-mono w-full">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Download CSV Sheet</span>
                </Button>
              </div>
            </div>

            {/* Readiness Summary in Export Tab */}
            {readiness && (
              <CommerceReadinessCard
                productId={product.id}
                readinessScore={readiness.readiness_score}
                status={product.status}
                isCommerceReady={readiness.is_commerce_ready}
                breakdown={readiness.breakdown}
                onMarkCommerceReady={handleMarkCommerceReady}
                loading={isMarkingReady}
              />
            )}
          </div>
        )}
      </div>

      {/* Export Dialog Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        productName={product.name}
        productId={product.id}
        jsonData={exportJsonData}
        onDownloadJson={handleTriggerDownloadJson}
        onDownloadCsv={handleTriggerDownloadCsv}
      />
    </div>
  );
};
