import React from 'react';
import { FileCheck2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { EmptyState } from '../components/common/EmptyState';

export const ReviewCenterPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800/80">
        <h1 className="text-xl font-bold text-slate-100 tracking-tight">Review Center</h1>
        <p className="text-xs text-slate-400 mt-1">
          Human-in-the-loop review station for low-confidence attributes and multi-source conflict resolution.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
          <span className="text-[10px] font-mono uppercase text-slate-400">Pending Reviews</span>
          <p className="text-2xl font-bold text-amber-400 font-mono mt-1">1 Item</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
          <span className="text-[10px] font-mono uppercase text-slate-400">Conflicts Resolved</span>
          <p className="text-2xl font-bold text-emerald-400 font-mono mt-1">4 Items</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
          <span className="text-[10px] font-mono uppercase text-slate-400">Avg Resolution Speed</span>
          <p className="text-2xl font-bold text-sky-400 font-mono mt-1">1.2 mins</p>
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-6">
        <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider border-b border-slate-800/80 pb-2 mb-4">
          Active Review Queue
        </h2>
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded bg-amber-950/60 border border-amber-800/60 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">Schneider Electric ATV930 45kW</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Attribute 'Supply Voltage' has conflicting source values: <code className="text-amber-300 font-mono">380...480 V</code> (PDF Datasheet p.3) vs <code className="text-amber-300 font-mono">400 V AC</code> (Website catalog).
              </p>
            </div>
          </div>
          <button className="px-3 py-1.5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded transition-colors shrink-0">
            Resolve Conflict
          </button>
        </div>
      </div>
    </div>
  );
};
