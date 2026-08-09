import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Cpu,
  ArrowRight,
  ShieldCheck,
  FileText,
  Layers,
  CheckCircle2,
  Database,
  BarChart3,
  Globe,
  Zap,
  Check,
  Building2,
  FileSpreadsheet,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const pipelineSteps = [
    { code: '01', title: 'INPUT', desc: 'PDFs, Websites, Datasheets, CAD/Images' },
    { code: '02', title: 'EXTRACT', desc: 'Multimodal Neural Table & Spec Parsing' },
    { code: '03', title: 'ENRICH', desc: 'Standardized Taxonomy & Unit Normalization' },
    { code: '04', title: 'VALIDATE', desc: 'Rule Engine & Attribute Conflict Checks' },
    { code: '05', title: 'VERIFY', desc: 'Source Lineage & Confidence Scoring' },
    { code: '06', title: 'APPROVE', desc: 'Human-in-the-Loop Review Dashboard' },
    { code: '07', title: 'EXPORT', desc: 'Commerce-Ready PIM / ERP / JSON APIs' },
  ];

  const features = [
    {
      icon: FileText,
      title: 'Multimodal Document Intelligence',
      description: 'Ingest complex engineering PDF datasheets, CAD drawings, scan documents, and supplier website URLs automatically.',
    },
    {
      icon: Layers,
      title: 'Industrial Attribute Taxonomy',
      description: 'Standardize unstructured specs into normalized schemas, units (metric/imperial), and structured catalog hierarchies.',
    },
    {
      icon: ShieldCheck,
      title: 'Deterministic Rule Engine',
      description: 'Cross-reference specifications against physical constraints, voltage ranges, tolerances, and compliance standards.',
    },
    {
      icon: AlertTriangle,
      title: 'Conflict Resolution Matrix',
      description: 'Detect discrepancies across conflicting spec sheets or vendor revisions with automated source lineage tracing.',
    },
    {
      icon: BarChart3,
      title: 'Granular Confidence Scoring',
      description: 'Every extracted attribute includes a 0-100% confidence score tied directly to specific page coordinates or URL sources.',
    },
    {
      icon: FileSpreadsheet,
      title: 'Commerce-Ready Exports',
      description: 'Push verified product intelligence directly to Akeneo, Syndigo, Shopify, SAP, or REST/GraphQL endpoints.',
    },
  ];

  return (
    <div className="min-h-screen bg-industrial-950 text-slate-100 font-sans selection:bg-red-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-red-600 to-red-950 flex items-center justify-center text-white border border-red-500/40 shadow-sm shadow-red-950/50">
              <Cpu className="w-5 h-5 text-red-100" />
            </div>
            <span className="font-bold text-base tracking-tight text-white">
              ProductIQ <span className="text-red-400 font-mono text-xs px-1 rounded bg-red-950 border border-red-800">AI</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-400">
            <a href="#how-it-works" className="hover:text-slate-200 transition-colors">How It Works</a>
            <a href="#features" className="hover:text-slate-200 transition-colors">Core Features</a>
            <a href="#pipeline" className="hover:text-slate-200 transition-colors">AI Pipeline</a>
            <a href="#why-us" className="hover:text-slate-200 transition-colors">Why ProductIQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              Log In
            </Link>
            <Link
              to="/dashboard"
              className="px-4 py-2 text-xs font-semibold rounded-md bg-red-600 hover:bg-red-500 text-white shadow-sm border border-red-500/40 transition-all flex items-center gap-1.5"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-20 pb-24 px-6 max-w-7xl mx-auto border-b border-slate-800/60 bg-industrial-grid">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-red-400">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span>Industrial Product Intelligence Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-slate-100 tracking-tight leading-[1.15]">
            Turn Fragmented Product Data Into Verified Product Intelligence
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
            ProductIQ AI transforms websites, technical documents, PDFs, and product images into structured, enriched, validated, and commerce-ready product data.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate('/products/create')}
              className="w-full sm:w-auto gap-2"
            >
              <span>Start Analyzing Product</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto"
            >
              View Demo
            </Button>
          </div>
        </div>

        {/* Hero Product Intelligence Preview Card */}
        <div className="mt-16 max-w-5xl mx-auto bg-slate-900/90 border border-slate-800 rounded-xl shadow-2xl p-6 overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-2 font-semibold text-slate-300">INDUSTRIAL INTELLIGENCE PIPELINE MONITOR</span>
            </div>
            <span className="text-red-400 font-bold">STATUS: RUNNING</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-left">
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/80">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
                UNSTRUCTURED INPUT SOURCE
              </span>
              <p className="text-xs font-semibold text-slate-200">Datasheet_S7_1500_CPU_rev3.pdf</p>
              <div className="mt-3 text-[11px] text-slate-400 font-mono space-y-1 bg-slate-900 p-2 rounded">
                <div>Page 14, Table 3.2</div>
                <div>Work Memory: 1MB program, 5MB data</div>
                <div>Supply Voltage: 24 V DC (19.2...28.8 V)</div>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/80">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
                AI VALIDATION & LINEAGE
              </span>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-2">
                <span>Confidence Score</span>
                <span className="text-emerald-400 font-mono">98.4%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[98%]" />
              </div>
              <p className="mt-3 text-[11px] text-slate-400">
                ✓ Cross-validated against 3 technical spec sheets and Siemens manufacturer API.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/80">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
                COMMERCE-READY OUTPUT
              </span>
              <p className="text-xs font-semibold text-slate-200">JSON Schema Standard v2.4</p>
              <pre className="mt-2 text-[10px] text-red-300 font-mono bg-slate-900 p-2 rounded overflow-x-auto max-h-24">
{`{
  "sku": "6ES7516-3AN02",
  "memory_mb": 1,
  "voltage_dc": 24,
  "status": "verified"
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* AI PIPELINE WORKFLOW VISUALIZATION SECTION */}
      <section id="pipeline" className="py-20 px-6 max-w-7xl mx-auto border-b border-slate-800/60">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-mono uppercase tracking-wider text-red-400">END-TO-END PIPELINE</span>
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-100 mt-2">
            The ProductIQ AI Processing Workflow
          </h2>
          <p className="text-sm text-slate-400 mt-3">
            From raw, messy PDF datasheets to structured, verified, and commerce-ready product catalog data.
          </p>
        </div>

        {/* Workflow Horizontal Chain */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {pipelineSteps.map((step, idx) => (
            <div
              key={step.code}
              className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col justify-between hover:border-red-500/50 transition-all group"
            >
              <div>
                <span className="text-[10px] font-mono font-bold text-red-400 block mb-1">
                  STEP {step.code}
                </span>
                <h3 className="text-xs font-bold text-slate-100 tracking-wide">
                  {step.title}
                </h3>
                <p className="mt-2 text-[11px] text-slate-400 leading-snug">
                  {step.desc}
                </p>
              </div>
              {idx < pipelineSteps.length - 1 && (
                <div className="mt-4 hidden lg:block text-slate-700 font-mono text-[10px]">
                  → NEXT
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CORE FEATURES SECTION */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto border-b border-slate-800/60">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-mono uppercase tracking-wider text-red-400">BUILT FOR INDUSTRIAL SAAS</span>
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-100 mt-2">
            Core Platform Capabilities
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-slate-900/60 border border-slate-800 rounded-lg p-6 hover:border-slate-700 transition-all"
              >
                <div className="w-10 h-10 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-red-400 mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-100 mb-2">{feat.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* WHY PRODUCTIQ AI SECTION */}
      <section id="why-us" className="py-20 px-6 max-w-7xl mx-auto border-b border-slate-800/60">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-red-400">COMPARISON</span>
            <h2 className="text-2xl sm:text-4xl font-bold text-slate-100 mt-2">
              Why Industrial Leaders Choose ProductIQ AI
            </h2>
            <p className="text-sm text-slate-400 mt-4 leading-relaxed">
              Traditional manual data entry and generic AI chatbots fail when handling complex engineering specifications, metric/imperial unit conversions, and multi-source attribute conflicts.
            </p>

            <ul className="mt-6 space-y-3">
              {[
                'Eliminates 90%+ of manual data entry hours for catalog management.',
                'Prevents costly spec errors on e-commerce distributor storefronts.',
                'Full audit trail and source citation down to document line numbers.',
                'Enterprise-grade Row Level Security and private dataset isolation.',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-xs text-slate-300">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-rose-950/30 border border-rose-900/50">
                <span className="text-xs font-semibold text-rose-400 block mb-1">Traditional Manual & Chatbot Process</span>
                <p className="text-xs text-slate-400">
                  Manual copy-pasting from 100-page PDFs. Prone to human errors, missed units, zero source traceability, and weeks of delay.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-emerald-950/40 border border-emerald-800/60">
                <span className="text-xs font-semibold text-emerald-400 block mb-1">ProductIQ AI Engine</span>
                <p className="text-xs text-slate-300">
                  Automated multimodal parsing, deterministic validation rules, instant conflict detection, and 98%+ accuracy verified in seconds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 px-6 max-w-7xl mx-auto text-center">
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-10 max-w-4xl mx-auto space-y-6">
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-100">
            Ready to Structure Your Industrial Product Data?
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Experience the next-generation industrial product intelligence dashboard today.
          </p>
          <div className="pt-2 flex justify-center">
            <Button size="lg" onClick={() => navigate('/products/create')} className="gap-2">
              <span>Start Analyzing Product Now</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-6 text-center text-xs font-mono text-slate-500">
        <p>© 2026 ProductIQ AI Inc. All rights reserved. Industrial Product Intelligence Platform.</p>
      </footer>
    </div>
  );
};
