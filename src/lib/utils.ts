import { type ClassValue, clsx } from 'clsx';
import { ProductStatus } from '../types/product';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatPercentage(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function getStatusColor(status: ProductStatus): {
  bg: string;
  text: string;
  border: string;
  dot: string;
  label: string;
} {
  switch (status) {
    case 'human_verified':
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-300 font-bold',
        border: 'border-emerald-500/30',
        dot: 'bg-emerald-400',
        label: '✓ Human Verified',
      };
    case 'verified':
      return {
        bg: 'bg-emerald-950/60',
        text: 'text-emerald-400',
        border: 'border-emerald-800/60',
        dot: 'bg-emerald-500',
        label: 'Verified',
      };
    case 'conflict':
      return {
        bg: 'bg-rose-950/60',
        text: 'text-rose-400 font-bold',
        border: 'border-rose-800/60',
        dot: 'bg-rose-500 animate-ping',
        label: '⚠️ Conflict',
      };
    case 'needs_review':
      return {
        bg: 'bg-amber-950/60',
        text: 'text-amber-400',
        border: 'border-amber-800/60',
        dot: 'bg-amber-500',
        label: 'Needs Review',
      };
    case 'processing':
      return {
        bg: 'bg-sky-950/60',
        text: 'text-sky-400',
        border: 'border-sky-800/60',
        dot: 'bg-sky-500 animate-pulse',
        label: 'Processing',
      };
    case 'failed':
      return {
        bg: 'bg-rose-950/60',
        text: 'text-rose-400',
        border: 'border-rose-800/60',
        dot: 'bg-rose-500',
        label: 'Failed',
      };
    case 'draft':
    default:
      return {
        bg: 'bg-slate-900/60',
        text: 'text-slate-400',
        border: 'border-slate-800',
        dot: 'bg-slate-500',
        label: 'Draft',
      };
  }
}
