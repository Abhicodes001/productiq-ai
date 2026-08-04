import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Cpu, ShieldCheck } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-industrial-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative bg-industrial-grid">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500 to-slate-800 flex items-center justify-center text-white border border-sky-400/30 shadow-md">
            <Cpu className="w-6 h-6 text-sky-200" />
          </div>
          <span className="text-xl font-bold text-slate-100 tracking-tight">
            ProductIQ <span className="text-sky-400 font-mono text-sm px-1.5 py-0.5 rounded bg-sky-950 border border-sky-800">AI</span>
          </span>
        </Link>
        <p className="mt-2 text-xs font-mono text-slate-400">
          INDUSTRIAL PRODUCT INTELLIGENCE PLATFORM
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-900/90 border border-slate-800 py-8 px-6 sm:px-10 rounded-lg shadow-xl backdrop-blur-sm">
          <Outlet />
        </div>
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-500 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
          <span>Enterprise Row-Level Security & Supabase Auth Protected</span>
        </div>
      </div>
    </div>
  );
};
