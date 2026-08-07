import React, { useState, useEffect } from 'react';
import {
  FileText,
  FileSearch,
  Eye,
  Database,
  Bot,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  Sparkles,
  Play,
  Clock,
} from 'lucide-react';
import { Button } from '../ui/Button';

export interface PipelineStage {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: React.ElementType;
  status: 'completed' | 'in_progress' | 'pending' | 'conflict';
  latency: string;
  metrics?: string;
}

interface ProcessingPipelineVisualizerProps {
  currentStageId?: string;
  onStageSelect?: (stageId: string) => void;
  interactive?: boolean;
  compact?: boolean;
  productStatus?: string;
}

export const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: 'input',
    name: '1. INPUT INGESTION',
    shortName: 'INPUT',
    description: 'Raw product data, technical PDFs, website URLs, and image catalogs ingested.',
    icon: FileText,
    status: 'completed',
    latency: '45ms',
    metrics: '3 Sources attached',
  },
  {
    id: 'document_intelligence',
    name: '2. DOCUMENT INTELLIGENCE',
    shortName: 'DOC INTEL',
    description: 'PDF structural layout analysis, table extraction, and multi-page text parsing.',
    icon: FileSearch,
    status: 'completed',
    latency: '340ms',
    metrics: '12 Pages parsed',
  },
  {
    id: 'vision_ai',
    name: '3. VISION AI',
    shortName: 'VISION AI',
    description: 'Multimodal image OCR, schematic diagram reading, and nameplate verification.',
    icon: Eye,
    status: 'completed',
    latency: '510ms',
    metrics: '4 Labels OCRed',
  },
  {
    id: 'rag',
    name: '4. RAG VECTOR STORE',
    shortName: 'RAG',
    description: 'Chunking, vector embedding, and similarity index search across sources.',
    icon: Database,
    status: 'completed',
    latency: '180ms',
    metrics: '28 Vector Chunks',
  },
  {
    id: 'ai_enrichment',
    name: '5. AI ENRICHMENT',
    shortName: 'AI ENRICHMENT',
    description: 'Multi-agent system detects missing fields and executes P1-P5 priority web lookup.',
    icon: Bot,
    status: 'completed',
    latency: '620ms',
    metrics: '5 Fields Enriched',
  },
  {
    id: 'validation',
    name: '6. VALIDATION ENGINE',
    shortName: 'VALIDATION',
    description: 'Cross-source matrix comparison, unit normalization, and discrepancy detection.',
    icon: ShieldCheck,
    status: 'completed',
    latency: '120ms',
    metrics: '1 Conflict Found',
  },
  {
    id: 'human_review',
    name: '7. HUMAN REVIEW',
    shortName: 'HUMAN REVIEW',
    description: 'Flagged conflicts sent to domain expert in Review Center for candidate verification.',
    icon: UserCheck,
    status: 'in_progress',
    latency: 'Active Queue',
    metrics: '1 Review Pending',
  },
  {
    id: 'verified_product',
    name: '8. VERIFIED PRODUCT',
    shortName: 'VERIFIED',
    description: 'Approved attributes mapped with high confidence scores and immutable audit log.',
    icon: CheckCircle2,
    status: 'pending',
    latency: '--',
    metrics: '84% Confidence',
  },
  {
    id: 'commerce_ready',
    name: '9. COMMERCE READY',
    shortName: 'COMMERCE READY',
    description: '6-factor evaluation passed. Complete structured JSON/CSV ready for ERP/PIM export.',
    icon: Sparkles,
    status: 'pending',
    latency: '--',
    metrics: 'Readiness 96%',
  },
];

