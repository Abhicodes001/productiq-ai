import React, { useState } from 'react';
import { Database, FileText, Globe, Image as ImageIcon, CheckCircle2, Filter, Plus, Clock } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { Button } from '../components/ui/Button';
import { formatPercentage } from '../lib/utils';
import { ProductSource } from '../types/product';

export const SourcesPage: React.FC = () => {
  const { products } = useProducts();
  const [filterType, setFilterType] = useState<string>('all');

  // Flatten all sources from products with product metadata
  const allSources: Array<ProductSource & { productName: string; productId: string }> = [];

  products.forEach((prod) => {
    if (prod.sources && prod.sources.length > 0) {
      prod.sources.forEach((src) => {
        allSources.push({
          ...src,
          productName: prod.name,
          productId: prod.id,
        });
      });
    } else {
      // Create fallback source representation for products with URL
      if (prod.product_url) {
        allSources.push({
          id: 'src-' + prod.id,
          product_id: prod.id,
          source_type: 'website',
          source_name: `Web Spec Portal (${prod.manufacturer})`,
          source_url: prod.product_url,
          status: 'processed',
          reliability_score: 0.95,
          created_at: prod.created_at,
          productName: prod.name,
          productId: prod.id,
        });
      }
    }
  });

  const filteredSources = allSources.filter((src) => {
    if (filterType === 'all') return true;
    return src.source_type === filterType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">Connected Data Sources Lineage</h1>
          <p className="text-xs text-slate-400 mt-1">
            Catalog of multi-modal PDF technical manuals, web scraper targets, and visual equipment nameplates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['all', 'website', 'pdf', 'image'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded text-xs font-mono capitalize transition-colors ${
                filterType === t
                  ? 'bg-sky-950 text-sky-400 border border-sky-800 font-bold'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-lg overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] border-b border-slate-800">
            <tr>
              <th className="px-6 py-3.5 font-semibold">SOURCE TYPE</th>
              <th className="px-6 py-3.5 font-semibold">SOURCE NAME / URI</th>
              <th className="px-6 py-3.5 font-semibold">LINKED PRODUCT</th>
              <th className="px-6 py-3.5 font-semibold">RELIABILITY SCORE</th>
              <th className="px-6 py-3.5 font-semibold">PIPELINE STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {filteredSources.length > 0 ? (
              filteredSources.map((src) => (
                <tr key={src.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 font-mono uppercase font-bold text-[11px] text-sky-400">
                      {src.source_type === 'website' && <Globe className="w-3.5 h-3.5 text-sky-400" />}
                      {src.source_type === 'pdf' && <FileText className="w-3.5 h-3.5 text-emerald-400" />}
                      {src.source_type === 'image' && <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />}
                      <span>{src.source_type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-200 font-medium">
                    <div>
                      <p className="font-semibold text-slate-100">{src.source_name}</p>
                      {src.source_url && (
                        <p className="text-[11px] text-slate-400 truncate max-w-sm mt-0.5">{src.source_url}</p>
                      )}
                      {src.storage_path && (
                        <p className="text-[11px] text-slate-500 truncate max-w-sm mt-0.5">{src.storage_path}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-300 font-medium">
                    <a href={`/products/${src.productId}`} className="hover:text-sky-400 hover:underline">
                      {src.productName}
                    </a>
                  </td>
                  <td className="px-6 py-4 font-mono text-sky-400 font-bold">
                    {formatPercentage(src.reliability_score || 0.95)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded border ${
                      src.status === 'processed'
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-900'
                        : 'bg-amber-950/60 text-amber-400 border-amber-900'
                    }`}>
                      {src.status === 'processed' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {src.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500 font-mono text-xs">
                  No data sources match the selected filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
