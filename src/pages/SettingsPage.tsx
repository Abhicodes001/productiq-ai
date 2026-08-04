import React from 'react';
import { Settings, ShieldCheck, Database, Key, Server, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured } from '../services/supabase';

export const SettingsPage: React.FC = () => {
  const { user, isDemoMode } = useAuth();
  const supabaseActive = isSupabaseConfigured();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-2 border-b border-slate-800/80">
        <h1 className="text-xl font-bold text-slate-100 tracking-tight">Platform Settings & Integrations</h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage database connections, organization profile, and environment credentials.
        </p>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-6 space-y-4">
        <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider border-b border-slate-800/80 pb-2 flex items-center gap-2">
          <Database className="w-4 h-4 text-sky-400" />
          <span>Supabase Database & Auth Integration Status</span>
        </h2>

        <div className="space-y-3">
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-200">Supabase Connection State</span>
              <p className="text-[11px] text-slate-400 font-mono">
                {supabaseActive
                  ? 'Configured via VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
                  : 'Operating in client-side & FastAPI mock fallback mode for development'}
              </p>
            </div>
            <span
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                supabaseActive
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-amber-950 text-amber-400 border border-amber-800'
              }`}
            >
              {supabaseActive ? 'LIVE SUPABASE' : 'DEMO MODE ACTIVE'}
            </span>
          </div>

          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-200">Backend FastAPI REST Endpoint</span>
              <p className="text-[11px] text-slate-400 font-mono">http://localhost:8000/api/products</p>
            </div>
            <span className="px-2.5 py-1 rounded bg-sky-950 text-sky-400 border border-sky-800 text-xs font-mono font-bold">
              READY
            </span>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-6 space-y-4">
        <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider border-b border-slate-800/80 pb-2 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-sky-400" />
          <span>User & Organization Profile</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="bg-slate-950 p-3 rounded border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase">User Email</span>
            <p className="text-slate-200 mt-0.5">{user?.email}</p>
          </div>
          <div className="bg-slate-950 p-3 rounded border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase">Company</span>
            <p className="text-slate-200 mt-0.5">{user?.company || 'Industrial Automation Inc.'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
