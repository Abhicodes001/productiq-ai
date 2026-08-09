import React, { useState } from 'react';
import { 
  Download, 
  FileJson, 
  FileSpreadsheet, 
  Copy, 
  Check, 
  X, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Button } from '../ui/Button';

export interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productId: string;
  jsonData: any;
  onDownloadCsv: () => void;
  onDownloadJson: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  productName,
  productId,
  jsonData,
  onDownloadCsv,
  onDownloadJson,
}) => {
  const [activeTab, setActiveTab] = useState<'json' | 'csv'>('json');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const jsonString = JSON.stringify(jsonData, null, 2);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-industrial-900 border border-industrial-800 rounded-xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 bg-industrial-950 border-b border-industrial-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-mono">
                Export Commerce-Ready Data
              </h3>
              <p className="text-xs text-slate-400 truncate max-w-md">
                {productName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 px-4 pt-3 bg-industrial-900 border-b border-industrial-800">
          <button
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-semibold border-b-2 transition-all ${
              activeTab === 'json'
                ? 'border-red-500 text-red-400 bg-red-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileJson className="w-4 h-4" />
            Standardized JSON Schema
          </button>
          <button
            onClick={() => setActiveTab('csv')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-semibold border-b-2 transition-all ${
              activeTab === 'csv'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Flattened CSV Sheet
          </button>
        </div>

        {/* Modal Body Preview */}
        <div className="p-4 overflow-y-auto flex-1 bg-slate-950">
          {activeTab === 'json' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">
                  Full Product Intelligence JSON Structure
                </span>
                <button
                  onClick={handleCopyJson}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-mono">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Payload</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 bg-industrial-950 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-96 leading-relaxed select-all">
                {jsonString}
              </pre>
            </div>
          ) : (
            <div className="space-y-4 py-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200 font-mono">
                  Flattened CSV Product Attribute Export
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Generates an ERP/Excel compatible CSV spreadsheet containing normalized specifications, confidence ratings, and source citations.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 max-w-md mx-auto text-left text-xs space-y-1 font-mono">
                <div className="text-slate-400">Columns Included:</div>
                <div className="text-slate-300">
                  Product ID, Product Name, Manufacturer, Category, Model Number, Voltage, Power, RPM, Material, IP Rating, Confidence Score, Status
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-industrial-950 border-t border-industrial-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Commerce-Ready v1.0 Standard</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            {activeTab === 'json' ? (
              <Button onClick={onDownloadJson} className="gap-2">
                <FileJson className="w-4 h-4" />
                Export JSON File
              </Button>
            ) : (
              <Button onClick={onDownloadCsv} className="gap-2 bg-emerald-600 hover:bg-emerald-500">
                <FileSpreadsheet className="w-4 h-4" />
                Export CSV File
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
