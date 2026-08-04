import React from 'react';
import { Database, FileText, Globe, Image, CheckCircle2 } from 'lucide-react';

export const SourcesPage: React.FC = () => {
  const sources = [
    { type: 'pdf', name: 'Siemens_S7_1500_Manual_v2.pdf', product: 'Siemens SIMATIC S7-1500', reliability: '99%', status: 'Active' },
    { type: 'website', name: 'https://www.se.com/ww/en/product/ATV930D45N4', product: 'Schneider Electric ATV930', reliability: '94%', status: 'Active' },
    { type: 'pdf', name: 'ABB_ACS880_Datasheet_2025.pdf', product: 'ABB Industrial Drive ACS880', reliability: '92%', status: 'Active' },
  ];

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800/80">
        <h1 className="text-xl font-bold text-slate-100 tracking-tight">Connected Data Sources</h1>
        <p className="text-xs text-slate-400 mt-1">
          Catalog of ingested PDF technical manuals, web crawler connections, and CAD asset files.
        </p>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-lg overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] border-b border-slate-800">
            <tr>
              <th className="px-6 py-3.5 font-semibold">SOURCE TYPE</th>
              <th className="px-6 py-3.5 font-semibold">SOURCE URI / FILE</th>
              <th className="px-6 py-3.5 font-semibold">LINKED PRODUCT</th>
              <th className="px-6 py-3.5 font-semibold">RELIABILITY</th>
              <th className="px-6 py-3.5 font-semibold">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {sources.map((src, i) => (
              <tr key={i} className="hover:bg-slate-800/50">
                <td className="px-6 py-4 uppercase font-mono font-bold text-sky-400 text-[11px]">
                  {src.type}
                </td>
                <td className="px-6 py-4 font-mono text-slate-200 font-medium">
                  {src.name}
                </td>
                <td className="px-6 py-4 text-slate-400">
                  {src.product}
                </td>
                <td className="px-6 py-4 font-mono text-emerald-400 font-bold">
                  {src.reliability}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" />
                    {src.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
