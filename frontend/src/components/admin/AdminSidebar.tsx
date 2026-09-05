import React from 'react';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Cpu, 
  Activity, 
  Users, 
  Settings, 
  Sun, 
  Moon, 
  X,
  ExternalLink,
  Layers,
  FileCode
} from '@/components/icons';

interface AdminSidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentPath,
  onNavigate,
  isOpen,
  onClose,
  darkMode,
  onToggleDarkMode
}) => {
  const adminNavItems = [
    { path: '/admin', label: 'Admin Overview', icon: LayoutDashboard },
    { path: '/admin/scalability', label: 'Scalability Architecture', icon: Cpu },
    { path: '/admin/cost-economics', label: 'Cost Economics', icon: Activity },
    { path: '/admin/user-interactions', label: 'User Interactions', icon: Users, badge: '5' },
    { path: '/admin/system-health', label: 'System Health', icon: ShieldCheck }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Aside */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-60 bg-white dark:bg-[#0d1117] border-r border-slate-200 dark:border-slate-800/80 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60">
          <div 
            onClick={() => onNavigate('/admin')}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm text-slate-900 dark:text-white tracking-tight">
                  LeakGuard
                </span>
                <span className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-1 rounded border border-purple-500/20">
                  ADMIN
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-none">Platform Management</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Section: ADMIN CONSOLE */}
          <div className="space-y-1">
            <div className="px-2 pb-1 text-[11px] font-medium tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              ADMIN CONSOLE
            </div>
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path || (item.path === '/admin' && currentPath === '/admin/');
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    onNavigate(item.path);
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-purple-500/10 text-purple-700 dark:text-purple-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[11px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                      isActive 
                        ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300' 
                        : 'text-slate-400 bg-slate-100 dark:bg-slate-800/60'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Section: DEVELOPER ACCESS */}
          <div className="space-y-1">
            <div className="px-2 pb-1 text-[11px] font-medium tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              DEVELOPER ACCESS
            </div>
            <button
              onClick={() => {
                onNavigate('/app');
                if (window.innerWidth < 1024) onClose();
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[13px] font-medium text-slate-600 dark:text-slate-400 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-teal-500/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Switch to User View</span>
              </div>
              <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 bg-teal-500/10 px-1 rounded">
                /app
              </span>
            </button>
          </div>
        </div>

        {/* Footer Area */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
          <button
            onClick={() => onNavigate('/admin/settings')}
            className={`flex items-center gap-2 px-2 py-1.5 text-xs rounded-md transition-colors cursor-pointer ${
              currentPath === '/admin/settings'
                ? 'text-purple-700 dark:text-purple-300 font-semibold bg-purple-500/10'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>

          <button
            onClick={onToggleDarkMode}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </aside>
    </>
  );
};
