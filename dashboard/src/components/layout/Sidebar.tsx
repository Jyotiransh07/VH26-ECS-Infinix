import React from 'react';
import { 
  LayoutDashboard, 
  ScanSearch, 
  AlertTriangle, 
  FolderGit2, 
  BookOpenCheck, 
  GitFork, 
  FileText, 
  Github, 
  GitCommit, 
  Terminal, 
  Webhook, 
  Settings, 
  BookOpen, 
  ShieldCheck,
  Activity,
  Radio
} from '@/components/icons';

interface SidebarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  engineOnline?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onNavigate,
  isOpen,
  onClose,
  engineOnline = true
}) => {
  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'SCANNING',
      items: [
        { id: 'scans', label: 'Scans', icon: ScanSearch, badge: 'Live' },
        { id: 'issues', label: 'Issues', icon: AlertTriangle, badge: '4 Definite' },
        { id: 'projects', label: 'Projects', icon: FolderGit2 }
      ]
    },
    {
      title: 'ANALYSIS',
      items: [
        { id: 'rules', label: 'Resource Rules', icon: BookOpenCheck },
        { id: 'control-flow', label: 'Control Flow', icon: GitFork },
        { id: 'reports', label: 'Reports', icon: FileText }
      ]
    },
    {
      title: 'INTEGRATIONS',
      items: [
        { id: 'integrations', label: 'Overview', icon: Webhook },
        { id: 'github', label: 'GitHub Actions', icon: Github, badge: 'CI' },
        { id: 'precommit', label: 'Pre-commit', icon: GitCommit },
        { id: 'cli', label: 'CLI Hub', icon: Terminal },
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'docs', label: 'Documentation', icon: BookOpen }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0e1118] border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 flex items-center gap-3 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-purple-600 to-indigo-700 flex items-center justify-center text-white shadow-glow">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-wider text-base text-white">LEAKGUARD</span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-primary/20 text-primary-light border border-primary/30">v0.1</span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium">Python Resource Leak Detection</p>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <h4 className="px-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                {section.title}
              </h4>
              <div className="space-y-0.5">
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
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-primary/15 text-primary-light border border-primary/25 shadow-sm'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-primary-light' : 'text-zinc-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                          isActive 
                            ? 'bg-primary text-white' 
                            : 'bg-white/5 text-zinc-400 border border-white/10'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Engine Status Footer */}
        <div className="p-3 border-t border-white/5 bg-[#0b0d13]">
          <div className="p-3 rounded-xl bg-card-elevated border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center">
                <span className={`w-2.5 h-2.5 rounded-full ${engineOnline ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
                <span className={`absolute w-4 h-4 rounded-full ${engineOnline ? 'bg-emerald-400/30' : 'bg-amber-400/30'} animate-ping`} />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-200">
                  {engineOnline ? 'Engine Online' : 'API Standalone'}
                </p>
                <p className="text-[10px] text-zinc-400">AST/CFG Analyzer Ready</p>
              </div>
            </div>
            <Activity className="w-4 h-4 text-zinc-500" />
          </div>
        </div>
      </aside>
    </>
  );
};
