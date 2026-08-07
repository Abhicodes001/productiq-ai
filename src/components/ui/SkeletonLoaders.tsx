import React from 'react';

export const StatCardSkeleton: React.FC = () => (
  <div className="bg-industrial-900 border border-slate-800 rounded-xl p-5 animate-pulse space-y-3">
    <div className="flex items-center justify-between">
      <div className="h-3 w-24 bg-slate-800 rounded" />
      <div className="h-8 w-8 bg-slate-800 rounded-lg" />
    </div>
    <div className="h-7 w-20 bg-slate-700 rounded" />
    <div className="h-3 w-32 bg-slate-800/80 rounded" />
  </div>
);

export const ProductCardSkeleton: React.FC = () => (
  <div className="bg-industrial-900 border border-slate-800 rounded-xl p-5 animate-pulse space-y-4">
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-2 flex-1">
        <div className="h-3 w-28 bg-slate-800 rounded" />
        <div className="h-5 w-3/4 bg-slate-700 rounded" />
      </div>
      <div className="h-6 w-20 bg-slate-800 rounded-full" />
    </div>
    <div className="h-10 w-full bg-slate-800/60 rounded-lg" />
    <div className="flex items-center justify-between pt-3 border-t border-slate-800/60">
      <div className="h-3 w-24 bg-slate-800 rounded" />
      <div className="h-3 w-16 bg-slate-800 rounded" />
    </div>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="bg-industrial-900 border border-slate-800 rounded-xl overflow-hidden animate-pulse">
    <div className="bg-industrial-950 p-4 border-b border-slate-800 flex items-center justify-between">
      <div className="h-4 w-32 bg-slate-800 rounded" />
      <div className="h-8 w-24 bg-slate-800 rounded-lg" />
    </div>
    <div className="divide-y divide-slate-800">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 flex items-center justify-between gap-4">
          <div className="h-4 w-1/3 bg-slate-800/80 rounded" />
          <div className="h-4 w-1/4 bg-slate-800/60 rounded" />
          <div className="h-4 w-16 bg-slate-800/80 rounded" />
        </div>
      ))}
    </div>
  </div>
);
