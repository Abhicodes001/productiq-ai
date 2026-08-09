import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Cpu, ShieldCheck, ArrowLeft, Sparkles } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-industrial-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative bg-industrial-grid overflow-hidden selection:bg-red-500 selection:text-white">
      {/* Dynamic Animated Ambient Background Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-red-600/15 rounded-full blur-[140px] pointer-events-none animate-float-slow" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-red-900/20 rounded-full blur-[120px] pointer-events-none animate-float-reverse" />
      <div className="absolute top-10 left-10 w-[350px] h-[350px] bg-rose-950/30 rounded-full blur-[100px] pointer-events-none animate-float-slow" />

      {/* Top Left Navigation Back Link */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-red-400 bg-slate-900/80 border border-slate-800 hover:border-red-500/40 px-3.5 py-1.5 rounded-full transition-all duration-300 shadow-md group backdrop-blur-md"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform duration-300 text-red-400" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 animate-slide-up-fade">
        <Link to="/" className="inline-flex items-center gap-3 group">
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-600 via-red-700 to-red-950 flex items-center justify-center text-white border border-red-500/50 shadow-lg shadow-red-600/30 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
              <Cpu className="w-6 h-6 text-red-100 animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75" />
          </div>
          <span className="text-2xl font-black text-white tracking-tight">
            ProductIQ{' '}
            <span className="text-red-400 font-mono text-sm px-2 py-0.5 rounded bg-red-950/90 border border-red-800 shadow-inner">
              AI
            </span>
          </span>
        </Link>
        <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-red-400" />
          <span>INDUSTRIAL PRODUCT INTELLIGENCE PLATFORM</span>
        </div>
      </div>

      {/* Auth Card Container with Animated Glowing Border */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 z-10 animate-slide-up-fade delay-100">
        <div className="relative group">
          {/* Subtle Outer Glow Frame */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600/50 via-slate-800 to-red-950/60 rounded-2xl blur opacity-40 group-hover:opacity-75 transition duration-500 group-hover:duration-200" />
          
          <div className="relative bg-slate-900/90 border border-slate-800/90 py-8 px-6 sm:px-10 rounded-2xl shadow-2xl backdrop-blur-xl animate-pulse-glow">
            <Outlet />
          </div>
        </div>

        {/* Footer Security Badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-mono animate-slide-up-fade delay-200">
          <ShieldCheck className="w-4 h-4 text-red-500" />
          <span>Enterprise Row-Level Security & Supabase Auth Protected</span>
        </div>
      </div>
    </div>
  );
};

