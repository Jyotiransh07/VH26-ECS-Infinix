import React from 'react';
import { 
  ShieldCheck, 
  Search, 
  Github, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  BookOpen, 
  Terminal, 
  Layers
} from '@/components/icons';

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSearch: () => void;
  onToggleMobileSidebar: () => void;
  mobileSidebarOpen: boolean;
  activeNavTab: string;
  onSelectNavTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  onToggleDarkMode,
  onOpenSearch,
  onToggleMobileSidebar,
  mobileSidebarOpen,
  activeNavTab,
  onSelectNavTab
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Mobile menu toggle, Logo, Brand */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleMobileSidebar}
            className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white md:hidden"
            aria-label="Toggle Navigation"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div 
            onClick={() => onSelectNavTab('intro')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:bg-teal-500/25 transition-all">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white tracking-tight text-base">
                  LeakGuard
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                  v0.1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 -mt-0.5 hidden sm:block">
                Python Static Leak Detection
              </p>
            </div>
          </div>
        </div>

        {/* Center/Right: Navigation Links & Search */}
        <div className="flex items-center gap-3 sm:gap-6">
          <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
            <button
              onClick={() => onSelectNavTab('intro')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeNavTab === 'intro' 
                  ? 'text-teal-600 dark:text-teal-400 bg-teal-500/10 font-semibold' 
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Documentation
            </button>
            <button
              onClick={() => onSelectNavTab('scanning')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeNavTab === 'scanning' 
                  ? 'text-teal-600 dark:text-teal-400 bg-teal-500/10 font-semibold' 
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Guides
            </button>
            <button
              onClick={() => onSelectNavTab('api')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeNavTab === 'api' 
                  ? 'text-teal-600 dark:text-teal-400 bg-teal-500/10 font-semibold' 
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              API Reference
            </button>
            <button
              onClick={() => onSelectNavTab('sandbox')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                activeNavTab === 'sandbox' 
                  ? 'text-teal-600 dark:text-teal-400 bg-teal-500/10 font-semibold' 
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Live Scanner
            </button>
          </nav>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />

          {/* Search Trigger Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0b1120] text-xs text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Search docs...</span>
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              Ctrl K
            </kbd>
          </button>

          {/* GitHub Link */}
          <a
            href="https://github.com/Jyotiransh07/VH26-ECS-Infinix"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="GitHub Repository"
          >
            <Github className="w-5 h-5" />
          </a>

          {/* Dark/Light Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-700" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
