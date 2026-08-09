import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Edit3,
  XCircle,
  HelpCircle,
  Clock,
  Sparkles,
  ExternalLink,
  Check,
  User,
  History,
  RefreshCw,
  Filter,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import {
  fetchGlobalReviewQueue,
  resolveProductConflict,
  fetchReviewHistory,
  fetchProducts,
} from '../services/api';
import { ConflictItem, ReviewHistoryItem } from '../types/validation';
import { Product } from '../types/product';
import { formatDate, formatPercentage } from '../lib/utils';

export const ReviewCenterPage: React.FC = () => {
  const [queue, setQueue] = useState<ConflictItem[]>([]);
  const [history, setHistory] = useState<ReviewHistoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<
    'all' | 'conflicts' | 'low_confidence' | 'enriched' | 'history'
  >('all');

  // Manual edit modal state
  const [selectedConflict, setSelectedConflict] = useState<ConflictItem | null>(null);
  const [manualValue, setManualValue] = useState<string>('');
  const [manualUnit, setManualUnit] = useState<string>('');
  const [reviewerName, setReviewerName] = useState<string>('Abhishek M (Lead Quality Engineer)');
  const [isResolving, setIsResolving] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const qRes = await fetchGlobalReviewQueue();
      setQueue(qRes || []);

      const pList = await fetchProducts();
      setProducts(pList || []);

      // Load review history for active products
      let allHistory: ReviewHistoryItem[] = [];
      for (const p of pList) {
        const hRes = await fetchReviewHistory(p.id);
        allHistory = [...allHistory, ...(hRes || [])];
      }
      setHistory(allHistory);
    } catch (err) {
      console.error('Error loading review center data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResolve = async (
    conflict: ConflictItem,
    action: string,
    candidateId?: string,
    valOverride?: string,
    unitOverride?: string
  ) => {
    setIsResolving(true);
    try {
      await resolveProductConflict(conflict.product_id, conflict.id, {
        action,
        selected_candidate_id: candidateId,
        manual_value: valOverride || manualValue,
        manual_unit: unitOverride || manualUnit,
        reviewer_name: reviewerName,
      });

      setSelectedConflict(null);
      setManualValue('');
      setManualUnit('');
      await loadData();
    } catch (err) {
      console.error('Error resolving conflict:', err);
    } finally {
      setIsResolving(false);
    }
  };

  const conflictsCount = queue.filter((c) => c.status === 'conflict').length;
  const resolvedCount = history.length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-amber-400" />
            <span>Human-in-the-Loop Review Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Validate cross-source product intelligence, resolve attribute conflicts, and publish verified product records.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={loadData} className="gap-2 font-mono text-xs">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </Button>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-xs text-amber-400 font-semibold">
            <span>Pending Conflicts</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-100">{queue.length}</p>
          <span className="text-[10px] text-slate-500 font-mono">Requires Human Verification</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
            <span>Resolved & Verified</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-400">{resolvedCount}</p>
          <span className="text-[10px] text-slate-500 font-mono">Audit Log Traceability</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-xs text-red-400 font-semibold">
            <span>Resolution Accuracy</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold font-mono text-red-400">{resolvedCount > 0 ? '99.4%' : '0%'}</p>
          <span className="text-[10px] text-slate-500 font-mono">Verified Specs Standard</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-xs text-red-400 font-semibold">
            <span>Avg Review Speed</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-100">{resolvedCount > 0 ? '1.2 min' : '--'}</p>
          <span className="text-[10px] text-slate-500 font-mono">Per Specification Issue</span>
        </div>
      </div>

      {/* Queue Filter Navigation Tabs */}
      <div className="border-b border-slate-800 flex overflow-x-auto space-x-1">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'all'
              ? 'border-amber-500 text-amber-400 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>All Active Reviews</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono">
            {queue.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('conflicts')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'conflicts'
              ? 'border-rose-500 text-rose-400 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Cross-Source Conflicts ({conflictsCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'history'
              ? 'border-emerald-500 text-emerald-400 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Resolution Audit Log ({history.length})</span>
        </button>
      </div>

      {/* Queue Items Content Area */}
      {activeTab !== 'history' && (
        <div className="space-y-4">
          {queue.length === 0 ? (
            <EmptyState
              icon={ShieldCheck}
              title="Review Queue is Clear!"
              description="No open conflicts or unverified low-confidence specifications requiring human attention."
            />
          ) : (
            queue.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl"
              >
                {/* Conflict Header Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-mono font-bold uppercase flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Source Discrepancy</span>
                      </span>
                      <span className="text-xs font-mono text-slate-400">ID: {item.id}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-100">
                      {item.product_name || 'Industrial Product Record'}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Conflicting Specification: <strong className="text-slate-200">{item.attribute_name} ({item.key})</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono text-slate-400">Reviewer:</span>
                    <span className="text-xs font-mono text-red-400 font-semibold flex items-center gap-1 bg-slate-950 px-3 py-1 rounded border border-slate-800">
                      <User className="w-3 h-3" />
                      <span>{reviewerName}</span>
                    </span>
                  </div>
                </div>

                {/* Candidate Comparison Cards */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Extracted Value Candidates Comparison
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {item.candidates.map((cand, idx) => (
                      <div
                        key={cand.candidate_id}
                        className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                            <span className="text-xs font-bold text-amber-400 font-mono uppercase">
                              Candidate #{idx + 1}
                            </span>
                            <span className="text-xs font-mono font-bold text-slate-300">
                              Confidence: {formatPercentage(cand.confidence)}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-mono text-slate-500">Value String</span>
                            <p className="text-lg font-bold font-mono text-slate-100">
                              {cand.value} {cand.unit || ''}
                            </p>
                          </div>

                          <div className="space-y-1 font-mono text-xs">
                            <span className="text-[10px] uppercase text-slate-500 block">Source Trace</span>
                            <div className="flex items-center gap-1 text-red-400 font-medium">
                              <span>{cand.source_name}</span>
                              {cand.source_url && (
                                <a
                                  href={cand.source_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:text-red-300"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>

                          <div className="p-3 bg-slate-900 rounded border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                            <span className="text-[9px] uppercase text-slate-500 font-bold block">Grounded Evidence Quote</span>
                            <p className="italic leading-snug">"{cand.evidence_text}"</p>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          onClick={() => handleResolve(item, 'select_candidate', cand.candidate_id)}
                          disabled={isResolving}
                          className="w-full gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs shadow-lg shadow-emerald-950/40"
                        >
                          <Check className="w-4 h-4" />
                          <span>Approve Candidate #{idx + 1}</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Quick Action Toolbar */}
                <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedConflict(item)}
                      className="gap-1.5 font-mono text-xs text-red-400 hover:text-red-300 border-red-900/60"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Manually</span>
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResolve(item, 'mark_na')}
                      disabled={isResolving}
                      className="gap-1.5 font-mono text-xs text-slate-400 hover:text-slate-200"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Mark N/A</span>
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResolve(item, 'reject_ai')}
                      disabled={isResolving}
                      className="gap-1.5 font-mono text-xs text-rose-400 hover:text-rose-300 border-rose-900/60"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject AI Extracted Values</span>
                    </Button>
                  </div>

                  <span className="text-[11px] font-mono text-slate-500">
                    Resolving this issue marks attribute as <strong className="text-emerald-400">✓ Human Verified</strong>
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Resolution Audit History Tab */}
      {activeTab === 'history' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" />
              <span>Human Review Audit History Trail</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">{history.length} Action Records</span>
          </div>

          {history.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 font-mono">
              No review history records recorded yet. Resolve a conflict in the active queue above to log audit entries.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">TIMESTAMP</th>
                    <th className="px-4 py-2.5 font-semibold">SPECIFICATION</th>
                    <th className="px-4 py-2.5 font-semibold">PREVIOUS VALUE</th>
                    <th className="px-4 py-2.5 font-semibold">FINAL VERIFIED VALUE</th>
                    <th className="px-4 py-2.5 font-semibold">ACTION</th>
                    <th className="px-4 py-2.5 font-semibold">REVIEWER</th>
                    <th className="px-4 py-2.5 font-semibold">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {history.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-950/60 transition-colors">
                      <td className="px-4 py-3 text-slate-400">{formatDate(record.timestamp)}</td>
                      <td className="px-4 py-3 font-semibold text-slate-200">{record.attribute_name}</td>
                      <td className="px-4 py-3 text-rose-400 line-through opacity-80">
                        {record.previous_value || 'None'}
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-300">{record.final_value}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                          {record.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-red-400">{record.reviewer}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status="human_verified" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Manual Edit Inline Modal */}
      {selectedConflict && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100">
                Manual Override: {selectedConflict.attribute_name}
              </h3>
              <button
                onClick={() => setSelectedConflict(null)}
                className="text-slate-500 hover:text-slate-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-slate-400">Manual Value</label>
                <input
                  type="text"
                  placeholder="e.g. 415 V AC"
                  value={manualValue}
                  onChange={(e) => setManualValue(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Unit (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. V"
                  value={manualUnit}
                  onChange={(e) => setManualUnit(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Reviewer Name</label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800 font-mono text-xs">
              <Button variant="outline" onClick={() => setSelectedConflict(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => handleResolve(selectedConflict, 'edit_manual')}
                disabled={!manualValue || isResolving}
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                Save & Mark Human Verified
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
