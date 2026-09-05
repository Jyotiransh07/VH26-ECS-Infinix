import React from 'react';
import { 
  BookOpen, 
  Terminal, 
  Play, 
  ShieldAlert, 
  GitFork, 
  FileText, 
  Sliders, 
  FileCode, 
  Workflow, 
  Github, 
  GitCommit, 
  Cpu, 
  HelpCircle, 
  Layers, 
  CheckCircle2, 
  X 
} from '@/components/icons';

interface DocsSidebarProps {
  activeSection: string;
  onSelectSection: (sectionId: string) => void;
  isOpen: boolean;
  onClose: () => void;
  engineOnline?: boolean;
}

export const DocsSidebar: React.FC<DocsSidebarProps> = ({
  activeSection,
  onSelectSection,
  isOpen,
  onClose,
  engineOnline = true
}) => {
  const navGroups = [
    {
      title: 'GETTING STARTED',
      items: [
        { id: 'intro', label: 'Introduction', icon: BookOpen },
        { id: 'installation', label: 'Installation', icon: Terminal },
        { id: 'quickstart', label: 'Quick Start', icon: Play },
      ]
    },
    {
      title: 'CORE FEATURES',
      items: [
        { id: 'scanning', label: 'Security Scanning', icon: ShieldAlert },
        { id: 'decision', label: 'Leak Decision Engine', icon: CheckCircle2 },
        { id: 'cfg', label: 'Control Flow Analysis', icon: GitFork },
        { id: 'reports', label: 'Compliance Reports', icon: FileText },
      ]
    },
    {
      title: 'CONFIGURATION',
      items: [
        { id: 'config-basic', label: 'Basic Configuration', icon: Sliders },
        { id: 'config-rules', label: 'Resource Rules YAML', icon: FileCode },
        { id: 'config-env', label: 'Environment Variables', icon: Layers },
      ]
    },
    {
      title: 'INTEGRATIONS',
      items: [
        { id: 'ci-cd', label: 'CI/CD Pipelines', icon: Workflow },
        { id: 'github-actions', label: 'GitHub Actions', icon: Github },
        { id: 'pre-commit', label: 'Pre-commit Hooks', icon: GitCommit },
        { id: 'api', label: 'FastAPI / REST API', icon: Cpu },
      ]
    },
    {
      title: 'RESOURCES & TOOLS',
      items: [
        { id: 'sandbox', label: 'Live Scanner Sandbox', icon: Terminal, badge: 'Interactive' },
        { id: 'faq', label: 'FAQ', icon: HelpCircle },
        { id: 'examples', label: 'Examples & Test Suite', icon: Layers },
        { id: 'troubleshooting', label: 'Troubleshooting & Limits', icon: HelpCircle },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-slate-50 dark:bg-[#0f172a] border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 custom-scrollbar text-xs">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <h4 className="px-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
                {group.title}
              </h4>
              <div className="space-y-0.5 pt-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectSection(item.id);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-teal-500/15 text-teal-700 dark:text-teal-300 font-semibold border-l-2 border-teal-500'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/30">
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

        {/* Engine Status Bottom Bar */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1120]">
          <div className="flex items-center justify-between text-xs px-2 py-1">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${engineOnline ? 'bg-teal-400' : 'bg-amber-400'} animate-pulse`} />
              <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                {engineOnline ? 'Engine Online' : 'Offline'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">AST/CFG Active</span>
          </div>
        </div>
      </aside>
    </>
  );
};
