import React from 'react';
import { Menu, Search, Play } from '@/components/icons';

interface AdminTopbarProps {
  title: string;
  subtitle: string;
  userRole: 'USER' | 'ADMIN';
  onToggleUserRole: () => void;
  onOpenMobileNav: () => void;
  onOpenSearch: () => void;
  onTriggerScan: () => void;
}

export const AdminTopbar: React.FC<AdminTopbarProps> = ({
  title,
  subtitle,
  userRole,
  onToggleUserRole,
  onOpenMobileNav,
  onOpenSearch,
  onTriggerScan
}) => {
  return (
    <header className="sticky top-0 z-30 h-14 bg-white/90 dark:bg-[#090d16]/90 backdrop-blur-xs border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Title & Subtitle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileNav}
          className="p-1.5 -ml-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-white lg:hidden"
          aria-label="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white tracking-tight">
              {title}
            </h1>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
              ADMIN CONSOLE
            </span>
          </div>
          <p className="hidden sm:block text-xs text-slate-400">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Role Switcher (User vs Admin) */}
        <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs font-medium">
          <button
            onClick={() => onToggleUserRole()}
            className="px-2.5 py-1 rounded-md text-[11px] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
          >
            User View
          </button>
          <button
            className="px-2.5 py-1 rounded-md text-[11px] bg-purple-600 text-white font-semibold shadow-2xs cursor-default"
          >
            Admin View
          </button>
        </div>

        {/* Search */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden md:inline">Search...</span>
          <kbd className="hidden md:inline-block px-1.5 py-0.2 text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded">
            ⌘K
          </kbd>
        </button>

        {/* Run Scan */}
        <button
          onClick={onTriggerScan}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-teal-600 hover:bg-teal-500 text-white shadow-xs transition-colors cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Run Scan</span>
        </button>
      </div>
    </header>
  );
};
