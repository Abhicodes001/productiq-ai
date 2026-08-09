import React from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  FileCheck2, 
  ArrowUpRight,
  Clock,
  Layers
} from 'lucide-react';
import { Button } from '../ui/Button';

export interface ReadinessItem {
  id: string;
  label: string;
  score: number;
  max_score: number;
  passed: boolean;
  detail: string;
}

export interface CommerceReadinessCardProps {
  productId: string;
  readinessScore: number;
  status: string;
  isCommerceReady: boolean;
  breakdown: ReadinessItem[];
  onMarkCommerceReady?: () => void;
  loading?: boolean;
}

export const CommerceReadinessCard: React.FC<CommerceReadinessCardProps> = ({
  productId,
  readinessScore,
  status,
  isCommerceReady,
  breakdown,
  onMarkCommerceReady,
  loading = false,
}) => {
  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'commerce_ready':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-sm shadow-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Commerce Ready
          </span>
        );
      case 'verified':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/40 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
            Verified
          </span>
        );
      case 'needs_review':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            Needs Review
          </span>
        );
      case 'processing':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1.5 animate-pulse">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            Processing
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            Draft
          </span>
        );
    }
  };

  return (
    <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-5 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-industrial-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100 font-mono tracking-wide">
              Commerce Readiness Assessment
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated quality audit for ERP, PIM, and industrial e-commerce syndication.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(status)}
        </div>
      </div>

      {/* Main Readiness Gauge & Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-slate-950 p-4 rounded-xl border border-slate-800">
        {/* Score Gauge */}
        <div className="flex items-center gap-4 border-r md:border-r border-slate-800 pr-4">
          <div className="relative w-16 h-16 rounded-full flex items-center justify-center border-4 border-slate-800 bg-industrial-950 shadow-inner">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                className="text-slate-800"
                fill="none"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray="175"
                strokeDashoffset={175 - (175 * readinessScore) / 100}
                className={readinessScore >= 85 ? 'text-emerald-500' : readinessScore >= 70 ? 'text-amber-500' : 'text-rose-500'}
                fill="none"
                strokeLinecap="round"
              />
            </svg>
            <span className="text-sm font-extrabold font-mono text-slate-100">
              {readinessScore}%
            </span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200">Readiness Score</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {readinessScore >= 85 ? 'Eligible for Syndication' : 'Action items remaining'}
            </p>
          </div>
        </div>

        {/* Readiness Checklist Summary */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono text-[11px]">Core Spec Requirements:</span>
            <span className="text-emerald-400 font-bold font-mono">Passed</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono text-[11px]">Cross-Source Validation:</span>
            <span className="text-emerald-400 font-bold font-mono">Verified</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono text-[11px]">Conflict Resolution:</span>
            <span className={status === 'needs_review' ? 'text-amber-400 font-bold font-mono' : 'text-emerald-400 font-bold font-mono'}>
              {status === 'needs_review' ? 'Action Required' : '0 Open Conflicts'}
            </span>
          </div>
        </div>

        {/* Commerce Ready Action Trigger */}
        <div className="flex justify-end">
          {status !== 'commerce_ready' ? (
            <Button
              onClick={onMarkCommerceReady}
              disabled={loading}
              className="w-full md:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs gap-2 shadow-lg shadow-emerald-600/20"
            >
              <FileCheck2 className="w-4 h-4" />
              {loading ? 'Approving...' : 'Approve & Mark Commerce Ready'}
            </Button>
          ) : (
            <div className="w-full p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs font-mono text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Approved for Global Catalog Syndication
            </div>
          )}
        </div>
      </div>

      {/* 6-Factor Audit Breakdown Grid */}
      <div className="space-y-2">
        <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
          Commerce Quality Audit Criteria
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {breakdown.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-lg border text-xs flex items-start justify-between gap-3 ${
                item.passed
                  ? 'bg-slate-950/60 border-slate-800/80'
                  : 'bg-amber-950/20 border-amber-900/40'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {item.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                  <span className="font-semibold text-slate-200">{item.label}</span>
                </div>
                <p className="text-[11px] text-slate-400 pl-6">{item.detail}</p>
              </div>
              <span className="font-mono text-xs font-bold text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 shrink-0">
                {item.score}/{item.max_score}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
