import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  subtext?: string;
  accentColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  changeType = 'neutral',
  subtext,
  accentColor = 'text-sky-400',
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-5 hover:border-slate-700 transition-all shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className={cn('p-2 rounded-md bg-slate-800/80 border border-slate-700/50', accentColor)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl font-bold tracking-tight text-slate-100 font-mono">
          {value}
        </span>
        {change && (
          <span
            className={cn(
              'text-xs font-semibold px-1.5 py-0.5 rounded',
              changeType === 'positive' && 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50',
              changeType === 'negative' && 'bg-rose-950/60 text-rose-400 border border-rose-800/50',
              changeType === 'neutral' && 'bg-slate-800 text-slate-300'
            )}
          >
            {change}
          </span>
        )}
      </div>
      {subtext && (
        <p className="mt-1 text-xs text-slate-500 font-normal">
          {subtext}
        </p>
      )}
    </div>
  );
};
