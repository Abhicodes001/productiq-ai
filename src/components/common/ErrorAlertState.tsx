import React from 'react';
import { AlertTriangle, RefreshCw, ServerOff, WifiOff, FileX, KeyRound, Database, Clock } from 'lucide-react';
import { Button } from '../ui/Button';

export type ErrorType =
  | 'api_failure'
  | 'llm_timeout'
  | 'invalid_pdf'
  | 'invalid_url'
  | 'website_unavailable'
  | 'empty_extraction'
  | 'missing_api_keys'
  | 'vector_db_failure';

interface ErrorAlertStateProps {
  type: ErrorType;
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

const ERROR_CONFIGS: Record<ErrorType, { icon: React.ElementType; defaultTitle: string; defaultMessage: string; colorClass: string }> = {
  api_failure: {
    icon: ServerOff,
    defaultTitle: 'Backend API Connection Failed',
    defaultMessage: 'Unable to reach the ProductIQ backend service. Operating in client-side fallback mode.',
    colorClass: 'border-rose-500/30 bg-rose-950/20 text-rose-300',
  },
  llm_timeout: {
    icon: Clock,
    defaultTitle: 'LLM Extraction Timeout',
    defaultMessage: 'The language model response timed out. Retrying with reduced chunk window size.',
    colorClass: 'border-amber-500/30 bg-amber-950/20 text-amber-300',
  },
  invalid_pdf: {
    icon: FileX,
    defaultTitle: 'Invalid PDF Document',
    defaultMessage: 'The uploaded file is corrupt or exceeds the maximum size limit (50MB). Please upload a valid PDF.',
    colorClass: 'border-rose-500/30 bg-rose-950/20 text-rose-300',
  },
  invalid_url: {
    icon: WifiOff,
    defaultTitle: 'Invalid Website URL',
    defaultMessage: 'URL must begin with http:// or https:// and belong to a valid reachable industrial catalog domain.',
    colorClass: 'border-amber-500/30 bg-amber-950/20 text-amber-300',
  },
  website_unavailable: {
    icon: WifiOff,
    defaultTitle: 'Website Unreachable / Scraping Blocked',
    defaultMessage: 'Target website returned HTTP 403 / 503 or refused connection. Falling back to PDF datasheet source.',
    colorClass: 'border-amber-500/30 bg-amber-950/20 text-amber-300',
  },
  empty_extraction: {
    icon: AlertTriangle,
    defaultTitle: 'Empty Extraction Output',
    defaultMessage: 'No structured technical attributes were detected in the source material. Try attaching additional datasheets.',
    colorClass: 'border-slate-700 bg-slate-900/60 text-slate-300',
  },
  missing_api_keys: {
    icon: KeyRound,
    defaultTitle: 'Missing AI Provider API Keys',
    defaultMessage: 'LLM API key (OPENAI_API_KEY / GEMINI_API_KEY) is missing. Using heuristic extraction agent.',
    colorClass: 'border-indigo-500/30 bg-indigo-950/20 text-indigo-300',
  },
  vector_db_failure: {
    icon: Database,
    defaultTitle: 'Vector Store Query Error',
    defaultMessage: 'Vector index retrieval failed. Falling back to exact fuzzy search keyword matching.',
    colorClass: 'border-rose-500/30 bg-rose-950/20 text-rose-300',
  },
};

export const ErrorAlertState: React.FC<ErrorAlertStateProps> = ({
  type,
  title,
  message,
  onRetry,
  className = '',
}) => {
  const config = ERROR_CONFIGS[type] || ERROR_CONFIGS.api_failure;
  const Icon = config.icon;

  return (
    <div className={`border rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${config.colorClass} ${className}`}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-black/30 shrink-0 mt-0.5">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold font-mono tracking-tight">
            {title || config.defaultTitle}
          </h4>
          <p className="text-xs opacity-90 mt-0.5 leading-relaxed">
            {message || config.defaultMessage}
          </p>
        </div>
      </div>

      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="gap-2 border-slate-700 hover:border-slate-500 text-xs shrink-0 self-end sm:self-center font-mono"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Operation</span>
        </Button>
      )}
    </div>
  );
};