export const ProcessingPipelineVisualizer: React.FC<ProcessingPipelineVisualizerProps> = ({
  onStageSelect,
  interactive = true,
  compact = false,
  productStatus = 'needs_review',
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(6);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [stages, setStages] = useState<PipelineStage[]>(PIPELINE_STAGES);

  useEffect(() => {
    if (productStatus === 'verified' || productStatus === 'commerce_ready') {
      setStages((prev) =>
        prev.map((s) => ({
          ...s,
          status: 'completed',
        }))
      );
      setActiveStepIndex(8);
    } else if (productStatus === 'needs_review') {
      setStages(PIPELINE_STAGES);
      setActiveStepIndex(6);
    }
  }, [productStatus]);

  const handleSimulate = () => {
    setIsSimulating(true);
    let step = 0;
    
    setStages((prev) =>
      prev.map((s, idx) => ({
        ...s,
        status: idx === 0 ? 'in_progress' : 'pending',
      }))
    );
    setActiveStepIndex(0);

    const interval = setInterval(() => {
      step++;
      if (step < PIPELINE_STAGES.length) {
        setActiveStepIndex(step);
        setStages((prev) =>
          prev.map((s, idx) => {
            if (idx < step) return { ...s, status: 'completed' };
            if (idx === step) return { ...s, status: 'in_progress' };
            return { ...s, status: 'pending' };
          })
        );
      } else {
        clearInterval(interval);
        setIsSimulating(false);
        setStages((prev) =>
          prev.map((s) => ({
            ...s,
            status: 'completed',
          }))
        );
        setActiveStepIndex(8);
      }
    }, 600);
  };

  const activeStage = stages[activeStepIndex] || stages[0];

  if (compact) {
    return (
      <div className="bg-industrial-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-xs font-mono font-semibold text-slate-200 uppercase tracking-wider">
              9-Stage Intelligence Pipeline
            </span>
          </div>
          {interactive && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSimulate}
              disabled={isSimulating}
              className="h-7 text-xs gap-1.5 border-slate-700 hover:border-cyan-500/50"
            >
              {isSimulating ? (
                <>
                  <Clock className="w-3 h-3 text-cyan-400 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 text-cyan-400" />
                  <span>Re-run Pipeline</span>
                </>
              )}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-9 gap-1.5 bg-industrial-950 p-2 rounded-lg border border-slate-800/80">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const isActive = idx === activeStepIndex;
            const isCompleted = stage.status === 'completed';
            const isInProgress = stage.status === 'in_progress' || (isSimulating && isActive);

            return (
              <button
                key={stage.id}
                onClick={() => {
                  setActiveStepIndex(idx);
                  onStageSelect?.(stage.id);
                }}
                className={`relative flex flex-col items-center justify-center p-2 rounded-md transition-all text-center group ${
                  isActive
                    ? 'bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 shadow-lg shadow-cyan-950/50 scale-105 z-10'
                    : isCompleted
                    ? 'bg-slate-900/60 border border-emerald-500/30 text-emerald-400 hover:bg-slate-800/80'
                    : isInProgress
                    ? 'bg-amber-950/60 border border-amber-500/50 text-amber-300 animate-pulse'
                    : 'bg-slate-950/40 border border-slate-850 text-slate-500 hover:text-slate-300'
                }`}
                title={`${stage.name}: ${stage.description}`}
              >
                <Icon className={`w-4 h-4 mb-1 ${isActive ? 'text-cyan-400' : isCompleted ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="text-[10px] font-mono font-medium truncate w-full">
                  {stage.shortName}
                </span>
                {isCompleted && (
                  <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
                {isInProgress && (
                  <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-industrial-900 border border-slate-800 rounded-xl p-5 space-y-5 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-cyan-950 border border-cyan-500/30 text-cyan-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              ProductIQ Processing Architecture
            </span>
            <span className="text-xs text-slate-500 font-mono">| 9 End-to-End Stages</span>
          </div>
          <h3 className="text-base font-bold text-slate-100 mt-1 tracking-tight">
            Autonomous Technical Data Extraction & Validation Pipeline
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {interactive && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSimulate}
              disabled={isSimulating}
              className="gap-2 border-slate-700 hover:border-cyan-500/50 text-xs font-mono"
            >
              {isSimulating ? (
                <>
                  <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  <span>Simulating Pipeline...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Simulate Execution</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="relative">
        <div className="hidden lg:block absolute top-6 left-8 right-8 h-0.5 bg-slate-800 z-0" />

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-3 relative z-10">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const isActive = idx === activeStepIndex;
            const isCompleted = stage.status === 'completed';
            const isInProgress = stage.status === 'in_progress' || (isSimulating && isActive);
            const isConflict = stage.id === 'validation' && productStatus === 'needs_review';

            return (
              <div
                key={stage.id}
                onClick={() => {
                  setActiveStepIndex(idx);
                  onStageSelect?.(stage.id);
                }}
                className={`cursor-pointer rounded-xl p-3 border transition-all duration-200 flex flex-col justify-between relative group ${
                  isActive
                    ? 'bg-cyan-950/80 border-cyan-500/60 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-500/40 translate-y-[-2px]'
                    : isCompleted
                    ? 'bg-industrial-950/80 border-emerald-500/30 hover:border-emerald-500/60 hover:bg-slate-900/90'
                    : isInProgress
                    ? 'bg-amber-950/50 border-amber-500/50 animate-pulse'
                    : 'bg-industrial-950/40 border-slate-850 hover:border-slate-700 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300'
                      : isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : isInProgress
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-slate-800/80 text-slate-400'
                  }`}>
                    0{idx + 1}
                  </span>
                  
                  {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  {isInProgress && <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />}
                  {isConflict && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />}
                </div>

                <div className="flex items-center gap-2 my-1">
                  <div className={`p-1.5 rounded-lg ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300'
                      : isCompleted
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-slate-800/60 text-slate-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-xs font-bold font-mono tracking-tight truncate ${
                    isActive ? 'text-cyan-200' : isCompleted ? 'text-slate-200' : 'text-slate-400'
                  }`}>
                    {stage.shortName}
                  </span>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400 truncate">{stage.metrics || stage.latency}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-industrial-950/90 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-500/30 text-cyan-400 shrink-0">
            {React.createElement(activeStage.icon, { className: 'w-5 h-5' })}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold font-mono text-slate-100">
                {activeStage.name}
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Latency: {activeStage.latency}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {activeStage.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
          <span className="text-xs font-mono text-cyan-400 font-semibold bg-cyan-950/60 px-3 py-1.5 rounded-lg border border-cyan-500/20">
            {activeStage.metrics}
          </span>
        </div>
      </div>
    </div>
  );
};
