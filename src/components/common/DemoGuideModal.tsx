import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  CheckCircle2,
  Play,
  ArrowRight,
  Sparkles,
  FileText,
  ShieldAlert,
  Download,
  BookOpen,
  X,
  Layers,
  Award,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface DemoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DEMO_STEPS = [
  { id: 1, title: 'Create Product', route: '/products/create', desc: 'Click Create Product in Top Navigation' },
  { id: 2, title: 'Enter Product Name', route: '/products/create', desc: 'Flowserve Durco Mark 3 ISO Industrial Centrifugal Pump' },
  { id: 3, title: 'Add Manufacturer', route: '/products/create', desc: 'Flowserve Corporation' },
  { id: 4, title: 'Add Website URL', route: '/products/create', desc: 'https://www.flowserve.com/en/products/pumps/durco-mark-3-iso' },
  { id: 5, title: 'Upload PDF', route: '/products/create', desc: 'Durco_Mark3_ISO_Technical_Catalog.pdf' },
  { id: 6, title: 'Upload Product Image', route: '/products/create', desc: 'Centrifugal_Pump_Nameplate_OCR.jpg' },
  { id: 7, title: 'Click Analyze', route: '/products/create', desc: 'Triggers multi-modal extraction job' },
  { id: 8, title: 'Show Processing Pipeline', route: '/products/77777777-7777-7777-7777-777777777777', desc: '9-Stage visual architecture animation' },
  { id: 9, title: 'Show Extracted Attributes', route: '/products/77777777-7777-7777-7777-777777777777', desc: 'Flow rate, Head pressure, Power, Casing material' },
  { id: 10, title: 'Show RAG Evidence', route: '/products/77777777-7777-7777-7777-777777777777', desc: 'Source traceability & document citations' },
  { id: 11, title: 'Show AI-Enriched Fields', route: '/products/77777777-7777-7777-7777-777777777777', desc: 'ECCN Code, HS Code, IP Rating, Service Interval' },
  { id: 12, title: 'Show Confidence Scores', route: '/products/77777777-7777-7777-7777-777777777777', desc: 'Attribute reliability percentages (72% - 99%)' },
  { id: 13, title: 'Show Discrepancy / Conflict', route: '/products/77777777-7777-7777-7777-777777777777', desc: 'Max Temp conflict: PDF 180°C vs Web 210°C' },
  { id: 14, title: 'Open Review Center', route: '/review-center', desc: 'Global queue for human-in-the-loop validation' },
  { id: 15, title: 'Resolve Conflict', route: '/review-center', desc: 'Select candidate A (180°C PDF Datasheet p.4)' },
  { id: 16, title: 'Mark Product Verified', route: '/products/77777777-7777-7777-7777-777777777777', desc: 'Lifecycle transitions to human_verified' },
  { id: 17, title: 'Show Commerce Readiness Score', route: '/products/77777777-7777-7777-7777-777777777777', desc: '6-Factor score updates to 96% Commerce Ready' },
  { id: 18, title: 'Show Knowledge Graph', route: '/products/77777777-7777-7777-7777-777777777777', desc: 'Interactive entity node and semantic relationship graph' },
  { id: 19, title: 'Export JSON / CSV', route: '/products/77777777-7777-7777-7777-777777777777', desc: 'Download enterprise-ready structured dataset' },
];

export const DemoGuideModal: React.FC<DemoGuideModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);

  if (!isOpen) return null;

  const stepInfo = DEMO_STEPS.find((s) => s.id === currentStep) || DEMO_STEPS[0];

  const handleStepClick = (step: typeof DEMO_STEPS[0]) => {
    setCurrentStep(step.id);
    if (!completedSteps.includes(step.id)) {
      setCompletedSteps((prev) => [...prev, step.id]);
    }
    navigate(step.route);
    onClose();
  };

  const handleQuickLoadPump = () => {
    navigate('/products/77777777-7777-7777-7777-777777777777');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-industrial-900 border border-slate-700/80 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="bg-industrial-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/30 text-cyan-400">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100 font-mono">
                  Live Demo Studio
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Preloaded Demo Active
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Industrial Centrifugal Pump Live Workflow Pitch Guide
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Narrative Script Callout Banner (Prompt Item 10) */}
        <div className="bg-cyan-950/40 border-b border-cyan-500/20 px-6 py-3">
          <div className="flex items-start gap-3">
            <BookOpen className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p className="text-xs text-cyan-200/90 leading-relaxed font-sans italic">
              &ldquo;Industrial product data is fragmented across websites, PDFs, catalogs, and images. ProductIQ AI accepts these limited inputs and automatically extracts structured product intelligence. Our AI system uses RAG and source traceability to ground information, AI agents enrich missing fields, and our validation engine flags conflicts for human review before turning products verified & commerce-ready.&rdquo;
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Quick Action Banner */}
          <div className="bg-gradient-to-r from-industrial-950 via-slate-900 to-industrial-950 border border-cyan-500/30 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-700 shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop"
                  alt="Industrial Centrifugal Pump"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold tracking-wider uppercase">
                  Featured Preloaded Demo Product
                </span>
                <h3 className="text-sm font-bold text-slate-100 font-mono">
                  Flowserve Durco Mark 3 ISO Centrifugal Pump
                </h3>
                <p className="text-xs text-slate-400">
                  PDF Datasheet + Website URL + OCR Image + 1 Intentional Conflict
                </p>
              </div>
            </div>

            <Button
              onClick={handleQuickLoadPump}
              className="gap-2 shrink-0 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Pump Demo</span>
            </Button>
          </div>

          {/* 19-Step Presentation Stepper */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold font-mono uppercase text-slate-300 tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Live Demo 19-Step Presentation Flow
              </h4>
              <span className="text-xs font-mono text-slate-400">
                {completedSteps.length} / 19 Steps Explored
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {DEMO_STEPS.map((step) => {
                const isCompleted = completedSteps.includes(step.id);
                const isCurrent = currentStep === step.id;

                return (
                  <button
                    key={step.id}
                    onClick={() => handleStepClick(step)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between group ${
                      isCurrent
                        ? 'bg-cyan-950/80 border-cyan-500/70 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-500/30'
                        : isCompleted
                        ? 'bg-industrial-950/90 border-slate-800 hover:border-slate-700'
                        : 'bg-slate-950/40 border-slate-850 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        isCurrent
                          ? 'bg-cyan-500/20 text-cyan-300'
                          : isCompleted
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        Step {step.id < 10 ? `0${step.id}` : step.id}
                      </span>
                      {isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                      )}
                    </div>

                    <span className="text-xs font-bold font-mono text-slate-200 line-clamp-1 group-hover:text-cyan-300">
                      {step.title}
                    </span>
                    <span className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {step.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-industrial-950 px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-400 font-mono">
              ProductIQ AI Enterprise Platform
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Pitch Hub
          </Button>
        </div>
      </div>
    </div>
  );
};
