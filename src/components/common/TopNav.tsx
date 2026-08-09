import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, LogOut, User, ShieldCheck, Database, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { DemoGuideModal } from './DemoGuideModal';

export const TopNav: React.FC = () => {
  const { user, signOut, isDemoMode } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const [showDemoModal, setShowDemoModal] = useState(false);

  return (
    <>
      <header className="h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-20">
        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-64 sm:w-72 md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products, SKUs, manufacturers..."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-md pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all font-mono"
          />
        </form>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* Demo Hub Trigger Button */}
          <button
            onClick={() => setShowDemoModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-950 via-slate-900 to-red-900 border border-red-500/40 text-red-300 hover:border-red-400 text-xs font-mono font-bold shadow-md shadow-red-950/50 transition-all hover:scale-105"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span>⚡ Demo Hub</span>
          </button>

          {/* Environment / Demo Indicator Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
            <Database className="w-3 h-3 text-red-400" />
            <span>{isDemoMode ? 'Demo Storage Mode' : 'Supabase Live DB'}</span>
          </div>

        {/* Notifications Popover Toggle */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="p-2 rounded-md bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  Notifications
                </span>
                <span className="text-[10px] text-red-400 font-mono">2 New</span>
              </div>
              <div className="divide-y divide-slate-800/60 max-h-64 overflow-y-auto">
                <div className="p-3 hover:bg-slate-800/50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
                    <span>Validation Conflict Detected</span>
                    <span className="text-[10px] text-slate-500 font-mono">10m ago</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    Schneider ATV930 product attribute 'Supply Voltage' has conflicting sources.
                  </p>
                </div>
                <div className="p-3 hover:bg-slate-800/50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
                    <span>Product Verified</span>
                    <span className="text-[10px] text-slate-500 font-mono">2h ago</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    Siemens S7-1500 PLC attributes successfully verified with 98% confidence.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1.5 rounded-md bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
          >
            <div className="w-7 h-7 rounded bg-slate-800 flex items-center justify-center text-xs font-bold font-mono text-red-400 border border-slate-700">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="text-xs font-medium text-slate-200 hidden md:block max-w-[120px] truncate">
              {user?.full_name || user?.email || 'Engineer'}
            </span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-2 z-50">
              <div className="px-4 py-2.5 border-b border-slate-800">
                <p className="text-xs font-semibold text-slate-200 truncate">
                  {user?.full_name || 'Industrial Engineer'}
                </p>
                <p className="text-[11px] text-slate-400 font-mono truncate">
                  {user?.email || 'user@productiq.ai'}
                </p>
                {user?.company && (
                  <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                    {user.company}
                  </span>
                )}
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/settings');
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-2"
                >
                  <User className="w-3.5 h-3.5" />
                  Account Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-950/40 flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
    <DemoGuideModal isOpen={showDemoModal} onClose={() => setShowDemoModal(false)} />
    </>
  );
};
