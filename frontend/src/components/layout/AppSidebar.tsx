import React from 'react';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  ScanSearch, 
  AlertTriangle, 
  Workflow, 
  FolderGit2, 
  BookOpenCheck,
  Activity, 
  FileText, 
  Workflow as GitActionsIcon, 
  GitCommit, 
  Terminal, 
  Settings, 
  Sun, 
  Moon,
  X,
  Cpu,
  Users
} from '@/components/icons';

interface AppSidebarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  userRole: 'USER' | 'ADMIN';
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentTab,
  onNavigate,
  userRole,
  isOpen,
  onClose,
  darkMode,
  onToggleDarkMode
}) => {
  const userNavSections = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'ANALYSIS',
      items: [
        { id: 'scans', label: 'Scans', icon: ScanSearch },
        { id: 'findings', label: 'Findings', icon: AlertTriangle, count: 4 },
        { id: 'workflow', label: 'Workflow', icon: Workflow }
      ]
    },
    {
      title: 'PROJECTS',
      items: [
        { id: 'repositories', label: 'Repositories', icon: FolderGit2, count: 5 },
        { id: 'how-it-works', label: 'How It Works', icon: BookOpenCheck }
      ]
    },
    {
      title: 'INSIGHTS',
      items: [
        { id: 'analytics', label: 'Analytics', icon: Activity },
        { id: 'reports', label: 'Reports', icon: FileText }
      ]
    },
    {
      title: 'INTEGRATIONS',
      items: [
        { id: 'actions', label: 'GitHub Actions', icon: GitActionsIcon },
        { id: 'precommit', label: 'Pre-commit', icon: GitCommit },
        { id: 'cli', label: 'CLI', icon: Terminal }
      ]
    }
  ];

  const adminNavSections = [
    {
      title: 'ADMIN CONSOLE',
      items: [
        { id: 'admin-overview', label: 'Admin Overview', icon: LayoutDashboard },
        { id: 'admin-scalability', label: 'Scalability Architecture', icon: Cpu },
        { id: 'admin-cost', label: 'Cost Economics', icon: Activity },
        { id: 'admin-interactions', label: 'User Interactions', icon: Users, count: 5 },
        { id: 'admin-health', label: 'System Health', icon: ShieldCheck }
      ]
    },
    {
      title: 'DEVELOPER ACCESS',
      items: [
        { id: 'dashboard', label: 'Switch to User View', icon: LayoutDashboard }
      ]
    }
  ];

  const navSections = userRole === 'ADMIN' ? adminNavSections : userNavSections;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-60 bg-white dark:bg-[#0d1117] border-r border-slate-200 dark:border-slate-800/80 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60">
          <div 
            onClick={() => onNavigate(userRole === 'ADMIN' ? 'admin-overview' : 'dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              userRole === 'ADMIN'
                ? 'bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-purple-400'
                : 'bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400'
            }`}>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm text-slate-900 dark:text-white tracking-tight">
                  LeakGuard
                </span>
                {userRole === 'ADMIN' ? (
                  <span className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-1 rounded">
                    ADMIN
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-slate-400">v0.1</span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 leading-none">
                {userRole === 'ADMIN' ? 'Platform Management' : 'Security & Resource Analysis'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-2 pb-1 text-[11px] font-medium tracking-wider text-slate-400 dark:text-slate-500">
                {section.title}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id || 
                  (item.id === 'admin-overview' && (currentTab === 'admin' || currentTab === 'admin-overview')) ||
                  (item.id === 'findings' && currentTab === 'finding-detail');
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-colors cursor-pointer ${
                      isActive
                        ? userRole === 'ADMIN'
                          ? 'bg-purple-500/10 text-purple-700 dark:text-purple-300 font-semibold'
                          : 'bg-slate-100 dark:bg-slate-800/80 text-teal-700 dark:text-teal-400 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${
                        isActive 
                          ? userRole === 'ADMIN' ? 'text-purple-600 dark:text-purple-400' : 'text-teal-600 dark:text-teal-400'
                          : 'text-slate-400'
                      }`} />
                      <span>{item.label}</span>
                    </div>
                    {item.count !== undefined && (
                      <span className={`text-[11px] font-mono px-1.5 py-0.2 rounded ${
                        isActive 
                          ? userRole === 'ADMIN' ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300' : 'bg-teal-500/10 text-teal-700 dark:text-teal-300' 
                          : 'text-slate-400 bg-slate-100 dark:bg-slate-800/60'
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer Area */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
          <button
            onClick={() => onNavigate('settings')}
            className="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 rounded-md transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>

          <button
            onClick={onToggleDarkMode}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </aside>
    </>
  );
};
