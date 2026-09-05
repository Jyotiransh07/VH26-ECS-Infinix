import React from 'react';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  BookOpen, 
  Terminal, 
  Play, 
  Sliders, 
  FileCode, 
  Github, 
  GitBranch, 
  Workflow, 
  GitCommit, 
  FolderGit2, 
  Users, 
  ScanSearch, 
  AlertTriangle, 
  FileText, 
  Activity, 
  TrendingUp, 
  Cpu, 
  Settings, 
  HelpCircle, 
  X, 
  ChevronRight, 
  CheckCircle2, 
  Layers, 
  Sparkles,
  ExternalLink
} from '@/components/icons';

interface BriskSidebarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  userRole: 'USER' | 'ADMIN';
  isOpen: boolean;
  onClose: () => void;
  backendOnline: boolean;
}

export const BriskSidebar: React.FC<BriskSidebarProps> = ({
  currentTab,
  onNavigate,
  userRole,
  isOpen,
  onClose,
  backendOnline
}) => {
  const userNavSections = [
    {
      title: 'CORE PLATFORM',
      items: [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, badge: 'Live' },
        { id: 'workflow', label: 'Analysis Workflow', icon: Workflow, badge: 'Visual', badgeColor: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400' },
        { id: 'scans', label: 'Live Scanner', icon: ScanSearch },
        { id: 'leaks', label: 'Leaks & Findings', icon: AlertTriangle, badge: '4', badgeColor: 'bg-rose-500/15 text-rose-600 dark:text-rose-400' },
        { id: 'repositories', label: 'Repositories', icon: FolderGit2, badge: '5' }
      ]
    },
    {
      title: 'INSIGHTS & TRIAGE',
      items: [
        { id: 'baseline', label: 'Baseline', icon: Layers, badge: 'New' },
        { id: 'analytics', label: 'Analytics', icon: Activity },
        { id: 'logs', label: 'Audit Logs', icon: FileText }
      ]
    },
    {
      title: 'INTEGRATIONS & DOCS',
      items: [
        { id: 'integrations', label: 'Integrations & CI/CD', icon: Github },
        { id: 'intro', label: 'Engine Architecture', icon: BookOpen }
      ]
    }
  ];

  const adminNavSections = [
    {
      title: 'ADMIN CONSOLE',
      items: [
        { id: 'admin-overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'admin-health', label: 'System Health', icon: Activity, badge: 'Healthy', badgeColor: 'bg-teal-500/15 text-teal-600 dark:text-teal-400' },
        { id: 'admin-scalability', label: 'Scalability Architecture', icon: Cpu },
        { id: 'admin-logs', label: 'Audit Telemetry', icon: FileText }
      ]
    }
  ];

  const sections = userRole === 'ADMIN' && currentTab.startsWith('admin') ? adminNavSections : userNavSections;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-white dark:bg-[#0f172a] border-r border-slate-200/80 dark:border-slate-800 flex flex-col transition-all duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Workspace Brand Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div 
            onClick={() => onNavigate('intro')}
            className="flex items-center gap-3 cursor-pointer group"
            title="View LeakGuard Landing & Architecture"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold shadow-sm group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 dark:text-white tracking-tight text-sm group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  LeakGuard
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                  v0.1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Security Platform</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace Switcher Card (Brisk Mesh Style) */}
        <div className="px-3 py-2.5">
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                LG
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-none">
                  Core Security Workspace
                </p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">Production Branch</p>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          </div>
        </div>

        {/* Nav Items List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5 scrollbar-thin">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {section.title && (
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
                  {section.title}
                </p>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-teal-500/10 text-teal-700 dark:text-teal-300 font-semibold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                      }`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                        item.badgeColor || (isActive ? 'bg-teal-500/20 text-teal-700 dark:text-teal-300' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400')
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom Section: Resource Capacity Card & Profile */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
          {/* Scan Usage Widget (Brisk Storage Style) */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Scan Capacity</span>
              <span className="text-[11px] font-mono font-bold text-teal-600 dark:text-teal-400">90%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-teal-500 h-full rounded-full transition-all duration-500" style={{ width: '90%' }} />
            </div>
            <p className="text-[10px] text-slate-400">1.8k of 2.0k scans used this month</p>
          </div>

          {/* User Profile Badge with Verified Icon */}
          <div className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                JW
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white leading-none">
                    Janson Williams
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                </div>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {userRole === 'ADMIN' ? 'Admin Role' : 'Security Engineer'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </aside>
    </>
  );
};
