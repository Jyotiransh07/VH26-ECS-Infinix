import React from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  Sparkles, 
  Sliders, 
  Download, 
  Upload, 
  Sun, 
  Moon, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  Activity 
} from '@/components/icons';

interface BriskTopNavProps {
  title: string;
  subtitle?: string;
  currentTab?: string;
  onNavigate?: (tab: string) => void;
  onOpenMobileNav: () => void;
  onOpenSearch: () => void;
  userRole: 'USER' | 'ADMIN';
  onToggleUserRole: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  backendOnline: boolean;
  onTriggerScan?: () => void;
}

export const BriskTopNav: React.FC<BriskTopNavProps> = ({
  title,
  subtitle,
  currentTab = 'dashboard',
  onNavigate,
  onOpenMobileNav,
  onOpenSearch,
  userRole,
  onToggleUserRole,
  darkMode,
  onToggleDarkMode,
  backendOnline,
  onTriggerScan
}) => {
  const topNavItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'workflow', label: 'Workflow' },
    { id: 'scans', label: 'Scans' },
    { id: 'leaks', label: 'Leaks' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'integrations', label: 'Integrations' }
  ];

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Page Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileNav}
            className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white lg:hidden"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="hidden sm:block text-xs text-slate-400 font-medium">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Center: Main Pill Navigation (Agentflow Pro Style) */}
        {onNavigate && userRole === 'USER' && (
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
            {topNavItems.map(item => {
              const isActive = currentTab === item.id || (item.id === 'workflow' && currentTab === 'workflow');
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        )}

        {/* Center/Right Action Bar (Brisk CRM Controls) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Ask AI Action Button */}
          <button
            onClick={() => alert('AI Security Assistant: AST engine confirms 4 unclosed handles across 6 scanned files.')}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white shadow-xs transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask AI</span>
          </button>

          {/* Quick Scan / Customize Action */}
          {onTriggerScan && (
            <button
              onClick={onTriggerScan}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-teal-500/15 border border-teal-500/30 text-teal-700 dark:text-teal-300 hover:bg-teal-500/25 transition-all shadow-xs"
            >
              <span>+ Run Scan</span>
            </button>
          )}

          {/* Live Engine Status Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-teal-500' : 'bg-amber-500'}`} />
            <span>{backendOnline ? 'Node API: Online' : 'Node API: Standby'}</span>
          </div>

          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span className="hidden xl:inline">Search (Ctrl+K)</span>
          </button>

          {/* Role Switcher Pill (USER / ADMIN) */}
          <button
            onClick={onToggleUserRole}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all border ${
              userRole === 'ADMIN'
                ? 'bg-purple-500/15 border-purple-500/30 text-purple-700 dark:text-purple-300'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
            title="Toggle between Developer USER and ADMIN Console view"
          >
            {userRole === 'ADMIN' ? '👑 ADMIN' : '👤 USER'}
          </button>

          {/* Notification Bell */}
          <button
            onClick={() => alert('Latest Notification: Definite resource leak verified in sample-repo-python/early_return.py.')}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
